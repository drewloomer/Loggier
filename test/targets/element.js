// Includes
var expect = require('chai').expect,
	sinon = require('sinon'),
	sinonChai = require('sinon-chai'),
	cheerio = require('cheerio'),
	ElementTarget = require('../../src/targets/element');


// Element logging
describe('Element target', function () {

	var sandbox,
		div,
		body;

	// Fake the environment
	beforeEach(function () {

		// Elements to stub in
		div = cheerio('<div />');
		body = cheerio('<body />');

		// Stub the appendChild method
		div.appendChild = function (child) { this.append(child); };
		div.addEventListener = function (event, callback) { this['on' + event] = callback; };
		div.removeEventListener = function (event, callback) { };

		// Stub the insertBefore method
		body.insertBefore = function (el) { return el; };

		// Stub of the document
		document = {
			createElement: function (name) {
				var el = cheerio('<' + name + '></' + name + '>');
				el.appendChild = function (child) { child.html(child.innerHTML); this.append(child); };
				el.addEventListener = function (event, callback) { this[('on' + event)] = callback; };
				el.removeEventListener = function (event, callback) { };
				el.html = function (html) { if (html) { return cheerio.prototype.html.apply(this, arguments); } return this.innerHTML || cheerio.prototype.html.apply(this); };
				return el;
			},
			body: body
		};
	});

	// Reset environment faking
	afterEach(function () {

	});

	// Generate an element if one is not passed
	it('Should generate an element if one is not passed.', function () {

		// New elementTarget
		var elementTarget = new ElementTarget();

		// Log to create the element
		elementTarget._log('Create element?');

		expect(elementTarget._element[0].name).to.equal('div');
	});

	// Create an element
	it('Should create an element.', function () {

		// New elementTarget
		var elementTarget = new ElementTarget(),
			el = elementTarget._createElement();

		expect(el).to.not.equal(undefined);
	});

	// Setup an element's event listeners
	it('Should setup an element\'s event listeners.', function () {

		// New elementTarget
		var elementTarget = new ElementTarget();
		elementTarget._createElement();
		elementTarget._setupElement();

		expect(elementTarget._elementSetup).to.equal(true);
	});

	// Remove an element's event listeners
	it('Should cleanup an element\'s event listeners.', function () {

		// New elementTarget
		var elementTarget = new ElementTarget();
		elementTarget._createElement();
		elementTarget._cleanupElement();

		expect(elementTarget._elementSetup).to.equal(false);
	});

	// Check that there is an element and create one if there isn't
	it('Should check that there is an element and create one if there is not.', function () {

		// New elementTarget
		var elementTarget = new ElementTarget(),
			el = elementTarget._checkElement();

		expect(el).to.not.equal(undefined);
		expect(el).to.equal(elementTarget._checkElement());
	});

	// Set the target to document
	it('Should set the logging element.', function () {
		var el = cheerio('<div />'),
			elementTarget = new ElementTarget();

		elementTarget.element(el);
		expect(elementTarget.element()).to.not.equal(undefined);
	});

	// Build a content element given any data type
	it('Should build a content element.', function () {

		var elementTarget = new ElementTarget(),
			el;

		el = elementTarget._buildContent('This is a string.');
		expect(el.html()).to.contain('This is a string.');

		el = elementTarget._buildContent({key: 'value', key2: {nestedKey: 'nestedValue'}});
		expect(el.html()).to.contain('nestedKey');

		el = elementTarget._buildContent([0, 1, 2, 4]);
		expect(el.html()).to.contain('nestedKey');
	});

	// Write
	it('Should write to the an element.', function () {

		var elementTarget = new ElementTarget();
		elementTarget.write(['A document log. (anonymous@Context.'], 'log');
		expect(elementTarget._element.html()).to.contain('A document log. (anonymous@Context.');
	});

	// Log
	it('Should return a properly formatted document log.', function () {

		var elementTarget = new ElementTarget(),
			log = elementTarget._log('A document log. (anonymous@Context.');
		expect(log.html()).to.contain('A document log. (anonymous@Context.');
		expect(log.className).to.contain('log');
	});

	// Error
	it('Should return a properly formatted document error log.', function () {

		var elementTarget = new ElementTarget(),
			log = elementTarget._error('A document log. (anonymous@Context.');
		expect(log.html()).to.contain('A document log. (anonymous@Context.');
		expect(log.className).to.contain('error');
	});

	// Warn
	it('Should return a properly formatted document warn log.', function () {

		var elementTarget = new ElementTarget(),
			log = elementTarget._warn('A document log. (anonymous@Context.');
		expect(log.html()).to.contain('A document log. (anonymous@Context.');
		expect(log.className).to.contain('warn');
	});

	// Info
	it('Should return a properly formatted document info log.', function () {

		var elementTarget = new ElementTarget(),
			log = elementTarget._info('A document log. (anonymous@Context.');
		expect(log.html()).to.contain('A document log. (anonymous@Context.');
		expect(log.className).to.contain('info');
	});

	// Debug
	it('Should return a properly formatted document debug log.', function () {

		var elementTarget = new ElementTarget(),
			log = elementTarget._debug('A document log. (anonymous@Context.');
		expect(log.html()).to.contain('A document log. (anonymous@Context.');
		expect(log.className).to.contain('debug');
	});

	// Table
	it('Should return a properly formatted document table log.', function () {

		var elementTarget = new ElementTarget(),
			log = elementTarget._table('A document log. (anonymous@Context.');
		expect(log.html()).to.contain('A document log. (anonymous@Context.');
		expect(log.className).to.contain('table');
	});
});