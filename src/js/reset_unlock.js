require(['zepto','h5lock', './module/mainbar', './module/pop'], function($, h5lock,mainbar,Pop) {
    var unlock = new h5lock({chooseType: 3});
    var mainbarConf = {
        title: '我的MBA',
        hideHeadBtn: 'right'
    };

    var myPop = new Pop();

    unlock.makeState = function() {
    	document.getElementById('updatePassword').style.display = 'none';
    }

	unlock.storePass = function(psw) {
    // touchend结束之后对密码和状态的处理
        if (this.pswObj.step == 1) {
            if (this.checkPass(this.pswObj.fpassword, psw)) {
                this.pswObj.step = 2;
                this.pswObj.spassword = psw;
                document.getElementById('title').innerHTML = '密码保存成功';                
                myPop.alert("手势密码设置成功！",function(){
                	unlock.drawStatusPoint('#2CFF26');
	                window.localStorage.setItem('passwordxx', JSON.stringify(unlock.pswObj.spassword));
	                window.localStorage.setItem('chooseType', unlock.chooseType);
	                //跳转到首页
                	window.location.href="set.html";
                })
            } else {
                $("#title").html("两次不一致，重新输入")
                this.drawStatusPoint('red');
                delete this.pswObj.step;
            }
        }else {
            this.pswObj.step = 1;
            this.pswObj.fpassword = psw;
            document.getElementById('title').innerHTML = '请再次绘制手势图案';
        }
    }

    //mainbar
    mainbar.show(mainbarConf);
    //初始化解锁控件
	unlock.init();


	 
    myPop.chance = 5;

    myPop.confirm('<div class="pop-con-title">修改手势密码</div><span class="hint"></span><input type="password" class="check_psw" placeholder="请输入登录密码进行安全验证" />',function(){
        if(!$(".check_psw").val()){
            $(".hint").html("请输入密码！");
            return false;
        }
        
    	$.ajax({
			type:"POST",
			url:"http://mba.jd.com/json.php?mod=SecureCookie&act=loginForMobile",
            data:{
                user_name : window.localStorage.getItem('erp'),
                password : $(".check_psw").val()
            },
			success:function(d){
				if(d === 'true'){
					unlock.updatePassword();
                    $("#title").html("请创建手势图案");
                    myPop.hidPop();
				}else{
					myPop.chance--;
                    if(!myPop.chance){
                        unlock.updatePassword();
                        //返回登录页，重新登录
                        window.location.href="login.html";
                    }
                    $(".hint").html("密码错误，还能输入"+myPop.chance+"次!");
                    $(".check_psw").val("");
                    return false;
				}
			},
            error: function(xhr, type) {
               myPop.alert('无法连接到数据库！'); 
            }
		});
        return false;
    },function(){
        window.history.back();
    });


})