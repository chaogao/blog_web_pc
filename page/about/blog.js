(function () {
    var TreeView = require("jsmod/ui/treeView");

    var Blog = jsmod.util.klass({
        initialize: function () {
            this.blogData = window.APP_DATA;
            this.$markdownContainer = $(".blog-article-markdown");
            this.initBg();
        },

        initBg: function () {
            var img = $(".blog-main .img-wrap img");

            img.prop("src", img.data("src"));
        }
    });


    var blog = new Blog();

})();