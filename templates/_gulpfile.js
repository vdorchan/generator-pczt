
const gulp = require('gulp')
const browserSync = require('browser-sync')
const del = require('del')<% if (includeRem) { %>
const px2rem = require('postcss-px2rem')<% } %>
const autoprefixer = require('autoprefixer')
const conf = require('./pc.config')

const $ = require('gulp-load-plugins')()

gulp.task(function styles () {
  return gulp.src([conf.paths.src + '/<%= styleDir %>/*.<%= styleExt %>', conf.paths.src + '/css/*.css'])
    .pipe($.sourcemaps.init())
<% if(preprocessor !== 'css') { _%>
    .pipe($.if('*.<%= styleExt %>', $.<%= preprocessor %>().on('error', err => console.error(err)))
<% } _%>
    .pipe($.postcss([
      <% if (includeRem) { %>px2rem({ remUnit: conf.remUnit }),<% } %>
      autoprefixer
    ]))
    .pipe($.sourcemaps.write('../maps'))
    .pipe(gulp.dest(conf.paths.tmp + '/css'))
    .pipe(browserSync.stream())
})

gulp.task(function scripts () {
  return gulp.src(conf.paths.src + '/js/**/*.js')<% if(includeBabel) { %>
    .pipe($.cached('cacheScripts'))
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write('../maps'))<% } %>
    .pipe(gulp.dest(conf.paths.tmp + '/js'))
    .pipe(browserSync.stream())
})

gulp.task(function images () {
  return gulp.src(conf.paths.src + '/images/**/*.@(jpg|jpeg|gif|svg|jpg|png)')
    .pipe($.cache($.imagemin(
      [imageminPngquant({ quality: conf.pngQuality })],
      { progressive: true, interlaced: true, verbose: true }))
    )
    .pipe(gulp.dest(conf.paths.dist + '/images'))
})

gulp.task(function fonts () {
  return gulp.src(conf.paths.src + '/fonts/*.@(ttf|oft)')
    .pipe(gulp.dest(conf.paths.dist + '/fonts'))
})

gulp.task(function media () {
  return gulp.src(conf.paths.src + '/media/**/*')
    .pipe(gulp.dest(conf.paths.dist + '/media'))
})

gulp.task(function html () {
  return (
    gulp
      .src([conf.paths.tmp + '/!(maps)/*', conf.paths.src + '/!(<%= styleDir %>|css|js)/**/*', conf.paths.src + '/**/*.html'])<% if(includeCompressJS) { %>
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
        rebase: false<% if(!isWap) { %>,
        compatibility: 'ie7'
        <% } %>
      })))<% if(includeBase64) { %>
      .pipe($.if('*.css', $.base64(conf.base64Opts)))<% } %>
      .pipe(gulp.dest(conf.paths.dist))<% if(includeFontSpider) { %>
      .pipe($.if('*.html', $.fontSpider({
        backup: false
      })))<% } %>
      .pipe(browserSync.reload({ stream: true }))
  )
})
<% if(includeSprites) { %>
gulp.task(function sprites () {
  return gulp.src(conf.paths.src + '/images/sprite/**/*.png')
    .pipe($.spritesmith(conf.spriteOpts))
    .pipe($.if('*.png', gulp.dest(conf.paths.src + '/images')))
    .pipe($.if('*.<%= styleExt %>', gulp.dest(conf.paths.src + '/<%= styleDir %>')))
})

<% } %>gulp.task(function watch (cb) {
  gulp.watch(conf.paths.src + '/@(<%= styleDir %>|css)/**/*', gulp.series('styles'))
  gulp.watch(conf.paths.src + '/js/**/*', gulp.series('scripts'))
  gulp.watch([conf.paths.src + '/**/*.html', conf.paths.src + '/images/**/*', conf.paths.src + '/fonts/**/*']).on('change', browserSync.reload)
<% if(includeSprites) { _%>
  gulp.watch(conf.paths.src + '/images/sprite/**/*.png', gulp.series('sprites'))
<% } %>
  cb()
})

function _browserSyncInit (baseDir) {
  return function browserSyncInit () {
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

gulp.task(function clean () {
  $.cache.clearAll()
  return del([conf.paths.tmp, conf.paths.dist])
})

gulp.task('serve', gulp.series(
  'clean'<% if(includeSprites) { %>,
  'sprites'<% } %>,
  gulp.parallel(
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

gulp.task(function www1 (done) {
  return gulp.src(`${conf.paths.zip}/${conf.zipname}`)
    .pipe($.www1(conf.www1))
})
