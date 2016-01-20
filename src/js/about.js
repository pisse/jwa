require(['zepto','./module/mainbar'], function($,mainbar) {
    var mainbarConf; 

    mainbarConf = {
        title: '关于',
        hideHeadBtn: 'right'
    }


    //mainbar
    mainbar.show(mainbarConf);

})