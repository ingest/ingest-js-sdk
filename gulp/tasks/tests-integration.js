var gulp = require('gulp');
var config = require('../gulp.config.js');
var path = require('path');
var KarmaServer = require('karma').Server;

// Task for JS Integration tests.
gulp.task('test:integration:once', function (done) {
  new KarmaServer({
    configFile: config.path.karma,
    singleRun: true
  }, done).start();
});

// Task for JS Integration tests.
gulp.task('test:integration:release', function (done) {
  new KarmaServer({
    configFile: config.path.karma,
    singleRun: true,
    // Remove code coverage for the release test.
    reporters: [
      'spec'
    ]
  }, done).start();
});
