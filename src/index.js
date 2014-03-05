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
		this.target(params.target);
	}

	// Logging element
	if (params.element) {
		this.element(params.element);
	}

	// Enabled
	if (params.enabled !== undefined) {
		this._enabled = params.enabled;
	}

	// Set a class on the body
	if (this._enabled) {
		this.enable();
	}
}


/**
 * Log levels
 * @type {Array}
 */
var logLevels = {
		'error': 1,
		'warn': 2,
		'debug': 4,
		'info': 8,
		'log': 16
	};


/**
 * Prototype methods
 */
Loggier.prototype = {

	/**
	 * Constructor
	 * @type {Function}
	 */
	constructor: Loggier,


	/**
	 * Is logging enabled?
	 * @type {Boolean}
	 */
	_enabled: true,


	/**
	 * The logging target
	 * @type {String}
	 */
	_targetId: 'console',


	/**
	 * Possible logging targets
	 * @type {Object}
	 */
	_targets: {
		'console': new ConsoleTarget(),
		'element': new ElementTarget()
	},


	/**
	 * Class name for the body when we're enabled
	 * @type {String}
	 */
	_enabledClassName: 'loggier-enabled',


	/**
	 * Stack parser helper
	 * @type {Object}
	 */
	_stackParser: new StackParser(),


	/**
	 * Log levels
	 * @type {Object}
	 */
	_logLevels: logLevels,


	/**
	 * The current log level
	 * @type {Number}
	 */
	_logLevel: logLevels.error | logLevels.warn | logLevels.debug | logLevels.log | logLevels.info,


	/**
	 * Does the actual writing
	 * @param {Array} args
	 * @param {String} method
	 */
	_write: function (args, method) {

		// Don't log if we're not enabled
		if (!this._enabled || !(this._logLevel & (this._logLevels[method] || this._logLevels['log']))) {
			return;
		}

		// Table logging doesn't like extra data
		if (method !== 'table') {

			// File info to append
			var info = this._stackParser.getInfo();

			// Append the info
			args.push(this._buildStackInfoString(info));
		}

		// Write method based on target
		return this.target().write(args, method);
	},


	/**
	 * Build a string of stack info
	 * @param {Object} params
	 * @return {String}
	 */
	_buildStackInfoString: function (params) {

		// console.log(__filename, params);
		return params.method + '@' + params.file + ':' + params.line + (params.character !== undefined ? ':' + params.character : '');
	},


	/**
	 * Add a class to the body to reflect the enabled state
	 */
	_addBodyClass: function () {

		var className = document.body.className,
			present = className.indexOf(this._enabledClassName);

		if (present === -1) {
			className = className + ' ' + this._enabledClassName;
			document.body.className = className.replace(/^\s+|\s+$/g,'');
		}
	},


	/**
	 * Remove a class from the body to reflect the disabled state
	 */
	_removeBodyClass: function () {

		var className = document.body.className,
			present = className.indexOf(this._enabledClassName);

		console.log(present);
		if (present !== -1) {
			className = className.replace(this._enabledClassName, '', 'gi');
			document.body.className = className;
		}
	},


	/**
	 * Set or get the current target
	 * @param {String} name
	 * @return {Object}
	 */
	target: function (name) {

		if (name !== undefined && this._targets.hasOwnProperty(name)) {
			this._targetId = name;
		}

		return this._targets[this._targetId];
	},


	/**
	 * Set or get the element
	 * @param {Object} el
	 * @return {Object}
	 */
	element: function (el) {

		if (this._targetId === 'element') {

			if (el !== undefined) {
				return this.target().element(el);
			}

			return this.target().element();
		}
	},


	/**
	 * Set or get the log level
	 * @param {String} levelName
	 * @return {Number}
	 */
	logLevel: function (levelName) {

		// Get the level
		if (levelName === undefined) {
			return this._logLevel;
		}


		// Set the level
		var key,
			level = this._logLevels[levelName],
			mask = 0,
			curLevel;
		for (key in this._logLevels) {
			curLevel = this._logLevels[key];
			if (curLevel <= level) {
				mask = mask | curLevel;
			}
		}

		return this._logLevel = level;
	},


	/**
	 * Enable logging
	 */
	enable: function () {

		this._enabled = true;
		this._addBodyClass();
	},


	/**
	 * Disable logging
	 */
	disable: function () {

		this._enabled = false;
		this._removeBodyClass();
	},


	/**
	 * Log tabular data
	 */
	log: function () {

		return this._write(Array.prototype.slice.call(arguments, 0), 'log');
	},


	/**
	 * Log tabular data
	 */
	error: function () {

		return this._write(Array.prototype.slice.call(arguments, 0), 'error');
	},


	/**
	 * Log tabular data
	 */
	warn: function () {

		return this._write(Array.prototype.slice.call(arguments, 0), 'warn');
	},


	/**
	 * Log tabular data
	 */
	info: function () {

		return this._write(Array.prototype.slice.call(arguments, 0), 'info');
	},


	/**
	 * Log tabular data
	 */
	debug: function () {

		return this._write(Array.prototype.slice.call(arguments, 0), 'debug');
	},


	/**
	 * Log tabular data
	 */
	table: function () {

		return this._write(Array.prototype.slice.call(arguments, 0), 'table');
	}
};


module.exports = Loggier;