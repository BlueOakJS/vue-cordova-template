/*
    Basic BDD testing of the superspawn module
 */

var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');
var assert = require('assert');
var Q = require('q');
var log = console.log;
var spawn = require(path.join(process.cwd(), 'lib/index.js')).spawn;
var iswin32 = 'win32' === process.platform;
var tempPath = path.join(process.cwd(), 'test/temp');


describe('Superspawn', function() {

    before(function(done) {
        fs.mkdir(tempPath, function(err) {
            done(err);
        });
    });

    it('should be able to start the node executable (.exe on Windows)', function() {
        var actual = spawn('node');
        actual.done();
    });

    it('should be able to start the npm executable (.cmd on Windows)', function() {
        var actual = spawn('npm');
        actual.done();
    });

    it('should be able to start a native executable (echo)', function() {
        var actual = spawn(
            'echo'
        );
        actual.done();
    });

    it('should be able to run a .js file', function() {
        var actual = spawn(
            path.join(process.cwd(), 'test/fixtures/env.js')
        );
        actual.done();
    });

    it('should return a promise', function() {
        var actual = spawn(
            'echo'
        );
        assert(Q.isPromise(actual));
        actual.done();
    });

    it('should execute a callback', function(done) {
        spawn(
            'echo'
            ,[]
            ,{}
            ,done
        );
    });

    it('should execute a callback at any position', function(done) {
        spawn(
            'echo'
            ,done
        );
    });

    it('should execute a callback', function(done) {
        spawn('echo', done);
    });

    it('should respect args', function(done) {
        // testing via fs, because we have not tested output capture yet.
        var newDir = path.join(tempPath, 'args');
        spawn(
            iswin32 ? 'md' : 'mkdir'
            ,[newDir]
            ,function(err) {
                if (err) throw err;
                fs.exists(newDir, function(exists) {
                    assert(exists);
                    done();
                });
            }
        );
    });

    it('should capture stdout', function(done) {
        var input = 'buffalo';
        spawn(
            'echo'
            ,[input]
            ,function(err, output) {
                assert.strictEqual(output, input);
                done();
            }
        );
    });

    it('should capture stderr', function(done) {
        spawn(
            iswin32 ? 'dir' : 'ls'
            ,['./i-dont-exist']
            ,function(err, output) {
                if (err) done();
            }
        );
    });

    it('should respect opts', function(done) {
        spawn(
            'echo'
            ,['silence']
            ,{stdio: 'ignore'} // safe for testing because it's simply passed on.
            ,function(err, output) {
                if (err) throw err;
                assert.strictEqual(output, '');
                done();
            }
        );
    });

    it('should accept opts without args', function(done) {
        spawn(
            iswin32 ? 'dir' : 'ls'
            ,{stdio: 'ignore'} // safe for testing because it's simply passed on.
            ,function(err, output) {
                if (err) throw err;
                assert.strictEqual(output, '');
                done();
            }
        );
    });

    it('should handle opts.env', function(done) {
        var input = 'potato';
        spawn(
            path.join(process.cwd(), 'test/fixtures/env.js')
            ,{env: {superspawn: input}} // safe for testing because it's simply passed on.
            ,function(err, output) {
                if (err) throw err;
                assert.strictEqual(output, input);
                done();
            }
        );
    });

    after(function(done) {
        // rm -rf tempPath
        rimraf(tempPath, done);
    });

});
