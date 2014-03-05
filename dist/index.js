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
		return '(' + params.method + '@' + params.file + ':' + params.line + (params.character !== undefined ? ':' + params.character : '') + ')';
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
			className = className.replace(this._enabledClassName, '');
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
	 * Build a content element
	 * @param {Mixed} content
	 * @param {Object} params
	 */
	_buildContent: function (content, params) {

		params = params || {};

		// New element
		var el,
			className = params.className || 'content',
			type = typeof content;

		//
		switch (type) {
			case 'object':
				el = this._buildObjectContent(content);
				break;
			default:
				el = document.createElement('span');
				el.innerHTML = content;
				break;
		}

		// Set the class name
		el.className = className + ' ' + type;

		return el;
	},


	/**
	 * Build a content element from a hash
	 * @param {Object} obj
	 */
	_buildObjectContent: function (obj) {

		var el = document.createElement('span'),
			has = Object.prototype.hasOwnProperty,
			key;

		// Loop
		for (key in obj) {

			// Make sure we don't bother with the prototype
			if (has.call(obj, key)) {
				el.appendChild(this._buildObjectContentRow(obj[key], key));
			}
		}

		el.className = 'object';

		return el;
	},


	/**
	 * Build a row of object content
	 * @param {Mixed} value
	 * @param {Mixed} key
	 */
	_buildObjectContentRow: function (value, key) {

		var el = document.createElement('span');

		el.appendChild(this._buildObjectContentKey(key));
		el.appendChild(this._buildObjectContentValue(value));

		el.className = 'row';

		return el;
	},


	/**
	 * Build a content key element
	 * @param {Mixed} key
	 */
	_buildObjectContentKey: function (key) {

		var el = document.createElement('span');
		el.innerHTML = key;
		el.className = 'key';
		return el;
	},


	/**
	 * Build a content value element
	 * @param {Mixed} value
	 */
	_buildObjectContentValue: function (value) {

		var el,
			type = typeof value;

		switch (type) {
			case 'object':
				el = this._buildObjectContent(value);
				break;
			default:
				el = document.createElement('span');
				el.innerHTML = value;
				break;
		}

		el.className = type;

		return el;
	},


	/**
	 * Write a log to an element
	 */
	_log: function () {

		// Make sure we have an element
		if (!this._checkElement()) {
			return;
		}

		// New elements
		var el = document.createElement('div'),
			info = document.createElement('span');

		// Last param is the stack info
		var params = arguments,
			stackInfo = Array.prototype.pop.call(params);

		// Content string
		for (var i = 0; i < params.length; i+=1) {
			el.appendChild(this._buildContent(params[i]));
		}

		// Info string
		info.innerHTML = stackInfo;
		info.className = 'info';

		// Add children to the element
		el.appendChild(info);

		// Add the element
		el.className = 'log';
		this._element.appendChild(el);

		return el;
	},


	/**
	 * Write an error to an element
	 * @param {Array} args
	 */
	_error: function () {

		var el = this._log.apply(this, arguments);

		el.className = 'log error';

		return el;
	},


	/**
	 * Write a warning to an element
	 * @param {Array} args
	 */
	_warn: function () {

		var el = this._log.apply(this, arguments);

		el.className = 'log warn';

		return el;
	},


	/**
	 * Write info to an element
	 * @param {Array} args
	 */
	_info: function () {

		var el = this._log.apply(this, arguments);

		el.className = 'log info';

		return el;
	},


	/**
	 * Write a debug to an element
	 * @param {Array} args
	 */
	_debug: function () {

		var el = this._log.apply(this, arguments);

		el.className = 'log debug';

		return el;
	},


	/**
	 * Write a table to an element
	 * @param {Array} args
	 */
	_table: function () {

		var el = this._log.apply(this, arguments);

		el.className = 'log table';

		return el;
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
		this[methodName].apply(this, args);

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
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJXOlxcUGVyc29uYWxcXGxvZ2dpZXJcXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiVzovUGVyc29uYWwvbG9nZ2llci9zcmMvZmFrZV85ZDRiNmVjZS5qcyIsIlc6L1BlcnNvbmFsL2xvZ2dpZXIvc3JjL2hlbHBlcnMvc3RhY2stcGFyc2VyLmpzIiwiVzovUGVyc29uYWwvbG9nZ2llci9zcmMvdGFyZ2V0cy9jb25zb2xlLmpzIiwiVzovUGVyc29uYWwvbG9nZ2llci9zcmMvdGFyZ2V0cy9lbGVtZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgQ29uc29sZVRhcmdldCA9IHJlcXVpcmUoJy4vdGFyZ2V0cy9jb25zb2xlJyksXHJcblx0RWxlbWVudFRhcmdldCA9IHJlcXVpcmUoJy4vdGFyZ2V0cy9lbGVtZW50JyksXHJcblx0U3RhY2tQYXJzZXIgPSByZXF1aXJlKCcuL2hlbHBlcnMvc3RhY2stcGFyc2VyJyk7XHJcblxyXG4vKipcclxuICogQ29uc3RydWN0b3JcclxuICogQHBhcmFtIHtPYmplY3R9IHBhcmFtc1xyXG4gKi9cclxuZnVuY3Rpb24gTG9nZ2llciAocGFyYW1zKSB7XHJcblxyXG5cdHBhcmFtcyA9IHBhcmFtcyB8fCB7fTtcclxuXHJcblx0Ly8gVGFyZ2V0XHJcblx0aWYgKHBhcmFtcy50YXJnZXQpIHtcclxuXHRcdHRoaXMudGFyZ2V0KHBhcmFtcy50YXJnZXQpO1xyXG5cdH1cclxuXHJcblx0Ly8gTG9nZ2luZyBlbGVtZW50XHJcblx0aWYgKHBhcmFtcy5lbGVtZW50KSB7XHJcblx0XHR0aGlzLmVsZW1lbnQocGFyYW1zLmVsZW1lbnQpO1xyXG5cdH1cclxuXHJcblx0Ly8gRW5hYmxlZFxyXG5cdGlmIChwYXJhbXMuZW5hYmxlZCAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHR0aGlzLl9lbmFibGVkID0gcGFyYW1zLmVuYWJsZWQ7XHJcblx0fVxyXG5cclxuXHQvLyBTZXQgYSBjbGFzcyBvbiB0aGUgYm9keVxyXG5cdGlmICh0aGlzLl9lbmFibGVkKSB7XHJcblx0XHR0aGlzLmVuYWJsZSgpO1xyXG5cdH1cclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBMb2cgbGV2ZWxzXHJcbiAqIEB0eXBlIHtBcnJheX1cclxuICovXHJcbnZhciBsb2dMZXZlbHMgPSB7XHJcblx0XHQnZXJyb3InOiAxLFxyXG5cdFx0J3dhcm4nOiAyLFxyXG5cdFx0J2RlYnVnJzogNCxcclxuXHRcdCdpbmZvJzogOCxcclxuXHRcdCdsb2cnOiAxNlxyXG5cdH07XHJcblxyXG5cclxuLyoqXHJcbiAqIFByb3RvdHlwZSBtZXRob2RzXHJcbiAqL1xyXG5Mb2dnaWVyLnByb3RvdHlwZSA9IHtcclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3JcclxuXHQgKiBAdHlwZSB7RnVuY3Rpb259XHJcblx0ICovXHJcblx0Y29uc3RydWN0b3I6IExvZ2dpZXIsXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBJcyBsb2dnaW5nIGVuYWJsZWQ/XHJcblx0ICogQHR5cGUge0Jvb2xlYW59XHJcblx0ICovXHJcblx0X2VuYWJsZWQ6IHRydWUsXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgbG9nZ2luZyB0YXJnZXRcclxuXHQgKiBAdHlwZSB7U3RyaW5nfVxyXG5cdCAqL1xyXG5cdF90YXJnZXRJZDogJ2NvbnNvbGUnLFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogUG9zc2libGUgbG9nZ2luZyB0YXJnZXRzXHJcblx0ICogQHR5cGUge09iamVjdH1cclxuXHQgKi9cclxuXHRfdGFyZ2V0czoge1xyXG5cdFx0J2NvbnNvbGUnOiBuZXcgQ29uc29sZVRhcmdldCgpLFxyXG5cdFx0J2VsZW1lbnQnOiBuZXcgRWxlbWVudFRhcmdldCgpXHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIENsYXNzIG5hbWUgZm9yIHRoZSBib2R5IHdoZW4gd2UncmUgZW5hYmxlZFxyXG5cdCAqIEB0eXBlIHtTdHJpbmd9XHJcblx0ICovXHJcblx0X2VuYWJsZWRDbGFzc05hbWU6ICdsb2dnaWVyLWVuYWJsZWQnLFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogU3RhY2sgcGFyc2VyIGhlbHBlclxyXG5cdCAqIEB0eXBlIHtPYmplY3R9XHJcblx0ICovXHJcblx0X3N0YWNrUGFyc2VyOiBuZXcgU3RhY2tQYXJzZXIoKSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIExvZyBsZXZlbHNcclxuXHQgKiBAdHlwZSB7T2JqZWN0fVxyXG5cdCAqL1xyXG5cdF9sb2dMZXZlbHM6IGxvZ0xldmVscyxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBjdXJyZW50IGxvZyBsZXZlbFxyXG5cdCAqIEB0eXBlIHtOdW1iZXJ9XHJcblx0ICovXHJcblx0X2xvZ0xldmVsOiBsb2dMZXZlbHMuZXJyb3IgfCBsb2dMZXZlbHMud2FybiB8IGxvZ0xldmVscy5kZWJ1ZyB8IGxvZ0xldmVscy5sb2cgfCBsb2dMZXZlbHMuaW5mbyxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIERvZXMgdGhlIGFjdHVhbCB3cml0aW5nXHJcblx0ICogQHBhcmFtIHtBcnJheX0gYXJnc1xyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcclxuXHQgKi9cclxuXHRfd3JpdGU6IGZ1bmN0aW9uIChhcmdzLCBtZXRob2QpIHtcclxuXHJcblx0XHQvLyBEb24ndCBsb2cgaWYgd2UncmUgbm90IGVuYWJsZWRcclxuXHRcdGlmICghdGhpcy5fZW5hYmxlZCB8fCAhKHRoaXMuX2xvZ0xldmVsICYgKHRoaXMuX2xvZ0xldmVsc1ttZXRob2RdIHx8IHRoaXMuX2xvZ0xldmVsc1snbG9nJ10pKSkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gVGFibGUgbG9nZ2luZyBkb2Vzbid0IGxpa2UgZXh0cmEgZGF0YVxyXG5cdFx0aWYgKG1ldGhvZCAhPT0gJ3RhYmxlJykge1xyXG5cclxuXHRcdFx0Ly8gRmlsZSBpbmZvIHRvIGFwcGVuZFxyXG5cdFx0XHR2YXIgaW5mbyA9IHRoaXMuX3N0YWNrUGFyc2VyLmdldEluZm8oKTtcclxuXHJcblx0XHRcdC8vIEFwcGVuZCB0aGUgaW5mb1xyXG5cdFx0XHRhcmdzLnB1c2godGhpcy5fYnVpbGRTdGFja0luZm9TdHJpbmcoaW5mbykpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFdyaXRlIG1ldGhvZCBiYXNlZCBvbiB0YXJnZXRcclxuXHRcdHJldHVybiB0aGlzLnRhcmdldCgpLndyaXRlKGFyZ3MsIG1ldGhvZCk7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIEJ1aWxkIGEgc3RyaW5nIG9mIHN0YWNrIGluZm9cclxuXHQgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zXHJcblx0ICogQHJldHVybiB7U3RyaW5nfVxyXG5cdCAqL1xyXG5cdF9idWlsZFN0YWNrSW5mb1N0cmluZzogZnVuY3Rpb24gKHBhcmFtcykge1xyXG5cclxuXHRcdC8vIGNvbnNvbGUubG9nKF9fZmlsZW5hbWUsIHBhcmFtcyk7XHJcblx0XHRyZXR1cm4gJygnICsgcGFyYW1zLm1ldGhvZCArICdAJyArIHBhcmFtcy5maWxlICsgJzonICsgcGFyYW1zLmxpbmUgKyAocGFyYW1zLmNoYXJhY3RlciAhPT0gdW5kZWZpbmVkID8gJzonICsgcGFyYW1zLmNoYXJhY3RlciA6ICcnKSArICcpJztcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogQWRkIGEgY2xhc3MgdG8gdGhlIGJvZHkgdG8gcmVmbGVjdCB0aGUgZW5hYmxlZCBzdGF0ZVxyXG5cdCAqL1xyXG5cdF9hZGRCb2R5Q2xhc3M6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHR2YXIgY2xhc3NOYW1lID0gZG9jdW1lbnQuYm9keS5jbGFzc05hbWUsXHJcblx0XHRcdHByZXNlbnQgPSBjbGFzc05hbWUuaW5kZXhPZih0aGlzLl9lbmFibGVkQ2xhc3NOYW1lKTtcclxuXHJcblx0XHRpZiAocHJlc2VudCA9PT0gLTEpIHtcclxuXHRcdFx0Y2xhc3NOYW1lID0gY2xhc3NOYW1lICsgJyAnICsgdGhpcy5fZW5hYmxlZENsYXNzTmFtZTtcclxuXHRcdFx0ZG9jdW1lbnQuYm9keS5jbGFzc05hbWUgPSBjbGFzc05hbWUucmVwbGFjZSgvXlxccyt8XFxzKyQvZywnJyk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlbW92ZSBhIGNsYXNzIGZyb20gdGhlIGJvZHkgdG8gcmVmbGVjdCB0aGUgZGlzYWJsZWQgc3RhdGVcclxuXHQgKi9cclxuXHRfcmVtb3ZlQm9keUNsYXNzOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0dmFyIGNsYXNzTmFtZSA9IGRvY3VtZW50LmJvZHkuY2xhc3NOYW1lLFxyXG5cdFx0XHRwcmVzZW50ID0gY2xhc3NOYW1lLmluZGV4T2YodGhpcy5fZW5hYmxlZENsYXNzTmFtZSk7XHJcblxyXG5cdFx0Y29uc29sZS5sb2cocHJlc2VudCk7XHJcblx0XHRpZiAocHJlc2VudCAhPT0gLTEpIHtcclxuXHRcdFx0Y2xhc3NOYW1lID0gY2xhc3NOYW1lLnJlcGxhY2UodGhpcy5fZW5hYmxlZENsYXNzTmFtZSwgJycpO1xyXG5cdFx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTmFtZSA9IGNsYXNzTmFtZTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogU2V0IG9yIGdldCB0aGUgY3VycmVudCB0YXJnZXRcclxuXHQgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxyXG5cdCAqIEByZXR1cm4ge09iamVjdH1cclxuXHQgKi9cclxuXHR0YXJnZXQ6IGZ1bmN0aW9uIChuYW1lKSB7XHJcblxyXG5cdFx0aWYgKG5hbWUgIT09IHVuZGVmaW5lZCAmJiB0aGlzLl90YXJnZXRzLmhhc093blByb3BlcnR5KG5hbWUpKSB7XHJcblx0XHRcdHRoaXMuX3RhcmdldElkID0gbmFtZTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcy5fdGFyZ2V0c1t0aGlzLl90YXJnZXRJZF07XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFNldCBvciBnZXQgdGhlIGVsZW1lbnRcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gZWxcclxuXHQgKiBAcmV0dXJuIHtPYmplY3R9XHJcblx0ICovXHJcblx0ZWxlbWVudDogZnVuY3Rpb24gKGVsKSB7XHJcblxyXG5cdFx0aWYgKHRoaXMuX3RhcmdldElkID09PSAnZWxlbWVudCcpIHtcclxuXHJcblx0XHRcdGlmIChlbCAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0cmV0dXJuIHRoaXMudGFyZ2V0KCkuZWxlbWVudChlbCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiB0aGlzLnRhcmdldCgpLmVsZW1lbnQoKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogU2V0IG9yIGdldCB0aGUgbG9nIGxldmVsXHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IGxldmVsTmFtZVxyXG5cdCAqIEByZXR1cm4ge051bWJlcn1cclxuXHQgKi9cclxuXHRsb2dMZXZlbDogZnVuY3Rpb24gKGxldmVsTmFtZSkge1xyXG5cclxuXHRcdC8vIEdldCB0aGUgbGV2ZWxcclxuXHRcdGlmIChsZXZlbE5hbWUgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5fbG9nTGV2ZWw7XHJcblx0XHR9XHJcblxyXG5cclxuXHRcdC8vIFNldCB0aGUgbGV2ZWxcclxuXHRcdHZhciBrZXksXHJcblx0XHRcdGxldmVsID0gdGhpcy5fbG9nTGV2ZWxzW2xldmVsTmFtZV0sXHJcblx0XHRcdG1hc2sgPSAwLFxyXG5cdFx0XHRjdXJMZXZlbDtcclxuXHRcdGZvciAoa2V5IGluIHRoaXMuX2xvZ0xldmVscykge1xyXG5cdFx0XHRjdXJMZXZlbCA9IHRoaXMuX2xvZ0xldmVsc1trZXldO1xyXG5cdFx0XHRpZiAoY3VyTGV2ZWwgPD0gbGV2ZWwpIHtcclxuXHRcdFx0XHRtYXNrID0gbWFzayB8IGN1ckxldmVsO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuX2xvZ0xldmVsID0gbGV2ZWw7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIEVuYWJsZSBsb2dnaW5nXHJcblx0ICovXHJcblx0ZW5hYmxlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0dGhpcy5fZW5hYmxlZCA9IHRydWU7XHJcblx0XHR0aGlzLl9hZGRCb2R5Q2xhc3MoKTtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogRGlzYWJsZSBsb2dnaW5nXHJcblx0ICovXHJcblx0ZGlzYWJsZTogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdHRoaXMuX2VuYWJsZWQgPSBmYWxzZTtcclxuXHRcdHRoaXMuX3JlbW92ZUJvZHlDbGFzcygpO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBMb2cgdGFidWxhciBkYXRhXHJcblx0ICovXHJcblx0bG9nOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuX3dyaXRlKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCksICdsb2cnKTtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogTG9nIHRhYnVsYXIgZGF0YVxyXG5cdCAqL1xyXG5cdGVycm9yOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuX3dyaXRlKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCksICdlcnJvcicpO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBMb2cgdGFidWxhciBkYXRhXHJcblx0ICovXHJcblx0d2FybjogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdHJldHVybiB0aGlzLl93cml0ZShBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApLCAnd2FybicpO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBMb2cgdGFidWxhciBkYXRhXHJcblx0ICovXHJcblx0aW5mbzogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdHJldHVybiB0aGlzLl93cml0ZShBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApLCAnaW5mbycpO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBMb2cgdGFidWxhciBkYXRhXHJcblx0ICovXHJcblx0ZGVidWc6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5fd3JpdGUoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSwgJ2RlYnVnJyk7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIExvZyB0YWJ1bGFyIGRhdGFcclxuXHQgKi9cclxuXHR0YWJsZTogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdHJldHVybiB0aGlzLl93cml0ZShBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApLCAndGFibGUnKTtcclxuXHR9XHJcbn07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMb2dnaWVyOyIsIi8qKlxyXG4gKiBDb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zXHJcbiAqL1xyXG5mdW5jdGlvbiBTdGFja1BhcnNlciAocGFyYW1zKSB7XHJcblxyXG59XHJcblxyXG5cclxuLyoqXHJcbiAqIFByb3RvdHlwZSBtZXRob2RzXHJcbiAqL1xyXG5TdGFja1BhcnNlci5wcm90b3R5cGUgPSB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yXHJcblx0ICogQHR5cGUge0Z1bmN0aW9ufVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yOiBTdGFja1BhcnNlcixcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIEV4dHJhY3QgdGhlIGxpbmUgbnVtYmVyIGZyb20gYSBzdGFjayB0cmFjZVxyXG5cdCAqL1xyXG5cdGdldEluZm86IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHQvLyBOZXcgZXJyb3IgZm9yIHRoZSBzdGFjayBpbmZvXHJcblx0XHR2YXIgc3RhY2sgPSB0aGlzLl9nZW5lcmF0ZVN0YWNrVHJhY2UoKSxcclxuXHRcdFx0bGluZSxcclxuXHRcdFx0aW5mbyxcclxuXHRcdFx0ZmlsZSxcclxuXHRcdFx0bWV0aG9kLFxyXG5cdFx0XHRsaW5lTnVtYmVyLFxyXG5cdFx0XHRjaGFyYWN0ZXI7XHJcblxyXG5cdFx0Ly8gUGFyc2UgZGlmZmVyZW50IHR5cGVzIG9mIHRyYWNlc1xyXG5cdFx0aWYgKHN0YWNrLmluZGV4T2YoJ0Vycm9yJykgPT09IDApIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX2dldEluZm9WOChzdGFjayk7XHJcblx0XHR9XHJcblx0XHRlbHNlIGlmIChzdGFjay5pbmRleE9mKCdSZWZlcmVuY2VFcnJvcicpID09PSAwKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9nZXRJbmZvQ2hha3JhKHN0YWNrKTtcclxuXHRcdH1cclxuXHRcdC8vIFRPRE86IE5pdHJvIHN1cHBvcnRcclxuXHRcdC8vIGVsc2UgaWYgKHN0YWNrLmluZGV4T2YoJ1JlZmVyZW5jZUVycm9yJykgPT09IDApIHtcclxuXHRcdC8vIFx0cmV0dXJuIHRoaXMuX2dldEluZm9DaGFrcmEoc3RhY2spO1xyXG5cdFx0Ly8gfVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9nZXRJbmZvU3BpZGVyTW9ua2V5KHN0YWNrKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogR2V0IHRoZSBzdGFjayBpbmZvIGZvciBWOFxyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBzdGFja1xyXG5cdCAqL1xyXG5cdF9nZXRJbmZvVjg6IGZ1bmN0aW9uIChzdGFjaykge1xyXG5cclxuXHRcdC8vIFBhcnNlIHRoZSA2dGggbGluZSBvZiB0aGUgc3RhY2sgdHJhY2UgdG8gZ2V0IGxpbmUgaW5mb1xyXG5cdFx0dmFyIGxpbmUgPSBzdGFjay5zcGxpdCgnXFxuJylbNV0sXHJcblx0XHRcdGluZm8gPSBsaW5lLm1hdGNoKC8oPzphdFxccykoPzooW15cXChdezF9KSg/Olxcc1xcKCkoLiopfCgpKCkoLiopfCgpKCkoPGFub255bW91cz4pKShcXDpbMC05XXsxLH0pKFxcOlswLTldezEsfSkvKTtcclxuXHJcblx0XHQvLyBJZiB0aGVyZSBpcyBubyBpbmZvLCBvdXIgcmVnZXggZmFpbGVkIGJlY2F1c2Ugb2YgYmFkIHN0YWNrIGRhdGFcclxuXHRcdGlmICghaW5mbykge1xyXG5cdFx0XHRyZXR1cm4ge307XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gR2V0IHRoZSBsaW5lIGluZm9cclxuXHRcdHZhclx0bWV0aG9kID0gaW5mb1sxXSB8fCAnYW5vbnltb3VzJyxcclxuXHRcdFx0ZmlsZSA9IGluZm9bMl0gfHwgaW5mb1s1XSxcclxuXHRcdFx0bGluZU51bWJlciA9IHBhcnNlSW50KGluZm9bOV0uc3Vic3RyKDEpLCAxMCksXHJcblx0XHRcdGNoYXJhY3RlciA9IHBhcnNlSW50KGluZm9bMTBdLnN1YnN0cigxKSwgMTApO1xyXG5cclxuXHRcdC8vIFJldHVybiBhbiBvYmplY3QgdGhhdCB3aWxsIGJlIHVzZWQgdG8gbWFrZSBhIHN0cmluZyBsYXRlclxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0bWV0aG9kOiBtZXRob2QsXHJcblx0XHRcdGZpbGU6IGZpbGUsXHJcblx0XHRcdGxpbmU6IGxpbmVOdW1iZXIsXHJcblx0XHRcdGNoYXJhY3RlcjogY2hhcmFjdGVyXHJcblx0XHR9O1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBHZXQgdGhlIHN0YWNrIGluZm8gZm9yIFNwaWRlck1vbmtleVxyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBzdGFja1xyXG5cdCAqL1xyXG5cdF9nZXRJbmZvU3BpZGVyTW9ua2V5OiBmdW5jdGlvbiAoc3RhY2spIHtcclxuXHJcblx0XHQvLyBQYXJzZSB0aGUgNXRoIGxpbmUgb2YgdGhlIHN0YWNrIHRyYWNlIHRvIGdldCBsaW5lIGluZm9cclxuXHRcdHZhciBsaW5lID0gc3RhY2suc3BsaXQoJ1xcbicpWzRdLFxyXG5cdFx0XHRpbmZvID0gbGluZS5tYXRjaCgvKFteQF17MSx9fCkoPzpAKSguKikoXFw6WzAtOV17MSx9KS8pO1xyXG5cclxuXHRcdC8vIElmIHRoZXJlIGlzIG5vIGluZm8sIG91ciByZWdleCBmYWlsZWQgYmVjYXVzZSBvZiBiYWQgc3RhY2sgZGF0YVxyXG5cdFx0aWYgKCFpbmZvKSB7XHJcblx0XHRcdHJldHVybiB7fTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBHZXQgdGhlIGxpbmUgaW5mb1xyXG5cdFx0dmFyXHRtZXRob2QgPSBpbmZvWzFdIHx8ICdhbm9ueW1vdXMnLFxyXG5cdFx0XHRmaWxlID0gaW5mb1syXSxcclxuXHRcdFx0bGluZU51bWJlciA9IHBhcnNlSW50KGluZm9bM10uc3Vic3RyKDEpLCAxMCk7XHJcblxyXG5cdFx0Ly8gUmV0dXJuIGFuIG9iamVjdCB0aGF0IHdpbGwgYmUgdXNlZCB0byBtYWtlIGEgc3RyaW5nIGxhdGVyXHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRtZXRob2Q6IG1ldGhvZCxcclxuXHRcdFx0ZmlsZTogZmlsZSxcclxuXHRcdFx0bGluZTogbGluZU51bWJlcixcclxuXHRcdFx0Y2hhcmFjdGVyOiB1bmRlZmluZWRcclxuXHRcdH07XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldCB0aGUgc3RhY2sgaW5mbyBmb3IgQ2hha3JhXHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IHN0YWNrXHJcblx0ICovXHJcblx0X2dldEluZm9DaGFrcmE6IGZ1bmN0aW9uIChzdGFjaykge1xyXG5cclxuXHRcdC8vIFBhcnNlIHRoZSA2dGggbGluZSBvZiB0aGUgc3RhY2sgdHJhY2UgdG8gZ2V0IGxpbmUgaW5mb1xyXG5cdFx0dmFyIGxpbmUgPSBzdGFjay5zcGxpdCgnXFxuJylbNV0sXHJcblx0XHRcdGluZm8gPSBsaW5lLm1hdGNoKC8oPzphdFxccykoPzooW15cXChdezF9KSg/Olxcc1xcKCkoLiopfCgpKCkoLiopfCgpKCkoPGFub255bW91cz4pKShcXDpbMC05XXsxLH0pKFxcOlswLTldezEsfSkvKTtcclxuXHJcblx0XHQvLyBJZiB0aGVyZSBpcyBubyBpbmZvLCBvdXIgcmVnZXggZmFpbGVkIGJlY2F1c2Ugb2YgYmFkIHN0YWNrIGRhdGFcclxuXHRcdGlmICghaW5mbykge1xyXG5cdFx0XHRyZXR1cm4ge307XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gR2V0IHRoZSBsaW5lIGluZm9cclxuXHRcdHZhclx0bWV0aG9kID0gaW5mb1sxXSB8fCAnYW5vbnltb3VzJyxcclxuXHRcdFx0ZmlsZSA9IGluZm9bMl0gfHwgaW5mb1s1XSxcclxuXHRcdFx0bGluZU51bWJlciA9IHBhcnNlSW50KGluZm9bOV0uc3Vic3RyKDEpLCAxMCksXHJcblx0XHRcdGNoYXJhY3RlciA9IHBhcnNlSW50KGluZm9bMTBdLnN1YnN0cigxKSwgMTApO1xyXG5cclxuXHRcdC8vIFJldHVybiBhbiBvYmplY3QgdGhhdCB3aWxsIGJlIHVzZWQgdG8gbWFrZSBhIHN0cmluZyBsYXRlclxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0bWV0aG9kOiBtZXRob2QsXHJcblx0XHRcdGZpbGU6IGZpbGUsXHJcblx0XHRcdGxpbmU6IGxpbmVOdW1iZXIsXHJcblx0XHRcdGNoYXJhY3RlcjogY2hhcmFjdGVyXHJcblx0XHR9O1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBHZW5lcmF0ZSBhIHN0YWNrIHRyYWNlXHJcblx0ICogQHJldHVybiB7U3RyaW5nfSBUaGUgc3RhY2sgdHJhY2VcclxuXHQgKi9cclxuXHRfZ2VuZXJhdGVTdGFja1RyYWNlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0Ly8gQ3JlYXRlIGEgbmV3IGVycm9yXHJcblx0XHR2YXIgZXJyb3IgPSBuZXcgRXJyb3IoKTtcclxuXHJcblx0XHQvLyBJbiBzb21lIGVuZ2luZXMsIHRoZSBlcnJvciBkb2Vzbid0IGNvbnRhaW4gYSBzdGFjay4gR290dGEgdGhyb3cgYW4gZXJyb3IgaW5zdGVhZCFcclxuXHRcdGlmICghZXJyb3Iuc3RhY2spIHtcclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRpcy5ub3QuZnVuYygpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhdGNoIChlKSB7XHJcblx0XHRcdFx0ZXJyb3IgPSBlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGVycm9yLnN0YWNrO1xyXG5cdH1cclxufTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFN0YWNrUGFyc2VyOyIsIi8qKlxyXG4gKiBDb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zXHJcbiAqL1xyXG5mdW5jdGlvbiBDb25zb2xlVGFyZ2V0IChwYXJhbXMpIHtcclxuXHJcbn1cclxuXHJcblxyXG4vKipcclxuICogUHJvdG90eXBlIG1ldGhvZHNcclxuICovXHJcbkNvbnNvbGVUYXJnZXQucHJvdG90eXBlID0ge1xyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3RvclxyXG5cdCAqIEB0eXBlIHtGdW5jdGlvbn1cclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcjogQ29uc29sZVRhcmdldCxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFdyaXRlIHRvIHRoZSBjb25zb2xlXHJcblx0ICogQHBhcmFtIHtBcnJheX0gYXJnc1xyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcclxuXHQgKi9cclxuXHR3cml0ZTogZnVuY3Rpb24gKGFyZ3MsIG1ldGhvZCkge1xyXG5cclxuXHRcdC8vIE1ha2Ugc3VyZSB0aGVyZSBpcyBhIGNvbnNvbGVcclxuXHRcdGlmIChjb25zb2xlKSB7XHJcblxyXG5cdFx0XHQvLyBJZiB0aGVyZSBpcyBubyBtZXRob2QsIHJldmVydCB0byBsb2dcclxuXHRcdFx0aWYgKCFjb25zb2xlW21ldGhvZF0pIHtcclxuXHJcblx0XHRcdFx0aWYgKCFjb25zb2xlLmxvZykge1xyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdG1ldGhvZCA9ICdsb2cnO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gQXBwbHkgd2lsbCBtYWludGFpbiBjb250ZXh0LCBidXQgaXMgbm90IGFsd2F5cyBhdmFpbGFibGVcclxuXHRcdFx0aWYgKGNvbnNvbGVbbWV0aG9kXS5hcHBseSkge1xyXG5cdFx0XHRcdGNvbnNvbGVbbWV0aG9kXS5hcHBseShjb25zb2xlLCBhcmdzKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRjb25zb2xlW21ldGhvZF0oYXJncyk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBhcmdzO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbnNvbGVUYXJnZXQ7IiwiLyoqXHJcbiAqIENvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXNcclxuICovXHJcbmZ1bmN0aW9uIEVsZW1lbnRUYXJnZXQgKHBhcmFtcykge1xyXG5cclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBQcm90b3R5cGUgbWV0aG9kc1xyXG4gKi9cclxuRWxlbWVudFRhcmdldC5wcm90b3R5cGUgPSB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yXHJcblx0ICogQHR5cGUge0Z1bmN0aW9ufVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yOiBFbGVtZW50VGFyZ2V0LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGVsZW1lbnQgdG8gbG9nIHRvXHJcblx0ICogQHR5cGUge01peGVkfVxyXG5cdCAqL1xyXG5cdF9lbGVtZW50OiB1bmRlZmluZWQsXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBCdWlsZCBhIGNvbnRlbnQgZWxlbWVudFxyXG5cdCAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRlbnRcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zXHJcblx0ICovXHJcblx0X2J1aWxkQ29udGVudDogZnVuY3Rpb24gKGNvbnRlbnQsIHBhcmFtcykge1xyXG5cclxuXHRcdHBhcmFtcyA9IHBhcmFtcyB8fCB7fTtcclxuXHJcblx0XHQvLyBOZXcgZWxlbWVudFxyXG5cdFx0dmFyIGVsLFxyXG5cdFx0XHRjbGFzc05hbWUgPSBwYXJhbXMuY2xhc3NOYW1lIHx8ICdjb250ZW50JyxcclxuXHRcdFx0dHlwZSA9IHR5cGVvZiBjb250ZW50O1xyXG5cclxuXHRcdC8vXHJcblx0XHRzd2l0Y2ggKHR5cGUpIHtcclxuXHRcdFx0Y2FzZSAnb2JqZWN0JzpcclxuXHRcdFx0XHRlbCA9IHRoaXMuX2J1aWxkT2JqZWN0Q29udGVudChjb250ZW50KTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuXHRcdFx0XHRlbC5pbm5lckhUTUwgPSBjb250ZW50O1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFNldCB0aGUgY2xhc3MgbmFtZVxyXG5cdFx0ZWwuY2xhc3NOYW1lID0gY2xhc3NOYW1lICsgJyAnICsgdHlwZTtcclxuXHJcblx0XHRyZXR1cm4gZWw7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIEJ1aWxkIGEgY29udGVudCBlbGVtZW50IGZyb20gYSBoYXNoXHJcblx0ICogQHBhcmFtIHtPYmplY3R9IG9ialxyXG5cdCAqL1xyXG5cdF9idWlsZE9iamVjdENvbnRlbnQ6IGZ1bmN0aW9uIChvYmopIHtcclxuXHJcblx0XHR2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyksXHJcblx0XHRcdGhhcyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHksXHJcblx0XHRcdGtleTtcclxuXHJcblx0XHQvLyBMb29wXHJcblx0XHRmb3IgKGtleSBpbiBvYmopIHtcclxuXHJcblx0XHRcdC8vIE1ha2Ugc3VyZSB3ZSBkb24ndCBib3RoZXIgd2l0aCB0aGUgcHJvdG90eXBlXHJcblx0XHRcdGlmIChoYXMuY2FsbChvYmosIGtleSkpIHtcclxuXHRcdFx0XHRlbC5hcHBlbmRDaGlsZCh0aGlzLl9idWlsZE9iamVjdENvbnRlbnRSb3cob2JqW2tleV0sIGtleSkpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0ZWwuY2xhc3NOYW1lID0gJ29iamVjdCc7XHJcblxyXG5cdFx0cmV0dXJuIGVsO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBCdWlsZCBhIHJvdyBvZiBvYmplY3QgY29udGVudFxyXG5cdCAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlXHJcblx0ICogQHBhcmFtIHtNaXhlZH0ga2V5XHJcblx0ICovXHJcblx0X2J1aWxkT2JqZWN0Q29udGVudFJvdzogZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcclxuXHJcblx0XHR2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcblxyXG5cdFx0ZWwuYXBwZW5kQ2hpbGQodGhpcy5fYnVpbGRPYmplY3RDb250ZW50S2V5KGtleSkpO1xyXG5cdFx0ZWwuYXBwZW5kQ2hpbGQodGhpcy5fYnVpbGRPYmplY3RDb250ZW50VmFsdWUodmFsdWUpKTtcclxuXHJcblx0XHRlbC5jbGFzc05hbWUgPSAncm93JztcclxuXHJcblx0XHRyZXR1cm4gZWw7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIEJ1aWxkIGEgY29udGVudCBrZXkgZWxlbWVudFxyXG5cdCAqIEBwYXJhbSB7TWl4ZWR9IGtleVxyXG5cdCAqL1xyXG5cdF9idWlsZE9iamVjdENvbnRlbnRLZXk6IGZ1bmN0aW9uIChrZXkpIHtcclxuXHJcblx0XHR2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcblx0XHRlbC5pbm5lckhUTUwgPSBrZXk7XHJcblx0XHRlbC5jbGFzc05hbWUgPSAna2V5JztcclxuXHRcdHJldHVybiBlbDtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogQnVpbGQgYSBjb250ZW50IHZhbHVlIGVsZW1lbnRcclxuXHQgKiBAcGFyYW0ge01peGVkfSB2YWx1ZVxyXG5cdCAqL1xyXG5cdF9idWlsZE9iamVjdENvbnRlbnRWYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XHJcblxyXG5cdFx0dmFyIGVsLFxyXG5cdFx0XHR0eXBlID0gdHlwZW9mIHZhbHVlO1xyXG5cclxuXHRcdHN3aXRjaCAodHlwZSkge1xyXG5cdFx0XHRjYXNlICdvYmplY3QnOlxyXG5cdFx0XHRcdGVsID0gdGhpcy5fYnVpbGRPYmplY3RDb250ZW50KHZhbHVlKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuXHRcdFx0XHRlbC5pbm5lckhUTUwgPSB2YWx1ZTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHJcblx0XHRlbC5jbGFzc05hbWUgPSB0eXBlO1xyXG5cclxuXHRcdHJldHVybiBlbDtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogV3JpdGUgYSBsb2cgdG8gYW4gZWxlbWVudFxyXG5cdCAqL1xyXG5cdF9sb2c6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHQvLyBNYWtlIHN1cmUgd2UgaGF2ZSBhbiBlbGVtZW50XHJcblx0XHRpZiAoIXRoaXMuX2NoZWNrRWxlbWVudCgpKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBOZXcgZWxlbWVudHNcclxuXHRcdHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxyXG5cdFx0XHRpbmZvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG5cclxuXHRcdC8vIExhc3QgcGFyYW0gaXMgdGhlIHN0YWNrIGluZm9cclxuXHRcdHZhciBwYXJhbXMgPSBhcmd1bWVudHMsXHJcblx0XHRcdHN0YWNrSW5mbyA9IEFycmF5LnByb3RvdHlwZS5wb3AuY2FsbChwYXJhbXMpO1xyXG5cclxuXHRcdC8vIENvbnRlbnQgc3RyaW5nXHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHBhcmFtcy5sZW5ndGg7IGkrPTEpIHtcclxuXHRcdFx0ZWwuYXBwZW5kQ2hpbGQodGhpcy5fYnVpbGRDb250ZW50KHBhcmFtc1tpXSkpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEluZm8gc3RyaW5nXHJcblx0XHRpbmZvLmlubmVySFRNTCA9IHN0YWNrSW5mbztcclxuXHRcdGluZm8uY2xhc3NOYW1lID0gJ2luZm8nO1xyXG5cclxuXHRcdC8vIEFkZCBjaGlsZHJlbiB0byB0aGUgZWxlbWVudFxyXG5cdFx0ZWwuYXBwZW5kQ2hpbGQoaW5mbyk7XHJcblxyXG5cdFx0Ly8gQWRkIHRoZSBlbGVtZW50XHJcblx0XHRlbC5jbGFzc05hbWUgPSAnbG9nJztcclxuXHRcdHRoaXMuX2VsZW1lbnQuYXBwZW5kQ2hpbGQoZWwpO1xyXG5cclxuXHRcdHJldHVybiBlbDtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogV3JpdGUgYW4gZXJyb3IgdG8gYW4gZWxlbWVudFxyXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFyZ3NcclxuXHQgKi9cclxuXHRfZXJyb3I6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHR2YXIgZWwgPSB0aGlzLl9sb2cuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHJcblx0XHRlbC5jbGFzc05hbWUgPSAnbG9nIGVycm9yJztcclxuXHJcblx0XHRyZXR1cm4gZWw7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFdyaXRlIGEgd2FybmluZyB0byBhbiBlbGVtZW50XHJcblx0ICogQHBhcmFtIHtBcnJheX0gYXJnc1xyXG5cdCAqL1xyXG5cdF93YXJuOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0dmFyIGVsID0gdGhpcy5fbG9nLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcblxyXG5cdFx0ZWwuY2xhc3NOYW1lID0gJ2xvZyB3YXJuJztcclxuXHJcblx0XHRyZXR1cm4gZWw7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFdyaXRlIGluZm8gdG8gYW4gZWxlbWVudFxyXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFyZ3NcclxuXHQgKi9cclxuXHRfaW5mbzogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdHZhciBlbCA9IHRoaXMuX2xvZy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG5cclxuXHRcdGVsLmNsYXNzTmFtZSA9ICdsb2cgaW5mbyc7XHJcblxyXG5cdFx0cmV0dXJuIGVsO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBXcml0ZSBhIGRlYnVnIHRvIGFuIGVsZW1lbnRcclxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcmdzXHJcblx0ICovXHJcblx0X2RlYnVnOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0dmFyIGVsID0gdGhpcy5fbG9nLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcblxyXG5cdFx0ZWwuY2xhc3NOYW1lID0gJ2xvZyBkZWJ1Zyc7XHJcblxyXG5cdFx0cmV0dXJuIGVsO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBXcml0ZSBhIHRhYmxlIHRvIGFuIGVsZW1lbnRcclxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcmdzXHJcblx0ICovXHJcblx0X3RhYmxlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0dmFyIGVsID0gdGhpcy5fbG9nLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcblxyXG5cdFx0ZWwuY2xhc3NOYW1lID0gJ2xvZyB0YWJsZSc7XHJcblxyXG5cdFx0cmV0dXJuIGVsO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBDaGVjayB0aGF0IHRoZXJlIGlzIGFuIGVsZW1lbnQgYW5kIGNyZWF0ZSBpZiB3ZSBkb24ndCBoYXZlIG9uZVxyXG5cdCAqL1xyXG5cdF9jaGVja0VsZW1lbnQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHQvLyBSZXR1cm4gdGhlIGVsZW1lbnQgaWYgd2UgaGF2ZSBpdFxyXG5cdFx0aWYgKHRoaXMuX2VsZW1lbnQpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX2VsZW1lbnQ7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gVHJ5IHRvIGNyZWF0ZVxyXG5cdFx0cmV0dXJuIHRoaXMuX2NyZWF0ZUVsZW1lbnQoKTtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlIGFuIGVsZW1lbnQgdG8gd3JpdGUgdG8gYW5kIHRyeSB0byBhZGQgaXQgdG8gdGhlIGJvZHlcclxuXHQgKi9cclxuXHRfY3JlYXRlRWxlbWVudDogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdC8vIElmIHRoZXJlIGlzIG5vIHdpbmRvdyBvYmplY3QsIHdlJ3JlIFNPTFxyXG5cdFx0aWYgKCFkb2N1bWVudCkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gQ3JlYXRlIHRoZSBlbGVtZW50XHJcblx0XHR0aGlzLl9lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblxyXG5cdFx0Ly8gU2V0IGVsZW1lbnQgcHJvcGVydGllc1xyXG5cdFx0dGhpcy5fZWxlbWVudC5jbGFzc05hbWUgPSAnbG9nZ2llcic7XHJcblxyXG5cdFx0Ly8gQXBwZW5kIGl0IHRvIHRoZSBkb2N1bWVudFxyXG5cdFx0ZG9jdW1lbnQuYm9keS5pbnNlcnRCZWZvcmUodGhpcy5fZWxlbWVudCwgZG9jdW1lbnQuYm9keS5maXJzdENoaWxkKTtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5fZWxlbWVudDtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogV3JpdGUgdG8gdGhlIGVsZW1lbnRcclxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcmdzXHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxyXG5cdCAqL1xyXG5cdHdyaXRlOiBmdW5jdGlvbiAoYXJncywgbWV0aG9kKSB7XHJcblxyXG5cdFx0Ly8gTWFrZSBzdXJlIHdlIGhhdmUgYW4gZWxlbWVudFxyXG5cdFx0aWYgKCF0aGlzLl9jaGVja0VsZW1lbnQoKSkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gVGhlIG1ldGhvZCBuYW1lXHJcblx0XHR2YXIgbWV0aG9kTmFtZSA9ICdfJyArIG1ldGhvZCxcclxuXHRcdFx0ZGVmYXVsdE1ldGhvZE5hbWUgPSAnX2xvZyc7XHJcblxyXG5cdFx0Ly8gSWYgdGhlcmUgaXMgbm8gbWV0aG9kLCByZXZlcnQgdG8gZGVmYXVsdFxyXG5cdFx0aWYgKCF0aGlzW21ldGhvZE5hbWVdKSB7XHJcblx0XHRcdG1ldGhvZE5hbWUgPSBkZWZhdWx0TWV0aG9kTmFtZTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBDYWxsIHRoZSBtZXRob2RcclxuXHRcdHRoaXNbbWV0aG9kTmFtZV0uYXBwbHkodGhpcywgYXJncyk7XHJcblxyXG5cdFx0cmV0dXJuIGFyZ3M7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFNldCB0aGUgZWxlbWVudCB3ZSdsbCB3cml0ZSB0b1xyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBlbFxyXG5cdCAqL1xyXG5cdGVsZW1lbnQ6IGZ1bmN0aW9uIChlbCkge1xyXG5cclxuXHRcdGlmIChlbCAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdHRoaXMuX2VsZW1lbnQgPSBlbDtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcy5fZWxlbWVudDtcclxuXHR9XHJcbn07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFbGVtZW50VGFyZ2V0OyJdfQ==
(1)
});
