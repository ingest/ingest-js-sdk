var gulp = require('gulp');
var config = require('../gulp.config.js');
var eslint = require('gulp-eslint');

gulp.task('lint', function () {

  return gulp.src(['src/**/*.js', '!integration-tests/**/*.js', '!node_modules/**'])
    // Lint the files.
    .pipe(eslint())
    // Output the results to the console.
    .pipe(eslint.format())
    // Fail the build if an error is found.
    .pipe(eslint.failAfterError());
});
