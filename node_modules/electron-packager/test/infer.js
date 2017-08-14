'use strict'

const config = require('./config.json')
const fs = require('fs-extra')
const getMetadataFromPackageJSON = require('../infer')
const os = require('os')
const packager = require('..')
const path = require('path')
const pkgUp = require('pkg-up')
const util = require('./util')
const waterfall = require('run-waterfall')

function createInferElectronVersionTest (fixture, packageName) {
  return (opts) => {
    return (t) => {
      t.timeoutAfter(config.timeout)

      // Don't specify name or version
      delete opts.electronVersion
      opts.dir = path.join(__dirname, 'fixtures', fixture)

      waterfall([
        (cb) => {
          getMetadataFromPackageJSON(opts, opts.dir, cb)
        }, (cb) => {
          fs.readFile(path.join(opts.dir, 'package.json'), cb)
        }, (pkg, cb) => {
          const packageJSON = JSON.parse(pkg)
          t.equal(opts.electronVersion, packageJSON.devDependencies[packageName], `The version should be inferred from installed ${packageName} version`)
          cb()
        }
      ], (err) => {
        t.end(err)
      })
    }
  }
}

function copyFixtureToTempDir (fixtureSubdir, cb) {
  let tmpdir = path.join(os.tmpdir(), fixtureSubdir)
  let fixtureDir = path.join(__dirname, 'fixtures', fixtureSubdir)
  waterfall([
    cb => {
      let tmpdirPkg = pkgUp.sync(path.join(tmpdir, '..'))
      if (tmpdirPkg) return cb(new Error(`Found package.json in parent of temp directory, which will interfere with test results. Please remove package.json at ${tmpdirPkg}`))
      cb()
    },
    cb => fs.emptyDir(tmpdir, cb),
    (cb1, cb2) => fs.copy(fixtureDir, tmpdir, cb2 || cb1), // inconsistent cb arguments from fs.emptyDir
    cb => cb(null, tmpdir)
  ], cb)
}

function createInferFailureTest (opts, fixtureSubdir) {
  return function (t) {
    t.timeoutAfter(config.timeout)

    copyFixtureToTempDir(fixtureSubdir, (err, dir) => {
      if (err) return t.end(err)

      delete opts.electronVersion
      opts.dir = dir

      packager(opts, function (err, paths) {
        t.ok(err, 'error thrown')
        t.end()
      })
    })
  }
}

function createInferMissingVersionTest (opts) {
  return (t) => {
    t.timeoutAfter(config.timeout)
    waterfall([
      (cb) => {
        copyFixtureToTempDir('infer-missing-version-only', cb)
      }, (dir, cb) => {
        delete opts.electronVersion
        opts.dir = dir

        getMetadataFromPackageJSON(opts, dir, cb)
      }, (cb) => {
        fs.readFile(path.join(opts.dir, 'package.json'), cb)
      }, (pkg, cb) => {
        const packageJSON = JSON.parse(pkg)
        t.equal(opts.electronVersion, packageJSON.devDependencies['electron'], 'The version should be inferred from installed electron module version')
        cb()
      }
    ], (err) => {
      t.end(err)
    })
  }
}

function createInferMissingFieldsTest (opts) {
  return createInferFailureTest(opts, 'infer-missing-fields')
}

function createInferWithBadFieldsTest (opts) {
  return createInferFailureTest(opts, 'infer-bad-fields')
}

function createInferWithMalformedJSONTest (opts) {
  return createInferFailureTest(opts, 'infer-malformed-json')
}

function createInferNonSpecificElectronPrebuiltCompileFailureTest (opts) {
  return createInferFailureTest(opts, 'infer-non-specific-electron-prebuilt-compile')
}

util.testSinglePlatform('infer using `electron-prebuilt` package', createInferElectronVersionTest('basic', 'electron-prebuilt'))
util.testSinglePlatform('infer using `electron-prebuilt-compile` package', createInferElectronVersionTest('infer-electron-prebuilt-compile', 'electron-prebuilt-compile'))
util.testSinglePlatform('infer using `electron` package only', createInferMissingVersionTest)
util.testSinglePlatform('infer where `electron` version is preferred over `electron-prebuilt`', createInferElectronVersionTest('basic-renamed-to-electron', 'electron'))
util.testSinglePlatform('infer missing fields test', createInferMissingFieldsTest)
util.testSinglePlatform('infer with bad fields test', createInferWithBadFieldsTest)
util.testSinglePlatform('infer with malformed JSON test', createInferWithMalformedJSONTest)
util.testSinglePlatform('infer using a non-specific `electron-prebuilt-compile` package version', createInferNonSpecificElectronPrebuiltCompileFailureTest)
