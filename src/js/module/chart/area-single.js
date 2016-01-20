/*
 * 列表页图表 - 单面积图
 * 
 * 说明：列表页中使用的图表，单面积图表
 *
 * PS：由于列表页暂无该类型数据，所以暂未接入数据来展示。
 * 
 */
define('./module/chart/area-single', ['highcharts', 'mustache', './config'], function(Highcharts, Mustache, globalConf) {

    var Chart = function(config) {
        this._init(config)
    }

    //chart
    Chart.prototype = {
        node: null,
        config: null,
        columnConf: null,
        markerConf: null,
        chartArr: [],
        winW: $(window).width(),
        _init: function(config) {
            var me = this;
            me.config = config;
            me._renderTpl();
            me._generateConfig();
            me._getData();
            //reset
            var container = config.container;
            container.append(me.node);
            setTimeout(function() {
                me.node.addClass('show');
            }, 50);
        },
        _bindHandler: function() {
            var me = this;
            me.node.on('click', function(e) {
                var id = $(this).attr('id');
                var aa = me.node.attr('id');
            });
        },
        _renderTpl: function() {
            var me = this;
            me.node = globalConf.chartStructTpl(me.config);
        },
        _renderTitle: function() {
            var me = this;
            var title = me.config.title ? me.config.title : 'DAU';
            var data = {
                title: title,
                trend: '日环比'
            }
            var tpl = globalConf.chartTitleTpl();
            //str
            var str = Mustache.render(tpl, data);
            me.node.find('.hd').html(str);
            me.node.find('.total').addClass('data-off');
        },
        _generateConfig: function() {
            var me = this;
            //resize
            var resizeObj = globalConf.chartResize();
            me.node.css('padding-top', resizeObj.percentStr);
            //column
            var columnConf = {
                chart: {
                    width: resizeObj.chartW,
                    height: resizeObj.chartH,
                    margin: 0
                },
                xAxis: [{
                    visible: false,
                }],
                yAxis: [{ // Primary yAxis
                    visible: false,
                    gridLineWidth: 0,
                    title: {
                        text: ''
                    },
                    labels: {
                        enabled: false
                    }
                }, { // Secondary yAxis
                    visible: false,
                    gridLineWidth: 0,
                    title: {
                        text: ''
                    },
                    labels: {
                        enabled: false
                    },
                    opposite: true
                }],
                legend: {
                    y: -2
                },
                plotOptions: {
                    areaspline: {
                        lineColor: '#316afd',
                        color: '#316AFD',
                        fillOpacity: 0.3,
                        yAxis: 0,
                        marker: {
                            enabled: false
                        }
                    }
                }
            }
            columnConf = $.extend(true, columnConf, globalConf.chartConf);
            me.columnConf = columnConf;

            //marker
            var markerConf = {
                enabled: true,
                symbol: globalConf.imgObj.marker
            }
            me.markerConf = markerConf;
        },
        //ajax getData
        _getData: function() {
            var me = this;
            // console.log('get data');
            //render
            me._renderData();
            me._bindHandler();
        },
        _renderData: function() {
            var me = this;
            var chartArr = [];
            // console.log('render data');
            //title
            me._renderTitle();
            //chart
            var markerPoint = {
                y: 80.3,
                marker: me.markerConf
            }
            var columnData = [{
                name: 'UV',
                type: 'areaspline',
                data: [39.9, 71.5, 36.4, 59.2, 94.0, 106.0, markerPoint, 85.6]
            }]
            me.columnConf.series = columnData;
            me.columnConf.chart.renderTo = me.node.find('.bd').get(0);
            var chart1 = new Highcharts.Chart(me.columnConf);
            chartArr.push(chart1);
            me.chartArr = chartArr;
        }

    }

    //method
    var chartFun = function(config) {
        var me = this;
        var item = $('#' + config.id);
        if (item.length > 0) {
            console.log('Error: repeat init chart');
            return;
        }
        //init
        var chart = new Chart(config);
        chart.node.data('chart', chart);
        return chart.chartArr;
    }

    //
    return chartFun;
});