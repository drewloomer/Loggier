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
		root.Loggier = factory();
	}
}(this, function () {

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
	Loggier.prototype._target = 'console';


	/**
	 * Possible logging targets
	 * @type {Array}
	 */
	Loggier.prototype._targets = ['console', 'element'];


	/**
	 * The element to log to if we're logging to an element
	 * @type {Mixed}
	 */
	Loggier.prototype._element = undefined;


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
			var info = this._getStackInfo();

			// Append the info
			args = args.concat(this._buildStackInfoString(info));
		}

		// Write method based on target
		switch (this._target) {
			case 'console':
				return this._consoleWrite(args, method);
			case 'element':
				return this._elementWrite(args, method);
			default:
				break;
		}
	};


	/**
	 * Write to the console
	 * @param {Array} args
	 * @param {String} method
	 */
	Loggier.prototype._consoleWrite = function (args, method) {

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

			// Apply will maintain context, but is not always available
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
	 * Write to the element
	 * @param {Array} args
	 * @param {String} method
	 */
	Loggier.prototype._elementWrite = function (args, method) {

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
	 * Write a log to an element
	 * @param {Array} args
	 */
	Loggier.prototype._elementLog = function (args) {

		// New element
		var el = window.document.createElement('div');

		// Set properties
		el.className = 'log';
		el.innerHTML = this._buildLogString(args);

		// Add the log
		this._element.appendChild(el);
	};


	/**
	 * Write an error to an element
	 * @param {Array} args
	 */
	// Loggier.prototype._elementError = function (args) {

	// };


	/**
	 * Write a warning to an element
	 * @param {Array} args
	 */
	// Loggier.prototype._elementWarn = function (args) {

	// };


	/**
	 * Write info to an element
	 * @param {Array} args
	 */
	// Loggier.prototype._elementInfo = function (args) {

	// };


	/**
	 * Write a debug to an element
	 * @param {Array} args
	 */
	// Loggier.prototype._elementDebug = function (args) {

	// };


	/**
	 * Write a table to an element
	 * @param {Array} args
	 */
	// Loggier.prototype._elementTable = function (args) {

	// };


	/**
	 * Build a string to log out
	 * @param {Object} params
	 * @return {String}
	 */
	Loggier.prototype._buildLogString = function (params) {

		var str = '',
			len = params.length,
			i = 0;

		for (i; i < len; i+=1) {
			str += params[i] + ' ';
		}

		return str.slice(0, -1);
	};


	/**
	 * Build a string of stack info
	 * @param {Object} params
	 * @return {String}
	 */
	Loggier.prototype._buildStackInfoString = function (params) {

		return '[' + params.method + '@' + params.file + ':' + params.line + (params.character !== undefined ? ':' + params.character : '') + ']';
	};


	/**
	 * Extract the line number from a stack trace
	 */
	Loggier.prototype._getStackInfo = function () {

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
	Loggier.prototype._getStackInfoV8 = function (stack) {

		// Parse the 6th line of the stack trace to get line info
		var line = stack.split('\n')[5],
			info = line.match(/(?:at\s)(?:([^\(]{1})(?:\s\()(.*)|()()(.*)|()()(<anonymous>))(\:[0-9]{1,})(\:[0-9]{1,})/);

		// If there is no info, our regex failed because of bad stack data
		if (!info) {
			return {};
		}

		// Get the line info
		var	method = info[1] || 'anonymous',
			file = info[2] || info[5],
			lineNumber = parseInt(info[9].substr(1), 10),
			character = parseInt(info[10].substr(1), 10);

		// Return an object that will be used to make a string later
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
	Loggier.prototype._getStackInfoSpiderMonkey = function (stack) {

		// Parse the 5th line of the stack trace to get line info
		var line = stack.split('\n')[4],
			info = line.match(/([^@]{1,}|)(?:@)(.*)(\:[0-9]{1,})/);

		// If there is no info, our regex failed because of bad stack data
		if (!info) {
			return {};
		}

		// Get the line info
		var	method = info[1] || 'anonymous',
			file = info[2],
			lineNumber = parseInt(info[3].substr(1), 10);

		// Return an object that will be used to make a string later
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
	Loggier.prototype._getStackInfoChakra = function (stack) {

		// Parse the 6th line of the stack trace to get line info
		var line = stack.split('\n')[5],
			info = line.match(/(?:at\s)(?:([^\(]{1})(?:\s\()(.*)|()()(.*)|()()(<anonymous>))(\:[0-9]{1,})(\:[0-9]{1,})/);

		// If there is no info, our regex failed because of bad stack data
		if (!info) {
			return {};
		}

		// Get the line info
		var	method = info[1] || 'anonymous',
			file = info[2] || info[5],
			lineNumber = parseInt(info[9].substr(1), 10),
			character = parseInt(info[10].substr(1), 10);

		// Return an object that will be used to make a string later
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
	Loggier.prototype._generateStackTrace = function () {

		// Create a new error
		var error = new Error();

		// In some engines, the error doesn't contain a stack. Gotta throw an error instead!
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
	 * Create an element to write to and try to add it to the body
	 */
	Loggier.prototype._createElement = function () {

		// If there is no window object, we're SOL
		if (!window || !window.document) {
			return;
		}

		// Create the element
		this._element = window.document.createElement('div');

		// Set element properties
		this._element.className = 'loggier';

		// Append it to the document
		window.document.body.insertBefore(this._element, window.document.body.firstChild);
	};


	/**
	 * Set the current target
	 * @param {String} name
	 */
	Loggier.prototype.setTarget = function (name) {

		if (this._targets.indexOf(name) !== -1) {
			this._target = name;
		}
	};


	/**
	 * Set the element
	 * @param {Object} el
	 */
	Loggier.prototype.setElement = function (el) {

		if (this._target === 'element') {
			this._element = el;
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


	return Loggier;
}));


function a() {
	function b() {
		// var logger = new LoomLogger();
		// logger.log('here');
	}
	b();
}
a();