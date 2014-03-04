// Includes
var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sinonChai = require('sinon-chai'),
	cheerio = require('cheerio'),
	StackParser = require('../../src/helpers/stack-parser');


// Stack parser methods
describe('Stack parser methods', function () {

	// Get a stack error
	it('Should get a stack trace.', function () {
		var stackParser = new StackParser(),
			getInfo = stackParser.getInfo();
		expect(getInfo).to.include.keys('method', 'file', 'line', 'character');
		expect(getInfo.method).to.equal('anonymous');
		expect(getInfo.file).to.contain('Runner.runTest');
		expect(getInfo.line).to.be.a('number');
		expect(getInfo.character).to.be.a('number');
	});

	// Properly parse a stack trace for V8
	it('Should properly parse a V8 stacktrace.', function () {
		var stackParser = new StackParser(),
			getInfoV8 = stackParser._getInfoV8('Error \nat L._generateStackTrace (file:///W:/Personal/stackParser/src/stackParser.js:248:15) \nat L._getInfo (file:///W:/Personal/stackParser/src/stackParser.js:137:20) \nat L._write (file:///W:/Personal/stackParser/src/stackParser.js:70:20) \nat L.log (file:///W:/Personal/stackParser/src/stackParser.js:298:15) \nat b (file:///W:/Personal/stackParser/src/stackParser.js:354:10) \nat a (file:///W:/Personal/stackParser/src/stackParser.js:356:2) \nat file:///W:/Personal/stackParser/src/stackParser.js:358:1');
		expect(getInfoV8).to.deep.equal({
			method: 'b',
			file: 'file:///W:/Personal/stackParser/src/stackParser.js',
			line: 354,
			character: 10
		});
	});

	// Properly parse an anonymous stack trace for V8
	it('Should properly parse an anonymous V8 stacktrace.', function () {
		var stackParser = new StackParser(),
			getInfoV8 = stackParser._getInfoV8('Error \nat L._generateStackTrace (file:///W:/Personal/stackParser/src/stackParser.js:248:15) \nat L._getInfo (file:///W:/Personal/stackParser/src/stackParser.js:137:20) \nat L._write (file:///W:/Personal/stackParser/src/stackParser.js:70:20) \nat L.log (file:///W:/Personal/stackParser/src/stackParser.js:298:15) \nat <anonymous>:2:8 \nat Object.InjectedScript._evaluateOn (<anonymous>:603:39) \nat Object.InjectedScript._evaluateAndWrap (<anonymous>:562:52) \nat Object.InjectedScript.evaluate (<anonymous>:481:21)');
		expect(getInfoV8).to.deep.equal({
			method: 'anonymous',
			file: '<anonymous>',
			line: 2,
			character: 8
		});
	});

	// Properly parse a stack trace for SpiderMonkey
	it('Should properly parse a SpiderMonkey stacktrace.', function () {
		var stackParser = new StackParser(),
			getInfoSpiderMonkey = stackParser._getInfoSpiderMonkey('L.prototype._generateStackTrace@file:///W:/Personal/stackParser/src/stackParser.js:248\nL.prototype._getInfo@file:///W:/Personal/stackParser/src/stackParser.js:137\nL.prototype._write@file:///W:/Personal/stackParser/src/stackParser.js:70\nL.prototype.log@file:///W:/Personal/stackParser/src/stackParser.js:298\n@file:///W:/Personal/stackParser/src/stackParser.html:14\n');
		expect(getInfoSpiderMonkey).to.deep.equal({
			method: 'anonymous',
			file: 'file:///W:/Personal/stackParser/src/stackParser.html',
			line: 14,
			character: undefined
		});
	});

	// Properly parse an anonymous stack trace for SpiderMonkey
	it('Should properly parse an anonymous SpiderMonkey stacktrace.', function () {
		var stackParser = new StackParser(),
			getInfoSpiderMonkey = stackParser._getInfoSpiderMonkey('L.prototype._generateStackTrace@file:///W:/Personal/stackParser/src/stackParser.js:251 \nL.prototype._getInfo@file:///W:/Personal/stackParser/src/stackParser.js:137 \nL.prototype._write@file:///W:/Personal/stackParser/src/stackParser.js:70 \nL.prototype.log@file:///W:/Personal/stackParser/src/stackParser.js:301 \n@debugger eval code:1');
		expect(getInfoSpiderMonkey).to.deep.equal({
			method: 'anonymous',
			file: 'debugger eval code',
			line: 1,
			character: undefined
		});
	});

	// Properly parse a stack trace for Chakra (IE)
	it('Should properly parse a Chakra stacktrace.', function () {
		var stackParser = new StackParser(),
			getInfoChakra = stackParser._getInfoChakra('ReferenceError: \'is\' is undefined \nat _generateStackTrace (file:///W:/Personal/stackParser/src/stackParser.js:255:5) \nat _getInfo (file:///W:/Personal/stackParser/src/stackParser.js:137:3) \nat _write (file:///W:/Personal/stackParser/src/stackParser.js:70:4) \nat log (file:///W:/Personal/stackParser/src/stackParser.js:301:3) \nat b (file:///W:/Personal/stackParser/src/stackParser.js:357:3) \nat a (file:///W:/Personal/stackParser/src/stackParser.js:359:2) \nat Global code (file:///W:/Personal/stackParser/src/stackParser.js:361:1)');
		expect(getInfoChakra).to.deep.equal({
			method: 'b',
			file: 'file:///W:/Personal/stackParser/src/stackParser.js',
			line: 357,
			character: 3
		});
	});

	// Properly parse an anonymous stack trace for Chakra (IE)
	it('Should properly parse an anonymous Chakra stacktrace.', function () {
		var stackParser = new StackParser(),
			getInfoChakra = stackParser._getInfoChakra('ReferenceError: \'is\' is undefined \nat _generateStackTrace (file:///W:/Personal/stackParser/src/stackParser.js:255:5) \nat _getInfo (file:///W:/Personal/stackParser/src/stackParser.js:137:3) \nat _write (file:///W:/Personal/stackParser/src/stackParser.js:70:4) \nat log (file:///W:/Personal/stackParser/src/stackParser.js:301:3) \nat eval code (eval code:1:1) \nat Global code (Unknown script code:5:1)\n');
		expect(getInfoChakra).to.deep.equal({
			method: 'anonymous',
			file: 'eval code (eval code',
			line: 1,
			character: 1
		});
	});

	// Properly generate a stack trace
	it('Should generate a stack trace', function () {
		var stackParser = new StackParser(),
			generateStackTrace = stackParser._generateStackTrace();
		expect(generateStackTrace).is.a('string');
	});
});