/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

'use strict';

var fs = require('fs');
var path = require('path');
var procSpawn = require('./bundled/node_modules/superspawn').spawn;


module.exports.installCordova = function(data, {chalk, logger, files}) {
	var cordovaDir = path.join('cordova');

	logger.log(chalk.yellow('Adding Cordova environments: ' + data.name + ' : ' + data.cordovaPackageName));

	var theProcess = procSpawn('cordova', ['create', 'cordova', data.cordovaPackageName, data.name], {
		printCommand: true,
		stdio: 'inherit'
	});
	return theProcess.then(
		function() {
			fs.writeFileSync('cordova/www/.gitkeep', '');

			if (data.isCordovaIOS) {
				logger.log(chalk.yellow('Adding IOS Cordova environment'));

				return procSpawn('cordova', ['platform', 'add', 'ios', '--save'], {
					cwd: cordovaDir,
					printCommand: true,
					stdio: 'inherit'
				});
			}
		},

		function(err) {
			logger.fatal(chalk.red.bold('Cordova create error: ' + err));
		}
	).then(
		function() {
			if (data.isCordovaIOS) {
				fs.writeFileSync('cordova/platforms/ios/www/.gitkeep', '');
			}

			if (data.isCordovaAndroid) {
				logger.log(chalk.yellow('Adding Android Cordova environment'));

				return procSpawn('cordova', ['platform', 'add', 'android', '--save'], {
					cwd: cordovaDir,
					printCommand: true,
					stdio: 'inherit'
				});
			}
		},

		function(err) {
			logger.fatal(chalk.red.bold('Cordova add ios error: ' + err));
		}
	).then(
		function() {
			if (data.isCordovaAndroid) {
				fs.writeFileSync('cordova/platforms/android/assets/.gitkeep', '');
			}

			logger.log(chalk.yellow('Adding Cordova splashscreen plugin'));
			return procSpawn('cordova', ['plugin', 'add', 'cordova-plugin-splashscreen', '--save'], {
				cwd: cordovaDir,
				printCommand: true,
				stdio: 'inherit'
			});
		},

		function(err) {
			logger.fatal(chalk.red.bold('Cordova add android error: ' + err));
		}
	).then(
		null,

		function(err) {
			logger.fatal(chalk.red.bold('Cordova add splashscreen plugin error: ' + err));
		}
	);
};
