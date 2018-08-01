"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createAddLangsMacro = createAddLangsMacro;
exports.addCustomMessageFileInclude = exports.LangConfigurator = void 0;

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

function _langs() {
  const data = require("builder-util/out/langs");

  _langs = function () {
    return data;
  };

  return data;
}

var _debug2 = _interopRequireDefault(require("debug"));

function _fsExtraP() {
  const data = require("fs-extra-p");

  _fsExtraP = function () {
    return data;
  };

  return data;
}

function _jsYaml() {
  const data = require("js-yaml");

  _jsYaml = function () {
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

let writeCustomLangFile = (() => {
  var _ref = (0, _bluebirdLst().coroutine)(function* (data, packager) {
    const file = yield packager.getTempFile("messages.nsh");
    yield (0, _fsExtraP().outputFile)(file, data);
    return file;
  });

  return function writeCustomLangFile(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = (0, _debug2.default)("electron-builder:nsis");

class LangConfigurator {
  constructor(options) {
    const rawList = options.installerLanguages;

    if (options.unicode === false || rawList === null || Array.isArray(rawList) && rawList.length === 0) {
      this.isMultiLang = false;
    } else {
      this.isMultiLang = options.multiLanguageInstaller !== false;
    }

    if (this.isMultiLang) {
      this.langs = rawList == null ? _langs().bundledLanguages.slice() : (0, _builderUtil().asArray)(rawList).map(it => (0, _langs().toLangWithRegion)(it.replace("-", "_")));
    } else {
      this.langs = ["en_US"];
    }
  }

}

exports.LangConfigurator = LangConfigurator;

function createAddLangsMacro(scriptGenerator, langConfigurator) {
  const result = [];

  for (const langWithRegion of langConfigurator.langs) {
    let name;

    if (langWithRegion === "zh_CN") {
      name = "SimpChinese";
    } else if (langWithRegion === "zh_TW") {
      name = "TradChinese";
    } else if (langWithRegion === "nb_NO") {
      name = "Norwegian";
    } else if (langWithRegion === "pt_BR") {
      name = "PortugueseBR";
    } else {
      const lang = langWithRegion.substring(0, langWithRegion.indexOf("_"));
      name = _langs().langIdToName[lang];

      if (name == null) {
        throw new Error(`Language name is unknown for ${lang}`);
      }

      if (name === "Spanish") {
        name = "SpanishInternational";
      }
    }

    result.push(`!insertmacro MUI_LANGUAGE "${name}"`);
  }

  scriptGenerator.macro("addLangs", result);
}

let addCustomMessageFileInclude = (() => {
  var _ref2 = (0, _bluebirdLst().coroutine)(function* (input, packager, scriptGenerator, langConfigurator) {
    const data = (0, _jsYaml().safeLoad)((yield (0, _fsExtraP().readFile)(path.join(_nsisUtil().nsisTemplatesDir, input), "utf-8")));
    const instructions = computeCustomMessageTranslations(data, langConfigurator).join("\n");
    debug(instructions);
    scriptGenerator.include((yield writeCustomLangFile(instructions, packager)));
  });

  return function addCustomMessageFileInclude(_x3, _x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
})();

exports.addCustomMessageFileInclude = addCustomMessageFileInclude;

function computeCustomMessageTranslations(messages, langConfigurator) {
  const result = [];
  const includedLangs = new Set(langConfigurator.langs);

  for (const messageId of Object.keys(messages)) {
    const langToTranslations = messages[messageId];
    const unspecifiedLangs = new Set(langConfigurator.langs);

    for (const lang of Object.keys(langToTranslations)) {
      const langWithRegion = (0, _langs().toLangWithRegion)(lang);

      if (!includedLangs.has(langWithRegion)) {
        continue;
      }

      const value = langToTranslations[lang];

      if (value == null) {
        throw new Error(`${messageId} not specified for ${lang}`);
      }

      result.push(`LangString ${messageId} ${_langs().lcid[langWithRegion]} "${value.replace(/\n/g, "$\\r$\\n")}"`);
      unspecifiedLangs.delete(langWithRegion);
    }

    if (langConfigurator.isMultiLang) {
      const defaultTranslation = langToTranslations.en.replace(/\n/g, "$\\r$\\n");

      for (const langWithRegion of unspecifiedLangs) {
        result.push(`LangString ${messageId} ${_langs().lcid[langWithRegion]} "${defaultTranslation}"`);
      }
    }
  }

  return result;
} 
//# sourceMappingURL=nsisLang.js.map