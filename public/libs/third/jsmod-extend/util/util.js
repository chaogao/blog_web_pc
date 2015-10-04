/**
 * 细粒度叫搞的工具模块
 */
$.extend(window.jsmod.util, (function () {
    var openBrowser = function(url) {
        if (typeof window.cefQuery === 'function') {
            window.cefQuery({
                request: 'Window.OpenUrl:' + url
            })
            return true
        }
        return false
    }

    var prop = function (data, key) {
        var ns, obj;

        if (!key) {
            return data;
        }

        ns = key.split(".");
        obj = data;

        for (var i = 0, l = ns.length; i < l && obj; i++)
            obj = obj[ns[i]];

        return obj;
    }

    /**
     * 按照容器大小为中心，截取图
     * @author [liuping]
     * @param  {[type]} imgD        [img对象]
     * @param  {[type]} iwidth      [要固定的宽度]
     * @param  {[type]} iheight     [要固定的高度]
     * @param  {[type]} alignCenter [是否居中]
     */
    var stretchImg = function (imgD, iwidth, iheight, alignCenter, isShowAll) {
        var exec = function () {
            var _w = imgD.width,
                _h = imgD.height,
                _scale = _h / _w,
                _finalWidth,
                _finalHeight,
                moveLeft,
                moveTop;

            var maxRatio = Math.max(iwidth / _w, iheight / _h);
            isShowAll && (maxRatio=Math.min(iwidth / _w, iheight / _h))
            _finalWidth = parseInt(maxRatio * _w, 10) || iwidth;
            _finalHeight = parseInt(maxRatio * _h, 10) || iheight;

            imgD.style.width = _finalWidth + "px";
            imgD.style.height = _finalHeight + "px";

            moveTop = parseInt((iheight - _finalHeight) / 2, 10);
            moveLeft = parseInt((iwidth - _finalWidth) / 2, 10);
            if (alignCenter) {
                $(imgD).css({
                    "margin-top": moveTop,
                    "margin-left": moveLeft
                });
            }
            imgD.style.display = "";
        }

        // 如果加载完成直接缩图
        if (imgD.complete) {
            exec();
        } else {
            imgD.onload = function () {
                exec();
            }
        }
    }

    return {
        openBrowser: openBrowser,
        prop: prop,
        stretchImg: stretchImg
    };
    
})());