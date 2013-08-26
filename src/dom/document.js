/**
 * @fileOverview documentnode.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída reprezentující document node
 * @class JAX.Document
 */
JAX.Document = JAK.ClassMaker.makeClass({
	NAME: "JAX.Document",
	VERSION: "1.0",
	IMPLEMENT: [JAX.IListening, JAX.INode]
});

JAX.Document.prototype.$constructor = function(doc) {
	this._node = doc;
	this.jaxNodeType = doc.nodeType;
};

JAX.Document.prototype.find = function(selector) {
	return JAX(selector, this._node);
};

JAX.Document.prototype.findAll = function(selector) {
	return JAX.all(selector, this._node);
};

JAX.Document.prototype.size = function(sizeType) {
	if (arguments.length > 1) {
		JAX.Report.error("I am so sorry, but you can not set " + sizeType + " of document node.", this._node);
		return this;
	}

	switch(sizeType) {
		case "width":
     		 return Math.max(
     		 			this._node.body.scrollWidth, this._node.documentElement.scrollWidth, 
     		 			this._node.body.offsetWidth, this._node.documentElement.offsetWidth, 
     		 			this._node.body.clientWidth, this._node.documentElement.clientWidth
     		 		);
		case "height":
			return Math.max(
     		 			this._node.body.scrollHeight, this._node.documentElement.scrollHeight, 
     		 			this._node.body.offsetHeight, this._node.documentElement.offsetHeight, 
     		 			this._node.body.clientHeight, this._node.documentElement.clientHeight
     		 		);
		default:
			JAX.Report.error("You gave me an unsupported size type. I expected 'width' or 'height'.", this._node);
			return 0;
	}
};

JAX.Document.prototype.fullSize = function(sizeType) {
	if (arguments.length > 1) {
		JAX.Report.error("I am so sorry, but you can not set " + sizeType + " of document node.", this._node);
		return this;
	}

	return this.size(sizeType);
};

JAX.Document.prototype.scroll = function(type, value, duration) {
	if (typeof(type) != "string") {
		JAX.Report.error("I expected String for my first argument.", this._node);
		type += "";
	}

	if (arguments.length == 1) {
		switch(type.toLowerCase()) {
			case "top":
				var retValue = this._node.documentElement.scrollTop;
			break;
			case "left":
				var retValue = this._node.documentElement.scrollLeft;
			break;
			default:
				JAX.Report.error("You gave me an unsupported type. I expected 'x' or 'y'.", this._node);
				var retValue = 0;
		}

		return retValue;
	}

	var parsedValue = parseFloat(value);

	if (!isFinite(parsedValue)) {
		JAX.Report.error("I expected Number or string with number for my second argument.", this._node);
		parsedValue = 0;
	}

	switch(type.toLowerCase()) {
		case "top":
			this._node.documentElement.scrollTop = parsedValue;
		break;
		case "left":
			this._node.documentElement.scrollLeft = parsedValue;
		break;
		default:
			JAX.Report.error("You gave me an unsupported type. I expected 'x' or 'y'.", this._node);
	}

	if (arguments.length > 2) {
		console.warn("I am sorry. Duration is not implemented yet. It will be as soon as possible.");
	}

	/*return new JAK.Promise().fulfill(this._node);*/
};
