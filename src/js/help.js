require(['zepto','./module/mainbar','./module/pop'], function($,mainbar,pop) {
    var mainbarConf = {
        title: '帮助与反馈'
    },
    myPop = new pop();

    //mainbar
    mainbar.show(mainbarConf);

    $("header .right-btn span").addClass('disable');

    $('.input_suggest').on('input paste',function(){
        if ($('.input_suggest').val().length >= 10) {
            $("header .right-btn span").removeClass('disable');
        }else{
            $("header .right-btn span").addClass('disable');
        }
    })

    $("header .right-btn span").on("tap",function(){
        var submitUrl = 'http://mba.jd.com/mba.php?g=messages&c=mobile_message&a=pushAdvice';
        var titleForSub,contentForSub;
        if($(this).hasClass('disable')){
            myPop.alert("请输入问题或建议",function(){
                return false;
            });
            return false;
        }
    	if($('.input_suggest').val().length < 10){
    		myPop.alert("不得少于10个字",function(){
    			return false;
    		});
    	}else{
            titleForSub = localStorage.erp+'提供的反馈';
    		$.post(submitUrl, { title: titleForSub, content: $('.input_suggest').val() }, function(response){
                 if(response == 1){
                    myPop.alert("提交成功！",function(){
                        $('.input_suggest').val("");
                    });
                 }else{
                    myPop.toast("提交失败！",3000);
                 }
            })
    	}
    });

})