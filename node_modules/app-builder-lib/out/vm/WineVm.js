"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WineVmManager = void 0;

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

var path = _interopRequireWildcard(require("path"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

class WineVmManager extends _vm().VmManager {
  constructor() {
    super();
  }

  exec(file, args, options, isLogOutIfDebug = true) {
    return (0, _builderUtil().execWine)(file, args, options);
  }

  spawn(file, args, options, extraOptions) {
    throw new Error("Unsupported");
  }

  toVmFile(file) {
    return path.win32.join("Z:", file);
  }

} exports.WineVmManager = WineVmManager;
//# sourceMappingURL=WineVm.js.map