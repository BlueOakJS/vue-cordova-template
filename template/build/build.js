require('./check-versions')()

var ora = require('ora')
var rm = require('rimraf')
var path = require('path')
var webpack = require('webpack')
var Promise = require('bluebird');
var rmAsync = Promise.promisify(rm);
var webpackAsync = Promise.promisify(webpack);


function build(buildConfig, webpackConfig) {
  var spinner = ora('building for ' + buildConfig.buildType + '...');
  spinner.start()

  return rmAsync(path.join(buildConfig.assetsRoot, buildConfig.assetsSubDirectory)).then(
    function() {
      return webpackAsync(webpackConfig)
    }
  ).then(
    function(stats) {
      spinner.stop();

      process.stdout.write(stats.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
      }) + '\n\n');
    },

    function(err) {
      spinner.stop();
      throw err;
    }
  );
}

module.exports = build;
