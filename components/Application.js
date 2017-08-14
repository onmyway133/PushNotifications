const React = require('react')
const ReactDOM = require('react-dom')
const Remote = require('electron').remote
const InputComponent = require('./InputComponent.js')
const OutputComponent = require('./OutputComponent.js')

class Application extends React.Component {
  render() {
    let style = {
      display: 'flex',
      width: '100%',
      alignSelf: 'stretch'
    }

    let inputStyle = {
      width: '50%'
    }

    return React.createElement('div', {style}, 
      React.createElement(InputComponent, {style: inputStyle}),
      React.createElement(OutputComponent)
    )
  }
}

module.exports = Application