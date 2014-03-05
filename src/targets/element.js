/**
 * Constructor
 * @param {Object} params
 */
function ElementTarget (params) {

}


/**
 * Prototype methods
 */
ElementTarget.prototype = {

	/**
	 * Constructor
	 * @type {Function}
	 */
	constructor: ElementTarget,


	/**
	 * The element to log to
	 * @type {Mixed}
	 */
	_element: undefined,


	/**
	 * Build a string to log out
	 * @param {Object} params
	 * @return {String}
	 */
	_buildLogString: function (params) {

		var str = '',
			len = params.length,
			i = 0;

		for (i; i < len; i+=1) {
			str += params[i] + ' ';
		}

		return str.slice(0, -1);
	},


	/**
	 * Write a log to an element
	 */
	_log: function () {

		// Make sure we have an element
		if (!this._checkElement()) {
			return;
		}

		// New element
		var el = document.createElement('div');

		// Set properties
		el.className = 'log';
		el.innerHTML = this._buildLogString(arguments);

		// Add the log
		this._element.appendChild(el);
	},


	/**
	 * Write an error to an element
	 * @param {Array} args
	 */
	_error: function (args) {

		// Make sure we have an element
		if (!this._checkElement()) {
			return;
		}

		// New element
		var el = document.createElement('div');

		// Set properties
		el.className = 'log error';
		el.innerHTML = this._buildLogString(arguments);

		// Add the log
		this._element.appendChild(el);
	},


	/**
	 * Write a warning to an element
	 * @param {Array} args
	 */
	_warn: function (args) {

		// Make sure we have an element
		if (!this._checkElement()) {
			return;
		}

		// New element
		var el = document.createElement('div');

		// Set properties
		el.className = 'log warn';
		el.innerHTML = this._buildLogString(arguments);

		// Add the log
		this._element.appendChild(el);
	},


	/**
	 * Write info to an element
	 * @param {Array} args
	 */
	_info: function (args) {

		// Make sure we have an element
		if (!this._checkElement()) {
			return;
		}

		// New element
		var el = document.createElement('div');

		// Set properties
		el.className = 'log info';
		el.innerHTML = this._buildLogString(arguments);

		// Add the log
		this._element.appendChild(el);
	},


	/**
	 * Write a debug to an element
	 * @param {Array} args
	 */
	_debug: function (args) {

		// Make sure we have an element
		if (!this._checkElement()) {
			return;
		}

		// New element
		var el = document.createElement('div');

		// Set properties
		el.className = 'log debug';
		el.innerHTML = this._buildLogString(arguments);

		// Add the log
		this._element.appendChild(el);
	},


	/**
	 * Write a table to an element
	 * @param {Array} args
	 */
	_table: function (args) {

		// Make sure we have an element
		if (!this._checkElement()) {
			return;
		}

		// New element
		var el = document.createElement('div');

		// Set properties
		el.className = 'log table';
		el.innerHTML = this._buildLogString(arguments);

		// Add the log
		this._element.appendChild(el);
	},


	/**
	 * Check that there is an element and create if we don't have one
	 */
	_checkElement: function () {

		// Return the element if we have it
		if (this._element) {
			return this._element;
		}

		// Try to create
		return this._createElement();
	},


	/**
	 * Create an element to write to and try to add it to the body
	 */
	_createElement: function () {

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

		return this._element;
	},


	/**
	 * Write to the element
	 * @param {Array} args
	 * @param {String} method
	 */
	write: function (args, method) {

		// Make sure we have an element
		if (!this._checkElement()) {
			return;
		}

		// The method name
		var methodName = '_' + method,
			defaultMethodName = '_log';

		// If there is no method, revert to default
		if (!this[methodName]) {

			methodName = defaultMethodName;
		}

		// Call the method
		this[methodName](args);

		return args;
	},


	/**
	 * Set the element we'll write to
	 * @param {Object} el
	 */
	element: function (el) {

		if (el !== undefined) {
			this._element = el;
		}

		return this._element;
	}
};


module.exports = ElementTarget;