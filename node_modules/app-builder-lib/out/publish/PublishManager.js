"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createPublisher = createPublisher;
exports.computeDownloadUrl = computeDownloadUrl;
exports.getPublishConfigs = exports.getPublishConfigsForUpdateInfo = exports.getAppUpdatePublishConfiguration = exports.PublishManager = void 0;

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

function _builderUtilRuntime() {
  const data = require("builder-util-runtime");

  _builderUtilRuntime = function () {
    return data;
  };

  return data;
}

var _debug2 = _interopRequireDefault(require("debug"));

function _electronPublish() {
  const data = require("electron-publish");

  _electronPublish = function () {
    return data;
  };

  return data;
}

function _BintrayPublisher() {
  const data = require("electron-publish/out/BintrayPublisher");

  _BintrayPublisher = function () {
    return data;
  };

  return data;
}

function _gitHubPublisher() {
  const data = require("electron-publish/out/gitHubPublisher");

  _gitHubPublisher = function () {
    return data;
  };

  return data;
}

function _multiProgress() {
  const data = require("electron-publish/out/multiProgress");

  _multiProgress = function () {
    return data;
  };

  return data;
}

function _s3Publisher() {
  const data = _interopRequireDefault(require("electron-publish/out/s3/s3Publisher"));

  _s3Publisher = function () {
    return data;
  };

  return data;
}

function _spacesPublisher() {
  const data = _interopRequireDefault(require("electron-publish/out/s3/spacesPublisher"));

  _spacesPublisher = function () {
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

function _isCi() {
  const data = _interopRequireDefault(require("is-ci"));

  _isCi = function () {
    return data;
  };

  return data;
}

var path = _interopRequireWildcard(require("path"));

function url() {
  const data = _interopRequireWildcard(require("url"));

  url = function () {
    return data;
  };

  return data;
}

function _index() {
  const data = require("../index");

  _index = function () {
    return data;
  };

  return data;
}

function _macroExpander() {
  const data = require("../util/macroExpander");

  _macroExpander = function () {
    return data;
  };

  return data;
}

function _updateInfoBuilder() {
  const data = require("./updateInfoBuilder");

  _updateInfoBuilder = function () {
    return data;
  };

  return data;
}

let resolvePublishConfigurations = (() => {
  var _ref5 = (0, _bluebirdLst().coroutine)(function* (publishers, platformPackager, packager, arch, errorIfCannot) {
    if (publishers == null) {
      let serviceName = null;

      if (!(0, _builderUtil().isEmptyOrSpaces)(process.env.GH_TOKEN) || !(0, _builderUtil().isEmptyOrSpaces)(process.env.GITHUB_TOKEN)) {
        serviceName = "github";
      } else if (!(0, _builderUtil().isEmptyOrSpaces)(process.env.BT_TOKEN)) {
        serviceName = "bintray";
      }

      if (serviceName != null) {
        _builderUtil().log.debug(null, `Detect ${serviceName} as publish provider`);

        return [yield getResolvedPublishConfig(platformPackager, packager, {
          provider: serviceName
        }, arch, errorIfCannot)];
      }
    }

    if (publishers == null) {
      return [];
    }

    debug(`Explicit publish provider: ${(0, _builderUtil().safeStringifyJson)(publishers)}`);
    return yield _bluebirdLst().default.map((0, _builderUtil().asArray)(publishers), it => getResolvedPublishConfig(platformPackager, packager, typeof it === "string" ? {
      provider: it
    } : it, arch, errorIfCannot));
  });

  return function resolvePublishConfigurations(_x12, _x13, _x14, _x15, _x16) {
    return _ref5.apply(this, arguments);
  };
})();

let getResolvedPublishConfig = (() => {
  var _ref6 = (0, _bluebirdLst().coroutine)(function* (platformPackager, packager, options, arch, errorIfCannot) {
    let getInfo = (() => {
      var _ref7 = (0, _bluebirdLst().coroutine)(function* () {
        const info = yield packager.repositoryInfo;

        if (info != null) {
          return info;
        }

        const message = `Cannot detect repository by .git/config. Please specify "repository" in the package.json (https://docs.npmjs.com/files/package.json#repository).\nPlease see https://electron.build/configuration/publish`;

        if (errorIfCannot) {
          throw new Error(message);
        } else {
          _builderUtil().log.warn(message);

          return null;
        }
      });

      return function getInfo() {
        return _ref7.apply(this, arguments);
      };
    })();

    options = Object.assign({}, options);
    expandPublishConfig(options, platformPackager, packager, arch);
    let channelFromAppVersion = null;

    if (options.channel == null && isDetectUpdateChannel(platformPackager == null ? null : platformPackager.platformSpecificBuildOptions, packager.config)) {
      channelFromAppVersion = packager.appInfo.channel;
    }

    const provider = options.provider;

    if (provider === "generic") {
      const o = options;

      if (o.url == null) {
        throw new (_builderUtil().InvalidConfigurationError)(`Please specify "url" for "generic" update server`);
      }

      if (channelFromAppVersion != null) {
        o.channel = channelFromAppVersion;
      }

      return options;
    }

    const providerClass = requireProviderClass(options.provider);

    if (providerClass != null && providerClass.checkAndResolveOptions != null) {
      yield providerClass.checkAndResolveOptions(options, channelFromAppVersion, errorIfCannot);
      return options;
    }

    const isGithub = provider === "github";

    if (!isGithub && provider !== "bintray") {
      return options;
    }

    let owner = isGithub ? options.owner : options.owner;
    let project = isGithub ? options.repo : options.package;

    if (isGithub && owner == null && project != null) {
      const index = project.indexOf("/");

      if (index > 0) {
        const repo = project;
        project = repo.substring(0, index);
        owner = repo.substring(index + 1);
      }
    }

    if (!owner || !project) {
      _builderUtil().log.debug({
        reason: "owner or project is not specified explicitly",
        provider,
        owner,
        project
      }, "calling getInfo");

      const info = yield getInfo();

      if (info == null) {
        return null;
      }

      if (!owner) {
        owner = info.user;
      }

      if (!project) {
        project = info.project;
      }
    }

    if (isGithub) {
      if (options.token != null && !options.private) {
        _builderUtil().log.warn('"token" specified in the github publish options. It should be used only for [setFeedURL](module:electron-updater/out/AppUpdater.AppUpdater+setFeedURL).');
      } //tslint:disable-next-line:no-object-literal-type-assertion


      return Object.assign({
        owner,
        repo: project
      }, options);
    } else {
      //tslint:disable-next-line:no-object-literal-type-assertion
      return Object.assign({
        owner,
        package: project
      }, options);
    }
  });

  return function getResolvedPublishConfig(_x17, _x18, _x19, _x20, _x21) {
    return _ref6.apply(this, arguments);
  };
})(); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const publishForPrWarning = "There are serious security concerns with PUBLISH_FOR_PULL_REQUEST=true (see the  CircleCI documentation (https://circleci.com/docs/1.0/fork-pr-builds/) for details)" + "\nIf you have SSH keys, sensitive env vars or AWS credentials stored in your project settings and untrusted forks can make pull requests against your repo, then this option isn't for you.";
const debug = (0, _debug2.default)("electron-builder:publish");

function checkOptions(publishPolicy) {
  if (publishPolicy != null && publishPolicy !== "onTag" && publishPolicy !== "onTagOrDraft" && publishPolicy !== "always" && publishPolicy !== "never") {
    if (typeof publishPolicy === "string") {
      throw new (_builderUtil().InvalidConfigurationError)(`Expected one of "onTag", "onTagOrDraft", "always", "never", but got ${JSON.stringify(publishPolicy)}.\nPlease note that publish configuration should be specified under "config"`);
    }
  }
}

class PublishManager {
  constructor(packager, publishOptions, cancellationToken = packager.cancellationToken) {
    var _this = this;

    this.packager = packager;
    this.publishOptions = publishOptions;
    this.cancellationToken = cancellationToken;
    this.nameToPublisher = new Map();
    this.isPublish = false;
    this.progress = process.stdout.isTTY ? new (_multiProgress().MultiProgress)() : null;
    this.updateFileWriteTask = [];
    checkOptions(publishOptions.publish);
    this.taskManager = new (_builderUtil().AsyncTaskManager)(cancellationToken);
    const forcePublishForPr = process.env.PUBLISH_FOR_PULL_REQUEST === "true";

    if (!(0, _builderUtil().isPullRequest)() || forcePublishForPr) {
      if (publishOptions.publish === undefined) {
        if (process.env.npm_lifecycle_event === "release") {
          publishOptions.publish = "always";
        } else {
          const tag = (0, _electronPublish().getCiTag)();

          if (tag != null) {
            _builderUtil().log.info({
              reason: "tag is defined",
              tag
            }, "artifacts will be published");

            publishOptions.publish = "onTag";
          } else if (_isCi().default) {
            _builderUtil().log.info({
              reason: "CI detected"
            }, "artifacts will be published if draft release exists");

            publishOptions.publish = "onTagOrDraft";
          }
        }
      }

      const publishPolicy = publishOptions.publish;
      this.isPublish = publishPolicy != null && publishOptions.publish !== "never" && (publishPolicy !== "onTag" || (0, _electronPublish().getCiTag)() != null);

      if (this.isPublish && forcePublishForPr) {
        _builderUtil().log.warn(publishForPrWarning);
      }
    } else if (publishOptions.publish !== "never") {
      _builderUtil().log.info({
        reason: "current build is a part of pull request",
        solution: `set env PUBLISH_FOR_PULL_REQUEST to true to force code signing\n${publishForPrWarning}`
      }, "publishing will be skipped");
    }

    packager.addAfterPackHandler((() => {
      var _ref = (0, _bluebirdLst().coroutine)(function* (event) {
        const packager = event.packager;

        if (event.electronPlatformName === "darwin") {
          if (!event.targets.some(it => it.name === "dmg" || it.name === "zip")) {
            return;
          }
        } else if (packager.platform === _index().Platform.WINDOWS) {
          if (!event.targets.some(it => isSuitableWindowsTarget(it))) {
            return;
          }
        } else {
          return;
        }

        const publishConfig = yield getAppUpdatePublishConfiguration(packager, event.arch, _this.isPublish);

        if (publishConfig != null) {
          yield (0, _fsExtraP().writeFile)(path.join(packager.getResourcesDir(event.appOutDir), "app-update.yml"), (0, _builderUtil().serializeToYaml)(publishConfig));
        }
      });

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    })());
    packager.artifactCreated(event => {
      const publishConfiguration = event.publishConfig;

      if (publishConfiguration == null) {
        this.taskManager.addTask(this.artifactCreatedWithoutExplicitPublishConfig(event));
      } else if (this.isPublish) {
        if (debug.enabled) {
          debug(`artifactCreated (isPublish: ${this.isPublish}): ${(0, _builderUtil().safeStringifyJson)(event, new Set(["packager"]))},\n  publishConfig: ${(0, _builderUtil().safeStringifyJson)(publishConfiguration)}`);
        }

        this.scheduleUpload(publishConfiguration, event, this.getAppInfo(event.packager));
      }
    });
  }

  getAppInfo(platformPackager) {
    return platformPackager == null ? this.packager.appInfo : platformPackager.appInfo;
  }

  getGlobalPublishConfigurations() {
    var _this2 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      const publishers = _this2.packager.config.publish;
      return yield resolvePublishConfigurations(publishers, null, _this2.packager, null, true);
    })();
  }
  /** @internal */


  scheduleUpload(publishConfig, event, appInfo) {
    if (publishConfig.provider === "generic") {
      return;
    }

    const publisher = this.getOrCreatePublisher(publishConfig, appInfo);

    if (publisher == null) {
      _builderUtil().log.debug({
        file: event.file,
        reason: "publisher is null",
        publishConfig: (0, _builderUtil().safeStringifyJson)(publishConfig)
      }, "not published");

      return;
    }

    const providerName = publisher.providerName;

    if (this.publishOptions.publish === "onTagOrDraft" && (0, _electronPublish().getCiTag)() == null && !(providerName === "GitHub" || providerName === "Bintray")) {
      _builderUtil().log.info({
        file: event.file,
        reason: "current build is not for a git tag",
        publishPolicy: "onTagOrDraft"
      }, `not published to ${providerName}`);

      return;
    }

    this.taskManager.addTask(publisher.upload(event));
  }

  artifactCreatedWithoutExplicitPublishConfig(event) {
    var _this3 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      const platformPackager = event.packager;
      const target = event.target;
      const publishConfigs = yield getPublishConfigs(platformPackager, target == null ? null : target.options, event.arch, _this3.isPublish);

      if (debug.enabled) {
        debug(`artifactCreated (isPublish: ${_this3.isPublish}): ${(0, _builderUtil().safeStringifyJson)(event, new Set(["packager"]))},\n  publishConfigs: ${(0, _builderUtil().safeStringifyJson)(publishConfigs)}`);
      }

      const eventFile = event.file;

      if (publishConfigs == null) {
        if (_this3.isPublish) {
          _builderUtil().log.debug({
            file: eventFile,
            reason: "no publish configs"
          }, "not published");
        }

        return;
      }

      if (_this3.isPublish) {
        for (const publishConfig of publishConfigs) {
          if (_this3.cancellationToken.cancelled) {
            _builderUtil().log.debug({
              file: event.file,
              reason: "cancelled"
            }, "not published");

            break;
          }

          _this3.scheduleUpload(publishConfig, event, _this3.getAppInfo(platformPackager));
        }
      }

      if (event.isWriteUpdateInfo && target != null && eventFile != null && !_this3.cancellationToken.cancelled && (platformPackager.platform !== _index().Platform.WINDOWS || isSuitableWindowsTarget(target))) {
        _this3.taskManager.addTask((0, _updateInfoBuilder().createUpdateInfoTasks)(event, publishConfigs).then(it => _this3.updateFileWriteTask.push(...it)));
      }
    })();
  }

  getOrCreatePublisher(publishConfig, appInfo) {
    // to not include token into cache key
    const providerCacheKey = (0, _builderUtil().safeStringifyJson)(publishConfig);
    let publisher = this.nameToPublisher.get(providerCacheKey);

    if (publisher == null) {
      publisher = createPublisher(this, appInfo.version, publishConfig, this.publishOptions);
      this.nameToPublisher.set(providerCacheKey, publisher);

      _builderUtil().log.info({
        publisher: publisher.toString()
      }, "publishing");
    }

    return publisher;
  } // noinspection JSUnusedGlobalSymbols


  cancelTasks() {
    this.taskManager.cancelTasks();
    this.nameToPublisher.clear();
  }

  awaitTasks() {
    var _this4 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      yield _this4.taskManager.awaitTasks();
      const updateInfoFileTasks = _this4.updateFileWriteTask;

      if (_this4.cancellationToken.cancelled || updateInfoFileTasks.length === 0) {
        return;
      }

      yield (0, _updateInfoBuilder().writeUpdateInfoFiles)(updateInfoFileTasks, _this4.packager);
      yield _this4.taskManager.awaitTasks();
    })();
  }

}

exports.PublishManager = PublishManager;

let getAppUpdatePublishConfiguration = (() => {
  var _ref2 = (0, _bluebirdLst().coroutine)(function* (packager, arch, errorIfCannot) {
    const publishConfigs = yield getPublishConfigsForUpdateInfo(packager, (yield getPublishConfigs(packager, null, arch, errorIfCannot)), arch);

    if (publishConfigs == null || publishConfigs.length === 0) {
      return null;
    }

    let publishConfig = publishConfigs[0];

    if (packager.platform === _index().Platform.WINDOWS && publishConfig.publisherName == null) {
      const winPackager = packager;

      if (winPackager.isForceCodeSigningVerification) {
        const publisherName = yield winPackager.computedPublisherName.value;

        if (publisherName != null) {
          publishConfig = Object.assign({}, publishConfig, {
            publisherName
          });
        }
      }
    }

    return publishConfig;
  });

  return function getAppUpdatePublishConfiguration(_x2, _x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

exports.getAppUpdatePublishConfiguration = getAppUpdatePublishConfiguration;

let getPublishConfigsForUpdateInfo = (() => {
  var _ref3 = (0, _bluebirdLst().coroutine)(function* (packager, publishConfigs, arch) {
    if (publishConfigs === null) {
      return null;
    }

    if (publishConfigs.length === 0) {
      _builderUtil().log.debug(null, "getPublishConfigsForUpdateInfo: no publishConfigs, detect using repository info"); // https://github.com/electron-userland/electron-builder/issues/925#issuecomment-261732378
      // default publish config is github, file should be generated regardless of publish state (user can test installer locally or manage the release process manually)


      const repositoryInfo = yield packager.info.repositoryInfo;
      debug(`getPublishConfigsForUpdateInfo: ${(0, _builderUtil().safeStringifyJson)(repositoryInfo)}`);

      if (repositoryInfo != null && repositoryInfo.type === "github") {
        const resolvedPublishConfig = yield getResolvedPublishConfig(packager, packager.info, {
          provider: repositoryInfo.type
        }, arch, false);

        if (resolvedPublishConfig != null) {
          debug(`getPublishConfigsForUpdateInfo: resolve to publish config ${(0, _builderUtil().safeStringifyJson)(resolvedPublishConfig)}`);
          return [resolvedPublishConfig];
        }
      }
    }

    return publishConfigs;
  });

  return function getPublishConfigsForUpdateInfo(_x5, _x6, _x7) {
    return _ref3.apply(this, arguments);
  };
})();

exports.getPublishConfigsForUpdateInfo = getPublishConfigsForUpdateInfo;

function createPublisher(context, version, publishConfig, options) {
  if (debug.enabled) {
    debug(`Create publisher: ${(0, _builderUtil().safeStringifyJson)(publishConfig)}`);
  }

  const provider = publishConfig.provider;

  switch (provider) {
    case "github":
      return new (_gitHubPublisher().GitHubPublisher)(context, publishConfig, version, options);

    case "bintray":
      return new (_BintrayPublisher().BintrayPublisher)(context, publishConfig, version, options);

    case "generic":
      return null;

    default:
      const clazz = requireProviderClass(provider);
      return clazz == null ? null : new clazz(context, publishConfig);
  }
}

function requireProviderClass(provider) {
  switch (provider) {
    case "github":
      return _gitHubPublisher().GitHubPublisher;

    case "bintray":
      return _BintrayPublisher().BintrayPublisher;

    case "generic":
      return null;

    case "s3":
      return _s3Publisher().default;

    case "spaces":
      return _spacesPublisher().default;

    default:
      return require(`electron-publisher-${provider}`).default;
  }
}

function computeDownloadUrl(publishConfiguration, fileName, packager) {
  if (publishConfiguration.provider === "generic") {
    const baseUrlString = publishConfiguration.url;

    if (fileName == null) {
      return baseUrlString;
    }

    const baseUrl = url().parse(baseUrlString);
    return url().format(Object.assign({}, baseUrl, {
      pathname: path.posix.resolve(baseUrl.pathname || "/", encodeURI(fileName))
    }));
  }

  let baseUrl;

  if (publishConfiguration.provider === "github") {
    const gh = publishConfiguration;
    baseUrl = `${(0, _builderUtilRuntime().githubUrl)(gh)}/${gh.owner}/${gh.repo}/releases/download/${gh.vPrefixedTagName === false ? "" : "v"}${packager.appInfo.version}`;
  } else {
    baseUrl = (0, _builderUtilRuntime().getS3LikeProviderBaseUrl)(publishConfiguration);
  }

  if (fileName == null) {
    return baseUrl;
  }

  return `${baseUrl}/${encodeURI(fileName)}`;
}

let getPublishConfigs = (() => {
  var _ref4 = (0, _bluebirdLst().coroutine)(function* (platformPackager, targetSpecificOptions, arch, errorIfCannot) {
    let publishers; // check build.nsis (target)

    if (targetSpecificOptions != null) {
      publishers = targetSpecificOptions.publish; // if explicitly set to null - do not publish

      if (publishers === null) {
        return null;
      }
    } // check build.win (platform)


    if (publishers == null) {
      publishers = platformPackager.platformSpecificBuildOptions.publish;

      if (publishers === null) {
        return null;
      }
    }

    if (publishers == null) {
      publishers = platformPackager.config.publish;

      if (publishers === null) {
        return null;
      }
    }

    return yield resolvePublishConfigurations(publishers, platformPackager, platformPackager.info, arch, errorIfCannot);
  });

  return function getPublishConfigs(_x8, _x9, _x10, _x11) {
    return _ref4.apply(this, arguments);
  };
})();

exports.getPublishConfigs = getPublishConfigs;

function isSuitableWindowsTarget(target) {
  if (target.name === "appx" && target.options != null && target.options.electronUpdaterAware) {
    return true;
  }

  return target.name === "nsis" || target.name.startsWith("nsis-");
}

function expandPublishConfig(options, platformPackager, packager, arch) {
  for (const name of Object.keys(options)) {
    const value = options[name];

    if (typeof value === "string") {
      const archValue = arch == null ? null : _builderUtil().Arch[arch];
      const expanded = platformPackager == null ? (0, _macroExpander().expandMacro)(value, archValue, packager.appInfo) : platformPackager.expandMacro(value, archValue);

      if (expanded !== value) {
        options[name] = expanded;
      }
    }
  }
}

function isDetectUpdateChannel(platformSpecificConfiguration, configuration) {
  const value = platformSpecificConfiguration == null ? null : platformSpecificConfiguration.detectUpdateChannel;
  return value == null ? configuration.detectUpdateChannel !== false : value;
}
//# sourceMappingURL=PublishManager.js.map