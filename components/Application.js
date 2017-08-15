const React = require('react')
const ReactDOM = require('react-dom')
const InputComponent = require('./InputComponent.js')
const OutputComponent = require('./OutputComponent.js')
const MuiThemeProvider = require('material-ui/styles/').MuiThemeProvider
const APN = require('apn')

class Application extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      output: ''
    }
  }

  render() {
    const style = {
      display: 'flex',
      width: '100%',
      alignSelf: 'stretch',
      backgroundColor: '#F8F8F0'
    }

    const inputOptions = {
      send: this.send
    }

    const outputOptions = {
      output: this.state.output
    }

    return React.createElement(MuiThemeProvider, {},
      React.createElement('div', {style}, 
        React.createElement(InputComponent, inputOptions),
        React.createElement(OutputComponent, outputOptions)
      )
    )
  }

  // action

  send(input) {
    // options
    let options

    if (input.authentication.value == 'cert') {
      options = {

      }
    } else {
      options = {

      }
    }

    // notification
    const notification = new APN.Notification()
    notification.expiry = Math.floor(Date.now() / 1000) + 3600
    // notification.badge = 1;
    // notification.sound = "ping.aiff";
    // notification.alert = "You have a new message";
    notification.payload = input.message

    // provider
    const provider = new APN.Provider(options)

    provider.send(notification, input.deviceToken).then( (result) => {
      console.log(result)
    })
  }
}

module.exports = Application