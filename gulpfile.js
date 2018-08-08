const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync').create();
const runSequence = require('run-sequence');
const packageInfo = require('./package.json');
const wiredep = require('wiredep').stream;

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

const banner = [
  '/*!',
  ' * <%= package.name %>',
  ' * <%= package.title %>',
  ' * <%= package.url %>',
  ' * @author <%= package.author %>',
  ' * @version <%= package.version %>',
  ' * Copyright ' + new Date().getFullYear() + '. <%= package.license %> licensed.',
  ' */',
].join('\n');

gulp.task('images', () => {
  return gulp.src('src/images/**/*')
    .pipe($.cache($.imagemin()))
    .pipe(gulp.dest('app/assets/images'));
});

gulp.task('fonts', () => {
  return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function (err) { })
    .concat('src/fonts/**/*'))
    .pipe(gulp.dest('app/assets/fonts'));
});

gulp.task('icons', () => {
  return gulp.src('src/icons/**/*.svg')
    .pipe($.iconfont({
      fontHeight: 1001,
      normalize: true,
      fontName: packageInfo.icons.fontName, // required
      prependUnicode: true, // recommended option
      formats: ['ttf', 'eot', 'woff', 'woff2', 'svg'], // default, 'woff2' and 'svg' are available
      timestamp: Math.round(Date.now() / 1000), // recommended to get consistent builds when watching files
    }))
    .on('glyphs', function (glyphs, options) {
      const opts = {
        glyphs: glyphs.map(function (glyph) {
          return { name: glyph.name, codepoint: glyph.unicode[0].charCodeAt(0) };
        }),
        fontName: packageInfo.icons.fontName,
        className: packageInfo.icons.className
      };
      gulp.src('src/templates/helpers/icons-scss.njk')
        .pipe($.consolidate('lodash', opts))
        .pipe($.rename('_icons.scss'))
        .pipe(gulp.dest('src/styles/helpers'));

      gulp.src('src/templates/helpers/icons.njk')
        .pipe($.consolidate('lodash', opts))
        .pipe(gulp.dest('src/templates'));
    })
    .pipe(gulp.dest('src/fonts'));
});


gulp.task('styles', () => {
  return gulp.src('src/styles/*.scss')
    .pipe($.plumber())
    .pipe($.sass.sync({ outputStyle: 'expanded', precision: 10, includePaths: ['.'] }).on('error', $.sass.logError))
    .pipe($.autoprefixer({ browsers: ['> 0%'] }))
    .pipe($.header(banner, { package: packageInfo }))
    .pipe(gulp.dest('app/assets/styles'))
    .pipe(reload({
      stream: true
    }));
});

gulp.task('scripts', () => {
  return gulp.src('src/scripts/*.js')
    .pipe($.plumber())
    .pipe($.babel())
    .pipe($.header(banner, { package: packageInfo }))
    .pipe(gulp.dest('app/assets/scripts'))
    .pipe(browserSync.stream());
});

gulp.task('wiredep', () => {
  return gulp.src('src/templates/layouts/*.njk')
    .pipe($.plumber())
    .pipe(wiredep({
      exclude: [''],
      ignorePath: /^(\.\.\/)*\.\./,
      fileTypes: {
        njk: {
          block: /(([ \t]*)<!--\s*bower:*(\S*)\s*-->)(\n|\r|.)*?(<!--\s*endbower\s*-->)/gi,
          detect: {
            js: /<script.*src=['"]([^'"]+)/gi,
            css: /<link.*href=['"]([^'"]+)/gi
          },
          replace: {
            js: '<script src="{{filePath}}"></script>',
            css: '<link rel="stylesheet" href="{{filePath}}" />'
          }
        }
      }
    }))
    .pipe(gulp.dest('src/templates/layouts'));
});

gulp.task('views', () => {
  return gulp.src('src/templates/*.njk')
    .pipe($.plumber())
    .pipe($.nunjucksRender({ path: 'src/templates' }))
    .pipe(gulp.dest('app'))
    .pipe(browserSync.stream());
});

gulp.task('useref', ['views', 'styles', 'scripts'], () => {
  return gulp.src(['app/*.html'])
    .pipe($.useref({
      searchPath: ['./app', './', 'bower_components']
    }))
    .pipe($.if(/\.js$/, $.uglify({
    })))
    .pipe($.if(/\.css$/, $.cssnano({
      safe: true,
      autoprefixer: false
    })))
    .pipe(gulp.dest('dist'));
});

gulp.task('build', () => {
  runSequence(['wiredep'], [
    'useref', 'images', 'fonts'
  ], () => {
    return gulp.src([
      'app/**/*',
      '!app/*.html',
      '!app/**/*.js',
      '!app/**/*.css'
    ]).pipe($.size({
      title: 'build',
      gzip: true
    })).pipe(gulp.dest('dist'));
  });
});

gulp.task('serve', () => {
  runSequence(['wiredep'], [
    'views', 'styles', 'scripts', 'images', 'icons', 'fonts'
  ], () => {
    browserSync.init({
      notify: false,
      port: 8000,
      server: {
        baseDir: ['app', './']
      },
      routes: {
        '/bower_components': 'bower_components'
      }
    });
  });


  gulp.watch([
    'src/images/**/*'
  ]).on('change', reload);

  gulp.watch('src/**/*.{html,njk}', ['views']);
  gulp.watch('src/styles/**/*.scss', ['styles']);
  gulp.watch('src/scripts/**/*.js', ['scripts']);
  gulp.watch('src/fonts/**/*', ['fonts']);
  gulp.watch('src/icons/**/*', ['icons']);
  gulp.watch('src/images/**/*', ['images']);
  gulp.watch('bower.json', ['wiredep', 'fonts']);
});

gulp.task('default', ['serve']);
