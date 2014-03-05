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
			info = line.match(/(?:at\s)(?:([^\(]{1,})(?:\s\()(.*)|()()(.*)|()()(<anonymous>))(\:[0-9]{1,})(\:[0-9]{1,})/);

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
		this._element.className = 'loggier generated';

		// Append it to the document
		document.body.insertBefore(this._element, document.body.firstChild);
		document.body.className += ' loggier-generated';

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJXOlxcUGVyc29uYWxcXGxvZ2dpZXJcXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiVzovUGVyc29uYWwvbG9nZ2llci9zcmMvZmFrZV8yMjU5OTZkOC5qcyIsIlc6L1BlcnNvbmFsL2xvZ2dpZXIvc3JjL2hlbHBlcnMvc3RhY2stcGFyc2VyLmpzIiwiVzovUGVyc29uYWwvbG9nZ2llci9zcmMvdGFyZ2V0cy9jb25zb2xlLmpzIiwiVzovUGVyc29uYWwvbG9nZ2llci9zcmMvdGFyZ2V0cy9lbGVtZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBDb25zb2xlVGFyZ2V0ID0gcmVxdWlyZSgnLi90YXJnZXRzL2NvbnNvbGUnKSxcclxuXHRFbGVtZW50VGFyZ2V0ID0gcmVxdWlyZSgnLi90YXJnZXRzL2VsZW1lbnQnKSxcclxuXHRTdGFja1BhcnNlciA9IHJlcXVpcmUoJy4vaGVscGVycy9zdGFjay1wYXJzZXInKTtcclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zXHJcbiAqL1xyXG5mdW5jdGlvbiBMb2dnaWVyIChwYXJhbXMpIHtcclxuXHJcblx0cGFyYW1zID0gcGFyYW1zIHx8IHt9O1xyXG5cclxuXHQvLyBUYXJnZXRcclxuXHRpZiAocGFyYW1zLnRhcmdldCkge1xyXG5cdFx0dGhpcy50YXJnZXQocGFyYW1zLnRhcmdldCk7XHJcblx0fVxyXG5cclxuXHQvLyBMb2dnaW5nIGVsZW1lbnRcclxuXHRpZiAocGFyYW1zLmVsZW1lbnQpIHtcclxuXHRcdHRoaXMuZWxlbWVudChwYXJhbXMuZWxlbWVudCk7XHJcblx0fVxyXG5cclxuXHQvLyBFbmFibGVkXHJcblx0aWYgKHBhcmFtcy5lbmFibGVkICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdHRoaXMuX2VuYWJsZWQgPSBwYXJhbXMuZW5hYmxlZDtcclxuXHR9XHJcblxyXG5cdC8vIFNldCBhIGNsYXNzIG9uIHRoZSBib2R5XHJcblx0aWYgKHRoaXMuX2VuYWJsZWQpIHtcclxuXHRcdHRoaXMuZW5hYmxlKCk7XHJcblx0fVxyXG59XHJcblxyXG5cclxuLyoqXHJcbiAqIExvZyBsZXZlbHNcclxuICogQHR5cGUge0FycmF5fVxyXG4gKi9cclxudmFyIGxvZ0xldmVscyA9IHtcclxuXHRcdCdlcnJvcic6IDEsXHJcblx0XHQnd2Fybic6IDIsXHJcblx0XHQnZGVidWcnOiA0LFxyXG5cdFx0J2luZm8nOiA4LFxyXG5cdFx0J2xvZyc6IDE2XHJcblx0fTtcclxuXHJcblxyXG4vKipcclxuICogUHJvdG90eXBlIG1ldGhvZHNcclxuICovXHJcbkxvZ2dpZXIucHJvdG90eXBlID0ge1xyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3RvclxyXG5cdCAqIEB0eXBlIHtGdW5jdGlvbn1cclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcjogTG9nZ2llcixcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIElzIGxvZ2dpbmcgZW5hYmxlZD9cclxuXHQgKiBAdHlwZSB7Qm9vbGVhbn1cclxuXHQgKi9cclxuXHRfZW5hYmxlZDogdHJ1ZSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBsb2dnaW5nIHRhcmdldFxyXG5cdCAqIEB0eXBlIHtTdHJpbmd9XHJcblx0ICovXHJcblx0X3RhcmdldElkOiAnY29uc29sZScsXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBQb3NzaWJsZSBsb2dnaW5nIHRhcmdldHNcclxuXHQgKiBAdHlwZSB7T2JqZWN0fVxyXG5cdCAqL1xyXG5cdF90YXJnZXRzOiB7XHJcblx0XHQnY29uc29sZSc6IG5ldyBDb25zb2xlVGFyZ2V0KCksXHJcblx0XHQnZWxlbWVudCc6IG5ldyBFbGVtZW50VGFyZ2V0KClcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogQ2xhc3MgbmFtZSBmb3IgdGhlIGJvZHkgd2hlbiB3ZSdyZSBlbmFibGVkXHJcblx0ICogQHR5cGUge1N0cmluZ31cclxuXHQgKi9cclxuXHRfZW5hYmxlZENsYXNzTmFtZTogJ2xvZ2dpZXItZW5hYmxlZCcsXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBTdGFjayBwYXJzZXIgaGVscGVyXHJcblx0ICogQHR5cGUge09iamVjdH1cclxuXHQgKi9cclxuXHRfc3RhY2tQYXJzZXI6IG5ldyBTdGFja1BhcnNlcigpLFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogTG9nIGxldmVsc1xyXG5cdCAqIEB0eXBlIHtPYmplY3R9XHJcblx0ICovXHJcblx0X2xvZ0xldmVsczogbG9nTGV2ZWxzLFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGN1cnJlbnQgbG9nIGxldmVsXHJcblx0ICogQHR5cGUge051bWJlcn1cclxuXHQgKi9cclxuXHRfbG9nTGV2ZWw6IGxvZ0xldmVscy5lcnJvciB8IGxvZ0xldmVscy53YXJuIHwgbG9nTGV2ZWxzLmRlYnVnIHwgbG9nTGV2ZWxzLmxvZyB8IGxvZ0xldmVscy5pbmZvLFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogRG9lcyB0aGUgYWN0dWFsIHdyaXRpbmdcclxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcmdzXHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxyXG5cdCAqL1xyXG5cdF93cml0ZTogZnVuY3Rpb24gKGFyZ3MsIG1ldGhvZCkge1xyXG5cclxuXHRcdC8vIERvbid0IGxvZyBpZiB3ZSdyZSBub3QgZW5hYmxlZFxyXG5cdFx0aWYgKCF0aGlzLl9lbmFibGVkIHx8ICEodGhpcy5fbG9nTGV2ZWwgJiAodGhpcy5fbG9nTGV2ZWxzW21ldGhvZF0gfHwgdGhpcy5fbG9nTGV2ZWxzWydsb2cnXSkpKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBUYWJsZSBsb2dnaW5nIGRvZXNuJ3QgbGlrZSBleHRyYSBkYXRhXHJcblx0XHRpZiAobWV0aG9kICE9PSAndGFibGUnKSB7XHJcblxyXG5cdFx0XHQvLyBGaWxlIGluZm8gdG8gYXBwZW5kXHJcblx0XHRcdHZhciBpbmZvID0gdGhpcy5fc3RhY2tQYXJzZXIuZ2V0SW5mbygpO1xyXG5cclxuXHRcdFx0Ly8gQXBwZW5kIHRoZSBpbmZvXHJcblx0XHRcdGFyZ3MucHVzaCh0aGlzLl9idWlsZFN0YWNrSW5mb1N0cmluZyhpbmZvKSk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gV3JpdGUgbWV0aG9kIGJhc2VkIG9uIHRhcmdldFxyXG5cdFx0cmV0dXJuIHRoaXMudGFyZ2V0KCkud3JpdGUoYXJncywgbWV0aG9kKTtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogQnVpbGQgYSBzdHJpbmcgb2Ygc3RhY2sgaW5mb1xyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXNcclxuXHQgKiBAcmV0dXJuIHtTdHJpbmd9XHJcblx0ICovXHJcblx0X2J1aWxkU3RhY2tJbmZvU3RyaW5nOiBmdW5jdGlvbiAocGFyYW1zKSB7XHJcblxyXG5cdFx0Ly8gY29uc29sZS5sb2coX19maWxlbmFtZSwgcGFyYW1zKTtcclxuXHRcdHJldHVybiBwYXJhbXMubWV0aG9kICsgJ0AnICsgcGFyYW1zLmZpbGUgKyAnOicgKyBwYXJhbXMubGluZSArIChwYXJhbXMuY2hhcmFjdGVyICE9PSB1bmRlZmluZWQgPyAnOicgKyBwYXJhbXMuY2hhcmFjdGVyIDogJycpO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBBZGQgYSBjbGFzcyB0byB0aGUgYm9keSB0byByZWZsZWN0IHRoZSBlbmFibGVkIHN0YXRlXHJcblx0ICovXHJcblx0X2FkZEJvZHlDbGFzczogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdHZhciBjbGFzc05hbWUgPSBkb2N1bWVudC5ib2R5LmNsYXNzTmFtZSxcclxuXHRcdFx0cHJlc2VudCA9IGNsYXNzTmFtZS5pbmRleE9mKHRoaXMuX2VuYWJsZWRDbGFzc05hbWUpO1xyXG5cclxuXHRcdGlmIChwcmVzZW50ID09PSAtMSkge1xyXG5cdFx0XHRjbGFzc05hbWUgPSBjbGFzc05hbWUgKyAnICcgKyB0aGlzLl9lbmFibGVkQ2xhc3NOYW1lO1xyXG5cdFx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTmFtZSA9IGNsYXNzTmFtZS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCcnKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogUmVtb3ZlIGEgY2xhc3MgZnJvbSB0aGUgYm9keSB0byByZWZsZWN0IHRoZSBkaXNhYmxlZCBzdGF0ZVxyXG5cdCAqL1xyXG5cdF9yZW1vdmVCb2R5Q2xhc3M6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHR2YXIgY2xhc3NOYW1lID0gZG9jdW1lbnQuYm9keS5jbGFzc05hbWUsXHJcblx0XHRcdHByZXNlbnQgPSBjbGFzc05hbWUuaW5kZXhPZih0aGlzLl9lbmFibGVkQ2xhc3NOYW1lKTtcclxuXHJcblx0XHRjb25zb2xlLmxvZyhwcmVzZW50KTtcclxuXHRcdGlmIChwcmVzZW50ICE9PSAtMSkge1xyXG5cdFx0XHRjbGFzc05hbWUgPSBjbGFzc05hbWUucmVwbGFjZSh0aGlzLl9lbmFibGVkQ2xhc3NOYW1lLCAnJywgJ2dpJyk7XHJcblx0XHRcdGRvY3VtZW50LmJvZHkuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBTZXQgb3IgZ2V0IHRoZSBjdXJyZW50IHRhcmdldFxyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXHJcblx0ICogQHJldHVybiB7T2JqZWN0fVxyXG5cdCAqL1xyXG5cdHRhcmdldDogZnVuY3Rpb24gKG5hbWUpIHtcclxuXHJcblx0XHRpZiAobmFtZSAhPT0gdW5kZWZpbmVkICYmIHRoaXMuX3RhcmdldHMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcclxuXHRcdFx0dGhpcy5fdGFyZ2V0SWQgPSBuYW1lO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzLl90YXJnZXRzW3RoaXMuX3RhcmdldElkXTtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogU2V0IG9yIGdldCB0aGUgZWxlbWVudFxyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBlbFxyXG5cdCAqIEByZXR1cm4ge09iamVjdH1cclxuXHQgKi9cclxuXHRlbGVtZW50OiBmdW5jdGlvbiAoZWwpIHtcclxuXHJcblx0XHRpZiAodGhpcy5fdGFyZ2V0SWQgPT09ICdlbGVtZW50Jykge1xyXG5cclxuXHRcdFx0aWYgKGVsICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRyZXR1cm4gdGhpcy50YXJnZXQoKS5lbGVtZW50KGVsKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIHRoaXMudGFyZ2V0KCkuZWxlbWVudCgpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBTZXQgb3IgZ2V0IHRoZSBsb2cgbGV2ZWxcclxuXHQgKiBAcGFyYW0ge1N0cmluZ30gbGV2ZWxOYW1lXHJcblx0ICogQHJldHVybiB7TnVtYmVyfVxyXG5cdCAqL1xyXG5cdGxvZ0xldmVsOiBmdW5jdGlvbiAobGV2ZWxOYW1lKSB7XHJcblxyXG5cdFx0Ly8gR2V0IHRoZSBsZXZlbFxyXG5cdFx0aWYgKGxldmVsTmFtZSA9PT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9sb2dMZXZlbDtcclxuXHRcdH1cclxuXHJcblxyXG5cdFx0Ly8gU2V0IHRoZSBsZXZlbFxyXG5cdFx0dmFyIGtleSxcclxuXHRcdFx0bGV2ZWwgPSB0aGlzLl9sb2dMZXZlbHNbbGV2ZWxOYW1lXSxcclxuXHRcdFx0bWFzayA9IDAsXHJcblx0XHRcdGN1ckxldmVsO1xyXG5cdFx0Zm9yIChrZXkgaW4gdGhpcy5fbG9nTGV2ZWxzKSB7XHJcblx0XHRcdGN1ckxldmVsID0gdGhpcy5fbG9nTGV2ZWxzW2tleV07XHJcblx0XHRcdGlmIChjdXJMZXZlbCA8PSBsZXZlbCkge1xyXG5cdFx0XHRcdG1hc2sgPSBtYXNrIHwgY3VyTGV2ZWw7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcy5fbG9nTGV2ZWwgPSBsZXZlbDtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogRW5hYmxlIGxvZ2dpbmdcclxuXHQgKi9cclxuXHRlbmFibGU6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHR0aGlzLl9lbmFibGVkID0gdHJ1ZTtcclxuXHRcdHRoaXMuX2FkZEJvZHlDbGFzcygpO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBEaXNhYmxlIGxvZ2dpbmdcclxuXHQgKi9cclxuXHRkaXNhYmxlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0dGhpcy5fZW5hYmxlZCA9IGZhbHNlO1xyXG5cdFx0dGhpcy5fcmVtb3ZlQm9keUNsYXNzKCk7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIExvZyB0YWJ1bGFyIGRhdGFcclxuXHQgKi9cclxuXHRsb2c6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5fd3JpdGUoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSwgJ2xvZycpO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBMb2cgdGFidWxhciBkYXRhXHJcblx0ICovXHJcblx0ZXJyb3I6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5fd3JpdGUoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSwgJ2Vycm9yJyk7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIExvZyB0YWJ1bGFyIGRhdGFcclxuXHQgKi9cclxuXHR3YXJuOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuX3dyaXRlKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCksICd3YXJuJyk7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIExvZyB0YWJ1bGFyIGRhdGFcclxuXHQgKi9cclxuXHRpbmZvOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuX3dyaXRlKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCksICdpbmZvJyk7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIExvZyB0YWJ1bGFyIGRhdGFcclxuXHQgKi9cclxuXHRkZWJ1ZzogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdHJldHVybiB0aGlzLl93cml0ZShBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApLCAnZGVidWcnKTtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogTG9nIHRhYnVsYXIgZGF0YVxyXG5cdCAqL1xyXG5cdHRhYmxlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuX3dyaXRlKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCksICd0YWJsZScpO1xyXG5cdH1cclxufTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExvZ2dpZXI7IiwiLyoqXHJcbiAqIENvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXNcclxuICovXHJcbmZ1bmN0aW9uIFN0YWNrUGFyc2VyIChwYXJhbXMpIHtcclxuXHJcbn1cclxuXHJcblxyXG4vKipcclxuICogUHJvdG90eXBlIG1ldGhvZHNcclxuICovXHJcblN0YWNrUGFyc2VyLnByb3RvdHlwZSA9IHtcclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3JcclxuXHQgKiBAdHlwZSB7RnVuY3Rpb259XHJcblx0ICovXHJcblx0Y29uc3RydWN0b3I6IFN0YWNrUGFyc2VyLFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogRXh0cmFjdCB0aGUgbGluZSBudW1iZXIgZnJvbSBhIHN0YWNrIHRyYWNlXHJcblx0ICovXHJcblx0Z2V0SW5mbzogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdC8vIE5ldyBlcnJvciBmb3IgdGhlIHN0YWNrIGluZm9cclxuXHRcdHZhciBzdGFjayA9IHRoaXMuX2dlbmVyYXRlU3RhY2tUcmFjZSgpLFxyXG5cdFx0XHRsaW5lLFxyXG5cdFx0XHRpbmZvLFxyXG5cdFx0XHRmaWxlLFxyXG5cdFx0XHRtZXRob2QsXHJcblx0XHRcdGxpbmVOdW1iZXIsXHJcblx0XHRcdGNoYXJhY3RlcjtcclxuXHJcblx0XHQvLyBQYXJzZSBkaWZmZXJlbnQgdHlwZXMgb2YgdHJhY2VzXHJcblx0XHRpZiAoc3RhY2suaW5kZXhPZignRXJyb3InKSA9PT0gMCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5fZ2V0SW5mb1Y4KHN0YWNrKTtcclxuXHRcdH1cclxuXHRcdGVsc2UgaWYgKHN0YWNrLmluZGV4T2YoJ1JlZmVyZW5jZUVycm9yJykgPT09IDApIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX2dldEluZm9DaGFrcmEoc3RhY2spO1xyXG5cdFx0fVxyXG5cdFx0Ly8gVE9ETzogTml0cm8gc3VwcG9ydFxyXG5cdFx0Ly8gZWxzZSBpZiAoc3RhY2suaW5kZXhPZignUmVmZXJlbmNlRXJyb3InKSA9PT0gMCkge1xyXG5cdFx0Ly8gXHRyZXR1cm4gdGhpcy5fZ2V0SW5mb0NoYWtyYShzdGFjayk7XHJcblx0XHQvLyB9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX2dldEluZm9TcGlkZXJNb25rZXkoc3RhY2spO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBHZXQgdGhlIHN0YWNrIGluZm8gZm9yIFY4XHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IHN0YWNrXHJcblx0ICovXHJcblx0X2dldEluZm9WODogZnVuY3Rpb24gKHN0YWNrKSB7XHJcblxyXG5cdFx0Ly8gUGFyc2UgdGhlIDZ0aCBsaW5lIG9mIHRoZSBzdGFjayB0cmFjZSB0byBnZXQgbGluZSBpbmZvXHJcblx0XHR2YXIgbGluZSA9IHN0YWNrLnNwbGl0KCdcXG4nKVs1XSxcclxuXHRcdFx0aW5mbyA9IGxpbmUubWF0Y2goLyg/OmF0XFxzKSg/OihbXlxcKF17MSx9KSg/Olxcc1xcKCkoLiopfCgpKCkoLiopfCgpKCkoPGFub255bW91cz4pKShcXDpbMC05XXsxLH0pKFxcOlswLTldezEsfSkvKTtcclxuXHJcblx0XHQvLyBJZiB0aGVyZSBpcyBubyBpbmZvLCBvdXIgcmVnZXggZmFpbGVkIGJlY2F1c2Ugb2YgYmFkIHN0YWNrIGRhdGFcclxuXHRcdGlmICghaW5mbykge1xyXG5cdFx0XHRyZXR1cm4ge307XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gR2V0IHRoZSBsaW5lIGluZm9cclxuXHRcdHZhclx0bWV0aG9kID0gaW5mb1sxXSB8fCAnYW5vbnltb3VzJyxcclxuXHRcdFx0ZmlsZSA9IGluZm9bMl0gfHwgaW5mb1s1XSxcclxuXHRcdFx0bGluZU51bWJlciA9IHBhcnNlSW50KGluZm9bOV0uc3Vic3RyKDEpLCAxMCksXHJcblx0XHRcdGNoYXJhY3RlciA9IHBhcnNlSW50KGluZm9bMTBdLnN1YnN0cigxKSwgMTApO1xyXG5cclxuXHRcdC8vIFJldHVybiBhbiBvYmplY3QgdGhhdCB3aWxsIGJlIHVzZWQgdG8gbWFrZSBhIHN0cmluZyBsYXRlclxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0bWV0aG9kOiBtZXRob2QsXHJcblx0XHRcdGZpbGU6IGZpbGUsXHJcblx0XHRcdGxpbmU6IGxpbmVOdW1iZXIsXHJcblx0XHRcdGNoYXJhY3RlcjogY2hhcmFjdGVyXHJcblx0XHR9O1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBHZXQgdGhlIHN0YWNrIGluZm8gZm9yIFNwaWRlck1vbmtleVxyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBzdGFja1xyXG5cdCAqL1xyXG5cdF9nZXRJbmZvU3BpZGVyTW9ua2V5OiBmdW5jdGlvbiAoc3RhY2spIHtcclxuXHJcblx0XHQvLyBQYXJzZSB0aGUgNXRoIGxpbmUgb2YgdGhlIHN0YWNrIHRyYWNlIHRvIGdldCBsaW5lIGluZm9cclxuXHRcdHZhciBsaW5lID0gc3RhY2suc3BsaXQoJ1xcbicpWzRdLFxyXG5cdFx0XHRpbmZvID0gbGluZS5tYXRjaCgvKFteQF17MSx9fCkoPzpAKSguKikoXFw6WzAtOV17MSx9KS8pO1xyXG5cclxuXHRcdC8vIElmIHRoZXJlIGlzIG5vIGluZm8sIG91ciByZWdleCBmYWlsZWQgYmVjYXVzZSBvZiBiYWQgc3RhY2sgZGF0YVxyXG5cdFx0aWYgKCFpbmZvKSB7XHJcblx0XHRcdHJldHVybiB7fTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBHZXQgdGhlIGxpbmUgaW5mb1xyXG5cdFx0dmFyXHRtZXRob2QgPSBpbmZvWzFdIHx8ICdhbm9ueW1vdXMnLFxyXG5cdFx0XHRmaWxlID0gaW5mb1syXSxcclxuXHRcdFx0bGluZU51bWJlciA9IHBhcnNlSW50KGluZm9bM10uc3Vic3RyKDEpLCAxMCk7XHJcblxyXG5cdFx0Ly8gUmV0dXJuIGFuIG9iamVjdCB0aGF0IHdpbGwgYmUgdXNlZCB0byBtYWtlIGEgc3RyaW5nIGxhdGVyXHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRtZXRob2Q6IG1ldGhvZCxcclxuXHRcdFx0ZmlsZTogZmlsZSxcclxuXHRcdFx0bGluZTogbGluZU51bWJlcixcclxuXHRcdFx0Y2hhcmFjdGVyOiB1bmRlZmluZWRcclxuXHRcdH07XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldCB0aGUgc3RhY2sgaW5mbyBmb3IgQ2hha3JhXHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IHN0YWNrXHJcblx0ICovXHJcblx0X2dldEluZm9DaGFrcmE6IGZ1bmN0aW9uIChzdGFjaykge1xyXG5cclxuXHRcdC8vIFBhcnNlIHRoZSA2dGggbGluZSBvZiB0aGUgc3RhY2sgdHJhY2UgdG8gZ2V0IGxpbmUgaW5mb1xyXG5cdFx0dmFyIGxpbmUgPSBzdGFjay5zcGxpdCgnXFxuJylbNV0sXHJcblx0XHRcdGluZm8gPSBsaW5lLm1hdGNoKC8oPzphdFxccykoPzooW15cXChdezF9KSg/Olxcc1xcKCkoLiopfCgpKCkoLiopfCgpKCkoPGFub255bW91cz4pKShcXDpbMC05XXsxLH0pKFxcOlswLTldezEsfSkvKTtcclxuXHJcblx0XHQvLyBJZiB0aGVyZSBpcyBubyBpbmZvLCBvdXIgcmVnZXggZmFpbGVkIGJlY2F1c2Ugb2YgYmFkIHN0YWNrIGRhdGFcclxuXHRcdGlmICghaW5mbykge1xyXG5cdFx0XHRyZXR1cm4ge307XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gR2V0IHRoZSBsaW5lIGluZm9cclxuXHRcdHZhclx0bWV0aG9kID0gaW5mb1sxXSB8fCAnYW5vbnltb3VzJyxcclxuXHRcdFx0ZmlsZSA9IGluZm9bMl0gfHwgaW5mb1s1XSxcclxuXHRcdFx0bGluZU51bWJlciA9IHBhcnNlSW50KGluZm9bOV0uc3Vic3RyKDEpLCAxMCksXHJcblx0XHRcdGNoYXJhY3RlciA9IHBhcnNlSW50KGluZm9bMTBdLnN1YnN0cigxKSwgMTApO1xyXG5cclxuXHRcdC8vIFJldHVybiBhbiBvYmplY3QgdGhhdCB3aWxsIGJlIHVzZWQgdG8gbWFrZSBhIHN0cmluZyBsYXRlclxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0bWV0aG9kOiBtZXRob2QsXHJcblx0XHRcdGZpbGU6IGZpbGUsXHJcblx0XHRcdGxpbmU6IGxpbmVOdW1iZXIsXHJcblx0XHRcdGNoYXJhY3RlcjogY2hhcmFjdGVyXHJcblx0XHR9O1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBHZW5lcmF0ZSBhIHN0YWNrIHRyYWNlXHJcblx0ICogQHJldHVybiB7U3RyaW5nfSBUaGUgc3RhY2sgdHJhY2VcclxuXHQgKi9cclxuXHRfZ2VuZXJhdGVTdGFja1RyYWNlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0Ly8gQ3JlYXRlIGEgbmV3IGVycm9yXHJcblx0XHR2YXIgZXJyb3IgPSBuZXcgRXJyb3IoKTtcclxuXHJcblx0XHQvLyBJbiBzb21lIGVuZ2luZXMsIHRoZSBlcnJvciBkb2Vzbid0IGNvbnRhaW4gYSBzdGFjay4gR290dGEgdGhyb3cgYW4gZXJyb3IgaW5zdGVhZCFcclxuXHRcdGlmICghZXJyb3Iuc3RhY2spIHtcclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRpcy5ub3QuZnVuYygpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhdGNoIChlKSB7XHJcblx0XHRcdFx0ZXJyb3IgPSBlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGVycm9yLnN0YWNrO1xyXG5cdH1cclxufTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFN0YWNrUGFyc2VyOyIsIi8qKlxyXG4gKiBDb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zXHJcbiAqL1xyXG5mdW5jdGlvbiBDb25zb2xlVGFyZ2V0IChwYXJhbXMpIHtcclxuXHJcbn1cclxuXHJcblxyXG4vKipcclxuICogUHJvdG90eXBlIG1ldGhvZHNcclxuICovXHJcbkNvbnNvbGVUYXJnZXQucHJvdG90eXBlID0ge1xyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3RvclxyXG5cdCAqIEB0eXBlIHtGdW5jdGlvbn1cclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcjogQ29uc29sZVRhcmdldCxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFdyaXRlIHRvIHRoZSBjb25zb2xlXHJcblx0ICogQHBhcmFtIHtBcnJheX0gYXJnc1xyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcclxuXHQgKi9cclxuXHR3cml0ZTogZnVuY3Rpb24gKGFyZ3MsIG1ldGhvZCkge1xyXG5cclxuXHRcdC8vIE1ha2Ugc3VyZSB0aGVyZSBpcyBhIGNvbnNvbGVcclxuXHRcdGlmIChjb25zb2xlKSB7XHJcblxyXG5cdFx0XHQvLyBJZiB0aGVyZSBpcyBubyBtZXRob2QsIHJldmVydCB0byBsb2dcclxuXHRcdFx0aWYgKCFjb25zb2xlW21ldGhvZF0pIHtcclxuXHJcblx0XHRcdFx0aWYgKCFjb25zb2xlLmxvZykge1xyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdG1ldGhvZCA9ICdsb2cnO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gQXBwbHkgd2lsbCBtYWludGFpbiBjb250ZXh0LCBidXQgaXMgbm90IGFsd2F5cyBhdmFpbGFibGVcclxuXHRcdFx0aWYgKGNvbnNvbGVbbWV0aG9kXS5hcHBseSkge1xyXG5cdFx0XHRcdGNvbnNvbGVbbWV0aG9kXS5hcHBseShjb25zb2xlLCBhcmdzKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRjb25zb2xlW21ldGhvZF0oYXJncyk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBhcmdzO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbnNvbGVUYXJnZXQ7IiwiLyoqXHJcbiAqIENvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXNcclxuICovXHJcbmZ1bmN0aW9uIEVsZW1lbnRUYXJnZXQgKHBhcmFtcykge1xyXG5cclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBQcm90b3R5cGUgbWV0aG9kc1xyXG4gKi9cclxuRWxlbWVudFRhcmdldC5wcm90b3R5cGUgPSB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yXHJcblx0ICogQHR5cGUge0Z1bmN0aW9ufVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yOiBFbGVtZW50VGFyZ2V0LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGVsZW1lbnQgdG8gbG9nIHRvXHJcblx0ICogQHR5cGUge01peGVkfVxyXG5cdCAqL1xyXG5cdF9lbGVtZW50OiB1bmRlZmluZWQsXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBCdWlsZCBhIGNvbnRlbnQgZWxlbWVudFxyXG5cdCAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRlbnRcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zXHJcblx0ICovXHJcblx0X2J1aWxkQ29udGVudDogZnVuY3Rpb24gKGNvbnRlbnQsIHBhcmFtcykge1xyXG5cclxuXHRcdHBhcmFtcyA9IHBhcmFtcyB8fCB7fTtcclxuXHJcblx0XHQvLyBOZXcgZWxlbWVudFxyXG5cdFx0dmFyIGVsLFxyXG5cdFx0XHRjbGFzc05hbWUgPSBwYXJhbXMuY2xhc3NOYW1lIHx8ICdjb250ZW50JyxcclxuXHRcdFx0dHlwZSA9IHR5cGVvZiBjb250ZW50O1xyXG5cclxuXHRcdC8vXHJcblx0XHRzd2l0Y2ggKHR5cGUpIHtcclxuXHRcdFx0Y2FzZSAnb2JqZWN0JzpcclxuXHRcdFx0XHRlbCA9IHRoaXMuX2J1aWxkT2JqZWN0Q29udGVudChjb250ZW50KTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuXHRcdFx0XHRlbC5pbm5lckhUTUwgPSBjb250ZW50O1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFNldCB0aGUgY2xhc3MgbmFtZVxyXG5cdFx0ZWwuY2xhc3NOYW1lID0gY2xhc3NOYW1lICsgJyAnICsgdHlwZTtcclxuXHJcblx0XHRyZXR1cm4gZWw7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIEJ1aWxkIGEgY29udGVudCBlbGVtZW50IGZyb20gYSBoYXNoXHJcblx0ICogQHBhcmFtIHtPYmplY3R9IG9ialxyXG5cdCAqL1xyXG5cdF9idWlsZE9iamVjdENvbnRlbnQ6IGZ1bmN0aW9uIChvYmopIHtcclxuXHJcblx0XHR2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyksXHJcblx0XHRcdGhhcyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHksXHJcblx0XHRcdGtleTtcclxuXHJcblx0XHQvLyBMb29wXHJcblx0XHRmb3IgKGtleSBpbiBvYmopIHtcclxuXHJcblx0XHRcdC8vIE1ha2Ugc3VyZSB3ZSBkb24ndCBib3RoZXIgd2l0aCB0aGUgcHJvdG90eXBlXHJcblx0XHRcdGlmIChoYXMuY2FsbChvYmosIGtleSkpIHtcclxuXHRcdFx0XHRlbC5hcHBlbmRDaGlsZCh0aGlzLl9idWlsZE9iamVjdENvbnRlbnRSb3cob2JqW2tleV0sIGtleSkpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0ZWwuY2xhc3NOYW1lID0gJ29iamVjdCc7XHJcblxyXG5cdFx0cmV0dXJuIGVsO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBCdWlsZCBhIHJvdyBvZiBvYmplY3QgY29udGVudFxyXG5cdCAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlXHJcblx0ICogQHBhcmFtIHtNaXhlZH0ga2V5XHJcblx0ICovXHJcblx0X2J1aWxkT2JqZWN0Q29udGVudFJvdzogZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcclxuXHJcblx0XHR2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcblxyXG5cdFx0ZWwuYXBwZW5kQ2hpbGQodGhpcy5fYnVpbGRPYmplY3RDb250ZW50S2V5KGtleSkpO1xyXG5cdFx0ZWwuYXBwZW5kQ2hpbGQodGhpcy5fYnVpbGRPYmplY3RDb250ZW50VmFsdWUodmFsdWUpKTtcclxuXHJcblx0XHRlbC5jbGFzc05hbWUgPSAncm93JztcclxuXHJcblx0XHRyZXR1cm4gZWw7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIEJ1aWxkIGEgY29udGVudCBrZXkgZWxlbWVudFxyXG5cdCAqIEBwYXJhbSB7TWl4ZWR9IGtleVxyXG5cdCAqL1xyXG5cdF9idWlsZE9iamVjdENvbnRlbnRLZXk6IGZ1bmN0aW9uIChrZXkpIHtcclxuXHJcblx0XHR2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcblx0XHRlbC5pbm5lckhUTUwgPSBrZXk7XHJcblx0XHRlbC5jbGFzc05hbWUgPSAna2V5JztcclxuXHRcdHJldHVybiBlbDtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogQnVpbGQgYSBjb250ZW50IHZhbHVlIGVsZW1lbnRcclxuXHQgKiBAcGFyYW0ge01peGVkfSB2YWx1ZVxyXG5cdCAqL1xyXG5cdF9idWlsZE9iamVjdENvbnRlbnRWYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XHJcblxyXG5cdFx0dmFyIGVsLFxyXG5cdFx0XHR0eXBlID0gdHlwZW9mIHZhbHVlO1xyXG5cclxuXHRcdHN3aXRjaCAodHlwZSkge1xyXG5cdFx0XHRjYXNlICdvYmplY3QnOlxyXG5cdFx0XHRcdGVsID0gdGhpcy5fYnVpbGRPYmplY3RDb250ZW50KHZhbHVlKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuXHRcdFx0XHRlbC5pbm5lckhUTUwgPSB2YWx1ZTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHJcblx0XHRlbC5jbGFzc05hbWUgPSB0eXBlO1xyXG5cclxuXHRcdHJldHVybiBlbDtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogV3JpdGUgYSBsb2cgdG8gYW4gZWxlbWVudFxyXG5cdCAqL1xyXG5cdF9sb2c6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHQvLyBNYWtlIHN1cmUgd2UgaGF2ZSBhbiBlbGVtZW50XHJcblx0XHRpZiAoIXRoaXMuX2NoZWNrRWxlbWVudCgpKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBOZXcgZWxlbWVudHNcclxuXHRcdHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxyXG5cdFx0XHRpbmZvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG5cclxuXHRcdC8vIExhc3QgcGFyYW0gaXMgdGhlIHN0YWNrIGluZm9cclxuXHRcdHZhciBwYXJhbXMgPSBhcmd1bWVudHMsXHJcblx0XHRcdHN0YWNrSW5mbyA9IEFycmF5LnByb3RvdHlwZS5wb3AuY2FsbChwYXJhbXMpO1xyXG5cclxuXHRcdC8vIENvbnRlbnQgc3RyaW5nXHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHBhcmFtcy5sZW5ndGg7IGkrPTEpIHtcclxuXHRcdFx0ZWwuYXBwZW5kQ2hpbGQodGhpcy5fYnVpbGRDb250ZW50KHBhcmFtc1tpXSkpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEluZm8gc3RyaW5nXHJcblx0XHRpbmZvLmlubmVySFRNTCA9IHN0YWNrSW5mbztcclxuXHRcdGluZm8uY2xhc3NOYW1lID0gJ2luZm8nO1xyXG5cclxuXHRcdC8vIEFkZCBjaGlsZHJlbiB0byB0aGUgZWxlbWVudFxyXG5cdFx0ZWwuYXBwZW5kQ2hpbGQoaW5mbyk7XHJcblxyXG5cdFx0Ly8gQWRkIHRoZSBlbGVtZW50XHJcblx0XHRlbC5jbGFzc05hbWUgPSAnbG9nJztcclxuXHRcdHRoaXMuX2VsZW1lbnQuYXBwZW5kQ2hpbGQoZWwpO1xyXG5cclxuXHRcdHJldHVybiBlbDtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogV3JpdGUgYW4gZXJyb3IgdG8gYW4gZWxlbWVudFxyXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFyZ3NcclxuXHQgKi9cclxuXHRfZXJyb3I6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHR2YXIgZWwgPSB0aGlzLl9sb2cuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHJcblx0XHRlbC5jbGFzc05hbWUgPSAnbG9nIGVycm9yJztcclxuXHJcblx0XHRyZXR1cm4gZWw7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFdyaXRlIGEgd2FybmluZyB0byBhbiBlbGVtZW50XHJcblx0ICogQHBhcmFtIHtBcnJheX0gYXJnc1xyXG5cdCAqL1xyXG5cdF93YXJuOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0dmFyIGVsID0gdGhpcy5fbG9nLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcblxyXG5cdFx0ZWwuY2xhc3NOYW1lID0gJ2xvZyB3YXJuJztcclxuXHJcblx0XHRyZXR1cm4gZWw7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFdyaXRlIGluZm8gdG8gYW4gZWxlbWVudFxyXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFyZ3NcclxuXHQgKi9cclxuXHRfaW5mbzogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdHZhciBlbCA9IHRoaXMuX2xvZy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG5cclxuXHRcdGVsLmNsYXNzTmFtZSA9ICdsb2cgaW5mbyc7XHJcblxyXG5cdFx0cmV0dXJuIGVsO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBXcml0ZSBhIGRlYnVnIHRvIGFuIGVsZW1lbnRcclxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcmdzXHJcblx0ICovXHJcblx0X2RlYnVnOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0dmFyIGVsID0gdGhpcy5fbG9nLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcblxyXG5cdFx0ZWwuY2xhc3NOYW1lID0gJ2xvZyBkZWJ1Zyc7XHJcblxyXG5cdFx0cmV0dXJuIGVsO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBXcml0ZSBhIHRhYmxlIHRvIGFuIGVsZW1lbnRcclxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcmdzXHJcblx0ICovXHJcblx0X3RhYmxlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0dmFyIGVsID0gdGhpcy5fbG9nLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcblxyXG5cdFx0ZWwuY2xhc3NOYW1lID0gJ2xvZyB0YWJsZSc7XHJcblxyXG5cdFx0cmV0dXJuIGVsO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBDaGVjayB0aGF0IHRoZXJlIGlzIGFuIGVsZW1lbnQgYW5kIGNyZWF0ZSBpZiB3ZSBkb24ndCBoYXZlIG9uZVxyXG5cdCAqL1xyXG5cdF9jaGVja0VsZW1lbnQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHQvLyBSZXR1cm4gdGhlIGVsZW1lbnQgaWYgd2UgaGF2ZSBpdFxyXG5cdFx0aWYgKHRoaXMuX2VsZW1lbnQpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX2VsZW1lbnQ7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gVHJ5IHRvIGNyZWF0ZVxyXG5cdFx0cmV0dXJuIHRoaXMuX2NyZWF0ZUVsZW1lbnQoKTtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlIGFuIGVsZW1lbnQgdG8gd3JpdGUgdG8gYW5kIHRyeSB0byBhZGQgaXQgdG8gdGhlIGJvZHlcclxuXHQgKi9cclxuXHRfY3JlYXRlRWxlbWVudDogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdC8vIElmIHRoZXJlIGlzIG5vIHdpbmRvdyBvYmplY3QsIHdlJ3JlIFNPTFxyXG5cdFx0aWYgKCFkb2N1bWVudCkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gQ3JlYXRlIHRoZSBlbGVtZW50XHJcblx0XHR0aGlzLl9lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblxyXG5cdFx0Ly8gU2V0IGVsZW1lbnQgcHJvcGVydGllc1xyXG5cdFx0dGhpcy5fZWxlbWVudC5jbGFzc05hbWUgPSAnbG9nZ2llciBnZW5lcmF0ZWQnO1xyXG5cclxuXHRcdC8vIEFwcGVuZCBpdCB0byB0aGUgZG9jdW1lbnRcclxuXHRcdGRvY3VtZW50LmJvZHkuaW5zZXJ0QmVmb3JlKHRoaXMuX2VsZW1lbnQsIGRvY3VtZW50LmJvZHkuZmlyc3RDaGlsZCk7XHJcblx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTmFtZSArPSAnIGxvZ2dpZXItZ2VuZXJhdGVkJztcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5fZWxlbWVudDtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogV3JpdGUgdG8gdGhlIGVsZW1lbnRcclxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcmdzXHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxyXG5cdCAqL1xyXG5cdHdyaXRlOiBmdW5jdGlvbiAoYXJncywgbWV0aG9kKSB7XHJcblxyXG5cdFx0Ly8gTWFrZSBzdXJlIHdlIGhhdmUgYW4gZWxlbWVudFxyXG5cdFx0aWYgKCF0aGlzLl9jaGVja0VsZW1lbnQoKSkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gVGhlIG1ldGhvZCBuYW1lXHJcblx0XHR2YXIgbWV0aG9kTmFtZSA9ICdfJyArIG1ldGhvZCxcclxuXHRcdFx0ZGVmYXVsdE1ldGhvZE5hbWUgPSAnX2xvZyc7XHJcblxyXG5cdFx0Ly8gSWYgdGhlcmUgaXMgbm8gbWV0aG9kLCByZXZlcnQgdG8gZGVmYXVsdFxyXG5cdFx0aWYgKCF0aGlzW21ldGhvZE5hbWVdKSB7XHJcblx0XHRcdG1ldGhvZE5hbWUgPSBkZWZhdWx0TWV0aG9kTmFtZTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBDYWxsIHRoZSBtZXRob2RcclxuXHRcdHRoaXNbbWV0aG9kTmFtZV0uYXBwbHkodGhpcywgYXJncyk7XHJcblxyXG5cdFx0cmV0dXJuIGFyZ3M7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFNldCB0aGUgZWxlbWVudCB3ZSdsbCB3cml0ZSB0b1xyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBlbFxyXG5cdCAqL1xyXG5cdGVsZW1lbnQ6IGZ1bmN0aW9uIChlbCkge1xyXG5cclxuXHRcdGlmIChlbCAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdHRoaXMuX2VsZW1lbnQgPSBlbDtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcy5fZWxlbWVudDtcclxuXHR9XHJcbn07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFbGVtZW50VGFyZ2V0OyJdfQ==
(1)
});
