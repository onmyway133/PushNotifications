'use strict'

const common = require('../common')
const config = require('./config.json')
const fs = require('fs-extra')
const packager = require('..')
const path = require('path')
const targets = require('../targets')
const test = require('tape')
const util = require('./util')
const waterfall = require('run-waterfall')

// Generates a path to the generated app that reflects the name given in the options.
// Returns the Helper.app location on darwin since the top-level .app is already tested for the
// resources path; on other OSes, returns the executable.
function generateNamePath (opts) {
  if (common.isPlatformMac(opts.platform)) {
    return path.join(`${opts.name}.app`, 'Contents', 'Frameworks', `${opts.name} Helper.app`)
  }

  return opts.name + (opts.platform === 'win32' ? '.exe' : '')
}

function createDefaultsTest (opts) {
  return function (t) {
    t.timeoutAfter(config.timeout)

    opts.name = 'defaultsTest'
    opts.dir = path.join(__dirname, 'fixtures', 'basic')
    delete opts.platform
    delete opts.arch

    let defaultOpts = {
      arch: process.arch,
      name: opts.name,
      platform: process.platform
    }

    var finalPath
    var resourcesPath

    waterfall([
      function (cb) {
        packager(opts, cb)
      }, function (paths, cb) {
        t.true(Array.isArray(paths), 'packager call should resolve to an array')
        t.equal(paths.length, 1, 'Single-target run should resolve to a 1-item array')

        finalPath = paths[0]
        t.equal(finalPath, path.join(util.getWorkCwd(), common.generateFinalBasename(defaultOpts)),
          'Path should follow the expected format and be in the cwd')
        fs.stat(finalPath, cb)
      }, function (stats, cb) {
        t.true(stats.isDirectory(), 'The expected output directory should exist')
        resourcesPath = path.join(finalPath, util.generateResourcesPath(defaultOpts))
        fs.stat(path.join(finalPath, generateNamePath(defaultOpts)), cb)
      }, function (stats, cb) {
        if (common.isPlatformMac(defaultOpts.platform)) {
          t.true(stats.isDirectory(), 'The Helper.app should reflect opts.name')
        } else {
          t.true(stats.isFile(), 'The executable should reflect opts.name')
        }
        fs.stat(resourcesPath, cb)
      }, function (stats, cb) {
        t.true(stats.isDirectory(), 'The output directory should contain the expected resources subdirectory')
        fs.exists(path.join(resourcesPath, 'app', 'node_modules', 'run-waterfall'), (exists) => {
          t.false(exists, 'The output directory should NOT contain devDependencies by default (prune=true)')
          util.areFilesEqual(path.join(opts.dir, 'main.js'), path.join(resourcesPath, 'app', 'main.js'), cb)
        })
      }, function (equal, cb) {
        t.true(equal, 'File under packaged app directory should match source file')
        util.areFilesEqual(path.join(opts.dir, 'ignore', 'this.txt'),
          path.join(resourcesPath, 'app', 'ignore', 'this.txt'),
          cb)
      }, function (equal, cb) {
        t.true(equal,
          'File under subdirectory of packaged app directory should match source file and not be ignored by default')
        fs.exists(path.join(resourcesPath, 'default_app'), function (exists) {
          t.false(exists, 'The output directory should not contain the Electron default app directory')
          cb()
        })
      }, function (cb) {
        fs.exists(path.join(resourcesPath, 'default_app.asar'), function (exists) {
          t.false(exists, 'The output directory should not contain the Electron default app asar file')
          cb()
        })
      }
    ], function (err) {
      t.end(err)
    })
  }
}

function createOutTest (opts) {
  return function (t) {
    t.timeoutAfter(config.timeout)

    opts.name = 'outTest'
    opts.dir = path.join(__dirname, 'fixtures', 'basic')
    opts.out = 'dist'

    var finalPath

    waterfall([
      function (cb) {
        packager(opts, cb)
      }, function (paths, cb) {
        finalPath = paths[0]
        t.equal(finalPath, path.join('dist', common.generateFinalBasename(opts)),
          'Path should follow the expected format and be under the folder specified in `out`')
        fs.stat(finalPath, cb)
      }, function (stats, cb) {
        t.true(stats.isDirectory(), 'The expected output directory should exist')
        fs.stat(path.join(finalPath, util.generateResourcesPath(opts)), cb)
      }, function (stats, cb) {
        t.true(stats.isDirectory(), 'The output directory should contain the expected resources subdirectory')
        cb()
      }
    ], function (err) {
      t.end(err)
    })
  }
}

function createOverwriteTest (opts) {
  return function (t) {
    t.timeoutAfter(config.timeout * 2) // Multiplied since this test packages the application twice

    opts.name = 'overwriteTest'
    opts.dir = path.join(__dirname, 'fixtures', 'basic')

    var finalPath
    var testPath

    waterfall([
      function (cb) {
        packager(opts, cb)
      }, function (paths, cb) {
        finalPath = paths[0]
        fs.stat(finalPath, cb)
      }, function (stats, cb) {
        t.true(stats.isDirectory(), 'The expected output directory should exist')
        // Create a dummy file to detect whether the output directory is replaced in subsequent runs
        testPath = path.join(finalPath, 'test.txt')
        fs.writeFile(testPath, 'test', cb)
      }, function (cb) {
        // Run again, defaulting to overwrite false
        packager(opts, cb)
      }, function (paths, cb) {
        fs.stat(testPath, cb)
      }, function (stats, cb) {
        t.true(stats.isFile(), 'The existing output directory should exist as before (skipped by default)')
        // Run a third time, explicitly setting overwrite to true
        opts.overwrite = true
        packager(opts, cb)
      }, function (paths, cb) {
        fs.exists(testPath, function (exists) {
          t.false(exists, 'The output directory should be regenerated when overwrite is true')
          cb()
        })
      }
    ], function (err) {
      t.end(err)
    })
  }
}

function createTmpdirTest (opts) {
  return function (t) {
    t.timeoutAfter(config.timeout)

    opts.name = 'tmpdirTest'
    opts.dir = path.join(__dirname, 'fixtures', 'basic')
    opts.out = 'dist'
    opts.tmpdir = path.join(util.getWorkCwd(), 'tmp')

    waterfall([
      function (cb) {
        packager(opts, cb)
      }, function (paths, cb) {
        fs.stat(path.join(opts.tmpdir, 'electron-packager'), cb)
      },
      function (stats, cb) {
        t.true(stats.isDirectory(), 'The expected temp directory should exist')
        cb()
      }
    ], function (err) {
      t.end(err)
    })
  }
}

function createDisableTmpdirUsingTest (opts) {
  return function (t) {
    t.timeoutAfter(config.timeout)

    opts.name = 'disableTmpdirTest'
    opts.dir = path.join(__dirname, 'fixtures', 'basic')
    opts.out = 'dist'
    opts.tmpdir = false

    waterfall([
      function (cb) {
        packager(opts, cb)
      }, function (paths, cb) {
        fs.stat(paths[0], cb)
      },
      function (stats, cb) {
        t.true(stats.isDirectory(), 'The expected out directory should exist')
        cb()
      }
    ], function (err) {
      t.end(err)
    })
  }
}

function createDisableSymlinkDereferencingTest (opts) {
  return function (t) {
    t.timeoutAfter(config.timeout)

    opts.name = 'disableSymlinkDerefTest'
    opts.dir = path.join(__dirname, 'fixtures', 'basic')
    opts.out = 'dist'
    opts.derefSymlinks = false
    opts.asar = false

    var dst = path.join(opts.dir, 'main-link.js')

    waterfall([
      function (cb) {
        var src = path.join(opts.dir, 'main.js')
        fs.ensureSymlink(src, dst, cb)
      }, function (cb) {
        packager(opts, cb)
      }, function (paths, cb) {
        var dstLink = path.join(paths[0], 'resources', 'app', 'main-link.js')
        fs.lstat(dstLink, cb)
      },
      function (stats, cb) {
        t.true(stats.isSymbolicLink(), 'The expected file should still be a symlink.')
        cb()
      },
      function (cb) {
        fs.remove(dst, cb)
      }
    ], function (err) {
      t.end(err)
    })
  }
}

test('camelCase de-kebab-cases known parameters', (t) => {
  let opts = {
    'abc-def': true,
    'electron-version': '1.6.0'
  }
  common.camelCase(opts, false)
  t.equal('1.6.0', opts.electronVersion, 'camelCased known property exists')
  t.equal(undefined, opts['electron-version'], 'kebab-cased known property does not exist')
  t.equal(undefined, opts.abcDef, 'camelCased unknown property does not exist')
  t.equal(true, opts['abc-def'], 'kebab-cased unknown property exists')
  t.end()
})

test('validateListFromOptions does not take non-Array/String values', (t) => {
  t.notOk(targets.validateListFromOptions({digits: 64}, {'64': true, '65': true}, 'digits') instanceof Array,
          'should not be an Array')
  t.end()
})

test('setting the quiet option does not print messages', (t) => {
  const errorLog = console.error
  const warningLog = console.warn
  let output = ''
  console.error = (message) => { output += message }
  console.warn = (message) => { output += message }

  common.warning('warning', true)
  t.equal('', output, 'quieted common.warning should not call console.warn')
  common.info('info', true)
  t.equal('', output, 'quieted common.info should not call console.error')

  console.error = errorLog
  console.warn = warningLog
  t.end()
})

test('download argument test: download.{arch,platform,version} does not overwrite {arch,platform,version}', function (t) {
  var opts = {
    download: {
      arch: 'ia32',
      platform: 'win32',
      version: '0.30.0'
    },
    electronVersion: '0.36.0'
  }

  var downloadOpts = common.createDownloadOpts(opts, 'linux', 'x64')
  t.same(downloadOpts, {arch: 'x64', platform: 'linux', version: '0.36.0'})
  t.end()
})

test('sanitize app name for use in file/directory names', (t) => {
  t.equal('@username-package', common.sanitizeAppName('@username/package'), 'slash should be replaced')
  t.end()
})

test('sanitize app name for use in the out directory name', (t) => {
  let opts = {
    arch: 'x64',
    name: '@username/package-name',
    platform: 'linux'
  }
  t.equal('@username-package-name-linux-x64', common.generateFinalBasename(opts), 'generateFinalBasename output should be sanitized')
  t.end()
})

test('cannot build apps where the name ends in " Helper"', (t) => {
  const opts = {
    arch: 'x64',
    dir: path.join(__dirname, 'fixtures', 'el-0374'),
    name: 'Bad Helper',
    platform: 'linux'
  }

  packager(opts, (err) => {
    t.equal('Application names cannot end in " Helper" due to limitations on macOS', err.message)
    t.end()
  })
})

util.testSinglePlatform('defaults test', createDefaultsTest)
util.testSinglePlatform('out test', createOutTest)
util.testSinglePlatform('overwrite test', createOverwriteTest)
util.testSinglePlatform('tmpdir test', createTmpdirTest)
util.testSinglePlatform('disable tmpdir test', createDisableTmpdirUsingTest)
util.testSinglePlatform('deref symlink test', createDisableSymlinkDereferencingTest)

util.packagerTest('building for Linux target sanitizes binary name', (t) => {
  let opts = {
    name: '@username/package-name',
    dir: path.join(__dirname, 'fixtures', 'el-0374'),
    electronVersion: '0.37.4',
    arch: 'ia32',
    platform: 'linux'
  }

  waterfall([
    (cb) => {
      packager(opts, cb)
    }, (paths, cb) => {
      t.equal(1, paths.length, '1 bundle created')
      fs.stat(path.join(paths[0], '@username-package-name'), cb)
    }, (stats, cb) => {
      t.true(stats.isFile(), 'The sanitized binary filename should exist')
      cb()
    }
  ], (err) => {
    t.end(err)
  })
})

util.packagerTest('fails with invalid arch', (t) => {
  let opts = {
    arch: 'z80',
    platform: 'linux'
  }
  packager(opts, (err, paths) => {
    t.equal(undefined, paths, 'no paths returned')
    t.ok(err, 'error thrown')
    t.end()
  })
})

util.packagerTest('fails with invalid platform', (t) => {
  let opts = {
    arch: 'ia32',
    platform: 'dos'
  }
  packager(opts, (err, paths) => {
    t.equal(undefined, paths, 'no paths returned')
    t.ok(err, 'error thrown')
    t.end()
  })
})

util.packagerTest('fails with invalid version', (t) => {
  let opts = {
    name: 'invalidElectronTest',
    dir: path.join(__dirname, 'fixtures', 'el-0374'),
    electronVersion: '0.0.1',
    arch: 'x64',
    platform: 'linux',
    download: {
      quiet: !!process.env.CI
    }
  }
  packager(opts, (err, paths) => {
    t.equal(undefined, paths, 'no paths returned')
    t.ok(err, 'error thrown')
    t.end()
  })
})

util.packagerTest('electronVersion overrides deprecated version', (t) => {
  const opts = {
    electronVersion: '0.1.2',
    version: '1.2.3'
  }

  common.deprecatedParameter(opts, 'version', 'electronVersion')

  t.equal(opts.electronVersion, '0.1.2', 'electronVersion should not change')
  t.equal(opts.version, undefined, 'version should be deleted')
  t.end()
})

util.packagerTest('version used if electronVersion not set', (t) => {
  const opts = {
    version: '1.2.3'
  }

  common.deprecatedParameter(opts, 'version', 'electronVersion')

  t.equal(opts.electronVersion, '1.2.3', 'electronVersion have version value')
  t.equal(opts.version, undefined, 'version should be deleted')
  t.end()
})

util.packagerTest('dir argument test: should work with relative path', (t) => {
  let opts = {
    name: 'ElectronTest',
    dir: path.join('..', 'fixtures', 'el-0374'),
    electronVersion: '0.37.4',
    arch: 'x64',
    platform: 'linux'
  }
  packager(opts, (err, paths) => {
    t.equal(path.join(__dirname, 'work', 'ElectronTest-linux-x64'), paths[0], 'paths returned')
    t.end(err)
  })
})
