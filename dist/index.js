!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Loggier=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var normalize = _dereq_('./helpers/normalize'),
	ConsoleTarget = _dereq_('./targets/console'),
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

		var location = window.location.protocol + '//' + window.location.host + '/';
		return (params.method + '@' + params.file + ':' + params.line + (params.character !== undefined ? ':' + params.character : '')).replace(location, '');
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
},{"./helpers/normalize":2,"./helpers/stack-parser":3,"./targets/console":4,"./targets/element":5}],2:[function(_dereq_,module,exports){
if (!Function.prototype.bind) {
	Function.prototype.bind = function (oThis) {
		if (typeof this !== "function") {
			// closest thing possible to the ECMAScript 5 internal IsCallable function
			throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
		}

		var aArgs = Array.prototype.slice.call(arguments, 1),
				fToBind = this,
				fNOP = function () {},
				fBound = function () {
					return fToBind.apply(this instanceof fNOP && oThis
																 ? this
																 : oThis,
															 aArgs.concat(Array.prototype.slice.call(arguments)));
				};

		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();

		return fBound;
	};
}

module.exports = {
	bind: Function.prototype.bind
};
},{}],3:[function(_dereq_,module,exports){
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
},{}],4:[function(_dereq_,module,exports){
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
},{}],5:[function(_dereq_,module,exports){
/**
 * Constructor
 * @param {Object} params
 */
function ElementTarget (params) {

	this._element = undefined;
	this._elementSetup = false;
}


/**
 * On click method placeholder
 * @type {Function}
 */
var onClick;


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
	 * Has the element been setup?
	 * @type {Boolean}
	 */
	_elementSetup: false,


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

		// Set properties
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

		// Set properties
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

		el.className = 'value ' + type;

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

		// Info string
		info.innerHTML = stackInfo;
		info.className = 'info';

		// Add children to the element
		el.appendChild(info);

		// Content string
		for (var i = 0; i < params.length; i+=1) {
			el.appendChild(this._buildContent(params[i]));
		}

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

		// Make sure we've set up the element
		if (!this._elementSetup) {
			this._setupElement();
		}

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

		// Setup the element
		this._setupElement();

		return this._element;
	},


	/**
	 * Setup the element - adding event listeners
	 */
	_setupElement: function () {

		// Can't do this with no element
		if (!this._element || this._elementSetup) {
			return;
		}

		// Listen for clicks on the whole logger
		onClick = this._onClick.bind(this);
		if (this._element.addEventListener) {
			this._element.addEventListener('click', onClick, false);
		}
		else {
			this._element.attachEvent('onclick', onClick);
		}

		// We're setup
		this._elementSetup = true;
	},


	/**
	 * Cleanup the element - removing event listeners
	 */
	_cleanupElement: function () {

		// Can't do this with no element
		if (!this._element || !this._elementSetup) {
			return;
		}

		// Stop listening for clicks
		if (this._element.addEventListener) {
			this._element.removeEventListener('click', onClick, false);
		}
		else {
			this._element.detachEvent('onclick', onClick);
		}

		// We're not setup
		this._elementSetup = false;
	},


	/**
	 * Is this an object element or does it have a parent that is one?
	 * @param {Object} el
	 * @return {Mixed} [description]
	 */
	_isOrHasObjectParent: function (el) {

		if (!el || !el.className) {
			return false;
		}

		if (el.className.indexOf('object') !== -1) {
			return el;
		}
		else if (el.parentNode) {
			return this._isOrHasObjectParent(el.parentNode);
		}
		else {
			return false;
		}
	},


	/**
	 * Toggle an object being open or closed
	 * @param {Object} el
	 */
	_toggleObject: function (el) {

		// Not expanded
		if (el.className.indexOf('expand') === -1) {
			el.className = el.className + ' expand';
		}
		else {
			el.className = el.className.replace('expand', '').replace(/^\s+|\s+$/g,'');
		}
	},


	/**
	 * When the element is clicked
	 * @param {Object} e
	 */
	_onClick: function (e) {

		var el = this._isOrHasObjectParent(e.target);

		if (el) {
			this._toggleObject(el);
		}
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

		console.log('here');
		if (el !== undefined) {
			if (this._element) {
				this._cleanupElement();
			}
			this._element = el;
		}

		return this._element;
	}
};


module.exports = ElementTarget;
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJXOlxcUGVyc29uYWxcXGxvZ2dpZXJcXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiVzovUGVyc29uYWwvbG9nZ2llci9zcmMvZmFrZV8zZTBmYjFiYy5qcyIsIlc6L1BlcnNvbmFsL2xvZ2dpZXIvc3JjL2hlbHBlcnMvbm9ybWFsaXplLmpzIiwiVzovUGVyc29uYWwvbG9nZ2llci9zcmMvaGVscGVycy9zdGFjay1wYXJzZXIuanMiLCJXOi9QZXJzb25hbC9sb2dnaWVyL3NyYy90YXJnZXRzL2NvbnNvbGUuanMiLCJXOi9QZXJzb25hbC9sb2dnaWVyL3NyYy90YXJnZXRzL2VsZW1lbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgbm9ybWFsaXplID0gcmVxdWlyZSgnLi9oZWxwZXJzL25vcm1hbGl6ZScpLFxyXG5cdENvbnNvbGVUYXJnZXQgPSByZXF1aXJlKCcuL3RhcmdldHMvY29uc29sZScpLFxyXG5cdEVsZW1lbnRUYXJnZXQgPSByZXF1aXJlKCcuL3RhcmdldHMvZWxlbWVudCcpLFxyXG5cdFN0YWNrUGFyc2VyID0gcmVxdWlyZSgnLi9oZWxwZXJzL3N0YWNrLXBhcnNlcicpO1xyXG5cclxuLyoqXHJcbiAqIENvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXNcclxuICovXHJcbmZ1bmN0aW9uIExvZ2dpZXIgKHBhcmFtcykge1xyXG5cclxuXHRwYXJhbXMgPSBwYXJhbXMgfHwge307XHJcblxyXG5cdC8vIFRhcmdldFxyXG5cdGlmIChwYXJhbXMudGFyZ2V0KSB7XHJcblx0XHR0aGlzLnRhcmdldChwYXJhbXMudGFyZ2V0KTtcclxuXHR9XHJcblxyXG5cdC8vIExvZ2dpbmcgZWxlbWVudFxyXG5cdGlmIChwYXJhbXMuZWxlbWVudCkge1xyXG5cdFx0dGhpcy5lbGVtZW50KHBhcmFtcy5lbGVtZW50KTtcclxuXHR9XHJcblxyXG5cdC8vIEVuYWJsZWRcclxuXHRpZiAocGFyYW1zLmVuYWJsZWQgIT09IHVuZGVmaW5lZCkge1xyXG5cdFx0dGhpcy5fZW5hYmxlZCA9IHBhcmFtcy5lbmFibGVkO1xyXG5cdH1cclxuXHJcblx0Ly8gU2V0IGEgY2xhc3Mgb24gdGhlIGJvZHlcclxuXHRpZiAodGhpcy5fZW5hYmxlZCkge1xyXG5cdFx0dGhpcy5lbmFibGUoKTtcclxuXHR9XHJcbn1cclxuXHJcblxyXG4vKipcclxuICogTG9nIGxldmVsc1xyXG4gKiBAdHlwZSB7QXJyYXl9XHJcbiAqL1xyXG52YXIgbG9nTGV2ZWxzID0ge1xyXG5cdFx0J2Vycm9yJzogMSxcclxuXHRcdCd3YXJuJzogMixcclxuXHRcdCdkZWJ1Zyc6IDQsXHJcblx0XHQnaW5mbyc6IDgsXHJcblx0XHQnbG9nJzogMTZcclxuXHR9O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBQcm90b3R5cGUgbWV0aG9kc1xyXG4gKi9cclxuTG9nZ2llci5wcm90b3R5cGUgPSB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yXHJcblx0ICogQHR5cGUge0Z1bmN0aW9ufVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yOiBMb2dnaWVyLFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogSXMgbG9nZ2luZyBlbmFibGVkP1xyXG5cdCAqIEB0eXBlIHtCb29sZWFufVxyXG5cdCAqL1xyXG5cdF9lbmFibGVkOiB0cnVlLFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGxvZ2dpbmcgdGFyZ2V0XHJcblx0ICogQHR5cGUge1N0cmluZ31cclxuXHQgKi9cclxuXHRfdGFyZ2V0SWQ6ICdjb25zb2xlJyxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFBvc3NpYmxlIGxvZ2dpbmcgdGFyZ2V0c1xyXG5cdCAqIEB0eXBlIHtPYmplY3R9XHJcblx0ICovXHJcblx0X3RhcmdldHM6IHtcclxuXHRcdCdjb25zb2xlJzogbmV3IENvbnNvbGVUYXJnZXQoKSxcclxuXHRcdCdlbGVtZW50JzogbmV3IEVsZW1lbnRUYXJnZXQoKVxyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBDbGFzcyBuYW1lIGZvciB0aGUgYm9keSB3aGVuIHdlJ3JlIGVuYWJsZWRcclxuXHQgKiBAdHlwZSB7U3RyaW5nfVxyXG5cdCAqL1xyXG5cdF9lbmFibGVkQ2xhc3NOYW1lOiAnbG9nZ2llci1lbmFibGVkJyxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFN0YWNrIHBhcnNlciBoZWxwZXJcclxuXHQgKiBAdHlwZSB7T2JqZWN0fVxyXG5cdCAqL1xyXG5cdF9zdGFja1BhcnNlcjogbmV3IFN0YWNrUGFyc2VyKCksXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBMb2cgbGV2ZWxzXHJcblx0ICogQHR5cGUge09iamVjdH1cclxuXHQgKi9cclxuXHRfbG9nTGV2ZWxzOiBsb2dMZXZlbHMsXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgY3VycmVudCBsb2cgbGV2ZWxcclxuXHQgKiBAdHlwZSB7TnVtYmVyfVxyXG5cdCAqL1xyXG5cdF9sb2dMZXZlbDogbG9nTGV2ZWxzLmVycm9yIHwgbG9nTGV2ZWxzLndhcm4gfCBsb2dMZXZlbHMuZGVidWcgfCBsb2dMZXZlbHMubG9nIHwgbG9nTGV2ZWxzLmluZm8sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBEb2VzIHRoZSBhY3R1YWwgd3JpdGluZ1xyXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFyZ3NcclxuXHQgKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXHJcblx0ICovXHJcblx0X3dyaXRlOiBmdW5jdGlvbiAoYXJncywgbWV0aG9kKSB7XHJcblxyXG5cdFx0Ly8gRG9uJ3QgbG9nIGlmIHdlJ3JlIG5vdCBlbmFibGVkXHJcblx0XHRpZiAoIXRoaXMuX2VuYWJsZWQgfHwgISh0aGlzLl9sb2dMZXZlbCAmICh0aGlzLl9sb2dMZXZlbHNbbWV0aG9kXSB8fCB0aGlzLl9sb2dMZXZlbHNbJ2xvZyddKSkpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFRhYmxlIGxvZ2dpbmcgZG9lc24ndCBsaWtlIGV4dHJhIGRhdGFcclxuXHRcdGlmIChtZXRob2QgIT09ICd0YWJsZScpIHtcclxuXHJcblx0XHRcdC8vIEZpbGUgaW5mbyB0byBhcHBlbmRcclxuXHRcdFx0dmFyIGluZm8gPSB0aGlzLl9zdGFja1BhcnNlci5nZXRJbmZvKCk7XHJcblxyXG5cdFx0XHQvLyBBcHBlbmQgdGhlIGluZm9cclxuXHRcdFx0YXJncy5wdXNoKHRoaXMuX2J1aWxkU3RhY2tJbmZvU3RyaW5nKGluZm8pKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBXcml0ZSBtZXRob2QgYmFzZWQgb24gdGFyZ2V0XHJcblx0XHRyZXR1cm4gdGhpcy50YXJnZXQoKS53cml0ZShhcmdzLCBtZXRob2QpO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBCdWlsZCBhIHN0cmluZyBvZiBzdGFjayBpbmZvXHJcblx0ICogQHBhcmFtIHtPYmplY3R9IHBhcmFtc1xyXG5cdCAqIEByZXR1cm4ge1N0cmluZ31cclxuXHQgKi9cclxuXHRfYnVpbGRTdGFja0luZm9TdHJpbmc6IGZ1bmN0aW9uIChwYXJhbXMpIHtcclxuXHJcblx0XHR2YXIgbG9jYXRpb24gPSB3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgKyAnLy8nICsgd2luZG93LmxvY2F0aW9uLmhvc3QgKyAnLyc7XHJcblx0XHRyZXR1cm4gKHBhcmFtcy5tZXRob2QgKyAnQCcgKyBwYXJhbXMuZmlsZSArICc6JyArIHBhcmFtcy5saW5lICsgKHBhcmFtcy5jaGFyYWN0ZXIgIT09IHVuZGVmaW5lZCA/ICc6JyArIHBhcmFtcy5jaGFyYWN0ZXIgOiAnJykpLnJlcGxhY2UobG9jYXRpb24sICcnKTtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogQWRkIGEgY2xhc3MgdG8gdGhlIGJvZHkgdG8gcmVmbGVjdCB0aGUgZW5hYmxlZCBzdGF0ZVxyXG5cdCAqL1xyXG5cdF9hZGRCb2R5Q2xhc3M6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHR2YXIgY2xhc3NOYW1lID0gZG9jdW1lbnQuYm9keS5jbGFzc05hbWUsXHJcblx0XHRcdHByZXNlbnQgPSBjbGFzc05hbWUuaW5kZXhPZih0aGlzLl9lbmFibGVkQ2xhc3NOYW1lKTtcclxuXHJcblx0XHRpZiAocHJlc2VudCA9PT0gLTEpIHtcclxuXHRcdFx0Y2xhc3NOYW1lID0gY2xhc3NOYW1lICsgJyAnICsgdGhpcy5fZW5hYmxlZENsYXNzTmFtZTtcclxuXHRcdFx0ZG9jdW1lbnQuYm9keS5jbGFzc05hbWUgPSBjbGFzc05hbWUucmVwbGFjZSgvXlxccyt8XFxzKyQvZywnJyk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlbW92ZSBhIGNsYXNzIGZyb20gdGhlIGJvZHkgdG8gcmVmbGVjdCB0aGUgZGlzYWJsZWQgc3RhdGVcclxuXHQgKi9cclxuXHRfcmVtb3ZlQm9keUNsYXNzOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0dmFyIGNsYXNzTmFtZSA9IGRvY3VtZW50LmJvZHkuY2xhc3NOYW1lLFxyXG5cdFx0XHRwcmVzZW50ID0gY2xhc3NOYW1lLmluZGV4T2YodGhpcy5fZW5hYmxlZENsYXNzTmFtZSk7XHJcblxyXG5cdFx0aWYgKHByZXNlbnQgIT09IC0xKSB7XHJcblx0XHRcdGNsYXNzTmFtZSA9IGNsYXNzTmFtZS5yZXBsYWNlKHRoaXMuX2VuYWJsZWRDbGFzc05hbWUsICcnLCAnZ2knKTtcclxuXHRcdFx0ZG9jdW1lbnQuYm9keS5jbGFzc05hbWUgPSBjbGFzc05hbWU7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFNldCBvciBnZXQgdGhlIGN1cnJlbnQgdGFyZ2V0XHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcclxuXHQgKiBAcmV0dXJuIHtPYmplY3R9XHJcblx0ICovXHJcblx0dGFyZ2V0OiBmdW5jdGlvbiAobmFtZSkge1xyXG5cclxuXHRcdGlmIChuYW1lICE9PSB1bmRlZmluZWQgJiYgdGhpcy5fdGFyZ2V0cy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xyXG5cdFx0XHR0aGlzLl90YXJnZXRJZCA9IG5hbWU7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuX3RhcmdldHNbdGhpcy5fdGFyZ2V0SWRdO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBTZXQgb3IgZ2V0IHRoZSBlbGVtZW50XHJcblx0ICogQHBhcmFtIHtPYmplY3R9IGVsXHJcblx0ICogQHJldHVybiB7T2JqZWN0fVxyXG5cdCAqL1xyXG5cdGVsZW1lbnQ6IGZ1bmN0aW9uIChlbCkge1xyXG5cclxuXHRcdGlmICh0aGlzLl90YXJnZXRJZCA9PT0gJ2VsZW1lbnQnKSB7XHJcblxyXG5cdFx0XHRpZiAoZWwgIT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdHJldHVybiB0aGlzLnRhcmdldCgpLmVsZW1lbnQoZWwpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gdGhpcy50YXJnZXQoKS5lbGVtZW50KCk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFNldCBvciBnZXQgdGhlIGxvZyBsZXZlbFxyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBsZXZlbE5hbWVcclxuXHQgKiBAcmV0dXJuIHtOdW1iZXJ9XHJcblx0ICovXHJcblx0bG9nTGV2ZWw6IGZ1bmN0aW9uIChsZXZlbE5hbWUpIHtcclxuXHJcblx0XHQvLyBHZXQgdGhlIGxldmVsXHJcblx0XHRpZiAobGV2ZWxOYW1lID09PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX2xvZ0xldmVsO1xyXG5cdFx0fVxyXG5cclxuXHJcblx0XHQvLyBTZXQgdGhlIGxldmVsXHJcblx0XHR2YXIga2V5LFxyXG5cdFx0XHRsZXZlbCA9IHRoaXMuX2xvZ0xldmVsc1tsZXZlbE5hbWVdLFxyXG5cdFx0XHRtYXNrID0gMCxcclxuXHRcdFx0Y3VyTGV2ZWw7XHJcblx0XHRmb3IgKGtleSBpbiB0aGlzLl9sb2dMZXZlbHMpIHtcclxuXHRcdFx0Y3VyTGV2ZWwgPSB0aGlzLl9sb2dMZXZlbHNba2V5XTtcclxuXHRcdFx0aWYgKGN1ckxldmVsIDw9IGxldmVsKSB7XHJcblx0XHRcdFx0bWFzayA9IG1hc2sgfCBjdXJMZXZlbDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzLl9sb2dMZXZlbCA9IGxldmVsO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBFbmFibGUgbG9nZ2luZ1xyXG5cdCAqL1xyXG5cdGVuYWJsZTogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdHRoaXMuX2VuYWJsZWQgPSB0cnVlO1xyXG5cdFx0dGhpcy5fYWRkQm9keUNsYXNzKCk7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIERpc2FibGUgbG9nZ2luZ1xyXG5cdCAqL1xyXG5cdGRpc2FibGU6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHR0aGlzLl9lbmFibGVkID0gZmFsc2U7XHJcblx0XHR0aGlzLl9yZW1vdmVCb2R5Q2xhc3MoKTtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogTG9nIHRhYnVsYXIgZGF0YVxyXG5cdCAqL1xyXG5cdGxvZzogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdHJldHVybiB0aGlzLl93cml0ZShBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApLCAnbG9nJyk7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIExvZyB0YWJ1bGFyIGRhdGFcclxuXHQgKi9cclxuXHRlcnJvcjogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdHJldHVybiB0aGlzLl93cml0ZShBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApLCAnZXJyb3InKTtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogTG9nIHRhYnVsYXIgZGF0YVxyXG5cdCAqL1xyXG5cdHdhcm46IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5fd3JpdGUoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSwgJ3dhcm4nKTtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogTG9nIHRhYnVsYXIgZGF0YVxyXG5cdCAqL1xyXG5cdGluZm86IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5fd3JpdGUoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSwgJ2luZm8nKTtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogTG9nIHRhYnVsYXIgZGF0YVxyXG5cdCAqL1xyXG5cdGRlYnVnOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuX3dyaXRlKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCksICdkZWJ1ZycpO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBMb2cgdGFidWxhciBkYXRhXHJcblx0ICovXHJcblx0dGFibGU6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5fd3JpdGUoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSwgJ3RhYmxlJyk7XHJcblx0fVxyXG59O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTG9nZ2llcjsiLCJpZiAoIUZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kKSB7XHJcblx0RnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbiAob1RoaXMpIHtcclxuXHRcdGlmICh0eXBlb2YgdGhpcyAhPT0gXCJmdW5jdGlvblwiKSB7XHJcblx0XHRcdC8vIGNsb3Nlc3QgdGhpbmcgcG9zc2libGUgdG8gdGhlIEVDTUFTY3JpcHQgNSBpbnRlcm5hbCBJc0NhbGxhYmxlIGZ1bmN0aW9uXHJcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoXCJGdW5jdGlvbi5wcm90b3R5cGUuYmluZCAtIHdoYXQgaXMgdHJ5aW5nIHRvIGJlIGJvdW5kIGlzIG5vdCBjYWxsYWJsZVwiKTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgYUFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLFxyXG5cdFx0XHRcdGZUb0JpbmQgPSB0aGlzLFxyXG5cdFx0XHRcdGZOT1AgPSBmdW5jdGlvbiAoKSB7fSxcclxuXHRcdFx0XHRmQm91bmQgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gZlRvQmluZC5hcHBseSh0aGlzIGluc3RhbmNlb2YgZk5PUCAmJiBvVGhpc1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCA/IHRoaXNcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQgOiBvVGhpcyxcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0IGFBcmdzLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XHJcblx0XHRcdFx0fTtcclxuXHJcblx0XHRmTk9QLnByb3RvdHlwZSA9IHRoaXMucHJvdG90eXBlO1xyXG5cdFx0ZkJvdW5kLnByb3RvdHlwZSA9IG5ldyBmTk9QKCk7XHJcblxyXG5cdFx0cmV0dXJuIGZCb3VuZDtcclxuXHR9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRiaW5kOiBGdW5jdGlvbi5wcm90b3R5cGUuYmluZFxyXG59OyIsIi8qKlxyXG4gKiBDb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zXHJcbiAqL1xyXG5mdW5jdGlvbiBTdGFja1BhcnNlciAocGFyYW1zKSB7XHJcblxyXG59XHJcblxyXG5cclxuLyoqXHJcbiAqIFByb3RvdHlwZSBtZXRob2RzXHJcbiAqL1xyXG5TdGFja1BhcnNlci5wcm90b3R5cGUgPSB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yXHJcblx0ICogQHR5cGUge0Z1bmN0aW9ufVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yOiBTdGFja1BhcnNlcixcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIEV4dHJhY3QgdGhlIGxpbmUgbnVtYmVyIGZyb20gYSBzdGFjayB0cmFjZVxyXG5cdCAqL1xyXG5cdGdldEluZm86IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHQvLyBOZXcgZXJyb3IgZm9yIHRoZSBzdGFjayBpbmZvXHJcblx0XHR2YXIgc3RhY2sgPSB0aGlzLl9nZW5lcmF0ZVN0YWNrVHJhY2UoKSxcclxuXHRcdFx0bGluZSxcclxuXHRcdFx0aW5mbyxcclxuXHRcdFx0ZmlsZSxcclxuXHRcdFx0bWV0aG9kLFxyXG5cdFx0XHRsaW5lTnVtYmVyLFxyXG5cdFx0XHRjaGFyYWN0ZXI7XHJcblxyXG5cdFx0Ly8gUGFyc2UgZGlmZmVyZW50IHR5cGVzIG9mIHRyYWNlc1xyXG5cdFx0aWYgKHN0YWNrLmluZGV4T2YoJ0Vycm9yJykgPT09IDApIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX2dldEluZm9WOChzdGFjayk7XHJcblx0XHR9XHJcblx0XHRlbHNlIGlmIChzdGFjay5pbmRleE9mKCdSZWZlcmVuY2VFcnJvcicpID09PSAwKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9nZXRJbmZvQ2hha3JhKHN0YWNrKTtcclxuXHRcdH1cclxuXHRcdC8vIFRPRE86IE5pdHJvIHN1cHBvcnRcclxuXHRcdC8vIGVsc2UgaWYgKHN0YWNrLmluZGV4T2YoJ1JlZmVyZW5jZUVycm9yJykgPT09IDApIHtcclxuXHRcdC8vIFx0cmV0dXJuIHRoaXMuX2dldEluZm9DaGFrcmEoc3RhY2spO1xyXG5cdFx0Ly8gfVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9nZXRJbmZvU3BpZGVyTW9ua2V5KHN0YWNrKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogR2V0IHRoZSBzdGFjayBpbmZvIGZvciBWOFxyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBzdGFja1xyXG5cdCAqL1xyXG5cdF9nZXRJbmZvVjg6IGZ1bmN0aW9uIChzdGFjaykge1xyXG5cclxuXHRcdC8vIFBhcnNlIHRoZSA2dGggbGluZSBvZiB0aGUgc3RhY2sgdHJhY2UgdG8gZ2V0IGxpbmUgaW5mb1xyXG5cdFx0dmFyIGxpbmUgPSBzdGFjay5zcGxpdCgnXFxuJylbNV0sXHJcblx0XHRcdGluZm8gPSBsaW5lLm1hdGNoKC8oPzphdFxccykoPzooW15cXChdezEsfSkoPzpcXHNcXCgpKC4qKXwoKSgpKC4qKXwoKSgpKDxhbm9ueW1vdXM+KSkoXFw6WzAtOV17MSx9KShcXDpbMC05XXsxLH0pLyk7XHJcblxyXG5cdFx0Ly8gSWYgdGhlcmUgaXMgbm8gaW5mbywgb3VyIHJlZ2V4IGZhaWxlZCBiZWNhdXNlIG9mIGJhZCBzdGFjayBkYXRhXHJcblx0XHRpZiAoIWluZm8pIHtcclxuXHRcdFx0cmV0dXJuIHt9O1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEdldCB0aGUgbGluZSBpbmZvXHJcblx0XHR2YXJcdG1ldGhvZCA9IGluZm9bMV0gfHwgJ2Fub255bW91cycsXHJcblx0XHRcdGZpbGUgPSBpbmZvWzJdIHx8IGluZm9bNV0sXHJcblx0XHRcdGxpbmVOdW1iZXIgPSBwYXJzZUludChpbmZvWzldLnN1YnN0cigxKSwgMTApLFxyXG5cdFx0XHRjaGFyYWN0ZXIgPSBwYXJzZUludChpbmZvWzEwXS5zdWJzdHIoMSksIDEwKTtcclxuXHJcblx0XHQvLyBSZXR1cm4gYW4gb2JqZWN0IHRoYXQgd2lsbCBiZSB1c2VkIHRvIG1ha2UgYSBzdHJpbmcgbGF0ZXJcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdG1ldGhvZDogbWV0aG9kLFxyXG5cdFx0XHRmaWxlOiBmaWxlLFxyXG5cdFx0XHRsaW5lOiBsaW5lTnVtYmVyLFxyXG5cdFx0XHRjaGFyYWN0ZXI6IGNoYXJhY3RlclxyXG5cdFx0fTtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogR2V0IHRoZSBzdGFjayBpbmZvIGZvciBTcGlkZXJNb25rZXlcclxuXHQgKiBAcGFyYW0ge1N0cmluZ30gc3RhY2tcclxuXHQgKi9cclxuXHRfZ2V0SW5mb1NwaWRlck1vbmtleTogZnVuY3Rpb24gKHN0YWNrKSB7XHJcblxyXG5cdFx0Ly8gUGFyc2UgdGhlIDV0aCBsaW5lIG9mIHRoZSBzdGFjayB0cmFjZSB0byBnZXQgbGluZSBpbmZvXHJcblx0XHR2YXIgbGluZSA9IHN0YWNrLnNwbGl0KCdcXG4nKVs0XSxcclxuXHRcdFx0aW5mbyA9IGxpbmUubWF0Y2goLyhbXkBdezEsfXwpKD86QCkoLiopKFxcOlswLTldezEsfSkvKTtcclxuXHJcblx0XHQvLyBJZiB0aGVyZSBpcyBubyBpbmZvLCBvdXIgcmVnZXggZmFpbGVkIGJlY2F1c2Ugb2YgYmFkIHN0YWNrIGRhdGFcclxuXHRcdGlmICghaW5mbykge1xyXG5cdFx0XHRyZXR1cm4ge307XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gR2V0IHRoZSBsaW5lIGluZm9cclxuXHRcdHZhclx0bWV0aG9kID0gaW5mb1sxXSB8fCAnYW5vbnltb3VzJyxcclxuXHRcdFx0ZmlsZSA9IGluZm9bMl0sXHJcblx0XHRcdGxpbmVOdW1iZXIgPSBwYXJzZUludChpbmZvWzNdLnN1YnN0cigxKSwgMTApO1xyXG5cclxuXHRcdC8vIFJldHVybiBhbiBvYmplY3QgdGhhdCB3aWxsIGJlIHVzZWQgdG8gbWFrZSBhIHN0cmluZyBsYXRlclxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0bWV0aG9kOiBtZXRob2QsXHJcblx0XHRcdGZpbGU6IGZpbGUsXHJcblx0XHRcdGxpbmU6IGxpbmVOdW1iZXIsXHJcblx0XHRcdGNoYXJhY3RlcjogdW5kZWZpbmVkXHJcblx0XHR9O1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBHZXQgdGhlIHN0YWNrIGluZm8gZm9yIENoYWtyYVxyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBzdGFja1xyXG5cdCAqL1xyXG5cdF9nZXRJbmZvQ2hha3JhOiBmdW5jdGlvbiAoc3RhY2spIHtcclxuXHJcblx0XHQvLyBQYXJzZSB0aGUgNnRoIGxpbmUgb2YgdGhlIHN0YWNrIHRyYWNlIHRvIGdldCBsaW5lIGluZm9cclxuXHRcdHZhciBsaW5lID0gc3RhY2suc3BsaXQoJ1xcbicpWzVdLFxyXG5cdFx0XHRpbmZvID0gbGluZS5tYXRjaCgvKD86YXRcXHMpKD86KFteXFwoXXsxfSkoPzpcXHNcXCgpKC4qKXwoKSgpKC4qKXwoKSgpKDxhbm9ueW1vdXM+KSkoXFw6WzAtOV17MSx9KShcXDpbMC05XXsxLH0pLyk7XHJcblxyXG5cdFx0Ly8gSWYgdGhlcmUgaXMgbm8gaW5mbywgb3VyIHJlZ2V4IGZhaWxlZCBiZWNhdXNlIG9mIGJhZCBzdGFjayBkYXRhXHJcblx0XHRpZiAoIWluZm8pIHtcclxuXHRcdFx0cmV0dXJuIHt9O1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEdldCB0aGUgbGluZSBpbmZvXHJcblx0XHR2YXJcdG1ldGhvZCA9IGluZm9bMV0gfHwgJ2Fub255bW91cycsXHJcblx0XHRcdGZpbGUgPSBpbmZvWzJdIHx8IGluZm9bNV0sXHJcblx0XHRcdGxpbmVOdW1iZXIgPSBwYXJzZUludChpbmZvWzldLnN1YnN0cigxKSwgMTApLFxyXG5cdFx0XHRjaGFyYWN0ZXIgPSBwYXJzZUludChpbmZvWzEwXS5zdWJzdHIoMSksIDEwKTtcclxuXHJcblx0XHQvLyBSZXR1cm4gYW4gb2JqZWN0IHRoYXQgd2lsbCBiZSB1c2VkIHRvIG1ha2UgYSBzdHJpbmcgbGF0ZXJcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdG1ldGhvZDogbWV0aG9kLFxyXG5cdFx0XHRmaWxlOiBmaWxlLFxyXG5cdFx0XHRsaW5lOiBsaW5lTnVtYmVyLFxyXG5cdFx0XHRjaGFyYWN0ZXI6IGNoYXJhY3RlclxyXG5cdFx0fTtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogR2VuZXJhdGUgYSBzdGFjayB0cmFjZVxyXG5cdCAqIEByZXR1cm4ge1N0cmluZ30gVGhlIHN0YWNrIHRyYWNlXHJcblx0ICovXHJcblx0X2dlbmVyYXRlU3RhY2tUcmFjZTogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdC8vIENyZWF0ZSBhIG5ldyBlcnJvclxyXG5cdFx0dmFyIGVycm9yID0gbmV3IEVycm9yKCk7XHJcblxyXG5cdFx0Ly8gSW4gc29tZSBlbmdpbmVzLCB0aGUgZXJyb3IgZG9lc24ndCBjb250YWluIGEgc3RhY2suIEdvdHRhIHRocm93IGFuIGVycm9yIGluc3RlYWQhXHJcblx0XHRpZiAoIWVycm9yLnN0YWNrKSB7XHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0aXMubm90LmZ1bmMoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXRjaCAoZSkge1xyXG5cdFx0XHRcdGVycm9yID0gZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBlcnJvci5zdGFjaztcclxuXHR9XHJcbn07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTdGFja1BhcnNlcjsiLCIvKipcclxuICogQ29uc3RydWN0b3JcclxuICogQHBhcmFtIHtPYmplY3R9IHBhcmFtc1xyXG4gKi9cclxuZnVuY3Rpb24gQ29uc29sZVRhcmdldCAocGFyYW1zKSB7XHJcblxyXG59XHJcblxyXG5cclxuLyoqXHJcbiAqIFByb3RvdHlwZSBtZXRob2RzXHJcbiAqL1xyXG5Db25zb2xlVGFyZ2V0LnByb3RvdHlwZSA9IHtcclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3JcclxuXHQgKiBAdHlwZSB7RnVuY3Rpb259XHJcblx0ICovXHJcblx0Y29uc3RydWN0b3I6IENvbnNvbGVUYXJnZXQsXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBXcml0ZSB0byB0aGUgY29uc29sZVxyXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFyZ3NcclxuXHQgKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXHJcblx0ICovXHJcblx0d3JpdGU6IGZ1bmN0aW9uIChhcmdzLCBtZXRob2QpIHtcclxuXHJcblx0XHQvLyBNYWtlIHN1cmUgdGhlcmUgaXMgYSBjb25zb2xlXHJcblx0XHRpZiAoY29uc29sZSkge1xyXG5cclxuXHRcdFx0Ly8gSWYgdGhlcmUgaXMgbm8gbWV0aG9kLCByZXZlcnQgdG8gbG9nXHJcblx0XHRcdGlmICghY29uc29sZVttZXRob2RdKSB7XHJcblxyXG5cdFx0XHRcdGlmICghY29uc29sZS5sb2cpIHtcclxuXHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0XHRtZXRob2QgPSAnbG9nJztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIEFwcGx5IHdpbGwgbWFpbnRhaW4gY29udGV4dCwgYnV0IGlzIG5vdCBhbHdheXMgYXZhaWxhYmxlXHJcblx0XHRcdGlmIChjb25zb2xlW21ldGhvZF0uYXBwbHkpIHtcclxuXHRcdFx0XHRjb25zb2xlW21ldGhvZF0uYXBwbHkoY29uc29sZSwgYXJncyk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0Y29uc29sZVttZXRob2RdKGFyZ3MpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gYXJncztcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb25zb2xlVGFyZ2V0OyIsIi8qKlxyXG4gKiBDb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zXHJcbiAqL1xyXG5mdW5jdGlvbiBFbGVtZW50VGFyZ2V0IChwYXJhbXMpIHtcclxuXHJcblx0dGhpcy5fZWxlbWVudCA9IHVuZGVmaW5lZDtcclxuXHR0aGlzLl9lbGVtZW50U2V0dXAgPSBmYWxzZTtcclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBPbiBjbGljayBtZXRob2QgcGxhY2Vob2xkZXJcclxuICogQHR5cGUge0Z1bmN0aW9ufVxyXG4gKi9cclxudmFyIG9uQ2xpY2s7XHJcblxyXG5cclxuLyoqXHJcbiAqIFByb3RvdHlwZSBtZXRob2RzXHJcbiAqL1xyXG5FbGVtZW50VGFyZ2V0LnByb3RvdHlwZSA9IHtcclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3JcclxuXHQgKiBAdHlwZSB7RnVuY3Rpb259XHJcblx0ICovXHJcblx0Y29uc3RydWN0b3I6IEVsZW1lbnRUYXJnZXQsXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgZWxlbWVudCB0byBsb2cgdG9cclxuXHQgKiBAdHlwZSB7TWl4ZWR9XHJcblx0ICovXHJcblx0X2VsZW1lbnQ6IHVuZGVmaW5lZCxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIEhhcyB0aGUgZWxlbWVudCBiZWVuIHNldHVwP1xyXG5cdCAqIEB0eXBlIHtCb29sZWFufVxyXG5cdCAqL1xyXG5cdF9lbGVtZW50U2V0dXA6IGZhbHNlLFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogQnVpbGQgYSBjb250ZW50IGVsZW1lbnRcclxuXHQgKiBAcGFyYW0ge01peGVkfSBjb250ZW50XHJcblx0ICogQHBhcmFtIHtPYmplY3R9IHBhcmFtc1xyXG5cdCAqL1xyXG5cdF9idWlsZENvbnRlbnQ6IGZ1bmN0aW9uIChjb250ZW50LCBwYXJhbXMpIHtcclxuXHJcblx0XHRwYXJhbXMgPSBwYXJhbXMgfHwge307XHJcblxyXG5cdFx0Ly8gTmV3IGVsZW1lbnRcclxuXHRcdHZhciBlbCxcclxuXHRcdFx0Y2xhc3NOYW1lID0gcGFyYW1zLmNsYXNzTmFtZSB8fCAnY29udGVudCcsXHJcblx0XHRcdHR5cGUgPSB0eXBlb2YgY29udGVudDtcclxuXHJcblx0XHQvL1xyXG5cdFx0c3dpdGNoICh0eXBlKSB7XHJcblx0XHRcdGNhc2UgJ29iamVjdCc6XHJcblx0XHRcdFx0ZWwgPSB0aGlzLl9idWlsZE9iamVjdENvbnRlbnQoY29udGVudCk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0ZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcblx0XHRcdFx0ZWwuaW5uZXJIVE1MID0gY29udGVudDtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHJcblx0XHQvLyBTZXQgcHJvcGVydGllc1xyXG5cdFx0ZWwuY2xhc3NOYW1lID0gY2xhc3NOYW1lICsgJyAnICsgdHlwZTtcclxuXHJcblx0XHRyZXR1cm4gZWw7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIEJ1aWxkIGEgY29udGVudCBlbGVtZW50IGZyb20gYSBoYXNoXHJcblx0ICogQHBhcmFtIHtPYmplY3R9IG9ialxyXG5cdCAqL1xyXG5cdF9idWlsZE9iamVjdENvbnRlbnQ6IGZ1bmN0aW9uIChvYmopIHtcclxuXHJcblx0XHR2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyksXHJcblx0XHRcdGhhcyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHksXHJcblx0XHRcdGtleTtcclxuXHJcblx0XHQvLyBMb29wXHJcblx0XHRmb3IgKGtleSBpbiBvYmopIHtcclxuXHJcblx0XHRcdC8vIE1ha2Ugc3VyZSB3ZSBkb24ndCBib3RoZXIgd2l0aCB0aGUgcHJvdG90eXBlXHJcblx0XHRcdGlmIChoYXMuY2FsbChvYmosIGtleSkpIHtcclxuXHRcdFx0XHRlbC5hcHBlbmRDaGlsZCh0aGlzLl9idWlsZE9iamVjdENvbnRlbnRSb3cob2JqW2tleV0sIGtleSkpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gU2V0IHByb3BlcnRpZXNcclxuXHRcdGVsLmNsYXNzTmFtZSA9ICdvYmplY3QnO1xyXG5cclxuXHRcdHJldHVybiBlbDtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogQnVpbGQgYSByb3cgb2Ygb2JqZWN0IGNvbnRlbnRcclxuXHQgKiBAcGFyYW0ge01peGVkfSB2YWx1ZVxyXG5cdCAqIEBwYXJhbSB7TWl4ZWR9IGtleVxyXG5cdCAqL1xyXG5cdF9idWlsZE9iamVjdENvbnRlbnRSb3c6IGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XHJcblxyXG5cdFx0dmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG5cclxuXHRcdGVsLmFwcGVuZENoaWxkKHRoaXMuX2J1aWxkT2JqZWN0Q29udGVudEtleShrZXkpKTtcclxuXHRcdGVsLmFwcGVuZENoaWxkKHRoaXMuX2J1aWxkT2JqZWN0Q29udGVudFZhbHVlKHZhbHVlKSk7XHJcblxyXG5cdFx0ZWwuY2xhc3NOYW1lID0gJ3Jvdyc7XHJcblxyXG5cdFx0cmV0dXJuIGVsO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBCdWlsZCBhIGNvbnRlbnQga2V5IGVsZW1lbnRcclxuXHQgKiBAcGFyYW0ge01peGVkfSBrZXlcclxuXHQgKi9cclxuXHRfYnVpbGRPYmplY3RDb250ZW50S2V5OiBmdW5jdGlvbiAoa2V5KSB7XHJcblxyXG5cdFx0dmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG5cdFx0ZWwuaW5uZXJIVE1MID0ga2V5O1xyXG5cdFx0ZWwuY2xhc3NOYW1lID0gJ2tleSc7XHJcblx0XHRyZXR1cm4gZWw7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIEJ1aWxkIGEgY29udGVudCB2YWx1ZSBlbGVtZW50XHJcblx0ICogQHBhcmFtIHtNaXhlZH0gdmFsdWVcclxuXHQgKi9cclxuXHRfYnVpbGRPYmplY3RDb250ZW50VmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG5cclxuXHRcdHZhciBlbCxcclxuXHRcdFx0dHlwZSA9IHR5cGVvZiB2YWx1ZTtcclxuXHJcblx0XHRzd2l0Y2ggKHR5cGUpIHtcclxuXHRcdFx0Y2FzZSAnb2JqZWN0JzpcclxuXHRcdFx0XHRlbCA9IHRoaXMuX2J1aWxkT2JqZWN0Q29udGVudCh2YWx1ZSk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0ZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcblx0XHRcdFx0ZWwuaW5uZXJIVE1MID0gdmFsdWU7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHR9XHJcblxyXG5cdFx0ZWwuY2xhc3NOYW1lID0gJ3ZhbHVlICcgKyB0eXBlO1xyXG5cclxuXHRcdHJldHVybiBlbDtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogV3JpdGUgYSBsb2cgdG8gYW4gZWxlbWVudFxyXG5cdCAqL1xyXG5cdF9sb2c6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHQvLyBNYWtlIHN1cmUgd2UgaGF2ZSBhbiBlbGVtZW50XHJcblx0XHRpZiAoIXRoaXMuX2NoZWNrRWxlbWVudCgpKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBOZXcgZWxlbWVudHNcclxuXHRcdHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxyXG5cdFx0XHRpbmZvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG5cclxuXHRcdC8vIExhc3QgcGFyYW0gaXMgdGhlIHN0YWNrIGluZm9cclxuXHRcdHZhciBwYXJhbXMgPSBhcmd1bWVudHMsXHJcblx0XHRcdHN0YWNrSW5mbyA9IEFycmF5LnByb3RvdHlwZS5wb3AuY2FsbChwYXJhbXMpO1xyXG5cclxuXHRcdC8vIEluZm8gc3RyaW5nXHJcblx0XHRpbmZvLmlubmVySFRNTCA9IHN0YWNrSW5mbztcclxuXHRcdGluZm8uY2xhc3NOYW1lID0gJ2luZm8nO1xyXG5cclxuXHRcdC8vIEFkZCBjaGlsZHJlbiB0byB0aGUgZWxlbWVudFxyXG5cdFx0ZWwuYXBwZW5kQ2hpbGQoaW5mbyk7XHJcblxyXG5cdFx0Ly8gQ29udGVudCBzdHJpbmdcclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcGFyYW1zLmxlbmd0aDsgaSs9MSkge1xyXG5cdFx0XHRlbC5hcHBlbmRDaGlsZCh0aGlzLl9idWlsZENvbnRlbnQocGFyYW1zW2ldKSk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gQWRkIHRoZSBlbGVtZW50XHJcblx0XHRlbC5jbGFzc05hbWUgPSAnbG9nJztcclxuXHRcdHRoaXMuX2VsZW1lbnQuYXBwZW5kQ2hpbGQoZWwpO1xyXG5cclxuXHRcdHJldHVybiBlbDtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogV3JpdGUgYW4gZXJyb3IgdG8gYW4gZWxlbWVudFxyXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFyZ3NcclxuXHQgKi9cclxuXHRfZXJyb3I6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHR2YXIgZWwgPSB0aGlzLl9sb2cuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHJcblx0XHRlbC5jbGFzc05hbWUgPSAnbG9nIGVycm9yJztcclxuXHJcblx0XHRyZXR1cm4gZWw7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFdyaXRlIGEgd2FybmluZyB0byBhbiBlbGVtZW50XHJcblx0ICogQHBhcmFtIHtBcnJheX0gYXJnc1xyXG5cdCAqL1xyXG5cdF93YXJuOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0dmFyIGVsID0gdGhpcy5fbG9nLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcblxyXG5cdFx0ZWwuY2xhc3NOYW1lID0gJ2xvZyB3YXJuJztcclxuXHJcblx0XHRyZXR1cm4gZWw7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFdyaXRlIGluZm8gdG8gYW4gZWxlbWVudFxyXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFyZ3NcclxuXHQgKi9cclxuXHRfaW5mbzogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdHZhciBlbCA9IHRoaXMuX2xvZy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG5cclxuXHRcdGVsLmNsYXNzTmFtZSA9ICdsb2cgaW5mbyc7XHJcblxyXG5cdFx0cmV0dXJuIGVsO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBXcml0ZSBhIGRlYnVnIHRvIGFuIGVsZW1lbnRcclxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcmdzXHJcblx0ICovXHJcblx0X2RlYnVnOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0dmFyIGVsID0gdGhpcy5fbG9nLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcblxyXG5cdFx0ZWwuY2xhc3NOYW1lID0gJ2xvZyBkZWJ1Zyc7XHJcblxyXG5cdFx0cmV0dXJuIGVsO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBXcml0ZSBhIHRhYmxlIHRvIGFuIGVsZW1lbnRcclxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcmdzXHJcblx0ICovXHJcblx0X3RhYmxlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0dmFyIGVsID0gdGhpcy5fbG9nLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcblxyXG5cdFx0ZWwuY2xhc3NOYW1lID0gJ2xvZyB0YWJsZSc7XHJcblxyXG5cdFx0cmV0dXJuIGVsO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBDaGVjayB0aGF0IHRoZXJlIGlzIGFuIGVsZW1lbnQgYW5kIGNyZWF0ZSBpZiB3ZSBkb24ndCBoYXZlIG9uZVxyXG5cdCAqL1xyXG5cdF9jaGVja0VsZW1lbnQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHQvLyBNYWtlIHN1cmUgd2UndmUgc2V0IHVwIHRoZSBlbGVtZW50XHJcblx0XHRpZiAoIXRoaXMuX2VsZW1lbnRTZXR1cCkge1xyXG5cdFx0XHR0aGlzLl9zZXR1cEVsZW1lbnQoKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBSZXR1cm4gdGhlIGVsZW1lbnQgaWYgd2UgaGF2ZSBpdFxyXG5cdFx0aWYgKHRoaXMuX2VsZW1lbnQpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX2VsZW1lbnQ7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gVHJ5IHRvIGNyZWF0ZVxyXG5cdFx0cmV0dXJuIHRoaXMuX2NyZWF0ZUVsZW1lbnQoKTtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlIGFuIGVsZW1lbnQgdG8gd3JpdGUgdG8gYW5kIHRyeSB0byBhZGQgaXQgdG8gdGhlIGJvZHlcclxuXHQgKi9cclxuXHRfY3JlYXRlRWxlbWVudDogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdC8vIElmIHRoZXJlIGlzIG5vIHdpbmRvdyBvYmplY3QsIHdlJ3JlIFNPTFxyXG5cdFx0aWYgKCFkb2N1bWVudCkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gQ3JlYXRlIHRoZSBlbGVtZW50XHJcblx0XHR0aGlzLl9lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblxyXG5cdFx0Ly8gU2V0IGVsZW1lbnQgcHJvcGVydGllc1xyXG5cdFx0dGhpcy5fZWxlbWVudC5jbGFzc05hbWUgPSAnbG9nZ2llciBnZW5lcmF0ZWQnO1xyXG5cclxuXHRcdC8vIEFwcGVuZCBpdCB0byB0aGUgZG9jdW1lbnRcclxuXHRcdGRvY3VtZW50LmJvZHkuaW5zZXJ0QmVmb3JlKHRoaXMuX2VsZW1lbnQsIGRvY3VtZW50LmJvZHkuZmlyc3RDaGlsZCk7XHJcblx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTmFtZSArPSAnIGxvZ2dpZXItZ2VuZXJhdGVkJztcclxuXHJcblx0XHQvLyBTZXR1cCB0aGUgZWxlbWVudFxyXG5cdFx0dGhpcy5fc2V0dXBFbGVtZW50KCk7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuX2VsZW1lbnQ7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFNldHVwIHRoZSBlbGVtZW50IC0gYWRkaW5nIGV2ZW50IGxpc3RlbmVyc1xyXG5cdCAqL1xyXG5cdF9zZXR1cEVsZW1lbnQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHQvLyBDYW4ndCBkbyB0aGlzIHdpdGggbm8gZWxlbWVudFxyXG5cdFx0aWYgKCF0aGlzLl9lbGVtZW50IHx8IHRoaXMuX2VsZW1lbnRTZXR1cCkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gTGlzdGVuIGZvciBjbGlja3Mgb24gdGhlIHdob2xlIGxvZ2dlclxyXG5cdFx0b25DbGljayA9IHRoaXMuX29uQ2xpY2suYmluZCh0aGlzKTtcclxuXHRcdGlmICh0aGlzLl9lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIpIHtcclxuXHRcdFx0dGhpcy5fZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG9uQ2xpY2ssIGZhbHNlKTtcclxuXHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHR0aGlzLl9lbGVtZW50LmF0dGFjaEV2ZW50KCdvbmNsaWNrJywgb25DbGljayk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gV2UncmUgc2V0dXBcclxuXHRcdHRoaXMuX2VsZW1lbnRTZXR1cCA9IHRydWU7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIENsZWFudXAgdGhlIGVsZW1lbnQgLSByZW1vdmluZyBldmVudCBsaXN0ZW5lcnNcclxuXHQgKi9cclxuXHRfY2xlYW51cEVsZW1lbnQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHQvLyBDYW4ndCBkbyB0aGlzIHdpdGggbm8gZWxlbWVudFxyXG5cdFx0aWYgKCF0aGlzLl9lbGVtZW50IHx8ICF0aGlzLl9lbGVtZW50U2V0dXApIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFN0b3AgbGlzdGVuaW5nIGZvciBjbGlja3NcclxuXHRcdGlmICh0aGlzLl9lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIpIHtcclxuXHRcdFx0dGhpcy5fZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIG9uQ2xpY2ssIGZhbHNlKTtcclxuXHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHR0aGlzLl9lbGVtZW50LmRldGFjaEV2ZW50KCdvbmNsaWNrJywgb25DbGljayk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gV2UncmUgbm90IHNldHVwXHJcblx0XHR0aGlzLl9lbGVtZW50U2V0dXAgPSBmYWxzZTtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogSXMgdGhpcyBhbiBvYmplY3QgZWxlbWVudCBvciBkb2VzIGl0IGhhdmUgYSBwYXJlbnQgdGhhdCBpcyBvbmU/XHJcblx0ICogQHBhcmFtIHtPYmplY3R9IGVsXHJcblx0ICogQHJldHVybiB7TWl4ZWR9IFtkZXNjcmlwdGlvbl1cclxuXHQgKi9cclxuXHRfaXNPckhhc09iamVjdFBhcmVudDogZnVuY3Rpb24gKGVsKSB7XHJcblxyXG5cdFx0aWYgKCFlbCB8fCAhZWwuY2xhc3NOYW1lKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoZWwuY2xhc3NOYW1lLmluZGV4T2YoJ29iamVjdCcpICE9PSAtMSkge1xyXG5cdFx0XHRyZXR1cm4gZWw7XHJcblx0XHR9XHJcblx0XHRlbHNlIGlmIChlbC5wYXJlbnROb2RlKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9pc09ySGFzT2JqZWN0UGFyZW50KGVsLnBhcmVudE5vZGUpO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogVG9nZ2xlIGFuIG9iamVjdCBiZWluZyBvcGVuIG9yIGNsb3NlZFxyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBlbFxyXG5cdCAqL1xyXG5cdF90b2dnbGVPYmplY3Q6IGZ1bmN0aW9uIChlbCkge1xyXG5cclxuXHRcdC8vIE5vdCBleHBhbmRlZFxyXG5cdFx0aWYgKGVsLmNsYXNzTmFtZS5pbmRleE9mKCdleHBhbmQnKSA9PT0gLTEpIHtcclxuXHRcdFx0ZWwuY2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lICsgJyBleHBhbmQnO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdGVsLmNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZS5yZXBsYWNlKCdleHBhbmQnLCAnJykucmVwbGFjZSgvXlxccyt8XFxzKyQvZywnJyk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFdoZW4gdGhlIGVsZW1lbnQgaXMgY2xpY2tlZFxyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBlXHJcblx0ICovXHJcblx0X29uQ2xpY2s6IGZ1bmN0aW9uIChlKSB7XHJcblxyXG5cdFx0dmFyIGVsID0gdGhpcy5faXNPckhhc09iamVjdFBhcmVudChlLnRhcmdldCk7XHJcblxyXG5cdFx0aWYgKGVsKSB7XHJcblx0XHRcdHRoaXMuX3RvZ2dsZU9iamVjdChlbCk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFdyaXRlIHRvIHRoZSBlbGVtZW50XHJcblx0ICogQHBhcmFtIHtBcnJheX0gYXJnc1xyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcclxuXHQgKi9cclxuXHR3cml0ZTogZnVuY3Rpb24gKGFyZ3MsIG1ldGhvZCkge1xyXG5cclxuXHRcdC8vIE1ha2Ugc3VyZSB3ZSBoYXZlIGFuIGVsZW1lbnRcclxuXHRcdGlmICghdGhpcy5fY2hlY2tFbGVtZW50KCkpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFRoZSBtZXRob2QgbmFtZVxyXG5cdFx0dmFyIG1ldGhvZE5hbWUgPSAnXycgKyBtZXRob2QsXHJcblx0XHRcdGRlZmF1bHRNZXRob2ROYW1lID0gJ19sb2cnO1xyXG5cclxuXHRcdC8vIElmIHRoZXJlIGlzIG5vIG1ldGhvZCwgcmV2ZXJ0IHRvIGRlZmF1bHRcclxuXHRcdGlmICghdGhpc1ttZXRob2ROYW1lXSkge1xyXG5cdFx0XHRtZXRob2ROYW1lID0gZGVmYXVsdE1ldGhvZE5hbWU7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gQ2FsbCB0aGUgbWV0aG9kXHJcblx0XHR0aGlzW21ldGhvZE5hbWVdLmFwcGx5KHRoaXMsIGFyZ3MpO1xyXG5cclxuXHRcdHJldHVybiBhcmdzO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBTZXQgdGhlIGVsZW1lbnQgd2UnbGwgd3JpdGUgdG9cclxuXHQgKiBAcGFyYW0ge09iamVjdH0gZWxcclxuXHQgKi9cclxuXHRlbGVtZW50OiBmdW5jdGlvbiAoZWwpIHtcclxuXHJcblx0XHRjb25zb2xlLmxvZygnaGVyZScpO1xyXG5cdFx0aWYgKGVsICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0aWYgKHRoaXMuX2VsZW1lbnQpIHtcclxuXHRcdFx0XHR0aGlzLl9jbGVhbnVwRWxlbWVudCgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHRoaXMuX2VsZW1lbnQgPSBlbDtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcy5fZWxlbWVudDtcclxuXHR9XHJcbn07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFbGVtZW50VGFyZ2V0OyJdfQ==
(1)
});
