"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isSignAllowed = isSignAllowed;
exports.sign = sign;
exports.findIdentity = findIdentity;
exports.findIdentityRawResult = exports.createKeychain = exports.downloadCertificate = exports.reportError = exports.appleCertificatePrefixes = void 0;

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

function _fs() {
  const data = require("builder-util/out/fs");

  _fs = function () {
    return data;
  };

  return data;
}

function _log() {
  const data = require("builder-util/out/log");

  _log = function () {
    return data;
  };

  return data;
}

function _crypto() {
  const data = require("crypto");

  _crypto = function () {
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

function _os() {
  const data = require("os");

  _os = function () {
    return data;
  };

  return data;
}

var path = _interopRequireWildcard(require("path"));

function _tempFile() {
  const data = require("temp-file");

  _tempFile = function () {
    return data;
  };

  return data;
}

function _binDownload() {
  const data = require("builder-util/out/binDownload");

  _binDownload = function () {
    return data;
  };

  return data;
}

function _flags() {
  const data = require("./util/flags");

  _flags = function () {
    return data;
  };

  return data;
}

let removeKeychain = (() => {
  var _ref4 = (0, _bluebirdLst().coroutine)(function* (keychainFile) {
    try {
      yield (0, _builderUtil().exec)("security", ["delete-keychain", keychainFile]);
    } catch (e) {
      console.warn(`Cannot delete keychain ${keychainFile}: ${e.stack || e}`);
      yield (0, _fs().unlinkIfExists)(keychainFile);
    }
  });

  return function removeKeychain(_x9) {
    return _ref4.apply(this, arguments);
  };
})();

let importCerts = (() => {
  var _ref6 = (0, _bluebirdLst().coroutine)(function* (keychainName, paths, keyPasswords) {
    for (let i = 0; i < paths.length; i++) {
      const password = keyPasswords[i];
      yield (0, _builderUtil().exec)("security", ["import", paths[i], "-k", keychainName, "-T", "/usr/bin/codesign", "-T", "/usr/bin/productbuild", "-P", password]); // https://stackoverflow.com/questions/39868578/security-codesign-in-sierra-keychain-ignores-access-control-settings-and-ui-p
      // https://github.com/electron-userland/electron-packager/issues/701#issuecomment-322315996

      if (yield (0, _builderUtil().isMacOsSierra)()) {
        yield (0, _builderUtil().exec)("security", ["set-key-partition-list", "-S", "apple-tool:,apple:", "-s", "-k", password, keychainName]);
      }
    }

    return {
      keychainName
    };
  });

  return function importCerts(_x11, _x12, _x13) {
    return _ref6.apply(this, arguments);
  };
})();
/** @private */


let getValidIdentities = (() => {
  var _ref7 = (0, _bluebirdLst().coroutine)(function* (keychain) {
    function addKeychain(args) {
      if (keychain != null) {
        args.push(keychain);
      }

      return args;
    }

    let result = findIdentityRawResult;

    if (result == null || keychain != null) {
      // https://github.com/electron-userland/electron-builder/issues/481
      // https://github.com/electron-userland/electron-builder/issues/535
      result = Promise.all([(0, _builderUtil().exec)("security", addKeychain(["find-identity", "-v"])).then(it => it.trim().split("\n").filter(it => {
        for (const prefix of appleCertificatePrefixes) {
          if (it.includes(prefix)) {
            return true;
          }
        }

        return false;
      })), (0, _builderUtil().exec)("security", addKeychain(["find-identity", "-v", "-p", "codesigning"])).then(it => it.trim().split("\n"))]).then(it => {
        const array = it[0].concat(it[1]).filter(it => !it.includes("(Missing required extension)") && !it.includes("valid identities found") && !it.includes("iPhone ") && !it.includes("com.apple.idms.appleid.prd.")) // remove 1)
        .map(it => it.substring(it.indexOf(")") + 1).trim());
        return Array.from(new Set(array));
      });

      if (keychain == null) {
        exports.findIdentityRawResult = findIdentityRawResult = result;
      }
    }

    return result;
  });

  return function getValidIdentities(_x14) {
    return _ref7.apply(this, arguments);
  };
})();

let _findIdentity = (() => {
  var _ref8 = (0, _bluebirdLst().coroutine)(function* (type, qualifier, keychain) {
    // https://github.com/electron-userland/electron-builder/issues/484
    //noinspection SpellCheckingInspection
    const lines = yield getValidIdentities(keychain);
    const namePrefix = `${type}:`;

    for (const line of lines) {
      if (qualifier != null && !line.includes(qualifier)) {
        continue;
      }

      if (line.includes(namePrefix)) {
        return parseIdentity(line);
      }
    }

    if (type === "Developer ID Application") {
      // find non-Apple certificate
      // https://github.com/electron-userland/electron-builder/issues/458
      l: for (const line of lines) {
        if (qualifier != null && !line.includes(qualifier)) {
          continue;
        }

        if (line.includes("Mac Developer:")) {
          continue;
        }

        for (const prefix of appleCertificatePrefixes) {
          if (line.includes(prefix)) {
            continue l;
          }
        }

        return parseIdentity(line);
      }
    }

    return null;
  });

  return function _findIdentity(_x15, _x16, _x17) {
    return _ref8.apply(this, arguments);
  };
})();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const appleCertificatePrefixes = ["Developer ID Application:", "Developer ID Installer:", "3rd Party Mac Developer Application:", "3rd Party Mac Developer Installer:"];
exports.appleCertificatePrefixes = appleCertificatePrefixes;

function isSignAllowed(isPrintWarn = true) {
  if (process.platform !== "darwin") {
    if (isPrintWarn) {
      _builderUtil().log.warn({
        reason: "supported only on macOS"
      }, "skipped macOS application code signing");
    }

    return false;
  }

  const buildForPrWarning = "There are serious security concerns with CSC_FOR_PULL_REQUEST=true (see the  CircleCI documentation (https://circleci.com/docs/1.0/fork-pr-builds/) for details)" + "\nIf you have SSH keys, sensitive env vars or AWS credentials stored in your project settings and untrusted forks can make pull requests against your repo, then this option isn't for you.";

  if ((0, _builderUtil().isPullRequest)()) {
    if ((0, _builderUtil().isEnvTrue)(process.env.CSC_FOR_PULL_REQUEST)) {
      if (isPrintWarn) {
        _builderUtil().log.warn(buildForPrWarning);
      }
    } else {
      if (isPrintWarn) {
        // https://github.com/electron-userland/electron-builder/issues/1524
        _builderUtil().log.warn("Current build is a part of pull request, code signing will be skipped." + "\nSet env CSC_FOR_PULL_REQUEST to true to force code signing." + `\n${buildForPrWarning}`);
      }

      return false;
    }
  }

  return true;
}

let reportError = (() => {
  var _ref = (0, _bluebirdLst().coroutine)(function* (isMas, certificateType, qualifier, keychainName, isForceCodeSigning) {
    const logFields = {};

    if (qualifier == null) {
      logFields.reason = "";

      if ((0, _flags().isAutoDiscoveryCodeSignIdentity)()) {
        logFields.reason += `cannot find valid "${certificateType}" identity${isMas ? "" : ` or custom non-Apple code signing certificate`}`;
      }

      logFields.reason += ", see https://electron.build/code-signing";

      if (!(0, _flags().isAutoDiscoveryCodeSignIdentity)()) {
        logFields.CSC_IDENTITY_AUTO_DISCOVERY = false;
      }
    } else {
      logFields.reason = "Identity name is specified, but no valid identity with this name in the keychain";
      logFields.identity = qualifier;
    }

    const args = ["find-identity"];

    if (keychainName != null) {
      args.push(keychainName);
    }

    if (qualifier != null || (0, _flags().isAutoDiscoveryCodeSignIdentity)()) {
      logFields.allIdentities = (yield (0, _builderUtil().exec)("security", args)).trim().split("\n").filter(it => !(it.includes("Policy: X.509 Basic") || it.includes("Matching identities"))).join("\n");
    }

    if (isMas || isForceCodeSigning) {
      throw new Error(_log().Logger.createMessage("skipped macOS application code signing", logFields, "error", it => it));
    } else {
      _builderUtil().log.warn(logFields, "skipped macOS application code signing");
    }
  });

  return function reportError(_x, _x2, _x3, _x4, _x5) {
    return _ref.apply(this, arguments);
  };
})();
/** @private */


exports.reportError = reportError;

let downloadCertificate = (() => {
  var _ref2 = (0, _bluebirdLst().coroutine)(function* (urlOrBase64, tmpDir, currentDir) {
    urlOrBase64 = urlOrBase64.trim();
    let file = null;

    if (urlOrBase64.length > 3 && urlOrBase64[1] === ":" || urlOrBase64.startsWith("/") || urlOrBase64.startsWith(".")) {
      file = urlOrBase64;
    } else if (urlOrBase64.startsWith("file://")) {
      file = urlOrBase64.substring("file://".length);
    } else if (urlOrBase64.startsWith("~/")) {
      file = path.join((0, _os().homedir)(), urlOrBase64.substring("~/".length));
    } else {
      const isUrl = urlOrBase64.startsWith("https://");

      if (isUrl || urlOrBase64.length > 2048 || urlOrBase64.endsWith("=")) {
        const tempFile = yield tmpDir.getTempFile({
          suffix: ".p12"
        });

        if (isUrl) {
          yield (0, _binDownload().download)(urlOrBase64, tempFile);
        } else {
          yield (0, _fsExtraP().outputFile)(tempFile, Buffer.from(urlOrBase64, "base64"));
        }

        return tempFile;
      } else {
        file = urlOrBase64;
      }
    }

    file = path.resolve(currentDir, file);
    const stat = yield (0, _fs().statOrNull)(file);

    if (stat == null) {
      throw new Error(`${file} doesn't exist`);
    } else if (!stat.isFile()) {
      throw new Error(`${file} not a file`);
    } else {
      return file;
    }
  });

  return function downloadCertificate(_x6, _x7, _x8) {
    return _ref2.apply(this, arguments);
  };
})(); // "Note that filename will not be searched to resolve the signing identity's certificate chain unless it is also on the user's keychain search list."
// but "security list-keychains" doesn't support add - we should 1) get current list 2) set new list - it is very bad http://stackoverflow.com/questions/10538942/add-a-keychain-to-search-list
// "overly complicated and introduces a race condition."
// https://github.com/electron-userland/electron-builder/issues/398


exports.downloadCertificate = downloadCertificate;
const bundledCertKeychainAdded = new (_lazyVal().Lazy)((0, _bluebirdLst().coroutine)(function* () {
  // copy to temp and then atomic rename to final path
  const cacheDir = getCacheDirectory();
  const tmpKeychainPath = path.join(cacheDir, (0, _tempFile().getTempName)("electron-builder-root-certs"));
  const keychainPath = path.join(cacheDir, "electron-builder-root-certs.keychain");
  const results = yield Promise.all([listUserKeychains(), (0, _fs().copyFile)(path.join(__dirname, "..", "certs", "root_certs.keychain"), tmpKeychainPath).then(() => (0, _fsExtraP().rename)(tmpKeychainPath, keychainPath))]);
  const list = results[0];

  if (!list.includes(keychainPath)) {
    yield (0, _builderUtil().exec)("security", ["list-keychains", "-d", "user", "-s", keychainPath].concat(list));
  }
}));

function getCacheDirectory() {
  const env = process.env.ELECTRON_BUILDER_CACHE;
  return (0, _builderUtil().isEmptyOrSpaces)(env) ? path.join((0, _os().homedir)(), "Library", "Caches", "electron-builder") : path.resolve(env);
}

function listUserKeychains() {
  return (0, _builderUtil().exec)("security", ["list-keychains", "-d", "user"]).then(it => it.split("\n").map(it => {
    const r = it.trim();
    return r.substring(1, r.length - 1);
  }).filter(it => it.length > 0));
}

let createKeychain = (() => {
  var _ref5 = (0, _bluebirdLst().coroutine)(function* ({
    tmpDir,
    cscLink,
    cscKeyPassword,
    cscILink,
    cscIKeyPassword,
    currentDir
  }) {
    // travis has correct AppleWWDRCA cert
    if (process.env.TRAVIS !== "true") {
      yield bundledCertKeychainAdded.value;
    }

    const keychainFile = yield tmpDir.getTempFile({
      suffix: ".keychain",
      disposer: removeKeychain
    });
    const certLinks = [cscLink];

    if (cscILink != null) {
      certLinks.push(cscILink);
    }

    const certPaths = new Array(certLinks.length);
    const keychainPassword = (0, _crypto().randomBytes)(8).toString("base64");
    const securityCommands = [["create-keychain", "-p", keychainPassword, keychainFile], ["unlock-keychain", "-p", keychainPassword, keychainFile], ["set-keychain-settings", keychainFile]]; // https://stackoverflow.com/questions/42484678/codesign-keychain-gets-ignored
    // https://github.com/electron-userland/electron-builder/issues/1457

    const list = yield listUserKeychains();

    if (!list.includes(keychainFile)) {
      securityCommands.push(["list-keychains", "-d", "user", "-s", keychainFile].concat(list));
    }

    yield Promise.all([// we do not clear downloaded files - will be removed on tmpDir cleanup automatically. not a security issue since in any case data is available as env variables and protected by password.
    _bluebirdLst().default.map(certLinks, (link, i) => downloadCertificate(link, tmpDir, currentDir).then(it => certPaths[i] = it)), _bluebirdLst().default.mapSeries(securityCommands, it => (0, _builderUtil().exec)("security", it))]);
    return yield importCerts(keychainFile, certPaths, [cscKeyPassword, cscIKeyPassword].filter(it => it != null));
  });

  return function createKeychain(_x10) {
    return _ref5.apply(this, arguments);
  };
})();

exports.createKeychain = createKeychain;

function sign(path, name, keychain) {
  const args = ["--deep", "--force", "--sign", name, path];

  if (keychain != null) {
    args.push("--keychain", keychain);
  }

  return (0, _builderUtil().exec)("codesign", args);
}

let findIdentityRawResult = null;
exports.findIdentityRawResult = findIdentityRawResult;

const _Identity = require("electron-osx-sign/util-identities").Identity;

function parseIdentity(line) {
  const firstQuoteIndex = line.indexOf('"');
  const name = line.substring(firstQuoteIndex + 1, line.lastIndexOf('"'));
  const hash = line.substring(0, firstQuoteIndex - 1);
  return new _Identity(name, hash);
}

function findIdentity(certType, qualifier, keychain) {
  let identity = qualifier || process.env.CSC_NAME;

  if ((0, _builderUtil().isEmptyOrSpaces)(identity)) {
    if ((0, _flags().isAutoDiscoveryCodeSignIdentity)()) {
      return _findIdentity(certType, null, keychain);
    } else {
      return Promise.resolve(null);
    }
  } else {
    identity = identity.trim();

    for (const prefix of appleCertificatePrefixes) {
      checkPrefix(identity, prefix);
    }

    return _findIdentity(certType, identity, keychain);
  }
}

function checkPrefix(name, prefix) {
  if (name.startsWith(prefix)) {
    throw new (_builderUtil().InvalidConfigurationError)(`Please remove prefix "${prefix}" from the specified name — appropriate certificate will be chosen automatically`);
  }
} 
//# sourceMappingURL=codeSign.js.map