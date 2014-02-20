// Includes
var expect = require('chai').expect,
	Logger = require('../src/logger');


// Console logging
describe('Console', function () {

	// Log
	it('Should return a properly formatted console log.', function () {
		var logger = new Logger(),
			log = logger.log('A console log. [anonymous@Context.');
		expect(log).to.contain('A console log. [anonymous@Context.');
	});

	// Error
	it('Should return a properly formatted console error.', function () {
		var logger = new Logger(),
			error = logger.error('A console error. [anonymous@Context.');
		expect(error).to.contain('A console error. [anonymous@Context.');
	});

	// Warn
	it('Should return a properly formatted console warn.', function () {
		var logger = new Logger(),
			warn = logger.warn('A console warn. [anonymous@Context.');
		expect(warn).to.contain('A console warn. [anonymous@Context.');
	});

	// Info
	it('Should return a properly formatted console info.', function () {
		var logger = new Logger(),
			info = logger.info('A console info. [anonymous@Context.');
		expect(info).to.contain('A console info. [anonymous@Context.');
	});

	// Debug
	it('Should return a properly formatted console debug.', function () {
		var logger = new Logger(),
			debug = logger.debug('A console debug. [anonymous@Context.');
		expect(debug).to.contain('A console debug. [anonymous@Context.');
	});

	// Table
	it('Should return a properly formatted console table.', function () {
		var logger = new Logger(),
			table = logger.table('A console table. [anonymous@Context.');
		expect(table).to.contain('A console table. [anonymous@Context.');
	});
});