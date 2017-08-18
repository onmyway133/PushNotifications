const React = require('react')
const ReactDOM = require('react-dom')
const iOSComponent = require('./iOSComponent.js')
const AndroidComponent = require('./AndroidComponent.js')
const injectTapEventPlugin = require('react-tap-event-plugin')
const Tab = require('material-ui').Tab
const Tabs = require('material-ui').Tabs
const Paper = require('material-ui').Paper
const APN = require('apn')
const FCM = require('fcm-push')

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
        flex: 1,
        padding: '10px'
      }
    }

    const paperOptions = {
      
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
      React.createElement(Paper, {},
        React.createElement(Tabs, tabsOptions, 
          React.createElement(Tab, iosOptions,
            React.createElement(iOSComponent, {ref: 'ios'})
          ),
          React.createElement(Tab, androidOptions,
            React.createElement(AndroidComponent, {ref: 'android'})
          )
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
    this.props.updateOutput({
      loading: true,
      text: 'Loading ...'
    })

    if (this.state.platform == 'ios') {
      this.sendiOS()
    } else {
      this.sendAndroid()
    }
  }

  sendiOS() {
    const input = this.refs.ios.state

    // options
    let options

    if (input.authentication == 'authCert') {
      // check
      if (input.authCert.file == null) {
        this.props.updateOutput({
          loading: false,
          text: 'Failed: Authentication missing'
        })

        return
      }

      options = {
        pfx: input.authCert.file,
        passphrase: input.authCert.passphrase
      }
    } else {
      // check
      if (input.authToken.file == null || input.authToken.keyId == null || input.authToken.teamId == null) {
        this.props.updateOutput({
          loading: false,
          text: 'Failed: Authentication missing'
        })

        return
      }

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
        this.props.updateOutput({
          loading: false,
          text: 'Failed: ' + result.failed[0].response.reason
        })
      } else {
        this.props.updateOutput({
          loading: false,
          text: 'Succeeded: ' + input.deviceToken
        })
      }
    })
  }

  sendAndroid() {
    const input = this.refs.android.state
    
    // check
    if (input.serverKey == null) {
      this.props.updateOutput({
        loading: false,
        text: 'Failed: Authentication missing'
      })

      return
    }

    // message
    const message = {
      to: input.deviceToken,
      data: JSON.stringify(input.message)
    }
    
    // fcm
    const fcm = new FCM(input.serverKey)
  
    //callback style
    fcm.send(message, (error, response) => {
      if (error) {
        this.props.updateOutput({
          loading: false,
          text: 'Succeeded: ' + error
        })
      } else {
        this.props.updateOutput({
          loading: false,
          text: 'Succeeded: ' + response
        })
      }
    })
  }
}

module.exports = InputComponent