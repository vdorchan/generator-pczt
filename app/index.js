/**
 * @author chenwudong(vdorchan@gmail.com)
 */
'use strict'
const Generator = require('yeoman-generator'),
  commandExists = require('command-exists').sync,
  chalk = require('chalk'),
  path = require('path'),
  fs = require('fs'),
  yosay = require('yosay')

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts)

    this.opts = opts

    console.log('appname::::',this.appname)

    this.appname = path.basename(this.destinationRoot())
  }

  initializing() {
    // console.log(this.opts);
  }

  prompting() {
    if (this.opts.init) {
      return this.prompt([{
        type: 'confirm',
        name: 'needNpmInstall',
        message: '你现在正在初始化专题目录,是否需要自动安装依赖？(可以跳过之后使用 cnpm 安装)',
        default: true
      }]).then(answers => {
        this.needNpmInstall = answers.needNpmInstall
      })
      return false
    }
    // 欢迎消息    
    this.log(yosay('一个专题脚手架生成器\n 更多的选项配置在 `.config.js`'))

    this.log(chalk.magenta('开始配置工作流:`'));

    const prompts = [{
      type: 'list',
      name: 'platform',
      message: '所属平台?',
      choices: [
        'PC (utf-8)',
        'PC (cms)',
        'WAP (rem)',
        'WAP (vd)',
        'WAP (两倍图)'
      ]
    }, {
      type: 'list',
      name: 'website',
      message: '所属网站?',
      choices: [
        {name: '电脑网', value: 'pconline-太平洋电脑'},
        {name: '汽车网', value: 'pcauto-太平洋汽车'},
        {name: '时尚网', value: 'pclady-太平洋时尚'},
        {name: '亲子网', value: 'pcbaby-太平洋亲子'},
        {name: '家居网', value: 'pchouse-太平洋家居'}
      ]
    }, {
      type: 'input',
      name: 'brand',
      message: '专题品牌？',
      default: '',
      when: answers => answers.website.indexOf('pcauto') !== -1
    }, {
      type: 'input',
      name: 'pageTitle',
      message: '页面标题？'
    }, {
      type: 'input',
      name: 'pageAuthor',
      message: '你的名字和地区？(zhangshuaige_gz)',
      default: 'none'
    }, {
      type: 'input',
      name: 'pageDesigner',
      message: '设计师的名字和地区？(liumenv_gz)',
      default: 'none'
    }, {
      type: 'checkbox',
      name: 'features',
      message: '需要哪些功能？(空格键选择)',
      choices: answers => {
        answers.isRem = answers.platform.indexOf('rem') !== -1
        answers.isVd = answers.platform.indexOf('vd') !== -1
        answers.isWap = answers.platform.indexOf('WAP') !== -1
        answers.isCms = answers.platform.indexOf('cms') !== -1

        const choices =  [{
          name: '开启：Sass        // 使用Sass预处理器',
          value: 'includeSass',
          checked: true
        },{
          name: '开启：UglifyJS    // 压缩 JS，去掉console语句',
          value: 'includeCompressJS',
          checked: true
        }]

        answers.isRem && choices.push({
          name: '开启：REM         // 自动将样式文件中的 rem 转为 px',
          value: 'includeRem',
          checked: true
        })
        choices.push({
          name: '开启：Babel       // 将 ES6 转为 ES5',
          value: 'includeBabel',
          checked: answers.isWap
        })
        answers.isWap && choices.push({
          name: '开启：微信分享      // 微信自定义内容分享',
          value: 'includeWx',
          checked: false
        })
        
        choices.push({
          name: '开启：font spider // 分析页面中文字体并进行压缩',
          value: 'includeFontSpider',
          checked: false
        })

        answers.isWap && choices.push({
          name: '开启：公共头部      // 网站公共 ssi 头部',
          value: 'includeHeader',
          checked: false
        })
        answers.isWap && choices.push({
          name: '开启：公共底部      // 网站公共 ssi 底部',
          value: 'includeFooter',
          checked: false
        })
        return choices
      }
    }, {
      type: 'list',
      name: 'includePolyfill',
      message: '是否需要babel-runtime？// 引入 profill 模块，转换 es6 的新 API',
      choices: [{
        name: '需要',
        value: true
      }, {
        name: '不需要',
        value: false
      }],
      default: false,
      when: answers => answers.features.indexOf('includeBabel') !== -1
    }, {
      type: 'list',
      name: 'picHandler',
      message: '使用哪种图片处理方式？',
      choices: [{
        name: '开启：Base64        // 将引用的小尺寸图片自动转换为 base64(适合 rem 使用)',
        value: 'includeBase64'
      }, {
        name: '开启：雪碧图         // 使用 gulp.spritesmit 生成雪碧图(适合 PC 端)',
        value: 'includeSprites'
      }, {
        name: '都不要'
      }],
      default: answers => answers.isRem ? 'includeBase64' : 'includeSprites'
    }]

    return this.prompt(prompts).then(answers => {
      for (let f of answers.features) {
        this[f] = true
      }

      answers[answers.picHandler] = true
      delete answers.features

      Object.assign(this, answers)

      console.log('answers:', answers);
      
      this.websiteName = this.website.split('-')[1]
      this.website = this.website.split('-')[0]
    })
  }
  
  writing() {
    if (!this.opts.init) {
      this._writingStyles()
      this._writingScripts()
      this._writingHtml()
      this._writingGulpfile()
      this._writingConfig()
      this.includeBabel && this._writingBabelrc()
    }
    this._writingMisc()
    this._writingPackageJSON()
  }

  _writingGulpfile() {
    this.fs.copyTpl(
      this.templatePath('_gulpfile.js'),
      this.destinationPath('gulpfile.js'),
      {
        includeSass: this.includeSass,
        includeRem: this.includeRem,
        includeBase64: this.includeBase64,
        includeCompressJS: this.includeCompressJS,
        includeBabel: this.includeBabel,
        includeFontSpider: this.includeFontSpider,
        includeSprites: this.includeSprites,
        includeBase64: this.includeBase64,
        includePolyfill: this.includePolyfill
      }
    )
  }

  _writingPackageJSON() {
    this.fs.copyTpl(
      this.templatePath(this.opts.init ? 'package.json' : '_package.json'),
      this.destinationPath('package.json'),
      {
        appname: this.appname,
        pageAuthor: this.pageAuthor,
        platform: this.platform,
        includeBabel: this.includeBabel,
        includeBase64: this.includeBase64,
        includeFontSpider: this.includeFontSpider,
        includeSass: this.includeSass,
        includeCompressJS: this.includeCompressJS,
        includeRem: this.includeRem,
        includeSprites: this.includeSprites,
        includeBase64: this.includeBase64,
        includePolyfill: this.includePolyfill
      }
    )
  }

  _writingStyles() {
    const styleFile = this.includeSass ? 'style.scss' : 'style.css',
      targetPath = this.includeSass ? 'src/sass/style.scss' : 'src/css/style.css'      

    this.fs.copyTpl(
      this.templatePath(styleFile),
      this.destinationPath(targetPath), {
        isWap: this.isWap,
        includeSprites: this.includeSprites
      }
    )

    let resetFile = 'reset_pc.css'
    if (this.isWap) {
      resetFile = this.isRem ? 'reset_rem.css' : this.isVd ? 'reset_vd.css' : 'reset_wap.css'
    }

    this.fs.copyTpl(
      this.templatePath(resetFile),
      this.destinationPath('src/css/reset.css')
    )
    
    if (this.includeSprites) {
      const cssTemplate = this.includeSass ? 'handlebarsStr.scss.handlebars' : 'handlebarsStr.css.handlebars',
        spriteCss = this.includeSass ? '_sprite.scss' : 'sprite.css',
        spriteCssPath = this.includeSass ? 'src/sass/_sprite.scss' : 'src/css/sprite.css'

      this.fs.copyTpl(
        this.templatePath(cssTemplate),
        this.destinationPath(cssTemplate)
      )
      
      this.fs.write(spriteCssPath, '')
    }

  }

  _writingScripts() {
    this.fs.write('src/js/main.js', '')
  }

  _writingHtml() {
    const htmlFile = this.isWap ? 'index_wap.html' : 'index_pc.html'

    this.fs.copyTpl(
      this.templatePath(htmlFile),
      this.destinationPath('src/index.html'),
      {
        website: this.website,
        pageTitle: this.pageTitle,
        websiteName: this.websiteName,
        pageAuthor: this.pageAuthor,
        pageDesigner: this.pageDesigner,
        includeWx: this.includeWx,
        brand: this.brand || '',
        isRem: this.isRem,
        isVd: this.isVd,
        includeHeader: this.includeHeader,
        includeFooter: this.includeFooter,
        isCms: this.isCms
      }
    )
  }

  _writingConfig() {
    this.fs.copyTpl(
      this.templatePath('config.js'),
      this.destinationPath('config.js'),
      {
        appname: this.appname,
        isWap: this.isWap,
        includeSprites: this.includeSprites,
        includeSass: this.includeSass,
        website: this.website
      }
    )
  }

  _writingBabelrc() {
    this.fs.copyTpl(
      this.templatePath('.babelrc'),
      this.destinationPath('.babelrc'),
      {
        includePolyfill: this.includePolyfill
      }
    )
  }

  _writingMisc() {
    if (this.opts.init) {
      fs.mkdirSync('zt')
    } else {
      fs.mkdirSync('src')
      fs.mkdirSync('src/fonts')
      fs.mkdirSync('src/media')
      fs.mkdirSync('src/images')
      fs.mkdirSync('src/js')
      fs.mkdirSync('zip')
    }
  }

  install() {
    if (!this.opts.init) {
      return false
    }
    // opts.skipInstall = !this.needNpmInstall
    this.options.skipInstall = !this.needNpmInstall
    const hasYarn = commandExists('yarn');
    this.installDependencies({
      npm: !hasYarn,
      bower: false,
      yarn: hasYarn,
      skipInstall: !this.needNpmInstall
    })
  }

  end() {
    if (this.opts.init) {
      this.log(chalk.green('专题目录初始化完毕'))
      if (!this.needNpmInstall) {
        this.log(chalk.green('使用 `npm install` 或 `cnpm install` 安装依赖))
      }
      this.log(chalk.green('在 zt 文件夹下新建专题，使用 `yo zt` 配置工作流'))
      return false
    }
    const gulpMsg = chalk.green(`
      执行 ${chalk.magenta('gulp serve')}  进行开发任务，浏览器自动刷新
      执行 ${chalk.magenta('gulp build')} or ${chalk.magenta('gulp')}  进行生产任务
      执行 ${chalk.magenta('gulp serve:dist')}  预览生产文件
      执行 ${chalk.magenta('gulp build:zip')}  进行生产任务,并打包
      执行 ${chalk.magenta('gulp zip')}  将生产任务产生的文件进行打包      
      执行 ${chalk.magenta('gulp www1')}  将压缩包上传   
    `)
    if (this.needNpmInstall) {
        this.log('工作流初始化完毕\n'+gulpMsg)
    } else {
      this.log(chalk.green('工作流初始化完毕, 请使用 `npm install` 或 `cnpm install` 安装依赖\n' + gulpMsg))
    }
  }


}