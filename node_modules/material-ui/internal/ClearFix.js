'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _BeforeAfterWrapper = require('./BeforeAfterWrapper');

var _BeforeAfterWrapper2 = _interopRequireDefault(_BeforeAfterWrapper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = {
  before: {
    content: "' '",
    display: 'table'
  },
  after: {
    content: "' '",
    clear: 'both',
    display: 'table'
  }
};

var ClearFix = function ClearFix(_ref) {
  var style = _ref.style,
      children = _ref.children,
      other = (0, _objectWithoutProperties3.default)(_ref, ['style', 'children']);
  return _react2.default.createElement(
    _BeforeAfterWrapper2.default,
    (0, _extends3.default)({}, other, {
      beforeStyle: styles.before,
      afterStyle: styles.after,
      style: style
    }),
    children
  );
};

ClearFix.muiName = 'ClearFix';

ClearFix.propTypes = process.env.NODE_ENV !== "production" ? {
  children: _propTypes2.default.node,
  /**
   * Override the inline-styles of the root element.
   */
  style: _propTypes2.default.object
} : {};

exports.default = ClearFix;