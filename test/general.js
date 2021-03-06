// Includes
var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sinonChai = require('sinon-chai'),
	cheerio = require('cheerio'),
	Loggier = require('../src/index');


// New suite
describe('General tests.', function () {

	// Constructor params
	it('Should set constructor params properly.', function () {
		var el = cheerio('<div></div>'),
			loggier = new Loggier({
				target: 'element',
				element: el
			});
		expect(loggier._targetId).to.equal('element');
		expect(loggier.target()._element).to.equal(el);
	});


	// Enable
	it('Should enable logging properly.', function () {
		var loggier = new Loggier();
		loggier.enable();
		expect(loggier._enabled).to.equal(true);
	});


	// Disable
	it('Should disable logging properly.', function () {
		var loggier = new Loggier();
		loggier.disable();
		expect(loggier._enabled).to.equal(false);
	});


	// Setting the logging target
	describe('Set target.', function () {

		// Set the target to element
		it('Should set the target to be the element.', function () {
			var loggier = new Loggier();
			loggier.target('element');
			expect(loggier._targetId).to.equal('element');
		});

		// Set the target to fake
		it('Should not set the target to be the fake.', function () {
			var loggier = new Loggier();
			loggier.target('fake');
			expect(loggier._targetId).to.equal('console');
		});

		// Set the target to console
		it('Should set the target to be the console.', function () {
			var loggier = new Loggier();
			loggier.target('console');
			expect(loggier._targetId).to.equal('console');
		});
	});


	// Get the logging target
	it('Should get the logging target.', function () {
		var loggier = new Loggier();
		expect(loggier.target()).to.equal(loggier._targets['console']);
		loggier.target('element');
		expect(loggier.target()).to.equal(loggier._targets['element']);
	});


	// Setting the logging element
	describe('Set logging element.', function () {

		// Set the target to document
		it('Should set the logging element.', function () {
			var el = cheerio('<div />'),
				loggier = new Loggier();
			loggier.target('element');
			loggier.element(el);
			expect(loggier._targetId).to.equal('element');
			expect(loggier.target()._element).to.equal(el);
		});

		// Fail to set the logging element
		it('Should not set the logging element because we aren\'t logging to an element.', function () {
			var el = cheerio('<div />'),
				loggier = new Loggier();
			loggier.element(el);
			expect(loggier.target()._element).to.not.equal(el);
		});
	});


	// Getting the log level
	it('Should get the log level.', function () {
		var loggier = new Loggier(),
			level = loggier.logLevel();
		expect(level).to.equal(31);
	});


	// Setting the log level
	it('Should set the log level.', function () {
		var loggier = new Loggier(),
			level = loggier.logLevel('error');
		expect(level).to.equal(1);
	});


	// Respecting the log level
	it('Should respect the log level.', function () {
		var loggier = new Loggier(),
			level = loggier.logLevel('error'),
			log = loggier.log('Test log.');
		expect(log).to.equal(undefined);
		loggier.logLevel('log');
		log = loggier.log('Test log.');
		expect(log[0]).to.equal('Test log.');
	});


	// Logging types
	describe('Log types.', function () {

		// Log
		it('Should log properly.', function () {
			var loggier = new Loggier(),
				log = loggier.log('What a log test! Yowza.');
			expect(log[0]).to.equal('What a log test! Yowza.');
		});

		// Error
		it('Should error properly.', function () {
			var loggier = new Loggier(),
				error = loggier.error('What a error test! Yowza.');
			expect(error[0]).to.equal('What a error test! Yowza.');
		});

		// Warn
		it('Should warn properly.', function () {
			var loggier = new Loggier(),
				warn = loggier.warn('What a warn test! Yowza.');
			expect(warn[0]).to.equal('What a warn test! Yowza.');
		});

		// Info
		it('Should info properly.', function () {
			var loggier = new Loggier(),
				info = loggier.info('What a info test! Yowza.');
			expect(info[0]).to.equal('What a info test! Yowza.');
		});

		// Debug
		it('Should debug properly.', function () {
			var loggier = new Loggier(),
				debug = loggier.debug('What a debug test! Yowza.');
			expect(debug[0]).to.equal('What a debug test! Yowza.');
		});

		// Table
		it('Should table properly.', function () {
			var loggier = new Loggier(),
				table = loggier.table('What a table test! Yowza.');
			expect(table[0]).to.equal('What a table test! Yowza.');
		});
	});
});