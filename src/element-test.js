var logTest = new Loggier();

function test () {
	logTest.target('element');
	logTest.log('A general log222.');
	logTest.log('A general log.', 'Extra params', {
		key: 'with an',
		key2: {
			nestedKey: 1,
			nestedKey2: 'nested value'
		}
	});
}

test();