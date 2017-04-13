require('./check-versions')()

var utils = require('./apputils');
utils.setDefaultEnv('development');
var config = require('../config')
var buildConfig = config[utils.getEnv()].build;
var buildWebpackConfig = require('./webpack.' + buildConfig.buildType + '.conf');
var webpackConfig = buildWebpackConfig(buildConfig);

process.env.NODE_ENV = utils.getEnv();

var buildWebpackConfig = require('./webpack.reload.conf');
var webpackConfig = buildWebpackConfig(buildConfig);

// automatically open browser, if not set will be false
var autoOpenBrowser = !!buildConfig.autoOpenBrowser

var startDevServer = require('./start-dev-server')

module.exports = startDevServer(webpackConfig, buildConfig, autoOpenBrowser);
