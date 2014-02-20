// Includes
var expect = require('chai').expect,
	Logger = require('../src/logger');


// Internal methods
describe('Internal methods', function () {

	// Write to the current target
	it('Should write to the current target.', function () {
		var logger = new Logger(),
			write = logger._write(['Write to the console.', 'With two params.'], 'log');
		expect(write[0]).to.equal('Write to the console.');
		expect(write[1]).to.equal('With two params.');
	});

	// Write to the console
	it('Should write to the console.', function () {
		var logger = new Logger(),
			consoleWrite = logger._consoleWrite(['Write to the console.', 'With two params.'], 'log');
		expect(consoleWrite[0]).to.equal('Write to the console.');
		expect(consoleWrite[1]).to.equal('With two params.');
	});

	// Write to the document
	// TODO - Write this test when we implement this feature
	it('Should write to the document.', function () {
		// var logger = new Logger(),
		// documentWrite = logger._documentWrite();
	});

	// Get a stack error
	it('Should get a stack trace.', function () {
		var logger = new Logger(),
			getStackInfo = logger._getStackInfo();
		expect(getStackInfo).to.include.keys('method', 'file', 'line', 'character');
		expect(getStackInfo.method).to.equal('anonymous');
		expect(getStackInfo.file).to.contain('Runner.runTest');
		expect(getStackInfo.line).to.be.a('number');
		expect(getStackInfo.character).to.be.a('number');
	});

	// Properly parse a stack trace for V8
	it('Should properly parse a V8 stacktrace.', function () {
		var logger = new Logger(),
			getStackInfoV8 = logger._getStackInfoV8('Error \nat L._generateStackTrace (file:///W:/Personal/logger/src/logger.js:248:15) \nat L._getStackInfo (file:///W:/Personal/logger/src/logger.js:137:20) \nat L._write (file:///W:/Personal/logger/src/logger.js:70:20) \nat L.log (file:///W:/Personal/logger/src/logger.js:298:15) \nat b (file:///W:/Personal/logger/src/logger.js:354:10) \nat a (file:///W:/Personal/logger/src/logger.js:356:2) \nat file:///W:/Personal/logger/src/logger.js:358:1');
		expect(getStackInfoV8).to.deep.equal({
			method: 'b',
			file: 'file:///W:/Personal/logger/src/logger.js',
			line: 354,
			character: 10
		});
	});

	// Properly parse an anonymous stack trace for V8
	it('Should properly parse an anonymous V8 stacktrace.', function () {
		var logger = new Logger(),
			getStackInfoV8 = logger._getStackInfoV8('Error \nat L._generateStackTrace (file:///W:/Personal/logger/src/logger.js:248:15) \nat L._getStackInfo (file:///W:/Personal/logger/src/logger.js:137:20) \nat L._write (file:///W:/Personal/logger/src/logger.js:70:20) \nat L.log (file:///W:/Personal/logger/src/logger.js:298:15) \nat <anonymous>:2:8 \nat Object.InjectedScript._evaluateOn (<anonymous>:603:39) \nat Object.InjectedScript._evaluateAndWrap (<anonymous>:562:52) \nat Object.InjectedScript.evaluate (<anonymous>:481:21)');
		expect(getStackInfoV8).to.deep.equal({
			method: 'anonymous',
			file: '<anonymous>',
			line: 2,
			character: 8
		});
	});

	// Properly parse a stack trace for SpiderMonkey
	it('Should properly parse a SpiderMonkey stacktrace.', function () {
		var logger = new Logger(),
			getStackInfoSpiderMonkey = logger._getStackInfoSpiderMonkey('L.prototype._generateStackTrace@file:///W:/Personal/logger/src/logger.js:248\nL.prototype._getStackInfo@file:///W:/Personal/logger/src/logger.js:137\nL.prototype._write@file:///W:/Personal/logger/src/logger.js:70\nL.prototype.log@file:///W:/Personal/logger/src/logger.js:298\n@file:///W:/Personal/logger/src/logger.html:14\n');
		expect(getStackInfoSpiderMonkey).to.deep.equal({
			method: 'anonymous',
			file: 'file:///W:/Personal/logger/src/logger.html',
			line: 14,
			character: undefined
		});
	});

	// Properly parse an anonymous stack trace for SpiderMonkey
	it('Should properly parse an anonymous SpiderMonkey stacktrace.', function () {
		var logger = new Logger(),
			getStackInfoSpiderMonkey = logger._getStackInfoSpiderMonkey('L.prototype._generateStackTrace@file:///W:/Personal/logger/src/logger.js:251 \nL.prototype._getStackInfo@file:///W:/Personal/logger/src/logger.js:137 \nL.prototype._write@file:///W:/Personal/logger/src/logger.js:70 \nL.prototype.log@file:///W:/Personal/logger/src/logger.js:301 \n@debugger eval code:1');
		expect(getStackInfoSpiderMonkey).to.deep.equal({
			method: 'anonymous',
			file: 'debugger eval code',
			line: 1,
			character: undefined
		});
	});

	// Properly parse a stack trace for Chakra (IE)
	it('Should properly parse a Chakra stacktrace.', function () {
		var logger = new Logger(),
			getStackInfoChakra = logger._getStackInfoChakra('ReferenceError: \'is\' is undefined \nat _generateStackTrace (file:///W:/Personal/logger/src/logger.js:255:5) \nat _getStackInfo (file:///W:/Personal/logger/src/logger.js:137:3) \nat _write (file:///W:/Personal/logger/src/logger.js:70:4) \nat log (file:///W:/Personal/logger/src/logger.js:301:3) \nat b (file:///W:/Personal/logger/src/logger.js:357:3) \nat a (file:///W:/Personal/logger/src/logger.js:359:2) \nat Global code (file:///W:/Personal/logger/src/logger.js:361:1)');
		expect(getStackInfoChakra).to.deep.equal({
			method: 'b',
			file: 'file:///W:/Personal/logger/src/logger.js',
			line: 357,
			character: 3
		});
	});

	// Properly parse an anonymous stack trace for Chakra (IE)
	it('Should properly parse an anonymous Chakra stacktrace.', function () {
		var logger = new Logger(),
			getStackInfoChakra = logger._getStackInfoChakra('ReferenceError: \'is\' is undefined \nat _generateStackTrace (file:///W:/Personal/logger/src/logger.js:255:5) \nat _getStackInfo (file:///W:/Personal/logger/src/logger.js:137:3) \nat _write (file:///W:/Personal/logger/src/logger.js:70:4) \nat log (file:///W:/Personal/logger/src/logger.js:301:3) \nat eval code (eval code:1:1) \nat Global code (Unknown script code:5:1)\n');
		expect(getStackInfoChakra).to.deep.equal({
			method: 'anonymous',
			file: 'eval code (eval code',
			line: 1,
			character: 1
		});
	});

	// Properly generate a stack trace
	it('Should generate a stack trace', function () {
		var logger = new Logger(),
			generateStackTrace = logger._generateStackTrace();
		expect(generateStackTrace).is.a('string');
	});
});