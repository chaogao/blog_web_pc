/**
 * search.js
 */
(function () {
    var Tab = require("jsmod/ui/tab")

    var Search = function () {

    }


    Search = jsmod.util.klass({
        initialize: function () {
            this.initTag();
        },

        initTag: function () {
            this.tab = new Tab("#search-nav-container");

            $(this.tab).on("tab", function (e) {
                e.tab.addClass("active")
                    .siblings().removeClass("active");
            });
        }
    });

    new Search();
})();