const React = require('react')
const ReactDOM = require('react-dom')
const Remote = require('electron').remote

class OutputComponent extends React.Component {
  render() {
    let style = {
      display: 'flex',
      width: '100%',
      alignSelf: 'stretch',
      backgroundColor: 'green'
    }

    return React.createElement('div', {style})
  }
}

module.exports = OutputComponent