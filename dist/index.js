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
	this.getTarget().write(args, method);
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

	if (this._targets.hasOwnProperty(this._targetId) !== -1) {
		return this._targets[this._targetId];
	}
};


/**
 * Set the current target
 * @param {String} name
 */
Loggier.prototype.setTarget = function (name) {

	if (this._targets.hasOwnProperty(name) !== -1) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJXOlxcUGVyc29uYWxcXGxvZ2dpZXJcXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiVzovUGVyc29uYWwvbG9nZ2llci9zcmMvZmFrZV9kYzBiYmY1ZS5qcyIsIlc6L1BlcnNvbmFsL2xvZ2dpZXIvc3JjL2hlbHBlcnMvc3RhY2stcGFyc2VyLmpzIiwiVzovUGVyc29uYWwvbG9nZ2llci9zcmMvdGFyZ2V0cy9jb25zb2xlLmpzIiwiVzovUGVyc29uYWwvbG9nZ2llci9zcmMvdGFyZ2V0cy9lbGVtZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBDb25zb2xlVGFyZ2V0ID0gcmVxdWlyZSgnLi90YXJnZXRzL2NvbnNvbGUnKSxcclxuXHRFbGVtZW50VGFyZ2V0ID0gcmVxdWlyZSgnLi90YXJnZXRzL2VsZW1lbnQnKSxcclxuXHRTdGFja1BhcnNlciA9IHJlcXVpcmUoJy4vaGVscGVycy9zdGFjay1wYXJzZXInKTtcclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zXHJcbiAqL1xyXG5mdW5jdGlvbiBMb2dnaWVyIChwYXJhbXMpIHtcclxuXHJcblx0cGFyYW1zID0gcGFyYW1zIHx8IHt9O1xyXG5cclxuXHQvLyBUYXJnZXRcclxuXHRpZiAocGFyYW1zLnRhcmdldCkge1xyXG5cdFx0dGhpcy5zZXRUYXJnZXQocGFyYW1zLnRhcmdldCk7XHJcblx0fVxyXG5cclxuXHQvLyBMb2dnaW5nIGVsZW1lbnRcclxuXHRpZiAocGFyYW1zLmVsZW1lbnQpIHtcclxuXHRcdHRoaXMuc2V0RWxlbWVudChwYXJhbXMuZWxlbWVudCk7XHJcblx0fVxyXG59XHJcbkxvZ2dpZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTG9nZ2llcjtcclxuXHJcblxyXG4vKipcclxuICogSXMgbG9nZ2luZyBlbmFibGVkP1xyXG4gKiBAdHlwZSB7Qm9vbGVhbn1cclxuICovXHJcbkxvZ2dpZXIucHJvdG90eXBlLl9lbmFibGVkID0gdHJ1ZTtcclxuXHJcblxyXG4vKipcclxuICogVGhlIGxvZ2dpbmcgdGFyZ2V0XHJcbiAqIEB0eXBlIHtTdHJpbmd9XHJcbiAqL1xyXG5Mb2dnaWVyLnByb3RvdHlwZS5fdGFyZ2V0SWQgPSAnY29uc29sZSc7XHJcblxyXG5cclxuLyoqXHJcbiAqIFBvc3NpYmxlIGxvZ2dpbmcgdGFyZ2V0c1xyXG4gKiBAdHlwZSB7T2JqZWN0fVxyXG4gKi9cclxuTG9nZ2llci5wcm90b3R5cGUuX3RhcmdldHMgPSB7XHJcblx0J2NvbnNvbGUnOiBuZXcgQ29uc29sZVRhcmdldCgpLFxyXG5cdCdlbGVtZW50JzogbmV3IEVsZW1lbnRUYXJnZXQoKVxyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBTdGFjayBwYXJzZXIgaGVscGVyXHJcbiAqIEB0eXBlIHtPYmplY3R9XHJcbiAqL1xyXG5Mb2dnaWVyLnByb3RvdHlwZS5fc3RhY2tQYXJzZXIgPSBuZXcgU3RhY2tQYXJzZXIoKTtcclxuXHJcblxyXG4vKipcclxuICogRG9lcyB0aGUgYWN0dWFsIHdyaXRpbmdcclxuICogQHBhcmFtIHtBcnJheX0gYXJnc1xyXG4gKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXHJcbiAqL1xyXG5Mb2dnaWVyLnByb3RvdHlwZS5fd3JpdGUgPSBmdW5jdGlvbiAoYXJncywgbWV0aG9kKSB7XHJcblxyXG5cdC8vIERvbid0IGxvZyBpZiB3ZSdyZSBub3QgZW5hYmxlZFxyXG5cdGlmICghdGhpcy5fZW5hYmxlZCkge1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHJcblx0Ly8gVGFibGUgbG9nZ2luZyBkb2Vzbid0IGxpa2UgZXh0cmEgZGF0YVxyXG5cdGlmIChtZXRob2QgIT09ICd0YWJsZScpIHtcclxuXHJcblx0XHQvLyBGaWxlIGluZm8gdG8gYXBwZW5kXHJcblx0XHR2YXIgaW5mbyA9IHRoaXMuX3N0YWNrUGFyc2VyLmdldEluZm8oKTtcclxuXHJcblx0XHQvLyBBcHBlbmQgdGhlIGluZm9cclxuXHRcdGFyZ3MgPSBhcmdzLmNvbmNhdCh0aGlzLl9idWlsZFN0YWNrSW5mb1N0cmluZyhpbmZvKSk7XHJcblx0fVxyXG5cclxuXHQvLyBXcml0ZSBtZXRob2QgYmFzZWQgb24gdGFyZ2V0XHJcblx0dGhpcy5nZXRUYXJnZXQoKS53cml0ZShhcmdzLCBtZXRob2QpO1xyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBCdWlsZCBhIHN0cmluZyBvZiBzdGFjayBpbmZvXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXNcclxuICogQHJldHVybiB7U3RyaW5nfVxyXG4gKi9cclxuTG9nZ2llci5wcm90b3R5cGUuX2J1aWxkU3RhY2tJbmZvU3RyaW5nID0gZnVuY3Rpb24gKHBhcmFtcykge1xyXG5cclxuXHRyZXR1cm4gJygnICsgcGFyYW1zLm1ldGhvZCArICdAJyArIHBhcmFtcy5maWxlICsgJzonICsgcGFyYW1zLmxpbmUgKyAocGFyYW1zLmNoYXJhY3RlciAhPT0gdW5kZWZpbmVkID8gJzonICsgcGFyYW1zLmNoYXJhY3RlciA6ICcnKSArICcpJztcclxufTtcclxuXHJcblxyXG4vKipcclxuICogR2V0IHRoZSBjdXJyZW50IHRhcmdldFxyXG4gKiBAcmV0dXJuIHtPYmplY3R9XHJcbiAqL1xyXG5Mb2dnaWVyLnByb3RvdHlwZS5nZXRUYXJnZXQgPSBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdGlmICh0aGlzLl90YXJnZXRzLmhhc093blByb3BlcnR5KHRoaXMuX3RhcmdldElkKSAhPT0gLTEpIHtcclxuXHRcdHJldHVybiB0aGlzLl90YXJnZXRzW3RoaXMuX3RhcmdldElkXTtcclxuXHR9XHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIFNldCB0aGUgY3VycmVudCB0YXJnZXRcclxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcclxuICovXHJcbkxvZ2dpZXIucHJvdG90eXBlLnNldFRhcmdldCA9IGZ1bmN0aW9uIChuYW1lKSB7XHJcblxyXG5cdGlmICh0aGlzLl90YXJnZXRzLmhhc093blByb3BlcnR5KG5hbWUpICE9PSAtMSkge1xyXG5cdFx0dGhpcy5fdGFyZ2V0SWQgPSBuYW1lO1xyXG5cdH1cclxufTtcclxuXHJcblxyXG4vKipcclxuICogU2V0IHRoZSBlbGVtZW50XHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBlbFxyXG4gKi9cclxuTG9nZ2llci5wcm90b3R5cGUuc2V0RWxlbWVudCA9IGZ1bmN0aW9uIChlbCkge1xyXG5cclxuXHRpZiAodGhpcy5fdGFyZ2V0SWQgPT09ICdlbGVtZW50Jykge1xyXG5cdFx0dGhpcy5nZXRUYXJnZXQoKS5zZXRFbGVtZW50KGVsKTtcclxuXHR9XHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIEVuYWJsZSBsb2dnaW5nXHJcbiAqL1xyXG5Mb2dnaWVyLnByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdHRoaXMuX2VuYWJsZWQgPSB0cnVlO1xyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBEaXNhYmxlIGxvZ2dpbmdcclxuICovXHJcbkxvZ2dpZXIucHJvdG90eXBlLmRpc2FibGUgPSBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdHRoaXMuX2VuYWJsZWQgPSBmYWxzZTtcclxufTtcclxuXHJcblxyXG4vKipcclxuICogTG9nIHRhYnVsYXIgZGF0YVxyXG4gKi9cclxuTG9nZ2llci5wcm90b3R5cGUubG9nID0gZnVuY3Rpb24gKCkge1xyXG5cclxuXHRyZXR1cm4gdGhpcy5fd3JpdGUoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSwgJ2xvZycpO1xyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBMb2cgdGFidWxhciBkYXRhXHJcbiAqL1xyXG5Mb2dnaWVyLnByb3RvdHlwZS5lcnJvciA9IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0cmV0dXJuIHRoaXMuX3dyaXRlKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCksICdlcnJvcicpO1xyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBMb2cgdGFidWxhciBkYXRhXHJcbiAqL1xyXG5Mb2dnaWVyLnByb3RvdHlwZS53YXJuID0gZnVuY3Rpb24gKCkge1xyXG5cclxuXHRyZXR1cm4gdGhpcy5fd3JpdGUoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSwgJ3dhcm4nKTtcclxufTtcclxuXHJcblxyXG4vKipcclxuICogTG9nIHRhYnVsYXIgZGF0YVxyXG4gKi9cclxuTG9nZ2llci5wcm90b3R5cGUuaW5mbyA9IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0cmV0dXJuIHRoaXMuX3dyaXRlKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCksICdpbmZvJyk7XHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIExvZyB0YWJ1bGFyIGRhdGFcclxuICovXHJcbkxvZ2dpZXIucHJvdG90eXBlLmRlYnVnID0gZnVuY3Rpb24gKCkge1xyXG5cclxuXHRyZXR1cm4gdGhpcy5fd3JpdGUoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSwgJ2RlYnVnJyk7XHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIExvZyB0YWJ1bGFyIGRhdGFcclxuICovXHJcbkxvZ2dpZXIucHJvdG90eXBlLnRhYmxlID0gZnVuY3Rpb24gKCkge1xyXG5cclxuXHRyZXR1cm4gdGhpcy5fd3JpdGUoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSwgJ3RhYmxlJyk7XHJcbn07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMb2dnaWVyOyIsIi8qKlxyXG4gKiBDb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zXHJcbiAqL1xyXG5mdW5jdGlvbiBTdGFja1BhcnNlciAocGFyYW1zKSB7XHJcblxyXG59XHJcblN0YWNrUGFyc2VyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFN0YWNrUGFyc2VyO1xyXG5cclxuXHJcbi8qKlxyXG4gKiBFeHRyYWN0IHRoZSBsaW5lIG51bWJlciBmcm9tIGEgc3RhY2sgdHJhY2VcclxuICovXHJcblN0YWNrUGFyc2VyLnByb3RvdHlwZS5nZXRJbmZvID0gZnVuY3Rpb24gKCkge1xyXG5cclxuXHQvLyBOZXcgZXJyb3IgZm9yIHRoZSBzdGFjayBpbmZvXHJcblx0dmFyIHN0YWNrID0gdGhpcy5fZ2VuZXJhdGVTdGFja1RyYWNlKCksXHJcblx0XHRsaW5lLFxyXG5cdFx0aW5mbyxcclxuXHRcdGZpbGUsXHJcblx0XHRtZXRob2QsXHJcblx0XHRsaW5lTnVtYmVyLFxyXG5cdFx0Y2hhcmFjdGVyO1xyXG5cclxuXHQvLyBQYXJzZSBkaWZmZXJlbnQgdHlwZXMgb2YgdHJhY2VzXHJcblx0aWYgKHN0YWNrLmluZGV4T2YoJ0Vycm9yJykgPT09IDApIHtcclxuXHRcdHJldHVybiB0aGlzLl9nZXRJbmZvVjgoc3RhY2spO1xyXG5cdH1cclxuXHRlbHNlIGlmIChzdGFjay5pbmRleE9mKCdSZWZlcmVuY2VFcnJvcicpID09PSAwKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fZ2V0SW5mb0NoYWtyYShzdGFjayk7XHJcblx0fVxyXG5cdC8vIFRPRE86IE5pdHJvIHN1cHBvcnRcclxuXHQvLyBlbHNlIGlmIChzdGFjay5pbmRleE9mKCdSZWZlcmVuY2VFcnJvcicpID09PSAwKSB7XHJcblx0Ly8gXHRyZXR1cm4gdGhpcy5fZ2V0SW5mb0NoYWtyYShzdGFjayk7XHJcblx0Ly8gfVxyXG5cdGVsc2Uge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2dldEluZm9TcGlkZXJNb25rZXkoc3RhY2spO1xyXG5cdH1cclxufTtcclxuXHJcblxyXG4vKipcclxuICogR2V0IHRoZSBzdGFjayBpbmZvIGZvciBWOFxyXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RhY2tcclxuICovXHJcblN0YWNrUGFyc2VyLnByb3RvdHlwZS5fZ2V0SW5mb1Y4ID0gZnVuY3Rpb24gKHN0YWNrKSB7XHJcblxyXG5cdC8vIFBhcnNlIHRoZSA2dGggbGluZSBvZiB0aGUgc3RhY2sgdHJhY2UgdG8gZ2V0IGxpbmUgaW5mb1xyXG5cdHZhciBsaW5lID0gc3RhY2suc3BsaXQoJ1xcbicpWzVdLFxyXG5cdFx0aW5mbyA9IGxpbmUubWF0Y2goLyg/OmF0XFxzKSg/OihbXlxcKF17MX0pKD86XFxzXFwoKSguKil8KCkoKSguKil8KCkoKSg8YW5vbnltb3VzPikpKFxcOlswLTldezEsfSkoXFw6WzAtOV17MSx9KS8pO1xyXG5cclxuXHQvLyBJZiB0aGVyZSBpcyBubyBpbmZvLCBvdXIgcmVnZXggZmFpbGVkIGJlY2F1c2Ugb2YgYmFkIHN0YWNrIGRhdGFcclxuXHRpZiAoIWluZm8pIHtcclxuXHRcdHJldHVybiB7fTtcclxuXHR9XHJcblxyXG5cdC8vIEdldCB0aGUgbGluZSBpbmZvXHJcblx0dmFyXHRtZXRob2QgPSBpbmZvWzFdIHx8ICdhbm9ueW1vdXMnLFxyXG5cdFx0ZmlsZSA9IGluZm9bMl0gfHwgaW5mb1s1XSxcclxuXHRcdGxpbmVOdW1iZXIgPSBwYXJzZUludChpbmZvWzldLnN1YnN0cigxKSwgMTApLFxyXG5cdFx0Y2hhcmFjdGVyID0gcGFyc2VJbnQoaW5mb1sxMF0uc3Vic3RyKDEpLCAxMCk7XHJcblxyXG5cdC8vIFJldHVybiBhbiBvYmplY3QgdGhhdCB3aWxsIGJlIHVzZWQgdG8gbWFrZSBhIHN0cmluZyBsYXRlclxyXG5cdHJldHVybiB7XHJcblx0XHRtZXRob2Q6IG1ldGhvZCxcclxuXHRcdGZpbGU6IGZpbGUsXHJcblx0XHRsaW5lOiBsaW5lTnVtYmVyLFxyXG5cdFx0Y2hhcmFjdGVyOiBjaGFyYWN0ZXJcclxuXHR9O1xyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBHZXQgdGhlIHN0YWNrIGluZm8gZm9yIFNwaWRlck1vbmtleVxyXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RhY2tcclxuICovXHJcblN0YWNrUGFyc2VyLnByb3RvdHlwZS5fZ2V0SW5mb1NwaWRlck1vbmtleSA9IGZ1bmN0aW9uIChzdGFjaykge1xyXG5cclxuXHQvLyBQYXJzZSB0aGUgNXRoIGxpbmUgb2YgdGhlIHN0YWNrIHRyYWNlIHRvIGdldCBsaW5lIGluZm9cclxuXHR2YXIgbGluZSA9IHN0YWNrLnNwbGl0KCdcXG4nKVs0XSxcclxuXHRcdGluZm8gPSBsaW5lLm1hdGNoKC8oW15AXXsxLH18KSg/OkApKC4qKShcXDpbMC05XXsxLH0pLyk7XHJcblxyXG5cdC8vIElmIHRoZXJlIGlzIG5vIGluZm8sIG91ciByZWdleCBmYWlsZWQgYmVjYXVzZSBvZiBiYWQgc3RhY2sgZGF0YVxyXG5cdGlmICghaW5mbykge1xyXG5cdFx0cmV0dXJuIHt9O1xyXG5cdH1cclxuXHJcblx0Ly8gR2V0IHRoZSBsaW5lIGluZm9cclxuXHR2YXJcdG1ldGhvZCA9IGluZm9bMV0gfHwgJ2Fub255bW91cycsXHJcblx0XHRmaWxlID0gaW5mb1syXSxcclxuXHRcdGxpbmVOdW1iZXIgPSBwYXJzZUludChpbmZvWzNdLnN1YnN0cigxKSwgMTApO1xyXG5cclxuXHQvLyBSZXR1cm4gYW4gb2JqZWN0IHRoYXQgd2lsbCBiZSB1c2VkIHRvIG1ha2UgYSBzdHJpbmcgbGF0ZXJcclxuXHRyZXR1cm4ge1xyXG5cdFx0bWV0aG9kOiBtZXRob2QsXHJcblx0XHRmaWxlOiBmaWxlLFxyXG5cdFx0bGluZTogbGluZU51bWJlcixcclxuXHRcdGNoYXJhY3RlcjogdW5kZWZpbmVkXHJcblx0fTtcclxufTtcclxuXHJcblxyXG4vKipcclxuICogR2V0IHRoZSBzdGFjayBpbmZvIGZvciBDaGFrcmFcclxuICogQHBhcmFtIHtTdHJpbmd9IHN0YWNrXHJcbiAqL1xyXG5TdGFja1BhcnNlci5wcm90b3R5cGUuX2dldEluZm9DaGFrcmEgPSBmdW5jdGlvbiAoc3RhY2spIHtcclxuXHJcblx0Ly8gUGFyc2UgdGhlIDZ0aCBsaW5lIG9mIHRoZSBzdGFjayB0cmFjZSB0byBnZXQgbGluZSBpbmZvXHJcblx0dmFyIGxpbmUgPSBzdGFjay5zcGxpdCgnXFxuJylbNV0sXHJcblx0XHRpbmZvID0gbGluZS5tYXRjaCgvKD86YXRcXHMpKD86KFteXFwoXXsxfSkoPzpcXHNcXCgpKC4qKXwoKSgpKC4qKXwoKSgpKDxhbm9ueW1vdXM+KSkoXFw6WzAtOV17MSx9KShcXDpbMC05XXsxLH0pLyk7XHJcblxyXG5cdC8vIElmIHRoZXJlIGlzIG5vIGluZm8sIG91ciByZWdleCBmYWlsZWQgYmVjYXVzZSBvZiBiYWQgc3RhY2sgZGF0YVxyXG5cdGlmICghaW5mbykge1xyXG5cdFx0cmV0dXJuIHt9O1xyXG5cdH1cclxuXHJcblx0Ly8gR2V0IHRoZSBsaW5lIGluZm9cclxuXHR2YXJcdG1ldGhvZCA9IGluZm9bMV0gfHwgJ2Fub255bW91cycsXHJcblx0XHRmaWxlID0gaW5mb1syXSB8fCBpbmZvWzVdLFxyXG5cdFx0bGluZU51bWJlciA9IHBhcnNlSW50KGluZm9bOV0uc3Vic3RyKDEpLCAxMCksXHJcblx0XHRjaGFyYWN0ZXIgPSBwYXJzZUludChpbmZvWzEwXS5zdWJzdHIoMSksIDEwKTtcclxuXHJcblx0Ly8gUmV0dXJuIGFuIG9iamVjdCB0aGF0IHdpbGwgYmUgdXNlZCB0byBtYWtlIGEgc3RyaW5nIGxhdGVyXHJcblx0cmV0dXJuIHtcclxuXHRcdG1ldGhvZDogbWV0aG9kLFxyXG5cdFx0ZmlsZTogZmlsZSxcclxuXHRcdGxpbmU6IGxpbmVOdW1iZXIsXHJcblx0XHRjaGFyYWN0ZXI6IGNoYXJhY3RlclxyXG5cdH07XHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlIGEgc3RhY2sgdHJhY2VcclxuICogQHJldHVybiB7U3RyaW5nfSBUaGUgc3RhY2sgdHJhY2VcclxuICovXHJcblN0YWNrUGFyc2VyLnByb3RvdHlwZS5fZ2VuZXJhdGVTdGFja1RyYWNlID0gZnVuY3Rpb24gKCkge1xyXG5cclxuXHQvLyBDcmVhdGUgYSBuZXcgZXJyb3JcclxuXHR2YXIgZXJyb3IgPSBuZXcgRXJyb3IoKTtcclxuXHJcblx0Ly8gSW4gc29tZSBlbmdpbmVzLCB0aGUgZXJyb3IgZG9lc24ndCBjb250YWluIGEgc3RhY2suIEdvdHRhIHRocm93IGFuIGVycm9yIGluc3RlYWQhXHJcblx0aWYgKCFlcnJvci5zdGFjaykge1xyXG5cdFx0dHJ5IHtcclxuXHRcdFx0aXMubm90LmZ1bmMoKTtcclxuXHRcdH1cclxuXHRcdGNhdGNoIChlKSB7XHJcblx0XHRcdGVycm9yID0gZTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHJldHVybiBlcnJvci5zdGFjaztcclxufTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFN0YWNrUGFyc2VyOyIsIi8qKlxyXG4gKiBDb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zXHJcbiAqL1xyXG5mdW5jdGlvbiBDb25zb2xlVGFyZ2V0IChwYXJhbXMpIHtcclxuXHJcbn1cclxuQ29uc29sZVRhcmdldC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDb25zb2xlVGFyZ2V0O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBXcml0ZSB0byB0aGUgY29uc29sZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBhcmdzXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcclxuICovXHJcbkNvbnNvbGVUYXJnZXQucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gKGFyZ3MsIG1ldGhvZCkge1xyXG5cclxuXHQvLyBNYWtlIHN1cmUgdGhlcmUgaXMgYSBjb25zb2xlXHJcblx0aWYgKGNvbnNvbGUpIHtcclxuXHJcblx0XHQvLyBJZiB0aGVyZSBpcyBubyBtZXRob2QsIHJldmVydCB0byBsb2dcclxuXHRcdGlmICghY29uc29sZVttZXRob2RdKSB7XHJcblxyXG5cdFx0XHRpZiAoIWNvbnNvbGUubG9nKSB7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdG1ldGhvZCA9ICdsb2cnO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gQXBwbHkgd2lsbCBtYWludGFpbiBjb250ZXh0LCBidXQgaXMgbm90IGFsd2F5cyBhdmFpbGFibGVcclxuXHRcdGlmIChjb25zb2xlW21ldGhvZF0uYXBwbHkpIHtcclxuXHRcdFx0Y29uc29sZVttZXRob2RdLmFwcGx5KGNvbnNvbGUsIGFyZ3MpO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdGNvbnNvbGVbbWV0aG9kXShhcmdzKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gYXJncztcclxuXHR9XHJcbn07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb25zb2xlVGFyZ2V0OyIsIi8qKlxyXG4gKiBDb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zXHJcbiAqL1xyXG5mdW5jdGlvbiBFbGVtZW50VGFyZ2V0IChwYXJhbXMpIHtcclxuXHJcbn1cclxuRWxlbWVudFRhcmdldC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFbGVtZW50VGFyZ2V0O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBUaGUgZWxlbWVudCB0byBsb2cgdG9cclxuICogQHR5cGUge01peGVkfVxyXG4gKi9cclxuRWxlbWVudFRhcmdldC5wcm90b3R5cGUuX2VsZW1lbnQgPSB1bmRlZmluZWQ7XHJcblxyXG5cclxuLyoqXHJcbiAqIEJ1aWxkIGEgc3RyaW5nIHRvIGxvZyBvdXRcclxuICogQHBhcmFtIHtPYmplY3R9IHBhcmFtc1xyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XHJcbiAqL1xyXG5FbGVtZW50VGFyZ2V0LnByb3RvdHlwZS5fYnVpbGRMb2dTdHJpbmcgPSBmdW5jdGlvbiAocGFyYW1zKSB7XHJcblxyXG5cdHZhciBzdHIgPSAnJyxcclxuXHRcdGxlbiA9IHBhcmFtcy5sZW5ndGgsXHJcblx0XHRpID0gMDtcclxuXHJcblx0Zm9yIChpOyBpIDwgbGVuOyBpKz0xKSB7XHJcblx0XHRzdHIgKz0gcGFyYW1zW2ldICsgJyAnO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHN0ci5zbGljZSgwLCAtMSk7XHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIFdyaXRlIGEgbG9nIHRvIGFuIGVsZW1lbnRcclxuICovXHJcbkVsZW1lbnRUYXJnZXQucHJvdG90eXBlLl9sb2cgPSBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdC8vIElmIHdlIGRvbid0IGhhdmUgYW4gZWxlbWVudCB5ZXQsIGNyZWF0ZSBvbmVcclxuXHRpZiAoIXRoaXMuX2VsZW1lbnQpIHtcclxuXHRcdHRoaXMuX2NyZWF0ZUVsZW1lbnQoKTtcclxuXHR9XHJcblxyXG5cdC8vIE5ldyBlbGVtZW50XHJcblx0dmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblxyXG5cdC8vIFNldCBwcm9wZXJ0aWVzXHJcblx0ZWwuY2xhc3NOYW1lID0gJ2xvZyc7XHJcblx0ZWwuaW5uZXJIVE1MID0gdGhpcy5fYnVpbGRMb2dTdHJpbmcoYXJndW1lbnRzKTtcclxuXHJcblx0Ly8gQWRkIHRoZSBsb2dcclxuXHR0aGlzLl9lbGVtZW50LmFwcGVuZENoaWxkKGVsKTtcclxufTtcclxuXHJcblxyXG4vKipcclxuICogV3JpdGUgYW4gZXJyb3IgdG8gYW4gZWxlbWVudFxyXG4gKiBAcGFyYW0ge0FycmF5fSBhcmdzXHJcbiAqL1xyXG4vLyBFbGVtZW50VGFyZ2V0LnByb3RvdHlwZS5fZXJyb3IgPSBmdW5jdGlvbiAoYXJncykge1xyXG5cclxuLy8gfTtcclxuXHJcblxyXG4vKipcclxuICogV3JpdGUgYSB3YXJuaW5nIHRvIGFuIGVsZW1lbnRcclxuICogQHBhcmFtIHtBcnJheX0gYXJnc1xyXG4gKi9cclxuLy8gRWxlbWVudFRhcmdldC5wcm90b3R5cGUuX3dhcm4gPSBmdW5jdGlvbiAoYXJncykge1xyXG5cclxuLy8gfTtcclxuXHJcblxyXG4vKipcclxuICogV3JpdGUgaW5mbyB0byBhbiBlbGVtZW50XHJcbiAqIEBwYXJhbSB7QXJyYXl9IGFyZ3NcclxuICovXHJcbi8vIEVsZW1lbnRUYXJnZXQucHJvdG90eXBlLl9pbmZvID0gZnVuY3Rpb24gKGFyZ3MpIHtcclxuXHJcbi8vIH07XHJcblxyXG5cclxuLyoqXHJcbiAqIFdyaXRlIGEgZGVidWcgdG8gYW4gZWxlbWVudFxyXG4gKiBAcGFyYW0ge0FycmF5fSBhcmdzXHJcbiAqL1xyXG4vLyBFbGVtZW50VGFyZ2V0LnByb3RvdHlwZS5fZGVidWcgPSBmdW5jdGlvbiAoYXJncykge1xyXG5cclxuLy8gfTtcclxuXHJcblxyXG4vKipcclxuICogV3JpdGUgYSB0YWJsZSB0byBhbiBlbGVtZW50XHJcbiAqIEBwYXJhbSB7QXJyYXl9IGFyZ3NcclxuICovXHJcbi8vIEVsZW1lbnRUYXJnZXQucHJvdG90eXBlLl90YWJsZSA9IGZ1bmN0aW9uIChhcmdzKSB7XHJcblxyXG4vLyB9O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgYW4gZWxlbWVudCB0byB3cml0ZSB0byBhbmQgdHJ5IHRvIGFkZCBpdCB0byB0aGUgYm9keVxyXG4gKi9cclxuRWxlbWVudFRhcmdldC5wcm90b3R5cGUuX2NyZWF0ZUVsZW1lbnQgPSBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdC8vIElmIHRoZXJlIGlzIG5vIHdpbmRvdyBvYmplY3QsIHdlJ3JlIFNPTFxyXG5cdGlmICghZG9jdW1lbnQpIHtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblxyXG5cdC8vIENyZWF0ZSB0aGUgZWxlbWVudFxyXG5cdHRoaXMuX2VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHJcblx0Ly8gU2V0IGVsZW1lbnQgcHJvcGVydGllc1xyXG5cdHRoaXMuX2VsZW1lbnQuY2xhc3NOYW1lID0gJ2xvZ2dpZXInO1xyXG5cclxuXHQvLyBBcHBlbmQgaXQgdG8gdGhlIGRvY3VtZW50XHJcblx0ZG9jdW1lbnQuYm9keS5pbnNlcnRCZWZvcmUodGhpcy5fZWxlbWVudCwgZG9jdW1lbnQuYm9keS5maXJzdENoaWxkKTtcclxufTtcclxuXHJcblxyXG4vKipcclxuICogV3JpdGUgdG8gdGhlIGVsZW1lbnRcclxuICogQHBhcmFtIHtBcnJheX0gYXJnc1xyXG4gKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXHJcbiAqL1xyXG5FbGVtZW50VGFyZ2V0LnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIChhcmdzLCBtZXRob2QpIHtcclxuXHJcblx0Ly8gSWYgd2UgZG9uJ3QgaGF2ZSBhbiBlbGVtZW50IHlldCwgY3JlYXRlIG9uZVxyXG5cdGlmICghdGhpcy5fZWxlbWVudCkge1xyXG5cdFx0dGhpcy5fY3JlYXRlRWxlbWVudCgpO1xyXG5cdH1cclxuXHJcblxyXG5cdC8vIE1ha2Ugc3VyZSB0aGVyZSByZWFsbHkgaXMgYW4gZWxlbWVudFxyXG5cdGlmICh0aGlzLl9lbGVtZW50KSB7XHJcblxyXG5cdFx0Ly8gVGhlIG1ldGhvZCBuYW1lXHJcblx0XHR2YXIgbWV0aG9kTmFtZSA9ICdfZWxlbWVudCcgKyBtZXRob2QuY2hhckF0KDApLnRvVXBwZXJDYXNlKCksXHJcblx0XHRcdGRlZmF1bHRNZXRob2ROYW1lID0gJ19lbGVtZW50TG9nJztcclxuXHJcblx0XHQvLyBJZiB0aGVyZSBpcyBubyBtZXRob2QsIHJldmVydCB0byBkZWZhdWx0XHJcblx0XHRpZiAoIXRoaXNbbWV0aG9kTmFtZV0pIHtcclxuXHJcblx0XHRcdG1ldGhvZE5hbWUgPSBkZWZhdWx0TWV0aG9kTmFtZTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBDYWxsIHRoZSBtZXRob2RcclxuXHRcdHRoaXNbbWV0aG9kTmFtZV0oYXJncyk7XHJcblxyXG5cdFx0cmV0dXJuIGFyZ3M7XHJcblx0fVxyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBTZXQgdGhlIGVsZW1lbnQgd2UnbGwgd3JpdGUgdG9cclxuICogQHBhcmFtIHtPYmplY3R9IGVsXHJcbiAqL1xyXG5FbGVtZW50VGFyZ2V0LnByb3RvdHlwZS5zZXRFbGVtZW50ID0gZnVuY3Rpb24gKGVsKSB7XHJcblxyXG5cdHRoaXMuX2VsZW1lbnQgPSBlbDtcclxufTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEVsZW1lbnRUYXJnZXQ7Il19
(1)
});
