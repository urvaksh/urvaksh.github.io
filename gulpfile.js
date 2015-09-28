var gulp = require('gulp'),
  sourcemaps = require('gulp-sourcemaps'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
  browserify = require('browserify'),
  watchify = require('watchify'),
  babel = require('babelify'),
  sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  browserSync = require('browser-sync'),
  reload = browserSync.reload,
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  filter = require('gulp-filter'),
  rev = require('gulp-rev'),
  resolve = require('resolve'),
  del = require('del');

// ////////////////////////////////////////////////
// Config
// // /////////////////////////////////////////////
var config = {
  globs : {
    staticFiles: ['src/**/*.html','src/**/*.md'],
    js : ['src/js/**/*.js'],
    sass : 'src/scss/style.scss' 
  },
  jsMain : './src/js/main.js',
  jsBundle : 'app.js'
};

// ////////////////////////////////////
// Utilities
// ////////////////////////////////////
function getNPMPackageIds() {
  // read package.json and get dependencies' package ids
  var packageManifest = {};
  try {
    packageManifest = require('./package.json');
  } catch (e) {
    // does not have a package.json manifest
  }
  return Object.keys(packageManifest.dependencies) || [];
}

function bundle(name, b) {
  return b.bundle().pipe(source(name))
  //.pipe(rename(name.substring(0, name.lastIndexOf('.js')) + '.min.js'))
  .pipe(buffer())
  .pipe(sourcemaps.init({ loadMaps: true }))
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest('./build'));
}


  // ////////////////////////////////////////////////
  // Log Errors
  // // /////////////////////////////////////////////

  function errorlog(err){
  	console.log(err.message);
  	this.emit('end');
  }

  // ////////////////////////////////////////////////
// Scripts Tasks
// ///////////////////////////////////////////////

gulp.task('scripts', function() {


  var b = browserify({debug: true})
  .require('./src/js/main.js', {entry: true})
  .transform(babel);

  getNPMPackageIds().forEach(function(id) {
    console.log(id);
    b.external(id);
  });

  return bundle(config.jsBundle, b);

});

gulp.task('vendor', function() {
  var b = browserify({debug: false});

  getNPMPackageIds().forEach(function(id) {
    b.require(resolve.sync(id), {expose: id});
  });

  return bundle('vendor.js', b);
});

gulp.task('scripts_old', function() {
  return browserify(config.jsMain, { debug: true })

  .transform(babel)
  .bundle()
  .on('error', function(err) { console.error(err); this.emit('end'); })
  .pipe(source(config.jsBundle))
  .pipe(buffer())
  .pipe(sourcemaps.init({ loadMaps: true }))
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest('./build'));

});

// ////////////////////////////////////////////////
// Styles Tasks
// ///////////////////////////////////////////////

gulp.task('styles', function() {
	gulp.src(config.globs.sass)
  .pipe(sourcemaps.init())
  .pipe(sass({outputStyle: 'compressed'}))
  .on('error', errorlog)
  .pipe(autoprefixer({
   browsers: ['last 3 versions'],
   cascade: false
 }))
  .pipe(sourcemaps.write('../maps'))
  .pipe(gulp.dest('build/css'))
  .pipe(reload({stream:true}));
});


// ////////////////////////////////////////////////
// HTML Tasks
// // /////////////////////////////////////////////

gulp.task('html', function(){
  gulp.src(config.globs.staticFiles)
  .pipe(gulp.dest('build'))
  .pipe(reload({stream:true}));
});

// ////////////////////////////////////////////////
// Browser-Sync Tasks
// // /////////////////////////////////////////////

gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: "./build/"
    }
  });
});

// task to run build server for testing final app
gulp.task('build:serve', function() {
  browserSync({
    server: {
      baseDir: "./build/"
    }
  });
});
// ////////////////////////////////////////////////
// Build Tasks
// // /////////////////////////////////////////////

// clean out all files and folders from build folder
gulp.task('build:cleanfolder', function (cb) {
	del([
		'build/**'
   ], cb);
});

// task to create build directory of all files
gulp.task('build:copy', ['build:cleanfolder'], function(){
  return gulp.src('src/**/*/')
  .pipe(gulp.dest('build/'));
});


gulp.task('build', ['build:copy']);


// ////////////////////////////////////////////////
// Watch Tasks
// // /////////////////////////////////////////////

gulp.task ('watch', ['default','browser-sync'], function(){
	gulp.watch(config.globs.scss, ['styles']);
	gulp.watch(config.globs.js, ['scripts']);
 gulp.watch(config.globs.staticFiles, ['html']);
});

// ////////////////////////////////////////////////
// Default Task
// // /////////////////////////////////////////////

gulp.task('default', ['vendor','scripts', 'styles', 'html']);
/*
function compile(watch) {
  var bundler = watchify(browserify('./js/main.js', { debug: true }).transform(babel));

  function rebundle() {
    bundler.bundle()
      .on('error', function(err) { console.error(err); this.emit('end'); })
      .pipe(source('build.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./build'));
  }

  if (watch) {
    bundler.on('update', function() {
      console.log('-> bundling...');
      rebundle();
    });
  }

  rebundle();
}

function watch() {
  return compile(true);
};

gulp.task('build', function() { return compile(); });
gulp.task('watch', function() { return watch(); });

gulp.task('default', ['watch']);
*/
