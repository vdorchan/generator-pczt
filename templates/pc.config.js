module.exports = {
  // 资源路径
  paths: {
    src: 'src', // 开发目录
    dist: 'dist', // 生产目录
    tmp: '.tmp', // 临时目录
    zip: 'zip' // 压缩包放置目录
  },

  // 上传配置
  www1: {
    cwd: 'dist', // 上传文件的工作目录
    targetPath: '', // 路径格式： zt/gz20180101/bmw/
    site: '<%= website %>',
    ignore: [''] // 忽略上传的文件列表
  },

  // 压缩包名
  zipname: '<% if(projectName){ %><%= projectName %><% }else{ %><%= dist %><% } %>.zip',

  // rem转换比例
  remUnit: 100,

  // png压缩质量
  pngQuality: '100', // Type: string 0 - 100, 默认 100，无损压缩

  // 运行的浏览器平台
  browserslist: [
    'last 2 versions'<% if(isWap) { %>,
    'Android >= 4.0',
    'iOS >= 7'<% } else { %>,
    'ie 7'<% } %>
  ]<% if(includeSprites) { %>,

  // 雪碧图配置
  spriteOpts: {
    imgName: 'sprite.png',
    cssName: '<%= cssSprite %>',
    cssTemplate: 'src/<%= styleDir %>/<%= cssSpriteTpl %>'
  }<% } %><% if(includeBase64) { %>,

  // base64转换配置
  base64Opts: {
    baseDir: 'src/images/',
    extensions: ['png'],
    maxImageSize: 20 * 1024
  }<% } %>
}