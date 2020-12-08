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
const fs = require('fs');
const request = require('request');

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

      if (fs.existsSync(input.authCert.file) == false) {
        this.props.updateOutput({
          loading: false,
          text: 'Failed: The selected .p12 file does not exist at the inserted path. Please check if you moved it to another folder, deleted, or renamed it. To solve the issue, select the file again at the new location.'
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

      if (fs.existsSync(input.authToken.file) == false) {
        this.props.updateOutput({
          loading: false,
          text: 'Failed: The selected .p8 file does not exist at the inserted path. Please check if you moved it to another folder, deleted, or renamed it. To solve the issue, select the file again at the new location.'
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

    // Make iOS device token lowercased and check that it doesn't containt special characters
    const iOSDeviceToken = input.deviceToken.toLowerCase()
    const tokenRegex = /^[A-Za-z0-9 ]+$/
    const isValid = tokenRegex.test(iOSDeviceToken);
    if (!isValid) {
      this.props.updateOutput({
        loading: false,
        text: 'Failed: Wrong device token. iOS device token cannot contain special characters. It must be a string with 64 hexadecimal symbols. Example: "03ds25c845d461bcdad7802d2vf6fc1dfde97283bf75cn993eb6dca835ea2e2f"'
      })

      return
    }

    // Notification
    const notification = new APN.Notification()
    notification.expiry = Math.floor(Date.now() / 1000) + 3600

    const collapseId = input.collapseId
    if (collapseId && collapseId !== '') {
      notification.collapseId = collapseId
    }

    // New iOS 13+ mandatory header, `apns-push-type`. Can be either `alert` or `background`.
    // The value of this header must accurately reflect the contents of the notification's payload.
    // More here: https://github.com/node-apn/node-apn/pull/656/commits/cd44a3e2604eebdd5db04235daf035cf353f544a
    notification.pushType = "alert"

    try {
      const json = JSON.parse(input.message)
      notification.rawPayload = json

      // If `content-available` equals 1 and `aps` dictionary doesn't contain any other keys (except `category`), the notification is silent/background.
      // `apns-push-type` must be set to `background` for iOS 13+.
      // `category` key is an exeption to the rule
      const aps = json["aps"]
      if (input.bundleId.endsWith(".complication")) {
        notification.pushType = "complication"
      } else if (input.bundleId.endsWith(".pushkit.fileprovider")) {
        notification.pushType = "fileprovider"
      } else if (input.bundleId.endsWith(".voip")) {
        notification.pushType = "voip"
      } else if (aps && aps["content-available"] === 1) {
        const maxKeysNumber = aps.hasOwnProperty("category") ? 2 : 1

        let size = 0, key
        for (key in aps) {
          size++
        }

        if (size === maxKeysNumber) {
          notification.pushType = "background"
          notification.priority = 5
        }
      }
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

    this.props.updateOutput({
      loading: true,
      text: "Sending ".concat(notification.pushType, " notification")
    })

    provider.send(notification, iOSDeviceToken).then( (result) => {
      if (result.failed.length > 0) {
        this.props.updateOutput({
          loading: false,
          text: 'Failed: ' + result.failed[0].response.reason || "Unknown"
        })
      } else {
        this.props.updateOutput({
          loading: false,
          text: 'Succeeded: ' + iOSDeviceToken
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
    const message = Object.assign({
      to: input.deviceToken
    }, JSON.parse(input.message))

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'key=' + input.serverKey,
        'User-Agent': 'Push Notifications Tester',
        'Cache-Control': 'no-cache',
        'Host': 'fcm.googleapis.com',
        'Connection': 'keep-alive',
        'Accept': '*/*',
      },
      gzip: true,
      body: JSON.stringify(message)
    }

    request('https://fcm.googleapis.com/fcm/send', options, (err, res, body) => {
      const bodyJSON = JSON.parse(body);

      console.log(err, res, bodyJSON);

      if (res.statusCode >= 200 && res.statusCode < 300 && bodyJSON.success > 0) {
        this.props.updateOutput({
          loading: false,
          text: 'Succeeded'
        })
      } else {
        let errText = res.statusText;
        if (!errText) {
          errText = (bodyJSON.results || []).map(res => res.error || '').join(',')
        }
        console.log(bodyJSON.results);
        this.props.updateOutput({
          loading: false,
          text: 'Failed: ' + errText
        })
      }
    })
  }

}

module.exports = InputComponent
