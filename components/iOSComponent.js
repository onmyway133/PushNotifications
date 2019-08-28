const React = require('react')
const ReactDOM = require('react-dom')
const Dialog = require('electron').remote.dialog
const RaisedButton = require('material-ui').RaisedButton
const FlatButton = require('material-ui').FlatButton
const RadioButton = require('material-ui').RadioButton
const RadioButtonGroup = require('material-ui').RadioButtonGroup
const TextField = require('material-ui').TextField
const Tab = require('material-ui').Tab
const Tabs = require('material-ui').Tabs

class iOSComponent extends React.Component {
  constructor(props) {
    super(props)
  
    this.state = props.lastState || this.makeDefaultState()

    this.handleSelectAuthCert = this.handleSelectAuthCert.bind(this)
    this.handleSelectAuthToken = this.handleSelectAuthToken.bind(this)
    this.handleAuthenticationChange = this.handleAuthenticationChange.bind(this)
    this.handleEnvironmentChange = this.handleEnvironmentChange.bind(this)
  }

  makeDefaultState() {
    const defaultMessage = {
      aps: {
        alert: "Hello"
      },
      yourCustomKey: '1'
    }

    return {
      authentication: 'authCert',
      authCert: {
        file: null,
        name: '',
        passphrase: ''
      },
      authToken: {
        file: null,
        name: '',
        keyId: null,
        teamId: null
      },
      bundleId: '',
      environment: 'sandbox',
      deviceToken: '',
      collapseId: '',
      message: JSON.stringify(defaultMessage)
    }
  }

  render() {
    let style = {
      padding: '10px'
    }

    return React.createElement('div', {style},
      this.makeAuthenticationElement(),
      this.makeBodyElement(),
      this.makeEnvironmentElement()
    )
  }

  // action

  handleSelectAuthCert() {
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
      
      const authCert = Object.assign(this.state.authCert, {
        file: path,
        name: name,
      })
      this.setState({
        authCert
      })
    })
  }

  handleSelectAuthToken() {
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

      const authToken = Object.assign(this.state.authToken, {
        file: path,
        name: name,
      })
      this.setState({
        authToken
      })
    })
  }

  handleAuthenticationChange(value) {
    this.setState({
      authentication: value
    })
  }

  handleEnvironmentChange(event, value) {
    this.setState({
      environment: value
    })
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
      label: 'Select p12',
      onClick: this.handleSelectAuthCert,
      style: {
        marginRight: '5px'
      },
      secondary: true
    }

    const passTextFieldOptions = {
      style: {
        width: '100%'
      },
      hintText: 'Enter passphrase',
      value: this.state.authCert.passphrase,
      onChange: (event, value) => {
        const authCert = Object.assign(this.state.authCert, {
          passphrase: value
        })
        this.setState({
          authCert
        })
      }
    }

    return React.createElement(Tab, tabOptions, 
      React.createElement('div', divOptions,
        React.createElement(FlatButton, buttonOptions),
        React.createElement('span', {}, this.state.authCert.name),
        React.createElement(TextField, passTextFieldOptions)
      )
    )
  }

  makeAuthKeyElement() {
    const tabOptions = {
      label: 'Token',
      value: 'authenticationToken'
    }

    const divOptions = {
      style: {
        marginTop: '10px'
      }
    }

    const buttonOptions = {
      label: 'Select p8',
      onClick: this.handleSelectAuthToken,
      style: {
        marginRight: '5px'
      },
      secondary: true
    }

    const keyIdTextField = {
      style: {
        width: '100%'
      },
      hintText: 'Enter key id',
      value: this.state.authToken.keyId,
      onChange: (event, value) => {
        const authToken = Object.assign(this.state.authToken, {
          keyId: value
        })
        this.setState({
          authToken
        })
      }
    }

    const teamIdTextField = {
      style: {
        width: '100%'
      },
      hintText: 'Enter team id',
      value: this.state.authToken.teamId,
      onChange: (event, value) => {
        const authToken = Object.assign(this.state.authToken, {
          teamId: value
        })
        this.setState({
          authToken
        })
      }
    }

    return React.createElement(Tab, tabOptions, 
      React.createElement('div', divOptions,
        React.createElement(FlatButton, buttonOptions),
        React.createElement('span', {}, this.state.authToken.name),
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

  makeBodyElement() {
    return React.createElement('div', {},
      React.createElement('fieldset', {},
        React.createElement('legend', {}, 'Body'),
        this.makeBundleIdElement(),
        this.makeDeviceTokenElement(),
        this.makeCollapseIdElement(),
        this.makeMessageElement()
      )
    )
  }

  makeBundleIdElement() {
    const textFieldOptions = {
      style: {
        width: '100%'
      },
      hintText: 'Enter bundle id',
      value: this.state.bundleId,
      onChange: (event, value) => {
        this.setState({
          bundleId: value
        })
      }
    }

    return React.createElement('div', {},
      React.createElement(TextField, textFieldOptions)
    )
  }

  makeDeviceTokenElement() {
    const textFieldOptions = {
      style: {
        width: '100%'
      },
      hintText: 'Enter device token',
      value: this.state.deviceToken,
      onChange: (event, value) => {
        this.setState({
          deviceToken: value
        })
      }
    }

    return React.createElement('div', {},
      React.createElement(TextField, textFieldOptions)
    )
  }

  makeCollapseIdElement() {
    const textFieldOptions = {
      style: {
        width: '100%'
      },
      hintText: 'Enter collapse id (optional)',
      value: this.state.collapseId,
      onChange: (event, value) => {
        this.setState({
          collapseId: value
        })
      }
    }

    return React.createElement('div', {},
      React.createElement(TextField, textFieldOptions)
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
      React.createElement(TextField, textFieldOptions)
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
}

module.exports = iOSComponent