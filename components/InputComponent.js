const React = require('react')
const ReactDOM = require('react-dom')
const iOSComponent = require('./iOSComponent.js')
const AndroidComponent = require('./AndroidComponent.js')
const injectTapEventPlugin = require('react-tap-event-plugin')
const Tab = require('material-ui').Tab
const Tabs = require('material-ui').Tabs

// http://www.material-ui.com/#/get-started/installation
injectTapEventPlugin()

class InputComponent extends React.Component {
  constructor(props) {
    super(props)
   
    this.state = {
      platform: 'ios'
    }
  }

  render() {
    const tabsOptions = {
      value: this.state.platform.value
    }

    const iosOptions = {
      value: 'ios',
      label: 'iOS'
    }

    const androidOptions = {
      value: 'android',
      label: 'Android'
    }

    return React.createElement('div', {},
      React.createElement(Tabs, tabsOptions, 
        React.createElement(Tab, iosOptions,
          React.createElement(iOSComponent, {})
        ),
        React.createElement(Tab, androidOptions,
          React.createElement(AndroidComponent, {})
        )
      )
    )
  }
}

module.exports = InputComponent