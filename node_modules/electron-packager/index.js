'use strict'

const common = require('./common')
const debug = require('debug')('electron-packager')
const extract = require('extract-zip')
const fs = require('fs-extra')
const getMetadataFromPackageJSON = require('./infer')
const ignore = require('./ignore')
const metadata = require('./package.json')
const path = require('path')
const series = require('run-series')
const targets = require('./targets')

function debugHostInfo () {
  debug(`Electron Packager ${metadata.version}`)
  debug(`Node ${process.version}`)
  debug(`Host Operating system: ${process.platform} (${process.arch})`)
}

function createSeries (opts, archs, platforms) {
  const tempBase = common.baseTempDir(opts)

  function testSymlink (cb) {
    var testPath = path.join(tempBase, 'symlink-test')
    var testFile = path.join(testPath, 'test')
    var testLink = path.join(testPath, 'testlink')
    series([
      function (cb) {
        fs.outputFile(testFile, '', cb)
      },
      function (cb) {
        fs.symlink(testFile, testLink, cb)
      }
    ], function (err) {
      var result = !err
      fs.remove(testPath, function () {
        cb(result) // ignore errors on cleanup
      })
    })
  }

  var tasks = []
  var useTempDir = opts.tmpdir !== false
  if (useTempDir) {
    tasks.push(function (cb) {
      fs.remove(tempBase, cb)
    })
  }
  return tasks.concat(common.createDownloadCombos(opts, platforms, archs).map(combination => {
    var arch = combination.arch
    var platform = combination.platform
    var version = combination.version

    return (callback) => {
      common.downloadElectronZip(combination, (err, zipPath) => {
        if (err) return callback(err)

        function createApp (comboOpts) {
          var buildParentDir
          if (useTempDir) {
            buildParentDir = tempBase
          } else {
            buildParentDir = opts.out || process.cwd()
          }
          var buildDir = path.resolve(path.join(buildParentDir, `${platform}-${arch}-template`))
          common.info(`Packaging app for platform ${platform} ${arch} using electron v${version}`, opts.quiet)
          series([
            function (cb) {
              debug(`Creating ${buildDir}`)
              fs.mkdirs(buildDir, cb)
            },
            function (cb) {
              debug(`Extracting ${zipPath} to ${buildDir}`)
              extract(zipPath, {dir: buildDir}, cb)
            },
            function (cb) {
              if (!opts.afterExtract || !Array.isArray(opts.afterExtract)) {
                cb()
              } else {
                var newFunctions = opts.afterExtract.map(function (fn) {
                  return fn.bind(this, buildDir, version, platform, arch)
                })
                series(newFunctions, cb)
              }
            }
          ], function () {
            require(targets.supportedPlatforms[platform]).createApp(comboOpts, buildDir, callback)
          })
        }

        // Create delegated options object with specific platform and arch, for output directory naming
        var comboOpts = Object.create(opts)
        comboOpts.arch = arch
        comboOpts.platform = platform
        comboOpts.version = version
        comboOpts.afterCopy = opts.afterCopy

        if (!useTempDir) {
          createApp(comboOpts)
          return
        }

        function checkOverwrite () {
          var finalPath = common.generateFinalPath(comboOpts)
          fs.exists(finalPath, function (exists) {
            if (exists) {
              if (opts.overwrite) {
                fs.remove(finalPath, function () {
                  createApp(comboOpts)
                })
              } else {
                common.info(`Skipping ${platform} ${arch} (output dir already exists, use --overwrite to force)`, opts.quiet)
                callback()
              }
            } else {
              createApp(comboOpts)
            }
          })
        }

        if (common.isPlatformMac(combination.platform)) {
          testSymlink(function (result) {
            if (result) return checkOverwrite()

            common.info(`Cannot create symlinks (on Windows hosts, it requires admin privileges); skipping ${combination.platform} platform`, opts.quiet)
            callback()
          })
        } else {
          checkOverwrite()
        }
      })
    }
  }))
}

module.exports = function packager (opts, cb) {
  debugHostInfo()
  if (debug.enabled) debug(`Packager Options: ${JSON.stringify(opts)}`)

  let archs = targets.validateListFromOptions(opts, targets.supportedArchs, 'arch')
  let platforms = targets.validateListFromOptions(opts, targets.supportedPlatforms, 'platform')
  if (!Array.isArray(archs)) return cb(archs)
  if (!Array.isArray(platforms)) return cb(platforms)

  debug(`Target Platforms: ${platforms.join(', ')}`)
  debug(`Target Architectures: ${archs.join(', ')}`)

  common.deprecatedParameter(opts, 'version', 'electronVersion', 'electron-version')

  common.camelCase(opts, true)

  getMetadataFromPackageJSON(opts, path.resolve(process.cwd(), opts.dir) || process.cwd(), function (err) {
    if (err) return cb(err)

    if (/ Helper$/.test(opts.name)) {
      return cb(new Error('Application names cannot end in " Helper" due to limitations on macOS'))
    }

    debug(`Application name: ${opts.name}`)
    debug(`Target Electron version: ${opts.electronVersion}`)

    ignore.generateIgnores(opts)

    series(createSeries(opts, archs, platforms), function (err, appPaths) {
      if (err) return cb(err)

      cb(null, appPaths.filter(function (appPath) {
        // Remove falsy entries (e.g. skipped platforms)
        return appPath
      }))
    })
  })
}
