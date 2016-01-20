/*
* 详情页
*
* 说明：详情页相关交互，其中筛选项配置、图表配置拆开为单独模块。
*
* PS：配置项使用的模板，见myMBA-details.html中的底部script标签内的内容。
* 
 */
require([
    'zepto',
    'mustache',
    './module/mainbar',
    './module/pop',
    './module/calendar/index',
    './module/chart/config',
    './module/chart/filter-type',
    './module/chart/area-multi',
    // 'pcVersion',
], function($, Mustache, mainbar, pop, calendar, globalConf, C_filterType, C_areaMulti) {
    //config-loadjs
    require.config({
        paths: { pcVersion: 'http://mba.jd.com/res/js/wirelessFilter' }
    });

    //obj
    var details = {
        containerNode: null,
        filterNode: null,
        myPop: null,
        chartStart: {},
        chartDelta: {},
        dataConf: null,
        test: {
            sign: true,
            port: 3089
        },
        chartDataArr: [],
        queryData: null,
        totalNum: -1,
        checkDataObj: {},
        //图表数据
        chartDataObj: {
            online: [],
            offline: [],
            dataSearch: {}
        },
        dayTime: 24*3600000,
        chartType: 'single',  //onMixOff-混合数据|single-单组数据
        init: function() {
            var me = this;
            me.checkDataObj = globalConf.checkDataObj;
            //fun
            me.initMainbar();
            me.initData();
        },
        initMainbar: function() {
            var me = this;
            //mainbar
            var mainbarConf = {
                title: ' ',
                nav: 1
            }
            mainbar.show(mainbarConf);
            //header
            $('#J_header .right-btn').addClass('hide');
            //vars
            me.bodyNode = $('body');
            me.containerNode = $('#J_myMBADetails');
            me.filterNode = $('#J_filter');
            me.myPop = new pop();
        },
        initData: function(){
            var me = this;
            //loading
            mainbar.loadingShow(me.bodyNode);
            //data
            var url = window.location.href;
            var id = url.split('?')[1].split('=');
            if(id[0] == 'id'){
                id = id[1];
            }
            url = 'http://mba.jd.com/mba.php?g=my_statistics&c=my_statistics&a=getPanelData';
            var mockUrl = 'http://localhost:8090/panelData';
            //ajax
            mainbar.ajaxData({
                /*test: me.test,*/
                // type: 'POST',
                url: mockUrl,
                data: {
                    panel_id: id
                },
                success: function(data){
                    if(data.status ==1){
                        data = data.data[0];
                        me.data = data;
                        //fun
                        me.initConfig();
                        me.loadChartData();
                    }else{
                        me.loadDataErr(me.bodyNode);
                    }
                },
                error: function(err, type){
                    me.loadDataErr(me.bodyNode);
                }
            });
        },
        loadDataErr: function(node, sizeType){
            var me = this;
            mainbar.refreshShow(node, sizeType);
        },
        //初始化配置
        initConfig: function(){
            var me = this;
            var option = me.data.config.option;
            //filter-date
            if(option.is_date_required == 1){
                me.containerNode.find('.filter-day').removeClass('hide');
                me.initCalendar();
            }
            //show
            me.containerNode.find('.content').removeClass('hide');
            //init
            me.loadVersion();
            me.bindHandler();
            //search-query
            var dataJson = $.parseJSON(me.data.data_json);
            var searchData = dataJson[0].data;
            searchData = me.paramsUnserialize(searchData);
            // console.log(1111,searchData)
            //date
            var date = new Date() - me.dayTime;
            date = new Date(date);
            var startDate = date.getTime() - 6*me.dayTime;
            startDate = new Date(startDate);
            me.searchData = {
                wireless_type: searchData.wireless_type,
                app_type: searchData.app_type,
                version_type: searchData.version_type,
                start_date: me.formatDate(startDate),
                end_date: me.formatDate(date)
            }
            // console.log(me.searchData)
        },
        //version config
        loadVersion: function(){
            var me = this;
            require(['pcVersion'], function() {
                //getConf
                var key = me.data.report_key;
                key = key.replace('vip_','');
                //filterType
                C_filterType.init();
                var obj = C_filterType.getTypeConf(key);
                if(obj && obj.filterConf){
                    $('#J_header .right-btn').removeClass('hide');
                    me.filterConf = obj;
                    // obj.filterConf.showLevel = 3;
                    //vars
                    var dftVersions = G.wirelessFilter.DftVersions;
                    var template = $('#tpl-filterType').html();
                    Mustache.parse(template); // optional, speeds up future uses
                    var threeTpl = $('#tpl-filterVersion').html();
                    Mustache.parse(threeTpl);
                    var threeStr;
                    //tpl
                    var tplData = C_filterType.getFilterData(obj.filterConf);
                    tplData.haslist = function(){
                        if(this.name == G.wirelessFilter.WIRELESS_TYPE.APP_NAME){
                            return true;
                        }
                    }
                    tplData.sublist = function(){
                        return tplData.app_type;
                    }
                    tplData.sublistNext = function(){
                        var tmp = dftVersions[this.value];
                        if(tmp && tmp.length>0){
                            tmp = C_filterType.getVersions(obj.filterConf, this.value);
                            //three-list
                            var threeObj = {
                                type : this.value,
                                normal: tmp
                            }
                            if(obj.filterConf.showLevel == 3){
                                threeObj.origin = tmp
                                delete threeObj.normal;
                            }
                            threeStr = Mustache.render(threeTpl, threeObj);
                            me.filterNode.append(threeStr);
                            return true;
                        }
                    }
                    tplData.sublistNextArrow = function(){
                        var tmp = dftVersions[this.value];
                        if(tmp && tmp.length>0){
                            return true;
                        }
                    }
                    //render
                    var str = Mustache.render(template, tplData);
                    var wirelessNode = $('.list-wireless');
                    wirelessNode.html(str);
                    //check-all
                    if(wirelessNode.find('dt').length<=2){
                        wirelessNode.find('.all').addClass('hide');
                    }
                    //for test
                    // me.searchData = {
                    //     wireless_type: 'A',
                    //     app_type: 'iphone,android',
                    //     // showLevel: 3,
                    //     // app_type: 'all',
                    //     version_type: 'all'
                    //     // version_type: '3.7.1,3.9.0,3.9.1,3.9.2'
                    // }
                    //init select
                    me.filterNode.attr('status','init');
                    var wireless = me.searchData.wireless_type;
                    var app = me.searchData.app_type;
                    var version = me.searchData.version_type;
                    // wireless = wireless == "ALL" ?  wireless.toLocaleLowerCase() : wireless;
                    var typeNode = me.filterNode.find('dt[data-val="'+wireless+'"]');
                    typeNode.trigger('tap').next('dd').addClass('show');
                    //check app
                    if(wireless == G.wirelessFilter.WIRELESS_TYPE.APP){
                        var arr = app.split(',');
                        var node = typeNode.next('dd');
                        var itemNode, subNode;
                        var versionArr = version.split(',');
                        $.each(arr, function(index, item){
                            itemNode = node.find('li[data-val="'+item+'"]')
                            //three list
                            if(app != 'all'){
                                subNode = $('.'+itemNode.attr('data-sub'));
                                if(version == 'all'){
                                    subNode.find('.all').trigger('tap');
                                }else{
                                    var vitemStr = '', vitemNode, vtmpStr = '';
                                    var vitemCut;
                                    $.each(versionArr,function(vindex, vitem){
                                        vitemCut = vitem.match(/\d\.\d/g)[0];
                                        //删除重复
                                        if(vitemStr!=vitemCut){
                                            vitemNode ? vitemNode.find('.more').text('(pc端已订阅：'+vtmpStr+')') : -1;
                                            vtmpStr = '';
                                            vitemStr = vitemCut;
                                            vitemNode = subNode.find('li[data-val="'+vitemCut+'"]');
                                            vitemNode.trigger('tap');
                                        }
                                        vtmpStr += vitem+';';
                                    });
                                    vitemNode.find('.more').text('(pc端已订阅：'+vtmpStr+')')
                                }
                            }else{
                                me.filterNode.find('.part-sub .all').trigger('tap');
                            }
                            //parent select
                            itemNode.trigger('tap');
                        });
                    }
                    me.filterNode.attr('status','ok');
                    // console.log(me.searchData);
                }
            });
        },
        bindHandler: function() {
            var me = this;
            //data-refresh
            me.bodyNode.on('click', '.refresh-pop', function(e){
                me.initData();
            });
            //chart-bd
            $('#J_chartDetails .details-bd').on('touchstart', function(e){
                var touches = e.touches[0];
                me.chartStart = {
                    x: touches.pageX,
                    y: touches.pageY
                }
                me.chartDelta = {};
            });
            $('#J_chartDetails .details-bd').on('touchmove', function(e){
                // ensure swiping with one touch and not pinching
                if ( e.touches.length > 1 || e.scale && e.scale !== 1) return
                var touches = e.touches[0];
                //moveData
                me.chartDelta = {
                  x: touches.pageX - me.chartStart.x,
                  y: touches.pageY - me.chartStart.y
                }
                var isScrolling = Math.abs(me.chartDelta.x) < Math.abs(me.chartDelta.y);
                //check
                if(!isScrolling){
                    e.preventDefault();
                }
            });
            //tabbar
            me.containerNode.find('.tabbar li').on('tap', function(e) {
                var item = $(this);
                if (item.hasClass('cur')) {
                    return;
                }
                var preTab = me.containerNode.find('.tabbar .cur');
                me.containerNode.find('.tabbar li').removeClass('cur');
                item.addClass('cur');
                //customDay
                var id = item.attr('id');
                id = id ? id : '';
                if (id != 'J_customDay') {
                    me.cleanPopup();
                    //get data
                    var num = $(this).attr('data-day');
                    var obj = {};
                    if(num != 'today'){
                        var date = new Date() - me.dayTime;
                        date = new Date(date);
                        var startDate = date.getTime() - (num-1)*me.dayTime;
                        startDate = new Date(startDate);
                        obj = {
                            start_date: me.formatDate(startDate),
                            end_date: me.formatDate(date)
                        };
                        $('.right-btn').removeClass('hide');
                    }else{
                        obj.type = num;
                        $('.right-btn').addClass('hide');
                    }
                    me.filterChart('date', obj);
                }else{
                    me.preTab = preTab;
                }
            });
            //flter
            $('#J_header .right-btn').on('click', function(e) {
                if(me.filterNode.hasClass('show')){
                    return;
                }
                me.cleanPopup();
                $('.overlay').addClass('show filter-overlay');
                me.filterNode.addClass('show');
            });
            $('.overlay').on('click', function(e) {
                var item = $(this);
                if(item.hasClass('filter-overlay')){
                    $('.overlay').removeClass('show filter-overlay');
                    me.filterNode.removeClass('show');    
                }
            });
            me.filterNode.find('.list-extend').on('tap', 'dt', function(e) {
                var item = $(this);
                //clean
                var parent = item.parents('.list-extend');
                if (item.find('.arrow').length == 0) {
                    parent.find('dd').removeClass('show');
                    parent.find('dt').removeClass('extend');
                }else{//sublist
                    item.toggleClass('extend');
                    item.next().toggleClass('show');
                }
                if(item.hasClass('selected')){
                    return;
                }
                parent.find('dt').removeClass('selected');
                //cur
                item.addClass('selected');
            });
            me.filterNode.find('.list-extend').on('tap', 'li', function(e) {
                var item = $(this);
                var target = $(e.target);
                //target-extend
                var sublist = item.attr('data-sub');
                if(target.hasClass('arrow')){
                    //sublist
                    if (sublist) {
                        me.filterNode.find('.' + sublist).addClass('show');
                        return;
                    }
                    return;
                }
                item.toggleClass('selected');
                //下级无选中时，自动全选
                // item.find('.subtxt').removeClass('hide');
                if(sublist && item.hasClass('selected')){
                    var itemInfo = item.find('.info').text();
                    if(itemInfo.length ==0 || itemInfo.match('全部')){
                        me.filterNode.find('.'+sublist+' li').addClass('selected');
                    }
                }else{
                    // item.find('.subtxt').addClass('hide');
                }
                //all
                var parent = item.parent();
                if (item.hasClass('all')) {
                    me.checkAllListNode(item, parent.find('li'))
                } else {
                    me.checkAllList(item, parent);
                }
                //subTxt-parent-上级级联
                var subParent = parent.parents('dd').prev();
                var listNode = parent.find('li');
                me.fillSubTxt(subParent, listNode);
                //subTxt-next-sub-下级级联
                if(item.find('.arrow').length>0 && item.hasClass('selected')){
                    item.find('.subtxt').removeClass('hide');
                    if (sublist) {
                        var subNode = me.filterNode.find('.' + sublist);
                        me.selectNextlist(item, subNode.find('li'), 'submit');
                    }
                }
            });
            //btn
            me.filterNode.on('tap', '.part .btn', function(e) {
                var item = $(this);
                var parent = item.parents('.part');
                var status = '';
                if (item.hasClass('btn-submit')) {
                    status = 'submit';
                } else if (item.hasClass('btn-cancel')) {
                    status = 'cancel';
                }
                parent.attr('data-status', status);
                parent.removeClass('show');
                //main
                if (parent.hasClass('part-main')) {
                    // me.filter
                    $('.overlay').click();
                    var obj = me.getFilterCate();
                    me.filterChart('cate', obj);
                }else{//subplist-part
                    var clsData = parent.attr('class').match(/partlist-\w*/g)[0];
                    var subParent = me.filterNode.find('[data-sub="'+clsData+'"]');
                    var listNode = parent.find('li');
                    me.selectNextlist(subParent, listNode, status);

                    // var clsSign = subParent.hasClass('selected');
                    // var sign = false;
                    // if(status == 'submit'){
                    //     subParent.find('.subtxt').removeClass('hide')
                    //     me.fillSubTxt(subParent, listNode);
                    //     sign = !clsSign;
                    //     me.cleanSubmore(parent);
                    // }else{
                    //     subParent.find('.subtxt').addClass('hide')
                    //     sign = clsSign;
                    // }
                    // sign ? subParent.trigger('tap') : -1;
                    
                }
            });
            //three list
            me.filterNode.on('tap', '.list-select-muti li', function(e) {
                var item = $(this);
                item.toggleClass('selected');
                //all
                var parent = item.parent();
                me.cleanSubmore(parent);
                if (item.hasClass('all')) {
                    me.checkAllListNode(item, parent.find('li'))
                    return;
                }
                me.checkAllList(item, parent);
            });
        },
        dataResize: function() {
            var me = this;
            var dataListNode = me.containerNode.find('.data-list');
            var top = dataListNode.position().top;
            top = parseInt(top);
            var contentH = me.containerNode.find('.content').height();
            var dataHeight = contentH - top - 10;
            dataListNode.css({
                height: dataHeight
            });
        },
        initCalendar: function() {
            var me = this;
            $('#J_customDay').calendar({
                id: 'J_customCalendar',
                type: 'sequent',
                rangeMonth: 6,
                rangeSelectLimit: 30,
                selectDate: new Date(),
                reverse: true,
                disableDate: {
                    date: new Date().toDateString(),
                    type: 'after'
                },
                scrollCls : 'jdui_calendar_bd',
                selecteCallback: function(str, sign){
                    var node = $('#J_customCalendar');
                    var listNode = node.find('.selected');
                    var listLen = listNode.length;
                    //clean
                    node.removeClass('sequent-list');
                    listNode.removeClass('start').removeClass('end');
                    //
                    if(listLen>1){
                        node.addClass('sequent-list');
                        listNode.eq(0).addClass('start');
                        listNode.eq(listLen-1).addClass('end');
                    }
                    //outRange
                    if(sign=='outRange'){
                        me.myPop.toast('超过30天了，请重新选择~', 3000);
                    }
                },
                showPanelCallback: function(){
                    me.containerNode.addClass('custom-day');
                },
                closePanelCallback: function(data) {
                    me.containerNode.removeClass('custom-day');
                    //data
                    var status = $('#J_customCalendar').attr('data-status');
                    if(status == 'submit'){
                        var obj = {
                            start_date: data.startStr,
                            end_date: data.endStr
                        };
                        me.filterChart('date', obj);
                    }else{
                        me.preTab && me.preTab.trigger('tap');
                    }
                }
            });

        },
        loadChartData: function(type, isToday){
            var me = this;
            //vars
            var data = me.data;
            var dataJson = $.parseJSON(data.data_json);
            var requestArr = data.request_id.split(',');
            //search
            var searchQuery = '';
            if(type == 'search'){
                searchQuery = $.param(me.searchData);
            }
            me.chartDataArr = [];
            //
            var checkTotal = false;
            if(me.totalNum == -1){
                me.totalNum = requestArr.length;
                checkTotal = true;
            }
            me.dataEmpty = false;
            var id, itemJson, path;
            var i,len;
            if(type != 'search'){
                for(i=0,len=requestArr.length; i<len; i++){
                    id = requestArr[i];
                    itemJson = dataJson[i];
                    // console.log(itemJson)
                    //剥离‘饼图’、‘柱状图’的类型
                    if(globalConf.removeTypeStr.match(itemJson.chart_type)){
                        if(checkTotal){
                            me.totalNum--;
                        }
                        continue;
                    }
                    //拆分'离线|实时'数据
                    path = itemJson.path;
                    if(me.checkDataObj.trend == path){//实时数据
                        me.chartDataObj.online.push(id);
                    }else{
                        me.chartDataObj.offline.push(id);
                    }
                    me.chartDataObj.dataSearch[id] = itemJson.data
                }
                //check-online
                if(me.chartDataObj.online.length>0){
                    $('.filter-day').addClass('filter-online');
                }else{
                    $('.filter-day li').eq(0).remove();
                }
            }
            //load-offline
            var arr = me.chartDataObj.offline;
            if(arr.length == 0 && me.chartDataObj.online.length>0){//只有实时数据时
                arr = me.chartDataObj.online;
            }
            if(isToday){
                arr = me.chartDataObj.online;
            }
            var loadItem, loadSearch, loadObj;
            for(i=0,len=arr.length; i<len; i++){
                loadItem = arr[i];
                if(type == 'search'){
                    loadSearch = me.chartDataObj.dataSearch[loadItem];
                    if(!isToday){
                        loadSearch = me.paramsUnserialize(loadSearch);
                        loadObj = $.extend(loadSearch, me.searchData);
                        loadSearch = $.param(loadObj);
                    }
                    searchQuery = loadSearch;
                }
                me.loadChartItem(loadItem, searchQuery, len, dataJson[i]['chart_type']);
            }
        },
        loadChartItem: function(id, searchQuery, len, type){
            var me = this;
            var queryData = {
                request_id : id
            };
            if(searchQuery){
                queryData.is_search = 1;
                queryData.search_data = searchQuery;
            }
            var url = 'http://mba.jd.com/mba.php?g=my_statistics&c=my_statistics&a=getResponseData';

            var mockUrl = 'http://localhost:8090/filterChart.do?id=' + type;

            mainbar.ajaxData({
                //test: me.test,
                url: mockUrl,
                data: queryData,
                // type: 'POST',
                success: function(data){
                    if(data.status == 1){
                        me.chartDataArr.push(data.data);
                        //check-empty
                        if(data.data.data.length == 0){
                            me.dataEmpty = true;
                        }
                        if(me.chartDataArr.length == len){
                            //clean
                            mainbar.cleanDataPop(me.bodyNode, true);
                            //data
                            var isSearch = searchQuery ? true : false;
                            me.renderChartData(me.chartDataArr,isSearch);
                            //save data
                            var curTab = $('.tabbar .cur');
                            var locData = $.extend(true,[],me.chartDataArr);
                            curTab.data('locData', locData);
                        }
                    }else{
                        me.loadDataErr(me.bodyNode, true);
                    }
                },
                error: function(err, type){
                    me.loadDataErr(me.bodyNode, true);
                }
            })
        },
        renderChartData: function(data, isSearch){
            var me = this;
            var chartNode = me.containerNode.find('.chart-details .details-bd');
            var obj = {
                id: me.data.panel_id,
                container: chartNode,
                data: data,
                isSearch: isSearch
            }
            if(me.dataEmpty){
                $('#J_chartDetails').addClass('hide');
                $('.chart-details-no').removeClass('hide');
                return;
            }
            $('.chart-details-no').addClass('hide');
            $('#J_chartDetails').removeClass('hide');
            me.chart = C_areaMulti(obj);


            //for test
            // setTimeout(function(e){
                // $('.right-btn').click();
            // },1000);
        },
        checkSublist: function(item) {
            var me = this;
            if (item.find('.arrow').length > 0) {
                item.toggleClass('extend');
                item.next().toggleClass('show');
            }
        },
        checkAllList: function(item, parent) {
            var me = this;
            var selectLen = parent.find('.selected').length;
            var totalLen = parent.find('li').length;
            if (parent.find('.all').length > 0) {
                if (selectLen >= totalLen - 1 && item.hasClass('selected')) {
                    parent.find('.all').addClass('selected');
                } else {
                    parent.find('.all').removeClass('selected');
                }

            }
        },
        checkAllListNode: function(item, listNode){
            var me = this;
            //all-clean
            listNode.not(item).removeClass('selected');
            if(item.hasClass('selected')){
                listNode.not(item).trigger('tap');
            }
        },
        cleanPopup: function(){
            var me = this;
            $('#J_customDay').calendar('hide');
            $('.overlay').click();
        },
        cleanSubmore: function(parent){
            var me = this;
            if(me.filterNode.attr('status') == 'ok'){
                parent.find('.more').remove();    
            }
        },
        fillSubTxt: function(subParent, listNode){
            var me = this;
            //all
            var selectedList = listNode.filter('.selected');
            var len = selectedList.filter('.all').length;
            var txt = '';
            subParent.removeClass('part-selected');
            var partCls = 'part-selected';
            if(len>0){
                txt = '全部';
                partCls = '';
            }else{
                var item, itemTxt;
                for(var i=0, ilen=selectedList.length; i<ilen; i++){
                    item = selectedList.eq(i);
                    itemTxt = item.find('.txt').text();
                    txt += itemTxt+';';
                }  
            }
            if(txt.length>0){
                subParent.find('.subtxt').removeClass('hide');
                subParent.find('.info').html(txt);
                subParent.addClass(partCls);
            }else{
                subParent.find('.subtxt').addClass('hide');
            }
            // console.log(txt)
        },
        //filter
        filterChart: function(type, data) {
            var me = this;
            var searchData = me.searchData;
            var curTab = $('.tabbar .cur');
            var locData = curTab.data('locData');
            var searchType = 'search';
            var isToday = false;
            //data
            $.extend(searchData, data);
            //check loc
            if(type == 'date'){
                var id = curTab.attr('id');
                if(id && id == 'J_customDay'){
                    locData = '';
                }
                if(data.type && data.type == 'today'){
                    isToday = true;
                }
            }else if(type == 'cate'){
                // $.extend(searchData, data);
                $('.tabbar li').data('locData', '');    //clean loc data
                locData = '';
            }
            //check-loc
            if(locData){
                me.dataEmpty = false;
                me.renderChartData(locData, searchType)
            }else{
                //loading
                mainbar.loadingShow(me.bodyNode);
                me.loadChartData(searchType, isToday);
            }
        },
        getFilterCate: function(){
            var me = this;
            var obj = {
                wireless_type: '',
                app_type: [],
                version_type: ''
            };
            var wirelessNode = me.filterNode.find('dt.selected');
            obj.wireless_type = wirelessNode.attr('data-val');
            var filterConf = me.filterConf.filterConf;
            var twoList = wirelessNode.next('dd').find('.selected');
            var threeList;
            //showLevel=3
            if(filterConf.showLevel == 3){
                // obj.app_type
                var appArr = [];
                $.each(twoList, function(index, item){
                    item = $(item);
                    //three list
                    if(item.find('.arrow').length>0){
                        threeList = me.filterNode.find('.'+item.attr('data-sub'));
                        threeList = threeList.find('.selected');
                        threeList = threeList.not('.all');
                        $.each(threeList, function(appIndex, appItem){
                            appArr.push($(appItem).attr('data-val'));
                        });
                    }
                });
                obj.app_type = appArr.join(',');
                obj.version_type = 'all';
                // console.log('11filter-select***',obj);
                return obj;
            }
            //showLevel=2
            var versionStr;
            if(wirelessNode.find('.arrow').length==0 || twoList.filter('.all').length>0){
                obj.app_type = ['all'];
                obj.version_type = 'all';
            }else{
                $.each(twoList, function(index, item){
                    item = $(item);
                    versionStr = [];
                    twoItemVal = item.attr('data-val');
                    obj.app_type.push(twoItemVal);
                    //three list
                    if(item.find('.arrow').length>0){
                        threeList = me.filterNode.find('.'+item.attr('data-sub'));
                        threeList = threeList.find('.selected');
                        if(threeList.filter('.all').length==1){//threelist-all
                            obj.version_type += 'all,'
                        }else{
                            $.each(threeList, function(index, vitem){
                                vitem = $(vitem);
                                versionStr.push(vitem.attr('data-val'))
                            });
                            if(filterConf.useSmallVersion){
                                obj.version_type += C_filterType.getLittleVersions(twoItemVal, versionStr)+',';
                            }else{
                                obj.version_type = versionStr.join(',');
                            }    
                        }
                    }else{//threelist-no
                        obj.version_type += 'all,'
                    }
                });
                //version    
                var tmp = obj.version_type.split(',');
                tmp = me.uniqArray(tmp).join(',');
                obj.version_type = tmp;
            }
            obj.app_type = obj.app_type.join(',');
            // console.log('filter-select===',obj);
            return obj;
        },
        selectNextlist: function(parent, listNode, status){
            var me = this;
            // var clsData = parent.attr('class').match(/partlist-\w*/g)[0];
            // var subParent = me.filterNode.find('[data-sub="'+clsData+'"]');
            // var listNode = parent.find('li');
            var clsSign = parent.hasClass('selected');
            var sign = false;
            if(status == 'submit'){
                parent.find('.subtxt').removeClass('hide')
                me.fillSubTxt(parent, listNode);
                sign = !clsSign;
                me.cleanSubmore(parent);
            }else{
                parent.find('.subtxt').addClass('hide')
                sign = clsSign;
            }
            sign ? parent.trigger('tap') : -1;
        },
        //utils
        paramsUnserialize: function(str) {
            var ret = {},
                seg = str.replace(/^\?/, '').split('&'),
                len = seg.length,
                s;
            for (var i=0; i < len; i++) {
                if (!seg[i]) {
                    continue;
                }
                s = seg[i].split('=');
                ret[s[0]] = s[1];
            }
            return ret;
        },
        formatDate: function(date){
            var year = date.getFullYear();
            var month = date.getMonth()+1;
            month = month<=9 ? '0'+month : month;
            var day = date.getDate();
            day = day<=9 ? '0'+day: day;
            var seq = '-';
            var str = year+seq+month+seq+day;
            return str;
        },
        uniqArray: function(arr){//去重
            var item;
            var resultArr = [], tmpArr = [];
            var str = arr.join('|');
            for(var i=0, len=arr.length;i <len; i++){
                item = arr[i];
                if(item.length>0 && tmpArr[item] != 1){
                    tmpArr[item] = 1;
                    resultArr.push(item);
                }
                //check
                str = str.replace(item+'|','');
                if(str.length == 0){
                    break;
                }
            }
            return resultArr;
        }
    }

    //init
    details.init();
});