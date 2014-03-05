// Packages to use
var gulp = require('gulp'),
	gutil = require('gulp-util'),
	uglify = require('gulp-uglify'),
	usemin = require('gulp-usemin'),
	browserify = require('gulp-browserify'),
	clean = require('gulp-clean'),
	stylus = require('gulp-stylus'),
	mocha = require('gulp-mocha'),
	lr = require('tiny-lr')(),
	livereload = require('gulp-livereload'),
	embedlr = require('gulp-embedlr'),
	open = require('gulp-open'),
	connect = require('connect'),
	http = require('http'),
	through = require('through2');


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
gulp.task('browserify', ['clean'], function () {

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
gulp.task('usemin', ['browserify', 'stylus'], function () {

	console.log('Usemin');
	gulp.src(source + '/*.html')
		.pipe(usemin())
		.pipe(embedlr({
			port: lrPort
		}))
		.pipe(gulp.dest(dest))
		.pipe(livereload(lr));
});


// Usemin build
gulp.task('usemin-build', ['browserify', 'stylus'], function () {

	console.log('Usemin');
	gulp.src(source + '/*.html')
		.pipe(usemin())
		.pipe(gulp.dest(dest));
});


// Uglify
gulp.task('uglify', ['browserify', 'stylus'], function () {

	console.log('Uglify');
	gulp.src([dest + '/index.js']).pipe(uglify()).pipe(gulp.dest(dest));
});


// Stylus
gulp.task('stylus', ['clean'], function () {

	console.log('Stylus');
	gulp.src(source + '/index.styl')
		.pipe(stylus({
			use: ['nib']
		}))
		.pipe(gulp.dest(dest))
		.pipe(livereload(lr));
});


// Copy
gulp.task('copy', ['clean'], function () {

	console.log('Copy');
	gulp.src([source + '/element-test.js'])
		.pipe(gulp.dest(dest));
});


// Server setup task
gulp.task('server-setup', ['default'], function () {

	console.log('Starting server...');
	connect().use(livereload({
		port: lrPort
	}))
	.use(connect.static(dest))
	.listen(port);
});


// Server launch task
gulp.task('server', ['server-setup', 'default'], function () {

	console.log('Opening window...');
	gulp.src('./package.json')
		.pipe(open('', {
			url: 'http://' + host + ':' + port + '/'
		}));
});


// Development
gulp.task('dev', ['default', 'server'], function () {

	// Livereload server
	lr.listen(lrPort, function (err) {

		// Stop on error
		if (err) {
			return console.log(err);
		}

		// Watch files
		gulp.watch(source + '/**/*', ['clean', 'browserify', 'usemin', 'stylus', 'copy']);
	});
});


// Default
gulp.task('default', ['clean', 'test', 'browserify', 'usemin', 'stylus', 'copy'], function () {

	// Stop the server
	gulp.on('close', function () {
		console.log('Goodbye.');
		process.exit(1);
	});
});


// Build
gulp.task('build', ['clean', 'test', 'browserify', 'usemin-build', 'stylus', 'copy', 'uglify'], function () {

	console.log('Building...');
});