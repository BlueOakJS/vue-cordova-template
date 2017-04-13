var utils = require('./utils')

function buildVueLoaderConfig(buildConfig) {
  return {
    loaders: utils.cssLoaders({
      sourceMap: buildConfig.cssSourceMap,
      extract: buildConfig.extractCss
    }),
    postcss: [
      require('autoprefixer')({
        browsers: ['last 2 versions']
      })
    ]
  }
}

module.exports = buildVueLoaderConfig;
