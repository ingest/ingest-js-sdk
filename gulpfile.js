var gulp = require('gulp');
var path = require('path');
var clean = require('gulp-clean');

// Testing tools.
var jasmine = require('gulp-jasmine');
var SpecReporter = require('jasmine-spec-reporter');
var istanbul = require('gulp-istanbul');
var KarmaServer = require('karma').Server;

// Compilation tools.
var webpack = require('webpack');

// Variable that gets updated on each run for coverage.
var coverageVariable;

// Clean up the dist folder.
gulp.task('clean', function() {
  return gulp.src('dist', {read: false})
    .pipe(clean());
});

// Setup Istanbul to report the code coverage.
gulp.task('test:unit:pre', function() {

  // Used to get around an issue with coverage values being cached.
  // https://github.com/SBoudrias/gulp-istanbul/issues/40
  coverageVariable = '$$cov_' + new Date().getTime() + '$$';

  return gulp.src([
      path.join(__dirname, 'src/**/*.js'),
      '!' + path.join(__dirname, 'src/**/*.spec.js')
    ])
    // Covering files.
    .pipe(istanbul({
      coverageVariable: coverageVariable
    }))
    // force require to return covered files.
    .pipe(istanbul.hookRequire());
});

// Task for JS Unit tests.
gulp.task('test:unit:once', ['test:unit:pre'], function() {
  return gulp.src([
      path.join(__dirname, 'src/**/*spec.js')
    ])

    // Run the tests on the supplied files;
    .pipe(jasmine({
      reporter: new SpecReporter()
    }))

    // Write the code coverage reports
    .pipe(istanbul.writeReports({
      dir: path.join(__dirname, './dist/unit-test-coverage'),
      coverageVariable: coverageVariable
    }))

    // Enforce code coverage.
    // Todo enable this shortly, when we have code to test.
    /*
    .pipe(istanbul.enforceThresholds({
      thresholds: {
        global:90
      }
    }));*/
});

// Task for watching the unit tests an re-running the tests
gulp.task('test:unit:watch', ['test:unit:once'], function() {
  gulp.watch(path.join(__dirname, '/src/**/*.spec.js'), ['test:unit:once']);
});

// Task for JS Integration tests.
gulp.task('test:integration:once', function(done) {
  new KarmaServer({
    configFile: path.join(__dirname, '/karma.conf.js'),
    singleRun: true
  }, done).start();
});

// Task for testing active development.
gulp.task('test:integration:watch', function(done) {
   new KarmaServer({
    configFile: path.join(__dirname, '/karma.conf.js'),
    singleRun: false
  }, done).start();
});

// Build the development stack.
gulp.task('build:development', ['clean'], function(done) {

  webpack({
    devtool: 'source-map',
    entry: {
      ingest: './index.js'
    },
    output: {
      path: path.join(__dirname, 'dist'),
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
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: true
      })
    ],
    eslint: {
      failOnWarning: false
    },
    target: 'web',
    watch: false
  }, function(error, stats) {

      if (error) {
        throw new Error('Error with webpack : ', error);
      }

      done();
    });

});

// TODO Add release jobs.
// TODO Fix integration test coverage to work with source maps.
