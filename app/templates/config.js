module.exports = {
  // 资源路径
  paths: {
    src: 'src',
    dist: 'dist',
    tmp: '.tmp',
    zip: 'zip'
  },

  // 上传配置
  www1: {
    cwd: 'zip',
    username: '',
    password: '',
    targetPath: '',
    site: '<%= website %>'
  },

  // 压缩包名
  zipname: ('<%= appname %>' || 'dist') + '.zip',

  // rem转换比例
  remUnit: 100,

  // 图片压缩质量
  imgQuality: 5,

  // png压缩质量
  pngQuality: '65-80',

  // 运行的浏览器平台
  browserslist: [
    "last 2 versions"<% if(isWap) { %>,
    "Android >= 4.0",
    "iOS >= 7"<% } else { %>,
    "ie 7"<% } %>
  ]<% if(includeSprites) { %>,

  // 雪碧图配置
  spriteOpts: {
    imgName: 'sprite.png',
    cssName: '<% if(includeSass) { %>_sprite.scss<% } else { %>sprite.css<% } %>',
    cssTemplate: '<% if(includeSass) { %>handlebarsStr.scss.handlebars<% } else { %>handlebarsStr.css.handlebars<% } %>'
  }<% } %><% if(includeSprites) { %>,
    
  // base64转换配置
  base64Opts: {
    baseDir: conf.paths.src + '/images/',
    extensions: ['png'],
    maxImageSize: 20 * 1024
  }<% } %>
}