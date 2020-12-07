const React = require('react')
const ReactDOM = require('react-dom')
const TextField = require('material-ui').TextField

const JSONInput = require('react-json-editor-ajrm').default
const locale    = require('react-json-editor-ajrm/locale/en')

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
      notification: {
        title: 'Notification title',
        body: 'Notification message',
        sound: 'default'
      },
      data: {
        key1: 'value1',
        key2: 'value2'
      }
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
      width: '100%',
      height: '400px',
      placeholder: JSON.parse(this.state.message),
      onChange: (event, value) => {
        this.setState({
          message: value
        })
      }
    }
 
    return React.createElement(JSONInput, textFieldOptions, null)
  }

}

class Hello extends React.Component {
    render() {
        return React.createElement('div', null, `Bonjour ${this.props.toWhat}`);
    }
}


module.exports = AndroidComponent
