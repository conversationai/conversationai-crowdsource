import { csvtojsonlines } from '../src/csvtojsonlines_lib';
import * as stream from 'stream';
import { expect } from 'chai';
import 'mocha';

describe('CSV to JSON-lines tests', () => {
  it('simple CSV to JSONlines on streams', async () => {
    const r = new stream.Readable();
    r._read = () => {};
    r.push('foo, bar\n');
    r.push('1, a\n');
    r.push('2, b\n');
    r.push('3, c\n');
    r.push(null);

    const stuff: Array<{}> = [];
    const w = new stream.PassThrough();
    w.on('data', (d: string) => {
      stuff.push(JSON.parse(d));
    });

    const onceFinished = new Promise((resolve, reject) => {
      w.on('finish', () => {
        resolve();
      });
    });

    csvtojsonlines(r, w);

    await onceFinished
      .then(() => {
        expect(stuff).to.eql([
          { foo: '1', bar: 'a' },
          { foo: '2', bar: 'b' },
          { foo: '3', bar: 'c' },
        ]);
      })
      .catch(e => {
        console.error(e.message);
        expect.fail();
      });
  });
});
