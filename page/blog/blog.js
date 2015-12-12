(function () {
    var TreeView = require("jsmod/ui/treeView");

    var Blog = jsmod.util.klass({
        initialize: function () {
            this.blogData = window.APP_DATA;
            this.$markdownContainer = $(".blog-article-markdown");

            // this.initMarkdown();
            this.initBg();
            this.analyseCategory();
            this.initAffix();
        },

        initAffix: function () {
            $(".blog-article-category").affix({
                offset: {
                    top: function () {
                        return (this.top = $(".blog-article-category").offset().top);
                    },
                    bottom: function () {
                        return (this.bottom = $('.blog-bottom').outerHeight(true))
                    }
                }
            });

            // 不断的更新吸顶位置
            var fun = function () {
                var af = $(".blog-article-category").data("bs.affix");

                af.options.offset.bottom = $('.blog-bottom').outerHeight(true) + 80;

                setTimeout(function () {
                    fun();
                }, 1000);
            }

            fun();
        },

        initMarkdown: function () {
            this.$markdownContainer.html(marked(this.blogData.content));

        },

        initBg: function () {
            var img = $(".blog-main .img-wrap img");

            img.prop("src", img.data("src"));
        },

        /**
         * 分析目录
         */
        analyseCategory: function () {
            var self = this,
                article = this.$markdownContainer,
                count = 8, i = 1, datas = [], treeDatas = [], titles, id = 0,
                reg = /<span class="tree-menu">(.*)<\/span>/;

            for (i; i <= 8; i++) {
                titles = article.find("h" + i);

                $(titles).each(function () {
                    $(this).attr("data-title-id", id++);
                });

                if (titles.length > 0) {
                    datas.push(titles);
                }
            }

            function getTreeNode (root, level, rootNode) {
                var key, levelMenuText, allAllowTrees, nodeName, selectNodeName, children;

                if (!datas[level]) {
                    return;
                }

                root.children = [];
                levelMenuText = reg.exec(root.text)[1];

                nodeName = $(rootNode).prop("nodeName"); // 获取nodename
                selectNodeName = $(datas[level][0]).prop("nodeName"); //获取将要选择的nodename
 
                allAllowTrees = $(rootNode).nextUntil(nodeName); // 获取同级兄弟元素到相同的nodename（同级）处停止
                children = allAllowTrees.filter(selectNodeName);

                // 遍历所有的子node
                $.each(children, function (i) {
                    var node = {
                        text: '<span class="tree-menu">' + levelMenuText + "." + (i + 1) + "</span>" + $(this).text(),
                        id: $(this).data("title-id")
                    };

                    $(this).prepend('<span class="category-label">' + levelMenuText + "." + (i + 1) + '</span>');

                    root.children.push(node);
                    getTreeNode(node, (level + 1), this);
                });
            }

            if (datas.length == 0) {
                return false;
            }

            $.each(datas[0], function (i) {
                var root = {};

                root.text = '<span class="tree-menu">' + (i + 1) + '</span>' + $(this).text();
                root.id = $(this).data("title-id");
                $(this).prepend('<span class="category-label">' + (i + 1) +  '</span>');

                getTreeNode(root, 1, this);

                treeDatas.push(root);
            });

            self.treeView = new TreeView(treeDatas, {
                content: ".blog-article-category",
                getText: function (treeNode) {
                    var text = /<span class="tree-menu">.*<\/span>(.*)/.exec(treeNode.text)[1];

                    return '<a href="javascript:void(0)" data-cate-id="' + treeNode.id + '" title="' + text + '" >' + treeNode.text + '</a>';
                }
            });

            self.treeView.content.delegate(".treeview-node", "click", function (e) {
                var target = $(this).find("a"),
                    id = target.data("cate-id");

                if ($(e.target).hasClass("treeview-toggle")) {
                    e.stopPropagation();
                    return;
                }

                $("html, body").animate({
                    scrollTop: self.$markdownContainer.find("[data-title-id=" + id + "]").offset().top
                });

                e.stopPropagation();
            });
        }


    });


    var blog = new Blog();

})();