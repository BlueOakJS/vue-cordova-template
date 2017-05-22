/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

'use strict';

var utils = require('./apputils');
var spawn = require('superspawn').spawn;
var path = require('path');
var os = require('os');
var chalk = require('chalk');
var setBundleId = require('./setBundleId');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs-extra'));

function runPrepare(platform) {
	console.log(chalk.cyan('Launching cordova prepare...'));
	return spawn('cordova', ['prepare', platform], {
		printCommand: true,
		stdio: 'inherit',
		cwd: 'cordova'
	});
}


function buildCordovaAndroid(buildConfig, config) {
	if (buildConfig.buildType == 'production' && (!buildConfig.cordova.androidkeystorename || !buildConfig.cordova.androidkeyaliasname))
		console.log(chalk.red('WARNING: Android keystore not configured for release build.  Use yo blueoak:create-keystore to create and configure one.'));

	var keystorePassword = process.env.KEYSTORE_PASSWORD;
	var keyPassword = process.env.KEY_PASSWORD;
	var cliOptions = utils.getCommandLineOptions();
	if (cliOptions.storepass)
		keystorePassword = cliOptions.storepass;
	if (cliOptions.keypass)
		keyPassword = cliOptions.keypass;

	var sign = buildConfig.cordova.androidkeystorename && buildConfig.cordova.androidkeyaliasname;
	var release = buildConfig.buildType == 'production' || sign;

	if (sign) {
		var buildOptions = {
			android: {
			}
		};
		var buildSection = buildOptions.android[appBuildType(buildConfig.buildType)] = {};

		// Add all the options related to key signing to the array to be added to 'release-signing.properties'
		buildSection.keystore = buildConfig.cordova.androidkeystorename;
		buildSection.alias = buildConfig.cordova.androidkeyaliasname;
		buildSection.keystoreType = '';
		if (keystorePassword)
			buildSection.storePassword = keystorePassword;
		if (keyPassword)
			buildSection.password = keyPassword;

		// Write the build.json file
		fs.writeFileSync(path.join('cordova', 'build.json'), JSON.stringify(buildOptions));
	}

	return runPrepare('android').then(compileApp.bind(null, 'android', buildConfig, config)).then(
		function() {
			var filename;
			if (release) {
				if (sign)
					filename = 'android-release.apk';
				else
					filename = 'android-release-unsigned.apk';
			} else {
				filename = 'android-debug.apk';
			}

			var src = path.join('cordova/platforms/android/build/outputs/apk', filename);
			var dest = path.join('apk', filename);
			return fs.copyAsync(src, dest);
		}
	);
}


function appBuildType(buildType) {
	return buildType == 'production' ? 'release' : 'debug';
}

function buildCordovaIOS(buildConfig, config) {
	return runPrepare('ios').then(compileApp.bind(null, 'ios', buildConfig, config)).then(
		function() {
			if (utils.getCommandLineOptions().device) {
				var deviceFiles = fs.readdirSync(path.join('cordova/platforms/ios/build/device/'));
				var ipaFiles = deviceFiles.filter(function(file) {
					return /^.*\.ipa$/.test(file);
				});
				if (ipaFiles.length == 0) {
					console.log(chalk.red('ERROR: No IPA file in cordova/platforms/ios/build/device/'));
					return;
				}
				if (ipaFiles.length > 1) {
					console.log(chalk.red('ERROR: More than 1 IPA file in cordova/platforms/ios/build/device/'));
					return;
				}

				var src = path.join('cordova/platforms/ios/build/device/', ipaFiles[0]);

				var dest = path.join('ipa', config.cordova.name + '-' + appBuildType(buildConfig.buildType) + '.ipa');
				return fs.copyAsync(src, dest);
			}
		}
	);
}


function cordovaRun(platform, config) {
	console.log(chalk.cyan('Deploying and running app...'));

	if (platform == 'ios' && utils.getCommandLineOptions().device) {
		// Special case deploying to an iOS device.  We pass the -L switch to ios-deploy so that
		// lldb will exit after it launches the app.  If we don't do this, we can get zombie
		// lldbs running in the background, or the terminal detached from such that
		// CTRL-C doesn't work, which requires killall from another window to kill them.
		return spawn('ios-deploy', ['-L', '-b', path.join('cordova', 'platforms/ios/build/device', config.cordova.name) + ".app"], {
			printCommand: true,
			stdio: 'inherit'
		});
	}

	var device;
	if (utils.getCommandLineOptions().device)
		device = '--device';
	else
		device = '--emulator';

	return spawn('.' + path.sep + 'run', ['--nobuild', device], {
		printCommand: true,
		stdio: 'inherit',
		cwd: path.join('cordova/platforms', platform, 'cordova')
	});
}


function compileApp(platform, buildConfig, config) {
	if (platform == 'ios' && 'bundleId' in buildConfig.cordova)
		setBundleId('cordova', config.cordova.name, buildConfig.cordova.bundleId);

	var args = ['compile', platform, '--' + appBuildType(buildConfig.buildType)];

	var device;
	if (utils.getCommandLineOptions().device)
		device = '--device';
	else
		device = '--emulator';
	args.push(device);

	if (platform == 'ios') {
		var buildOptions = {
			ios: {
			}
		};
		var buildSection = buildOptions.ios[appBuildType(buildConfig.buildType)] = {};

		buildSection.codeSignIdentity = 'iPhone Developer';
		buildSection.packageType = buildConfig.cordova.packageType;
		buildSection.developmentTeam = buildConfig.cordova.developmentTeam;
		fs.writeFileSync(path.join('cordova', 'build.json'), JSON.stringify(buildOptions));
	}

	console.log(chalk.cyan('Building app...'));
	return spawn('cordova', args, {
		printCommand: true,
		stdio: 'inherit',
		cwd: 'cordova'
	});
}


module.exports = {
	buildCordovaIOS: buildCordovaIOS,
	buildCordovaAndroid: buildCordovaAndroid,
	runPrepare: runPrepare,
	runApp: cordovaRun,
	compileApp: compileApp
};
