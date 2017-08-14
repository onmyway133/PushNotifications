const React = require('react')
const ReactDOM = require('react-dom')
const Remote = require('electron').remote

class InputComponent extends React.Component {
  render() {
    let style = {
      flex: 1,
      backgroundColor: 'yellow'
    }

    return React.createElement('div', {style},
      this.makeCertElement(),
      this.makeAuthKeyElement(),
      this.makeTokenElement(),
      this.makeMessageElement(),
      this.makeSendElement()
    )
  }

  makeCertElement() {
    return React.createElement('div', {},
      React.createElement('input', {
        type: 'radio'
      }),
      React.createElement('p', {}, 'Certificate'),
      React.createElement('input', {
        type: 'file'
      })
    )
  }

  makeAuthKeyElement() {
    return React.createElement('div', {},
      React.createElement('input', {
        type: 'radio'
      }),
      React.createElement('p', {}, 'Auth key'),
      React.createElement('input', {
        type: 'text'
      })
    )
  }

  makeTokenElement() {
    return React.createElement('div', {},
      React.createElement('p', {}, 'Device token'),
      React.createElement('input', {
        type: 'text'
      })
    )
  }

  makeMessageElement() {
    return React.createElement('div', {},
      React.createElement('p', {}, 'Device token'),
      React.createElement('textarea', {}, 'Message content')
    )
  }

  makeSendElement() {
    return React.createElement('div', {},
      React.createElement('input', {
        type: 'radio'
      }),
      React.createElement('input', {
        type: 'radio'
      }),
      React.createElement('input', {
        type: 'button'
      })
    )
  }
}

module.exports = InputComponent