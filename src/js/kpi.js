require(['zepto','./module/mainbar'], function($,mainbar) {
    var mainbarConf = {
        title: 'KPI',
        nav:3,
        hideHeadBtn: 'all'
    }

    //mainbar
    mainbar.show(mainbarConf);
})