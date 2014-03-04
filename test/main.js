// Includes
var chai = require('chai'),
	expect = chai.expect,
	Loggier = require('../src/index');


// New suite
describe('Loggier', function () {

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