var gulp = require('gulp');
var config = require('../gulp.config.js');
var path = require('path');
var jasmine = require('gulp-jasmine');
var SpecReporter = require('jasmine-spec-reporter');
var istanbul = require('gulp-istanbul');

// Variable that gets updated on each run for coverage.
var coverageVariable;

// Setup Istanbul to report the code coverage.
gulp.task('test:unit:pre', function() {

  // Used to get around an issue with coverage values being cached.
  // https://github.com/SBoudrias/gulp-istanbul/issues/40
  coverageVariable = '$$cov_' + new Date().getTime() + '$$';

  return gulp.src([
      config.path.src,
      // Ignore the spec files in terms of code coverage.
      '!' + config.path.spec
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
      config.path.spec
    ])

    // Run the tests on the supplied files;
    .pipe(jasmine({
      reporter: new SpecReporter()
    }))

    // Write the code coverage reports
    .pipe(istanbul.writeReports({
      dir: path.join(__dirname, '../../dist/unit-test-coverage'),
      coverageVariable: coverageVariable
    }));

    // Enforce code coverage.
    // Todo enable this shortly, when we have code to test.
    /*
    .pipe(istanbul.enforceThresholds({
      thresholds: {
        global:90
      }
    }));*/
});
