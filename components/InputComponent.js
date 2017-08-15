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
    const defaultMessage = {
      aps: {
        alert: "Hello"
      },
      yourCustomKey: '1'
    }

    this.state = {
      authentication: {
        value: 'authCert',
      },
      authCert: {
        file: '',
        name: '',
        passphrase: ''
      },
      auth: {
        file: '',
        name: '',
        keyId: '',
        teamId: ''
      },
      bundleId: '',
      environment: 'sandbox',
      deviceToken: '',
      message: JSON.stringify(defaultMessage)
    }

    this.handleSelectCert = this.handleSelectCert.bind(this)
    this.handleSelectAuthKey = this.handleSelectAuthKey.bind(this)
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
      this.makeBundleIdElement(),
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
        authCert: {
          file: path,
          name: name,
          passphrase: this.state.authCert.passphrase
        }
      })
    })
  }

  handleSelectAuthKey() {
    const options = {
      title: 'Select Apple Push Authentication Token',
      properties: ['openFile'],
      filters: [
        {
          name: 'Auth Key',
          extensions: ['p8']
        }
      ]
    }

    Dialog.showOpenDialog(options, (paths) => {
      const path = paths[0]
      const names = path.split('/')
      const name = names[names.length-1]

      this.setState({
        auth: {
          file: path,
          name: name,
          keyId: this.state.auth.keyId,
          teamId: this.state.auth.teamId
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
      value: 'authCert'
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

    const passTextFieldOptions = {
      style: {
        width: '100%'
      },
      hintText: 'Enter phassphrase',
      value: this.state.authCert.passphrase,
      onChange: (event, value) => {
        this.setState({
          authCert: {
            file: this.state.authCert.file,
            name: this.state.authCert.name,
            passphrase: value
          }
        })
      }
    }

    return React.createElement(Tab, tabOptions, 
      React.createElement('div', divOptions,
        React.createElement(RaisedButton, buttonOptions),
        React.createElement('span', {}, this.state.authCert.name),
        React.createElement(TextField, passTextFieldOptions)
      )
    )
  }

  makeAuthKeyElement() {
    const tabOptions = {
      label: 'Auth Key',
      value: 'authenticationToken'
    }

    const divOptions = {
      style: {
        marginTop: '10px'
      }
    }

    const buttonOptions = {
      label: 'Select',
      onClick: this.handleSelectAuthKey,
      style: {
        marginRight: '5px'
      }
    }

    const keyIdTextField = {
      style: {
        width: '100%'
      },
      hintText: 'Enter key id',
      onChange: (event, value) => {
        this.setState({
          auth: {
            teamId: value
          }
        })
      }
    }

    const teamIdTextField = {
      style: {
        width: '100%'
      },
      hintText: 'Enter team id',
      onChange: (event, value) => {
        this.setState({
          auth: {
            keyId: value
          }
        })
      }
    }

    return React.createElement(Tab, tabOptions, 
      React.createElement('div', divOptions,
        React.createElement(RaisedButton, buttonOptions),
        React.createElement('span', {}, this.state.authCert.name),
        React.createElement(TextField, keyIdTextField),
        React.createElement(TextField, teamIdTextField)
      )
    )


    return React.createElement(Tab, tabOptions, 
      React.createElement('div', {},
        React.createElement(TextField, keyTextFieldOptions)
      )
    )
  }

  makeBundleIdElement() {
    const textFieldOptions = {
      style: {
        width: '100%'
      },
      hintText: 'Enter bundle id',
      onChange: (event, value) => {
        this.setState({
          bundleId: value
        })
      }
    }

    return React.createElement('div', {},
      React.createElement('fieldset', {},
        React.createElement('legend', {}, 'Bundle Id'),
        React.createElement(TextField, textFieldOptions)
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
      rows: 5,
      rowsMax: 5,
      hintText: 'Enter message',
      value: this.state.message,
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