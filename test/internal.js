// Includes
var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sinonChai = require('sinon-chai'),
	cheerio = require('cheerio'),
	Loggier = require('../src/index');


// Internal methods
describe('Internal methods', function () {

	// Write to the current target
	it('Should write to the current target.', function () {
		var loggier = new Loggier(),
			write = loggier._write(['Write to the console.', 'With two params.'], 'log');
		expect(write[0]).to.equal('Write to the console.');
		expect(write[1]).to.equal('With two params.');
	});

	// Create a string from log stack info
	it('Should create a string from log stack info.', function () {

		var loggier = new Loggier(),
			str = loggier._buildStackInfoString({
				method: 'testMethodName',
				file: 'https://localhost/test/scripts/file.js',
				line: 562,
				character: 14
			});

		expect(str).to.equal('testMethodName@https://localhost/test/scripts/file.js:562:14');
	});

	// Add a class to the body
	it('Should add the enabled class to the body.', function () {
		var loggier = new Loggier();
		loggier._addBodyClass();
		expect(document.body.className).to.contain('loggier-enabled');
	});

	// Remove a class from the body
	it('Should remove the enabled class from the body.', function () {
		var loggier = new Loggier();
		loggier._removeBodyClass();
		expect(document.body.className).to.not.contain('loggier-enabled');
	});
});