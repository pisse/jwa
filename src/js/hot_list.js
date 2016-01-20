require(['zepto','mustache','./module/mainbar','./module/pop'], function($,Mustache,mainbar,pop) {
    var mainbarConf = {
        title: '热图列表',
        nav:2,
        hideHeadBtn: 'right'
    },
    hotLst = {},
    titleDataArr = [],
    imgDataArr = [],
    bigModuleName,
    appData,
    mbaData,
    searchObj = [],
   
    tmpListType0 = '<div class="ban">'
                		+'<img src="../img/hot-list-li-banner.png" class="hot_list_ban hot_img" />'
            		+'</div>'
                    +'<section class="ban_title">{{module_name}}</section>',
    tmpListType1 = '<div class="product">'
		                +'<img src="../img/hot-list-img.png" class="pic hot_img" />'
                        +'<h2 class="product_name">{{module_name}}</h2>'
		                +'<p class="price"></p>'
		            +'</div>',
    tmpListType2 = '<div class="hot_icon">'
        				+'<img src="../img/hot-list-icon.png" class="circle-iocn hot_img" />'
        				+'<p>{{module_name}}</p>'
        			+'</div>',
    tmpListType = [],
    $content = $('.content'),
    $dom = $('.hot_list'),
    url = 'http://mba.jd.com/json.php?biz=realtime&mod=RealTimeStat&act=MobileMba',
    pageSearchIndex,
    tmpHotList,
    myPop = new pop();

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
                searchObj[key[i]] = value[i];
           } 
        } 
    })()
    appData = JSON.parse(localStorage.getItem('appData'));
    mbaData = JSON.parse(localStorage.getItem('mbaData'));

    $content.iterms_qty = 0;

    //判断模块类型
    pageSearchIndex = searchObj.type ? searchObj.type : '2';


    tmpListType = [tmpListType0,tmpListType1,tmpListType2];

    tmpHotList = '{{#dataLst}}'
	    			+'<li class="hot_list_tin">'
	    				+tmpListType[searchObj.type]          
	    				+'<dl>'
			                +'<dt>点击量</dt>'
			                +'<dd>{{click_num}}</dd>'
			            +'</dl>'
			            +'<dl>'
			                +'<dt>引入订单笔数</dt>'
			                +'<dd>{{order_num}}</dd>'
			            +'</dl>'
			            +'<dl>'
			                +'<dt>点击转化率</dt>'
			                +'<dd>{{trans_rate}}</dd>'
			            +'</dl>'
			        +'</li>'
			      +'{{/dataLst}}';

    function pickTenIterms(db,start){
        var getTen = {'dataLst' : db.splice(start,10)};
        return getTen;
    }

    function requestData (titleDataArr){
    //展示loading动画
        mainbar.loadingShow($dom);
//ajax start
        $.ajax({
            type: 'POST',
            url: url,
            data: {
                module_name : searchObj.name,
            	module_args : JSON.stringify(titleDataArr)
            },
            dataType: 'json',
            success: function(data) {
                if(!data.length){
                    //隐藏loading层
                    mainbar.cleanDataPop($dom,true);
                    myPop.toast("暂无详细数据",30000);
                    return;
                }
                //隐藏loading层
                mainbar.cleanDataPop($dom,true);
                //快捷入口只展示8条数据
                if(searchObj.name == '快捷入口'){
                    hotLst.dataLst = {'dataLst' : data.splice(0,8)};
                    hotLst.html = Mustache.render(tmpHotList, hotLst.dataLst);                
                    $dom.append(hotLst.html);
                    hotLst.fillImage(0);
                    return;
                }

            	hotLst.dataLst = pickTenIterms(data,0);
				hotLst.html = Mustache.render(tmpHotList, hotLst.dataLst);                
				$dom.append(hotLst.html);
                hotLst.fillImage(0);
                conScroll();
            },
            error: function(xhr, type) {
                setTimeout(whenError,1000);
            }
        })
//ajax end
        function whenError(){
            mainbar.refreshShow($dom);
            $dom.find(".refresh-pop").one("tap",function(){
                requestData ($dom,tmpHotList);
            })
        }

	}

    function getNxt10(){
        var dlen = $content.iterms_qty+1;
        var $dom = $('<ul class="hot_list" data-index="'+dlen+'"></ul>');
        $dom.appendTo('.content');
        $dom.height(80);
        //展示loading动画
        mainbar.loadingShow($dom,'list',true);
        //return;
        //ajax start
        $.ajax({
            type: 'GET',
            url: url,
            data: {
                module_name : searchObj.name,
                module_args : JSON.stringify(titleDataArr)
            },
            dataType: 'json',
            success: function(data) {
                hotLst.dataLst = pickTenIterms(data,dlen*10);
                if(dlen>=3 || !hotLst.dataLst.dataLst.length){
                    $content.append('<p class="end-data">已展示全部数据！</p>');
                    $dom.remove();
                    $('.content').off('touchstart');
                    return;
                }
                hotLst.html = Mustache.render(tmpHotList, hotLst.dataLst); 
                $dom.height("auto");
                //隐藏loading层
                mainbar.cleanDataPop($dom,true);
                $dom.append(hotLst.html);
                var leftImgs = imgDataArr.splice(dlen*10,10);
                if(leftImgs.length){
                    hotLst.fillImage(dlen*10);
                }
                $content.iterms_qty++;
            },
            error: function(xhr, type) {
                $dom.remove();
            }
        })
//ajax end
    }

function conScroll(){
   $('.content').on('touchstart',function(){
        if($(this).find(".loading-pop:visible").length){
            return false;
        }
        if($(this).height() + $(this).scrollTop() >= this.scrollHeight){
            getNxt10();
        }
   })   
}

hotLst.fillImage = function(i){
    for(; i<imgDataArr.length; i++){
        $(".hot_img").eq(i).attr("src",imgDataArr[i]);
    }
}

hotLst.makeListFromLocalStorage = function(mbaDataIndex,recommendDataIndex){
    if(recommendDataIndex != undefined){
        imgDataArr = [(appData.recommendData[recommendDataIndex].img).slice(0,-5)];
    }    
    hotLst.dataLst = {
        'dataLst' : [mbaData[mbaDataIndex]]
    };
    hotLst.html = Mustache.render(tmpHotList, hotLst.dataLst);
    $dom.append(hotLst.html);
    hotLst.fillImage(0);
}


hotLst.init = function(){
    mainbarConf.title = searchObj.name;
    //mainbar
    mainbar.show(mainbarConf);

    if(searchObj.name == '首页滚动图'){
        for(var i=0; i<appData.bannerData.length; i++){
            titleDataArr.push(appData.bannerData[i].title);
            imgDataArr.push((appData.bannerData[i].horizontalImag).slice(0,-5));
        }
    }else if(searchObj.name == '快捷入口'){
        //只给首屏8个icon配对图片
        for(var i=0; i<7; i++){
            titleDataArr.push(appData.iconData[i].name);
            imgDataArr.push(appData.iconData[i].icon);
        }
        titleDataArr.push("全部");
        imgDataArr.push("http://m.360buyimg.com/mobilecms/s130x130_jfs/t1984/176/1077366507/11139/3a97bfac/564359d0N9e6c512a.png");
    }else if(searchObj.name == '秒杀提示语入口'){
        this.makeListFromLocalStorage(2);
        return;
    }else if(searchObj.name == '秒杀入口'){
        this.makeListFromLocalStorage(3);
        return;
    }else if(searchObj.name == '秒杀滑动入口'){
        this.makeListFromLocalStorage(4);
        return;
    }else if(searchObj.name == '手机专享'){
        this.makeListFromLocalStorage(5,0);
        return;
    }else if(searchObj.name == '排行榜'){
        this.makeListFromLocalStorage(6,1);
        return;
    }else if(searchObj.name == '限时满减'){
        this.makeListFromLocalStorage(7,2);
        return;
    }
    requestData(titleDataArr);
}


hotLst.init();
    
})