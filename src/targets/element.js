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

		// Listen for clicks
		onClick = this._onClick.bind(this);
		this._element.addEventListener('click', onClick);

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
		this._element.removeEventListener('click', onClick);

		// We're not setup
		this._elementSetup = false;
	},


	/**
	 * When the element is clicked
	 * @param {Object} e
	 */
	_onClick: function (e) {

		console.log(e);
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