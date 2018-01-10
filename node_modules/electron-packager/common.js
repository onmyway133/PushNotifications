'use strict'

const debug = require('debug')('electron-packager')
const download = require('electron-download')
const os = require('os')
const path = require('path')
const pify = require('pify')
const sanitize = require('sanitize-filename')
const semver = require('semver')
const targets = require('./targets')
const yargs = require('yargs-parser')

function parseCLIArgs (argv) {
  var args = yargs(argv, {
    boolean: [
      'all',
      'deref-symlinks',
      'download.strictSSL',
      'overwrite',
      'prune',
      'quiet'
    ],
    default: {
      'deref-symlinks': true,
      'download.strictSSL': true,
      prune: true
    },
    string: [
      'electron-version',
      'out'
    ]
  })

  args.dir = args._[0]
  args.name = args._[1]

  var protocolSchemes = [].concat(args.protocol || [])
  var protocolNames = [].concat(args.protocolName || [])

  if (protocolSchemes && protocolNames && protocolNames.length === protocolSchemes.length) {
    args.protocols = protocolSchemes.map(function (scheme, i) {
      return {schemes: [scheme], name: protocolNames[i]}
    })
  }

  if (args.out === '') {
    warning('Specifying --out= without a value is the same as the default value')
    args.out = null
  }

  // Overrides for multi-typed arguments, because minimist doesn't support it

  // asar: `Object` or `true`
  if (args.asar === 'true' || args.asar instanceof Array) {
    warning('--asar does not take any arguments, it only has sub-properties (see --help)')
    args.asar = true
  }

  // osx-sign: `Object` or `true`
  if (args.osxSign === 'true') {
    warning('--osx-sign does not take any arguments, it only has sub-properties (see --help)')
    args.osxSign = true
  }

  // tmpdir: `String` or `false`
  if (args.tmpdir === 'false') {
    warning('--tmpdir=false is deprecated, use --no-tmpdir instead')
    args.tmpdir = false
  }

  return args
}

function sanitizeAppName (name) {
  return sanitize(name, {replacement: '-'})
}

function generateFinalBasename (opts) {
  return `${sanitizeAppName(opts.name)}-${opts.platform}-${opts.arch}`
}

function generateFinalPath (opts) {
  return path.join(opts.out || process.cwd(), generateFinalBasename(opts))
}

function info (message, quiet) {
  if (!quiet) {
    console.error(message)
  }
}

function warning (message, quiet) {
  if (!quiet) {
    console.warn(`WARNING: ${message}`)
  }
}

function subOptionWarning (properties, optionName, parameter, value, quiet) {
  if (properties.hasOwnProperty(parameter)) {
    warning(`${optionName}.${parameter} will be inferred from the main options`, quiet)
  }
  properties[parameter] = value
}

function createAsarOpts (opts) {
  let asarOptions
  if (opts.asar === true) {
    asarOptions = {}
  } else if (typeof opts.asar === 'object') {
    asarOptions = opts.asar
  } else if (opts.asar === false || opts.asar === undefined) {
    return false
  } else {
    warning(`asar parameter set to an invalid value (${opts.asar}), ignoring and disabling asar`)
    return false
  }

  return asarOptions
}

function createDownloadOpts (opts, platform, arch) {
  let downloadOpts = Object.assign({}, opts.download)

  subOptionWarning(downloadOpts, 'download', 'platform', platform, opts.quiet)
  subOptionWarning(downloadOpts, 'download', 'arch', arch, opts.quiet)
  subOptionWarning(downloadOpts, 'download', 'version', opts.electronVersion, opts.quiet)

  return downloadOpts
}

module.exports = {
  parseCLIArgs: parseCLIArgs,

  isPlatformMac: function isPlatformMac (platform) {
    return platform === 'darwin' || platform === 'mas'
  },

  createAsarOpts: createAsarOpts,

  createDownloadCombos: function createDownloadCombos (opts, selectedPlatforms, selectedArchs, ignoreFunc) {
    return targets.createPlatformArchPairs(opts, selectedPlatforms, selectedArchs, ignoreFunc).map((combo) => {
      const platform = combo[0]
      const arch = combo[1]
      return createDownloadOpts(opts, platform, arch)
    })
  },
  createDownloadOpts: createDownloadOpts,
  downloadElectronZip: function downloadElectronZip (downloadOpts) {
    // armv7l builds have only been backfilled for Electron >= 1.0.0.
    // See: https://github.com/electron/electron/pull/6986
    if (downloadOpts.arch === 'armv7l' && semver.lt(downloadOpts.version, '1.0.0')) {
      downloadOpts.arch = 'arm'
    }
    debug(`Downloading Electron with options ${JSON.stringify(downloadOpts)}`)
    return pify(download)(downloadOpts)
  },

  deprecatedParameter: function deprecatedParameter (properties, oldName, newName, newCLIName) {
    if (properties.hasOwnProperty(oldName)) {
      warning(`The ${oldName} parameter is deprecated, use ${newName} (or --${newCLIName} in the CLI) instead`)
      if (!properties.hasOwnProperty(newName)) {
        properties[newName] = properties[oldName]
      }
      delete properties[oldName]
    }
  },
  subOptionWarning: subOptionWarning,

  baseTempDir: function baseTempDir (opts) {
    return path.join(opts.tmpdir || os.tmpdir(), 'electron-packager')
  },
  generateFinalBasename: generateFinalBasename,
  generateFinalPath: generateFinalPath,
  sanitizeAppName: sanitizeAppName,

  promisifyHooks: function promisifyHooks (hooks, args) {
    if (!hooks || !Array.isArray(hooks)) {
      return Promise.resolve()
    }

    return Promise.all(hooks.map(hookFn => pify(hookFn).apply(this, args)))
  },

  info: info,
  warning: warning
}
