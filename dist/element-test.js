var logTest = new Loggier();
logTest.target('element');
logTest.log('A general log222.');
logTest.log('A general log.', 'Extra params', {key: 'with an', key2: {nestedKey: 1, nestedKey2: 'nested value'}});