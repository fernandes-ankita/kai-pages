var gulp = require('gulp'),
    sass = require('gulp-sass'),
    prettify = require('gulp-jsbeautifier'),
    concat = require('gulp-concat'),
    htmlhint = require("gulp-htmlhint"),
    plumber = require('gulp-plumber'),
    notify = require('gulp-notify'),
    browserSync = require('browser-sync').create(),
    mkdirp = require("mkdirp"),
    Chance = require("chance"),
    data = require("gulp-data"),
    nunjucksRender = require('gulp-nunjucks-render'),
    clean = require('gulp-clean'),
    reload = browserSync.reload;

var chance = new Chance();

var onError = function(err) {
    notify.onError({
        title:    "Gulp",
        subtitle: "Failure!",
        message:  "Error: <%= error.message %>",
        sound:    "Beep"
    })(err);

    this.emit('end');
};

gulp.task('clean', function () {
  gulp.src('./deploy/**')
    .pipe(clean({force: true}));
});

gulp.task('compilescss', function () {
  gulp.src('scss/main.scss')
    .pipe(plumber({errorHandler: onError}))
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./deploy/dev/css/'));
});

gulp.task('nunjucks', function() {
  return gulp.src('project/pages/*.html')
        .pipe(data(function(){
          return {chance : chance}
        }))
        .pipe(nunjucksRender({
          path : ['project/templates']
        }))
        .pipe(prettify({indent_size: 2}))
        .pipe(gulp.dest('deploy/dev'))
});

function sanitizeFilePath(filepath){
  return filepath
          .replace('/scss/','')
          .replace('.scss','')
          .replace('.css','');
}

gulp.task('watch', function () {
  gulp.start(['nunjucks','compilescss']); 
  browserSync.init({
    server: {
      baseDir: ["./deploy/dev", "./bower_components", "./resources"]
    }
  });
  gulp.watch('./scss/**/*.scss', ['compilescss']);
  gulp.watch(['./project/pages/**/*.html','./project/**/*.html'], ['nunjucks']);
  gulp.watch(['./deploy/dev/*.html','./deploy/dev/css/*.css']).on("change", reload);
});
