const React = require('react')
const ReactDOM = require('react-dom')
const TextField = require('material-ui').TextField

class AndroidComponent extends React.Component {
  constructor(props) {
    super(props)
 
    this.state = props.lastState || this.makeDefaultState()
  }

  render() {
    let style = {
      flex: 1,
      padding: '10px'
    }

    return React.createElement('div', {style},
      this.makeAuthenticationElement(),
      this.makeBodyElement()
    )
  }

  makeDefaultState() {
    const defaultMessage = {
      key1: 'value1',
      key2: 'value2'
    }

    return {
      serverKey: null,
      deviceToken: '',
      message: JSON.stringify(defaultMessage)
    }
  }

  // make

  makeAuthenticationElement() {
    return React.createElement('div', {},
      React.createElement('fieldset', {},
        React.createElement('legend', {}, 'Authentication'),
        this.makeServerKeyElement(),
      )
    )
  }

  makeServerKeyElement() {
    const textFieldOptions = {
      style: {
        width: '100%'
      },
      hintText: 'Enter server key',
      value: this.state.serverKey,
      onChange: (event, value) => {
        this.setState({
          serverKey: value
        })
      }
    }

    return React.createElement('div', {},
      React.createElement(TextField, textFieldOptions)
    )
  }

  makeBodyElement() {
    return React.createElement('div', {},
      React.createElement('fieldset', {},
        React.createElement('legend', {}, 'Body'),
        this.makeDeviceTokenElement(),
        this.makeMessageElement()
      )
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
}

module.exports = AndroidComponent