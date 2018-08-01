"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getEffectiveOptions = getEffectiveOptions;
exports.DesktopShortcutCreationPolicy = void 0;

function _builderUtil() {
  const data = require("builder-util");

  _builderUtil = function () {
    return data;
  };

  return data;
}

function _sanitizeFilename() {
  const data = _interopRequireDefault(require("sanitize-filename"));

  _sanitizeFilename = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getEffectiveOptions(options, packager) {
  const appInfo = packager.appInfo;
  let menuCategory = null;

  if (options.menuCategory != null && options.menuCategory !== false) {
    if (options.menuCategory === true) {
      const companyName = packager.appInfo.companyName;

      if (companyName == null) {
        throw new (_builderUtil().InvalidConfigurationError)(`Please specify "author" in the application package.json — it is required because "menuCategory" is set to true.`);
      }

      menuCategory = (0, _sanitizeFilename().default)(companyName);
    } else {
      menuCategory = options.menuCategory.split(/[\/\\]/).map(it => (0, _sanitizeFilename().default)(it)).join("\\");
    }
  }

  return {
    isPerMachine: options.perMachine === true,
    isAssisted: options.oneClick === false,
    shortcutName: (0, _builderUtil().isEmptyOrSpaces)(options.shortcutName) ? appInfo.productFilename : packager.expandMacro(options.shortcutName),
    isCreateDesktopShortcut: convertToDesktopShortcutCreationPolicy(options.createDesktopShortcut),
    isCreateStartMenuShortcut: options.createStartMenuShortcut !== false,
    menuCategory
  };
}

function convertToDesktopShortcutCreationPolicy(value) {
  if (value === false) {
    return DesktopShortcutCreationPolicy.NEVER;
  } else if (value === "always") {
    return DesktopShortcutCreationPolicy.ALWAYS;
  } else {
    return DesktopShortcutCreationPolicy.FRESH_INSTALL;
  }
}

var DesktopShortcutCreationPolicy;
exports.DesktopShortcutCreationPolicy = DesktopShortcutCreationPolicy;

(function (DesktopShortcutCreationPolicy) {
  DesktopShortcutCreationPolicy[DesktopShortcutCreationPolicy["FRESH_INSTALL"] = 0] = "FRESH_INSTALL";
  DesktopShortcutCreationPolicy[DesktopShortcutCreationPolicy["ALWAYS"] = 1] = "ALWAYS";
  DesktopShortcutCreationPolicy[DesktopShortcutCreationPolicy["NEVER"] = 2] = "NEVER";
})(DesktopShortcutCreationPolicy || (exports.DesktopShortcutCreationPolicy = DesktopShortcutCreationPolicy = {})); 
//# sourceMappingURL=CommonWindowsInstallerConfiguration.js.map