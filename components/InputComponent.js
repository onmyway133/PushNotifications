const React = require('react')
const ReactDOM = require('react-dom')
const Dialog = require('electron').remote.dialog
const RaisedButton = require('material-ui').RaisedButton
const RadioButton = require('material-ui').RadioButton
const RadioButtonGroup = require('material-ui').RadioButtonGroup
const TextField = require('material-ui').TextField
const Tab = require('material-ui').Tab
const Tabs = require('material-ui').Tabs
const injectTapEventPlugin = require('react-tap-event-plugin')

// http://www.material-ui.com/#/get-started/installation
injectTapEventPlugin()

class InputComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      authentication: {
        value: 'cert',
      },
      cert: {
        file: '',
        name: ''
      },
      auth: {
        bundleId: '',
        key: ''
      },
      environment: 'sandbox',
      deviceToken: '',
      message: ''
    }

    this.handleSelectCert = this.handleSelectCert.bind(this)
    this.handleAuthenticationChange = this.handleAuthenticationChange.bind(this)
    this.handleEnvironmentChange = this.handleEnvironmentChange.bind(this)
    this.handleSend = this.handleSend.bind(this)
  }

  render() {
    let style = {
      flex: 1,
      padding: '10px'
    }

    return React.createElement('div', {style},
      this.makeAuthenticationElement(),
      this.makeTokenElement(),
      this.makeMessageElement(),
      this.makeEnvironmentElement(),
      this.makeSendElement()
    )
  }

  // action

  handleSelectCert() {
    const options = {
      title: 'Select Apple Push Certificate',
      properties: ['openFile'],
      filters: [
        {
          name: 'PKCS #12',
          extensions: ['p12']
        }
      ]
    }

    Dialog.showOpenDialog(options, (paths) => {
      const path = paths[0]
      const names = path.split('/')
      const name = names[names.length-1]

      this.setState({
        cert: {
          file: path,
          name: name
        }
      })
    })
  }

  handleAuthenticationChange(value) {
    this.setState({
      authentication: {
        value
      }
    })
  }

  handleEnvironmentChange(value) {
    this.setState({
      environment: value
    })
  }

  handleSend(event) {
    this.props.send(this.state)
  }

  // make

  makeAuthenticationElement() {
    const tabsOptions = {
      value: this.state.authentication.value,
      onChange: this.handleAuthenticationChange
    }

    return React.createElement('div', {},
      React.createElement('fieldset', {},
        React.createElement('legend', {}, 'Authentication'),
        React.createElement(Tabs, tabsOptions, 
          this.makeCertElement(),
          this.makeAuthKeyElement()
        )
      )
    )
  }
  
  makeCertElement() {
    const tabOptions = {
      label: 'Certificate',
      value: 'cert'
    }

    const divOptions = {
      style: {
        marginTop: '10px'
      }
    }

    const buttonOptions = {
      label: 'Select',
      onClick: this.handleSelectCert,
      style: {
        marginRight: '5px'
      }
    }

    return React.createElement(Tab, tabOptions, 
      React.createElement('div', divOptions,
        React.createElement(RaisedButton, buttonOptions),
        React.createElement('span', {}, this.state.cert.name)
      )
    )
  }

  makeAuthKeyElement() {
    const tabOptions = {
      label: 'Auth Key',
      value: 'auth'
    }

    const keyTextFieldOptions = {
      style: {
        width: '100%'
      },
      hintText: 'Enter auth key',
      onChange: (event, value) => {
        this.setState({
          auth: {
            key: value,
            bundleId: this.state.auth.bundleId
          }
        })
      }
    }

    const bundleTextFieldOptions = {
      style: {
        width: '100%'
      },
      hintText: 'Enter bundle id',
      onChange: (event, value) => {
        this.setState({
          auth: {
            key: this.state.auth.key,
            bundleId: value
          }
        })
      }
    }

    return React.createElement(Tab, tabOptions, 
      React.createElement('div', {},
        React.createElement(TextField, keyTextFieldOptions),
        React.createElement(TextField, bundleTextFieldOptions)
      )
    )
  }

  makeTokenElement() {
    const textFieldOptions = {
      style: {
        width: '100%'
      },
      hintText: 'Enter device token',
      onChange: (event, value) => {
        this.setState({
          deviceToken: value
        })
      }
    }

    return React.createElement('div', {},
      React.createElement('fieldset', {},
        React.createElement('legend', {}, 'Device token'),
        React.createElement(TextField, textFieldOptions)
      )
    )
  }

  makeMessageElement() {
    const textFieldOptions = {
      style: {
        width: '100%'
      },
      multiLine: true,
      rows: 6,
      rowsMax: 6,
      hintText: 'Enter message',
      onChange: (event, value) => {
        this.setState({
          message: value
        })
      }
    }
 
    return React.createElement('div', {},
      React.createElement('fieldset', {},
        React.createElement('legend', {}, 'Message'),
        React.createElement(TextField, textFieldOptions)
      )
    )
  }

  makeEnvironmentElement() {
    const groupOptions = {
      name: 'environment',
      defaultSelected: this.state.environment,
      onChange: this.handleEnvironmentChange
    }

    return React.createElement('div', {},
      React.createElement('fieldset', {},
        React.createElement('legend', {}, 'Environment'),
        React.createElement(RadioButtonGroup, groupOptions, 
          React.createElement(RadioButton, {
            value: 'sandbox',
            label: 'Sandbox'
          }),
          React.createElement(RadioButton, {
            value: 'production',
            label: 'Production'
          })
        )
      )
    )
  }

  makeSendElement() {
    const style = {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '10px'
    }

    const buttonOptions = {
      backgroundColor: '#EB394E', 
      onTouchTap: this.handleSend,
      style: {
        width: '80%'
      }
    }

    return React.createElement('div', {style}, 
      React.createElement(RaisedButton, buttonOptions, 'Send')
    )
  }
}

module.exports = InputComponent