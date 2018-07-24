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

function _zipBin() {
  const data = require("7zip-bin");

  _zipBin = function () {
    return data;
  };

  return data;
}

function _appBuilderBin() {
  const data = require("app-builder-bin");

  _appBuilderBin = function () {
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

function _bundledTool() {
  const data = require("builder-util/out/bundledTool");

  _bundledTool = function () {
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

var path = _interopRequireWildcard(require("path"));

function _core() {
  const data = require("../core");

  _core = function () {
    return data;
  };

  return data;
}

function errorMessages() {
  const data = _interopRequireWildcard(require("../errorMessages"));

  errorMessages = function () {
    return data;
  };

  return data;
}

function _pathManager() {
  const data = require("../util/pathManager");

  _pathManager = function () {
    return data;
  };

  return data;
}

function _LinuxTargetHelper() {
  const data = require("./LinuxTargetHelper");

  _LinuxTargetHelper = function () {
    return data;
  };

  return data;
}

function _tools() {
  const data = require("./tools");

  _tools = function () {
    return data;
  };

  return data;
}

let writeConfigFile = (() => {
  var _ref = (0, _bluebirdLst().coroutine)(function* (tmpDir, templatePath, options) {
    //noinspection JSUnusedLocalSymbols
    function replacer(match, p1) {
      if (p1 in options) {
        return options[p1];
      } else {
        throw new Error(`Macro ${p1} is not defined`);
      }
    }

    const config = (yield (0, _fsExtraP().readFile)(templatePath, "utf8")).replace(/\${([a-zA-Z]+)}/g, replacer).replace(/<%=([a-zA-Z]+)%>/g, (match, p1) => {
      _builderUtil().log.warn("<%= varName %> is deprecated, please use ${varName} instead");

      return replacer(match, p1.trim());
    });
    const outputPath = yield tmpDir.getTempFile({
      suffix: path.basename(templatePath, ".tpl")
    });
    yield (0, _fsExtraP().outputFile)(outputPath, config);
    return outputPath;
  });

  return function writeConfigFile(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})(); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

class FpmTarget extends _core().Target {
  constructor(name, packager, helper, outDir) {
    super(name, false);
    this.packager = packager;
    this.helper = helper;
    this.outDir = outDir;
    this.options = Object.assign({}, this.packager.platformSpecificBuildOptions, this.packager.config[this.name]);
    this.scriptFiles = this.createScripts();
  }

  createScripts() {
    var _this = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      const defaultTemplatesDir = (0, _pathManager().getTemplatePath)("linux");
      const packager = _this.packager;
      const templateOptions = Object.assign({
        // old API compatibility
        executable: packager.executableName,
        productFilename: packager.appInfo.productFilename
      }, packager.platformSpecificBuildOptions);

      function getResource(value, defaultFile) {
        if (value == null) {
          return path.join(defaultTemplatesDir, defaultFile);
        }

        return path.resolve(packager.projectDir, value);
      }

      return yield Promise.all([writeConfigFile(packager.info.tempDirManager, getResource(_this.options.afterInstall, "after-install.tpl"), templateOptions), writeConfigFile(packager.info.tempDirManager, getResource(_this.options.afterRemove, "after-remove.tpl"), templateOptions)]);
    })();
  }

  checkOptions() {
    return this.computeFpmMetaInfoOptions();
  }

  computeFpmMetaInfoOptions() {
    var _this2 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      const packager = _this2.packager;
      const projectUrl = yield packager.appInfo.computePackageUrl();
      const errors = [];

      if (projectUrl == null) {
        errors.push("Please specify project homepage, see https://electron.build/configuration/configuration#Metadata-homepage");
      }

      const options = _this2.options;
      let author = options.maintainer;

      if (author == null) {
        const a = packager.info.metadata.author;

        if (a == null || a.email == null) {
          errors.push(errorMessages().authorEmailIsMissed);
        } else {
          author = `${a.name} <${a.email}>`;
        }
      }

      if (errors.length > 0) {
        throw new Error(errors.join("\n\n"));
      }

      return {
        maintainer: author,
        url: projectUrl,
        vendor: options.vendor || author
      };
    })();
  }

  build(appOutDir, arch) {
    var _this3 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      const fpmMetaInfoOptions = yield _this3.computeFpmMetaInfoOptions();
      const target = _this3.name; // tslint:disable:no-invalid-template-strings

      let nameFormat = "${name}-${version}-${arch}.${ext}";
      let isUseArchIfX64 = false;

      if (target === "deb") {
        nameFormat = "${name}_${version}_${arch}.${ext}";
        isUseArchIfX64 = true;
      } else if (target === "rpm") {
        nameFormat = "${name}-${version}.${arch}.${ext}";
        isUseArchIfX64 = true;
      }

      const artifactPath = path.join(_this3.outDir, _this3.packager.expandArtifactNamePattern(_this3.options, target, arch, nameFormat, !isUseArchIfX64));

      _this3.logBuilding(target, artifactPath, arch);

      yield (0, _fs().unlinkIfExists)(artifactPath);

      if (_this3.packager.packagerOptions.prepackaged != null) {
        yield (0, _fsExtraP().ensureDir)(_this3.outDir);
      }

      const scripts = yield _this3.scriptFiles;
      const packager = _this3.packager;
      const appInfo = packager.appInfo;
      const options = _this3.options;
      const synopsis = options.synopsis;
      const args = ["-s", "dir", "-t", target, "--architecture", target === "pacman" && arch === _builderUtil().Arch.ia32 ? "i686" : (0, _builderUtil().toLinuxArchString)(arch), "--name", appInfo.name, "--force", "--after-install", scripts[0], "--after-remove", scripts[1], "--description", (0, _builderUtil().smarten)(target === "rpm" ? _this3.helper.getDescription(options) : `${synopsis || ""}\n ${_this3.helper.getDescription(options)}`), "--version", appInfo.version, "--package", artifactPath];

      for (const key of Object.keys(fpmMetaInfoOptions)) {
        const value = fpmMetaInfoOptions[key];

        if (value != null) {
          args.push(`--${key}`, value);
        }
      }

      if (_builderUtil().debug.enabled) {
        args.push("--log", "debug", "--debug");
      }

      const packageCategory = options.packageCategory;

      if (packageCategory != null && packageCategory !== null) {
        args.push("--category", packageCategory);
      }

      const compression = options.compression;

      if (target === "deb") {
        args.push("--deb-compression", compression || "xz");
        (0, _builderUtil().use)(options.priority, it => args.push("--deb-priority", it));
      } else if (target === "rpm") {
        args.push("--rpm-compression", (compression === "xz" ? "xzmt" : compression) || "xzmt");
        args.push("--rpm-os", "linux");

        if (synopsis != null) {
          args.push("--rpm-summary", (0, _builderUtil().smarten)(synopsis));
        }
      } // noinspection JSDeprecatedSymbols


      let depends = options.depends || _this3.packager.platformSpecificBuildOptions.depends;

      if (depends == null) {
        if (target === "deb") {
          depends = ["gconf2", "gconf-service", "libnotify4", "libappindicator1", "libxtst6", "libnss3", "libxss1"];
        } else if (target === "pacman") {
          // noinspection SpellCheckingInspection
          depends = ["c-ares", "ffmpeg", "gtk3", "http-parser", "libevent", "libvpx", "libxslt", "libxss", "minizip", "nss", "re2", "snappy", "libnotify", "libappindicator-gtk2", "libappindicator-gtk3", "libappindicator-sharp"];
        } else if (target === "rpm") {
          // noinspection SpellCheckingInspection
          depends = ["libnotify", "libappindicator", "libXScrnSaver"];
        } else {
          depends = [];
        }
      } else if (!Array.isArray(depends)) {
        // noinspection SuspiciousTypeOfGuard
        if (typeof depends === "string") {
          depends = [depends];
        } else {
          throw new Error(`depends must be Array or String, but specified as: ${depends}`);
        }
      }

      for (const dep of depends) {
        args.push("--depends", dep);
      }

      (0, _builderUtil().use)(packager.info.metadata.license, it => args.push("--license", it));
      (0, _builderUtil().use)(appInfo.buildNumber, it => args.push("--iteration", it));
      (0, _builderUtil().use)(options.fpm, it => args.push(...it));
      args.push(`${appOutDir}/=${_LinuxTargetHelper().installPrefix}/${appInfo.productFilename}`);

      for (const icon of yield _this3.helper.icons) {
        args.push(`${icon.file}=/usr/share/icons/hicolor/${icon.size}x${icon.size}/apps/${packager.executableName}.png`);
      }

      const desktopFilePath = yield _this3.helper.writeDesktopEntry(_this3.options);
      args.push(`${desktopFilePath}=/usr/share/applications/${_this3.packager.executableName}.desktop`);

      if (_this3.packager.packagerOptions.effectiveOptionComputed != null && (yield _this3.packager.packagerOptions.effectiveOptionComputed([args, desktopFilePath]))) {
        return;
      }

      const env = Object.assign({}, process.env, {
        FPM_COMPRESS_PROGRAM: _appBuilderBin().appBuilderPath,
        SZA_PATH: _zipBin().path7za,
        SZA_COMPRESSION_LEVEL: packager.compression === "store" ? "0" : "9",
        SZA_ARCHIVE_TYPE: "xz"
      }); // rpmbuild wants directory rpm with some default config files. Even if we can use dylibbundler, path to such config files are not changed (we need to replace in the binary)
      // so, for now, brew install rpm is still required.

      if (target !== "rpm" && (yield (0, _builderUtil().isMacOsSierra)())) {
        const linuxToolsPath = yield (0, _tools().getLinuxToolsPath)();
        Object.assign(env, {
          PATH: (0, _bundledTool().computeEnv)(process.env.PATH, [path.join(linuxToolsPath, "bin")]),
          DYLD_LIBRARY_PATH: (0, _bundledTool().computeEnv)(process.env.DYLD_LIBRARY_PATH, [path.join(linuxToolsPath, "lib")])
        });
      }

      yield (0, _builderUtil().exec)((yield _tools().fpmPath.value), args, {
        env
      });

      _this3.packager.dispatchArtifactCreated(artifactPath, _this3, arch);
    })();
  }

}

exports.default = FpmTarget;
//# sourceMappingURL=fpm.js.map