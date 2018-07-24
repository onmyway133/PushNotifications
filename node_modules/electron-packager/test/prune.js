'use strict'

const fs = require('fs-extra')
const path = require('path')
const prune = require('../prune')
const test = require('ava')
const util = require('./_util')

function checkDependency (t, resourcesPath, moduleName, moduleExists) {
  const assertion = moduleExists ? 'should' : 'should NOT'
  const message = `module dependency '${moduleName}' ${assertion} exist under app/node_modules`
  const modulePath = path.join(resourcesPath, 'app', 'node_modules', moduleName)
  return fs.pathExists(modulePath)
    .then(exists => t.is(moduleExists, exists, message))
    .then(() => modulePath)
}

function assertDependencyExists (t, resourcesPath, moduleName) {
  return checkDependency(t, resourcesPath, moduleName, true)
    .then(modulePath => fs.stat(modulePath))
    .then(stats => t.true(stats.isDirectory(), 'module is a directory'))
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
      return assertDependencyExists(t, resourcesPath, 'run-series')
    }).then(() => assertDependencyExists(t, resourcesPath, '@types/node'))
    .then(() => checkDependency(t, resourcesPath, 'run-waterfall', !prune))
    .then(() => checkDependency(t, resourcesPath, 'electron-prebuilt', !prune))
}

util.testSinglePlatform('prune test', (t, baseOpts) => {
  return createPruneOptionTest(t, baseOpts, true, 'package.json devDependency should NOT exist under app/node_modules')
})

util.testSinglePlatform('prune electron in dependencies', (t, baseOpts) => {
  const opts = Object.assign({}, baseOpts, {
    name: 'pruneElectronTest',
    dir: util.fixtureSubdir('electron-in-dependencies')
  })

  return util.packageAndEnsureResourcesPath(t, opts)
    .then(resourcesPath => checkDependency(t, resourcesPath, 'electron', false))
})

util.testSinglePlatform('prune: false test', createPruneOptionTest, false,
                        'package.json devDependency should exist under app/node_modules')

test('isModule only detects modules inside a node_modules parent folder', t =>
  prune.isModule(util.fixtureSubdir(path.join('prune-is-module', 'node_modules', 'module')))
    .then(isModule => {
      t.true(isModule, 'module folder should be detected as module')
      return prune.isModule(util.fixtureSubdir(path.join('prune-is-module', 'node_modules', 'module', 'not-module')))
    }).then(isModule => t.false(isModule, 'not-module folder should not be detected as module'))
)
