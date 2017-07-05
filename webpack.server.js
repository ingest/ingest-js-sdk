var path             = require('path');
var webpack          = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config           = require('./webpack.config');
var DashboardPlugin  = require('webpack-dashboard/plugin');

config.plugins.unshift(new DashboardPlugin());

new WebpackDevServer(webpack(config), {
  https:              true,   // Enables HTTPS through self-signed certificate.
  compress:           true,   // Enables GZIP compression
  hot:                false,  // Hot module replacement
  historyApiFallback: true,   // Support html5 history api routers like ui-router
  noInfo:             false,
  quiet:              false,
  stats: {
    colors:           true
  },
  contentBase: [
    path.join(__dirname, 'dist'),
    path.join(__dirname, 'demo')
  ]
}).listen(9090, '0.0.0.0', function (err, result) {
  if (err) {
    console.log(err);
  }

  console.log('Listening at https://localhost:9090/');
});
