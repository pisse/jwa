define('./module/pop',['zepto'],function($){
	function Pop(){
		var l = $(".db-pop").length;
		this.init = (function(){
			$("body").append('<div class="db-pop pop'+l+'"></div>');
			if(!l){
				$(".db-pop").after('<div class="overlay"></div>');
			}			
		})()
		this.toast = function(msg,sec){
			var popDom = $(".pop"+l);
	    	function hid(){
	    		popDom.css("opacity",0);
	    		setTimeout(function(){popDom.hide()},500);
	    	}
    		popDom.html('<div class="pop-con">'+msg+'</div>');
    		popDom.show().css({
    			"padding-bottom":"0",
    			"transform":"translate(-50%,-50%)"
    		});
    		setTimeout(hid,sec);
		}

		this.alert = function(msg,fn){
			var popDom = $(".pop"+l);
			popDom.html('<div class="pop-con">'+msg+'</div><span class="confirm">确定</span>');
    		popDom.css({
    			"display":"block",
    			"padding-bottom":"15px",
    			"opacity":"1"
    		});
    		$(".overlay").show();
    		popDom.find(".confirm").on("tap",function(){
    			if(fn){
    				fn();
    			}
    			popDom.hide();
    			$(".overlay").hide();
    		})
    	}
        //点击确定执行fn，点击取消执行fn2
    	this.confirm = function(msg,fn,fn2){
    		var popDom = $(".pop"+l);
    		popDom.html('<div class="pop-con">'+msg+'</div><div class="pop_btn"><span class="cancel">取消</span><span class="confirm">确定</span></div>');
    		popDom.css({
    			"opacity":"1"
    		});
            $(".overlay").show();
    		popDom.find(".cancel").on("tap",function(){
                if(fn2){
                    if(!fn2()){
                        return;
                    }
                }
    			popDom.hide();
    			$(".overlay").hide();
    		})
    		popDom.find(".confirm").on("tap",function(){
    			if(fn){
    				if(fn() === false){
                        return;
                    }
    			}
    			popDom.hide();
    			$(".overlay").hide();
    		})
 		}

        //手动隐藏pop
        this.hidPop = function(){
            $('.db-pop').hide();
            $(".overlay").hide();
        }
	}
	return Pop;


})