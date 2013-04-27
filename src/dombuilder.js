JAX.DOMBuilder = JAK.ClassMaker.makeClass({
	NAME: "JAX.DOMBuilder",
	VERSION: "0.2"
});

JAX.DOMBuilder.prototype.$constructor = function(doc) {
	this._doc = doc || document;
	this._jax = { container: JAX.Node.create(document.createDocumentFragment) };
	this._pointerJaxNode = null;
	this._stack = [];
};

JAX.DOMBuilder.prototype.open = function(element, attributes, styles) {
	var jaxNode = null;

	if (typeof(element) == "string") {
		jaxNode = JAX.make(element, attributes, styles, this._doc);
	} else if (typeof(element) == "object" && element.nodeType) {
		jaxNode = JAX.$$(element);
	}

	if (jaxNode && jaxNode.jaxNodeType != 9) {
		if (!this._pointerJaxNode) {
			this._stack.push(this._pointerJaxNode);
			this._jax.container.add(jaxNode); 
		} else {
			this._pointerJaxNode.add(jaxNode);
			this._stack.push(this._pointerJaxNode);
		}
		this._pointerJaxNode = jaxNode;
		return jaxNode;
	}

	new JAX.E({funcName:"JAX.DOMBuilder.open", caller:this.open})
		.expected("first argument", "HTML Element definition compatible with JAX.make or HTML element", element)
		.show(); 
}

JAX.DOMBuilder.prototype.add = function(node, attributes, styles) {
	if (typeof(node) == "string") {
		var jaxNode = JAX.make(node, attributes, styles);
	} else if (typeof(node) == "object" && node.nodeType) {
		var jaxNode = JAX.$$(node);
		if (attributes) { jaxNode.attr(attributes); }
		if (styles) { jaxNode.style(styles); }
	} else if (!JAX.isJAXNode(node) && node.jaxNodeType == 9) {
		new JAX.E({funcName:"JAX.DOMBuilder.add", caller:this.add})
		.expected("first argument", "string, node, instance of JAX.NodeHTML, JAX.NodeText, JAX.NodeDocFrag", node)
		.show(); 
	}

	if (attributes) { jaxNode.attr(attributes); }
	if (styles) { jaxNode.styleCss(styles); }

	if (this._pointerJaxNode) {
		this._pointerJaxNode.add(jaxNode);
	} else {
		this._jax.container.add(jaxNode);
	}

	return jaxNode;
};

JAX.DOMBuilder.prototype.addText = function(txt) {
	if (typeof(txt) == "string") {
		var jaxNode = JAX.makeText(node);

		if (this._pointerJaxNode) {
			this._pointerJaxNode.add(jaxNode);
		} else {
			this._jax.container.add(jaxNode);
		}

		return jaxNode;
	}

	new JAX.E({funcName:"JAX.DOMBuilder.addText", caller:this.addText})
		.expected("first argument", "string", typeof(node))
		.show(); 
};

JAX.DOMBuilder.prototype.close = function() {
	if (this._stack.length) {
		this._pointerJaxNode = this._stack.pop();
		return;
	}

	new JAX.E({funcName:"JAX.DOMBuilder.addText", caller:this.close})
		.expected("closing", "opened element", "no opened element")
		.show(); 
};

JAX.DOMBuilder.prototype.appendTo = function(node) {
	var jaxNode = null;

	if (typeof(node) == "object" && node.nodeType) {
		var jaxNode = JAX.$$(node);
	} else if (JAX.isJAXNode(node) && node.jaxNodeType == 1) {
		var jaxNode = node;
	} else {
		new JAX.E({funcName:"JAX.DOMBuilder.appendTo", caller:this.appendTo})
		.expected("argument", "html element, instance of JAX.NodeHTML or JAX.NodeDocFrag", node)
		.show(); 
	}

	this._jax.container.appendTo(jaxNode);
};

JAX.DOMBuilder.prototype.getContainer = function() {
	return this._jax.container;
};

JAX.DOMBuilder.prototype.clear = function() {
	this._jax.container.clear();
	this._stack = [];
};

