import React from 'react';
import PropTypes from 'prop-types';
import shallowEqual from 'fbjs/lib/shallowEqual';
import warning from 'warning';
import { passiveOption } from './supports';

const defaultEventOptions = {
  capture: false,
  passive: false,
};

function mergeDefaultEventOptions(options) {
  return Object.assign({}, defaultEventOptions, options);
}

function getEventListenerArgs(eventName, callback, options) {
  const args = [eventName, callback];
  args.push(passiveOption ? options : options.capture);
  return args;
}

function on(target, eventName, callback, options) {
  // eslint-disable-next-line prefer-spread
  target.addEventListener.apply(target, getEventListenerArgs(eventName, callback, options));
}

function off(target, eventName, callback, options) {
  // eslint-disable-next-line prefer-spread
  target.removeEventListener.apply(target, getEventListenerArgs(eventName, callback, options));
}

function forEachListener(props, iteratee) {
  const {
    children, // eslint-disable-line no-unused-vars
    target, // eslint-disable-line no-unused-vars
    ...eventProps
  } = props;

  Object.keys(eventProps).forEach(name => {
    if (name.substring(0, 2) !== 'on') {
      return;
    }

    const prop = eventProps[name];
    const type = typeof prop;
    const isObject = type === 'object';
    const isFunction = type === 'function';

    if (!isObject && !isFunction) {
      return;
    }

    const capture = name.substr(-7).toLowerCase() === 'capture';
    let eventName = name.substring(2).toLowerCase();
    eventName = capture ? eventName.substring(0, eventName.length - 7) : eventName;

    if (isObject) {
      iteratee(eventName, prop.handler, prop.options);
    } else {
      iteratee(eventName, prop, mergeDefaultEventOptions({ capture }));
    }
  });
}

export function withOptions(handler, options) {
  warning(options, 'react-event-listener: should be specified options in withOptions.');

  return {
    handler,
    options: mergeDefaultEventOptions(options),
  };
}

class EventListener extends React.Component {
  componentDidMount() {
    this.addListeners();
  }

  shouldComponentUpdate(nextProps) {
    return !shallowEqual(this.props, nextProps);
  }

  componentWillUpdate() {
    this.removeListeners();
  }

  componentDidUpdate() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  addListeners() {
    this.applyListeners(on);
  }

  removeListeners() {
    this.applyListeners(off);
  }

  applyListeners(onOrOff) {
    const { target } = this.props;

    if (target) {
      let element = target;

      if (typeof target === 'string') {
        element = window[target];
      }

      forEachListener(this.props, onOrOff.bind(null, element));
    }
  }

  render() {
    return this.props.children || null;
  }
}

EventListener.propTypes = {
  /**
   * You can provide a single child too.
   */
  children: PropTypes.node,
  /**
   * The DOM target to listen to.
   */
  target: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
};

export default EventListener;
