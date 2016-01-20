/*
 * 列表页图表(非核心图表) - 单柱状图
 * 
 * 说明：列表页中使用的图表，单柱状图表。主要用来展示非核心图表的数据。
 * 
 */

//非核心图表
define('./module/chart/column-single', ['zepto', 'highcharts', 'mustache', './config'], function($, Highcharts, Mustache, globalConf) {

    var Chart = function(config) {
        this._init(config)
    }

    //chart
    Chart.prototype = {
        node: null,
        config: null,
        columnConf: null,
        chartArr: [],
        winW: $(window).width(),
        _init: function(config) {
            var me = this;
            me.config = config;
            me.node = config.node;
            me._generateConfig();
            me._renderData();
            //show
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
                    margin: [0, 0, 0, 0],
                    marginTop: 20,
                },
                xAxis: [{
                    visible: false,
                }],
                yAxis: [{ // Primary yAxis
                    visible: false
                }, { // Secondary yAxis
                    visible: false,
                    gridLineWidth: 1,
                    title: {
                        text: ''
                    },
                    labels: {
                        enabled: false
                    },
                    opposite: true
                }],
                legend: {
                    y: -1
                },
                plotOptions: {
                    column: {
                        pointPadding: 0,
                        color: me._generateColumnGradient(1),
                        yAxis: 0,
                        groupPadding: 0.26,
                        borderWidth: 0
                    },
                    line: {
                        lineWidth: 1,
                        color: '#cbecfe',
                        shadow: {
                            color: '#31aefd',
                            width: 10,
                            offsetX: 0,
                            offsetY: 0,
                            opacity: 0.04
                        },
                        yAxis: 1,
                        marker: {
                            radius: 3,
                            lineWidth: 1,
                            lineColor: '#C9EBFE',
                            symbol: globalConf.imgObj.marker
                        }
                    }
                }
            }
            //deep copy
            var config = $.extend(true, {}, globalConf.chartConf);
            columnConf = $.extend(true, config, columnConf);
            me.columnConf = columnConf;
        },
        _renderData: function() {
            var me = this;
            //data
            var chartDataArr = [];
            var columnArr = [];
            var columnNum = 0, lineNum = 0;
            var colorSec = me._generateColumnGradient(0.3);
            //fun
            var callbackFun = function(obj){
                if(obj.type == 'pie'){
                    return;
                }
                if(obj.type == 'column'){
                    columnNum++;
                    columnArr.push(obj);
                    if(columnNum == 2){//tow columen
                        obj.color = colorSec;
                        me.columnConf.plotOptions.column.groupPadding = 0.08;
                    }
                }else{
                    chartDataArr.push(obj);
                }
                //check column|only line
                if(columnNum == 0){
                    me.columnConf.chart.margin = 20;
                }else{
                    me.columnConf.chart.margin = 0;
                }
                //data-length
                obj.data = me._cutlengthArray(obj.data);
            }
            //data
            globalConf.renderData(me.config.data, me.node, callbackFun);
            chartDataArr = columnArr.concat(chartDataArr);
            me.columnConf.series = chartDataArr;
            me.columnConf.chart.renderTo = me.node.find('.bd').get(0);
            var chart = new Highcharts.Chart(me.columnConf);
            me.chartArr.push(chart);
            //symbole
            // var offset = 2;
            // var len = chart.series.length-1;
            // var last = chart.series[len];
            // last.legendGroup.translate(last.legendGroup.translateX, last.legendGroup.translateY-offset);
        },
        _generateColumnGradient: function(opacity) {
            var me = this;
            var color = {
                linearGradient: {
                    x1: 0,
                    x2: 0,
                    y1: 0,
                    y2: 1
                },
                stops: [
                    // [0.5, 'red'],
                    [0, 'rgba(49, 110, 236,' + opacity + ')'],
                    [0.65, 'rgba(49, 110, 236, ' + opacity + ')'],
                    [1, 'rgba(49, 110, 236, ' + 0 + ')']
                ]
            }
            return color;
        },
        //reset array length
        _cutlengthArray: function(arr){
            var me = this;
            var len = arr.length;
            if(len>7 && len<24){
                arr = arr.slice(len-8, len-1);
            }
            if(len == 24){//实时数据
                var curHour = new Date().getHours();
                arr = arr.slice(curHour-6, curHour+1);
            }
            return arr;
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