#!/usr/bin/env node

'use strict'

var semver = require('semver')
if (semver.lt(process.versions.node, '4.0.0')) {
  console.error('CANNOT RUN WITH NODE ' + process.versions.node)
  console.error('Electron Packager requires Node 4.0 or above.')
  process.exit(1)
}

// Not consts so that this file can load in Node < 4.0
var common = require('./common')
var fs = require('fs')
var packager = require('./')
var path = require('path')
var usage = fs.readFileSync(path.join(__dirname, 'usage.txt')).toString()

var args = common.parseCLIArgs(process.argv.slice(2))

// temporary fix for https://github.com/nodejs/node/issues/6456
var stdioWriters = [process.stdout, process.stderr]
stdioWriters.forEach(function (stdioWriter) {
  if (stdioWriter._handle && stdioWriter._handle.setBlocking) {
    stdioWriter._handle.setBlocking(true)
  }
})

function printUsageAndExit (isError) {
  var print = isError ? console.error : console.log
  print(usage)
  process.exit(isError ? 1 : 0)
}

if (args.help) {
  printUsageAndExit(false)
} else if (args.version) {
  if (typeof args.version !== 'boolean') {
    console.error('--version does not take an argument. Perhaps you meant --app-version or --electron-version?\n')
  }
  console.log(common.hostInfo())
  process.exit(0)
} else if (!args.dir) {
  printUsageAndExit(true)
}

packager(args)
  .then(function done (appPaths) {
    if (appPaths.length > 1) console.error('Wrote new apps to:\n' + appPaths.join('\n'))
    else if (appPaths.length === 1) console.error('Wrote new app to', appPaths[0])
    return true
  }).catch(function error (err) {
    if (err.message) console.error(err.message)
    else console.error(err, err.stack)
    process.exit(1)
  })
