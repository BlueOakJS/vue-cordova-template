require('./check-versions')()

var path = require('path')
var config = require('../config')
var utils = require('../apputils');
var buildAndDeployShellApp = require('./buildAndDeployShellApp');
var HtmlWebpackAlterHtmlPlugin = require('html-webpack-alter-html-plugin');
var cordovaBrowserSync = require('cordova-browsersync-primitives');


process.env.NODE_ENV = 'development';
var webpackConfig = require('./webpack.dev.conf');

// Add the plugin to alter the CSP after the HTML is generated
webpackConfig.plugins.push(new HtmlWebpackAlterHtmlPlugin(cordovaBrowserSync.addCSPInMem));

var startDevServer = require('./start-dev-server')
startDevServer(webpackConfig, false);

var cliOptions = utils.getCommandLineOptions();
var platform = cliOptions._[0];

return startBrowserSyncForApp(platform,
                utils.getGeneratorConfig().cordovaProjectName,
                config.dev.port,
                this.runPrepare,
                this.compileApp,
                this.runApp);
