/*
 * 列表页图表 - 阶梯型
 * 
 * 说明：列表页中使用的图表，阶梯图表。
 *
 * PS：由于列表页暂无该类型数据，所以暂未接入数据来展示。
 */
//面积-阶梯型
define('./module/chart/area-ladder', ['zepto', 'highcharts', 'mustache', './config'], function($, Highcharts, Mustache, globalConf) {

    var Chart = function(config) {
        this._init(config)
    }

    //chart
    Chart.prototype = {
        node: null,
        config: null,
        chartConf: null,
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
                trend: '15日环比'
            }
            var tpl = globalConf.chartTitleTpl();
            //str
            var str = Mustache.render(tpl, data);
            me.node.find('.hd').html(str);
        },
        _generateConfig: function() {
            var me = this;
            //resize
            var resizeObj = globalConf.chartResize();
            me.node.css('padding-top', resizeObj.percentStr);
            var legendDis = 8;
            var fontSize = 10;
            if (me.winW <= 375 && me.winW > 320) { //size=6
                legendDis = 7;
                fontSize = 9;
            } else if (me.winW <= 320) { //size<=5
                legendDis = 4;
                fontSize = 8;
            }
            //data
            var dataArr = [64.88, 18.74, 31.16, 109.51, 68.75, 23.4];
            var chartConf = {
                    chart: {
                        width: resizeObj.chartW,
                        height: resizeObj.chartH,
                        margin: 0,
                        type: 'area'
                    },
                    xAxis: {
                        visible: false
                    },
                    yAxis: {
                        visible: false,
                    },
                    legend: {
                        align: 'left',
                        verticalAlign: 'bottom',
                        enabled: true,
                        symbolWidth: 0,
                        symbolHeight: 0,
                        margin: 0,
                        padding: 0,
                        symbolPadding: 0,
                        itemDistance: legendDis,
                        marginRight: -10,
                        x: -7,
                        y: 0,
                        itemStyle: {
                            fontWeight: 'normal',
                            fontSize: fontSize + 'px', //6p:10,6:8.5,5:8
                            color: '#fff'
                        }
                    },
                    plotOptions: {
                        series: {
                            connectNulls: false
                        },
                        area: {
                            lineWidth: 0,
                            marker: {
                                enabled: false
                            },
                            dataLabels: {
                                enabled: true,
                                allowOverlap: true,
                                overflow: 'none',
                                // formatter: function() {
                                //     var index = Math.round(this.x);
                                //     var data = dataArr[index];
                                //     return data+'%';
                                // },
                                inside: false,
                                align: 'left',
                                padding: 0,
                                style: {
                                    fontSize: '8px',
                                    color: '#FFF',
                                    fontWeight: 'normal',
                                    textShadow: '0 0 0'
                                },
                                y: 5
                            }
                        }
                    },
                    series: [{
                        name: '到达终端',
                        data: [800, 700, null, null, null, null],
                        fillColor: 'rgba(44,100,255,0.7)'
                    }, {
                        name: '商详页',
                        data: [null, 700, 600, null, null, null],
                        fillColor: 'rgba(44,100,255,0.5)'
                    }, {
                        name: '购物车',
                        data: [null, null, 600, 500, null, null],
                        fillColor: 'rgba(44,100,255,0.3)'
                    }, {
                        name: '结算页',
                        data: [null, null, null, 500, 400, null],
                        fillColor: 'rgba(44,100,255,0.2)'
                    }, {
                        name: '引入订单',
                        data: [null, null, null, null, 400, 300],
                        fillColor: 'rgba(44,100,255,0.05)',
                        dataLabels: {
                            enabled: false
                        }
                    }]
                }
            //deep copy
            var config = $.extend(true, {}, globalConf.chartConf);
            // config.legend = {};
            chartConf = $.extend(true, config, chartConf);
            me.chartConf = chartConf;
        },
        //ajax getData
        _getData: function() {
            var me = this;
            // console.log('get data');
            //render
            me._renderData();
            // me._bindHandler();
        },
        _renderData: function() {
            var me = this;
            var chartArr = [];
            // console.log('render data');
            //title
            me._renderTitle();
            //data
            var chartData = [19.88, 11.74, 31.16, 109.51, 68.75];
            me.chartConf.plotOptions.area.dataLabels.formatter = function() {
                var index = Math.round(this.x);
                var data = chartData[index];
                return data + '%';
            }
            me.chartConf.chart.renderTo = me.node.find('.bd').get(0);
            var chart = new Highcharts.Chart(me.chartConf);
            //
            chartArr.push(chart);
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