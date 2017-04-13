/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

'use strict';

var fs = require('fs');
var path = require('path');
var rm = require('rimraf');
var cordovaBrowserSync = require('cordova-browsersync-primitives');
var devip = require('dev-ip');
var Promise = require('bluebird');
var rmAsync = Promise.promisify(rm);
var cordovaBuildPrimitives = require('./withCordovaBuildPrimitives');

function buildAndDeployShellApp(buildConfig, config, platform) {
	return rmAsync(path.join('cordova/www')).then(
		function(delValue) {
			fs.mkdirSync(path.join('cordova/www'));

			var ipAddrs = {
				local: 'http://localhost:' + buildConfig.port
			}

			var ips = devip();
			if (ips.length)
				ipAddrs.external = 'http://' + ips[0] + ':' + buildConfig.port;

			cordovaBrowserSync.createIndexHtmlForWebpack(ipAddrs, path.join('cordova/www/index.html'));
			return cordovaBuildPrimitives.runPrepare(platform);
		}
	).then(
		function() {
			if (platform == 'ios')
				cordovaBrowserSync.fixATS('cordova', config.cordova.name);

            cordovaBrowserSync.updateConfigXml('cordova', platform, config.cordova.name, 'index.html');

			return cordovaBuildPrimitives.compileApp(platform, buildConfig, config);
		}
	).then(
		function() {
			return cordovaBuildPrimitives.runApp(platform, config);
		}
	).then(
		null,

		function(e) {
			console.log("error ", e, e.stack)
		}
	);
}


module.exports = buildAndDeployShellApp;
