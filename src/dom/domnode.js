/**
 * @fileOverview node.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída reprezentující obecny DOM Node (nodeType == 1 || 3 || 8)
 * @class JAX.DOMNode
 */
JAX.DOMNode = JAK.ClassMaker.makeClass({
	NAME: "JAX.DOMNode",
	VERSION: "1.0",
	EXTEND: JAX.Node
});

JAX.DOMNode.prototype.$constructor = function(node) {
	this._node = node;
	this.jaxNodeType = node.nodeType;
};

/**
 * @method přidává do elementu další uzly vždy na konec
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX(document.body).add(JAX.make("span")); 
 *
 * @param {String | Node | Node[] | JAX.NodeArray} HTML string | nodes DOM uzel | pole DOM uzlů | instance JAX.NodeArray
 * @returns {JAX.DOMNode}
 */
JAX.DOMNode.prototype.add = function(nodes) {
	if (typeof(nodes) == "string") {
		if (this._node.insertAdjacentHTML) {
			this._node.insertAdjacentHTML("beforeend", nodes);
		} else {
			JAX.makeFromHTML(nodes).appendTo(this);
		}
	} else {
		JAX.all(nodes).appendTo(this);
	}
	
	return this;
};

/**
 * @method vloží zadaný element jako první
 *
 * @param {Node | JAX.DOMNode | String} node DOM uzel | instance JAX.DOMNode | CSS3 (2.1) selector
 * @returns {JAX.DOMNode}
 */
JAX.DOMNode.prototype.insertFirst = function(node) {
	var jaxNode = JAX(node);

	if (jaxNode.exists()) {
		var n = jaxNode.node();

		if (this._node.childNodes && this._node.firstChild) {
			this._node.insertBefore(n, this._node.firstChild);
		} else if (this._node.childNodes) {
			this._node.appendChild(n);
		} else {
			console.error("JAX.DOMNode.insertFirst: Given element can not have child nodes.", this._node);
		}
		
		return this;
	}
	
	console.error("JAX.DOMNode.insertFirst: I could not find given element. For first argument I expected html element, text node or JAX.Node.");
	return this;
};

/**
 * @method přidá do elementu DOM uzel před zadaný uzel
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX(document.body).add(JAX.make("span"), document.body.lastChild); // prida span pred posledni prvek v body 
 *
 * @param {Node | JAX.DOMNode} node DOM uzel | instance JAX.DOMNode
 * @param {Node | JAX.DOMNode} nodeBefore DOM uzel | instance JAX.DOMNode
 * @returns {JAX.DOMNode}
 */
JAX.DOMNode.prototype.addBefore = function(node, nodeBefore) {
	var jaxNode = JAX(node);
	var jaxNodeBefore = JAX(nodeBefore);

	if (!jaxNode.exists()) { 
		console.error("JAX.DOMNode.addBefore: For first argument I expected html element, text node, documentFragment or JAX.Node.");
		return this;
	}
	if (!jaxNodeBefore.exists()) { 
		console.error("JAX.DOMNode.addBefore: For second argument I expected html element, text node or JAX.Node."); 
		return this;
	}
	
	this._node.insertBefore(jaxNode.node(), jaxNodeBefore.node());
	return this;
};

/**
 * @method připne (přesune) element do jiného elementu (na konec)
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX.make("span").appendTo(document.body); // pripne span do body
 *
 * @param {Node | JAX.DOMNode | String} node DOM uzel | instance JAX.DOMNode | CSS 3 (CSS 2.1 selector pro IE8)
 * @returns {JAX.DOMNode}
 */
JAX.DOMNode.prototype.appendTo = function(node) {
	var jaxNode = JAX(node);

	if (jaxNode.exists()) { 
		jaxNode.node().appendChild(this._node);
		return this;
	}
	
	console.error("JAX.DOMNode.append: I could not find given element. For first argument I expected html element, documentFragment or JAX node.");
	return this;
};

/**
 * @method připne (přesune) element před jiný element
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX.make("span").before(document.body.lastChild); // pripne span do body pred posledni prvek v body
 *
 * @param {Node | JAX.DOMNode} node DOM uzel | instance JAX.DOMNode
 * @returns {JAX.DOMNode}
 */
JAX.DOMNode.prototype.before = function(node) {
	var jaxNode = JAX(node);

	if (jaxNode.exists()) {
		var n = jaxNode.node();
		n.parentNode.insertBefore(this._node, n);
		return this;
	}
	
	console.error("JAX.DOMNode.before: I could not find given element. For first argument I expected html element, text node or JAX node.");
	return this;
};

/**
 * @method připne (přesune) element za jiný element
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX.make("span").after(document.body.lastChild); // pripne span do body za posledni posledni prvek v body
 *
 * @param {Node | JAX.DOMNode} node DOM uzel | instance JAX.DOMNode
 * @returns {JAX.DOMNode}
 */
JAX.DOMNode.prototype.after = function(node) {
	var jaxNode = JAX(node);

	if (jaxNode.exists()) {
		var n = jaxNode.node();

		if (n.nextSibling) {
			n.parentNode.insertBefore(this._node, n.nextSibling);
		} else {
			n.parentNode.appendChild(this._node);
		}
		
		return this;
	}
	
	console.error("JAX.DOMNode.after: I could not find given element. For first argument I expected html element, text node or JAX node.");
	return this;
};

/**
 * @method odstraní zadaný element z DOMu a nahradí ho za sebe
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX.make("span.novy").replaceWith(document.body.lastChild); // odstrani prvek a nahradi ho za sebe
 *
 * @param {Node | JAX.DOMNode} node DOM uzel | instance JAX.DOMNode
 * @returns {JAX.DOMNode}
 */
JAX.DOMNode.prototype.replaceWith = function(node) {
	var jaxNode = JAX(node);

	if (jaxNode.exists()) { 
		var n = jaxNode.node();
		n.parentNode.replaceChild(this._node, n);
		return this;
	}

	console.error("JAX.DOMNode.replaceWith: For first argument I expected html element, text node or JAX node.");
	return this;
};

JAX.DOMNode.prototype.swapPlaceWith = function(node) {
	var jaxNode = JAX(node);

	if (jaxNode.exists()) { 
		var targetNode = jaxNode.node();
		var targetSiblingNode = targetNode.nextSibling; 
		var targetParentNode = targetNode.parentNode;
		var parent = this._node.parentNode;

		if (parent) {
			this._node.parentNode.replaceChild(targetNode, this._node);
		} else if (targetParentNode) {
			jaxNode.remove();
		}

		if (targetParentNode) {
			if (targetSiblingNode) {
				targetParentNode.insertBefore(this._node, targetSiblingNode);
			} else {
				targetParentNode.appendChild(this._node);
			}
		}

		return this;
	}

	console.error("JAX.DOMNode.swapPlaceWith: For first argument I expected html element, text node or JAX node.");
	return this;
};

/**
 * @method odstraní element z DOMu
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX(document.body.firstChild).remove(); // pripne span do body pred posledni prvek v body
 *
 * @returns {JAX.DOMNode}
 */
JAX.DOMNode.prototype.remove = function() {
	if (this._node.parentNode) {
		this._node.parentNode.removeChild(this._node);
		return this;
	}

	console.error("JAX.DOMNode.remove: I can not remove node with no parentNode.");
	return this;
};

/**
 * @method naklonuje element i vrátí novou instanci JAX.DOMNode
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX(document.body.firstChild).clone(true); // naklonuje element span i s textem Ahoj svete!
 *
 * @param {Boolean} withContent true, pokud se má naklonovat i obsah elementu
 * @returns {JAX.DOMNode}
 */
JAX.DOMNode.prototype.clone = function(withContent) {
	var clone = this._node.cloneNode(!!withContent);

	return new this.constructor(clone);
};

/**
 * @method získá nebo nastaví vlastnost nodu
 *
 * @param {String || Array || Object} property název vlastnosti | pole názvů vlastností | asociativní pole, např. {id:"mojeId", checked:true}
 * @param {} value nastavená hodnota
 * @returns {String || Object || JAX.DOMNode}
 */
JAX.DOMNode.prototype.prop = function(property, value) {
	var argLength = arguments.length;

	if (argLength == 1) {
		if (typeof(property) == "string") {
			return this._node[property]; 
		} else if (typeof(property) == "object") {
			for (var p in property) {
				this._node[p] = property[p];
			}
			return this;
		} else if (property instanceof Array) {
			var props = {};
			for (var i=0, len=property.length; i<len; i++) { 
				var p = property[i];
				props[p] = this._node[p];
			}
			return props;
		}
	}

	if (argLength == 2) {
		if (typeof(property) == "string") {
			this._node[property] = value;
			return this;
		} else if (property instanceof Array) {
			for (var i=0, len=property.length; i<len; i++) { 
				this._node[property[i]] = value;
			}
			return this;
		}
	}

	console.error("JAX.DOMNode.prop: Unsupported arguments: ", arguments);
	return this;
};

/** 
 * @method zjistí, jestli element obsahuje node podle zadaných kritérií
 * @example
 * document.body.innerHTML = "<div><span>1</span><span>2<em>3</em></span></div>";
 * if (JAX("em").isIn("span")) { alert("Span obsahuje em"); }
 *
 * @param {Node | JAX.DOMNode | String} node uzel | instance JAX.DOMNode | CSS3 (2.1) selector
 * @returns {Boolean}
 */
JAX.DOMNode.prototype.isIn = function(node) {
	if (!node) { return false; }

	if (typeof(node) == "string") {
		if (/^[#.a-z0-9_-]+$/ig.test(node)) {
			return !!JAK.DOM.findParent(this._node, node);
		}
		return !!JAX.all(node).filterItems(jaxElm.contains.bind(this, this)).length;
	}

	var jaxNode = node instanceof JAX.Node ? node : JAX(node);
	return jaxNode.exists() && jaxNode.contains(this);
};

/** 
 * @method zjistí, jestli element obsahuje node podle zadaných kritérií
 * @example
 * document.body.innerHTML = "<div><span>1</span><span>2</span><em>3</em></div>";
 * if (JAX("body").first().contains("em")) { alert("Obsahuje em"); }
 *
 * @param {Node | JAX.Node | String} node uzel | instance JAX.Node | CSS3 (2.1) selector
 * @returns {Boolean}
 */
JAX.DOMNode.prototype.contains = function(node) {
	if (!node) { return false; }

	if (typeof(node) == "string") {
		return !!this.find(node).exists();
	}

	var jaxNode = node instanceof JAX.Node ? node : JAX(node);
	if (jaxNode.exists()) { 
		var n = jaxNode.node();
		if (this._node.contains) {
			return this._node.contains(n);
		} else {
			return this._contains(n);
		}
	}
	
	console.error("JAX.Element.contains: For first argument I expected html element, text node, string with CSS3 compatible selector or JAX.Node.");
	return false;
};

/** 
 * @method vrací rodičovský prvek
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span>");
 * console.log(JAX("body span").parent() == body);
 *
 * @returns {JAX.DOMNode | null}
 */
JAX.DOMNode.prototype.parent = function(selector) {
	if (selector && typeof(selector) == "string") {
		if (/^[#.a-z0-9_-]+$/ig.test(selector)) {
			return JAX(JAK.DOM.findParent(this._node, selector));
		}
	}
	
	return JAX(this._node.parentNode);
};

/** 
 * @method vrací následující prvek nebo null, pokud takový není
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span><em>Takze dobry vecer!</em>");
 * if (JAX("body span").next()) { console.log("tag SPAN ma souseda"); }
 *
 * @returns {JAX.DOMNode | null}
 */
JAX.DOMNode.prototype.next = function() {
	return JAX(this._node.nextSibling);
};

/** 
 * @method vrací předcházející prvek nebo null, pokud takový není
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span><em>Takze dobry vecer!</em>");
 * if (JAX("body em").previous()) { console.log("tag EM ma souseda"); }
 *
 * @returns {JAX.DOMNode | null}
 */
JAX.DOMNode.prototype.previous = function() {
	return JAX(this._node.previousSibling);
};
