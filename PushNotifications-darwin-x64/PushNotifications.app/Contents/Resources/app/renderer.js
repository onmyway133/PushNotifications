const ipc = require('electron').ipcRenderer
const React = require('react')
const ReactDOM = require('react-dom')
const Application = require('./components/Application.js')

// Reload
function reload() {
  ReactDOM.render(
    React.createElement(Application, {}),
    document.getElementById('root')
  )
}

// Reload initially
reload()