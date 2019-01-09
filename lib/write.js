module.exports = function (ZtGenerator) {
  ZtGenerator.prototype.writing = function () {
    console.log('writing')
    const { answers, opts } = this

    if (!opts.init) {
      this._writingStyles()
      this._writingScripts()
      this._writingHtml()
      this._writingGulpfile()
      this._writingConfig()
      answers.includeBabel && this._writingBabelrc()
    }
    this._writingMisc()
    this._writingPackageJSON()
  }

  ZtGenerator.prototype._writingGulpfile = function () {
    const { answers } = this
    this.copyTpl(
      'templates/_gulpfile.js',
      this.destinationPath('gulpfile.js'),
      {
        isWap: answers.isWap,
        preprocessor: answers.preprocessor,
        includeRem: answers.includeRem,
        includeBase64: answers.includeBase64,
        includeCompressJS: answers.includeCompressJS,
        includeBabel: answers.includeBabel,
        includeFontSpider: answers.includeFontSpider,
        includeSprites: answers.includeSprites,
        includePolyfill: answers.includePolyfill,
        styleDir: this.styleDir,
        styleExt: this.styleExt
      }
    )
  }

  ZtGenerator.prototype._writingPackageJSON = function () {
    const { answers } = this
    this.copyTpl(
      `templates/${this.opts.init ? 'package.json' : '_package.json'}`,
      this.destinationPath('package.json'),
      {
        projectName: this.projectName,
        pageAuthor: answers.pageAuthor,
        platform: answers.platform,
        includeBabel: answers.includeBabel,
        includeBase64: answers.includeBase64,
        includeFontSpider: answers.includeFontSpider,
        preprocessor: answers.preprocessor,
        includeCompressJS: answers.includeCompressJS,
        includeRem: answers.includeRem,
        includeSprites: answers.includeSprites,
        includePolyfill: answers.includePolyfill
      }
    )
  }

  ZtGenerator.prototype._writingStyles = function () {
    const { answers, styleDir, styleExt, styleFile } = this

    const targetPath = `src/${styleDir}/${styleFile}`

    if (answers.includeSprites) {
      this.copyTpl(
        `templates/${this.cssSpriteTpl}`,
        this.destinationPath(`src/${styleDir}/${this.cssSpriteTpl}`)
      )

      this.fs.write(`src/${styleDir}/${this.cssSprite}`, '')
      this.mkdir('src/images/sprite')
    }

    this.copyTpl(
      'templates/style',
      this.destinationPath(targetPath), {
        isWap: answers.isWap,
        includeSprites: answers.includeSprites,
        preprocessor: answers.includeRem,
        styleExt: styleExt,
        styleFile: styleFile,
        includeRem: answers.includeRem,
        cssSprite: this.cssSprite
      }
    )

    let resetFile = 'reset_pc.css'
    if (this.isWap) {
      resetFile = this.isRem ? 'reset_rem.css' : answers.isVd ? 'reset_vd.css' : 'reset_wap.css'
    }

    this.copyTpl(
      `templates/${resetFile}`,
      this.destinationPath('src/css/reset.css')
    )
  }

  ZtGenerator.prototype._writingScripts = function () {
    this.fs.write(this.destinationPath('src/js/main.js'), '')
  }

  ZtGenerator.prototype._writingHtml = function () {
    const { answers } = this
    const htmlFile = answers.isWap ? 'index_wap.html' : 'index_pc.html'

    this.copyTpl(
      `templates/${htmlFile}`,
      this.destinationPath('src/index.html'),
      {
        website: answers.website,
        pageTitle: answers.pageTitle,
        websiteName: answers.websiteName,
        pageAuthor: answers.pageAuthor,
        pageDesigner: answers.pageDesigner,
        includeWx: answers.includeWx,
        brand: answers.brand || '',
        isRem: answers.isRem,
        isVd: answers.isVd,
        includeHeader: answers.includeHeader,
        includeFooter: answers.includeFooter,
        isCms: answers.isCms,
        svnPath: answers.svnPath
      }
    )
  }

  ZtGenerator.prototype._writingConfig = function () {
    const { answers } = this

    this.copyTpl(
      'templates/pc.config.js',
      this.destinationPath('pc.config.js'),
      {
        projectName: this.projectName,
        isWap: answers.isWap,
        includeSprites: answers.includeSprites,
        preprocessor: answers.preprocessor,
        website: answers.website,
        includeBase64: answers.includeBase64,
        cssSprite: this.cssSprite,
        cssSpriteTpl: this.cssSpriteTpl,
        styleDir: this.styleDir
      }
    )
  }

  ZtGenerator.prototype._writingBabelrc = function () {
    this.copyTpl(
      'templates/.babelrc',
      this.destinationPath('.babelrc'), {
        includePolyfill: this.answers.includePolyfill
      }
    )
  }

  ZtGenerator.prototype._writingMisc = function () {
    if (this.opts.init) {
      this.mkdir('zt')
    } else {
      this.mkdir(this.destinationPath('src'))
      this.mkdir(this.destinationPath('src/fonts'))
      this.mkdir(this.destinationPath('src/media'))
      this.mkdir(this.destinationPath('src/images'))
      this.mkdir(this.destinationPath('src/js'))
      this.mkdir(this.destinationPath('zip'))
    }
  }
}
