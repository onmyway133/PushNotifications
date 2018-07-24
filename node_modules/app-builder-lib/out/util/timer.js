"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.time = time;
exports.DevTimer = void 0;

function _builderUtil() {
  const data = require("builder-util");

  _builderUtil = function () {
    return data;
  };

  return data;
}

class DevTimer {
  constructor(label) {
    this.label = label;
    this.start = process.hrtime();
  }

  endAndGet() {
    const end = process.hrtime(this.start);
    return `${end[0]}s ${Math.round(end[1] / 1000000)}ms`;
  }

  end() {
    console.info(`${this.label}: ${this.endAndGet()}`);
  }

}

exports.DevTimer = DevTimer;

class ProductionTimer {
  end() {// ignore
  }

}

function time(label) {
  return _builderUtil().debug.enabled ? new DevTimer(label) : new ProductionTimer();
} 
//# sourceMappingURL=timer.js.map