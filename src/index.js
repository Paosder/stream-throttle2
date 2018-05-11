import { Transform } from 'stream';
import { TokenBucket } from 'limiter';

class Throttle extends Transform {
  constructor(opts) {
    super(opts);
    if (opts.rate === undefined || parseInt(opts.rate, 10) < 0) {
      throw new Error('throttle rate must be set or a positive number');
    }
    this.initburst = opts.initburst || 0;
    this.rate = opts.rate;
    this.chunksize = opts.chunksize || this.rate / 10;
    this.bucket = new TokenBucket(this.rate, this.rate, 'second', null);
  }
  process(chunk, pos, done) {
    const slice = chunk.slice(pos, pos + this.chunksize);
    if (!slice.length) {
      done();
      return;
    }
    this.bucket.removeTokens(slice.length, (err) => {
      if (err) {
        done(err);
        return;
      }
      this.push(slice);
      this.process(chunk, pos + this.chunksize, done);
    });
  }
  _transform(chunk, encoding, done) {
    this.process(chunk, 0, done);
  }
}

export default Throttle;
