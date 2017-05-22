/**
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
*/

var child_process = require('child_process');
var fs = require('fs');
var path = require('path');
var Q = require('q');
var which = require('which');
var iswin32 = 'win32' === process.platform;
var log = console.log;

function extend(dst, src) {
    for (var k in src) {
        dst[k] = src[k];
    }
    return dst;
}

// On Windows, spawn() for batch files requires absolute path & having the extension.
function resolveWindowsExe(cmd) {
    var winExtensions = ['.exe', '.cmd', '.bat', '.js', '.vbs'];
    function isValidExe(c) {
        return winExtensions.indexOf(path.extname(c).toLowerCase()) !== -1 && fs.existsSync(c);
    }
    if (isValidExe(cmd)) {
        return cmd;
    }
    try {
        cmd = which.sync(cmd);
    } catch (e) {
        // just ignore which's whining
    }
    if (!isValidExe(cmd)) {
        winExtensions.some(function(ext) {
            if (fs.existsSync(cmd + ext)) {
                cmd = cmd + ext;
                return true;
            }
        });
    }
    return cmd;
}

function maybeQuote(a) {
    if (a.indexOf(' ') != -1) {
        a = '"' + a + '"';
    }
    return a;
}

/**
 * A windows-compatible spawn method. Succeeds for child exit code === 0.
 * @param {string} cmd
 * @param {string[]} [args]
 * @param {opts} [opts]
 * @param {function} [callback] - standard Node callback, omit if you want to use a promise.
 * @returns {Q.promise|undefined} - returns a promise or undefined if a callback is passed.
 *
 * @typedef {Object} opts
 * @property {boolean} [printCommand=false] - Whether to log the command
 * @property {string} stdio -
 *     'default' is to capture output and returning it as a string to success (same as exec).
 *     'ignore' means don't bother capturing it.
 *     'inherit' means pipe the input & output. This is required for anything that prompts.
 * @property {object} env - Map of extra environment variables.
 * @property {string} cwd - Working directory for the command.
 */
exports.spawn = function(cmd, args, opts, callback) {
    var spawnOpts = {}
        ,d = Q.defer()
        ,callback = Array.prototype.slice.call(arguments, -1)[0]
    ;

    // if we have a callback we'll use that. Else we'll work with a Q.promise
    callback = 'function' === typeof callback ? callback : null;
    // if we got opts but no args
    if (!(args instanceof Array)) {
        if (typeof args === 'object') {
            opts = args; args = [];
        }
        args = [];
    }
    opts = opts || {};

    if (iswin32) {
        cmd = resolveWindowsExe(cmd);
        // If we couldn't find the file, likely we'll end up failing,
        // but for things like "del", cmd will do the trick.
        if (path.extname(cmd).toLowerCase() !== '.exe' && cmd.indexOf(' ') != -1) {
            // We need to use /s to ensure that spaces are parsed properly with cmd spawned content
            args = [['/s', '/c', '"'+[cmd].concat(args).map(function(a){if (/^[^"].* .*[^"]/.test(a)) return '"'+a+'"'; return a;}).join(" ")+'"'].join(" ")];
            cmd = 'cmd';
            spawnOpts.windowsVerbatimArguments = true;
        } else if (!fs.existsSync(cmd)) { // 'echo', 'dir', 'del', etc
            // We need to use /s to ensure that spaces are parsed properly with cmd spawned content
            args = ['/s', '/c', cmd].concat(args);
            cmd = 'cmd';
        } else if (path.extname(cmd).toLowerCase() === '.js') {
            args = [cmd].concat(args);
            cmd = 'node';
        }
        else if (path.extname(cmd) !== '.exe') { // *.js, *.bat, etc
            args = ['/c', cmd].concat(args);
            cmd = 'cmd';
        }
    }

    if (opts.stdio == 'ignore') {
        spawnOpts.stdio = 'ignore';
    } else if (opts.stdio == 'inherit') {
        spawnOpts.stdio = 'inherit';
    }
    if (opts.cwd) {
        spawnOpts.cwd = opts.cwd;
    }
    if (opts.env) {
        spawnOpts.env = extend(extend({}, process.env), opts.env);
    }

    if (opts.printCommand) {
        console.log('Running command: ' + maybeQuote(cmd) + ' ' + args.map(maybeQuote).join(' '));
    }

    var child = child_process.spawn(cmd, args, spawnOpts);
    var capturedOut = '';
    var capturedErr = '';

    if (child.stdout) {
        child.stdout.setEncoding('utf8');
        child.stdout.on('data', function(data) {
            capturedOut += data;
        });
    }
    if (child.stderr) {
        child.stderr.setEncoding('utf8');
        child.stderr.on('data', function(data) {
            capturedErr += data;
        });
    }

    child.on('close', whenDone);
    child.on('error', whenDone);

    function whenDone(arg) {
        child.removeListener('close', whenDone);
        child.removeListener('error', whenDone);
        var code = typeof arg == 'number' ? arg : arg && arg.code;

        if (code === 0) {
            d.resolve(capturedOut.trim());
        } else {
            var errMsg = cmd + ': Command failed with exit code ' + code;
            if (capturedErr) {
                errMsg += ' Error output:\n' + capturedErr.trim();
            }
            var err = new Error(errMsg);
            err.code = code;
            d.reject(err);
        }
    }

    return d.promise.nodeify(callback);
};
