/**
 * browserSync
 *
 * @author  willHu
 * @date    2015-09-07
 * @contact email:huweiwei1@jd.com erp:huweiwei3 qq:226297845
 */

module.exports = function(gulp, $, settings) {
    var browserSync = require('browser-sync').create();
    var files = [
        settings.srcPath + '/**/*.css',
        settings.srcPath + '/**/*.js',
        settings.srcPath + '/**/*.html',
        settings.srcPath + '/**/*.json'
    ];
    gulp.task('browsersync', function() {
        //if (settings.server.proxy && settings.server.proxy !== '') {
        //    browserSync.init({
        //        proxy: settings.server.proxy,
        //        open: 'external',
        //        port: settings.server.port
        //    });
        //} else {
        //
        //}
        browserSync.init(files, {
            server: {
                baseDir: './'
            },
            browser: settings.browser,
            //Clicks, Scrolls & Form inputs on any device will be mirrored to all others.
            //if ghostMode is true
            ghostMode: false,
            startPath: 'src/html/index.html'
        });
    });
    gulp.task('browsersync:dist', function() {
        //if (settings.server.proxy && settings.server.proxy !== '') {
        //    browserSync.init({
        //        proxy: settings.server.proxy,
        //        open: 'external',
        //        port: settings.server.port
        //    });
        //} else {
        //
        //}
        browserSync.init(files, {
            server: {
                baseDir: './dist/'
            },
            browser: settings.browser
        });
    });
};