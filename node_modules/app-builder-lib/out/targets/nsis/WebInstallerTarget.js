"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WebInstallerTarget = void 0;

function _bluebirdLst() {
  const data = require("bluebird-lst");

  _bluebirdLst = function () {
    return data;
  };

  return data;
}

function _PublishManager() {
  const data = require("../../publish/PublishManager");

  _PublishManager = function () {
    return data;
  };

  return data;
}

function _NsisTarget() {
  const data = require("./NsisTarget");

  _NsisTarget = function () {
    return data;
  };

  return data;
}

/** @private */
class WebInstallerTarget extends _NsisTarget().NsisTarget {
  constructor(packager, outDir, targetName, packageHelper) {
    super(packager, outDir, targetName, packageHelper);
  }

  get isWebInstaller() {
    return true;
  }

  configureDefines(oneClick, defines) {
    var _this = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      //noinspection ES6MissingAwait
      yield _NsisTarget().NsisTarget.prototype.configureDefines.call(_this, oneClick, defines);
      const packager = _this.packager;
      const options = _this.options;
      let appPackageUrl = options.appPackageUrl;

      if (appPackageUrl == null) {
        const publishConfigs = yield (0, _PublishManager().getPublishConfigsForUpdateInfo)(packager, (yield (0, _PublishManager().getPublishConfigs)(packager, packager.info.config, null, false)), null);

        if (publishConfigs == null || publishConfigs.length === 0) {
          throw new Error("Cannot compute app package download URL");
        }

        appPackageUrl = (0, _PublishManager().computeDownloadUrl)(publishConfigs[0], null, packager);
        defines.APP_PACKAGE_URL_IS_INCOMLETE = null;
      }

      defines.APP_PACKAGE_URL = appPackageUrl;
    })();
  }

  get installerFilenamePattern() {
    // tslint:disable:no-invalid-template-strings
    return "${productName} Web Setup ${version}.${ext}";
  }

  generateGitHubInstallerName() {
    const appInfo = this.packager.appInfo;
    const classifier = appInfo.name.toLowerCase() === appInfo.name ? "web-setup" : "WebSetup";
    return `${appInfo.name}-${classifier}-${appInfo.version}.exe`;
  }

} exports.WebInstallerTarget = WebInstallerTarget;
//# sourceMappingURL=WebInstallerTarget.js.map