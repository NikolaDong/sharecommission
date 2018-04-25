/**
 * Created by libo & xuedong.pu on 2016/6/13.
 * 权限验证
 */



var anyi = anyi || {};
/**
 * auth
 */
anyi.auth = (function () {

    var self = {};

    /**
     * 获取浏览器版本
     * @returns {string}
     */
    var getBrowser = function () {
        var browser = "unknown";
        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.match(/micromessenger/i) == 'micromessenger') {
            browser = "wechat";
        }
        return browser;
    };

    /**
     * 用户信息
     * @type {{}}
     */
    self.user = {};

    /**
     * 设置cookie
     * @param {string} name  键名
     * @param {string} value 键值
     * @param {integer} days cookie周期
     */
    var setCookie = function (name, value, days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        } else {
            var expires = "";
        }
        document.cookie = name + "=" + value + expires + "; path=/";
    };

    // 获取cookie
    var getCookie = function (name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
        return null;
    };

    // 删除cookie
    var deleteCookie = function (name) {
        setCookie(name, "", -1);
    };


    /**
     * 判断环境
     * 平行环境和生产环境返回true 其他环境返回false
     */
    var judgeHost = function () {
        var host = window.location.host;
        if (host === 'm.anyi-tech.com' || host === 'm.parallel.anyi-tech.com') {
            return true;
        } else {
            return false;
        }
    };


    /**
     * 验证权限
     * @returns {boolean}
     */
    var checkToken = function () {
        var token = getCookie("sso_token");
        //var url = encodeURIComponent(window.location.href == window.location.origin + "/login.html" ? window.location.origin + "/personal-center.html" : window.location.href);
        var parent_id = urlHrefObject.parent_id || '';
        var urlparent = parent_id == '' ? '' : '?parent_id=' + parent_id;
        var url = encodeURIComponent(window.location.origin + window.location.pathname + urlparent);
        var bindUrl = encodeURIComponent(window.location.origin + window.location.pathname + urlparent);
        var fromUrl = window.location.origin + window.location.pathname;
        var domain = judgeHost() ? 'http://sso.anyi-tech.com/' : 'http://sso.test.anyi-tech.com/';
        var method = '/ws_sso/wechat/weixinApi/oauth?appid=';
        var appId = judgeHost() ? 'wxef97c2317bcc7574' : 'wx830b6d5a4c135731';
        //var authUrl = 'http://sso.test.anyi-tech.com/ws_sso/wechat/weixinApi/oauth?appid=wx830b6d5a4c135731&target=' + url +'&toBind='+bindUrl+ '&response_type=code&scope=snsapi_userinfo&state=STATE&connect_redirect=1&officialAccount=fxgj#wechat_redirect?fromUrl='+encodeURIComponent(fromUrl);
        var authUrl = domain + method + appId + '&target=' + url + '&toBind=' + bindUrl + '&response_type=code&scope=snsapi_userinfo&state=STATE&connect_redirect=1&officialAccount=fxgj&fromUrl=' + encodeURIComponent(fromUrl + urlparent) + '#wechat_redirect';
        if (!urlHrefObject.wxuserinfo) {  //初次进入授权微信
            setCookie('afreshLogin', 'false', 0.02);
            deleteCookie("sso_token");
            deleteCookie("user_id");
            location.href = authUrl;
            return false;
        }
        if(!getCookie('afreshLogin')){  //登录超时重新授权
            setCookie('afreshLogin', 'false', 0.02);
            location.href = authUrl;
            return false;
        }
        if(urlHrefObject.wxuserinfo){     //授权后种下cookies用户信息
            setCookie('wxuserinfoDecode', urlHrefObject.wxuserinfo, 0.02);
        }

        //形成公共json对象  可公共调取数据
        var cookiesToken = decodeURIComponent(getCookie('wxuserinfoDecode'));
        var user = cookiesToken;
        try{
            user = eval('(' + JSON.parse(cookiesToken) + ')');
        } catch(e){
            user = JSON.parse(cookiesToken);
        }
        if (user && user.openid) {
            self.user = user;
            //return true;
        } else {
            //deleteCookie("wxuserinfoDecode");
            //location.href = authUrl;
            console.log('error:' + user);
        }

        self.relogin = authUrl;

        //若存在sso_token获取user_id  种cookies
        if(token && !getCookie("user_id")){
            var uid = user.user_id || JSON.parse(decodeURIComponent(CookiesInfo.get('wxuserinfoDecode'))).user_id;
            setCookie('user_id', uid, 1);
            setCookie('afreshLogin', 'false', 0.02);
        }
        //登录超时并未注册用户
        if(!token && user.user_id){
            location.href = authUrl;
        }
        //access_token
        if(urlHrefObject.access_token){
            setCookie('access_token', urlHrefObject.access_token, 0.02);
            setCookie('access_isout', '1', 0.02);
        }
        if(urlHrefObject.access_token && !getCookie("access_isout")){
            location.href = authUrl;
        }

        if(window.location.pathname.indexOf('product') > -1 && window.location.pathname.indexOf('index.html') > -1){
            var and = urlparent == '' ? '?' : '&';
            var str = '<a href="'+ window.location.origin + '/activity/sharecommission/index.html' + urlparent + and +'wxuserinfo=' + urlHrefObject.wxuserinfo +'" class="look-activ-url" style="background:-moz-linear-gradient(left, #f88969, #ee2963);background:-webkit-linear-gradient(left, #f88969, #ee2963);background:-o-linear-gradient(left, #f88969, #ee2963);background:linear-gradient(left, #f88969, #ee2963);position: fixed;right: -25px;bottom: 40%;z-index: 9;font-size: 15px;width: 21px;color: #fff;text-align: center;line-height: 18px;padding: 10px 45px 10px 10px;border-radius: 20px;-moz-border-radius: 20px;-webkit-border-radius: 20px;-o-border-radius: 20px;">查看活动详情</a>';
            $('body').append(str);
        }
    };


    var check = function () {
        var token = getCookie("sso_token");
        var fromUrl = window.location.href;
        //临时解决方案
        if (!/.*\/login.html$|.*\/register.html$|.*\/modify-password.html$/.test(location.pathname) && !token) {
            location.href = 'error.html';
            return false;
        }
        return true;
    };

    var ua = window.navigator.userAgent.toLowerCase();
    if (ua.match(/micromessenger/i) == 'micromessenger' && window.frames.length === parent.frames.length) {
        checkToken();
    } else {
        check();
    }

	/**
     * iframe中打开，去除头部
	 */
    if (window.frames.length !== parent.frames.length) {
        document.getElementsByTagName("html")[0].className += " display-modal";
    }

    return self;
})();

// 用于检测缓存并更新
window.addEventListener('load', function (e) {
    window.applicationCache.addEventListener('updateready', function (e) {
        if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
            // Browser downloaded a new app cache.
            // Swap it in and reload the page to get the new hotness.
            window.applicationCache.swapCache();
            window.location.reload();
        } else {
            // Manifest didn't changed. Nothing new to server.
        }
    }, false);

}, false);