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
var webpackConfig = require('../../webpack.config.js');

// Build the development stack.
gulp.task('build:development', function (done) {

  webpack(webpackConfig, function (error, stats) {

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
  config.eslint.failOnError = true;

  return webpack(config, function (error, stats) {

    if (error) {
      throw new Error('Error with webpack : ', error);
    }

    done();

  });

});
