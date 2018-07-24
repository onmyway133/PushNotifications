"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.computeLicensePage = void 0;

function _bluebirdLst() {
  const data = require("bluebird-lst");

  _bluebirdLst = function () {
    return data;
  };

  return data;
}

function _langs() {
  const data = require("builder-util/out/langs");

  _langs = function () {
    return data;
  };

  return data;
}

function _license() {
  const data = require("../../util/license");

  _license = function () {
    return data;
  };

  return data;
}

var path = _interopRequireWildcard(require("path"));

function _nsisUtil() {
  const data = require("./nsisUtil");

  _nsisUtil = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

let computeLicensePage = (() => {
  var _ref = (0, _bluebirdLst().coroutine)(function* (packager, options, scriptGenerator, languages) {
    const license = yield (0, _license().getNotLocalizedLicenseFile)(options.license, packager);

    if (license != null) {
      let licensePage;

      if (license.endsWith(".html")) {
        licensePage = ["!define MUI_PAGE_CUSTOMFUNCTION_SHOW LicenseShow", "Function LicenseShow", "  FindWindow $R0 `#32770` `` $HWNDPARENT", "  GetDlgItem $R0 $R0 1000", "EmbedHTML::Load /replace $R0 file://$PLUGINSDIR\\license.html", "FunctionEnd", `!insertmacro MUI_PAGE_LICENSE "${path.join(_nsisUtil().nsisTemplatesDir, "empty-license.txt")}"`];
      } else {
        licensePage = [`!insertmacro MUI_PAGE_LICENSE "${license}"`];
      }

      scriptGenerator.macro("licensePage", licensePage);

      if (license.endsWith(".html")) {
        scriptGenerator.macro("addLicenseFiles", [`File /oname=$PLUGINSDIR\\license.html "${license}"`]);
      }

      return;
    }

    const licenseFiles = yield (0, _license().getLicenseFiles)(packager);

    if (licenseFiles.length === 0) {
      return;
    }

    const licensePage = [];
    const unspecifiedLangs = new Set(languages);
    let defaultFile = null;

    for (const item of licenseFiles) {
      unspecifiedLangs.delete(item.langWithRegion);

      if (defaultFile == null) {
        defaultFile = item.file;
      }

      licensePage.push(`LicenseLangString MUILicense ${_langs().lcid[item.langWithRegion] || item.lang} "${item.file}"`);
    }

    for (const l of unspecifiedLangs) {
      licensePage.push(`LicenseLangString MUILicense ${_langs().lcid[l]} "${defaultFile}"`);
    }

    licensePage.push('!insertmacro MUI_PAGE_LICENSE "$(MUILicense)"');
    scriptGenerator.macro("licensePage", licensePage);
  });

  return function computeLicensePage(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
})(); exports.computeLicensePage = computeLicensePage;
//# sourceMappingURL=nsisLicense.js.map