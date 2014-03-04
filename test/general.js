// Includes
var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sinonChai = require('sinon-chai'),
	cheerio = require('cheerio'),
	Logger = require('../src/logger');


// New suite
describe('General tests.', function () {

	// Constructor params
	it('Should set constructor params properly.', function () {
		var el = cheerio('<div></div>'),
			logger = new Logger({
				target: 'element',
				element: el
			});
		expect(logger._target).to.equal('element');
		expect(logger._element).to.equal(el);
	});


	// Enable
	it('Should enable logging properly.', function () {
		var logger = new Logger();
		logger.enable();
		expect(logger._enabled).to.equal(true);
	});


	// Disable
	it('Should disable logging properly.', function () {
		var logger = new Logger();
		logger.disable();
		expect(logger._enabled).to.equal(false);
	});


	// Setting the logging target
	describe('Set target.', function () {

		// Set the target to element
		it('Should set the target to be the element.', function () {
			var logger = new Logger();
			logger.setTarget('element');
			expect(logger._target).to.equal('element');
		});

		// Set the target to fake
		it('Should set the target to be the fake.', function () {
			var logger = new Logger();
			logger.setTarget('fake');
			expect(logger._target).to.equal('console');
		});

		// Set the target to console
		it('Should set the target to be the console.', function () {
			var logger = new Logger();
			logger.setTarget('console');
			expect(logger._target).to.equal('console');
		});
	});


	// Setting the logging element
	describe('Set logging element.', function () {

		// Set the target to document
		it('Should set the logging element.', function () {
			var logger = new Logger();
			logger.setTarget('element');
			expect(logger._target).to.equal('element');
		});

		// Fail to set the logging element
		it('Should not set the logging element because we aren\'t logging to an element.', function () {
			var el = cheerio('<div />'),
				logger = new Logger();
			logger.setElement(el);
			expect(logger._target).to.not.equal(el);
		});
	});
});