'use strict'

const fs = require('fs-extra')
const path = require('path')
const prune = require('../prune')
const test = require('ava')
const util = require('./_util')
const which = require('which')

function assertYarnLockDoesntExist (t, resourcesPath) {
  return fs.pathExists(path.join(resourcesPath, 'app', 'yarn.lock'))
    .then(exists => t.false(exists, 'yarn.lock should NOT exist in packaged app'))
}

function createPruneOptionTest (t, baseOpts, prune, testMessage) {
  const opts = Object.assign({}, baseOpts, {
    name: 'pruneTest',
    dir: util.fixtureSubdir('basic'),
    prune: prune
  })

  let resourcesPath

  return util.packageAndEnsureResourcesPath(t, opts)
    .then(generatedResourcesPath => {
      resourcesPath = generatedResourcesPath
      return fs.stat(path.join(resourcesPath, 'app', 'node_modules', 'run-series'))
    }).then(stats => {
      t.true(stats.isDirectory(), 'npm dependency should exist under app/node_modules')
      return fs.pathExists(path.join(resourcesPath, 'app', 'node_modules', 'run-waterfall'))
    }).then(exists => {
      t.is(!prune, exists, testMessage)
      if (opts.packageManager === 'yarn') {
        return assertYarnLockDoesntExist(t, resourcesPath)
      }
      return Promise.resolve()
    })
}

test('pruneCommand returns the correct command when passing a known package manager', t => {
  t.is(prune.pruneCommand('npm'), 'npm prune --production', 'passing npm gives the npm prune command')
  t.is(prune.pruneCommand('cnpm'), 'cnpm prune --production', 'passing cnpm gives the cnpm prune command')
  t.is(prune.pruneCommand('yarn'), 'yarn install --production --no-bin-links --no-lockfile', 'passing yarn gives the yarn "prune command"')
})

test('pruneCommand returns undefined when the package manager is unknown', t => {
  t.is(prune.pruneCommand('unknown-package-manager'), undefined)
})

test('pruneModules returns an error when the package manager is unknown', t =>
  t.throws(prune.pruneModules({packageManager: 'unknown-package-manager'}, '/tmp/app-path'))
)

if (process.platform === 'win32') {
  test('pruneModules returns an error when trying to use cnpm on Windows', t =>
    t.throws(prune.pruneModules({packageManager: 'cnpm'}, '/tmp/app-path'))
  )
}

// This is not in the below loop so that it tests the default packageManager option.
util.testSinglePlatform('prune test with npm', (t, baseOpts) => {
  return createPruneOptionTest(t, baseOpts, true, 'package.json devDependency should NOT exist under app/node_modules')
})

// Not in the loop because it doesn't depend on an executable
util.testSinglePlatform('prune test using pruner module (packageManager=false)', (t, baseOpts) => {
  const opts = Object.assign({packageManager: false}, baseOpts)
  return createPruneOptionTest(t, opts, true, 'package.json devDependency should NOT exist under app/node_modules')
})

for (const packageManager of ['cnpm', 'yarn']) {
  try {
    if (which.sync(packageManager)) {
      util.testSinglePlatform(`prune test with ${packageManager}`, (t, baseOpts) => {
        const opts = Object.assign({packageManager: packageManager}, baseOpts)
        return createPruneOptionTest(t, opts, true, 'package.json devDependency should NOT exist under app/node_modules')
      })
    }
  } catch (e) {
    console.log(`Cannot find ${packageManager}, skipping test`)
  }
}

util.testSinglePlatform('prune=false test', createPruneOptionTest, false,
                        'npm devDependency should exist under app/node_modules')
