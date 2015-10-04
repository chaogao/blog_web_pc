jsmod.ui.xinput = (function () {
    var FixElement = require("jsmod/ui/fixElement"),
        fun, fix;

    var DEFAULT_LAYOUT = '<div class="-crm-ui-xinput-container">' +
        '<div class="-crm-ui-xinput-content"></div>' + 
    '</div>';

    fun = function (input) {
        var _option,
            html, fix, el;

        // 不能重复创建
        if (input.data("xinput")) {
            return input.data("xinput");
        }

        el = $(DEFAULT_LAYOUT);
        el.css("min-width", $(input).outerWidth());

        // 创建 fix 实例
        fix = new FixElement(el, {
            preventShow: true,
            target: $(input),
            targetType: "bottom,left,right",
        });

        $(input).on("focus", function () {
            if ($(this).val()) {
                fix.getElement().find(".-crm-ui-xinput-content").html($(this).val());
                fix.show();
                fix.redraw();
            }
        }).on("blur", function () {
            fix.hide();
        }).on("keyup", function () {
            if ($(this).val()) {
                fix.getElement().find(".-crm-ui-xinput-content").html($(this).val());
                fix.show();
                fix.redraw();
            } else {
                fix.hide();
            }
        });

        $(input).data("xinput", fix);

        return fix;
    }

    return fun;
})();