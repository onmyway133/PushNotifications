const React = require('react')
const ReactDOM = require('react-dom')

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