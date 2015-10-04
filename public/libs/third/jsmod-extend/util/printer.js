(function () {
/***************************************************************
 * 打印机语法模板解析
 *****************************************************************/
var Printer = function() {
	this.regularMap = {
		'<l>': 6,
		'<lb>': 18,
		'<tb>': 7,
		'<m>': 24,
		'<s>': 27,
		'<c>': 28,
	}
}

/**
 * 将dom结构转为打印语法
 */
Printer.prototype.parse = function($dom) {
	var me = this;
	var result = "";
	this._wrapText($dom);
	$("body").prepend($dom);
	// 段落
	var paras = $dom.find("ul");
	$.each(paras , function(index,val){
		var para = $(this);
		var paraStr = me.parsePara(para);
		if (index != paras.length - 1) {
			paraStr = paraStr + "\n";
		}
		result = result + paraStr;
	});
	return result;
}

/**
 * 为文本结点添加span wrapper
 * @return {[type]} [description]
 */
Printer.prototype._wrapText = function($dom) {
	var me = this;
	$.each($dom, function(index, val) {
		var item = $(this);
		if (item[0] && item[0].tagName && item[0].tagName.toLowerCase() == "style") {
			return;
		}
		var childs = item.children();
		if (childs.length == 0) {
			var textNode = $("<span class='print-text'></span>");
			var text = item.text();
			if (item.length > 0) {
				textNode.text(text);
				item.html(textNode);
			}
		} else {
			$.each(childs, function(index, val) {
				me._wrapText($(this));
			});
		}
	});
}

Printer.prototype.parsePara = function($para){
	var me = this;
	var result = "";
	var fontSize = $para.attr("font-size");
	var fontLabel = this._parseFontSize(fontSize);
	result=fontLabel;
	// 逐行扫描
	var lines = $para.find(".print-line");
	$.each(lines, function(index, val) {
		var line = $(this);
		var lineStr = me.parseLine(line,fontLabel);
		if (index != lines.length - 1) {
			lineStr = lineStr + "\n";
		}
		result = result + lineStr;
	});
	return result;
}

Printer.prototype.parseLine = function(line,fontLabel) {
	var me = this;
	var lineStr = "";
	var bs = [];
	var width = line.width();
	var parts = line.find("span.print-text");
	$.each(parts, function(index, val) {
		var left = $(this).offset().left;
		var lefPos = me._getLeftPosNum(width, left, fontLabel);

		lineStr = me._doBlanks(lineStr, lefPos);
		//
		lineStr = lineStr + $(this).text();
	});
	return lineStr;
}

Printer.prototype._doBlanks = function(lineStr, leftPos) {
	var length = 0;
	for (var i = 0; i < lineStr.length; i++) {
		var str = lineStr[i];
		if (/[\u4e00-\u9fa5]/.test(str)) {
			length = length + 2;
		} else {
			length = length + 1;
		}
	}
	var blankNum = leftPos - length;
	return lineStr + this._blank(blankNum);
}
Printer.prototype._getStringLength = function(lineStr){
	var length = 0;
	for (var i = 0; i < lineStr.length; i++) {
		var str = lineStr[i];
		if (/[\u4e00-\u9fa5]/.test(str)) {
			length = length + 2;
		} else {
			length = length + 1;
		}
	}
	return lineStr;
}

Printer.prototype._getLeftPosNum = function(width, left, blankFontLabel) {
	var leftPosNum = left * this.regularMap[blankFontLabel] / width;
	return leftPosNum;
}

Printer.prototype._parseFontSize = function(fontSize) {
	if (!fontSize) {
		fontSize = "print-font-s";
	}
	var sizeMap = {
		"print-font-tb": "<tb>",
		"print-font-l": "<l>",
		"print-font-lb": "<lb>",
		"print-font-m": "<m>",
		"print-font-s": "<s>",
		"print-font-c": "<c>",
	}
	return sizeMap[fontSize];
}

Printer.prototype._blank = function(num) {
	var str = "";
	num = Number(num);
	for (var i = 0; i < num; i++) {
		str = str + " ";
	}
	return str;
}

jsmod.util.Printer = Printer;
})();