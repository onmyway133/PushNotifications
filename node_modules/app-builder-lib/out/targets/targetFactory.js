"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.computeArchToTargetNamesMap = computeArchToTargetNamesMap;
exports.createTargets = createTargets;
exports.createCommonTarget = createCommonTarget;
exports.NoOpTarget = void 0;

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

function _index() {
  const data = require("../index");

  _index = function () {
    return data;
  };

  return data;
}

function _ArchiveTarget() {
  const data = require("./ArchiveTarget");

  _ArchiveTarget = function () {
    return data;
  };

  return data;
}

const archiveTargets = new Set(["zip", "7z", "tar.xz", "tar.lz", "tar.gz", "tar.bz2"]);

function computeArchToTargetNamesMap(raw, options, platform) {
  for (const targetNames of raw.values()) {
    if (targetNames.length > 0) {
      // https://github.com/electron-userland/electron-builder/issues/1355
      return raw;
    }
  }

  const defaultArchs = raw.size === 0 ? [platform === _index().Platform.MAC ? "x64" : process.arch] : Array.from(raw.keys()).map(it => _builderUtil().Arch[it]);
  const result = new Map(raw);

  for (const target of (0, _builderUtil().asArray)(options.target).map(it => typeof it === "string" ? {
    target: it
  } : it)) {
    let name = target.target;
    let archs = target.arch;
    const suffixPos = name.lastIndexOf(":");

    if (suffixPos > 0) {
      name = target.target.substring(0, suffixPos);

      if (archs == null) {
        archs = target.target.substring(suffixPos + 1);
      }
    }

    for (const arch of archs == null ? defaultArchs : (0, _builderUtil().asArray)(archs)) {
      (0, _builderUtil().addValue)(result, (0, _builderUtil().archFromString)(arch), name);
    }
  }

  if (result.size === 0) {
    for (const arch of defaultArchs) {
      result.set((0, _builderUtil().archFromString)(arch), []);
    }
  }

  return result;
}

function createTargets(nameToTarget, rawList, outDir, packager) {
  const result = [];

  const mapper = (name, factory) => {
    let target = nameToTarget.get(name);

    if (target == null) {
      target = factory(outDir);
      nameToTarget.set(name, target);
    }

    result.push(target);
  };

  const targets = normalizeTargets(rawList, packager.defaultTarget);
  packager.createTargets(targets, mapper);
  return result;
}

function normalizeTargets(targets, defaultTarget) {
  const list = [];

  for (const t of targets) {
    const name = t.toLowerCase().trim();

    if (name === _index().DEFAULT_TARGET) {
      list.push(...defaultTarget);
    } else {
      list.push(name);
    }
  }

  return list;
}

function createCommonTarget(target, outDir, packager) {
  if (archiveTargets.has(target)) {
    return new (_ArchiveTarget().ArchiveTarget)(target, outDir, packager);
  } else if (target === _index().DIR_TARGET) {
    return new NoOpTarget(_index().DIR_TARGET);
  } else {
    throw new Error(`Unknown target: ${target}`);
  }
}

class NoOpTarget extends _index().Target {
  constructor(name) {
    super(name);
    this.options = null;
  }

  get outDir() {
    throw new Error("NoOpTarget");
  }

  build(appOutDir, arch) {// no build

    return (0, _bluebirdLst().coroutine)(function* () {})();
  }

} exports.NoOpTarget = NoOpTarget;
//# sourceMappingURL=targetFactory.js.map