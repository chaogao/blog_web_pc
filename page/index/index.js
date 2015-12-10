(function () {
    var TPL_BLOG_LIST = __inline("./tpls/blogs.swig.tpl");
    var TPL_BLOG_EMPTY = __inline("./tpls/blogs_empty.swig.tpl");

    var Index = jsmod.util.klass({
        
        initialize: function () {
            this.blogData = window.APP_DATA;
            this.$blogBgContainer = $(".blog-bg-container")

            this.initBackground();
            this.initEvents();
        },

        initEvents: function () {
            var self = this;

            $(".more-btn").on("click", function () {
                self.showSecondScreen();
            });


            $(".tag-list a").on("click", function () {
                $(this).parent()
                        .addClass("active")
                        .siblings().removeClass("active");

                self.getBlogByTag($(this).data("id"));
            });

            $(".container-first-screen").on("touchmove.first", function (e) {
                return false;
            });
        },

        showSecondScreen: function () {
            /**
             * 显示第二屏的内容
             */
            var execScreen = function () {
                var fScreen = $(".container-first-screen"),
                    sScreen = $(".container-second-screen"),
                    h = fScreen.height();

                fScreen.addClass("static").css("height", h);

                sScreen.show();

                $(".more-btn").parent().hide();
            }

            $(".more-btn").addClass("loading");

            // 获取 ajax 数据
            $.ajax({
                url: "/blogtag",
                dataType: "json",
                success: function (json) {
                    if (!json.errno) {
                        // 可以滚动了
                        $(".container-first-screen").off("touchmove.first");

                        execScreen();

                        if (json.data.length) {
                            var html = swig.render(TPL_BLOG_LIST, {locals: {blogs: json.data}});

                            $(".blog-list-container").html(html);
                        }

                        $("body").animate({
                            scrollTop: $(".container-second-screen").offset().top
                        }, 300);
                    }
                }
            });
        },

        getBlogByTag: function (id) {
            var self = this,
                url;

            url = (id !== undefined) ? "/blogcategory/" + id : '/blogtag';

            $.ajax({
                url: url,
                dataType: "json",
                success: function (json) {
                    if (!json.errno) {
                        var html;

                        if (json.data.length) {
                            html = swig.render(TPL_BLOG_LIST, {locals: {blogs: json.data}});
                        } else {
                            html = TPL_BLOG_EMPTY;
                        }

                        $(".blog-list-container").html(html);

                        $("body").animate({
                            scrollTop: $(".container-second-screen").offset().top
                        }, 300);
                    }
                }
            });
        },

        initBackground: function () {
            var self = this,
                src = this.blogData.ext.bg;

            var img = this.$bgImg  = $("<img class='blog-bg-img'>").appendTo(".blog-bg-container");

            img.on("load", function () {
                self.resizeBackground();
                $(".container-first-screen").addClass("loaded");
            });

            img.prop("src", src);
        },

        resizeBackground: function () {
            var width = this.$blogBgContainer.width(),
                height = this.$blogBgContainer.height();

            jsmod.util.stretchImg(this.$bgImg.get(0), width, height, true);
            this.$bgImg.css("opacity", 1);
        }


    });

    new Index();

})();