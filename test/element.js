// Includes
var expect = require('chai').expect,
	Logger = require('../src/logger');


// Element logging
describe('Element', function () {

	// Log
	it('Should return a properly formatted document log.', function () {
		var logger = new Logger({
				target: 'document'
			}),
			log = logger.log('A document log. [anonymous@Context.');
		// expect(log).to.contain('A document log. [anonymous@Context.');
	});

	// Error
	it('Should return a properly formatted document error.', function () {
		var logger = new Logger({
				target: 'document'
			}),
			error = logger.error('A document error. [anonymous@Context.');
		// expect(error).to.contain('A document error. [anonymous@Context.');
	});

	// Warn
	it('Should return a properly formatted document warn.', function () {
		var logger = new Logger({
				target: 'document'
			}),
			warn = logger.warn('A document warn. [anonymous@Context.');
		// expect(warn).to.contain('A document warn. [anonymous@Context.');
	});

	// Info
	it('Should return a properly formatted document info.', function () {
		var logger = new Logger({
				target: 'document'
			}),
			info = logger.info('A document info. [anonymous@Context.');
		// expect(info).to.contain('A document info. [anonymous@Context.');
	});

	// Debug
	it('Should return a properly formatted document debug.', function () {
		var logger = new Logger({
				target: 'document'
			}),
			debug = logger.debug('A document debug. [anonymous@Context.');
		// expect(debug).to.contain('A document debug. [anonymous@Context.');
	});

	// Table
	it('Should return a properly formatted document table.', function () {
		var logger = new Logger({
				target: 'document'
			}),
			table = logger.table('A document table. [anonymous@Context.');
		// expect(table).to.contain('A document table. [anonymous@Context.');
	});
});