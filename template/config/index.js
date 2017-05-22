// see http://vuejs-templates.github.io/webpack for documentation.
var path = require('path');
var defaultProdBuildConfig = require('./build-prod');
var defaultDevBuildConfig = require('./build-dev');

var utils = require('../build/apputils.js');

module.exports = {
    production: {
        env: require('./prod.env'),
        build: utils.getBuildType('production') == 'production' ? defaultProdBuildConfig : defaultDevBuildConfig
    },
    testing: {
        env: require('./prod.env'),
        build: utils.getBuildType('production') == 'production' ? defaultProdBuildConfig : defaultDevBuildConfig
    },
    development: {
        env: require('./dev.env'),
        build: Object.assign({}, utils.getBuildType('development') == 'production' ? defaultProdBuildConfig : defaultDevBuildConfig,
            {
                port: 8080,
                autoOpenBrowser: true,
                assetsSubDirectory: 'static',
                assetsPublicPath: '/',
                proxyTable: {},
                // CSS Sourcemaps off by default because relative paths are "buggy"
                // with this option, according to the CSS-Loader README
                // (https://github.com/webpack/css-loader#sourcemaps)
                // In our experience, they generally work as expected,
                // just be aware of this issue when enabling this option.
                cssSourceMap: true
            })
    },
    cordova: {
        name: 'test'
    }
}
