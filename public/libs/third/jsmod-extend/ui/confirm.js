(function () {
    var Dialog = require("jsmod/ui/dialog"),
        main = require("jsmod/main");

    var TPL_CONFIRM = '' + 
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
            '<div class="mod-dialog-footer">' + 
                '<div class="mod-button-wrap">' + 
                    '<a href="javascript:void(0)" class="mod-button mod-button-no"><%= data.no %></a>' + 
                    '<a href="javascript:void(0)" class="mod-button mod-button-ok"><%= data.ok %></a>' + 
                '</div>' + 
            '</div>' + 
        '</div>';

    var _option = {
        ok: "确认",
        no: "关闭",
        width: 400,
        offset: {
            top: -20
        }
    }

    /**
     * confirm 扩展
     */
    var Confrim = function (option) {
        var html, dialogOption;

        this.confirmOption = $.extend({}, _option, option);

        dialogOption = {
            width: this.confirmOption.width,
            height: this.confirmOption.height,
            offset: this.confirmOption.offset,
            html: this._initHTML(),
            backgroundColor: null
        }

        Dialog.call(this, dialogOption);

        this.closeBtn = this.getElement().find(".mod-dialog-close");
        this._initEvent();
    }

    $.extend(Confrim.prototype, {}, Dialog.prototype);

    Confrim.prototype.constructor = Confrim;

    /**
     * 初始化html数据
     * @return {[type]} [description]
     */
    Confrim.prototype._initHTML = function () {
        return main.template(TPL_CONFIRM, {
            data: this.confirmOption
        });
    }

    /**
     * 初始化事件
     * @return {[type]} [description]
     */
    Confrim.prototype._initEvent = function () {
        var self = this;

        this.getElement().find(".mod-button").on("click", function (e) {
            self.resetPrevent();

            if (self.confirmOption.buttonCallback) {
                $(this).hasClass("mod-button-no") ? (self.confirmOption.buttonCallback.apply(self, [0]))
                        : self.confirmOption.buttonCallback.apply(self, [1]);
            }

            if (!self._preventHide) {
                self.hide({
                    fade: true
                });
            }
        });
    }

    /**
     * 隐藏 footer 部分内容
     * @return {[type]} [description]
     */
    Confrim.prototype.hideFooter = function () {
        return this.getElement().find(".mod-dialog-footer").hide();
    }

    /**
     * 隐藏 footer 部分内容
     * @return {[type]} [description]
     */
    Confrim.prototype.showFooter = function () {
        return this.getElement().find(".mod-dialog-footer").show();
    }

    /**
     * 对于子类而言可以重置隐藏的阻止
     * @private
     */
    Confrim.prototype.resetPrevent = function () {
        this._preventHide = false;
    }

    /**
     * 在按钮的点击回调中执行此函数，可以阻止触发 hide 函数
     */
    Confrim.prototype.preventHide = function () {
        this._preventHide = true;
    }

    var fun = function (option) {
        Dialog.disableKeyEvent();
        Dialog.setOpacity(0.4);

        var cr = new Confrim(option);

        !option.preventShow && cr.show({
            fade: true
        });

        return cr;
    }

    jsmod.ui.confirm = fun;
})();