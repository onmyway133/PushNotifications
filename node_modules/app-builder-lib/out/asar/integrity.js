"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.computeData = void 0;

function _bluebirdLst() {
  const data = _interopRequireWildcard(require("bluebird-lst"));

  _bluebirdLst = function () {
    return data;
  };

  return data;
}

function _crypto() {
  const data = require("crypto");

  _crypto = function () {
    return data;
  };

  return data;
}

function _fs() {
  const data = require("fs");

  _fs = function () {
    return data;
  };

  return data;
}

function _fsExtraP() {
  const data = require("fs-extra-p");

  _fsExtraP = function () {
    return data;
  };

  return data;
}

var path = _interopRequireWildcard(require("path"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

let computeData = (() => {
  var _ref = (0, _bluebirdLst().coroutine)(function* (resourcesPath, options) {
    // sort to produce constant result
    const names = (yield (0, _fsExtraP().readdir)(resourcesPath)).filter(it => it.endsWith(".asar")).sort();
    const checksums = yield _bluebirdLst().default.map(names, it => hashFile(path.join(resourcesPath, it)));
    const result = {};

    for (let i = 0; i < names.length; i++) {
      result[names[i]] = checksums[i];
    }

    return Object.assign({
      checksums: result
    }, options);
  });

  return function computeData(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

exports.computeData = computeData;

function hashFile(file, algorithm = "sha512", encoding = "base64") {
  return new Promise((resolve, reject) => {
    const hash = (0, _crypto().createHash)(algorithm);
    hash.on("error", reject).setEncoding(encoding);
    (0, _fs().createReadStream)(file).on("error", reject).on("end", () => {
      hash.end();
      resolve(hash.read());
    }).pipe(hash, {
      end: false
    });
  });
} 
//# sourceMappingURL=integrity.js.map