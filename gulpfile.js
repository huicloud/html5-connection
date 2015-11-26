'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var es = require('event-stream');
var babel = require('gulp-babel');
var del = require('del');

gulp.task('clean', function(cb) {
  del(['lib', 'dist'], cb);
});

gulp.task('babel', ['clean'], function () {
  return gulp.src('src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('lib'));
});

gulp.task('browserify', ['babel'], function () {
  bundle('./index.js', [], ['./lib/WebSocketConnection.js'])
    .pipe(rename('connection-http.js'))
    .pipe(gulp.dest('./dist/'))
    .pipe(rename({ extname: '.min.js' }))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/'))
    .on('error', gutil.log);

  bundle('./index.js', [], ['./lib/HttpConnection.js'])
    .pipe(rename('connection-ws.js'))
    .pipe(gulp.dest('./dist/'))
    .pipe(rename({ extname: '.min.js' }))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/'))
    .on('error', gutil.log);

  bundle('./index.js', [], [])
    .pipe(rename('connection.js'))
    .pipe(gulp.dest('./dist/'))
    .pipe(rename({ extname: '.min.js' }))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/'))
    .on('error', gutil.log);
});

function bundle(entires, externals, ignores, amdRequires) {
  var b = browserify({
    entries: entires,
    standalone: 'connection'
  });

  amdRequires = amdRequires || externals;

  b.external(externals);
  ignores.forEach(function(ignore) {
    b.ignore(ignore);
  });

  var output = '';
  return b.bundle()
    .pipe(es.through(function write(data) {
      output += data;
    }, function end() {

      // 添加amd依赖
      if (amdRequires) {
        output = output.replace(/define\(\[\],f\)/, 'define(' + JSON.stringify(amdRequires) + ',f)');
      }
      this.emit('data', output);
      this.emit('end');
    }))
    .pipe(source('bundle.js'))
    .pipe(buffer());
}

gulp.task('default', ['browserify']);