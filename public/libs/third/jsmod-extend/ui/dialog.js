(function () {
    var _Dialog = require("jsmod/ui/dialog"),
        main = require("jsmod/main");

    var TPL_DIALOG = '' + 
        '<div class="mod-dialog-crm">' + 
            '<% if (data.title) { %>' + 
                '<div class="mod-dialog-title">' + 
                    '<%= data.title %>' + 
                    '<a href="javascript:void(0);" class="mod-dialog-close"></a>' +
                '</div>' + 
            '<% } %>' + 
            '<div class="mod-dialog-content">' + 
                '<%= data.html %>' + 
            '</div>' + 
            '<div class="mod-dialog-status">' +
                '<div class="mod-status-item loading">' +
                    '<i class="glyphicon glyphicon-repeat -crm-animation-circle"></i>' +
                    '<span class="mod-dialog-msg">正在为您加载</span>' +
                '</div>' +
                '<div class="mod-status-item success">' +
                    '<i class="glyphicon glyphicon-ok"></i>' +
                    '<span class="mod-dialog-msg">加载成功</span>' +
                '</div>' +
                '<div class="mod-status-item error">' +
                    '<i class="glyphicon glyphicon-remove-sign"></i>' +
                    '<span class="mod-dialog-msg">系统错误，稍等再试</span>' +
                '</div>' +
            '</div>' +
        '</div>';

    var _option = {
        width: 400,
        close: 1,
        offset: {
            top: -20
        },
    }

    /**
     * dialog 扩展
     */
    var Dialog = function (option) {
        var html, _dialogOption;

        this.dialogOption = $.extend({}, _option, option);

        _dialogOption = {
            width: this.dialogOption.width,
            height: this.dialogOption.height,
            offset: this.dialogOption.offset,
            html: this._initHTML(),
            backgroundColor: null
        }

        _Dialog.call(this, _dialogOption);

        this.closeBtn = this.getElement().find(".mod-dialog-close");
        this.dialogOption.close && this.closeBtn.show();

        this.htmlContent = this.getElement().find(".mod-dialog-content");
        this.statusContent = this.getElement().find(".mod-dialog-status");
        this._initEvent();
    }

    $.extend(Dialog.prototype, {}, _Dialog.prototype);

    Dialog.prototype.constructor = Dialog;

    /**
     * 初始化html数据
     * @return {[type]} [description]
     */
    Dialog.prototype._initHTML = function () {
        return main.template(TPL_DIALOG, {
            data: this.dialogOption
        });
    }

    /**
     * 设置内容
     */
    Dialog.prototype.setHTML = function (html) {
        this.getElement().find(".mod-dialog-content").html(html);
        this.adjuestPosition();
    }

    /**
     * 初始化事件
     * @return {[type]} [description]
     */
    Dialog.prototype._initEvent = function () {
        var self = this;

        this.closeBtn.on("click", function (e) {
            self.resetPrevent();
            self.dialogOption.buttonCallback && self.dialogOption.buttonCallback.apply(self, [0]);

            if (!self._preventHide) {
                self.hide({
                    fade: true
                });
            }
        });

        $(this).on("hidden", function () {
            self.hideTimer && clearTimeout(self.hideTimer);
        });
    }

    /**
     * 对于子类而言可以重置隐藏的阻止
     * @private
     */
    Dialog.prototype.resetPrevent = function () {
        this._preventHide = false;
    }

    /**
     * 在按钮的点击回调中执行此函数，可以阻止触发 hide 函数
     */
    Dialog.prototype.preventHide = function () {
        this._preventHide = true;
    }

    /**
     * 提供简单的的 status 切换方案
     * @param {string} status 需要切换的 status 
     * @param {string} msg    切换后的填充文案
     * @param {int}    timer  设置大于 0 会自动隐藏 dialog
     */
    Dialog.prototype.status = function (status, msg, timer) {
        var self = this,
            statusEl;

        self.htmlContent.hide();
        self.statusContent.show();

        (statusEl = self.getElement().find(".mod-status-item." + status))
            .show().siblings().hide();

        // 替换文案
        msg && statusEl.find(".mod-dialog-msg").html(msg);

        // 自动隐藏
        timer && (self.hideTimer = setTimeout(function () {
            self.hide();
        }, timer));
    }

    /**
     * 隐藏status，切换content显示
     * @return {[type]} [description]
     */
    Dialog.prototype.showContent = function () {
        this.htmlContent.show();
        this.statusContent.hide();
        this.adjuestPosition();
    }

    var fun = function (option) {
        _Dialog.disableKeyEvent();
        _Dialog.setOpacity(0.4);

        var cr = new Dialog(option);

        !option.preventShow && cr.show({
            fade: true
        });

        return cr;
    }

    jsmod.ui.dialog = fun;
})();