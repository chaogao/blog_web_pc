/**
 * notify 相关样式弱提醒
 * @param  {[type]} ) {               } [description]
 * @return {[type]}   [description]
 */
jsmod.ui.notify = (function () {
    var FixElement = require("jsmod/ui/fixElement"),
        fun, fix;

    var DEFAULT_LAYOUT = '<div class="-crm-ui-notify-container">' +
        '<a href="javascript:void(0)" class="-crm-ui-notify-close"><i class="glyphicon glyphicon-remove"></i></a>' + 
        '<div class="-crm-ui-notify-content"></div>' + 
    '</div>';

    fun = function (option) {
        var _option,
            html;

        if (typeof option == "string") {
            html = option;
        }

        // 创建 fix 实例
        !fix && (fix = new FixElement(DEFAULT_LAYOUT, {
            preventShow: true,
            target: ".crm-right-bottom",
            targetType: "top,left,left",
            offset: {
                left: -10,
                top: -10
            }
        })) && (
            fix.getElement().find(".-crm-ui-notify-close").on("click", function () {
                fix.hide();
            })
        );

        fix.getElement().find(".-crm-ui-notify-content").html(html);

        fix.redraw();

        fix.show();

        return fix;
    }

    return fun;
})();