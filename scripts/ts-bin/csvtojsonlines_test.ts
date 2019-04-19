import {csvtojsonlines} from './csvtojsonlines_lib';
import * as stream from 'stream';
import {expect} from 'chai';
import 'mocha';

describe('Hello function', () => {
  it('should return hello world', async function () {
    let r = new stream.Readable();
    r._read = () => {};
    r.push('foo, bar\n');
    r.push('1, a\n');
    r.push('2, b\n');
    r.push('3, c\n');
    r.push(null);

    let stuff: {}[] = [];
    let w = new stream.PassThrough();
    w.on('data', (d: string) => {stuff.push(JSON.parse(d));});

    let onceFinished = new Promise((resolve, reject) => {
      w.on('finish', () => {resolve()});
    });

    csvtojsonlines(r, w);

    await onceFinished.then(() => {
      expect(stuff).to.eql([{'foo': '1', 'bar': 'a'}, {'foo': '2', 'bar': 'b'}, {'foo': '3', 'bar': 'c'}]);
    }).catch((e) => {
      console.error(e.message);
      expect.fail();
    });

  });
});
