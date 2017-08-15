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

    return React.createElement('div', {},
      React.createElement(Tabs, tabsOptions, 
        React.createElement(iOSComponent, {}),
        React.createElement(AndroidComponent, {})
      )
    )
  }
}

module.exports = InputComponent