var utils = require('./apputils');
utils.setDefaultEnv('production');
var build = require('./build');
var chalk = require('chalk')
var config = require('../config');
var buildConfig = config[utils.getEnv()].build;
var buildWebpackConfig = require('./webpack.' + buildConfig.buildType + '.conf');
var webpackConfig = buildWebpackConfig(buildConfig);

process.env.NODE_ENV = utils.getEnv();

build(buildConfig, webpackConfig).then(
  function() {
    console.log(chalk.cyan('  Build complete.\n'))
  }
);

