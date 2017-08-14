const React = require('react')
const ReactDOM = require('react-dom')
const Remote = require('electron').remote

class OutputComponent extends React.Component {
  render() {
    let style = {
      flex: 1,
      backgroundColor: 'green'
    }

    return React.createElement('div', {style},
      React.createElement('textarea', {})
    )
  }
}

module.exports = OutputComponent