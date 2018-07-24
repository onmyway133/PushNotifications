"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MonoVmManager = void 0;

function _builderUtil() {
  const data = require("builder-util");

  _builderUtil = function () {
    return data;
  };

  return data;
}

function _vm() {
  const data = require("./vm");

  _vm = function () {
    return data;
  };

  return data;
}

class MonoVmManager extends _vm().VmManager {
  constructor() {
    super();
  }

  exec(file, args, options, isLogOutIfDebug = true) {
    return (0, _builderUtil().exec)("mono", [file].concat(args), Object.assign({}, options), isLogOutIfDebug);
  }

  spawn(file, args, options, extraOptions) {
    return (0, _builderUtil().spawn)("mono", [file].concat(args), options, extraOptions);
  }

} exports.MonoVmManager = MonoVmManager;
//# sourceMappingURL=MonoVm.js.map