
var path = require('path');
var utils = require('./utils');
var webpack = require('webpack');
var merge = require('webpack-merge');
var buildBaseWebpackConfig = require('./webpack.base.conf');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');

function buildWebpackConfig(buildConfig) {
  return merge(buildBaseWebpackConfig(buildConfig), {
  module: {
    rules: utils.styleLoaders({
        sourceMap: buildConfig.cssSourceMap
    })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: '#source-map',
  output: {
    filename: 'js/[name].js',
      publicPath: buildConfig.assetsPublicPath
  },
  plugins: [
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: buildConfig.index,
      template: 'index.html',
      inject: true,
    }),
    new HtmlWebpackIncludeAssetsPlugin({ assets: ['cordova.js'], append: false }),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
          to: buildConfig.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ]
})
}

module.exports = buildWebpackConfig;
