'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ThrottleGroup = exports.Throttle = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _stream = require('stream');

var _limiter = require('limiter');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Throttle = exports.Throttle = function (_Transform) {
  _inherits(Throttle, _Transform);

  function Throttle(opts) {
    _classCallCheck(this, Throttle);

    var _this = _possibleConstructorReturn(this, (Throttle.__proto__ || Object.getPrototypeOf(Throttle)).call(this, opts));

    if (opts.rate === undefined || parseInt(opts.rate, 10) < 0) {
      throw new Error('throttle rate must be set or a positive number');
    }
    _this.initburst = opts.initburst || 0;
    _this.rate = opts.rate;
    _this.chunksize = opts.chunksize || _this.rate / 10;
    _this.bucket = new _limiter.TokenBucket(_this.rate, _this.rate, 'second', null);
    return _this;
  }

  _createClass(Throttle, [{
    key: 'process',
    value: function process(chunk, pos, done) {
      var _this2 = this;

      var slice = chunk.slice(pos, pos + this.chunksize);
      if (!slice.length) {
        done();
        return;
      }
      this.bucket.removeTokens(slice.length, function (err) {
        if (err) {
          done(err);
          return;
        }
        _this2.push(slice);
        _this2.process(chunk, pos + _this2.chunksize, done);
      });
    }
  }, {
    key: '_transform',
    value: function _transform(chunk, encoding, done) {
      this.process(chunk, 0, done);
    }
  }]);

  return Throttle;
}(_stream.Transform);

var ThrottleGroup = exports.ThrottleGroup = function () {
  function ThrottleGroup(opts) {
    _classCallCheck(this, ThrottleGroup);

    if (opts.rate === undefined || parseInt(opts.rate, 10) < 0) {
      throw new Error('throttle rate must be set or a positive number');
    }
    this.options = {
      initburst: opts.initburst || 0,
      rate: opts.rate,
      chunksize: opts.chunksize || this.rate / 10
    };
  }

  _createClass(ThrottleGroup, [{
    key: 'throttle',
    value: function throttle() {
      return new Throttle(this.options);
    }
  }]);

  return ThrottleGroup;
}();

exports.default = { Throttle: Throttle, ThrottleGroup: ThrottleGroup };