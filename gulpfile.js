const gulp = require('gulp');
const jshint = require('gulp-jshint');
const mocha = require('gulp-mocha');
const process = require('child_process');

gulp.task('test', () => {
  return gulp.src('test/*.js', { read: false })
    .pipe(mocha({ reporter: 'spec' }));
});

gulp.task('watch', () => {
  gulp.watch(['test/*.js', 'src/*.js'], () => {
    process.spawn('gulp', ['test'], { stdio: 'inherit' });
  });
});

gulp.task('lint', gulp.series('test', () => {
  return gulp.src(['**/*.js', '!node_modules/**/*'])
    .pipe(jshint({ node: true }))
    .pipe(jshint.reporter('default'));
}));

gulp.task('default', gulp.series('lint'));
