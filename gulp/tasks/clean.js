var gulp = require('gulp');
var config = require('../gulp.config.js');
var clean = require('gulp-clean');

// Clean up the dist folder.
gulp.task('clean', function () {
  return gulp.src(config.path.dist, {read: false})
    .pipe(clean());
});
