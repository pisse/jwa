/*
 * 列表页图表 - 双面积图
 * 
 * 说明：列表页中使用的图表，双面积图表
 *
 * PS：由于列表页暂无该类型数据，所以暂未接入数据来展示。
 * 
 */
define('./module/chart/area-double', ['highcharts', 'mustache', './config'], function(Highcharts, Mustache, globalConf) {

    var Chart = function(config) {
        this._init(config)
    }

    //chart
    Chart.prototype = {
        node: null,
        config: null,
        chartConf: null,
        markerConf: null,
        areaAnotherConf: null,
        chartArr: [],
        winW: $(window).width(),
        _init: function(config) {
            var me = this;
            me.config = config;
            me._renderStruct();
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
        _renderStruct: function() {
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
            var chartConf = {
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
                }],
                legend: {
                    y: -2
                },
                plotOptions: {
                    area: {
                        color: '#264bab',
                        fillOpacity: 0.3,
                        lineColor: 'rgba(49,106,353, 0.1)',
                        yAxis: 0,
                        marker: {
                            enabled: false,
                            symbol: globalConf.imgObj.marker
                        }
                    }
                }
            }
            //config
            var config = $.extend(true, {}, globalConf.chartConf);
            chartConf = $.extend(true, config, chartConf);
            me.chartConf = chartConf;
            //marker
            var markerConf = {
                enabled: true
            }
            me.markerConf = markerConf;
            //areaAnother
            var areaAnotherConf = {
                fillOpacity: 0.2,
                lineColor: 'rgba(49,106,353,1)',
                color: '#316afd'
            }
            me.areaAnotherConf = areaAnotherConf;
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
                y: 60.3,
                marker: me.markerConf
            }
            var data = [{
                name: 'UV',
                type: 'area',
                // fillColor: 'rgba(255,0,0, 0,5)',
                data: [39.9, 71.5, 30.0, 86.0, 36.4, 60]
            },{
                name: '今日',
                type: 'area',
                // color: 'yellow',
                data: [70, 40, 60, 36.3, markerPoint, 96]
            }];
            //merge
            $.extend(true, data[1], me.areaAnotherConf);
            //data
            me.chartConf.series = data;
            me.chartConf.chart.renderTo = me.node.find('.bd').get(0);
            var chart1 = new Highcharts.Chart(me.chartConf);
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