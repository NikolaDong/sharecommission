/**
 * Created by xuedong.pu on 2017/10/12.
 */
//接口域名
var hostsUrl = 'http://sso.test.anyi-tech.com';
var hostsUrl2 = 'http://activity.anyitech.ltd';

//是否登录  跳转链接
function funcUrl(url, task) {
    var _task = task || '';
    var at = location.search == '' ? '&' : '&';
    if(_task == '') at = '';
    var parent_id = urlHrefObject.parent_id || '';
    var urlparent = parent_id == '' ? '' : '&parent_id=' + parent_id;
    if(!CookiesInfo.get("sso_token") && CookiesInfo.get("user_id")){
        showMaskEditCom({
            text: '<p class="ed_mask">登录超时，重新登录中...</p>',
            duration: 1500
        });
        location.href = anyi.auth.relogin;
        return false;
    }
    if(!CookiesInfo.get("sso_token")){
        showMaskEditCom({
            text: '<p class="ed_mask">请绑定绑定手机号哦</p>',
            duration: 1500
        });
        setTimeout(function(){
            location.href = 'apply.html?wxuserinfo=' + urlHrefObject.wxuserinfo + '&access_token=' + urlHrefObject.access_token + urlparent + at + _task + '&fromUrl=' + encodeURIComponent(window.location.origin + window.location.pathname);
        },1000);
    } else{
        var user_id = CookiesInfo.get('user_id') || anyi.auth.user.user_id;
        $('.ajax-loading').show();
        $.ajax({
            url: hostsUrl2 + "/ws_activity/haoyoutuijian/checkUser",
            type: "post",
            dataType: "json",
            data: {'user_id': user_id},
            success: function (res) {
                if(res.cord == '0'){
                    $('.ajax-loading').hide();
                    location.href = url + '?wxuserinfo=' + urlHrefObject.wxuserinfo + urlparent + at + _task;
                } else{
                    var arrData = {'user_id': anyi.auth.user.user_id, 'phone': '', 'openid': anyi.auth.user.openid, 'nickname': anyi.auth.user.nickname, 'headimgurl': anyi.auth.user.headimgurl, 'parent_id': parent_id};
                    addUser(function(){     //绑定用户
                        $('.ajax-loading').hide();
                        location.href = url + '?wxuserinfo=' + urlHrefObject.wxuserinfo + urlparent + at + _task;
                    }, arrData);
                }
            }
        });
    }
}
//新增用户
function addUser(succ, arrData){
    $.ajax({
        url: hostsUrl2 + "/ws_activity/haoyoutuijian/addUser",
        type: "post",
        data: arrData,
        dataType: "json",
        success: function(data){
            if(data.cord == '0'){
                succ();
            } else{
                showMaskEditCom({
                    text: data.msg,
                    duration: 1500
                });
                succ();
            }
        },
        error: function(){
            $('.ajax-loading').hide();
            showMaskEditCom({
                text: '网络异常:addUser',
                duration: 1500
            });
        }
    });
}


/**
 * index.html
 * */
//保险精选 swiper
var swiper = new Swiper('.swiper-container', {
    slidesPerView: 2,
    centeredSlides: true,
    paginationClickable: true,
    spaceBetween: 28,
    loop:true
});

//完成任务
function endtask(){
    showMaskEditCom({
        text: '已完成该任务',
        duration: 1500
    });
}


/**
 * apply.html
 * */
//图像验证码
function codeFun(){
    $.ajax({
        url: hostsUrl + "/ws_sso/captcha/getCaptcha?width=100&height=39",
        type: "get",
        dataType: "json",
        success: function (res) {
            if(res.code == 1){
                $('.code-svg').html(res.result.svg);
                CookiesInfo.set('captche', res.result.captche, {expires:0.02});
            }
            $('#code').val('');
        }
    });
}
if($('.code-svg').length > 0){
    codeFun();
}


/**
 * list.html
 * */
if($('.product-list-link').length > 0){
    var product_url = $('.product-list-link ul').find('li');
    if(urlHrefObject.task == 1){
        $('.product-list-link').find('.det p.red span.fr').text('购买');
        for(var pr=0;pr<product_url.length;pr++){
            product_url.eq(pr).find('a').attr('href', product_url.eq(pr).find('a').data('url') + '?wxuserinfo=' + urlHrefObject.wxuserinfo);
        }
    } else{
        for(var vr=0;vr<product_url.length;vr++){
            product_url.eq(vr).find('a').attr('href', product_url.eq(vr).find('a').data('url') + '?wxuserinfo=' + urlHrefObject.wxuserinfo);
        }
    }
}


/**
 * rewards.html
 * */
//奖励明细切换
$('.details-list .nav li').on('click', 'a', function(){
    $(this).addClass('on').parent().siblings().find('a').removeClass('on');
    $(this).parents('.details-list').find('.content ul').eq($(this).parent().index()).addClass('show').siblings().removeClass('show');
});



//滚动插件  多行滚动jQuery循环新闻列表代码
(function($){
    $.fn.extend({
        Scroll:function(opt,callback){
            //参数初始化
            if(!opt) var opt={};
            var _this=this.eq(0).find("ul:first");
            var  getpdg = opt.pdg?parseInt(opt.pdg):0,
                lineH=_this.find("li:first").height()+getpdg, //获取行高
                line=opt.line?parseInt(opt.line,10):parseInt(this.height()/lineH,10), //每次滚动的行数，默认为一屏，即父容器高度
                speed=opt.speed?parseInt(opt.speed,10):500, //卷动速度，数值越大，速度越慢（毫秒）
                timer=opt.timer?parseInt(opt.timer,10):3000; //滚动的时间间隔（毫秒）
            if(line==0) line=1;
            var upHeight=0-line*lineH;
            //滚动函数
            scrollUp=function(){
                _this.animate({
                    marginTop:upHeight
                },speed,function(){
                    for(i=0;i<line;i++){
                        for(var j=0;j<1;j++){
                            _this.find("li:eq(0)").appendTo(_this);
                        }
                    }
                    _this.css({marginTop:0});
                });
            };
            //鼠标事件绑定
            /*_this.hover(function () {
                clearInterval(timerID);
            }, function () {
                timerID = setInterval("scrollUp()", timer);
            }).mouseout();*/

            timerID = setInterval("scrollUp()", timer);
        }
    });
})(jQuery);

$(function(){
    /**
     * 任务状态
     * */
    if($('.lyn-list').length > 0 && CookiesInfo.get('user_id')){
        $.ajax({
            url: hostsUrl2 + "/ws_activity/haoyoutuijian/task_status",
            type: "post",
            data: {"user_id": CookiesInfo.get('user_id')},
            dataType: "json",
            success: function (data) {
                if(data.cord == 0){
                    if(data.data != null){
                        if(data.data.task1 != null){
                            $('#task1').find('a').attr('href', 'javascript:endtask();');
                            $('#task1').addClass('off');
                            $('#task1').find('p span').html('已完成');
                            $('#task1').find('p em').html('完成体验投保流程');
                        }
                        if(data.data.task2 != null){
                            $('#task2').find('p span').html('继续邀请');
                            $('#task2').find('p em').html('已邀请'+ parseInt(data.data.task2.count) +'位小管家');
                        }
                        if(data.data.task3 != null){
                            $('#task3').find('p span').html('继续分享');
                            $('#task3').find('p em').html('已获得'+ parseFloat(data.data.task3.prices) +'元佣金奖励');
                        }
                    }
                } else{
                    showMaskEditCom({
                        text: "task_status：" + data.msg,
                        duration: 1500
                    });
                }
            },
            error: function(){
                showMaskEditCom({
                    text: '网络异常:task_status',
                    duration: 1500
                });
            }
        });
    }

    /**
     * 他人用户奖励信息列表
     * */
    if($('.list-silder').length > 0){
        $('.ajax-loading').show();
        $.ajax({
            url: hostsUrl2 + "/ws_activity/haoyoutuijian/gift_list",
            type: "post",
            data: {"user_id": CookiesInfo.get('user_id') || ''},
            dataType: "json",
            success: function (data) {
                $('.ajax-loading').hide();
                if(data.cord == '0'){
                    if(data.data != null){
                        if(data.data.length > 0){
                            var html = '';
                            for(var i=0;i<data.data.length;i++){
                                html += '<li class="unborder">';
                                html += '    <dl class="clearfix">';
                                html += '        <dt class="fl"><img src="'+ data.data[i].head_img +'" /></dt>';
                                html += '        <dd>';
                                html += '            <p class="name"><span class="fr">'+ data.data[i].price +'元</span><span>'+ data.data[i].nick_name +'</span></p>';
                                html += '            <p class="time">'+ data.data[i].create_time +'</p>';
                                html += '        </dd>';
                                html += '    </dl>';
                                html += '</li>';
                            }
                            $('.list-silder').find('ul').html(html);
                            //他人明细公示栏滚动
                            if($('.apply-list').length > 0){
                                if(data.data.length > 3){
                                    $(".list-silder").Scroll({line:1,speed:1500,timer:2500,pdg:0});
                                }
                            } else{
                                if(data.data.length > 1){
                                    $(".list-silder").Scroll({line:1,speed:1500,timer:2500,pdg:0});
                                }
                            }
                        } else{
                            $('.list-silder').find('ul').html('<li class="null"><p style="text-align: center;line-height: .6rem;">无任何明细</p></li>');
                        }
                    } else{
                        $('.list-silder').find('ul').html('<li class="null"><p style="text-align: center;line-height: .6rem;">无任何明细</p></li>');
                    }
                } else{
                    showMaskEditCom({
                        text: "gift_list：" + data.msg,
                        duration: 1500
                    });
                    $('.list-silder').find('ul').html('<li class="null"><p style="text-align: center;line-height: .6rem;">无任何明细</p></li>');
                }
            },
            error: function(){
                $('.ajax-loading').hide();
                showMaskEditCom({
                    text: '网络异常:gift_list',
                    duration: 1500
                });
                $('.list-silder').find('ul').html('<li class="null"><p style="text-align: center;line-height: .6rem;">无任何明细</p></li>');
            }
        });
    }

    /**
     * 任务奖励明细
     * */
    if($('.details-list').length > 0 && CookiesInfo.get('user_id')){
        $('.ajax-loading').show();
        $.ajax({
            url: hostsUrl2 + "/ws_activity/haoyoutuijian/gift_info",
            type: "post",
            data: {"user_id": CookiesInfo.get('user_id')},
            dataType: "json",
            success: function (data) {
                $('.ajax-loading').hide();
                if(data.cord == '0'){
                    //达成奖励明细
                    if(data.data.gift.length > 0){
                        var gift = '';
                        var money = 0;
                        for(var i=0;i<data.data.gift.length;i++){
                            gift += '<li class="clearfix">';
                            gift += '    <div class="portrait fl"><img src="'+ data.data.gift[i].head_img +'" /></div>';
                            gift += '    <div class="nickname">';
                            gift += '        <h5>'+ data.data.gift[i].nick_name +'<em class="fr">'+ data.data.gift[i].price +'元</em></h5>';
                            gift += '        <p>'+ data.data.gift[i].name +'</p>';
                            gift += '        <p class="clearfix"><i class="fr">'+ data.data.gift[i].create_time +'</i><i class="fl">订单编号：'+ data.data.gift[i].order_id +'</i></p>';
                            gift += '    </div>';
                            gift += '</li>';
                            money += parseFloat(data.data.gift[i].price);
                        }
                        $('.details-list .content').find('ul').eq(0).html(gift);
                        $('#money').text(money.toFixed(2));
                    } else{
                        $('.details-list .content').find('ul').eq(0).html('<li class="null" style="text-align: center;line-height: .6rem;"><p>无任何明细</p></li>');
                    }
                    //未达成奖励明细
                    if(data.data.no_gift.length > 0){
                        var no_gift = '';
                        for(var j=0;j<data.data.no_gift.length;j++){
                            no_gift += '<li class="clearfix">';
                            no_gift += '    <div class="portrait fl"><img src="'+ data.data.no_gift[j].head_img +'" /></div>';
                            no_gift += '    <div class="nickname">';
                            no_gift += '        <div class="temp clearfix"><span class="fr">未首投</span><span class="fl">'+ data.data.no_gift[j].nick_name +'</span></div>';
                            no_gift += '    </div>';
                            no_gift += '</li>';
                        }
                        $('.details-list .content').find('ul').eq(1).html(no_gift);
                    } else{
                        $('.details-list .content').find('ul').eq(1).html('<li class="null"><p style="text-align: center;line-height: .6rem;">无任何明细</p></li>');
                    }
                } else{
                    showMaskEditCom({
                        text: "gift_info：" + data.msg,
                        duration: 1500
                    });
                    $('.details-list .content').find('ul').html('<li class="null"><p style="text-align: center;line-height: .6rem;">无任何明细</p></li>');
                }
            },
            error: function(){
                $('.ajax-loading').hide();
                showMaskEditCom({
                    text: '网络异常:gift_info',
                    duration: 1500
                });
                $('.details-list .content').find('ul').html('<li class="null"><p style="text-align: center;line-height: .6rem;">无任何明细</p></li>');
            }
        });
    }

    /**
     * 手机注册
     * */
    //短信验证码
    var senStop = true;//发送验证码开关
    $(".send-btn").click(function(event){
        event.preventDefault();
        var mobile = $('#mobile').val();
        var code = $('#code').val();
        if(mobile == ''){
            showMaskEditCom({
                text: '请输入手机号',
                duration: 1500
            });
            return false;
        } else if(!commonPhoneReg.test(mobile)){
            showMaskEditCom({
                text: '<p class="ed_mask">请输入正确的手机号</p>',
                duration: 1500
            });
            return false;
        } else if(code == ''){
            showMaskEditCom({
                text: '<p class="ed_mask">请输入图形验证码</p>',
                duration: 1500
            });
            return false;
        } else if(senStop){
            $('.ajax-loading').show();
            $.ajax({
                url: hostsUrl + "/ws_sso/phone/getCode",
                type: "post",
                headers: {
                    captche: CookiesInfo.get('captche')
                },
                data: {"phone": mobile, "verifyCode": code},
                dataType: "json",
                success: function(res){
                    $('.ajax-loading').hide();
                    if(res.code == 1){
                        showMaskEditCom({
                            text: '验证码已发送',
                            duration: 1500
                        });
                        $('#verify').focus();
                        $(".send-btn").removeClass('on');
                        if(!senStop){
                            //验证码已发送
                            showMaskEditCom({
                                text: '验证码已发送',
                                duration: 1500
                            });
                            return false;
                        }
                        //成功开始倒计时
                        senStop = false;
                        countDown($(".send-btn"),59,function(){
                            senStop = true;
                            $(".send-btn").text('重新获取');
                            $(".send-btn").addClass('on');
                        });
                        //verify test
                        //$('#verify').val(res.data).attr('value', res.data);
                    } else{
                        showMaskEditCom({
                            text: res.msg,
                            duration: 1500
                        });
                    }
                },
                error: function(){
                    $('.ajax-loading').hide();
                    showMaskEditCom({
                        text: '网络异常:getCode',
                        duration: 1500
                    });
                }
            });
        } else{
            showMaskEditCom({
                text: '验证码已发送',
                duration: 1500
            });
            return false;
        }
    });
    //倒计时
    function countDown(obj,time,fun){
        var oTimer = null;
        var i = time || 60;
        oTimer = setInterval(function(){
            obj.text('(' + i + 's)' + '重新获取');
            if(i==0){
                clearInterval(oTimer);
                fun ? fun() : null;
            }
            i--;
        }, 1000);
    }
    //submit 手机注册
    $('form').on('click', '.submit-btn-apply', function(event){
        event.preventDefault();
        var mobile = $('#mobile').val(), verify = $('#verify').val(), access_token = urlHrefObject.access_token, strData = {};
        if(mobile == ''){
            showMaskEditCom({
                text: '请输入手机号',
                duration: 1500
            });
            return false;
        } else if(!commonPhoneReg.test(mobile)){
            showMaskEditCom({
                text: '<p class="ed_mask">请输入正确的手机号</p>',
                duration: 1500
            });
            return false;
        } else if(verify == ''){
            showMaskEditCom({
                text: '请输入验证码',
                duration: 1500
            });
            return false;
        } else{
            strData = {"code": verify, "account": mobile, "access_token": access_token};

            $('.ajax-loading').show();
            $.ajax({
                url: hostsUrl + "/ws_sso/weixin/phoneBindWeixin",
                type: "post",
                data: strData,
                dataType: "json",
                success: function(res){
                    //var urlparent = !urlHrefObject.parent_id ? '' : '&parent_id=' + urlHrefObject.parent_id;
                    var arrData;
                    var parent_id = urlHrefObject.parent_id || '';
                    var urlparent = parent_id == '' ? '' : '&parent_id=' + parent_id;
                    if(res.code == 1){
                        MtaH5.clickStat("20");
                        arrData = {'user_id': res.result.user_id, 'phone': mobile, 'openid': anyi.auth.user.openid, 'nickname': anyi.auth.user.nickname, 'headimgurl': anyi.auth.user.headimgurl, 'parent_id': parent_id};
                        showMaskEditCom({
                            text: '恭喜您，注册成功！',
                            duration: 1500
                        });
                        CookiesInfo.set('sso_token', res.result.token, {expires:0.02});
                        CookiesInfo.set('user_id', res.result.user_id, {expires:0.02});

                        addUser(function(){     //绑定用户
                            $('.ajax-loading').hide();
                            setTimeout(function(){
                                if(urlHrefObject.fromUrl){
                                    location.href = decodeURIComponent(urlHrefObject.fromUrl) + '?wxuserinfo=' + urlHrefObject.wxuserinfo + urlparent;
                                } else{
                                    location.href = 'index.html' + '?wxuserinfo=' + urlHrefObject.wxuserinfo + urlparent;
                                }
                            },1000);
                        }, arrData);

                    } else{
                        MtaH5.clickStat("20");
                        $('.ajax-loading').hide();
                        if(res.msg.indexOf('此微信已经绑定') > -1){
                            arrData = {'user_id': anyi.auth.user.user_id, 'phone': mobile, 'openid': anyi.auth.user.openid, 'nickname': anyi.auth.user.nickname, 'headimgurl': anyi.auth.user.headimgurl, 'parent_id': parent_id};
                            showMaskEditCom({
                                text: '绑定成功',
                                duration: 1500
                            });
                            addUser(function(){     //绑定用户
                                $('.ajax-loading').hide();
                                setTimeout(function(){
                                    if(urlHrefObject.fromUrl){
                                        location.href = decodeURIComponent(urlHrefObject.fromUrl) + '?wxuserinfo=' + urlHrefObject.wxuserinfo + urlparent;
                                    } else{
                                        location.href = 'index.html' + '?wxuserinfo=' + urlHrefObject.wxuserinfo + urlparent;
                                    }
                                },1000);
                            }, arrData);
                        } else{
                            MtaH5.clickStat("21");
                            showMaskEditCom({
                                text: res.msg,
                                duration: 1500
                            });
                        }
                    }
                },
                error: function(){
                    MtaH5.clickStat("21");
                    $('.ajax-loading').hide();
                    showMaskEditCom({
                        text: '网络异常:phoneBindWeixin',
                        duration: 1500
                    });
                }
            });
        }
    });
});