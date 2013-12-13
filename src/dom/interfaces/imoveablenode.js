/**
 * @fileOverview imoveablenode.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Rozhraní pro nody, kterými jde manipulovat v rámci DOMu
 * @class JAX.IMoveableNode
 */
JAX.IMoveableNode = JAK.ClassMaker.makeInterface({
	NAME: "JAX.IMoveableNode",
	VERSION: "1.0"
});

/**
 * @method přesune element na konec zadaného elementu
 *
 * @param {string || object} node řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {object} JAX.Node
 */
JAX.IMoveableNode.prototype.appendTo = function(node) {
	var jaxNode = node instanceof JAX.Node ? node : JAX(node);

	if (jaxNode.n) { 
		jaxNode.n.appendChild(this._node);
		return this;
	}
	
	console.error("JAX.IMoveableNode.append: I could not find given element. For first argument I expected html element, documentFragment or JAX node.");
	return this;
};

/**
 * @method přesune element před zadaný element
 *
 * @param {string || object} node řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {object} JAX.Node
 */
JAX.IMoveableNode.prototype.before = function(node) {
	var jaxNode = node instanceof JAX.Node ? node : JAX(node);

	if (jaxNode.n) {
		var n = jaxNode.n;
		n.parentNode.insertBefore(this._node, n);
		return this;
	}
	
	console.error("JAX.IMoveableNode.before: I could not find given element. For first argument I expected html element, text node or JAX node.");
	return this;
};

/**
 * @method přesune element za zadaný element
 *
 * @param {string || object} node řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {object} JAX.Node
 */
JAX.IMoveableNode.prototype.after = function(node) {
	var jaxNode = node instanceof JAX.Node ? node : JAX(node);

	if (jaxNode.n) {
		var n = jaxNode.n;

		if (n.nextSibling) {
			n.parentNode.insertBefore(this._node, n.nextSibling);
		} else {
			n.parentNode.appendChild(this._node);
		}
		
		return this;
	}
	
	console.error("JAX.IMoveableNode.after: I could not find given element. For first argument I expected html element, text node or JAX node.");
	return this;
};

/**
 * @method vloží element do zadaného elementu na první místo
 *
 * @param {string || object} node řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {object} JAX.Node
 */
JAX.IMoveableNode.prototype.insertFirstTo = function(node) {
	var jaxNode = node instanceof JAX.Node ? node : JAX(node);

	if (jaxNode.n) {
		var n = jaxNode.n;

		if (n.childNodes && n.firstChild) {
			n.insertBefore(this._node, n.firstChild);
		} else if (n.childNodes) {
			n.appendChild(this._node);
		} else {
			console.error("JAX.IMoveableNode.insertFirstTo: Given element can not have child nodes.", this._node);
		}

		return this;
	}

	console.error("JAX.IMoveableNode.insertFirstTo: I could not find given element. For first argument I expected html element or JAX node.");
	return this;
};

/**
 * @method vymění element za zadaný element v DOMu a původní element z DOMu smaže
 *
 * @param {string || object} node řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {object} JAX.Node
 */
JAX.IMoveableNode.prototype.replaceWith = function(node) {
	var jaxNode = node instanceof JAX.Node ? node : JAX(node);

	if (jaxNode.n) { 
		var n = jaxNode.n;
		n.parentNode.replaceChild(this._node, n);
		return this;
	}

	console.error("JAX.IMoveableNode.replaceWith: For first argument I expected html element, text node or JAX node.");
	return this;
};

/**
 * @method vymění element za zadaný element v DOMu, prohodí si místa
 *
 * @param {string || object} node řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {object} JAX.Node
 */
JAX.IMoveableNode.prototype.swapPlaceWith = function(node) {
	var jaxNode = node instanceof JAX.Node ? node : JAX(node);

	if (jaxNode.n) { 
		var targetNode = jaxNode.n;
		var targetSiblingNode = targetNode.nextSibling; 
		var targetParentNode = targetNode.parentNode;
		var thisParent = this._node.parentNode;
		var thisSiblingNode = this._node.nextSibling;

		this.remove();
		jaxNode.remove();

		if (thisParent) {
			if (thisSiblingNode) {
				thisParent.insertBefore(targetNode, thisSiblingNode);
			} else {
				thisParent.appendChild(targetNode);
			}
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

	console.error("JAX.IMoveableNode.swapPlaceWith: For first argument I expected html element, text node or JAX node.");
	return this;
};

/**
 * @method odstraní element z DOMu
 *
 * @returns {object} JAX.Node
 */
JAX.IMoveableNode.prototype.remove = function() {
	if (this._node.parentNode && this._node.parentNode.nodeType != 11) {
		this._node.parentNode.removeChild(this._node);
		return this;
	}

	console.error("JAX.IMoveableNode.remove: I can not remove node with no parentNode.");
	return this;
};

/**
 * @method naklonuje element a vrátí ho jako JAXový node
 *
 * @param {boolean} withContent mám naklonovat včet obsahu včetně obsahu
 * @returns {object} JAX.Node
 */
JAX.IMoveableNode.prototype.clone = function(withContent) {
	var clone = this._node.cloneNode(!!withContent);
	
	return new this.constructor(clone);
};

/**
 * @method zjistí, jestli je element umístěn v zadaném elementu
 *
 * @param {string || object} node řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {boolean}
 */
JAX.IMoveableNode.prototype.isIn = function(node) {
	if (!node) { return false; }

	if (typeof(node) == "string") {
		if (/^[#.a-z0-9_-]+$/ig.test(node)) {
			return !!JAK.DOM.findParent(this._node, node);
		}
		return !!JAX.all(node).filterItems(jaxElm.contains.bind(this, this)).length;
	}

	var jaxNode = node instanceof JAX.Node ? node : JAX(node);
	return jaxNode.n && jaxNode.contains(this);
};

/**
 * @method bez zadaného parametru vrací přímo rodiče; se zadaným zjednodušeným css selectorem vrací rodiče, který jako první odpovídá pravidlu
 *
 * @param {string || object} selector řetězec splňující pravidla: tag#id.trida, kde id a třída mohou být zadány vícenásobně nebo vůbec | HTMLElement | JAX.Node
 * @returns {boolean}
 */
JAX.IMoveableNode.prototype.parent = function(selector) {
	if (selector && typeof(selector) == "string") {
		if (/^[#.a-z0-9_-]+$/ig.test(selector)) {
			var node = JAK.DOM.findParent(this._node, selector);
			return node ? JAX(node) : null;
		}
	}
	
	var jaxNode = JAX(this._node.parentNode);
	return jaxNode.n ? jaxNode : null;
};

/** 
 * @method vrací následující node
 *
 * @returns {object || null} JAX.Node
 */
JAX.IMoveableNode.prototype.next = function() {
	var jaxNode = JAX(this._node.nextSibling)
	return jaxNode.n ? jaxNode : null;
};

/** 
 * @method vrací předchazející node
 *
 * @returns {object || null} JAX.Node
 */
JAX.IMoveableNode.prototype.previous = function() {
	var jaxNode = JAX(this._node.previousSibling);
	return jaxNode.n ? jaxNode : null;
};
