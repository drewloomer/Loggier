/**
 * Logging abstraction to provide support for console and more
 * @param  {Object} root    The root object to append to - generally window
 * @param  {Function} factory Factory method for creating a new instance
 * @return {Function}
 */
(function (root, factory) {

	'use strict';

	// AMD.
	if (typeof define === 'function' && define.amd) {
		define([], factory);
	}
	// Common JS
	else if (typeof exports === 'object') {
		module.exports = factory();
	}
	// Browser global
	else {
		root.LoomLogger = factory();
	}
}(this, function () {

	/**
	 * Constructor
	 * @param {Object} params
	 */
	function L (params) {

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
	 * Is logging enabled?
	 * @type {Boolean}
	 */
	L.prototype._enabled = true;


	/**
	 * The logging target
	 * @type {String}
	 */
	L.prototype._target = 'console';


	/**
	 * Possible logging targets
	 * @type {Array}
	 */
	L.prototype._targets = ['console', 'element'];


	/**
	 * The element to log to if we're logging to an element
	 * @type {Mixed}
	 */
	L.prototype._element = undefined;


	/**
	 * Does the actual writing
	 * @param {Array} args
	 * @param {String} method
	 */
	L.prototype._write = function (args, method) {

		// Don't log if we're not enabled
		if (!this._enabled) {
			return;
		}

		// Table logging doesn't like extra data
		if (method !== 'table') {

			// File info to append
			var info = this._getStackInfo();

			// Append the info
			args = args.concat('[' + info.method + '@' + info.file + ':' + info.line + (info.character !== undefined ? ':' + info.character : '') + ']');
		}

		// Write method based on target
		switch (this._target) {
			case 'console':
				return this._consoleWrite(args, method);
			case 'document':
				return this._documentWrite(args, method);
			default:
				break;
		}
	};


	/**
	 * Write to the console
	 * @param {Array} args
	 * @param {String} method
	 */
	L.prototype._consoleWrite = function (args, method) {

		// Make sure there is a console
		if (console) {

			// If there is no method, revert to log
			if (!console[method]) {

				if (!console.log) {
					return;
				}
				else {
					method = 'log';
				}
			}

			if (console[method].apply) {
				console[method].apply(console, args);
			}
			else {
				console[method](args);
			}

			return args;
		}
	};


	/**
	 * Write to the document
	 * @param {Array} args
	 * @param {String} method
	 */
	L.prototype._documentWrite = function (args, method) {

	};


	/**
	 * Extract the line number from a stack trace
	 */
	L.prototype._getStackInfo = function () {

		// New error for the stack info
		var stack = this._generateStackTrace(),
			line,
			info,
			file,
			method,
			lineNumber,
			character;

		// Parse different types of traces
		if (stack.indexOf('Error') === 0) {
			return this._getStackInfoV8(stack);
		}
		else if (stack.indexOf('ReferenceError') === 0) {
			return this._getStackInfoChakra(stack);
		}
		// TODO: Nitro support
		// else if (stack.indexOf('ReferenceError') === 0) {
		// 	return this._getStackInfoChakra(stack);
		// }
		else {
			return this._getStackInfoSpiderMonkey(stack);
		}
	};


	/**
	 * Get the stack info for V8
	 * @param {String} stack
	 */
	L.prototype._getStackInfoV8 = function (stack) {

		var line = stack.split('\n')[5],
			info = line.match(/(?:at\s)(?:([^\(]{1})(?:\s\()(.*)|()()(.*)|()()(<anonymous>))(\:[0-9]{1,})(\:[0-9]{1,})/);

		// Check for an anonymous method
		if (!info) {
			return {};
		}

		var	method = info[1] || 'anonymous',
			file = info[2] || info[5],
			lineNumber = parseInt(info[9].substr(1), 10),
			character = parseInt(info[10].substr(1), 10);

		return {
			method: method,
			file: file,
			line: lineNumber,
			character: character
		};
	};


	/**
	 * Get the stack info for SpiderMonkey
	 * @param {String} stack
	 */
	L.prototype._getStackInfoSpiderMonkey = function (stack) {

		var line = stack.split('\n')[4],
			info = line.match(/([^@]{1,}|)(?:@)(.*)(\:[0-9]{1,})/);

		if (!info) {
			return {};
		}

		var	method = info[1] || 'anonymous',
			file = info[2],
			lineNumber = parseInt(info[3].substr(1), 10);

		return {
			method: method,
			file: file,
			line: lineNumber,
			character: undefined
		};
	};


	/**
	 * Get the stack info for Chakra
	 * @param {String} stack
	 */
	L.prototype._getStackInfoChakra = function (stack) {

		var line = stack.split('\n')[5],
			info = line.match(/(?:at\s)(?:([^\(]{1})(?:\s\()(.*)|()()(.*)|()()(<anonymous>))(\:[0-9]{1,})(\:[0-9]{1,})/);

		// Check for an anonymous method
		if (!info) {
			return {};
		}

		var	method = info[1] || 'anonymous',
			file = info[2] || info[5],
			lineNumber = parseInt(info[9].substr(1), 10),
			character = parseInt(info[10].substr(1), 10);

		return {
			method: method,
			file: file,
			line: lineNumber,
			character: character
		};
	};


	/**
	 * Generate a stack trace
	 * @return {String} The stack trace
	 */
	L.prototype._generateStackTrace = function () {

		var error = new Error();

		if (!error.stack) {
			try {
				is.not.func();
			}
			catch (e) {
				error = e;
			}
		}

		return error.stack;
	};


	/**
	 * Set the current target
	 * @param {String} name
	 */
	L.prototype.setTarget = function (name) {

		if (this._targets.indexOf(name) !== -1) {
			this._target = name;
		}
	};


	/**
	 * Set the element
	 * @param {Object} el
	 */
	L.prototype.setElement = function (el) {

		if (this._target === 'element') {
			this._element = el;
		}
	};


	/**
	 * Enable logging
	 */
	L.prototype.enable = function () {

		this._enabled = true;
	};


	/**
	 * Disable logging
	 */
	L.prototype.disable = function () {

		this._enabled = false;
	};


	/**
	 * Log tabular data
	 */
	L.prototype.log = function () {

		return this._write(Array.prototype.slice.call(arguments, 0), 'log');
	};


	/**
	 * Log tabular data
	 */
	L.prototype.error = function () {

		return this._write(Array.prototype.slice.call(arguments, 0), 'error');
	};


	/**
	 * Log tabular data
	 */
	L.prototype.warn = function () {

		return this._write(Array.prototype.slice.call(arguments, 0), 'warn');
	};


	/**
	 * Log tabular data
	 */
	L.prototype.info = function () {

		return this._write(Array.prototype.slice.call(arguments, 0), 'info');
	};


	/**
	 * Log tabular data
	 */
	L.prototype.debug = function () {

		return this._write(Array.prototype.slice.call(arguments, 0), 'debug');
	};


	/**
	 * Log tabular data
	 */
	L.prototype.table = function () {

		return this._write(Array.prototype.slice.call(arguments, 0), 'table');
	};


	return L;
}));


function a() {
	function b() {
		// var logger = new LoomLogger();
		// logger.log('here');
	}
	b();
}
a();