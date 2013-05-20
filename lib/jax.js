/**
 * @fileOverview core.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 2.0
 */

/**
 * @method Najde element, který odpovídá selector a vrátí instanci JAX.Node
 * @example
 * var jaxNode = JAX("#ads"); // vrati element s id ads
 *
 * @param {String|Node|JAX.Node} selector Řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru, node nebo instance JAX.Node
 * @param {Node} [srcElement=window.document] node ve kterém se má hledat
 * @returns {JAX.Node|null}
 */
var JAX = function(selector, srcElement) {
	if (typeof(selector) === "string") {
		var srcElement = srcElement || document;
		var foundElm = srcElement.querySelector(selector);
		var jaxelm = foundElm ? JAX.Node.create(foundElm) : null;

		return jaxelm;
	} else if (typeof(selector) === "object" && selector.nodeType) {
		return JAX.Node.create(selector);
	} else if (selector instanceof JAX.Node) {
		return selector;
	}

	return null;
};

/**
 * @method Najde elementy, které odpovídají selectoru a vrátí instanci JAX.NodeArray
 * @example
 * var jaxNodes = JAX.all("div.example"); // najde vsechny divy s className example a vrati instanci JAX.NodeArray
 *
 * @param {String|Node|JAX.Node} selector řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru, node nebo instance JAX.Node
 * @param {Node} [srcElement=window.document] node ve kterém se má hledat
 * @returns {JAX.NodeArray|null}
 */
JAX.all = function(selector, srcElement) {
	if (typeof(selector) === "string") {
		var srcElement = srcElement || document;
		var foundElms = srcElement.querySelectorAll(selector);
		var jaxelms = new Array(foundElms.length);

		for (var i=0, len=foundElms.length; i<len; i++) { jaxelms[i] = JAX.Node.create(foundElms[i]); }

		return new JAX.NodeArray(jaxelms);
	} else if (typeof(selector) === "object" && selector.nodeType) {
		return new JAX.NodeArray(JAX.Node.create(selector));
	} else if (selector instanceof JAX.Node) {
		return new JAX.NodeArray(selector);
	}
	
	return null;
};

/**
 * @method Vytvoří element na základě zadaných parametrů a vrátí JAX.Node instanci
 * @example
 * var elm = JAX.make("div#ads.column"); // vytvori element div s id ads a className column
 *
 * @param {String} tagString řetězec definující název tagu (lze přidat i název tříd(y) a id, se kterými se má vytvořit)
 * @param {Object} attrs asociativní pole atributů tagu
 * @param {Object} styles asociativní pole stylů, které se mají přiřadit do node.style
 * @param {documentElement} [srcDocument=window.document] document node, ve kterém se má vytvářet
 * @returns {JAX.Node}
 */
JAX.make = function(tagString, attrs, styles, srcDocument) {
	var attrs = attrs || {};
	var styles = styles || {};
	var srcDocument = srcDocument || document;

	if (!tagString || typeof(tagString) !== "string") { throw new Error("First argument must be string."); }
	if (typeof(attrs) !== "object") { throw new Error("Second argument must be associative array."); }
	if (typeof(styles) !== "object") { throw new Error("Third argument must be associative array."); }
	if (typeof(srcDocument) !== "object" || !srcDocument.nodeType && [9,11].indexOf(srcDocument.nodeType) === -1) { throw new Error("Fourth argument must be document element."); }

	var tagName = tagString.match(/^([a-zA-Z]+[a-zA-Z0-9]*)/g) || [];

	if (tagName.length === 1) {
		tagString = tagString.substring(tagName[0].length, tagString.length);
	} else {
		throw new Error("Tagname must be first in element definition");
	}
	
	var attrType = "";
	for (var i=0, len=tagString.length; i<len; i++) {
		var ch = tagString[i];
		if (ch === "#") { 
			attrType = "id"; 
			attrs["id"] = "";
		} else if (ch === ".") { 
			attrType = "className";
			if (attrs["className"]) { 
				attrs["className"] += " ";
			} else {
				attrs["className"] = "";
			}
		} else if (attrType) {
			attrs[attrType] += ch;
		}	
	}
	
	var createdNode = srcDocument.createElement(tagName);

	for (var p in attrs) { createdNode[p] = attrs[p]; }
	for (var p in styles) { createdNode.style[p] = styles[p]; }

	var f = Object.create(JAX.Node.prototype);
	f._init(createdNode);
	
	return f;
};

/**
 * @method Vytvoří textový uzel a vrátí JAX.Node instanci
 * @example
 * var textNode = JAX.makeText("Hellow world");
 *
 * @param {String} text text, který má uzel obsahovat
 * @param {documentElement} [srcDocument=window.document] document node, ve kterém se má vytvářet
 * @returns {JAX.Node}
 */
JAX.makeText = function(text, srcDocument) {
	return JAX.Node.create((srcDocument || document).createTextNode(text));
};

/**
 * @method Zjistí, jakého typu je zadaný parametr
 * @example
 * console.log(JAX.getTypeOf(10)); // vrati "number"
 * console.log(JAX.getTypeOf("10")); // vrati "string"
 *
 * @param value testovana hodnota
 * @param {documentElement} [srcDocument=window.document] document node, ve kterém se má vytvářet
 * @returns {string}
 */
JAX.getTypeOf = function(value) {
	if (typeof(value) === "number") {
		return "number";
	} else if (typeof(value) === "string") {
		return "string";
	} else if (typeof(value) === "undefined") {
		return "undefined";
	} else if (typeof(value) === "function") {
		return "function";
	} else if (value === true || value === false) {
		return "boolean";
	} else if (value === null) {
		return "null";
	}

	var toStringResult = Object.prototype.toString.call(value);

	if (toStringResult === "[object Array]") {
		return "array";	
	} else if (toStringResult === "[object Date]") {
		return "date";
	}

	return "object";
};
JAX.Node = JAK.ClassMaker.makeClass({
	NAME: "JAX.Node",
	VERSION: "0.71"
});

JAX.Node.ELEMENT_NODE = 1;
JAX.Node.TEXT_NODE = 3;
JAX.Node.COMMENT_NODE = 8;
JAX.Node.DOCUMENT_NODE = 9;
JAX.Node.DOCUMENT_FRAGMENT_NODE = 11;

JAX.Node.instances = {};
JAX.Node.instances[JAX.Node.ELEMENT_NODE] = {};
JAX.Node.instances[JAX.Node.TEXT_NODE] = {};
JAX.Node.instances[JAX.Node.COMMENT_NODE] = {};
JAX.Node.instances[JAX.Node.DOCUMENT_NODE] = {};
JAX.Node.instances[JAX.Node.DOCUMENT_FRAGMENT_NODE] = {};

JAX.Node._ids = {};
JAX.Node._ids[JAX.Node.ELEMENT_NODE] = 0;
JAX.Node._ids[JAX.Node.TEXT_NODE] = 0;
JAX.Node._ids[JAX.Node.COMMENT_NODE] = 0;
JAX.Node._ids[JAX.Node.DOCUMENT_NODE] = 0;
JAX.Node._ids[JAX.Node.DOCUMENT_FRAGMENT_NODE] = 0;

JAX.Node._MEASUREABLEVALUE_REGEXP = /^(?:-)?\d+(\.\d+)?(%|em|in|cm|mm|ex|pt|pc)?$/i;
JAX.Node._OPACITY_REGEXP = /alpha\(opacity=['"]?([0-9]+)['"]?\)/i

JAX.Node.create = function(node) {
	if (typeof(node) === "object" && node.nodeType) {
		var nodeType = node.nodeType;

		if (nodeType in JAX.Node.instances) {
			switch(nodeType) {
				case JAX.Node.ELEMENT_NODE:
					var jaxId = parseInt(node.getAttribute("data-jax-id"),10);
					if (typeof(jaxId) !== "number") { jaxId = -1; }
					if (jaxId > -1) {
						var item = JAX.Node.instances[JAX.Node.ELEMENT_NODE][jaxId];
						if (item) {return item.instance; }
					}
				break;
				default:
					var index = -1;
					var instances = JAX.Node.instances[nodeType];
					for (var i in instances) { 
						if (node === instances[i].node) { index = i; break; }
					}
					if (index > -1) { return JAX.Node.instances[nodeType][index].instance; }
			}
		}

		var f = Object.create(JAX.Node.prototype);
		f._init(node);
		return f;
	}
	
	throw new Error("First argument must be html element");
};

JAX.Node.prototype.jaxNodeType = 0;

JAX.Node.prototype.$constructor = function() {
	throw new Error("You can not call this class with operator new. Use JAX.Node.create factory method instead of it");
};

JAX.Node.prototype.$destructor = function() {
	this.destroy();

	if (this._node.nodeType in JAX.Node.instances) { delete JAX.Node.instances[this._node.nodeType][this._jaxId]; }

	this._node = null;
	this._storage = null;
	this._jaxId = -1;
};

JAX.Node.prototype.destroy = function() {
	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) { this._queueMethod(this.destroy, arguments); return this; }
	if ([1,9].indexOf(this._node.nodeType) !== -1) { this.stopListening(); }
	if ([1,3,8].indexOf(this._node.nodeType) !== -1) { this.removeFromDOM(); }
	if ([1,11].indexOf(this._node.nodeType) !== -1) { this.clear(); }
};

JAX.Node.prototype.node = function() {
	return this._node;
};

JAX.Node.prototype.$ = function(selector) {
	return JAX.all(selector, this._node);
};

JAX.Node.prototype.$$ = function(selector) {
	return JAX(selector, this._node);
};

JAX.Node.prototype.addClass = function() {
	if (this._node.nodeType !== 1) { throw new Error("You can not use this method for this node"); }
	
	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.addClass, arguments); 
		return this; 
	}
	
	var classNames = [].slice.call(arguments);
	if (classNames.length === 1) { classNames = [].concat(classNames[0]); }
	var currclasses = this._node.className.split(" ");
	
	for (var i=0, len=classNames.length; i<len; i++) {
		var cName = classNames[i];
		if (typeof(cName) !== "string") { throw new Error("Given arguments can be string, array of strings or strings separated by comma."); }
		var classes = cName.split(" ");
		while(classes.length) {
			var newclass = classes.shift();
			if (currclasses.indexOf(newclass) === -1) { currclasses.push(newclass); }
		}
	}
	
	this._node.className = currclasses.join(" ");
	
	return this;
};

JAX.Node.prototype.removeClass = function() {
	if (this._node.nodeType !== 1) { throw new Error("You can not use this method for this node"); }
	
	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.removeClass, arguments); 
		return this; 
	}
	
	var classNames = [].slice.call(arguments);
	if (classNames.length === 1) { classNames = [].concat(classNames[0]); }
	var currclasses = this._node.className.split(" ");
	
	for (var i=0, len=classNames.length; i<len; i++) {
		var cName = classNames[i];
		if (typeof(cName) !== "string") { throw new Error("Given arguments can be string, array of strings or strings separated by comma."); }
		var classes = cNames.split(" ");
		while(classes.length) {
			var index = currclasses.indexOf(classes.shift());
			if (index !== -1) { currclasses.splice(index, 1); }
		}
	}
	
	this._node.className = currclasses.join(" ");
	
	return this;
};

JAX.Node.prototype.hasClass = function(className) {
	if (this._node.nodeType !== 1) { throw new Error("You can not use this method for this node"); }

	if (typeof(classname) === "string") {  
		var names = className.split(" ");

		while(names.length) {
			var name = names.shift();
			if (this._node.className.indexOf(name) !== -1) { return true; }
		}

		return false;
	}
	
	throw new Error("For first argument I expected string");
};

JAX.Node.prototype.id = function(id) {
	if (this._node.nodeType !== 1) { throw new Error("You can not use this method for this node"); }

	if (!arguments.length) { 
		return this.attr("id"); 
	} else if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.id, arguments); 
		return this; 
	} else if (typeof(id) === "string") { 
		this.attr({id:id}); 
		return this;
	}
	
	throw new Error("For first argument I expected string");
};

JAX.Node.prototype.html = function(innerHTML) {
	if (this._node.nodeType !== 1) { throw new Error("You can not use this method for this node"); }

	if (!arguments.length) { 
		return innerHTML; 
	} else if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.html, arguments); 
		return this; 
	} else if (typeof(innerHTML) === "string" || typeof(innerHTML) === "number") {
		this._node.innerHTML = innerHTML + "";
		return this;
	}
	
	throw new Error("For first argument I expected string or number. You can call it also without arguments. Then it will return innerHTML value");
};

JAX.Node.prototype.add = function() {
	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.add, arguments); 
		return this; 
	}
	
	var nodes = [].slice.call(arguments);
	if (nodes.length === 1) { nodes = [].concat(nodes[0]); }
	
	for (var i=0, len=nodes.length; i<len; i++) {
		var node = nodes[i];
		if (!node.nodeType && !(node instanceof JAX.Node)) { throw new Error("For arguments I expected html node, text node or JAX.Node instance. You can use array of them or you can separate them by comma."); }
		var node = node.jaxNodeType ? node.node() : node;
		this._node.appendChild(node);
	}
	
	return this;
};

JAX.Node.prototype.addBefore = function(node, nodeBefore) {
	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.addBefore, arguments); 
		return this;  
	} 

	if (typeof(node) !== "object" || (!node.nodeType && !(node instanceof JAX.Node))) { throw new Error("For first argument I expected html element, text node, documentFragment or JAX.Node instance"); }
	if (typeof(nodeBefore) !== "object" || (!nodeBefore.nodeType && !(nodeBefore instanceof JAX.Node))) { throw new Error("For second argument I expected html element, text node or JAX.Node instance"); }

	var node = node.jaxNodeType ? node.node() : node;
	var nodeBefore = nodeBefore.jaxNodeType ? nodeBefore.node() : nodeBefore;
	
	this._node.insertBefore(node, nodeBefore);
	return this;
};

JAX.Node.prototype.appendTo = function(node) {
	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.appendTo, arguments); 
		return this; 
	} else if (typeof(node) === "object" && (node.nodeType || node instanceof JAX.Node)) { 
		var node = node.jaxNodeType ? node.node() : node;
		node.appendChild(this._node);
		return this;
	}
	
	throw new Error("For first argument I expected html element, documentFragment or JAX.Node instance");
};

JAX.Node.prototype.appendBefore = function(node) {
	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.appendBefore, arguments); 
		return this; 
	} else if (typeof(node) === "object" && (node.nodeType || node instanceof JAX.Node)) {
		var node = node.jaxNodeType ? node.node() : node;
		node.parentNode.insertBefore(this._node, node);
		return this;
	}
	
	throw new Error("For first argument I expected html element, text node or JAX.Node instance");
};

JAX.Node.prototype.removeFromDOM = function() {
	if ([9,11].indexOf(this._node.nodeType) !== -1) { throw new Error("You can not use this method for this node"); }
	
	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.removeFromDOM, arguments); 
		return this; 
	}
	
	this._node.parentNode.removeChild(this._node);

	return this;
};

JAX.Node.prototype.clone = function(withContent) {
	if (this._node.nodeType !== 1) { throw new Error("You can not use this method for this element. You can use it only for element with nodeType === 1."); }

	var withContent = !!withContent;
	var clone = this._node.cloneNode(withContent);
	clone.setAttribute("data-jax-id","");
	return JAX.Node.create(clone);
};

JAX.Node.prototype.listen = function(type, funcMethod, obj, bindData) {
	if ([1,9].indexOf(this._node.nodeType) === -1) { throw new Error("You can not use this method for this element. You can use it only with html or document element"); }
	
	var obj = obj || window;

	if (!type || typeof(type) !== "string") { throw new Error("For first argument I expected string"); }
	if (!funcMethod || (typeof(funcMethod) !== "string" && typeof(funcMethod) !== "function")) { throw new Error("For second argument I expected string or function"); }
	if (typeof(obj) !== "object") { throw new Error("For third argument I expected referred object"); }
	if (typeof(funcMethod) === "string") {
		var funcMethod = obj[funcMethod];
		if (!funcMethod) { throw new Error("Given method in second argument was not found in referred object given in third argument"); } 
		funcMethod = funcMethod.bind(obj);
	}

	var f = function(e, node) { funcMethod(e, JAX(node), bindData); };
	var listenerId = JAK.Events.addListener(this._node, type, f);
	var evtListeners = this._storage.events[type] || [];
	evtListeners.push(listenerId);
	this._storage.events[type] = evtListeners;

	return listenerId;
};

JAX.Node.prototype.stopListening = function(type, listenerId) {
	if ([1,9].indexOf(this._node.nodeType) === -1) { throw new Error("You can not use this method for this element. You can use it only with html or document element"); }

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.stopListening, arguments);
		return this; 
	} 

	if (!arguments.length) {
		var events = this._storage.events;
		for (var p in events) { this._destroyEvents(events[p]); }
		this._storage.events = {};
		return this;
	}

	if (typeof(type) !== "string") { throw new Error("For first argument I expected string"); }

	var eventListeners = this._storage.events[type]; 
	if (!eventListeners) { return this; }

	if (!listenerId) { 
		this._destroyEvents(eventListeners);
		this._storage.events[type] = [];
		return this;
	}

	var index = eventListeners.indexOf(listenerId);
	if (index > -1) {
		this._destroyEvents([eventListeners[index]]);
		eventListeners.splice(index, 1);
		return this;
	}

	return this;
};

JAX.Node.prototype.attr = function() {
	if (this._node.nodeType !== 1) { throw new Error("You can not use this method for this node"); }
	
	var attributes = [].slice.call(arguments);

	if (attributes.length > 1) { 
		return this.attr(attributes);
	} else if (attributes.length === 1) {
		attributes = attributes[0];
	} else {
		return {};
	}

	if (typeof(attributes) === "string") { 
		return this._node.nodeType === 1 ? node.getAttribute(attributes) : ""; 
	} else if (attributes instanceof Array) {
		var attrs = {};
		if (this._node.nodeType !== 1) { return attrs; }
		for (var i=0, len=attributes.length; i<len; i++) { 
			var attribute = attributes[i];
			attrs[attribute] = node.getAttribute(attribute);
		}
		return attrs;	
	} else if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.attr, arguments); 
		return this; 
	}

	if (this._node.nodeType !== 1) { return this; }

	for (var p in attributes) {
		var value = attributes[p];
		this._node.setAttribute(p, value);
	}

	return this;
};

	
JAX.Node.prototype.css = function() {
	if (this._node.nodeType !== 1) { throw new Error("You can not use this method for this node"); }
	
	var cssStyles = [].slice.call(arguments);
	
	if (cssStyles.length > 1) { 
		return this.css(cssStyles);
	} else if (cssStyles.length === 1) {
		cssStyles = cssStyles[0];
	} else {
		return [];
	}

	if (typeof(cssStyles) === "string") {
		if (this._node.nodeType !== 1) { return ""; }
		return cssStyles === "opacity" ? this._getOpacity() : this._node.style[cssStyles]; 
	} else if (cssStyles instanceof Array) {
		var css = {};
		if (this._node.nodeType !== 1) { return css; }
		for (var i=0, len=cssStyles.length; i<len; i++) {
			var cssStyle = cssStyles[i];
			if (cssStyle === "opacity") { css[cssStyle] = this._getOpacity(); continue; }
			css[cssStyle] = this._node.style[cssStyle];
		}
		return css;
	} else if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.style, arguments); 
		return this; 
	} 

	if (this._node.nodeType !== 1) { return this; }

	for (var p in cssStyles) {
		var value = cssStyles[p];
		if (p === "opacity") { this._setOpacity(value); continue; }
		this._node.style[p] = value;
	}

	return this;
};

JAX.Node.prototype.displayOn = function(displayValue) {
	if (this._node.nodeType !== 1) { throw new Error("You can not use this method for this node"); }

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.displayOn, arguments); 
		return this; 
	} 

	this._node.style["display"] = displayValue || "";

	return this;
};

JAX.Node.prototype.displayOff = function() {
	if (this._node.nodeType !== 1) { throw new Error("You can not use this method for this node"); }

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.displayOff, arguments); 
		return this; 
	} 
	this._node.style["display"] = "none";

	return this;
};

JAX.Node.prototype.computedCss = function() {
	if (this._node.nodeType !== 1) { throw new Error("You can not use this method for this node"); }
	
	var cssStyles = arguments;

	if (cssStyles.length > 1) { 
		return this.computedCss(cssStyles);
	} else if (cssStyles.length === 1) {
		cssStyles = arguments[0];
	} else {
		return [];
	}

	if (typeof(cssStyles) === "string") {
		if (this._node.nodeType !== 1) { return ""; }
		var value = JAK.DOM.getStyle(this._node, cssStyles);
		if (this._node.runtimeStyle && !this._node.addEventListener && JAX.Node._MEASUREABLEVALUE_REGEXP.test(value)) { value = this._inPixels(value); }
		return value;
	}

	var css = {};
	for (var i=0, len=cssStyles.length; i<len; i++) {
		var cssStyle = cssStyles[i];
		var value = JAK.DOM.getStyle(this._node, cssStyle);
		if (this._node.runtimeStyle && !this._node.addEventListener && JAX.Node._MEASUREABLEVALUE_REGEXP.test(value)) { value = this._inPixels(value); }
		css[cssStyle] = value;
	}
	return css;
};

JAX.Node.prototype.fullWidth = function(value) {
	if ([1,9].indexOf(this._node.nodeType) === -1) { throw new Error("You can not use this method for this node"); }
	
	if (!arguments.length) { 
		var backupStyle = this.css("display","visibility","position");
		var isFixedPosition = this.computedCss("position").indexOf("fixed") === 0;
		var isDisplayNone = this.css("display").indexOf("none") === 0;

		if (!isFixedPosition) { this.css({"position":"absolute"}); }
		if (isDisplayNone) { this.css({"display":""}); }		
		this.css({"visibility":"hidden"});

		var width = this._node.offsetWidth;
		this.css(backupStyle);
		return width; 
	}

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.width, arguments); 
		return this; 
	} 
	
	var boxSizing = this.computedCss("box-sizing") || this.computedCss("-moz-box-sizing") || this.computedCss("-webkit-box-sizing");
	var paddingLeft = 0,
		paddingRight = 0,
		borderLeft = 0,
		borderRight = 0;

	if (!boxSizing || boxSizing === "content-box") {
		var paddingLeft = parseFloat(this.computedCss("padding-left"));
		var paddingRight = parseFloat(this.computedCss("padding-right"));
	}
	
	if (boxSizing !== "border-box") {
		var borderLeft = parseFloat(this.computedCss("border-left"));
		var borderRight = parseFloat(this.computedCss("border-right"));
	}

	if (paddingLeft && isFinite(paddingLeft)) { value =- paddingLeft; }
	if (paddingRight && isFinite(paddingRight)) { value =- paddingRight; }
	if (borderLeft && isFinite(borderLeft)) { value =- borderLeft; }
	if (borderRight && isFinite(borderRight)) { value =- borderRight; }

	this._node.style.width = Math.max(value,0) + "px";
	return this;
};

JAX.Node.prototype.fullHeight = function(value) {
	if ([1,9].indexOf(this._node.nodeType) === -1) { throw new Error("You can not use this method for this node"); }
	
	if (!arguments.length) { 
		var backupStyle = this.css("display","visibility","position");
		var isFixedPosition = this.computedCss("position").indexOf("fixed") === 0;
		var isDisplayNone = this.css("display").indexOf("none") === 0;

		if (!isFixedPosition) { this.css({"position":"absolute"}); }
		if (isDisplayNone) { this.css({"display":""}); }		
		this.css({"visibility":"hidden"});

		var height = this._node.offsetHeight;
		this.css(backupStyle);
		return height; 
	}

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.height, arguments); 
		return this; 
	} 
	
	var boxSizing = this.computedCss("box-sizing") || this.computedCss("-moz-box-sizing") || this.computedCss("-webkit-box-sizing");
	var paddingTop = 0,
		paddingBottom = 0,
		borderTop = 0,
		borderBottom = 0;

	if (!boxSizing || boxSizing === "content-box") {
		paddingTop = parseFloat(this.computedCss("padding-top"));
		paddingBottom = parseFloat(this.computedCss("padding-bottom"));
	}
	
	if (boxSizing !== "border-box") {
		borderTop = parseFloat(this.computedCss("border-top"));
		borderBottom = parseFloat(this.computedCss("border-bottom"));
	}
	
	if (paddingTop && isFinite(paddingTop)) { value =- paddingTop; }
	if (paddingBottom && isFinite(paddingBottom)) { value =- paddingBottom; }
	if (borderTop && isFinite(borderTop)) { value =- borderTop; }
	if (borderBottom && isFinite(borderBottom)) { value =- borderBottom; }

	this._node.style.height = Math.max(value,0) + "px";
	return this;
};

JAX.Node.prototype.parent = function() {
	if (this._node.parentNode) { return JAX.Node.create(this._node.parentNode); }
	return null;
};

JAX.Node.prototype.nSibling = function() {
	return this._node.nextSibling ? JAX(this._node.nextSibling) : null;
};

JAX.Node.prototype.pSibling = function() {
	return this._node.previousSibling ? JAX(this._node.previousSibling) : null;
};

JAX.Node.prototype.childs = function() {
	if (!this._node.childNodes) { return []; }
	var nodes = [];
	for (var i=0, len=this._node.childNodes.length; i<len; i++) {
		var childNode = this._node.childNodes[i];
		nodes.push(JAX(childNode));
	}
	return nodes;
};

JAX.Node.prototype.fChild = function() {
	return this._node.firstChild ? JAX(this._node.firstChild) : null;
};

JAX.Node.prototype.lChild = function() {
	return this._node.lastChild ? JAX(this._node.lastChild) : null;
};

JAX.Node.prototype.clear = function() {
	if ([1,11].indexOf(this._node.nodeType) === -1) { throw new Error("You can not use this method for this element. You can use it only with html node or documentFragment"); }

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.clear, arguments); 
		return this; 
	} 
	JAK.DOM.clear(this._node);
	return this;
};

JAX.Node.prototype.contains = function(node) {
	if (this._node.nodeType !== 1) {
		throw new Error("You can not use this method for this element. You can use it only with html element")
	}

	if (typeof(node) === "object" && (node.nodeType || node instanceof JAX.Node)) {
		var elm = node.jaxNodeType ? node.node().parentNode : node.parentNode;
		while(elm) {
			if (elm === this._node) { return true; }
			elm = elm.parentNode;
		}
		return false;
	}
	
	throw new Error("For first argument I expected html element, text node or JAX.Node instance");
};

JAX.Node.prototype.isChildOf = function(node) {
	if ([1,3,8].indexOf(this._node.nodeType) === -1) {
		throw new Error("You can not use this method for this element. You can use it only with html element or text node");
	}

	if (typeof(node) === "object" && (node.nodeType || node instanceof JAX.Node)) {
		var elm = node.jaxNodeType ? node : JAX.Node.create(node);
		return elm.contains(this);
	}
	
	throw new Error("For first argument I expected html element or JAX.Node instance");
};

JAX.Node.prototype.fade = function(type, duration, lockElm) {
	if (this._node.nodeType !== 1) {
		throw new Error("You can not use this method for this element. You can use it only with html element")
	}

	var duration = parseFloat(duration) || 0;

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.fade, arguments); 
		return this; 
	}

	if (typeof(type) !== "string") { throw new Error("For first argument I expected string"); }
	if (duration < 0) { throw new Error("For second argument I expected positive number"); }

	switch(type) {
		case "in":
			var sourceOpacity = 0;
			var targetOpacity = parseFloat(this.computedCss("opacity")) || 1;	
		break;
		case "out":
			var sourceOpacity = parseFloat(this.computedCss("opacity")) || 1;
			var targetOpacity = 0;
		break;
		default:
			console.warn("I got unsupported type '" + type + "'.");
			return this;
	}

	var fx = new JAX.FX(this).addProperty("opacity", duration, sourceOpacity, targetOpacity);

	if (lockElm) { 
		this.lock();
		fx.callWhenDone(this.unlock.bind(this));
	}

	fx.run();
	return fx;
};

JAX.Node.prototype.fadeTo = function(opacityValue, duration, lockElm) {
	if (this._node.nodeType !== 1) {
		throw new Error("You can not use this method for this element. You can use it only with html element");
	}
	
	var opacityValue = parseFloat(opacityValue);
	var duration = parseFloat(duration) || 0;

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.fade, arguments); 
		return this; 
	}

	if (typeof(opacityValue) !== "number") { throw new Error("For first argument I expected number"); }
	if (duration<0) { throw new Error("For second argument I expected positive number"); }

	var sourceOpacity = parseFloat(this.computedCss("opacity")) || 1;
	var targetOpacity = parseFloat(opacityValue);

	var fx = new JAX.FX(this).addProperty("opacity", duration, sourceOpacity, targetOpacity);

	if (lockElm) {
		this.lock();
		fx.callWhenDone(this.unlock.bind(this));
	}

	fx.run();

	return fx;
};

JAX.Node.prototype.slide = function(type, duration, lockElm) {
	if (this._node.nodeType !== 1) {
		throw new Error("You can not use this method for this element. You can use it only with html element");
	}

	var duration = parseFloat(duration) || 0;

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.slide, arguments); 
		return this; 
	} 

	if (typeof(type) !== "string") { throw new Error("For first argument I expected string"); }
	if (duration<0) { throw new Error("For first argument I expected positive number"); }

	switch(type) {
		case "down":
			var backupStyles = this.css("height","overflow");
			var property = "height";
			var source = 0;
			var target = this.fullHeight();	
		break;
		case "up":
			var backupStyles = this.css("height","overflow");
			var property = "height";
			var source = this.fullHeight();
			var target = 0;
		break;
		case "left":
			var backupStyles = this.css("width","overflow");
			var property = "width";
			var source = this.fullWidth();
			var target = 0;	
		break;
		case "right":
			var backupStyles = this.css("width","overflow");
			var property = "width";
			var source = 0;
			var target = this.fullWidth();
		break;
		default:
			if (window.console && window.console.warn) { console.warn("I got unsupported type '" + type + "'."); }
			return this;
	}

	this.css({"overflow": "hidden"});


	var fx = new JAX.FX(this).addProperty(property, duration, source, target);

	if (lockElm) {
		var func = function() {
			for (var p in backupStyles) { this._node.style[p] = backupStyles[p]; }
			this.unlock();
		}.bind(this);
		fx.callWhenDone(func);
	}
	
	fx.run();

	return fx;
};

JAX.Node.prototype.lock = function() {
	if (this._node.nodeType === 1) { this._node.setAttribute("data-jax-locked","1"); }
	return this;
};

JAX.Node.prototype.isLocked = function() {
	if (this._node.nodeType !== 1) { return false; }

	return !!this._node.getAttribute("data-jax-locked");
};

JAX.Node.prototype.unlock = function() {
	if (!this.isLocked()) { return this; }
	if (this._node.nodeType === 1) {
		var queue = this._storage.lockQueue;
		this._node.removeAttribute("data-jax-locked");
		while(queue.length) {
			var q = queue.shift();
			q.method.apply(this, q.args);
		}
	}

	return this;
};

JAX.Node.prototype._init = function(node) {  	
	this._node = node;
	this.jaxNodeType = this._node.nodeType;

	/* set jax id for new (old) node */
	var oldJaxId = -1;
	if (node.getAttribute) { 
		var oldJaxId = parseInt(node.getAttribute("data-jax-id"),10);
		if (typeof(oldJaxId) !== "number") { oldJaxId = -1; }
	}

	if (oldJaxId > -1) {
		this._jaxId = oldJaxId;
		this._storage = JAX.Node.instances.html[this._jaxId];
		this._storage.instance = this;
		return;
	}

	if (this._node.nodeType in JAX.Node.instances) {
		switch(this._node.nodeType) {
			case JAX.Node.ELEMENT_NODE:
				this._jaxId = JAX.Node._ids[JAX.Node.ELEMENT_NODE]++;
				this._node.setAttribute("data-jax-id", this._jaxId);

				var storage = {
					instance: this,
					events: {},
					lockQueue: []
				};

				JAX.Node.instances[JAX.Node.ELEMENT_NODE][this._jaxId] = storage;
				this._storage = storage;
			break;
			case JAX.Node.TEXT_NODE:
			case JAX.Node.COMMENT_NODE:
			case JAX.Node.DOCUMENT_FRAGMENT_NODE:
				var nodeType = this._node.nodeType;
				this._jaxId = JAX.Node._ids[nodeType]++;

				var storage = { instance: this, node: node };

				JAX.Node.instances[nodeType][this._jaxId] = storage;
				this._storage = storage;
			break;
			case JAX.Node.DOCUMENT_NODE:
				this._jaxId = JAX.Node._ids[JAX.Node.DOCUMENT_NODE]++;

				var storage = { 
					instance: this,
					events: {},
					node: node
				};

				JAX.Node.instances[JAX.Node.DOCUMENT_NODE][this._jaxId] = storage;
				this._storage = storage;
			break;
		}
	}
};

JAX.Node.prototype._inPixels = function(value) {
	var style = this._node.style.left;
	var rStyle = this._node.runtimeStyle.left; 
    this._node.runtimeStyle.left = this._node.currentStyle.left;
    this._node.style.left = value || 0;  
    value = this._node.style.pixelLeft;
    this._node.style.left = style;
    this._node.runtimeStyle.left = rStyle;
      
    return value;
};

JAX.Node.prototype._setOpacity = function(value) {
	var property = "";

	if (JAK.Browser.client === "ie" && JAK.Browser.version < 9) { 
		property = "filter";
		value = Math.round(100*value);
		value = "progid:DXImageTransform.Microsoft.Alpha(opacity=" + value + ");";
	} else {
		property = "opacity";
	}
	this._node.style[property] = value + "";

};

JAX.Node.prototype._getOpacity = function() {
	if (JAK.Browser.client === "ie" && JAK.Browser.version < 9) {
		var value = "";
		this._node.style.filter.replace(JAX.NODE.OPACITY_REGEXP, function(match1, match2) {
			value = match2;
		});
		return value ? (parseInt(value, 10)/100)+"" : value;
	}
	return this._node.style["opacity"];
};

JAX.Node.prototype._queueMethod = function(method, args) {
	this._storage.lockQueue.push({method:method, args:args});
};

JAX.Node.prototype._destroyEvents = function(eventListeners) {
	JAK.Events.removeListeners(eventListeners);
};

JAX.NodeArray = JAK.ClassMaker.makeClass({
	NAME: "JAX.NodeArray",
	VERSION: "1.0"
});

JAX.NodeArray.prototype.$constructor = function(nodes) {
	this.length = 0;

	var nodes = [].concat(nodes);
	var len = nodes.length;
	this._jaxNodes = new Array(len);

	for (var i=0; i<len; i++) { 
		var node = nodes[i];
		if (typeof(node) === "object" && node.nodeType) { this._jaxNodes[i] = JAX(node); continue; }
		if (node instanceof JAX.Node) { this._jaxNodes[i] = node; continue; }

		throw new Error("First argument must be array of JAX.Node instances or html nodes");
	}
	this.length = this._jaxNodes.length;
};

JAX.NodeArray.prototype.item = function(index) {
	return this._jaxNodes[index];
};

JAX.NodeArray.prototype.items = function() {
	return this._jaxNodes.slice();
};

JAX.NodeArray.prototype.addClass = function() {
	var classes = [].slice.call(arguments);
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		var jaxNode = this._jaxNodes[i];
		jaxNode.addClass(classes); 
	}
	return this;
};

JAX.NodeArray.prototype.removeClass = function() {
	var classes = [].slice.call(arguments);
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		var jaxNode = this._jaxNodes[i];
		jaxNode.removeClass(classes); 
	}
	return this;
};

JAX.NodeArray.prototype.displayOn = function(displayValue) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		this._jaxNodes[i].displayOn(displayValue); 
	}
	return this;
};

JAX.NodeArray.prototype.displayOff = function() {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		this._jaxNodes[i].displayOff();
	}
	return this;
};

JAX.NodeArray.prototype.css = function(properties) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		this._jaxNodes[i].css(properties);
	}
	return this;	
};

JAX.NodeArray.prototype.attr = function(attributes) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		this._jaxNodes[i].attr(attributes); 
	}
	return this;	
};

JAX.NodeArray.prototype.appendTo = function(node) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		this._jaxNodes[i].appendTo(node);
	}
	return this;
};

JAX.NodeArray.prototype.removeFromDOM = function() {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		var jaxNode = this._jaxNodes[i];
		jaxNode.removeFromDOM(); 
	}
	return this;
};

JAX.NodeArray.prototype.destroyItems = function() {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		this._jaxNodes[i].destroy(); 
	}
	return this;
};

JAX.NodeArray.prototype.forEachItem = function(cbk) {
	this._jaxNodes.forEach(cbk, this);
	return this;
};

JAX.NodeArray.prototype.filterItems = function(func) {
	return new JAX.NodeArray(this._jaxNodes.filter(func));
};

JAX.NodeArray.prototype.pushItem = function(node) {
	var JAXNode = JAX(node);
	this.length++;
	this._jaxNodes.push(JAXNode);
	return this;
};

JAX.NodeArray.prototype.popItem = function() {
	this.length = Math.max(--this.length, 0);
	return this._jaxNodes.pop();
};

JAX.NodeArray.prototype.shiftItem = function() {
	this.length = Math.max(--this.length, 0);
	return this._jaxNodes.shift();
};

JAX.NodeArray.prototype.unshiftItem = function(node) {
	var JAXNode = JAX(node);
	this.length++;
	return this._jaxNodes.unshift(JAXNode);
};

JAX.NodeArray.prototype.fade = function(type, duration, whenDone, lockElm) {
	var count = this._jaxNodes.length;

	var f = function() {
		count--;
		if (!count) { whenDone(); }
	};

	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		var fx = this._jaxNodes[i].fade(type, duration, lockElm);
		if (whenDone) { fx.callWhenDone(f); }
	}
	return this;
};

JAX.NodeArray.prototype.fadeTo = function(opacityValue, duration, whenDone, lockElm) {
	var count = this._jaxNodes.length;

	var f = function() {
		count--;
		if (!count) { whenDone(); }
	};

	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		var fx = this._jaxNodes[i].fadeTo(opacityValue, duration, lockElm);
		if (whenDone) { fx.callWhenDone(f); }
	}
	return this;
};


JAX.NodeArray.prototype.slide = function(type, duration, whenDone, lockElm) {
	var count = this._jaxNodes.length;

	var f = function() {
		count--;
		if (!count) { whenDone(); }
	};

	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		var fx = this._jaxNodes[i].slide(type, duration, lockElm);
		if (whenDone) { fx.callWhenDone(f); }
	}
	return this;
};

/**
 * @fileOverview dombuilder.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 2.0
 */

/**
 * Pomocník pro vytváření DOM elementů
 * @class JAX.DOMBuilder
 */ 
JAX.DOMBuilder = JAK.ClassMaker.makeClass({
	NAME: "JAX.DOMBuilder",
	VERSION: "2.0"
});

/** 
 * @example 
 * var db = new JAX.DOMBuilder();
 *
 * @param {documentElement} document element, ve kter0m se budou nové elementy vytvářet
 */
JAX.DOMBuilder.prototype.$constructor = function(doc) {
	this._doc = doc || document;
	this._jax = { container: JAX.Node.create(document.createDocumentFragment()) };
	this._pointerJaxNode = null;
	this._stack = [];
};

/**
 * @method Vytvoří nový element a nastaví na něj interně ukazatel, takže další vytvářené elementy se budou přidávat do tohoto elementu
 * @example
 * var db = new JAX.DOMBuilder();
 * db.open("div",{},{width:"100px"});
 * db.add("span");
 * db.close();
 * console.log(db.getContainer());
 *
 * @param {String | HTMLElm | JAX.Node} element řetězec (s kompatibilní syntaxí JAX.make) popisující nový vytvářený tag nebo html element nebo instance JAX.Node
 * @param {Object} attrs asociativní pole atributů tagu
 * @param {Object} styles asociativní pole stylů, které se mají přiřadit do node.style
 * @returns {JAX.Node}
 */
JAX.DOMBuilder.prototype.open = function(element, attributes, styles) {
	if (typeof(element) === "string" && typeof(element) === "object" && element.nodeType) {
		this._pointerJaxNode = this.add(element, attributes, styles);
		return this._pointerJaxNode;
	}

	throw new Error("First argument must be string with JAX.make compatible definition, node or instance of JAX.Node");
};

/**
 * @method Vytvoří nový element a připojí ho do elementu, na který má nastaven ukazatel
 * @example
 * var db = new JAX.DOMBuilder();
 * db.add("div");
 * db.add("span");
 * console.log(db.getContainer());
 *
 * @param {String | HTMLElm | JAX.Node} element řetězec (s kompatibilní syntaxí JAX.make) popisující nový vytvářený tag nebo html element nebo instance JAX.Node
 * @param {Object} attrs asociativní pole atributů tagu
 * @param {Object} styles asociativní pole stylů, které se mají přiřadit do node.style
 * @returns {JAX.Node}
 */
JAX.DOMBuilder.prototype.add = function(node, attributes, styles) {
	var jaxNode = node;

	if (typeof(node) === "string") {
		jaxNode = JAX.make(node, attributes, styles);
	} else if (typeof(node) === "object" && node.nodeType) {
		jaxNode = JAX(node);
		if (attributes) { jaxNode.attr(attributes); }
		if (styles) { jaxNode.style(styles); }
	}

	if (!(jaxNode instanceof JAX.Node) || jaxNode.jaxNodeType === 9) {
		throw new Error("First argument must be string with JAX.make compatible definition, node or instance of JAX.Node");
	}

	if (attributes) { jaxNode.attr(attributes); }
	if (styles) { jaxNode.css(styles); }

	if (this._pointerJaxNode) {
		this._pointerJaxNode.add(jaxNode);
	} else {
		this._jax.container.add(jaxNode);
	}

	return jaxNode;
};

/**
 * Vytvoří nový textový uzel a připojí ho do elementu, na který má nastaven ukazatel
 * @example
 * var db = new JAX.DOMBuilder();
 * db.open("span");
 * db.addText("Hello world");
 * db.close();
 * console.log(db.getContainer());
 *
 * @param {String} txt text, který se má uložit do textového uzlu
 * @returns {JAX.Node}
 */
JAX.DOMBuilder.prototype.addText = function(txt) {
	if (typeof(txt) === "string") {
		var jaxNode = JAX.makeText(txt);

		if (this._pointerJaxNode) {
			this._pointerJaxNode.add(jaxNode);
		} else {
			this._jax.container.add(jaxNode);
		}

		return jaxNode;
	}

	throw new Error("First argument must be a string");
};

/**
 * "Uzavře aktuálně otevřený element metodou JAX.DOMBuilder.open". Znamená to, že ukazatel se nastaví na rodičovský prvek tohoto elementu, pokud existuje.
 * @example
 * var db = new JAX.DOMBuilder();
 * db.open("span");
 * db.addText("Hello world");
 * db.close();
 * db.close(); // vyhodí výjimku, snažíme se uzavřít prvek, ale žádný už otevřen není
 * console.log(db.getContainer());
 *
 * @returns {JAX.DOMBuilder}
 */
JAX.DOMBuilder.prototype.close = function() {
	if (this._stack.length) {
		this._pointerJaxNode = this._stack.pop();
		return this;
	}

	throw new Error("There is no opened element so you can not close anything");
};

/**
 * Vezme svůj HTML obsah a připne ho do cílového prvku
 * @example
 * var db = new JAX.DOMBuilder();
 * db.open("span");
 * db.addText("Hello world");
 * db.close();
 * db.appendTo(document.body); // pripne vytvoreny span do document.body
 * console.log(db.getContainer());
 *
 * @param {HTMLNode} node prvek, kam se má celý obsah připnout
 * @returns {JAX.DOMBuilder}
 */
JAX.DOMBuilder.prototype.appendTo = function(node) {
	var jaxNode = null;

	if (typeof(node) === "object" && node.nodeType) {
		var jaxNode = JAX(node);
	} else if (node instanceof JAX.Node && node.jaxNodeType === 1) {
		var jaxNode = node;
	} else {
		throw new Error("You are trying to append me to unsupported element. I can be appended only to html element or documentFragment element.");
	}

	this._jax.container.appendTo(jaxNode);
	return this;
};

/**
 * Vrací instance JAX.Node s HTML obsahem
 * @example
 * var db = new JAX.DOMBuilder();
 * db.add("span", {innerHTML:"Hello world"});
 * console.log(db.getContainer());
 *
 * @returns {JAX.Node}
 */
JAX.DOMBuilder.prototype.getContainer = function() {
	return this._jax.container;
};

/**
 * Vymaže HTML obsah
 * @example
 * var db = new JAX.DOMBuilder();
 * db.add("span", {innerHTML:"Hello world"});
 * console.log(db.getContainer());
 * db.clear();
 * console.log(db.getContainer());
 *
 * @returns {JAX.DOMBuilder}
 */
JAX.DOMBuilder.prototype.clear = function() {
	this._jax.container.clear();
	this._stack = [];
	return this;
};

/**
 * @fileOverview fx.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Pomocník pro snadnější tvorbu animací
 * @class JAX.FX
 */ 
JAX.FX = JAK.ClassMaker.makeClass({
	NAME: "JAX.FX",
	VERSION: "1.0"
});

JAX.FX._TRANSITION_PROPERTY = "";
JAX.FX._TRANSITION_EVENT = "";

(function() {
	var transitions = {
      "transition":"transitionend",
      "OTransition":"oTransitionEnd",
      "MozTransition":"transitionend",
      "WebkitTransition":"webkitTransitionEnd",
      "MSTransition":"MSTransitionEnd"
    };

	for (p in transitions) {
		if (p in document.createElement("div").style) {
			JAX.FX._TRANSITION_PROPERTY = p;
			JAX.FX._TRANSITION_EVENT = transitions[p];
			break; 
		}
	}
})();

JAX.FX._SUPPORTED_PROPERTIES = {
	"width": {defaultUnit:"px", css:"width" },
	"height":{defaultUnit:"px", css:"height" },
	"top": {defaultUnit:"px", css:"top" },
	"left": {defaultUnit:"px", css:"left" },
	"bottom": {defaultUnit:"px", css:"bottom" },
	"right": {defaultUnit:"px", css:"right" },
	"fontSize": {defaultUnit:"px", css:"font-size" },
	"opacity": {defaultUnit:"", css:"opacity" },
	"color": {defaultUnit:"", css:"color" },
	"backgroundColor": {defaultUnit:"", css:"background-color" }
};

JAX.FX._SUPPORTED_METHODS = [
	"ease",
	"linear",
	"ease-in",
	"ease-out",
	"ease-in-out",
	"cubic-bezier"
];

/**
 * constructor
 * @example 
 * var elm = JAX("#box");
 * var fx = new JAX.FX(elm);
 *
 * @param {HTMLElm} elm html element, který se má animovat
 */
JAX.FX.prototype.$constructor = function(elm) {
	this._elm = elm instanceof JAX.Node ? elm : JAX.Node.create(elm);
	this._properties = [];
	this._interpolators = [];
	this._callbacks = [];
	this._running = false;
	this._transitionSupport = !!JAX.FX._TRANSITION_PROPERTY;
};

/**
 * Přidá css vlastnost, která se bude animovat. Pro každou vlastnost lze zadat různou délku animace a také hodnoty, od kterých se má začít a po které skončit. <br>
 * Podporované css vlasnosti pro animaci: width, height, top, left, bottom, right, fontSize, opacity, color a backgroundColor
 * @example 
 * var elm = JAX("#box");
 * var fx = new JAX.FX(elm);
 * fx.addProperty("width", 2, 0, 200);
 * fx.addProperty("height", 3, 0, 100);
 * fx.run();
 *
 * @param {string} property css vlastnost, která se má animovat
 * @param {number} duration délka v sekundách, lze zadat i desetinné číslo, např. 1.2
 * @param {string} start počáteční hodnota - je dobré k ní uvést vždy i jednotky, pokud jde o číselnou hodnotu, jako výchozí se používají px
 * @param {string} end koncová hodnota - je dobré k ní uvést vždy i jednotky, pokud jde o číselnou hodnotu, jako výchozí se používají px
 * @param {string} method css transformační metoda (ease, linear, ease-in, ease-out, ... ) více na <a href="http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-timing-function_tag">webu W3C</a>, pozn.: pokud prohlížeč neumí transitions, je použito js řešení a metoda je vždy LINEAR
 * @returns {JAX.FX}
 */
JAX.FX.prototype.addProperty = function(property, duration, start, end, method) {
	var duration = parseInt(duration);
	var method = this._transitionSupport ? (method || "linear") : "LINEAR";
	
	if (typeof(property) != "string") { throw new Error("For first argument I expected string"); }
	if (!isFinite(duration) || duration < 0) { throw new Error("For second argument I expected positive number"); }
	if (typeof(start) != "string" && (typeof(start) != "number" || !isFinite(start))) { throw new Error("For third argument I expected string or number"); }
	if (typeof(end) != "string" && (typeof(end) != "number" || !isFinite(end))) { throw new Error("For fourth argument I expected string or number"); }
	if (typeof(method) != "string") { throw new Error("For fifth argument I expected string"); }

	if (!(property in JAX.FX._SUPPORTED_PROPERTIES)) { 
		var properties = [];
		for (var p in JAX.FX._SUPPORTED_PROPERTIES) { properties.concat(JAX.FX._SUPPORTED_PROPERTIES[p]); }
		throw new Error("First argument must be supported property: " + properties.join(", ")); 
	}
	var cssEnd = this._parseCSSValue(property, end);
	var cssStart = this._parseCSSValue(property, start); 
	var methodLowerCase = method.toLowerCase();

	for (var i=0, len=JAX.FX._SUPPORTED_METHODS.length; i<len; i++) {
		var supported = JAX.FX._SUPPORTED_METHODS[i];
		if (methodLowerCase == supported || (supported == "cubic-bezier" && methodLowerCase.indexOf(supported) == 0)) { 
			this._properties.push({
				property: property,
				cssStart: cssStart,
				cssEnd: cssEnd,
				duration: (duration || 1),
				method: method
			});
			return this;
		}
	}

	var methods = [];
	for (var p in JAX.FX._SUPPORTED_METHODS) { methods.concat(JAX.FX._SUPPORTED_METHODS[p]); }
	throw new Error("Fifth argument must be supported method: " + methods.join(", ")); 
};

/**
 * Po doběhnutí celé animace zavolá funkci předanou parametrem. Opakovaným voláním této metody lze přidat více funkcí.
 * @example 
 * var func1 = function() { console.log("func1"); };
 * var func2 = function() { console.log("func1"); };
 * var elm = JAX("#box");
 * var fx = new JAX.FX(elm);
 * fx.addProperty("width", 2, 0, 200);
 * fx.addProperty("height", 3, 0, 100);
 * fx.callWhenDone(func1);
 * fx.callWhenDone(func2);
 * fx.run();
 *
 * @param {function} callback funkce, která se provede po doběhnutí celé animace
 * @returns {JAX.FX}
 */
JAX.FX.prototype.callWhenDone = function(callback) {
	this._callbacks.push(callback);
	return this;
};

/**
 * Spustí animaci
 * @example
 * var fx = new JAX.FX(elm);
 * fx.addProperty("width", 2, 0, 200);
 * fx.addProperty("height", 3, 0, 100);
 * fx.run();
 *
 * @eturns {JAX.FX}
 */
JAX.FX.prototype.run = function() {
	this._running = true;
	if (!this._transitionSupport) { this._initInterpolators(); return this; }
	this._initTransition();
	return this;
};

/**
 * Zjistí, jestli animace právě běží
 * 
 * @returns {boolean}
 */
JAX.FX.prototype.isRunning = function() {
	return this._running;
};

/**
 * Stopne (zabije) animaci
 * 
 * @returns {JAX.FX}
 */
JAX.FX.prototype.stop = function() {
	if (!this._transitionSupport) { this._stopInterpolators(); return this; }
	this._stopTransition();
	return this;
};

JAX.FX.prototype._initInterpolators = function() {
	for(var i=0, len=this._properties.length; i<len; i++) {
		var property = this._properties[i];

		var interpolator = new JAK.CSSInterpolator(this._elm.node(), property.duration * 1000, { 
			"interpolation": property.method, 
			"endCallback": this._endInterpolator.bind(this, i) 
		});
		
		this._interpolators.push(interpolator);
		if (["backgroundColor", "color"].indexOf(property.property) === 0) {
			interpolator.addColorProperty(property.property, property.cssStart.value, property.cssEnd.value);
		} else {
			interpolator.addProperty(property.property, property.cssStart.value, property.cssEnd.value, property.cssStart.unit);
		}
		interpolator.start();
	}
};

JAX.FX.prototype._stopInterpolators = function() {
	for (var i=0, len=this._interpolators.length; i<len; i++) { this._endInterpolator(i); }
};

JAX.FX.prototype._initTransition = function() {
	var tp = JAX.FX._TRANSITION_PROPERTY;
	var te = JAX.FX._TRANSITION_EVENT;
	var tps = [];
	var node = this._elm.node();
	var style = node.style;

	for (var i=0, len=this._properties.length; i<len; i++) {
		var property = this._properties[i];
		style[property.property] = property.cssStart.value + property.cssStart.unit;
		tps.push(property.property + " " + property.duration + "s " + property.method);
	}

	node.offsetHeight; /* trick - donutime porhlizec k prekresleni */
	node.style[tp] = tps.join(",");

	this._ecTransition = this._elm.listen(te, "_endTransition", this);
	for (var i=0, len=this._properties.length; i<len; i++) {
		var property = this._properties[i];
		style[property.property] = property.cssEnd.value + property.cssStart.unit;
	}
};

JAX.FX.prototype._stopTransition = function() {
	var node = this._elm.node();
	var style = this._elm.node().style;

	for(var i=0, len=this._properties.length; i<len; i++) {
		var property = this._properties[i].property;
		var value = window.getComputedStyle(node).getPropertyValue(JAX.FX._SUPPORTED_PROPERTIES[property].css);
		style[property] = value;
	}

	this._endTransition();
};

JAX.FX.prototype._parseCSSValue = function(property, cssValue) {
	var value = parseFloat(cssValue);
	var unit = (cssValue+"").replace(value, "");

	if (unit) { return { "value": value, "unit": unit }; }

	return { "value": value, "unit": JAX.FX._SUPPORTED_PROPERTIES[property].defaultUnit };
};

JAX.FX.prototype._endInterpolator = function(index) {
	this._interpolators[index].stop();
	this._interpolators.splice(index, 1);
	if (this._interpolators.length) { return; }
	this._running = false;
	for (var i=0, len=this._callbacks.length; i<len; i++) { this._callbacks[i](); }
};

JAX.FX.prototype._endTransition = function() {
	var te = JAX.FX._TRANSITION_EVENT;
	this._elm.stopListening(te, this._ecTransition);
	this._elm.node().style[JAX.FX._TRANSITION_PROPERTY] = "none";
	this._ecTransition = null;
	this._running = false;
	for (var i=0, len=this._callbacks.length; i<len; i++) { this._callbacks[i](); }
};

if (!window.$ && !window.$$) { window.$ = JAX; window.$$ = JAX.all; }

