const React = require('react')
const ReactDOM = require('react-dom')
const Remote = require('electron').remote

class InputComponent extends React.Component {
  render() {
    let style = {
      display: 'flex',
      width: '100%',
      alignSelf: 'stretch',
      backgroundColor: 'yellow'
    }

    return React.createElement('div', {style})
  }
}

module.exports = InputComponent