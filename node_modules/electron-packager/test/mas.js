'use strict'

const config = require('./config.json')
const packager = require('..')
const util = require('./_util')

if (!(process.env.CI && process.platform === 'win32')) {
  const masOpts = {
    name: 'masTest',
    dir: util.fixtureSubdir('basic'),
    electronVersion: config.version,
    arch: 'x64',
    platform: 'mas'
  }

  util.packagerTest('warn if building for mas and not signing', (t, baseOpts) => {
    const warningLog = console.warn
    let output = ''
    console.warn = message => { output += message }

    const finalize = err => {
      console.warn = warningLog
      if (err) throw err
    }

    return packager(Object.assign({}, baseOpts, masOpts))
      .then(() =>
        t.truthy(output.match(/signing is required for mas builds/), 'the correct warning is emitted')
      ).then(finalize)
      .catch(finalize)
  })
}
