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
	 * Does the actual writing
	 * @param {Array} args
	 * @param {String} method
	 */
	_write: function (args, method) {

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJXOlxcUGVyc29uYWxcXGxvZ2dpZXJcXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiVzovUGVyc29uYWwvbG9nZ2llci9zcmMvZmFrZV8zZGYxNjFiMi5qcyIsIlc6L1BlcnNvbmFsL2xvZ2dpZXIvc3JjL2hlbHBlcnMvc3RhY2stcGFyc2VyLmpzIiwiVzovUGVyc29uYWwvbG9nZ2llci9zcmMvdGFyZ2V0cy9jb25zb2xlLmpzIiwiVzovUGVyc29uYWwvbG9nZ2llci9zcmMvdGFyZ2V0cy9lbGVtZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBDb25zb2xlVGFyZ2V0ID0gcmVxdWlyZSgnLi90YXJnZXRzL2NvbnNvbGUnKSxcclxuXHRFbGVtZW50VGFyZ2V0ID0gcmVxdWlyZSgnLi90YXJnZXRzL2VsZW1lbnQnKSxcclxuXHRTdGFja1BhcnNlciA9IHJlcXVpcmUoJy4vaGVscGVycy9zdGFjay1wYXJzZXInKTtcclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zXHJcbiAqL1xyXG5mdW5jdGlvbiBMb2dnaWVyIChwYXJhbXMpIHtcclxuXHJcblx0cGFyYW1zID0gcGFyYW1zIHx8IHt9O1xyXG5cclxuXHQvLyBUYXJnZXRcclxuXHRpZiAocGFyYW1zLnRhcmdldCkge1xyXG5cdFx0dGhpcy5zZXRUYXJnZXQocGFyYW1zLnRhcmdldCk7XHJcblx0fVxyXG5cclxuXHQvLyBMb2dnaW5nIGVsZW1lbnRcclxuXHRpZiAocGFyYW1zLmVsZW1lbnQpIHtcclxuXHRcdHRoaXMuc2V0RWxlbWVudChwYXJhbXMuZWxlbWVudCk7XHJcblx0fVxyXG59XHJcblxyXG5cclxuLyoqXHJcbiAqIFByb3RvdHlwZSBtZXRob2RzXHJcbiAqL1xyXG5Mb2dnaWVyLnByb3RvdHlwZSA9IHtcclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3JcclxuXHQgKiBAdHlwZSB7RnVuY3Rpb259XHJcblx0ICovXHJcblx0Y29uc3RydWN0b3I6IExvZ2dpZXIsXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBJcyBsb2dnaW5nIGVuYWJsZWQ/XHJcblx0ICogQHR5cGUge0Jvb2xlYW59XHJcblx0ICovXHJcblx0X2VuYWJsZWQ6IHRydWUsXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgbG9nZ2luZyB0YXJnZXRcclxuXHQgKiBAdHlwZSB7U3RyaW5nfVxyXG5cdCAqL1xyXG5cdF90YXJnZXRJZDogJ2NvbnNvbGUnLFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogUG9zc2libGUgbG9nZ2luZyB0YXJnZXRzXHJcblx0ICogQHR5cGUge09iamVjdH1cclxuXHQgKi9cclxuXHRfdGFyZ2V0czoge1xyXG5cdFx0J2NvbnNvbGUnOiBuZXcgQ29uc29sZVRhcmdldCgpLFxyXG5cdFx0J2VsZW1lbnQnOiBuZXcgRWxlbWVudFRhcmdldCgpXHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFN0YWNrIHBhcnNlciBoZWxwZXJcclxuXHQgKiBAdHlwZSB7T2JqZWN0fVxyXG5cdCAqL1xyXG5cdF9zdGFja1BhcnNlcjogbmV3IFN0YWNrUGFyc2VyKCksXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBEb2VzIHRoZSBhY3R1YWwgd3JpdGluZ1xyXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFyZ3NcclxuXHQgKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXHJcblx0ICovXHJcblx0X3dyaXRlOiBmdW5jdGlvbiAoYXJncywgbWV0aG9kKSB7XHJcblxyXG5cdFx0Ly8gRG9uJ3QgbG9nIGlmIHdlJ3JlIG5vdCBlbmFibGVkXHJcblx0XHRpZiAoIXRoaXMuX2VuYWJsZWQpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFRhYmxlIGxvZ2dpbmcgZG9lc24ndCBsaWtlIGV4dHJhIGRhdGFcclxuXHRcdGlmIChtZXRob2QgIT09ICd0YWJsZScpIHtcclxuXHJcblx0XHRcdC8vIEZpbGUgaW5mbyB0byBhcHBlbmRcclxuXHRcdFx0dmFyIGluZm8gPSB0aGlzLl9zdGFja1BhcnNlci5nZXRJbmZvKCk7XHJcblxyXG5cdFx0XHQvLyBBcHBlbmQgdGhlIGluZm9cclxuXHRcdFx0YXJncyA9IGFyZ3MuY29uY2F0KHRoaXMuX2J1aWxkU3RhY2tJbmZvU3RyaW5nKGluZm8pKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBXcml0ZSBtZXRob2QgYmFzZWQgb24gdGFyZ2V0XHJcblx0XHRyZXR1cm4gdGhpcy5nZXRUYXJnZXQoKS53cml0ZShhcmdzLCBtZXRob2QpO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBCdWlsZCBhIHN0cmluZyBvZiBzdGFjayBpbmZvXHJcblx0ICogQHBhcmFtIHtPYmplY3R9IHBhcmFtc1xyXG5cdCAqIEByZXR1cm4ge1N0cmluZ31cclxuXHQgKi9cclxuXHRfYnVpbGRTdGFja0luZm9TdHJpbmc6IGZ1bmN0aW9uIChwYXJhbXMpIHtcclxuXHJcblx0XHRyZXR1cm4gJygnICsgcGFyYW1zLm1ldGhvZCArICdAJyArIHBhcmFtcy5maWxlICsgJzonICsgcGFyYW1zLmxpbmUgKyAocGFyYW1zLmNoYXJhY3RlciAhPT0gdW5kZWZpbmVkID8gJzonICsgcGFyYW1zLmNoYXJhY3RlciA6ICcnKSArICcpJztcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogR2V0IHRoZSBjdXJyZW50IHRhcmdldFxyXG5cdCAqIEByZXR1cm4ge09iamVjdH1cclxuXHQgKi9cclxuXHRnZXRUYXJnZXQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHRpZiAodGhpcy5fdGFyZ2V0cy5oYXNPd25Qcm9wZXJ0eSh0aGlzLl90YXJnZXRJZCkpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX3RhcmdldHNbdGhpcy5fdGFyZ2V0SWRdO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBTZXQgdGhlIGN1cnJlbnQgdGFyZ2V0XHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcclxuXHQgKi9cclxuXHRzZXRUYXJnZXQ6IGZ1bmN0aW9uIChuYW1lKSB7XHJcblxyXG5cdFx0aWYgKHRoaXMuX3RhcmdldHMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcclxuXHRcdFx0dGhpcy5fdGFyZ2V0SWQgPSBuYW1lO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBTZXQgdGhlIGVsZW1lbnRcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gZWxcclxuXHQgKi9cclxuXHRzZXRFbGVtZW50OiBmdW5jdGlvbiAoZWwpIHtcclxuXHJcblx0XHRpZiAodGhpcy5fdGFyZ2V0SWQgPT09ICdlbGVtZW50Jykge1xyXG5cdFx0XHR0aGlzLmdldFRhcmdldCgpLnNldEVsZW1lbnQoZWwpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBFbmFibGUgbG9nZ2luZ1xyXG5cdCAqL1xyXG5cdGVuYWJsZTogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdHRoaXMuX2VuYWJsZWQgPSB0cnVlO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBEaXNhYmxlIGxvZ2dpbmdcclxuXHQgKi9cclxuXHRkaXNhYmxlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0dGhpcy5fZW5hYmxlZCA9IGZhbHNlO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBMb2cgdGFidWxhciBkYXRhXHJcblx0ICovXHJcblx0bG9nOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuX3dyaXRlKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCksICdsb2cnKTtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogTG9nIHRhYnVsYXIgZGF0YVxyXG5cdCAqL1xyXG5cdGVycm9yOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuX3dyaXRlKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCksICdlcnJvcicpO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBMb2cgdGFidWxhciBkYXRhXHJcblx0ICovXHJcblx0d2FybjogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdHJldHVybiB0aGlzLl93cml0ZShBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApLCAnd2FybicpO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBMb2cgdGFidWxhciBkYXRhXHJcblx0ICovXHJcblx0aW5mbzogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdHJldHVybiB0aGlzLl93cml0ZShBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApLCAnaW5mbycpO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBMb2cgdGFidWxhciBkYXRhXHJcblx0ICovXHJcblx0ZGVidWc6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5fd3JpdGUoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSwgJ2RlYnVnJyk7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIExvZyB0YWJ1bGFyIGRhdGFcclxuXHQgKi9cclxuXHR0YWJsZTogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdHJldHVybiB0aGlzLl93cml0ZShBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApLCAndGFibGUnKTtcclxuXHR9XHJcbn07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMb2dnaWVyOyIsIi8qKlxyXG4gKiBDb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zXHJcbiAqL1xyXG5mdW5jdGlvbiBTdGFja1BhcnNlciAocGFyYW1zKSB7XHJcblxyXG59XHJcblxyXG5cclxuLyoqXHJcbiAqIFByb3RvdHlwZSBtZXRob2RzXHJcbiAqL1xyXG5TdGFja1BhcnNlci5wcm90b3R5cGUgPSB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yXHJcblx0ICogQHR5cGUge0Z1bmN0aW9ufVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yOiBTdGFja1BhcnNlcixcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIEV4dHJhY3QgdGhlIGxpbmUgbnVtYmVyIGZyb20gYSBzdGFjayB0cmFjZVxyXG5cdCAqL1xyXG5cdGdldEluZm86IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHQvLyBOZXcgZXJyb3IgZm9yIHRoZSBzdGFjayBpbmZvXHJcblx0XHR2YXIgc3RhY2sgPSB0aGlzLl9nZW5lcmF0ZVN0YWNrVHJhY2UoKSxcclxuXHRcdFx0bGluZSxcclxuXHRcdFx0aW5mbyxcclxuXHRcdFx0ZmlsZSxcclxuXHRcdFx0bWV0aG9kLFxyXG5cdFx0XHRsaW5lTnVtYmVyLFxyXG5cdFx0XHRjaGFyYWN0ZXI7XHJcblxyXG5cdFx0Ly8gUGFyc2UgZGlmZmVyZW50IHR5cGVzIG9mIHRyYWNlc1xyXG5cdFx0aWYgKHN0YWNrLmluZGV4T2YoJ0Vycm9yJykgPT09IDApIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX2dldEluZm9WOChzdGFjayk7XHJcblx0XHR9XHJcblx0XHRlbHNlIGlmIChzdGFjay5pbmRleE9mKCdSZWZlcmVuY2VFcnJvcicpID09PSAwKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9nZXRJbmZvQ2hha3JhKHN0YWNrKTtcclxuXHRcdH1cclxuXHRcdC8vIFRPRE86IE5pdHJvIHN1cHBvcnRcclxuXHRcdC8vIGVsc2UgaWYgKHN0YWNrLmluZGV4T2YoJ1JlZmVyZW5jZUVycm9yJykgPT09IDApIHtcclxuXHRcdC8vIFx0cmV0dXJuIHRoaXMuX2dldEluZm9DaGFrcmEoc3RhY2spO1xyXG5cdFx0Ly8gfVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9nZXRJbmZvU3BpZGVyTW9ua2V5KHN0YWNrKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogR2V0IHRoZSBzdGFjayBpbmZvIGZvciBWOFxyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBzdGFja1xyXG5cdCAqL1xyXG5cdF9nZXRJbmZvVjg6IGZ1bmN0aW9uIChzdGFjaykge1xyXG5cclxuXHRcdC8vIFBhcnNlIHRoZSA2dGggbGluZSBvZiB0aGUgc3RhY2sgdHJhY2UgdG8gZ2V0IGxpbmUgaW5mb1xyXG5cdFx0dmFyIGxpbmUgPSBzdGFjay5zcGxpdCgnXFxuJylbNV0sXHJcblx0XHRcdGluZm8gPSBsaW5lLm1hdGNoKC8oPzphdFxccykoPzooW15cXChdezF9KSg/Olxcc1xcKCkoLiopfCgpKCkoLiopfCgpKCkoPGFub255bW91cz4pKShcXDpbMC05XXsxLH0pKFxcOlswLTldezEsfSkvKTtcclxuXHJcblx0XHQvLyBJZiB0aGVyZSBpcyBubyBpbmZvLCBvdXIgcmVnZXggZmFpbGVkIGJlY2F1c2Ugb2YgYmFkIHN0YWNrIGRhdGFcclxuXHRcdGlmICghaW5mbykge1xyXG5cdFx0XHRyZXR1cm4ge307XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gR2V0IHRoZSBsaW5lIGluZm9cclxuXHRcdHZhclx0bWV0aG9kID0gaW5mb1sxXSB8fCAnYW5vbnltb3VzJyxcclxuXHRcdFx0ZmlsZSA9IGluZm9bMl0gfHwgaW5mb1s1XSxcclxuXHRcdFx0bGluZU51bWJlciA9IHBhcnNlSW50KGluZm9bOV0uc3Vic3RyKDEpLCAxMCksXHJcblx0XHRcdGNoYXJhY3RlciA9IHBhcnNlSW50KGluZm9bMTBdLnN1YnN0cigxKSwgMTApO1xyXG5cclxuXHRcdC8vIFJldHVybiBhbiBvYmplY3QgdGhhdCB3aWxsIGJlIHVzZWQgdG8gbWFrZSBhIHN0cmluZyBsYXRlclxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0bWV0aG9kOiBtZXRob2QsXHJcblx0XHRcdGZpbGU6IGZpbGUsXHJcblx0XHRcdGxpbmU6IGxpbmVOdW1iZXIsXHJcblx0XHRcdGNoYXJhY3RlcjogY2hhcmFjdGVyXHJcblx0XHR9O1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBHZXQgdGhlIHN0YWNrIGluZm8gZm9yIFNwaWRlck1vbmtleVxyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBzdGFja1xyXG5cdCAqL1xyXG5cdF9nZXRJbmZvU3BpZGVyTW9ua2V5OiBmdW5jdGlvbiAoc3RhY2spIHtcclxuXHJcblx0XHQvLyBQYXJzZSB0aGUgNXRoIGxpbmUgb2YgdGhlIHN0YWNrIHRyYWNlIHRvIGdldCBsaW5lIGluZm9cclxuXHRcdHZhciBsaW5lID0gc3RhY2suc3BsaXQoJ1xcbicpWzRdLFxyXG5cdFx0XHRpbmZvID0gbGluZS5tYXRjaCgvKFteQF17MSx9fCkoPzpAKSguKikoXFw6WzAtOV17MSx9KS8pO1xyXG5cclxuXHRcdC8vIElmIHRoZXJlIGlzIG5vIGluZm8sIG91ciByZWdleCBmYWlsZWQgYmVjYXVzZSBvZiBiYWQgc3RhY2sgZGF0YVxyXG5cdFx0aWYgKCFpbmZvKSB7XHJcblx0XHRcdHJldHVybiB7fTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBHZXQgdGhlIGxpbmUgaW5mb1xyXG5cdFx0dmFyXHRtZXRob2QgPSBpbmZvWzFdIHx8ICdhbm9ueW1vdXMnLFxyXG5cdFx0XHRmaWxlID0gaW5mb1syXSxcclxuXHRcdFx0bGluZU51bWJlciA9IHBhcnNlSW50KGluZm9bM10uc3Vic3RyKDEpLCAxMCk7XHJcblxyXG5cdFx0Ly8gUmV0dXJuIGFuIG9iamVjdCB0aGF0IHdpbGwgYmUgdXNlZCB0byBtYWtlIGEgc3RyaW5nIGxhdGVyXHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRtZXRob2Q6IG1ldGhvZCxcclxuXHRcdFx0ZmlsZTogZmlsZSxcclxuXHRcdFx0bGluZTogbGluZU51bWJlcixcclxuXHRcdFx0Y2hhcmFjdGVyOiB1bmRlZmluZWRcclxuXHRcdH07XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldCB0aGUgc3RhY2sgaW5mbyBmb3IgQ2hha3JhXHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IHN0YWNrXHJcblx0ICovXHJcblx0X2dldEluZm9DaGFrcmE6IGZ1bmN0aW9uIChzdGFjaykge1xyXG5cclxuXHRcdC8vIFBhcnNlIHRoZSA2dGggbGluZSBvZiB0aGUgc3RhY2sgdHJhY2UgdG8gZ2V0IGxpbmUgaW5mb1xyXG5cdFx0dmFyIGxpbmUgPSBzdGFjay5zcGxpdCgnXFxuJylbNV0sXHJcblx0XHRcdGluZm8gPSBsaW5lLm1hdGNoKC8oPzphdFxccykoPzooW15cXChdezF9KSg/Olxcc1xcKCkoLiopfCgpKCkoLiopfCgpKCkoPGFub255bW91cz4pKShcXDpbMC05XXsxLH0pKFxcOlswLTldezEsfSkvKTtcclxuXHJcblx0XHQvLyBJZiB0aGVyZSBpcyBubyBpbmZvLCBvdXIgcmVnZXggZmFpbGVkIGJlY2F1c2Ugb2YgYmFkIHN0YWNrIGRhdGFcclxuXHRcdGlmICghaW5mbykge1xyXG5cdFx0XHRyZXR1cm4ge307XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gR2V0IHRoZSBsaW5lIGluZm9cclxuXHRcdHZhclx0bWV0aG9kID0gaW5mb1sxXSB8fCAnYW5vbnltb3VzJyxcclxuXHRcdFx0ZmlsZSA9IGluZm9bMl0gfHwgaW5mb1s1XSxcclxuXHRcdFx0bGluZU51bWJlciA9IHBhcnNlSW50KGluZm9bOV0uc3Vic3RyKDEpLCAxMCksXHJcblx0XHRcdGNoYXJhY3RlciA9IHBhcnNlSW50KGluZm9bMTBdLnN1YnN0cigxKSwgMTApO1xyXG5cclxuXHRcdC8vIFJldHVybiBhbiBvYmplY3QgdGhhdCB3aWxsIGJlIHVzZWQgdG8gbWFrZSBhIHN0cmluZyBsYXRlclxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0bWV0aG9kOiBtZXRob2QsXHJcblx0XHRcdGZpbGU6IGZpbGUsXHJcblx0XHRcdGxpbmU6IGxpbmVOdW1iZXIsXHJcblx0XHRcdGNoYXJhY3RlcjogY2hhcmFjdGVyXHJcblx0XHR9O1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBHZW5lcmF0ZSBhIHN0YWNrIHRyYWNlXHJcblx0ICogQHJldHVybiB7U3RyaW5nfSBUaGUgc3RhY2sgdHJhY2VcclxuXHQgKi9cclxuXHRfZ2VuZXJhdGVTdGFja1RyYWNlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0Ly8gQ3JlYXRlIGEgbmV3IGVycm9yXHJcblx0XHR2YXIgZXJyb3IgPSBuZXcgRXJyb3IoKTtcclxuXHJcblx0XHQvLyBJbiBzb21lIGVuZ2luZXMsIHRoZSBlcnJvciBkb2Vzbid0IGNvbnRhaW4gYSBzdGFjay4gR290dGEgdGhyb3cgYW4gZXJyb3IgaW5zdGVhZCFcclxuXHRcdGlmICghZXJyb3Iuc3RhY2spIHtcclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRpcy5ub3QuZnVuYygpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhdGNoIChlKSB7XHJcblx0XHRcdFx0ZXJyb3IgPSBlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGVycm9yLnN0YWNrO1xyXG5cdH1cclxufTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFN0YWNrUGFyc2VyOyIsIi8qKlxyXG4gKiBDb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zXHJcbiAqL1xyXG5mdW5jdGlvbiBDb25zb2xlVGFyZ2V0IChwYXJhbXMpIHtcclxuXHJcbn1cclxuXHJcblxyXG4vKipcclxuICogUHJvdG90eXBlIG1ldGhvZHNcclxuICovXHJcbkNvbnNvbGVUYXJnZXQucHJvdG90eXBlID0ge1xyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3RvclxyXG5cdCAqIEB0eXBlIHtGdW5jdGlvbn1cclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcjogQ29uc29sZVRhcmdldCxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFdyaXRlIHRvIHRoZSBjb25zb2xlXHJcblx0ICogQHBhcmFtIHtBcnJheX0gYXJnc1xyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcclxuXHQgKi9cclxuXHR3cml0ZTogZnVuY3Rpb24gKGFyZ3MsIG1ldGhvZCkge1xyXG5cclxuXHRcdC8vIE1ha2Ugc3VyZSB0aGVyZSBpcyBhIGNvbnNvbGVcclxuXHRcdGlmIChjb25zb2xlKSB7XHJcblxyXG5cdFx0XHQvLyBJZiB0aGVyZSBpcyBubyBtZXRob2QsIHJldmVydCB0byBsb2dcclxuXHRcdFx0aWYgKCFjb25zb2xlW21ldGhvZF0pIHtcclxuXHJcblx0XHRcdFx0aWYgKCFjb25zb2xlLmxvZykge1xyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdG1ldGhvZCA9ICdsb2cnO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gQXBwbHkgd2lsbCBtYWludGFpbiBjb250ZXh0LCBidXQgaXMgbm90IGFsd2F5cyBhdmFpbGFibGVcclxuXHRcdFx0aWYgKGNvbnNvbGVbbWV0aG9kXS5hcHBseSkge1xyXG5cdFx0XHRcdGNvbnNvbGVbbWV0aG9kXS5hcHBseShjb25zb2xlLCBhcmdzKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRjb25zb2xlW21ldGhvZF0oYXJncyk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBhcmdzO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbnNvbGVUYXJnZXQ7IiwiLyoqXHJcbiAqIENvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXNcclxuICovXHJcbmZ1bmN0aW9uIEVsZW1lbnRUYXJnZXQgKHBhcmFtcykge1xyXG5cclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBQcm90b3R5cGUgbWV0aG9kc1xyXG4gKi9cclxuRWxlbWVudFRhcmdldC5wcm90b3R5cGUgPSB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yXHJcblx0ICogQHR5cGUge0Z1bmN0aW9ufVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yOiBFbGVtZW50VGFyZ2V0LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGVsZW1lbnQgdG8gbG9nIHRvXHJcblx0ICogQHR5cGUge01peGVkfVxyXG5cdCAqL1xyXG5cdF9lbGVtZW50OiB1bmRlZmluZWQsXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBCdWlsZCBhIHN0cmluZyB0byBsb2cgb3V0XHJcblx0ICogQHBhcmFtIHtPYmplY3R9IHBhcmFtc1xyXG5cdCAqIEByZXR1cm4ge1N0cmluZ31cclxuXHQgKi9cclxuXHRfYnVpbGRMb2dTdHJpbmc6IGZ1bmN0aW9uIChwYXJhbXMpIHtcclxuXHJcblx0XHR2YXIgc3RyID0gJycsXHJcblx0XHRcdGxlbiA9IHBhcmFtcy5sZW5ndGgsXHJcblx0XHRcdGkgPSAwO1xyXG5cclxuXHRcdGZvciAoaTsgaSA8IGxlbjsgaSs9MSkge1xyXG5cdFx0XHRzdHIgKz0gcGFyYW1zW2ldICsgJyAnO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBzdHIuc2xpY2UoMCwgLTEpO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBXcml0ZSBhIGxvZyB0byBhbiBlbGVtZW50XHJcblx0ICovXHJcblx0X2xvZzogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdC8vIE1ha2Ugc3VyZSB3ZSBoYXZlIGFuIGVsZW1lbnRcclxuXHRcdGlmICghdGhpcy5fY2hlY2tFbGVtZW50KCkpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIE5ldyBlbGVtZW50XHJcblx0XHR2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHJcblx0XHQvLyBTZXQgcHJvcGVydGllc1xyXG5cdFx0ZWwuY2xhc3NOYW1lID0gJ2xvZyc7XHJcblx0XHRlbC5pbm5lckhUTUwgPSB0aGlzLl9idWlsZExvZ1N0cmluZyhhcmd1bWVudHMpO1xyXG5cclxuXHRcdC8vIEFkZCB0aGUgbG9nXHJcblx0XHR0aGlzLl9lbGVtZW50LmFwcGVuZENoaWxkKGVsKTtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogV3JpdGUgYW4gZXJyb3IgdG8gYW4gZWxlbWVudFxyXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFyZ3NcclxuXHQgKi9cclxuXHQvLyBfZXJyb3I6IGZ1bmN0aW9uIChhcmdzKSB7XHJcblxyXG5cdC8vIH07XHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBXcml0ZSBhIHdhcm5pbmcgdG8gYW4gZWxlbWVudFxyXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFyZ3NcclxuXHQgKi9cclxuXHQvLyBfd2FybjogZnVuY3Rpb24gKGFyZ3MpIHtcclxuXHJcblx0Ly8gfTtcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFdyaXRlIGluZm8gdG8gYW4gZWxlbWVudFxyXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFyZ3NcclxuXHQgKi9cclxuXHQvLyBfaW5mbzogZnVuY3Rpb24gKGFyZ3MpIHtcclxuXHJcblx0Ly8gfTtcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFdyaXRlIGEgZGVidWcgdG8gYW4gZWxlbWVudFxyXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFyZ3NcclxuXHQgKi9cclxuXHQvLyBfZGVidWc6IGZ1bmN0aW9uIChhcmdzKSB7XHJcblxyXG5cdC8vIH07XHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBXcml0ZSBhIHRhYmxlIHRvIGFuIGVsZW1lbnRcclxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcmdzXHJcblx0ICovXHJcblx0Ly8gX3RhYmxlOiBmdW5jdGlvbiAoYXJncykge1xyXG5cclxuXHQvLyB9O1xyXG5cclxuXHJcblx0LyoqXHJcblx0ICogQ2hlY2sgdGhhdCB0aGVyZSBpcyBhbiBlbGVtZW50IGFuZCBjcmVhdGUgaWYgd2UgZG9uJ3QgaGF2ZSBvbmVcclxuXHQgKi9cclxuXHRfY2hlY2tFbGVtZW50OiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0Ly8gUmV0dXJuIHRoZSBlbGVtZW50IGlmIHdlIGhhdmUgaXRcclxuXHRcdGlmICh0aGlzLl9lbGVtZW50KSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9lbGVtZW50O1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFRyeSB0byBjcmVhdGVcclxuXHRcdHJldHVybiB0aGlzLl9jcmVhdGVFbGVtZW50KCk7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZSBhbiBlbGVtZW50IHRvIHdyaXRlIHRvIGFuZCB0cnkgdG8gYWRkIGl0IHRvIHRoZSBib2R5XHJcblx0ICovXHJcblx0X2NyZWF0ZUVsZW1lbnQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHQvLyBJZiB0aGVyZSBpcyBubyB3aW5kb3cgb2JqZWN0LCB3ZSdyZSBTT0xcclxuXHRcdGlmICghZG9jdW1lbnQpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIENyZWF0ZSB0aGUgZWxlbWVudFxyXG5cdFx0dGhpcy5fZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cclxuXHRcdC8vIFNldCBlbGVtZW50IHByb3BlcnRpZXNcclxuXHRcdHRoaXMuX2VsZW1lbnQuY2xhc3NOYW1lID0gJ2xvZ2dpZXInO1xyXG5cclxuXHRcdC8vIEFwcGVuZCBpdCB0byB0aGUgZG9jdW1lbnRcclxuXHRcdGRvY3VtZW50LmJvZHkuaW5zZXJ0QmVmb3JlKHRoaXMuX2VsZW1lbnQsIGRvY3VtZW50LmJvZHkuZmlyc3RDaGlsZCk7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuX2VsZW1lbnQ7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFdyaXRlIHRvIHRoZSBlbGVtZW50XHJcblx0ICogQHBhcmFtIHtBcnJheX0gYXJnc1xyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcclxuXHQgKi9cclxuXHR3cml0ZTogZnVuY3Rpb24gKGFyZ3MsIG1ldGhvZCkge1xyXG5cclxuXHRcdC8vIE1ha2Ugc3VyZSB3ZSBoYXZlIGFuIGVsZW1lbnRcclxuXHRcdGlmICghdGhpcy5fY2hlY2tFbGVtZW50KCkpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFRoZSBtZXRob2QgbmFtZVxyXG5cdFx0dmFyIG1ldGhvZE5hbWUgPSAnXycgKyBtZXRob2QsXHJcblx0XHRcdGRlZmF1bHRNZXRob2ROYW1lID0gJ19sb2cnO1xyXG5cclxuXHRcdC8vIElmIHRoZXJlIGlzIG5vIG1ldGhvZCwgcmV2ZXJ0IHRvIGRlZmF1bHRcclxuXHRcdGlmICghdGhpc1ttZXRob2ROYW1lXSkge1xyXG5cclxuXHRcdFx0bWV0aG9kTmFtZSA9IGRlZmF1bHRNZXRob2ROYW1lO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIENhbGwgdGhlIG1ldGhvZFxyXG5cdFx0dGhpc1ttZXRob2ROYW1lXShhcmdzKTtcclxuXHJcblx0XHRyZXR1cm4gYXJncztcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogU2V0IHRoZSBlbGVtZW50IHdlJ2xsIHdyaXRlIHRvXHJcblx0ICogQHBhcmFtIHtPYmplY3R9IGVsXHJcblx0ICovXHJcblx0c2V0RWxlbWVudDogZnVuY3Rpb24gKGVsKSB7XHJcblxyXG5cdFx0dGhpcy5fZWxlbWVudCA9IGVsO1xyXG5cdH1cclxufTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEVsZW1lbnRUYXJnZXQ7Il19
(1)
});
