/*
 * 详情页图表 - 多面积图
 * 
 * 说明：详情页中使用的图表，多面积图表。
 * 
 */
define('./module/chart/area-multi', ['highcharts', 'mustache', './config'], function(Highcharts, Mustache, globalConf) {
    //tooltip always visible
    Highcharts.wrap(Highcharts.Tooltip.prototype, 'hide', function (defaultCallback) {});

    //chart
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
            me._renderStruct();
            me._generateConfig();
            me._renderData();
            //reset
            var container = config.container;
            container.append(me.node);
            setTimeout(function() {
                me.node.addClass('show');
            }, 50);
        },
        _renderStruct: function() {
            var me = this;
            me.node = globalConf.chartStructTpl(me.config, 'area-multi');
            me.node.remove('.hd');
            me.node.attr('id','J_panel'+me.config.id);
        },
        _generateConfig: function() {
            var me = this;
            //resize
            var resizeObj = globalConf.chartResize();
            var container = me.config.container;
            var tooltipH = container.height() - 22;
            var num = 0;
            //column
            var columnConf = {
                chart: {
                    width: container.width(),
                    height: container.height(),
                    margin: 0,
                    marginTop: 20,
                    marginBottom: 22,
                    events: {
                        load: function(){
                            //init select
                            var selectIndex = 2;
                            var seriesArr = this.series;
                            var selectArr = [];
                            var item;
                            for(var i=0,len=seriesArr.length; i<len; i++){
                                item = seriesArr[i].points[selectIndex];
                                selectArr.push(item);
                            }
                            this.tooltip.refresh(selectArr);
                            me._renderPoint(selectIndex, seriesArr);
                            // console.log(this.series[0].name)
                        }
                    }
                },
                xAxis: [{
                    visible: false
                }],
                yAxis: [{ // Primary yAxis
                    visible: true,
                    gridLineWidth: 1,
                    gridLineColor: 'rgba(144, 152, 172, 0.1)'
                }, { // Secondary yAxis
                    visible: true,
                    gridLineWidth: 1,
                    gridLineColor: 'rgba(144, 152, 172, 0.1)',
                    opposite: true
                }],
                tooltip: {
                    headerFormat: '',
                    shared: true,
                    useHTML: true,
                    shadow: false,
                    animation: false,
                    backgroundColor: 'transparent',
                    borderWidth: 0,
                    positioner: function(labelWidth, labelHeight, point){
                        var obj = {
                            x: point.plotX-70,
                            y: -8
                        }
                        return obj;
                    },
                    formatter: function(){
                        return '<img src="../img/chart-pointer.png" height="'+tooltipH+'" width="122">';
                    }
                },
                legend: {
                    align: 'center',
                    verticalAlign: 'bottom',
                    enabled: true,
                    y: 6
                },
                plotOptions: {
                    areaspline: {
                        lineColor: '#46f3e1',
                        // color: '#316afd',
                        // fillOpacity: 0.1,
                        color: '#46f3e1',
                        fillColor: 'rgba(49, 106, 253, 0.2)',
                        lineWidth: 1,
                        yAxis: 0,
                        marker: {
                            enabled: false,
                            lineColor: null,
                            symbol: globalConf.imgObj.marker80,
                        },
                        states: {
                            hover: {
                                lineWidth: 1,
                                halo: {
                                    opacity: 0
                                }
                            },
                            select: {
                                enabled: false
                            }
                        },
                        events: {
                            mouseOut: function(e){
                                e.preventDefault();
                                return false;
                            }
                        }
                    }
                }
            }
            // deep config
            var config = $.extend(true, {}, globalConf.chartConf);
            config.plotOptions.series = {};
            columnConf = $.extend(true, config, columnConf);
            me.columnConf = columnConf;
            //marker
            var markerConf = {
                symbol: globalConf.imgObj.marker
            }
            me.markerConf = markerConf;
        },
        _generateZoneConf: function(lineColor, fillColor, value){
            var obj = {
                zoneAxis: 'x',
                zones: [{
                    value: value,
                    color: lineColor,
                    fillColor: fillColor
                }, {
                    dashStyle: 'dash',
                    color: lineColor,
                    fillColor: fillColor
                }]
            };
            return obj;
        },
        _renderTotal: function(data, type){
            var me = this;
            var mapObj = globalConf.mapObjCheck(type);
            //parse
            var valueObj = data[mapObj.data];
            //type check
            if(type != 'mix'){
                valueObj = valueObj[0];
            }
            //title
            var name = data.chart_name.split(',')[0];
            $('#J_header h1').text(name);
            //num
            var totalNum = globalConf.formatNum(valueObj.num);
            $('#J_chartDetails .total').text(totalNum);
            //rate
            var rate = valueObj.rate;
            var cls = rate<0 ? 'data-down' : 'data-up';
            rate = parseInt(Math.abs(rate*10000))/100+'%';
            var rateStr = '日环比：<em class="num">'+rate+'</em>';
            $('#J_chartDetails .rate-day').html(rateStr).addClass(cls);
        },
        _renderData: function() {
            var me = this;
            //data
            var dataArr = me.config.data;
            var type = 'part', isToday = false;
            //mix
            if(dataArr.length == 1){
                dataArr = dataArr[0].data;
                type = 'mix';
            }
            //data config
            var colorArr = [{
                color: '#46f3e1',
                fillColor: 'rgba(49, 106, 253, 0.2)',
                marker: me.markerConf
            },{
                color: '#3f9dfc',
                fillColor: 'rgba(49, 106, 253, 0.1)'
            },{
                color: 'rgba(63, 157, 252, 0.22)',
                fillColor: 'rgba(49, 106, 253, 0.1)',
            }];
            //map
            var mapObj = globalConf.mapObjCheck(type);
            var chartDataArr = [];
            var item, itemType, obj, mixItem, itemColor;
            var itemNum = 0;
            var typeStr = 'areaspline';
            for(var i=0, len=dataArr.length; i<len; i++){
                item = dataArr[i];
                itemType = item[mapObj.chart_type];
                data = item[mapObj.data];
                //switch
                if(itemType == 'high'){
                    me._renderTotal(item, type);
                }else{
                    //mix data
                    if(itemType == 'mix'){
                        for(var j=0, jlen=data.length; j<jlen; j++){
                            mixItem = data[j];
                            //剥离‘饼图’、‘柱状图’的类型
                            if(globalConf.removeTypeStr.match(mixItem.type)){
                                continue;
                            }
                            obj = globalConf.generatorDataObj(mixItem.chart_name, typeStr, mixItem.content);
                            itemColor = colorArr[itemNum];
                            //add
                            me._addConfig(obj, itemColor, itemType, chartDataArr);
                            itemNum++;
                        }
                    }else{
                        obj = globalConf.generatorDataObj(item.chart_name, typeStr, data);
                        itemColor = colorArr[itemNum];
                        //add
                        me._addConfig(obj, itemColor, itemType, chartDataArr);
                        itemNum++;
                    }
                }
            }
            //point
            chartDataArr[0].point = {
                events: {
                    mouseOver: function() {
                        var index = this.index;
                        me._renderPoint(index);
                    }
                }
            }
            me.chartDataArr = chartDataArr;
            //data
            me.columnConf.series = chartDataArr;
            me.columnConf.chart.renderTo = me.node.find('.bd').get(0);
            var chart = me.chartArr[0];
            if(chart){
                chart.destroy();
            }
            chart = new Highcharts.Chart(me.columnConf);
            me.chartArr[0] = chart;
            //render
            me._renderList();
        },
        _addConfig: function(obj, itemColor, itemType, chartArr){
            var me = this;
            obj.itemType = itemType;
            //yAxis
            var firstItem = obj.data[0].y;
            //最近7天
            if(!me.config.isSearch){
                obj.data.splice(0, 8);
            }
            //zones
            zones = me._generateZoneConf(itemColor.color, itemColor.fillColor, obj.data.length+30);
            $.extend(obj, itemColor);
            $.extend(obj, zones);
            //float
            if(globalConf.isFloat(firstItem)){
                obj.yAxis = 1;
                // chartArr.push(obj);
            }else{
                // chartArr.unshift(obj);
            }
            chartArr.push(obj);
            // console.log(chartArr)
        },
        _renderList: function(){
            var me = this;
            var arr = me.chartDataArr;
            var item, data, dataType;
            for(var i=0,len=arr.length; i<len; i++){
                item = arr[i];
                isFloat = globalConf.isFloat(item.data[0].y)
                if(!isFloat){
                    data = item;
                    break;
                }
            }
            //total
            var sum = data.data.reduce(function(a, b) {
                return {y: a.y + b.y};
            }, {y:0});
            sum = sum.y;
            sum = globalConf.formatNum(sum);
            var temp = $.extend(true,[],data.data);
            temp = temp.reverse();
            //tpl
            var tpl = '<ul class="data-list">'+
                        '<li>'+
                            '<span class="title">汇总</span>'+
                            '<span class="num">'+sum+'</span>'+
                        '</li>'+
                        '{{#data}}<li>'+
                            '<span class="title">{{formatName}}</span>'+
                            '<span class="num">{{formatNum}}</span>'+
                        '</li>{{/data}}'+
                    '</ul>';
            var rendered = Mustache.render(tpl, {data: temp});
            //head
            var headStr = '<h4>'+
                            '<span class="title">日期</span>'+
                            '<span class="num">'+data.name+'</span>'+
                        '</h4>';
            $('.chart-data').html(headStr+rendered);
        },
        _renderPoint: function(index, seriesArr){
            var me = this;
            var series = [];
            if(seriesArr){
                series = seriesArr;
            }else{
                series = me.chartArr[0].series;
            }
            //break;
            if(!series){
                console.log('出错了');
                return;
            }
            //tpl
            var dateStr = '';
            //arr
            var item, value;
            for(var i=0, len=series.length; i<len; i++){
                item = series[i].data[index];
                value = item.y;
                if(Math.abs(value)>1){//date
                    dateStr = '<em class="time">'+item.formatName+'</em>'+
                        '<em class="num">'+item.formatNum+'</em>';
                }else{

                }
            }
            $('#J_chartDetails .date').html(dateStr);
        }
    }

    //method
    var chartFun = function(config) {
        var me = this;
        var item = $('#J_panel' + config.id);
        var chart;
        if (item.length > 0) {
            // console.log('Error: repeat init chart');
            chart = item.data('chart');
            chart.config = config;
            chart._renderData();
            return chart;
        }
        //init
        chart = new Chart(config);
        chart.node.data('chart', chart);
        return chart;
    }

    //
    return chartFun;
});