/*
* 小度掌柜声音管理
* 2014.11.07
*/

(function () {
    var Const = {
        COOKIE_SOUND_KEY : "BAIDU_WAIMAI_CRM_PC_SOUND_SET",
        DEFAULT_SOUND_VAL : 1,
        COOKIE_PATH : "/",
        COOKIE_EXPIRE : 60 * 60 * 1000 * 24 * 365
    }
    
    jsmod.util.sound = {
        set: function(val){
            window.cefQuery && window.cefQuery({
                request: 'Window.setPlaysound:' + val,
                onSuccess: function(res) {
                    jsmod.util.cookie.setRaw(Const.COOKIE_SOUND_KEY, val,{
                        expires: Const.COOKIE_EXPIRE,
                        path: Const.COOKIE_PATH
                    });
                    setTimeout(function(){
                        jsmod.ui.totast("提示音设置成功");
                    },300);
                },
                onError: function() {
                    jsmod.ui.totast("提示音设置失败，请联系技术人员");
                }
            });
        },
        get: function(){
            return jsmod.util.cookie.get(Const.COOKIE_SOUND_KEY) || Const.DEFAULT_SOUND_VAL;
        },
        //催单&通用接口
        playByName: function(val){
            var sound = val || "cuidan.wav";
            var cpp = window.cefQuery || {};
            //console.log(cpp,sound);
            if($.isFunction(cpp)){
                cpp({
                    request: 'Window.SoundPlayByName:' + sound,
                    onSuccess: function(res) {
                        return;
                    },
                    onError: function() {
                        jsmod.ui.totast("提示音播放失败，请联系技术人员");
                    }
                });
            }
        },
        //试听
        playTest: function(val){
            var sound = val || this.get();
            var cpp = window.cefQuery || {};
            //-1 为关闭声音
            if(sound == "-1"){
                return;
            }
            if($.isFunction(cpp)){
                cpp({
                    request: 'Window.TestPlaysound:' + sound,
                    onSuccess: function(res) {
                        return;
                    },
                    onError: function() {
                        jsmod.ui.totast("提示音播放失败，请联系技术人员");
                    }
                });
            }
        },
        //正常播放主音乐
        play: function(noFlash){
            var sound = this.get();
            if(sound == "-1"){
                return;
            }
            var cpp = window.cefQuery || {};
            if($.isFunction(cpp)){
                cpp({
                    request: 'Window.PlaySound',
                    onSuccess: function(res) {
                        return;
                    },
                    onError: function(res) {
                    }
                });
                if(!noFlash){
                    cpp({
                        request: 'Window.FlashWindow'
                    });
                }
            }
        },
        stop: function(){
            var cpp = window.cefQuery || {};
            if($.isFunction(cpp)){
                cpp({
                    request: 'Window.StopSound'
                });
            }
        }        
    }
})();