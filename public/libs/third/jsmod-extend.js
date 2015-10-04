/**
 * jsmod 扩展功能
 */
(function () {
    var jsmod = {};

    jsmod.util = {};

    jsmod.ui = {};

    window.jsmod = jsmod;

    // 需要引入的模块
    __inline("./jsmod-extend/util/klass.js");
    __inline("./jsmod-extend/util/event.js");
    __inline("./jsmod-extend/util/cookie.js");
    __inline("./jsmod-extend/util/util.js");
    __inline("./jsmod-extend/util/url.js");
    __inline("./jsmod-extend/util/date.js");
    __inline("./jsmod-extend/util/connectjs.js");
    __inline("./jsmod-extend/util/printer.js");
    __inline("./jsmod-extend/util/sound.js");
    __inline("./jsmod-extend/util/stat.js");

    __inline("./jsmod-extend/ui/dialog.js");
    __inline("./jsmod-extend/ui/confirm.js");
    __inline("./jsmod-extend/ui/notify.js");
    __inline("./jsmod-extend/ui/xinput.js");
})();