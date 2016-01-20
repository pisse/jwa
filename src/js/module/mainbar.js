/*
 * 全局js
 *
 * 说明：全局公共使用的函数
 * 
 */
define('./module/mainbar', ['zepto'], function() {
    //tpl
    var tplHeader = 
        '<header id="J_header">'+
          '<a class="left-btn" href="javascript:history.back();"><span></span></a>'+
          '<h1>我的MBA</h1>'+
          '<a class="right-btn" href="javascript:void(0);"><span></span></a>'+
        '</header>';

    var tplFooter = 
        '<footer class="navbar">'+
          '<a href="index.html">我的MBA</a>'+
          '<a href="hot-index.html">热图</a>'+
          '<a href="kpi.html">KPI</a>'+
          '<a href="my_index.html" class="my-index">我的</a>'+
        '</footer>';


    //
    var mainbar = {
        headNode : null,
        renderHead: function(title){
            var me = this;
            var node = $(tplHeader);
            node.find('h1').text(title);
            me.headNode = node;
            //add
            $('.container').append(node);
        },
        renderNav: function(num){
            var me = this;
            var index = num-1<0 ? 0 : num-1;
            var node = $(tplFooter);
            node.find('a').eq(index).addClass('cur');
            //add
            $('.container').append(node);
        },
        headItem: function(str){//all: 全部 | left: 左侧按钮 | right: 右侧按钮
            var me = this;
            if(str == 'all'){
                me.headNode.find('a').remove();
            }else if(str.length>0){
                me.headNode.find('.'+str+'-btn').remove();
            }
        }
    }
    //
    var mainbarMethod = {
        show: function(config){
            if(config.title){
                mainbar.renderHead(config.title);
            }
            if(config.nav){
                mainbar.renderNav(config.nav);   
            }
            if(config.hideHeadBtn && config.hideHeadBtn.length>0){
                mainbar.headItem(config.hideHeadBtn);
            }
            //if has news
            if(!localStorage.getItem('refuse_notice')){
                this.ifHasNews('通告');
            }
            if(!localStorage.getItem('refuse_news')){
                this.ifHasNews('快讯');
            }
        },
        formatURL: function(url, port){
            if(!port){
                port = 3088;
            }
            //
            if(url.match(/file\:/g)){
                return url;
            }
            // url = 'http://mba.jd.com/json.php?biz=realtime&mod=RealTimeStat&act=GetDetailData&start_date=2015-11-19&page=1'
            // url = 'http://mba.jd.com/mba.php?g=mobile_analyse&c=user_data&a=get_all_data';
            var host = window.location.host;
            host = host.split(':')[0];
            host = "http://"+host+':'+port+'/';
            var replace = url.match(/http:\/\/.*\//g)[0];
            var newURL = url.replace(replace, host);
            return newURL;
        },
        //overlay
        checkOverlay: function(){
            var me = this;
            var node = $('.overlay');
            if(node.length>0){
                node.addClass('show')
                return;
            }
            var tpl = '<div class="overlay"></div>';
            node = $(tpl);
            node.addClass('show');
            //add
            $('.content').append(node);
        },
        //tpl-loading
        loadingShow: function(node, type, hideOverlay){
            var me = this;
            var loadingNode = node.find('.loading-pop');
            var cls = '';
            if(type == 'small'){
                cls = 's-loading';
            }else if(type == 'list'){
                cls = 's-loading-list';
            }
            if(!hideOverlay){
                me.checkOverlay();    
            }
            //clean
            me.cleanDataPop(node);
            if(loadingNode.length>0){
                loadingNode.removeClass('hide');
                return;
            }
            var tpl = '<div class="loading-pop chart-pop '+cls+'">'+
                         '<div class="spinner">'+
                            '<div class="dot1"></div>'+
                            '<div class="dot2"></div>'+
                         '</div>'+
                         '<div class="txt">数据加载中</div>'+
                     '</div>';
            node.append(tpl);
        },
        //tpl-refresh
        refreshShow: function(node, type){
            var me = this;
            var refreshNode = node.find('.refresh-pop');
            var cls = '';
            if(type == 'small'){
                cls = 's-refresh';
            }
            //clean
            me.cleanDataPop(node);
            if(refreshNode.length>0){
                refreshNode.removeClass('hide');
                return;
            }
            var tpl = '<div class="refresh-pop chart-pop '+cls+'">'+
                        '<p>加载失败，点击刷新</p>'+
                    '</div>';
            node.append(tpl);
        },
        //clean chart-pop
        cleanDataPop: function(node, deepClean){
            var me = this;
            node.find('.chart-pop').addClass('hide');
            if(deepClean){
                $('.overlay').removeClass('show');    
            }
        },
        //utils-ajax
        ajaxData: function(config){
            var me = this;
            var opt = {
                type : 'GET',
                dataType: 'json',
                data: {},
                xhrFields: {}
            }
            $.extend(opt, config);
            //for test
            if(opt.test){
                opt.url = me.formatURL(opt.url, opt.test.port);
                opt.xhrFields = {
                   withCredentials: true
                }
                delete opt.test;
            }
            //ajax
            $.ajax({
                url: opt.url,
                type: opt.type,
                data: opt.data,
                xhrFields: opt.xhrFields,
                dataType: 'json',
                success: function(data){
                    config.success && config.success(data);
                },
                error: function(xhr, error){
                    config.error && config.error(xhr, error);  
                }
            });
        },
        //if has news
        ifHasNews: function(messageType){
            var localItemKey,localTime;
            if(messageType === '通告'){
                localItemKey = 'noticeLastTime';
            }else if(messageType === '快讯'){
                localItemKey = 'newsLastTime';
            };
            localTime = parseInt(localStorage.getItem(localItemKey));
            $.ajax({
                type: 'GET',
                url: 'http://mba.jd.com/mba.php',
                data: {
                    g:'messages',
                    c:'mobile_message',
                    a:'getMessageList',
                    message_type:messageType,
                    page:'1',
                    limit:'1'
                },
                dataType: 'json',
                success: function(d) {
                    var msg = d.data.messages,
                        thisTime;
                        if(!msg.length){
                            return;
                        }
                        thisTime = parseInt(msg[0].time);
                    if(thisTime > localTime){
                        $('.my-index').addClass('has-news');
                    };
                }, 
                error: function(xhr, type) {
                    console.log('无法获取消息列表数据!');
                }
            });


        }
    };
    //
    return mainbarMethod;
});