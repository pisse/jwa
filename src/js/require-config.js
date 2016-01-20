/*
 * requirejs配置
 *
 * 说明：requirejs整体使用配置，gulp构建时也是使用这份配置，保证了配置统一。
 * 
 */
// require.js config
var require = {
    baseUrl: "/src/js/",
    paths: {
        zepto: 'lib/zepto',
        mustache: '../../bower_components/mustache.js/mustache',
        highcharts: '../../bower_components/highcharts/highcharts',
        highchartsAdp: '../../bower_components/highcharts/adapters/standalone-framework',
        highchartsFunnel: '../../bower_components/highcharts/modules/funnel',
        // pcVersion: 'http://mba.jd.com/res/js/wirelessFilter',
        // pcVersion: './module/version',
        h5lock: 'H5lock'
    },
    shim: {
        'zepto': {
            exports: '$'
        },
        pcVersion: {
            deps: ['zepto'],
        },
        highcharts: {
            deps: ['highchartsAdp'],
            exports: 'Highcharts'
        },
        highchartsFunnel: {
            deps: ['highcharts'],
            exports: 'Highcharts'
        }
    }
};