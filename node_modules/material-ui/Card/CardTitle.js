'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getStyles(props, context) {
  var card = context.muiTheme.card;


  return {
    root: {
      padding: 16,
      position: 'relative'
    },
    title: {
      fontSize: 24,
      color: props.titleColor || card.titleColor,
      display: 'block',
      lineHeight: '36px'
    },
    subtitle: {
      fontSize: 14,
      color: props.subtitleColor || card.subtitleColor,
      display: 'block'
    }
  };
}

var CardTitle = function (_Component) {
  (0, _inherits3.default)(CardTitle, _Component);

  function CardTitle() {
    (0, _classCallCheck3.default)(this, CardTitle);
    return (0, _possibleConstructorReturn3.default)(this, (CardTitle.__proto__ || (0, _getPrototypeOf2.default)(CardTitle)).apply(this, arguments));
  }

  (0, _createClass3.default)(CardTitle, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          actAsExpander = _props.actAsExpander,
          children = _props.children,
          closeIcon = _props.closeIcon,
          expandable = _props.expandable,
          showExpandableButton = _props.showExpandableButton,
          style = _props.style,
          subtitle = _props.subtitle,
          subtitleColor = _props.subtitleColor,
          subtitleStyle = _props.subtitleStyle,
          title = _props.title,
          titleColor = _props.titleColor,
          titleStyle = _props.titleStyle,
          other = (0, _objectWithoutProperties3.default)(_props, ['actAsExpander', 'children', 'closeIcon', 'expandable', 'showExpandableButton', 'style', 'subtitle', 'subtitleColor', 'subtitleStyle', 'title', 'titleColor', 'titleStyle']);
      var prepareStyles = this.context.muiTheme.prepareStyles;

      var styles = getStyles(this.props, this.context);
      var rootStyle = (0, _simpleAssign2.default)({}, styles.root, style);
      var extendedTitleStyle = (0, _simpleAssign2.default)({}, styles.title, titleStyle);
      var extendedSubtitleStyle = (0, _simpleAssign2.default)({}, styles.subtitle, subtitleStyle);

      return _react2.default.createElement(
        'div',
        (0, _extends3.default)({}, other, { style: prepareStyles(rootStyle) }),
        _react2.default.createElement(
          'span',
          { style: prepareStyles(extendedTitleStyle) },
          title
        ),
        _react2.default.createElement(
          'span',
          { style: prepareStyles(extendedSubtitleStyle) },
          subtitle
        ),
        children
      );
    }
  }]);
  return CardTitle;
}(_react.Component);

CardTitle.muiName = 'CardTitle';
CardTitle.contextTypes = {
  muiTheme: _propTypes2.default.object.isRequired
};
CardTitle.propTypes = process.env.NODE_ENV !== "production" ? {
  /**
   * If true, a click on this card component expands the card.
   */
  actAsExpander: _propTypes2.default.bool,
  /**
   * Can be used to render elements inside the Card Title.
   */
  children: _propTypes2.default.node,
  /**
   * Can be used to pass a closeIcon if you don't like the default expandable close Icon.
   */
  closeIcon: _propTypes2.default.node,
  /**
   * If true, this card component is expandable.
   */
  expandable: _propTypes2.default.bool,
  /**
   * If true, this card component will include a button to expand the card.
   */
  showExpandableButton: _propTypes2.default.bool,
  /**
   * Override the inline-styles of the root element.
   */
  style: _propTypes2.default.object,
  /**
   * Can be used to render a subtitle in the Card Title.
   */
  subtitle: _propTypes2.default.node,
  /**
   * Override the subtitle color.
   */
  subtitleColor: _propTypes2.default.string,
  /**
   * Override the inline-styles of the subtitle.
   */
  subtitleStyle: _propTypes2.default.object,
  /**
   * Can be used to render a title in the Card Title.
   */
  title: _propTypes2.default.node,
  /**
   * Override the title color.
   */
  titleColor: _propTypes2.default.string,
  /**
   * Override the inline-styles of the title.
   */
  titleStyle: _propTypes2.default.object
} : {};
exports.default = CardTitle;