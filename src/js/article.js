require(['zepto','./module/mainbar','./module/pop'], function($,mainbar,pop) {
    var mbaArticle = {},
    	$content = $('.content'),
    	mainbarConf; 
    mbaArticle.searchInfo = [];
    //拆分location.search
    (function splitSearch(){
        var url=window.location.search;
        if(url.indexOf("?")!=-1) { 
            var str = url.substr(1) 
            strs = str.split("&"); 
            var key=new Array(strs.length);
            var value=new Array(strs.length);
            for(i=0;i<strs.length;i++) { 
                key[i]=strs[i].split("=")[0] 
                value[i]=unescape(strs[i].split("=")[1]);
                mbaArticle.searchInfo[key[i]] = value[i];
           } 
        } 
    })()

    mainbarConf = {
        title: mbaArticle.searchInfo['title'],
        hideHeadBtn: 'right'
    }
    //var myPop = new pop();

    //mainbar
    mainbar.show(mainbarConf);

    mbaArticle.init = function(){
    	//展示loading动画
        mainbar.loadingShow($content);
    	//ajax start
        $.ajax({
            type: 'POST',
            url: 'http://mba.jd.com/mba.php?g=messages&c=mobile_message&a=getMessageContent&message_id='+mbaArticle.searchInfo['id'],
            dataType: 'json',
            success: function(data) {
            	mainbar.cleanDataPop($content,true);
                $('.article').html(data.data.content);
            },
            error: function(xhr, type) {
                setTimeout(whenError,1000);
            }
        })
//ajax end
		function whenError(){
            mainbar.refreshShow($content);
            $content.find(".refresh-pop").one("tap",function(){
                mbaArticle.init();
            })
        }
    }

   	mbaArticle.init();

    

})