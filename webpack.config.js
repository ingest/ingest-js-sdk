var config = require('./gulp/gulp.config.js');
var path = require('path');
var _ = require('lodash');

// Base config for webpack.
module.exports = {
  devtool: 'source-map',
  entry: {
    ingest: './index.js'
  },
  output: {
    path: config.path.dist,
    filename: '[name].js',
    library: 'IngestAPI',
    libraryTarget: 'umd'
  },
  module: {
    preLoaders: [
      {
        test: /^((?!spec).)*\.js$/,
        loader: 'isparta-instrumenter-loader',
        exclude: [/node_modules/, /src\/vendor_components/]
      },
    ]
  },
  resolve: {
    alias: {
      pinkyswear: path.resolve(__dirname, 'node_modules/pinkyswear/pinkyswear.js'),
      extend: path.resolve(__dirname, 'node_modules/extend/index.js')
    }
  },
  target: 'web',
  watch: false
};
