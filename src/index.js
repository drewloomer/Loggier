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
			args = args.concat(this._buildStackInfoString(info));
		}

		// Write method based on target
		return this.getTarget().write(args, method);
	},


	/**
	 * Build a string of stack info
	 * @param {Object} params
	 * @return {String}
	 */
	_buildStackInfoString: function (params) {

		return '(' + params.method + '@' + params.file + ':' + params.line + (params.character !== undefined ? ':' + params.character : '') + ')';
	},


	/**
	 * Get the current target
	 * @return {Object}
	 */
	getTarget: function () {

		if (this._targets.hasOwnProperty(this._targetId)) {
			return this._targets[this._targetId];
		}
	},


	/**
	 * Set the current target
	 * @param {String} name
	 */
	setTarget: function (name) {

		if (this._targets.hasOwnProperty(name)) {
			this._targetId = name;
		}
	},


	/**
	 * Set the element
	 * @param {Object} el
	 */
	setElement: function (el) {

		if (this._targetId === 'element') {
			this.getTarget().setElement(el);
		}
	},


	/**
	 * Set or get the log level
	 * @param {String} levelName
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
	},


	/**
	 * Disable logging
	 */
	disable: function () {

		this._enabled = false;
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