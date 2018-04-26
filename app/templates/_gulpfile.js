
const gulp = require('gulp'),
  browserSync = require('browser-sync'),
  del = require('del')<% if (includeRem) { %>,
  px2rem = require('postcss-px2rem')<% } %>,
  autoprefixer = require('autoprefixer'),
  conf = require('./config'),
  prompt  = require('prompt')

const $ = require('gulp-load-plugins')()

gulp.task(function styles() {
  return gulp.src([conf.paths.src + '/sass/*.scss', conf.paths.src + '/css/*.css'])
    .pipe($.sourcemaps.init())
    .pipe($.plumber())<% if (includeSass) { %>
    .pipe($.if('*.scss', $.sass()))<% } %>
    .pipe($.postcss([
      <% if (includeRem) { %>px2rem({ remUnit: conf.remUnit }),<% } %>
      autoprefixer
    ]))
    .pipe($.sourcemaps.write('../maps'))
    .pipe(gulp.dest(conf.paths.tmp + '/css'))
    .pipe(browserSync.stream())
})

gulp.task(function scripts() {
  return gulp.src(conf.paths.src + '/js/**/*.js')<% if(includeBabel) { %>
    .pipe($.cached('cacheScripts'))
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write('../maps'))<% } %>
    .pipe(gulp.dest(conf.paths.tmp + '/js'))
    .pipe(browserSync.stream())
})

gulp.task(function images() {
  return gulp.src(conf.paths.src + '/images/**/*.@(jpg|jpeg|gif|svg|jpg|png)')
    .pipe($.if(
        '*.png', 
        $.cache($.pngquant({ quality: conf.pngQuality })), 
        $.cache($.imagemin({ optimizationLevel: conf.imgQuality, progressive: true, interlaced: true }))))
    .pipe(gulp.dest(conf.paths.dist + '/images'))
})

gulp.task(function fonts() {
  return gulp.src(conf.paths.src + '/fonts/*.@(ttf|oft)')
    .pipe(gulp.dest(conf.paths.dist + '/fonts'))
})

gulp.task(function media() {
  return gulp.src(conf.paths.src + '/media/**/*')
    .pipe(gulp.dest(conf.paths.dist + '/media'))
})

gulp.task(function html() {
  return (
    gulp
      .src([conf.paths.tmp + '/!(maps)/*', conf.paths.src + '/!(sass|css|js)/**/*', conf.paths.src + '/**/*.html'])<% if(includeCompressJS) { %>
      .pipe($.if('*.js', $.uglify({
        // mangle: false,//类型：Boolean 默认：true 是否修改变量名
        // compress: true,//类型：Boolean 默认：true 是否完全压缩
        // comments : 'all' //保留所有注释
        compress: {
          drop_console: true // 去掉 console.* 语句
        }
      })))<% } %>
      .pipe($.if('*.css', $.cleanCss({ 
        advanced: false,
        keepSpecialComments: '*',
        rebase: false
      })))<% if(includeBase64) { %>
      .pipe($.if('*.css', $.base64(conf.base64Opts)))<% } %>
      .pipe($.if('*.css', $.cleanCss({ 
        advanced: false,
        keepSpecialComments: '*',
        rebase: false
      })))
      .pipe(gulp.dest(conf.paths.dist))<% if(includeFontSpider) { %>
      .pipe($.if('*.html', $.fontSpider({
        backup: false
      })))<% } %>
      .pipe($.if('*.html', $.replace(/(<html[^>]*>)/, `$1\n<!-- path: ${conf.paths.svn} -->`)))
      .pipe(browserSync.reload({ stream: true }))
  )
})

<% if(includeSprites) { %>
gulp.task(function sprites() {
  return gulp.src(conf.paths.src + '/images/sprite/**/*.png')
    .pipe($.spritesmith(conf.spriteOpts))
    .pipe($.if('*.png', gulp.dest(conf.paths.src + '/images')))
    .pipe($.if('*.<% if(includeSass) { %>scss<% } else { %>css<% } %>', gulp.dest(conf.paths.src + '/<% if(includeSass) { %>sass<% } else { %>css<% } %>')))
})<% } %>

gulp.task(function watch(cb) {
  gulp.watch(conf.paths.src + '/@(sass|css)/**/*', gulp.series('styles'))
  <% if(includeBabel) { %>gulp.watch(conf.paths.src + '/js/**/*', gulp.series('scripts')) <% } %>
  gulp.watch([conf.paths.src + '/**/*.html', conf.paths.src + '/images/**/*', conf.paths.src + '/fonts/**/*']).on('change', browserSync.reload)
  <% if(includeSprites) { %>gulp.watch(conf.paths.src + '/images/sprite/**/*.png', gulp.series('sprites')) ) <% } %>
  
  cb()
})

function _browserSyncInit(baseDir) {
  return function browserSyncInit() {
    browserSync.init({
      injectChanges: true, // 插入更改
      files: ['*.html', '*.css', '*.js'],
      server: {
        baseDir: baseDir
      },
      logPrefix: 'browserSync in gulp',
      open: true, //       自动打开浏览器
      port: 9000
    })
  }
}

gulp.task(function clean() {
  $.cache.clearAll()
  return del([conf.paths.tmp, conf.paths.dist])
})
  
gulp.task('serve', gulp.series(
  'clean'<% if(includeSprites) { %>,
  'sprites'<% } %>,
  gulp.parallel(
    // <% if(includeSass || includeRem) { %>styles<% } %><% if(includeSass || includeRem && includeBabel) { %>,<% } %>
    // <% if(includeBabel) { %>scripts<% } %>
    'styles',
    'scripts'
  ),
  'watch',
  _browserSyncInit([conf.paths.tmp, conf.paths.src])
))

gulp.task('build', gulp.series(
  'clean',
  gulp.parallel(
    'styles', 
    'scripts', 
    'fonts', 
    'images',
    'media'
  ),
  'html'
))

gulp.task('serve:dist', gulp.series(
  'build',
  _browserSyncInit(conf.paths.dist)
))

gulp.task('zip', () => {
  return gulp.src(conf.paths.dist + '/**/*')
    .pipe($.zip(conf.zipname))
    .pipe(gulp.dest(conf.paths.zip))
})

gulp.task('build:zip', gulp.series('build', 'zip'))

gulp.task('default', gulp.series('build'))

gulp.task(function www1(done) {
  prompt.start()

  return prompt.get({
    name: 'isUpload',
    description: `${conf.www1.username}, 你将上传 \n ${conf.zipname} 到 www1.${conf.www1.site}.com.cn/${conf.www1.targetPath.replace(/([^\/]$)/, '$1/')} \n 输入 y 确认操作，否则输入n `,
    type: 'string', 
    pattern: /^[y,n]$/,
    message: '请输入y或n',
    required: true,
    before: function(value) { return value === 'y'; }
  }, (err, res) => {
    if (res.isUpload) {
      console.log('开始上传');
      gulp.src(conf.paths.zip + '/' + conf.zipname)
      .pipe($.www1(conf.www1))
    } else {
      console.log('已取消上传操作！')
    }
    done()
  })
})