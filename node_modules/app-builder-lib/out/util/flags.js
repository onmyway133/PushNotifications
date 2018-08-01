"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isUseSystemSigncode = isUseSystemSigncode;
exports.isBuildCacheEnabled = isBuildCacheEnabled;
exports.isAutoDiscoveryCodeSignIdentity = isAutoDiscoveryCodeSignIdentity;

function _builderUtil() {
  const data = require("builder-util");

  _builderUtil = function () {
    return data;
  };

  return data;
}

function isUseSystemSigncode() {
  return (0, _builderUtil().isEnvTrue)(process.env.USE_SYSTEM_SIGNCODE);
}

function isBuildCacheEnabled() {
  return !(0, _builderUtil().isEnvTrue)(process.env.ELECTRON_BUILDER_DISABLE_BUILD_CACHE);
}

function isAutoDiscoveryCodeSignIdentity() {
  return process.env.CSC_IDENTITY_AUTO_DISCOVERY !== "false";
} 
//# sourceMappingURL=flags.js.map