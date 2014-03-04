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

	// Create a string from log arguments
	it('Should create a string from log arguments.', function () {

		var elementTarget = new ElementTarget(),
			str = elementTarget._buildLogString(['Testing', 'a second string', '[testMethodName@https://localhost/test/scripts/file.js:562:14]']);

		expect(str).to.equal('Testing a second string [testMethodName@https://localhost/test/scripts/file.js:562:14]');
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
		elementTarget.setElement(el);
		expect(elementTarget._element).to.equal(el);
	});

	// Write
	it('Should write to the an element.', function () {

		var elementTarget = new ElementTarget();
		elementTarget.write('A document log. [anonymous@Context.', 'log');
		expect(elementTarget._element.innerHTML).to.contain('A document log. [anonymous@Context.');
	});

	// Log
	it('Should return a properly formatted document log.', function () {

		var elementTarget = new ElementTarget();
		elementTarget._log('A document log. [anonymous@Context.');
		expect(elementTarget._element.innerHTML).to.contain('A document log. [anonymous@Context.');
	});

	/*// Error
	it('Should return a properly formatted document error.', function () {
		var elementTarget = new ElementTarget({
				target: 'document'
			}),
			error = elementTarget.error('A document error. [anonymous@Context.');
		// expect(error).to.contain('A document error. [anonymous@Context.');
	});

	// Warn
	it('Should return a properly formatted document warn.', function () {
		var elementTarget = new ElementTarget({
				target: 'document'
			}),
			warn = elementTarget.warn('A document warn. [anonymous@Context.');
		// expect(warn).to.contain('A document warn. [anonymous@Context.');
	});

	// Info
	it('Should return a properly formatted document info.', function () {
		var elementTarget = new ElementTarget({
				target: 'document'
			}),
			info = elementTarget.info('A document info. [anonymous@Context.');
		// expect(info).to.contain('A document info. [anonymous@Context.');
	});

	// Debug
	it('Should return a properly formatted document debug.', function () {
		var elementTarget = new ElementTarget({
				target: 'document'
			}),
			debug = elementTarget.debug('A document debug. [anonymous@Context.');
		// expect(debug).to.contain('A document debug. [anonymous@Context.');
	});

	// Table
	it('Should return a properly formatted document table.', function () {
		var elementTarget = new ElementTarget({
				target: 'document'
			}),
			table = elementTarget.table('A document table. [anonymous@Context.');
		// expect(table).to.contain('A document table. [anonymous@Context.');
	});*/
});