'use strict'

const common = require('./common')
const debug = require('debug')('electron-packager')
const path = require('path')
const series = require('run-series')

function generateRceditOptionsSansIcon (opts) {
  const win32metadata = Object.assign({}, opts['version-string'], opts.win32metadata)

  let rcOpts = {'version-string': win32metadata}

  if (opts.appVersion) {
    rcOpts['product-version'] = rcOpts['file-version'] = opts.appVersion
  }

  if (opts.buildVersion) {
    rcOpts['file-version'] = opts.buildVersion
  }

  if (opts.appCopyright) {
    rcOpts['version-string'].LegalCopyright = opts.appCopyright
  }

  const manifestProperties = ['application-manifest', 'requested-execution-level']
  for (const manifestProperty of manifestProperties) {
    if (win32metadata[manifestProperty]) {
      rcOpts[manifestProperty] = win32metadata[manifestProperty]
    }
  }

  return rcOpts
}

function updateWineMissingException (err) {
  if (err && err.code === 'ENOENT' && err.syscall === 'spawn wine') {
    err.message = 'Could not find "wine" on your system.\n\n' +
      'Wine is required to use the appCopyright, appVersion, buildVersion, icon, and \n' +
      'win32metadata parameters for Windows targets.\n\n' +
      'Make sure that the "wine" executable is in your PATH.\n\n' +
      'See https://github.com/electron-userland/electron-packager#building-windows-apps-from-non-windows-platforms for details.'
  }

  return err
}

module.exports = {
  createApp: function createApp (opts, templatePath, callback) {
    common.initializeApp(opts, templatePath, path.join('resources', 'app'), function buildWinApp (err, tempPath) {
      if (err) return callback(err)

      let newExeName = `${common.sanitizeAppName(opts.name)}.exe`
      var operations = [
        function (cb) {
          common.rename(tempPath, 'electron.exe', newExeName, cb)
        }
      ]

      const rcOpts = generateRceditOptionsSansIcon(opts)

      if (opts.icon || opts.win32metadata || opts['version-string'] || opts.appCopyright || opts.appVersion || opts.buildVersion) {
        operations.push(function (cb) {
          common.normalizeExt(opts.icon, '.ico', function (err, icon) {
            // Icon might be omitted or only exist in one OS's format, so skip it if normalizeExt reports an error
            if (!err) {
              rcOpts.icon = icon
            }

            debug(`Running rcedit with the options ${JSON.stringify(rcOpts)}`)
            require('rcedit')(path.join(tempPath, newExeName), rcOpts, function (err) {
              cb(updateWineMissingException(err))
            })
          })
        })
      }

      series(operations, function (err) {
        if (err) return callback(err)
        common.moveApp(opts, tempPath, callback)
      })
    })
  },
  generateRceditOptionsSansIcon: generateRceditOptionsSansIcon,
  updateWineMissingException: updateWineMissingException
}
