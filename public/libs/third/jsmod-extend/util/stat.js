/**
 *程序能自动捕捉含有stat属性的标签，并注册相应的事件，stat的属性值的格式为： 事件|{键值对}|备注描述
 *
 * 如：<div stat="click|{a:aaaaa,b:bbbbb}|sdfsdfsdf">=========测试click事件=========</div>
 * 程序会自动给此dom注册click事件，当click发生时，自动发送统计请求
 *
 * 如：<div stat="load|{a:aaaaa,b:bbbbb}|测试load事件">=========测试load事件=========</div>
 * 当此dom第一次加载时，会自动发送统计请求
 *
 * 如：<div stat="hide|{a:aaaaa,b:bbbbb}|测试hide事件" onclick="$(this).toggle();">发送统计请求</div>
 * 当用jquery方法 $(selector).hide()时，会自动发送统计请求，类似的还有show事件
 *
 * 支持的事件共有以下几种：load/click/show/showone/hide/hideone
 *
 * 如果是动态生成dom，或者动态添加修改stat属性，则必须使用jquery方法来生成dom或修改stat属性，否则程序无法自动捕捉相应的事件
 * 可以用来生成dom的jquery的方法有：
 * append   prependTo
 * prepend  prependTo
 * before   insertBefore
 * after    insertAfter
 * show      html   wrapAll    attr
 *
 *
 * ready事件
 * 如果想等页面加载完毕后将某些请求合并后统一发出去，则用ready
 * 如：想统计酒店详情页共展现了哪些模块，则需要在每个模块的跟节点上添加属性  stat="ready|{area:basicinfo}"     stat="ready|{area:groupon}"
 * 程序会等待页面ready之后，搜集带有这些带有ready的属性的标签，将其整合为：{area:"body",kid:"body",actioin:"load",item:"basicinfo:groupon"}
 * 然后发送统计
 *
 * 如果页面ready之后还有ajax请求，则程序会等待ajax完成之后，搜集ajax的success方法生成的ready属性的标签，然后整合之前搜集的，一并发送
 *
 *
 */
(function () {
    var paramSeri = {
        encode: function (param) {
            var url = [];
            $.each(param, function (key, val) {
                // url.push(key + "=" + (/%[A-Za-z0-9]{2}/.test(val) ? val : encodeURIComponent(val)));
                url.push(key + "=" + encodeURIComponent(val));
            });
            return url.join("&");
        },
        decode: function (param) {
            if (typeof(param) == "string") {
                return decodeURIComponent(param);
            }
            var url = [];
            $.each(param, function (key, val) {
                url.push(key + "=" + (/%[A-Za-z0-9]{2}/.test(val) ? decodeURIComponent(val) : val));
            });
            return url.join("&");
        }
    };

    var nstat = {
        opts: {resid:61,func:"place",da_ver:"2.1.0",da_trd:"waimai"},
        //初始化类别和citycode
        //增加页面+uid参数
        init: function (opts) {
            if(typeof arguments[0] == 'object'){
                this.opts = $.extend(this.opts, arguments[0]);
                this.pagePre = this.opts.page;
            }
                /*//除去 category 和 from
                delete(this.opts.category);
                delete(this.opts.from);
                //page不会随同发出，作为da_src的第一一段
                this.pagePre = this.opts.page
                delete(this.opts.page);
            }
            else{
                this.opts.da_trd = category;
                this.opts.c = cityCode;
                this.opts.uid = uid;
                this.pagePre = page;
            }*/
        },
        /*
         * 可接受的参数有：
         * stat的值
         * 键值对{}
         * 一个dom元素
         * */
        addStat: function (attrValue, desc, action) {
            try {
                //如果为dom元素
                if (attrValue.nodeType) {
                    var vals = $(attrValue).attr(nbindStat.statArr).split("|");
                    this.addStat(vals[1], vals.length > 2 ? vals[2] : $(attrValue).text(), vals[0]);
                    return;
                }
                // 组装参数
                //var param = [$.param(this.opts)];
                var param = $.extend({}, this.opts);
                var type = typeof(attrValue);
                //如果为stat的属性值
                if (type == "string") {
                    attrValue = attrValue.replace(/[\{\}'"]/g,"");
                    $.each(attrValue.split(","), function (i, item) {
                        var _item = item.split(":");
                        if (_item.length == 2) {
                            param[$.trim(_item[0])] = $.trim(_item[1]);
                            //param.push(encodeURIComponent(_item[0]) + "=" + encodeURIComponent(_item[1]));
                        }
                    });
                }
                //如果为键值对
                else if (type == "object") $.extend(param, attrValue);

                action && (param["da_act"] = $.trim(action));
                param["t"] = (Math.random() * 100000000).toFixed(0);
                //把page段加入
                if(this.pagePre){
                    param["da_src"] = this.pagePre + (param["da_src"]? ("." + param["da_src"]):"");
                }
                this.sendStat(param);
            }
            catch (e) {

            }
        },
        //发送请求
        sendStat: function (param) {
            var image = new Image();
            image.onload = image.onerror = function () {
                image = null;
            }
            image.src = 'http://map.baidu.com/img/transparent.gif?' + paramSeri.encode(param);
        }
    };

    /*
     * 对于加载后就发送的统计，积攒后统一发送，
     * 在页面中，还是按照规定的来写，如y页面<div stat="load|{kid:basicInfo}"
     * */
    var nloadStat = {
        items: [],
        handle: null,
        addStat: function (el) {
            var value = $(el).attr(nbindStat.statArr), matchs = value.match(/load\|\{?(.*)(da_src:([^,\}]+))(.*)/);
            if (matchs && matchs.length > 0) {
                this.items.push(matchs[3]);
                this.send();
            }
        },
        stop: function () {
            this.handle && clearTimeout(this.handle);
        },
        send: function () {
            this.stop();
            var self = this;
            if(!self.items || !self.items.length){return}
            this.handle = setTimeout(function () {
                nstat.addStat({da_src:self.items.join(":"),da_act:"load"});
                self.items = [];
            }, 2000);
        }
    };

    /*
     * 查找含有 stat 属性的dom元素，如  <div stat="click|{a:list,b:item}|这是一个测试"></div>
     * stat属性值得格式为：事件|{键值对}|备注描述
     * 默认支持的事件有 load、click和one，如果有需要，也可以扩展其他事件
     * */
    var nbindStat = {
        statArr: "nstat",
        //默认支持的事件包括load、click和one,show，showone,如果有需要，也可以扩展其他事件
        surpportEvent: ["ready", "load", "click", "one", "show", "showone", "hide", "hideone", "mousedown"],
        //扫描时需要绑定的事件
        scanBindEvent: ["ready", "load", "click", "one", "mousedown"],
        handles: {
            mergeEvent: {
                event: ["load"],
                handle: function (el) {
                    var vals = $(el).attr(nbindStat.statArr).split("|");
                    nloadStat.addStat(el);
                    vals[0] = vals[0] + "ed";
                    $(el).attr(nbindStat.statArr, vals.join("|"));
                }
            },
            customEvent: {
                event: ["ready", "showone", "hideone"],
                handle: function (el) {
                    var vals = $(el).attr(nbindStat.statArr).split("|");
                    nstat.addStat(el);
                    vals[0] = vals[0] + "ed";
                    $(el).attr(nbindStat.statArr, vals.join("|"));
                }
            },
            jQueryEvent: {
                event: ["click", "one"],
                handle: function (el) {
                    var type = $(el).attr(nbindStat.statArr).split("|")[0];
                    var _type = type + ".nstat";
                    $(el).unbind(_type).bind(_type, function (e) {
                        nstat.addStat(el);
                    });
                    /*$(el).unbind(_type).bind(_type, function (e) {
                        nstat.addStat(el);
                    });*/
                    var events = $._data($(el)[0], "events")[type];
                    var event = events.pop();
                    events.unshift(event);
                }
            },
            statusEvent: {
                event: ["show", "hide"],
                handle: function (el) {
                    nstat.addStat(el);
                }
            }
        },
        getHandle: function (type) {
            for (var key in this.handles) {
                if ($.inArray(type, this.handles[key].event) > -1) {
                    return this.handles[key].handle;
                }
            }
        },
        init: function (_root, _type) {
            var attr = this.statArr;
            var me = this;
            var root = $(_root || "body");
            var bind = function () {
                var type = $(this).attr(attr).split("|")[0];
                if (_type || $.inArray(type, me.scanBindEvent) > -1)
                    $.inArray(type, me.surpportEvent) > -1 && me.getHandle(type)(this);
            }

            var type = _type ? ("[" + attr + "^='" + _type + "']") : ("[" + attr + "]");
            root.is(type) && bind.apply(root[0]);
            root.find("[" + attr + "]").each(bind);

        }
    };

    function proxy(oldFun, decoratorFun, context) {
        return function () {
            oldFun && oldFun.apply(context, arguments);
            decoratorFun && decoratorFun.apply(context, arguments);
        }
    }

    /*
     * 重写了jquery的以下方法
     * append   prependTo
     * prepend  prependTo
     * before   insertBefore
     * after    insertAfter
     * show      html   wrapAll    Attr
     * */
    var proxyjQuery = {
        fun_proxy: [
            {
                fun: ["append", "prepend", "before", "after"],
                proxy: function (fun) {
                    return function () {
                        $.each(arguments, function (i, _item) {
                            var temp = typeof(_item) == "string" ? $.trim(_item) : _item;
                            var item = $(temp);
                            nbindStat.init(item);
                        });
                        return fun.apply(this, arguments);
                    };
                }
            },
            {
                fun: ["html", "wrapAll"],
                proxy: function (fun, type) {
                    return function (val) {
                        var r = fun.apply(this, arguments);
                        nbindStat.init($(this));
                        return r;
                    };
                }
            },
            {
                fun: ["show", "hide"],
                proxy: function (fun, type) {
                    return function () {
                        var r = fun.apply(this, arguments);
                        nbindStat.init($(this), type);
                        return r;
                    };
                }
            },
            {
                fun: ["attr"],
                proxy: function (fun) {
                    return function () {
                        var r = fun.apply(this, arguments);
                        if(arguments.length >= 2){
                           nbindStat.init($(this)); 
                        } 
                        return r;
                    };
                }
            }
        ],
        $_fun_proxy: [
            {
                fun: ["ajax"],
                proxy: function (fun, type) {
                    return function (opt) {
                        opt = opt || {};
                        opt.beforeSend = proxy(opt.beforeSend, function () {
                            nloadStat.stop();
                        }, opt);
                        opt.complete = proxy(opt.complete, function () {
                            nloadStat.send();
                        }, opt);
                        return fun.apply($, arguments);
                    };
                }
            }
        ],
        init: function () {
            var self = this;
            $.each(self.fun_proxy, function (i, item) {
                $.each(item.fun, function (i, fun) {
                    // $.fn[fun+"_stat"]=$.fn[fun];
                    $.fn[fun] = item.proxy($.fn[fun], fun);
                });
            });
        },
        __init: function () {
            var self = this;
            $.each(self.$_fun_proxy, function (i, item) {
                $.each(item.fun, function (i, fun) {
                    // $.fn[fun+"_stat"]=$.fn[fun];
                    $[fun] = item.proxy($[fun], fun);
                });
            });
        }
    };
    proxyjQuery.__init();

    $(function () {
        proxyjQuery.init();
        nbindStat.init();
    });

    jsmod.util.stat = function (val, desc) {
        nstat.addStat(val, desc);
    };
})();
