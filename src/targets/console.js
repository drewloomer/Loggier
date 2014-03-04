/**
 * Constructor
 * @param {Object} params
 */
function ConsoleTarget (params) {

}
ConsoleTarget.prototype.constructor = ConsoleTarget;


/**
 * Write to the console
 * @param {Array} args
 * @param {String} method
 */
ConsoleTarget.prototype.write = function (args, method) {

	// Make sure there is a console
	if (console) {

		// If there is no method, revert to log
		if (!console[method]) {

			if (!console.log) {
				return;
			}
			else {
				method = 'log';
			}
		}

		// Apply will maintain context, but is not always available
		if (console[method].apply) {
			console[method].apply(console, args);
		}
		else {
			console[method](args);
		}

		return args;
	}
};


module.exports = ConsoleTarget;