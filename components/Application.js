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

    this.send = this.send.bind(this)
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
    console.log(input)

    // options
    let options

    if (input.authentication.value == 'cert') {
      options = {
        pfx: input.cert.file,
        passphrase: input.cert.passphrase
      }
    } else {
      options = {

      }
    }

    options.production = (input.environment == 'production') ? true : false

    // notification
    const notification = new APN.Notification()
    notification.expiry = Math.floor(Date.now() / 1000) + 3600
    notification.rawPayload = JSON.parse(input.message)

    // provider
    const provider = new APN.Provider(options)

    provider.send(notification, input.deviceToken).then( (result) => {
      if (result.failed.length > 0) {
        this.setState({
          output: 'Failed: ' + result.failed[0].response.reason
        })
      } else {
        this.setState({
          output: 'Sent to ' + input.deviceToken
        })
      }
    })
  }
}

module.exports = Application