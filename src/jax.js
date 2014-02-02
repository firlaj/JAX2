/**
 * @fileOverview jax.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 2.2
 * @group jak-util
 */

/**
 * @method Najde element, který odpovídá selectoru
 *
 * @param {string || object} selector řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @param {string || object} [srcElement=window.document] element, ve kterém se má hledat
 * @returns {object.<JAX.Node>}
 */
var JAX = function(selector, srcElement) {
	if (!selector) {
		return new JAX.NullNode();
	}

	if (selector instanceof JAX.Node) {
		return selector;
	}

	if (typeof(selector) == "string") {
		srcElement = srcElement || document;

		if (srcElement != document) {
			var jaxSrcElement = JAX(srcElement);

			if (!jaxSrcElement.n) {
				console.error("JAX: Second argument must be valid element.");
				return new JAX.NullNode(typeof(selector) == "string" ? selector : "");
			}

			srcElement = jaxSrcElement.n;
		}

		var foundElm = srcElement.querySelector(selector);
		var nodeType = foundElm ? foundElm.nodeType : -1;
	} else if (typeof(selector) == "object") {
		var nodeType = JAX.NULL;
		var foundElm = null;

		var isWindow = selector == window || (selector.Window && selector instanceof selector.Window) || (selector.constructor.toString().indexOf("DOMWindow") > -1); /* toString - fix pro Android */

		if (isWindow) { 
			var nodeType = JAX.WINDOW;
			var foundElm = selector;	
		} else {
			var win = selector.defaultView || selector.parentWindow || (selector.ownerDocument ? (selector.ownerDocument.defaultView || selector.ownerDocument.parentWindow) : null);

			if (win) {
				var isElement = (win.HTMLElement && selector instanceof win.HTMLElement) || (win.Element && selector instanceof win.Element);
				var isDocument = (win.HTMLDocument && selector instanceof win.HTMLDocument) || (win.Document && selector instanceof win.Document);
				var isDocumentFragment = win.DocumentFragment && selector instanceof win.DocumentFragment;
				var isText = win.Text && selector instanceof win.Text;

				if (isElement || isDocument || isDocumentFragment || isText) {
					var nodeType = selector.nodeType;
					var foundElm = selector;
				}
			}
		}
	}

	switch(nodeType) {
		case JAX.WINDOW:
			return new JAX.Window(foundElm);
		case JAX.NULL:
			return new JAX.NullNode(typeof(selector) == "string" ? selector : "");
		case JAX.HTML_ELEMENT:
			return new JAX.Element(foundElm);
		case JAX.TEXT:
		case JAX.COMMENT:
			return new JAX.TextNode(foundElm);
		case JAX.DOCUMENT:
			return new JAX.Document(foundElm);
		case JAX.DOCUMENT_FRAGMENT:
			return new JAX.DocumentFragment(foundElm);
	}
};

JAX.WINDOW = -2; /* konstanta pro objekt window */
JAX.NULL = -1; /* konstanta pro nulový objekt */
JAX.HTML_ELEMENT = 1; /* konstanta pro nulový objekt */
JAX.TEXT = 3; /* konstanta pro textový node */
JAX.COMMENT = 8; /* konstanta pro komentářový node */
JAX.DOCUMENT = 9; /* konstanta pro objekt document */
JAX.DOCUMENT_FRAGMENT = 11; /* konstanta pro objekt document fragment */

/**
 * @method Najde elementy, které odpovídají selectoru
 *
 * @param {string || object || array} selector řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | Array of (HTMLElement | Text | HTMLDocument | Window | JAX.Node) | JAX.NodeArray
 * @param {object || string} [srcElement=window.document] CSS3 (CSS2.1) selector nebo element, ve kterém se má hledat
 * @returns {object.<JAX.NodeArray>}
 */
JAX.all = function(selector, srcElement) {
	if (!selector) {
		return JAX.NodeArray([]);
	}

	if (typeof(selector) == "string") {
		srcElement = srcElement || document;

		if (srcElement != document) {
			var jaxSrcElement = srcElement instanceof JAX.Node ? srcElement : JAX(srcElement);

			if (!jaxSrcElement.n) {
				console.error("JAX.all: Second argument must be valid element.");
				return new JAX.NullNode();
			}

			srcElement = jaxSrcElement.n;
		}

		var foundElms = srcElement.querySelectorAll(selector);

		return new JAX.NodeArray(foundElms);
	} else if (selector instanceof Array || (window.NodeList && selector instanceof window.NodeList) || selector instanceof JAX.NodeArray) {
		return new JAX.NodeArray(selector);
	} else if (selector.length && selector[0] && selector[selector.length - 1]) {
		/* IE8 can't detect NodeList, so if we have something iterable we will pass it */
		return new JAX.NodeArray(selector);
	} else if (selector instanceof JAX.Node || (typeof(selector) == "object" && JAX(selector).n)) {
		return new JAX.NodeArray([selector]);
	}
	
	return new JAX.NodeArray([]);
};

/**
 * @method Vytvoří element na základě zadaných parametrů
 *
 * @param {string} tagString řetězec definující název tagu (lze přidat i název tříd(y) a id, se kterými se má vytvořit)
 * @param {object} attrs asociativní pole atributů tagu
 * @param {object} styles asociativní pole stylů, které se mají přiřadit do node.style
 * @param {object} [srcDocument=window.document] documentElement, ve kterém se má vytvářet
 * @returns {object.<JAX.Node>}
 */
JAX.make = function(tagString, attrs, styles, srcDocument) {
	var attrs = attrs || {};
	var styles = styles || {};
	var srcDocument = srcDocument || document;

	if (!tagString || typeof(tagString) != "string") { 
		console.error("JAX.make: First argument must be string.");
		return JAX(null); 
	}
	if (typeof(attrs) != "object") { 
		console.error("JAX.make: Second argument must be associative array."); 
		attrs = {};
	}
	if (typeof(styles) != "object") { 
		console.error("JAX.make: Third argument must be associative array."); 
		styles = {};
	}
	if (typeof(srcDocument) != "object" || !srcDocument.nodeType && [9,11].indexOf(srcDocument.nodeType) == -1) { 
		console.error("JAX.make: Fourth argument must be document element."); 
		srcDocument = document;
	}

	var parts = tagString.match(/[#.]?[a-z0-9_-]+/ig) || [];
	var tagName = parts[0];

	if (!tagName || !/^[a-z0-9]+$/ig.test(tagName)) {
		console.error("JAX.make: Tagname must be first in element definition.");
		return JAX(null);
	}
	
	for (var i=0, len=parts.length; i<len; i++) {
		var part = parts[i];
		var ch = part.charAt(0);

		if (ch == "#") { 
			attrs["id"] = part.substring(1);
		} else if (ch == ".") { 
			if (attrs["className"]) { 
				attrs["className"] += " ";
				attrs["className"] += part.substring(1);
			} else {
				attrs["className"] = part.substring(1);
			}
		}
	}
	
	var createdNode = srcDocument.createElement(tagName);

	for (var p in attrs) { createdNode[p] = attrs[p]; }
	for (var p in styles) { createdNode.style[p] = styles[p]; }
	
	return new JAX.Element(createdNode);
};

/**
 * @method Vytvoří z HTML stringu elementy - *zhmotní* html string.
 *
 * @param {string} html html string, který má být transformováno na uzly
 * @returns {object.<JAX.NodeArray>}
 */
JAX.makeFromHTML = function(html) {
	if (!html) { return new JAX.NodeArray([]); }

	var temp = JAX.make("div").html(html);
	var children = temp.children();

	return children;
};

/**
 * @method Vytvoří textový uzel
 *
 * @param {string} text text, který má uzel obsahovat
 * @param {object} [srcDocument=window.document] documentElement node, ve kterém se má vytvářet
 * @returns {object.<JAX.Node>}
 */
JAX.makeText = function(text, srcDocument) {
	return new JAX.TextNode((srcDocument || document).createTextNode(text));
};

/**
 * @method Zjistí, jakého typu je zadaný parametr
 *
 * @param {} value testovaná hodnota
 * @returns {string}
 */
JAX.getTypeOf = function(value) {
	if (typeof(value) == "number") {
		return "number";
	} else if (typeof(value) == "string") {
		return "string";
	} else if (typeof(value) == "undefined") {
		return "undefined";
	} else if (typeof(value) == "function") {
		return "function";
	} else if (value === true || value === false) {
		return "boolean";
	} else if (value === null) {
		return "null";
	}

	var toStringResult = Object.prototype.toString.call(value);

	if (toStringResult == "[object Array]") {
		return "array";	
	} else if (toStringResult == "[object Date]") {
		return "date";
	}

	return "object";
};

/**
 * @method Najde platnou CSS vlasnost. Lze použít při hledání platné CSS hodnoty s vendor prefixem. Zadávají se oddělené mezerou.
 *
 * @param {string} property CSS vlasnosti oddělené mezereou
 * @returns {string}
 */
JAX.findCSSProperty = function(property) {
	var properties = property.trim().split(" ");
	var style = document.createElement("div").style;

	for (var i=0, len=properties.length; i<len; i++) {
		var property = properties[i];
		if (property in style) { return property; }
	}

	return "";
};
