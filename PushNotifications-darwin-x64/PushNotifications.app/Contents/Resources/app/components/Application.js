const React = require('react')
const ReactDOM = require('react-dom')
const InputComponent = require('./InputComponent.js')
const OutputComponent = require('./OutputComponent.js')
const MuiThemeProvider = require('material-ui/styles/').MuiThemeProvider

class Application extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      output: {
        loading: false,
        text: ''
      }
    }

    this.triggerSend = this.triggerSend.bind(this)
    this.updateOutput = this.updateOutput.bind(this)
  }

  render() {
    const style = {
      display: 'flex',
      width: '100%',
      alignSelf: 'stretch',
      backgroundColor: '#F8F8F0'
    }

    const inputOptions = {
      ref: 'input',
      updateOutput: this.updateOutput
    }

    const outputOptions = {
      output: this.state.output,
      triggerSend: this.triggerSend
    }

    return React.createElement(MuiThemeProvider, {},
      React.createElement('div', {style}, 
        React.createElement(InputComponent, inputOptions),
        React.createElement(OutputComponent, outputOptions)
      )
    )
  }

  // action

  triggerSend() {
    this.refs.input.send()
  }

  updateOutput(output) {
    this.setState({
      output
    })
  }
}

module.exports = Application