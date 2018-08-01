"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getWindowsVm = exports.VmManager = void 0;

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

var path = _interopRequireWildcard(require("path"));

function _ParallelsVm() {
  const data = require("./ParallelsVm");

  _ParallelsVm = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

class VmManager {
  get pathSep() {
    return path.sep;
  }

  exec(file, args, options, isLogOutIfDebug = true) {
    return (0, _builderUtil().exec)(file, args, options, isLogOutIfDebug);
  }

  spawn(file, args, options, extraOptions) {
    return (0, _builderUtil().spawn)(file, args, options, extraOptions);
  }

  toVmFile(file) {
    return file;
  }

}

exports.VmManager = VmManager;

let getWindowsVm = (() => {
  var _ref = (0, _bluebirdLst().coroutine)(function* (debugLogger) {
    const vmList = (yield (0, _ParallelsVm().parseVmList)(debugLogger)).filter(it => it.os === "win-10");

    if (vmList.length === 0) {
      throw new (_builderUtil().InvalidConfigurationError)("Cannot find suitable Parallels Desktop virtual machine (Windows 10 is required)");
    } // prefer running or suspended vm


    return new (_ParallelsVm().ParallelsVmManager)(vmList.find(it => it.state === "running") || vmList.find(it => it.state === "suspended") || vmList[0]);
  });

  return function getWindowsVm(_x) {
    return _ref.apply(this, arguments);
  };
})(); exports.getWindowsVm = getWindowsVm;
//# sourceMappingURL=vm.js.map