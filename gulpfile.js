/** Store all variables dedicated to Hobbiz Project */
var Hobbiz = {
    assetsCore: 'src/Yoopies/CoreBundle/Resources/public',
    assetsAdmin: 'src/Yoopies/AdminBundle/Resources/public',
    assetsAll: 'src/Yoopies/*/Resources/public',
    cssWebPath: 'web/css',
    jsWebPath: 'web/js',
    bowerComponentsPath: 'bower_components/**',
    cssVendor: [
        'app/resources/lib/bootstrap/dist/css/bootstrap.min.css'
    ],
    jsVendorHead: [
        'bower_components/respond/dest/respond.min.js',
        'app/Resources/public/js/modernizr.js'
    ],
    jsVendor: [
    ],
    jsMain: [
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
    sourcemaps = require('gulp-sourcemaps');
    path       = require('path');

/**
 * Gulp Tasks
 */

/** Run assetic in quiet mode */
gulp.task('installAssets', shell.task([
    '/usr/bin/env php bin/console assets:install --symlink --env=dev --no-debug --quiet'
]));

gulp.task('bower:clean', function() {
    return gulp.src(Yoopies.bowerWebPath)
        .pipe(clean());
});

gulp.task('bower', ['bower:clean'], function() {
    return gulp.src(Yoopies.bowerLibs, {cwd : Yoopies.bowerComponentsPath})
        .pipe(plumber())
        .pipe(gulp.dest(Yoopies.bowerWebPath));
});

/** Replace @import in files then apply less filter and minify CSS if we're running gulp with (--env prod) */
gulp.task('stylesheet', function() {
    var config = readYml.sync(Yoopies.parametersPath);

    return gulp.src([
        Yoopies.cssWebPath+'/**/*.css',
        '!'+Yoopies.cssWebPath+'/vendor.css'
    ])
        .pipe(plumber())
        .pipe(regex_replace({regex: '@import "', replace: '@import "bower_components/bootstrap/less/'}))
        .pipe(regex_replace({regex: '@importGulpYoopies "', replace: '@import "src/Yoopies/CoreBundle/Resources/public/less/desktopv3/'}))
        .pipe(regex_replace({regex: '@importGulpBootstrap "', replace: '@import "bower_components/bootstrap/less/'}))
        .pipe(less())
        .pipe(regex_replace({regex: 'https://static.yoopies.com', replace: config.parameters.liip_assets}))
        .pipe(gulpif(isProduction, minifyCSS()))
        .pipe(gulp.dest(Yoopies.cssWebPath))
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

// gulp.task('stylesheet:vendor', function() {
//     return gulp.src(Hobbiz.sassVendor)
//         .pipe(plumber())
//         .pipe(sass({
//             paths: [ path.join(__dirname, 'sass', 'includes') ]
//         }))
//         .pipe(sass().on('error', sass.logError))
//         .pipe(gulpif(!isProduction, sourcemaps.init()))
//         .pipe(concat('vendor.css'))
//         .pipe(gulpif(isProduction, minifyCSS()))
//         .pipe(gulpif(!isProduction, sourcemaps.write('./')))
//         .pipe(gulp.dest(Hobbiz.cssWebPath));
// });

/** Minify JS if we're running gulp with (--env prod) */
gulp.task('javascript', function() {
    return gulp.src([
        Yoopies.jsWebPath+'/**/*.js',
        '!'+Yoopies.jsWebPath+'/vendor.js',
        '!'+Yoopies.jsWebPath+'/vendor-head.js',
        '!'+Yoopies.jsWebPath+'/main.js'
    ])
        .pipe(plumber())
        .pipe(gulpif(isProduction, uglify()))
        .pipe(gulp.dest(Yoopies.jsWebPath));
});

gulp.task('javascript:main', function() {
    return gulp.src(Yoopies.jsMain)
        .pipe(plumber())
        .pipe(gulpif(!isProduction, sourcemaps.init()))
        .pipe(concat('main.js'))
        .pipe(gulpif(isProduction, uglify()))
        .pipe(gulpif(!isProduction, sourcemaps.write('./')))
        .pipe(gulp.dest(Yoopies.jsWebPath));
});

gulp.task('javascript:vendor', function() {
    return gulp.src(Yoopies.jsVendor)
        .pipe(plumber())
        .pipe(gulpif(!isProduction, sourcemaps.init()))
        .pipe(concat('vendor.js'))
        .pipe(gulpif(isProduction, uglify()))
        .pipe(gulpif(!isProduction, sourcemaps.write('./')))
        .pipe(gulp.dest(Yoopies.jsWebPath));
});

gulp.task('javascript:vendorhead', function() {
    return gulp.src(Yoopies.jsVendorHead)
        .pipe(plumber())
        .pipe(gulpif(!isProduction, sourcemaps.init()))
        .pipe(concat('vendor-head.js'))
        .pipe(gulpif(isProduction, uglify()))
        .pipe(gulpif(!isProduction, sourcemaps.write('./')))
        .pipe(gulp.dest(Yoopies.jsWebPath));
});

/** Default task to run if we're running 'gulp' directly. Remember to use --env prod|dev to minify or not assets */
gulp.task('default', ['installAssets'], function() {
    // gulp.start('stylesheet', 'stylesheet:vendor', 'javascript', 'javascript:main', 'javascript:vendor', 'javascript:vendorhead');
    gulp.start('stylesheet:vendor');
});

/** Watch task only to run in development mode instead of 'php app/console assetic:watch' */
gulp.task('watch', ['default'], function() {
    gulp.watch(Yoopies.assetsAll+'/**/*', ['default']);
});
