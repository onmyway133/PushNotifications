"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.prepareProductBuildArgs = prepareProductBuildArgs;
exports.PkgTarget = void 0;

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

function _license() {
  const data = require("../util/license");

  _license = function () {
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

function _plist() {
  const data = require("plist");

  _plist = function () {
    return data;
  };

  return data;
}

function _appInfo() {
  const data = require("../appInfo");

  _appInfo = function () {
    return data;
  };

  return data;
}

function _codeSign() {
  const data = require("../codeSign");

  _codeSign = function () {
    return data;
  };

  return data;
}

function _core() {
  const data = require("../core");

  _core = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const certType = "Developer ID Installer"; // http://www.shanekirk.com/2013/10/creating-flat-packages-in-osx/
// to use --scripts, we must build .app bundle separately using pkgbuild
// productbuild --scripts doesn't work (because scripts in this case not added to our package)
// https://github.com/electron-userland/electron-osx-sign/issues/96#issuecomment-274986942

class PkgTarget extends _core().Target {
  constructor(packager, outDir) {
    super("pkg");
    this.packager = packager;
    this.outDir = outDir;
    this.options = Object.assign({
      allowAnywhere: true,
      allowCurrentUserHome: true,
      allowRootDirectory: true
    }, this.packager.config.pkg);
  }

  build(appPath, arch) {
    var _this = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      const packager = _this.packager;
      const options = _this.options;
      const appInfo = packager.appInfo;
      const artifactName = packager.expandArtifactNamePattern(options, "pkg");
      const artifactPath = path.join(_this.outDir, artifactName);

      _this.logBuilding("pkg", artifactPath, arch);

      const keychainName = (yield packager.codeSigningInfo.value).keychainName;
      const appOutDir = _this.outDir; // https://developer.apple.com/library/content/documentation/DeveloperTools/Reference/DistributionDefinitionRef/Chapters/Distribution_XML_Ref.html

      const distInfoFile = path.join(appOutDir, "distribution.xml");
      const innerPackageFile = path.join(appOutDir, `${(0, _appInfo().filterCFBundleIdentifier)(appInfo.id)}.pkg`);
      const componentPropertyListFile = path.join(appOutDir, `${(0, _appInfo().filterCFBundleIdentifier)(appInfo.id)}.plist`);
      const identity = (yield Promise.all([(0, _codeSign().findIdentity)(certType, options.identity || packager.platformSpecificBuildOptions.identity, keychainName), _this.customizeDistributionConfiguration(distInfoFile, appPath), _this.buildComponentPackage(appPath, componentPropertyListFile, innerPackageFile)]))[0];

      if (identity == null && packager.forceCodeSigning) {
        throw new Error(`Cannot find valid "${certType}" to sign standalone installer, please see https://electron.build/code-signing`);
      }

      const args = prepareProductBuildArgs(identity, keychainName);
      args.push("--distribution", distInfoFile);
      args.push(artifactPath);
      (0, _builderUtil().use)(options.productbuild, it => args.push(...it));
      yield (0, _builderUtil().exec)("productbuild", args, {
        cwd: appOutDir
      });
      yield Promise.all([(0, _fsExtraP().unlink)(innerPackageFile), (0, _fsExtraP().unlink)(distInfoFile)]);
      packager.dispatchArtifactCreated(artifactPath, _this, arch, packager.computeSafeArtifactName(artifactName, "pkg", arch));
    })();
  }

  customizeDistributionConfiguration(distInfoFile, appPath) {
    var _this2 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      yield (0, _builderUtil().exec)("productbuild", ["--synthesize", "--component", appPath, distInfoFile], {
        cwd: _this2.outDir
      });
      const options = _this2.options;
      let distInfo = yield (0, _fsExtraP().readFile)(distInfoFile, "utf-8");
      const insertIndex = distInfo.lastIndexOf("</installer-gui-script>");
      distInfo = distInfo.substring(0, insertIndex) + `    <domains enable_anywhere="${options.allowAnywhere}" enable_currentUserHome="${options.allowCurrentUserHome}" enable_localSystem="${options.allowRootDirectory}" />\n` + distInfo.substring(insertIndex);
      const license = yield (0, _license().getNotLocalizedLicenseFile)(options.license, _this2.packager);

      if (license != null) {
        distInfo = distInfo.substring(0, insertIndex) + `    <license file="${license}"/>\n` + distInfo.substring(insertIndex);
      }

      (0, _builderUtil().debug)(distInfo);
      yield (0, _fsExtraP().writeFile)(distInfoFile, distInfo);
    })();
  }

  buildComponentPackage(appPath, propertyListOutputFile, packageOutputFile) {
    var _this3 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      const options = _this3.options;
      const rootPath = path.dirname(appPath); // first produce a component plist template

      yield (0, _builderUtil().exec)("pkgbuild", ["--analyze", "--root", rootPath, propertyListOutputFile]); // process the template plist

      const plistInfo = (0, _plist().parse)((yield (0, _fsExtraP().readFile)(propertyListOutputFile, "utf8")));

      if (plistInfo.length > 0) {
        const packageInfo = plistInfo[0]; // ChildBundles lists all of electron binaries within the .app.
        // There is no particular reason for removing that key, except to be as close as possible to
        // the PackageInfo generated by previous versions of electron-builder.

        delete packageInfo.ChildBundles;

        if (options.isRelocatable != null) {
          packageInfo.BundleIsRelocatable = options.isRelocatable;
        }

        if (options.isVersionChecked != null) {
          packageInfo.BundleIsVersionChecked = options.isVersionChecked;
        }

        if (options.hasStrictIdentifier != null) {
          packageInfo.BundleHasStrictIdentifier = options.hasStrictIdentifier;
        }

        if (options.overwriteAction != null) {
          packageInfo.BundleOverwriteAction = options.overwriteAction;
        }

        yield (0, _fsExtraP().writeFile)(propertyListOutputFile, (0, _plist().build)(plistInfo));
      } // now build the package


      const args = ["--root", rootPath, "--component-plist", propertyListOutputFile];
      (0, _builderUtil().use)(_this3.options.installLocation || "/Applications", it => args.push("--install-location", it));

      if (options.scripts != null) {
        args.push("--scripts", path.resolve(_this3.packager.info.buildResourcesDir, options.scripts));
      } else if (options.scripts !== null) {
        const dir = path.join(_this3.packager.info.buildResourcesDir, "pkg-scripts");
        const stat = yield (0, _fs().statOrNull)(dir);

        if (stat != null && stat.isDirectory()) {
          args.push("--scripts", dir);
        }
      }

      args.push(packageOutputFile);
      yield (0, _builderUtil().exec)("pkgbuild", args);
    })();
  }

}

exports.PkgTarget = PkgTarget;

function prepareProductBuildArgs(identity, keychain) {
  const args = [];

  if (identity != null) {
    args.push("--sign", identity.hash);

    if (keychain != null) {
      args.push("--keychain", keychain);
    }
  }

  return args;
} 
//# sourceMappingURL=pkg.js.map