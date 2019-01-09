module.exports = function (Generator) {
  class ZtGenerator extends Generator {
    initializing () {
      console.log('initializing')
    }

    install () {
      console.log('install')
      this.installDependencies({
        skipInstall: !this.answers.needDepsInstall,
        installer: 'cnpm'
      })
    }

    end () {
      console.log('end')

      const { chalk } = this
      if (this.opts.init) {
        console.log(chalk.green('专题目录初始化完毕'))
        if (!this.answers.needDepsInstall) {
          console.log(chalk.green('使用 `npm install` 或 `cnpm install` 安装依赖'))
        }
        console.log(chalk.green(`进入 ${this.projectName}/zt 文件夹，并在 ${this.projectName}/zt 文件夹下新建专题，在专题目录下使用 \`pcfe create <projectName> zt\` 创建项目`))
        return false
      }
      const gulpMsg = chalk.green(`
进入 ${this.projectName} 文件夹
执行 ${chalk.magenta('gulp serve')}  进行开发任务，浏览器自动刷新
执行 ${chalk.magenta('gulp build')} or ${chalk.magenta('gulp')}  进行生产任务
执行 ${chalk.magenta('gulp serve:dist')}  预览生产文件
执行 ${chalk.magenta('gulp build:zip')}  进行生产任务,并打包
执行 ${chalk.magenta('gulp zip')}  将生产任务产生的文件进行打包      
执行 ${chalk.magenta('gulp www1')}  上传压缩包   
      `)
      console.log(`创建项目完毕\n${gulpMsg}`)
    }
  }

  require('./lib/prompt')(ZtGenerator)
  require('./lib/write')(ZtGenerator)

  return ZtGenerator
}
