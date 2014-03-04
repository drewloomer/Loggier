// Packages to use
var gulp = require('gulp'),
	gutil = require('gulp-util'),
	uglify = require('gulp-uglify'),
	usemin = require('gulp-usemin'),
	browserify = require('gulp-browserify'),
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


// Clean the destination directory
gulp.task('clean', function () {

	console.log('Cleaning directory "' + dest + '".');
	return gulp.src(dest + '/', {read: false})
		.pipe(clean());
});


// Run the tests
gulp.task('test', function () {

	console.log('Running tests.');
	return gulp.src([tests + '/main.js', source + '/index.js'])
		.pipe(mocha({
			reporter: 'spec'
		}));
});


// Browserify
gulp.task('browserify', ['clean', 'test'], function () {

	console.log('Browserifying scripts...');

	var stream = gulp.src(source + '/index.js')
		.pipe(browserify({
			transform: [],
			// entry: source + '/index.js',
			standalone: 'Loggier',
			debug: true
		}))
		.pipe(gulp.dest(dest));

	// After browserify success
	stream.on('postbundle', function (src) {

		console.log('Browserify complete.');
	});

	// After browserify failure
	stream.on('error', gutil.log);

	return stream;
});


// Usemin
gulp.task('usemin', ['browserify'], function () {

	gulp.src(source + '/*.html')
		.pipe(usemin({

		}))
		.pipe(gulp.dest(dest));
});


// Uglify
gulp.task('uglify', ['browserify'], function () {

	gulp.src([dest + '/index.js']).pipe(uglify()).pipe(gulp.dest(dest));
});


// Development
gulp.task('default', ['clean', 'test', 'browserify', 'usemin'], function () {

	// Stop the server
	gulp.on('close', function () {
		console.log('Goodbye.');
		process.exit(1);
	});
});


// Build
gulp.task('build', ['default', 'uglify'], function () {

	console.log('Building...');
});