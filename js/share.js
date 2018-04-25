var anyi = anyi || {};

/**
 * 安逸微信分享类，会替代 anyi.common.weixin
 */
anyi.weixin = (function (self) {

    self.defaults = {
        title: "好友正在风险管家签单赚佣金，线上时代已经到来，你还在犹豫吗?",
        desc: "打破传统保险推广方法，让你更快速，更便捷的签单，百年万薪不是梦",
        type: "link",
        link: window.location.origin + '/activity/sharecommission/index.html',
        imgUrl: window.location.origin +'/activity/sharecommission/images/share_icon.png',
        dataUrl: "",
        success: function () {

        },
        cancel: function () {

        }
    };
    /**
     * 微信分享
     * @param config 微信分享配置，用默认不传 或用 {}
     * @param onready 分享初始化成功回调函数
     * @param loading load 具体使用方法查看我写的$.ajax的扩展方法
     */
    self.share = function (config, onready, loading) {
        var link = encodeURIComponent(location.href.split('#')[0]);
        var url = "/wechat/getjsconfig?url=" + link;
        $.ajax({
            type: "GET",
            url: url,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            loading: loading
        }).done(function (data) {
            if (window.wx) {
                window.wx.config(data);
                window.wx.ready(function () {
                    if (onready) {
                        onready(window.wx, config || {});
                    } else {
                        self.update(config || {});
                    }
                });
            }
        });
    };
    /**
     * 微信公众号分享设置
     * @param config
     */
    self.update = function (config) {
        config = config || {};
        config = $.extend(true, self.defaults, config);
        if (window.wx) {
            window.wx.onMenuShareTimeline(config);
            window.wx.onMenuShareAppMessage(config);
        }
    };
    return self;
})(anyi.weixin || {});