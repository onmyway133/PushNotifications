"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.macPathToParallelsWindows = macPathToParallelsWindows;
exports.ParallelsVmManager = exports.parseVmList = void 0;

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

function _child_process() {
  const data = require("child_process");

  _child_process = function () {
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

/** @internal */
let parseVmList = (() => {
  var _ref = (0, _bluebirdLst().coroutine)(function* (debugLogger) {
    // do not log output if debug - it is huge, logged using debugLogger
    let rawList = yield (0, _builderUtil().exec)("prlctl", ["list", "-i", "-s", "name"], undefined, false);
    debugLogger.add("parallels.list", rawList);
    rawList = rawList.substring(rawList.indexOf("ID:")); // let match: Array<string> | null

    const result = [];

    for (const info of rawList.split("\n\n").map(it => it.trim()).filter(it => it.length > 0)) {
      const vm = {};

      for (const line of info.split("\n")) {
        const meta = /^([^:("]+): (.*)$/.exec(line);

        if (meta == null) {
          continue;
        }

        const key = meta[1].toLowerCase();

        if (key === "id" || key === "os" || key === "name" || key === "state" || key === "name") {
          vm[key] = meta[2].trim();
        }
      }

      result.push(vm);
    }

    return result;
  });

  return function parseVmList(_x) {
    return _ref.apply(this, arguments);
  };
})();
/** @internal */


exports.parseVmList = parseVmList;

class ParallelsVmManager extends _vm().VmManager {
  constructor(vm) {
    super();
    this.vm = vm;
    this.isExitHookAdded = false;
    this.startPromise = this.doStartVm();
  }

  get pathSep() {
    return "/";
  }

  handleExecuteError(error) {
    if (error.message.includes("Unable to open new session in this virtual machine")) {
      throw new Error(`Please ensure that your are logged in "${this.vm.name}" parallels virtual machine. In the future please do not stop VM, but suspend.\n\n${error.message}`);
    }

    _builderUtil().log.warn("ensure that 'Share folders' is set to 'All Disks', see https://goo.gl/E6XphP");

    throw error;
  }

  exec(file, args, options) {
    var _this = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      yield _this.ensureThatVmStarted(); // it is important to use "--current-user" to execute command under logged in user - to access certs.

      return yield (0, _builderUtil().exec)("prlctl", ["exec", _this.vm.id, "--current-user", file.startsWith("/") ? macPathToParallelsWindows(file) : file].concat(args), options).catch(error => _this.handleExecuteError(error));
    })();
  }

  spawn(file, args, options, extraOptions) {
    var _this2 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      yield _this2.ensureThatVmStarted();
      return yield (0, _builderUtil().spawn)("prlctl", ["exec", _this2.vm.id, file].concat(args), options, extraOptions).catch(error => _this2.handleExecuteError(error));
    })();
  }

  doStartVm() {
    var _this3 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      const vmId = _this3.vm.id;
      const state = _this3.vm.state;

      if (state === "running") {
        return;
      }

      if (!_this3.isExitHookAdded) {
        _this3.isExitHookAdded = true;

        require("async-exit-hook")(callback => {
          const stopArgs = ["suspend", vmId];

          if (callback == null) {
            (0, _child_process().execFileSync)("prlctl", stopArgs);
          } else {
            (0, _builderUtil().exec)("prlctl", stopArgs).then(callback).catch(callback);
          }
        });
      }

      yield (0, _builderUtil().exec)("prlctl", ["start", vmId]);
    })();
  }

  ensureThatVmStarted() {
    let startPromise = this.startPromise;

    if (startPromise == null) {
      startPromise = this.doStartVm();
      this.startPromise = startPromise;
    }

    return startPromise;
  }

  toVmFile(file) {
    // https://stackoverflow.com/questions/4742992/cannot-access-network-drive-in-powershell-running-as-administrator
    return macPathToParallelsWindows(file);
  }

}

exports.ParallelsVmManager = ParallelsVmManager;

function macPathToParallelsWindows(file) {
  if (file.startsWith("C:\\")) {
    return file;
  }

  return "\\\\Mac\\Host\\" + file.replace(/\//g, "\\");
} 
//# sourceMappingURL=ParallelsVm.js.map