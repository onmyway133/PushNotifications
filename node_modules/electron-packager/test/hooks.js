'use strict'

const config = require('./config.json')
const packager = require('..')
const util = require('./_util')

function createHookTest (hookName) {
  // 2 packages will be built during this test
  util.packagerTest(`platform=all test (one arch) (${hookName} hook)`, (t, opts) => {
    let hookCalled = false
    opts.dir = util.fixtureSubdir('basic')
    opts.electronVersion = config.version
    opts.arch = 'ia32'
    opts.platform = 'all'

    opts[hookName] = [(buildPath, electronVersion, platform, arch, callback) => {
      hookCalled = true
      t.is(electronVersion, opts.electronVersion, `${hookName} electronVersion should be the same as the options object`)
      t.is(arch, opts.arch, `${hookName} arch should be the same as the options object`)
      callback()
    }]

    return packager(opts)
      .then(finalPaths => {
        t.is(finalPaths.length, 2, 'packager call should resolve with expected number of paths')
        t.true(hookCalled, `${hookName} methods should have been called`)
        return util.verifyPackageExistence(finalPaths)
      }).then(exists => t.deepEqual(exists, [true, true], 'Packages should be generated for both 32-bit platforms'))
  })
}

createHookTest('afterCopy')
createHookTest('afterPrune')
createHookTest('afterExtract')
