(function () {
    var TPL_BLOG_LIST = __inline("./tpls/blogs.swig.tpl");

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

                self.getBlogByTag($(this).data("text"));
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
                success: function (data) {
                    if (!data.errno) {
                        execScreen();

                        if (data.content.length) {
                            var html = swig.render(TPL_BLOG_LIST, {locals: {blogs: data.content}});

                            $(".blog-list-container").html(html);
                        }

                        $("body").animate({
                            scrollTop: $(".container-second-screen").offset().top
                        }, 300);
                    }
                }
            });
        },

        getBlogByTag: function (tag) {
            var self = this;

            $.ajax({
                url: "/blogtag/" + tag,
                dataType: "json",
                success: function (data) {
                    if (!data.errno) {

                        if (data.content.length) {
                            var html = swig.render(TPL_BLOG_LIST, {locals: {blogs: data.content}});

                            $(".blog-list-container").html(html);
                        }

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



// EJS.config( {cache: true, type: '[', ext: '.ejs' } );
// (function () {
//  var Tab = require("jsmod/ui/tab"),
//         Tip = require("jsmod/ui/fixElement/tip");

//  var BlogList = function () {
//      var self = this;

//         $(window).resize(function () {
//             if (self.timer) {
//                 clearTimeout(self.timer);
//             }

//             self.timer = setTimeout(function () {
//                 self.resizeBg();
//             }, 100);
//         });

//         self.initTab();
//         self.initTip();
//  }

//     var T_BLOG_LIST = '' +
//         '[% $.each(content, function () { %]' +
//             '<div class="content [%= this.top ? "content-top" : "" %]">' +
//                 '<a href="/blog/[%= this._id %]" class="content-cover">See more</a>' +
//                 '<div class="content-main">' +
//                     '<a href="/blog/[%= this._id %]" class="content-image"></a>' +
//                     '<div class="content-info">' + 
//                         '[%= this.series ? "<p data-series=\'" + this.series + "\' class=\'series\'>所属系列：" + this.series + "</p>" : "" %]' + 
//                         '<a class="title" href="/blog/[%= this._id %]">[%= this.top ? "【置顶】" : "" %][%= this.title %]</a>' + 
//                         '<img class="bg" src="[%=this.ext.bg%]">' + 
//                         '<p class="date">' +
//                             '[%= this.dateStr %]' +
//                         '</p>' +
//                         '<div class="description">' +
//                             '[%= this.description %]' +
//                         '</div>' +
//                     '</div>' +
//                 '</div>' +
//             '</div>' +
//         '[% }) %]';

//     var T_SERIES_TIP = '' +
//         '<ul>' +
//             '[% $.each(seriesBlogs, function () { %]' +
//                 '<li data-id="[%= this._id %]">' +
//                     '<a href="/blog/[%=this._id%]">[%=this.title%]</a>' +
//                     '<p class="desc">[%=this.description%]</p>' +
//                 '</il>' +
//             '[% }); %]' +
//         '</ul>';

//  BlogList.prototype = {
//         *
//          * 修正宽高
         
//         resizeBg: function () {
//             var self = this,
//                 height = parseInt($(window).height()),
//                 top;

//             top = $(".blog-index-content").offset().top;

//             $(".blog-index-content").height(height - top - 8);
//         },
//         /**
//          *
//          */
//         initTip: function () {
//             var self = this;

//             self.tip && self.tip.destroy();

//             self.tip = new Tip({
//                 targets: ".series",
//                 content: "loading",
//                 className: "tip-series",
//                 targetType: "right, top, bottom"
//             });

//             $(self.tip).on("shown", function (e) {
//                 var $el = $(e.target),
//                     name = $el.data("series");

//                 $.ajax({
//                     url: "/blogseries/" + (encodeURIComponent(name) || "")
//                 }).done(function (json) {
//                     self.tip.resetTip(e.target, {
//                         content: new EJS({text: T_SERIES_TIP}).render({
//                             seriesBlogs: json.content
//                         })
//                     })
//                 });
//             });
//         },
//         /**
//          * 初始化 tab
//          */
//         initTab: function () {
//          var self = this,
//                 aj;

//          self.tb = new Tab(".blog-index-nav");

//             $(self.tb).on("tab", function (e) {
//                 var tagName = $(e.tab).data("tag");

//                 $(".blog-index-list").addClass("loading").html("");

//                 aj && aj.abort();

//                 aj = $.ajax({
//                     url: "/blogtag/"
//                 }).done(function (json) {
//                     $(".blog-index-list").removeClass("loading").html(new EJS({text: T_BLOG_LIST}).render(json));
//                     $(".blog-index-list .content").css("opacity", 1);
//                     aj = null;
//                     self.initTip();
//                 });
//             });
//         }
//  }

//  new BlogList();
//  $(window).trigger("resize");
// })();