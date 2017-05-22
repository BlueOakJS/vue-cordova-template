// see http://vuejs-templates.github.io/webpack for documentation.
var path = require('path')

module.exports = {
    index: path.resolve(__dirname, '../cordova/www/index.html'),
    assetsRoot: path.resolve(__dirname, '../cordova/www'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '',
    productionSourceMap: true,
    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],
    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report,
    buildType: 'prod',
    cssSourceMap: true,
    extractCss: true,
    cordova: {
        bundleId: 'com.company.test',
        packageType: 'enterprise',
        // packageType: 'app-store',
        // packageType: 'ad-hoc',
        // packageType: 'development',
        developmentTeam: 'teamID',
        androidkeystorename: '../test.keystore',
        androidkeyaliasname: 'nameofkey'
    }
}
