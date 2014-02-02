/**
 * @fileOverview fx-scrolling.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Pomocník pro animaci scrollování
 * @class JAX.FX
 */ 
JAX.FX.Scrolling = JAK.ClassMaker.makeClass({
	NAME: "JAX.FX.Scrolling",
	VERSION: "1.0"
});

/**
 * @constructor
 *
 * @param {object} elm HTMLElement || JAX.Node
 */
JAX.FX.Scrolling.prototype.$constructor = function(jaxElm) {
	this._jaxElm = JAX(jaxElm);
	this._settings = [];
	this._promises = {
		animationFinished: null
	};
	this._maxDuration = 0;
	this._startTime = 0;
	this._currentTime = 0;
	this._interpolators = [];
	this._runningInterpolatorCount = 0;
	this._reversed = false;
	this._isRunning = false;
	this._onScrollingFinished = this._onScrollingFinished.bind(this);
};

/**
 * @method přidá atribut pro scrollování, který se bude animovat. Pro každou vlastnost lze zadat různou délku animace.
 * @param {string} property "left" nebo "top" pro scrollLeft respektive scrollTop
 * @param {number} value koncová hodnota v px
 * @param {number} duration délka animace v ms
 * @returns {object} JAX.FX.Scrolling
 */
JAX.FX.Scrolling.prototype.addProperty = function(property, value, duration) {
	if (property != "left" && property != "top") {
		console.error("JAX.FX.Scrolling: You are trying to use unsupported property: " + property + ".", this._jaxElm.node());
		return this;
	}

	if (!isFinite(parseFloat(duration))) {
		console.error("JAX.FX.Scrolling: Duration must be number! You gave me " + typeof(duration) + ".", this._jaxElm.node());
		return this;
	}

	this._settings.push({property:property, defValue: null, value:value, duration:duration});
	this._maxDuration = Math.max(this._maxDuration, duration);
	return this;
};

/**
 * @method spustí animaci
 *
 * @returns {object} JAK.Promise
 */
JAX.FX.Scrolling.prototype.run = function() {
	if (this._promises.animationFinished) { 
		return this._promises.animationFinished; 
	}

	this._promises.animationFinished = new JAK.Promise();
	this._runningInterpolatorCount = 0;

	for (var i=0, len=this._settings.length; i<len; i++) {
		var setting = this._settings[i];
		var defValue = this._jaxElm.scroll(setting.property);
		setting.defValue = defValue;
		this._startInterval(setting.property, setting.value, setting.duration);
	}

	this._isRunning = true;
	this._reversed = false;
	this._startTime = new Date().getTime();

	return this._promises.animationFinished;
};

/**
 * @method funkce, která se zavolá, jakmile animace skončí. V případě prvního parametru se jedná o úspěšné dokončení, v případě druhého o chybu.
 *
 * @param {function} onFulfill funkce, která se zavolá po úspěšném ukončení animace
 * @param {function} onReject funkce, která se zavolá, pokud se animaci nepodaří provést
 * @returns {object} JAK.Promise
 */ 
JAX.FX.Scrolling.prototype.then = function(onFulfill, onReject) {
	return this._promises.animationFinished.then(onFulfill, onReject);
};

/**
 * @method stopne animaci, hodnoty zůstanou nastavené v takovém stavu, v jakém se momentálně nacházejí při zavolání metody
 * 
 * @returns {object} JAX.FX.Scrolling
 */
JAX.FX.Scrolling.prototype.stop = function() {
	if (!this._isRunning) { return this; }

	while(this._runningInterpolatorCount) {
		this._onScrollingFinished();
	}
	
	return this;
};

/**
 * @method stopne animaci a spustí její zpětný chod
 *
 * @returns {object} JAK.Promise
 */
JAX.FX.Scrolling.prototype.reverse = function() {
	if (this._isRunning) {
		this.stop();
	}

	this._reversed = !this._reversed;
	this._promises.animationFinished = new JAK.Promise();
	this._runningInterpolatorCount = 0;

	for (var i=0, len=this._settings.length; i<len; i++) {
		var setting = this._settings[i];
		var duration = this._reversed ? Math.min(setting.duration, this._currentTime) : Math.max(setting.duration - this._currentTime, 0);
		this._startInterval(setting.property, this._reversed ? setting.defValue : setting.value, duration);
	}

	this._isRunning = true;
	this._startTime = new Date().getTime();

	return this._promises.animationFinished;
};

/**
 * @method zjistí, jestli animace právě běží
 * 
 * @returns {boolean}
 */
JAX.FX.Scrolling.prototype.isRunning = function() {
	return this._isRunning;
};

JAX.FX.Scrolling.prototype._startInterval = function(property, value, duration) {
	var property = property;
	var defValue = this._jaxElm.scroll(property);

	var scrollFunc = function(value) {
		this._jaxElm.scroll(property, value);
	}.bind(this);

	var interpolator = new JAK.Interpolator(defValue, value, duration, scrollFunc, {endCallback:this._onScrollingFinished});
		interpolator.start();

	this._interpolators.push(interpolator);
	this._runningInterpolatorCount++;
};

JAX.FX.Scrolling.prototype._onScrollingFinished = function() {
	this._runningInterpolatorCount--;
	if (this._runningInterpolatorCount) { return; }
	this._interpolators = [];

	var passedTime = new Date().getTime() - this._startTime;

	if (!this._reversed) {
		this._currentTime += passedTime;
		this._currentTime = Math.min(this._currentTime, this._maxDuration);
	} else {
		this._currentTime -= passedTime;
		this._currentTime = Math.max(this._currentTime, 0);
	}

	this._startTime = 0;
	this._isRunning = false;

	this._promises.animationFinished.fulfill(this._jaxElm);
	this._promises.animationFinished = null;
};
