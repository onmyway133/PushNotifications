"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRepositoryInfo = getRepositoryInfo;

function _bluebirdLst() {
  const data = require("bluebird-lst");

  _bluebirdLst = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("builder-util/out/promise");

  _promise = function () {
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

function _hostedGitInfo() {
  const data = require("hosted-git-info");

  _hostedGitInfo = function () {
    return data;
  };

  return data;
}

var path = _interopRequireWildcard(require("path"));

let getGitUrlFromGitConfig = (() => {
  var _ref = (0, _bluebirdLst().coroutine)(function* (projectDir) {
    const data = yield (0, _promise().orNullIfFileNotExist)((0, _fsExtraP().readFile)(path.join(projectDir, ".git", "config"), "utf8"));

    if (data == null) {
      return null;
    }

    const conf = data.split(/\r?\n/);
    const i = conf.indexOf('[remote "origin"]');

    if (i !== -1) {
      let u = conf[i + 1];

      if (!u.match(/^\s*url =/)) {
        u = conf[i + 2];
      }

      if (u.match(/^\s*url =/)) {
        return u.replace(/^\s*url = /, "");
      }
    }

    return null;
  });

  return function getGitUrlFromGitConfig(_x) {
    return _ref.apply(this, arguments);
  };
})();

let _getInfo = (() => {
  var _ref2 = (0, _bluebirdLst().coroutine)(function* (projectDir, repo) {
    if (repo != null) {
      return parseRepositoryUrl(typeof repo === "string" ? repo : repo.url);
    }

    const slug = process.env.TRAVIS_REPO_SLUG || process.env.APPVEYOR_REPO_NAME;

    if (slug != null) {
      const splitted = slug.split("/");
      return {
        user: splitted[0],
        project: splitted[1]
      };
    }

    const user = process.env.CIRCLE_PROJECT_USERNAME;
    const project = process.env.CIRCLE_PROJECT_REPONAME;

    if (user != null && project != null) {
      return {
        user,
        project
      };
    }

    const url = yield getGitUrlFromGitConfig(projectDir);
    return url == null ? null : parseRepositoryUrl(url);
  });

  return function _getInfo(_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
})();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function getRepositoryInfo(projectDir, metadata, devMetadata) {
  return _getInfo(projectDir, (devMetadata == null ? null : devMetadata.repository) || (metadata == null ? null : metadata.repository));
}

function parseRepositoryUrl(url) {
  const info = (0, _hostedGitInfo().fromUrl)(url);

  if (info != null) {
    delete info.protocols;
    delete info.treepath;
    delete info.filetemplate;
    delete info.bugstemplate;
    delete info.gittemplate;
    delete info.tarballtemplate;
    delete info.sshtemplate;
    delete info.sshurltemplate;
    delete info.browsetemplate;
    delete info.docstemplate;
    delete info.httpstemplate;
    delete info.shortcuttemplate;
    delete info.pathtemplate;
    delete info.pathmatch;
    delete info.protocols_re;
    delete info.committish;
    delete info.default;
    delete info.opts;
    delete info.browsefiletemplate;
    delete info.auth;
  }

  return info;
} 
//# sourceMappingURL=repositoryInfo.js.map