const React = require('react')
const ReactDOM = require('react-dom')
const Dialog = require('electron').remote.dialog

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
      this.makeEnvironment(),
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
  
  makeCertElement() {
    let style = {
      marginBottom: '10px'
    }

    let buttonStyle = {
      marginLeft: '5px',
      marginRight: '5px'
    }

    let radioStyle = {
      marginRight: '5px'
    }

    return React.createElement('div', {style},
      React.createElement('label', {}, 
        React.createElement('input', {
          style: radioStyle,
          type: 'radio',
          name: 'cert'
        }),
        'Certificate'
      ),
      React.createElement('button', {
        style: buttonStyle,
        onClick: this.selectCert
      }, 'Select'),
      React.createElement('span', {}, 'File')
    )
  }

  makeAuthKeyElement() {
    let radioStyle = {
      marginRight: '5px'
    }

    return React.createElement('div', {},
      React.createElement('label', {}, 
        React.createElement('input', {
          style: radioStyle,
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
      React.createElement('fieldset', {},
        React.createElement('legend', {}, 'Device token'),
        React.createElement('input', {
          type: 'text'
        })
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

  makeEnvironment() {
    return React.createElement('div', {},
      React.createElement('fieldset', {},
        React.createElement('legend', {}, 'Environment'),
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
        )
      )
    )
  }

  makeSendElement() {
    return React.createElement('button', {}, 'Send')
  }
}

module.exports = InputComponent