/*
 * 列表页图表(非核心图表) - 饼图
 * 
 * 说明：列表页中使用的图表，饼图图表。主要用来展示非核心图表的数据。
 * 
 */
//非核心图
define('./module/chart/pie', ['highcharts', 'mustache', './config'], function(Highcharts, Mustache, globalConf) {

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
                    margin: 25,
                    marginRight: 32,
                    marginTop: 0
                },
                xAxis: [{
                    visible: false,
                }],
                yAxis: [{ // Primary yAxis
                    visible: false,
                }],
                legend: {
                    enabled: false
                },
                plotOptions: {
                    pie: {
                        size: '50%',
                        borderWidth: 0,
                        dataLabels: {
                            enabled: true,
                            connectorColor: '#ACCDF1',
                            shadow: false,
                            padding: 0,
                            distance: 16,
                            style: {
                                fontSize: '8px',
                                color: '#FFF',
                                textShadow: 'none',
                                fontWeight: 'normal',
                                lineHeight: '9px'
                            }
                        },
                        showInLegend: true
                    }
                }
            }
            //deep copy
            var config = $.extend(true, {}, globalConf.chartConf);
            // config.legend = {};
            // config
            chartConf = $.extend(true, config, chartConf);
            me.chartConf = chartConf;
            //marker
            var markerConf = {
                enabled: true
            }
            me.markerConf = markerConf;
            //areaAnother
            var areaAnotherConf = {
                lineColor: 'rgba(49,106,353,1)',
                fillColor: 'rgba(49,106,253, 0.2)'
            }
            me.areaAnotherConf = areaAnotherConf;
        },
        _renderData: function() {
            var me = this;
            //data
            var chartDataArr = [];
            //fun
            var callbackFun = function(obj){
                if(obj.type != 'pie'){
                    return;
                }
                //data
                var dataArr = obj.data;
                var sum = globalConf.pieLimitSum(dataArr);
                var limitNum = globalConf.pieLimitNum;
                //vars
                var colorArr = ['rgba(49, 116, 253, 0.9)', 'rgba(49, 116, 253, 0.8)', 'rgba(49, 116, 253, 0.6)', 'rgba(49, 116, 253, 0.4)', 'rgba(49, 116, 253, 0.2)'];
                var item, itemObj, start = 0, name,
                    angle, value, size, color;
                for (var i = 0, len = dataArr.length; i<limitNum; i++) {
                    item = dataArr[i];
                    value = item.y;
                    angle = start + Math.round(value / sum * 360);
                    size = (90 - i * 6);
                    size = size + '%';
                    color = colorArr[i];
                    name = item.name
                    //limit
                    if(i==limitNum-1){
                        angle = 360;
                        name = '其他';
                    }
                    itemObj = {
                        type: 'pie',
                        data: [{
                            name: name,
                            data: value,
                            y: value
                        }],
                        size: size,
                        colors: [color],
                        startAngle: start - 1,
                        endAngle: angle,
                        zIndex: len - i
                    }
                    chartDataArr.push(itemObj);
                    start = angle;
                }
            }
            //data
            globalConf.renderData(me.config.data, me.node, callbackFun);
            me.chartConf.series = chartDataArr;
            //dataLabels
            me.chartConf.plotOptions.pie.dataLabels.formatter = function(){
                var value = this.point.data;
                var str = '';
                if(globalConf.isFloat(value)){
                    var data = parseInt(value*10000)/100;
                    value = data + '%';
                }
                str = value + ' <br>'+ this.point.name;
                return str;
                // var str = this.point.data + '% <br>'+ this.point.name;
                // return str;
            }
            //render
            me.chartConf.chart.renderTo = me.node.find('.bd').get(0);
            var chart = new Highcharts.Chart(me.chartConf);
            me.chartArr.push(chart);
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