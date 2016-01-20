/**
 * Created by Haizai on 2016/1/18.
 */

var mockServer = require('gulp-mock-server');

module.exports = function (gulp, $, settings) {
    gulp.task('mock', function() {
        gulp.src('.')
            .pipe(mockServer({
                livereload: false,
                directoryListing: true,
                port: 8090,
                open: true,
                mockDir:'./src/mockData'
            }));
    });
};
