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
*/

import * as yargs from 'yargs';
import * as fs from 'fs';
import * as readline from 'readline';
// import * as jsonexport from "jsonexport/dist"
// import * as stream from 'stream';

// Command line arguments.
interface Params {
  infile:string,
  output_path_prefix:string,
  output_path_postfix:string,
  left_id_prefix:string,
  right_id_prefix:string,
  left_text_prefix:string,
  right_text_prefix:string,
  entries_per_row:number,
  rows_per_file:number,
};

interface InputObj {
  comment_text:string;
  id:string;
}

// TODO(ldixon): rewrite based on observables, and its sensible abstractions
// of streams. This will also enable this to scale to more data than fits in
// memory.
async function main(args : Params) {
    let instream = fs.createReadStream(args.infile);
    let rl = readline.createInterface(instream);

    let lineCount = 0;

    let data : InputObj[] = [];
    let pair_id = 1;
    // let pairs_to_ouput : { [key:string]:string }[] = [];
    let pair_id_postfix = '';
    let out_pairs_for_row: { [key:string]:string } = {};
    let out_rows_for_file: { [key:string]:string }[] = [];
    let out_files: { [key:string]:string }[][] = [];

    rl.on('line', async function(line) {
      let obj : InputObj = JSON.parse(line);
      lineCount++;
      data.push(obj);
    });

    // instream.pipe(jsonexport()).pipe(writer);
    // var writer = fs.createWriteStream('out.csv');

    rl.on('close', function() {

      for(let d1 of data) {
        for(let d2 of data){
          if (args.entries_per_row > 1) {
            pair_id_postfix = `${pair_id}`
          }

          out_pairs_for_row[`a.p.file_id`] = `${out_files.length + 1}`;
          out_pairs_for_row[`a.p.row_id`] = `${out_rows_for_file.length + 1}`;
          out_pairs_for_row[`${args.left_id_prefix}${pair_id_postfix}`] = d1.id;
          out_pairs_for_row[`${args.right_id_prefix}${pair_id_postfix}`] = d2.id;
          out_pairs_for_row[`${args.left_text_prefix}${pair_id_postfix}`] = d1.comment_text;
          out_pairs_for_row[`${args.right_text_prefix}${pair_id_postfix}`] = d2.comment_text;

          if(pair_id >= args.entries_per_row) {
            out_rows_for_file.push(out_pairs_for_row);
            pair_id = 1;
            out_pairs_for_row = {};
            if(out_rows_for_file.length >= args.rows_per_file) {
              out_files.push(out_rows_for_file);
              out_rows_for_file = [];
            }
          } else {
            pair_id += 1;
          }
        }
      }

      if(pair_id > 1) {
        console.warn(`Extra pairs not emitted: ${JSON.stringify(out_pairs_for_row)}`);
      }
      if(out_rows_for_file.length > 0) {
        console.log(`Rows in last file count: ${out_rows_for_file.length}`);
        out_files.push(out_rows_for_file);
        out_rows_for_file = [];
      }

      console.log(`Number of files to output: ${out_files.length}`);

      // Output everything.
      let outfile_id = 1;
      for (let outfile of out_files) {
        let outstream = fs.createWriteStream(
          `${args.output_path_prefix}_${outfile_id}_of_${out_files.length}${args.output_path_postfix}`,
          {flags: 'w', encoding: 'utf-8'});
        for (let line of outfile) {
          outstream.write(`${JSON.stringify(line)}\n`);
        }
        outstream.end();
        outfile_id += 1;
      }
      console.log(`lineCount: ${lineCount}`);
    });
}

let args = yargs
    .option('infile', {
        describe: 'Input path to JSON-lines file of answers with questions'
    })
    .option('left_id_prefix', {
      default: 'a.p.id_a',
      describe: 'Prefix string for the id property of the left example'
    })
    .option('right_id_prefix', {
      default: 'a.p.id_b',
      describe: 'Prefix string for the id property of the right example'
    })
    .option('left_text_prefix', {
      default: 'i.comment_a',
      describe: 'Prefix string for the comment text property of the left example'
    })
    .option('right_text_prefix', {
      default: 'i.comment_b',
      describe: 'Prefix string for the comment text property of the right example'
    })
    .option('entries_per_row', {
      default: 5,
      describe: 'The number of pairs to bundle per row.'
    })
    .option('rows_per_file', {
      default: 2000,
      describe: 'The number of rows to bundle per output file.'
    })
    .option('output_path_prefix', {
      describe: 'Output path prefix for JSONL files to be written'
    })
    .option('output_path_postfix', {
      default: '.jsonl',
      describe: 'The postfix for output files'
    })
    .demandOption(['infile', 'output_path_prefix'],
        'Please provide at least --infile and --output_path_prefix.')
    .help()
    .argv;

main(args as any as Params)
  .then(() => {
    console.log('Success!');
  }).catch(e => {
    console.error('Failed: ', e);
    process.exit(1);
  });
