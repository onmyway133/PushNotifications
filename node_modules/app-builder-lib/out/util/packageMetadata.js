"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkMetadata = checkMetadata;
exports.versionFromDependencyRange = versionFromDependencyRange;
exports.readPackageJson = void 0;

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

function _fsExtraP() {
  const data = require("fs-extra-p");

  _fsExtraP = function () {
    return data;
  };

  return data;
}

var path = _interopRequireWildcard(require("path"));

function semver() {
  const data = _interopRequireWildcard(require("semver"));

  semver = function () {
    return data;
  };

  return data;
}

let authors = (() => {
  var _ref2 = (0, _bluebirdLst().coroutine)(function* (file, data) {
    if (data.contributors != null) {
      return;
    }

    let authorData;

    try {
      authorData = yield (0, _fsExtraP().readFile)(path.resolve(path.dirname(file), "AUTHORS"), "utf8");
    } catch (ignored) {
      return;
    }

    data.contributors = authorData.split(/\r?\n/g).map(it => it.replace(/^\s*#.*$/, "").trim());
  });

  return function authors(_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
})();
/** @internal */


function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const normalizeData = require("normalize-package-data");
/** @internal */


let readPackageJson = (() => {
  var _ref = (0, _bluebirdLst().coroutine)(function* (file) {
    const data = yield (0, _fsExtraP().readJson)(file);
    yield authors(file, data);
    normalizeData(data); // remove not required fields because can be used for remote build

    delete data.scripts;
    delete data.readme;
    return data;
  });

  return function readPackageJson(_x) {
    return _ref.apply(this, arguments);
  };
})();

exports.readPackageJson = readPackageJson;

function checkMetadata(metadata, devMetadata, appPackageFile, devAppPackageFile) {
  const errors = [];

  const reportError = missedFieldName => {
    errors.push(`Please specify '${missedFieldName}' in the package.json (${appPackageFile})`);
  };

  const checkNotEmpty = (name, value) => {
    if ((0, _builderUtil().isEmptyOrSpaces)(value)) {
      reportError(name);
    }
  };

  if (metadata.directories != null) {
    errors.push(`"directories" in the root is deprecated, please specify in the "build"`);
  }

  checkNotEmpty("name", metadata.name);

  if ((0, _builderUtil().isEmptyOrSpaces)(metadata.description)) {
    _builderUtil().log.warn({
      appPackageFile
    }, `description is missed in the package.json`);
  }

  if (metadata.author == null) {
    _builderUtil().log.warn({
      appPackageFile
    }, `author is missed in the package.json`);
  }

  checkNotEmpty("version", metadata.version);

  if (metadata != null) {
    checkDependencies(metadata.dependencies, errors);
  }

  if (metadata !== devMetadata) {
    if (metadata.build != null) {
      errors.push(`'build' in the application package.json (${appPackageFile}) is not supported since 3.0 anymore. Please move 'build' into the development package.json (${devAppPackageFile})`);
    }
  }

  const devDependencies = metadata.devDependencies;

  if (devDependencies != null && "electron-rebuild" in devDependencies) {
    _builderUtil().log.info('electron-rebuild not required if you use electron-builder, please consider to remove excess dependency from devDependencies\n\nTo ensure your native dependencies are always matched electron version, simply add script `"postinstall": "electron-builder install-app-deps" to your `package.json`');
  }

  if (errors.length > 0) {
    throw new (_builderUtil().InvalidConfigurationError)(errors.join("\n"));
  }
}

function versionFromDependencyRange(version) {
  const firstChar = version[0];
  return firstChar === "^" || firstChar === "~" ? version.substring(1) : version;
}

function checkDependencies(dependencies, errors) {
  if (dependencies == null) {
    return;
  }

  const updaterVersion = dependencies["electron-updater"];

  if (updaterVersion != null && !semver().satisfies(versionFromDependencyRange(updaterVersion), ">=3.0.3")) {
    errors.push(`At least electron-updater 3.0.3 is recommended by current electron-builder version. Please set electron-updater version to "^3.0.3"`);
  }

  const swVersion = dependencies["electron-builder-squirrel-windows"];

  if (swVersion != null && !semver().satisfies(versionFromDependencyRange(swVersion), ">=20.23.0")) {
    errors.push(`At least electron-builder-squirrel-windows 20.23.0 is required by current electron-builder version. Please set electron-builder-squirrel-windows to "^20.23.0"`);
  }

  const deps = ["electron", "electron-prebuilt", "electron-rebuild"];

  if (process.env.ALLOW_ELECTRON_BUILDER_AS_PRODUCTION_DEPENDENCY !== "true") {
    deps.push("electron-builder");
  }

  for (const name of deps) {
    if (name in dependencies) {
      errors.push(`Package "${name}" is only allowed in "devDependencies". ` + `Please remove it from the "dependencies" section in your package.json.`);
    }
  }
} 
//# sourceMappingURL=packageMetadata.js.map