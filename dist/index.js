!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Loggier=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var ConsoleTarget = _dereq_('./targets/console'),
	ElementTarget = _dereq_('./targets/element'),
	StackParser = _dereq_('./helpers/stack-parser');

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
},{"./helpers/stack-parser":2,"./targets/console":3,"./targets/element":4}],2:[function(_dereq_,module,exports){
/**
 * Constructor
 * @param {Object} params
 */
function StackParser (params) {

}


/**
 * Prototype methods
 */
StackParser.prototype = {

	/**
	 * Constructor
	 * @type {Function}
	 */
	constructor: StackParser,


	/**
	 * Extract the line number from a stack trace
	 */
	getInfo: function () {

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
			return this._getInfoV8(stack);
		}
		else if (stack.indexOf('ReferenceError') === 0) {
			return this._getInfoChakra(stack);
		}
		// TODO: Nitro support
		// else if (stack.indexOf('ReferenceError') === 0) {
		// 	return this._getInfoChakra(stack);
		// }
		else {
			return this._getInfoSpiderMonkey(stack);
		}
	},


	/**
	 * Get the stack info for V8
	 * @param {String} stack
	 */
	_getInfoV8: function (stack) {

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
	},


	/**
	 * Get the stack info for SpiderMonkey
	 * @param {String} stack
	 */
	_getInfoSpiderMonkey: function (stack) {

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
	},


	/**
	 * Get the stack info for Chakra
	 * @param {String} stack
	 */
	_getInfoChakra: function (stack) {

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
	},


	/**
	 * Generate a stack trace
	 * @return {String} The stack trace
	 */
	_generateStackTrace: function () {

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
	}
};


module.exports = StackParser;
},{}],3:[function(_dereq_,module,exports){
/**
 * Constructor
 * @param {Object} params
 */
function ConsoleTarget (params) {

}


/**
 * Prototype methods
 */
ConsoleTarget.prototype = {

	/**
	 * Constructor
	 * @type {Function}
	 */
	constructor: ConsoleTarget,


	/**
	 * Write to the console
	 * @param {Array} args
	 * @param {String} method
	 */
	write: function (args, method) {

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
	}
};


module.exports = ConsoleTarget;
},{}],4:[function(_dereq_,module,exports){
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
	// _error: function (args) {

	// };


	/**
	 * Write a warning to an element
	 * @param {Array} args
	 */
	// _warn: function (args) {

	// };


	/**
	 * Write info to an element
	 * @param {Array} args
	 */
	// _info: function (args) {

	// };


	/**
	 * Write a debug to an element
	 * @param {Array} args
	 */
	// _debug: function (args) {

	// };


	/**
	 * Write a table to an element
	 * @param {Array} args
	 */
	// _table: function (args) {

	// };


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
	setElement: function (el) {

		this._element = el;
	}
};


module.exports = ElementTarget;
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJXOlxcUGVyc29uYWxcXGxvZ2dpZXJcXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiVzovUGVyc29uYWwvbG9nZ2llci9zcmMvZmFrZV80MTFjNGIyYi5qcyIsIlc6L1BlcnNvbmFsL2xvZ2dpZXIvc3JjL2hlbHBlcnMvc3RhY2stcGFyc2VyLmpzIiwiVzovUGVyc29uYWwvbG9nZ2llci9zcmMvdGFyZ2V0cy9jb25zb2xlLmpzIiwiVzovUGVyc29uYWwvbG9nZ2llci9zcmMvdGFyZ2V0cy9lbGVtZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIENvbnNvbGVUYXJnZXQgPSByZXF1aXJlKCcuL3RhcmdldHMvY29uc29sZScpLFxyXG5cdEVsZW1lbnRUYXJnZXQgPSByZXF1aXJlKCcuL3RhcmdldHMvZWxlbWVudCcpLFxyXG5cdFN0YWNrUGFyc2VyID0gcmVxdWlyZSgnLi9oZWxwZXJzL3N0YWNrLXBhcnNlcicpO1xyXG5cclxuLyoqXHJcbiAqIENvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXNcclxuICovXHJcbmZ1bmN0aW9uIExvZ2dpZXIgKHBhcmFtcykge1xyXG5cclxuXHRwYXJhbXMgPSBwYXJhbXMgfHwge307XHJcblxyXG5cdC8vIFRhcmdldFxyXG5cdGlmIChwYXJhbXMudGFyZ2V0KSB7XHJcblx0XHR0aGlzLnNldFRhcmdldChwYXJhbXMudGFyZ2V0KTtcclxuXHR9XHJcblxyXG5cdC8vIExvZ2dpbmcgZWxlbWVudFxyXG5cdGlmIChwYXJhbXMuZWxlbWVudCkge1xyXG5cdFx0dGhpcy5zZXRFbGVtZW50KHBhcmFtcy5lbGVtZW50KTtcclxuXHR9XHJcbn1cclxuXHJcblxyXG4vKipcclxuICogTG9nIGxldmVsc1xyXG4gKiBAdHlwZSB7QXJyYXl9XHJcbiAqL1xyXG52YXIgbG9nTGV2ZWxzID0ge1xyXG5cdFx0J2Vycm9yJzogMSxcclxuXHRcdCd3YXJuJzogMixcclxuXHRcdCdkZWJ1Zyc6IDQsXHJcblx0XHQnaW5mbyc6IDgsXHJcblx0XHQnbG9nJzogMTZcclxuXHR9O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBQcm90b3R5cGUgbWV0aG9kc1xyXG4gKi9cclxuTG9nZ2llci5wcm90b3R5cGUgPSB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yXHJcblx0ICogQHR5cGUge0Z1bmN0aW9ufVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yOiBMb2dnaWVyLFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogSXMgbG9nZ2luZyBlbmFibGVkP1xyXG5cdCAqIEB0eXBlIHtCb29sZWFufVxyXG5cdCAqL1xyXG5cdF9lbmFibGVkOiB0cnVlLFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGxvZ2dpbmcgdGFyZ2V0XHJcblx0ICogQHR5cGUge1N0cmluZ31cclxuXHQgKi9cclxuXHRfdGFyZ2V0SWQ6ICdjb25zb2xlJyxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFBvc3NpYmxlIGxvZ2dpbmcgdGFyZ2V0c1xyXG5cdCAqIEB0eXBlIHtPYmplY3R9XHJcblx0ICovXHJcblx0X3RhcmdldHM6IHtcclxuXHRcdCdjb25zb2xlJzogbmV3IENvbnNvbGVUYXJnZXQoKSxcclxuXHRcdCdlbGVtZW50JzogbmV3IEVsZW1lbnRUYXJnZXQoKVxyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBTdGFjayBwYXJzZXIgaGVscGVyXHJcblx0ICogQHR5cGUge09iamVjdH1cclxuXHQgKi9cclxuXHRfc3RhY2tQYXJzZXI6IG5ldyBTdGFja1BhcnNlcigpLFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogTG9nIGxldmVsc1xyXG5cdCAqIEB0eXBlIHtPYmplY3R9XHJcblx0ICovXHJcblx0X2xvZ0xldmVsczogbG9nTGV2ZWxzLFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGN1cnJlbnQgbG9nIGxldmVsXHJcblx0ICogQHR5cGUge051bWJlcn1cclxuXHQgKi9cclxuXHRfbG9nTGV2ZWw6IGxvZ0xldmVscy5lcnJvciB8IGxvZ0xldmVscy53YXJuIHwgbG9nTGV2ZWxzLmRlYnVnIHwgbG9nTGV2ZWxzLmxvZyB8IGxvZ0xldmVscy5pbmZvLFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogRG9lcyB0aGUgYWN0dWFsIHdyaXRpbmdcclxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcmdzXHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxyXG5cdCAqL1xyXG5cdF93cml0ZTogZnVuY3Rpb24gKGFyZ3MsIG1ldGhvZCkge1xyXG5cclxuXHRcdC8vIERvbid0IGxvZyBpZiB3ZSdyZSBub3QgZW5hYmxlZFxyXG5cdFx0aWYgKCF0aGlzLl9lbmFibGVkIHx8ICEodGhpcy5fbG9nTGV2ZWwgJiAodGhpcy5fbG9nTGV2ZWxzW21ldGhvZF0gfHwgdGhpcy5fbG9nTGV2ZWxzWydsb2cnXSkpKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBUYWJsZSBsb2dnaW5nIGRvZXNuJ3QgbGlrZSBleHRyYSBkYXRhXHJcblx0XHRpZiAobWV0aG9kICE9PSAndGFibGUnKSB7XHJcblxyXG5cdFx0XHQvLyBGaWxlIGluZm8gdG8gYXBwZW5kXHJcblx0XHRcdHZhciBpbmZvID0gdGhpcy5fc3RhY2tQYXJzZXIuZ2V0SW5mbygpO1xyXG5cclxuXHRcdFx0Ly8gQXBwZW5kIHRoZSBpbmZvXHJcblx0XHRcdGFyZ3MgPSBhcmdzLmNvbmNhdCh0aGlzLl9idWlsZFN0YWNrSW5mb1N0cmluZyhpbmZvKSk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gV3JpdGUgbWV0aG9kIGJhc2VkIG9uIHRhcmdldFxyXG5cdFx0cmV0dXJuIHRoaXMuZ2V0VGFyZ2V0KCkud3JpdGUoYXJncywgbWV0aG9kKTtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogQnVpbGQgYSBzdHJpbmcgb2Ygc3RhY2sgaW5mb1xyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXNcclxuXHQgKiBAcmV0dXJuIHtTdHJpbmd9XHJcblx0ICovXHJcblx0X2J1aWxkU3RhY2tJbmZvU3RyaW5nOiBmdW5jdGlvbiAocGFyYW1zKSB7XHJcblxyXG5cdFx0cmV0dXJuICcoJyArIHBhcmFtcy5tZXRob2QgKyAnQCcgKyBwYXJhbXMuZmlsZSArICc6JyArIHBhcmFtcy5saW5lICsgKHBhcmFtcy5jaGFyYWN0ZXIgIT09IHVuZGVmaW5lZCA/ICc6JyArIHBhcmFtcy5jaGFyYWN0ZXIgOiAnJykgKyAnKSc7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldCB0aGUgY3VycmVudCB0YXJnZXRcclxuXHQgKiBAcmV0dXJuIHtPYmplY3R9XHJcblx0ICovXHJcblx0Z2V0VGFyZ2V0OiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0aWYgKHRoaXMuX3RhcmdldHMuaGFzT3duUHJvcGVydHkodGhpcy5fdGFyZ2V0SWQpKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl90YXJnZXRzW3RoaXMuX3RhcmdldElkXTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogU2V0IHRoZSBjdXJyZW50IHRhcmdldFxyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXHJcblx0ICovXHJcblx0c2V0VGFyZ2V0OiBmdW5jdGlvbiAobmFtZSkge1xyXG5cclxuXHRcdGlmICh0aGlzLl90YXJnZXRzLmhhc093blByb3BlcnR5KG5hbWUpKSB7XHJcblx0XHRcdHRoaXMuX3RhcmdldElkID0gbmFtZTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogU2V0IHRoZSBlbGVtZW50XHJcblx0ICogQHBhcmFtIHtPYmplY3R9IGVsXHJcblx0ICovXHJcblx0c2V0RWxlbWVudDogZnVuY3Rpb24gKGVsKSB7XHJcblxyXG5cdFx0aWYgKHRoaXMuX3RhcmdldElkID09PSAnZWxlbWVudCcpIHtcclxuXHRcdFx0dGhpcy5nZXRUYXJnZXQoKS5zZXRFbGVtZW50KGVsKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogU2V0IG9yIGdldCB0aGUgbG9nIGxldmVsXHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IGxldmVsTmFtZVxyXG5cdCAqL1xyXG5cdGxvZ0xldmVsOiBmdW5jdGlvbiAobGV2ZWxOYW1lKSB7XHJcblxyXG5cdFx0Ly8gR2V0IHRoZSBsZXZlbFxyXG5cdFx0aWYgKGxldmVsTmFtZSA9PT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9sb2dMZXZlbDtcclxuXHRcdH1cclxuXHJcblxyXG5cdFx0Ly8gU2V0IHRoZSBsZXZlbFxyXG5cdFx0dmFyIGtleSxcclxuXHRcdFx0bGV2ZWwgPSB0aGlzLl9sb2dMZXZlbHNbbGV2ZWxOYW1lXSxcclxuXHRcdFx0bWFzayA9IDAsXHJcblx0XHRcdGN1ckxldmVsO1xyXG5cdFx0Zm9yIChrZXkgaW4gdGhpcy5fbG9nTGV2ZWxzKSB7XHJcblx0XHRcdGN1ckxldmVsID0gdGhpcy5fbG9nTGV2ZWxzW2tleV07XHJcblx0XHRcdGlmIChjdXJMZXZlbCA8PSBsZXZlbCkge1xyXG5cdFx0XHRcdG1hc2sgPSBtYXNrIHwgY3VyTGV2ZWw7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcy5fbG9nTGV2ZWwgPSBsZXZlbDtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogRW5hYmxlIGxvZ2dpbmdcclxuXHQgKi9cclxuXHRlbmFibGU6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHR0aGlzLl9lbmFibGVkID0gdHJ1ZTtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogRGlzYWJsZSBsb2dnaW5nXHJcblx0ICovXHJcblx0ZGlzYWJsZTogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdHRoaXMuX2VuYWJsZWQgPSBmYWxzZTtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogTG9nIHRhYnVsYXIgZGF0YVxyXG5cdCAqL1xyXG5cdGxvZzogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdHJldHVybiB0aGlzLl93cml0ZShBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApLCAnbG9nJyk7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIExvZyB0YWJ1bGFyIGRhdGFcclxuXHQgKi9cclxuXHRlcnJvcjogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdHJldHVybiB0aGlzLl93cml0ZShBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApLCAnZXJyb3InKTtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogTG9nIHRhYnVsYXIgZGF0YVxyXG5cdCAqL1xyXG5cdHdhcm46IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5fd3JpdGUoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSwgJ3dhcm4nKTtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogTG9nIHRhYnVsYXIgZGF0YVxyXG5cdCAqL1xyXG5cdGluZm86IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5fd3JpdGUoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSwgJ2luZm8nKTtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogTG9nIHRhYnVsYXIgZGF0YVxyXG5cdCAqL1xyXG5cdGRlYnVnOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuX3dyaXRlKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCksICdkZWJ1ZycpO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBMb2cgdGFidWxhciBkYXRhXHJcblx0ICovXHJcblx0dGFibGU6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5fd3JpdGUoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSwgJ3RhYmxlJyk7XHJcblx0fVxyXG59O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTG9nZ2llcjsiLCIvKipcclxuICogQ29uc3RydWN0b3JcclxuICogQHBhcmFtIHtPYmplY3R9IHBhcmFtc1xyXG4gKi9cclxuZnVuY3Rpb24gU3RhY2tQYXJzZXIgKHBhcmFtcykge1xyXG5cclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBQcm90b3R5cGUgbWV0aG9kc1xyXG4gKi9cclxuU3RhY2tQYXJzZXIucHJvdG90eXBlID0ge1xyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3RvclxyXG5cdCAqIEB0eXBlIHtGdW5jdGlvbn1cclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcjogU3RhY2tQYXJzZXIsXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBFeHRyYWN0IHRoZSBsaW5lIG51bWJlciBmcm9tIGEgc3RhY2sgdHJhY2VcclxuXHQgKi9cclxuXHRnZXRJbmZvOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0Ly8gTmV3IGVycm9yIGZvciB0aGUgc3RhY2sgaW5mb1xyXG5cdFx0dmFyIHN0YWNrID0gdGhpcy5fZ2VuZXJhdGVTdGFja1RyYWNlKCksXHJcblx0XHRcdGxpbmUsXHJcblx0XHRcdGluZm8sXHJcblx0XHRcdGZpbGUsXHJcblx0XHRcdG1ldGhvZCxcclxuXHRcdFx0bGluZU51bWJlcixcclxuXHRcdFx0Y2hhcmFjdGVyO1xyXG5cclxuXHRcdC8vIFBhcnNlIGRpZmZlcmVudCB0eXBlcyBvZiB0cmFjZXNcclxuXHRcdGlmIChzdGFjay5pbmRleE9mKCdFcnJvcicpID09PSAwKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9nZXRJbmZvVjgoc3RhY2spO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSBpZiAoc3RhY2suaW5kZXhPZignUmVmZXJlbmNlRXJyb3InKSA9PT0gMCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5fZ2V0SW5mb0NoYWtyYShzdGFjayk7XHJcblx0XHR9XHJcblx0XHQvLyBUT0RPOiBOaXRybyBzdXBwb3J0XHJcblx0XHQvLyBlbHNlIGlmIChzdGFjay5pbmRleE9mKCdSZWZlcmVuY2VFcnJvcicpID09PSAwKSB7XHJcblx0XHQvLyBcdHJldHVybiB0aGlzLl9nZXRJbmZvQ2hha3JhKHN0YWNrKTtcclxuXHRcdC8vIH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5fZ2V0SW5mb1NwaWRlck1vbmtleShzdGFjayk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldCB0aGUgc3RhY2sgaW5mbyBmb3IgVjhcclxuXHQgKiBAcGFyYW0ge1N0cmluZ30gc3RhY2tcclxuXHQgKi9cclxuXHRfZ2V0SW5mb1Y4OiBmdW5jdGlvbiAoc3RhY2spIHtcclxuXHJcblx0XHQvLyBQYXJzZSB0aGUgNnRoIGxpbmUgb2YgdGhlIHN0YWNrIHRyYWNlIHRvIGdldCBsaW5lIGluZm9cclxuXHRcdHZhciBsaW5lID0gc3RhY2suc3BsaXQoJ1xcbicpWzVdLFxyXG5cdFx0XHRpbmZvID0gbGluZS5tYXRjaCgvKD86YXRcXHMpKD86KFteXFwoXXsxfSkoPzpcXHNcXCgpKC4qKXwoKSgpKC4qKXwoKSgpKDxhbm9ueW1vdXM+KSkoXFw6WzAtOV17MSx9KShcXDpbMC05XXsxLH0pLyk7XHJcblxyXG5cdFx0Ly8gSWYgdGhlcmUgaXMgbm8gaW5mbywgb3VyIHJlZ2V4IGZhaWxlZCBiZWNhdXNlIG9mIGJhZCBzdGFjayBkYXRhXHJcblx0XHRpZiAoIWluZm8pIHtcclxuXHRcdFx0cmV0dXJuIHt9O1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEdldCB0aGUgbGluZSBpbmZvXHJcblx0XHR2YXJcdG1ldGhvZCA9IGluZm9bMV0gfHwgJ2Fub255bW91cycsXHJcblx0XHRcdGZpbGUgPSBpbmZvWzJdIHx8IGluZm9bNV0sXHJcblx0XHRcdGxpbmVOdW1iZXIgPSBwYXJzZUludChpbmZvWzldLnN1YnN0cigxKSwgMTApLFxyXG5cdFx0XHRjaGFyYWN0ZXIgPSBwYXJzZUludChpbmZvWzEwXS5zdWJzdHIoMSksIDEwKTtcclxuXHJcblx0XHQvLyBSZXR1cm4gYW4gb2JqZWN0IHRoYXQgd2lsbCBiZSB1c2VkIHRvIG1ha2UgYSBzdHJpbmcgbGF0ZXJcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdG1ldGhvZDogbWV0aG9kLFxyXG5cdFx0XHRmaWxlOiBmaWxlLFxyXG5cdFx0XHRsaW5lOiBsaW5lTnVtYmVyLFxyXG5cdFx0XHRjaGFyYWN0ZXI6IGNoYXJhY3RlclxyXG5cdFx0fTtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogR2V0IHRoZSBzdGFjayBpbmZvIGZvciBTcGlkZXJNb25rZXlcclxuXHQgKiBAcGFyYW0ge1N0cmluZ30gc3RhY2tcclxuXHQgKi9cclxuXHRfZ2V0SW5mb1NwaWRlck1vbmtleTogZnVuY3Rpb24gKHN0YWNrKSB7XHJcblxyXG5cdFx0Ly8gUGFyc2UgdGhlIDV0aCBsaW5lIG9mIHRoZSBzdGFjayB0cmFjZSB0byBnZXQgbGluZSBpbmZvXHJcblx0XHR2YXIgbGluZSA9IHN0YWNrLnNwbGl0KCdcXG4nKVs0XSxcclxuXHRcdFx0aW5mbyA9IGxpbmUubWF0Y2goLyhbXkBdezEsfXwpKD86QCkoLiopKFxcOlswLTldezEsfSkvKTtcclxuXHJcblx0XHQvLyBJZiB0aGVyZSBpcyBubyBpbmZvLCBvdXIgcmVnZXggZmFpbGVkIGJlY2F1c2Ugb2YgYmFkIHN0YWNrIGRhdGFcclxuXHRcdGlmICghaW5mbykge1xyXG5cdFx0XHRyZXR1cm4ge307XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gR2V0IHRoZSBsaW5lIGluZm9cclxuXHRcdHZhclx0bWV0aG9kID0gaW5mb1sxXSB8fCAnYW5vbnltb3VzJyxcclxuXHRcdFx0ZmlsZSA9IGluZm9bMl0sXHJcblx0XHRcdGxpbmVOdW1iZXIgPSBwYXJzZUludChpbmZvWzNdLnN1YnN0cigxKSwgMTApO1xyXG5cclxuXHRcdC8vIFJldHVybiBhbiBvYmplY3QgdGhhdCB3aWxsIGJlIHVzZWQgdG8gbWFrZSBhIHN0cmluZyBsYXRlclxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0bWV0aG9kOiBtZXRob2QsXHJcblx0XHRcdGZpbGU6IGZpbGUsXHJcblx0XHRcdGxpbmU6IGxpbmVOdW1iZXIsXHJcblx0XHRcdGNoYXJhY3RlcjogdW5kZWZpbmVkXHJcblx0XHR9O1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBHZXQgdGhlIHN0YWNrIGluZm8gZm9yIENoYWtyYVxyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBzdGFja1xyXG5cdCAqL1xyXG5cdF9nZXRJbmZvQ2hha3JhOiBmdW5jdGlvbiAoc3RhY2spIHtcclxuXHJcblx0XHQvLyBQYXJzZSB0aGUgNnRoIGxpbmUgb2YgdGhlIHN0YWNrIHRyYWNlIHRvIGdldCBsaW5lIGluZm9cclxuXHRcdHZhciBsaW5lID0gc3RhY2suc3BsaXQoJ1xcbicpWzVdLFxyXG5cdFx0XHRpbmZvID0gbGluZS5tYXRjaCgvKD86YXRcXHMpKD86KFteXFwoXXsxfSkoPzpcXHNcXCgpKC4qKXwoKSgpKC4qKXwoKSgpKDxhbm9ueW1vdXM+KSkoXFw6WzAtOV17MSx9KShcXDpbMC05XXsxLH0pLyk7XHJcblxyXG5cdFx0Ly8gSWYgdGhlcmUgaXMgbm8gaW5mbywgb3VyIHJlZ2V4IGZhaWxlZCBiZWNhdXNlIG9mIGJhZCBzdGFjayBkYXRhXHJcblx0XHRpZiAoIWluZm8pIHtcclxuXHRcdFx0cmV0dXJuIHt9O1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEdldCB0aGUgbGluZSBpbmZvXHJcblx0XHR2YXJcdG1ldGhvZCA9IGluZm9bMV0gfHwgJ2Fub255bW91cycsXHJcblx0XHRcdGZpbGUgPSBpbmZvWzJdIHx8IGluZm9bNV0sXHJcblx0XHRcdGxpbmVOdW1iZXIgPSBwYXJzZUludChpbmZvWzldLnN1YnN0cigxKSwgMTApLFxyXG5cdFx0XHRjaGFyYWN0ZXIgPSBwYXJzZUludChpbmZvWzEwXS5zdWJzdHIoMSksIDEwKTtcclxuXHJcblx0XHQvLyBSZXR1cm4gYW4gb2JqZWN0IHRoYXQgd2lsbCBiZSB1c2VkIHRvIG1ha2UgYSBzdHJpbmcgbGF0ZXJcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdG1ldGhvZDogbWV0aG9kLFxyXG5cdFx0XHRmaWxlOiBmaWxlLFxyXG5cdFx0XHRsaW5lOiBsaW5lTnVtYmVyLFxyXG5cdFx0XHRjaGFyYWN0ZXI6IGNoYXJhY3RlclxyXG5cdFx0fTtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogR2VuZXJhdGUgYSBzdGFjayB0cmFjZVxyXG5cdCAqIEByZXR1cm4ge1N0cmluZ30gVGhlIHN0YWNrIHRyYWNlXHJcblx0ICovXHJcblx0X2dlbmVyYXRlU3RhY2tUcmFjZTogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdC8vIENyZWF0ZSBhIG5ldyBlcnJvclxyXG5cdFx0dmFyIGVycm9yID0gbmV3IEVycm9yKCk7XHJcblxyXG5cdFx0Ly8gSW4gc29tZSBlbmdpbmVzLCB0aGUgZXJyb3IgZG9lc24ndCBjb250YWluIGEgc3RhY2suIEdvdHRhIHRocm93IGFuIGVycm9yIGluc3RlYWQhXHJcblx0XHRpZiAoIWVycm9yLnN0YWNrKSB7XHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0aXMubm90LmZ1bmMoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXRjaCAoZSkge1xyXG5cdFx0XHRcdGVycm9yID0gZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBlcnJvci5zdGFjaztcclxuXHR9XHJcbn07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTdGFja1BhcnNlcjsiLCIvKipcclxuICogQ29uc3RydWN0b3JcclxuICogQHBhcmFtIHtPYmplY3R9IHBhcmFtc1xyXG4gKi9cclxuZnVuY3Rpb24gQ29uc29sZVRhcmdldCAocGFyYW1zKSB7XHJcblxyXG59XHJcblxyXG5cclxuLyoqXHJcbiAqIFByb3RvdHlwZSBtZXRob2RzXHJcbiAqL1xyXG5Db25zb2xlVGFyZ2V0LnByb3RvdHlwZSA9IHtcclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3JcclxuXHQgKiBAdHlwZSB7RnVuY3Rpb259XHJcblx0ICovXHJcblx0Y29uc3RydWN0b3I6IENvbnNvbGVUYXJnZXQsXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBXcml0ZSB0byB0aGUgY29uc29sZVxyXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFyZ3NcclxuXHQgKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXHJcblx0ICovXHJcblx0d3JpdGU6IGZ1bmN0aW9uIChhcmdzLCBtZXRob2QpIHtcclxuXHJcblx0XHQvLyBNYWtlIHN1cmUgdGhlcmUgaXMgYSBjb25zb2xlXHJcblx0XHRpZiAoY29uc29sZSkge1xyXG5cclxuXHRcdFx0Ly8gSWYgdGhlcmUgaXMgbm8gbWV0aG9kLCByZXZlcnQgdG8gbG9nXHJcblx0XHRcdGlmICghY29uc29sZVttZXRob2RdKSB7XHJcblxyXG5cdFx0XHRcdGlmICghY29uc29sZS5sb2cpIHtcclxuXHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0XHRtZXRob2QgPSAnbG9nJztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIEFwcGx5IHdpbGwgbWFpbnRhaW4gY29udGV4dCwgYnV0IGlzIG5vdCBhbHdheXMgYXZhaWxhYmxlXHJcblx0XHRcdGlmIChjb25zb2xlW21ldGhvZF0uYXBwbHkpIHtcclxuXHRcdFx0XHRjb25zb2xlW21ldGhvZF0uYXBwbHkoY29uc29sZSwgYXJncyk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0Y29uc29sZVttZXRob2RdKGFyZ3MpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gYXJncztcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb25zb2xlVGFyZ2V0OyIsIi8qKlxyXG4gKiBDb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zXHJcbiAqL1xyXG5mdW5jdGlvbiBFbGVtZW50VGFyZ2V0IChwYXJhbXMpIHtcclxuXHJcbn1cclxuXHJcblxyXG4vKipcclxuICogUHJvdG90eXBlIG1ldGhvZHNcclxuICovXHJcbkVsZW1lbnRUYXJnZXQucHJvdG90eXBlID0ge1xyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3RvclxyXG5cdCAqIEB0eXBlIHtGdW5jdGlvbn1cclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcjogRWxlbWVudFRhcmdldCxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBlbGVtZW50IHRvIGxvZyB0b1xyXG5cdCAqIEB0eXBlIHtNaXhlZH1cclxuXHQgKi9cclxuXHRfZWxlbWVudDogdW5kZWZpbmVkLFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogQnVpbGQgYSBzdHJpbmcgdG8gbG9nIG91dFxyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXNcclxuXHQgKiBAcmV0dXJuIHtTdHJpbmd9XHJcblx0ICovXHJcblx0X2J1aWxkTG9nU3RyaW5nOiBmdW5jdGlvbiAocGFyYW1zKSB7XHJcblxyXG5cdFx0dmFyIHN0ciA9ICcnLFxyXG5cdFx0XHRsZW4gPSBwYXJhbXMubGVuZ3RoLFxyXG5cdFx0XHRpID0gMDtcclxuXHJcblx0XHRmb3IgKGk7IGkgPCBsZW47IGkrPTEpIHtcclxuXHRcdFx0c3RyICs9IHBhcmFtc1tpXSArICcgJztcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gc3RyLnNsaWNlKDAsIC0xKTtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogV3JpdGUgYSBsb2cgdG8gYW4gZWxlbWVudFxyXG5cdCAqL1xyXG5cdF9sb2c6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHQvLyBNYWtlIHN1cmUgd2UgaGF2ZSBhbiBlbGVtZW50XHJcblx0XHRpZiAoIXRoaXMuX2NoZWNrRWxlbWVudCgpKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBOZXcgZWxlbWVudFxyXG5cdFx0dmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblxyXG5cdFx0Ly8gU2V0IHByb3BlcnRpZXNcclxuXHRcdGVsLmNsYXNzTmFtZSA9ICdsb2cnO1xyXG5cdFx0ZWwuaW5uZXJIVE1MID0gdGhpcy5fYnVpbGRMb2dTdHJpbmcoYXJndW1lbnRzKTtcclxuXHJcblx0XHQvLyBBZGQgdGhlIGxvZ1xyXG5cdFx0dGhpcy5fZWxlbWVudC5hcHBlbmRDaGlsZChlbCk7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFdyaXRlIGFuIGVycm9yIHRvIGFuIGVsZW1lbnRcclxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcmdzXHJcblx0ICovXHJcblx0Ly8gX2Vycm9yOiBmdW5jdGlvbiAoYXJncykge1xyXG5cclxuXHQvLyB9O1xyXG5cclxuXHJcblx0LyoqXHJcblx0ICogV3JpdGUgYSB3YXJuaW5nIHRvIGFuIGVsZW1lbnRcclxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcmdzXHJcblx0ICovXHJcblx0Ly8gX3dhcm46IGZ1bmN0aW9uIChhcmdzKSB7XHJcblxyXG5cdC8vIH07XHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBXcml0ZSBpbmZvIHRvIGFuIGVsZW1lbnRcclxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcmdzXHJcblx0ICovXHJcblx0Ly8gX2luZm86IGZ1bmN0aW9uIChhcmdzKSB7XHJcblxyXG5cdC8vIH07XHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBXcml0ZSBhIGRlYnVnIHRvIGFuIGVsZW1lbnRcclxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcmdzXHJcblx0ICovXHJcblx0Ly8gX2RlYnVnOiBmdW5jdGlvbiAoYXJncykge1xyXG5cclxuXHQvLyB9O1xyXG5cclxuXHJcblx0LyoqXHJcblx0ICogV3JpdGUgYSB0YWJsZSB0byBhbiBlbGVtZW50XHJcblx0ICogQHBhcmFtIHtBcnJheX0gYXJnc1xyXG5cdCAqL1xyXG5cdC8vIF90YWJsZTogZnVuY3Rpb24gKGFyZ3MpIHtcclxuXHJcblx0Ly8gfTtcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIENoZWNrIHRoYXQgdGhlcmUgaXMgYW4gZWxlbWVudCBhbmQgY3JlYXRlIGlmIHdlIGRvbid0IGhhdmUgb25lXHJcblx0ICovXHJcblx0X2NoZWNrRWxlbWVudDogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdC8vIFJldHVybiB0aGUgZWxlbWVudCBpZiB3ZSBoYXZlIGl0XHJcblx0XHRpZiAodGhpcy5fZWxlbWVudCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5fZWxlbWVudDtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBUcnkgdG8gY3JlYXRlXHJcblx0XHRyZXR1cm4gdGhpcy5fY3JlYXRlRWxlbWVudCgpO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGUgYW4gZWxlbWVudCB0byB3cml0ZSB0byBhbmQgdHJ5IHRvIGFkZCBpdCB0byB0aGUgYm9keVxyXG5cdCAqL1xyXG5cdF9jcmVhdGVFbGVtZW50OiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0Ly8gSWYgdGhlcmUgaXMgbm8gd2luZG93IG9iamVjdCwgd2UncmUgU09MXHJcblx0XHRpZiAoIWRvY3VtZW50KSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBDcmVhdGUgdGhlIGVsZW1lbnRcclxuXHRcdHRoaXMuX2VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHJcblx0XHQvLyBTZXQgZWxlbWVudCBwcm9wZXJ0aWVzXHJcblx0XHR0aGlzLl9lbGVtZW50LmNsYXNzTmFtZSA9ICdsb2dnaWVyJztcclxuXHJcblx0XHQvLyBBcHBlbmQgaXQgdG8gdGhlIGRvY3VtZW50XHJcblx0XHRkb2N1bWVudC5ib2R5Lmluc2VydEJlZm9yZSh0aGlzLl9lbGVtZW50LCBkb2N1bWVudC5ib2R5LmZpcnN0Q2hpbGQpO1xyXG5cclxuXHRcdHJldHVybiB0aGlzLl9lbGVtZW50O1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBXcml0ZSB0byB0aGUgZWxlbWVudFxyXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFyZ3NcclxuXHQgKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXHJcblx0ICovXHJcblx0d3JpdGU6IGZ1bmN0aW9uIChhcmdzLCBtZXRob2QpIHtcclxuXHJcblx0XHQvLyBNYWtlIHN1cmUgd2UgaGF2ZSBhbiBlbGVtZW50XHJcblx0XHRpZiAoIXRoaXMuX2NoZWNrRWxlbWVudCgpKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBUaGUgbWV0aG9kIG5hbWVcclxuXHRcdHZhciBtZXRob2ROYW1lID0gJ18nICsgbWV0aG9kLFxyXG5cdFx0XHRkZWZhdWx0TWV0aG9kTmFtZSA9ICdfbG9nJztcclxuXHJcblx0XHQvLyBJZiB0aGVyZSBpcyBubyBtZXRob2QsIHJldmVydCB0byBkZWZhdWx0XHJcblx0XHRpZiAoIXRoaXNbbWV0aG9kTmFtZV0pIHtcclxuXHJcblx0XHRcdG1ldGhvZE5hbWUgPSBkZWZhdWx0TWV0aG9kTmFtZTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBDYWxsIHRoZSBtZXRob2RcclxuXHRcdHRoaXNbbWV0aG9kTmFtZV0oYXJncyk7XHJcblxyXG5cdFx0cmV0dXJuIGFyZ3M7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFNldCB0aGUgZWxlbWVudCB3ZSdsbCB3cml0ZSB0b1xyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBlbFxyXG5cdCAqL1xyXG5cdHNldEVsZW1lbnQ6IGZ1bmN0aW9uIChlbCkge1xyXG5cclxuXHRcdHRoaXMuX2VsZW1lbnQgPSBlbDtcclxuXHR9XHJcbn07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFbGVtZW50VGFyZ2V0OyJdfQ==
(1)
});
