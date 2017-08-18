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
    const style = {
      display: 'flex',
      justifyContent: 'center'
    }

    const progressOptions = {
      size: 60,
      thickness: 5
    }
    
    return React.createElement('div', {style: style}, 
      React.createElement(CircularProgress, progressOptions)
    )
  }

  makeTextElement() {
    return React.createElement('div', {}, 
      React.createElement(CardText, {}, this.props.output)
    )
  }

  makeSendElement() {
    const style = {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '10px',
      marginBottom: '100px'
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