'use strict'

const App = require('./platform')
const common = require('./common')

class LinuxApp extends App {
  get originalElectronName () {
    return 'electron'
  }

  get newElectronName () {
    return common.sanitizeAppName(this.executableName)
  }

  create () {
    return this.initialize()
      .then(() => this.renameElectron())
      .then(() => this.copyExtraResources(this.opts.extraResource))
      .then(() => this.move())
  }
}

module.exports = {
  App: LinuxApp
}
