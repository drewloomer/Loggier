// Includes
var assert = require('chai').assert,
	Logger = require('../src/logger');


// New suite
describe('Logger', function () {

	// Enable
	it('Should enable logging properly.', function () {
		var logger = new Logger();
		logger.enable();
		assert.equal(true, logger._enabled);
	});


	// Disable
	it('Should disable logging properly.', function () {
		var logger = new Logger();
		logger.disable();
		assert.equal(false, logger._enabled);
	});


	// Console logging
	describe('Console', function () {

		// Log
		it('Should return a properly formatted console log.', function () {
			var logger = new Logger(),
				log = logger.log('Testing');
			assert.equal(0, log.indexOf('Testing'), log);
		});
	});
});