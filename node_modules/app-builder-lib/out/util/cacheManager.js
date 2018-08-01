"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.digest = exports.BuildCacheManager = void 0;

function _bluebirdLst() {
  const data = _interopRequireWildcard(require("bluebird-lst"));

  _bluebirdLst = function () {
    return data;
  };

  return data;
}

function _builderUtil() {
  const data = require("builder-util");

  _builderUtil = function () {
    return data;
  };

  return data;
}

function _fs() {
  const data = require("builder-util/out/fs");

  _fs = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("builder-util/out/promise");

  _promise = function () {
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

class BuildCacheManager {
  constructor(outDir, executableFile, arch) {
    this.executableFile = executableFile;
    this.cacheInfo = null;
    this.newDigest = null;
    this.cacheDir = path.join(outDir, ".cache", _builderUtil().Arch[arch]);
    this.cacheFile = path.join(this.cacheDir, "app.exe");
    this.cacheInfoFile = path.join(this.cacheDir, "info.json");
  }

  copyIfValid(digest) {
    var _this = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      _this.newDigest = digest;
      _this.cacheInfo = yield (0, _promise().orNullIfFileNotExist)((0, _fsExtraP().readJson)(_this.cacheInfoFile));
      const oldDigest = _this.cacheInfo == null ? null : _this.cacheInfo.executableDigest;

      if (oldDigest !== digest) {
        _builderUtil().log.debug({
          oldDigest,
          newDigest: digest
        }, "no valid cached executable found");

        return false;
      }

      _builderUtil().log.debug({
        cacheFile: _this.cacheFile,
        file: _this.executableFile
      }, `copying cached executable`);

      try {
        yield (0, _fs().copyFile)(_this.cacheFile, _this.executableFile, false);
        return true;
      } catch (e) {
        if (e.code === "ENOENT" || e.code === "ENOTDIR") {
          _builderUtil().log.debug({
            error: e.code
          }, "copy cached executable failed");
        } else {
          _builderUtil().log.warn({
            error: e.stack || e
          }, `cannot copy cached executable`);
        }
      }

      return false;
    })();
  }

  save() {
    var _this2 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      if (_this2.newDigest == null) {
        throw new Error("call copyIfValid before");
      }

      if (_this2.cacheInfo == null) {
        _this2.cacheInfo = {
          executableDigest: _this2.newDigest
        };
      } else {
        _this2.cacheInfo.executableDigest = _this2.newDigest;
      }

      try {
        yield (0, _fsExtraP().ensureDir)(_this2.cacheDir);
        yield Promise.all([(0, _fsExtraP().writeJson)(_this2.cacheInfoFile, _this2.cacheInfo), (0, _fs().copyFile)(_this2.executableFile, _this2.cacheFile, false)]);
      } catch (e) {
        _builderUtil().log.warn({
          error: e.stack || e
        }, `cannot save build cache`);
      }
    })();
  }

}

exports.BuildCacheManager = BuildCacheManager;
BuildCacheManager.VERSION = "0";

let digest = (() => {
  var _ref = (0, _bluebirdLst().coroutine)(function* (hash, files) {
    // do not use pipe - better do bulk file read (https://github.com/yarnpkg/yarn/commit/7a63e0d23c46a4564bc06645caf8a59690f04d01)
    for (const content of yield _bluebirdLst().default.map(files, it => (0, _fsExtraP().readFile)(it))) {
      hash.update(content);
    }

    hash.update(BuildCacheManager.VERSION);
    return hash.digest("base64");
  });

  return function digest(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})(); exports.digest = digest;
//# sourceMappingURL=cacheManager.js.map