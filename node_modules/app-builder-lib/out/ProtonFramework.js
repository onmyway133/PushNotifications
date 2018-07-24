"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createProtonFrameworkSupport = createProtonFrameworkSupport;

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

function _binDownload() {
  const data = require("builder-util/out/binDownload");

  _binDownload = function () {
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

function _builderUtil() {
  const data = require("builder-util");

  _builderUtil = function () {
    return data;
  };

  return data;
}

function _builderUtilRuntime() {
  const data = require("builder-util-runtime");

  _builderUtilRuntime = function () {
    return data;
  };

  return data;
}

function _core() {
  const data = require("./core");

  _core = function () {
    return data;
  };

  return data;
}

function _fileTransformer() {
  const data = require("./fileTransformer");

  _fileTransformer = function () {
    return data;
  };

  return data;
}

var path = _interopRequireWildcard(require("path"));

function _plist() {
  const data = require("plist");

  _plist = function () {
    return data;
  };

  return data;
}

function _pathManager() {
  const data = require("./util/pathManager");

  _pathManager = function () {
    return data;
  };

  return data;
}

let writeExecutableMain = (() => {
  var _ref = (0, _bluebirdLst().coroutine)(function* (file, content) {
    yield (0, _fsExtraP().writeFile)(file, content, {
      mode: 0o755
    });
    yield (0, _fsExtraP().chmod)(file, 0o755);
  });

  return function writeExecutableMain(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})(); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function createProtonFrameworkSupport(nodeVersion, appInfo) {
  return new ProtonFramework(nodeVersion === "current" ? process.versions.node : nodeVersion, `${appInfo.productFilename}.app`);
}

class ProtonFramework {
  constructor(version, distMacOsAppName) {
    this.version = version;
    this.distMacOsAppName = distMacOsAppName;
    this.name = "proton";
    this.isDefaultAppIconProvided = false;
    this.macOsDefaultTargets = ["dmg"];
    this.defaultAppIdPrefix = "com.proton-native."; // noinspection JSUnusedGlobalSymbols

    this.isNpmRebuildRequired = false;
  }

  getDefaultIcon() {
    return (0, _pathManager().getTemplatePath)("proton-native.icns");
  }

  createTransformer() {
    let babel;
    const babelOptions = {
      ast: false,
      sourceMaps: "inline"
    };

    if (process.env.TEST_SET_BABEL_PRESET === "true") {
      babel = require("@babel/core"); // out test dir can be located outside of electron-builder node_modules and babel cannot resolve string names of preset

      babelOptions.presets = [[require("@babel/preset-env").default, {
        targets: {
          node: this.version
        }
      }], [require("@babel/preset-stage-0"), {
        decoratorsLegacy: true
      }], require("@babel/preset-react")];
      babelOptions.babelrc = false;
    } else {
      try {
        babel = require("babel-core");
      } catch (e) {
        // babel isn't installed
        _builderUtil().log.debug(null, "don't transpile source code using Babel");

        return null;
      }
    }

    _builderUtil().log.info({
      options: (0, _builderUtilRuntime().safeStringifyJson)(babelOptions, new Set(["presets"]))
    }, "transpile source code using Babel");

    return file => {
      if (!(file.endsWith(".js") || file.endsWith(".jsx")) || file.includes(_fileTransformer().NODE_MODULES_PATTERN)) {
        return null;
      }

      return new Promise((resolve, reject) => {
        return babel.transformFile(file, babelOptions, (error, result) => {
          if (error == null) {
            resolve(result.code);
          } else {
            reject(error);
          }
        });
      });
    };
  }

  prepareMacosApplicationStageDirectory(packager, options) {
    var _this = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      const appContentsDir = path.join(options.appOutDir, _this.distMacOsAppName, "Contents");
      yield (0, _fsExtraP().ensureDir)(path.join(appContentsDir, "Resources"));
      yield (0, _fsExtraP().ensureDir)(path.join(appContentsDir, "MacOS"));
      yield (0, _fs().copyFile)(path.join((yield (0, _binDownload().getBin)("node", `${_this.version}-darwin-x64`, null)), "node"), path.join(appContentsDir, "MacOS", "node"));
      const appPlist = {
        // https://github.com/albe-rosado/create-proton-app/issues/13
        NSHighResolutionCapable: true
      };
      yield packager.applyCommonInfo(appPlist, appContentsDir);
      yield Promise.all([(0, _fsExtraP().writeFile)(path.join(appContentsDir, "Info.plist"), (0, _plist().build)(appPlist)), writeExecutableMain(path.join(appContentsDir, "MacOS", appPlist.CFBundleExecutable), `#!/bin/sh
DIR=$(dirname "$0")
"$DIR/node" "$DIR/../Resources/app/${options.packager.info.metadata.main || "index.js"}"
`)]);
    })();
  }

  prepareLinuxApplicationStageDirectory(options) {
    var _this2 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      const appOutDir = options.appOutDir;
      yield (0, _fs().copyFile)(path.join((yield (0, _binDownload().getBin)("node", `${_this2.version}-linux-${options.arch === "ia32" ? "x86" : options.arch}`, null)), "node"), path.join(appOutDir, "node"));
      const mainPath = path.join(appOutDir, options.packager.executableName);
      yield writeExecutableMain(mainPath, `#!/bin/sh
DIR=$(dirname "$0")
"$DIR/node" "$DIR/app/${options.packager.info.metadata.main || "index.js"}"
`);
    })();
  }

  prepareApplicationStageDirectory(options) {
    var _this3 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      yield (0, _fsExtraP().emptyDir)(options.appOutDir);
      const packager = options.packager;

      if (packager.platform === _core().Platform.MAC) {
        yield _this3.prepareMacosApplicationStageDirectory(packager, options);
      } else if (packager.platform === _core().Platform.LINUX) {
        yield _this3.prepareLinuxApplicationStageDirectory(options);
      } else {
        throw new Error(`Unsupported platform: ${packager.platform}`);
      }
    })();
  }

}
//# sourceMappingURL=ProtonFramework.js.map