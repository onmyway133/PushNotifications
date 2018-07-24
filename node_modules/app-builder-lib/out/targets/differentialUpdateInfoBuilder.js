"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createNsisWebDifferentialUpdateInfo = createNsisWebDifferentialUpdateInfo;
exports.configureDifferentialAwareArchiveOptions = configureDifferentialAwareArchiveOptions;
exports.createBlockmap = exports.appendBlockmap = exports.BLOCK_MAP_FILE_SUFFIX = void 0;

function _bluebirdLst() {
  const data = require("bluebird-lst");

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

var path = _interopRequireWildcard(require("path"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const BLOCK_MAP_FILE_SUFFIX = ".blockmap";
exports.BLOCK_MAP_FILE_SUFFIX = BLOCK_MAP_FILE_SUFFIX;

function createNsisWebDifferentialUpdateInfo(artifactPath, packageFiles) {
  if (packageFiles == null) {
    return null;
  }

  const keys = Object.keys(packageFiles);

  if (keys.length <= 0) {
    return null;
  }

  const packages = {};

  for (const arch of keys) {
    const packageFileInfo = packageFiles[arch];
    const file = path.basename(packageFileInfo.path);
    packages[arch] = Object.assign({}, packageFileInfo, {
      path: file,
      // https://github.com/electron-userland/electron-builder/issues/2583
      file
    });
  }

  return {
    packages
  };
}

function configureDifferentialAwareArchiveOptions(archiveOptions) {
  /*
   * dict size 64 MB: Full: 33,744.88 KB, To download: 17,630.3 KB (52%)
   * dict size 16 MB: Full: 33,936.84 KB, To download: 16,175.9 KB (48%)
   * dict size  8 MB: Full: 34,187.59 KB, To download:  8,229.9 KB (24%)
   * dict size  4 MB: Full: 34,628.73 KB, To download: 3,782.97 KB (11%)
      as we can see, if file changed in one place, all block is invalidated (and update size approximately equals to dict size)
      1 MB is used:
      1MB:
      2018/01/11 11:54:41:0045 File has 59 changed blocks
   2018/01/11 11:54:41:0050 Full: 71,588.59 KB, To download: 1,243.39 KB (2%)
      4MB:
      2018/01/11 11:31:43:0440 Full: 70,303.55 KB, To download: 4,843.27 KB (7%)
   2018/01/11 11:31:43:0435 File has 234 changed blocks
      */
  archiveOptions.dictSize = 1; // solid compression leads to a lot of changed blocks

  archiveOptions.solid = false; // do not allow to change compression level to avoid different packages

  archiveOptions.compression = "normal";
  return archiveOptions;
}

let appendBlockmap = (() => {
  var _ref = (0, _bluebirdLst().coroutine)(function* (file) {
    _builderUtil().log.info({
      file: _builderUtil().log.filePath(file)
    }, "building embedded block map");

    return JSON.parse((yield (0, _builderUtil().executeAppBuilder)(["blockmap", "--input", file, "--compression", "deflate"])));
  });

  return function appendBlockmap(_x) {
    return _ref.apply(this, arguments);
  };
})();

exports.appendBlockmap = appendBlockmap;

let createBlockmap = (() => {
  var _ref2 = (0, _bluebirdLst().coroutine)(function* (file, target, packager, safeArtifactName) {
    const blockMapFile = `${file}${BLOCK_MAP_FILE_SUFFIX}`;

    _builderUtil().log.info({
      blockMapFile: _builderUtil().log.filePath(blockMapFile)
    }, "building block map");

    const updateInfo = JSON.parse((yield (0, _builderUtil().executeAppBuilder)(["blockmap", "--input", file, "--output", blockMapFile])));
    packager.info.dispatchArtifactCreated({
      file: blockMapFile,
      safeArtifactName: safeArtifactName == null ? null : `${safeArtifactName}${BLOCK_MAP_FILE_SUFFIX}`,
      target,
      arch: null,
      packager,
      updateInfo
    });
    return updateInfo;
  });

  return function createBlockmap(_x2, _x3, _x4, _x5) {
    return _ref2.apply(this, arguments);
  };
})(); exports.createBlockmap = createBlockmap;
//# sourceMappingURL=differentialUpdateInfoBuilder.js.map