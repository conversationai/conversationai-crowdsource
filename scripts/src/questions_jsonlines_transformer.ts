/*
Copyright 2017 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/*
Usage: Convert answers with multiple parts into separate rows.

ts-node server/setup/questions_jsonlines_transformer.ts \
    --infile="./tmp/Questions.json" \
    --out_scorings_file="./tmp/Scorings.json" \
    --out_questions_file="./tmp/Questions2.json"

bq --project=wikidetox --dataset_id=wikidetox:crowdsourcedb \
  load \
  --schema=./tmp/Scorings.schema.json \
  --source_format=NEWLINE_DELIMITED_JSON \
  crowdsourcedb.Scorings ./tmp/Scorings.json

*/

import * as byline from 'byline';
import * as fs from 'fs';
import * as yargs from 'yargs';

import * as multiplex_transform from './multiplex_transform';

// TODO: consider creating a common toxicity-crowdsource-types.ts file for common types.

export interface QuestionPartScores {
  // Optional question: you get scores if you answer it, but you may skip.
  optional?: boolean; // Is not set treated as false.

  // Only one of these should be set.

  // Associates a score value to each possible string answer.
  enum?: { [enumValue: string]: number };

  // Regexp where string gets score depending on match/no match.
  stringRegExp?: {
    regexp: string;
    regexpFlags: string;
    matchScore: number;
    noMatchScore: number;
  };
  // Free test strings that always get the same score.
  freeStringConstScore?: number;
}

// A questionaire (for a given question) consists of a named set of question parts.
export interface QuestionScores {
  [questionPartId: string]: QuestionPartScores;
}

// Command line arguments.
interface Params {
  infile: string;
  out_questions_file: string;
  out_scorings_file: string;
}

interface QuestionT1 {
  accepted_answers: string;
  question: string;
  question_group_id: string;
  question_id: string;
  type: string;
}

type AnswerPartType =
  | 'insult'
  | 'obscene'
  | 'comments'
  | 'identityHate'
  | 'threat'
  | 'readableAndInEnglish'
  | 'toxic';

const ANSWER_PART_TYPES: AnswerPartType[] = [
  'insult',
  'obscene',
  'comments',
  'identityHate',
  'threat',
  'readableAndInEnglish',
  'toxic',
];

interface QuestionScoring {
  question_group_id: string;
  question_id: string;
  answer_part_id: string;
  answer: string;
  type: string;
  answer_score: number; // float 64
  original_answer_score: number;
}

const SCORING_STREAM_NAME = 'scoring';
const QUESTION_STREAM_NAME = 'question';

async function main(args: Params) {
  let lineCount = 0;
  const answerPartCounts: { [key: string]: number } = {};
  let answerPartCount = 0;

  const interpretStream = new multiplex_transform.Multiplex();
  interpretStream.setEncoding('utf-8');
  interpretStream.setInputProcessor(
    (
      chunk: string,
      _encoding: string,
      pushFn: (streamName: string, data: string, encoding: string) => void
    ) => {
      const questionObj: QuestionT1 = JSON.parse(chunk);
      lineCount += 1;
      const answersObj: QuestionScores = JSON.parse(
        questionObj.accepted_answers
      );

      let containSomeAnswer = false;
      const outScoringsStreamPause = false;
      const outQuestionsStreamPause = false;

      for (const answerPart of ANSWER_PART_TYPES) {
        if (answersObj !== null && answerPart in answersObj) {
          containSomeAnswer = true;
          // console.log(answersObj);
          const questionScoring = {} as QuestionScoring;
          questionScoring.question_group_id = questionObj.question_group_id;
          questionScoring.question_id = questionObj.question_id;
          questionScoring.type = questionObj.type;
          questionScoring.answer_part_id = answerPart;
          const enumMap = answersObj[answerPart].enum;
          if (enumMap) {
            for (const enumKey of Object.keys(enumMap)) {
              questionScoring.answer = enumKey;
              questionScoring.answer_score = enumMap[enumKey];
              if (questionScoring.answer_score === 0) {
                continue;
              }
              questionScoring.original_answer_score =
                questionScoring.answer_score;
              questionScoring.answer_score =
                (questionScoring.answer_score + 1) / 2;
              if (
                questionScoring.answer_score !== 0 &&
                questionScoring.answer_score !== 1
              ) {
                questionScoring.answer_score = 0.5;
              }
              pushFn(
                SCORING_STREAM_NAME,
                `${JSON.stringify(questionScoring)}\n`,
                'utf-8'
              );
            }
          }

          if (answerPartCount % 100 === 0) {
            console.log(
              `Next 100. (answerPartCount: ${answerPartCount}; lineCount: ${lineCount})`
            );
          }

          if (!(answerPart in answerPartCounts)) {
            answerPartCounts[answerPart] = 0;
          }
          answerPartCounts[answerPart] += 1;
          answerPartCount += 1;
        }
      }
    }
  );

  const outScoringsStream = fs.createWriteStream(args.out_scorings_file, {
    flags: 'w',
    encoding: 'utf-8',
  });
  const lineStream = byline.createStream();
  // Uncomment these lines to also output the questions stream.
  // let outQuestionsStream = fs.createWriteStream(args.out_questions_file,
  //   {flags: 'w', defaultEncoding: 'utf-8'});
  // interpretStream.addOutputStream(QUESTION_STREAM_NAME, outQuestionsStream);
  interpretStream.addOutputStream(SCORING_STREAM_NAME, outScoringsStream);

  const instream = fs.createReadStream(args.infile);
  instream.pause();
  const completedStream = instream.pipe(lineStream).pipe(interpretStream);
  // Needed so that interpretStream doesn't block waiting for consumer of its
  // events.
  completedStream.on('data', () => {});
  const onceCompleted = new Promise((resolve, reject) => {
    completedStream.on('close', () => {
      console.log('completedStream close');
    });

    completedStream.on('end', () => {
      console.log('completedStream end');
    });

    completedStream.on('finish', () => {
      console.log(
        `lineCount: ${lineCount}; answerPartCount: ${answerPartCount}`
      );
      console.log(
        `answerPartCounts: ${JSON.stringify(answerPartCounts, null, 2)}`
      );
      resolve();
    });
    instream.on('error', e => {
      reject(e);
    });
    console.log('instream.resume');
    instream.resume();
  });

  console.log('waiting to complete');
  await onceCompleted;
  console.log('completed');
  return;
}

const args = yargs
  .option('infile', { describe: 'Input path to a JSON-lines Questions' })
  .option('out_questions_file', {
    describe: 'Output path for JSON-lines Questions file',
  })
  .option('out_scorings_file', {
    describe: 'Output path for JSON-lines QuestionScorings file',
  })
  .demandOption(
    ['infile', 'out_scorings_file', 'out_questions_file'],
    'Please provide at least --infile, --out_questions_file, --out_scorings_file.'
  )
  .help().argv;

let done = false;
function waiter() {
  setTimeout(() => {
    if (!done) {
      waiter();
    }
  }, 200);
}
waiter();

main((args as {}) as Params)
  .then(() => {
    console.log('Success!');
    done = true;
  })
  .catch(e => {
    console.error('Failed: ', e);
    process.exit(1);
  });
