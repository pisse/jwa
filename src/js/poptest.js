require(['zepto','./module/pop'],function($,pop){
	var myPop = new pop();
	//myPop.toast("小朋友你好！",2000);
	//myPop.toast("lelelele",5000);

	//var yourPop = new pop();
	//yourPop.toast("hahahaha",3000);
	//yourPop.toast("ppppp",2000);

	myPop.alert("啪啪啪啪",function(){
		myPop.alert('sdagdsgd');
	});
	//myPop.confirm("<p>大的点点滴滴<p>");
	//yourPop.confirm("dddddddd");

})