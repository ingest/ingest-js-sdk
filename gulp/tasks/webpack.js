var gulp = require('gulp');
var config = require('../gulp.config.js');
var path = require('path');
var _ = require('lodash');
var webpack = require('webpack');
var path = require('path');

gulp.task('build:copy:vendor', function () {
  return gulp.src(config.vendor_scripts)
    .pipe(concat());
});

// Base config for webpack.
var webpackConfig = {
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
        test: /\.js$/,
        loader: 'eslint-loader',
        exclude: [
          '/node_modules/',
          '/src/vendor_components/'
        ]
      }
    ]
  },
  resolve: {
    alias: {
      pinkyswear: path.resolve(__dirname, '../../node_modules/pinkyswear/pinkyswear.js'),
      extend: path.resolve(__dirname, '../../node_modules/extend/index.js')
    }
  },
  eslint: {
    failOnWarning: false
  },
  target: 'web',
  watch: false
};

// Build the development stack.
gulp.task('build:development', function (done) {

  var config = _.clone(webpackConfig, true);

  config.eslint.failOnWarning = false;

  webpack(config, function (error, stats) {

    if (error) {
      throw new Error('Error with webpack : ', error);
    }

    done();
  });

});

// Release the package, minifiy the code.
gulp.task('build:release', function (done) {

  var config = _.clone(webpackConfig, true);

  config.plugins = [(
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true
    })
  )];

  config.eslint.failOnWarning = true;

  return webpack(config, function (error, stats) {

    if (error) {
      throw new Error('Error with webpack : ', error);
    }

    done();

  });

});
