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
//concat = require('gulp-concat'),
uglify = require('gulp-uglify'),
//rename = require('gulp-rename'),
//filter = require('gulp-filter'),
//rev = require('gulp-rev'),
resolve = require('resolve'),
del = require('del');

// ////////////////////////////////////////////////
// Config
// // /////////////////////////////////////////////
var config = {
  globs : {
    staticFiles: ['src/**/*.html','src/**/*.md','src/data/*.*'],
    js : ['src/js/**/*.js'],
    sass : 'src/scss/style.scss'
  },
  jsMain : './src/js/main.js',
  jsBundle : 'js/app.js',
  jsVendorBundle : 'js/vendor.js',
  buildDir : './projects'
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

/**
* npmBundling 0 or undefined (any falsie)=> bundle all, -1=> Only NPM (vendor), 1=> Only local (app)
*/
function initBrowserify(options, transformer, npmBundling){
  options = options || {};

  var b = browserify(options)
  .transform(transformer);

  if(!npmBundling){
    var npmPackages = getNPMPackageIds();
    if(npmBundling===1){
      npmPackages.forEach(function(id) {
        b.external(id);
      });
    } else if(npmBundling===1){
      npmPackages.forEach(function(id) {
        b.require(resolve.sync(id), {expose: id});
      });
    } else {
      throw "npmBundling can only have values of -1, 1 0 or be left undefined";
    }
  }

  return b;

}

function bundle(name, b) {
  return b
  .bundle()
  .on('error', function(err) { console.error(err); this.emit('end'); })
  .pipe(source(name))
  .pipe(buffer())
  //.pipe(uglify())
  .pipe(sourcemaps.init({ loadMaps: true }))
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest(config.buildDir));
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

//Create a browserify instance since we need to use it for both watchify and builds
var b = initBrowserify({debug: true, entries: ['./src/js/main.js']}, babel, 1);

/*Incorporate watchify */
watchify(b).on('update', function(){
  console.log("Updating");
  var start = Date.now();
  bundle(config.jsBundle, b)
  .pipe(reload({stream:true}));
  var end = Date.now();
  console.log("Done in "+(end-start)+" ms!!");
});


return b.bundle()
.on('error', errorlog)
.pipe(source(config.jsBundle))
.pipe(buffer())
.pipe(uglify())
.pipe(sourcemaps.init({ loadMaps: true }))
.pipe(sourcemaps.write('./'))
.pipe(gulp.dest(config.buildDir));

});

gulp.task('vendor', function() {
  var b = initBrowserify({debug: false},function(a){return a;},-1);

  return b.bundle()
  .on('error', errorlog)
  .pipe(source('js/vendor.js'))
  .pipe(buffer())
  .pipe(uglify())
  .pipe(sourcemaps.init({ loadMaps: true }))
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest(config.buildDir));

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
    browsers: ['last 2 versions'],
    cascade: false
  }))
  .pipe(sourcemaps.write('../maps'))
  .pipe(gulp.dest(config.buildDir+'/css'))
  .pipe(reload({stream:true}));
});


// ////////////////////////////////////////////////
// HTML Tasks
// // /////////////////////////////////////////////

gulp.task('html', function(){
  gulp.src(config.globs.staticFiles)
  .pipe(gulp.dest(config.buildDir))
  .pipe(reload({stream:true}));
});

// ////////////////////////////////////////////////
// Browser-Sync Tasks
// // /////////////////////////////////////////////

gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: config.buildDir
    }
  });
});

// task to run build server for testing final app
gulp.task('build:serve', function() {
  browserSync({
    server: {
      baseDir: config.buildDir
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


// ////////////////////////////////////////////////
// Watch Tasks
// // /////////////////////////////////////////////

gulp.task ('watch', ['build:cleanfolder','default','browser-sync'], function(){
  gulp.watch(config.globs.scss, ['styles']);
  //gulp.watch(config.globs.js, ['scripts']); Using watchify instead
  gulp.watch(config.globs.staticFiles, ['html']);
});

// ////////////////////////////////////////////////
// Default Task
// // /////////////////////////////////////////////

gulp.task('default', ['vendor','scripts', 'styles', 'html']);
