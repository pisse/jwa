require(['zepto','h5lock','./module/pop'], function($, h5lock,pop) {
    var unlock = new h5lock({chooseType: 3});

    //初始化弹框
    var myPop = new pop();

	var checkUser = function(name,psw){
		this.name = name;
		this.psw = psw;
	}
	checkUser.prototype.isCorect = function(){
        var erp = this.name;
        $('input').blur();
		if(!this.name || !this.psw){
			myPop.alert("用户名和密码不可以为空！");
			return false;
		}

		$.ajax({
			type:"POST",
			url:"http://mba.jd.com/json.php?mod=SecureCookie&act=loginForMobile",
            data:{
                user_name : this.name,
                password : this.psw
            },
			success:function(d){
                console.log(d);
				if(d === 'true'){
					$('body').addClass('show_unlock');
					$('#password').val('');
                    window.localStorage.setItem('erp', erp);
                    $("#title").html("请创建手势图案");
				}else{
					myPop.alert("邮箱或密码错误!");
				}
			},
            error: function(xhr, type) {
               myPop.alert('无法连接到数据库！'); 
            }
		});

        /**
        if (this.name == "admin" && this.psw == "123") {
            $('body').addClass('show_unlock');
            $('#password').val('');
            window.localStorage.setItem('erp', this.name);
            $("#title").html("请创建手势图案");
        }else{
            myPop.alert("邮箱或密码错误!");
        }
        **/
	}
    

	unlock.makeState = function() {
        if (this.pswObj.step == 2) {
            document.getElementById('updatePassword').style.display = 'block';
            //document.getElementById('chooseType').style.display = 'none';
            document.getElementById('title').innerHTML = '请解锁';
        } else if (this.pswObj.step == 1) {
            //document.getElementById('chooseType').style.display = 'none';
            document.getElementById('updatePassword').style.display = 'none';
        } else {
            document.getElementById('updatePassword').style.display = 'none';
            //document.getElementById('chooseType').style.display = 'block';
        }
    }

	unlock.storePass = function(psw) {
    // touchend结束之后对密码和状态的处理
        if (this.pswObj.step == 1) {
            if (this.checkPass(this.pswObj.fpassword, psw)) {
                this.pswObj.step = 2;
                this.pswObj.spassword = psw;
                document.getElementById('title').innerHTML = '密码保存成功';
                this.drawStatusPoint('#2CFF26');
                window.localStorage.setItem('passwordxx', JSON.stringify(this.pswObj.spassword));
                window.localStorage.setItem('chooseType', this.chooseType);
                //跳转到首页
                window.location.href="index.html";
            } else {
                myPop.toast("两次不一致，重新输入",2000);
                $("#title").html("请创建手势图案");
                this.drawStatusPoint('red');
                delete this.pswObj.step;
            }
        } else if (this.pswObj.step == 2) {
            if (this.checkPass(this.pswObj.spassword, psw)) {
            	//解锁成功
                document.getElementById('title').innerHTML = '解锁成功';
                this.drawStatusPoint('#2CFF26');
                //跳转到首页
                window.location.href="index.html"
            } else {
                this.drawStatusPoint('red');
                this.chance --
                if(!this.chance){
                	myPop.alert("密码错误5次，需要重新登录",function(){
                		$('body').removeClass('show_unlock');
                        loginOut();
                    	document.getElementById('title').innerHTML = '请创建手势图案';
                	});
                    this.updatePassword();
                }else{
                	myPop.toast("密码错误，还能输入"+this.chance+"次",1000);                    
                }
            }
        } else {
            this.pswObj.step = 1;
            this.pswObj.fpassword = psw;
            document.getElementById('title').innerHTML = '请再次绘制手势图案';
        }
    }

    function loginOut(){
        window.localStorage.removeItem('erp');
    }

	//初始化解锁控件
	unlock.init();

	//如果已经登录或者已设置手势,则直接手势登录
    if(window.localStorage.getItem('erp') || window.localStorage.getItem('passwordxx')){
    	$('body').addClass('show_unlock');
    }


    //登录
	$('.login_btn').on('tap',function(){
		var check = new checkUser($('#username').val(),$('#password').val())
		check.isCorect();
	})

	//有疑问
    $('.ask').on('tap',function(){
        $('input').blur();
    	myPop.alert("请咚咚联系：郭皓洁<br/>或邮件联系：<br/>guohaojie@jd.com!");
    	return false;
    })

    //忘记手势密码
    $("#updatePassword").on('tap',function(){
    	myPop.toast("忘记手势密码，需要重新登录",2000);
    	setTimeout(function(){$('body').removeClass('show_unlock')},3000);
        loginOut();
    	unlock.updatePassword();
    })
    
});