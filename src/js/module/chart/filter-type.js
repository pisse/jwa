/**
 *   generatorData - 配置说明：
 *   
 *   无线类型、App类型、版本筛选项
 *   一级app、m、
 *   二级iphone、ipad、androi、wp等
 *   三级iphone-o、iphone-m、ipad-o、ipad-m等等
 *   showLevel展示的级数，总共三级，默认为3
 *   isVersionMultiple小版本是否多选，默认false
 *   useSmallVersion大版本是否转换成小版本，默认false
 *   isAppTypeMultiple app类型是否多选，默认true
 *   appTypeDefault 设置app类型，默认为all
 *   appendLittleVersions 显示所有版本
 *   isVersionOtherShow: 是否显示其他
 *
 *
 *  PC筛选逻辑(暂未同步)：
 *  PS：iPhone、android、wp等选择版本，只有iphone、android可以同时选择，此时版本是去重后的结果。其他选项只能单选，再选择小版本。
 *  PS：wireless_type的类型大于1个，则显示“全部”按钮
 *
 * 
 *  ============================================================================
 *  注意：1.配置中使用的常量，参看PC版的js文件：http://mba.jd.com/res/js/wirelessFilter.js
 *       2.加载完wirelessFilter.js这个文件后，再初始化当前这个配置模块，以保证常量可以取到。
 *  
 */
define('./module/chart/filter-type', ['zepto'], function($) {
    var filterType = {
        typeData: null,
        typeStr: '',
        init: function(){
            var me = this;
            me.initData();
            me.generatorData();
            me.generatorDefault();
            me.generatorStr();
        },
        initData: function(){
            var me = this;
            me.dftVersions = G.wirelessFilter.DftVersions;
            me.littleVersions = G.wirelessFilter.littleVersions;
            //concat
            var item, arr = [];
            $.each(me.dftVersions, function(key, value){
                item = me.littleVersions[key];
                item = item ? item : [];
                item = item.concat(value);
                arr[key] = item;
            });
            me.allVersions = arr;
            //
            me.formatVersions(me.dftVersions);
            me.formatVersions(me.littleVersions);
            
        },
        formatVersions: function(obj){
            var me = this;
            var tmpArr, tmpStr, tmpItem = -1;
            var resultArr;
            $.each(obj, function(key, value){
                if(key.match('Format')){
                    return;
                }
                tmpStr = value.join('|');
                tmpArr = [];
                tmpArr = tmpStr.match(/\d\.\d/g);
                resultArr = [];
                //sublist
                $.each(tmpArr, function(index, item){
                    if(tmpItem != item){
                        tmpItem = item;
                        resultArr.push(item);
                    }
                });
                obj[key+'Format'] = resultArr;
            });
        },
        generatorData: function(){
            var me = this;
            var typeData = [{
                //实时播报
                key: "broadcast",
                page_name: "实时统计/实时播报",
                filterConf: null
            }, {
                //核心流程转化
                key: 'core_flow',
                page_name: '核心概览/核心流程转化',
                filterConf: {
                    wireless_type: [
                        window.G.wirelessFilter.WIRELESS_TYPE.APP
                    ],
                    app_type: [
                        window.G.wirelessFilter.APP_TYPE.IPHONE,
                        window.G.wirelessFilter.APP_TYPE.ANDROID,
                        window.G.wirelessFilter.APP_TYPE.IPAD,
                        window.G.wirelessFilter.APP_TYPE.WP,
                        window.G.wirelessFilter.APP_TYPE.OTHER
                    ],
                    showLevel: 2,
                    useSmallVersion: true,
                    appendLittleVersions: true
                }
            }, {
                //横向流程（原生等筛选项）
                key: 'horiz_event_statistics',
                page_name: '核心概览/横向流程',
                filterConf: {
                    wireless_type: [
                        window.G.wirelessFilter.WIRELESS_TYPE.APP,
                    ],
                    app_type: [
                        window.G.wirelessFilter.APP_TYPE.IPHONE,
                        window.G.wirelessFilter.APP_TYPE.ANDROID,
                        window.G.wirelessFilter.APP_TYPE.IPAD
                    ],
                    useSmallVersion: true,
                    isVersionOtherShow: false,
                }

            }, {
                //产品核心KPI（原生等筛选项）
                key: "kpi",
                page_name: "核心概览/产品核心KPI",
                filterConf: {
                    wireless_type: [
                        window.G.wirelessFilter.WIRELESS_TYPE.APP,
                        window.G.wirelessFilter.WIRELESS_TYPE.M
                    ],
                    app_type: [ 
                        window.G.wirelessFilter.APP_TYPE.IPHONE,
                        window.G.wirelessFilter.APP_TYPE.ANDROID,
                        window.G.wirelessFilter.APP_TYPE.IPAD
                    ],
                    wiretype_all_hide: true,    //隐藏"无线类型->全部"
                    useSmallVersion:true,
                    isVersionOtherShow: false
                }
            }, {
                //市场部无线日报--（无具体版本筛选）
                key: "wireless_daily",
                page_name: "核心概览/市场部无线日报",
                filterConf: {
                    wireless_type: [
                        window.G.wirelessFilter.WIRELESS_TYPE.APP,
                        window.G.wirelessFilter.WIRELESS_TYPE.M
                    ],
                    app_type: [
                        window.G.wirelessFilter.APP_TYPE.IPHONE,
                        window.G.wirelessFilter.APP_TYPE.ANDROID,
                        window.G.wirelessFilter.APP_TYPE.IPAD,
                        window.G.wirelessFilter.APP_TYPE.WP,
                        window.G.wirelessFilter.APP_TYPE.OTHER
                    ],
                    showLevel: 2,
                    useSmallVersion: true,
                    appendLittleVersions: true
                }
            }, {
                //用户分析
                key: "user_data",
                page_name: "用户分析/用户分析",
                filterConf: {
                    wireless_type: [
                        window.G.wirelessFilter.WIRELESS_TYPE.APP,
                        window.G.wirelessFilter.WIRELESS_TYPE.M
                    ],
                    app_type: [
                        window.G.wirelessFilter.APP_TYPE.IPHONE,
                        window.G.wirelessFilter.APP_TYPE.ANDROID,
                        window.G.wirelessFilter.APP_TYPE.IPAD,
                        window.G.wirelessFilter.APP_TYPE.WP,
                        window.G.wirelessFilter.APP_TYPE.OTHER
                    ],
                    showLevel: 2,
                    useSmallVersion: true,
                    appendLittleVersions: true
                }
            }, {
                //会员分析--（无具体版本筛选）
                key: "member_stat",
                page_name: "用户分析/会员分析",
                filterConf: {
                    wireless_type: [
                        window.G.wirelessFilter.WIRELESS_TYPE.APP,
                        window.G.wirelessFilter.WIRELESS_TYPE.M
                    ],
                    app_type: [
                        window.G.wirelessFilter.APP_TYPE.IPHONE,
                        window.G.wirelessFilter.APP_TYPE.ANDROID,
                        window.G.wirelessFilter.APP_TYPE.IPAD,
                        window.G.wirelessFilter.APP_TYPE.WP,
                        window.G.wirelessFilter.APP_TYPE.OTHER
                    ],
                    showLevel: 2,
                    useSmallVersion: true,
                    appendLittleVersions: true
                }
            }, {
                //APP渠道管理
                key: 'channelEffect',
                page_name: '渠道跟踪/APP渠道管理',
                filterConf: {
                    wireless_type: [
                        window.G.wirelessFilter.WIRELESS_TYPE.APP
                    ],
                    app_type: [
                        window.G.wirelessFilter.APP_TYPE.IPHONE,
                        window.G.wirelessFilter.APP_TYPE.ANDROID,
                        window.G.wirelessFilter.APP_TYPE.IPAD,
                        window.G.wirelessFilter.APP_TYPE.WP,
                        window.G.wirelessFilter.APP_TYPE.OTHER
                    ],
                    showLevel: 2,
                    useSmallVersion: true,
                    appendLittleVersions: true
                }
            }, {
                //M渠道管理
                key: 'channel_cpa',
                page_name: '渠道跟踪/M渠道管理',
                filterConf: null
            }, {
                //来源分析
                key: 'm_source_statistic',
                page_name: '渠道跟踪/M来源统计',
                filterConf: null
            }, {
                //自定义事件（原生等筛选项）
                key: 'event_statistics',
                page_name: '行为分析/自定义事件',
                filterConf: {
                    wireless_type: [
                        window.G.wirelessFilter.WIRELESS_TYPE.APP,
                        window.G.wirelessFilter.WIRELESS_TYPE.M
                    ],
                    app_type: [ 
                        window.G.wirelessFilter.APP_TYPE.IPHONE,
                        window.G.wirelessFilter.APP_TYPE.ANDROID,
                        window.G.wirelessFilter.APP_TYPE.IPAD
                    ],
                    isVersionOtherShow: false
                }
            }, {
                //页面统计——（原生筛选项）
                key: 'event_page',
                page_name: '行为分析/页面统计',
                filterConf: {
                    wireless_type: [
                        window.G.wirelessFilter.WIRELESS_TYPE.APP,
                        window.G.wirelessFilter.WIRELESS_TYPE.M
                    ],
                    app_type: [ 
                        window.G.wirelessFilter.APP_TYPE.IPHONE,
                        window.G.wirelessFilter.APP_TYPE.ANDROID,
                        window.G.wirelessFilter.APP_TYPE.IPAD
                    ],
                    isVersionOtherShow: false
                }
            }, {
                //搜索排行
                key: 'search',
                page_name: '行为分析/搜索排行',
                filterConf: null
            }, {
                //无线订单统计
                key: "order_ziying",
                page_name: "交易统计/无线订单统计",
                filterConf: {
                    wireless_type: [
                        window.G.wirelessFilter.WIRELESS_TYPE.APP,
                        window.G.wirelessFilter.WIRELESS_TYPE.M
                    ],
                    app_type: [
                        window.G.wirelessFilter.APP_TYPE.IPHONE,
                        window.G.wirelessFilter.APP_TYPE.ANDROID,
                        window.G.wirelessFilter.APP_TYPE.IPAD,
                        window.G.wirelessFilter.APP_TYPE.WP,
                        window.G.wirelessFilter.APP_TYPE.OTHER
                    ],
                    showLevel: 2,
                    useSmallVersion: true,
                    appendLittleVersions: true
                }
            }, {
                //订单类目统计
                key: 'order_cate',
                page_name: '交易统计/订单类目统计',
                filterConf: {
                    wireless_type: [
                        window.G.wirelessFilter.WIRELESS_TYPE.APP,
                        window.G.wirelessFilter.WIRELESS_TYPE.M,
                    ],
                    app_type: [
                        window.G.wirelessFilter.APP_TYPE.IPHONE,
                        window.G.wirelessFilter.APP_TYPE.ANDROID,
                        window.G.wirelessFilter.APP_TYPE.IPAD,
                        window.G.wirelessFilter.APP_TYPE.WP,
                        window.G.wirelessFilter.APP_TYPE.OTHER
                    ],
                    showLevel: 2,
                    isVersionOtherShow: false,
                    useSmallVersion: true,
                    appendLittleVersions: true
                }

            }, {
                //在线支付统计
                key: "pay_stat",
                page_name: "交易统计/在线支付统计",
                filterConf: {
                    wireless_type: [
                        window.G.wirelessFilter.WIRELESS_TYPE.APP,
                        window.G.wirelessFilter.WIRELESS_TYPE.M
                    ],
                    app_type: [
                        window.G.wirelessFilter.APP_TYPE.IPHONE,
                        window.G.wirelessFilter.APP_TYPE.ANDROID,
                        window.G.wirelessFilter.APP_TYPE.IPAD,
                        window.G.wirelessFilter.APP_TYPE.WP,
                        window.G.wirelessFilter.APP_TYPE.OTHER
                    ],
                    showLevel: 2,
                    useSmallVersion: true,
                    appendLittleVersions: true
                }
            }, {
                //频道统计——（原生筛选）
                key: "channel_statistic",
                page_name: "活动追踪/频道统计",
                filterConf: {
                    wireless_type: [
                        window.G.wirelessFilter.WIRELESS_TYPE.APP,
                        window.G.wirelessFilter.WIRELESS_TYPE.M
                    ],
                    app_type: [ window.G.wirelessFilter.APP_TYPE.IPHONE,
                        window.G.wirelessFilter.APP_TYPE.ANDROID,
                        window.G.wirelessFilter.APP_TYPE.IPAD,
                        window.G.wirelessFilter.APP_TYPE.WP,
                        window.G.wirelessFilter.APP_TYPE.OTHER
                    ],
                    useSmallVersion: true
                }
            }, {
                //活动统计——（原生筛选）
                key: 'active_detail',
                page_name: '活动追踪/活动统计',
                filterConf: {
                    wireless_type: [
                        window.G.wirelessFilter.WIRELESS_TYPE.APP,
                        window.G.wirelessFilter.WIRELESS_TYPE.M
                    ],
                    app_type: [
                        window.G.wirelessFilter.APP_TYPE.IPHONE,
                        window.G.wirelessFilter.APP_TYPE.ANDROID,
                        window.G.wirelessFilter.APP_TYPE.IPAD,
                        window.G.wirelessFilter.APP_TYPE.WP,
                        window.G.wirelessFilter.APP_TYPE.OTHER
                    ],
                    useSmallVersion: true
                }
            }, {
                //h5活动统计——（原生筛选）
                key: "h5activity_statistics",
                page_name: "活动追踪/h5活动统计",
                filterConf: {
                    wireless_type: [
                        window.G.wirelessFilter.WIRELESS_TYPE.APP,
                        window.G.wirelessFilter.WIRELESS_TYPE.M
                    ],
                    app_type: [ 
                        window.G.wirelessFilter.APP_TYPE.IPHONE,
                        window.G.wirelessFilter.APP_TYPE.ANDROID
                    ],
                    isVersionOtherShow: false
                }
            }, {
                //预约统计
                key: "appointment",
                page_name: "活动追踪/预约统计",
                filterConf: null
            },{
                //优惠券统计
                key: "coupons",
                page_name: "活动追踪/优惠券统计",
                filterConf: null
            }, {
                //消息统计
                key: "msg_statistics",
                page_name: "活动追踪/消息统计",
                filterConf: null
            }, {
                //特殊商品——（原生筛选）
                key: "special_goods",
                page_name: "活动追踪/特殊商品",
                filterConf: {
                    wireless_type: [
                        window.G.wirelessFilter.WIRELESS_TYPE.APP,
                        window.G.wirelessFilter.WIRELESS_TYPE.M
                    ],
                    app_type: [ window.G.wirelessFilter.APP_TYPE.IPHONE,
                        window.G.wirelessFilter.APP_TYPE.ANDROID,
                        window.G.wirelessFilter.APP_TYPE.IPAD,
                        window.G.wirelessFilter.APP_TYPE.WP,
                        window.G.wirelessFilter.APP_TYPE.OTHER
                    ],
                    useSmallVersion: true
                }
            },{
                //个性化统计——（原生筛选）
                key: "individuation",
                page_name: "活动追踪/个性化统计",
                filterConf: {
                    wireless_type: [
                        window.G.wirelessFilter.WIRELESS_TYPE.APP
                    ],
                    app_type: [
                        window.G.wirelessFilter.APP_TYPE.IPHONE,
                        window.G.wirelessFilter.APP_TYPE.ANDROID
                    ],
                    useSmallVersion: true
                }
            },{
                //设备与版本号
                key: "device_ver",
                page_name: "终端属性/设备与版本号",
                filterConf: {
                    wireless_type: [
                        window.G.wirelessFilter.WIRELESS_TYPE.APP
                    ],
                    app_type: [
                        window.G.wirelessFilter.APP_TYPE.IPHONE,
                        window.G.wirelessFilter.APP_TYPE.ANDROID,
                        window.G.wirelessFilter.APP_TYPE.IPAD
                    ],
                    showLevel: 2,
                    useSmallVersion: true
                }
            }, {
                //提数固化
                key: "h5activity_statistics",
                page_name: "提数固化/固化列表",
                filterConf: null
            }];
            //default
            var defaultConf = {
                showLevel: 3,
                isVersionMultiple: false,
                isVersionOtherShow: true,
                isAppTypeMultiple: true,
                useSmallVersion: false,
                appendLittleVersions: false,
                appTypeDefault: 'all'
            }
            //data
            me.typeData = typeData;
            me.typeDataDefault = defaultConf;
            // console.log(typeData.length)
        },
        generatorDefault: function(){
            var me = this;
            var defaults = {
                wireless_type: {
                    A: {
                        name: G.wirelessFilter.WIRELESS_TYPE.APP_NAME,
                        value: G.wirelessFilter.WIRELESS_TYPE.APP
                    },
                    M: {
                        name: G.wirelessFilter.WIRELESS_TYPE.M_NAME,
                        value: G.wirelessFilter.WIRELESS_TYPE.M
                    },
                    O: {
                        name: G.wirelessFilter.WIRELESS_TYPE.OTHER_NAME,
                        value: G.wirelessFilter.WIRELESS_TYPE.OTHER
                    },
                    PC: {
                        name: G.wirelessFilter.WIRELESS_TYPE.OTHER_PC_NAME,
                        value: G.wirelessFilter.WIRELESS_TYPE.OTHER_PC
                    }

                },
                app_type: {
                    iphone: {
                        name: G.wirelessFilter.APP_TYPE.IPHONE_NAME,
                        value: G.wirelessFilter.APP_TYPE.IPHONE,
                        sub_app_type_list: [{
                            name: G.wirelessFilter.APP_TYPE.IPHONE_O_NAME,
                            value: G.wirelessFilter.APP_TYPE.IPHONE_O
                        }, {
                            name: G.wirelessFilter.APP_TYPE.IPHONE_M_NAME,
                            value: G.wirelessFilter.APP_TYPE.IPHONE_M
                        }]
                    },
                    ipad: {
                        name: G.wirelessFilter.APP_TYPE.IPAD_NAME,
                        value: G.wirelessFilter.APP_TYPE.IPAD,
                        sub_app_type_list: [{
                            name: G.wirelessFilter.APP_TYPE.IPAD_O_NAME,
                            value: G.wirelessFilter.APP_TYPE.IPAD_O
                        }, {
                            name: G.wirelessFilter.APP_TYPE.IPAD_M_NAME,
                            value: G.wirelessFilter.APP_TYPE.IPAD_M
                        }]
                    },
                    android: {
                        name: G.wirelessFilter.APP_TYPE.ANDROID_NAME,
                        value: G.wirelessFilter.APP_TYPE.ANDROID,
                        sub_app_type_list: [{
                            name: G.wirelessFilter.APP_TYPE.ANDROID_O_NAME,
                            value: G.wirelessFilter.APP_TYPE.ANDROID_O
                        }, {
                            name: G.wirelessFilter.APP_TYPE.ANDROID_M_NAME,
                            value: G.wirelessFilter.APP_TYPE.ANDROID_M
                        }]
                    },
                    wp: {
                        name: G.wirelessFilter.APP_TYPE.WP_NAME,
                        value: G.wirelessFilter.APP_TYPE.WP,
                        sub_app_type_list: [{
                            name: G.wirelessFilter.APP_TYPE.WP_O_NAME,
                            value: G.wirelessFilter.APP_TYPE.WP_O
                        }, {
                            name: G.wirelessFilter.APP_TYPE.WP_M_NAME,
                            value: G.wirelessFilter.APP_TYPE.WP_M
                        }]
                    },
                    other: {
                        name: G.wirelessFilter.APP_TYPE.OTHER_NAME,
                        value: G.wirelessFilter.APP_TYPE.OTHER,
                        sub_app_type_list: []
                    }
                },
                m_type: {
                    other: {
                        name: G.wirelessFilter.VERSION_TYPE.OTHER_NAME,
                        value: G.wirelessFilter.VERSION_TYPE.OTHER
                    }
                }
            }
            me.defaultVal = defaults;
            // console.log(defaults);
        },
        generatorStr: function(){
            var me = this;
            var data = me.typeData;
            var str = '';
            for(var i=0,len=data.length; i<len; i++){
                str += data[i].key+'|';
            }
            me.typeStr = str;
        },
        getTypeConf: function(key){
            var me = this;
            var index = -1;
            if(!key.match(me.typeStr)){
                return null;
            }
            index = me.typeStr.split(key)[0];
            if(index.length == 0){
                index = 0
            }else{
                index = index.split('|').length-1;
            }
            var obj = me.typeData[index];
            var defaultConf = $.extend(true, {}, me.typeDataDefault);
            obj.filterConf = $.extend(defaultConf, obj.filterConf);
            return obj;
        },
        getFilterData: function(obj){
            var me = this;
            var data = {
                wireless_type: [],
                app_type: []
            };
            //wireless
            var arr = obj.wireless_type;
            var itemData;
            $.each(arr, function(index, item) {
                data.wireless_type.push(me.defaultVal.wireless_type[item])
            });
            //app
            arr = obj.app_type;
            $.each(arr, function(index, item) {
                data.app_type.push(me.defaultVal.app_type[item])
            });
            return data;
        },
        getVersions: function(obj, key){
            var me = this;
            var data, littleData;
            var keyFormat = key + 'Format';
            if(obj.showLevel == 3){//原生/m 选项展示
                data = me.defaultVal.app_type[key].sub_app_type_list;
            }else{
                data = me.dftVersions[keyFormat];
                if(obj.appendLittleVersions){
                    littleData = me.littleVersions[keyFormat];
                    littleData = littleData ? littleData : [];
                    data = littleData.concat(me.dftVersions[keyFormat]);
                }
                data = data.reverse();
            }
            return data;
        },
        getLittleVersions: function(key, arr){
            var me = this;
            var tmpArr = me.allVersions[key];
            var tmpStr = tmpArr.join('|');
            var reg;
            var result = [];
            $.each(arr, function(index, item){
                reg = new RegExp(item+'\\.\\d','g');
                result = result.concat(tmpStr.match(reg));
            });
            result = result.join(',');
            return result;
        }
    };
    return filterType;
});