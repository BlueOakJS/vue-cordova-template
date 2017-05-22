var path = require('path')
var utils = require('./utils')
var webpack = require('webpack')
var merge = require('webpack-merge')
var buildBaseWebpackConfig = require('./webpack.base.conf');
var CopyWebpackPlugin = require('copy-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
var HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');


function buildWebpackConfig(buildConfig) {
  var webpackConfig = merge(buildBaseWebpackConfig(buildConfig), {
  module: {
    rules: utils.styleLoaders({
        sourceMap: buildConfig.cssSourceMap,
      extract: true
    })
  },
    devtool: buildConfig.productionSourceMap ? '#source-map' : false,
  output: {
      filename: utils.assetsPath(buildConfig, 'js/[name].[chunkhash].js'),
      chunkFilename: utils.assetsPath(buildConfig, 'js/[id].[chunkhash].js'),
      publicPath: buildConfig.assetsPublicPath
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      sourceMap: true
    }),
    // extract css into its own file
    new ExtractTextPlugin({
        filename: utils.assetsPath(buildConfig, 'css/[name].[contenthash].css')
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        safe: true
      }
    }),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
        filename: buildConfig.index,
      template: 'index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    }),
    new HtmlWebpackIncludeAssetsPlugin({ assets: ['cordova.js'], append: false }),
    // split vendor js into its own file
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function (module, count) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, '../node_modules')
          ) === 0
        )
      }
    }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      chunks: ['vendor']
    }),
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

  if (buildConfig.productionGzip) {
  var CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
          buildConfig.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

  if (buildConfig.bundleAnalyzerReport) {
  var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

  return webpackConfig;
}

module.exports = buildWebpackConfig;

