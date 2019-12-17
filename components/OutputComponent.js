const React = require('react')
const ReactDOM = require('react-dom')
const RaisedButton = require('material-ui').RaisedButton
const Paper = require('material-ui').Paper
const CircularProgress = require('material-ui').CircularProgress
const CardText = require('material-ui').CardText


class OutputComponent extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    let divOptions = {
      style: {
        flex: 1,
        padding: '10px'
      }
    }

    const paperOptions = {
      style: {
        paddingTop: '10px',
        paddingBottom: '10px'
      }
    }

    return React.createElement('div', divOptions,
      React.createElement(Paper, paperOptions,
        this.makeProgressElement(),
        this.makeTextElement(),
        this.makeSendElement()
      )
    )
  }

  makeProgressElement() {
    const divOptions = {
      style: {
        display: 'flex',
        justifyContent: 'center',
        visibility: this.props.output.loading ? 'visible' : 'hidden'
      }
    }

    const progressOptions = {
      size: 60,
      thickness: 5
    }
    
    return React.createElement('div', divOptions, 
      React.createElement(CircularProgress, progressOptions)
    )
  }

  makeTextElement() {
    const style = {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '10px'
    }

    return React.createElement('div', {style: style}, 
      React.createElement(CardText, {}, this.props.output.text)
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
      onClick: this.props.triggerSend,
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