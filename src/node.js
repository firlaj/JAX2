JAX.Node = JAK.ClassMaker.makeClass({
	NAME: "JAX.Node",
	VERSION: "0.71"
});

JAX.Node.MEASUREABLEVALUE = /^(?:-)?\d+(\.\d+)?(%|em|in|cm|mm|ex|pt|pc)?$/i

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

JAX.Node.create = function(node) {
	if (typeof(node) == "object" && node.nodeType) {
		var nodeType = node.nodeType;

		if (nodeType in JAX.Node.instances) {
			switch(nodeType) {
				case JAX.Node.ELEMENT_NODE:
					var jaxId = parseInt(node.getAttribute("data-jax-id"),10);
					if (typeof(jaxId) != "number") { jaxId = -1; }
					if (jaxId > -1) { return JAX.Node.instances[JAX.Node.ELEMENT_NODE][jaxId].instance; }
				break;
				default:
					var index = -1;
					var instances = JAX.Node.instances[nodeType];
					for (var i in instances) { 
						if (node == instances[i].node) { index = i; break; }
					}
					if (index > -1) { return JAX.Node.instances[nodeType][index].instance; }
			}
		}

		var f = Object.create(JAX.Node.prototype);
		f._init(node);
		return f;
	}

	new JAX.E({funcName:"JAX.Node.create", caller:this.create})
		.expected("first argument", "HTML element", node)
		.show();
};

JAX.Node.prototype.jaxNodeType = 0;

JAX.Node.prototype.$constructor = function() {
	new JAX.E({funcName:"JAX.Node.$constructor", caller:this.$constructor})
		.message("You can not call this class with operator new. Use JAX.Node.create factory method instead of it")
		.show();
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
	if ([1,9].indexOf(this._node.nodeType) != -1) { this.stopListening(); }
	if ([1,3,8].indexOf(this._node.nodeType) != -1) { this.removeFromDOM(); }
	if ([1,11].indexOf(this._node.nodeType) != -1) { this.clear(); }
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
	if (this._node.nodeType != 1) { return this; }

	var classNames = [].slice.call(arguments);

	if (classNames.length == 1) { classNames = classNames[0]; }

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.addClass, arguments); 
		return this; 
	} else if (typeof(classNames) == "string") {
		var classes = classNames.split(" ");
		var currclasses = this._node.className.split(" ");

		while(classes.length) {
			var newclass = classes.shift();
			if (currclasses.indexOf(newclass) == -1) { currclasses.push(newclass); }
		}

		this._node.className = currclasses.join(" ");

		return this;
	} else if (classNames instanceof Array) {
		for (var i=0, len=classNames.length; i<len; i++) { this.addClass(classNames[i]); }

		return this;
	}

	new JAX.E({funcName:"JAX.Node.addClass", node:this._node, caller:this.addClass})
		.expected("arguments", "string or array of strings", classNames)
		.show();
};

JAX.Node.prototype.removeClass = function() {
	if (this._node.nodeType != 1) { return this; }

	var classNames = [].slice.call(arguments);

	if (classNames.length == 1) { classNames = classNames[0]; }

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.removeClass, arguments); 
		return this; 
	} else if (typeof(classNames) == "string") {
		var classes = classNames.split(" ");
		var currclasses = this._node.className.split(" ");

		while(classes.length) {
			var index = currclasses.indexOf(classes.shift());
			if (index != -1) { currclasses.splice(index, 1); }
		}

		this._node.className = currclasses.join(" ");
		return this;
	} else if (classNames instanceof Array) {
		for (var i=0, len=classNames.length; i<len; i++) { this.removeClass(classNames[i]); }

		return this;
	}

	new JAX.E({funcName:"JAX.Node.removeClass", node:this._node, caller:this.removeClass})
		.expected("arguments", "string or array of strings", classNames)
		.show();
};

JAX.Node.prototype.hasClass = function(className) {
	if (this._node.nodeType != 1) { return this; }

	if (typeof(classname) == "string") {  
		var names = className.split(" ");

		while(names.length) {
			var name = names.shift();
			if (this._node.className.indexOf(name) != -1) { return true; }
		}

		return false;
	}

	new JAX.E({funcName:"JAX.Node.hasClass", node:this._node, caller:this.hasClass})
		.expected("first argument", "string", className)
		.show();
};

JAX.Node.prototype.id = function(id) {
	if (this._node.nodeType != 1) { return !arguments.length ? "" : this; }

	if (!arguments.length) { 
		return this.attr("id"); 
	} else if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.id, arguments); 
		return this; 
	} else if (typeof(id) == "string") { 
		this.attr({id:id}); 
		return this;
	}

	new JAX.E({funcName:"JAX.Node.id", node:this._node, caller:this.id})
		.expected("first argument", "string", id)
		.show();
};

JAX.Node.prototype.html = function(innerHTML) {
	if (this._node.nodeType != 1) { return !arguments.length ? "" : this; }

	if (!arguments.length) { 
		return innerHTML; 
	} else if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.html, arguments); 
		return this; 
	} else if (typeof(innerHTML) == "string" || typeof(innerHTML) == "number") {
		this._node.innerHTML = innerHTML + "";
		return this;
	}

	new JAX.E({funcName:"JAX.Node.html", node:this._node, caller:this.html})
		.expected("first argument", "string", html)
		.message("You can call it withou arguments. Then it will return innerHTML value.")
		.show();
};

JAX.Node.prototype.add = function() {
	var nodes = [].slice.call(arguments);

	if (nodes.length == 1) { nodes = nodes[0]; }

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.add, arguments); 
		return this; 
	} else if (nodes && nodes instanceof Array) { 
		for (var i=0, len=nodes.length; i<len; i++) { this.add(nodes[i]); }
		return this;
	} else if (nodes && (nodes.nodeType || JAX.isJAXNode(nodes))) {
		var node = nodes.jaxNodeType ? nodes.node() : nodes;
		try {
			this._node.appendChild(node);
			return this;
		} catch(e) {}
	}
	
	new JAX.E({funcName:"JAX.Node.add", node:this._node, caller:this.add})
		.expected("arguments", "HTML node, textnode, instance of JAX.Node, JAX.NodeText or JAX.NodeDocFrag", nodes)
		.message("You can call it with arguments separated by comma or array or single argument.")
		.show();
};

JAX.Node.prototype.addBefore = function(node, nodeBefore) {
	var error = 3;

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.addBefore, arguments); 
		return this;  
	} 

	if (typeof(node) == "object" && (node.nodeType || JAX.isJAXNode(node))) { error -= 1; }
	if (typeof(nodeBefore) == "object" && (nodeBefore.nodeType || JAX.isJAXNode(nodeBefore))) { error -= 2; }

	if (error) {
		var e = new JAX.E({funcName:"JAX.Node.addBefore", node:this._node, caller:this.addBefore});
		if (error & 1) { e.expected("first argument", "HTML element, textnode, instance of JAX.Node, JAX.NodeText or JAX.NodeDocFrag", node); }
		if (error & 2) { e.expected("second argument", "HTML element, textnode, instance of JAX.Node or JAX.NodeText", nodeBefore); }
		e.show();
	}

	var node = node.jaxNodeType ? node.node() : node;
	var nodeBefore = nodeBefore.jaxNodeType ? nodeBefore.node() : nodeBefore;
	try {
		this._node.insertBefore(node, nodeBefore);
		return this;
	} catch(e) {}
};

JAX.Node.prototype.appendTo = function(node) {
	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.appendTo, arguments); 
		return this; 
	} else if (typeof(node) == "object" && (node.nodeType || JAX.isJAXNode(node))) { 
		var node = node.jaxNodeType ? node.node() : node;
		try {
			node.appendChild(this._node);
			return this;
		} catch(e) {}
	}

	new JAX.E({funcName:"JAX.Node.appendTo", node:this._node, caller:this.appendTo})
		.expected("first argument", "HTML element, instance of JAX.Node or JAX.NodeDocFrag", nodes)
		.show();
};

JAX.Node.prototype.appendBefore = function(node) {
	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.appendBefore, arguments); 
		return this; 
	} else if (typeof(node) == "object" && (node.nodeType || JAX.isJAXNode(node))) {
		try {
			var node = node.jaxNodeType ? node.node() : node;
			node.parentNode.insertBefore(this._node, node);
		} catch(e) {}
	}

	new JAX.E({funcName:"JAX.Node.appendBefore", node:this._node, caller:this.appendBefore})
		.expected("first argument", "HTML element, text node, instance of JAX.Node or JAX.NodeText", nodes)
		.show();
};

JAX.Node.prototype.removeFromDOM = function() {
	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.removeFromDOM, arguments); 
		return this; 
	}

	try {
		this._node.parentNode.removeChild(this._node);
	} catch(e) {}

	return this;
};

JAX.Node.prototype.clone = function(withContent) {
	if (this._node.nodeType != 1) {
		new JAX.E({funcName:"JAX.Node.clone", node:this._node, caller:this.clone})
		.message("You can not use this method for this element. You can use it only for element with nodeType == 1.")
		.show();
	}

	var withContent = !!withContent;
	var clone = this._node.cloneNode(withContent);
	clone.setAttribute("data-jax-id","");
	return JAX.Node.create(clone);
};

JAX.Node.prototype.listen = function(type, funcMethod, obj, bindData) {
	if ([1,9].indexOf(this._node.nodeType) == -1) { 
		new JAX.E({funcName:"JAX.Node.listen", node:this._node, caller:this.listen})
		.message("You can not use this method for this element. You can use it only for element with nodeType == 1.")
		.show();
	}

	var error = 15;
	var obj = obj || window;

	if (type && typeof(type) == "string") { error -= 1; }
	if (funcMethod && (typeof(funcMethod) == "string" || typeof(funcMethod) == "function")) { error -= 2; }
	if (typeof(obj) == "object") { error -= 4; }
	if (typeof(funcMethod) == "string") {
		var funcMethod = obj[funcMethod];
		if (funcMethod) {
			error -= 8; 
			funcMethod = funcMethod.bind(obj);
		}
	} else { 
		error -= 8; 
	}

	if (error) {
		var e = new JAX.E({funcName:"JAX.Node.listen", node:this._node, caller:this.listen});
		if (error & 1) { e.expected("first argument", "string", type); }
		if (error & 2) { e.expected("second argument", "string or function", funcMethod); }
		if (error & 4) { e.expected("third", "object", obj); }
		if (error & 8) { e.message("Method '" + funcMethod + "' in second argument was not found in third argument " + obj + "."); }
		e.show();
	}

	var thisNode = this;
	var f = function(e, node) { funcMethod(e, thisNode, bindData); }
	var listenerId = JAK.Events.addListener(this._node, type, f);
	var evtListeners = this._storage.events[type] || [];
	evtListeners.push(listenerId);
	this._storage.events[type] = evtListeners;

	return listenerId;
};

JAX.Node.prototype.stopListening = function(type, listenerId) {
	if ([1,9].indexOf(this._node.nodeType) == -1) { 
		new JAX.E({funcName:"JAX.Node.stopListening", node:this._node, caller:this.stopListening})
		.message("You can not use this method for this element. You can use it only for element with nodeType == 1.")
		.show();
	}

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

	if (typeof(type) != "string") {
		new JAX.E({funcName:"JAX.Node.stopListening", node:this._node, caller:this.stopListening})
		.expected("first argument", "string", type)
		.show(); 
	}

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

	if (window.console && window.console.warn) { 
		console.warn("JAX.Node.stopListening: no event listener id '" + listenerId + "' found. See doc for more information."); 
	}
	return this;
};

JAX.Node.prototype.attr = function() {
	var attributes = [].slice.call(arguments);

	if (attributes.length > 1) { 
		return this.attr(attributes);
	} else if (attributes.length == 1) {
		attributes = attributes[0];
	} else {
		return {};
	}

	if (typeof(attributes) == "string") { 
		return this._node.nodeType == 1 ? node.getAttribute(attributes) : ""; 
	} else if (attributes instanceof Array) {
		var attrs = {};
		if (this._node.nodeType != 1) { return attrs; }
		for (var i=0, len=attributes.length; i<len; i++) { 
			var attribute = attributes[i];
			attrs[attribute] = node.getAttribute(attribute);
		}
		return attrs;	
	} else if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.attr, arguments); 
		return this; 
	}

	if (this._node.nodeType != 1) { return this; }

	for (var p in attributes) {
		var value = attributes[p];
		this._node.setAttribute(p, value);
	}

	return this;
};

	
JAX.Node.prototype.styleCss = function() {
	var cssStyles = [].slice.call(arguments);
	
	if (cssStyles.length > 1) { 
		return this.styleCss(cssStyles);
	} else if (cssStyles.length == 1) {
		cssStyles = cssStyles[0];
	} else {
		return [];
	}

	if (typeof(cssStyles) == "string") {
		if (this._node.nodeType != 1) { return ""; }
		return cssStyles == "opacity" ? this._getOpacity() : this._node.style[cssStyles]; 
	} else if (cssStyles instanceof Array) {
		var css = {};
		if (this._node.nodeType != 1) { return css; }
		for (var i=0, len=cssStyles.length; i<len; i++) {
			var cssStyle = cssStyles[i];
			if (cssStyle == "opacity") { css[cssStyle] = this._getOpacity(); continue; }
			css[cssStyle] = this._node.style[cssStyle];
		}
		return css;
	} else if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.style, arguments); 
		return this; 
	} 

	if (this._node.nodeType != 1) { return this; }

	for (var p in cssStyles) {
		var value = cssStyles[p];
		if (p == "opacity") { this._setOpacity(value); continue; }
		this._node.style[p] = value;
	}

	return this;
};

JAX.Node.prototype.displayOn = function(displayValue) {
	if (this._node.nodeType != 1) { return this; }

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.displayOn, arguments); 
		return this; 
	} 

	this._node.style["display"] = displayValue || "";

	return this;
};

JAX.Node.prototype.displayOff = function() {
	if (this._node.nodeType != 1) { return this; }

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.displayOff, arguments); 
		return this; 
	} 
	this._node.style["display"] = "none";

	return this;
};

JAX.Node.prototype.computedCss = function() {
	var cssStyles = arguments;

	if (cssStyles.length > 1) { 
		return this.computedCss(cssStyles);
	} else if (cssStyles.length == 1) {
		cssStyles = arguments[0];
	} else {
		return [];
	}

	if (typeof(cssStyles) == "string") {
		if (this._node.nodeType != 1) { return ""; }
		var value = JAK.DOM.getStyle(this._node, cssStyles);
		if (this._node.runtimeStyle && !this._node.addEventListener && JAX.Node.MEASUREABLEVALUE.test(value)) { value = this._inPixels(value); }
		return value;
	}

	var css = {};
	if (this._node.nodeType != 1) { return css; }
	var properties = [].concat(cssStyles);

	for (var i=0, len=cssStyles.length; i<len; i++) {
		var cssStyle = cssStyles[i];
		var value = JAK.DOM.getStyle(this._node, cssStyle);
		if (this._node.runtimeStyle && !this._node.addEventListener && JAX.Node.MEASUREABLEVALUE.test(value)) { value = this._inPixels(value); }
		css[cssStyle] = value;
	}
	return css;
};

JAX.Node.prototype.fullWidth = function(value) {
	if (!arguments.length) { 
		var backupStyle = this.styleCss("display","visibility","position");
		var isFixedPosition = this.computedCss("position").indexOf("fixed") == 0;
		var isDisplayNone = this.styleCss("display").indexOf("none") == 0;

		if (!isFixedPosition) { this.styleCss({"position":"absolute"}); }
		if (isDisplayNone) { this.styleCss({"display":""}); }		
		this.styleCss({"visibility":"hidden"});

		var width = this._node.offsetWidth;
		this.styleCss(backupStyle);
		return width; 
	}

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.width, arguments); 
		return this; 
	} 

	var paddingLeft = parseFloat(this.computedCss("padding-left"));
	var paddingRight = parseFloat(this.computedCss("padding-right"));
	var borderLeft = parseFloat(this.computedCss("border-left"));
	var borderRight = parseFloat(this.computedCss("border-right"));

	if (isFinite(paddingLeft)) { value =- paddingLeft; }
	if (isFinite(paddingRight)) { value =- paddingRight; }
	if (isFinite(borderLeft)) { value =- borderLeft; }
	if (isFinite(borderRight)) { value =- borderRight; }

	this._node.style.width = Math.max(value,0) + "px";
	return this;
};

JAX.Node.prototype.fullHeight = function(value) {
	if (!arguments.length) { 
		var backupStyle = this.styleCss("display","visibility","position");
		var isFixedPosition = this.computedCss("position").indexOf("fixed") == 0;
		var isDisplayNone = this.styleCss("display").indexOf("none") == 0;

		if (!isFixedPosition) { this.styleCss({"position":"absolute"}); }
		if (isDisplayNone) { this.styleCss({"display":""}); }		
		this.styleCss({"visibility":"hidden"});

		var height = this._node.offsetHeight;
		this.styleCss(backupStyle);
		return height; 
	}

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.height, arguments); 
		return this; 
	} 

	var paddingTop = parseFloat(this.computedCss("padding-top"));
	var paddingBottom = parseFloat(this.computedCss("padding-bottom"));
	var borderTop = parseFloat(this.computedCss("border-top"));
	var borderBottom = parseFloat(this.computedCss("border-bottom"));

	if (isFinite(paddingTop)) { value =- paddingTop; }
	if (isFinite(paddingBottom)) { value =- paddingBottom; }
	if (isFinite(borderTop)) { value =- borderTop; }
	if (isFinite(borderBottom)) { value =- borderBottom; }

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
}

JAX.Node.prototype.lChild = function() {
	return this._node.lastChild ? JAX(this._node.lastChild) : null;
}

JAX.Node.prototype.clear = function() {
	if (this._node.nodeType != 1 && this._node.nodeType != 11) {
		new JAX.E({funcName:"JAX.Node.clear", node:this._node, caller:this.clear})
		.message("You can not use this method for this element. You can use it only for element with nodeType == 1.")
		.show();
	}

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.clear, arguments); 
		return this; 
	} 
	JAK.DOM.clear(this._node);
	return this;
};

JAX.Node.prototype.contains = function(node) {
	if (this._node.nodeType != 1) {
		new JAX.E({funcName:"JAX.Node.contains", node:this._node, caller:this.contains})
		.message("You can not use this method for this element. You can use it only for element with nodeType == 1.")
		.show();
	}

	if (typeof(node) == "object" && (node.nodeType || JAX.isJAXNode(node))) {
		var elm = node.jaxNodeType ? node.node().parentNode : node.parentNode;
		while(elm) {
			if (elm == this._node) { return true; }
			elm = elm.parentNode;
		}
		return false;
	}
	
	new JAX.E({funcName:"JAX.Node.contains", node:this._node, caller:this.contains})
		.expected("first argument", "HTML element, text node, instance of JAX.Node or JAX.NodeText", node)
		.show();
};

JAX.Node.prototype.isChildOf = function(node) {
	if ([1,3,8].indexOf(this._node.nodeType) == -1) {
		new JAX.E({funcName:"JAX.Node.displayOn", node:this._node, caller:this.displayOn})
		.message("You can not use this method for this element. You can use it only for element with nodeType == 1.")
		.show();
	}

	if (typeof(node) == "object" && (node.nodeType || JAX.isJAXNode(node))) {
		var elm = node.jaxNodeType ? node : JAX.Node.create(node);
		return elm.contains(this);
	}

	new JAX.E({funcName:"JAX.Node.isChildOf", node:this._node, caller:this.isChildOf})
		.expected("first argument", "HTML element, JAX.Node or JAX.NodeDocFrag", node)
		.show();
};

JAX.Node.prototype.fade = function(type, duration, completeCbk) {
	if (this._node.nodeType != 1) {
		new JAX.E({funcName:"JAX.Node.fade", node:this._node, caller:this.fade})
		.message("You can not use this method for this element. You can use it only for element with nodeType == 1.")
		.show();
	}

	var error = 7;
	var duration = duration || 0;

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.fade, arguments); 
		return this; 
	}

	if (typeof(type) == "string") { error -= 1; }
	if (typeof(duration) == "number") { error -= 2; }
	if (!completeCbk || typeof(completeCbk) == "function") { error -= 4; }

	if (error) {
		var e = JAX.E({funcName:"JAX.Node.fade", node:this._node, caller:this.fade});
		if (error & 1) { e.expected("first argument", "string", type); }
		if (error & 2) { e.expected("second argument", "number", duration); }
		if (error & 4) { e.expected("third argument", "function", completeCbk); }
		e.show();
	}

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
			console.warn("JAX.Node.fade got unsupported type '" + type + "'.");
			return this;
	}

	var animation = new JAX.Animation(this);
	var func = function() {
		this.unlock();
		if (completeCbk) { completeCbk(); }
	}.bind(this);

	animation.addProperty("opacity", duration, sourceOpacity, targetOpacity);
	animation.addCallback(func);
	animation.run();
	this.lock();

	return this;
};

JAX.Node.prototype.fadeTo = function(opacityValue, duration, completeCbk) {
	if (this._node.nodeType != 1) {
		new JAX.E({funcName:"JAX.Node.fadeTo", node:this._node, caller:this.fadeTo})
		.message("You can not use this method for this element. You can use it only for element with nodeType == 1.")
		.show();
	}

	var error = 7;
	var duration = duration || 0;

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.fade, arguments); 
		return this; 
	}

	if (JAX.isNumeric(opacityValue)) { error -= 1; }
	if (typeof(duration) == "number") { error -= 2; }
	if (!completeCbk || typeof(completeCbk) == "function") { error -= 4; }

	if (error) {
		var e = JAX.E({funcName:"JAX.Node.fadeTo", node:this._node, caller:this.fadeTo});
		if (error & 1) { e.expected("first argument", "number", opacityValue); }
		if (error & 2) { e.expected("second argument", "number", duration); }
		if (error & 4) { e.expected("third argument", "function", completeCbk); }
		e.show();
	}

	var sourceOpacity = parseFloat(this.computedCss("opacity")) || 1;
	var targetOpacity = parseFloat(opacityValue);

	var animation = new JAX.Animation(this);
	var func = function() {
		this.unlock();
		if (completeCbk) { completeCbk(); }
	}.bind(this);

	animation.addProperty("opacity", duration, sourceOpacity, targetOpacity);
	animation.addCallback(func);
	animation.run();
	this.lock();

	return this;
};

JAX.Node.prototype.slide = function(type, duration, completeCbk) {
	if (this._node.nodeType != 1) {
		new JAX.E({funcName:"JAX.Node.slide", node:this._node, caller:this.slide})
		.message("You can not use this method for this element. You can use it only for element with nodeType == 1.")
		.show();
	}

	var error = 7;
	var duration = duration || 0;

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.slide, arguments); 
		return this; 
	} 

	if (typeof(type) == "string") { error -= 1; }
	if (typeof(duration) == "number") { error -= 2; }
	if (!completeCbk || typeof(completeCbk) == "function") { error -= 4; }

	if (error) {
		var e = JAX.E({funcName:"JAX.Node.slide", node:this._node, caller:this.slide});
		if (error & 1) { e.expected("first argument", "string", type); }
		if (error & 2) { e.expected("second argument", "number", duration); }
		if (error & 4) { e.expected("third argument", "function", completeCbk); }
		e.show();
	}

	switch(type) {
		case "down":
			var backupStyles = this.styleCss("height","overflow");
			var property = "height";
			var source = 0;
			var target = this.fullHeight();	
		break;
		case "up":
			var backupStyles = this.styleCss("height","overflow");
			var property = "height";
			var source = this.fullHeight();
			var target = 0;
		break;
		case "left":
			var backupStyles = this.styleCss("width","overflow");
			var property = "width";
			var source = this.fullWidth();
			var target = 0;	
		break;
		case "right":
			var backupStyles = this.styleCss("width","overflow");
			var property = "width";
			var source = 0;
			var target = this.fullWidth();
		break;
		default:
			if (window.console && window.console.warn) { console.warn("JAX.Node.slide got unsupported type '" + type + "'."); }
			return this;
	}

	this.styleCss({"overflow": "hidden"});

	var animation = new JAX.Animation(this);
	var func = function() {
		for (var p in backupStyles) { this._node.style[p] = backupStyles[p]; }
		this.unlock();
		if (completeCbk) { completeCbk(); }
	}.bind(this);

	animation.addProperty(property, duration, source, target);
	animation.addCallback(func);
	animation.run();
	this.lock();

	return this;
};

JAX.Node.prototype.lock = function() {
	if (this._node.nodeType == 1) { this._node.setAttribute("data-jax-locked","1"); }
	return this;
};

JAX.Node.prototype.isLocked = function() {
	if (this._node.nodeType != 1) { return false; }

	return !!node.getAttribute("data-jax-locked");
}

JAX.Node.prototype.unlock = function() {
	if (this._node.nodeType == 1) {
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
		if (typeof(oldJaxId) != "number") { oldJaxId = -1; }
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

	if (JAK.Browser.client == "ie" && JAK.Browser.version < 9) { 
		property = "filter";
		value = Math.round(100*value);
		value = "progid:DXImageTransform.Microsoft.Alpha(opacity=" + value + ");";
	} else {
		property = "opacity";
	}
	this._node.style[property] = value + "";

};

JAX.Node.prototype._getOpacity = function() {
	if (JAK.Browser.client == "ie" && JAK.Browser.version < 9) {
		var value = "";
		this._node.style.filter.replace(JAX.Animation.REGEXP_OPACITY, function(match1, match2) {
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

