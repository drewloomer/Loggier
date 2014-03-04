/**
 * Constructor
 * @param {Object} params
 */
function ElementTarget (params) {

}
ElementTarget.prototype.constructor = ElementTarget;


/**
 * The element to log to
 * @type {Mixed}
 */
ElementTarget.prototype._element = undefined;


/**
 * Build a string to log out
 * @param {Object} params
 * @return {String}
 */
ElementTarget.prototype._buildLogString = function (params) {

	var str = '',
		len = params.length,
		i = 0;

	for (i; i < len; i+=1) {
		str += params[i] + ' ';
	}

	return str.slice(0, -1);
};


/**
 * Write a log to an element
 */
ElementTarget.prototype._log = function () {

	// If we don't have an element yet, create one
	if (!this._element) {
		this._createElement();
	}

	// New element
	var el = document.createElement('div');

	// Set properties
	el.className = 'log';
	el.innerHTML = this._buildLogString(arguments);

	// Add the log
	this._element.appendChild(el);
};


/**
 * Write an error to an element
 * @param {Array} args
 */
// ElementTarget.prototype._error = function (args) {

// };


/**
 * Write a warning to an element
 * @param {Array} args
 */
// ElementTarget.prototype._warn = function (args) {

// };


/**
 * Write info to an element
 * @param {Array} args
 */
// ElementTarget.prototype._info = function (args) {

// };


/**
 * Write a debug to an element
 * @param {Array} args
 */
// ElementTarget.prototype._debug = function (args) {

// };


/**
 * Write a table to an element
 * @param {Array} args
 */
// ElementTarget.prototype._table = function (args) {

// };


/**
 * Create an element to write to and try to add it to the body
 */
ElementTarget.prototype._createElement = function () {

	// If there is no window object, we're SOL
	if (!document) {
		return;
	}

	// Create the element
	this._element = document.createElement('div');

	// Set element properties
	this._element.className = 'loggier';

	// Append it to the document
	document.body.insertBefore(this._element, document.body.firstChild);
};


/**
 * Write to the element
 * @param {Array} args
 * @param {String} method
 */
ElementTarget.prototype.write = function (args, method) {

	// If we don't have an element yet, create one
	if (!this._element) {
		this._createElement();
	}


	// Make sure there really is an element
	if (this._element) {

		// The method name
		var methodName = '_element' + method.charAt(0).toUpperCase(),
			defaultMethodName = '_elementLog';

		// If there is no method, revert to default
		if (!this[methodName]) {

			methodName = defaultMethodName;
		}

		// Call the method
		this[methodName](args);

		return args;
	}
};


/**
 * Set the element we'll write to
 * @param {Object} el
 */
ElementTarget.prototype.setElement = function (el) {

	this._element = el;
};


module.exports = ElementTarget;