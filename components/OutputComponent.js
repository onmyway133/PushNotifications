const React = require('react')
const ReactDOM = require('react-dom')

class OutputComponent extends React.Component {
  render() {
    let style = {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      backgroundColor: 'green',
      padding: '10px'
    }

    let textAreaStyle = {
      width: 'calc(100% - 7px)',
      flex: 1
    }

    return React.createElement('div', {style},
      React.createElement('p', {}, 'Console'),
      React.createElement('textarea', {style: textAreaStyle})
    )
  }
}

module.exports = OutputComponent