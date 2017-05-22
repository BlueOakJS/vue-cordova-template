[![Build status (master)](http://b.adge.me/travis/MarcDiethelm/superspawn/master.svg)](https://travis-ci.org/MarcDiethelm/superspawn) &nbsp; ![npm version](http://b.adge.me/npm/v/superspawn.svg)

superspawn
==========

###### A Node.js spawn command that works on Windows too.

Original source from Apache Cordova's superspawn.js by Andrew Grieve. Requires Node.js 0.10+.

##### Windows extras
- Sets '/c' flag so files other than `.exe` can be run. Supported: `.exe, .cmd, .bat, .js, .vbs`
- Sets '/s' flags so commands (and paths) containing spaces or quotes are parsed correctly.

See [this Node bug](https://github.com/joyent/node/issues/2318).


## Install
```js
npm i --save superspawn
```

## Usage

Superspawn uses the same signature as the native child_process.spawn. But instead of a reference to the child process it returns a [Q.promise](https://github.com/kriskowal/q#readme) or `undefined` if a callback is passed.

### API
```js
var spawn = require('superspawn').spawn

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
spawn(cmd, args, opts, function(err, output) {
    if (err) return err;
});

// or

spawn(cmd, args, opts)
    .catch(function(err) {}) // rejectedHandler
    .then(function(stdout) {}) // resolvedHandler
;
```
### Examples
```js
spawn('echo', ['buffalo'], function(err, output) {
    if (err) return err;
    assert.equal(output, 'buffalo');
});

spawn('./script.sh', 'inherit', function(err) {
    if (err) return err;
});
```

## Todo
- [ ] Write tests
