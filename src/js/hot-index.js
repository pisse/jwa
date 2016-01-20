require(['zepto','mustache','./module/mainbar','./module/pop'], function($,Mustache,mainbar,pop) {
	var mainbarConf = {
        title: '点击转化率',
        nav:2,
        hideHeadBtn: 'both'
    },
    overlayClors = ['250,65,86','250,216,65','101,229,59','60,197,186','53,132,255','160,49,238','141,141,141','66,66,66'],
    dataMode = {},
    viewMode = {},
    hotData = {}, //app数据
    hotPositionData = [], //mba数据，顺序固定
    hotValueData = [], //mba数据，顺序按照排序来
    $content = $('.content'),
    $hot_view_mode = $('.hot_view_mode'),
    appUrl = 'http://portal.m.jd.com/client.action?functionId=welcomeHome&body={%22geo%22:{%22lng%22:%220.000000%22,%22lat%22:%220.000000%22},%22poz%22:{%22city%22:%22%E4%B8%8A%E6%B5%B7:%22,%22time%22:1448954648276},%22identity%22:%22e78bb543985108dc7c288ce8dd79ccda53eaf8f0%22}&d_model=x86_64&networkType=wifi&adid=81353D4A-F591-4BD7-980A-A48B6E3AC56C&osVersion=9.1&d_brand=apple&client=apple&screen=750*1334&area=2_0_0_0&build=5936&uuid=ndBkJlOWW6CjjcXkLcSLaw==&clientVersion=4.4.2&openudid=e78bb543985108dc7c288ce8dd79ccda53eaf8f0&partner=apple&st=1448954829735&sign=TI_i-_vi7q2gY2gbPFf1TA&sv=1';
    mbaUrl = 'http://mba.jd.com/json.php?biz=realtime&mod=RealTimeStat&act=MobileMba';
    hotListHref = 'hot_list.html?type=';

    //mainbar
    mainbar.show(mainbarConf);

    //初始化弹框
    var myPop = new pop();

//获取图片数据
    viewMode.inite = function(){
		//展示loading动画
		mainbar.loadingShow($hot_view_mode);
    	appUrl = mainbar.formatURL(appUrl);
    	$.ajax({
	    	type: 'GET',
	        url: appUrl,
	        dataType: 'json',
	        success: function(data) {
	        	var allData = data.floorList;
	        	for(var i=0; i<allData.length; i++){
	        		if(allData[i].type === 'banner'){
	        			hotData.bannerData = allData[i].content;
	        		}else if(allData[i].type === 'appcenter'){
	        			hotData.iconData = allData[i].content.data;
	        		}else if(allData[i].floorId === 269){
	        			hotData.msData = allData[i].content.subFloors[0].data[0];
	        		}else if(allData[i].floorId === 263){
	        			hotData.recommendData = allData[i].content.subFloors[0].data;
	        			break;
	        		}else{
	        			continue;
	        		}
	        	}

	        	viewMode.fillDom(hotData);

	        	//app数据存储到本地
	        	localStorage.setItem('appData',JSON.stringify(hotData));
	        }, 
	        error: function(xhr, type) {
	        	setTimeout(whenError,1000);
	        	console.log('无法获取app端数据!');
	        }
	    })
		function whenError(){
            mainbar.refreshShow($hot_view_mode);
            $hot_view_mode.find('.refresh-pop').one('tap',function(){
                viewMode.inite();
            })
        }
    };

//填充数据
	viewMode.fillDom = function(d){
    	var bannerHtml = '',
    		iconsHtml = '',
    		msTopHtml,
    		msNxtKey = d.msData.content.nextMiaoshaKey,
    		msNxtTime = {
    			year : msNxtKey.substr(0,4),
    			month : msNxtKey.substr(4,2),
    			day : msNxtKey.substr(6,2),
    			hour : msNxtKey.substr(-4,2)
    		},
    		msLeftTime = viewMode.ShowCountDown(msNxtTime);
    		msListData = d.msData.content.indexMiaoSha,
    		msListHtml = '',
    		msTinTagHtml = '',
			singleRecommend = {},
			viewModeHtml = '';


    	//banner
    	bannerHtml = '<img src="'+(d.bannerData[0].horizontalImag).slice(0,-5)+'" width="100%"/>';

    	//icons
    	for(var i = 0; i < 7; i++){
    		iconsHtml += '<li class="hot_icon_tin">'
		                    +'<img src="'+d.iconData[i].icon+'" width="50%"/>'
		                    +'<p>'+d.iconData[i].name+'</p>'
		                  +'</li>';
    	}

    	//秒杀
    	msTopHtml = '<h4 class="ms_title">秒杀</h4>'
                   +'<dl class="ms_time">'
                      +'<dt class="ms_time_title">·'+d.msData.content.name+'</dt>'
                      +'<dd class="ms_last_time">'
                          +'<span class="ms_last_time_box ms_last_hour">'+msLeftTime.hour+'</span>:<span class="ms_last_time_box ms_last_minute">'+msLeftTime.minute+'</span>:<span class="ms_last_time_box ms_last_second">'+msLeftTime.second+'</span>'
                      +'</dd>'
                   +'</dl>'
                   +'<div class="ms_top_label">'+d.msData.rightCorner+'</div>';

    	for(var m = 0; m < 4; m++){
    		if(msListData[m].tagType){
    			msTinTagHtml = '<span class="ms_tin_tag ms_tin_tag'+msListData[m].tagType+'">'+msListData[m].tagText+'</span>';
    		}else{
    			msTinTagHtml = '';
    		}
    		msListHtml += '<li class="ms_tin">'
		                      +'<div class="ms_pic">'
		                          +'<img src="'+(msListData[m].imageurl).slice(0,-5)+'" />'
		                          + msTinTagHtml
		                      +'</div>'
		                      +'<dl class="ms_tin_price">'
		                          +'<dt class="ms_price rmb">'+msListData[m].miaoShaPrice+'</dt>'
		                          +'<dd class="jd_price rmb">'+msListData[m].jdPrice+'</dd>'
		                      +'</dl>'
		                  +'</li>';
    	}

    	//单品推荐
    	singleRecommendHtml = {
    		phoneOnly : '<img src="'+(d.recommendData[0].img).slice(0,-5)+'" width="100%" />',
    		downTop : '<img src="'+(d.recommendData[1].img).slice(0,-5)+'" width="100%" />',
    		fullReduce : '<img src="'+(d.recommendData[2].img).slice(0,-5)+'" width="100%" />' 
    	}

    	$('.banner').append(bannerHtml);
    	$('.hot_icon_list').prepend(iconsHtml);

    	$('.ms_top').prepend(msTopHtml);
    	$('.ms_list').prepend(msListHtml);

    	//single_recommend
    	$('.phone_only').prepend();
    	$('.down_top').prepend();
    	$('.full_reduce').prepend();

    	viewModeHtml = '<div class="banner">'+bannerHtml+'</div>'
			          +'<div class="hot_icon">'
			              +'<ul class="hot_icon_list">'
			              	  +iconsHtml			
			                  +'<li class="hot_icon_tin">'
			                    +'<img src="../img/sprite/hot_all_icon.png" width="50%"/>'
			                    +'<p>全部</p>'
			                  +'</li>'
			              +'</ul>'
			          +'</div>'
			          +'<div class="ms">'
			              +'<div class="ms_top">'+msTopHtml+'</div>'
			              +'<ul class="ms_list">'+msListHtml+'</ul>'
			              +'<aside class="ms_all">查看全部</aside>'
			          +'</div>'
			          +'<ul class="single_recommend">'
			              +'<li class="phone_only">'+singleRecommendHtml.phoneOnly+'</li>'
			              +'<li class="down_top">'+singleRecommendHtml.downTop+'</li>'
			              +'<li class="full_reduce">'+singleRecommendHtml.fullReduce+'</li>'
			          +'</ul>';
		//隐藏loading
		mainbar.cleanDataPop($hot_view_mode,true);
		$hot_view_mode.append(viewModeHtml);
		$hot_view_mode.css('background','#f0f4f7');
		viewMode.requestMbaData();
	}

//倒计时处理
	viewMode.ShowCountDown = function(t){
		var nowLeft = {};
		var now = new Date(); 
		var endDate = new Date(t.year, t.month-1, t.day, t.hour); 
		var leftTime=endDate.getTime()-now.getTime(); 
		var leftsecond = parseInt(leftTime/1000); 
		//var day1=parseInt(leftsecond/(24*60*60*6)); 
		var day1=Math.floor(leftsecond/(60*60*24)); 
		var hour=Math.floor((leftsecond-day1*24*60*60)/3600); 
		var minute=Math.floor((leftsecond-day1*24*60*60-hour*3600)/60); 
		var second=Math.floor(leftsecond-day1*24*60*60-hour*3600-minute*60); 
		nowLeft = {
			hour : (hour < 10) ? '0' + hour : hour,
			minute : (minute < 10) ? '0' + minute : minute,
			second : (second < 10) ? '0' + second : second
		}
		return nowLeft;
	}

//获取MBA数据
	viewMode.requestMbaData = function(){
		$.ajax({
	    	type: 'POST',
	        url: mbaUrl,
	        dataType: 'json',
	        success: function(data) {
	        	var doms = ['.banner','.hot_icon_list','.ms_top','.ms_list','.ms_all','.phone_only','.down_top','.full_reduce'],
	        		moduleName,
	        		hrefSearchIndex,
	        		myObj;

	        	for(var i = 0; i<doms.length; i++){
	        		moduleName = data[i].module_name;
	        		if(moduleName === '首页滚动图'){
	        			hrefSearchIndex = '0';
	        		}else if(moduleName === '快捷入口'){
	        			hrefSearchIndex = '2';
	        		}else{
	        			hrefSearchIndex = '1';
	        		}
	        		myObj = {
			        			dom : doms[i],
			        			hrefSearchIndex : hrefSearchIndex,
			        			module_name : moduleName,
			        			trans_rate : data[i].trans_rate,
			        			click_num : data[i].click_num,
			        			order_num : data[i].order_num
			        		}
	        		hotValueData.push(myObj);
	        		hotPositionData.push(myObj);
	        	};
	        	//MBA数据存储到本地
	        	localStorage.setItem('mbaData',JSON.stringify(hotPositionData));

	        	//排序并填充数据
	        	viewMode.fillData('trans_rate');

	        	dataMode.inite();
	        	//切换数据
	        	viewMode.changeData();	


	        }, 
	        error: function(xhr, type) {
	        	myPop.toast('无法获取MBA数据',6000);
	        	console.log('无法获取MBA数据');
	        }
	    })

	}

	viewMode.compareData = function(propertyName){
		return function(obj1,obj2){
			var value1 = obj1[propertyName];
			var value2 = obj2[propertyName];
			if(value2 < value1){
				return -1;
			}else if(value2 > value1){
				return 1;
			}else{
				return 0;
			}
		}
	}

	viewMode.fillData = function(propertyName,fun){
		hotValueData.sort(viewMode.compareData(propertyName));
		for(var t=0; t<overlayClors.length; t++){
			$(hotValueData[t].dom).append('<a class="hot_overlay" href="'+hotListHref+hotValueData[t].hrefSearchIndex+'&name='+escape(hotValueData[t].module_name)+'" style="background:rgba('+overlayClors[t]+',0.3);border-color:rgb('+overlayClors[t]+')">'
												+'<span class="valuex_tag" style="background:rgba('+overlayClors[t]+',0.9)">'
												+hotValueData[t][propertyName]
												+'</span>'
											+'</a>');
		};
		if(fun){
			setTimeout(fun,300);
		}
	}

	//数据展示切换
	viewMode.changeData = function(){
		$('h1').on('tap',function(){
			if($(this).hasClass('unable_select')){
				return false;
			}
	    	$('.hot_selector').toggleClass('shw');
	    	$(this).toggleClass('slided');
	    })

	    $('.hot_selector li').on('tap',function(){
	    	var $this = $(this);
	    	$('.hot_overlay').remove();
	    	$this.addClass('cur');
	    	$this.siblings('li').removeClass('cur');
	    	$('h1').text($this.text());
	    	viewMode.fillData($this[0].id,function(){
	    		$('.hot_selector').toggleClass('shw');
	    		$('h1').toggleClass('slided');
	    	});
	    	return false;
	    })
	    //数据模式和可视化模式切换
	    $('.right-btn span').on('tap',function(){
	    	$('h1').toggleClass('unable_select');
    		$('.hot_mode').toggleClass('hid');
    	})
	}

	dataMode.inite = function(){    		
    	dataMode.html = '';
    	for(var i=0; i<hotPositionData.length; i++){
    		dataMode.html += '<section class="hot_data_mode_tin">'
					              +'<div class="data_mode_tin_top">'
					                  +'<h2>'+hotPositionData[i].module_name+'</h2>'
					                  +'<a class="slide_btn" href="'+hotListHref+hotPositionData[i].hrefSearchIndex+'&name='+escape(hotPositionData[i].module_name)+'">查看详细数据<span class="down_icon"></span></a>'
					              +'</div>'
					              +'<div class="data_mode_tin_sum">'
					                  +'<dl class="sum_tin">'
					                      +'<dt class="sum_tin_title">点击量</dt>'
					                      +'<dd class="sum_tin_value">'+hotPositionData[i].click_num+'</dd>'
					                  +'</dl>'
					                  +'<dl class="sum_tin">'
					                      +'<dt class="sum_tin_title">引入订单比数</dt>'
					                      +'<dd class="sum_tin_value">'+hotPositionData[i].order_num+'</dd>'
					                  +'</dl>'
					                  +'<dl class="sum_tin">'
					                      +'<dt class="sum_tin_title">点击转化率</dt>'
					                      +'<dd class="sum_tin_value">'+hotPositionData[i].trans_rate+'</dd>'
					                  +'</dl>'
					              +'</div>'
					           +'</section>' ;
    	}

    	$('.hot_data_mode').html(dataMode.html);
    	dataMode.requestIndexSum();

    }
    dataMode.requestIndexSum = function(){
    	$.ajax({
	    	type: 'POST',
	        url: mbaUrl,
	        data: {
	        	module_name:'首页汇总'
	        },
	        dataType: 'json',
	        success: function(data) {
	        	//获得首页汇总数据
	        	dataMode.indexSumHtml = '<section class="hot_data_mode_tin">'
							              +'<div class="data_mode_tin_top">'
							                  +'<h2>首页数据汇总</h2>'
							              +'</div>'
							              +'<div class="data_mode_tin_sum">'
							                  +'<dl class="sum_tin">'
							                      +'<dt class="sum_tin_title">点击量</dt>'
							                      +'<dd class="sum_tin_value">'+data.click_num+'</dd>'
							                  +'</dl>'
							                  +'<dl class="sum_tin">'
							                      +'<dt class="sum_tin_title">引入订单比数</dt>'
							                      +'<dd class="sum_tin_value">'+data.order_num+'</dd>'
							                  +'</dl>'
							                  +'<dl class="sum_tin">'
							                      +'<dt class="sum_tin_title">点击转化率</dt>'
							                      +'<dd class="sum_tin_value">'+data.trans_rate+'</dd>'
							                  +'</dl>'
							              +'</div>'
							           +'</section>';
				$('.hot_data_mode').prepend(dataMode.indexSumHtml);
	        }, 
	        error: function(xhr, type) {
	        	console.log('无法获取汇总数据');
	        }
	    })

    }


	viewMode.inite();


})