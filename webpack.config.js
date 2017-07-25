var path    = require('path');
var webpack = require('webpack');

var config = {
  devtool: 'source-map',
  entry: {
    ingest: './src/index.js'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'ingest-sdk.js',
    library: 'IngestSDK',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'eslint-loader',
      include: path.join(__dirname, 'src')
    }]
  },
  plugins: [
    // Enable scope hoisting.
    // For more information, see: https://medium.com/webpack/brief-introduction-to-scope-hoisting-in-webpack-8435084c171f
    new webpack.optimize.ModuleConcatenationPlugin()
  ]
};

// Transform the configuration in the case of a release build type.
if (process.env.BUILDTYPE === 'production') {
  // Enable minification with source mapping.
  // More options: https://webpack.js.org/plugins/uglifyjs-webpack-plugin/
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    sourceMap: true
  }))
}

module.exports = config;

