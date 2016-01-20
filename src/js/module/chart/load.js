/*
 * 图表加载器
 * 
 * 说明：列表页图表预加载处理，加载后根据类型判断后，渲染出对应的图表。
 * 
 */
define('./module/chart/load', [
    'zepto',
    '../mainbar',
    './config',
    './column-double',
    './column-single',
    // './area-single',
    // './area-ladder',
    // './area-double',
    './pie'
], function($, mainbar, globalConf, C_columnDouble, C_columnSingle, /*C_areaSingle, C_areaLadder, C_areaDouble, */C_pie) {
    //struct
    var ChartLoad = function(dataItem) {
        this._init(dataItem)
    }

    //chartLoad
    ChartLoad.prototype = {
        node: null,
        dataItem: null,
        chartDataArr: [],
        chartType: '',
        checkDataObj: {},
        _init: function(dataItem){
            var me = this;
            me.dataItem = dataItem;
            me.chartDataArr = [];  //clean
            me.checkDataObj = globalConf.checkDataObj;
            //fun
            me._renderStruct();
            me._getData();
            me._bindHanlder();
        },
        _renderStruct: function(){
            var me = this;
            var id = "J_panel"+me.dataItem.data.panel_id;
            var config = {
                id: id
            }
            var cls = '';
            if(me.dataItem.isCore){
                cls = 'column-double';
            }
            me.node = globalConf.chartStructTpl(config, cls, me.dataItem.cls);
            me.dataItem.container.append(me.node);
        },
        _getData: function(){
            var me = this;
            var data = me.dataItem.data;
            var dataJson = $.parseJSON(data.data_json);
            //loading
            mainbar.loadingShow(me.node, 'small', true);
            //data
            var arr = data.request_id.split(',');
            var item, itemJson, path;
            var dataNeedArr = [];
            //filter data need
            for(var i=0,len=arr.length; i<len; i++){
                item = arr[i];
                itemJson = dataJson[i];
                //console.log(itemJson);
                //剥离非核心图，不显示图形的数据请求
                if(!me.dataItem.isCore && itemJson && itemJson.is_not_core == 0){
                    continue;
                }
                //剥离“实时数据”&“环比数据”两类数据
                if(itemJson){
                    path = itemJson.path;
                    if(me.checkDataObj.trend == path || path.match(me.checkDataObj.rate)){
                        continue;
                    }
                }
                dataNeedArr.push(item);
            }
            //getNeedData
            me.totalNum = dataNeedArr.length;
            for(i=0,len=dataNeedArr.length; i<len; i++){
                item = dataNeedArr[i];
                me._getAjaxData(item, dataJson[i]['chart_type']);
            }
        },
        _getAjaxData: function(id, type){
            var me = this;
            var url = 'http://mba.jd.com/mba.php?g=my_statistics&c=my_statistics&a=getResponseData';
            // url = 'http://mba.jd.com/mba.php?g=my_statistics&c=my_statistics&a=getResponseDataMtest';
            // url = '../js/json/chart-'+index+'.json'
            // url = mainbar.formatURL(url,3089);
            var mockUrl = 'http://localhost:8090/filterChart.do?id=' + type;
            mainbar.ajaxData({
              /*  test: {
                    sign: true,
                    port: 3089
                },*/
                data: {
                    request_id: id
                },
                url: mockUrl,
                type: 'POST',
                success: function(data){
                    if(data.status == 1){
                        if(data.data.chart_type == 'mix'){
                            var arr = data.data.data;
                            var len = arr.length
                            if(!me.dataItem.isCore){
                                //非核心图：mix数据时，取数组第一个的类型
                                len = 1;
                            }
                            for(var i=0; i<len; i++){
                                me.chartType += arr[i].type +'|';
                            }
                        }else{
                            me.chartType += data.data.chart_type +'|'; 
                        }
                        me.chartDataArr.push(data.data);
                        //check-empty
                        if(data.data.data.length == 0){
                            me.chartDataArr.length = 0;
                            me._loadDataErr();
                            return;
                        }
                        if(me.chartDataArr.length == me.totalNum){
                            mainbar.cleanDataPop(me.node, true);
                            me.node.attr('data-status','1');
                            me._renderChart();
                        }
                    }else{
                        me._loadDataErr();
                    }
                },
                error: function(xhr, errorType){
                    me._loadDataErr();
                }
            });
        },
        _loadDataErr: function(){
            var me = this;
            mainbar.refreshShow(me.node, 'small');
        },
        _renderChart: function(){
            var me = this;
            var obj = {
                node: me.node,
                data: me.chartDataArr
            };
            //switch
            if(me.dataItem.isCore){
                C_columnDouble(obj);
            }else if(me.chartType.match('pie')){
                C_pie(obj);
            }else{
                C_columnSingle(obj);
            }
            // console.log('chart ok',me.chartDataArr,me.chartType);
        },
        _bindHanlder: function(){
            var me = this;
            me.node.on('click', '.refresh-pop', function(e){
                me._getData();
                e.stopPropagation();
                return false;
            });
        }
    }

    //method
    var chartFun = function(dataItem) {
        var me = this;
        var item = $('#J_panel' + dataItem.data.panel_id);
        if (item.length > 0) {
            console.log('Error: repeat init chart');
            return;
        }
        //init
        var chart = new ChartLoad(dataItem);
        return chart;
        // chart.node.data('chart', chart);
        // return chart.chartArr;
    }

    //
    return chartFun;
});