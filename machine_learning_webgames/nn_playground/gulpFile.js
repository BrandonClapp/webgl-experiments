'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var babel = require("gulp-babel");

/**
 * Copy html
 */
gulp.task('html', function () {
  return gulp.src([
      './dev/html/index.html'
    ])
    .pipe(gulp.dest('./build'));
});

/**
 * Copy third party javascript files
 */
gulp.task('scripts:thirdparty', function () {
  return gulp.src([
      './bower_components/bootstrap-sass/assets/javascripts/bootstrap.js',
      './bower_components/Chart.js/dist/Chart.js',
      './bower_components/pica/dist/pica.js',
      './bower_components/synaptic/dist/synaptic.js'
    ])
    .pipe(concat('thirdparty.js'))
    .pipe(gulp.dest('./build'));
});

/**
 * Copy scripts
 */
gulp.task('scripts', function () {
  return gulp.src([
      './dev/js/thirdparty/pica.js',
      './dev/js/paint.js',
      './dev/js/dataset.js',
      './dev/js/nn.js',
      './dev/js/app.js'
    ])
    .pipe(babel())
    .pipe(concat('app.js'))
    .pipe(gulp.dest('./build'));
});

/**
 * Sass tasks
 */
gulp.task('sass', function () {
  return gulp.src('./dev/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./build'));
});

gulp.task('default', function () {
  gulp.watch('./dev/scss/**/*.scss', ['sass']);
  gulp.watch('./dev/js/**/*.js', ['scripts']);
  gulp.watch('./dev/html/**/*.html', ['html']);
});
