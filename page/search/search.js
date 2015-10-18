/**
 * search.js
 */
(function () {
	var Tab = require("jsmod/ui/tab")

	var Search = function () {

	}


	Search = jsmod.util.klass({
		initialize: function () {
			this.initBg();
			this.initTag();
		},

		initTag: function () {
			this.tab = new Tab("#search-nav-container");

			$(this.tab).on("tab", function (e) {
				e.tab.addClass("active")
					.siblings().removeClass("active");
			});
		},

		initBg: function () {
            var img = $(".search-bg-container img");

            img.prop("src", img.data("src"));

            var img2 = $(".img-wrap img");

            img2.prop("src", img2.data("src"));
        }
	});

	new Search();
})();