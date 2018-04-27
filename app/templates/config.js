module.exports = {
  // 资源路径
  paths: {
    src: 'src', // 工作目录
    dist: 'dist', // 生产目录
    tmp: '.tmp', // 临时目录
    zip: 'zip', // 压缩包放置目录
  },

  // 上传配置
  www1: {
    cwd: 'zip', // 上传文件的当前目录
    targetPath: '', // 命名格式： zt/gz20180101/bmw/
    site: '<%= website %>'
  },

  // 压缩包名
  zipname: '<% if(appname){ %><%= appname %><% }else{ %><%= dist %><% } %>.zip',

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
  }<% } %><% if(includeBase64) { %>,
    
  // base64转换配置
  base64Opts: {
    baseDir: 'src/images/',
    extensions: ['png'],
    maxImageSize: 20 * 1024
  }<% } %>
}