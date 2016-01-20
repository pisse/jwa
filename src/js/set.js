require(['zepto','./module/mainbar'], function($,mainbar) {
    var mainbarConf = {
        title: $("title").text(),
        hideHeadBtn: 'right'
    }

    //mainbar
    mainbar.show(mainbarConf);

    //退出登录
    $('.login_out_btn').on('tap',function(){
    	window.localStorage.removeItem('erp');
    	window.localStorage.removeItem('passwordxx');
    	window.location.href="login.html";
    })

    //是否接收消息通知
    mainbar.ifNeedNotice = function($dom,key){
        $dom.on('change',function(){
            if(!$(this)[0].checked){
                localStorage.setItem(key,'true');
            }else{
                localStorage.removeItem(key);
            }
        })
    }
    //数据通告
    mainbar.ifNeedNotice($('#switch-notice'),'refuse_notice');
    
    //电商快讯
    mainbar.ifNeedNotice($('#switch-news'),'refuse_news');


})