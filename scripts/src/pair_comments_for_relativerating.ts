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

  ts-node ./ts-bin/pair_comments_for_relativerating.ts \
    --infile="./tmp/path-to-input.jsonl" \
    --output_path_prefix="./tmp/path-to-paired"

  Once this has been done, the jsonlines can be converted to CSV file using:
  ./node_modules/.bin/json2csv --ndjson \
    --input="./tmp/path-to-paired.jsonl" \
    --output="./tmp/path-to-paired.csv"
*/

import * as fs from 'fs';
import * as readline from 'readline';
import * as yargs from 'yargs';

// Command line arguments.
interface Params {
  infile: string;
  output_path_prefix: string;
  output_path_postfix: string;
  left_id_prefix: string;
  right_id_prefix: string;
  left_text_prefix: string;
  right_text_prefix: string;
  entries_per_row: number;
  rows_per_file: number;
}

interface InputObj {
  comment_text: string;
  id: string;
}

// A string -> string table that will be outputed as JSON in a file.
type OutFileData = Array<{
  [key: string]: string;
}>;

function createAllPairsFiles(data: InputObj[]): OutFileData[] {
  const outFiles: OutFileData[] = [];
  let pairId = 1;
  let pairIdPostfix = '';
  let outPairsForRow: { [key: string]: string } = {};
  let outRowsForFile: OutFileData = [];

  for (const d1 of data) {
    for (const d2 of data) {
      if (args.entries_per_row > 1) {
        pairIdPostfix = `${pairId}`;
      }

      // Define the output fields of this JSON object that will be output in a
      // single line of the output file. These strangely named output fields are
      // for tools that uses it later. For other applications consumption of the
      // output, these can be changed as needed.
      outPairsForRow[`a.p.file_id`] = `${outFiles.length + 1}`;
      outPairsForRow[`a.p.row_id`] = `${outRowsForFile.length + 1}`;
      outPairsForRow[`${args.left_id_prefix}${pairIdPostfix}`] = d1.id;
      outPairsForRow[`${args.right_id_prefix}${pairIdPostfix}`] = d2.id;
      outPairsForRow[`${args.left_text_prefix}${pairIdPostfix}`] =
        d1.comment_text;
      outPairsForRow[`${args.right_text_prefix}${pairIdPostfix}`] =
        d2.comment_text;

      if (pairId >= args.entries_per_row) {
        outRowsForFile.push(outPairsForRow);
        pairId = 1;
        outPairsForRow = {};
        if (outRowsForFile.length >= args.rows_per_file) {
          outFiles.push(outRowsForFile);
          outRowsForFile = [];
        }
      } else {
        pairId += 1;
      }
    }
  }

  if (pairId > 1) {
    console.warn(`Extra pairs not emitted: ${JSON.stringify(outPairsForRow)}`);
  }
  if (outRowsForFile.length > 0) {
    console.log(`Rows in last file count: ${outRowsForFile.length}`);
    outFiles.push(outRowsForFile);
    outRowsForFile = [];
  }

  console.log(`Number of files to output: ${outFiles.length}`);
  return outFiles;
}

// TODO(ldixon): rewrite based on observables, and its sensible abstractions
// of streams. This will also enable this to scale to more data than fits in
// memory.
async function main(args: Params) {
  const instream = fs.createReadStream(args.infile);
  const readLineEventHandler = readline.createInterface(instream);

  let lineCount = 0;

  const data: InputObj[] = [];
  const outFiles: OutFileData[] = [];

  readLineEventHandler.on('line', async line => {
    const obj: InputObj = JSON.parse(line);
    lineCount++;
    data.push(obj);
  });

  readLineEventHandler.on('close', () => {
    const outFiles = createAllPairsFiles(data);

    // Output everything.
    let outfileId = 1;
    for (const outfile of outFiles) {
      const outstream = fs.createWriteStream(
        `${args.output_path_prefix}_${outfileId}_of_${outFiles.length}${
          args.output_path_postfix
        }`,
        { flags: 'w', encoding: 'utf-8' }
      );
      for (const line of outfile) {
        outstream.write(`${JSON.stringify(line)}\n`);
      }
      outstream.end();
      outfileId += 1;
    }
    console.log(`lineCount: ${lineCount}`);
  });
}

const args = yargs
  .option('infile', {
    describe: 'Input path to JSON-lines file of answers with questions',
  })
  .option('left_id_prefix', {
    default: 'a.p.id_a',
    describe: 'Prefix string for the id property of the left example',
  })
  .option('right_id_prefix', {
    default: 'a.p.id_b',
    describe: 'Prefix string for the id property of the right example',
  })
  .option('left_text_prefix', {
    default: 'i.comment_a',
    describe: 'Prefix string for the comment text property of the left example',
  })
  .option('right_text_prefix', {
    default: 'i.comment_b',
    describe:
      'Prefix string for the comment text property of the right example',
  })
  .option('entries_per_row', {
    default: 5,
    describe: 'The number of pairs to bundle per row.',
  })
  .option('rows_per_file', {
    default: 2000,
    describe: 'The number of rows to bundle per output file.',
  })
  .option('output_path_prefix', {
    describe: 'Output path prefix for JSONL files to be written',
  })
  .option('output_path_postfix', {
    default: '.jsonl',
    describe: 'The postfix for output files',
  })
  .demandOption(
    ['infile', 'output_path_prefix'],
    'Please provide at least --infile and --output_path_prefix.'
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
