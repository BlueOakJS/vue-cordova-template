/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

'use strict';

var fs = require('fs');
var path = require('path');
var Table = require('cli-table');
var chalk = require('chalk');
var execSync = require('child_process').execSync;


function breakLinesAtLF(buf) {
	var ret = [];

	while (buf.length) {
		var indexOfLF = buf.indexOf("\n");
		if (indexOfLF == -1) {
			ret.push(buf);
			break;
		} else {
			ret.push(buf.substring(0, indexOfLF));
			buf = buf.substring(indexOfLF + 1);
		}
	}

	return ret;
}

function getInstalledProvisioningProfiles() {
	var base = path.join(process.env.HOME, 'Library/MobileDevice/Provisioning Profiles/');

	var byUUID = {};
	var byName = {};
	// Iterate over the provisioning profile directory
	fs.readdirSync(base).forEach(function(file) {
		var filePath = path.join(base, file);

		if (file.indexOf('.mobileprovision') != -1) {
			var outputString;
			try {
				// Explicitly specify stdio option so that stderr isn't output to the screen.  This is to
				// hide when PlistBuddy returns an error when TeamName isn't in the provisioning profile.
				var child = execSync('/usr/libexec/PlistBuddy -c Print:Name -c Print:UUID -c Print:TeamIdentifier:0 -c Print:TeamName /dev/stdin <<< `security cms -D -i \'' + filePath + '\'`', {
					stdio: 'pipe'
				});
				outputString = child.toString();
			} catch (err) {
				// In some cases, provisioning profiles don't have the team name embedded in them.  Catch this.
				outputString = err.stdout.toString();
			}
			var lines = breakLinesAtLF(outputString);
			var name = lines[0];
			var uuid = lines[1];
			byUUID[uuid] = {
				name: name,
				teamName: lines[3] || '',
				teamID: lines[2]
			}
			byName[name] = byName[name] ? byName[name].concat([uuid]) : [uuid];
		}
	});

	return {
		byUUID: byUUID,
		byName: byName
	};
}

function listProvisioningProfiles() {
	var profiles = getInstalledProvisioningProfiles();

	var table = new Table({
		head: ['UUID', 'Profile name', 'Team name', 'Team ID']
	});

	for (var uuid in profiles.byUUID) {
		table.push([uuid, profiles.byUUID[uuid].name, profiles.byUUID[uuid].teamName, profiles.byUUID[uuid].teamID]);
	}

	console.log(chalk.green('Installed provisioning profiles'));
	console.log(table.toString());
}

listProvisioningProfiles();
