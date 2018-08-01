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

function _builderUtilRuntime() {
  const data = require("builder-util-runtime");

  _builderUtilRuntime = function () {
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

function _core() {
  const data = require("../core");

  _core = function () {
    return data;
  };

  return data;
}

function _linuxPackager() {
  const data = require("../linuxPackager");

  _linuxPackager = function () {
    return data;
  };

  return data;
}

function _targetUtil() {
  const data = require("./targetUtil");

  _targetUtil = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

// libxss1, libasound2, gconf2 - was "error while loading shared libraries: libXss.so.1" on Xubuntu 16.04
const defaultStagePackages = ["libasound2", "libgconf2-4", "libnotify4", "libnspr4", "libnss3", "libpcre3", "libpulse0", "libxss1", "libxtst6", "libappindicator1"];
const defaultPlugs = ["desktop", "desktop-legacy", "home", "x11", "unity7", "browser-support", "network", "gsettings", "pulseaudio", "opengl"];

class SnapTarget extends _core().Target {
  constructor(name, packager, helper, outDir) {
    super(name);
    this.packager = packager;
    this.helper = helper;
    this.outDir = outDir;
    this.options = Object.assign({}, this.packager.platformSpecificBuildOptions, this.packager.config[this.name]);
    this.isUseTemplateApp = false;
  }

  replaceDefault(inList, defaultList) {
    const result = (0, _builderUtil().replaceDefault)(inList, defaultList);

    if (result !== defaultList) {
      this.isUseTemplateApp = false;
    }

    return result;
  }

  get isElectron2() {
    return semver().gte(this.packager.config.electronVersion || "1.8.3", "2.0.0-beta.1");
  }

  createDescriptor(arch) {
    const appInfo = this.packager.appInfo;
    const snapName = this.packager.executableName.toLowerCase();
    const options = this.options;
    const linuxArchName = (0, _linuxPackager().toAppImageOrSnapArch)(arch);
    const plugs = normalizePlugConfiguration(options.plugs);
    const plugNames = this.replaceDefault(plugs == null ? null : Object.getOwnPropertyNames(plugs), defaultPlugs);
    const desktopPart = this.isElectron2 ? "desktop-gtk3" : "desktop-gtk2";
    const buildPackages = (0, _builderUtilRuntime().asArray)(options.buildPackages);
    this.isUseTemplateApp = this.options.useTemplateApp !== false && arch === _builderUtil().Arch.x64 && buildPackages.length === 0 && this.isElectron2;
    const appDescriptor = {
      command: `command.sh`,
      environment: Object.assign({
        TMPDIR: "$XDG_RUNTIME_DIR",
        PATH: "$SNAP/usr/sbin:$SNAP/usr/bin:$SNAP/sbin:$SNAP/bin:$PATH",
        LD_LIBRARY_PATH: ["$SNAP_LIBRARY_PATH", "$SNAP/usr/lib/" + linuxArchName + "-linux-gnu:$SNAP/usr/lib/" + linuxArchName + "-linux-gnu/pulseaudio", "$SNAP/usr/lib/" + linuxArchName + "-linux-gnu/mesa-egl", "$SNAP/lib:$SNAP/usr/lib:$SNAP/lib/" + linuxArchName + "-linux-gnu:$SNAP/usr/lib/" + linuxArchName + "-linux-gnu", "$LD_LIBRARY_PATH:$SNAP/lib:$SNAP/usr/lib", "$SNAP/lib/" + linuxArchName + "-linux-gnu:$SNAP/usr/lib/" + linuxArchName + "-linux-gnu"].join(":")
      }, options.environment),
      plugs: plugNames
    };
    const snap = {
      name: snapName,
      version: appInfo.version,
      summary: options.summary || appInfo.productName,
      description: this.helper.getDescription(options),
      confinement: options.confinement || "strict",
      grade: options.grade || "stable",
      architectures: [(0, _builderUtil().toLinuxArchString)(arch)],
      apps: {
        [snapName]: appDescriptor
      },
      parts: {
        app: {
          plugin: "nil",
          "stage-packages": this.replaceDefault(options.stagePackages, defaultStagePackages),
          after: this.replaceDefault(options.after, [desktopPart])
        }
      }
    };

    if (!this.isUseTemplateApp) {
      appDescriptor.adapter = "none";
    }

    if (buildPackages.length > 0) {
      snap.parts.app["build-packages"] = buildPackages;
    }

    if (plugs != null) {
      for (const plugName of plugNames) {
        const plugOptions = plugs[plugName];

        if (plugOptions == null) {
          continue;
        }

        if (snap.plugs == null) {
          snap.plugs = {};
        }

        snap.plugs[plugName] = plugOptions;
      }
    }

    if (options.assumes != null) {
      snap.assumes = (0, _builderUtilRuntime().asArray)(options.assumes);
    }

    if (!this.isUseTemplateApp && snap.parts.app.after.includes(desktopPart)) {
      // call super build (snapcraftctl build) otherwise /bin/desktop not created
      const desktopPartOverride = {
        "override-build": `set -x
snapcraftctl build
export XDG_DATA_DIRS=$SNAPCRAFT_PART_INSTALL/usr/share
update-mime-database $SNAPCRAFT_PART_INSTALL/usr/share/mime

for dir in $SNAPCRAFT_PART_INSTALL/usr/share/icons/*/; do
  if [ -f $dir/index.theme ]; then
    if which gtk-update-icon-cache-3.0 &> /dev/null; then
      gtk-update-icon-cache-3.0 -q $dir
    elif which gtk-update-icon-cache &> /dev/null; then
      gtk-update-icon-cache -q $dir
    fi
  fi
done`
      };

      if (appDescriptor.plugs.includes("desktop") || appDescriptor.plugs.includes("desktop-legacy")) {
        desktopPartOverride.stage = ["-./usr/share/fonts/**"];
      }

      snap.parts[desktopPart] = desktopPartOverride;
    }

    return snap;
  }

  build(appOutDir, arch) {
    var _this = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      const packager = _this.packager;
      const options = _this.options; // tslint:disable-next-line:no-invalid-template-strings

      const artifactName = packager.expandArtifactNamePattern(_this.options, "snap", arch, "${name}_${version}_${arch}.${ext}", false);
      const artifactPath = path.join(_this.outDir, artifactName);

      _this.logBuilding("snap", artifactPath, arch);

      const snap = _this.createDescriptor(arch);

      if (_this.isUseTemplateApp) {
        delete snap.parts;
      }

      const stageDir = yield (0, _targetUtil().createStageDirPath)(_this, packager, arch); // snapcraft.yaml inside a snap directory

      const snapMetaDir = path.join(stageDir, _this.isUseTemplateApp ? "meta" : "snap");
      const args = ["snap", "--app", appOutDir, "--stage", stageDir, "--arch", (0, _builderUtil().toLinuxArchString)(arch), "--output", artifactPath, "--executable", _this.packager.executableName, "--docker-image", "electronuserland/builder:latest"];
      yield _this.helper.icons;

      if (_this.helper.maxIconPath != null) {
        if (!_this.isUseTemplateApp) {
          snap.icon = "snap/gui/icon.png";
        }

        args.push("--icon", _this.helper.maxIconPath);
      }

      const desktopFile = path.join(snapMetaDir, "gui", `${snap.name}.desktop`);
      yield _this.helper.writeDesktopEntry(_this.options, packager.executableName, desktopFile, {
        // tslint:disable:no-invalid-template-strings
        Icon: "${SNAP}/meta/gui/icon.png"
      });

      if (packager.packagerOptions.effectiveOptionComputed != null && (yield packager.packagerOptions.effectiveOptionComputed({
        snap,
        desktopFile
      }))) {
        return;
      }

      yield (0, _fsExtraP().outputFile)(path.join(snapMetaDir, _this.isUseTemplateApp ? "snap.yaml" : "snapcraft.yaml"), (0, _builderUtil().serializeToYaml)(snap));
      const hooksDir = yield packager.getResource(options.hooks, "snap-hooks");

      if (hooksDir != null) {
        args.push("--hooks", hooksDir);
      }

      if (_this.isUseTemplateApp) {
        args.push("--template-url", "electron2");
      }

      yield (0, _builderUtil().executeAppBuilder)(args);
      packager.dispatchArtifactCreated(artifactPath, _this, arch, packager.computeSafeArtifactName(artifactName, "snap", arch, false));
    })();
  }

}

exports.default = SnapTarget;

function normalizePlugConfiguration(raw) {
  if (raw == null) {
    return null;
  }

  const result = {};

  for (const item of Array.isArray(raw) ? raw : [raw]) {
    if (typeof item === "string") {
      result[item] = null;
    } else {
      Object.assign(result, item);
    }
  }

  return result;
} 
//# sourceMappingURL=snap.js.map