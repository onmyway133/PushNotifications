const React = require('react')
const ReactDOM = require('react-dom')
const iOSComponent = require('./iOSComponent.js')
const AndroidComponent = require('./AndroidComponent.js')
const injectTapEventPlugin = require('react-tap-event-plugin')
const Tab = require('material-ui').Tab
const Tabs = require('material-ui').Tabs
const APN = require('apn')

// http://www.material-ui.com/#/get-started/installation
injectTapEventPlugin()

class InputComponent extends React.Component {
  constructor(props) {
    super(props)
   
    this.state = {
      platform: 'ios'
    }

    this.handlePlatformChange = this.handlePlatformChange.bind(this)
  }

  render() {
    const divOptions = {
      style: {
        flex: 1
      }
    }

    const tabsOptions = {
      value: this.state.platform.value,
      onChange: this.handlePlatformChange
    }

    const iosOptions = {
      value: 'ios',
      label: 'iOS'
    }

    const androidOptions = {
      value: 'android',
      label: 'Android'
    }

    return React.createElement('div', divOptions,
      React.createElement(Tabs, tabsOptions, 
        React.createElement(Tab, iosOptions,
          React.createElement(iOSComponent, {ref: 'ios'})
        ),
        React.createElement(Tab, androidOptions,
          React.createElement(AndroidComponent, {ref: 'android'})
        )
      )
    )
  }

  // action

  handlePlatformChange(value) {
    this.setState({
      platform: value
    })
  }

  send() {
    this.props.updateOutput('Sending ...')

    if (this.state.platform == 'ios') {
      this.sendiOS()
    } else {
      this.sendAndroid()
    }
  }

  sendiOS() {
    const input = this.refs.ios.state

    // check

    if (input.authCert.file == null &&  input.authToken.file == null) {
      this.props.updateOutput('Failed: Missing file')
      return
    }

    // options
    let options

    if (input.authentication == 'authCert') {
      options = {
        pfx: input.authCert.file,
        passphrase: input.authCert.passphrase
      }
    } else {
      options = {
        token: {
          key: input.authToken.file,
          keyId: input.authToken.keyId,
          teamId: input.authToken.teamId
        }
      }
    }

    options.production = (input.environment == 'production') ? true : false

    // notification
    const notification = new APN.Notification()
    notification.expiry = Math.floor(Date.now() / 1000) + 3600
    notification.rawPayload = JSON.parse(input.message)
    notification.topic = input.bundleId

    // provider
    const provider = new APN.Provider(options)

    provider.send(notification, input.deviceToken).then( (result) => {
      if (result.failed.length > 0) {
        this.props.updateOutput('Failed: ' + result.failed[0].response.reason)
      } else {
        this.props.updateOutput('Sent to ' + input.deviceToken)
      }
    })
  }

  sendAndroid() {
    const input = this.refs.android.state
  }
}

module.exports = InputComponent