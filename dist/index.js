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
Loggier.prototype._targetId = 'console';


/**
 * Possible logging targets
 * @type {Object}
 */
Loggier.prototype._targets = {
	'console': new ConsoleTarget(),
	'element': new ElementTarget()
};


/**
 * Stack parser helper
 * @type {Object}
 */
Loggier.prototype._stackParser = new StackParser();


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
		var info = this._stackParser.getInfo();

		// Append the info
		args = args.concat(this._buildStackInfoString(info));
	}

	// Write method based on target
	return this.getTarget().write(args, method);
};


/**
 * Build a string of stack info
 * @param {Object} params
 * @return {String}
 */
Loggier.prototype._buildStackInfoString = function (params) {

	return '(' + params.method + '@' + params.file + ':' + params.line + (params.character !== undefined ? ':' + params.character : '') + ')';
};


/**
 * Get the current target
 * @return {Object}
 */
Loggier.prototype.getTarget = function () {

	if (this._targets.hasOwnProperty(this._targetId)) {
		return this._targets[this._targetId];
	}
};


/**
 * Set the current target
 * @param {String} name
 */
Loggier.prototype.setTarget = function (name) {

	if (this._targets.hasOwnProperty(name)) {
		this._targetId = name;
	}
};


/**
 * Set the element
 * @param {Object} el
 */
Loggier.prototype.setElement = function (el) {

	if (this._targetId === 'element') {
		this.getTarget().setElement(el);
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


module.exports = Loggier;
},{"./helpers/stack-parser":2,"./targets/console":3,"./targets/element":4}],2:[function(_dereq_,module,exports){
/**
 * Constructor
 * @param {Object} params
 */
function StackParser (params) {

}
StackParser.prototype.constructor = StackParser;


/**
 * Extract the line number from a stack trace
 */
StackParser.prototype.getInfo = function () {

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
};


/**
 * Get the stack info for V8
 * @param {String} stack
 */
StackParser.prototype._getInfoV8 = function (stack) {

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
StackParser.prototype._getInfoSpiderMonkey = function (stack) {

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
StackParser.prototype._getInfoChakra = function (stack) {

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
StackParser.prototype._generateStackTrace = function () {

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


module.exports = StackParser;
},{}],3:[function(_dereq_,module,exports){
/**
 * Constructor
 * @param {Object} params
 */
function ConsoleTarget (params) {

}
ConsoleTarget.prototype.constructor = ConsoleTarget;


/**
 * Write to the console
 * @param {Array} args
 * @param {String} method
 */
ConsoleTarget.prototype.write = function (args, method) {

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


module.exports = ConsoleTarget;
},{}],4:[function(_dereq_,module,exports){
/**
 * Constructor
 * @param {Object} params
 */
function ElementTarget (params) {

}
ElementTarget.prototype.constructor = ElementTarget;


/**
 * The element to log to
 * @type {Mixed}
 */
ElementTarget.prototype._element = undefined;


/**
 * Build a string to log out
 * @param {Object} params
 * @return {String}
 */
ElementTarget.prototype._buildLogString = function (params) {

	var str = '',
		len = params.length,
		i = 0;

	for (i; i < len; i+=1) {
		str += params[i] + ' ';
	}

	return str.slice(0, -1);
};


/**
 * Write a log to an element
 */
ElementTarget.prototype._log = function () {

	// If we don't have an element yet, create one
	if (!this._element) {
		this._createElement();
	}

	// New element
	var el = document.createElement('div');

	// Set properties
	el.className = 'log';
	el.innerHTML = this._buildLogString(arguments);

	// Add the log
	this._element.appendChild(el);
};


/**
 * Write an error to an element
 * @param {Array} args
 */
// ElementTarget.prototype._error = function (args) {

// };


/**
 * Write a warning to an element
 * @param {Array} args
 */
// ElementTarget.prototype._warn = function (args) {

// };


/**
 * Write info to an element
 * @param {Array} args
 */
// ElementTarget.prototype._info = function (args) {

// };


/**
 * Write a debug to an element
 * @param {Array} args
 */
// ElementTarget.prototype._debug = function (args) {

// };


/**
 * Write a table to an element
 * @param {Array} args
 */
// ElementTarget.prototype._table = function (args) {

// };


/**
 * Create an element to write to and try to add it to the body
 */
ElementTarget.prototype._createElement = function () {

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
};


/**
 * Write to the element
 * @param {Array} args
 * @param {String} method
 */
ElementTarget.prototype.write = function (args, method) {

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
 * Set the element we'll write to
 * @param {Object} el
 */
ElementTarget.prototype.setElement = function (el) {

	this._element = el;
};


module.exports = ElementTarget;
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJXOlxcUGVyc29uYWxcXGxvZ2dpZXJcXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiVzovUGVyc29uYWwvbG9nZ2llci9zcmMvZmFrZV9mN2FjYjhkMS5qcyIsIlc6L1BlcnNvbmFsL2xvZ2dpZXIvc3JjL2hlbHBlcnMvc3RhY2stcGFyc2VyLmpzIiwiVzovUGVyc29uYWwvbG9nZ2llci9zcmMvdGFyZ2V0cy9jb25zb2xlLmpzIiwiVzovUGVyc29uYWwvbG9nZ2llci9zcmMvdGFyZ2V0cy9lbGVtZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBDb25zb2xlVGFyZ2V0ID0gcmVxdWlyZSgnLi90YXJnZXRzL2NvbnNvbGUnKSxcclxuXHRFbGVtZW50VGFyZ2V0ID0gcmVxdWlyZSgnLi90YXJnZXRzL2VsZW1lbnQnKSxcclxuXHRTdGFja1BhcnNlciA9IHJlcXVpcmUoJy4vaGVscGVycy9zdGFjay1wYXJzZXInKTtcclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zXHJcbiAqL1xyXG5mdW5jdGlvbiBMb2dnaWVyIChwYXJhbXMpIHtcclxuXHJcblx0cGFyYW1zID0gcGFyYW1zIHx8IHt9O1xyXG5cclxuXHQvLyBUYXJnZXRcclxuXHRpZiAocGFyYW1zLnRhcmdldCkge1xyXG5cdFx0dGhpcy5zZXRUYXJnZXQocGFyYW1zLnRhcmdldCk7XHJcblx0fVxyXG5cclxuXHQvLyBMb2dnaW5nIGVsZW1lbnRcclxuXHRpZiAocGFyYW1zLmVsZW1lbnQpIHtcclxuXHRcdHRoaXMuc2V0RWxlbWVudChwYXJhbXMuZWxlbWVudCk7XHJcblx0fVxyXG59XHJcbkxvZ2dpZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTG9nZ2llcjtcclxuXHJcblxyXG4vKipcclxuICogSXMgbG9nZ2luZyBlbmFibGVkP1xyXG4gKiBAdHlwZSB7Qm9vbGVhbn1cclxuICovXHJcbkxvZ2dpZXIucHJvdG90eXBlLl9lbmFibGVkID0gdHJ1ZTtcclxuXHJcblxyXG4vKipcclxuICogVGhlIGxvZ2dpbmcgdGFyZ2V0XHJcbiAqIEB0eXBlIHtTdHJpbmd9XHJcbiAqL1xyXG5Mb2dnaWVyLnByb3RvdHlwZS5fdGFyZ2V0SWQgPSAnY29uc29sZSc7XHJcblxyXG5cclxuLyoqXHJcbiAqIFBvc3NpYmxlIGxvZ2dpbmcgdGFyZ2V0c1xyXG4gKiBAdHlwZSB7T2JqZWN0fVxyXG4gKi9cclxuTG9nZ2llci5wcm90b3R5cGUuX3RhcmdldHMgPSB7XHJcblx0J2NvbnNvbGUnOiBuZXcgQ29uc29sZVRhcmdldCgpLFxyXG5cdCdlbGVtZW50JzogbmV3IEVsZW1lbnRUYXJnZXQoKVxyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBTdGFjayBwYXJzZXIgaGVscGVyXHJcbiAqIEB0eXBlIHtPYmplY3R9XHJcbiAqL1xyXG5Mb2dnaWVyLnByb3RvdHlwZS5fc3RhY2tQYXJzZXIgPSBuZXcgU3RhY2tQYXJzZXIoKTtcclxuXHJcblxyXG4vKipcclxuICogRG9lcyB0aGUgYWN0dWFsIHdyaXRpbmdcclxuICogQHBhcmFtIHtBcnJheX0gYXJnc1xyXG4gKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXHJcbiAqL1xyXG5Mb2dnaWVyLnByb3RvdHlwZS5fd3JpdGUgPSBmdW5jdGlvbiAoYXJncywgbWV0aG9kKSB7XHJcblxyXG5cdC8vIERvbid0IGxvZyBpZiB3ZSdyZSBub3QgZW5hYmxlZFxyXG5cdGlmICghdGhpcy5fZW5hYmxlZCkge1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHJcblx0Ly8gVGFibGUgbG9nZ2luZyBkb2Vzbid0IGxpa2UgZXh0cmEgZGF0YVxyXG5cdGlmIChtZXRob2QgIT09ICd0YWJsZScpIHtcclxuXHJcblx0XHQvLyBGaWxlIGluZm8gdG8gYXBwZW5kXHJcblx0XHR2YXIgaW5mbyA9IHRoaXMuX3N0YWNrUGFyc2VyLmdldEluZm8oKTtcclxuXHJcblx0XHQvLyBBcHBlbmQgdGhlIGluZm9cclxuXHRcdGFyZ3MgPSBhcmdzLmNvbmNhdCh0aGlzLl9idWlsZFN0YWNrSW5mb1N0cmluZyhpbmZvKSk7XHJcblx0fVxyXG5cclxuXHQvLyBXcml0ZSBtZXRob2QgYmFzZWQgb24gdGFyZ2V0XHJcblx0cmV0dXJuIHRoaXMuZ2V0VGFyZ2V0KCkud3JpdGUoYXJncywgbWV0aG9kKTtcclxufTtcclxuXHJcblxyXG4vKipcclxuICogQnVpbGQgYSBzdHJpbmcgb2Ygc3RhY2sgaW5mb1xyXG4gKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zXHJcbiAqIEByZXR1cm4ge1N0cmluZ31cclxuICovXHJcbkxvZ2dpZXIucHJvdG90eXBlLl9idWlsZFN0YWNrSW5mb1N0cmluZyA9IGZ1bmN0aW9uIChwYXJhbXMpIHtcclxuXHJcblx0cmV0dXJuICcoJyArIHBhcmFtcy5tZXRob2QgKyAnQCcgKyBwYXJhbXMuZmlsZSArICc6JyArIHBhcmFtcy5saW5lICsgKHBhcmFtcy5jaGFyYWN0ZXIgIT09IHVuZGVmaW5lZCA/ICc6JyArIHBhcmFtcy5jaGFyYWN0ZXIgOiAnJykgKyAnKSc7XHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIEdldCB0aGUgY3VycmVudCB0YXJnZXRcclxuICogQHJldHVybiB7T2JqZWN0fVxyXG4gKi9cclxuTG9nZ2llci5wcm90b3R5cGUuZ2V0VGFyZ2V0ID0gZnVuY3Rpb24gKCkge1xyXG5cclxuXHRpZiAodGhpcy5fdGFyZ2V0cy5oYXNPd25Qcm9wZXJ0eSh0aGlzLl90YXJnZXRJZCkpIHtcclxuXHRcdHJldHVybiB0aGlzLl90YXJnZXRzW3RoaXMuX3RhcmdldElkXTtcclxuXHR9XHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIFNldCB0aGUgY3VycmVudCB0YXJnZXRcclxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcclxuICovXHJcbkxvZ2dpZXIucHJvdG90eXBlLnNldFRhcmdldCA9IGZ1bmN0aW9uIChuYW1lKSB7XHJcblxyXG5cdGlmICh0aGlzLl90YXJnZXRzLmhhc093blByb3BlcnR5KG5hbWUpKSB7XHJcblx0XHR0aGlzLl90YXJnZXRJZCA9IG5hbWU7XHJcblx0fVxyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBTZXQgdGhlIGVsZW1lbnRcclxuICogQHBhcmFtIHtPYmplY3R9IGVsXHJcbiAqL1xyXG5Mb2dnaWVyLnByb3RvdHlwZS5zZXRFbGVtZW50ID0gZnVuY3Rpb24gKGVsKSB7XHJcblxyXG5cdGlmICh0aGlzLl90YXJnZXRJZCA9PT0gJ2VsZW1lbnQnKSB7XHJcblx0XHR0aGlzLmdldFRhcmdldCgpLnNldEVsZW1lbnQoZWwpO1xyXG5cdH1cclxufTtcclxuXHJcblxyXG4vKipcclxuICogRW5hYmxlIGxvZ2dpbmdcclxuICovXHJcbkxvZ2dpZXIucHJvdG90eXBlLmVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0dGhpcy5fZW5hYmxlZCA9IHRydWU7XHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIERpc2FibGUgbG9nZ2luZ1xyXG4gKi9cclxuTG9nZ2llci5wcm90b3R5cGUuZGlzYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0dGhpcy5fZW5hYmxlZCA9IGZhbHNlO1xyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBMb2cgdGFidWxhciBkYXRhXHJcbiAqL1xyXG5Mb2dnaWVyLnByb3RvdHlwZS5sb2cgPSBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdHJldHVybiB0aGlzLl93cml0ZShBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApLCAnbG9nJyk7XHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIExvZyB0YWJ1bGFyIGRhdGFcclxuICovXHJcbkxvZ2dpZXIucHJvdG90eXBlLmVycm9yID0gZnVuY3Rpb24gKCkge1xyXG5cclxuXHRyZXR1cm4gdGhpcy5fd3JpdGUoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSwgJ2Vycm9yJyk7XHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIExvZyB0YWJ1bGFyIGRhdGFcclxuICovXHJcbkxvZ2dpZXIucHJvdG90eXBlLndhcm4gPSBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdHJldHVybiB0aGlzLl93cml0ZShBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApLCAnd2FybicpO1xyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBMb2cgdGFidWxhciBkYXRhXHJcbiAqL1xyXG5Mb2dnaWVyLnByb3RvdHlwZS5pbmZvID0gZnVuY3Rpb24gKCkge1xyXG5cclxuXHRyZXR1cm4gdGhpcy5fd3JpdGUoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSwgJ2luZm8nKTtcclxufTtcclxuXHJcblxyXG4vKipcclxuICogTG9nIHRhYnVsYXIgZGF0YVxyXG4gKi9cclxuTG9nZ2llci5wcm90b3R5cGUuZGVidWcgPSBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdHJldHVybiB0aGlzLl93cml0ZShBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApLCAnZGVidWcnKTtcclxufTtcclxuXHJcblxyXG4vKipcclxuICogTG9nIHRhYnVsYXIgZGF0YVxyXG4gKi9cclxuTG9nZ2llci5wcm90b3R5cGUudGFibGUgPSBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdHJldHVybiB0aGlzLl93cml0ZShBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApLCAndGFibGUnKTtcclxufTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExvZ2dpZXI7IiwiLyoqXHJcbiAqIENvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXNcclxuICovXHJcbmZ1bmN0aW9uIFN0YWNrUGFyc2VyIChwYXJhbXMpIHtcclxuXHJcbn1cclxuU3RhY2tQYXJzZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3RhY2tQYXJzZXI7XHJcblxyXG5cclxuLyoqXHJcbiAqIEV4dHJhY3QgdGhlIGxpbmUgbnVtYmVyIGZyb20gYSBzdGFjayB0cmFjZVxyXG4gKi9cclxuU3RhY2tQYXJzZXIucHJvdG90eXBlLmdldEluZm8gPSBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdC8vIE5ldyBlcnJvciBmb3IgdGhlIHN0YWNrIGluZm9cclxuXHR2YXIgc3RhY2sgPSB0aGlzLl9nZW5lcmF0ZVN0YWNrVHJhY2UoKSxcclxuXHRcdGxpbmUsXHJcblx0XHRpbmZvLFxyXG5cdFx0ZmlsZSxcclxuXHRcdG1ldGhvZCxcclxuXHRcdGxpbmVOdW1iZXIsXHJcblx0XHRjaGFyYWN0ZXI7XHJcblxyXG5cdC8vIFBhcnNlIGRpZmZlcmVudCB0eXBlcyBvZiB0cmFjZXNcclxuXHRpZiAoc3RhY2suaW5kZXhPZignRXJyb3InKSA9PT0gMCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2dldEluZm9WOChzdGFjayk7XHJcblx0fVxyXG5cdGVsc2UgaWYgKHN0YWNrLmluZGV4T2YoJ1JlZmVyZW5jZUVycm9yJykgPT09IDApIHtcclxuXHRcdHJldHVybiB0aGlzLl9nZXRJbmZvQ2hha3JhKHN0YWNrKTtcclxuXHR9XHJcblx0Ly8gVE9ETzogTml0cm8gc3VwcG9ydFxyXG5cdC8vIGVsc2UgaWYgKHN0YWNrLmluZGV4T2YoJ1JlZmVyZW5jZUVycm9yJykgPT09IDApIHtcclxuXHQvLyBcdHJldHVybiB0aGlzLl9nZXRJbmZvQ2hha3JhKHN0YWNrKTtcclxuXHQvLyB9XHJcblx0ZWxzZSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fZ2V0SW5mb1NwaWRlck1vbmtleShzdGFjayk7XHJcblx0fVxyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBHZXQgdGhlIHN0YWNrIGluZm8gZm9yIFY4XHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdGFja1xyXG4gKi9cclxuU3RhY2tQYXJzZXIucHJvdG90eXBlLl9nZXRJbmZvVjggPSBmdW5jdGlvbiAoc3RhY2spIHtcclxuXHJcblx0Ly8gUGFyc2UgdGhlIDZ0aCBsaW5lIG9mIHRoZSBzdGFjayB0cmFjZSB0byBnZXQgbGluZSBpbmZvXHJcblx0dmFyIGxpbmUgPSBzdGFjay5zcGxpdCgnXFxuJylbNV0sXHJcblx0XHRpbmZvID0gbGluZS5tYXRjaCgvKD86YXRcXHMpKD86KFteXFwoXXsxfSkoPzpcXHNcXCgpKC4qKXwoKSgpKC4qKXwoKSgpKDxhbm9ueW1vdXM+KSkoXFw6WzAtOV17MSx9KShcXDpbMC05XXsxLH0pLyk7XHJcblxyXG5cdC8vIElmIHRoZXJlIGlzIG5vIGluZm8sIG91ciByZWdleCBmYWlsZWQgYmVjYXVzZSBvZiBiYWQgc3RhY2sgZGF0YVxyXG5cdGlmICghaW5mbykge1xyXG5cdFx0cmV0dXJuIHt9O1xyXG5cdH1cclxuXHJcblx0Ly8gR2V0IHRoZSBsaW5lIGluZm9cclxuXHR2YXJcdG1ldGhvZCA9IGluZm9bMV0gfHwgJ2Fub255bW91cycsXHJcblx0XHRmaWxlID0gaW5mb1syXSB8fCBpbmZvWzVdLFxyXG5cdFx0bGluZU51bWJlciA9IHBhcnNlSW50KGluZm9bOV0uc3Vic3RyKDEpLCAxMCksXHJcblx0XHRjaGFyYWN0ZXIgPSBwYXJzZUludChpbmZvWzEwXS5zdWJzdHIoMSksIDEwKTtcclxuXHJcblx0Ly8gUmV0dXJuIGFuIG9iamVjdCB0aGF0IHdpbGwgYmUgdXNlZCB0byBtYWtlIGEgc3RyaW5nIGxhdGVyXHJcblx0cmV0dXJuIHtcclxuXHRcdG1ldGhvZDogbWV0aG9kLFxyXG5cdFx0ZmlsZTogZmlsZSxcclxuXHRcdGxpbmU6IGxpbmVOdW1iZXIsXHJcblx0XHRjaGFyYWN0ZXI6IGNoYXJhY3RlclxyXG5cdH07XHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIEdldCB0aGUgc3RhY2sgaW5mbyBmb3IgU3BpZGVyTW9ua2V5XHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdGFja1xyXG4gKi9cclxuU3RhY2tQYXJzZXIucHJvdG90eXBlLl9nZXRJbmZvU3BpZGVyTW9ua2V5ID0gZnVuY3Rpb24gKHN0YWNrKSB7XHJcblxyXG5cdC8vIFBhcnNlIHRoZSA1dGggbGluZSBvZiB0aGUgc3RhY2sgdHJhY2UgdG8gZ2V0IGxpbmUgaW5mb1xyXG5cdHZhciBsaW5lID0gc3RhY2suc3BsaXQoJ1xcbicpWzRdLFxyXG5cdFx0aW5mbyA9IGxpbmUubWF0Y2goLyhbXkBdezEsfXwpKD86QCkoLiopKFxcOlswLTldezEsfSkvKTtcclxuXHJcblx0Ly8gSWYgdGhlcmUgaXMgbm8gaW5mbywgb3VyIHJlZ2V4IGZhaWxlZCBiZWNhdXNlIG9mIGJhZCBzdGFjayBkYXRhXHJcblx0aWYgKCFpbmZvKSB7XHJcblx0XHRyZXR1cm4ge307XHJcblx0fVxyXG5cclxuXHQvLyBHZXQgdGhlIGxpbmUgaW5mb1xyXG5cdHZhclx0bWV0aG9kID0gaW5mb1sxXSB8fCAnYW5vbnltb3VzJyxcclxuXHRcdGZpbGUgPSBpbmZvWzJdLFxyXG5cdFx0bGluZU51bWJlciA9IHBhcnNlSW50KGluZm9bM10uc3Vic3RyKDEpLCAxMCk7XHJcblxyXG5cdC8vIFJldHVybiBhbiBvYmplY3QgdGhhdCB3aWxsIGJlIHVzZWQgdG8gbWFrZSBhIHN0cmluZyBsYXRlclxyXG5cdHJldHVybiB7XHJcblx0XHRtZXRob2Q6IG1ldGhvZCxcclxuXHRcdGZpbGU6IGZpbGUsXHJcblx0XHRsaW5lOiBsaW5lTnVtYmVyLFxyXG5cdFx0Y2hhcmFjdGVyOiB1bmRlZmluZWRcclxuXHR9O1xyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBHZXQgdGhlIHN0YWNrIGluZm8gZm9yIENoYWtyYVxyXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RhY2tcclxuICovXHJcblN0YWNrUGFyc2VyLnByb3RvdHlwZS5fZ2V0SW5mb0NoYWtyYSA9IGZ1bmN0aW9uIChzdGFjaykge1xyXG5cclxuXHQvLyBQYXJzZSB0aGUgNnRoIGxpbmUgb2YgdGhlIHN0YWNrIHRyYWNlIHRvIGdldCBsaW5lIGluZm9cclxuXHR2YXIgbGluZSA9IHN0YWNrLnNwbGl0KCdcXG4nKVs1XSxcclxuXHRcdGluZm8gPSBsaW5lLm1hdGNoKC8oPzphdFxccykoPzooW15cXChdezF9KSg/Olxcc1xcKCkoLiopfCgpKCkoLiopfCgpKCkoPGFub255bW91cz4pKShcXDpbMC05XXsxLH0pKFxcOlswLTldezEsfSkvKTtcclxuXHJcblx0Ly8gSWYgdGhlcmUgaXMgbm8gaW5mbywgb3VyIHJlZ2V4IGZhaWxlZCBiZWNhdXNlIG9mIGJhZCBzdGFjayBkYXRhXHJcblx0aWYgKCFpbmZvKSB7XHJcblx0XHRyZXR1cm4ge307XHJcblx0fVxyXG5cclxuXHQvLyBHZXQgdGhlIGxpbmUgaW5mb1xyXG5cdHZhclx0bWV0aG9kID0gaW5mb1sxXSB8fCAnYW5vbnltb3VzJyxcclxuXHRcdGZpbGUgPSBpbmZvWzJdIHx8IGluZm9bNV0sXHJcblx0XHRsaW5lTnVtYmVyID0gcGFyc2VJbnQoaW5mb1s5XS5zdWJzdHIoMSksIDEwKSxcclxuXHRcdGNoYXJhY3RlciA9IHBhcnNlSW50KGluZm9bMTBdLnN1YnN0cigxKSwgMTApO1xyXG5cclxuXHQvLyBSZXR1cm4gYW4gb2JqZWN0IHRoYXQgd2lsbCBiZSB1c2VkIHRvIG1ha2UgYSBzdHJpbmcgbGF0ZXJcclxuXHRyZXR1cm4ge1xyXG5cdFx0bWV0aG9kOiBtZXRob2QsXHJcblx0XHRmaWxlOiBmaWxlLFxyXG5cdFx0bGluZTogbGluZU51bWJlcixcclxuXHRcdGNoYXJhY3RlcjogY2hhcmFjdGVyXHJcblx0fTtcclxufTtcclxuXHJcblxyXG4vKipcclxuICogR2VuZXJhdGUgYSBzdGFjayB0cmFjZVxyXG4gKiBAcmV0dXJuIHtTdHJpbmd9IFRoZSBzdGFjayB0cmFjZVxyXG4gKi9cclxuU3RhY2tQYXJzZXIucHJvdG90eXBlLl9nZW5lcmF0ZVN0YWNrVHJhY2UgPSBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdC8vIENyZWF0ZSBhIG5ldyBlcnJvclxyXG5cdHZhciBlcnJvciA9IG5ldyBFcnJvcigpO1xyXG5cclxuXHQvLyBJbiBzb21lIGVuZ2luZXMsIHRoZSBlcnJvciBkb2Vzbid0IGNvbnRhaW4gYSBzdGFjay4gR290dGEgdGhyb3cgYW4gZXJyb3IgaW5zdGVhZCFcclxuXHRpZiAoIWVycm9yLnN0YWNrKSB7XHJcblx0XHR0cnkge1xyXG5cdFx0XHRpcy5ub3QuZnVuYygpO1xyXG5cdFx0fVxyXG5cdFx0Y2F0Y2ggKGUpIHtcclxuXHRcdFx0ZXJyb3IgPSBlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cmV0dXJuIGVycm9yLnN0YWNrO1xyXG59O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU3RhY2tQYXJzZXI7IiwiLyoqXHJcbiAqIENvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXNcclxuICovXHJcbmZ1bmN0aW9uIENvbnNvbGVUYXJnZXQgKHBhcmFtcykge1xyXG5cclxufVxyXG5Db25zb2xlVGFyZ2V0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENvbnNvbGVUYXJnZXQ7XHJcblxyXG5cclxuLyoqXHJcbiAqIFdyaXRlIHRvIHRoZSBjb25zb2xlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGFyZ3NcclxuICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxyXG4gKi9cclxuQ29uc29sZVRhcmdldC5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiAoYXJncywgbWV0aG9kKSB7XHJcblxyXG5cdC8vIE1ha2Ugc3VyZSB0aGVyZSBpcyBhIGNvbnNvbGVcclxuXHRpZiAoY29uc29sZSkge1xyXG5cclxuXHRcdC8vIElmIHRoZXJlIGlzIG5vIG1ldGhvZCwgcmV2ZXJ0IHRvIGxvZ1xyXG5cdFx0aWYgKCFjb25zb2xlW21ldGhvZF0pIHtcclxuXHJcblx0XHRcdGlmICghY29uc29sZS5sb2cpIHtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0bWV0aG9kID0gJ2xvZyc7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvLyBBcHBseSB3aWxsIG1haW50YWluIGNvbnRleHQsIGJ1dCBpcyBub3QgYWx3YXlzIGF2YWlsYWJsZVxyXG5cdFx0aWYgKGNvbnNvbGVbbWV0aG9kXS5hcHBseSkge1xyXG5cdFx0XHRjb25zb2xlW21ldGhvZF0uYXBwbHkoY29uc29sZSwgYXJncyk7XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0Y29uc29sZVttZXRob2RdKGFyZ3MpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBhcmdzO1xyXG5cdH1cclxufTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbnNvbGVUYXJnZXQ7IiwiLyoqXHJcbiAqIENvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXNcclxuICovXHJcbmZ1bmN0aW9uIEVsZW1lbnRUYXJnZXQgKHBhcmFtcykge1xyXG5cclxufVxyXG5FbGVtZW50VGFyZ2V0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEVsZW1lbnRUYXJnZXQ7XHJcblxyXG5cclxuLyoqXHJcbiAqIFRoZSBlbGVtZW50IHRvIGxvZyB0b1xyXG4gKiBAdHlwZSB7TWl4ZWR9XHJcbiAqL1xyXG5FbGVtZW50VGFyZ2V0LnByb3RvdHlwZS5fZWxlbWVudCA9IHVuZGVmaW5lZDtcclxuXHJcblxyXG4vKipcclxuICogQnVpbGQgYSBzdHJpbmcgdG8gbG9nIG91dFxyXG4gKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zXHJcbiAqIEByZXR1cm4ge1N0cmluZ31cclxuICovXHJcbkVsZW1lbnRUYXJnZXQucHJvdG90eXBlLl9idWlsZExvZ1N0cmluZyA9IGZ1bmN0aW9uIChwYXJhbXMpIHtcclxuXHJcblx0dmFyIHN0ciA9ICcnLFxyXG5cdFx0bGVuID0gcGFyYW1zLmxlbmd0aCxcclxuXHRcdGkgPSAwO1xyXG5cclxuXHRmb3IgKGk7IGkgPCBsZW47IGkrPTEpIHtcclxuXHRcdHN0ciArPSBwYXJhbXNbaV0gKyAnICc7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gc3RyLnNsaWNlKDAsIC0xKTtcclxufTtcclxuXHJcblxyXG4vKipcclxuICogV3JpdGUgYSBsb2cgdG8gYW4gZWxlbWVudFxyXG4gKi9cclxuRWxlbWVudFRhcmdldC5wcm90b3R5cGUuX2xvZyA9IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0Ly8gSWYgd2UgZG9uJ3QgaGF2ZSBhbiBlbGVtZW50IHlldCwgY3JlYXRlIG9uZVxyXG5cdGlmICghdGhpcy5fZWxlbWVudCkge1xyXG5cdFx0dGhpcy5fY3JlYXRlRWxlbWVudCgpO1xyXG5cdH1cclxuXHJcblx0Ly8gTmV3IGVsZW1lbnRcclxuXHR2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHJcblx0Ly8gU2V0IHByb3BlcnRpZXNcclxuXHRlbC5jbGFzc05hbWUgPSAnbG9nJztcclxuXHRlbC5pbm5lckhUTUwgPSB0aGlzLl9idWlsZExvZ1N0cmluZyhhcmd1bWVudHMpO1xyXG5cclxuXHQvLyBBZGQgdGhlIGxvZ1xyXG5cdHRoaXMuX2VsZW1lbnQuYXBwZW5kQ2hpbGQoZWwpO1xyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBXcml0ZSBhbiBlcnJvciB0byBhbiBlbGVtZW50XHJcbiAqIEBwYXJhbSB7QXJyYXl9IGFyZ3NcclxuICovXHJcbi8vIEVsZW1lbnRUYXJnZXQucHJvdG90eXBlLl9lcnJvciA9IGZ1bmN0aW9uIChhcmdzKSB7XHJcblxyXG4vLyB9O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBXcml0ZSBhIHdhcm5pbmcgdG8gYW4gZWxlbWVudFxyXG4gKiBAcGFyYW0ge0FycmF5fSBhcmdzXHJcbiAqL1xyXG4vLyBFbGVtZW50VGFyZ2V0LnByb3RvdHlwZS5fd2FybiA9IGZ1bmN0aW9uIChhcmdzKSB7XHJcblxyXG4vLyB9O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBXcml0ZSBpbmZvIHRvIGFuIGVsZW1lbnRcclxuICogQHBhcmFtIHtBcnJheX0gYXJnc1xyXG4gKi9cclxuLy8gRWxlbWVudFRhcmdldC5wcm90b3R5cGUuX2luZm8gPSBmdW5jdGlvbiAoYXJncykge1xyXG5cclxuLy8gfTtcclxuXHJcblxyXG4vKipcclxuICogV3JpdGUgYSBkZWJ1ZyB0byBhbiBlbGVtZW50XHJcbiAqIEBwYXJhbSB7QXJyYXl9IGFyZ3NcclxuICovXHJcbi8vIEVsZW1lbnRUYXJnZXQucHJvdG90eXBlLl9kZWJ1ZyA9IGZ1bmN0aW9uIChhcmdzKSB7XHJcblxyXG4vLyB9O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBXcml0ZSBhIHRhYmxlIHRvIGFuIGVsZW1lbnRcclxuICogQHBhcmFtIHtBcnJheX0gYXJnc1xyXG4gKi9cclxuLy8gRWxlbWVudFRhcmdldC5wcm90b3R5cGUuX3RhYmxlID0gZnVuY3Rpb24gKGFyZ3MpIHtcclxuXHJcbi8vIH07XHJcblxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSBhbiBlbGVtZW50IHRvIHdyaXRlIHRvIGFuZCB0cnkgdG8gYWRkIGl0IHRvIHRoZSBib2R5XHJcbiAqL1xyXG5FbGVtZW50VGFyZ2V0LnByb3RvdHlwZS5fY3JlYXRlRWxlbWVudCA9IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0Ly8gSWYgdGhlcmUgaXMgbm8gd2luZG93IG9iamVjdCwgd2UncmUgU09MXHJcblx0aWYgKCFkb2N1bWVudCkge1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHJcblx0Ly8gQ3JlYXRlIHRoZSBlbGVtZW50XHJcblx0dGhpcy5fZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cclxuXHQvLyBTZXQgZWxlbWVudCBwcm9wZXJ0aWVzXHJcblx0dGhpcy5fZWxlbWVudC5jbGFzc05hbWUgPSAnbG9nZ2llcic7XHJcblxyXG5cdC8vIEFwcGVuZCBpdCB0byB0aGUgZG9jdW1lbnRcclxuXHRkb2N1bWVudC5ib2R5Lmluc2VydEJlZm9yZSh0aGlzLl9lbGVtZW50LCBkb2N1bWVudC5ib2R5LmZpcnN0Q2hpbGQpO1xyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBXcml0ZSB0byB0aGUgZWxlbWVudFxyXG4gKiBAcGFyYW0ge0FycmF5fSBhcmdzXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcclxuICovXHJcbkVsZW1lbnRUYXJnZXQucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gKGFyZ3MsIG1ldGhvZCkge1xyXG5cclxuXHQvLyBJZiB3ZSBkb24ndCBoYXZlIGFuIGVsZW1lbnQgeWV0LCBjcmVhdGUgb25lXHJcblx0aWYgKCF0aGlzLl9lbGVtZW50KSB7XHJcblx0XHR0aGlzLl9jcmVhdGVFbGVtZW50KCk7XHJcblx0fVxyXG5cclxuXHJcblx0Ly8gTWFrZSBzdXJlIHRoZXJlIHJlYWxseSBpcyBhbiBlbGVtZW50XHJcblx0aWYgKHRoaXMuX2VsZW1lbnQpIHtcclxuXHJcblx0XHQvLyBUaGUgbWV0aG9kIG5hbWVcclxuXHRcdHZhciBtZXRob2ROYW1lID0gJ19lbGVtZW50JyArIG1ldGhvZC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSxcclxuXHRcdFx0ZGVmYXVsdE1ldGhvZE5hbWUgPSAnX2VsZW1lbnRMb2cnO1xyXG5cclxuXHRcdC8vIElmIHRoZXJlIGlzIG5vIG1ldGhvZCwgcmV2ZXJ0IHRvIGRlZmF1bHRcclxuXHRcdGlmICghdGhpc1ttZXRob2ROYW1lXSkge1xyXG5cclxuXHRcdFx0bWV0aG9kTmFtZSA9IGRlZmF1bHRNZXRob2ROYW1lO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIENhbGwgdGhlIG1ldGhvZFxyXG5cdFx0dGhpc1ttZXRob2ROYW1lXShhcmdzKTtcclxuXHJcblx0XHRyZXR1cm4gYXJncztcclxuXHR9XHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIFNldCB0aGUgZWxlbWVudCB3ZSdsbCB3cml0ZSB0b1xyXG4gKiBAcGFyYW0ge09iamVjdH0gZWxcclxuICovXHJcbkVsZW1lbnRUYXJnZXQucHJvdG90eXBlLnNldEVsZW1lbnQgPSBmdW5jdGlvbiAoZWwpIHtcclxuXHJcblx0dGhpcy5fZWxlbWVudCA9IGVsO1xyXG59O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRWxlbWVudFRhcmdldDsiXX0=
(1)
});
