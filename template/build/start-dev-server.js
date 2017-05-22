var opn = require('opn')
var path = require('path')
var express = require('express')
var webpack = require('webpack')
var proxyMiddleware = require('http-proxy-middleware')

module.exports = function startDevServer(webpackConfig, buildConfig, autoOpenBrowser) {
  // default port where dev server listens for incoming traffic
  var port = process.env.PORT || buildConfig.port
  // Define HTTP proxies to your custom API backend
  // https://github.com/chimurai/http-proxy-middleware
  var proxyTable = buildConfig.proxyTable

  var app = express()
  var compiler = webpack(webpackConfig)

  var devMiddleware = require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    quiet: true
	// Uncomment these lines to get verbose debuggin info about the build
    // noInfo: false,
    // stats: {maxModules: Infinity, exclude: undefined}
  })

  var hotMiddleware = require('webpack-hot-middleware')(compiler, {
    log: () => {}
  })
  // force page reload when html-webpack-plugin template changes
  compiler.plugin('compilation', function (compilation) {
    compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
      hotMiddleware.publish({ action: 'reload' })
      cb()
    })
  })

  // proxy api requests
  Object.keys(proxyTable).forEach(function (context) {
    var options = proxyTable[context]
    if (typeof options === 'string') {
      options = { target: options }
    }
    app.use(proxyMiddleware(options.filter || context, options))
  })

  // handle fallback for HTML5 history API
  app.use(require('connect-history-api-fallback')())

  // serve webpack bundle output
  app.use(devMiddleware)

  // enable hot-reload and state-preserving
  // compilation error display
  app.use(hotMiddleware)

  // serve pure static assets
  var staticPath = path.posix.join(buildConfig.assetsPublicPath, buildConfig.assetsSubDirectory)
  app.use(staticPath, express.static('./static'))

  // Serve cordova.js
  app.use('/cordova.js', express.static(path.join('./cordova/platforms', 'ios', 'www', 'cordova.js')));
  app.use('/cordova_plugins.js', express.static(path.join('./cordova/platforms', 'ios', 'www', 'cordova_plugins.js')));
  app.use('/plugins', express.static(path.join('./cordova/platforms', 'ios', 'www', 'plugins')));

  var uri = 'http://localhost:' + port

  devMiddleware.waitUntilValid(function () {
    console.log('> Listening at ' + uri + '\n')
  })

  return app.listen(port, function (err) {
    if (err) {
      console.log(err)
      return
    }

    // when env is testing, don't need open it
    if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
      opn(uri)
    }
  })
};
