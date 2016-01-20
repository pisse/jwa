/*
 * Calendar组件
 *
 * 主要功能：日历组件
 *
 * 表现方式：以连续个月罗列的方式展现
 *
 * 配置参数：
 *     @param: selectDate           @type: string   @des: 当前日期
 *     @param: startDate            @type: string   @des: 开始日期
 *     @param: type                 @type: string   @des: 单选/连选日期：single/sequent
 *     @param: rangeMonth           @type: number   @des: 连续显示月份个数    
 *     @param: rangeSelectLimit     @type: number   @des: 连续选择天数的限制
 *     @param: wday                 @type: number   @des: 每周第一天(定义周六的位置是第几个)
 *     @param: reverse              @type: boolean  @des: 是否倒序展示，默认false
 *     @param: disableDate          @type: object   @des: 禁用日期：{date: '2015-01-02', type:'after'}
 *     
 *     @param: language             @type: object   @des: 语言设置
 *     @param: showPanelCallback    @type:function  @des: 显示面板的回调函数
 *     @param: closePanelCallback   @type:function  @des: 关闭面板的回调函数
 *     @param: selecteCallback      @type:function  @des: 选中日期的回调函数
 *
 * 
 * 方法：
 *     @method: show            @des:显示日历面板
 *     @method: hide            @des:隐藏日历面板
 *
 * 事件：
 *     @event: showPanel        @des: 显示面板时触发该事件
 *     @event: closePanel       @des: 关闭面板时触发该事件
 *     @event: selectedDate     @des: 选中日期后触发该事件
 * 
 */

define('./module/calendar/index', ['zepto'], function($) {
    //vars
    var name = 'calendar';
    var optStr = name + 'Opt';
    var instanceStr = name + '-instance';
    var playID = -1;
    //Calendar class
    var Calendar = function(item, options) {
        this.element = item;
        this._init(options);
    };


    //fun
    Calendar.prototype = {
        version: '1.0.0',
        container: null,
        sequentData: {},
        sequentSign: false,
        dateSeparator: '-',
        initScrollbar: false,
        lastDate: null,
        _init: function(options) {
            var me = this;
            var item = this.element;
            var settings = this._getSettings(item);
            var mergeData = settings ? settings : $.fn.calendar.defaults;
            settings = $.extend({}, mergeData, options);
            this._setSettings(item, settings);
            //
            me._renderHandler();
            me._bindEventHandler();
        },
        _renderHandler: function() {
            var me = this;
            var item = me.element;
            var settings = me._getSettings(item);
            //
            var date = me.lastDate;
            if(!date){
                me._renderContainer();
                date = new Date(settings.startDate);
            }
            //panel
            var year = date.getFullYear(),
                month = date.getMonth();
            var factor = settings.reverse ? -1 : 1;
            for(var i=0; i<settings.rangeMonth; i++){
                date = new Date(year,month+factor*i);
                me._renderCalendarPanel(date);
            }
            me.lastDate = new Date(year,month+factor*i);
            me._setScrolbar();
        },
        _setScrolbar: function(){
            var me = this;
            var item = me.element;
            var settings = me._getSettings(item);
            //
            if(settings.reverse){
                var bd = me.container.find('.jdui_calendar_bd');
                var panelH = me.container.find('.jdui_calendar_panel').height();
                var bdHeight = settings.rangeMonth * panelH;
                bd.scrollTop(bdHeight);    
            }
        },
        _bindEventHandler: function(){
            var me = this;
            var item = me.element;
            var settings = me._getSettings(item);
            //show
            item.on('tap', function(e){
                me.container.css('display','block');
                $('.overlay').addClass('show');
                //scrollbar
                if(!me.initScrollbar){
                    me._setScrolbar();
                    me.initScrollbar = true;
                }
                //event
                if (typeof settings.showPanelCallback === "function"){
                    settings.showPanelCallback();
                }
                item.trigger('showPanel');
            });
            //close
            var closeNode = me.container.find('.jdui_calendar_close');
            closeNode.on('tap', function(e){
                me.container.css('display','none');
                $('.overlay').removeClass('show');
                //event
                if (typeof settings.closePanelCallback === "function"){
                    settings.closePanelCallback(me.sequentData);
                }
                item.trigger('closePanel', me.sequentData);
            });
            var footNode = me.container.find('.jdui_calendar_foot');
            footNode.find('span').on('click', function(e){
                var item = $(this);
                var status = 'cancel';
                if(item.hasClass('jdui_calendar_submit')){
                    status = 'submit';
                }
                me.container.attr('data-status', status);
                closeNode.trigger('tap');
            });
            //select - 选择日期事件
            me.container.find('.jdui_calendar_bd').on('tap', 'td' ,function(e){
                var _this = $(this);
                if(_this.hasClass('num') && !_this.hasClass('disabled')) {
                    me.container.find("td").removeClass("selected");
                    _this.addClass("selected");
                    //type
                    var str = $(this).attr('title');
                    if(settings.type == 'sequent'){
                        //sequent select
                        me._sequentSelect(_this);    
                    }else{
                        //single select
                        me._selectDay(str);
                    }
                    //event
                    if (typeof settings.selecteCallback === "function"){
                        settings.selecteCallback(str, me.sequentSign);
                    }
                    item.trigger('selectedDate',str);
                }
            });
            //scroll
            var scrollNode = me.container.find('.'+settings.scrollCls);
            scrollNode = scrollNode.length>0 ? scrollNode : $(window);
            var scrollID = -1;
            scrollNode.on('scroll touchmove', function(e){
                var item = $(this);
                clearTimeout(scrollID);
                scrollID = setTimeout(function(){
                    var top = item.scrollTop();
                    var itemH = parseInt(item.height()/2);
                    itemH = 0;
                    if(top<=itemH){
                        me._renderHandler();
                    }
                }, 200);
            });
        },
        _renderContainer: function(){
            var me = this;
            var item = me.element;
            var settings = me._getSettings(item);
            //id
            var id = settings.id;
            //render
            var container = $('<div id="'+id+'" class="jdui_calendar"></div>');
            var hd = $('<div class="jdui_calendar_hd">'+
                          '<span class="jdui_calendar_title"></span>'+
                          '<span class="jdui_calendar_close">关闭</span>'+
                        '</div>');
            hd.find('.jdui_calendar_title').text(settings.title);
            var bd = $('<div class="jdui_calendar_bd"></div>');
            var foot = $('<div class="jdui_calendar_foot">'+
                            '<span class="jdui_calendar_cancel">取消</span>'+
                            '<span class="jdui_calendar_submit">确认</span>'+
                        '</div>');
            //append
            container.append(hd);
            container.append(bd);
            container.append(foot);
            $('body').append(container);
            //data
            me.container = container;
        },
        _renderCalendarPanel: function(date) {
            var me = this;
            var item = me.element;
            var settings = me._getSettings(item);
            //
            var defYear = date.getFullYear(),
                defMonth = date.getMonth() + 1;

            // 定义每月的天数
            me.month_day = new Array(31, 28 + me._leapYear(defYear), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);

            // 定义每周的日期
            me.date_name_week = settings.language.weekList;

            // 定义周末
            var saturday = 6 - settings.wday,
                sunday = (7 - settings.wday >= 7) ? 0 : (7 - settings.wday);

            // 创建日历面板dom节点
            var date_pane = $('<div class="jdui_calendar_panel"></div>'),
                date_hd = $('<div class="date_hd"></div>').appendTo(date_pane),
                date_table = $('<table class="date_table"></table>').appendTo(date_pane);

            var date_txt = $('<div class="date_txt"></div>').appendTo(date_hd);

            html = '<thead><tr>';
            // 遍历一周7天
            for (var i = 0; i < 7; i++) {
                html += "<th class='"
                    // 周末高亮
                if (i == saturday) {
                    html += " sat";
                } else if (i == sunday) {
                    html += " sun";
                }
                html += "'>";
                html += (i + settings.wday * 1 < 7) ? me.date_name_week[i + settings.wday] : me.date_name_week[i + settings.wday - 7];
                html += "</th>";
            }
            html += "</tr></thead>";
            html += "<tbody></tbody>";
            date_table.html(html);

            // 面板及背景遮挡层插入到页面中
            var bdNode = me.container.find('.jdui_calendar_bd');
            if(settings.reverse){
                bdNode.prepend(date_pane);
            }else{
                bdNode.append(date_pane);
            }

            // 赋值 全局
            me.dateTxt = date_txt;
            me.dateTable = date_table;
            me.saturday = saturday;
            me.sunday = sunday;
            me.datePane = date_pane;
            me.defYear = defYear;
            me.defMonth = defMonth;

            // 根据年份 月份来渲染天
            me._renderBody(defYear, defMonth);
        },
        // 返回 年月分的 天数
        _dayNumOfMonth: function(Year,Month){
            var d = new Date(Year,Month,0);
            return d.getDate();
        },
        /*
         * 渲染日历天数
         * @param {y,m} 年 月
         */
        _renderBody: function(y,m){
           var me = this;
            var item = me.element;
            var settings = me._getSettings(item);
            //
            if(m < 1) {
                y--;
                m = 12;
            }else if(m > 12) {
                y++;
                m = 1;
            }
            var tempM = m,
                cur_m = m;

            m--;  // 月份从0开始的
            var prevMonth = tempM - 1,  //上个月的月份
                prevDay = me._dayNumOfMonth(y,tempM - 1), // 上个月的天数
                nextMonth = tempM + 1,   // 下个月的月份
                nextDay = me._dayNumOfMonth(y,tempM + 1),  //下个月的天数
                curDay = me._dayNumOfMonth(y,tempM);       // 当前月份的天数

            me.month_day[1]=28+me._leapYear(y);  //闰年的话 29天 否则 28天
            var temp_html = "",
                temp_date = new Date(y,m,1);
            var now_date = new Date();
            now_date.setHours(0);
            now_date.setMinutes(0);
            now_date.setSeconds(0);
            
            // 获取当月的第一天
            var firstDay = temp_date.getDay() - settings.wday < 0 ? 
                temp_date.getDay() - settings.wday + 7 : 
                temp_date.getDay() - settings.wday;
            

            // 每月所需要的行数
            var monthRows = Math.ceil((firstDay+me.month_day[m]) / 7);
            var td_num,
                day_num,
                diff_now,
                diff_set;
            var disabled;
            if(settings.disableDate){
                var disabledDate = new Date(settings.disableDate.date);
                var disabledType = settings.disableDate.type;
                var disabledSign;
            }
            for(var i= 0; i < monthRows; i++) {
                temp_html += "<tr>";
                for(var j = 0; j < 7; j++) {
                    td_num=i*7+j;
                    day_num=td_num-firstDay+1;
                    if(day_num<=0) {
                        if(day_num == 0) {
                            day_num = prevDay - day_num
                            text_m = prevMonth
                        }else {
                            day_num = prevDay + day_num;
                            text_m = prevMonth
                        }
                        
                    }else if(day_num > me.month_day[m]){
                        day_num = day_num - curDay;
                        text_m = nextMonth
                    }else {
                        text_m     = cur_m;
                    }
                    temp_html+="<td";
                    if(typeof(day_num) == 'number') {
                        diff_now=null;
                        diff_set=null;
                        temp_date = new Date(y,m,day_num);
                        var curDate = now_date.getDate();

                        if(text_m == cur_m) {
                            diff_now=Date.parse(now_date)-Date.parse(temp_date);
                            diff_set=Date.parse(settings.selectDate)-Date.parse(temp_date);
                        }

                        //disable sign
                        if(settings.disableDate && disabledDate){
                            if(disabledType == 'after'){
                                disabledSign = Date.parse(disabledDate)<Date.parse(temp_date)
                            }else if(disabledType == 'before'){
                                disabledSign = Date.parse(disabledDate)>Date.parse(temp_date)
                            }
                        }

                        if(cur_m > text_m || cur_m < text_m || disabledSign) {
                            disabled = 'disabled';
                            day_num = day_num;
                        }else {
                            disabled = "";
                        }
                        //
                        var separator = me.dateSeparator;
                        temp_html+=(" title='"+y+separator+text_m+separator+day_num+"' class='num "+disabled+"");

                        // 高亮周末、今天、选中
                        if(diff_set==0){    //选中的时候 增加select 类名
                            temp_html+=" selected";
                        }
                        if(diff_now==0){
                            temp_html+=" now";   // 当前时间增加now类名
                        }else if(j==me.saturday){
                            temp_html+=" sat";   // 周六增加sat类名
                        }else if(j==me.sunday){
                            temp_html+=" sun";   // 周日增加sun类名
                        }
                        temp_html+=("'");
                    }
                    temp_html+=(" date-day='"+day_num+"'>"+day_num+"</td>");
                }
                temp_html+="</tr>";
            }
         
            $(me.dateTable).find("tbody").html(temp_html);
            $(me.dateTxt).html("<span class='y'>"+y+"</span>"+settings.language.year+"<span class='m'>"+settings.language.monthList[m]+"</span>"+settings.language.month);
            
            return this;
        },
        /*
         * 判断是否是闰年
         * @param y 年份
         * 1.能被4整除且不能被100整除 2.能被100整除且能被400整除
         */
        _leapYear: function(y) {
            return ((y % 4 == 0 && y % 100 != 0) || y % 400 == 0) ? 1 : 0;
        },
        /* 
         * 选择某一天的时候 把值存入输入框里 且面板隐藏
         * @_selectDay {private}
         */
        _selectDay: function(dateStr) {
            var me = this;
            var item = me.element;

            //yyyy-mm-dd
            var str = me._formatDate(dateStr);
            item.text(str); //set value
            // me.hide();
            me.callback && $.isFunction(me.callback) && me.callback(str);
        },
        _sequentSelect: function(node){
            var me = this;
            var dateStr = node.attr('title');
            me.sequentSign = false;
            //start
            if(!me.sequentData.start || (me.sequentData.start && me.sequentData.end)){
                me.sequentData = {};
                me.sequentData.start = dateStr;
                me.sequentData.startStr = me._formatDate(me.sequentData.start);
                //clean
                me.container.find('td').removeClass('selected');
                node.addClass('selected');
                return;
            }
            if(me.sequentData.start){
                me.sequentData.end = dateStr;
                me.sequentData.endStr = me._formatDate(me.sequentData.end);
                me._sequentSelectDate();
            }

        },
        _sequentSelectDate: function(){
            var me = this;
            var item = me.element;
            var settings = me._getSettings(item);
            //
            var startTime = me._getDateTime(me.sequentData.startStr, false);
            var endTime = me._getDateTime(me.sequentData.endStr, false);
            var perDay = 24*60*60*1000;
            var maxTime = endTime;
            var tmpTime = startTime;
            if(startTime>endTime){
                maxTime = startTime;
                tmpTime = endTime;
            }
            var range = Math.abs(startTime-endTime);
            range = range/perDay
            if(range>settings.rangeSelectLimit){
                console.log('超过30天了！')
                //clean
                me.container.find('td').removeClass('selected');
                me.sequentSign = 'outRange';
                return;
            }
            me.sequentSign = true;
            var tmpDate, node;
            while(tmpTime<=maxTime){
                tmpDate = me._formatDateTitle(tmpTime);
                node = me.container.find('td[title="'+tmpDate+'"]');
                node = node.not('.disabled');
                node.addClass('selected');
                tmpTime += perDay;
            }
        },
        _formatDateTitle: function(time){
            var me = this;
            var date = new Date(time);
            var year = date.getFullYear()
            var month = date.getMonth()+1;
            var day = date.getDate();
            var separator = me.dateSeparator;
            var str = year + separator + month + separator + day;
            return str;
        },
        _formatDate: function(dateStr){
            var me = this;
            var separator = me.dateSeparator;
            var dateArr = dateStr.split(separator);
            var year = dateArr[0],
                month = '0' + dateArr[1],
                day = '0' + dateArr[2];
            //format
            month=month.substr((month.length-2),month.length);
            day=day.substr((day.length-2),day.length);
            //yyyy-mm-dd
            var str = year+separator+month+separator+day;
            return str;
        },
        _getDateTime: function(time, sign){
            var me = this;
            var timeNum = time
            if(sign){
                timeNum = me._formatDate(time);    
            }
            timeNum = new Date(timeNum).getTime();
            return timeNum;
        },
        _getSettings: function(item) {
            return item.data(optStr);
        },
        _setSettings: function(item, options) {
            item.data(optStr, options);
        },
        //for method call
        show: function(){
            var me = this;
            var item = me.element;
            item.trigger('tap');
        },
        hide: function(){
            var me = this;
            me.container.find('.jdui_calendar_cancel').click();
        }
    }

    //public fun
    var methods = {
        init: function(options) {
            this.each(function() {
                var $this = $(this);
                if (!$this.data(instanceStr)) {
                    $this.data(instanceStr, new Calendar($this, options));
                }
            });
        },
        instance: function() {
            var arr = [];
            this.each(function() {
                var $this = $(this);
                arr.push($this.data(instanceStr));
            });
            return arr;
        },
        show: function() {
            var $this = $(this);
            var item = $this.data(instanceStr);
            var instance = $this.data(instanceStr);
            if (instance) {
                instance.show();
            }
        },
        hide: function(){
          var $this = $(this);
            var item = $this.data(instanceStr);
            var instance = $this.data(instanceStr);
            if (instance) {
                instance.hide();
            }  
        }
    }

    //construct
    $.fn.calendar = function() {
        var method = arguments[0];
        if (methods[method]) {
            if (!this.data(instanceStr)) {
                console.log('please init calendar first');
                return;
            }
            method = methods[method];
            arguments = Array.prototype.slice.call(arguments, 1);
        } else if (typeof(method) == 'object' || !method) {
            method = methods.init;
        } else {
            console.log('Method ' + method + ' does not exist on zepto.calendar');
            return this;
        }
        return method.apply(this, arguments);
    }


    // defaults
    $.fn.calendar.defaults = {
        selectDate: new Date().toDateString(),
        startDate: new Date().toDateString(),      //开始日期
        type: 'single',             //单选日期
        rangeMonth: 6,              //连续渲染月份数
        rangeSelectLimit: 30,       //连续选择天数的限制
        wday: 0,                    //周第一天
        title: '选择日期',           //面板标题
        reverse: false,             //是否倒序展示
        disableDate: null,          //禁用日期:{date: '2015-01-02', type:'after'}
        language: {
            year: "年",
            month: "月",
            monthList: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
            weekList: ["日", "一", "二", "三", "四", "五", "六"]
        },
        showPanelCallback: null,
        closePanelCallback: null,
        selecteCallback: null
    };

    //exports
    return Calendar;

});