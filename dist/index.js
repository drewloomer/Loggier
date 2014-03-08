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
	 * Build a content element from an array
	 * @param {Object} obj
	 */
	_buildArrayContent: function (obj) {

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
	 * Build a content element from a hash
	 * @param {Object} obj
	 */
	_buildObjectContent: function (obj) {

		if (obj instanceof Array) {
			return this._buildArrayContent(obj);
		}

		var el = document.createElement('span'),
			has = Object.prototype.hasOwnProperty,
			key,
			i = 0;

		// Loop
		for (key in obj) {

			// Make sure we don't bother with the prototype
			if (has.call(obj, key)) {
				el.appendChild(this._buildObjectContentRow(obj[key], key));
			}

			i+=1;
		}

		// Set properties
		el.className = 'object';
		el.setAttribute('data-length', i);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJXOlxcUGVyc29uYWxcXGxvZ2dpZXJcXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiVzovUGVyc29uYWwvbG9nZ2llci9zcmMvZmFrZV81N2E3ZjFiOC5qcyIsIlc6L1BlcnNvbmFsL2xvZ2dpZXIvc3JjL2hlbHBlcnMvbm9ybWFsaXplLmpzIiwiVzovUGVyc29uYWwvbG9nZ2llci9zcmMvaGVscGVycy9zdGFjay1wYXJzZXIuanMiLCJXOi9QZXJzb25hbC9sb2dnaWVyL3NyYy90YXJnZXRzL2NvbnNvbGUuanMiLCJXOi9QZXJzb25hbC9sb2dnaWVyL3NyYy90YXJnZXRzL2VsZW1lbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBub3JtYWxpemUgPSByZXF1aXJlKCcuL2hlbHBlcnMvbm9ybWFsaXplJyksXHJcblx0Q29uc29sZVRhcmdldCA9IHJlcXVpcmUoJy4vdGFyZ2V0cy9jb25zb2xlJyksXHJcblx0RWxlbWVudFRhcmdldCA9IHJlcXVpcmUoJy4vdGFyZ2V0cy9lbGVtZW50JyksXHJcblx0U3RhY2tQYXJzZXIgPSByZXF1aXJlKCcuL2hlbHBlcnMvc3RhY2stcGFyc2VyJyk7XHJcblxyXG4vKipcclxuICogQ29uc3RydWN0b3JcclxuICogQHBhcmFtIHtPYmplY3R9IHBhcmFtc1xyXG4gKi9cclxuZnVuY3Rpb24gTG9nZ2llciAocGFyYW1zKSB7XHJcblxyXG5cdHBhcmFtcyA9IHBhcmFtcyB8fCB7fTtcclxuXHJcblx0Ly8gVGFyZ2V0XHJcblx0aWYgKHBhcmFtcy50YXJnZXQpIHtcclxuXHRcdHRoaXMudGFyZ2V0KHBhcmFtcy50YXJnZXQpO1xyXG5cdH1cclxuXHJcblx0Ly8gTG9nZ2luZyBlbGVtZW50XHJcblx0aWYgKHBhcmFtcy5lbGVtZW50KSB7XHJcblx0XHR0aGlzLmVsZW1lbnQocGFyYW1zLmVsZW1lbnQpO1xyXG5cdH1cclxuXHJcblx0Ly8gRW5hYmxlZFxyXG5cdGlmIChwYXJhbXMuZW5hYmxlZCAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHR0aGlzLl9lbmFibGVkID0gcGFyYW1zLmVuYWJsZWQ7XHJcblx0fVxyXG5cclxuXHQvLyBTZXQgYSBjbGFzcyBvbiB0aGUgYm9keVxyXG5cdGlmICh0aGlzLl9lbmFibGVkKSB7XHJcblx0XHR0aGlzLmVuYWJsZSgpO1xyXG5cdH1cclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBMb2cgbGV2ZWxzXHJcbiAqIEB0eXBlIHtBcnJheX1cclxuICovXHJcbnZhciBsb2dMZXZlbHMgPSB7XHJcblx0XHQnZXJyb3InOiAxLFxyXG5cdFx0J3dhcm4nOiAyLFxyXG5cdFx0J2RlYnVnJzogNCxcclxuXHRcdCdpbmZvJzogOCxcclxuXHRcdCdsb2cnOiAxNlxyXG5cdH07XHJcblxyXG5cclxuLyoqXHJcbiAqIFByb3RvdHlwZSBtZXRob2RzXHJcbiAqL1xyXG5Mb2dnaWVyLnByb3RvdHlwZSA9IHtcclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3JcclxuXHQgKiBAdHlwZSB7RnVuY3Rpb259XHJcblx0ICovXHJcblx0Y29uc3RydWN0b3I6IExvZ2dpZXIsXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBJcyBsb2dnaW5nIGVuYWJsZWQ/XHJcblx0ICogQHR5cGUge0Jvb2xlYW59XHJcblx0ICovXHJcblx0X2VuYWJsZWQ6IHRydWUsXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgbG9nZ2luZyB0YXJnZXRcclxuXHQgKiBAdHlwZSB7U3RyaW5nfVxyXG5cdCAqL1xyXG5cdF90YXJnZXRJZDogJ2NvbnNvbGUnLFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogUG9zc2libGUgbG9nZ2luZyB0YXJnZXRzXHJcblx0ICogQHR5cGUge09iamVjdH1cclxuXHQgKi9cclxuXHRfdGFyZ2V0czoge1xyXG5cdFx0J2NvbnNvbGUnOiBuZXcgQ29uc29sZVRhcmdldCgpLFxyXG5cdFx0J2VsZW1lbnQnOiBuZXcgRWxlbWVudFRhcmdldCgpXHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIENsYXNzIG5hbWUgZm9yIHRoZSBib2R5IHdoZW4gd2UncmUgZW5hYmxlZFxyXG5cdCAqIEB0eXBlIHtTdHJpbmd9XHJcblx0ICovXHJcblx0X2VuYWJsZWRDbGFzc05hbWU6ICdsb2dnaWVyLWVuYWJsZWQnLFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogU3RhY2sgcGFyc2VyIGhlbHBlclxyXG5cdCAqIEB0eXBlIHtPYmplY3R9XHJcblx0ICovXHJcblx0X3N0YWNrUGFyc2VyOiBuZXcgU3RhY2tQYXJzZXIoKSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIExvZyBsZXZlbHNcclxuXHQgKiBAdHlwZSB7T2JqZWN0fVxyXG5cdCAqL1xyXG5cdF9sb2dMZXZlbHM6IGxvZ0xldmVscyxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBjdXJyZW50IGxvZyBsZXZlbFxyXG5cdCAqIEB0eXBlIHtOdW1iZXJ9XHJcblx0ICovXHJcblx0X2xvZ0xldmVsOiBsb2dMZXZlbHMuZXJyb3IgfCBsb2dMZXZlbHMud2FybiB8IGxvZ0xldmVscy5kZWJ1ZyB8IGxvZ0xldmVscy5sb2cgfCBsb2dMZXZlbHMuaW5mbyxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIERvZXMgdGhlIGFjdHVhbCB3cml0aW5nXHJcblx0ICogQHBhcmFtIHtBcnJheX0gYXJnc1xyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcclxuXHQgKi9cclxuXHRfd3JpdGU6IGZ1bmN0aW9uIChhcmdzLCBtZXRob2QpIHtcclxuXHJcblx0XHQvLyBEb24ndCBsb2cgaWYgd2UncmUgbm90IGVuYWJsZWRcclxuXHRcdGlmICghdGhpcy5fZW5hYmxlZCB8fCAhKHRoaXMuX2xvZ0xldmVsICYgKHRoaXMuX2xvZ0xldmVsc1ttZXRob2RdIHx8IHRoaXMuX2xvZ0xldmVsc1snbG9nJ10pKSkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gVGFibGUgbG9nZ2luZyBkb2Vzbid0IGxpa2UgZXh0cmEgZGF0YVxyXG5cdFx0aWYgKG1ldGhvZCAhPT0gJ3RhYmxlJykge1xyXG5cclxuXHRcdFx0Ly8gRmlsZSBpbmZvIHRvIGFwcGVuZFxyXG5cdFx0XHR2YXIgaW5mbyA9IHRoaXMuX3N0YWNrUGFyc2VyLmdldEluZm8oKTtcclxuXHJcblx0XHRcdC8vIEFwcGVuZCB0aGUgaW5mb1xyXG5cdFx0XHRhcmdzLnB1c2godGhpcy5fYnVpbGRTdGFja0luZm9TdHJpbmcoaW5mbykpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFdyaXRlIG1ldGhvZCBiYXNlZCBvbiB0YXJnZXRcclxuXHRcdHJldHVybiB0aGlzLnRhcmdldCgpLndyaXRlKGFyZ3MsIG1ldGhvZCk7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIEJ1aWxkIGEgc3RyaW5nIG9mIHN0YWNrIGluZm9cclxuXHQgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zXHJcblx0ICogQHJldHVybiB7U3RyaW5nfVxyXG5cdCAqL1xyXG5cdF9idWlsZFN0YWNrSW5mb1N0cmluZzogZnVuY3Rpb24gKHBhcmFtcykge1xyXG5cclxuXHRcdHZhciBsb2NhdGlvbiA9IHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbCArICcvLycgKyB3aW5kb3cubG9jYXRpb24uaG9zdCArICcvJztcclxuXHRcdHJldHVybiAocGFyYW1zLm1ldGhvZCArICdAJyArIHBhcmFtcy5maWxlICsgJzonICsgcGFyYW1zLmxpbmUgKyAocGFyYW1zLmNoYXJhY3RlciAhPT0gdW5kZWZpbmVkID8gJzonICsgcGFyYW1zLmNoYXJhY3RlciA6ICcnKSkucmVwbGFjZShsb2NhdGlvbiwgJycpO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBBZGQgYSBjbGFzcyB0byB0aGUgYm9keSB0byByZWZsZWN0IHRoZSBlbmFibGVkIHN0YXRlXHJcblx0ICovXHJcblx0X2FkZEJvZHlDbGFzczogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdHZhciBjbGFzc05hbWUgPSBkb2N1bWVudC5ib2R5LmNsYXNzTmFtZSxcclxuXHRcdFx0cHJlc2VudCA9IGNsYXNzTmFtZS5pbmRleE9mKHRoaXMuX2VuYWJsZWRDbGFzc05hbWUpO1xyXG5cclxuXHRcdGlmIChwcmVzZW50ID09PSAtMSkge1xyXG5cdFx0XHRjbGFzc05hbWUgPSBjbGFzc05hbWUgKyAnICcgKyB0aGlzLl9lbmFibGVkQ2xhc3NOYW1lO1xyXG5cdFx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTmFtZSA9IGNsYXNzTmFtZS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCcnKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogUmVtb3ZlIGEgY2xhc3MgZnJvbSB0aGUgYm9keSB0byByZWZsZWN0IHRoZSBkaXNhYmxlZCBzdGF0ZVxyXG5cdCAqL1xyXG5cdF9yZW1vdmVCb2R5Q2xhc3M6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHR2YXIgY2xhc3NOYW1lID0gZG9jdW1lbnQuYm9keS5jbGFzc05hbWUsXHJcblx0XHRcdHByZXNlbnQgPSBjbGFzc05hbWUuaW5kZXhPZih0aGlzLl9lbmFibGVkQ2xhc3NOYW1lKTtcclxuXHJcblx0XHRpZiAocHJlc2VudCAhPT0gLTEpIHtcclxuXHRcdFx0Y2xhc3NOYW1lID0gY2xhc3NOYW1lLnJlcGxhY2UodGhpcy5fZW5hYmxlZENsYXNzTmFtZSwgJycsICdnaScpO1xyXG5cdFx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTmFtZSA9IGNsYXNzTmFtZTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogU2V0IG9yIGdldCB0aGUgY3VycmVudCB0YXJnZXRcclxuXHQgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxyXG5cdCAqIEByZXR1cm4ge09iamVjdH1cclxuXHQgKi9cclxuXHR0YXJnZXQ6IGZ1bmN0aW9uIChuYW1lKSB7XHJcblxyXG5cdFx0aWYgKG5hbWUgIT09IHVuZGVmaW5lZCAmJiB0aGlzLl90YXJnZXRzLmhhc093blByb3BlcnR5KG5hbWUpKSB7XHJcblx0XHRcdHRoaXMuX3RhcmdldElkID0gbmFtZTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcy5fdGFyZ2V0c1t0aGlzLl90YXJnZXRJZF07XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFNldCBvciBnZXQgdGhlIGVsZW1lbnRcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gZWxcclxuXHQgKiBAcmV0dXJuIHtPYmplY3R9XHJcblx0ICovXHJcblx0ZWxlbWVudDogZnVuY3Rpb24gKGVsKSB7XHJcblxyXG5cdFx0aWYgKHRoaXMuX3RhcmdldElkID09PSAnZWxlbWVudCcpIHtcclxuXHJcblx0XHRcdGlmIChlbCAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0cmV0dXJuIHRoaXMudGFyZ2V0KCkuZWxlbWVudChlbCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiB0aGlzLnRhcmdldCgpLmVsZW1lbnQoKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogU2V0IG9yIGdldCB0aGUgbG9nIGxldmVsXHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IGxldmVsTmFtZVxyXG5cdCAqIEByZXR1cm4ge051bWJlcn1cclxuXHQgKi9cclxuXHRsb2dMZXZlbDogZnVuY3Rpb24gKGxldmVsTmFtZSkge1xyXG5cclxuXHRcdC8vIEdldCB0aGUgbGV2ZWxcclxuXHRcdGlmIChsZXZlbE5hbWUgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5fbG9nTGV2ZWw7XHJcblx0XHR9XHJcblxyXG5cclxuXHRcdC8vIFNldCB0aGUgbGV2ZWxcclxuXHRcdHZhciBrZXksXHJcblx0XHRcdGxldmVsID0gdGhpcy5fbG9nTGV2ZWxzW2xldmVsTmFtZV0sXHJcblx0XHRcdG1hc2sgPSAwLFxyXG5cdFx0XHRjdXJMZXZlbDtcclxuXHRcdGZvciAoa2V5IGluIHRoaXMuX2xvZ0xldmVscykge1xyXG5cdFx0XHRjdXJMZXZlbCA9IHRoaXMuX2xvZ0xldmVsc1trZXldO1xyXG5cdFx0XHRpZiAoY3VyTGV2ZWwgPD0gbGV2ZWwpIHtcclxuXHRcdFx0XHRtYXNrID0gbWFzayB8IGN1ckxldmVsO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuX2xvZ0xldmVsID0gbGV2ZWw7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIEVuYWJsZSBsb2dnaW5nXHJcblx0ICovXHJcblx0ZW5hYmxlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0dGhpcy5fZW5hYmxlZCA9IHRydWU7XHJcblx0XHR0aGlzLl9hZGRCb2R5Q2xhc3MoKTtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogRGlzYWJsZSBsb2dnaW5nXHJcblx0ICovXHJcblx0ZGlzYWJsZTogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdHRoaXMuX2VuYWJsZWQgPSBmYWxzZTtcclxuXHRcdHRoaXMuX3JlbW92ZUJvZHlDbGFzcygpO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBMb2cgdGFidWxhciBkYXRhXHJcblx0ICovXHJcblx0bG9nOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuX3dyaXRlKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCksICdsb2cnKTtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogTG9nIHRhYnVsYXIgZGF0YVxyXG5cdCAqL1xyXG5cdGVycm9yOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuX3dyaXRlKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCksICdlcnJvcicpO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBMb2cgdGFidWxhciBkYXRhXHJcblx0ICovXHJcblx0d2FybjogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdHJldHVybiB0aGlzLl93cml0ZShBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApLCAnd2FybicpO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBMb2cgdGFidWxhciBkYXRhXHJcblx0ICovXHJcblx0aW5mbzogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdHJldHVybiB0aGlzLl93cml0ZShBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApLCAnaW5mbycpO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBMb2cgdGFidWxhciBkYXRhXHJcblx0ICovXHJcblx0ZGVidWc6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5fd3JpdGUoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSwgJ2RlYnVnJyk7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIExvZyB0YWJ1bGFyIGRhdGFcclxuXHQgKi9cclxuXHR0YWJsZTogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdHJldHVybiB0aGlzLl93cml0ZShBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApLCAndGFibGUnKTtcclxuXHR9XHJcbn07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMb2dnaWVyOyIsImlmICghRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQpIHtcclxuXHRGdW5jdGlvbi5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uIChvVGhpcykge1xyXG5cdFx0aWYgKHR5cGVvZiB0aGlzICE9PSBcImZ1bmN0aW9uXCIpIHtcclxuXHRcdFx0Ly8gY2xvc2VzdCB0aGluZyBwb3NzaWJsZSB0byB0aGUgRUNNQVNjcmlwdCA1IGludGVybmFsIElzQ2FsbGFibGUgZnVuY3Rpb25cclxuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihcIkZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kIC0gd2hhdCBpcyB0cnlpbmcgdG8gYmUgYm91bmQgaXMgbm90IGNhbGxhYmxlXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBhQXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSksXHJcblx0XHRcdFx0ZlRvQmluZCA9IHRoaXMsXHJcblx0XHRcdFx0Zk5PUCA9IGZ1bmN0aW9uICgpIHt9LFxyXG5cdFx0XHRcdGZCb3VuZCA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRcdHJldHVybiBmVG9CaW5kLmFwcGx5KHRoaXMgaW5zdGFuY2VvZiBmTk9QICYmIG9UaGlzXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ID8gdGhpc1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCA6IG9UaGlzLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQgYUFyZ3MuY29uY2F0KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcclxuXHRcdFx0XHR9O1xyXG5cclxuXHRcdGZOT1AucHJvdG90eXBlID0gdGhpcy5wcm90b3R5cGU7XHJcblx0XHRmQm91bmQucHJvdG90eXBlID0gbmV3IGZOT1AoKTtcclxuXHJcblx0XHRyZXR1cm4gZkJvdW5kO1xyXG5cdH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdGJpbmQ6IEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kXHJcbn07IiwiLyoqXHJcbiAqIENvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXNcclxuICovXHJcbmZ1bmN0aW9uIFN0YWNrUGFyc2VyIChwYXJhbXMpIHtcclxuXHJcbn1cclxuXHJcblxyXG4vKipcclxuICogUHJvdG90eXBlIG1ldGhvZHNcclxuICovXHJcblN0YWNrUGFyc2VyLnByb3RvdHlwZSA9IHtcclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3JcclxuXHQgKiBAdHlwZSB7RnVuY3Rpb259XHJcblx0ICovXHJcblx0Y29uc3RydWN0b3I6IFN0YWNrUGFyc2VyLFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogRXh0cmFjdCB0aGUgbGluZSBudW1iZXIgZnJvbSBhIHN0YWNrIHRyYWNlXHJcblx0ICovXHJcblx0Z2V0SW5mbzogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdC8vIE5ldyBlcnJvciBmb3IgdGhlIHN0YWNrIGluZm9cclxuXHRcdHZhciBzdGFjayA9IHRoaXMuX2dlbmVyYXRlU3RhY2tUcmFjZSgpLFxyXG5cdFx0XHRsaW5lLFxyXG5cdFx0XHRpbmZvLFxyXG5cdFx0XHRmaWxlLFxyXG5cdFx0XHRtZXRob2QsXHJcblx0XHRcdGxpbmVOdW1iZXIsXHJcblx0XHRcdGNoYXJhY3RlcjtcclxuXHJcblx0XHQvLyBQYXJzZSBkaWZmZXJlbnQgdHlwZXMgb2YgdHJhY2VzXHJcblx0XHRpZiAoc3RhY2suaW5kZXhPZignRXJyb3InKSA9PT0gMCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5fZ2V0SW5mb1Y4KHN0YWNrKTtcclxuXHRcdH1cclxuXHRcdGVsc2UgaWYgKHN0YWNrLmluZGV4T2YoJ1JlZmVyZW5jZUVycm9yJykgPT09IDApIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX2dldEluZm9DaGFrcmEoc3RhY2spO1xyXG5cdFx0fVxyXG5cdFx0Ly8gVE9ETzogTml0cm8gc3VwcG9ydFxyXG5cdFx0Ly8gZWxzZSBpZiAoc3RhY2suaW5kZXhPZignUmVmZXJlbmNlRXJyb3InKSA9PT0gMCkge1xyXG5cdFx0Ly8gXHRyZXR1cm4gdGhpcy5fZ2V0SW5mb0NoYWtyYShzdGFjayk7XHJcblx0XHQvLyB9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX2dldEluZm9TcGlkZXJNb25rZXkoc3RhY2spO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBHZXQgdGhlIHN0YWNrIGluZm8gZm9yIFY4XHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IHN0YWNrXHJcblx0ICovXHJcblx0X2dldEluZm9WODogZnVuY3Rpb24gKHN0YWNrKSB7XHJcblxyXG5cdFx0Ly8gUGFyc2UgdGhlIDZ0aCBsaW5lIG9mIHRoZSBzdGFjayB0cmFjZSB0byBnZXQgbGluZSBpbmZvXHJcblx0XHR2YXIgbGluZSA9IHN0YWNrLnNwbGl0KCdcXG4nKVs1XSxcclxuXHRcdFx0aW5mbyA9IGxpbmUubWF0Y2goLyg/OmF0XFxzKSg/OihbXlxcKF17MSx9KSg/Olxcc1xcKCkoLiopfCgpKCkoLiopfCgpKCkoPGFub255bW91cz4pKShcXDpbMC05XXsxLH0pKFxcOlswLTldezEsfSkvKTtcclxuXHJcblx0XHQvLyBJZiB0aGVyZSBpcyBubyBpbmZvLCBvdXIgcmVnZXggZmFpbGVkIGJlY2F1c2Ugb2YgYmFkIHN0YWNrIGRhdGFcclxuXHRcdGlmICghaW5mbykge1xyXG5cdFx0XHRyZXR1cm4ge307XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gR2V0IHRoZSBsaW5lIGluZm9cclxuXHRcdHZhclx0bWV0aG9kID0gaW5mb1sxXSB8fCAnYW5vbnltb3VzJyxcclxuXHRcdFx0ZmlsZSA9IGluZm9bMl0gfHwgaW5mb1s1XSxcclxuXHRcdFx0bGluZU51bWJlciA9IHBhcnNlSW50KGluZm9bOV0uc3Vic3RyKDEpLCAxMCksXHJcblx0XHRcdGNoYXJhY3RlciA9IHBhcnNlSW50KGluZm9bMTBdLnN1YnN0cigxKSwgMTApO1xyXG5cclxuXHRcdC8vIFJldHVybiBhbiBvYmplY3QgdGhhdCB3aWxsIGJlIHVzZWQgdG8gbWFrZSBhIHN0cmluZyBsYXRlclxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0bWV0aG9kOiBtZXRob2QsXHJcblx0XHRcdGZpbGU6IGZpbGUsXHJcblx0XHRcdGxpbmU6IGxpbmVOdW1iZXIsXHJcblx0XHRcdGNoYXJhY3RlcjogY2hhcmFjdGVyXHJcblx0XHR9O1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBHZXQgdGhlIHN0YWNrIGluZm8gZm9yIFNwaWRlck1vbmtleVxyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBzdGFja1xyXG5cdCAqL1xyXG5cdF9nZXRJbmZvU3BpZGVyTW9ua2V5OiBmdW5jdGlvbiAoc3RhY2spIHtcclxuXHJcblx0XHQvLyBQYXJzZSB0aGUgNXRoIGxpbmUgb2YgdGhlIHN0YWNrIHRyYWNlIHRvIGdldCBsaW5lIGluZm9cclxuXHRcdHZhciBsaW5lID0gc3RhY2suc3BsaXQoJ1xcbicpWzRdLFxyXG5cdFx0XHRpbmZvID0gbGluZS5tYXRjaCgvKFteQF17MSx9fCkoPzpAKSguKikoXFw6WzAtOV17MSx9KS8pO1xyXG5cclxuXHRcdC8vIElmIHRoZXJlIGlzIG5vIGluZm8sIG91ciByZWdleCBmYWlsZWQgYmVjYXVzZSBvZiBiYWQgc3RhY2sgZGF0YVxyXG5cdFx0aWYgKCFpbmZvKSB7XHJcblx0XHRcdHJldHVybiB7fTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBHZXQgdGhlIGxpbmUgaW5mb1xyXG5cdFx0dmFyXHRtZXRob2QgPSBpbmZvWzFdIHx8ICdhbm9ueW1vdXMnLFxyXG5cdFx0XHRmaWxlID0gaW5mb1syXSxcclxuXHRcdFx0bGluZU51bWJlciA9IHBhcnNlSW50KGluZm9bM10uc3Vic3RyKDEpLCAxMCk7XHJcblxyXG5cdFx0Ly8gUmV0dXJuIGFuIG9iamVjdCB0aGF0IHdpbGwgYmUgdXNlZCB0byBtYWtlIGEgc3RyaW5nIGxhdGVyXHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRtZXRob2Q6IG1ldGhvZCxcclxuXHRcdFx0ZmlsZTogZmlsZSxcclxuXHRcdFx0bGluZTogbGluZU51bWJlcixcclxuXHRcdFx0Y2hhcmFjdGVyOiB1bmRlZmluZWRcclxuXHRcdH07XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldCB0aGUgc3RhY2sgaW5mbyBmb3IgQ2hha3JhXHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IHN0YWNrXHJcblx0ICovXHJcblx0X2dldEluZm9DaGFrcmE6IGZ1bmN0aW9uIChzdGFjaykge1xyXG5cclxuXHRcdC8vIFBhcnNlIHRoZSA2dGggbGluZSBvZiB0aGUgc3RhY2sgdHJhY2UgdG8gZ2V0IGxpbmUgaW5mb1xyXG5cdFx0dmFyIGxpbmUgPSBzdGFjay5zcGxpdCgnXFxuJylbNV0sXHJcblx0XHRcdGluZm8gPSBsaW5lLm1hdGNoKC8oPzphdFxccykoPzooW15cXChdezF9KSg/Olxcc1xcKCkoLiopfCgpKCkoLiopfCgpKCkoPGFub255bW91cz4pKShcXDpbMC05XXsxLH0pKFxcOlswLTldezEsfSkvKTtcclxuXHJcblx0XHQvLyBJZiB0aGVyZSBpcyBubyBpbmZvLCBvdXIgcmVnZXggZmFpbGVkIGJlY2F1c2Ugb2YgYmFkIHN0YWNrIGRhdGFcclxuXHRcdGlmICghaW5mbykge1xyXG5cdFx0XHRyZXR1cm4ge307XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gR2V0IHRoZSBsaW5lIGluZm9cclxuXHRcdHZhclx0bWV0aG9kID0gaW5mb1sxXSB8fCAnYW5vbnltb3VzJyxcclxuXHRcdFx0ZmlsZSA9IGluZm9bMl0gfHwgaW5mb1s1XSxcclxuXHRcdFx0bGluZU51bWJlciA9IHBhcnNlSW50KGluZm9bOV0uc3Vic3RyKDEpLCAxMCksXHJcblx0XHRcdGNoYXJhY3RlciA9IHBhcnNlSW50KGluZm9bMTBdLnN1YnN0cigxKSwgMTApO1xyXG5cclxuXHRcdC8vIFJldHVybiBhbiBvYmplY3QgdGhhdCB3aWxsIGJlIHVzZWQgdG8gbWFrZSBhIHN0cmluZyBsYXRlclxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0bWV0aG9kOiBtZXRob2QsXHJcblx0XHRcdGZpbGU6IGZpbGUsXHJcblx0XHRcdGxpbmU6IGxpbmVOdW1iZXIsXHJcblx0XHRcdGNoYXJhY3RlcjogY2hhcmFjdGVyXHJcblx0XHR9O1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBHZW5lcmF0ZSBhIHN0YWNrIHRyYWNlXHJcblx0ICogQHJldHVybiB7U3RyaW5nfSBUaGUgc3RhY2sgdHJhY2VcclxuXHQgKi9cclxuXHRfZ2VuZXJhdGVTdGFja1RyYWNlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0Ly8gQ3JlYXRlIGEgbmV3IGVycm9yXHJcblx0XHR2YXIgZXJyb3IgPSBuZXcgRXJyb3IoKTtcclxuXHJcblx0XHQvLyBJbiBzb21lIGVuZ2luZXMsIHRoZSBlcnJvciBkb2Vzbid0IGNvbnRhaW4gYSBzdGFjay4gR290dGEgdGhyb3cgYW4gZXJyb3IgaW5zdGVhZCFcclxuXHRcdGlmICghZXJyb3Iuc3RhY2spIHtcclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRpcy5ub3QuZnVuYygpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhdGNoIChlKSB7XHJcblx0XHRcdFx0ZXJyb3IgPSBlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGVycm9yLnN0YWNrO1xyXG5cdH1cclxufTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFN0YWNrUGFyc2VyOyIsIi8qKlxyXG4gKiBDb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zXHJcbiAqL1xyXG5mdW5jdGlvbiBDb25zb2xlVGFyZ2V0IChwYXJhbXMpIHtcclxuXHJcbn1cclxuXHJcblxyXG4vKipcclxuICogUHJvdG90eXBlIG1ldGhvZHNcclxuICovXHJcbkNvbnNvbGVUYXJnZXQucHJvdG90eXBlID0ge1xyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3RvclxyXG5cdCAqIEB0eXBlIHtGdW5jdGlvbn1cclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcjogQ29uc29sZVRhcmdldCxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFdyaXRlIHRvIHRoZSBjb25zb2xlXHJcblx0ICogQHBhcmFtIHtBcnJheX0gYXJnc1xyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcclxuXHQgKi9cclxuXHR3cml0ZTogZnVuY3Rpb24gKGFyZ3MsIG1ldGhvZCkge1xyXG5cclxuXHRcdC8vIE1ha2Ugc3VyZSB0aGVyZSBpcyBhIGNvbnNvbGVcclxuXHRcdGlmIChjb25zb2xlKSB7XHJcblxyXG5cdFx0XHQvLyBJZiB0aGVyZSBpcyBubyBtZXRob2QsIHJldmVydCB0byBsb2dcclxuXHRcdFx0aWYgKCFjb25zb2xlW21ldGhvZF0pIHtcclxuXHJcblx0XHRcdFx0aWYgKCFjb25zb2xlLmxvZykge1xyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdG1ldGhvZCA9ICdsb2cnO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gQXBwbHkgd2lsbCBtYWludGFpbiBjb250ZXh0LCBidXQgaXMgbm90IGFsd2F5cyBhdmFpbGFibGVcclxuXHRcdFx0aWYgKGNvbnNvbGVbbWV0aG9kXS5hcHBseSkge1xyXG5cdFx0XHRcdGNvbnNvbGVbbWV0aG9kXS5hcHBseShjb25zb2xlLCBhcmdzKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRjb25zb2xlW21ldGhvZF0oYXJncyk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBhcmdzO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbnNvbGVUYXJnZXQ7IiwiLyoqXHJcbiAqIENvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXNcclxuICovXHJcbmZ1bmN0aW9uIEVsZW1lbnRUYXJnZXQgKHBhcmFtcykge1xyXG5cclxuXHR0aGlzLl9lbGVtZW50ID0gdW5kZWZpbmVkO1xyXG5cdHRoaXMuX2VsZW1lbnRTZXR1cCA9IGZhbHNlO1xyXG59XHJcblxyXG5cclxuLyoqXHJcbiAqIE9uIGNsaWNrIG1ldGhvZCBwbGFjZWhvbGRlclxyXG4gKiBAdHlwZSB7RnVuY3Rpb259XHJcbiAqL1xyXG52YXIgb25DbGljaztcclxuXHJcblxyXG4vKipcclxuICogUHJvdG90eXBlIG1ldGhvZHNcclxuICovXHJcbkVsZW1lbnRUYXJnZXQucHJvdG90eXBlID0ge1xyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3RvclxyXG5cdCAqIEB0eXBlIHtGdW5jdGlvbn1cclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcjogRWxlbWVudFRhcmdldCxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBlbGVtZW50IHRvIGxvZyB0b1xyXG5cdCAqIEB0eXBlIHtNaXhlZH1cclxuXHQgKi9cclxuXHRfZWxlbWVudDogdW5kZWZpbmVkLFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogSGFzIHRoZSBlbGVtZW50IGJlZW4gc2V0dXA/XHJcblx0ICogQHR5cGUge0Jvb2xlYW59XHJcblx0ICovXHJcblx0X2VsZW1lbnRTZXR1cDogZmFsc2UsXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBCdWlsZCBhIGNvbnRlbnQgZWxlbWVudFxyXG5cdCAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRlbnRcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zXHJcblx0ICovXHJcblx0X2J1aWxkQ29udGVudDogZnVuY3Rpb24gKGNvbnRlbnQsIHBhcmFtcykge1xyXG5cclxuXHRcdHBhcmFtcyA9IHBhcmFtcyB8fCB7fTtcclxuXHJcblx0XHQvLyBOZXcgZWxlbWVudFxyXG5cdFx0dmFyIGVsLFxyXG5cdFx0XHRjbGFzc05hbWUgPSBwYXJhbXMuY2xhc3NOYW1lIHx8ICdjb250ZW50JyxcclxuXHRcdFx0dHlwZSA9IHR5cGVvZiBjb250ZW50O1xyXG5cclxuXHRcdC8vXHJcblx0XHRzd2l0Y2ggKHR5cGUpIHtcclxuXHRcdFx0Y2FzZSAnb2JqZWN0JzpcclxuXHRcdFx0XHRlbCA9IHRoaXMuX2J1aWxkT2JqZWN0Q29udGVudChjb250ZW50KTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuXHRcdFx0XHRlbC5pbm5lckhUTUwgPSBjb250ZW50O1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFNldCBwcm9wZXJ0aWVzXHJcblx0XHRlbC5jbGFzc05hbWUgPSBjbGFzc05hbWUgKyAnICcgKyB0eXBlO1xyXG5cclxuXHRcdHJldHVybiBlbDtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogQnVpbGQgYSBjb250ZW50IGVsZW1lbnQgZnJvbSBhbiBhcnJheVxyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcclxuXHQgKi9cclxuXHRfYnVpbGRBcnJheUNvbnRlbnQ6IGZ1bmN0aW9uIChvYmopIHtcclxuXHJcblx0XHR2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyksXHJcblx0XHRcdGhhcyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHksXHJcblx0XHRcdGtleTtcclxuXHJcblx0XHQvLyBMb29wXHJcblx0XHRmb3IgKGtleSBpbiBvYmopIHtcclxuXHJcblx0XHRcdC8vIE1ha2Ugc3VyZSB3ZSBkb24ndCBib3RoZXIgd2l0aCB0aGUgcHJvdG90eXBlXHJcblx0XHRcdGlmIChoYXMuY2FsbChvYmosIGtleSkpIHtcclxuXHRcdFx0XHRlbC5hcHBlbmRDaGlsZCh0aGlzLl9idWlsZE9iamVjdENvbnRlbnRSb3cob2JqW2tleV0sIGtleSkpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gU2V0IHByb3BlcnRpZXNcclxuXHRcdGVsLmNsYXNzTmFtZSA9ICdvYmplY3QnO1xyXG5cclxuXHRcdHJldHVybiBlbDtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogQnVpbGQgYSBjb250ZW50IGVsZW1lbnQgZnJvbSBhIGhhc2hcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gb2JqXHJcblx0ICovXHJcblx0X2J1aWxkT2JqZWN0Q29udGVudDogZnVuY3Rpb24gKG9iaikge1xyXG5cclxuXHRcdGlmIChvYmogaW5zdGFuY2VvZiBBcnJheSkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5fYnVpbGRBcnJheUNvbnRlbnQob2JqKTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyksXHJcblx0XHRcdGhhcyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHksXHJcblx0XHRcdGtleSxcclxuXHRcdFx0aSA9IDA7XHJcblxyXG5cdFx0Ly8gTG9vcFxyXG5cdFx0Zm9yIChrZXkgaW4gb2JqKSB7XHJcblxyXG5cdFx0XHQvLyBNYWtlIHN1cmUgd2UgZG9uJ3QgYm90aGVyIHdpdGggdGhlIHByb3RvdHlwZVxyXG5cdFx0XHRpZiAoaGFzLmNhbGwob2JqLCBrZXkpKSB7XHJcblx0XHRcdFx0ZWwuYXBwZW5kQ2hpbGQodGhpcy5fYnVpbGRPYmplY3RDb250ZW50Um93KG9ialtrZXldLCBrZXkpKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aSs9MTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBTZXQgcHJvcGVydGllc1xyXG5cdFx0ZWwuY2xhc3NOYW1lID0gJ29iamVjdCc7XHJcblx0XHRlbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtbGVuZ3RoJywgaSk7XHJcblxyXG5cdFx0cmV0dXJuIGVsO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBCdWlsZCBhIHJvdyBvZiBvYmplY3QgY29udGVudFxyXG5cdCAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlXHJcblx0ICogQHBhcmFtIHtNaXhlZH0ga2V5XHJcblx0ICovXHJcblx0X2J1aWxkT2JqZWN0Q29udGVudFJvdzogZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcclxuXHJcblx0XHR2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcblxyXG5cdFx0ZWwuYXBwZW5kQ2hpbGQodGhpcy5fYnVpbGRPYmplY3RDb250ZW50S2V5KGtleSkpO1xyXG5cdFx0ZWwuYXBwZW5kQ2hpbGQodGhpcy5fYnVpbGRPYmplY3RDb250ZW50VmFsdWUodmFsdWUpKTtcclxuXHJcblx0XHRlbC5jbGFzc05hbWUgPSAncm93JztcclxuXHJcblx0XHRyZXR1cm4gZWw7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIEJ1aWxkIGEgY29udGVudCBrZXkgZWxlbWVudFxyXG5cdCAqIEBwYXJhbSB7TWl4ZWR9IGtleVxyXG5cdCAqL1xyXG5cdF9idWlsZE9iamVjdENvbnRlbnRLZXk6IGZ1bmN0aW9uIChrZXkpIHtcclxuXHJcblx0XHR2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcblx0XHRlbC5pbm5lckhUTUwgPSBrZXk7XHJcblx0XHRlbC5jbGFzc05hbWUgPSAna2V5JztcclxuXHRcdHJldHVybiBlbDtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogQnVpbGQgYSBjb250ZW50IHZhbHVlIGVsZW1lbnRcclxuXHQgKiBAcGFyYW0ge01peGVkfSB2YWx1ZVxyXG5cdCAqL1xyXG5cdF9idWlsZE9iamVjdENvbnRlbnRWYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XHJcblxyXG5cdFx0dmFyIGVsLFxyXG5cdFx0XHR0eXBlID0gdHlwZW9mIHZhbHVlO1xyXG5cclxuXHRcdHN3aXRjaCAodHlwZSkge1xyXG5cdFx0XHRjYXNlICdvYmplY3QnOlxyXG5cdFx0XHRcdGVsID0gdGhpcy5fYnVpbGRPYmplY3RDb250ZW50KHZhbHVlKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuXHRcdFx0XHRlbC5pbm5lckhUTUwgPSB2YWx1ZTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHJcblx0XHRlbC5jbGFzc05hbWUgPSAndmFsdWUgJyArIHR5cGU7XHJcblxyXG5cdFx0cmV0dXJuIGVsO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBXcml0ZSBhIGxvZyB0byBhbiBlbGVtZW50XHJcblx0ICovXHJcblx0X2xvZzogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdC8vIE1ha2Ugc3VyZSB3ZSBoYXZlIGFuIGVsZW1lbnRcclxuXHRcdGlmICghdGhpcy5fY2hlY2tFbGVtZW50KCkpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIE5ldyBlbGVtZW50c1xyXG5cdFx0dmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXHJcblx0XHRcdGluZm8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcblxyXG5cdFx0Ly8gTGFzdCBwYXJhbSBpcyB0aGUgc3RhY2sgaW5mb1xyXG5cdFx0dmFyIHBhcmFtcyA9IGFyZ3VtZW50cyxcclxuXHRcdFx0c3RhY2tJbmZvID0gQXJyYXkucHJvdG90eXBlLnBvcC5jYWxsKHBhcmFtcyk7XHJcblxyXG5cdFx0Ly8gSW5mbyBzdHJpbmdcclxuXHRcdGluZm8uaW5uZXJIVE1MID0gc3RhY2tJbmZvO1xyXG5cdFx0aW5mby5jbGFzc05hbWUgPSAnaW5mbyc7XHJcblxyXG5cdFx0Ly8gQWRkIGNoaWxkcmVuIHRvIHRoZSBlbGVtZW50XHJcblx0XHRlbC5hcHBlbmRDaGlsZChpbmZvKTtcclxuXHJcblx0XHQvLyBDb250ZW50IHN0cmluZ1xyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwYXJhbXMubGVuZ3RoOyBpKz0xKSB7XHJcblx0XHRcdGVsLmFwcGVuZENoaWxkKHRoaXMuX2J1aWxkQ29udGVudChwYXJhbXNbaV0pKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBBZGQgdGhlIGVsZW1lbnRcclxuXHRcdGVsLmNsYXNzTmFtZSA9ICdsb2cnO1xyXG5cdFx0dGhpcy5fZWxlbWVudC5hcHBlbmRDaGlsZChlbCk7XHJcblxyXG5cdFx0cmV0dXJuIGVsO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBXcml0ZSBhbiBlcnJvciB0byBhbiBlbGVtZW50XHJcblx0ICogQHBhcmFtIHtBcnJheX0gYXJnc1xyXG5cdCAqL1xyXG5cdF9lcnJvcjogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdHZhciBlbCA9IHRoaXMuX2xvZy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG5cclxuXHRcdGVsLmNsYXNzTmFtZSA9ICdsb2cgZXJyb3InO1xyXG5cclxuXHRcdHJldHVybiBlbDtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogV3JpdGUgYSB3YXJuaW5nIHRvIGFuIGVsZW1lbnRcclxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcmdzXHJcblx0ICovXHJcblx0X3dhcm46IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHR2YXIgZWwgPSB0aGlzLl9sb2cuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHJcblx0XHRlbC5jbGFzc05hbWUgPSAnbG9nIHdhcm4nO1xyXG5cclxuXHRcdHJldHVybiBlbDtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogV3JpdGUgaW5mbyB0byBhbiBlbGVtZW50XHJcblx0ICogQHBhcmFtIHtBcnJheX0gYXJnc1xyXG5cdCAqL1xyXG5cdF9pbmZvOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0dmFyIGVsID0gdGhpcy5fbG9nLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcblxyXG5cdFx0ZWwuY2xhc3NOYW1lID0gJ2xvZyBpbmZvJztcclxuXHJcblx0XHRyZXR1cm4gZWw7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFdyaXRlIGEgZGVidWcgdG8gYW4gZWxlbWVudFxyXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFyZ3NcclxuXHQgKi9cclxuXHRfZGVidWc6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHR2YXIgZWwgPSB0aGlzLl9sb2cuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHJcblx0XHRlbC5jbGFzc05hbWUgPSAnbG9nIGRlYnVnJztcclxuXHJcblx0XHRyZXR1cm4gZWw7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFdyaXRlIGEgdGFibGUgdG8gYW4gZWxlbWVudFxyXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFyZ3NcclxuXHQgKi9cclxuXHRfdGFibGU6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHR2YXIgZWwgPSB0aGlzLl9sb2cuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHJcblx0XHRlbC5jbGFzc05hbWUgPSAnbG9nIHRhYmxlJztcclxuXHJcblx0XHRyZXR1cm4gZWw7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIENoZWNrIHRoYXQgdGhlcmUgaXMgYW4gZWxlbWVudCBhbmQgY3JlYXRlIGlmIHdlIGRvbid0IGhhdmUgb25lXHJcblx0ICovXHJcblx0X2NoZWNrRWxlbWVudDogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdC8vIE1ha2Ugc3VyZSB3ZSd2ZSBzZXQgdXAgdGhlIGVsZW1lbnRcclxuXHRcdGlmICghdGhpcy5fZWxlbWVudFNldHVwKSB7XHJcblx0XHRcdHRoaXMuX3NldHVwRWxlbWVudCgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFJldHVybiB0aGUgZWxlbWVudCBpZiB3ZSBoYXZlIGl0XHJcblx0XHRpZiAodGhpcy5fZWxlbWVudCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5fZWxlbWVudDtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBUcnkgdG8gY3JlYXRlXHJcblx0XHRyZXR1cm4gdGhpcy5fY3JlYXRlRWxlbWVudCgpO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGUgYW4gZWxlbWVudCB0byB3cml0ZSB0byBhbmQgdHJ5IHRvIGFkZCBpdCB0byB0aGUgYm9keVxyXG5cdCAqL1xyXG5cdF9jcmVhdGVFbGVtZW50OiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0Ly8gSWYgdGhlcmUgaXMgbm8gd2luZG93IG9iamVjdCwgd2UncmUgU09MXHJcblx0XHRpZiAoIWRvY3VtZW50KSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBDcmVhdGUgdGhlIGVsZW1lbnRcclxuXHRcdHRoaXMuX2VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHJcblx0XHQvLyBTZXQgZWxlbWVudCBwcm9wZXJ0aWVzXHJcblx0XHR0aGlzLl9lbGVtZW50LmNsYXNzTmFtZSA9ICdsb2dnaWVyIGdlbmVyYXRlZCc7XHJcblxyXG5cdFx0Ly8gQXBwZW5kIGl0IHRvIHRoZSBkb2N1bWVudFxyXG5cdFx0ZG9jdW1lbnQuYm9keS5pbnNlcnRCZWZvcmUodGhpcy5fZWxlbWVudCwgZG9jdW1lbnQuYm9keS5maXJzdENoaWxkKTtcclxuXHRcdGRvY3VtZW50LmJvZHkuY2xhc3NOYW1lICs9ICcgbG9nZ2llci1nZW5lcmF0ZWQnO1xyXG5cclxuXHRcdC8vIFNldHVwIHRoZSBlbGVtZW50XHJcblx0XHR0aGlzLl9zZXR1cEVsZW1lbnQoKTtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5fZWxlbWVudDtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogU2V0dXAgdGhlIGVsZW1lbnQgLSBhZGRpbmcgZXZlbnQgbGlzdGVuZXJzXHJcblx0ICovXHJcblx0X3NldHVwRWxlbWVudDogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdC8vIENhbid0IGRvIHRoaXMgd2l0aCBubyBlbGVtZW50XHJcblx0XHRpZiAoIXRoaXMuX2VsZW1lbnQgfHwgdGhpcy5fZWxlbWVudFNldHVwKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBMaXN0ZW4gZm9yIGNsaWNrcyBvbiB0aGUgd2hvbGUgbG9nZ2VyXHJcblx0XHRvbkNsaWNrID0gdGhpcy5fb25DbGljay5iaW5kKHRoaXMpO1xyXG5cdFx0aWYgKHRoaXMuX2VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcikge1xyXG5cdFx0XHR0aGlzLl9lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb25DbGljaywgZmFsc2UpO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdHRoaXMuX2VsZW1lbnQuYXR0YWNoRXZlbnQoJ29uY2xpY2snLCBvbkNsaWNrKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBXZSdyZSBzZXR1cFxyXG5cdFx0dGhpcy5fZWxlbWVudFNldHVwID0gdHJ1ZTtcclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogQ2xlYW51cCB0aGUgZWxlbWVudCAtIHJlbW92aW5nIGV2ZW50IGxpc3RlbmVyc1xyXG5cdCAqL1xyXG5cdF9jbGVhbnVwRWxlbWVudDogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdC8vIENhbid0IGRvIHRoaXMgd2l0aCBubyBlbGVtZW50XHJcblx0XHRpZiAoIXRoaXMuX2VsZW1lbnQgfHwgIXRoaXMuX2VsZW1lbnRTZXR1cCkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gU3RvcCBsaXN0ZW5pbmcgZm9yIGNsaWNrc1xyXG5cdFx0aWYgKHRoaXMuX2VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcikge1xyXG5cdFx0XHR0aGlzLl9lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb25DbGljaywgZmFsc2UpO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdHRoaXMuX2VsZW1lbnQuZGV0YWNoRXZlbnQoJ29uY2xpY2snLCBvbkNsaWNrKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBXZSdyZSBub3Qgc2V0dXBcclxuXHRcdHRoaXMuX2VsZW1lbnRTZXR1cCA9IGZhbHNlO1xyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBJcyB0aGlzIGFuIG9iamVjdCBlbGVtZW50IG9yIGRvZXMgaXQgaGF2ZSBhIHBhcmVudCB0aGF0IGlzIG9uZT9cclxuXHQgKiBAcGFyYW0ge09iamVjdH0gZWxcclxuXHQgKiBAcmV0dXJuIHtNaXhlZH0gW2Rlc2NyaXB0aW9uXVxyXG5cdCAqL1xyXG5cdF9pc09ySGFzT2JqZWN0UGFyZW50OiBmdW5jdGlvbiAoZWwpIHtcclxuXHJcblx0XHRpZiAoIWVsIHx8ICFlbC5jbGFzc05hbWUpIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChlbC5jbGFzc05hbWUuaW5kZXhPZignb2JqZWN0JykgIT09IC0xKSB7XHJcblx0XHRcdHJldHVybiBlbDtcclxuXHRcdH1cclxuXHRcdGVsc2UgaWYgKGVsLnBhcmVudE5vZGUpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX2lzT3JIYXNPYmplY3RQYXJlbnQoZWwucGFyZW50Tm9kZSk7XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBUb2dnbGUgYW4gb2JqZWN0IGJlaW5nIG9wZW4gb3IgY2xvc2VkXHJcblx0ICogQHBhcmFtIHtPYmplY3R9IGVsXHJcblx0ICovXHJcblx0X3RvZ2dsZU9iamVjdDogZnVuY3Rpb24gKGVsKSB7XHJcblxyXG5cdFx0Ly8gTm90IGV4cGFuZGVkXHJcblx0XHRpZiAoZWwuY2xhc3NOYW1lLmluZGV4T2YoJ2V4cGFuZCcpID09PSAtMSkge1xyXG5cdFx0XHRlbC5jbGFzc05hbWUgPSBlbC5jbGFzc05hbWUgKyAnIGV4cGFuZCc7XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0ZWwuY2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lLnJlcGxhY2UoJ2V4cGFuZCcsICcnKS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCcnKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogV2hlbiB0aGUgZWxlbWVudCBpcyBjbGlja2VkXHJcblx0ICogQHBhcmFtIHtPYmplY3R9IGVcclxuXHQgKi9cclxuXHRfb25DbGljazogZnVuY3Rpb24gKGUpIHtcclxuXHJcblx0XHR2YXIgZWwgPSB0aGlzLl9pc09ySGFzT2JqZWN0UGFyZW50KGUudGFyZ2V0KTtcclxuXHJcblx0XHRpZiAoZWwpIHtcclxuXHRcdFx0dGhpcy5fdG9nZ2xlT2JqZWN0KGVsKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogV3JpdGUgdG8gdGhlIGVsZW1lbnRcclxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcmdzXHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxyXG5cdCAqL1xyXG5cdHdyaXRlOiBmdW5jdGlvbiAoYXJncywgbWV0aG9kKSB7XHJcblxyXG5cdFx0Ly8gTWFrZSBzdXJlIHdlIGhhdmUgYW4gZWxlbWVudFxyXG5cdFx0aWYgKCF0aGlzLl9jaGVja0VsZW1lbnQoKSkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gVGhlIG1ldGhvZCBuYW1lXHJcblx0XHR2YXIgbWV0aG9kTmFtZSA9ICdfJyArIG1ldGhvZCxcclxuXHRcdFx0ZGVmYXVsdE1ldGhvZE5hbWUgPSAnX2xvZyc7XHJcblxyXG5cdFx0Ly8gSWYgdGhlcmUgaXMgbm8gbWV0aG9kLCByZXZlcnQgdG8gZGVmYXVsdFxyXG5cdFx0aWYgKCF0aGlzW21ldGhvZE5hbWVdKSB7XHJcblx0XHRcdG1ldGhvZE5hbWUgPSBkZWZhdWx0TWV0aG9kTmFtZTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBDYWxsIHRoZSBtZXRob2RcclxuXHRcdHRoaXNbbWV0aG9kTmFtZV0uYXBwbHkodGhpcywgYXJncyk7XHJcblxyXG5cdFx0cmV0dXJuIGFyZ3M7XHJcblx0fSxcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFNldCB0aGUgZWxlbWVudCB3ZSdsbCB3cml0ZSB0b1xyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBlbFxyXG5cdCAqL1xyXG5cdGVsZW1lbnQ6IGZ1bmN0aW9uIChlbCkge1xyXG5cclxuXHRcdGNvbnNvbGUubG9nKCdoZXJlJyk7XHJcblx0XHRpZiAoZWwgIT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRpZiAodGhpcy5fZWxlbWVudCkge1xyXG5cdFx0XHRcdHRoaXMuX2NsZWFudXBFbGVtZW50KCk7XHJcblx0XHRcdH1cclxuXHRcdFx0dGhpcy5fZWxlbWVudCA9IGVsO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzLl9lbGVtZW50O1xyXG5cdH1cclxufTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEVsZW1lbnRUYXJnZXQ7Il19
(1)
});
