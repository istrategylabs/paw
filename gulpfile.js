'use strict';

const config         = require('./config').get();
const fs             = require('fs');
const path           = require('path');
const gulp           = require('gulp');
const gutil          = require('gulp-util');
const del            = require('del');
const browserSync    = require('browser-sync').create();
const autoprefixer   = require('autoprefixer');
const postcss        = require('gulp-postcss');
const sass           = require('gulp-sass');
const sourcemaps     = require('gulp-sourcemaps');
const nunjucksRender = require('gulp-nunjucks-render');
const source         = require('vinyl-source-stream');
const buffer         = require('vinyl-buffer');
const browserify     = require('browserify');
const envify         = require('envify/custom');
const rev            = require('gulp-rev');
const revReplace     = require('gulp-rev-replace');
const uglify         = require('gulp-uglify');
const cssnano        = require('gulp-cssnano');
const htmlmin        = require('gulp-htmlmin');
const gulpif         = require('gulp-if');
const critical       = require('critical').stream;
const runSequence    = require('run-sequence');
const nodemon        = require('gulp-nodemon');


function bundle(options) {
  options = options || {};
  const bundlerOpts = { entry: true, debug: true };
  let bundler = browserify(
    './client/src/js/client.js', bundlerOpts
    )
    .transform('aliasify', {
      global: true,
      aliases: {
        'underscore': 'lodash'
      }
    })
    .transform(envify(config))
    .transform('babelify', { presets: ['es2015'] })
    .transform('brfs');

  function rebundle() {
    return bundler.bundle()
      .on('error', function(err) {
        gutil.log(gutil.colors.red(err.message));
        this.emit('end');
      })
      .pipe(source('bundle.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('./public/js/'));
  }

  if (options.watch) {
    const watchify = require('watchify');
    bundler = watchify(bundler);
    bundler.on('update', () => {
      gutil.log('-> bundling...');
      rebundle();
    });
  }

  return rebundle();
}

gulp.task('browserify', () => {
  return bundle();
});

gulp.task('watchify', () => {
  return bundle({ watch: true });
});

gulp.task('sass', () => {
  return gulp.src('./client/src/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: [
        path.join(path.dirname(require.resolve('foundation-sites')), '../scss'),
        path.join(path.dirname(require.resolve('flickity')), '../css')
      ]
    }).on('error', sass.logError))
    .pipe(postcss([autoprefixer]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./public/css/'));
});

gulp.task('nunjucks', () => {
  nunjucksRender.nunjucks.configure(['./client/src/templates/'], { watch: false });
  return gulp.src(['./client/src/templates/**/*.html', '!**/_*'])
    .pipe(nunjucksRender())
    .pipe(gulp.dest('./public/'));
});

gulp.task('extras', () => {
  return gulp.src('./client/src/**/*.{txt,json,xml,jpeg,jpg,png,gif,svg}')
    .pipe(gulp.dest('./public/'));
});

gulp.task('watch', ['nunjucks', 'sass', 'extras', 'watchify'], (done) => {
  browserSync.init({
    files: './public/**/*',
    port: '9000',
    proxy: 'localhost:' + (process.env.PORT || 3000)
  });

  gulp.watch('./client/src/scss/**/*.scss', ['sass']);
  gulp.watch('./client/src/**/*.html', ['nunjucks']);
  gulp.watch('./client/src/**/*.{txt,json,xml,jpeg,jpg,png,gif,svg}', ['extras']);
  done();
});

gulp.task('start', ['watch'], () => {
  return nodemon({
    script: 'server.js',
    ext: 'js',
    watch: ['server.js', 'config.js', 'api/'],
    env: { 'NODE_ENV': 'development' }
  }).on('start', function() {
    setTimeout(function() {
      browserSync.reload();
    }, 500);
  });
});

gulp.task('rev', ['default'], () => {
  return gulp.src(['./public/**/*', '!**/*.html'], { base: './public' })
    .pipe(rev())
    .pipe(gulp.dest('./public/'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('./public/'));
});

gulp.task('rev:replace', ['rev'], () => {
  const manifest = gulp.src('./public/rev-manifest.json');
  return gulp.src('./public/**/*')
    .pipe(revReplace({ manifest: manifest }))
    .pipe(gulp.dest('./public/'));
});

gulp.task('minify', ['rev:replace', 'critical'], () => {
  return gulp.src(['./public/**/*'], { base: './public/' })
    // Only target the versioned files with the hash
    // Those files have a - and a 10 character string
    .pipe(gulpif(/-\w{10}\.js$/, uglify({
      preserveComments: 'license',
      compressor: {
        screw_ie8: true
      },
      output: {
        preamble: (function() {
          var banner = fs.readFileSync('banner.txt', 'utf8');
          banner = banner.replace('@date', (new Date()));
          return banner;
        }())
      }
    })))
    .pipe(gulpif(/-\w{10}\.css$/, cssnano()))
    .pipe(gulpif('*.html', htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    })))
    .pipe(gulp.dest('./public/'));
});

gulp.task('critical', ['rev:replace'], function() {
  return gulp.src('public/**/*.html')
  .pipe(critical({
    base: 'public/',
    inline: true
  }))
  .pipe(gulp.dest('public/'));
});

gulp.task('clean', () => {
  return del(['public/*', '!public/favicon*']);
});

gulp.task('default', ['browserify', 'nunjucks', 'sass', 'extras']);
gulp.task('prod', ['rev:replace', 'minify', 'critical']);

gulp.task('build-dev', (done) => {
  runSequence('clean',
              ['default', 'start'],
              done);
});

gulp.task('build', (done) => {
  runSequence('clean',
              ['default', 'prod'],
              done);
});
