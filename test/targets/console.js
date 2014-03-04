// Includes
var expect = require('chai').expect,
	ConsoleTarget = require('../../src/targets/console');


// Console logging
describe('Console target', function () {

	// Write
	it('Should write to the console', function () {
		var consoleTarget = new ConsoleTarget(),
			write = consoleTarget.write(['A console log. [anonymous@Context.'], 'log');
		expect(write).to.contain('A console log. [anonymous@Context.');
	});
});