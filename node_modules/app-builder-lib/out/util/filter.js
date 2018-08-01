"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasMagic = hasMagic;
exports.createFilter = createFilter;

var path = _interopRequireWildcard(require("path"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/** @internal */
function hasMagic(pattern) {
  const set = pattern.set;

  if (set.length > 1) {
    return true;
  }

  for (const i of set[0]) {
    if (typeof i !== "string") {
      return true;
    }
  }

  return false;
} // sometimes, destination may not contain path separator in the end (path to folder), but the src does. So let's ensure paths have path separators in the end


function ensureEndSlash(s) {
  return s.length === 0 || s.endsWith(path.sep) ? s : s + path.sep;
}
/** @internal */


function createFilter(src, patterns, excludePatterns) {
  const pathSeparator = path.sep;
  const srcWithEndSlash = ensureEndSlash(src);
  return (it, stat) => {
    if (src === it) {
      return true;
    }

    if (!it.startsWith(srcWithEndSlash)) {
      throw new Error(`${it} must be under ${srcWithEndSlash}`);
    }

    let relative = it.substring(srcWithEndSlash.length);

    if (pathSeparator === "\\") {
      if (relative.startsWith("\\")) {
        // windows problem: double backslash, the above substring call removes root path with a single slash, so here can me some leftovers
        relative = relative.substring(1);
      }

      relative = relative.replace(/\\/g, "/");
    } // https://github.com/electron-userland/electron-builder/issues/867


    return minimatchAll(relative, patterns, stat) && (excludePatterns == null || stat.isDirectory() || !minimatchAll(relative, excludePatterns, stat));
  };
} // https://github.com/joshwnj/minimatch-all/blob/master/index.js


function minimatchAll(path, patterns, stat) {
  let match = false;

  for (const pattern of patterns) {
    // If we've got a match, only re-test for exclusions.
    // if we don't have a match, only re-test for inclusions.
    if (match !== pattern.negate) {
      continue;
    } // partial match — pattern: foo/bar.txt path: foo — we must allow foo
    // use it only for non-negate patterns: const m = new Minimatch("!node_modules/@(electron-download|electron)/**/*", {dot: true }); m.match("node_modules", true) will return false, but must be true


    match = pattern.match(path, stat.isDirectory() && !pattern.negate);
  }

  return match;
} 
//# sourceMappingURL=filter.js.map