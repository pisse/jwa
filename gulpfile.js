/**
 * gulp project generator
 *
 * @author  willHu
 * @date    2015-09-01
 * @contact email:huweiwei1@jd.com erp:huweiwei3 qq:226297845
 * 功能
 * 一、启动 gulp
 *      1. 编译 sass文件 (src目录下的 scss文件夹下的scss和component文件夹下的scss文件)
 *      2. 合并 生成的CSS文件
 *      3. 对JS文件 进行 jshint
 *      5. 开启browsersync，并监听css和js文件
 * 二、启动 gulp build
 *      1. 将img文件夹下的文件复制到dist目录
 *      2. 将html下的html文件复制到dist目录
 *      3. 将js和css文件按照规则合并压缩，复制到dist目录
 *      4. css和js生成版本
 *      5. 自动替换HTML中的引用css/js文件至最新版
 * 三、启动 gulp img
 *      1. 将src/img/sprite下的文件夹的png 拼接css sprite并输出sass文件(config.js中配置是否输出@2x)
 *      2. 压缩所有image
 * 四、启动 gulp run
 *      执行 gulp default相同任务，除去监听和自动刷新
 *
 * 五、启动 gulp build-ios
 *     1.首先执行了 gulp build，将源码压缩、编译至发布目录
 *     2.启动ios模拟器
 *     
 *  六、启动 gulp build-android
 *     1.首先执行了 gulp build，将源码压缩、编译至发布目录
 *     2.启动android模拟器
 *
 *  七、启动 gulp proxy
 *       将portal.m.jd.com中的url代理到本地的server中，即使用本地的localhost:3088来访问mba.jd.com
 *       
  *  八、启动 gulp proxy-mba
 *       将mba.jd.com中的url代理到本地的server中，即使用本地的localhost:3089来访问mba.jd.com，主要用来xhr请求时带入cookie
 *       
 *       
 * 
 */

'use strict';

/* global module */
var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var $ = gulpLoadPlugins({
    rename: {
        'gulp-html-replace': 'htmlreplace',
        'gulp-requirejs-optimize': 'requirejsOptimize'
    }
});

/* config */
var settings = require('./tasks/config')();


/* ========== tasks moudles ========== */
/* css tasks */
// sass
// command:  gulp sass
require('./tasks/sass')(gulp, $, settings);
// minify css
// command:  gulp minifycss
require('./tasks/minifycss')(gulp, $, settings);


/* javascript tasks */
// jshint
// command:  gulp jshint
require('./tasks/jshint')(gulp, $, settings);
// uglify js
// command:  gulp uglify
require('./tasks/uglify')(gulp, $, settings);

/* images tasks */
// sprite images
// command:  gulp sprite
require('./tasks/sprite')(gulp, $, settings);
// imagemin
// command:  gulp imagemin
require('./tasks/imagemin')(gulp, $, settings);

/* tools */
// command:  gulp cleanDist cleanDemo
require('./tasks/clean')(gulp, $, settings);
// command:  gulp clear-cache
require('./tasks/cache')(gulp, $, settings);
// browserSync
// command:  gulp browsersync
require('./tasks/browsersync')(gulp, $, settings);
// copy
require('./tasks/copy')(gulp, $, settings);
// usemin
require('./tasks/usemin')(gulp, $, settings);
//TODO sftp active mode have same bug to fixed
// sftp
// command:  gulp ftp
require('./tasks/ftp')(gulp, $, settings);

//mock data
//command: gulp mock
require('./tasks/mock')(gulp, $, settings);

// tasks
// imagemin&sprite
gulp.task('img', [
    'sprite',
    'imagemin'
]);
// just watch js & scss
gulp.task('watch', function() {
    gulp.watch(settings.srcPath + '/**/*.scss', ['sass']);
    gulp.watch([settings.srcPath + '/js/demo/*.js', settings.srcPath + '/component/**/*.js'], ['jshint']);
});
// watch & browsersunc
gulp.task('default', [
    'browsersync',
    'watch'
]);
// build sass, jshint
gulp.task('run', [
    'sass',
    'jshint'
]);

// build to dist
// gulp.task('build', ['cleanDist'], function() {
//     gulp.run('usemin');
//     gulp.run('imagemin');
// });
// // build without usemin
// gulp.task('build2', ['cleanDist'], function() {
//     gulp.run('minifycss','uglify','imagemin');
// });


// preview dist floder
//gulp.task('serve', [
//    'browsersync:dist'
//]);
//
//// clean demo
//gulp.task('clean-demo', [
//    'browsersync:dist'
//]);



//for this project config
//proxy
gulp.task('proxy', function() {
    //proxy
    var bs = require('browser-sync').create();
    bs.init({
        open: false,
        port: 3088,
        proxy: {
            target: "http://portal.m.jd.com",
            middleware: function(req, res, next) {
                res.setHeader('Access-Control-Allow-Origin', '*');
                next();
            }
        }
    });
});

gulp.task('proxy-mba', function() {
    //proxy
    var bs = require('browser-sync').create();
    bs.init({
        open: false,
        port: 3089,
        proxy: {
            target: "http://mba.jd.com",
            proxyRes: [
                function(res) {
                    res.headers["access-control-allow-origin"] = "http://mbatest.jd.com:3000";
                    res.headers["Access-Control-Allow-Credentials"] = true;
                }
            ]
        }
    });
});


//zepto concat/uglify
gulp.task('zeptofull-pre', function() {
    return gulp.src([
            '!./bower_components/zeptojs/src/zepto.js',
            './bower_components/zeptojs/src/*.js'
        ])
        .pipe($.concat('zepto.js'))
        .pipe(gulp.dest('./src/js/lib/'));
});
gulp.task('zeptofull', ['zeptofull-pre'], function() {
    return gulp.src([
            './bower_components/zeptojs/src/zepto.js',
            './src/js/lib/zepto.js'
        ])
        .pipe($.concat('zepto.js'))
        .pipe($.uglify())
        .pipe(gulp.dest('./src/js/lib/'));
});

//minify to dist
gulp.task('minify-css', function() {
    return gulp.src(settings.srcPath + '/css/' + '*.css')
        .pipe($.minifyCss())
        .pipe(gulp.dest(settings.distPath + '/css'));
});
gulp.task('uglify-js', function() {
    return gulp.src([
            settings.srcPath + '/js/lib/require.js'
        ])
        .pipe($.uglify())
        .pipe(gulp.dest(settings.distPath + '/js/lib'));
});

//copy files
gulp.task('copy-json', function() {
    return gulp.src(settings.srcPath + '/js/json/*.txt')
        .pipe(gulp.dest(settings.distPath + '/js/json/'));
});

//rjs
gulp.task('rjs', function() {
    return gulp.src([
            settings.srcPath + '/js/*.js',
            '!' + settings.srcPath + '/js/' + 'require-config.js'
        ])
        .pipe($.requirejsOptimize({
            mainConfigFile: settings.srcPath + '/js/require-config.js'
        }))
        .pipe(gulp.dest(settings.distPath + '/js'));
});

// gulp.task('rjs-commond', function() {
//     return gulp.src(
//             settings.srcPath + '/js/lib/common.js'
//         )
//         .pipe($.requirejsOptimize({
//             mainConfigFile: settings.srcPath + '/js/require-config.js'
//             // insertRequire: ['highcharts'],
//         }))
//         .pipe(gulp.dest(settings.srcPath + '/js'));
// });



var date = new Date().getTime();
//rjs-html
gulp.task('rjs-html', function() {
    gulp.src([
            settings.srcPath + '/html/**/' + '*.html'
        ])
        .pipe($.htmlreplace({
            js: {
                src: '../js',
                tpl: '<script src="../js/lib/require.js"></script>' +
                    '<script src="%s/%f.js?t='+date+'"></script>'
            },
            css: {
                src: '../css',
                tpl: '<link rel="stylesheet" href="%f.css?t='+date+'" />'
            }
        }))
        .pipe(gulp.dest(settings.distPath + '/html'));
});
//time-stamp
gulp.task('time-stamp', function() {
    gulp.src([
            settings.srcPath + '/html/**/' + '*.html'
        ])
        .pipe($.replace(/\.\..*.css/g, '$&?t=' + date))
        .pipe($.replace("../js/require-config.js", "../js/lib/require.js "))
        .pipe($.replace(/data-main="\w*\-?\w*/g, '$&.js?t=' + date))
        .pipe($.replace(/data-main="/g, 'src="../js/'))
        .pipe($.replace('src="../js/lib/require.js"', ''))
        .pipe(gulp.dest(settings.distPath + '/html'));
});


//clean
gulp.task('build-clean', function() {
    return gulp.src([
            settings.distPath + '/img',
            settings.distPath + '/css',
            settings.distPath + '/js',
            settings.distPath + '/html'
        ], {
            read: false
        })
        .pipe($.clean());
});


//build
gulp.task('build-rjs', function() {
    gulp.run('rjs');
    gulp.run('uglify-js');
    gulp.run('time-stamp');
});

gulp.task('build', ['build-clean'], function() {
    gulp.run('imagemin');
    gulp.run('minify-css');
    gulp.run('build-rjs');
    gulp.run('copy-json');
});

//run command
gulp.task('phonegap-ios', $.shell.task('phonegap run ios'));
gulp.task('phonegap-android', $.shell.task('phonegap run android'));

//run ios
gulp.task('build-ios', ['build'], function() {
    gulp.run('phonegap-ios');
});

//run android
gulp.task('build-android', ['build'], function() {
    gulp.run('phonegap-android');
});