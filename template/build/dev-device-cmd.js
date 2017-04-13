require('./check-versions')()

var path = require('path')
var utils = require('./apputils');
utils.setDefaultEnv('development');
var config = require('../config');
var buildConfig = config[utils.getEnv()].build;
var buildAndDeployShellApp = require('./buildAndDeployShellApp');
var HtmlWebpackAlterHtmlPlugin = require('html-webpack-alter-html-plugin');
var cordovaBrowserSync = require('cordova-browsersync-primitives');

process.env.NODE_ENV = utils.getEnv();

var buildWebpackConfig = require('./webpack.reload.conf');
var webpackConfig = buildWebpackConfig(buildConfig);

// Add the plugin to alter the CSP after the HTML is generated
webpackConfig.plugins.push(new HtmlWebpackAlterHtmlPlugin(cordovaBrowserSync.addCSPInMem));

var startDevServer = require('./start-dev-server')
startDevServer(webpackConfig, buildConfig, false);

var cliOptions = utils.getCommandLineOptions();
var platform = cliOptions._[0];

return buildAndDeployShellApp(buildConfig, config, platform);
