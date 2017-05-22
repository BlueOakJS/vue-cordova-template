var utils = require('./utils')
var webpack = require('webpack')
var merge = require('webpack-merge')
var buildBaseWebpackConfig = require('./webpack.base.conf');
var HtmlWebpackPlugin = require('html-webpack-plugin')
var HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')


function buildWebpackConfig(buildConfig) {
  var baseWebpackConfig = buildBaseWebpackConfig(buildConfig);

  // add hot-reload related code to entry chunks
  Object.keys(baseWebpackConfig.entry).forEach(function (name) {
    baseWebpackConfig.entry[name] = ['./build/dev-client'].concat(baseWebpackConfig.entry[name])
  })

  var webpackConfig = merge(baseWebpackConfig, {
    output: {
      filename: '[name].js',
      publicPath: buildConfig.assetsPublicPath
    },
    module: {
      rules: utils.styleLoaders({
        sourceMap: buildConfig.cssSourceMap
      })
    },
    // cheap-module-eval-source-map is faster for development
    devtool: '#cheap-module-eval-source-map',
    plugins: [
      // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      // https://github.com/ampedandwired/html-webpack-plugin
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: 'index.html',
        inject: true
      }),
      new HtmlWebpackIncludeAssetsPlugin({ assets: ['cordova.js'], append: false }),
      new FriendlyErrorsPlugin()
    ]
  })
  return webpackConfig;
}

module.exports = buildWebpackConfig;

