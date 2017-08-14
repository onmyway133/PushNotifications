const React = require('react')
const ReactDOM = require('react-dom')

class InputComponent extends React.Component {
  render() {
    let style = {
      flex: 1,
      backgroundColor: 'yellow',
      padding: '10px'
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
      React.createElement('label', {}, 
        React.createElement('input', {
          type: 'radio',
          name: 'cert'
        }),
        'Certificate'
      ),
      React.createElement('input', {
        type: 'file'
      })
    )
  }

  makeAuthKeyElement() {
    return React.createElement('div', {},
      React.createElement('label', {}, 
        React.createElement('input', {
          type: 'radio',
          name: 'cert'
        }),
        'Auth key'
      ),
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
      React.createElement('p', {}, 'Message'),
      React.createElement('textarea', {}, 'Message content')
    )
  }

  makeSendElement() {
    return React.createElement('div', {},
      React.createElement('label', {}, 
        React.createElement('input', {
          type: 'radio',
          name: 'environment'
        }),
        'Sandbox'
      ),
      React.createElement('label', {}, 
        React.createElement('input', {
          type: 'radio',
          name: 'environment'
        }),
        'Production'
      ),
      React.createElement('button', {}, 'Send')
    )
  }
}

module.exports = InputComponent