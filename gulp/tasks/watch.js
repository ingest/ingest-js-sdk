var gulp = require('gulp');
var config = require('../gulp.config.js');
var runSequence = require('run-sequence');

// Watch for changes to the tests and source.
gulp.task('watch', function (done) {

  // On integration test change just execute those tests again.
  gulp.watch(config.path.integrationSpec, function () {
    runSequence(
      'webpack:development',
      'karma:once'
    );
  });

  // On source change execute the whole build again.
  gulp.watch([
    config.path.src,
    '!' + config.path.spec
  ], function () {
    runSequence(
      'webpack:development',
      'karma:once'
    );
  });

});
