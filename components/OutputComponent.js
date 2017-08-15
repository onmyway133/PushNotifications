const React = require('react')
const ReactDOM = require('react-dom')

class OutputComponent extends React.Component {
  render() {
    let divOptions = {
      style: {
        marginTop: '10px',
        marginRight: '7px',
        flex: 1
      }
    }

    let fieldSetOptions = {
      style: {
        height: '90%',
        padding: '5px'
      }
    }

    let textAreaStyle = {
      width: 'calc(100% - 7px)',
      height: '95%',
      borderWidth: '0px'
    }

    return React.createElement('div', divOptions,
      React.createElement('fieldset', fieldSetOptions,
        React.createElement('legend', {}, 'Console'),
        React.createElement('textarea', {style: textAreaStyle})  
      )
    )
  }
}

module.exports = OutputComponent