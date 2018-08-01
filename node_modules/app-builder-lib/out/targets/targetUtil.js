"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getWindowsInstallationDirName = getWindowsInstallationDirName;
exports.createStageDirPath = exports.createStageDir = exports.StageDir = void 0;

function _bluebirdLst() {
  const data = require("bluebird-lst");

  _bluebirdLst = function () {
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

function _builderUtil() {
  const data = require("builder-util");

  _builderUtil = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

class StageDir {
  constructor(dir) {
    this.dir = dir;
  }

  getTempFile(name) {
    return this.dir + path.sep + name;
  }

  cleanup() {
    if (!_builderUtil().debug.enabled || process.env.ELECTRON_BUILDER_REMOVE_STAGE_EVEN_IF_DEBUG === "true") {
      return (0, _fsExtraP().remove)(this.dir);
    }

    return Promise.resolve();
  }

  toString() {
    return this.dir;
  }

}

exports.StageDir = StageDir;

let createStageDir = (() => {
  var _ref = (0, _bluebirdLst().coroutine)(function* (target, packager, arch) {
    return new StageDir((yield createStageDirPath(target, packager, arch)));
  });

  return function createStageDir(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})();

exports.createStageDir = createStageDir;

let createStageDirPath = (() => {
  var _ref2 = (0, _bluebirdLst().coroutine)(function* (target, packager, arch) {
    const tempDir = packager.info.stageDirPathCustomizer(target, packager, arch);
    yield (0, _fsExtraP().emptyDir)(tempDir);
    return tempDir;
  });

  return function createStageDirPath(_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
})(); // https://github.com/electron-userland/electron-builder/issues/3100
// https://github.com/electron-userland/electron-builder/commit/2539cfba20dc639128e75c5b786651b652bb4b78


exports.createStageDirPath = createStageDirPath;

function getWindowsInstallationDirName(appInfo, isTryToUseProductName) {
  return isTryToUseProductName && /^[-_+0-9a-zA-Z .]+$/.test(appInfo.productFilename) ? appInfo.productFilename : appInfo.sanitizedName;
} 
//# sourceMappingURL=targetUtil.js.map