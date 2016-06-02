/** Store all variables dedicated to Hobbiz Project */
var Hobbiz = {
    assetsAll: 'src/AppBundle/Resources/public/sass',
    cssWebPath: 'web/css',
    jsWebPath: 'web/js',
    bowerComponentsPath: 'app/Resources/Lib/**',
    cssVendor: [
        'app/resources/lib/bootstrap/dist/css/bootstrap.css'
    ],
    cssOrdered: [
        'src/AppBundle/Resources/public/sass/**/*.scss'
    ],
    jsVendorHeader: [
    ],
    jsVendorFooter: [
        'app/resources/lib/jquery/dist/jquery.js',
        'app/resources/lib/jquery-migrate/dist/jquery-migrate.js',
        'app/resources/lib/bootstrap/dist/js/bootstrap.js',
        'app/resources/lib/vue/dist/vue.js'
    ],
    jsOrdered: [
    ],
    parametersPath: 'app/config/parameters.yml'
};

/**
 * Gulp
 */

/** Import all gulp modules and isProduction argument (used via --env prod|dev) */
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    minifyCSS = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    shell = require('gulp-shell'),
    regex_replace = require('gulp-regex-replace'),
    gulpif = require('gulp-if'),
    plumber = require('gulp-plumber'),
    clean = require('gulp-clean'),
    yargv = require('yargs').argv,
    isProduction = yargv.env === 'prod',
    readYml = require('read-yaml'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    path       = require('path')
;

/**
 * Gulp Tasks
 */

/** Run assetic in quiet mode */
gulp.task('installAssets', shell.task([
    '/usr/bin/env php bin/console assets:install --symlink --env=dev --no-debug --quiet'
]));

gulp.task('bower:clean', function() {
    return gulp.src(Hobbiz.bowerWebPath)
        .pipe(clean());
});

gulp.task('bower', ['bower:clean'], function() {
    return gulp.src(Hobbiz.bowerLibs, {cwd : Hobbiz.bowerComponentsPath})
        .pipe(plumber())
        .pipe(gulp.dest(Hobbiz.bowerWebPath));
});

/** Replace @import in files then apply sass filter and minify CSS if we're running gulp with (--env prod) */
gulp.task('stylesheet:main', function() {
    var config = readYml.sync(Hobbiz.parametersPath);

    return gulp.src(Hobbiz.cssOrdered)
        .pipe(plumber())
        .pipe(sass())
        .pipe(gulpif(!isProduction, sourcemaps.init()))
        .pipe(concat('main.css'))
        //.pipe(regex_replace({regex: 'https://static.yoopies.com', replace: config.parameters.liip_assets}))
        .pipe(gulpif(isProduction, minifyCSS()))
        .pipe(gulpif(!isProduction, sourcemaps.write('./')))
        .pipe(gulp.dest(Hobbiz.cssWebPath))
        .on('end', function() {
            gutil.beep();
        })
    ;
});

gulp.task('stylesheet:vendor', function() {
    return gulp.src(Hobbiz.cssVendor)
        .pipe(plumber())
        .pipe(gulpif(!isProduction, sourcemaps.init()))
        .pipe(concat('vendor.css'))
        .pipe(gulpif(isProduction, minifyCSS()))
        .pipe(gulpif(!isProduction, sourcemaps.write('./')))
        .pipe(gulp.dest(Hobbiz.cssWebPath));
});

/** Minify JS if we're running gulp with (--env prod) */
gulp.task('javascript:main', jsGulpTask(Hobbiz.jsOrdered, 'main.js', Hobbiz.jsWebPath));

gulp.task('javascript:vendorHeader', jsGulpTask(Hobbiz.jsVendorHeader, 'vendor-header.js', Hobbiz.jsWebPath));

gulp.task('javascript:vendorFooter', jsGulpTask(Hobbiz.jsVendorFooter, 'vendor-footer.js', Hobbiz.jsWebPath));

/** Default task to run if we're running 'gulp' directly. Remember to use --env prod|dev to minify or not assets */
gulp.task('default', ['installAssets'], function() {
    gulp.start('stylesheet:main', 'stylesheet:vendor', 'javascript:main', 'javascript:vendorHeader', 'javascript:vendorFooter');
});

/** Watch task only to run in development mode instead of 'php app/console assetic:watch' */
gulp.task('watch', ['default'], function() {
    gulp.watch(Hobbiz.assetsAll+'/**/*', ['default']);
});

function jsGulpTask(src, fileName, dest) {
    return gulp.src(src)
        .pipe(plumber())
        .pipe(gulpif(!isProduction, sourcemaps.init()))
        .pipe(concat(fileName))
        .pipe(gulpif(isProduction, uglify()))
        .pipe(gulpif(!isProduction, sourcemaps.write('./')))
        .pipe(gulp.dest(dest));
}
