"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.computeDefaultAppDirectory = exports.validateConfig = exports.getConfig = void 0;

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

function _fs() {
  const data = require("builder-util/out/fs");

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

function _lazyVal() {
  const data = require("lazy-val");

  _lazyVal = function () {
    return data;
  };

  return data;
}

var path = _interopRequireWildcard(require("path"));

function _readConfigFile() {
  const data = require("read-config-file");

  _readConfigFile = function () {
    return data;
  };

  return data;
}

function _rectCra() {
  const data = require("../presets/rectCra");

  _rectCra = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

// https://github.com/electron-userland/electron-builder/issues/1847
function mergePublish(config, configFromOptions) {
  // if config from disk doesn't have publish (or object), no need to handle, it will be simply merged by deepAssign
  const publish = Array.isArray(config.publish) ? configFromOptions.publish : null;

  if (publish != null) {
    delete configFromOptions.publish;
  }

  (0, _builderUtil().deepAssign)(config, configFromOptions);

  if (publish == null) {
    return;
  }

  const listOnDisk = config.publish;

  if (listOnDisk.length === 0) {
    config.publish = publish;
  } else {
    // apply to first
    Object.assign(listOnDisk[0], publish);
  }
}

let getConfig = (() => {
  var _ref = (0, _bluebirdLst().coroutine)(function* (projectDir, configPath, configFromOptions, packageMetadata = new (_lazyVal().Lazy)(() => (0, _readConfigFile().orNullIfFileNotExist)((0, _fsExtraP().readJson)(path.join(projectDir, "package.json"))))) {
    const configRequest = {
      packageKey: "build",
      configFilename: "electron-builder",
      projectDir,
      packageMetadata
    };
    const configAndEffectiveFile = yield (0, _readConfigFile().getConfig)(configRequest, configPath);
    const config = configAndEffectiveFile == null ? {} : configAndEffectiveFile.result;

    if (configFromOptions != null) {
      mergePublish(config, configFromOptions);
    }

    if (configAndEffectiveFile != null) {
      _builderUtil().log.info({
        file: configAndEffectiveFile.configFile == null ? 'package.json ("build" field)' : configAndEffectiveFile.configFile
      }, "loaded configuration");
    }

    let extendsSpec = config.extends;

    if (extendsSpec == null && extendsSpec !== null) {
      const metadata = (yield packageMetadata.value) || {};
      const devDependencies = metadata.devDependencies;
      const dependencies = metadata.dependencies;

      if (dependencies != null && "react-scripts" in dependencies || devDependencies != null && "react-scripts" in devDependencies) {
        extendsSpec = "react-cra";
        config.extends = extendsSpec;
      } else if (devDependencies != null && "electron-webpack" in devDependencies) {
        extendsSpec = "electron-webpack/electron-builder.yml";
        config.extends = extendsSpec;
      }
    }

    if (extendsSpec == null) {
      return (0, _builderUtil().deepAssign)(getDefaultConfig(), config);
    }

    let parentConfig;

    if (extendsSpec === "react-cra") {
      parentConfig = yield (0, _rectCra().reactCra)(projectDir);

      _builderUtil().log.info({
        preset: extendsSpec
      }, "loaded parent configuration");
    } else {
      const parentConfigAndEffectiveFile = yield (0, _readConfigFile().loadParentConfig)(configRequest, extendsSpec);

      _builderUtil().log.info({
        file: parentConfigAndEffectiveFile.configFile
      }, "loaded parent configuration");

      parentConfig = parentConfigAndEffectiveFile.result;
    } // electron-webpack and electrify client config - want to exclude some files
    // we add client files configuration to main parent file matcher


    if (parentConfig.files != null && config.files != null && (Array.isArray(config.files) || typeof config.files === "string") && Array.isArray(parentConfig.files) && parentConfig.files.length > 0) {
      const mainFileSet = parentConfig.files[0];

      if (typeof mainFileSet === "object" && (mainFileSet.from == null || mainFileSet.from === ".")) {
        mainFileSet.filter = (0, _builderUtil().asArray)(mainFileSet.filter);
        mainFileSet.filter.push(...(0, _builderUtil().asArray)(config.files));
        delete config.files;
      }
    }

    return (0, _builderUtil().deepAssign)(getDefaultConfig(), parentConfig, config);
  });

  return function getConfig(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})();

exports.getConfig = getConfig;

function getDefaultConfig() {
  return {
    directories: {
      output: "dist",
      buildResources: "build"
    }
  };
}

const schemeDataPromise = new (_lazyVal().Lazy)(() => (0, _fsExtraP().readJson)(path.join(__dirname, "..", "..", "scheme.json")));

let validateConfig = (() => {
  var _ref2 = (0, _bluebirdLst().coroutine)(function* (config, debugLogger) {
    const extraMetadata = config.extraMetadata;

    if (extraMetadata != null) {
      if (extraMetadata.build != null) {
        throw new (_builderUtil().InvalidConfigurationError)(`--em.build is deprecated, please specify as -c"`);
      }

      if (extraMetadata.directories != null) {
        throw new (_builderUtil().InvalidConfigurationError)(`--em.directories is deprecated, please specify as -c.directories"`);
      }
    } // noinspection JSDeprecatedSymbols


    if (config.npmSkipBuildFromSource === false) {
      config.buildDependenciesFromSource = false;
    }

    yield (0, _readConfigFile().validateConfig)(config, schemeDataPromise, (message, errors) => {
      if (debugLogger.isEnabled) {
        debugLogger.add("invalidConfig", JSON.stringify(errors, null, 2));
      }

      return `${message}

How to fix:
1. Open https://electron.build/configuration/configuration
2. Search the option name on the page.
  * Not found? The option was deprecated or not exists (check spelling).
  * Found? Check that the option in the appropriate place. e.g. "title" only in the "dmg", not in the root.
`;
    });
  });

  return function validateConfig(_x4, _x5) {
    return _ref2.apply(this, arguments);
  };
})();

exports.validateConfig = validateConfig;
const DEFAULT_APP_DIR_NAMES = ["app", "www"];

let computeDefaultAppDirectory = (() => {
  var _ref3 = (0, _bluebirdLst().coroutine)(function* (projectDir, userAppDir) {
    if (userAppDir != null) {
      const absolutePath = path.resolve(projectDir, userAppDir);
      const stat = yield (0, _fs().statOrNull)(absolutePath);

      if (stat == null) {
        throw new (_builderUtil().InvalidConfigurationError)(`Application directory ${userAppDir} doesn't exists`);
      } else if (!stat.isDirectory()) {
        throw new (_builderUtil().InvalidConfigurationError)(`Application directory ${userAppDir} is not a directory`);
      } else if (projectDir === absolutePath) {
        _builderUtil().log.warn({
          appDirectory: userAppDir
        }, `Specified application directory equals to project dir — superfluous or wrong configuration`);
      }

      return absolutePath;
    }

    for (const dir of DEFAULT_APP_DIR_NAMES) {
      const absolutePath = path.join(projectDir, dir);
      const packageJson = path.join(absolutePath, "package.json");
      const stat = yield (0, _fs().statOrNull)(packageJson);

      if (stat != null && stat.isFile()) {
        return absolutePath;
      }
    }

    return projectDir;
  });

  return function computeDefaultAppDirectory(_x6, _x7) {
    return _ref3.apply(this, arguments);
  };
})(); exports.computeDefaultAppDirectory = computeDefaultAppDirectory;
//# sourceMappingURL=config.js.map