'use strict'

const common = require('../common')
const fs = require('fs-extra')
const ignore = require('../ignore')
const path = require('path')
const packager = require('..')
const test = require('ava')
const util = require('./_util')

function ignoreTest (t, opts, ignorePattern, ignoredFile) {
  opts.name = 'ignoreTest'
  opts.dir = util.fixtureSubdir('basic')
  if (ignorePattern) {
    opts.ignore = ignorePattern
  }

  let appPath

  return packager(opts)
    .then(paths => {
      appPath = path.join(paths[0], util.generateResourcesPath(opts), 'app')
      return fs.pathExists(path.join(appPath, 'package.json'))
    }).then(exists => {
      t.true(exists, 'The expected output directory should exist and contain files')
      return fs.pathExists(path.join(appPath, ignoredFile))
    }).then(exists => t.false(exists, 'Ignored file should not exist in output app directory'))
}

function ignoreOutDirTest (t, opts, distPath) {
  opts.name = 'ignoreOutDirTest'
  opts.dir = t.context.workDir

  // we don't use path.join here to avoid normalizing
  var outDir = opts.dir + path.sep + distPath
  opts.out = outDir

  return fs.copy(util.fixtureSubdir('basic'), t.context.workDir, {
    dereference: true,
    stopOnErr: true,
    filter: file => { return path.basename(file) !== 'node_modules' }
  }).then(() =>
    // create out dir before packager (real world issue - when second run includes unignored out dir)
    fs.mkdirp(outDir)
  ).then(() =>
    // create file to ensure that directory will be not ignored because empty
    fs.open(path.join(outDir, 'ignoreMe'), 'w')
  ).then(fd => fs.close(fd))
    .then(() => packager(opts))
    .then(() => fs.pathExists(path.join(outDir, common.generateFinalBasename(opts), util.generateResourcesPath(opts), 'app', path.basename(outDir))))
    .then(exists => t.false(exists, 'Out dir must not exist in output app directory'))
}

function ignoreImplicitOutDirTest (t, opts) {
  opts.name = 'ignoreImplicitOutDirTest'
  opts.dir = t.context.workDir
  delete opts.out

  const testFilename = 'ignoreMe'
  let previousPackedResultDir

  return fs.copy(util.fixtureSubdir('basic'), t.context.workDir, {
    dereference: true,
    stopOnErr: true,
    filter: file => { return path.basename(file) !== 'node_modules' }
  }).then(() => {
    previousPackedResultDir = path.join(opts.dir, `${common.sanitizeAppName(opts.name)}-linux-ia32`)
    return fs.mkdirp(previousPackedResultDir)
  }).then(() =>
    // create file to ensure that directory will be not ignored because empty
    fs.open(path.join(previousPackedResultDir, testFilename), 'w')
  ).then(fd => fs.close(fd))
    .then(() => packager(opts))
    .then(() => fs.pathExists(path.join(opts.dir, common.generateFinalBasename(opts), util.generateResourcesPath(opts), 'app', testFilename)))
    .then(exists => t.false(exists, 'Out dir must not exist in output app directory'))
}

test('generateIgnores ignores the generated temporary directory only on Linux', t => {
  const tmpdir = '/foo/bar'
  const expected = path.join(tmpdir, 'electron-packager')
  let opts = {tmpdir}

  ignore.generateIgnores(opts)

  // Array.prototype.includes is added (not behind a feature flag) in Node 6
  if (process.platform === 'linux') {
    t.false(opts.ignore.indexOf(expected) === -1, 'temporary dir in opts.ignore')
  } else {
    t.true(opts.ignore.indexOf(expected) === -1, 'temporary dir not in opts.ignore')
  }
})

test('generateOutIgnores ignores all possible platform/arch permutations', (t) => {
  const ignores = ignore.generateOutIgnores({name: 'test'})
  t.is(ignores.length, util.allPlatformArchCombosCount)
})

util.testSinglePlatform('ignore default test: .o files', ignoreTest, null, 'ignore.o')
util.testSinglePlatform('ignore default test: .obj files', ignoreTest, null, 'ignore.obj')
util.testSinglePlatform('ignore test: string in array', ignoreTest, ['ignorethis'],
                        'ignorethis.txt')
util.testSinglePlatform('ignore test: string', ignoreTest, 'ignorethis', 'ignorethis.txt')
util.testSinglePlatform('ignore test: RegExp', ignoreTest, /ignorethis/, 'ignorethis.txt')
util.testSinglePlatform('ignore test: Function', ignoreTest,
                        file => file.match(/ignorethis/), 'ignorethis.txt')
util.testSinglePlatform('ignore test: string with slash', ignoreTest, 'ignore/this',
                        path.join('ignore', 'this.txt'))
util.testSinglePlatform('ignore test: only match subfolder of app', ignoreTest,
                        'electron-packager', path.join('electron-packager', 'readme.txt'))
util.testSinglePlatform('ignore out dir test', ignoreOutDirTest, 'ignoredOutDir')
util.testSinglePlatform('ignore out dir test: unnormalized path', ignoreOutDirTest,
                        './ignoredOutDir')
util.testSinglePlatform('ignore out dir test: implicit path', ignoreImplicitOutDirTest)
