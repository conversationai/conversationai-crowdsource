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

  node build/server/setup/answers_jsonlines_transformer.js \
    --infile="./tmp/Answers.json" \
    --infile="./tmp/Answers2.json"
*/

import * as yargs from 'yargs';
import * as fs from 'fs';
import * as readline from 'readline';

// Command line arguments.
interface Params {
  infile: string;
  outfile: string;
}

interface AnswerT1 {
  answer: string;
  answer_id?: string;
  client_job_key: string;
  question_group_id: string;
  question_id: string;
  timestamp: string;
  answer_score?: string;
  worker_nonce: string;
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

interface AnswerT2 {
  answer: string;
  answer_part_id: AnswerPartType;
  answer_id?: string;
  client_job_key: string;
  question_group_id: string;
  question_id: string;
  timestamp: string;
  answer_score?: string;
  worker_nonce: string;
}

async function main(args: Params) {
  const instream = fs.createReadStream(args.infile);
  const outstream = fs.createWriteStream(args.outfile, {
    flags: 'w',
    encoding: 'utf-8',
  });
  const rl = readline.createInterface(instream, outstream);

  const lineCount = 0;
  const answerPartCounts: { [key: string]: number } = {};
  let answerPartCount = 0;
  let missingAnswerCount = 0;
  let strangeAnswerCount = 0;

  rl.on('line', async line => {
    const obj: AnswerT1 = JSON.parse(line);
    const answerObj = JSON.parse(obj.answer);

    let containSomeAnswer = false;
    for (const answerPart of ANSWER_PART_TYPES) {
      if (answerPart in answerObj) {
        containSomeAnswer = true;
        const obj2 = {} as AnswerT2;
        Object.assign(obj2, obj);
        obj2.answer = answerObj[answerPart];
        if (answerPart !== 'comments' && obj2.answer !== null) {
          if (obj2.answer.toLowerCase) {
            obj2.answer = obj2.answer.toLowerCase();
          } else {
            console.warn(`Answer is strange for: ${line}`);
            strangeAnswerCount += 1;
            continue;
          }
        }
        obj2.answer_part_id = answerPart;
        if (!(answerPart in answerPartCounts)) {
          answerPartCounts[answerPart] = 0;
        }
        answerPartCounts[answerPart] += 1;
        answerPartCount += 1;
        outstream.write(`${JSON.stringify(obj2)}\n`);
      }
    }
    if (!containSomeAnswer) {
      missingAnswerCount += 1;
      console.error(`Missing valid answer type for: ${line}`);
    }
  });

  rl.on('close', () => {
    outstream.end();
    console.log(`lineCount: ${lineCount}; answerPartCount: ${answerPartCount}`);
    console.log(
      `missingAnswerCount: ${missingAnswerCount}; strangeAnswerCount: ${strangeAnswerCount}`
    );
    console.log(
      `answerPartCounts: ${JSON.stringify(answerPartCounts, null, 2)}`
    );
  });
}

const args = yargs
  .option('infile', {
    describe: 'Input path to JSON-lines file of answers with questions',
  })
  .option('outfile', {
    describe: 'Creted path to JSON-lines file with separate answer_parts',
  })
  .demandOption(
    ['infile', 'outfile'],
    'Please provide at least --infile and --outfile.'
  )
  .help().argv;

main((args as {}) as Params)
  .then(() => {
    console.log('Success!');
  })
  .catch(e => {
    console.error('Failed: ', e);
    process.exit(1);
  });
