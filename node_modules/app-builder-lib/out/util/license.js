"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLicenseAssets = getLicenseAssets;
exports.getLicenseFiles = exports.getNotLocalizedLicenseFile = void 0;

function _bluebirdLst() {
  const data = require("bluebird-lst");

  _bluebirdLst = function () {
    return data;
  };

  return data;
}

var path = _interopRequireWildcard(require("path"));

function _langs() {
  const data = require("builder-util/out/langs");

  _langs = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function getLicenseAssets(fileNames, packager) {
  return fileNames.sort((a, b) => {
    const aW = a.includes("_en") ? 0 : 100;
    const bW = b.includes("_en") ? 0 : 100;
    return aW === bW ? a.localeCompare(b) : aW - bW;
  }).map(file => {
    let lang = file.match(/_([^.]+)\./)[1];
    let langWithRegion;

    if (lang.includes("_")) {
      langWithRegion = lang;
      lang = langWithRegion.substring(0, lang.indexOf("_"));
    } else {
      lang = lang.toLowerCase();
      langWithRegion = (0, _langs().toLangWithRegion)(lang);
    }

    return {
      file: path.join(packager.buildResourcesDir, file),
      lang,
      langWithRegion,
      langName: _langs().langIdToName[lang]
    };
  });
}

let getNotLocalizedLicenseFile = (() => {
  var _ref = (0, _bluebirdLst().coroutine)(function* (custom, packager, supportedExtension = ["rtf", "txt", "html"]) {
    const possibleFiles = [];

    for (const name of ["license", "eula"]) {
      for (const ext of supportedExtension) {
        possibleFiles.push(`${name}.${ext}`);
        possibleFiles.push(`${name.toUpperCase()}.${ext}`);
        possibleFiles.push(`${name}.${ext.toUpperCase()}`);
        possibleFiles.push(`${name.toUpperCase()}.${ext.toUpperCase()}`);
      }
    }

    return yield packager.getResource(custom, ...possibleFiles);
  });

  return function getNotLocalizedLicenseFile(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

exports.getNotLocalizedLicenseFile = getNotLocalizedLicenseFile;

let getLicenseFiles = (() => {
  var _ref2 = (0, _bluebirdLst().coroutine)(function* (packager) {
    return getLicenseAssets((yield packager.resourceList).filter(it => {
      const name = it.toLowerCase();
      return (name.startsWith("license_") || name.startsWith("eula_")) && (name.endsWith(".rtf") || name.endsWith(".txt"));
    }), packager);
  });

  return function getLicenseFiles(_x3) {
    return _ref2.apply(this, arguments);
  };
})(); exports.getLicenseFiles = getLicenseFiles;
//# sourceMappingURL=license.js.map