const React = require('react')
const ReactDOM = require('react-dom')
const Dialog = require('electron').remote.dialog
const RaisedButton = require('material-ui').RaisedButton
const FlatButton = require('material-ui').FlatButton
const RadioButton = require('material-ui').RadioButton
const RadioButtonGroup = require('material-ui').RadioButtonGroup
const TextField = require('material-ui').TextField

class InputComponent extends React.Component {
  render() {
    let style = {
      flex: 1,
      backgroundColor: 'yellow',
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

  selectCert() {
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

    Dialog.showOpenDialog(options)
  }

  // make

  makeAuthenticationElement() {
    return React.createElement('div', {},
      React.createElement('fieldset', {},
        React.createElement('legend', {}, 'Authentication'),
        this.makeCertElement(),
        this.makeAuthKeyElement()
      )
    )
  }
  
  makeCertElement() {
    const style = {
      marginBottom: '10px'
    }

    const groupOptions = {
      name: 'configuration'
    }

    return React.createElement('div', {style},
      React.createElement(RadioButtonGroup, groupOptions, 
        React.createElement(RadioButton, {
          label: 'Certificate'
        })
      ),
      React.createElement(FlatButton, {
        label: 'Select',
        onClick: this.selectCert,
        backgroundColor: '#00BCD4'
      }),
      React.createElement('span', {}, 'File')
    )
  }

  makeAuthKeyElement() {
    const groupOptions = {
      name: 'configuration'
    }

    const textFieldOptions = {
      style: {
        width: '100%'
      },
      hintText: 'Enter device token'
    }

    return React.createElement('div', {},
      React.createElement(RadioButtonGroup, {groupOptions}, 
        React.createElement(RadioButton, {
          label: 'Auth key'
        })
      ),
      React.createElement(TextField, textFieldOptions)
    )
  }

  makeTokenElement() {
    const textFieldOptions = {
      style: {
        width: '100%'
      },
      hintText: 'Enter device token'
    }

    return React.createElement('div', {},
      React.createElement('fieldset', {},
        React.createElement('legend', {}, 'Device token'),
        React.createElement(TextField, textFieldOptions)
      )
    )
  }

  makeMessageElement() {
    return React.createElement('div', {},
      React.createElement('fieldset', {},
        React.createElement('legend', {}, 'Message'),
        React.createElement('textarea', {}, 'Message content')
      )
    )
  }

  makeEnvironmentElement() {
    const groupOptions = {
      name: 'environment',
      defaultSelected: 'sandbox'
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

    const buttonStyle = {
      width: '80%'
    }

    return React.createElement('div', {style}, 
      React.createElement(RaisedButton, {style: buttonStyle}, 'Send')
    )
  }
}

module.exports = InputComponent