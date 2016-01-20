/*
* 我的MBA
*
* 说明：我的MBA列表页相关交互，其中将图表拆开为单独模块。
*
* 图表模块见：module/chart/
* 
 */
require([
    'zepto',
    'mustache',
    './module/mainbar',
    './module/chart/load',
    './module/chart/column-double',
    './module/chart/column-single',
    './module/chart/area-single',
    './module/chart/area-ladder',
    './module/chart/area-double',
    './module/chart/pie'
], function($, Mustache, mainbar, C_load, C_columnDouble, C_columnSingle, C_areaSingle, C_areaLadder, C_areaDouble, C_pie) {

    //obj
    var myMBA = {
            bodyNode: null,
            containerNode: null,
            chartData: null,
            init: function() {
                var me = this;
                me.initMainbar();
                me.getData();
                me.bindHanlder();
            },
            initMainbar: function() {
                var me = this;
                //mainbar
                var mainbarConf = {
                    title: '我的MBA',
                    nav: 1,
                    hideHeadBtn: 'all'
                }
                mainbar.show(mainbarConf);
                //
                me.bodyNode = $('body');
                me.containerNode = $('#J_myMBA .content');
                $('#J_myMBA .content').removeClass('hide');
            },
            getData: function(){
                var me = this;
                //loading
                mainbar.loadingShow(me.bodyNode);
                //var url = 'http://mba.jd.com/mba.php?g=my_statistics&c=my_statistics&a=getPanelData';
                var mockUrl = 'http://localhost:8090/panelData';
                // url = '../js/json/chart-list.json';
                mainbar.ajaxData({
                   /* test: {
                        sign: true,
                        port: 8090
                    },*/
                    type: 'POST',
                    url: mockUrl,
                    success: function(data){
                        if(data.status == 1){
                            mainbar.cleanDataPop(me.bodyNode, true);
                            //data
                            me.chartData = data.data;
                            me.sortChartData();
                        }else if(data.status == 0){
                            me.loadDataErr();
                        }
                    },
                    error: function(xhr, errorType){
                        me.loadDataErr();
                    }
                });
            },
            loadDataErr: function(){
                var me = this;
                mainbar.refreshShow(me.bodyNode);
            },
            sortChartData: function(){
                var me = this;
                var dataArr = me.chartData;
                var item, obj, str, itemData = {};
                var isCore = false;
                var otherIndexArr = [];
                var containerNode = me.containerNode;
                //sort core
                var coreTmp = dataArr.splice(1,1);
                dataArr.splice(3,0,coreTmp[0]);
                var loadArr = [];
                //noData
                if(dataArr.length == 0){
                    me.renderChartNo();
                    return;
                }
                //render
                var halfNum = 0, dirCls = 'right';
                for(var i=0, len=dataArr.length; i<6; i++){
                    item = dataArr[i];
                    isCore = false;
                    if(i==0 || i==3){
                        isCore = true;
                    }
                    //dirCls
                    dirCls = '';
                    if(!isCore){
                        if(halfNum%2 != 0){
                            dirCls = 'right';
                        }
                        halfNum++;
                    }
                    itemData = {
                        data: item,
                        isCore: isCore,
                        container: containerNode,
                        cls: dirCls
                    }
                    loadArr.push(C_load(itemData));
                }
            },
            renderChartNo: function(){
                var me = this;
                var tpl = '<div class="no-chart">'+
                            '<div class="info">'+
                              '<p>您还没有订阅指标</p>'+
                              '<p>请登录http://mba.jd.com定制我的MBA</p>'
                            '</div>'
                          '</div>';
                me.containerNode.append(tpl);
            },
            bindHanlder: function() {
                var me = this;
                //details
                $('#J_myMBA').on('tap', '.chart-item', function(e) {
                    var status = $(this).attr('data-status');
                    var url = 'myMBA-details.html';
                    if(status && status == '1'){
                        var id = $(this).attr('id').replace('J_panel','');
                        window.location.href = url + "?id="+id;
                    }
                });
                //refresh
                me.bodyNode.on('click', '.refresh-pop', function(e){
                    me.getData();
                });
            }
        }
        //init
    myMBA.init();
});