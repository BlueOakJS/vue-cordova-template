require('./check-versions')()

var ora = require('ora')
var rm = require('rimraf')
var path = require('path')
var chalk = require('chalk')
var webpack = require('webpack')
var config = require('../config')
var utils = require('../apputils');
var Promise = require('bluebird');
var webpackAsync = Promise.promisify(webpack);
var fs = Promise.promisifyAll(require('fs-extra'));

var webpackConfig;

function webpackBuild() {
  if (utils.getBuildType == 'debug')
    var spinner = ora('building for development...');
  else
    var spinner = ora('building for production...');

  spinner.start()

  return fs.removeAsync(path.join(config.build.assetsRoot, config.build.assetsSubDirectory)).then(
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

if (utils.getBuildType == 'debug') {
  process.env.NODE_ENV = 'development';
  webpackConfig = require('./webpack.dev.conf');
} else {
  process.env.NODE_ENV = 'production';
  webpackConfig = require('./webpack.prod.conf');
}

webpackConfig.output.path = path.resolve(__dirname, '../cordova/www');

var cliOptions = utils.getCommandLineOptions();
var platform = cliOptions._[0];

var cordovaBuildPromise;

var webpackBuildPromise = webpackBuild();

if (platform == 'android') {
  cordovaBuildPromise = webpackBuildPromise().then(
    function() {
      return builder.buildCordovaAndroid();
    }
  );
} else if (platform == 'ios') {
  cordovaBuildPromise = webpackBuildPromise().then(
    function() {
      return builder.buildCordovaIOS();
    }
  );
}

cordovaBuildPromise.then(
  function() {
    console.log(chalk.cyan('  Build complete.\n'));
  }
);
