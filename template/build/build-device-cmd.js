var build = require('./build');
var path = require('path')
var chalk = require('chalk')
var utils = require('./apputils');
utils.setDefaultEnv('production');
var config = require('../config')
var cordovaBuildPrimitives = require('./withCordovaBuildPrimitives');

var buildConfig = config[utils.getEnv()].build;

process.env.NODE_ENV = utils.getEnv();

var buildWebpackConfig = require('./webpack.' + buildConfig.buildType + '.conf');
var webpackConfig = buildWebpackConfig(buildConfig);
webpackConfig.output.path = path.resolve(__dirname, '../cordova/www');

var cliOptions = utils.getCommandLineOptions();
var platform = cliOptions._[0];

var cordovaBuildFunction = platform == 'android' ? cordovaBuildPrimitives.buildCordovaAndroid : cordovaBuildPrimitives.buildCordovaIOS;

build(buildConfig, webpackConfig).then(
  cordovaBuildFunction.bind(null, buildConfig, config)
).then(
  function() {
    console.log(chalk.cyan('  Build complete.\n'));
  }
);
