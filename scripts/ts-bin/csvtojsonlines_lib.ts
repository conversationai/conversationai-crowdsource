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
import * as csvtojson from 'csvtojson';
import * as stream from 'stream';

export async function csvtojsonlines(instream: stream.Readable,
  outstream: stream.Writable): Promise<void> {
  const csvToJson = csvtojson();

  let lineCount = 0;

  const onceDone = new Promise((resolve, reject) => {
    csvToJson.fromStream(instream)
      .on('data',
        (jsonObj: Buffer) => {
          lineCount++;
          outstream.write(jsonObj.toString('utf8'));
        })
      .on('done', (error: Error) => {
        console.log(`lineCount: ${lineCount}`);
        outstream.end();
        if (error) {
          console.log('end error:' + error.message);
          reject(error);
        } else {
          console.log('end success.');
          resolve();
        }
      });
  });
  await onceDone;
}
