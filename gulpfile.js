var gulp = require('gulp');
var runSequence = require('run-sequence');
var requireDir  = require('require-dir');

// Require all the tasks
requireDir('./gulp/tasks', {recurse: true});

// Package the files with unminified source.
// Watch for changes to the tests and files and run the appropriate command.
gulp.task('development', function (done) {
  runSequence(
    'clean',
    'build:development',
    'test:unit:once',
    'test:integration:once',
    'watch',
    done
  );
});

// Perform the release, with minified source output.
// Test coverage for integration tests will be unreadable.
gulp.task('release', function (done) {
  runSequence(
    'clean',
    'build:release',
    'test:unit:once',
    'test:integration:release',
    done
  );
});
