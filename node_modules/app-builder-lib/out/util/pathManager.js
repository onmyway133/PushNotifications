"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTemplatePath = getTemplatePath;
exports.getVendorPath = getVendorPath;

var path = _interopRequireWildcard(require("path"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const root = path.join(__dirname, "..", "..");

function getTemplatePath(file) {
  return path.join(root, "templates", file);
}

function getVendorPath(file) {
  return file == null ? path.join(root, "vendor") : path.join(root, "vendor", file);
} 
//# sourceMappingURL=pathManager.js.map