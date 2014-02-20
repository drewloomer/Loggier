// Packages to use
var gulp = require('gulp'),
	gutil = require('gulp-util'),
	uglify = require('gulp-uglify'),
	usemin = require('gulp-usemin'),
	clean = require('gulp-clean'),
	mocha = require('gulp-mocha');


// Directories
var source = 'src',
	tests = 'test',
	dest = 'dist';


// Server params
var host = 'localhost',
	port = 9000,
	lrPort = 35729;


// Process states
var cleaned = false;


// Clean the destination directory
gulp.task('clean', function () {

	console.log('Cleaning directory "' + dest + '".');
	return gulp.src(dest + '/', {read: false})
		.pipe(clean());
});


// Run the tests
gulp.task('test', function () {

	console.log('Running tests.');
	return gulp.src([tests + '/main.js', source + '/logger.js'])
		.pipe(mocha({
			reporter: 'spec'
		}));
});


// Development
gulp.task('default', ['clean', 'test'], function () {

	// Stop the server
	gulp.on('close', function () {
		console.log('Goodbye.');
		process.exit(1);
	});
});