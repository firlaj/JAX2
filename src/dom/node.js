/**
 * @fileOverview node.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.1
 */

/**
 * Obecná třída reprezentující základ JAXovských elementů
 * @class JAX.Node
 */
JAX.Node = JAK.ClassMaker.makeClass({
	NAME: "JAX.Node",
	VERSION: "2.0"
});

/**
 * @param {object} HTMLElement | Text | HTMLDocument | Window
 */
JAX.Node.prototype.$constructor = function(node) {
	// verejne atributy
	this.n = node; 
	this.jaxNodeType = node && node.nodeType ? node.nodeType : 0;

	this.isWindow = false;
	this.isNull = false
	this.isElement = false;
	this.isText = false;
	this.isDocument = false;
	this.isDocumentFragment = false;

	this.isMoveable = false;
	this.isRemoveable = false;
	this.canHaveChildren = false;
	this.isSearchable = false;
	this.isListenable = false;
	this.isScrollable = false;

	// privatni atribut
	this._node = node;

	// nastavime flagy podle nodeType
	if (this.jaxNodeType) {
		this._setFlags();
	}
};

JAX.Node.prototype.$destructor = function() {
	this.n = null;
	tbis._node = null;
	this.jaxNodeType = 0;
};

/**
 * @method vrací uzel, který si instance drží
 *
 * @returns {object} HTMLElement | Text | HTMLDocument | Window
 */
JAX.Node.prototype.node = function() {
	return this._node;
};

/**
 * @method zjišťuje, zda-li je obsah platný nebo nikoliv.
 *
 * @returns {boolean}
 */
JAX.Node.prototype.exists = function() {
	return !!this._node;
};

/**
 * @method získá nebo nastaví vlastnost nodu
 *
 * @param {string || array || object} property název vlastnosti | pole názvů vlastností | asociativní pole, např. {id:"mojeId", checked:true}
 * @param {} value nastavená hodnota
 * @returns {string || object}
 */
JAX.Node.prototype.prop = function(property, value) {
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

	console.error("JAX.MoveableNode.prop: Unsupported arguments: ", arguments);
	return this;
};

JAX.Node.prototype._setFlags = function() {
	this.isWindow = this.jaxNodeType == -2;
	this.isNull = this.jaxNodeType == -1;
	this.isElement = this.jaxNodeType == 1;
	this.isText = this.jaxNodeType == 3 || this.jaxNodeType == 8;
	this.isDocument = this.jaxNodeType == 9;
	this.isDocumentFragment = this.jaxNodeType == 11;

	this.isSearchable = this.isElement || this.isDocument || this.isDocumetFragment || this.isNull;
	this.isListenable = this.isElement || this.isDocument || this._isWindow || this.isNull;
	this.isScrollable = this.isListenable;
	this.isMoveable = this.isElement || this.isText || this.isDocumetFragment || this.isNull;
	this.isRemoveable = this.isElement || this.isText || this.isNull;
	this.canHaveChildren = this.isElement || this.isDocumentFragment || this.isNull;
};
