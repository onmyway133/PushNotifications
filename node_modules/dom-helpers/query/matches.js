'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = matches;

var _inDOM = require('../util/inDOM');

var _inDOM2 = _interopRequireDefault(_inDOM);

var _querySelectorAll = require('./querySelectorAll');

var _querySelectorAll2 = _interopRequireDefault(_querySelectorAll);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var matchesCache = void 0;

function matches(node, selector) {
  if (!matchesCache && _inDOM2.default) {
    (function () {
      var body = document.body;
      var nativeMatch = body.matches || body.matchesSelector || body.webkitMatchesSelector || body.mozMatchesSelector || body.msMatchesSelector;

      matchesCache = nativeMatch ? function (node, selector) {
        return nativeMatch.call(node, selector);
      } : ie8MatchesSelector;
    })();
  }

  return matchesCache ? matchesCache(node, selector) : null;
}

function ie8MatchesSelector(node, selector) {
  var matches = (0, _querySelectorAll2.default)(node.document || node.ownerDocument, selector),
      i = 0;

  while (matches[i] && matches[i] !== node) {
    i++;
  }return !!matches[i];
}
module.exports = exports['default'];