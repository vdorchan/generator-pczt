function getSrc() {
  let _arg
  for (let i of process.argv) {
    let arg = i.match(/^-{2}(.*)$/)
    _arg = arg && arg[1]
  }
  return _arg
};

require('./zt/' + getSrc() + '/gulpfile.js')