# Introduction
You've probably heard of [iOS's dreaded 300ms tap delay](http://updates.html5rocks.com/2013/12/300ms-tap-delay-gone-away).  React's `onClick` attribute falls prey to it.  ~~Facebook's working on a solution in the form of `TapEventPlugin`, but it [won't be made available](https://github.com/facebook/react/issues/436) [until 1.0](https://github.com/facebook/react/pull/1170).~~

~~If you're reading this, you're probably working on a project that can't wait until they figure out how they want to publish it.  This repo is for you.~~

~~When Facebook solves [#436](https://github.com/facebook/react/issues/436) and [#1170](https://github.com/facebook/react/pull/1170), this repo will disappear.~~

Facebook is not planning on supporting tap events ([#436](https://github.com/facebook/react/issues/436#issuecomment-207624448)) because browsers are fixing/removing the click delay. Unfortunately it will take a lot of time before all mobile browsers (including iOS' UIWebView) will and can be updated. 

Verify if you need this plugin for the browsers you need to support.

## Installation

Latest:
```sh
$ npm i --save react-tap-event-plugin
```

Compatible with React >= 15.4 && < 16.0:
```sh
$ npm i --save react-tap-event-plugin@2.0.1
```

Compatible with React > 0.14 && < 15.4:
```sh
$ npm i --save react-tap-event-plugin@1.0.0
```

Compatible with React <= 0.14:
```sh
$ npm i --save react-tap-event-plugin@0.2.2
```

## Usage

```js
var injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin();
```

## Example

See demo project for a complete working example.

```js
var React = require("react");
var ReactDOM = require("react-dom");
injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin();

var Main = React.createClass({
  render: function() {
    return (
      <a
        href="#"
        onTouchTap={this.handleTouchTap}
        onClick={this.handleClick}>
        Tap Me
      </a>
    );
  },

  handleClick: function(e) {
    console.log("click", e);
  },

  handleTouchTap: function(e) {
    console.log("touchTap", e);
  }
});

ReactDOM.render(<Main />, document.getElementById("container"));
```

### Ignoring ghost clicks

When a tap happens, the browser sends a `touchstart` and `touchend`, and then
300ms later, a `click` event. This plugin ignores the click event if it has
been immediately preceeded by a touch event (within 750ms of the last touch
event).

Occasionally, there may be times when the 750ms threshold is exceeded due to
slow rendering or garbage collection, and this causes the dreaded ghost click.

The 750ms threshold is pretty good, but sometimes you might want to override
that behaviour. You can do this by supplying your own `shouldRejectClick`
function when you inject the plugin.

The following example will simply reject all click events, which you might
want to do if you are always using `onTouchTap` and only building for touch
devices:

```js
var React = require('react'),
injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin({
  shouldRejectClick: function (lastTouchEventTimestamp, clickEventTimestamp) {
    return true;
  }
});
```

## Build standalone version

Use the demo project and it's README instructions to build a version of React with the tap event plugin included.
