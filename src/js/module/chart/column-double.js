/*
 * 列表页图表(核心图表) - 双柱状图
 * 
 * 说明：列表页中使用的图表。主要用来展示核心图表的数据。
 *
 * PS: 核心图表可以解析的数据类型：line(线)，column(柱状)，pie(饼)
 *
 * PPS：当饼图展示时，其他图表数据忽略不展示。
 */

//核心图表
define('./module/chart/column-double', ['highcharts', 'mustache','./config'], function(Highcharts, Mustache, globalConf) {

    var Chart = function(config){
        this._init(config)
    }

    //chart
    Chart.prototype = {
        node: null,
        config: null,
        chartConf: null,
        pieConf: null,
        chartArr: [],
        winW: $(window).width(),
        pieLimitNum: 5,
        _init: function(config) {
            console.log(config);
            var me = this;
            me.config = config;
            me.node = config.node;
            me.limitNum = globalConf.pieLimitNum;
            me._generateConfig();
            me._renderData();
            //show
            setTimeout(function() {
                me.node.addClass('show');
            }, 50);
        },
        _generateConfig: function() {
            var me = this;
            //resize
            var resizeObj = globalConf.chartResize({
                percent: 0.65,
                type: 'all'
            });
            //yAxis
            var yAxisConf = {
                gridLineWidth: 1,
                gridLineColor: 'rgba(255,255,255,0.1)',
                title: {
                    text: ''
                },
                labels: {
                    style: {
                        color: 'rgba(255,255,255,0.5)'
                    }
                }
            };
            yAxisConfSec = $.extend(true, {}, yAxisConf);
            yAxisConfSec.opposite = true;
            //column
            var chartConf = {
                chart: {
                    width: resizeObj.chartW,
                    height: resizeObj.chartH - 10,
                    marginTop: 10,
                    marginBottom: 56,
                },
                xAxis: [{
                    type: 'category',
                    crosshair: true,
                    lineWidth: 0,
                    tickWidth: 0,
                    labels: {
                        rotation: 0,
                        step: 3,
                        style: {
                            color: 'rgba(255,255,255,0.5)',
                            font: '11px Trebuchet MS, Verdana, sans-serif'
                        },
                        y: 15
                    }
                }],
                yAxis: [yAxisConf, yAxisConfSec],
                legend: {
                    align: 'center',
                    verticalAlign: 'bottom',
                    padding: 5
                },
                plotOptions: {
                    column: {
                        color: '#FFF',
                        yAxis: 0,
                        groupPadding: 0.35,
                        borderWidth: 0
                    },
                    line: {
                        color: '#DD5161',
                        yAxis: 1,
                        lineWidth: 1,
                        marker: {
                            radius: 3,
                            lineWidth: 1,
                            lineColor: '#FFF',
                            symbol: 'circle'
                        }
                    },
                    pie: {
                        borderWidth: 0,
                        dataLabels: {
                            enabled: true,
                            connectorColor: '#ACCDF1',
                            shadow: false,
                            padding: 0,
                            distance: 26,
                            // overflow: 'none',
                            crop: false,
                            style: {
                                fontSize: '8px',
                                color: '#FFF',
                                textShadow: 'none',
                                fontWeight: 'normal',
                                lineHeight: '9px'
                            }
                        },
                        // showInLegend: false
                    }
                }
            }
            //deep copy
            var config = $.extend(true, {}, globalConf.chartConf);
            chartConf = $.extend(true, config, chartConf);
            me.chartConf = chartConf;
        },
        //render
        _renderData: function() {
            var me = this;
            //data
            var chartDataArr = [];
            var columnArr = [];
            var columnNum = 0, lineNum = 0;
            var hasPie = false;
            //fun
            var callbackFun = function(obj){
                if(!hasPie){
                    if(obj.type == 'column'){
                        columnNum++;
                        columnArr.push(obj);
                        if(columnNum == 2){//前插
                            obj.color = 'rgba(255,255,255,0.2)';
                            me.chartConf.plotOptions.column.groupPadding = 0.2;
                        }
                    }else if(obj.type == 'line'){
                        lineNum++;
                        if(lineNum == 2){
                            obj.color = '#0097FA';
                            obj.marker = {
                                fillColor:' #FFF',
                                lineColor: '#0097FA'
                            }
                        }
                        chartDataArr.push(obj);
                    }
                    //data-length
                    obj.data = me._cutlengthArray(obj.data);
                    //step
                    var step = Math.floor(obj.data.length/2);
                    // console.log(obj.data)
                    step = obj.data.length == 12 ? 5 : step;
                    me.chartConf.xAxis[0].labels.step = step;
                    
                }
                //pie alone
                if(obj.type == 'pie'){
                    chartDataArr = [];
                    // chartDataArr.push(obj);
                    hasPie = true;
                    me._renderPieChart(obj, chartDataArr);
                }
            }
            // console.log(me.chartConf)
            //data
            globalConf.renderData(me.config.data, me.node, callbackFun, 'all');
            //yAxis
            if (columnNum == 0) {
                me.chartConf.chart.marginRight = 30;
                me.chartConf.yAxis[1].opposite = false;
            }
            //config
            chartDataArr = columnArr.concat(chartDataArr);
            me.chartConf.series = chartDataArr;
            me.chartConf.chart.renderTo = me.node.find('.bd').get(0);

            console.log(me.chartConf);
            var chart = new Highcharts.Chart(me.chartConf);
            me.chartArr.push(chart);
        },
        _renderPieChart: function(obj, chartDataArr){
            var me = this;
            var dataArr = obj.data;
            var sum = globalConf.pieLimitSum(dataArr);
            var limitNum = globalConf.pieLimitNum;
            //vars
            var colorArr = ['rgba(70, 104, 217, 1)', 'rgba(70, 104, 217, 0.8)', 'rgba(70, 104, 217, 0.6)', 'rgba(70, 104, 217, 0.4)', 'rgba(70, 104, 217, 0.2)'];
            var item, itemObj, start = -90, name,
                angle, value, color;
            var num = 0;
            var size = $(window).width()-210;
            for (var i = limitNum-1; i>=0; i--) {
                item = dataArr[i];
                value = item.y;
                angle = start + Math.round(value / sum * 180);
                color = colorArr[i];
                name = item.name
                //limit
                if(i==limitNum-1){
                    name = '其他';
                }
                if(i==0){
                    angle = 90;
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
                    zIndex: limitNum - i
                }
                //other
                if(name == '其他'){
                    var posY = me.winW == 375 ? 20 : 10;
                    posY = me.winW == 320 ? 30 : 10;
                    itemObj.dataLabels = {
                        y: posY
                    }
                }
                chartDataArr.push(itemObj);
                start = angle;
                num++;
                size = size+i*6;
            }
            //container
            itemObj = {
                type : 'pie',
                data: [{name: '', data: 50, y: 50}],
                size: size*1.2,
                colors: ['rgba(111, 39, 39, 0.2)'],
                startAngle: -90,
                endAngle: 90,
                zIndex: 0,
                dataLabels: false
            }
            chartDataArr.push(itemObj);
            //dataLabels
            me.chartConf.chart.events = {
                load: me._redrawConnectors    
            };
            me.chartConf.plotOptions.pie.center = ["55%", size*0.5];
            me.chartConf.plotOptions.pie.dataLabels.formatter = function(){
                var value = this.point.data;
                var str = '';
                if(globalConf.isFloat(value)){
                    var data = parseInt(value*10000)/100;
                    value = data + '%';
                }
                str = value + ' <br>'+ this.point.name;
                return str;
                
            }
        },
        _cutlengthArray: function(arr){
            var me = this;
            var len = arr.length;
            //cut
            var num = 0;
            if(len == 24){
                arr = arr.filter(function(item){
                    num++;
                    if(num%2){
                        return item;
                    }
                });    
            }
            return arr;
        },
        _redrawConnectors: function() {
            var chart = this,
                d;
            Highcharts.each(chart.series[0].data, function(point, i) {
                if (point.connector && point.name == '其他') {
                    d = point.connector.d.split(' ');
                    d = [d[0], d[11], d[12], d[10], d[11]-30, d[12]];
                    point.connector.attr({
                        d: d
                    });
                }
            });
        }
    }

    //method
    var chartFun = function(config) {
        var me = this;
        var item = $('#'+config.id);
        if(item.length>0){
            console.log('Error: repeat init chart');
            return;
        }
        //init
        var chart = new Chart(config);
        chart.node.data('chart',chart);
        return chart.chartArr;
    }

    //
    return chartFun;
});