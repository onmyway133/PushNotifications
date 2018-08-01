"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.readAsarJson = exports.readAsar = exports.AsarFilesystem = exports.Node = void 0;

function _bluebirdLst() {
  const data = require("bluebird-lst");

  _bluebirdLst = function () {
    return data;
  };

  return data;
}

function _chromiumPickleJs() {
  const data = require("chromium-pickle-js");

  _chromiumPickleJs = function () {
    return data;
  };

  return data;
}

function _fsExtraP() {
  const data = require("fs-extra-p");

  _fsExtraP = function () {
    return data;
  };

  return data;
}

var path = _interopRequireWildcard(require("path"));

let readFileFromAsar = (() => {
  var _ref3 = (0, _bluebirdLst().coroutine)(function* (filesystem, filename, info) {
    const size = info.size;
    const buffer = Buffer.allocUnsafe(size);

    if (size <= 0) {
      return buffer;
    }

    if (info.unpacked) {
      return yield (0, _fsExtraP().readFile)(path.join(`${filesystem.src}.unpacked`, filename));
    }

    const fd = yield (0, _fsExtraP().open)(filesystem.src, "r");

    try {
      const offset = 8 + filesystem.headerSize + parseInt(info.offset, 10);
      yield (0, _fsExtraP().read)(fd, buffer, 0, size, offset);
    } finally {
      yield (0, _fsExtraP().close)(fd);
    }

    return buffer;
  });

  return function readFileFromAsar(_x4, _x5, _x6) {
    return _ref3.apply(this, arguments);
  };
})(); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/** @internal */
class Node {}
/** @internal */


exports.Node = Node;

class AsarFilesystem {
  constructor(src, header = new Node(), headerSize = -1) {
    this.src = src;
    this.header = header;
    this.headerSize = headerSize;
    this.offset = 0;

    if (this.header.files == null) {
      this.header.files = {};
    }
  }

  searchNodeFromDirectory(p, isCreate) {
    let node = this.header;

    for (const dir of p.split(path.sep)) {
      if (dir !== ".") {
        let child = node.files[dir];

        if (child == null) {
          if (!isCreate) {
            return null;
          }

          child = new Node();
          child.files = {};
          node.files[dir] = child;
        }

        node = child;
      }
    }

    return node;
  }

  getOrCreateNode(p) {
    if (p == null || p.length === 0) {
      return this.header;
    }

    const name = path.basename(p);
    const dirNode = this.searchNodeFromDirectory(path.dirname(p), true);

    if (dirNode.files == null) {
      dirNode.files = {};
    }

    let result = dirNode.files[name];

    if (result == null) {
      result = new Node();
      dirNode.files[name] = result;
    }

    return result;
  }

  addFileNode(file, dirNode, size, unpacked, stat) {
    if (size > 4294967295) {
      throw new Error(`${file}: file size cannot be larger than 4.2GB`);
    }

    const node = new Node();
    node.size = size;

    if (unpacked) {
      node.unpacked = true;
    } else {
      // electron expects string
      node.offset = this.offset.toString();

      if (process.platform !== "win32" && stat.mode & 0o100) {
        node.executable = true;
      }

      this.offset += node.size;
    }

    let children = dirNode.files;

    if (children == null) {
      children = {};
      dirNode.files = children;
    }

    children[path.basename(file)] = node;
    return node;
  }

  getNode(p) {
    const node = this.searchNodeFromDirectory(path.dirname(p), false);
    return node.files[path.basename(p)];
  }

  getFile(p, followLinks = true) {
    const info = this.getNode(p); // if followLinks is false we don't resolve symlinks

    return followLinks && info.link != null ? this.getFile(info.link) : info;
  }

  readJson(file) {
    var _this = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      return JSON.parse((yield _this.readFile(file)).toString());
    })();
  }

  readFile(file) {
    var _this2 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      return yield readFileFromAsar(_this2, file, _this2.getFile(file));
    })();
  }

}

exports.AsarFilesystem = AsarFilesystem;

let readAsar = (() => {
  var _ref = (0, _bluebirdLst().coroutine)(function* (archive) {
    const fd = yield (0, _fsExtraP().open)(archive, "r");
    let size;
    let headerBuf;

    try {
      const sizeBuf = Buffer.allocUnsafe(8);

      if ((yield (0, _fsExtraP().read)(fd, sizeBuf, 0, 8, null)) !== 8) {
        throw new Error("Unable to read header size");
      }

      const sizePickle = (0, _chromiumPickleJs().createFromBuffer)(sizeBuf);
      size = sizePickle.createIterator().readUInt32();
      headerBuf = Buffer.allocUnsafe(size);

      if ((yield (0, _fsExtraP().read)(fd, headerBuf, 0, size, null)) !== size) {
        throw new Error("Unable to read header");
      }
    } finally {
      yield (0, _fsExtraP().close)(fd);
    }

    const headerPickle = (0, _chromiumPickleJs().createFromBuffer)(headerBuf);
    const header = headerPickle.createIterator().readString();
    return new AsarFilesystem(archive, JSON.parse(header), size);
  });

  return function readAsar(_x) {
    return _ref.apply(this, arguments);
  };
})();

exports.readAsar = readAsar;

let readAsarJson = (() => {
  var _ref2 = (0, _bluebirdLst().coroutine)(function* (archive, file) {
    const fs = yield readAsar(archive);
    return yield fs.readJson(file);
  });

  return function readAsarJson(_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
})();

exports.readAsarJson = readAsarJson;
//# sourceMappingURL=asar.js.map