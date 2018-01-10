'use strict'

const asar = require('asar')
const debug = require('debug')('electron-packager')
const fs = require('fs-extra')
const path = require('path')
const pify = require('pify')

const ignore = require('./ignore')
const pruneModules = require('./prune').pruneModules

const common = require('./common')

class App {
  constructor (opts, templatePath) {
    this.opts = opts
    this.templatePath = templatePath
  }

  /**
   * Resource directory path before renaming.
   */
  get originalResourcesDir () {
    return this.resourcesDir
  }

  /**
   * Resource directory path after renaming.
   */
  get resourcesDir () {
    return path.join(this.stagingPath, 'resources')
  }

  get originalResourcesAppDir () {
    return path.join(this.originalResourcesDir, 'app')
  }

  get electronBinaryDir () {
    return this.stagingPath
  }

  get originalElectronName () {
    /* istanbul ignore next */
    throw new Error('Child classes must implement this')
  }

  get newElectronName () {
    /* istanbul ignore next */
    throw new Error('Child classes must implement this')
  }

  get executableName () {
    return this.opts.executableName || this.opts.name
  }

  get stagingPath () {
    if (this.opts.tmpdir === false) {
      return common.generateFinalPath(this.opts)
    } else {
      return path.join(
        common.baseTempDir(this.opts),
        `${this.opts.platform}-${this.opts.arch}`,
        common.generateFinalBasename(this.opts)
      )
    }
  }

  relativeRename (basePath, oldName, newName) {
    debug(`Renaming ${oldName} to ${newName} in ${basePath}`)
    return fs.rename(path.join(basePath, oldName), path.join(basePath, newName))
  }

  renameElectron () {
    return this.relativeRename(this.electronBinaryDir, this.originalElectronName, this.newElectronName)
  }

  /**
   * Performs the following initial operations for an app:
   * * Creates temporary directory
   * * Copies template into temporary directory
   * * Copies user's app into temporary directory
   * * Prunes non-production node_modules (if opts.prune is either truthy or undefined)
   * * Creates an asar (if opts.asar is set)
   */
  initialize () {
    debug(`Initializing app in ${this.stagingPath} from ${this.templatePath} template`)

    return fs.move(this.templatePath, this.stagingPath, { clobber: true })
      .then(this.copyTemplate())
      .then(() => {
        // Support removing old default_app folder that is now an asar archive
        return fs.remove(path.join(this.originalResourcesDir, 'default_app'))
      }).then(() => fs.remove(path.join(this.originalResourcesDir, 'default_app.asar')))
      // Prune and asar are performed before platform-specific logic, primarily so that
      // this.originalResourcesAppDir is predictable (e.g. before .app is renamed for mac)
      .then(() => this.prune())
      .then(() => this.asarApp())
  }

  copyTemplate () {
    return () =>
      fs.copy(this.opts.dir, this.originalResourcesAppDir, {
        filter: ignore.userIgnoreFilter(this.opts),
        dereference: this.opts.derefSymlinks
      }).then(() => common.promisifyHooks(this.opts.afterCopy, [
        this.originalResourcesAppDir,
        this.opts.electronVersion,
        this.opts.platform,
        this.opts.arch
      ]))
  }

  /**
   * Forces an icon filename to a given extension and returns the normalized filename,
   * if it exists.  Otherwise, returns null.
   *
   * This error path is used by win32 if no icon is specified.
   */
  normalizeIconExtension (targetExt) {
    if (!this.opts.icon) throw new Error('No filename specified to normalizeExt')

    let iconFilename = this.opts.icon
    const ext = path.extname(iconFilename)
    if (ext !== targetExt) {
      iconFilename = path.join(path.dirname(iconFilename), path.basename(iconFilename, ext) + targetExt)
    }

    return fs.pathExists(iconFilename)
      .then(() => iconFilename)
      .catch(() => null)
  }

  prune () {
    if (this.opts.prune || this.opts.prune === undefined) {
      return pruneModules(this.opts, this.originalResourcesAppDir)
        .then(() => common.promisifyHooks(this.opts.afterPrune, [this.originalResourcesAppDir, this.opts.electronVersion, this.opts.platform, this.opts.arch]))
    }

    return Promise.resolve()
  }

  asarApp () {
    const asarOptions = common.createAsarOpts(this.opts)
    if (!asarOptions) {
      return Promise.resolve()
    }

    const dest = path.join(this.originalResourcesDir, 'app.asar')
    debug(`Running asar with the options ${JSON.stringify(asarOptions)}`)
    return pify(asar.createPackageWithOptions)(this.originalResourcesAppDir, dest, asarOptions)
      .then(() => fs.remove(this.originalResourcesAppDir))
  }

  copyExtraResources (extraResources) {
    if (!extraResources) return Promise.resolve()

    if (!Array.isArray(extraResources)) extraResources = [extraResources]

    return Promise.all(extraResources.map(
      resource => fs.copy(resource, path.resolve(this.stagingPath, this.resourcesDir, path.basename(resource)))
    ))
  }

  move () {
    const finalPath = common.generateFinalPath(this.opts)

    if (this.opts.tmpdir === false) {
      return Promise.resolve(finalPath)
    }

    debug(`Moving ${this.stagingPath} to ${finalPath}`)
    return fs.move(this.stagingPath, finalPath)
      .then(() => finalPath)
  }
}

module.exports = App
