var ConsoleTarget = require('./targets/console'),
	ElementTarget = require('./targets/element'),
	StackParser = require('./helpers/stack-parser');

/**
 * Constructor
 * @param {Object} params
 */
function Loggier (params) {

	params = params || {};

	// Target
	if (params.target) {
		this.setTarget(params.target);
	}

	// Logging element
	if (params.element) {
		this.setElement(params.element);
	}
}
Loggier.prototype.constructor = Loggier;


/**
 * Is logging enabled?
 * @type {Boolean}
 */
Loggier.prototype._enabled = true;


/**
 * The logging target
 * @type {String}
 */
Loggier.prototype._targetId = 'console';


/**
 * Possible logging targets
 * @type {Object}
 */
Loggier.prototype._targets = {
	'console': new ConsoleTarget(),
	'element': new ElementTarget()
};


/**
 * Stack parser helper
 * @type {Object}
 */
Loggier.prototype._stackParser = new StackParser();


/**
 * Does the actual writing
 * @param {Array} args
 * @param {String} method
 */
Loggier.prototype._write = function (args, method) {

	// Don't log if we're not enabled
	if (!this._enabled) {
		return;
	}

	// Table logging doesn't like extra data
	if (method !== 'table') {

		// File info to append
		var info = this._stackParser.getInfo();

		// Append the info
		args = args.concat(this._buildStackInfoString(info));
	}

	// Write method based on target
	return this.getTarget().write(args, method);
};


/**
 * Build a string of stack info
 * @param {Object} params
 * @return {String}
 */
Loggier.prototype._buildStackInfoString = function (params) {

	return '(' + params.method + '@' + params.file + ':' + params.line + (params.character !== undefined ? ':' + params.character : '') + ')';
};


/**
 * Get the current target
 * @return {Object}
 */
Loggier.prototype.getTarget = function () {

	if (this._targets.hasOwnProperty(this._targetId)) {
		return this._targets[this._targetId];
	}
};


/**
 * Set the current target
 * @param {String} name
 */
Loggier.prototype.setTarget = function (name) {

	if (this._targets.hasOwnProperty(name)) {
		this._targetId = name;
	}
};


/**
 * Set the element
 * @param {Object} el
 */
Loggier.prototype.setElement = function (el) {

	if (this._targetId === 'element') {
		this.getTarget().setElement(el);
	}
};


/**
 * Enable logging
 */
Loggier.prototype.enable = function () {

	this._enabled = true;
};


/**
 * Disable logging
 */
Loggier.prototype.disable = function () {

	this._enabled = false;
};


/**
 * Log tabular data
 */
Loggier.prototype.log = function () {

	return this._write(Array.prototype.slice.call(arguments, 0), 'log');
};


/**
 * Log tabular data
 */
Loggier.prototype.error = function () {

	return this._write(Array.prototype.slice.call(arguments, 0), 'error');
};


/**
 * Log tabular data
 */
Loggier.prototype.warn = function () {

	return this._write(Array.prototype.slice.call(arguments, 0), 'warn');
};


/**
 * Log tabular data
 */
Loggier.prototype.info = function () {

	return this._write(Array.prototype.slice.call(arguments, 0), 'info');
};


/**
 * Log tabular data
 */
Loggier.prototype.debug = function () {

	return this._write(Array.prototype.slice.call(arguments, 0), 'debug');
};


/**
 * Log tabular data
 */
Loggier.prototype.table = function () {

	return this._write(Array.prototype.slice.call(arguments, 0), 'table');
};


module.exports = Loggier;