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

		// Stub the insertBefore method
		body.insertBefore = function () { return div; };

		// Stub of the document
		document = {
			createElement: sinon.stub().returns(div),
			body: body
		};
	});

	// Reset environment faking
	afterEach(function () {

		delete document;
	});

	// Generate an element if one is not passed
	it('Should generate an element if one is not passed.', function () {

		// New elementTarget
		var elementTarget = new ElementTarget();

		// Log to create the element
		elementTarget._log('Create element?');

		expect(elementTarget._element).to.equal(div);
	});

	// Create an element
	it('Should create an element.', function () {

		// New elementTarget
		var elementTarget = new ElementTarget(),
			el = elementTarget._createElement();

		expect(el).to.not.equal(undefined);
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
		expect(elementTarget._element).to.equal(el);
	});

	// Write
	it('Should write to the an element.', function () {

		var elementTarget = new ElementTarget();
		elementTarget.write(['A document log. [anonymous@Context.'], 'log');
		expect(elementTarget._element.innerHTML).to.contain('A document log. [anonymous@Context.');
	});

	// Log
	it('Should return a properly formatted document log.', function () {

		var elementTarget = new ElementTarget();
		elementTarget._log('A document log. [anonymous@Context.');
		expect(elementTarget._element.innerHTML).to.contain('A document log. [anonymous@Context.');
		expect(elementTarget._element.className).to.contain('log');
	});

	// Error
	it('Should return a properly formatted document error log.', function () {

		var elementTarget = new ElementTarget();
		elementTarget._error('A document log. [anonymous@Context.');
		expect(elementTarget._element.innerHTML).to.contain('A document log. [anonymous@Context.');
		expect(elementTarget._element.className).to.contain('error');
	});

	// Warn
	it('Should return a properly formatted document warn log.', function () {

		var elementTarget = new ElementTarget();
		elementTarget._warn('A document log. [anonymous@Context.');
		expect(elementTarget._element.innerHTML).to.contain('A document log. [anonymous@Context.');
		expect(elementTarget._element.className).to.contain('warn');
	});

	// Info
	it('Should return a properly formatted document info log.', function () {

		var elementTarget = new ElementTarget();
		elementTarget._info('A document log. [anonymous@Context.');
		expect(elementTarget._element.innerHTML).to.contain('A document log. [anonymous@Context.');
		expect(elementTarget._element.className).to.contain('info');
	});

	// Debug
	it('Should return a properly formatted document debug log.', function () {

		var elementTarget = new ElementTarget();
		elementTarget._debug('A document log. [anonymous@Context.');
		expect(elementTarget._element.innerHTML).to.contain('A document log. [anonymous@Context.');
		expect(elementTarget._element.className).to.contain('debug');
	});

	// Table
	it('Should return a properly formatted document table log.', function () {

		var elementTarget = new ElementTarget();
		elementTarget._table('A document log. [anonymous@Context.');
		expect(elementTarget._element.innerHTML).to.contain('A document log. [anonymous@Context.');
		expect(elementTarget._element.className).to.contain('table');
	});
});