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
    './bower_components/phaser/build/phaser.min.js',
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
    './dev/js/nn.js',
    './dev/js/states/boot.js',
    './dev/js/states/load.js',
    './dev/js/states/splash.js',
    './dev/js/states/play.js',
    './dev/js/game.js'
    ])
    .pipe(babel())
    .pipe(concat('game.js'))
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

/**
 * Assets tasks
 */
gulp.task('assets', function () {
  return gulp.src('./dev/assets/**/*')
    .pipe(gulp.dest('./build/assets/'));
});

gulp.task('default', function () {
  gulp.watch('./dev/scss/**/*.scss', ['sass']);
  gulp.watch('./dev/js/**/*.js', ['scripts']);
  gulp.watch('./dev/html/**/*.html', ['html']);
});
