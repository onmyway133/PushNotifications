'use strict'

const config = require('./config.json')
const fs = require('fs-extra')
const packager = require('..')
const path = require('path')
const prune = require('../prune')
const test = require('tape')
const util = require('./util')
const waterfall = require('run-waterfall')
const which = require('which')

function createPruneOptionTest (baseOpts, prune, testMessage) {
  return (t) => {
    t.timeoutAfter(config.timeout)

    let opts = Object.create(baseOpts)
    opts.name = 'basicTest'
    opts.dir = path.join(__dirname, 'fixtures', 'basic')
    opts.prune = prune

    let finalPath
    let resourcesPath

    waterfall([
      (cb) => {
        packager(opts, cb)
      }, (paths, cb) => {
        finalPath = paths[0]
        fs.stat(finalPath, cb)
      }, (stats, cb) => {
        t.true(stats.isDirectory(), 'The expected output directory should exist')
        resourcesPath = path.join(finalPath, util.generateResourcesPath(opts))
        fs.stat(resourcesPath, cb)
      }, (stats, cb) => {
        t.true(stats.isDirectory(), 'The output directory should contain the expected resources subdirectory')
        fs.stat(path.join(resourcesPath, 'app', 'node_modules', 'run-series'), cb)
      }, (stats, cb) => {
        t.true(stats.isDirectory(), 'package.json dependency should exist under app/node_modules')
        fs.exists(path.join(resourcesPath, 'app', 'node_modules', 'run-waterfall'), (exists) => {
          t.equal(!prune, exists, testMessage)
          cb()
        })
      }
    ], (err) => {
      t.end(err)
    })
  }
}

test('pruneCommand returns the correct command when passing a known package manager', (t) => {
  t.equal(prune.pruneCommand('npm'), 'npm prune --production', 'passing npm gives the npm prune command')
  t.equal(prune.pruneCommand('cnpm'), 'cnpm prune --production', 'passing cnpm gives the cnpm prune command')
  t.equal(prune.pruneCommand('yarn'), 'yarn install --production --no-bin-links', 'passing yarn gives the yarn "prune command"')
  t.end()
})

test('pruneCommand returns null when the package manager is unknown', (t) => {
  t.notOk(prune.pruneCommand('unknown-package-manager'))
  t.end()
})

test('pruneModules returns an error when the package manager is unknown', (t) => {
  prune.pruneModules({packageManager: 'unknown-package-manager'}, '/tmp/app-path', (err) => {
    t.ok(err, 'error returned')
    t.end()
  })
})

if (process.platform === 'win32') {
  test('pruneModules returns an error when trying to use cnpm on Windows', (t) => {
    prune.pruneModules({packageManager: 'cnpm'}, '/tmp/app-path', (err) => {
      t.ok(err, 'error returned')
      t.end()
    })
  })
}

// This is not in the below loop so that it tests the default packageManager option.
util.testSinglePlatform('prune test with npm', (baseOpts) => {
  return createPruneOptionTest(baseOpts, true, 'package.json devDependency should NOT exist under app/node_modules')
})

for (const packageManager of ['cnpm', 'yarn']) {
  which(packageManager, (err, resolvedPath) => {
    if (err) return

    util.testSinglePlatform(`prune test with ${packageManager}`, (baseOpts) => {
      const opts = Object.assign({packageManager: packageManager}, baseOpts)
      return createPruneOptionTest(opts, true, 'package.json devDependency should NOT exist under app/node_modules')
    })
  })
}

util.testSinglePlatform('prune=false test', (baseOpts) => {
  return createPruneOptionTest(baseOpts, false, 'npm devDependency should exist under app/node_modules')
})
