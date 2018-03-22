const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync').create();
const runSequence = require('run-sequence');
const packageInfo = require('./package.json');

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

const banner = [
  '/*!\n' + ' * <%= package.name %>\n' + ' * <%= package.title %>\n' + ' * <%= package.url %>\n' + ' * @author <%= package.author %>\n' + ' * @version <%= package.version %>\n' + ' * Copyright ' + new Date().getFullYear() + '. <%= package.license %> licensed.\n' + ' */',
  '\n'
].join('');

gulp.task('styles', () => {
  return gulp.src('./src/styles/*.scss').pipe($.plumber()).pipe($.sass.sync({outputStyle: 'expanded', precision: 10, includePaths: ['.']}).on('error', $.sass.logError)).pipe($.autoprefixer({browsers: ['> 0%']})).pipe($.header(banner, {package: packageInfo})).pipe(gulp.dest('./app/assets/styles')).pipe($.cssnano()).pipe($.rename({suffix: '.min'})).pipe(gulp.dest('./app/assets/styles')).pipe(browserSync.stream());
});

gulp.task('bootstrap', () => {
  return gulp.src([
    './src/scripts/bootstrap/transition.js',
    './src/scripts/bootstrap/alert.js',
    './src/scripts/bootstrap/button.js',
    './src/scripts/bootstrap/carousel.js',
    './src/scripts/bootstrap/collapse.js',
    './src/scripts/bootstrap/dropdown.js',
    './src/scripts/bootstrap/modal.js',
    './src/scripts/bootstrap/tooltip.js',
    './src/scripts/bootstrap/popover.js',
    './src/scripts/bootstrap/scrollspy.js',
    './src/scripts/bootstrap/tab.js',
    './src/scripts/bootstrap/affix.js'
  ]).pipe($.plumber()).pipe($.header(banner, {package: packageInfo})).pipe($.concat('bootstrap.js')).pipe(gulp.dest('./app/assets/scripts')).pipe($.uglify()).pipe($.rename({suffix: '.min'})).pipe(gulp.dest('./app/assets/scripts')).pipe(browserSync.stream());
});

gulp.task('scripts', ['bootstrap'], () => {
  return gulp.src('./src/scripts/*.js').pipe($.plumber()).pipe($.babel({presets: ['es2015']})).pipe($.header(banner, {package: packageInfo})).pipe(gulp.dest('./app/assets/scripts')).pipe($.uglify()).pipe($.rename({suffix: '.min'})).pipe(gulp.dest('./app/assets/scripts')).pipe(browserSync.stream());
});

gulp.task('views', () => {
  return gulp.src('./src/templates/*.njk').pipe($.plumber()).pipe($.nunjucksRender({path: 'src/templates'})).pipe(gulp.dest('./app')).pipe(browserSync.stream());
});

gulp.task('views:reload', ['views']);

gulp.task('scripts:reload', ['scripts']);

gulp.task('styles:reload', ['styles']);

gulp.task('clean', () => {
  return gulp.src([
    './app/*.html', './app/assets/styles/*.css', './app/assets/scripts/*.js'
  ], {read: false}).pipe($.rimraf());
});

gulp.task('build', () => {
  runSequence(['views', 'styles', 'scripts']);
});

gulp.task('serve', () => {
  runSequence([
    'views', 'styles', 'scripts'
  ], () => {
    browserSync.init({
      notify: false,
      port: 8000,
      server: {
        baseDir: ['app']
      },
      routes: {
        '/bower_components': 'bower_components'
      }
    });

    gulp.watch('src/templates/**/*.njk', ['views:reload']);
    gulp.watch('src/styles/**/*.scss', ['styles:reload']);
    gulp.watch('src/scripts/**/*.js', ['scripts:reload']);
  });
});

gulp.task('default', ['serve']);
