/*
 * 图表配置
 * 
 * 说明：主要用于图表模块的公共配置，及相关的处理函数。
 * 
 */
define('./module/chart/config', ['zepto', 'mustache'], function($, Mustache) {
    var configObj = {
        chartConf: null,
        imgObj: {
            marker: 'url(../img/chart-bg2-marker.png)',
            marker80: 'url(../img/chart-bg2-marker80.png)',
        },
        pieLimitNum: 5,
        checkDataObj: {
            trend: 'mba.php?g=broad_cast&c=broad_cast&a=get_trend_data',
            rate: 'a=get_rate_line_data'
        },
        removeTypeStr: 'pie,column',
        init: function(){
            var me = this;
            me.generatorChartConf();
        },
        chartResize: function(option){
            var winW = $(window).width();
            //base: 320px-> font:10px
            var fontSize = parseInt(winW / 320 * 10);
            fontSize = fontSize > 14 ? 14 : fontSize;
            fontSize += 'px';
            //
            var percent = 0.6;
            if (option && option.percent) {
                percent = option.percent;
            }
            var percentStr = (percent * 100) + '%';
            var wholeH = parseInt(winW * percent);
            var chartH = wholeH - 65;
            var chartW = parseInt(winW * 0.5);
            if (option && option.type == 'all') {
                chartW = winW;
            }
            //obj
            var obj = {
                fontSize: fontSize,
                percentStr: percentStr,
                chartW: chartW,
                chartH: chartH
            }
            return obj;
        },
        //config
        generatorChartConf: function() {
            var me = this;
            var fontSize = me.chartResize().fontSize;
            var chartConfig = {
                chart: {
                    panning: false,
                    pinchType: null,
                    backgroundColor: null,
                    events: null,
                    style: {
                        fontFamily: '"Helvetica Neue", Helvetica, DroidSansFallback, HeiTi SC, Arial, sans-serif',
                        fontSize: '12px'
                    }
                },
                title: '',
                tooltip: false,
                credits: false,
                legend: {
                    align: 'left',
                    verticalAlign: 'top',
                    padding: 0,
                    borderWidth: 0,
                    itemDistance: 10,
                    symbolWidth: 10,
                    symbolHeight: 10,
                    itemStyle: {
                        fontWeight: 'normal',
                        fontSize: '8px',
                        color: '#FFFFFF'
                    }
                },
                plotOptions: {
                    series: {
                        minPointLength: 2,
                        enableMouseTracking: false,
                        states: {
                            hover: {
                                enabled: false
                            }
                        }
                    }
                }
            }//end
            me.chartConf = chartConfig;
        },
        //tpl-struct
        chartStructTpl: function(config, cls, dirCls) {
            var me = this;
            if (!cls) {
                cls = 'chart-half';
            }
            var node = $('<div class="chart-item ' + cls + '"></div>');
            if (config.id) {
                node.attr('id', config.id);
            }
            if (config.cls) {
                node.addClass(config.cls);
            }
            dirCls ? node.addClass(dirCls) : -1;
            //con
            var con = $('<div class="chart-con"></div>');
            //hd
            var hd = $('<div class="hd"></div>');
            //bd
            var bd = $('<div class="bd"></div>');
            con.append(hd).append(bd);
            node.append(con);
            return node;
        },
        //tpl-title
        chartTitleTpl: function(type) {
            var targetStr = '',
                pieStr = '';
            if (type && type == 'all') {
                targetStr = '{{#targetTitle}}<span>{{targetTitle}}：{{target}}</span>{{/targetTitle}}';
                pieStr = '<div class="chart-pie"></div>';
            }
            //str
            var tpl =
                '<div class="chart-title">' +
                    '<p class="total {{dataType}}">' +
                        '<span class="num">{{numTitle}}：{{num}}</span>' +
                        targetStr +
                    '</p>' +
                    '<p class="percent">' +
                        '<span class="num">{{rate}}</span>' +
                        '<span class="trend {{rateSign}}">{{rateTitle}}</span>' +
                    '</p>' +
                '</div>' +
                pieStr;
            //
            return tpl;
        },
        //render
        renderTitle: function(data, type, isToday, node, titleType) {
            var me = this;
            var mapObj = me.mapObjCheck(type);
            //parse
            var nameArr = data.chart_name ? data.chart_name.split(',') : [' '];
            var valueObj = data['content'];
            //type check
           /* if(type != 'mix'){
                valueObj = valueObj[0];
            }*/
            var i = 0;
            var titleObj = $.extend(true, {}, valueObj);
            for(var item in valueObj){
                titleObj[item+'Title'] = nameArr[i] ? nameArr[i] : '日环比';
                i++;
                if(item == 'num'){
                    titleObj[item] = me.formatNum(titleObj[item]);
                }
                if(item == 'rate'){
                    titleObj[item+'Sign'] = titleObj[item]<0 ? 'down' : 'up';
                    titleObj[item] = parseInt(Math.abs(titleObj[item]*10000))/100+'%';
                }
            }
            titleObj.dataType = isToday ? 'data-on' : 'data-off';
            var tpl = me.chartTitleTpl(titleType);
            //str
            var str = Mustache.render(tpl, titleObj);
            node.find('.hd').html(str);
        },
        //renderData
        renderData: function(dataArr, node, callback, titleType){
            var me = this;
            //vars
            var type = 'part', isToday = false;
            //mix
            if(dataArr.length == 1){
                isToday = dataArr[0].is_today == 1 ? true : false;
                dataArr = dataArr[0].data;
                type = 'mix';
            }
            //map
            var mapObj = me.mapObjCheck(type);
            //array data
            var item, obj, itemType, mixItem;
            var columnArr = [];
            for(var i=0, len=dataArr.length; i<len; i++){
                item = dataArr[i];
                itemType = item[mapObj.chart_type];
                data = item[mapObj.data];
                if(itemType == 'high'){
                    //title
                    me.renderTitle(item, type, isToday, node, titleType);
                }else{
                    //mix data
                    if(itemType == 'mix'){
                        for(var j=0, jlen=data.length; j<jlen; j++){
                            mixItem = data[j];
                            if(mixItem.type == 'high'){
                                me.renderTitle(mixItem, mixItem.type, isToday, node, titleType);
                            }else{
                                obj = me.generatorDataObj(mixItem.chart_name, mixItem.type, mixItem.content);
                                callback && callback(obj);
                            }
                        }
                    }else{
                        obj = me.generatorDataObj(item.chart_name, itemType, data);
                        callback && callback(obj);
                    }
                }
            }
        },
        generatorDataObj: function(name, type, data){
            var me = this;
            var obj = {
                name: name,
                type: type,
                data: me.formatSeriesData(data)
            };
            return obj;
        },
        //data
        formatSeriesData: function(dataArr){
            var me = this;
            var tmp = dataArr;
            if(tmp.length == 1 && $.isArray(tmp[0])){
                tmp = dataArr[0];
            }
            var obj;
            var arr = $.map(tmp, function(element, index) {
                obj =  {
                    name: element.name,
                    y: Number(element.value),
                    formatNum: me.formatNum(element.value)
                }
                //check name
                if(String(element.name).match(/\d{4}\-\d{2}\-\d{2}/)){
                    obj.formatName = obj.name;
                }else{
                    obj.formatName = me.formatTime(obj.name);
                }
                return obj;
            });
            return arr;
        },
        //utils-map
        mapObjCheck: function(type){
            var obj = {
                chart_type: 'chart_type',
                data: 'data'
            }
            if(type == 'mix'){
                obj = {
                    chart_type: 'type',
                    data: 'content'
                }
            }
            return obj;
        },
        //utils-formatNum
        formatNum: function(num){
            if((typeof(num) == 'string' && num.match('%')) || Number(num)<1000){
                return num;
            }
            num = Number(num);
            //format
            var str = String(num);
            if(str.length<=3){
                return str;
            }
            str = str.split("").reverse().join("")
                .replace(/(\d{3})(?=[^$])/g, "$1,")
                .split("").reverse().join("");
            return str;
        },
        //utils-formatTime
        formatTime: function(str){//整点
            str += '';
            var result = str.length==1 ? '0'+str : str;
            result += ':00';
            return result;
        },
        //utils-pieLimitNum
        pieLimitSum: function(arr){
            var me = this;
            var result = 0, other = 0;
            var num;
            for (var i = 0, len = arr.length; i < len; i++) {
                num = Number(arr[i].y);
                result += num;
                if(i>=me.pieLimitNum-1){
                    other += num;
                }
            }
            return result;
        },
        //utils-float
        isFloat: function(n) {
            return n === Number(n) && n % 1 !== 0;
        }
        
    }
    //init
    configObj.init();
    //
    return configObj;
});