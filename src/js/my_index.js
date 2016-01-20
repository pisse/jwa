require(['zepto','./module/mainbar'], function($,mainbar) {
    var mainbarConf = {
        nav:4
    },
    msgLst = {},
    url = 'http://mba.jd.com/mba.php';


    //mainbar
    mainbar.show(mainbarConf);

    //展示loading动画
    mainbar.loadingShow($('.my_index_list ul'),'',true);
    $('.my_index_list ul').append('<div class="overlay show"></div>');

    msgLst.init = function(messageType,$dom){
        $.ajax({
            type: 'GET',
            url: url,
            data: {
                g:'messages',
                c:'mobile_message',
                a:'getMessageList',
                message_type:messageType,
                page:'1',
                limit:'10'
            },
            // type of data we are expecting in return:
            dataType: 'json',
            // timeout: 300,
            // context: $('body'),
            success: function(d) {
                msgLst.fillContent(messageType,d.data,$dom);
                //console.log(data);
            }, 
            error: function(xhr, type) {
                setTimeout(whenError,1000);
                console.log('无法获取消息列表数据!');
            }
        });
        function whenError(){
            mainbar.refreshShow($dom);
            $dom.find('.refresh-pop').one('tap',function(){
                mainbar.loadingShow($dom,'',true);
                msgLst.init(messageType,$dom);
            })
        }
    }

    //生成消息列表
    msgLst.fillContent = function(messageType,d,$dom){
        var msgs = d.messages,
            pubDateObj,
            pubDate;
        msgLst.html = '';
        for(var i=0; i<msgs.length; i++){
            pubDateObj = new Date(parseInt(msgs[i].time)*1000);
            pubDate = pubDateObj.getFullYear()+'-'+(pubDateObj.getMonth()+1)+'-'+pubDateObj.getDate();
            msgLst.html += '<li class="my_index_list_tin '+msgs[i].op+'" data-id="'+msgs[i].id+'">'               
                                    +'<dl>'
                                        +'<a href="article.html?id='+msgs[i].id+'&title='+escape(msgs[i].title)+'" class="item">'
                                            +'<dt>'+msgs[i].title+'</dt>'
                                            +'<dd>'+msgs[i].content+'</dd>'
                                            +'<span class="my_list_date">'+pubDate+'</span>'
                                        +'</a>'
                                    +'</dl>'
                                    +'<ul class="option">'
                                        +'<li class="o_read">标记已读</li>'
                                        +'<li class="o_del">删除</li>'
                                    +'</ul>'
                                +'</li>';
            if(!i){
                if(messageType === '通告'){
                    localStorage.setItem('noticeLastTime',msgs[i].time);
                }else if(messageType === '快讯'){
                    localStorage.setItem('newsLastTime',msgs[i].time);
                }
                
            }
        }
        //隐藏loading层
        mainbar.cleanDataPop($dom);
        $dom.find('.overlay').removeClass('show');
        $dom.append(msgLst.html);
        //滚动到底部自动加载
        if($dom.data('index') === 1){
            msgLst.bindScroll($dom.parent('.my_index_list'));
        }
        
    }


    msgLst.bindEvent = function(){
        //tab切换
        $(".my_tab li").on("tap",function(){
            $('.my_index_list_tin').removeClass('translation');
            $(this).siblings('li').removeClass('cur');
            $(this).addClass('cur');
            if($(this).index()){
                $(".my_index_list_wrap").addClass("my_page2");
            }else{
                $(".my_index_list_wrap").removeClass("my_page2");
            }
            
        })

        //向左滑
        $(document).on("swipeLeft",'.my_index_list_tin',function(){
            $(this).siblings('li').removeClass('translation');
            $(this).addClass('translation');
        })

        //向右滑
        $(document).on("swipeRight",'.my_index_list_tin',function(){
            $('.my_index_list_tin').removeClass('translation');
        })


        //标记已读
        $(document).on("tap",'.o_read',function(event){
            var $this = $(this).parents('.my_index_list_tin'),
                msgId = $this.data('id');
            if(!$this.hasClass('unread')){
                $this.removeClass('translation unread');
                return;
            }
            $this.removeClass('translation unread');
            $.ajax({
                type: 'GET',
                url: url,
                data: {
                    g:'messages',
                    c:'mobile_message',
                    a:'flagMessageRead',
                    message_id:msgId
                },
                dataType: 'json',
                success: function(d) {
                    console.log('已标记已读!');
                }, 
                error: function(xhr, type) {
                    console.log('无法标记已读!');
                }
            });
        })

        //删除一条
        $(document).on("tap",'.o_del',function(){
            var tin = $(this).parents('.my_index_list_tin'),
                msgId = tin.data('id');
            $.ajax({
                type: 'GET',
                url: url,
                data: {
                    g:'messages',
                    c:'mobile_message',
                    a:'flagMessageDelete',
                    message_id:msgId
                },
                dataType: 'json',
                success: function(d) {
                    console.log('已删除ID为'+msgId+'的数据');
                }, 
                error: function(xhr, type) {
                    console.log('无法删除ID为'+msgId+'的数据');
                }
            });
            tin.addClass('pre_disapear');
            setTimeout(function(){
                tin.remove();
            },500);
            return false;
        })    

    }

    msgLst.bindScroll = function($wrap){
        var ulIndex,
            msgType = $wrap.index() ? '快讯' : '通告'; 
        //滚动到底部自动加载
        $wrap.on('scroll',function(){
            ulIndex = $(this).find('>ul').last().data('index');
            //console.log(ulIndex);
            if($(this).find(".loading-pop:visible").length){
                return false;
            }
            if($(this).height() + $(this).scrollTop() >= $(this)[0].scrollHeight){
                var $nxtDom = $('<ul data-index="'+(ulIndex+1)+'"></ul>');
                $nxtDom.appendTo($wrap);
                $nxtDom.height(80);
                //展示loading动画
                mainbar.loadingShow($nxtDom,'list',true);
                msgLst.getNxt10($nxtDom,msgType,ulIndex+1);
            }
        })
    }

    msgLst.getNxt10 = function($dom,messageType,index){
        $.ajax({
            type: 'GET',
            url: url,
            data: {
                g:'messages',
                c:'mobile_message',
                a:'getMessageList',
                message_type:messageType,
                page:index,
                limit:'10'
            },
            // type of data we are expecting in return:
            dataType: 'json',
            // timeout: 300,
            // context: $('body'),
            success: function(d) {
                $dom.height('auto');
                if(!d.data.messages.length){
                    $dom.after('<p class="end-data">已展示全部数据！</p>');
                    $dom.parent('.my_index_list').off('scroll');
                    $dom.remove();
                    return;
                }
                msgLst.fillContent(messageType,d.data,$dom);
                //console.log(data);
            }, 
            error: function(xhr, type) {
                console.log('无法获取消息列表数据!');
            }
        });
    }

    


    //生成通告列表
    msgLst.init('通告',$('.notice_list ul'));

    //生成快讯列表
    msgLst.init('快讯',$('.news_list ul'));

    //为每条消息绑定事件
    msgLst.bindEvent();

    
})