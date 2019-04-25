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

Uploads data to the questions table. Each line of the input file is treated as
a question. The ID is the hash of the text in the line.

Usage:

ts-node src/setup/upload_questions_from_lines.ts \
  --file="./tmp/foo.txt" \
  --question_group="my_foo_question_group" \
  --action=print

ts-node src/setup/upload_questions_from_lines.ts \
  --file="./tmp/foo.txt" \
  --question_group="my_foo_question_group" \
  --action=insert

ts-node src/setup/upload_questions_from_lines.ts \
  --file="./tmp/foo.txt" \
  --question_group="my_foo_question_group" \
  --action=print \
  --from_line 2600 --to_line=2610

ts-node src/setup/upload_questions_from_lines.ts \
  --file="./tmp/foo.txt" \
  --spanner_db="ptoxic" \
  --question_group="my_foo_question_group" \
  --action=print

Note: If the upload fails, make sure that you don't have an auth token for
another gcloud project in your environment variables. That will supercede
the project id set in this script.
*/

import * as spanner from '@google-cloud/spanner';
import * as fs from 'fs';
import * as yargs from 'yargs';

import * as crowdsourcedb from '../cs_db';
// import * as readline from 'readline';
import * as db_types from '../db_types';

import * as util from './util';

// TODO(ldixon): fix import of this.
const hashjs = require('hash.js');

// Command line arguments.
interface Params {
  file: string,
  question_group: string,
  gcloud_project_id: string,
  spanner_instance: string,
  spanner_db: string,
  action: 'print' | 'update' | 'insert' | 'count',
  from_line: number | null;
  to_line: number | null;
}

interface DataShape {
  id_a: string,
  comment_a: string,
  id_b: string,
  comment_b: string,
}

class ArgError extends Error {}

function checkArguments(args: Params): void {
  if (!fs.existsSync(args.file)) {
    throw new ArgError('--file argument does not exist: ' + args.file);
  }
  if (!db_types.valid_id_regexp.test(args.question_group)) {
    throw new ArgError(
      '--question_group must be a valid id-string (\w|_|-|.|:)+, not: ' +
      args.question_group);
  }
  if (args.to_line !== null && args.to_line !== undefined &&
    typeof (args.to_line) !== 'number') {
    throw new ArgError('--to_line must be a number, not: ' + args.to_line);
  }
  if (args.from_line !== null && args.from_line !== undefined &&
    typeof (args.from_line) !== 'number') {
    throw new ArgError('--from_line must be a number, not: ' + args.from_line);
  }
}

function questionRowFromDatum(datum: string): db_types.QuestionRow {
  let questionRow: db_types.QuestionRow = {
    accepted_answers: null,
    question: datum as any as db_types.Question,
    question_group_id: args.question_group,
    question_id: hashjs.sha256().update(datum).digest('hex'),
    type: 'toanswer',
  };
  return questionRow;
}

async function main(args: Params) {
  checkArguments(args);

  let spannerClient = spanner({projectId: args.gcloud_project_id});
  let spannerInstance = spannerClient.instance(args.spanner_instance);
  let spannerDatabase =
    spannerInstance.database(args.spanner_db, {keepAlive: 5});
  let db = new crowdsourcedb.CrowdsourceDB(spannerDatabase);

  let total_added = 0;
  let batcher = new util.Batcher<db_types.QuestionRow>(
    async (batch: db_types.QuestionRow[]) => {
      if (args.action === 'update') {
        await db.updateQuestions(batch);
      } else if (args.action === 'insert') {
        await db.addQuestions(batch).catch((e) => {
          console.error('Failed at batch: ' + JSON.stringify(batch, null, 2));
          throw e;
        });
      } else if (args.action === 'print') {
        console.log(JSON.stringify(batch, null, 2));
      } else if (args.action === 'count') {
      } else {
        throw new Error('invalid action: ' + args.action);
      }
      console.log(`looked at question batch size: ${batch.length}`);
      console.log(`total questions is now: ${total_added}`);
      total_added += batch.length;
    },
    10);

  await util.applyToLinesOfFile(args.file, async (line: string) => {
    let question = questionRowFromDatum(line);
    return batcher.add(question);
  }, {from_line: args.from_line, to_line: args.to_line});

  await batcher.flush();

  await db.close();

  console.log(`Completed. Added questions: ${total_added}`);
}

let args =
  yargs
    .option('file', {
      describe: 'Path to questions file, each line is a question'
    })
    .option('question_type', {
      describe: 'Question type, one of: training | test | toanswer'
    })
    .option('question_group', {
      describe: 'Provide an id for the question group'
    })
    .option('gcloud_project_id', {describe: 'Google Cloud Project Id'})
    .option('spanner_instance', {describe: 'Spanner instance name'})
    .option('spanner_db', {describe: 'Spanner database name'})
    .option('action', {
      describe: 'One of update | insert | print | count; default is print. '
    })
    .option('from_line', {
      describe: 'Start processing file at from_line (inclusive)'
    })
    .option('to_line', {
      describe: 'Only process file until to_line (inclusive)'
    })
    .default('action', 'print')
    .default('gcloud_project_id', 'wikidetox')
    .default('spanner_instance', 'crowdsource')
    .demandOption(
      ['file', 'question_group', 'spanner_db'],
      'Please provide at least --file, --question_group, and --spanner_db.')
    .help()
    .argv;

main(args as any as Params)
  .then(() => {
    console.log('Success!');
  })
  .catch(e => {
    console.error('Failed: ', e);
  });
