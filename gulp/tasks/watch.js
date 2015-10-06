var gulp = require('gulp');
var config = require('../gulp.config.js');
var runSequence = require('run-sequence');

// Watch for changes to the tests and source.
gulp.task('watch', function (done) {

  // On unit test change just execute the unit tests.
  gulp.watch(config.path.spec, function() {
    runSequence(
      'build:development',
      'test:unit:once'
    );
  });

  // On integration test change just execute those tests again.
  gulp.watch(config.path.integrationSpec, function() {
    runSequence(
      'build:development',
      'test:integration:once'
    );
  });

  // On source change execute the whole build again.
  gulp.watch([
    config.path.src,
    '!' + config.path.spec
  ], function() {
    runSequence(
      'build:development',
      'test:unit:once',
      'test:integration:once'
    );
  })

});
