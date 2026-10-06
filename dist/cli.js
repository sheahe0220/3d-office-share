#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/ws/lib/constants.js
var require_constants = __commonJS({
  "node_modules/ws/lib/constants.js"(exports2, module2) {
    "use strict";
    var BINARY_TYPES = ["nodebuffer", "arraybuffer", "fragments"];
    var hasBlob = typeof Blob !== "undefined";
    if (hasBlob) BINARY_TYPES.push("blob");
    module2.exports = {
      BINARY_TYPES,
      CLOSE_TIMEOUT: 3e4,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      hasBlob,
      kForOnEventAttribute: /* @__PURE__ */ Symbol("kIsForOnEventAttribute"),
      kListener: /* @__PURE__ */ Symbol("kListener"),
      kStatusCode: /* @__PURE__ */ Symbol("status-code"),
      kWebSocket: /* @__PURE__ */ Symbol("websocket"),
      NOOP: () => {
      }
    };
  }
});

// node_modules/ws/lib/buffer-util.js
var require_buffer_util = __commonJS({
  "node_modules/ws/lib/buffer-util.js"(exports2, module2) {
    "use strict";
    var { EMPTY_BUFFER } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    function concat(list, totalLength) {
      if (list.length === 0) return EMPTY_BUFFER;
      if (list.length === 1) return list[0];
      const target = Buffer.allocUnsafe(totalLength);
      let offset = 0;
      for (let i = 0; i < list.length; i++) {
        const buf = list[i];
        target.set(buf, offset);
        offset += buf.length;
      }
      if (offset < totalLength) {
        return new FastBuffer(target.buffer, target.byteOffset, offset);
      }
      return target;
    }
    function _mask(source, mask, output, offset, length) {
      for (let i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask[i & 3];
      }
    }
    function _unmask(buffer, mask) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] ^= mask[i & 3];
      }
    }
    function toArrayBuffer(buf) {
      if (buf.length === buf.buffer.byteLength) {
        return buf.buffer;
      }
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
    }
    function toBuffer(data) {
      toBuffer.readOnly = true;
      if (Buffer.isBuffer(data)) return data;
      let buf;
      if (data instanceof ArrayBuffer) {
        buf = new FastBuffer(data);
      } else if (ArrayBuffer.isView(data)) {
        buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
      } else {
        buf = Buffer.from(data);
        toBuffer.readOnly = false;
      }
      return buf;
    }
    module2.exports = {
      concat,
      mask: _mask,
      toArrayBuffer,
      toBuffer,
      unmask: _unmask
    };
    if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const bufferUtil = require("bufferutil");
        module2.exports.mask = function(source, mask, output, offset, length) {
          if (length < 48) _mask(source, mask, output, offset, length);
          else bufferUtil.mask(source, mask, output, offset, length);
        };
        module2.exports.unmask = function(buffer, mask) {
          if (buffer.length < 32) _unmask(buffer, mask);
          else bufferUtil.unmask(buffer, mask);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/limiter.js
var require_limiter = __commonJS({
  "node_modules/ws/lib/limiter.js"(exports2, module2) {
    "use strict";
    var kDone = /* @__PURE__ */ Symbol("kDone");
    var kRun = /* @__PURE__ */ Symbol("kRun");
    var Limiter = class {
      /**
       * Creates a new `Limiter`.
       *
       * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
       *     to run concurrently
       */
      constructor(concurrency) {
        this[kDone] = () => {
          this.pending--;
          this[kRun]();
        };
        this.concurrency = concurrency || Infinity;
        this.jobs = [];
        this.pending = 0;
      }
      /**
       * Adds a job to the queue.
       *
       * @param {Function} job The job to run
       * @public
       */
      add(job) {
        this.jobs.push(job);
        this[kRun]();
      }
      /**
       * Removes a job from the queue and runs it if possible.
       *
       * @private
       */
      [kRun]() {
        if (this.pending === this.concurrency) return;
        if (this.jobs.length) {
          const job = this.jobs.shift();
          this.pending++;
          job(this[kDone]);
        }
      }
    };
    module2.exports = Limiter;
  }
});

// node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = __commonJS({
  "node_modules/ws/lib/permessage-deflate.js"(exports2, module2) {
    "use strict";
    var zlib2 = require("zlib");
    var bufferUtil = require_buffer_util();
    var Limiter = require_limiter();
    var { kStatusCode } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    var TRAILER = Buffer.from([0, 0, 255, 255]);
    var kPerMessageDeflate = /* @__PURE__ */ Symbol("permessage-deflate");
    var kTotalLength = /* @__PURE__ */ Symbol("total-length");
    var kCallback = /* @__PURE__ */ Symbol("callback");
    var kBuffers = /* @__PURE__ */ Symbol("buffers");
    var kError = /* @__PURE__ */ Symbol("error");
    var zlibLimiter;
    var PerMessageDeflate2 = class {
      /**
       * Creates a PerMessageDeflate instance.
       *
       * @param {Object} [options] Configuration options
       * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
       *     for, or request, a custom client window size
       * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
       *     acknowledge disabling of client context takeover
       * @param {Number} [options.concurrencyLimit=10] The number of concurrent
       *     calls to zlib
       * @param {Boolean} [options.isServer=false] Create the instance in either
       *     server or client mode
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
       *     use of a custom server window size
       * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
       *     disabling of server context takeover
       * @param {Number} [options.threshold=1024] Size (in bytes) below which
       *     messages should not be compressed if context takeover is disabled
       * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
       *     deflate
       * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
       *     inflate
       */
      constructor(options) {
        this._options = options || {};
        this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
        this._maxPayload = this._options.maxPayload | 0;
        this._isServer = !!this._options.isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!zlibLimiter) {
          const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
          zlibLimiter = new Limiter(concurrency);
        }
      }
      /**
       * @type {String}
       */
      static get extensionName() {
        return "permessage-deflate";
      }
      /**
       * Create an extension negotiation offer.
       *
       * @return {Object} Extension parameters
       * @public
       */
      offer() {
        const params = {};
        if (this._options.serverNoContextTakeover) {
          params.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
          params.client_no_context_takeover = true;
        }
        if (this._options.serverMaxWindowBits) {
          params.server_max_window_bits = this._options.serverMaxWindowBits;
        }
        if (this._options.clientMaxWindowBits) {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits == null) {
          params.client_max_window_bits = true;
        }
        return params;
      }
      /**
       * Accept an extension negotiation offer/response.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Object} Accepted configuration
       * @public
       */
      accept(configurations) {
        configurations = this.normalizeParams(configurations);
        this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
        return this.params;
      }
      /**
       * Releases all resources used by the extension.
       *
       * @public
       */
      cleanup() {
        if (this._inflate) {
          this._inflate.close();
          this._inflate = null;
        }
        if (this._deflate) {
          const callback = this._deflate[kCallback];
          this._deflate.close();
          this._deflate = null;
          if (callback) {
            callback(
              new Error(
                "The deflate stream was closed while data was being processed"
              )
            );
          }
        }
      }
      /**
       *  Accept an extension negotiation offer.
       *
       * @param {Array} offers The extension negotiation offers
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsServer(offers) {
        const opts = this._options;
        const accepted = offers.find((params) => {
          if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && (typeof params.client_max_window_bits === "number" ? opts.clientMaxWindowBits > params.client_max_window_bits : !params.client_max_window_bits)) {
            return false;
          }
          return true;
        });
        if (!accepted) {
          throw new Error("None of the extension offers can be accepted");
        }
        if (opts.serverNoContextTakeover) {
          accepted.server_no_context_takeover = true;
        }
        if (opts.clientNoContextTakeover) {
          accepted.client_no_context_takeover = true;
        }
        if (typeof opts.serverMaxWindowBits === "number") {
          accepted.server_max_window_bits = opts.serverMaxWindowBits;
        }
        if (typeof opts.clientMaxWindowBits === "number") {
          accepted.client_max_window_bits = opts.clientMaxWindowBits;
        } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
          delete accepted.client_max_window_bits;
        }
        return accepted;
      }
      /**
       * Accept the extension negotiation response.
       *
       * @param {Array} response The extension negotiation response
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsClient(response) {
        const params = response[0];
        if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
          throw new Error('Unexpected parameter "client_no_context_takeover"');
        }
        if (!params.client_max_window_bits) {
          if (typeof this._options.clientMaxWindowBits === "number") {
            params.client_max_window_bits = this._options.clientMaxWindowBits;
          }
        } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
          throw new Error(
            'Unexpected or invalid parameter "client_max_window_bits"'
          );
        }
        return params;
      }
      /**
       * Normalize parameters.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Array} The offers/response with normalized parameters
       * @private
       */
      normalizeParams(configurations) {
        configurations.forEach((params) => {
          Object.keys(params).forEach((key) => {
            let value = params[key];
            if (value.length > 1) {
              throw new Error(`Parameter "${key}" must have only a single value`);
            }
            value = value[0];
            if (key === "client_max_window_bits") {
              if (value !== true) {
                const num = +value;
                if (!Number.isInteger(num) || num < 8 || num > 15) {
                  throw new TypeError(
                    `Invalid value for parameter "${key}": ${value}`
                  );
                }
                value = num;
              } else if (!this._isServer) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else if (key === "server_max_window_bits") {
              const num = +value;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
              value = num;
            } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
              if (value !== true) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else {
              throw new Error(`Unknown parameter "${key}"`);
            }
            params[key] = value;
          });
        });
        return configurations;
      }
      /**
       * Decompress data. Concurrency limited.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      decompress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._decompress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Compress data. Concurrency limited.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      compress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._compress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Decompress data.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _decompress(data, fin, callback) {
        const endpoint = this._isServer ? "client" : "server";
        if (!this._inflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib2.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._inflate = zlib2.createInflateRaw({
            ...this._options.zlibInflateOptions,
            windowBits
          });
          this._inflate[kPerMessageDeflate] = this;
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          this._inflate.on("error", inflateOnError);
          this._inflate.on("data", inflateOnData);
        }
        this._inflate[kCallback] = callback;
        this._inflate.write(data);
        if (fin) this._inflate.write(TRAILER);
        this._inflate.flush(() => {
          const err = this._inflate[kError];
          if (err) {
            this._inflate.close();
            this._inflate = null;
            callback(err);
            return;
          }
          const data2 = bufferUtil.concat(
            this._inflate[kBuffers],
            this._inflate[kTotalLength]
          );
          if (this._inflate._readableState.endEmitted) {
            this._inflate.close();
            this._inflate = null;
          } else {
            this._inflate[kTotalLength] = 0;
            this._inflate[kBuffers] = [];
            if (fin && this.params[`${endpoint}_no_context_takeover`]) {
              this._inflate.reset();
            }
          }
          callback(null, data2);
        });
      }
      /**
       * Compress data.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _compress(data, fin, callback) {
        const endpoint = this._isServer ? "server" : "client";
        if (!this._deflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib2.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._deflate = zlib2.createDeflateRaw({
            ...this._options.zlibDeflateOptions,
            windowBits
          });
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          this._deflate.on("data", deflateOnData);
        }
        this._deflate[kCallback] = callback;
        this._deflate.write(data);
        this._deflate.flush(zlib2.Z_SYNC_FLUSH, () => {
          if (!this._deflate) {
            return;
          }
          let data2 = bufferUtil.concat(
            this._deflate[kBuffers],
            this._deflate[kTotalLength]
          );
          if (fin) {
            data2 = new FastBuffer(data2.buffer, data2.byteOffset, data2.length - 4);
          }
          this._deflate[kCallback] = null;
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
            this._deflate.reset();
          }
          callback(null, data2);
        });
      }
    };
    module2.exports = PerMessageDeflate2;
    function deflateOnData(chunk) {
      this[kBuffers].push(chunk);
      this[kTotalLength] += chunk.length;
    }
    function inflateOnData(chunk) {
      this[kTotalLength] += chunk.length;
      if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
        this[kBuffers].push(chunk);
        return;
      }
      this[kError] = new RangeError("Max payload size exceeded");
      this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
      this[kError][kStatusCode] = 1009;
      this.removeListener("data", inflateOnData);
      this.reset();
    }
    function inflateOnError(err) {
      this[kPerMessageDeflate]._inflate = null;
      if (this[kError]) {
        this[kCallback](this[kError]);
        return;
      }
      err[kStatusCode] = 1007;
      this[kCallback](err);
    }
  }
});

// node_modules/ws/lib/validation.js
var require_validation = __commonJS({
  "node_modules/ws/lib/validation.js"(exports2, module2) {
    "use strict";
    var { isUtf8 } = require("buffer");
    var { hasBlob } = require_constants();
    var tokenChars = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 0 - 15
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 16 - 31
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      0,
      // 32 - 47
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      // 48 - 63
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 64 - 79
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      // 80 - 95
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 96 - 111
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      0,
      1,
      0
      // 112 - 127
    ];
    function isValidStatusCode(code) {
      return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
    }
    function _isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;
      while (i < len) {
        if ((buf[i] & 128) === 0) {
          i++;
        } else if ((buf[i] & 224) === 192) {
          if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
            return false;
          }
          i += 2;
        } else if ((buf[i] & 240) === 224) {
          if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || // Overlong
          buf[i] === 237 && (buf[i + 1] & 224) === 160) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 248) === 240) {
          if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || // Overlong
          buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
            return false;
          }
          i += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    function isBlob(value) {
      return hasBlob && typeof value === "object" && typeof value.arrayBuffer === "function" && typeof value.type === "string" && typeof value.stream === "function" && (value[Symbol.toStringTag] === "Blob" || value[Symbol.toStringTag] === "File");
    }
    module2.exports = {
      isBlob,
      isValidStatusCode,
      isValidUTF8: _isValidUTF8,
      tokenChars
    };
    if (isUtf8) {
      module2.exports.isValidUTF8 = function(buf) {
        return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const isValidUTF8 = require("utf-8-validate");
        module2.exports.isValidUTF8 = function(buf) {
          return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/receiver.js
var require_receiver = __commonJS({
  "node_modules/ws/lib/receiver.js"(exports2, module2) {
    "use strict";
    var { Writable } = require("stream");
    var PerMessageDeflate2 = require_permessage_deflate();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      kStatusCode,
      kWebSocket
    } = require_constants();
    var { concat, toArrayBuffer, unmask } = require_buffer_util();
    var { isValidStatusCode, isValidUTF8 } = require_validation();
    var FastBuffer = Buffer[Symbol.species];
    var GET_INFO = 0;
    var GET_PAYLOAD_LENGTH_16 = 1;
    var GET_PAYLOAD_LENGTH_64 = 2;
    var GET_MASK = 3;
    var GET_DATA = 4;
    var INFLATING = 5;
    var DEFER_EVENT = 6;
    var Receiver2 = class extends Writable {
      /**
       * Creates a Receiver instance.
       *
       * @param {Object} [options] Options object
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {String} [options.binaryType=nodebuffer] The type for binary data
       * @param {Object} [options.extensions] An object containing the negotiated
       *     extensions
       * @param {Boolean} [options.isServer=false] Specifies whether to operate in
       *     client or server mode
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       */
      constructor(options = {}) {
        super();
        this._allowSynchronousEvents = options.allowSynchronousEvents !== void 0 ? options.allowSynchronousEvents : true;
        this._binaryType = options.binaryType || BINARY_TYPES[0];
        this._extensions = options.extensions || {};
        this._isServer = !!options.isServer;
        this._maxBufferedChunks = options.maxBufferedChunks | 0;
        this._maxFragments = options.maxFragments | 0;
        this._maxPayload = options.maxPayload | 0;
        this._skipUTF8Validation = !!options.skipUTF8Validation;
        this[kWebSocket] = void 0;
        this._bufferedBytes = 0;
        this._buffers = [];
        this._compressed = false;
        this._payloadLength = 0;
        this._mask = void 0;
        this._fragmented = 0;
        this._masked = false;
        this._fin = false;
        this._opcode = 0;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._numFragments = 0;
        this._fragments = [];
        this._errored = false;
        this._loop = false;
        this._state = GET_INFO;
      }
      /**
       * Implements `Writable.prototype._write()`.
       *
       * @param {Buffer} chunk The chunk of data to write
       * @param {String} encoding The character encoding of `chunk`
       * @param {Function} cb Callback
       * @private
       */
      _write(chunk, encoding, cb) {
        if (this._opcode === 8 && this._state == GET_INFO) return cb();
        if (this._maxBufferedChunks > 0 && this._buffers.length >= this._maxBufferedChunks) {
          cb(
            this.createError(
              RangeError,
              "Too many buffered chunks",
              false,
              1008,
              "WS_ERR_TOO_MANY_BUFFERED_PARTS"
            )
          );
          return;
        }
        this._bufferedBytes += chunk.length;
        this._buffers.push(chunk);
        this.startLoop(cb);
      }
      /**
       * Consumes `n` bytes from the buffered data.
       *
       * @param {Number} n The number of bytes to consume
       * @return {Buffer} The consumed bytes
       * @private
       */
      consume(n) {
        this._bufferedBytes -= n;
        if (n === this._buffers[0].length) return this._buffers.shift();
        if (n < this._buffers[0].length) {
          const buf = this._buffers[0];
          this._buffers[0] = new FastBuffer(
            buf.buffer,
            buf.byteOffset + n,
            buf.length - n
          );
          return new FastBuffer(buf.buffer, buf.byteOffset, n);
        }
        const dst = Buffer.allocUnsafe(n);
        do {
          const buf = this._buffers[0];
          const offset = dst.length - n;
          if (n >= buf.length) {
            dst.set(this._buffers.shift(), offset);
          } else {
            dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
            this._buffers[0] = new FastBuffer(
              buf.buffer,
              buf.byteOffset + n,
              buf.length - n
            );
          }
          n -= buf.length;
        } while (n > 0);
        return dst;
      }
      /**
       * Starts the parsing loop.
       *
       * @param {Function} cb Callback
       * @private
       */
      startLoop(cb) {
        this._loop = true;
        do {
          switch (this._state) {
            case GET_INFO:
              this.getInfo(cb);
              break;
            case GET_PAYLOAD_LENGTH_16:
              this.getPayloadLength16(cb);
              break;
            case GET_PAYLOAD_LENGTH_64:
              this.getPayloadLength64(cb);
              break;
            case GET_MASK:
              this.getMask();
              break;
            case GET_DATA:
              this.getData(cb);
              break;
            case INFLATING:
            case DEFER_EVENT:
              this._loop = false;
              return;
          }
        } while (this._loop);
        if (!this._errored) cb();
      }
      /**
       * Reads the first two bytes of a frame.
       *
       * @param {Function} cb Callback
       * @private
       */
      getInfo(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        const buf = this.consume(2);
        if ((buf[0] & 48) !== 0) {
          const error = this.createError(
            RangeError,
            "RSV2 and RSV3 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_2_3"
          );
          cb(error);
          return;
        }
        const compressed = (buf[0] & 64) === 64;
        if (compressed && !this._extensions[PerMessageDeflate2.extensionName]) {
          const error = this.createError(
            RangeError,
            "RSV1 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_1"
          );
          cb(error);
          return;
        }
        this._fin = (buf[0] & 128) === 128;
        this._opcode = buf[0] & 15;
        this._payloadLength = buf[1] & 127;
        if (this._opcode === 0) {
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (!this._fragmented) {
            const error = this.createError(
              RangeError,
              "invalid opcode 0",
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._opcode = this._fragmented;
        } else if (this._opcode === 1 || this._opcode === 2) {
          if (this._fragmented) {
            const error = this.createError(
              RangeError,
              `invalid opcode ${this._opcode}`,
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._compressed = compressed;
        } else if (this._opcode > 7 && this._opcode < 11) {
          if (!this._fin) {
            const error = this.createError(
              RangeError,
              "FIN must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_FIN"
            );
            cb(error);
            return;
          }
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
            const error = this.createError(
              RangeError,
              `invalid payload length ${this._payloadLength}`,
              true,
              1002,
              "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"
            );
            cb(error);
            return;
          }
        } else {
          const error = this.createError(
            RangeError,
            `invalid opcode ${this._opcode}`,
            true,
            1002,
            "WS_ERR_INVALID_OPCODE"
          );
          cb(error);
          return;
        }
        if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
        this._masked = (buf[1] & 128) === 128;
        if (this._isServer) {
          if (!this._masked) {
            const error = this.createError(
              RangeError,
              "MASK must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_MASK"
            );
            cb(error);
            return;
          }
        } else if (this._masked) {
          const error = this.createError(
            RangeError,
            "MASK must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_MASK"
          );
          cb(error);
          return;
        }
        if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
        else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
        else this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+16).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength16(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        this._payloadLength = this.consume(2).readUInt16BE(0);
        this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+64).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength64(cb) {
        if (this._bufferedBytes < 8) {
          this._loop = false;
          return;
        }
        const buf = this.consume(8);
        const num = buf.readUInt32BE(0);
        if (num > Math.pow(2, 53 - 32) - 1) {
          const error = this.createError(
            RangeError,
            "Unsupported WebSocket frame: payload length > 2^53 - 1",
            false,
            1009,
            "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH"
          );
          cb(error);
          return;
        }
        this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
        this.haveLength(cb);
      }
      /**
       * Payload length has been read.
       *
       * @param {Function} cb Callback
       * @private
       */
      haveLength(cb) {
        if (this._payloadLength && this._opcode < 8) {
          this._totalPayloadLength += this._payloadLength;
          if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
            const error = this.createError(
              RangeError,
              "Max payload size exceeded",
              false,
              1009,
              "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
            );
            cb(error);
            return;
          }
        }
        if (this._masked) this._state = GET_MASK;
        else this._state = GET_DATA;
      }
      /**
       * Reads mask bytes.
       *
       * @private
       */
      getMask() {
        if (this._bufferedBytes < 4) {
          this._loop = false;
          return;
        }
        this._mask = this.consume(4);
        this._state = GET_DATA;
      }
      /**
       * Reads data bytes.
       *
       * @param {Function} cb Callback
       * @private
       */
      getData(cb) {
        let data = EMPTY_BUFFER;
        if (this._payloadLength) {
          if (this._bufferedBytes < this._payloadLength) {
            this._loop = false;
            return;
          }
          data = this.consume(this._payloadLength);
          if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
            unmask(data, this._mask);
          }
        }
        if (this._opcode > 7) {
          this.controlMessage(data, cb);
          return;
        }
        if (this._maxFragments > 0 && ++this._numFragments > this._maxFragments) {
          const error = this.createError(
            RangeError,
            "Too many message fragments",
            false,
            1008,
            "WS_ERR_TOO_MANY_BUFFERED_PARTS"
          );
          cb(error);
          return;
        }
        if (this._compressed) {
          this._state = INFLATING;
          this.decompress(data, cb);
          return;
        }
        if (data.length) {
          this._messageLength = this._totalPayloadLength;
          this._fragments.push(data);
        }
        this.dataMessage(cb);
      }
      /**
       * Decompresses data.
       *
       * @param {Buffer} data Compressed data
       * @param {Function} cb Callback
       * @private
       */
      decompress(data, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        perMessageDeflate.decompress(data, this._fin, (err, buf) => {
          if (err) return cb(err);
          if (buf.length) {
            this._messageLength += buf.length;
            if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
              const error = this.createError(
                RangeError,
                "Max payload size exceeded",
                false,
                1009,
                "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
              );
              cb(error);
              return;
            }
            this._fragments.push(buf);
          }
          this.dataMessage(cb);
          if (this._state === GET_INFO) this.startLoop(cb);
        });
      }
      /**
       * Handles a data message.
       *
       * @param {Function} cb Callback
       * @private
       */
      dataMessage(cb) {
        if (!this._fin) {
          this._state = GET_INFO;
          return;
        }
        const messageLength = this._messageLength;
        const fragments = this._fragments;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragmented = 0;
        this._numFragments = 0;
        this._fragments = [];
        if (this._opcode === 2) {
          let data;
          if (this._binaryType === "nodebuffer") {
            data = concat(fragments, messageLength);
          } else if (this._binaryType === "arraybuffer") {
            data = toArrayBuffer(concat(fragments, messageLength));
          } else if (this._binaryType === "blob") {
            data = new Blob(fragments);
          } else {
            data = fragments;
          }
          if (this._allowSynchronousEvents) {
            this.emit("message", data, true);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", data, true);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        } else {
          const buf = concat(fragments, messageLength);
          if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
            const error = this.createError(
              Error,
              "invalid UTF-8 sequence",
              true,
              1007,
              "WS_ERR_INVALID_UTF8"
            );
            cb(error);
            return;
          }
          if (this._state === INFLATING || this._allowSynchronousEvents) {
            this.emit("message", buf, false);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", buf, false);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        }
      }
      /**
       * Handles a control message.
       *
       * @param {Buffer} data Data to handle
       * @return {(Error|RangeError|undefined)} A possible error
       * @private
       */
      controlMessage(data, cb) {
        if (this._opcode === 8) {
          if (data.length === 0) {
            this._loop = false;
            this.emit("conclude", 1005, EMPTY_BUFFER);
            this.end();
          } else {
            const code = data.readUInt16BE(0);
            if (!isValidStatusCode(code)) {
              const error = this.createError(
                RangeError,
                `invalid status code ${code}`,
                true,
                1002,
                "WS_ERR_INVALID_CLOSE_CODE"
              );
              cb(error);
              return;
            }
            const buf = new FastBuffer(
              data.buffer,
              data.byteOffset + 2,
              data.length - 2
            );
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              const error = this.createError(
                Error,
                "invalid UTF-8 sequence",
                true,
                1007,
                "WS_ERR_INVALID_UTF8"
              );
              cb(error);
              return;
            }
            this._loop = false;
            this.emit("conclude", code, buf);
            this.end();
          }
          this._state = GET_INFO;
          return;
        }
        if (this._allowSynchronousEvents) {
          this.emit(this._opcode === 9 ? "ping" : "pong", data);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit(this._opcode === 9 ? "ping" : "pong", data);
            this._state = GET_INFO;
            this.startLoop(cb);
          });
        }
      }
      /**
       * Builds an error object.
       *
       * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
       * @param {String} message The error message
       * @param {Boolean} prefix Specifies whether or not to add a default prefix to
       *     `message`
       * @param {Number} statusCode The status code
       * @param {String} errorCode The exposed error code
       * @return {(Error|RangeError)} The error
       * @private
       */
      createError(ErrorCtor, message, prefix, statusCode, errorCode) {
        this._loop = false;
        this._errored = true;
        const err = new ErrorCtor(
          prefix ? `Invalid WebSocket frame: ${message}` : message
        );
        Error.captureStackTrace(err, this.createError);
        err.code = errorCode;
        err[kStatusCode] = statusCode;
        return err;
      }
    };
    module2.exports = Receiver2;
  }
});

// node_modules/ws/lib/sender.js
var require_sender = __commonJS({
  "node_modules/ws/lib/sender.js"(exports2, module2) {
    "use strict";
    var { Duplex } = require("stream");
    var { randomFillSync } = require("crypto");
    var {
      types: { isUint8Array }
    } = require("util");
    var PerMessageDeflate2 = require_permessage_deflate();
    var { EMPTY_BUFFER, kWebSocket, NOOP } = require_constants();
    var { isBlob, isValidStatusCode } = require_validation();
    var { mask: applyMask, toBuffer } = require_buffer_util();
    var kByteLength = /* @__PURE__ */ Symbol("kByteLength");
    var maskBuffer = Buffer.alloc(4);
    var RANDOM_POOL_SIZE = 8 * 1024;
    var randomPool;
    var randomPoolPointer = RANDOM_POOL_SIZE;
    var DEFAULT = 0;
    var DEFLATING = 1;
    var GET_BLOB_DATA = 2;
    var Sender2 = class _Sender {
      /**
       * Creates a Sender instance.
       *
       * @param {Duplex} socket The connection socket
       * @param {Object} [extensions] An object containing the negotiated extensions
       * @param {Function} [generateMask] The function used to generate the masking
       *     key
       */
      constructor(socket, extensions, generateMask) {
        this._extensions = extensions || {};
        if (generateMask) {
          this._generateMask = generateMask;
          this._maskBuffer = Buffer.alloc(4);
        }
        this._socket = socket;
        this._firstFragment = true;
        this._compress = false;
        this._bufferedBytes = 0;
        this._queue = [];
        this._state = DEFAULT;
        this.onerror = NOOP;
        this[kWebSocket] = void 0;
      }
      /**
       * Frames a piece of data according to the HyBi WebSocket protocol.
       *
       * @param {(Buffer|String)} data The data to frame
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @return {(Buffer|String)[]} The framed data
       * @public
       */
      static frame(data, options) {
        let mask;
        let merge = false;
        let offset = 2;
        let skipMasking = false;
        if (options.mask) {
          mask = options.maskBuffer || maskBuffer;
          if (options.generateMask) {
            options.generateMask(mask);
          } else {
            if (randomPoolPointer === RANDOM_POOL_SIZE) {
              if (randomPool === void 0) {
                randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
              }
              randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
              randomPoolPointer = 0;
            }
            mask[0] = randomPool[randomPoolPointer++];
            mask[1] = randomPool[randomPoolPointer++];
            mask[2] = randomPool[randomPoolPointer++];
            mask[3] = randomPool[randomPoolPointer++];
          }
          skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
          offset = 6;
        }
        let dataLength;
        if (typeof data === "string") {
          if ((!options.mask || skipMasking) && options[kByteLength] !== void 0) {
            dataLength = options[kByteLength];
          } else {
            data = Buffer.from(data);
            dataLength = data.length;
          }
        } else {
          dataLength = data.length;
          merge = options.mask && options.readOnly && !skipMasking;
        }
        let payloadLength = dataLength;
        if (dataLength >= 65536) {
          offset += 8;
          payloadLength = 127;
        } else if (dataLength > 125) {
          offset += 2;
          payloadLength = 126;
        }
        const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
        target[0] = options.fin ? options.opcode | 128 : options.opcode;
        if (options.rsv1) target[0] |= 64;
        target[1] = payloadLength;
        if (payloadLength === 126) {
          target.writeUInt16BE(dataLength, 2);
        } else if (payloadLength === 127) {
          target[2] = target[3] = 0;
          target.writeUIntBE(dataLength, 4, 6);
        }
        if (!options.mask) return [target, data];
        target[1] |= 128;
        target[offset - 4] = mask[0];
        target[offset - 3] = mask[1];
        target[offset - 2] = mask[2];
        target[offset - 1] = mask[3];
        if (skipMasking) return [target, data];
        if (merge) {
          applyMask(data, mask, target, offset, dataLength);
          return [target];
        }
        applyMask(data, mask, data, 0, dataLength);
        return [target, data];
      }
      /**
       * Sends a close message to the other peer.
       *
       * @param {Number} [code] The status code component of the body
       * @param {(String|Buffer)} [data] The message component of the body
       * @param {Boolean} [mask=false] Specifies whether or not to mask the message
       * @param {Function} [cb] Callback
       * @public
       */
      close(code, data, mask, cb) {
        let buf;
        if (code === void 0) {
          buf = EMPTY_BUFFER;
        } else if (typeof code !== "number" || !isValidStatusCode(code)) {
          throw new TypeError("First argument must be a valid error code number");
        } else if (data === void 0 || !data.length) {
          buf = Buffer.allocUnsafe(2);
          buf.writeUInt16BE(code, 0);
        } else {
          const length = Buffer.byteLength(data);
          if (length > 123) {
            throw new RangeError("The message must not be greater than 123 bytes");
          }
          buf = Buffer.allocUnsafe(2 + length);
          buf.writeUInt16BE(code, 0);
          if (typeof data === "string") {
            buf.write(data, 2);
          } else if (isUint8Array(data)) {
            buf.set(data, 2);
          } else {
            throw new TypeError("Second argument must be a string or a Uint8Array");
          }
        }
        const options = {
          [kByteLength]: buf.length,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 8,
          readOnly: false,
          rsv1: false
        };
        if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, buf, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(buf, options), cb);
        }
      }
      /**
       * Sends a ping message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      ping(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 9,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a pong message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      pong(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 10,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a data message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Object} options Options object
       * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
       *     or text
       * @param {Boolean} [options.compress=false] Specifies whether or not to
       *     compress `data`
       * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Function} [cb] Callback
       * @public
       */
      send(data, options, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        let opcode = options.binary ? 2 : 1;
        let rsv1 = options.compress;
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (this._firstFragment) {
          this._firstFragment = false;
          if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
            rsv1 = byteLength >= perMessageDeflate._threshold;
          }
          this._compress = rsv1;
        } else {
          rsv1 = false;
          opcode = 0;
        }
        if (options.fin) this._firstFragment = true;
        const opts = {
          [kByteLength]: byteLength,
          fin: options.fin,
          generateMask: this._generateMask,
          mask: options.mask,
          maskBuffer: this._maskBuffer,
          opcode,
          readOnly,
          rsv1
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, this._compress, opts, cb]);
          } else {
            this.getBlobData(data, this._compress, opts, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, this._compress, opts, cb]);
        } else {
          this.dispatch(data, this._compress, opts, cb);
        }
      }
      /**
       * Gets the contents of a blob as binary data.
       *
       * @param {Blob} blob The blob
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     the data
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      getBlobData(blob, compress, options, cb) {
        this._bufferedBytes += options[kByteLength];
        this._state = GET_BLOB_DATA;
        blob.arrayBuffer().then((arrayBuffer) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while the blob was being read"
            );
            process.nextTick(callCallbacks, this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          const data = toBuffer(arrayBuffer);
          if (!compress) {
            this._state = DEFAULT;
            this.sendFrame(_Sender.frame(data, options), cb);
            this.dequeue();
          } else {
            this.dispatch(data, compress, options, cb);
          }
        }).catch((err) => {
          process.nextTick(onError, this, err, cb);
        });
      }
      /**
       * Dispatches a message.
       *
       * @param {(Buffer|String)} data The message to send
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     `data`
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      dispatch(data, compress, options, cb) {
        if (!compress) {
          this.sendFrame(_Sender.frame(data, options), cb);
          return;
        }
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        this._bufferedBytes += options[kByteLength];
        this._state = DEFLATING;
        perMessageDeflate.compress(data, options.fin, (_, buf) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while data was being compressed"
            );
            callCallbacks(this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          this._state = DEFAULT;
          options.readOnly = false;
          this.sendFrame(_Sender.frame(buf, options), cb);
          this.dequeue();
        });
      }
      /**
       * Executes queued send operations.
       *
       * @private
       */
      dequeue() {
        while (this._state === DEFAULT && this._queue.length) {
          const params = this._queue.shift();
          this._bufferedBytes -= params[3][kByteLength];
          Reflect.apply(params[0], this, params.slice(1));
        }
      }
      /**
       * Enqueues a send operation.
       *
       * @param {Array} params Send operation parameters.
       * @private
       */
      enqueue(params) {
        this._bufferedBytes += params[3][kByteLength];
        this._queue.push(params);
      }
      /**
       * Sends a frame.
       *
       * @param {(Buffer | String)[]} list The frame to send
       * @param {Function} [cb] Callback
       * @private
       */
      sendFrame(list, cb) {
        if (list.length === 2) {
          this._socket.cork();
          this._socket.write(list[0]);
          this._socket.write(list[1], cb);
          this._socket.uncork();
        } else {
          this._socket.write(list[0], cb);
        }
      }
    };
    module2.exports = Sender2;
    function callCallbacks(sender, err, cb) {
      if (typeof cb === "function") cb(err);
      for (let i = 0; i < sender._queue.length; i++) {
        const params = sender._queue[i];
        const callback = params[params.length - 1];
        if (typeof callback === "function") callback(err);
      }
    }
    function onError(sender, err, cb) {
      callCallbacks(sender, err, cb);
      sender.onerror(err);
    }
  }
});

// node_modules/ws/lib/event-target.js
var require_event_target = __commonJS({
  "node_modules/ws/lib/event-target.js"(exports2, module2) {
    "use strict";
    var { kForOnEventAttribute, kListener } = require_constants();
    var kCode = /* @__PURE__ */ Symbol("kCode");
    var kData = /* @__PURE__ */ Symbol("kData");
    var kError = /* @__PURE__ */ Symbol("kError");
    var kMessage = /* @__PURE__ */ Symbol("kMessage");
    var kReason = /* @__PURE__ */ Symbol("kReason");
    var kTarget = /* @__PURE__ */ Symbol("kTarget");
    var kType = /* @__PURE__ */ Symbol("kType");
    var kWasClean = /* @__PURE__ */ Symbol("kWasClean");
    var Event = class {
      /**
       * Create a new `Event`.
       *
       * @param {String} type The name of the event
       * @throws {TypeError} If the `type` argument is not specified
       */
      constructor(type) {
        this[kTarget] = null;
        this[kType] = type;
      }
      /**
       * @type {*}
       */
      get target() {
        return this[kTarget];
      }
      /**
       * @type {String}
       */
      get type() {
        return this[kType];
      }
    };
    Object.defineProperty(Event.prototype, "target", { enumerable: true });
    Object.defineProperty(Event.prototype, "type", { enumerable: true });
    var CloseEvent = class extends Event {
      /**
       * Create a new `CloseEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {Number} [options.code=0] The status code explaining why the
       *     connection was closed
       * @param {String} [options.reason=''] A human-readable string explaining why
       *     the connection was closed
       * @param {Boolean} [options.wasClean=false] Indicates whether or not the
       *     connection was cleanly closed
       */
      constructor(type, options = {}) {
        super(type);
        this[kCode] = options.code === void 0 ? 0 : options.code;
        this[kReason] = options.reason === void 0 ? "" : options.reason;
        this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
      }
      /**
       * @type {Number}
       */
      get code() {
        return this[kCode];
      }
      /**
       * @type {String}
       */
      get reason() {
        return this[kReason];
      }
      /**
       * @type {Boolean}
       */
      get wasClean() {
        return this[kWasClean];
      }
    };
    Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
    var ErrorEvent = class extends Event {
      /**
       * Create a new `ErrorEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.error=null] The error that generated this event
       * @param {String} [options.message=''] The error message
       */
      constructor(type, options = {}) {
        super(type);
        this[kError] = options.error === void 0 ? null : options.error;
        this[kMessage] = options.message === void 0 ? "" : options.message;
      }
      /**
       * @type {*}
       */
      get error() {
        return this[kError];
      }
      /**
       * @type {String}
       */
      get message() {
        return this[kMessage];
      }
    };
    Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
    Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
    var MessageEvent = class extends Event {
      /**
       * Create a new `MessageEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.data=null] The message content
       */
      constructor(type, options = {}) {
        super(type);
        this[kData] = options.data === void 0 ? null : options.data;
      }
      /**
       * @type {*}
       */
      get data() {
        return this[kData];
      }
    };
    Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
    var EventTarget = {
      /**
       * Register an event listener.
       *
       * @param {String} type A string representing the event type to listen for
       * @param {(Function|Object)} handler The listener to add
       * @param {Object} [options] An options object specifies characteristics about
       *     the event listener
       * @param {Boolean} [options.once=false] A `Boolean` indicating that the
       *     listener should be invoked at most once after being added. If `true`,
       *     the listener would be automatically removed when invoked.
       * @public
       */
      addEventListener(type, handler, options = {}) {
        for (const listener of this.listeners(type)) {
          if (!options[kForOnEventAttribute] && listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            return;
          }
        }
        let wrapper;
        if (type === "message") {
          wrapper = function onMessage(data, isBinary) {
            const event = new MessageEvent("message", {
              data: isBinary ? data : data.toString()
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "close") {
          wrapper = function onClose(code, message) {
            const event = new CloseEvent("close", {
              code,
              reason: message.toString(),
              wasClean: this._closeFrameReceived && this._closeFrameSent
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "error") {
          wrapper = function onError(error) {
            const event = new ErrorEvent("error", {
              error,
              message: error.message
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "open") {
          wrapper = function onOpen() {
            const event = new Event("open");
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else {
          return;
        }
        wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
        wrapper[kListener] = handler;
        if (options.once) {
          this.once(type, wrapper);
        } else {
          this.on(type, wrapper);
        }
      },
      /**
       * Remove an event listener.
       *
       * @param {String} type A string representing the event type to remove
       * @param {(Function|Object)} handler The listener to remove
       * @public
       */
      removeEventListener(type, handler) {
        for (const listener of this.listeners(type)) {
          if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            this.removeListener(type, listener);
            break;
          }
        }
      }
    };
    module2.exports = {
      CloseEvent,
      ErrorEvent,
      Event,
      EventTarget,
      MessageEvent
    };
    function callListener(listener, thisArg, event) {
      if (typeof listener === "object" && listener.handleEvent) {
        listener.handleEvent.call(listener, event);
      } else {
        listener.call(thisArg, event);
      }
    }
  }
});

// node_modules/ws/lib/extension.js
var require_extension = __commonJS({
  "node_modules/ws/lib/extension.js"(exports2, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function push(dest, name, elem) {
      if (dest[name] === void 0) dest[name] = [elem];
      else dest[name].push(elem);
    }
    function parse(header) {
      const offers = /* @__PURE__ */ Object.create(null);
      let params = /* @__PURE__ */ Object.create(null);
      let mustUnescape = false;
      let isEscaping = false;
      let inQuotes = false;
      let extensionName;
      let paramName;
      let start = -1;
      let code = -1;
      let end = -1;
      let i = 0;
      for (; i < header.length; i++) {
        code = header.charCodeAt(i);
        if (extensionName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (i !== 0 && (code === 32 || code === 9)) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            const name = header.slice(start, end);
            if (code === 44) {
              push(offers, name, params);
              params = /* @__PURE__ */ Object.create(null);
            } else {
              extensionName = name;
            }
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else if (paramName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (code === 32 || code === 9) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            push(params, header.slice(start, end), true);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            start = end = -1;
          } else if (code === 61 && start !== -1 && end === -1) {
            paramName = header.slice(start, i);
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else {
          if (isEscaping) {
            if (tokenChars[code] !== 1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (start === -1) start = i;
            else if (!mustUnescape) mustUnescape = true;
            isEscaping = false;
          } else if (inQuotes) {
            if (tokenChars[code] === 1) {
              if (start === -1) start = i;
            } else if (code === 34 && start !== -1) {
              inQuotes = false;
              end = i;
            } else if (code === 92) {
              isEscaping = true;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          } else if (code === 34 && header.charCodeAt(i - 1) === 61) {
            inQuotes = true;
          } else if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (start !== -1 && (code === 32 || code === 9)) {
            if (end === -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            let value = header.slice(start, end);
            if (mustUnescape) {
              value = value.replace(/\\/g, "");
              mustUnescape = false;
            }
            push(params, paramName, value);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            paramName = void 0;
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        }
      }
      if (start === -1 || inQuotes || code === 32 || code === 9) {
        throw new SyntaxError("Unexpected end of input");
      }
      if (end === -1) end = i;
      const token = header.slice(start, end);
      if (extensionName === void 0) {
        push(offers, token, params);
      } else {
        if (paramName === void 0) {
          push(params, token, true);
        } else if (mustUnescape) {
          push(params, paramName, token.replace(/\\/g, ""));
        } else {
          push(params, paramName, token);
        }
        push(offers, extensionName, params);
      }
      return offers;
    }
    function format(extensions) {
      return Object.keys(extensions).map((extension2) => {
        let configurations = extensions[extension2];
        if (!Array.isArray(configurations)) configurations = [configurations];
        return configurations.map((params) => {
          return [extension2].concat(
            Object.keys(params).map((k) => {
              let values = params[k];
              if (!Array.isArray(values)) values = [values];
              return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
            })
          ).join("; ");
        }).join(", ");
      }).join(", ");
    }
    module2.exports = { format, parse };
  }
});

// node_modules/ws/lib/websocket.js
var require_websocket = __commonJS({
  "node_modules/ws/lib/websocket.js"(exports2, module2) {
    "use strict";
    var EventEmitter2 = require("events");
    var https2 = require("https");
    var http3 = require("http");
    var net = require("net");
    var tls = require("tls");
    var { randomBytes: randomBytes2, createHash } = require("crypto");
    var { Duplex, Readable } = require("stream");
    var { URL } = require("url");
    var PerMessageDeflate2 = require_permessage_deflate();
    var Receiver2 = require_receiver();
    var Sender2 = require_sender();
    var { isBlob } = require_validation();
    var {
      BINARY_TYPES,
      CLOSE_TIMEOUT,
      EMPTY_BUFFER,
      GUID,
      kForOnEventAttribute,
      kListener,
      kStatusCode,
      kWebSocket,
      NOOP
    } = require_constants();
    var {
      EventTarget: { addEventListener, removeEventListener }
    } = require_event_target();
    var { format, parse } = require_extension();
    var { toBuffer } = require_buffer_util();
    var kAborted = /* @__PURE__ */ Symbol("kAborted");
    var protocolVersions = [8, 13];
    var readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
    var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
    var WebSocket2 = class _WebSocket extends EventEmitter2 {
      /**
       * Create a new `WebSocket`.
       *
       * @param {(String|URL)} address The URL to which to connect
       * @param {(String|String[])} [protocols] The subprotocols
       * @param {Object} [options] Connection options
       */
      constructor(address, protocols, options) {
        super();
        this._binaryType = BINARY_TYPES[0];
        this._closeCode = 1006;
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = EMPTY_BUFFER;
        this._closeTimer = null;
        this._errorEmitted = false;
        this._extensions = {};
        this._paused = false;
        this._protocol = "";
        this._readyState = _WebSocket.CONNECTING;
        this._receiver = null;
        this._sender = null;
        this._socket = null;
        if (address !== null) {
          this._bufferedAmount = 0;
          this._isServer = false;
          this._redirects = 0;
          if (protocols === void 0) {
            protocols = [];
          } else if (!Array.isArray(protocols)) {
            if (typeof protocols === "object" && protocols !== null) {
              options = protocols;
              protocols = [];
            } else {
              protocols = [protocols];
            }
          }
          initAsClient(this, address, protocols, options);
        } else {
          this._autoPong = options.autoPong;
          this._closeTimeout = options.closeTimeout;
          this._isServer = true;
        }
      }
      /**
       * For historical reasons, the custom "nodebuffer" type is used by the default
       * instead of "blob".
       *
       * @type {String}
       */
      get binaryType() {
        return this._binaryType;
      }
      set binaryType(type) {
        if (!BINARY_TYPES.includes(type)) return;
        this._binaryType = type;
        if (this._receiver) this._receiver._binaryType = type;
      }
      /**
       * @type {Number}
       */
      get bufferedAmount() {
        if (!this._socket) return this._bufferedAmount;
        return this._socket._writableState.length + this._sender._bufferedBytes;
      }
      /**
       * @type {String}
       */
      get extensions() {
        return Object.keys(this._extensions).join();
      }
      /**
       * @type {Boolean}
       */
      get isPaused() {
        return this._paused;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onclose() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onerror() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onopen() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onmessage() {
        return null;
      }
      /**
       * @type {String}
       */
      get protocol() {
        return this._protocol;
      }
      /**
       * @type {Number}
       */
      get readyState() {
        return this._readyState;
      }
      /**
       * @type {String}
       */
      get url() {
        return this._url;
      }
      /**
       * Set up the socket and the internal resources.
       *
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Object} options Options object
       * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message size
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @private
       */
      setSocket(socket, head, options) {
        const receiver = new Receiver2({
          allowSynchronousEvents: options.allowSynchronousEvents,
          binaryType: this.binaryType,
          extensions: this._extensions,
          isServer: this._isServer,
          maxBufferedChunks: options.maxBufferedChunks,
          maxFragments: options.maxFragments,
          maxPayload: options.maxPayload,
          skipUTF8Validation: options.skipUTF8Validation
        });
        const sender = new Sender2(socket, this._extensions, options.generateMask);
        this._receiver = receiver;
        this._sender = sender;
        this._socket = socket;
        receiver[kWebSocket] = this;
        sender[kWebSocket] = this;
        socket[kWebSocket] = this;
        receiver.on("conclude", receiverOnConclude);
        receiver.on("drain", receiverOnDrain);
        receiver.on("error", receiverOnError);
        receiver.on("message", receiverOnMessage);
        receiver.on("ping", receiverOnPing);
        receiver.on("pong", receiverOnPong);
        sender.onerror = senderOnError;
        if (socket.setTimeout) socket.setTimeout(0);
        if (socket.setNoDelay) socket.setNoDelay();
        if (head.length > 0) socket.unshift(head);
        socket.on("close", socketOnClose);
        socket.on("data", socketOnData);
        socket.on("end", socketOnEnd);
        socket.on("error", socketOnError);
        this._readyState = _WebSocket.OPEN;
        this.emit("open");
      }
      /**
       * Emit the `'close'` event.
       *
       * @private
       */
      emitClose() {
        if (!this._socket) {
          this._readyState = _WebSocket.CLOSED;
          this.emit("close", this._closeCode, this._closeMessage);
          return;
        }
        if (this._extensions[PerMessageDeflate2.extensionName]) {
          this._extensions[PerMessageDeflate2.extensionName].cleanup();
        }
        this._receiver.removeAllListeners();
        this._readyState = _WebSocket.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
      }
      /**
       * Start a closing handshake.
       *
       *          +----------+   +-----------+   +----------+
       *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
       *    |     +----------+   +-----------+   +----------+     |
       *          +----------+   +-----------+         |
       * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
       *          +----------+   +-----------+   |
       *    |           |                        |   +---+        |
       *                +------------------------+-->|fin| - - - -
       *    |         +---+                      |   +---+
       *     - - - - -|fin|<---------------------+
       *              +---+
       *
       * @param {Number} [code] Status code explaining why the connection is closing
       * @param {(String|Buffer)} [data] The reason why the connection is
       *     closing
       * @public
       */
      close(code, data) {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this.readyState === _WebSocket.CLOSING) {
          if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
            this._socket.end();
          }
          return;
        }
        this._readyState = _WebSocket.CLOSING;
        this._sender.close(code, data, !this._isServer, (err) => {
          if (err) return;
          this._closeFrameSent = true;
          if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
            this._socket.end();
          }
        });
        setCloseTimer(this);
      }
      /**
       * Pause the socket.
       *
       * @public
       */
      pause() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = true;
        this._socket.pause();
      }
      /**
       * Send a ping.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the ping is sent
       * @public
       */
      ping(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.ping(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Send a pong.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the pong is sent
       * @public
       */
      pong(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.pong(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Resume the socket.
       *
       * @public
       */
      resume() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = false;
        if (!this._receiver._writableState.needDrain) this._socket.resume();
      }
      /**
       * Send a data message.
       *
       * @param {*} data The message to send
       * @param {Object} [options] Options object
       * @param {Boolean} [options.binary] Specifies whether `data` is binary or
       *     text
       * @param {Boolean} [options.compress] Specifies whether or not to compress
       *     `data`
       * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when data is written out
       * @public
       */
      send(data, options, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof options === "function") {
          cb = options;
          options = {};
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        const opts = {
          binary: typeof data !== "string",
          mask: !this._isServer,
          compress: true,
          fin: true,
          ...options
        };
        if (!this._extensions[PerMessageDeflate2.extensionName]) {
          opts.compress = false;
        }
        this._sender.send(data || EMPTY_BUFFER, opts, cb);
      }
      /**
       * Forcibly close the connection.
       *
       * @public
       */
      terminate() {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this._socket) {
          this._readyState = _WebSocket.CLOSING;
          this._socket.destroy();
        }
      }
    };
    Object.defineProperty(WebSocket2, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2.prototype, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2.prototype, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    [
      "binaryType",
      "bufferedAmount",
      "extensions",
      "isPaused",
      "protocol",
      "readyState",
      "url"
    ].forEach((property) => {
      Object.defineProperty(WebSocket2.prototype, property, { enumerable: true });
    });
    ["open", "error", "close", "message"].forEach((method) => {
      Object.defineProperty(WebSocket2.prototype, `on${method}`, {
        enumerable: true,
        get() {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) return listener[kListener];
          }
          return null;
        },
        set(handler) {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) {
              this.removeListener(method, listener);
              break;
            }
          }
          if (typeof handler !== "function") return;
          this.addEventListener(method, handler, {
            [kForOnEventAttribute]: true
          });
        }
      });
    });
    WebSocket2.prototype.addEventListener = addEventListener;
    WebSocket2.prototype.removeEventListener = removeEventListener;
    module2.exports = WebSocket2;
    function initAsClient(websocket, address, protocols, options) {
      const opts = {
        allowSynchronousEvents: true,
        autoPong: true,
        closeTimeout: CLOSE_TIMEOUT,
        protocolVersion: protocolVersions[1],
        maxBufferedChunks: 256 * 1024,
        maxFragments: 16 * 1024,
        maxPayload: 100 * 1024 * 1024,
        skipUTF8Validation: false,
        perMessageDeflate: true,
        followRedirects: false,
        maxRedirects: 10,
        ...options,
        socketPath: void 0,
        hostname: void 0,
        protocol: void 0,
        timeout: void 0,
        method: "GET",
        host: void 0,
        path: void 0,
        port: void 0
      };
      websocket._autoPong = opts.autoPong;
      websocket._closeTimeout = opts.closeTimeout;
      if (!protocolVersions.includes(opts.protocolVersion)) {
        throw new RangeError(
          `Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`
        );
      }
      let parsedUrl;
      if (address instanceof URL) {
        parsedUrl = address;
      } else {
        try {
          parsedUrl = new URL(address);
        } catch {
          throw new SyntaxError(`Invalid URL: ${address}`);
        }
      }
      if (parsedUrl.protocol === "http:") {
        parsedUrl.protocol = "ws:";
      } else if (parsedUrl.protocol === "https:") {
        parsedUrl.protocol = "wss:";
      }
      websocket._url = parsedUrl.href;
      const isSecure = parsedUrl.protocol === "wss:";
      const isIpcUrl = parsedUrl.protocol === "ws+unix:";
      let invalidUrlMessage;
      if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) {
        invalidUrlMessage = `The URL's protocol must be one of "ws:", "wss:", "http:", "https:", or "ws+unix:"`;
      } else if (isIpcUrl && !parsedUrl.pathname) {
        invalidUrlMessage = "The URL's pathname is empty";
      } else if (parsedUrl.hash) {
        invalidUrlMessage = "The URL contains a fragment identifier";
      }
      if (invalidUrlMessage) {
        const err = new SyntaxError(invalidUrlMessage);
        if (websocket._redirects === 0) {
          throw err;
        } else {
          emitErrorAndClose(websocket, err);
          return;
        }
      }
      const defaultPort = isSecure ? 443 : 80;
      const key = randomBytes2(16).toString("base64");
      const request2 = isSecure ? https2.request : http3.request;
      const protocolSet = /* @__PURE__ */ new Set();
      let perMessageDeflate;
      opts.createConnection = opts.createConnection || (isSecure ? tlsConnect : netConnect);
      opts.defaultPort = opts.defaultPort || defaultPort;
      opts.port = parsedUrl.port || defaultPort;
      opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
      opts.headers = {
        ...opts.headers,
        "Sec-WebSocket-Version": opts.protocolVersion,
        "Sec-WebSocket-Key": key,
        Connection: "Upgrade",
        Upgrade: "websocket"
      };
      opts.path = parsedUrl.pathname + parsedUrl.search;
      opts.timeout = opts.handshakeTimeout;
      if (opts.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate2({
          ...opts.perMessageDeflate,
          isServer: false,
          maxPayload: opts.maxPayload
        });
        opts.headers["Sec-WebSocket-Extensions"] = format({
          [PerMessageDeflate2.extensionName]: perMessageDeflate.offer()
        });
      }
      if (protocols.length) {
        for (const protocol of protocols) {
          if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) {
            throw new SyntaxError(
              "An invalid or duplicated subprotocol was specified"
            );
          }
          protocolSet.add(protocol);
        }
        opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
      }
      if (opts.origin) {
        if (opts.protocolVersion < 13) {
          opts.headers["Sec-WebSocket-Origin"] = opts.origin;
        } else {
          opts.headers.Origin = opts.origin;
        }
      }
      if (parsedUrl.username || parsedUrl.password) {
        opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
      }
      if (isIpcUrl) {
        const parts = opts.path.split(":");
        opts.socketPath = parts[0];
        opts.path = parts[1];
      }
      let req;
      if (opts.followRedirects) {
        if (websocket._redirects === 0) {
          websocket._originalIpc = isIpcUrl;
          websocket._originalSecure = isSecure;
          websocket._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
          const headers = options && options.headers;
          options = { ...options, headers: {} };
          if (headers) {
            for (const [key2, value] of Object.entries(headers)) {
              options.headers[key2.toLowerCase()] = value;
            }
          }
        } else if (websocket.listenerCount("redirect") === 0) {
          const isSameHost = isIpcUrl ? websocket._originalIpc ? opts.socketPath === websocket._originalHostOrSocketPath : false : websocket._originalIpc ? false : parsedUrl.host === websocket._originalHostOrSocketPath;
          if (!isSameHost || websocket._originalSecure && !isSecure) {
            delete opts.headers.authorization;
            delete opts.headers.cookie;
            if (!isSameHost) delete opts.headers.host;
            opts.auth = void 0;
          }
        }
        if (opts.auth && !options.headers.authorization) {
          options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
        }
        req = websocket._req = request2(opts);
        if (websocket._redirects) {
          websocket.emit("redirect", websocket.url, req);
        }
      } else {
        req = websocket._req = request2(opts);
      }
      if (opts.timeout) {
        req.on("timeout", () => {
          abortHandshake(websocket, req, "Opening handshake has timed out");
        });
      }
      req.on("error", (err) => {
        if (req === null || req[kAborted]) return;
        req = websocket._req = null;
        emitErrorAndClose(websocket, err);
      });
      req.on("response", (res) => {
        const location = res.headers.location;
        const statusCode = res.statusCode;
        if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
          if (++websocket._redirects > opts.maxRedirects) {
            abortHandshake(websocket, req, "Maximum redirects exceeded");
            return;
          }
          req.abort();
          let addr;
          try {
            addr = new URL(location, address);
          } catch (e) {
            const err = new SyntaxError(`Invalid URL: ${location}`);
            emitErrorAndClose(websocket, err);
            return;
          }
          initAsClient(websocket, addr, protocols, options);
        } else if (!websocket.emit("unexpected-response", req, res)) {
          abortHandshake(
            websocket,
            req,
            `Unexpected server response: ${res.statusCode}`
          );
        }
      });
      req.on("upgrade", (res, socket, head) => {
        websocket.emit("upgrade", res);
        if (websocket.readyState !== WebSocket2.CONNECTING) return;
        req = websocket._req = null;
        const upgrade = res.headers.upgrade;
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          abortHandshake(websocket, socket, "Invalid Upgrade header");
          return;
        }
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        if (res.headers["sec-websocket-accept"] !== digest) {
          abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
          return;
        }
        const serverProt = res.headers["sec-websocket-protocol"];
        let protError;
        if (serverProt !== void 0) {
          if (!protocolSet.size) {
            protError = "Server sent a subprotocol but none was requested";
          } else if (!protocolSet.has(serverProt)) {
            protError = "Server sent an invalid subprotocol";
          }
        } else if (protocolSet.size) {
          protError = "Server sent no subprotocol";
        }
        if (protError) {
          abortHandshake(websocket, socket, protError);
          return;
        }
        if (serverProt) websocket._protocol = serverProt;
        const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
        if (secWebSocketExtensions !== void 0) {
          if (!perMessageDeflate) {
            const message = "Server sent a Sec-WebSocket-Extensions header but no extension was requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          let extensions;
          try {
            extensions = parse(secWebSocketExtensions);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          const extensionNames = Object.keys(extensions);
          if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate2.extensionName) {
            const message = "Server indicated an extension that was not requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          try {
            perMessageDeflate.accept(extensions[PerMessageDeflate2.extensionName]);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          websocket._extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
        }
        websocket.setSocket(socket, head, {
          allowSynchronousEvents: opts.allowSynchronousEvents,
          generateMask: opts.generateMask,
          maxBufferedChunks: opts.maxBufferedChunks,
          maxFragments: opts.maxFragments,
          maxPayload: opts.maxPayload,
          skipUTF8Validation: opts.skipUTF8Validation
        });
      });
      if (opts.finishRequest) {
        opts.finishRequest(req, websocket);
      } else {
        req.end();
      }
    }
    function emitErrorAndClose(websocket, err) {
      websocket._readyState = WebSocket2.CLOSING;
      websocket._errorEmitted = true;
      websocket.emit("error", err);
      websocket.emitClose();
    }
    function netConnect(options) {
      options.path = options.socketPath;
      return net.connect(options);
    }
    function tlsConnect(options) {
      options.path = void 0;
      if (!options.servername && options.servername !== "") {
        options.servername = net.isIP(options.host) ? "" : options.host;
      }
      return tls.connect(options);
    }
    function abortHandshake(websocket, stream, message) {
      websocket._readyState = WebSocket2.CLOSING;
      const err = new Error(message);
      Error.captureStackTrace(err, abortHandshake);
      if (stream.setHeader) {
        stream[kAborted] = true;
        stream.abort();
        if (stream.socket && !stream.socket.destroyed) {
          stream.socket.destroy();
        }
        process.nextTick(emitErrorAndClose, websocket, err);
      } else {
        stream.destroy(err);
        stream.once("error", websocket.emit.bind(websocket, "error"));
        stream.once("close", websocket.emitClose.bind(websocket));
      }
    }
    function sendAfterClose(websocket, data, cb) {
      if (data) {
        const length = isBlob(data) ? data.size : toBuffer(data).length;
        if (websocket._socket) websocket._sender._bufferedBytes += length;
        else websocket._bufferedAmount += length;
      }
      if (cb) {
        const err = new Error(
          `WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`
        );
        process.nextTick(cb, err);
      }
    }
    function receiverOnConclude(code, reason) {
      const websocket = this[kWebSocket];
      websocket._closeFrameReceived = true;
      websocket._closeMessage = reason;
      websocket._closeCode = code;
      if (websocket._socket[kWebSocket] === void 0) return;
      websocket._socket.removeListener("data", socketOnData);
      process.nextTick(resume2, websocket._socket);
      if (code === 1005) websocket.close();
      else websocket.close(code, reason);
    }
    function receiverOnDrain() {
      const websocket = this[kWebSocket];
      if (!websocket.isPaused) websocket._socket.resume();
    }
    function receiverOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket._socket[kWebSocket] !== void 0) {
        websocket._socket.removeListener("data", socketOnData);
        process.nextTick(resume2, websocket._socket);
        websocket.close(err[kStatusCode]);
      }
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function receiverOnFinish() {
      this[kWebSocket].emitClose();
    }
    function receiverOnMessage(data, isBinary) {
      this[kWebSocket].emit("message", data, isBinary);
    }
    function receiverOnPing(data) {
      const websocket = this[kWebSocket];
      if (websocket._autoPong) websocket.pong(data, !this._isServer, NOOP);
      websocket.emit("ping", data);
    }
    function receiverOnPong(data) {
      this[kWebSocket].emit("pong", data);
    }
    function resume2(stream) {
      stream.resume();
    }
    function senderOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket.readyState === WebSocket2.CLOSED) return;
      if (websocket.readyState === WebSocket2.OPEN) {
        websocket._readyState = WebSocket2.CLOSING;
        setCloseTimer(websocket);
      }
      this._socket.end();
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function setCloseTimer(websocket) {
      websocket._closeTimer = setTimeout(
        websocket._socket.destroy.bind(websocket._socket),
        websocket._closeTimeout
      );
    }
    function socketOnClose() {
      const websocket = this[kWebSocket];
      this.removeListener("close", socketOnClose);
      this.removeListener("data", socketOnData);
      this.removeListener("end", socketOnEnd);
      websocket._readyState = WebSocket2.CLOSING;
      if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && this._readableState.length !== 0) {
        const chunk = this.read(this._readableState.length);
        websocket._receiver.write(chunk);
      }
      websocket._receiver.end();
      this[kWebSocket] = void 0;
      clearTimeout(websocket._closeTimer);
      if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) {
        websocket.emitClose();
      } else {
        websocket._receiver.on("error", receiverOnFinish);
        websocket._receiver.on("finish", receiverOnFinish);
      }
    }
    function socketOnData(chunk) {
      if (!this[kWebSocket]._receiver.write(chunk)) {
        this.pause();
      }
    }
    function socketOnEnd() {
      const websocket = this[kWebSocket];
      websocket._readyState = WebSocket2.CLOSING;
      websocket._receiver.end();
      this.end();
    }
    function socketOnError() {
      const websocket = this[kWebSocket];
      this.removeListener("error", socketOnError);
      this.on("error", NOOP);
      if (websocket) {
        websocket._readyState = WebSocket2.CLOSING;
        this.destroy();
      }
    }
  }
});

// node_modules/ws/lib/stream.js
var require_stream = __commonJS({
  "node_modules/ws/lib/stream.js"(exports2, module2) {
    "use strict";
    var WebSocket2 = require_websocket();
    var { Duplex } = require("stream");
    function emitClose(stream) {
      stream.emit("close");
    }
    function duplexOnEnd() {
      if (!this.destroyed && this._writableState.finished) {
        this.destroy();
      }
    }
    function duplexOnError(err) {
      this.removeListener("error", duplexOnError);
      this.destroy();
      if (this.listenerCount("error") === 0) {
        this.emit("error", err);
      }
    }
    function createWebSocketStream2(ws, options) {
      let terminateOnDestroy = true;
      const duplex = new Duplex({
        ...options,
        autoDestroy: false,
        emitClose: false,
        objectMode: false,
        writableObjectMode: false
      });
      ws.on("message", function message(msg, isBinary) {
        const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
        if (!duplex.push(data)) ws.pause();
      });
      ws.once("error", function error(err) {
        if (duplex.destroyed) return;
        terminateOnDestroy = false;
        duplex.destroy(err);
      });
      ws.once("close", function close() {
        if (duplex.destroyed) return;
        duplex.push(null);
      });
      duplex._destroy = function(err, callback) {
        if (ws.readyState === ws.CLOSED) {
          callback(err);
          process.nextTick(emitClose, duplex);
          return;
        }
        let called = false;
        ws.once("error", function error(err2) {
          called = true;
          callback(err2);
        });
        ws.once("close", function close() {
          if (!called) callback(err);
          process.nextTick(emitClose, duplex);
        });
        if (terminateOnDestroy) ws.terminate();
      };
      duplex._final = function(callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._final(callback);
          });
          return;
        }
        if (ws._socket === null) return;
        if (ws._socket._writableState.finished) {
          callback();
          if (duplex._readableState.endEmitted) duplex.destroy();
        } else {
          ws._socket.once("finish", function finish() {
            callback();
          });
          ws.close();
        }
      };
      duplex._read = function() {
        if (ws.isPaused) ws.resume();
      };
      duplex._write = function(chunk, encoding, callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._write(chunk, encoding, callback);
          });
          return;
        }
        ws.send(chunk, callback);
      };
      duplex.on("end", duplexOnEnd);
      duplex.on("error", duplexOnError);
      return duplex;
    }
    module2.exports = createWebSocketStream2;
  }
});

// node_modules/ws/lib/subprotocol.js
var require_subprotocol = __commonJS({
  "node_modules/ws/lib/subprotocol.js"(exports2, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function parse(header) {
      const protocols = /* @__PURE__ */ new Set();
      let start = -1;
      let end = -1;
      let i = 0;
      for (i; i < header.length; i++) {
        const code = header.charCodeAt(i);
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (i !== 0 && (code === 32 || code === 9)) {
          if (end === -1 && start !== -1) end = i;
        } else if (code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1) end = i;
          const protocol2 = header.slice(start, end);
          if (protocols.has(protocol2)) {
            throw new SyntaxError(`The "${protocol2}" subprotocol is duplicated`);
          }
          protocols.add(protocol2);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
      if (start === -1 || end !== -1) {
        throw new SyntaxError("Unexpected end of input");
      }
      const protocol = header.slice(start, i);
      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }
      protocols.add(protocol);
      return protocols;
    }
    module2.exports = { parse };
  }
});

// node_modules/ws/lib/websocket-server.js
var require_websocket_server = __commonJS({
  "node_modules/ws/lib/websocket-server.js"(exports2, module2) {
    "use strict";
    var EventEmitter2 = require("events");
    var http3 = require("http");
    var { Duplex } = require("stream");
    var { createHash } = require("crypto");
    var extension2 = require_extension();
    var PerMessageDeflate2 = require_permessage_deflate();
    var subprotocol2 = require_subprotocol();
    var WebSocket2 = require_websocket();
    var { CLOSE_TIMEOUT, GUID, kWebSocket } = require_constants();
    var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
    var RUNNING = 0;
    var CLOSING = 1;
    var CLOSED = 2;
    var WebSocketServer2 = class extends EventEmitter2 {
      /**
       * Create a `WebSocketServer` instance.
       *
       * @param {Object} options Configuration options
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Boolean} [options.autoPong=true] Specifies whether or not to
       *     automatically send a pong in response to a ping
       * @param {Number} [options.backlog=511] The maximum length of the queue of
       *     pending connections
       * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
       *     track clients
       * @param {Number} [options.closeTimeout=30000] Duration in milliseconds to
       *     wait for the closing handshake to finish after `websocket.close()` is
       *     called
       * @param {Function} [options.handleProtocols] A hook to handle protocols
       * @param {String} [options.host] The hostname where to bind the server
       * @param {Number} [options.maxBufferedChunks=262144] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=16384] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=104857600] The maximum allowed message
       *     size
       * @param {Boolean} [options.noServer=false] Enable no server mode
       * @param {String} [options.path] Accept only connections matching this path
       * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
       *     permessage-deflate
       * @param {Number} [options.port] The port where to bind the server
       * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
       *     server to use
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @param {Function} [options.verifyClient] A hook to reject connections
       * @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
       *     class to use. It must be the `WebSocket` class or class that extends it
       * @param {Function} [callback] A listener for the `listening` event
       */
      constructor(options, callback) {
        super();
        options = {
          allowSynchronousEvents: true,
          autoPong: true,
          maxBufferedChunks: 256 * 1024,
          maxFragments: 16 * 1024,
          maxPayload: 100 * 1024 * 1024,
          skipUTF8Validation: false,
          perMessageDeflate: false,
          handleProtocols: null,
          clientTracking: true,
          closeTimeout: CLOSE_TIMEOUT,
          verifyClient: null,
          noServer: false,
          backlog: null,
          // use default (511 as implemented in net.js)
          server: null,
          host: null,
          path: null,
          port: null,
          WebSocket: WebSocket2,
          ...options
        };
        if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) {
          throw new TypeError(
            'One and only one of the "port", "server", or "noServer" options must be specified'
          );
        }
        if (options.port != null) {
          this._server = http3.createServer((req, res) => {
            const body = http3.STATUS_CODES[426];
            res.writeHead(426, {
              "Content-Length": body.length,
              "Content-Type": "text/plain"
            });
            res.end(body);
          });
          this._server.listen(
            options.port,
            options.host,
            options.backlog,
            callback
          );
        } else if (options.server) {
          this._server = options.server;
        }
        if (this._server) {
          const emitConnection = this.emit.bind(this, "connection");
          this._removeListeners = addListeners(this._server, {
            listening: this.emit.bind(this, "listening"),
            error: this.emit.bind(this, "error"),
            upgrade: (req, socket, head) => {
              this.handleUpgrade(req, socket, head, emitConnection);
            }
          });
        }
        if (options.perMessageDeflate === true) options.perMessageDeflate = {};
        if (options.clientTracking) {
          this.clients = /* @__PURE__ */ new Set();
          this._shouldEmitClose = false;
        }
        this.options = options;
        this._state = RUNNING;
      }
      /**
       * Returns the bound address, the address family name, and port of the server
       * as reported by the operating system if listening on an IP socket.
       * If the server is listening on a pipe or UNIX domain socket, the name is
       * returned as a string.
       *
       * @return {(Object|String|null)} The address of the server
       * @public
       */
      address() {
        if (this.options.noServer) {
          throw new Error('The server is operating in "noServer" mode');
        }
        if (!this._server) return null;
        return this._server.address();
      }
      /**
       * Stop the server from accepting new connections and emit the `'close'` event
       * when all existing connections are closed.
       *
       * @param {Function} [cb] A one-time listener for the `'close'` event
       * @public
       */
      close(cb) {
        if (this._state === CLOSED) {
          if (cb) {
            this.once("close", () => {
              cb(new Error("The server is not running"));
            });
          }
          process.nextTick(emitClose, this);
          return;
        }
        if (cb) this.once("close", cb);
        if (this._state === CLOSING) return;
        this._state = CLOSING;
        if (this.options.noServer || this.options.server) {
          if (this._server) {
            this._removeListeners();
            this._removeListeners = this._server = null;
          }
          if (this.clients) {
            if (!this.clients.size) {
              process.nextTick(emitClose, this);
            } else {
              this._shouldEmitClose = true;
            }
          } else {
            process.nextTick(emitClose, this);
          }
        } else {
          const server2 = this._server;
          this._removeListeners();
          this._removeListeners = this._server = null;
          server2.close(() => {
            emitClose(this);
          });
        }
      }
      /**
       * See if a given request should be handled by this server instance.
       *
       * @param {http.IncomingMessage} req Request object to inspect
       * @return {Boolean} `true` if the request is valid, else `false`
       * @public
       */
      shouldHandle(req) {
        if (this.options.path) {
          const index = req.url.indexOf("?");
          const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
          if (pathname !== this.options.path) return false;
        }
        return true;
      }
      /**
       * Handle a HTTP Upgrade request.
       *
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @public
       */
      handleUpgrade(req, socket, head, cb) {
        socket.on("error", socketOnError);
        const key = req.headers["sec-websocket-key"];
        const upgrade = req.headers.upgrade;
        const version = +req.headers["sec-websocket-version"];
        if (req.method !== "GET") {
          const message = "Invalid HTTP method";
          abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
          return;
        }
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          const message = "Invalid Upgrade header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (key === void 0 || !keyRegex.test(key)) {
          const message = "Missing or invalid Sec-WebSocket-Key header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (version !== 13 && version !== 8) {
          const message = "Missing or invalid Sec-WebSocket-Version header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message, {
            "Sec-WebSocket-Version": "13, 8"
          });
          return;
        }
        if (!this.shouldHandle(req)) {
          abortHandshake(socket, 400);
          return;
        }
        const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
        let protocols = /* @__PURE__ */ new Set();
        if (secWebSocketProtocol !== void 0) {
          try {
            protocols = subprotocol2.parse(secWebSocketProtocol);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Protocol header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
        const extensions = {};
        if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
          const perMessageDeflate = new PerMessageDeflate2({
            ...this.options.perMessageDeflate,
            isServer: true,
            maxPayload: this.options.maxPayload
          });
          try {
            const offers = extension2.parse(secWebSocketExtensions);
            if (offers[PerMessageDeflate2.extensionName]) {
              perMessageDeflate.accept(offers[PerMessageDeflate2.extensionName]);
              extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
            }
          } catch (err) {
            const message = "Invalid or unacceptable Sec-WebSocket-Extensions header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        if (this.options.verifyClient) {
          const info = {
            origin: req.headers[`${version === 8 ? "sec-websocket-origin" : "origin"}`],
            secure: !!(req.socket.authorized || req.socket.encrypted),
            req
          };
          if (this.options.verifyClient.length === 2) {
            this.options.verifyClient(info, (verified, code, message, headers) => {
              if (!verified) {
                return abortHandshake(socket, code || 401, message, headers);
              }
              this.completeUpgrade(
                extensions,
                key,
                protocols,
                req,
                socket,
                head,
                cb
              );
            });
            return;
          }
          if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
        }
        this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
      }
      /**
       * Upgrade the connection to WebSocket.
       *
       * @param {Object} extensions The accepted extensions
       * @param {String} key The value of the `Sec-WebSocket-Key` header
       * @param {Set} protocols The subprotocols
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @throws {Error} If called more than once with the same socket
       * @private
       */
      completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
        if (!socket.readable || !socket.writable) return socket.destroy();
        if (socket[kWebSocket]) {
          throw new Error(
            "server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration"
          );
        }
        if (this._state > RUNNING) return abortHandshake(socket, 503);
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        const headers = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${digest}`
        ];
        const ws = new this.options.WebSocket(null, void 0, this.options);
        if (protocols.size) {
          const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
          if (protocol) {
            headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
            ws._protocol = protocol;
          }
        }
        if (extensions[PerMessageDeflate2.extensionName]) {
          const params = extensions[PerMessageDeflate2.extensionName].params;
          const value = extension2.format({
            [PerMessageDeflate2.extensionName]: [params]
          });
          headers.push(`Sec-WebSocket-Extensions: ${value}`);
          ws._extensions = extensions;
        }
        this.emit("headers", headers, req);
        socket.write(headers.concat("\r\n").join("\r\n"));
        socket.removeListener("error", socketOnError);
        ws.setSocket(socket, head, {
          allowSynchronousEvents: this.options.allowSynchronousEvents,
          maxBufferedChunks: this.options.maxBufferedChunks,
          maxFragments: this.options.maxFragments,
          maxPayload: this.options.maxPayload,
          skipUTF8Validation: this.options.skipUTF8Validation
        });
        if (this.clients) {
          this.clients.add(ws);
          ws.on("close", () => {
            this.clients.delete(ws);
            if (this._shouldEmitClose && !this.clients.size) {
              process.nextTick(emitClose, this);
            }
          });
        }
        cb(ws, req);
      }
    };
    module2.exports = WebSocketServer2;
    function addListeners(server2, map) {
      for (const event of Object.keys(map)) server2.on(event, map[event]);
      return function removeListeners() {
        for (const event of Object.keys(map)) {
          server2.removeListener(event, map[event]);
        }
      };
    }
    function emitClose(server2) {
      server2._state = CLOSED;
      server2.emit("close");
    }
    function socketOnError() {
      this.destroy();
    }
    function abortHandshake(socket, code, message, headers) {
      message = message || http3.STATUS_CODES[code];
      headers = {
        Connection: "close",
        "Content-Type": "text/html",
        "Content-Length": Buffer.byteLength(message),
        ...headers
      };
      socket.once("finish", socket.destroy);
      socket.end(
        `HTTP/1.1 ${code} ${http3.STATUS_CODES[code]}\r
` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join("\r\n") + "\r\n\r\n" + message
      );
    }
    function abortHandshakeOrEmitwsClientError(server2, req, socket, code, message, headers) {
      if (server2.listenerCount("wsClientError")) {
        const err = new Error(message);
        Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
        server2.emit("wsClientError", err, socket, req);
      } else {
        abortHandshake(socket, code, message, headers);
      }
    }
  }
});

// extension/cli/main.ts
var fs13 = __toESM(require("node:fs"));
var http2 = __toESM(require("node:http"));
var os8 = __toESM(require("node:os"));
var path11 = __toESM(require("node:path"));

// node_modules/ws/wrapper.mjs
var import_stream = __toESM(require_stream(), 1);
var import_extension = __toESM(require_extension(), 1);
var import_permessage_deflate = __toESM(require_permessage_deflate(), 1);
var import_receiver = __toESM(require_receiver(), 1);
var import_sender = __toESM(require_sender(), 1);
var import_subprotocol = __toESM(require_subprotocol(), 1);
var import_websocket = __toESM(require_websocket(), 1);
var import_websocket_server = __toESM(require_websocket_server(), 1);

// extension/core/attention.ts
var STUCK_MS = 3 * 6e4;
var MAX_NAME_LEN = 32;
function sanitizeName(raw) {
  if (typeof raw !== "string") return "";
  const s = raw.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
  return s.length > MAX_NAME_LEN ? s.slice(0, MAX_NAME_LEN) : s;
}

// extension/core/constants.ts
var FILE_WATCHER_POLL_INTERVAL_MS = 500;
var MAX_READ_BYTES = 65536;
var MAX_LINE_CHARS = 8e6;
var TEXT_IDLE_DELAY_MS = 5e3;
var TOOL_DONE_DELAY_MS = 300;
var PERMISSION_TIMER_FAST_MS = 5e3;
var PERMISSION_TIMER_SLOW_MS = 4e4;
var READING_TOOLS = /* @__PURE__ */ new Set([
  "Read",
  "Grep",
  "Glob",
  "LS",
  "NotebookRead",
  "WebFetch",
  "WebSearch"
]);
var SUBAGENT_TOOL_NAMES = /* @__PURE__ */ new Set(["Task", "Agent"]);
var INSTANT_WRITE_TOOLS = /* @__PURE__ */ new Set(["Edit", "Write", "MultiEdit", "NotebookEdit"]);
var PERMISSION_EXEMPT_TOOLS = /* @__PURE__ */ new Set([
  "Task",
  "Agent",
  "AskUserQuestion",
  "TodoWrite",
  "Read",
  "Grep",
  "Glob",
  "LS",
  "NotebookRead",
  "WebFetch",
  "WebSearch"
]);
var MAX_CONTEXT_TOKENS = 2e5;
var CONTEXT_WINDOW_1M = 1e6;
function contextWindowForModel(model) {
  if (!model) return MAX_CONTEXT_TOKENS;
  const m = model.toLowerCase();
  if (m.includes("1m")) return CONTEXT_WINDOW_1M;
  if (m.includes("haiku")) return MAX_CONTEXT_TOKENS;
  if (/fable|mythos|opus-5|opus-4-[6-9]|sonnet-5|sonnet-4-[6-9]/.test(m)) return CONTEXT_WINDOW_1M;
  return MAX_CONTEXT_TOKENS;
}

// extension/core/paths.ts
var fs = __toESM(require("node:fs"));
var os = __toESM(require("node:os"));
var path = __toESM(require("node:path"));
function claudeProjectsRoot() {
  return path.join(os.homedir(), ".claude", "projects");
}
function normalizeProjectPath(absPath) {
  return absPath.replace(/[^a-zA-Z0-9-]/g, "-");
}
function getSessionDir(workspacePath) {
  const root = claudeProjectsRoot();
  const dirName = normalizeProjectPath(workspacePath);
  const exact = path.join(root, dirName);
  if (fs.existsSync(exact)) return exact;
  try {
    const match = fs.readdirSync(root).find((c) => c.toLowerCase() === dirName.toLowerCase());
    if (match) return path.join(root, match);
  } catch {
  }
  return exact;
}

// extension/server/agentStateStore.ts
var import_node_events = require("node:events");
var AgentStateStore = class extends import_node_events.EventEmitter {
  agents = /* @__PURE__ */ new Map();
  nextId = 1;
  /** >0 bo'lsa broadcast'lar o'chiriladi (tarixni jimgina o'qish uchun).
   *  FAQAT sinxron blok davomida ishlatiladi (tick oraliqda tushmaydi). */
  silent = 0;
  /** Keyingi agent uchun ID ajratadi. */
  allocateId() {
    return this.nextId++;
  }
  add(agent) {
    this.agents.set(agent.id, agent);
    this.emit("agentAdded", agent);
  }
  remove(id) {
    const agent = this.agents.get(id);
    if (!agent) return;
    if (agent.waitingTimer) clearTimeout(agent.waitingTimer);
    if (agent.permissionTimer) clearTimeout(agent.permissionTimer);
    this.agents.delete(id);
    this.emit("agentRemoved", id);
  }
  get(id) {
    return this.agents.get(id);
  }
  has(id) {
    return this.agents.has(id);
  }
  get size() {
    return this.agents.size;
  }
  values() {
    return [...this.agents.values()];
  }
  /** Fayl yo'li bo'yicha agent topadi (skanerlar dublikat qo'shmasin). */
  findByFile(filePath) {
    for (const a of this.agents.values()) {
      if (a.filePath === filePath) return a;
    }
    return void 0;
  }
  /** Sessiya ID bo'yicha agent topadi (hook yo'naltirish). */
  findBySession(sessionId) {
    for (const a of this.agents.values()) {
      if (a.sessionId === sessionId) return a;
    }
    return void 0;
  }
  /** Broadcast'larni vaqtincha o'chiradi (tarixni jimgina qayta o'qish uchun).
   *  begin/end juftlik sinxron blokda ishlatilishi shart. */
  beginSilent() {
    this.silent++;
  }
  endSilent() {
    if (this.silent > 0) this.silent--;
  }
  /** Webview'ga faoliyat xabarini uzatadi (silent rejimda o'tkazib yuboriladi). */
  broadcast(msg) {
    if (this.silent > 0) return;
    this.emit("broadcast", msg);
  }
  disposeAll() {
    for (const a of this.agents.values()) {
      if (a.waitingTimer) clearTimeout(a.waitingTimer);
      if (a.permissionTimer) clearTimeout(a.permissionTimer);
    }
    this.agents.clear();
  }
};

// extension/server/fileWatcher.ts
var fs2 = __toESM(require("node:fs"));
var import_node_string_decoder = require("node:string_decoder");

// extension/core/changedFiles.ts
var WRITE_TOOLS = /* @__PURE__ */ new Set(["Edit", "MultiEdit", "Write", "NotebookEdit"]);
function dayKey(ts) {
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function noteFileTool(files, tool, input, ts) {
  if (!WRITE_TOOLS.has(tool) || !input || typeof input !== "object") return false;
  const inp = input;
  const raw = typeof inp.file_path === "string" ? inp.file_path : typeof inp.notebook_path === "string" ? inp.notebook_path : "";
  if (!raw.trim()) return false;
  const key = raw.replace(/\\/g, "/").toLowerCase();
  const cur = files.get(key);
  if (cur) {
    cur.count += 1;
    cur.lastTs = Math.max(cur.lastTs, ts);
  } else {
    files.set(key, { path: raw, count: 1, lastTs: ts });
  }
  return true;
}
function todaysFiles(files, now, max = 200) {
  const today = dayKey(now);
  return [...files.values()].filter((f) => dayKey(f.lastTs) === today).sort((a, b) => b.lastTs - a.lastTs).slice(0, max);
}

// extension/server/stateActions.ts
function filesMessage(a) {
  return { type: "agentFiles", id: a.id, files: a.files ? todaysFiles(a.files, Date.now()) : [] };
}
function progressMessage(a) {
  const s = a.progressState;
  return { type: "agentProgress", id: a.id, progress: s?.progress ?? null, plan: s?.plan ?? null, startedAt: s?.startedAt ?? null };
}
function agentSnapshotMessages(a) {
  const msgs = [
    { type: "agentStatus", id: a.id, status: a.isWaiting ? "waiting" : "active" }
  ];
  if (a.progressState?.progress || a.progressState?.plan) msgs.push(progressMessage(a));
  if (a.team && a.team.length > 0) msgs.push({ type: "agentTeam", id: a.id, members: a.team });
  if (a.files && a.files.size > 0) msgs.push(filesMessage(a));
  if (a.inputTokens > 0 || a.outputTokens > 0) {
    msgs.push({
      type: "agentTokenUsage",
      id: a.id,
      inputTokens: a.inputTokens,
      outputTokens: a.outputTokens,
      contextWindow: a.contextWindow,
      model: a.model,
      billedInput: a.billedInput,
      billedCacheWrite: a.billedCacheWrite,
      billedCacheRead: a.billedCacheRead
    });
  }
  if (!a.isWaiting && a.currentToolLabel && a.activeToolIds.size > 0) {
    for (const tid of a.activeToolIds) {
      msgs.push({ type: "agentToolStart", id: a.id, toolId: tid, status: a.currentToolLabel, toolName: a.currentToolName });
    }
  }
  for (const [tid, info] of a.subagentToolIds) {
    msgs.push({ type: "subagentToolStart", id: a.id, parentToolId: tid, toolId: tid, status: "Task", label: info.label, kind: info.kind });
  }
  if (a.customName) msgs.push({ type: "agentRenamed", id: a.id, name: a.customName });
  if (a.permissionActive) msgs.push({ type: "agentToolPermission", id: a.id });
  if (a.blocked) msgs.push({ type: "agentBlocked", id: a.id, blocked: true, reason: a.blockedReason });
  if (a.permissionMode && a.permissionMode !== "default") msgs.push({ type: "agentPermissionMode", id: a.id, mode: a.permissionMode });
  if (a.snapToolCalls !== void 0) {
    msgs.push({ type: "agentSessionStats", id: a.id, toolCalls: a.snapToolCalls, turns: a.snapTurns ?? 0, activeMs: a.snapActiveMs ?? 0 });
  }
  if (Object.keys(a.toolCats).length > 0) {
    msgs.push({ type: "agentToolCats", id: a.id, toolCats: a.toolCats });
  }
  return msgs;
}
function permissionDelayFor(name, mode) {
  if (mode !== "default") return null;
  if (PERMISSION_EXEMPT_TOOLS.has(name)) return null;
  return INSTANT_WRITE_TOOLS.has(name) ? PERMISSION_TIMER_FAST_MS : PERMISSION_TIMER_SLOW_MS;
}
function formatToolStatus(name, input) {
  const i = input || {};
  const p = i.file_path || i.path;
  let target = "";
  if (typeof p === "string" && p) {
    target = " " + (p.split(/[\\/]/).pop() || "").slice(0, 40);
  } else {
    const other = i.command || i.pattern || i.url || "";
    if (typeof other === "string" && other) target = " " + other.replace(/\s+/g, " ").trim().slice(0, 40);
  }
  return (name + target).trim();
}
function formatSubagent(input) {
  const i = input || {};
  const d = i.description;
  const k = i.subagent_type;
  return {
    label: typeof d === "string" ? d.replace(/\s+/g, " ").trim().slice(0, 60) : "",
    kind: typeof k === "string" && k.trim() ? k.trim().slice(0, 32) : void 0
  };
}
var MAX_ERROR_LEN = 180;
function formatError(content) {
  let s = "";
  if (typeof content === "string") {
    s = content;
  } else if (Array.isArray(content)) {
    s = content.map((b) => b && typeof b === "object" && typeof b.text === "string" ? b.text : "").join(" ");
  }
  s = s.replace(/\s+/g, " ").trim();
  if (!s) return "";
  return s.length > MAX_ERROR_LEN ? `${s.slice(0, MAX_ERROR_LEN - 1)}\u2026` : s;
}
function setBlocked(store2, agent, on, reason) {
  const r = on ? reason || void 0 : void 0;
  if (agent.blocked === on && agent.blockedReason === r) return;
  agent.blocked = on;
  agent.blockedReason = r;
  store2.broadcast({ type: "agentBlocked", id: agent.id, blocked: on, reason: r });
}
function setActive(store2, agent) {
  if (agent.waitingTimer) {
    clearTimeout(agent.waitingTimer);
    agent.waitingTimer = void 0;
  }
  if (agent.isWaiting) {
    agent.isWaiting = false;
    store2.broadcast({ type: "agentStatus", id: agent.id, status: "active" });
  }
}
function markWaiting(store2, agent, awaitingInput) {
  if (agent.waitingTimer) {
    clearTimeout(agent.waitingTimer);
    agent.waitingTimer = void 0;
  }
  if (agent.permissionTimer) {
    clearTimeout(agent.permissionTimer);
    agent.permissionTimer = void 0;
  }
  agent.hadToolsInTurn = false;
  agent.activeToolIds.clear();
  agent.subagentToolIds.clear();
  agent.hookToolQueue.clear();
  agent.currentToolLabel = void 0;
  agent.currentToolName = void 0;
  agent.permissionActive = false;
  agent.isWaiting = true;
  store2.broadcast({ type: "agentToolsClear", id: agent.id });
  store2.broadcast({ type: "agentStatus", id: agent.id, status: "waiting", awaitingInput });
}

// extension/server/roleInference.ts
var EXT_ROLE = {
  tsx: "frontend",
  jsx: "frontend",
  vue: "frontend",
  svelte: "frontend",
  css: "frontend",
  scss: "frontend",
  sass: "frontend",
  less: "frontend",
  html: "frontend",
  go: "backend",
  py: "backend",
  rs: "backend",
  rb: "backend",
  php: "backend",
  java: "backend",
  kt: "backend",
  cs: "backend",
  sql: "backend",
  md: "docs",
  mdx: "docs",
  rst: "docs",
  adoc: "docs",
  csv: "data",
  ipynb: "data",
  parquet: "data"
};
var WRITE_TOOLS2 = /* @__PURE__ */ new Set(["Edit", "Write", "MultiEdit", "NotebookEdit"]);
function accumulateRole(agent, name, input) {
  const s = agent.roleScores;
  const add = (role, w) => {
    s[role] = (s[role] ?? 0) + w;
  };
  const fpRaw = input && (input.file_path ?? input.path ?? input.notebook_path);
  if (typeof fpRaw === "string" && fpRaw) {
    const fp = fpRaw.toLowerCase();
    const w = WRITE_TOOLS2.has(name) ? 3 : 1;
    if (/\.(test|spec)\.|__tests__|(^|[\\/])tests?[\\/]/.test(fp)) add("qa", w + 1);
    else {
      const ext = fp.includes(".") ? fp.slice(fp.lastIndexOf(".") + 1) : "";
      const role = EXT_ROLE[ext];
      if (role) add(role, w);
    }
  }
  if (name === "Bash") {
    const cmd = input && typeof input.command === "string" ? input.command.toLowerCase() : "";
    if (cmd) {
      if (/\b(jest|vitest|pytest|mocha|rspec|phpunit)\b|\bgo test\b|\bnpm (run )?test\b/.test(cmd)) add("qa", 2);
      else if (/\b(psql|prisma|sqlite3|createdb|migrate|alembic)\b/.test(cmd)) add("backend", 2);
      else if (/\b(jupyter|pandas|dvc)\b/.test(cmd)) add("data", 2);
    }
  }
  if (name === "WebSearch" || name === "WebFetch") add("research", 1);
  let best = null, bestS = 0, second = 0;
  for (const r in s) {
    const v = s[r];
    if (v > bestS) {
      second = bestS;
      bestS = v;
      best = r;
    } else if (v > second) second = v;
  }
  if (best && bestS >= 4 && bestS - second >= 2 && agent.role !== best) {
    agent.role = best;
    return best;
  }
  return null;
}

// extension/core/toolcat.ts
function toolCat(label) {
  const w = (label.split(/\s+/)[0] || "").toLowerCase();
  if (["edit", "write", "multiedit", "notebookedit"].includes(w)) return "edit";
  if (["read", "grep", "glob", "ls", "notebookread"].includes(w)) return "read";
  if (["websearch", "webfetch"].includes(w)) return "research";
  if (w === "bash") {
    return /\b(test|jest|vitest|pytest|go test|npm t|rspec|phpunit|cargo test|mocha)\b/.test(label.toLowerCase()) ? "test" : "run";
  }
  return "other";
}

// extension/core/progress.ts
var PROGRESS_RE = /^[ \t]*(?:[-*]\s+)?(?:\*\*)?\[\s*(\d{1,4})\s*\/\s*(\d{1,4})\s*\|\s*(\d{1,3}(?:\.\d+)?)\s*%\s*\](?:\*\*)?\s*([^\n]*)/gm;
function parseProgress(text, ts) {
  let last = null;
  PROGRESS_RE.lastIndex = 0;
  for (let m = PROGRESS_RE.exec(text); m; m = PROGRESS_RE.exec(text)) last = m;
  if (!last) return null;
  const n = parseInt(last[1], 10);
  const total = parseInt(last[2], 10);
  if (!(total > 0) || n < 0 || n > total) return null;
  const pct = Math.max(0, Math.min(100, parseFloat(last[3])));
  let label = last[4].replace(/[*`_#]/g, "").trim();
  const cut = label.search(/(?<=[.!?。])\s/);
  if (cut > 0) label = label.slice(0, cut);
  if (label.length > 90) label = label.slice(0, 89) + "\u2026";
  if (!/[\p{L}\p{N}]/u.test(label)) label = "";
  return { n, total, pct, label, ts };
}
function parseNumberedList(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  let best = null;
  let cur = [];
  const flush = () => {
    if (cur.length >= 2) best = cur;
    cur = [];
  };
  const clean = (raw) => {
    let item = raw.replace(/[*`_]/g, "").trim();
    const colon = item.search(/[:：(]/);
    if (colon > 0) item = item.slice(0, colon).trim();
    return item.length > 60 ? item.slice(0, 59) + "\u2026" : item;
  };
  for (const line of lines) {
    const m = line.match(/^\s{0,3}(\d{1,2})[.)]\s+(.+)$/);
    if (m && parseInt(m[1], 10) === cur.length + 1) {
      cur.push(clean(m[2]));
    } else if (m && parseInt(m[1], 10) === 1) {
      flush();
      cur.push(clean(m[2]));
    } else if (line.trim() === "" || /^\s{2,}\S/.test(line)) {
    } else {
      flush();
    }
  }
  flush();
  return best;
}
var emptyProgress = () => ({ progress: null, plan: null, candidate: null, startedAt: null });
function applyAssistantText(s, text, ts) {
  let changed = false;
  const list = parseNumberedList(text);
  if (list) s.candidate = list;
  const p = parseProgress(text, ts);
  if (p) {
    const prev = s.progress;
    if (s.startedAt == null || !prev || prev.n === prev.total && p.n < p.total || p.total !== prev.total || p.n < prev.n) {
      s.startedAt = ts;
    }
    s.progress = p;
    if (s.candidate && s.candidate.length === p.total) s.plan = s.candidate;
    else if (s.plan && s.plan.length !== p.total) s.plan = null;
    changed = true;
  } else if (list && s.progress == null && s.startedAt == null) {
  }
  return changed;
}
function applyUserText(s, wasIdle) {
  if (!s.progress && !s.plan) {
    s.candidate = null;
    return false;
  }
  const finished = s.progress != null && s.progress.n >= s.progress.total;
  if (!finished && !wasIdle) return false;
  Object.assign(s, emptyProgress());
  return true;
}

// extension/server/types.ts
var CHAT_BUFFER_MAX = 400;
function createAgentState(id, filePath, folderName, opts = {}) {
  return {
    id,
    filePath,
    sessionId: opts.sessionId,
    fileOffset: 0,
    lineBuffer: "",
    folderName,
    role: opts.role,
    roleScores: {},
    toolCats: {},
    task: opts.task,
    isExternal: opts.isExternal ?? false,
    hadToolsInTurn: false,
    isWaiting: true,
    activeToolIds: /* @__PURE__ */ new Set(),
    subagentToolIds: /* @__PURE__ */ new Map(),
    permissionActive: false,
    blocked: false,
    permissionMode: "default",
    // mode satri ko'rilguncha konservativ (heuristik yoqiq)
    hookDelivered: false,
    hookToolQueue: /* @__PURE__ */ new Map(),
    hookToolCounter: 0,
    inputTokens: 0,
    outputTokens: 0,
    billedInput: 0,
    billedCacheWrite: 0,
    billedCacheRead: 0,
    contextWindow: MAX_CONTEXT_TOKENS,
    chat: []
  };
}

// extension/server/transcriptParser.ts
function startWaitingTimer(store2, agent) {
  if (agent.waitingTimer) clearTimeout(agent.waitingTimer);
  agent.waitingTimer = setTimeout(() => {
    agent.waitingTimer = void 0;
    markWaiting(store2, agent, false);
  }, TEXT_IDLE_DELAY_MS);
}
function startPermissionTimer(store2, agent, delayMs) {
  if (agent.permissionTimer) clearTimeout(agent.permissionTimer);
  agent.permissionTimer = setTimeout(() => {
    agent.permissionTimer = void 0;
    agent.permissionActive = true;
    store2.broadcast({ type: "agentToolPermission", id: agent.id });
  }, delayMs);
}
function clearPermission(store2, agent) {
  if (agent.permissionTimer) {
    clearTimeout(agent.permissionTimer);
    agent.permissionTimer = void 0;
  }
  if (agent.permissionActive) {
    agent.permissionActive = false;
    store2.broadcast({ type: "agentToolPermissionClear", id: agent.id });
  }
}
function emitTokens(store2, agent, message) {
  const model = message.model;
  if (model && model !== agent.model && model !== "<synthetic>") {
    agent.model = model;
    agent.contextWindow = Math.max(agent.contextWindow, contextWindowForModel(model));
  }
  const usage2 = message.usage;
  if (!usage2) return;
  const ctx = (usage2.input_tokens || 0) + (usage2.cache_read_input_tokens || 0) + (usage2.cache_creation_input_tokens || 0);
  if (ctx > 0) agent.inputTokens = ctx;
  if (ctx > MAX_CONTEXT_TOKENS && agent.contextWindow < CONTEXT_WINDOW_1M) {
    agent.contextWindow = CONTEXT_WINDOW_1M;
  }
  agent.outputTokens += usage2.output_tokens || 0;
  agent.billedInput += usage2.input_tokens || 0;
  agent.billedCacheWrite += usage2.cache_creation_input_tokens || 0;
  agent.billedCacheRead += usage2.cache_read_input_tokens || 0;
  store2.broadcast({
    type: "agentTokenUsage",
    id: agent.id,
    inputTokens: agent.inputTokens,
    outputTokens: agent.outputTokens,
    contextWindow: agent.contextWindow,
    model: agent.model,
    billedInput: agent.billedInput,
    billedCacheWrite: agent.billedCacheWrite,
    billedCacheRead: agent.billedCacheRead
  });
}
var CHAT_TEXT_MAX = 4e3;
function lineTimestamp(o) {
  const t = o.timestamp;
  if (typeof t === "string") {
    const ms = Date.parse(t);
    if (!Number.isNaN(ms)) return ms;
  }
  return Date.now();
}
function pushChat(store2, agent, role, text, ts) {
  const trimmed = text.replace(/\s+$/, "");
  if (!trimmed) return;
  const entry = { role, text: trimmed.slice(0, CHAT_TEXT_MAX), ts };
  agent.chat.push(entry);
  if (agent.chat.length > CHAT_BUFFER_MAX) agent.chat.splice(0, agent.chat.length - CHAT_BUFFER_MAX);
  store2.broadcast({ type: "agentSpeech", id: agent.id, role, text: entry.text, ts });
  if (role === "assistant" || role === "thinking" || role === "user") {
    const ps = agent.progressState ??= emptyProgress();
    const changed = role === "user" ? applyUserText(ps, agent.isWaiting) : applyAssistantText(ps, trimmed, ts);
    if (changed) store2.broadcast(progressMessage(agent));
  }
}
function extractChat(store2, agent, o) {
  const type = o.type;
  const message = o.message;
  if (!message) return;
  const ts = lineTimestamp(o);
  if (type === "assistant" && Array.isArray(message.content)) {
    for (const b of message.content) {
      if (!b) continue;
      if (b.type === "text" && typeof b.text === "string") pushChat(store2, agent, "assistant", b.text, ts);
      else if (b.type === "thinking" && typeof b.thinking === "string") pushChat(store2, agent, "thinking", b.thinking, ts);
    }
    return;
  }
  if (type === "user") {
    const content = message.content;
    if (typeof content === "string") {
      if (content && !content.startsWith("<")) pushChat(store2, agent, "user", content, ts);
      return;
    }
    if (Array.isArray(content)) {
      for (const b of content) {
        if (b && b.type === "text" && typeof b.text === "string" && b.text && !b.text.startsWith("<")) {
          pushChat(store2, agent, "user", b.text, ts);
        }
      }
    }
  }
}
function processTranscriptLine(store2, agent, line) {
  if (!line.trim()) return;
  let o;
  try {
    o = JSON.parse(line);
  } catch {
    return;
  }
  if (!o || typeof o !== "object" || Array.isArray(o)) return;
  const type = o.type;
  const message = o.message;
  extractChat(store2, agent, o);
  if (typeof o.permissionMode === "string") {
    if (agent.permissionMode !== o.permissionMode) {
      agent.permissionMode = o.permissionMode;
      store2.broadcast({ type: "agentPermissionMode", id: agent.id, mode: agent.permissionMode });
    }
    if (agent.permissionMode !== "default") clearPermission(store2, agent);
  }
  if (agent.hookDelivered) {
    if (type === "assistant" && message) emitTokens(store2, agent, message);
    return;
  }
  if (type === "system" && o.subtype === "turn_duration") {
    markWaiting(store2, agent, false);
    return;
  }
  if (type === "system" && o.subtype === "api_error") {
    setBlocked(store2, agent, true);
    return;
  }
  if (type === "assistant" && message && Array.isArray(message.content)) {
    const blocks = message.content;
    const toolUses = blocks.filter((b) => b && b.type === "tool_use");
    if (toolUses.length > 0) {
      const files = agent.files ??= /* @__PURE__ */ new Map();
      const at = lineTimestamp(o);
      let touched = false;
      for (const b of toolUses) touched = noteFileTool(files, String(b.name ?? ""), b.input, at) || touched;
      if (touched) store2.broadcast(filesMessage(agent));
    }
    const hasText = blocks.some((b) => b && b.type === "text");
    const hasThinking = blocks.some((b) => b && (b.type === "thinking" || b.type === "redacted_thinking"));
    emitTokens(store2, agent, message);
    if (toolUses.length > 0) {
      setActive(store2, agent);
      agent.hadToolsInTurn = true;
      for (const tool of toolUses) {
        const toolId = tool.id || `t-${agent.id}-${agent.activeToolIds.size}`;
        const name = tool.name || "Tool";
        const status = formatToolStatus(name, tool.input);
        const runInBackground = !!(tool.input && tool.input.run_in_background);
        if (!agent.roleManual) {
          const detected = accumulateRole(agent, name, tool.input);
          if (detected) store2.broadcast({ type: "agentRoleDetected", id: agent.id, role: detected });
        }
        if (SUBAGENT_TOOL_NAMES.has(name)) {
          const info = formatSubagent(tool.input);
          agent.subagentToolIds.set(toolId, info);
          store2.broadcast({
            type: "subagentToolStart",
            id: agent.id,
            parentToolId: toolId,
            toolId,
            status,
            label: info.label,
            kind: info.kind
          });
        } else {
          agent.activeToolIds.add(toolId);
          agent.currentToolLabel = status;
          agent.currentToolName = name;
          agent.toolCats[toolCat(status)] = (agent.toolCats[toolCat(status)] ?? 0) + 1;
          store2.broadcast({
            type: "agentToolStart",
            id: agent.id,
            toolId,
            status,
            toolName: name,
            runInBackground
          });
          const delay = permissionDelayFor(name, agent.permissionMode);
          if (delay != null) startPermissionTimer(store2, agent, delay);
        }
      }
      return;
    }
    if (hasThinking) {
      setActive(store2, agent);
    }
    if (hasText) {
      setActive(store2, agent);
      if (!agent.hadToolsInTurn) startWaitingTimer(store2, agent);
    }
    return;
  }
  if (type === "user" && message) {
    const content = message.content;
    if (Array.isArray(content)) {
      const toolResults = content.filter(
        (b) => b && b.type === "tool_result"
      );
      if (toolResults.length > 0) {
        clearPermission(store2, agent);
        const failed = toolResults.find((tr) => tr.is_error === true);
        setBlocked(store2, agent, !!failed, failed ? formatError(failed.content) : void 0);
        for (const tr of toolResults) {
          const toolId = tr.tool_use_id || "";
          if (agent.subagentToolIds.has(toolId)) {
            agent.subagentToolIds.delete(toolId);
            store2.broadcast({ type: "subagentClear", id: agent.id, parentToolId: toolId });
          } else if (agent.activeToolIds.has(toolId)) {
            agent.activeToolIds.delete(toolId);
            setTimeout(() => {
              store2.broadcast({ type: "agentToolDone", id: agent.id, toolId });
            }, TOOL_DONE_DELAY_MS);
          }
        }
        return;
      }
      const hasText = content.some((b) => b && b.type === "text");
      if (hasText) {
        setActive(store2, agent);
        setBlocked(store2, agent, false);
        agent.hadToolsInTurn = false;
      }
      return;
    }
    if (typeof content === "string" && content && !content.startsWith("<")) {
      setActive(store2, agent);
      setBlocked(store2, agent, false);
      agent.hadToolsInTurn = false;
    }
    return;
  }
}
function extractFirstTask(headText) {
  for (const line of headText.split("\n")) {
    if (!line) continue;
    try {
      const o = JSON.parse(line);
      if (o.type === "user" && o.message) {
        const c = o.message.content;
        const s = typeof c === "string" ? c : Array.isArray(c) ? c.find((b) => b.type === "text")?.text || "" : "";
        if (s && !s.startsWith("<")) return s.replace(/\s+/g, " ").slice(0, 60);
      }
    } catch {
    }
  }
  return "\uD074\uB85C\uB4DC \uCF54\uB4DC \uC138\uC158";
}

// extension/server/fileWatcher.ts
var FileWatcher = class {
  constructor(store2) {
    this.store = store2;
  }
  store;
  timer;
  start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), FILE_WATCHER_POLL_INTERVAL_MS);
  }
  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = void 0;
  }
  /** Yangi agent adopt qilinganda mavjud TARIXni JIMGINA (broadcast'siz) o'qib
   *  holatni tiklaymiz — butun tarix webview'ga flood bo'lmasin. Yakuniy holat
   *  keyin emitSnapshot() orqali BIR marta yuboriladi. Sinxron — tick oraliqda
   *  tushmaydi. */
  primeFromStart(agent) {
    agent.fileOffset = 0;
    agent.lineBuffer = "";
    agent.lineDecoder = void 0;
    agent.inputTokens = 0;
    agent.outputTokens = 0;
    agent.billedInput = 0;
    agent.billedCacheWrite = 0;
    agent.billedCacheRead = 0;
    agent.toolCats = {};
    this.store.beginSilent();
    try {
      let guard = 0;
      while (this.readNewLines(agent) && guard++ < 2e5) {
      }
    } finally {
      this.store.endSilent();
    }
  }
  /** Agentning JORIY holatini webview'ga yuboradi (adopt/rebind'dan keyin).
   *  Avval eski indikatorlarni tozalab, so'ng snapshot qo'llaymiz. */
  emitSnapshot(agent) {
    this.store.broadcast({ type: "agentToolsClear", id: agent.id });
    for (const msg of agentSnapshotMessages(agent)) this.store.broadcast(msg);
  }
  tick() {
    for (const agent of this.store.values()) {
      this.readNewLines(agent);
    }
  }
  /** Bir chunk (MAX_READ_BYTES) yangi baytlarni o'qiydi. Yana o'qish mumkin
   *  bo'lsa (fayl offset'dan katta) true qaytaradi (drain sikli uchun). */
  readNewLines(agent) {
    let stat;
    try {
      stat = fs2.statSync(agent.filePath);
    } catch {
      return false;
    }
    if (stat.size <= agent.fileOffset) {
      if (stat.size < agent.fileOffset) {
        this.primeFromStart(agent);
        this.emitSnapshot(agent);
      }
      return false;
    }
    const toRead = Math.min(stat.size - agent.fileOffset, MAX_READ_BYTES);
    const buf = Buffer.alloc(toRead);
    let bytesRead = 0;
    let fd;
    try {
      fd = fs2.openSync(agent.filePath, "r");
      bytesRead = fs2.readSync(fd, buf, 0, toRead, agent.fileOffset);
    } catch {
      return false;
    } finally {
      if (fd !== void 0) {
        try {
          fs2.closeSync(fd);
        } catch {
        }
      }
    }
    if (bytesRead <= 0) return false;
    agent.fileOffset += bytesRead;
    if (!agent.lineDecoder) agent.lineDecoder = new import_node_string_decoder.StringDecoder("utf8");
    const chunk = agent.lineDecoder.write(bytesRead < buf.length ? buf.subarray(0, bytesRead) : buf);
    const text = agent.lineBuffer + chunk;
    const lines = text.split("\n");
    agent.lineBuffer = lines.pop() ?? "";
    if (agent.lineBuffer.length > MAX_LINE_CHARS) agent.lineBuffer = "";
    for (const line of lines) {
      processTranscriptLine(this.store, agent, line);
    }
    return agent.fileOffset < stat.size;
  }
};

// extension/server/subagentWatcher.ts
var fs3 = __toESM(require("node:fs"));
var path2 = __toESM(require("node:path"));

// extension/core/team.ts
var RESULT_MAX = 1500;
var TEAM_STALL_MS = 3 * 6e4;
var TEAM_KEEP_MS = 30 * 6e4;
function readTail(tail) {
  const lines = tail.split("\n").filter((l) => l.trim().startsWith("{"));
  let ended = false;
  let tool;
  let lastTs;
  let text;
  let report;
  const cut = (s) => s.length > RESULT_MAX ? s.slice(0, RESULT_MAX - 1) + "\u2026" : s;
  for (const line of lines) {
    let o;
    try {
      o = JSON.parse(line);
    } catch {
      continue;
    }
    if (o.timestamp) {
      const t = Date.parse(o.timestamp);
      if (!Number.isNaN(t)) lastTs = t;
    }
    if (o.type === "assistant") {
      ended = o.message?.stop_reason === "end_turn";
      const content = Array.isArray(o.message?.content) ? o.message.content : [];
      for (const b of content) {
        if (b?.type !== "tool_use" || !b.name) continue;
        tool = b.name;
        if (/handback/i.test(b.name) && typeof b.input?.message === "string" && b.input.message.trim()) report = cut(b.input.message.trim());
      }
      const said = content.filter((b) => b?.type === "text" && typeof b.text === "string").map((b) => b.text).join("\n").trim();
      if (said) text = cut(said);
    } else if (o.type === "user") {
      ended = false;
    }
  }
  return { ended, tool, lastTs, text: report ?? text };
}
function memberDone(ended, lastWriteMs, now) {
  return ended || now - lastWriteMs > TEAM_STALL_MS;
}
function visibleMembers(all, now) {
  return all.filter((m) => !m.done || now - (m.doneAt ?? m.lastAt) < TEAM_KEEP_MS).sort((a, b) => a.startedAt - b.startedAt);
}

// extension/server/subagentWatcher.ts
var POLL_MS = 2e3;
var TAIL_BYTES = 16 * 1024;
function teamMessage(a) {
  return { type: "agentTeam", id: a.id, members: a.team ?? [] };
}
function readTailOf(file, size) {
  const fd = fs3.openSync(file, "r");
  try {
    const len = Math.min(size, TAIL_BYTES);
    const buf = Buffer.alloc(len);
    fs3.readSync(fd, buf, 0, len, size - len);
    return buf.toString("utf8");
  } finally {
    fs3.closeSync(fd);
  }
}
var SubagentWatcher = class {
  constructor(store2) {
    this.store = store2;
  }
  store;
  timer;
  /** per sub-agent file: last seen size, so unchanged files are not re-read */
  seen = /* @__PURE__ */ new Map();
  start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), POLL_MS);
  }
  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = void 0;
  }
  tick(now = Date.now()) {
    const found = /* @__PURE__ */ new Set();
    for (const a of this.store.values()) {
      try {
        this.scanAgent(a, now, found);
      } catch {
      }
    }
    for (const file of [...this.seen.keys()]) if (!found.has(file)) this.seen.delete(file);
  }
  scanAgent(a, now, found) {
    const dir = path2.join(a.filePath.replace(/\.jsonl$/i, ""), "subagents");
    if (!fs3.existsSync(dir)) return;
    const all = [];
    for (const name of fs3.readdirSync(dir)) {
      const m = name.match(/^agent-(.+)\.jsonl$/);
      if (!m) continue;
      const file = path2.join(dir, name);
      found.add(file);
      const st = fs3.statSync(file);
      const prev = this.seen.get(file);
      let member;
      if (prev && prev.size === st.size) {
        member = { ...prev.member };
      } else {
        let meta = {};
        try {
          meta = JSON.parse(fs3.readFileSync(path2.join(dir, `agent-${m[1]}.meta.json`), "utf8"));
        } catch {
        }
        const tail = readTailOf(file, st.size);
        const t = readTail(tail);
        member = {
          key: m[1],
          kind: meta.agentType,
          label: meta.description,
          toolUseId: meta.toolUseId,
          startedAt: prev?.member.startedAt ?? Math.round(st.birthtimeMs || st.ctimeMs),
          lastAt: Math.round(st.mtimeMs),
          done: t.ended,
          tool: t.tool ?? prev?.member.tool,
          result: t.text ?? prev?.member.result
        };
        this.seen.set(file, { size: st.size, member });
      }
      member.lastAt = Math.round(st.mtimeMs);
      if (!member.done && memberDone(false, member.lastAt, now)) member.done = true;
      if (member.done) member.doneAt = member.doneAt ?? member.lastAt;
      all.push(member);
    }
    const visible = visibleMembers(all, now);
    const before = JSON.stringify(a.team ?? []);
    const after = JSON.stringify(visible);
    if (before !== after) {
      a.team = visible;
      this.store.broadcast(teamMessage(a));
    }
  }
};

// extension/server/hookHandler.ts
function stableStringify(v) {
  try {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const o = v;
      return "{" + Object.keys(o).sort().map((k) => JSON.stringify(k) + ":" + stableStringify(o[k])).join(",") + "}";
    }
    return JSON.stringify(v) ?? "null";
  } catch {
    return "";
  }
}
var SIG_SEP = String.fromCharCode(31);
function toolSig(name, input) {
  return name + SIG_SEP + stableStringify(input);
}
function popHookTool(agent, name, input) {
  const sig = toolSig(name, input);
  const q = agent.hookToolQueue.get(sig);
  if (q && q.length) {
    const id = q.shift();
    if (!q.length) agent.hookToolQueue.delete(sig);
    return id;
  }
  for (const [k, list] of agent.hookToolQueue) {
    if (list.length) {
      const id = list.shift();
      if (!list.length) agent.hookToolQueue.delete(k);
      return id;
    }
  }
  return void 0;
}
function handleHookEvent(store2, agent, raw) {
  if (!agent.hookDelivered) {
    agent.hookDelivered = true;
    if (agent.activeToolIds.size > 0 || agent.subagentToolIds.size > 0) {
      agent.activeToolIds.clear();
      agent.subagentToolIds.clear();
      agent.hookToolQueue.clear();
      agent.currentToolLabel = void 0;
      agent.currentToolName = void 0;
      store2.broadcast({ type: "agentToolsClear", id: agent.id });
    }
    if (agent.permissionTimer) {
      clearTimeout(agent.permissionTimer);
      agent.permissionTimer = void 0;
    }
    if (agent.waitingTimer) {
      clearTimeout(agent.waitingTimer);
      agent.waitingTimer = void 0;
    }
    if (agent.permissionActive) {
      agent.permissionActive = false;
      store2.broadcast({ type: "agentToolPermissionClear", id: agent.id });
    }
  }
  const event = raw.hook_event_name;
  switch (event) {
    case "PreToolUse": {
      setActive(store2, agent);
      const name = raw.tool_name || "Tool";
      const input = raw.tool_input;
      const runInBackground = !!(input && input.run_in_background);
      const status = formatToolStatus(name, input);
      if (!agent.roleManual) {
        const detected = accumulateRole(agent, name, input);
        if (detected) store2.broadcast({ type: "agentRoleDetected", id: agent.id, role: detected });
      }
      const sig = toolSig(name, input);
      const isSub = SUBAGENT_TOOL_NAMES.has(name);
      const toolId = `${isSub ? "hook-sub" : "hook"}-${agent.hookToolCounter++}`;
      const q = agent.hookToolQueue.get(sig);
      if (q) q.push(toolId);
      else agent.hookToolQueue.set(sig, [toolId]);
      if (isSub) {
        const info = formatSubagent(input);
        agent.subagentToolIds.set(toolId, info);
        store2.broadcast({ type: "subagentToolStart", id: agent.id, parentToolId: toolId, toolId, status, label: info.label, kind: info.kind });
      } else {
        agent.activeToolIds.add(toolId);
        agent.currentToolLabel = status;
        agent.currentToolName = name;
        agent.toolCats[toolCat(status)] = (agent.toolCats[toolCat(status)] ?? 0) + 1;
        store2.broadcast({ type: "agentToolStart", id: agent.id, toolId, status, toolName: name, runInBackground });
      }
      break;
    }
    case "PostToolUse":
    case "PostToolUseFailure": {
      const failed = event === "PostToolUseFailure";
      setBlocked(store2, agent, failed, failed ? formatError(raw.tool_response ?? raw.error) : void 0);
      if (agent.permissionActive) {
        agent.permissionActive = false;
        store2.broadcast({ type: "agentToolPermissionClear", id: agent.id });
      }
      const name = raw.tool_name || "Tool";
      const toolId = popHookTool(agent, name, raw.tool_input);
      if (toolId) {
        if (agent.subagentToolIds.has(toolId)) {
          agent.subagentToolIds.delete(toolId);
          store2.broadcast({ type: "subagentClear", id: agent.id, parentToolId: toolId });
        } else {
          agent.activeToolIds.delete(toolId);
          store2.broadcast({ type: "agentToolDone", id: agent.id, toolId });
          if (agent.activeToolIds.size === 0) {
            agent.currentToolLabel = void 0;
            agent.currentToolName = void 0;
          }
        }
      }
      break;
    }
    case "Stop":
      markWaiting(store2, agent, false);
      break;
    case "Notification": {
      const msg = (raw.message || "").toLowerCase();
      if (/permission|approve|allow|grant|confirm/.test(msg)) {
        agent.permissionActive = true;
        store2.broadcast({ type: "agentToolPermission", id: agent.id });
      } else if (/waiting|input|idle/.test(msg)) {
        markWaiting(store2, agent, true);
      }
      break;
    }
    case "UserPromptSubmit":
      setActive(store2, agent);
      setBlocked(store2, agent, false);
      break;
    case "SubagentStop": {
      for (const tid of [...agent.subagentToolIds.keys()]) {
        agent.subagentToolIds.delete(tid);
        store2.broadcast({ type: "subagentClear", id: agent.id, parentToolId: tid });
      }
      break;
    }
    // SessionStart / SessionEnd — hayot-tsikli ViewProvider'da (agent yaratish/o'chirish)
    default:
      break;
  }
}

// extension/server/hookServer.ts
var crypto = __toESM(require("node:crypto"));
var fs4 = __toESM(require("node:fs"));
var http = __toESM(require("node:http"));
var os2 = __toESM(require("node:os"));
var path3 = __toESM(require("node:path"));
var MAX_BODY = 256 * 1024;
var HookServer = class {
  /** `folders` — shu oyna kuzatayotgan ish-papkalar (yo'naltirish uchun). */
  constructor(onEvent, folders = () => []) {
    this.onEvent = onEvent;
    this.folders = folders;
  }
  onEvent;
  folders;
  server;
  token = crypto.randomBytes(24).toString("hex");
  port = 0;
  /** v4: 마지막 훅 수신 시각(ms). 0 이면 아직 없음. */
  lastEventAt = 0;
  get portNumber() {
    return this.port;
  }
  async start() {
    this.pruneDead();
    return new Promise((resolve3) => {
      const server2 = http.createServer((req, res) => this.handle(req, res));
      server2.on("error", () => resolve3(null));
      server2.listen(0, "127.0.0.1", () => {
        const addr = server2.address();
        this.port = typeof addr === "object" && addr ? addr.port : 0;
        this.server = server2;
        this.writeEntry();
        resolve3({ port: this.port, token: this.token });
      });
    });
  }
  /** Ish-papkalar o'zgarganда (onDidChangeWorkspaceFolders) yozuvni yangilaydi. */
  refreshFolders() {
    if (this.server) this.writeEntry();
  }
  isAlive(pid) {
    try {
      process.kill(pid, 0);
      return true;
    } catch (e) {
      return e.code === "EPERM";
    }
  }
  handle(req, res) {
    if (req.method === "GET" && req.url === "/api/health") {
      res.writeHead(200, { "content-type": "text/plain" });
      res.end("ok");
      return;
    }
    if (req.method !== "POST" || !req.url || !req.url.startsWith("/api/hooks/")) {
      res.writeHead(404);
      res.end();
      return;
    }
    if (req.headers["authorization"] !== `Bearer ${this.token}`) {
      res.writeHead(401);
      res.end();
      return;
    }
    let body = "";
    req.on("data", (c) => {
      body += c;
      if (body.length > MAX_BODY) req.destroy();
    });
    req.on("end", () => {
      res.writeHead(200, { "content-type": "text/plain" });
      res.end("ok");
      try {
        const raw = JSON.parse(body);
        const sessionId = raw.session_id;
        if (typeof sessionId === "string" && raw.hook_event_name) {
          this.lastEventAt = Date.now();
          this.onEvent(sessionId, raw);
        }
      } catch {
      }
    });
  }
  aoDir() {
    return path3.join(os2.homedir(), ".agent-office");
  }
  serversDir() {
    return path3.join(this.aoDir(), "servers");
  }
  ownFile() {
    return path3.join(this.serversDir(), `${process.pid}.json`);
  }
  serverJsonPath() {
    return path3.join(this.aoDir(), "server.json");
  }
  atomicWrite(file, content) {
    try {
      fs4.mkdirSync(path3.dirname(file), { recursive: true });
      const tmp = `${file}.${process.pid}.tmp`;
      fs4.writeFileSync(tmp, content);
      fs4.renameSync(tmp, file);
    } catch {
    }
  }
  writeEntry() {
    const folders = this.folders().filter((f) => typeof f === "string" && f.length > 0);
    this.atomicWrite(this.ownFile(), JSON.stringify({ port: this.port, pid: process.pid, token: this.token, folders }));
    this.atomicWrite(this.serverJsonPath(), JSON.stringify({ port: this.port, pid: process.pid, token: this.token }));
  }
  /** O'lik oynalarning servers/<pid>.json yozuvlarini olib tashlaydi. */
  pruneDead() {
    let names2;
    try {
      names2 = fs4.readdirSync(this.serversDir());
    } catch {
      return;
    }
    for (const name of names2) {
      if (!name.endsWith(".json")) continue;
      const file = path3.join(this.serversDir(), name);
      try {
        const e = JSON.parse(fs4.readFileSync(file, "utf8"));
        if (typeof e.pid === "number" && e.pid !== process.pid && !this.isAlive(e.pid)) {
          fs4.rmSync(file, { force: true });
        }
      } catch {
      }
    }
  }
  stop() {
    try {
      this.server?.close();
    } catch {
    }
    try {
      fs4.rmSync(this.ownFile(), { force: true });
    } catch {
    }
    try {
      const cur = JSON.parse(fs4.readFileSync(this.serverJsonPath(), "utf8"));
      if (cur.pid === process.pid) fs4.rmSync(this.serverJsonPath(), { force: true });
    } catch {
    }
  }
};

// extension/vscode/historyStore.ts
var fs5 = __toESM(require("fs"));
var os3 = __toESM(require("os"));
var path4 = __toESM(require("path"));
var KEEP_DAYS = 120;
var SESSION_TTL_DAYS = 60;
function emptyStat() {
  return { cost: 0, inTok: 0, outTok: 0, tools: 0, ms: 0 };
}
function localDay(d = /* @__PURE__ */ new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function daysBetween(a, b) {
  return Math.abs((Date.parse(b + "T00:00:00") - Date.parse(a + "T00:00:00")) / 864e5);
}
var HistoryStore = class {
  data = { days: {}, sessions: {} };
  loaded = false;
  /** Fayl mavjud, lekin buzuq → USTIDAN YOZMAYMIZ. */
  corrupt = false;
  dirty = false;
  saveTimer;
  filePath() {
    return path4.join(os3.homedir(), ".agent-office", "history.json");
  }
  load() {
    if (this.loaded) return;
    try {
      const raw = fs5.readFileSync(this.filePath(), "utf8");
      const o = JSON.parse(raw);
      if (o && typeof o === "object" && o.days && o.sessions && typeof o.days === "object" && typeof o.sessions === "object") {
        this.data = o;
      } else {
        this.corrupt = true;
      }
    } catch (e) {
      if (e.code !== "ENOENT") this.corrupt = true;
    }
    this.loaded = true;
    this.prune();
  }
  /** Bitta sessiyaning JORIY absolyut jamini yozadi — o'sish (delta) bugungi
   *  kunga qo'shiladi. cur.* kamaymaydi (jami faqat o'sadi); kamaysa 0 deb olamiz. */
  record(sessionId, project, cur, model) {
    if (!sessionId || !project) return;
    const day = localDay();
    const prev = this.data.sessions[sessionId];
    const dcost = prev ? Math.max(0, cur.cost - prev.cost) : cur.cost;
    const din = prev ? Math.max(0, cur.inTok - prev.inTok) : cur.inTok;
    const dout = prev ? Math.max(0, cur.outTok - prev.outTok) : cur.outTok;
    const dtools = prev ? Math.max(0, cur.tools - prev.tools) : cur.tools;
    const dms = prev ? Math.max(0, cur.ms - prev.ms) : cur.ms;
    if (dcost || din || dout || dtools || dms || !prev) {
      const d = this.data.days[day] ||= {};
      const s = d[project] ||= emptyStat();
      s.cost += dcost;
      s.inTok += din;
      s.outTok += dout;
      s.tools += dtools;
      s.ms += dms;
    }
    const firstSeen = prev?.firstSeen ?? Date.now();
    this.data.sessions[sessionId] = { project, day, firstSeen, cost: cur.cost, inTok: cur.inTok, outTok: cur.outTok, tools: cur.tools, ms: cur.ms, model: model ?? prev?.model };
    this.dirty = true;
    this.scheduleSave();
  }
  /** Webview'ga jo'natish uchun — kunlar ro'yxati (sana bo'yicha). */
  getDays() {
    return Object.entries(this.data.days).map(([date, projects]) => ({ date, projects })).sort((a, b) => a.date.localeCompare(b.date));
  }
  /** So'nggi sessiyalar arxivi — eng yangi birinchi (nom keyin qo'shiladi). */
  getSessions(limit = 60) {
    return Object.entries(this.data.sessions).map(([sessionId, s]) => ({
      sessionId,
      project: s.project,
      at: s.firstSeen ?? (Date.parse(`${s.day}T12:00:00`) || 0),
      cost: s.cost,
      inTok: s.inTok,
      outTok: s.outTok,
      tools: s.tools,
      ms: s.ms,
      model: s.model
    })).sort((a, b) => b.at - a.at).slice(0, limit);
  }
  prune() {
    const today = localDay();
    for (const date of Object.keys(this.data.days)) {
      if (daysBetween(date, today) > KEEP_DAYS) delete this.data.days[date];
    }
    for (const [sid, s] of Object.entries(this.data.sessions)) {
      if (daysBetween(s.day, today) > SESSION_TTL_DAYS) delete this.data.sessions[sid];
    }
  }
  scheduleSave() {
    if (this.saveTimer) return;
    this.saveTimer = setTimeout(() => {
      this.saveTimer = void 0;
      this.save();
    }, 15e3);
  }
  /** Atomik yozuv. corrupt bo'lsa — HECH NARSA yozmaydi. */
  save() {
    if (this.corrupt || !this.dirty) return;
    try {
      const p = this.filePath();
      fs5.mkdirSync(path4.dirname(p), { recursive: true });
      const tmp = `${p}.${process.pid}.tmp`;
      fs5.writeFileSync(tmp, JSON.stringify(this.data));
      fs5.renameSync(tmp, p);
      this.dirty = false;
    } catch {
    }
  }
  /** Yopilishda — kutilayotgan yozuvni majburan saqlaymiz. */
  flush() {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = void 0;
    }
    this.save();
  }
};

// extension/core/economy.ts
var ECONOMY_CHAT_PROMPT = "\uB2F5\uC740 \uACB0\uB860\uBD80\uD130, \uD544\uC694\uD55C \uB0B4\uC6A9\uB9CC \uC9E7\uAC8C \uC4F4\uB2E4. \uB2E8\uC21C\uD55C \uC9C8\uBB38\uC740 1-3 \uBB38\uC7A5\uC73C\uB85C \uB2F5\uD55C\uB2E4. \uB3C4\uAD6C\uB294 \uAF2D \uD544\uC694\uD560 \uB54C\uB9CC \uCD5C\uC18C\uD55C\uC73C\uB85C \uC4F0\uACE0, \uAC19\uC740 \uD30C\uC77C\uC744 \uC5EC\uB7EC \uBC88 \uC77D\uC9C0 \uC54A\uB294\uB2E4. \uC7AC\uD655\uC778 \xB7 \uC694\uC57D \uBC18\uBCF5\uC740 \uD558\uC9C0 \uC54A\uB294\uB2E4.";
function economyChatArgs() {
  return [
    "--strict-mcp-config",
    "--disable-slash-commands",
    "--effort",
    "medium",
    "--exclude-dynamic-system-prompt-sections",
    "--append-system-prompt",
    ECONOMY_CHAT_PROMPT
  ];
}
function economyMeetingArgs(systemPrompt) {
  return [
    "--disallowedTools",
    "*",
    "--strict-mcp-config",
    "--disable-slash-commands",
    "--effort",
    "low",
    "--no-session-persistence",
    "--system-prompt",
    systemPrompt
  ];
}
function economyDefault(argv2, hasGit) {
  const i = argv2.indexOf("--economy");
  if (i >= 0 && (argv2[i + 1] === "on" || argv2[i + 1] === "off")) return argv2[i + 1] === "on";
  return !hasGit;
}

// extension/server/meeting.ts
var import_node_child_process = require("node:child_process");
var fs6 = __toESM(require("node:fs"));
var os4 = __toESM(require("node:os"));
var path5 = __toESM(require("node:path"));

// extension/server/models.ts
var MODEL_IDS = [
  "claude-haiku-4-5-20251001",
  "claude-sonnet-5",
  "claude-opus-5-5",
  "claude-fable-5-1"
];
var ALIASES = { haiku: "claude-haiku-4-5-20251001", sonnet: "claude-sonnet-5", opus: "claude-opus-5-5", fable: "claude-fable-5-1" };
function safeModelId(m) {
  if (typeof m !== "string") return "";
  if (MODEL_IDS.includes(m)) return m;
  return ALIASES[m] ?? "";
}

// extension/server/meeting.ts
var DEFAULT_NPCS = [
  { name: "\uB178\uC544", persona: "\uC2E0\uC911\uD55C \uAE30\uD68D\uC790. \uBAA9\uC801\uACFC \uC6B0\uC120\uC21C\uC704\uB97C \uB530\uC9C0\uACE0, \uC2E4\uD589 \uC21C\uC11C\uB97C \uC815\uB9AC\uD55C\uB2E4. \uADFC\uAC70 \uC5C6\uB294 \uB099\uAD00\uC744 \uACBD\uACC4\uD55C\uB2E4." },
  { name: "\uC62C\uB9AC\uBC84", persona: "\uC2E4\uBB34\uD615 \uC5D4\uC9C0\uB2C8\uC5B4. \uAD6C\uCCB4\uC801\uC778 \uBC29\uBC95\uACFC \uD544\uC694\uD55C \uB3C4\uAD6C\uB97C \uC81C\uC2DC\uD558\uACE0, \uC704\uD5D8\uACFC \uD568\uC815\uC744 \uC9DA\uB294\uB2E4." }
];
var MEETINGS_DIR = path5.join(os4.homedir(), ".agent-office", "meetings");
var KANBAN_FILE = path5.join(os4.homedir(), ".agent-office", "kanban.json");
var TURN_TIMEOUT_MS = 18e4;
var SPEECH_MAX = 1600;
function safeModel(m) {
  return safeModelId(m) || "claude-haiku-4-5-20251001";
}
function slug(topic) {
  return topic.replace(/[\\/:*?"<>|\s]+/g, "_").slice(0, 40) || "\uD68C\uC758";
}
function stamp(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
}
var meetingEconomy = { on: false };
function askClaude(prompt, systemPrompt, model) {
  return new Promise((resolve3) => {
    const args = meetingEconomy.on ? ["-p", "--model", safeModel(model), "--max-turns", "1", ...economyMeetingArgs(systemPrompt)] : ["-p", "--model", safeModel(model), "--max-turns", "1", "--disallowedTools", "*", "--append-system-prompt", systemPrompt];
    const runDir = path5.join(os4.homedir(), ".agent-office", "npc-runs");
    try {
      fs6.mkdirSync(runDir, { recursive: true });
    } catch {
    }
    const isWin = process.platform === "win32";
    const spawnOpts = { stdio: ["pipe", "pipe", "pipe"], cwd: runDir };
    const child = isWin ? (0, import_node_child_process.spawn)("cmd.exe", ["/d", "/s", "/c", "claude", ...args], { ...spawnOpts, windowsVerbatimArguments: false }) : (0, import_node_child_process.spawn)("claude", args, spawnOpts);
    let out = "";
    let done = false;
    const finish = (v) => {
      if (!done) {
        done = true;
        resolve3(v);
      }
    };
    const timer = setTimeout(() => {
      try {
        child.kill();
      } catch {
      }
      finish(null);
    }, TURN_TIMEOUT_MS);
    child.stdout.on("data", (c) => {
      out += c;
    });
    child.on("error", () => {
      clearTimeout(timer);
      finish(null);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      const text = out.trim();
      finish(code === 0 && text ? text.slice(0, SPEECH_MAX) : null);
    });
    child.stdin.write(prompt);
    child.stdin.end();
  });
}
var MeetingManager = class {
  constructor(emit) {
    this.emit = emit;
  }
  emit;
  current = null;
  stopFlag = false;
  get state() {
    return this.current;
  }
  isRunning() {
    return this.current?.status === "running";
  }
  stop() {
    if (this.isRunning()) this.stopFlag = true;
  }
  /** 회의 시작. 이미 진행 중이면 거절(false). */
  start(topic, npcs, rounds, model) {
    if (this.isRunning()) return false;
    const clean = topic.replace(/\s+/g, " ").trim().slice(0, 300);
    if (!clean) return false;
    const useNpcs = (npcs.length ? npcs : DEFAULT_NPCS).slice(0, 4).map((n) => ({
      name: String(n.name || "NPC").slice(0, 20),
      persona: String(n.persona || "").slice(0, 300)
    }));
    const useRounds = Math.min(4, Math.max(1, Math.floor(rounds) || 2));
    this.stopFlag = false;
    this.current = {
      id: stamp(/* @__PURE__ */ new Date()),
      topic: clean,
      npcs: useNpcs,
      rounds: useRounds,
      model: safeModel(model),
      speeches: [],
      status: "running"
    };
    void this.run();
    return true;
  }
  buildPrompt(npc, round) {
    const m = this.current;
    const transcript = m.speeches.map((s) => `${s.npc}: ${s.text}`).join("\n\n") || "(\uC544\uC9C1 \uBC1C\uC5B8 \uC5C6\uC74C)";
    const isLastOfRound = m.npcs[m.npcs.length - 1].name === npc.name;
    const isFinal = round === m.rounds && isLastOfRound;
    return [
      `\uD68C\uC758 \uC8FC\uC81C: ${m.topic}`,
      `\uCC38\uC11D\uC790: ${m.npcs.map((n) => n.name).join(", ")}`,
      `\uC9C0\uAE08\uAE4C\uC9C0\uC758 \uBC1C\uC5B8:
${transcript}`,
      "",
      isFinal ? "\uB2F9\uC2E0 \uCC28\uB840\uC785\uB2C8\uB2E4. \uB9C8\uC9C0\uB9C9 \uBC1C\uC5B8\uC774\uB2C8 \uB17C\uC758\uB97C \uC815\uB9AC\uD574 \uACB0\uB860\uACFC \uD6C4\uC18D \uD560 \uC77C\uC744 \uC81C\uC548\uD558\uC138\uC694. \uD55C\uAD6D\uC5B4\uB85C 2-4\uBB38\uC7A5." : "\uB2F9\uC2E0 \uCC28\uB840\uC785\uB2C8\uB2E4. \uC55E \uBC1C\uC5B8\uC5D0 \uBC18\uC751\uD558\uBA70 \uB17C\uC758\uB97C \uC9C4\uC804\uC2DC\uD0A4\uC138\uC694. \uD55C\uAD6D\uC5B4\uB85C 2-3\uBB38\uC7A5, \uC0C8 \uAD00\uC810\uC774\uB098 \uAD6C\uCCB4\uC801 \uC81C\uC548 \uD558\uB098\uB97C \uB2F4\uC544\uC11C."
    ].join("\n");
  }
  systemFor(npc) {
    return `\uB2F9\uC2E0\uC740 \uAC00\uC0C1 \uD68C\uC758\uC758 \uCC38\uC11D\uC790 "${npc.name}"\uB2E4. \uC131\uACA9: ${npc.persona} \uBC1C\uC5B8\uB9CC \uCD9C\uB825\uD558\uACE0 \uC774\uB984\uD45C\uB098 \uBA38\uB9AC\uB9D0\uC740 \uBD99\uC774\uC9C0 \uC54A\uB294\uB2E4.`;
  }
  async run() {
    const m = this.current;
    this.emit({ type: "meetingStarted", id: m.id, topic: m.topic, npcs: m.npcs.map((n) => n.name), rounds: m.rounds, model: m.model });
    for (let round = 1; round <= m.rounds; round++) {
      for (const npc of m.npcs) {
        if (this.stopFlag) {
          m.status = "stopped";
          this.emit({ type: "meetingEnded", id: m.id, status: m.status });
          return;
        }
        this.emit({ type: "meetingTurn", id: m.id, npc: npc.name, round });
        const text = await askClaude(this.buildPrompt(npc, round), this.systemFor(npc), m.model);
        if (text === null) {
          m.status = "error";
          m.error = `${npc.name} \uBC1C\uC5B8 \uD638\uCD9C \uC2E4\uD328(\uC2DC\uAC04 \uCD08\uACFC \uB610\uB294 claude \uC2E4\uD589 \uC624\uB958)`;
          this.emit({ type: "meetingEnded", id: m.id, status: m.status, error: m.error });
          return;
        }
        const speech = { npc: npc.name, text, ts: Date.now() };
        m.speeches.push(speech);
        this.emit({ type: "meetingSpeech", id: m.id, ...speech });
      }
    }
    m.minutesFile = this.saveMinutes(m);
    m.status = "done";
    this.emit({ type: "meetingEnded", id: m.id, status: m.status, minutesFile: path5.basename(m.minutesFile ?? "") });
    void this.extractTasks(m);
  }
  saveMinutes(m) {
    fs6.mkdirSync(MEETINGS_DIR, { recursive: true });
    const file = path5.join(MEETINGS_DIR, `${m.id}_${slug(m.topic)}.md`);
    const lines = [
      `# \uD68C\uC758\uB85D: ${m.topic}`,
      "",
      `- \uC77C\uC2DC: ${m.id.slice(0, 4)}-${m.id.slice(4, 6)}-${m.id.slice(6, 8)} ${m.id.slice(9, 11)}:${m.id.slice(11, 13)}`,
      `- \uCC38\uC11D: ${m.npcs.map((n) => n.name).join(", ")} (AI, ${m.model})`,
      `- \uD68C\uCC28: ${m.rounds}`,
      "",
      "## \uBC1C\uC5B8",
      "",
      ...m.speeches.map((s) => `**${s.npc}**: ${s.text}
`)
    ];
    fs6.writeFileSync(file, lines.join("\n"), "utf8");
    return file;
  }
  async extractTasks(m) {
    const transcript = m.speeches.map((s) => `${s.npc}: ${s.text}`).join("\n");
    const prompt = [
      `\uB2E4\uC74C \uD68C\uC758\uC5D0\uC11C \uACB0\uC815\uB41C \uD6C4\uC18D \uD560 \uC77C\uC744 \uBF51\uC544\uB77C. \uD68C\uC758 \uC8FC\uC81C: ${m.topic}`,
      transcript,
      "",
      '\uCD9C\uB825\uC740 JSON \uBC30\uC5F4\uB9CC: [{"title":"\uD560 \uC77C \uD55C \uC904","assignee":"\uC774\uB984","detail":"\uD55C \uBB38\uC7A5"}] \uCD5C\uB300 5\uAC1C. \uB2E4\uB978 \uAE00\uC790\uB294 \uC4F0\uC9C0 \uB9C8\uB77C.'
    ].join("\n");
    const raw = await askClaude(prompt, "\uD68C\uC758\uB85D\uC5D0\uC11C \uD560 \uC77C\uC744 \uCD94\uCD9C\uD558\uB294 \uC11C\uAE30\uB2E4. JSON \uBC30\uC5F4\uB9CC \uCD9C\uB825\uD55C\uB2E4.", m.model);
    if (!raw) return;
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return;
    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return;
    }
    if (!Array.isArray(parsed)) return;
    const tasks = loadTasks();
    let added = 0;
    for (const t of parsed.slice(0, 5)) {
      const title = typeof t.title === "string" ? t.title.slice(0, 120) : "";
      if (!title) continue;
      tasks.push({
        id: `${m.id}-${added}`,
        title,
        detail: typeof t.detail === "string" ? t.detail.slice(0, 300) : void 0,
        assignee: typeof t.assignee === "string" ? t.assignee.slice(0, 20) : void 0,
        status: "todo",
        createdAt: Date.now(),
        meetingId: m.id
      });
      added++;
    }
    if (added) {
      saveTasks(tasks);
      this.emit({ type: "kanbanTasks", tasks });
    }
  }
};
function listMinutes() {
  try {
    return fs6.readdirSync(MEETINGS_DIR).filter((f) => f.endsWith(".md")).sort().reverse().slice(0, 100).map((f) => ({ file: f, title: f.replace(/\.md$/, "") }));
  } catch {
    return [];
  }
}
function readMinutes(file) {
  if (file.includes("/") || file.includes("\\") || file.includes("..")) return null;
  try {
    return fs6.readFileSync(path5.join(MEETINGS_DIR, file), "utf8").slice(0, 2e5);
  } catch {
    return null;
  }
}
function loadTasks() {
  try {
    const o = JSON.parse(fs6.readFileSync(KANBAN_FILE, "utf8"));
    return Array.isArray(o) ? o.slice(0, 500) : [];
  } catch {
    return [];
  }
}
function saveTasks(tasks) {
  try {
    fs6.mkdirSync(path5.dirname(KANBAN_FILE), { recursive: true });
    const tmp = `${KANBAN_FILE}.${process.pid}.tmp`;
    fs6.writeFileSync(tmp, JSON.stringify(tasks.slice(0, 500), null, 1));
    fs6.renameSync(tmp, KANBAN_FILE);
  } catch {
  }
}

// extension/server/usage.ts
var fs7 = __toESM(require("node:fs"));
var https = __toESM(require("node:https"));
var os5 = __toESM(require("node:os"));
var path6 = __toESM(require("node:path"));

// extension/server/usageNormalize.ts
function clampPct(v) {
  const n = typeof v === "number" && Number.isFinite(v) ? v : 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}
function strOrNull(v) {
  return typeof v === "string" && v ? v : null;
}
function normalizeUsage(json) {
  if (!json || typeof json !== "object") return [];
  const o = json;
  if (Array.isArray(o.limits) && o.limits.length > 0) {
    const out2 = [];
    for (const raw of o.limits) {
      if (!raw || typeof raw !== "object") continue;
      const l = raw;
      if (typeof l.kind !== "string") continue;
      const item = {
        kind: l.kind,
        percent: clampPct(l.percent),
        severity: typeof l.severity === "string" ? l.severity : "normal",
        resetsAt: strOrNull(l.resets_at)
      };
      const scope = l.scope;
      const name = scope && typeof scope === "object" ? scope.model?.display_name : void 0;
      if (typeof name === "string" && name) item.label = name;
      out2.push(item);
    }
    return out2;
  }
  const out = [];
  const pick = (key, kind) => {
    const b = o[key];
    if (!b || typeof b !== "object") return;
    const bb = b;
    out.push({ kind, percent: clampPct(bb.utilization), severity: "normal", resetsAt: strOrNull(bb.resets_at) });
  };
  pick("five_hour", "session");
  pick("seven_day", "weekly_all");
  return out;
}
function classifyUsageError(status, hasCredentials) {
  if (!hasCredentials) return "no-credentials";
  if (status === 401 || status === 403) return "unauthorized";
  if (status === 429) return "rate-limited";
  return "fetch-failed";
}

// extension/server/usage.ts
var DEFAULT_CRED = path6.join(os5.homedir(), ".claude", ".credentials.json");
var DEFAULT_CACHE = path6.join(os5.homedir(), ".agent-office", "usage.json");
function readToken(credPath) {
  try {
    const o = JSON.parse(fs7.readFileSync(credPath, "utf8"));
    const t = o?.claudeAiOauth?.accessToken;
    return typeof t === "string" && t ? t : null;
  } catch {
    return null;
  }
}
var httpsFetch = (token) => new Promise((resolve3, reject) => {
  const req = https.request(
    {
      host: "api.anthropic.com",
      path: "/api/oauth/usage",
      method: "GET",
      timeout: 1e4,
      headers: { authorization: `Bearer ${token}`, "anthropic-beta": "oauth-2025-04-20", "user-agent": "agent-office-3d/usage" }
    },
    (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (c) => {
        body += c;
        if (body.length > 256 * 1024) req.destroy(new Error("too-large"));
      });
      res.on("end", () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch {
        }
        resolve3({ status: res.statusCode ?? 0, json });
      });
    }
  );
  req.on("timeout", () => req.destroy(new Error("timeout")));
  req.on("error", reject);
  req.end();
});
var UsagePoller = class {
  constructor(emit, opts = {}) {
    this.emit = emit;
    this.credPath = opts.credentialsPath ?? DEFAULT_CRED;
    this.cacheFile = opts.cacheFile === void 0 ? DEFAULT_CACHE : opts.cacheFile;
    this.fetchJson = opts.fetchJson ?? httpsFetch;
    this.intervalMs = opts.intervalMs ?? 6e4;
    this.minRefreshMs = opts.minRefreshMs ?? 3e4;
    this.backoffMs = opts.backoffMs ?? 5 * 6e4;
    this.lastMsg = this.loadCache();
  }
  emit;
  timer = null;
  lastMsg = null;
  inflight = false;
  lastFetchAt = 0;
  pausedUntil = 0;
  credPath;
  cacheFile;
  fetchJson;
  intervalMs;
  minRefreshMs;
  backoffMs;
  start() {
    if (this.timer) return;
    this.refreshNow();
    this.timer = setInterval(() => this.refreshNow(), this.intervalMs);
  }
  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
  last() {
    return this.lastMsg;
  }
  /** 지금 조회. 최소 간격 안이거나 429 대기 중이면 아무것도 하지 않는다. */
  refreshNow() {
    const now = Date.now();
    if (this.inflight || now < this.pausedUntil || now - this.lastFetchAt < this.minRefreshMs) return;
    this.inflight = true;
    this.lastFetchAt = now;
    void this.fetchOnce().finally(() => {
      this.inflight = false;
    });
  }
  async fetchOnce() {
    const prev = this.lastMsg?.limits ?? [];
    const token = readToken(this.credPath);
    if (!token) {
      this.publish({ type: "usageUpdate", fetchedAt: Date.now(), limits: prev, error: classifyUsageError(null, false) });
      return;
    }
    try {
      const { status, json } = await this.fetchJson(token);
      if (status === 429) this.pausedUntil = Date.now() + this.backoffMs;
      if (status !== 200) {
        this.publish({ type: "usageUpdate", fetchedAt: Date.now(), limits: prev, error: classifyUsageError(status, true) });
        return;
      }
      const msg = { type: "usageUpdate", fetchedAt: Date.now(), limits: normalizeUsage(json) };
      this.saveCache(msg);
      this.publish(msg);
    } catch (e) {
      console.error("[usage]", e.message);
      this.publish({ type: "usageUpdate", fetchedAt: Date.now(), limits: prev, error: classifyUsageError(null, true) });
    }
  }
  publish(m) {
    this.lastMsg = m;
    this.emit(m);
  }
  loadCache() {
    if (!this.cacheFile) return null;
    try {
      const o = JSON.parse(fs7.readFileSync(this.cacheFile, "utf8"));
      if (typeof o.fetchedAt !== "number" || !Array.isArray(o.limits)) return null;
      return { type: "usageUpdate", fetchedAt: o.fetchedAt, limits: o.limits };
    } catch {
      return null;
    }
  }
  saveCache(m) {
    if (!this.cacheFile) return;
    try {
      fs7.mkdirSync(path6.dirname(this.cacheFile), { recursive: true });
      const tmp = `${this.cacheFile}.${process.pid}.tmp`;
      fs7.writeFileSync(tmp, JSON.stringify({ fetchedAt: m.fetchedAt, limits: m.limits }));
      fs7.renameSync(tmp, this.cacheFile);
    } catch {
    }
  }
};

// extension/server/webchat.ts
var import_node_child_process2 = require("node:child_process");
var crypto2 = __toESM(require("node:crypto"));
var fs8 = __toESM(require("node:fs"));
var os6 = __toESM(require("node:os"));
var path7 = __toESM(require("node:path"));

// extension/server/webchatParse.ts
function parseStreamLine(line) {
  const s = line.trim();
  if (!s) return null;
  let j;
  try {
    j = JSON.parse(s);
  } catch {
    return null;
  }
  if (!j || typeof j !== "object") return null;
  if (j.type === "system" && j.subtype === "init" && typeof j.session_id === "string") return { kind: "init", sessionId: j.session_id };
  if (j.type === "assistant") {
    const msg = j.message;
    const content = Array.isArray(msg?.content) ? msg.content : [];
    const text = content.filter((b) => b && b.type === "text" && typeof b.text === "string").map((b) => b.text).join("");
    if (text) return { kind: "text", text };
    const tool = content.find((b) => b && b.type === "tool_use" && typeof b.name === "string");
    if (tool) return { kind: "tool", name: tool.name };
    return null;
  }
  if (j.type === "result") {
    return {
      kind: "result",
      text: typeof j.result === "string" ? j.result : "",
      costUsd: typeof j.total_cost_usd === "number" ? j.total_cost_usd : null,
      isError: j.is_error === true,
      sessionId: typeof j.session_id === "string" ? j.session_id : null
    };
  }
  return null;
}
function safeChatModel(m) {
  return safeModelId(m);
}
function buildClaudeArgs(o) {
  const args = ["-p", "--output-format", "stream-json", "--verbose", "--dangerously-skip-permissions"];
  const model = safeChatModel(o.model);
  if (model) args.push("--model", model);
  if (o.economy) args.push(...economyChatArgs());
  args.push(o.resume ? "--resume" : "--session-id", o.sessionId);
  return args;
}

// extension/server/webchat.ts
var HISTORY_MAX = 200;
var OUTPUT_MAX = 2e5;
var DEFAULT_STATE = path7.join(os6.homedir(), ".agent-office", "webchat.json");
function normForCompare(p) {
  let s = path7.resolve(p).replace(/[\\/]+/g, "/");
  if (s.length > 1) s = s.replace(/\/+$/, "");
  return process.platform === "win32" ? s.toLowerCase() : s;
}
function isAllowedCwd(requested, roots) {
  if (typeof requested !== "string" || !requested.trim() || requested.includes("\0")) return false;
  const c = normForCompare(requested.trim());
  return roots.some((root) => {
    if (typeof root !== "string" || !root.trim() || root.includes("\0")) return false;
    const r = normForCompare(root.trim());
    if (c === r) return true;
    return c.startsWith(r.endsWith("/") ? r : `${r}/`);
  });
}
function isExistingDir(p) {
  try {
    return fs8.statSync(p).isDirectory();
  } catch {
    return false;
  }
}
function defaultSpawn(args, cwd) {
  const isWin = process.platform === "win32";
  const child = isWin ? (0, import_node_child_process2.spawn)("cmd.exe", ["/d", "/s", "/c", "claude", ...args], { cwd, stdio: ["pipe", "pipe", "pipe"], windowsVerbatimArguments: false }) : (0, import_node_child_process2.spawn)("claude", args, { cwd, stdio: ["pipe", "pipe", "pipe"] });
  child.stderr?.on("data", () => {
  });
  return child;
}
function defaultKillTree(child) {
  if (process.platform === "win32" && typeof child.pid === "number") {
    try {
      (0, import_node_child_process2.spawn)("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
      return;
    } catch {
    }
  }
  try {
    child.kill();
  } catch {
  }
}
var WebChatManager = class {
  constructor(emit, deps) {
    this.emit = emit;
    this.deps = deps;
    this.stateFile = deps.stateFile ?? DEFAULT_STATE;
    this.spawnClaude = deps.spawnClaude ?? defaultSpawn;
    this.killTree = deps.killTree ?? defaultKillTree;
    this.turnTimeoutMs = deps.turnTimeoutMs ?? 10 * 6e4;
    this.stopGraceMs = deps.stopGraceMs ?? 5e3;
    this.st = this.load();
  }
  emit;
  deps;
  st;
  child = null;
  timer = null;
  stopRequested = false;
  stateFile;
  spawnClaude;
  killTree;
  turnTimeoutMs;
  stopGraceMs;
  stopTimer = null;
  load() {
    const base = { sessionId: null, cwd: os6.homedir(), model: "", history: [] };
    try {
      const o = JSON.parse(fs8.readFileSync(this.stateFile, "utf8"));
      return {
        sessionId: typeof o.sessionId === "string" ? o.sessionId : null,
        cwd: typeof o.cwd === "string" && o.cwd ? o.cwd : base.cwd,
        model: safeChatModel(o.model),
        history: Array.isArray(o.history) ? o.history.slice(-HISTORY_MAX) : []
      };
    } catch {
      return base;
    }
  }
  save() {
    try {
      fs8.mkdirSync(path7.dirname(this.stateFile), { recursive: true });
      const tmp = `${this.stateFile}.${process.pid}.tmp`;
      fs8.writeFileSync(tmp, JSON.stringify(this.st));
      fs8.renameSync(tmp, this.stateFile);
    } catch {
    }
  }
  get busy() {
    return this.child !== null;
  }
  stateMsg() {
    return {
      type: "webchatState",
      sessionId: this.st.sessionId,
      agentId: this.st.sessionId ? this.deps.findAgentId(this.st.sessionId) : null,
      busy: this.busy,
      cwd: this.st.cwd,
      model: this.st.model,
      watched: this.deps.isWatched(this.st.cwd),
      history: this.st.history
    };
  }
  /** 새 대화: 진행 중이면 거절. cwd/model 을 바꾸고 세션과 history 를 비운다. */
  reset(cwd, model) {
    if (this.busy) {
      this.emit({ type: "webchatError", reason: "busy" });
      return false;
    }
    if (typeof cwd === "string" && cwd.trim()) this.st.cwd = cwd.trim();
    if (model !== void 0) this.st.model = safeChatModel(model);
    this.st.sessionId = null;
    this.st.history = [];
    this.save();
    this.emit(this.stateMsg());
    return true;
  }
  /** 글 보내기. false = 거절(busy 또는 빈 글). */
  send(text, cwd, model) {
    const clean = text.replace(/\r\n/g, "\n").trim();
    if (!clean) {
      this.emit({ type: "webchatError", reason: "bad-input" });
      return false;
    }
    if (this.busy) {
      this.emit({ type: "webchatError", reason: "busy" });
      return false;
    }
    const target = path7.resolve(typeof cwd === "string" && cwd.trim() ? cwd.trim() : this.st.cwd);
    const allowed = this.deps.allowedRoots ? isAllowedCwd(target, this.deps.allowedRoots()) : this.deps.isWatched(target);
    if (!allowed || !isExistingDir(target)) {
      this.emit({ type: "webchatError", reason: "bad-input" });
      return false;
    }
    this.st.cwd = target;
    if (model !== void 0) this.st.model = safeChatModel(model);
    const resume2 = this.st.sessionId !== null;
    const sessionId = this.st.sessionId ?? crypto2.randomUUID();
    this.st.history.push({ role: "user", text: clean, ts: Date.now() });
    this.st.history = this.st.history.slice(-HISTORY_MAX);
    this.save();
    let child;
    try {
      child = this.spawnClaude(buildClaudeArgs({ sessionId, resume: resume2, model: this.st.model, economy: this.deps.economy?.() ?? false }), this.st.cwd);
    } catch {
      this.emit({ type: "webchatError", reason: "spawn-failed" });
      return false;
    }
    this.child = child;
    this.stopRequested = false;
    this.emit(this.stateMsg());
    let buf = "";
    let answer = "";
    let finished = false;
    const finish = (done) => {
      if (finished) return;
      finished = true;
      if (this.timer) clearTimeout(this.timer);
      this.timer = null;
      if (this.stopTimer) clearTimeout(this.stopTimer);
      this.stopTimer = null;
      this.child = null;
      child.stdout.removeAllListeners("data");
      if (answer) this.st.history.push({ role: "assistant", text: answer.slice(0, OUTPUT_MAX), ts: Date.now() });
      this.st.history = this.st.history.slice(-HISTORY_MAX);
      this.save();
      this.emit({ type: "webchatDone", ...done });
      this.emit(this.stateMsg());
    };
    const handleLine = (line) => {
      if (finished) return;
      const ev = parseStreamLine(line);
      if (!ev) return;
      if (ev.kind === "init") {
        if (!this.st.sessionId) {
          this.st.sessionId = ev.sessionId;
          this.save();
          this.emit(this.stateMsg());
        }
      } else if (ev.kind === "text") {
        answer += (answer ? "\n" : "") + ev.text;
        this.emit({ type: "webchatDelta", text: ev.text });
      } else if (ev.kind === "tool") {
        this.emit({ type: "webchatDelta", tool: ev.name });
      } else if (ev.kind === "result") {
        if (!answer && ev.text) {
          answer = ev.text;
          this.emit({ type: "webchatDelta", text: ev.text });
        }
        if (ev.sessionId && !this.st.sessionId) this.st.sessionId = ev.sessionId;
        finish({ costUsd: ev.costUsd ?? void 0, isError: ev.isError, error: ev.isError ? "claude-error" : void 0 });
      }
    };
    child.stdout.on("data", (c) => {
      buf += c.toString();
      if (buf.length > OUTPUT_MAX) buf = buf.slice(-OUTPUT_MAX);
      let i;
      while ((i = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, i);
        buf = buf.slice(i + 1);
        handleLine(line);
      }
    });
    child.on("error", () => finish({ isError: true, error: "spawn-failed" }));
    child.on("close", (code) => {
      if (buf.trim()) handleLine(buf);
      buf = "";
      if (this.stopRequested) {
        this.stopRequested = false;
        finish({ isError: true, error: "stopped" });
        return;
      }
      const failed = code !== 0 && !answer;
      finish({ isError: failed, error: failed ? "claude-error" : void 0 });
    });
    this.timer = setTimeout(() => {
      finish({ isError: true, error: "timeout" });
      this.killTree(child);
    }, this.turnTimeoutMs);
    this.finishCurrent = finish;
    child.stdin.write(clean);
    child.stdin.end();
    return true;
  }
  /** 진행 중인 턴을 끝맺는 함수(send 안에서 만든 finish). 없으면 null. */
  finishCurrent = null;
  stop() {
    if (!this.child) return;
    this.stopRequested = true;
    const child = this.child;
    this.killTree(child);
    if (this.stopTimer) clearTimeout(this.stopTimer);
    this.stopTimer = setTimeout(() => {
      this.stopTimer = null;
      this.stopRequested = false;
      this.finishCurrent?.({ isError: true, error: "stopped" });
    }, this.stopGraceMs);
  }
  dispose() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    if (this.stopTimer) clearTimeout(this.stopTimer);
    this.stopTimer = null;
    if (this.child) this.killTree(this.child);
    this.child = null;
  }
};

// extension/server/wsGuard.ts
function isAllowedOrigin(origin, hostHeader, port2) {
  if (origin === void 0 || origin === "") return true;
  const allowed = /* @__PURE__ */ new Set([`http://localhost:${port2}`, `http://127.0.0.1:${port2}`]);
  if (hostHeader) allowed.add(`http://${hostHeader}`);
  return allowed.has(origin);
}
function isClientMessageShape(x) {
  return !!x && typeof x === "object" && !Array.isArray(x) && typeof x.type === "string";
}

// extension/server/timeline.ts
var fs9 = __toESM(require("node:fs"));
var os7 = __toESM(require("node:os"));
var path8 = __toESM(require("node:path"));

// extension/core/timeline.ts
function localDateKey(ms) {
  const d = new Date(ms);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function addSample(rows, agentKey, name, state, now, intervalMs, maxGapMs = intervalMs * 2 + 5e3) {
  let row = rows.find((r) => r.agentKey === agentKey);
  if (!row) {
    row = { agentKey, name, segments: [] };
    rows.push(row);
  }
  if (name) row.name = name;
  const last = row.segments[row.segments.length - 1];
  if (last && now < last.to) return;
  const contiguous = !!last && now - last.to <= maxGapMs;
  if (contiguous && last.state === state) {
    last.to = now;
    return;
  }
  const from = contiguous ? last.to : now - intervalMs;
  row.segments.push({ from: last ? Math.max(from, last.to) : from, to: now, state });
}
function sanitizeRows(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const r of raw) {
    if (!r || typeof r !== "object") continue;
    const o = r;
    if (typeof o.agentKey !== "string" || !Array.isArray(o.segments)) continue;
    const segments = [];
    for (const s of o.segments) {
      if (!s || typeof s !== "object") continue;
      const g = s;
      if (typeof g.from !== "number" || typeof g.to !== "number" || g.to < g.from) continue;
      if (g.state !== "work" && g.state !== "wait") continue;
      segments.push({ from: g.from, to: g.to, state: g.state });
    }
    out.push({ agentKey: o.agentKey, name: typeof o.name === "string" ? o.name : "", segments });
  }
  return out;
}
var FILE_RE = /^timeline-(\d{4}-\d{2}-\d{2})\.json$/;
function filesToPrune(names2, today, keepDays) {
  const t = Date.parse(`${today}T00:00:00Z`);
  const cutoff = t - (keepDays - 1) * 864e5;
  return names2.filter((n) => {
    const m = FILE_RE.exec(n);
    if (!m) return false;
    const d = Date.parse(`${m[1]}T00:00:00Z`);
    return Number.isFinite(d) && d < cutoff;
  });
}

// extension/server/timeline.ts
var SAMPLE_MS = 15e3;
var SAVE_MS = 6e4;
var KEEP_DAYS2 = 14;
function agentTimelineState(a) {
  return !a.isWaiting || a.activeToolIds.size > 0 || a.subagentToolIds.size > 0 ? "work" : "wait";
}
var TimelineRecorder = class {
  constructor(store2, dir = path8.join(os7.homedir(), ".agent-office")) {
    this.store = store2;
    this.dir = dir;
  }
  store;
  dir;
  date = "";
  rows = [];
  dirty = false;
  lastSave = 0;
  timer;
  onExit = () => this.save();
  start() {
    if (this.timer) return;
    this.switchDay(localDateKey(Date.now()));
    this.prune();
    this.timer = setInterval(() => this.tick(), SAMPLE_MS);
    this.timer.unref?.();
    process.on("exit", this.onExit);
  }
  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = void 0;
    process.off("exit", this.onExit);
    this.save();
  }
  /** Message for the webview: {type:"timeline", date, rows}. */
  snapshot() {
    return { type: "timeline", date: this.date, rows: this.rows };
  }
  tick(now = Date.now()) {
    try {
      const day = localDateKey(now);
      if (day !== this.date) {
        this.save();
        this.switchDay(day);
        this.prune();
      }
      for (const a of this.store.values()) {
        addSample(this.rows, a.filePath, a.customName || a.folderName, agentTimelineState(a), now, SAMPLE_MS);
        this.dirty = true;
      }
      if (now - this.lastSave >= SAVE_MS) this.save();
    } catch (e) {
      console.error("[timeline] tick failed:", e.message);
    }
  }
  file(day) {
    return path8.join(this.dir, `timeline-${day}.json`);
  }
  switchDay(day) {
    this.date = day;
    this.rows = [];
    this.dirty = false;
    try {
      const raw = JSON.parse(fs9.readFileSync(this.file(day), "utf8"));
      this.rows = sanitizeRows(raw?.rows);
    } catch {
    }
  }
  save() {
    this.lastSave = Date.now();
    if (!this.dirty || !this.date) return;
    try {
      fs9.mkdirSync(this.dir, { recursive: true });
      const target = this.file(this.date);
      const tmp = `${target}.tmp`;
      fs9.writeFileSync(tmp, JSON.stringify({ date: this.date, rows: this.rows }));
      fs9.renameSync(tmp, target);
      this.dirty = false;
    } catch (e) {
      console.error("[timeline] save failed:", e.message);
    }
  }
  prune() {
    try {
      for (const n of filesToPrune(fs9.readdirSync(this.dir), this.date, KEEP_DAYS2)) {
        try {
          fs9.unlinkSync(path8.join(this.dir, n));
        } catch {
        }
      }
    } catch {
    }
  }
};

// extension/server/resume.ts
var import_node_child_process3 = require("node:child_process");
var fs10 = __toESM(require("node:fs"));
var RESUME_TEXT_MAX = 2e4;
var SESSION_RE = /^[0-9a-f-]{36}$/i;
var OUTPUT_MAX2 = 2e5;
function validateResume(req, allowed) {
  if (!req || typeof req !== "object") return "bad-input";
  const text = typeof req.text === "string" ? req.text.replace(/\r\n/g, "\n").trim() : "";
  if (!text || text.length > RESUME_TEXT_MAX || text.includes("\0")) return "bad-text";
  if (typeof req.sessionId !== "string" || !SESSION_RE.test(req.sessionId)) return "bad-session";
  if (req.mode !== "safe" && req.mode !== "full") return "bad-mode";
  if (typeof req.cwd !== "string" || !req.cwd.trim() || req.cwd.includes("\0")) return "bad-cwd";
  let ok = false;
  try {
    ok = allowed(req.cwd);
  } catch {
    ok = false;
  }
  if (!ok) return "bad-cwd";
  if (req.agentIdle !== true) return "busy";
  return null;
}
function buildResumeArgs(sessionId, mode, model) {
  const args = ["-p", "--resume", sessionId, "--output-format", "stream-json", "--verbose"];
  if (mode === "full") args.push("--dangerously-skip-permissions");
  else args.push("--permission-mode", "acceptEdits");
  const m = safeModelId(model);
  if (m) args.push("--model", m);
  return args;
}
function cwdFromTranscript(filePath, maxBytes = 256 * 1024) {
  let fd = null;
  try {
    fd = fs10.openSync(filePath, "r");
    const buf = Buffer.alloc(maxBytes);
    const n = fs10.readSync(fd, buf, 0, maxBytes, 0);
    for (const line of buf.subarray(0, n).toString("utf8").split("\n")) {
      if (!line.includes('"cwd"')) continue;
      try {
        const o = JSON.parse(line);
        if (o && typeof o.cwd === "string" && o.cwd) return o.cwd;
      } catch {
      }
    }
    return null;
  } catch {
    return null;
  } finally {
    if (fd !== null) {
      try {
        fs10.closeSync(fd);
      } catch {
      }
    }
  }
}
function isExistingDir2(p) {
  try {
    return fs10.statSync(p).isDirectory();
  } catch {
    return false;
  }
}
function defaultSpawn2(args, cwd) {
  const isWin = process.platform === "win32";
  const child = isWin ? (0, import_node_child_process3.spawn)("cmd.exe", ["/d", "/s", "/c", "claude", ...args], { cwd, stdio: ["pipe", "pipe", "pipe"], windowsVerbatimArguments: false, windowsHide: true }) : (0, import_node_child_process3.spawn)("claude", args, { cwd, stdio: ["pipe", "pipe", "pipe"] });
  child.stderr?.on("data", () => {
  });
  return child;
}
function defaultKillTree2(child) {
  if (process.platform === "win32" && typeof child.pid === "number") {
    try {
      (0, import_node_child_process3.spawn)("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
      return;
    } catch {
    }
  }
  try {
    child.kill();
  } catch {
  }
}
var ResumeRunner = class {
  constructor(deps) {
    this.deps = deps;
    this.spawnClaude = deps.spawnClaude ?? defaultSpawn2;
    this.killTree = deps.killTree ?? defaultKillTree2;
    this.timeoutMs = deps.timeoutMs ?? 10 * 6e4;
    this.stopGraceMs = deps.stopGraceMs ?? 5e3;
  }
  deps;
  runs = /* @__PURE__ */ new Map();
  spawnClaude;
  killTree;
  timeoutMs;
  stopGraceMs;
  isBusy(agentId) {
    return this.runs.has(agentId);
  }
  /** Current busy flags, e.g. for a snapshot to a newly connected client. */
  busyAgents() {
    return [...this.runs.keys()];
  }
  error(agentId, reason) {
    this.deps.emit({ type: "resumeError", agentId, reason });
    return false;
  }
  /** false = rejected (a resumeError was emitted). */
  send(req) {
    const agentId = typeof req?.agentId === "number" && Number.isFinite(req.agentId) ? req.agentId : -1;
    if (agentId < 0) return this.error(agentId, "bad-input");
    if (this.runs.has(agentId)) return this.error(agentId, "running");
    const bad = validateResume(req, this.deps.isAllowedCwd);
    if (bad) return this.error(agentId, bad);
    const cwd = req.cwd.trim();
    if (!isExistingDir2(cwd)) return this.error(agentId, "bad-cwd");
    const text = req.text.replace(/\r\n/g, "\n").trim();
    let child;
    try {
      child = this.spawnClaude(buildResumeArgs(req.sessionId, req.mode, req.model), cwd);
    } catch {
      return this.error(agentId, "spawn-failed");
    }
    let finished = false;
    let buf = "";
    let gotResult = false;
    const run = {
      child,
      stopRequested: false,
      timer: null,
      stopTimer: null,
      finish: (ok, reason) => {
        if (finished) return;
        finished = true;
        if (run.timer) clearTimeout(run.timer);
        if (run.stopTimer) clearTimeout(run.stopTimer);
        run.timer = run.stopTimer = null;
        child.stdout.removeAllListeners("data");
        this.runs.delete(agentId);
        if (!ok && reason) this.deps.emit({ type: "resumeError", agentId, reason });
        this.deps.emit({ type: "resumeDone", agentId, ok });
        this.deps.emit({ type: "resumeState", agentId, busy: false });
      }
    };
    this.runs.set(agentId, run);
    this.deps.emit({ type: "resumeState", agentId, busy: true });
    const handleLine = (line) => {
      if (finished) return;
      const ev = parseStreamLine(line);
      if (ev?.kind === "result") {
        gotResult = true;
        run.finish(!ev.isError, ev.isError ? "claude-error" : void 0);
      }
    };
    child.stdout.on("data", (c) => {
      buf += c.toString();
      if (buf.length > OUTPUT_MAX2) buf = buf.slice(-OUTPUT_MAX2);
      let i;
      while ((i = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, i);
        buf = buf.slice(i + 1);
        handleLine(line);
      }
    });
    child.on("error", () => run.finish(false, "spawn-failed"));
    child.on("close", (code) => {
      if (buf.trim()) handleLine(buf);
      buf = "";
      if (run.stopRequested) return run.finish(false, "stopped");
      if (!gotResult) run.finish(code === 0, code === 0 ? void 0 : "claude-error");
    });
    run.timer = setTimeout(() => {
      run.finish(false, "timeout");
      this.killTree(child);
    }, this.timeoutMs);
    try {
      child.stdin.write(text);
      child.stdin.end();
    } catch {
      run.finish(false, "spawn-failed");
      this.killTree(child);
      return false;
    }
    return true;
  }
  stop(agentId) {
    const run = this.runs.get(agentId);
    if (!run) return;
    run.stopRequested = true;
    this.killTree(run.child);
    if (run.stopTimer) clearTimeout(run.stopTimer);
    run.stopTimer = setTimeout(() => run.finish(false, "stopped"), this.stopGraceMs);
  }
  dispose() {
    for (const run of [...this.runs.values()]) {
      if (run.timer) clearTimeout(run.timer);
      if (run.stopTimer) clearTimeout(run.stopTimer);
      this.killTree(run.child);
    }
    this.runs.clear();
  }
};

// extension/server/archive.ts
var fs11 = __toESM(require("node:fs"));
var path9 = __toESM(require("node:path"));
var HEAD_BYTES = 64 * 1024;
var MAX_SESSIONS = 300;
var MSG_TEXT_MAX = 6e3;
var TITLE_MAX = 80;
var READ_MAX_BYTES = 40 * 1024 * 1024;
var FALLBACK_TITLE = "(\uC81C\uBAA9 \uC5C6\uC74C)";
function decodeFolder(dir) {
  const parts = dir.split("-").filter(Boolean);
  return parts.length ? parts[parts.length - 1] : dir;
}
function userTextOf(o) {
  if (!o || typeof o !== "object") return "";
  const r = o;
  if (r.type !== "user" || !r.message || r.isMeta === true) return "";
  const c = r.message.content;
  const parts = [];
  if (typeof c === "string") parts.push(c);
  else if (Array.isArray(c)) {
    for (const b of c) {
      if (b && b.type === "text" && typeof b.text === "string") parts.push(b.text);
    }
  }
  return parts.filter((s) => s.trim() && !s.trimStart().startsWith("<")).join("\n\n");
}
function assistantTextOf(o) {
  if (!o || typeof o !== "object") return "";
  const r = o;
  if (r.type !== "assistant" || !r.message) return "";
  const c = r.message.content;
  if (typeof c === "string") return c;
  if (!Array.isArray(c)) return "";
  const parts = [];
  for (const b of c) {
    if (b && b.type === "text" && typeof b.text === "string" && b.text.trim()) parts.push(b.text);
  }
  return parts.join("\n\n");
}
function parseLine(line) {
  if (!line.trim()) return null;
  try {
    const o = JSON.parse(line);
    return o && typeof o === "object" && !Array.isArray(o) ? o : null;
  } catch {
    return null;
  }
}
function tsOf(o) {
  if (typeof o.timestamp === "string") {
    const ms = Date.parse(o.timestamp);
    if (!Number.isNaN(ms)) return ms;
  }
  return 0;
}
function parseHead(headText) {
  let title = "";
  let startedAt = 0;
  let turns = 0;
  let cwd;
  for (const line of headText.split("\n")) {
    const o = parseLine(line);
    if (!o) continue;
    if (!startedAt) startedAt = tsOf(o);
    if (!cwd && typeof o.cwd === "string") cwd = o.cwd;
    const u = userTextOf(o);
    if (!u) continue;
    turns++;
    if (!title) title = u.replace(/\s+/g, " ").trim().slice(0, TITLE_MAX);
  }
  return { title: title || FALLBACK_TITLE, startedAt, turns, cwd };
}
function folderOfCwd(cwd) {
  if (!cwd) return "";
  const parts = cwd.split(/[\\/]+/).filter(Boolean);
  return parts[parts.length - 1] ?? "";
}
function matchesQuery(s, query) {
  const q = (query ?? "").trim().toLowerCase();
  if (!q) return true;
  const hay = `${s.title} ${s.folder}`.toLowerCase();
  return q.split(/\s+/).every((w) => hay.includes(w));
}
function safeResolve(root, file, p = path9) {
  if (typeof file !== "string" || !file || file.includes("\0")) return null;
  if (file.includes("..")) return null;
  if (!file.toLowerCase().endsWith(".jsonl")) return null;
  if (p.isAbsolute(file) || /^[a-zA-Z]:/.test(file) || file.startsWith("/") || file.startsWith("\\")) return null;
  const base = p.resolve(root);
  const full = p.resolve(base, file);
  const rel = p.relative(base, full);
  if (!rel || rel.startsWith("..") || p.isAbsolute(rel)) return null;
  return full;
}
function readHead(full, size) {
  const n = Math.min(size, HEAD_BYTES);
  if (n <= 0) return "";
  const fd = fs11.openSync(full, "r");
  try {
    const buf = Buffer.alloc(n);
    const got = fs11.readSync(fd, buf, 0, n, 0);
    return buf.subarray(0, got).toString("utf8");
  } finally {
    fs11.closeSync(fd);
  }
}
function listSessions(root, opts = {}) {
  const days = opts.days && opts.days > 0 ? opts.days : 14;
  const since = Date.now() - days * 864e5;
  let dirs2;
  try {
    dirs2 = fs11.readdirSync(root, { withFileTypes: true });
  } catch {
    return [];
  }
  const cand = [];
  for (const d of dirs2) {
    if (!d.isDirectory()) continue;
    let names2;
    try {
      names2 = fs11.readdirSync(path9.join(root, d.name));
    } catch {
      continue;
    }
    for (const name of names2) {
      if (!name.endsWith(".jsonl")) continue;
      const full = path9.join(root, d.name, name);
      try {
        const st = fs11.statSync(full);
        if (st.isFile() && st.mtimeMs >= since) cand.push({ dir: d.name, name, full, st });
      } catch {
      }
    }
  }
  cand.sort((a, b) => b.st.mtimeMs - a.st.mtimeMs);
  const q = (opts.query ?? "").trim();
  const out = [];
  for (const c of cand) {
    if (out.length >= MAX_SESSIONS) break;
    let head = "";
    try {
      head = readHead(c.full, c.st.size);
    } catch {
      continue;
    }
    const h = parseHead(head);
    const info = {
      file: `${c.dir}/${c.name}`,
      folder: folderOfCwd(h.cwd) || decodeFolder(c.dir),
      sessionId: c.name.slice(0, -".jsonl".length),
      startedAt: h.startedAt || Math.min(c.st.birthtimeMs || c.st.mtimeMs, c.st.mtimeMs),
      lastAt: c.st.mtimeMs,
      sizeKb: Math.round(c.st.size / 1024),
      title: h.title,
      turns: h.turns,
      partial: c.st.size > HEAD_BYTES
    };
    if (q && !matchesQuery(info, q)) continue;
    out.push(info);
  }
  return out;
}
function readSession(root, file, maxMessages = 400) {
  const full = safeResolve(root, file);
  if (!full) return { error: "\uD5C8\uC6A9\uB418\uC9C0 \uC54A\uC740 \uACBD\uB85C\uC785\uB2C8\uB2E4." };
  let text;
  try {
    const st = fs11.statSync(full);
    if (!st.isFile()) return { error: "\uD30C\uC77C\uC774 \uC544\uB2D9\uB2C8\uB2E4." };
    if (st.size > READ_MAX_BYTES) {
      const fd = fs11.openSync(full, "r");
      try {
        const buf = Buffer.alloc(READ_MAX_BYTES);
        const got = fs11.readSync(fd, buf, 0, READ_MAX_BYTES, 0);
        text = buf.subarray(0, got).toString("utf8");
      } finally {
        fs11.closeSync(fd);
      }
    } else {
      text = fs11.readFileSync(full, "utf8");
    }
  } catch {
    return { error: "\uD30C\uC77C\uC744 \uC77D\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4." };
  }
  const messages = [];
  let truncated = false;
  for (const line of text.split("\n")) {
    const o = parseLine(line);
    if (!o) continue;
    const u = userTextOf(o);
    const a = u ? "" : assistantTextOf(o);
    const t = u || a;
    if (!t.trim()) continue;
    if (messages.length >= maxMessages) {
      truncated = true;
      break;
    }
    const clean = t.replace(/\s+$/, "");
    messages.push({
      role: u ? "user" : "assistant",
      text: clean.length > MSG_TEXT_MAX ? `${clean.slice(0, MSG_TEXT_MAX)}
\u2026` : clean,
      ts: tsOf(o)
    });
  }
  return truncated ? { messages, truncated } : { messages };
}

// extension/server/staticFiles.ts
var fs12 = __toESM(require("node:fs"));
var path10 = __toESM(require("node:path"));
var zlib = __toESM(require("node:zlib"));
var MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};
var COMPRESSIBLE = /* @__PURE__ */ new Set([".html", ".js", ".css", ".json", ".svg"]);
var cache = /* @__PURE__ */ new Map();
function pickEncoding(acceptEncoding) {
  const a = (acceptEncoding || "").toLowerCase();
  if (/\bbr\b/.test(a)) return "br";
  if (/\bgzip\b/.test(a)) return "gzip";
  return "";
}
function load(filePath, st) {
  const key = `${st.mtimeMs}-${st.size}`;
  const hit = cache.get(filePath);
  if (hit && hit.key === key) return hit;
  const raw = fs12.readFileSync(filePath);
  const ext = path10.extname(filePath);
  const e = { key, etag: `"${Math.round(st.mtimeMs).toString(36)}-${st.size.toString(36)}"`, raw, type: MIME[ext] || "application/octet-stream" };
  if (COMPRESSIBLE.has(ext) && raw.length > 1024) {
    e.br = zlib.brotliCompressSync(raw, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 9 } });
    e.gz = zlib.gzipSync(raw, { level: 9 });
  }
  cache.set(filePath, e);
  return e;
}
function serveStatic(root, req, res) {
  let rel;
  try {
    rel = decodeURIComponent((req.url || "/").split("?")[0]);
  } catch {
    res.writeHead(400);
    res.end();
    return;
  }
  if (rel === "/") rel = "/index.html";
  const filePath = path10.join(root, path10.normalize(rel));
  if (!filePath.startsWith(root + path10.sep)) {
    res.writeHead(403);
    res.end();
    return;
  }
  let st;
  try {
    st = fs12.statSync(filePath);
    if (!st.isFile()) throw new Error("not a file");
  } catch {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  let e;
  try {
    e = load(filePath, st);
  } catch {
    res.writeHead(500);
    res.end();
    return;
  }
  const headers = { "content-type": e.type, etag: e.etag, "cache-control": "no-cache", vary: "Accept-Encoding" };
  if (req.headers["if-none-match"] === e.etag) {
    res.writeHead(304, headers);
    res.end();
    return;
  }
  const enc = pickEncoding(req.headers["accept-encoding"]);
  const body = enc === "br" && e.br ? e.br : enc === "gzip" && e.gz ? e.gz : e.raw;
  if (body !== e.raw) headers["content-encoding"] = enc;
  headers["content-length"] = String(body.length);
  res.writeHead(200, headers);
  res.end(req.method === "HEAD" ? void 0 : body);
}

// extension/cli/main.ts
var VERSION = "0.1.6";
var HEAD_BYTES2 = 8192;
var argv = process.argv.slice(2);
var port = 3100;
var paths = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--port" || a === "-p") port = parseInt(argv[++i], 10) || port;
  else if (a === "--economy") i++;
  else if (a === "--help" || a === "-h") {
    console.log("agent-office \u2014 Claude Code agentlaringizni brauzerda 3D ofisda kuzating\n");
    console.log("Foydalanish: agent-office [loyiha-yo'li...] [--port 3100]\n");
    console.log("  loyiha-yo'li   Kuzatiladigan loyiha papkasi (default: joriy papka)");
    console.log("  --port, -p     HTTP/WS porti (default: 3100)");
    process.exit(0);
  } else if (!a.startsWith("-")) paths.push(path11.resolve(a));
}
if (paths.length === 0) paths.push(process.cwd());
var store = new AgentStateStore();
var watcher = new FileWatcher(store);
watcher.start();
var subWatcher = new SubagentWatcher(store);
subWatcher.start();
var timeline = new TimelineRecorder(store);
timeline.start();
var history = new HistoryStore();
history.load();
var startupTime = Date.now();
var economy = { on: economyDefault(argv, fs13.existsSync(path11.join(__dirname, "..", ".git"))) };
meetingEconomy.on = economy.on;
var RECENT_SESSION_MS = 30 * 6e4;
var dismissed = /* @__PURE__ */ new Map();
var dirs = paths.map((p) => ({ dir: getSessionDir(p), folderName: path11.basename(p) }));
function readFirstTask(filePath) {
  let fd;
  try {
    fd = fs13.openSync(filePath, "r");
    const buf = Buffer.alloc(HEAD_BYTES2);
    const n = fs13.readSync(fd, buf, 0, HEAD_BYTES2, 0);
    return extractFirstTask(buf.toString("utf8", 0, n));
  } catch {
    return "\uD074\uB85C\uB4DC \uCF54\uB4DC \uC138\uC158";
  } finally {
    if (fd !== void 0) try {
      fs13.closeSync(fd);
    } catch {
    }
  }
}
function aoFile(name) {
  return path11.join(os8.homedir(), ".agent-office", name);
}
function loadStrMap(name) {
  try {
    const o = JSON.parse(fs13.readFileSync(aoFile(name), "utf8"));
    return o && typeof o === "object" && !Array.isArray(o) ? o : {};
  } catch {
    return {};
  }
}
function saveStrMap(name, map) {
  try {
    const p = aoFile(name);
    fs13.mkdirSync(path11.dirname(p), { recursive: true });
    const tmp = `${p}.${process.pid}.tmp`;
    fs13.writeFileSync(tmp, JSON.stringify(map));
    fs13.renameSync(tmp, p);
  } catch {
  }
}
var namesCache = null;
var rolesCache = null;
function names() {
  if (!namesCache) namesCache = loadStrMap("names.json");
  return namesCache;
}
function roles() {
  if (!rolesCache) rolesCache = loadStrMap("roles.json");
  return rolesCache;
}
function adopt(filePath, folderName) {
  const sessionId = path11.basename(filePath, ".jsonl");
  if (store.findByFile(filePath) || store.findBySession(sessionId)) return null;
  const id = store.allocateId();
  const agent = createAgentState(id, filePath, folderName, { isExternal: true, sessionId, task: readFirstTask(filePath) });
  const savedName = names()[sessionId];
  if (savedName) agent.customName = savedName;
  const savedRole = roles()[sessionId];
  if (savedRole) {
    agent.role = savedRole;
    agent.roleManual = true;
  }
  watcher.primeFromStart(agent);
  store.add(agent);
  watcher.emitSnapshot(agent);
  return agent;
}
function scan() {
  for (const { dir, folderName } of dirs) {
    let entries;
    try {
      entries = fs13.readdirSync(dir);
    } catch {
      continue;
    }
    for (const name of entries) {
      if (!name.endsWith(".jsonl")) continue;
      const filePath = path11.join(dir, name);
      const sid = path11.basename(name, ".jsonl");
      if (store.findByFile(filePath) || store.findBySession(sid)) continue;
      const gone = dismissed.get(filePath);
      if (gone !== void 0) {
        try {
          if (fs13.statSync(filePath).mtimeMs <= gone) continue;
        } catch {
          continue;
        }
        dismissed.delete(filePath);
      }
      try {
        if (fs13.statSync(filePath).mtimeMs < startupTime - RECENT_SESSION_MS) continue;
      } catch {
        continue;
      }
      adopt(filePath, folderName);
    }
  }
  for (const a of store.values()) {
    if (!fs13.existsSync(a.filePath)) store.remove(a.id);
  }
}
setInterval(scan, 1e3);
scan();
var hookActive = false;
function inProjects(cwd) {
  const norm = (p) => path11.resolve(p).replace(/[\\/]+$/, "").toLowerCase();
  const c = norm(cwd);
  return paths.some((p) => c === norm(p) || c.startsWith(norm(p) + path11.sep.toLowerCase()) || c.startsWith(norm(p) + "/"));
}
var hookServer = new HookServer((sessionId, raw) => {
  let agent = store.findBySession(sessionId);
  if (!agent) {
    const cwd = typeof raw.cwd === "string" ? raw.cwd : void 0;
    if (!cwd || !inProjects(cwd)) return;
    agent = adopt(path11.join(getSessionDir(cwd), `${sessionId}.jsonl`), path11.basename(cwd)) ?? void 0;
    if (agent) agent.sessionId = sessionId;
  }
  if (agent) handleHookEvent(store, agent, raw);
  const now = Date.now();
  if (now - lastHookStatusAt > 3e4) {
    lastHookStatusAt = now;
    broadcastAll(hookStatusMsg());
  }
}, () => paths);
var lastHookStatusAt = 0;
function hookStatusMsg() {
  return { type: "hookStatus", active: hookActive, port: hookServer.portNumber || void 0, lastEventAt: hookServer.lastEventAt || void 0 };
}
void hookServer.start().then((h) => {
  hookActive = !!h;
  broadcastAll(hookStatusMsg());
});
function layoutPath() {
  return path11.join(os8.homedir(), ".agent-office", "layout.json");
}
function loadLayout() {
  try {
    const o = JSON.parse(fs13.readFileSync(layoutPath(), "utf8"));
    return {
      items: Array.isArray(o?.items) ? o.items : [],
      floorColor: typeof o?.floorColor === "string" ? o.floorColor : null,
      wallColor: typeof o?.wallColor === "string" ? o.wallColor : null,
      packs: Array.isArray(o?.packs) ? o.packs : []
    };
  } catch {
    return { items: [], floorColor: null, wallColor: null, packs: [] };
  }
}
function saveLayout(items, floorColor, wallColor, packs) {
  try {
    const p = layoutPath();
    fs13.mkdirSync(path11.dirname(p), { recursive: true });
    const tmp = `${p}.${process.pid}.tmp`;
    fs13.writeFileSync(tmp, JSON.stringify({ items, floorColor, wallColor, packs }));
    fs13.renameSync(tmp, p);
  } catch {
  }
}
var WEB_ROOT = path11.join(__dirname, "webview");
var server = http2.createServer((req, res) => serveStatic(WEB_ROOT, req, res));
var wss = new import_websocket_server.default({
  server,
  verifyClient: ({ origin, req }) => isAllowedOrigin(origin || void 0, req.headers.host, port)
});
var clients = /* @__PURE__ */ new Set();
function broadcastAll(msg) {
  const s = JSON.stringify(msg);
  for (const c of clients) if (c.readyState === c.OPEN) c.send(s);
}
store.on("broadcast", (m) => broadcastAll(m));
store.on("agentAdded", (a) => broadcastAll({ type: "agentCreated", id: a.id, folderName: a.folderName, isExternal: a.isExternal, role: a.role, task: a.task }));
store.on("agentRemoved", (id) => broadcastAll({ type: "agentClosed", id }));
wss.on("connection", (ws) => {
  clients.add(ws);
  ws.on("message", (data) => {
    let parsed;
    try {
      parsed = JSON.parse(data.toString());
    } catch {
      return;
    }
    if (!isClientMessageShape(parsed)) return;
    handleClient(parsed, ws);
  });
  ws.on("close", () => clients.delete(ws));
});
var NPC_BASE_ID = 9e3;
var npcIds = /* @__PURE__ */ new Map();
var meeting = new MeetingManager((m) => {
  broadcastAll(m);
  if (m.type === "meetingStarted") {
    const names2 = m.npcs;
    names2.forEach((name, i) => {
      const id = NPC_BASE_ID + i;
      npcIds.set(name, id);
      broadcastAll({ type: "agentCreated", id, folderName: name, isExternal: true, task: String(m.topic) });
      broadcastAll({ type: "agentRenamed", id, name });
      broadcastAll({ type: "agentStatus", id, status: "active" });
    });
  }
  if (m.type === "meetingSpeech") {
    const id = npcIds.get(m.npc);
    if (id !== void 0) {
      broadcastAll({ type: "agentSpeech", id, role: "assistant", text: m.text, ts: m.ts });
    }
  }
  if (m.type === "meetingEnded") {
    setTimeout(() => {
      for (const id of npcIds.values()) broadcastAll({ type: "agentClosed", id });
      npcIds.clear();
    }, 2e4);
  }
});
var usage = new UsagePoller((m) => broadcastAll(m));
usage.start();
var WEBCHAT_NAME = "\uC6F9 \uBE44\uC11C";
var webchat = new WebChatManager((m) => broadcastAll(m), {
  isWatched: (cwd) => inProjects(cwd),
  findAgentId: (sid) => store.findBySession(sid)?.id ?? null,
  economy: () => economy.on
});
var resume = new ResumeRunner({ emit: (m) => broadcastAll(m), isAllowedCwd: (c) => inProjects(c) });
var ARCHIVE_ROOT = path11.join(os8.homedir(), ".claude", "projects");
var webchatNamed = /* @__PURE__ */ new Set();
setInterval(() => {
  const sid = webchat.stateMsg().sessionId;
  if (!sid || webchatNamed.has(sid)) return;
  const agent = store.findBySession(sid);
  if (!agent) return;
  webchatNamed.add(sid);
  if (agent.customName) return;
  agent.customName = WEBCHAT_NAME;
  broadcastAll({ type: "agentRenamed", id: agent.id, name: WEBCHAT_NAME });
  const m = names();
  m[sid] = WEBCHAT_NAME;
  saveStrMap("names.json", m);
}, 2e3);
function handleClient(msg, ws) {
  const send = (m) => ws.readyState === ws.OPEN && ws.send(JSON.stringify(m));
  const raw = msg;
  if (raw.type === "getConversation" && typeof raw.id === "number") {
    const agent = store.get(raw.id);
    if (agent) send({ type: "conversation", id: agent.id, messages: agent.chat });
    return;
  }
  if (raw.type === "startMeeting") {
    const ok = meeting.start(String(raw.topic ?? ""), Array.isArray(raw.npcs) ? raw.npcs : DEFAULT_NPCS, Number(raw.rounds ?? 2), String(raw.model ?? "haiku"));
    if (!ok) send({ type: "meetingRejected", reason: meeting.isRunning() ? "already-running" : "bad-topic" });
    return;
  }
  if (raw.type === "stopMeeting") {
    meeting.stop();
    return;
  }
  if (raw.type === "getMinutesList") {
    send({ type: "minutesList", items: listMinutes() });
    return;
  }
  if (raw.type === "getMinutes" && typeof raw.file === "string") {
    send({ type: "minutesText", file: raw.file, text: readMinutes(raw.file) ?? "(\uC77D\uC744 \uC218 \uC5C6\uC74C)" });
    return;
  }
  if (raw.type === "getTasks") {
    send({ type: "kanbanTasks", tasks: loadTasks() });
    return;
  }
  if (raw.type === "saveTasks" && Array.isArray(raw.tasks)) {
    saveTasks(raw.tasks);
    broadcastAll({ type: "kanbanTasks", tasks: raw.tasks });
    return;
  }
  if (raw.type === "webchatSend") {
    webchat.send(String(raw.text ?? ""), typeof raw.cwd === "string" ? raw.cwd : void 0, typeof raw.model === "string" ? raw.model : void 0);
    return;
  }
  if (raw.type === "webchatStop") {
    webchat.stop();
    return;
  }
  if (raw.type === "webchatNew") {
    webchat.reset(typeof raw.cwd === "string" ? raw.cwd : void 0, typeof raw.model === "string" ? raw.model : void 0);
    return;
  }
  if (raw.type === "getWebchat") {
    send(webchat.stateMsg());
    return;
  }
  if (raw.type === "setEconomy") {
    economy.on = raw.on === true;
    meetingEconomy.on = economy.on;
    broadcastAll({ type: "economyState", on: economy.on });
    return;
  }
  if (raw.type === "getEconomy") {
    send({ type: "economyState", on: economy.on });
    return;
  }
  if (raw.type === "getTimeline") {
    send(timeline.snapshot());
    return;
  }
  if (raw.type === "getArchive") {
    const days = [7, 14, 30].includes(Number(raw.days)) ? Number(raw.days) : 14;
    send({ type: "archive", sessions: listSessions(ARCHIVE_ROOT, { days, query: typeof raw.query === "string" ? raw.query.slice(0, 200) : "" }) });
    return;
  }
  if (raw.type === "getArchiveSession" && typeof raw.file === "string") {
    send({ type: "archiveSession", file: raw.file, ...readSession(ARCHIVE_ROOT, raw.file) });
    return;
  }
  if (raw.type === "resumeSend") {
    const a = store.get(Number(raw.agentId));
    const cwd = a ? cwdFromTranscript(a.filePath) : null;
    if (!a || !a.sessionId || !cwd) {
      send({ type: "resumeError", agentId: Number(raw.agentId), reason: "bad-session" });
      return;
    }
    resume.send({
      agentId: a.id,
      sessionId: a.sessionId,
      cwd,
      text: typeof raw.text === "string" ? raw.text : "",
      mode: raw.mode === "full" ? "full" : "safe",
      model: typeof raw.model === "string" ? raw.model : void 0,
      agentIdle: a.isWaiting && a.activeToolIds.size === 0 && !a.permissionActive
    });
    return;
  }
  if (raw.type === "resumeStop") {
    resume.stop(Number(raw.agentId));
    return;
  }
  switch (msg.type) {
    case "webviewReady":
      sendSnapshot(send);
      break;
    case "saveLayout":
      saveLayout(msg.items, msg.floorColor ?? null, msg.wallColor ?? null, msg.packs ?? []);
      break;
    case "closeAgent": {
      const a = store.get(msg.id);
      if (a) {
        try {
          dismissed.set(a.filePath, fs13.statSync(a.filePath).mtimeMs);
        } catch {
        }
      }
      store.remove(msg.id);
      break;
    }
    case "renameAgent": {
      const agent = store.get(msg.id);
      if (!agent) break;
      const name = sanitizeName(msg.name);
      agent.customName = name || void 0;
      broadcastAll({ type: "agentRenamed", id: msg.id, name });
      if (agent.sessionId) {
        const m = names();
        if (name) m[agent.sessionId] = name;
        else delete m[agent.sessionId];
        saveStrMap("names.json", m);
      }
      break;
    }
    case "setRole": {
      const agent = store.get(msg.id);
      if (!agent) break;
      const VALID = /* @__PURE__ */ new Set(["research", "frontend", "backend", "qa", "docs", "data"]);
      const role = typeof msg.role === "string" && VALID.has(msg.role) ? msg.role : "";
      if (role) {
        agent.role = role;
        agent.roleManual = true;
      } else {
        agent.roleManual = false;
        agent.role = void 0;
        agent.roleScores = {};
      }
      broadcastAll({ type: "agentRoleDetected", id: msg.id, role });
      if (agent.sessionId) {
        const m = roles();
        if (role) m[agent.sessionId] = role;
        else delete m[agent.sessionId];
        saveStrMap("roles.json", m);
      }
      break;
    }
    case "sessionStats":
      for (const s of msg.stats) {
        const agent = store.get(s.id);
        if (!agent) continue;
        agent.snapToolCalls = s.tools;
        agent.snapTurns = s.turns;
        agent.snapActiveMs = s.ms;
        if (agent.sessionId) history.record(agent.sessionId, s.project, { cost: s.cost, inTok: s.inTok, outTok: s.outTok, tools: s.tools, ms: s.ms }, s.model);
      }
      broadcastHistory();
      break;
  }
}
function historyMsg() {
  const nm = names();
  const sessions = history.getSessions().map((s) => ({
    name: nm[s.sessionId] || void 0,
    project: s.project,
    at: s.at,
    cost: s.cost,
    inTok: s.inTok,
    outTok: s.outTok,
    tools: s.tools,
    ms: s.ms,
    model: s.model
  }));
  return { type: "historyLoaded", days: history.getDays(), sessions };
}
var lastHistoryBroadcast = 0;
function broadcastHistory() {
  const now = Date.now();
  if (now - lastHistoryBroadcast < 8e3) return;
  lastHistoryBroadcast = now;
  broadcastAll(historyMsg());
}
function sendSnapshot(send) {
  send({ type: "providerCapabilities", readingTools: [...READING_TOOLS], subagentToolNames: [...SUBAGENT_TOOL_NAMES] });
  send({ type: "settingsLoaded", soundEnabled: true, extensionVersion: VERSION });
  send({ type: "workspaceFolders", folders: paths.map((p) => ({ name: path11.basename(p), path: p })) });
  send(hookStatusMsg());
  const u = usage.last();
  if (u) send(u);
  usage.refreshNow();
  const lay = loadLayout();
  send({ type: "layoutLoaded", items: lay.items, floorColor: lay.floorColor, wallColor: lay.wallColor, packs: lay.packs });
  const agents = store.values();
  send({
    type: "existingAgents",
    agents: agents.map((a) => a.id),
    folderNames: Object.fromEntries(agents.map((a) => [a.id, a.folderName])),
    roles: Object.fromEntries(agents.filter((a) => a.role).map((a) => [a.id, a.role])),
    externals: agents.filter((a) => a.isExternal).map((a) => a.id)
  });
  for (const a of agents) for (const m of agentSnapshotMessages(a)) send(m);
  send(historyMsg());
  send(webchat.stateMsg());
}
server.listen(port, "127.0.0.1", () => {
  const url = `http://localhost:${port}`;
  console.log(`
  \u{1F3E2} Agent Office \u2014 ${url}`);
  console.log(`  Kuzatilayotgan: ${paths.join(", ")}`);
  console.log(`  Hook: ${hookActive ? "faol" : "JSONL zaxira"} \xB7 to'xtatish: Ctrl+C
`);
});
server.on("error", (e) => {
  if (e.code === "EADDRINUSE") console.error(`Port ${port} band. Boshqa port: agent-office --port ${port + 1}`);
  else console.error("Server xatosi:", e.message);
  process.exit(1);
});
function shutdown() {
  history.flush();
  watcher.stop();
  hookServer.stop();
  usage.stop();
  webchat.dispose();
  resume.dispose();
  server.close();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
//# sourceMappingURL=cli.js.map
