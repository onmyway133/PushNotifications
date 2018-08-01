"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

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

function _electronOsxSign() {
  const data = require("electron-osx-sign");

  _electronOsxSign = function () {
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

function _fs() {
  const data = require("builder-util/out/fs");

  _fs = function () {
    return data;
  };

  return data;
}

function _appInfo() {
  const data = require("./appInfo");

  _appInfo = function () {
    return data;
  };

  return data;
}

function _codeSign() {
  const data = require("./codeSign");

  _codeSign = function () {
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

function _platformPackager() {
  const data = require("./platformPackager");

  _platformPackager = function () {
    return data;
  };

  return data;
}

function _ArchiveTarget() {
  const data = require("./targets/ArchiveTarget");

  _ArchiveTarget = function () {
    return data;
  };

  return data;
}

function _pkg() {
  const data = require("./targets/pkg");

  _pkg = function () {
    return data;
  };

  return data;
}

function _targetFactory() {
  const data = require("./targets/targetFactory");

  _targetFactory = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

class MacPackager extends _platformPackager().PlatformPackager {
  constructor(info) {
    super(info, _core().Platform.MAC);
    this.codeSigningInfo = new (_lazyVal().Lazy)(() => {
      const cscLink = this.getCscLink();

      if (cscLink == null || process.platform !== "darwin") {
        return Promise.resolve({
          keychainName: process.env.CSC_KEYCHAIN || null
        });
      }

      return (0, _codeSign().createKeychain)({
        tmpDir: this.info.tempDirManager,
        cscLink,
        cscKeyPassword: this.getCscPassword(),
        cscILink: (0, _platformPackager().chooseNotNull)(this.platformSpecificBuildOptions.cscInstallerLink, process.env.CSC_INSTALLER_LINK),
        cscIKeyPassword: (0, _platformPackager().chooseNotNull)(this.platformSpecificBuildOptions.cscInstallerKeyPassword, process.env.CSC_INSTALLER_KEY_PASSWORD),
        currentDir: this.projectDir
      });
    });
    this._iconPath = new (_lazyVal().Lazy)(() => this.getOrConvertIcon("icns"));
  }

  get defaultTarget() {
    return this.info.framework.macOsDefaultTargets;
  }

  prepareAppInfo(appInfo) {
    return new (_appInfo().AppInfo)(this.info, this.platformSpecificBuildOptions.bundleVersion, this.platformSpecificBuildOptions);
  }

  getIconPath() {
    var _this = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      return _this._iconPath.value;
    })();
  }

  createTargets(targets, mapper) {
    for (const name of targets) {
      switch (name) {
        case _core().DIR_TARGET:
          break;

        case "dmg":
          const {
            DmgTarget
          } = require("dmg-builder");

          mapper(name, outDir => new DmgTarget(this, outDir));
          break;

        case "zip":
          // https://github.com/electron-userland/electron-builder/issues/2313
          mapper(name, outDir => new (_ArchiveTarget().ArchiveTarget)(name, outDir, this, true));
          break;

        case "pkg":
          mapper(name, outDir => new (_pkg().PkgTarget)(this, outDir));
          break;

        default:
          mapper(name, outDir => name === "mas" || name === "mas-dev" ? new (_targetFactory().NoOpTarget)(name) : (0, _targetFactory().createCommonTarget)(name, outDir, this));
          break;
      }
    }
  }

  pack(outDir, arch, targets, taskManager) {
    var _this2 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      let nonMasPromise = null;
      const hasMas = targets.length !== 0 && targets.some(it => it.name === "mas" || it.name === "mas-dev");
      const prepackaged = _this2.packagerOptions.prepackaged;

      if (!hasMas || targets.length > 1) {
        const appPath = prepackaged == null ? path.join(_this2.computeAppOutDir(outDir, arch), `${_this2.appInfo.productFilename}.app`) : prepackaged;
        nonMasPromise = (prepackaged ? Promise.resolve() : _this2.doPack(outDir, path.dirname(appPath), _this2.platform.nodeName, arch, _this2.platformSpecificBuildOptions, targets)).then(() => _this2.sign(appPath, null, null)).then(() => _this2.packageInDistributableFormat(appPath, _builderUtil().Arch.x64, targets, taskManager));
      }

      for (const target of targets) {
        const targetName = target.name;

        if (!(targetName === "mas" || targetName === "mas-dev")) {
          continue;
        }

        const masBuildOptions = (0, _builderUtil().deepAssign)({}, _this2.platformSpecificBuildOptions, _this2.config.mas);

        if (targetName === "mas-dev") {
          (0, _builderUtil().deepAssign)(masBuildOptions, _this2.config[targetName], {
            type: "development"
          });
        }

        const targetOutDir = path.join(outDir, targetName);

        if (prepackaged == null) {
          yield _this2.doPack(outDir, targetOutDir, "mas", arch, masBuildOptions, [target]);
          yield _this2.sign(path.join(targetOutDir, `${_this2.appInfo.productFilename}.app`), targetOutDir, masBuildOptions);
        } else {
          yield _this2.sign(prepackaged, targetOutDir, masBuildOptions);
        }
      }

      if (nonMasPromise != null) {
        yield nonMasPromise;
      }
    })();
  }

  sign(appPath, outDir, masOptions) {
    var _this3 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      if (!(0, _codeSign().isSignAllowed)()) {
        return;
      }

      const isMas = masOptions != null;
      const macOptions = _this3.platformSpecificBuildOptions;
      const qualifier = (isMas ? masOptions.identity : null) || macOptions.identity;

      if (!isMas && qualifier === null) {
        if (_this3.forceCodeSigning) {
          throw new (_builderUtil().InvalidConfigurationError)("identity explicitly is set to null, but forceCodeSigning is set to true");
        }

        _builderUtil().log.info({
          reason: "identity explicitly is set to null"
        }, "skipped macOS code signing");

        return;
      }

      const keychainName = (yield _this3.codeSigningInfo.value).keychainName;
      const explicitType = isMas ? masOptions.type : macOptions.type;
      const type = explicitType || "distribution";
      const isDevelopment = type === "development";
      const certificateType = getCertificateType(isMas, isDevelopment);
      let identity = yield (0, _codeSign().findIdentity)(certificateType, qualifier, keychainName);

      if (identity == null) {
        if (!isMas && !isDevelopment && explicitType !== "distribution") {
          identity = yield (0, _codeSign().findIdentity)("Mac Developer", qualifier, keychainName);

          if (identity != null) {
            _builderUtil().log.warn("Mac Developer is used to sign app — it is only for development and testing, not for production");
          }
        }

        if (identity == null) {
          yield (0, _codeSign().reportError)(isMas, certificateType, qualifier, keychainName, _this3.forceCodeSigning);
          return;
        }
      }

      const signOptions = {
        "identity-validation": false,
        // https://github.com/electron-userland/electron-builder/issues/1699
        // kext are signed by the chipset manufacturers. You need a special certificate (only available on request) from Apple to be able to sign kext.
        ignore: file => {
          return file.endsWith(".kext") || file.startsWith("/Contents/PlugIns", appPath.length) || // https://github.com/electron-userland/electron-builder/issues/2010
          file.includes("/node_modules/puppeteer/.local-chromium");
        },
        identity: identity,
        type,
        platform: isMas ? "mas" : "darwin",
        version: _this3.config.electronVersion,
        app: appPath,
        keychain: keychainName || undefined,
        binaries: (isMas && masOptions != null ? masOptions.binaries : macOptions.binaries) || undefined,
        requirements: isMas || macOptions.requirements == null ? undefined : yield _this3.getResource(macOptions.requirements),
        "gatekeeper-assess": _codeSign().appleCertificatePrefixes.find(it => identity.name.startsWith(it)) != null
      };
      yield _this3.adjustSignOptions(signOptions, masOptions);

      _builderUtil().log.info({
        file: _builderUtil().log.filePath(appPath),
        identityName: identity.name,
        identityHash: identity.hash,
        provisioningProfile: signOptions["provisioning-profile"] || "none"
      }, "signing");

      yield _this3.doSign(signOptions); // https://github.com/electron-userland/electron-builder/issues/1196#issuecomment-312310209

      if (masOptions != null && !isDevelopment) {
        const certType = isDevelopment ? "Mac Developer" : "3rd Party Mac Developer Installer";
        const masInstallerIdentity = yield (0, _codeSign().findIdentity)(certType, masOptions.identity, keychainName);

        if (masInstallerIdentity == null) {
          throw new (_builderUtil().InvalidConfigurationError)(`Cannot find valid "${certType}" identity to sign MAS installer, please see https://electron.build/code-signing`);
        }

        const artifactName = _this3.expandArtifactNamePattern(masOptions, "pkg");

        const artifactPath = path.join(outDir, artifactName);
        yield _this3.doFlat(appPath, artifactPath, masInstallerIdentity, keychainName);

        _this3.dispatchArtifactCreated(artifactPath, null, _builderUtil().Arch.x64, _this3.computeSafeArtifactName(artifactName, "pkg"));
      }
    })();
  }

  adjustSignOptions(signOptions, masOptions) {
    var _this4 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      const resourceList = yield _this4.resourceList;

      if (resourceList.includes(`entitlements.osx.plist`)) {
        throw new (_builderUtil().InvalidConfigurationError)("entitlements.osx.plist is deprecated name, please use entitlements.mac.plist");
      }

      if (resourceList.includes(`entitlements.osx.inherit.plist`)) {
        throw new (_builderUtil().InvalidConfigurationError)("entitlements.osx.inherit.plist is deprecated name, please use entitlements.mac.inherit.plist");
      }

      const customSignOptions = masOptions || _this4.platformSpecificBuildOptions;
      const entitlementsSuffix = masOptions == null ? "mac" : "mas";

      if (customSignOptions.entitlements == null) {
        const p = `entitlements.${entitlementsSuffix}.plist`;

        if (resourceList.includes(p)) {
          signOptions.entitlements = path.join(_this4.info.buildResourcesDir, p);
        }
      } else {
        signOptions.entitlements = customSignOptions.entitlements;
      }

      if (customSignOptions.entitlementsInherit == null) {
        const p = `entitlements.${entitlementsSuffix}.inherit.plist`;

        if (resourceList.includes(p)) {
          signOptions["entitlements-inherit"] = path.join(_this4.info.buildResourcesDir, p);
        }
      } else {
        signOptions["entitlements-inherit"] = customSignOptions.entitlementsInherit;
      }

      if (customSignOptions.provisioningProfile != null) {
        signOptions["provisioning-profile"] = customSignOptions.provisioningProfile;
      }
    })();
  } //noinspection JSMethodCanBeStatic


  doSign(opts) {
    return (0, _bluebirdLst().coroutine)(function* () {
      return (0, _electronOsxSign().signAsync)(opts);
    })();
  } //noinspection JSMethodCanBeStatic


  doFlat(appPath, outFile, identity, keychain) {
    return (0, _bluebirdLst().coroutine)(function* () {
      // productbuild doesn't created directory for out file
      yield (0, _fsExtraP().ensureDir)(path.dirname(outFile));
      const args = (0, _pkg().prepareProductBuildArgs)(identity, keychain);
      args.push("--component", appPath, "/Applications");
      args.push(outFile);
      return yield (0, _builderUtil().exec)("productbuild", args);
    })();
  }

  getElectronSrcDir(dist) {
    return path.resolve(this.projectDir, dist, this.info.framework.distMacOsAppName);
  }

  getElectronDestinationDir(appOutDir) {
    return path.join(appOutDir, this.info.framework.distMacOsAppName);
  } // todo fileAssociations


  applyCommonInfo(appPlist, contentsPath) {
    var _this5 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      const appInfo = _this5.appInfo;
      const appFilename = appInfo.productFilename; // https://github.com/electron-userland/electron-builder/issues/1278

      appPlist.CFBundleExecutable = appFilename.endsWith(" Helper") ? appFilename.substring(0, appFilename.length - " Helper".length) : appFilename;
      const icon = yield _this5.getIconPath();

      if (icon != null) {
        const oldIcon = appPlist.CFBundleIconFile;
        const resourcesPath = path.join(contentsPath, "Resources");

        if (oldIcon != null) {
          yield (0, _fs().unlinkIfExists)(path.join(resourcesPath, oldIcon));
        }

        const iconFileName = `${appFilename}.icns`;
        appPlist.CFBundleIconFile = iconFileName;
        yield (0, _fs().copyFile)(icon, path.join(resourcesPath, iconFileName));
      }

      appPlist.CFBundleName = appInfo.productName;
      appPlist.CFBundleDisplayName = appInfo.productName;
      const minimumSystemVersion = _this5.platformSpecificBuildOptions.minimumSystemVersion;

      if (minimumSystemVersion != null) {
        appPlist.LSMinimumSystemVersion = minimumSystemVersion;
      }

      appPlist.CFBundleIdentifier = appInfo.macBundleIdentifier;
      appPlist.CFBundleShortVersionString = _this5.platformSpecificBuildOptions.bundleShortVersion || appInfo.version;
      appPlist.CFBundleVersion = appInfo.buildVersion;
      (0, _builderUtil().use)(_this5.platformSpecificBuildOptions.category || _this5.config.category, it => appPlist.LSApplicationCategoryType = it);
      appPlist.NSHumanReadableCopyright = appInfo.copyright;
      const extendInfo = _this5.platformSpecificBuildOptions.extendInfo;

      if (extendInfo != null) {
        Object.assign(appPlist, extendInfo);
      }
    })();
  }

}

exports.default = MacPackager;

function getCertificateType(isMas, isDevelopment) {
  if (isDevelopment) {
    return "Mac Developer";
  }

  return isMas ? "3rd Party Mac Developer Application" : "Developer ID Application";
} 
//# sourceMappingURL=macPackager.js.map