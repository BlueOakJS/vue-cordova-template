/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */

'use strict';

var path = require('path');
var fs = require('fs');
var plist = require('plist');

function setBundleId(cordovaDir, projectName, bundleId) {
	var filename = path.join(cordovaDir, 'platforms/ios', projectName, projectName + '-Info.plist');
	var data = plist.parse(fs.readFileSync(filename, 'utf-8'));
	data.CFBundleIdentifier = bundleId;
	fs.writeFileSync(filename, plist.build(data));
}


module.exports = setBundleId;
