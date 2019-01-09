const brands = require('./brand').filter(b => !b.disabled).map(b => b.title.replace(/^[A-Z]\s/, ''))

module.exports = function (ZtGenerator) {
  ZtGenerator.prototype.prompting = async function () {
    console.log('prompting')
    const { user } = this
    let prompts = []
    if (this.opts.init) {
      prompts = [{
        type: 'list',
        name: 'needDepsInstall',
        message: '你现在正在初始化专题目录,是否需要现在自动安装依赖？',
        choices: [{
          name: '安装依赖',
          value: true
        },
        {
          name: '取消',
          value: false
        }]
      }]
    } else {
      prompts = [{
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
          { name: '电脑网', value: 'pconline-太平洋电脑' },
          { name: '汽车网', value: 'pcauto-太平洋汽车' },
          { name: '时尚网', value: 'pclady-太平洋时尚' },
          { name: '亲子网', value: 'pcbaby-太平洋亲子' },
          { name: '家居网', value: 'pchouse-太平洋家居' }
        ]
      }, {
        type: 'input',
        name: 'svnPath',
        message: 'svn 路径？',
        default: ''
      }, {
        type: 'autocomplete',
        name: 'brand',
        message: '专题品牌？',
        default: '',
        source: (answers, input) => {
          input = input || ''
          return new Promise((resolve, reject) => {
            const fuzzyResult = this.filter(input, brands)
            resolve(
              fuzzyResult.map(el => el.original)
            )
          })
        },
        when: answers => answers.website.includes('pcauto')
      }, {
        type: 'input',
        name: 'pageTitle',
        message: '页面标题？'
      }, {
        type: 'input',
        name: 'pageAuthor',
        message: '你的名字和地区(zhangshuaige_gz)？',
        default: user.username && user.city ? `${user.username.replace(/\d/g, '')}_${user.city}` : 'none'
      }, {
        type: 'input',
        name: 'pageDesigner',
        message: '设计师的名字和地区(liumenv_gz)？',
        default: 'none'
      }, {
        type: 'list',
        name: 'preprocessor',
        message: '使用哪种 css 预处理器',
        choices: [
          { name: 'Sass', value: 'sass' },
          { name: 'Less', value: 'less' },
          { name: 'Stylus', value: 'stylus' },
          { name: '原生Css', value: 'css' }
        ]
      }, {
        type: 'checkbox',
        name: 'features',
        message: '需要哪些功能？(空格键选择)',
        choices: answers => {
          answers.isRem = answers.platform.indexOf('rem') !== -1
          answers.isVd = answers.platform.indexOf('vd') !== -1
          answers.isWap = answers.platform.indexOf('WAP') !== -1
          answers.isCms = answers.platform.indexOf('cms') !== -1

          const choices = [{
            name: '开启：UglifyJS    // 压缩 JS，去掉console语句',
            short: 'UglifyJS',
            value: 'includeCompressJS',
            checked: true
          }]

          answers.isRem && choices.push({
            name: '开启：REM         // 自动将样式文件中的 rem 转为 px',
            short: 'REM',
            value: 'includeRem',
            checked: true
          })
          choices.push({
            name: '开启：Babel       // 将 ES6 转为 ES5',
            short: 'Babel',
            value: 'includeBabel',
            checked: true
          })
          answers.isWap && choices.push({
            name: '开启：微信分享      // 微信自定义内容分享',
            short: '微信分享',
            value: 'includeWx',
            checked: false
          })

          choices.push({
            name: '开启：font spider // 分析页面中文字体并进行压缩',
            short: 'font spider',
            value: 'includeFontSpider',
            checked: false
          })

          answers.isWap && choices.push({
            name: '开启：公共头部      // 网站公共 ssi 头部',
            short: '公共头部',
            value: 'includeHeader',
            checked: false
          })
          answers.isWap && choices.push({
            name: '开启：公共底部      // 网站公共 ssi 底部',
            short: '公共底部',
            value: 'includeFooter',
            checked: false
          })
          return choices
        }
      }, {
        type: 'list',
        name: 'includePolyfill',
        message: '是否需要babel-runtime(引入 profill 模块，转换 es6 的新 API)?',
        short: '是否需要babel-runtime？',
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
          short: 'Base64',
          value: 'includeBase64'
        }, {
          name: '开启：雪碧图         // 使用 gulp.spritesmit 生成雪碧图(适合 PC 端)',
          short: '雪碧图',
          value: 'includeSprites'
        }, {
          name: '都不要'
        }],
        default: answers => answers.isRem ? 'includeBase64' : 'includeSprites'
      }]
    }

    const answers = await this.prompt(prompts)

    if (!this.opts.init) {
      const [website, websiteName] = answers.website.split('-')

      Object.assign(answers, { website, websiteName })

      for (let f of answers.features) {
        answers[f] = true
      }

      answers[answers.picHandler] = true

      const styleObj = {
        sass: ['sass', 'scss'],
        less: ['less', 'less'],
        stylus: ['sty', 'styl'],
        css: ['css', 'css']
      }

      const [styleDir, styleExt] = styleObj[answers.preprocessor]
      const styleFile = `style.${styleExt}`
      Object.assign(this, { styleDir, styleExt, styleFile })

      if (answers.includeSprites) {
        const { preprocessor } = answers
        this.cssSprite = `${preprocessor === 'css' ? 'sprite' : '_sprite'}.${styleExt}`
        this.cssSpriteTpl = `handlebarsStr.${styleExt}.handlebars`
      }
    }

    this.answers = answers
  }
}
