"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RemoteBuilder = void 0;

function _bluebirdLst() {
  const data = _interopRequireWildcard(require("bluebird-lst"));

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

var path = _interopRequireWildcard(require("path"));

function _core() {
  const data = require("../core");

  _core = function () {
    return data;
  };

  return data;
}

function _ProjectInfoManager() {
  const data = require("./ProjectInfoManager");

  _ProjectInfoManager = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

class RemoteBuilder {
  constructor(packager) {
    this.packager = packager;
    this.toBuild = new Map();
    this.buildStarted = false;
  }

  scheduleBuild(target, arch, unpackedDirectory) {
    if (!(0, _builderUtil().isEnvTrue)(process.env._REMOTE_BUILD) && this.packager.config.remoteBuild === false) {
      throw new Error("Target is not supported on your OS and using of Electron Build Service is disabled (\"remoteBuild\" option)");
    }

    let list = this.toBuild.get(arch);

    if (list == null) {
      list = [];
      this.toBuild.set(arch, list);
    }

    list.push({
      name: target.name,
      arch: _builderUtil().Arch[arch],
      unpackedDirectory,
      outDir: target.outDir
    });
  }

  build() {
    if (this.buildStarted) {
      return Promise.resolve();
    }

    this.buildStarted = true;
    return _bluebirdLst().default.mapSeries(Array.from(this.toBuild.keys()), arch => {
      return this._build(this.toBuild.get(arch), this.packager);
    });
  } // noinspection JSMethodCanBeStatic


  _build(targets, packager) {
    var _this = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      if (_builderUtil().log.isDebugEnabled) {
        _builderUtil().log.debug({
          remoteTargets: JSON.stringify(targets, null, 2)
        }, "remote building");
      }

      const projectInfoManager = new (_ProjectInfoManager().ProjectInfoManager)(packager.info); // let result: RemoteBuilderResponse | null = null

      const req = Buffer.from(JSON.stringify({
        targets: targets.map(it => {
          return {
            name: it.name,
            arch: it.arch,
            unpackedDirName: path.basename(it.unpackedDirectory)
          };
        }),
        platform: packager.platform.buildConfigurationKey
      })).toString("base64");
      const outDir = targets[0].outDir;
      const args = ["remote-build", "--request", req, "--output", outDir];
      args.push("--file", targets[0].unpackedDirectory);
      args.push("--file", (yield projectInfoManager.infoFile.value));
      const buildResourcesDir = packager.buildResourcesDir;

      if (buildResourcesDir === packager.projectDir) {
        throw new (_builderUtil().InvalidConfigurationError)(`Build resources dir equals to project dir and so, not sent to remote build agent. It will lead to incorrect results.\nPlease set "directories.buildResources" to separate dir or leave default ("build" directory in the project root)`);
      }

      args.push("--build-resource-dir", buildResourcesDir);
      const result = yield (0, _builderUtil().executeAppBuilderAsJson)(args);

      if (result.error != null) {
        throw new (_builderUtil().InvalidConfigurationError)(`Remote builder error (if you think that it is not your application misconfiguration issue, please file issue to https://github.com/electron-userland/electron-builder/issues):\n\n${result.error}`, "REMOTE_BUILDER_ERROR");
      } else if (result.files != null) {
        for (const artifact of result.files) {
          const localFile = path.join(outDir, artifact.file);

          const artifactCreatedEvent = _this.artifactInfoToArtifactCreatedEvent(artifact, localFile, outDir); // PublishManager uses outDir and options, real (the same as for local build) values must be used


          _this.packager.info.dispatchArtifactCreated(artifactCreatedEvent);
        }
      }
    })();
  }

  artifactInfoToArtifactCreatedEvent(artifact, localFile, outDir) {
    const target = artifact.target; // noinspection SpellCheckingInspection

    return Object.assign({}, artifact, {
      file: localFile,
      target: target == null ? null : new FakeTarget(target, outDir, this.packager.config[target]),
      packager: this.packager
    });
  }

}

exports.RemoteBuilder = RemoteBuilder;

class FakeTarget extends _core().Target {
  constructor(name, outDir, options) {
    super(name);
    this.outDir = outDir;
    this.options = options;
  }

  build(appOutDir, arch) {// no build

    return (0, _bluebirdLst().coroutine)(function* () {})();
  }

} 
//# sourceMappingURL=RemoteBuilder.js.map