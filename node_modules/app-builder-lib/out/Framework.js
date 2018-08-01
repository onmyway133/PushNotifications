"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isElectronBased = isElectronBased;

function isElectronBased(framework) {
  return framework.name === "electron" || framework.name === "muon";
} 
//# sourceMappingURL=Framework.js.map