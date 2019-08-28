const React = require('react')
const ReactDOM = require('react-dom')
const iOSComponent = require('./iOSComponent.js')
const AndroidComponent = require('./AndroidComponent.js')
const injectTapEventPlugin = require('react-tap-event-plugin')
const Tab = require('material-ui').Tab
const Tabs = require('material-ui').Tabs
const Paper = require('material-ui').Paper
const APN = require('apn')
const Fetch = require('node-fetch')
const Store = require('electron-store')
const store = new Store()

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

  componentWillMount() {
    this.lastState = {
      ios: store.get('ios'),
      android: store.get('android')
    }
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
            React.createElement(iOSComponent, {lastState: this.lastState.ios, ref: 'ios'})
          ),
          React.createElement(Tab, androidOptions,
            React.createElement(AndroidComponent, {lastState: this.lastState.android, ref: 'android'})
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
    store.set('ios', input)

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

    const collapseId = input.collapseId
    if (collapseId && collapseId != '') {
      notification.collapseId = collapseId
    }

    try {
      notification.rawPayload = JSON.parse(input.message)
    } catch(e) {
      this.props.updateOutput({
        loading: false,
        text: 'Failed: ' + e
      })
      return
    }
    
    notification.topic = input.bundleId

    // provider
    const provider = new APN.Provider(options)

    provider.send(notification, input.deviceToken).then( (result) => {
      if (result.failed.length > 0) {
        this.props.updateOutput({
          loading: false,
          text: 'Failed: ' + result.failed[0].response.reason || "Unknown"
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
    store.set('android', input)
    
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
      data: JSON.parse(input.message)
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'key=' + input.serverKey
      },
      body: JSON.stringify(message)
    }

    Fetch('https://fcm.googleapis.com/fcm/send', options)
    .then((res)=> {
      return JSON.stringify(res)
    }).then((string) => {
      return JSON.parse(string)
    })
    .then((json) => {
      if (json.status >= 200 && json.status < 300 ) {
        this.props.updateOutput({
          loading: false,
          text: 'Succeeded'
        })
      } else {
        this.props.updateOutput({
          loading: false,
          text: 'Failed: ' + json.statusText
        })
      }
      console.log(json)
    })
  }
}

module.exports = InputComponent