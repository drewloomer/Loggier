// Includes
var chai = require('chai'),
	cheerio = require('cheerio'),
	expect = chai.expect,
	Loggier = require('../src/index');


// New suite
describe('Loggier', function () {

	// Fake the environment
	beforeEach(function () {

		// Elements to stub in
		body = cheerio('<body />');
		body[0].className = '';

		// Stub of the document
		document = {
			body: body[0]
		};
	});

	var helpers = {
			'stack-parser': require('./helpers/stack-parser')
		},
		targets = {
			'console': require('./targets/console'),
			'element': require('./targets/element')
		},
		general = require('./general'),
		internal = require('./internal');
});