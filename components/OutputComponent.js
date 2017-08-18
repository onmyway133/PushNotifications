const React = require('react')
const ReactDOM = require('react-dom')
const RaisedButton = require('material-ui').RaisedButton

class OutputComponent extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    let divOptions = {
      style: {
        marginLeft: '5px',
        marginTop: '10px',
        marginRight: '7px',
        flex: 1
      }
    }

    let fieldSetOptions = {
      style: {
        height: '30%',
        padding: '5px'
      }
    }

    let textAreaOptions = {
      style: {
        width: 'calc(100% - 7px)',
        height: '88%',
        borderWidth: '0px',
      },
      value: this.props.output
    }

    return React.createElement('div', divOptions,
      React.createElement('fieldset', fieldSetOptions,
        React.createElement('legend', {}, 'Console'),
        React.createElement('textarea', textAreaOptions),
      ),
      this.makeSendElement()
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
      onTouchTap: this.props.triggerSend,
      style: {
        width: '80%'
      }
    }

    return React.createElement('div', {style}, 
      React.createElement(RaisedButton, buttonOptions, 'Send')
    )
  }
}

module.exports = OutputComponent