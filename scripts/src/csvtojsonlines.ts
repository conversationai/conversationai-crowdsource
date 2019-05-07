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

  ts-node src/setup/csvtojsonlines.ts \
    --infile="./tmp/foo.csv" \
    --outfile="./tmp/foo.json"
*/

import * as csvtojson from 'csvtojson';
import * as fs from 'fs';
import * as stream from 'stream';
import * as yargs from 'yargs';
import { csvtojsonlines } from './csvtojsonlines_lib';

// Command line arguments.
interface Params {
  infile: string;
  outfile: string;
}

async function main(args: Params): Promise<void> {
  const instream = fs.createReadStream(args.infile);
  const outstream = fs.createWriteStream(args.outfile, {
    flags: 'w',
    encoding: 'utf-8',
  });

  await csvtojsonlines(instream, outstream);
}

const args = yargs
  .option('infile', { describe: 'Input path to CSV file.' })
  .option('outfile', { describe: 'Path to output JSON-lines to' })
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
