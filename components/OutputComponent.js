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

    let textAreaOptions = {
      style: {
        width: 'calc(100% - 7px)',
        height: '95%',
        borderWidth: '0px',
      },
      value: this.props.output
    }

    return React.createElement('div', divOptions,
      React.createElement('fieldset', fieldSetOptions,
        React.createElement('legend', {}, 'Console'),
        React.createElement('textarea', textAreaOptions)  
      )
    )
  }
}

module.exports = OutputComponent