/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

'use strict';

var yargs = require('yargs');
var chalk = require('chalk');

var argv;
var _defaultEnv;

function getCommandLineOptions() {
	if (!argv) {
		argv = yargs.options({
			'd': {
				default: _defaultEnv,
				requiresArg: true,
				type: 'string'
			},
			'production': {
				type: 'boolean'
			},
			'development': {
				type: 'boolean'
			},
			'device': {
				type: 'boolean'
			},
		}).argv;
	}

	if (argv.debug && argv.release) {
		console.log(chalk.red.bold('You can\'t specify both debug and release on the command line.'));
		throw new Error('You can\'t specify both debug and release on the command line.');
	}

	return argv;
}


function getEnv() {
	var argv = getCommandLineOptions();
	return argv.d;
}


function setDefaultEnv(defaultEnv) {
	_defaultEnv = defaultEnv;
}

function getBuildType(defaultType) {
	// Default to debug.
	var buildType = defaultType;

	// Allow overriding on the CLI.
	var argv = getCommandLineOptions();
	if (argv.release)
		buildType = 'production';
	if (argv.debug)
		buildType = 'development';

	return buildType;
}


exports.getCommandLineOptions = getCommandLineOptions;
exports.setDefaultEnv = setDefaultEnv;
exports.getEnv = getEnv;
exports.getBuildType = getBuildType;
