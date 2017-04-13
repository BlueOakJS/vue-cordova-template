var path = require('path')
var utils = require('./utils')
var webpack = require('webpack');
var vueLoaderConfig = require('./vue-loader.conf')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

function buildWebpackConfig(buildConfig, config) {
  return {
  entry: {
    app: './src/main.js'
  },
  output: {
      path: buildConfig.assetsRoot
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
      modules: [
        resolve('src'),
        resolve('node_modules')
      ],
    alias: {
      {{#if_eq build "standalone"}}
      'vue$': 'vue/dist/vue.esm.js',
      {{/if_eq}}
      '@': resolve('src')
    }
  },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"' + buildConfig.buildType + '"'
      })
    ],
  module: {
    rules: [
      {{#lint}}
      {
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [resolve('src'), resolve('test')],
        options: {
          formatter: require('eslint-friendly-formatter')
        }
      },
      {{/lint}}
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig(buildConfig)
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test')]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath(buildConfig, 'img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: '[name].[hash:7].[ext]',
          outputPath: utils.assetsPath(buildConfig, 'fonts/'),
          publicPath: buildConfig.buildType === 'production' ? '../fonts/' : utils.assetsPath(buildConfig, 'fonts/')
        }
      }
    ]
  }
}
}

module.exports = buildWebpackConfig;
