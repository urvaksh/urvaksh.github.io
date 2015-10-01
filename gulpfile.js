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
uglify = require('gulp-uglify'),
//filter = require('gulp-filter'),
//rev = require('gulp-rev'),
resolve = require('resolve'),
del = require('del'),
args   = require('yargs').argv,
 gulpif = require('gulp-if');

// ////////////////////////////////////////////////
// Config
// // /////////////////////////////////////////////
var config = {
  globs : {
    staticFiles: ['src/*.html','src/**/*.html','src/**/*.json'],
    js : ['src/js/**/*.js'],
    sass : 'src/scss/style.scss'
  },
  jsMain : './src/js/main.js',
  jsBundle : 'js/app.js',
  jsVendorBundle : 'js/vendor.js',
  buildDir : './projects'
};

// ////////////////////////////////////
// Utility functions for Browserify
// ////////////////////////////////////

function identity (e){
  return e;
}

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
* npmBundling empty, null or undefined => bundle all, vendor=> Only NPM (vendor), app=> Only local (app)
*/
function initBrowserify(options, transformer, npmBundling){
  options = options || {};

  var b = browserify(options)
  .transform(transformer);

  if(npmBundling){
    var npmPackages = getNPMPackageIds();
    if(npmBundling==='app'){
      npmPackages.forEach(function(id) {
        b.external(id);
      });
    } else if(npmBundling==='vendor'){
      npmPackages.forEach(function(id) {
        b.require(resolve.sync(id), {expose: id});
      });
    } else {
      throw "npmBundling can only have values of -1, 1 0 or be left undefined, current value is "+npmBundling;
    }
  }

  return b;

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

gulp.task('scripts:app', function() {
  var self = this;
  self.createBundle = function(browserifyObj, finalName){
    return browserifyObj
    .bundle()
    .on('error', errorlog)
    .pipe(source(finalName))
    .pipe(buffer())
    //.pipe(uglify())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest(config.buildDir));
  };

//Create a browserify instance since we need to use it for both watchify and builds
var b = initBrowserify({debug: true, entries: [config.jsMain]}, babel, "app");

if(!args.nowatch){
  /*Incorporate watchify */
  console.log("watchify is watching for js changes");
  watchify(b).on('update', function(){
    console.log("Watchify Updating");
    var start = Date.now();
    self.createBundle(b, config.jsBundle)
    .pipe(reload({stream:true}));
    var end = Date.now();
    console.log("Watchify done in "+(end-start)+" ms!!");
  });
}

return this.createBundle(b, config.jsBundle);

});

gulp.task('scripts:vendor', function() {
  var b = initBrowserify({debug: false},identity,"vendor");

  return b
  .bundle()
  .on('error', errorlog)
  .pipe(source(config.jsVendorBundle))
  .pipe(buffer())
  //.pipe(uglify())
  .pipe(sourcemaps.init({ loadMaps: true }))
  .pipe(sourcemaps.write('./maps'))
  .pipe(gulp.dest(config.buildDir));

});

gulp.task('scripts', ['scripts:vendor','scripts:app']);

// ////////////////////////////////////////////////
// Styles Tasks
// ///////////////////////////////////////////////

gulp.task('styles', function() {

  //Copy over all fonts
  gulp.src('./node_modules/bootstrap/dist/fonts/*')
  .pipe(gulp.dest(config.buildDir+'/fonts'));

  return gulp.src(config.globs.sass)
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
  if(!args.nowatch){
  browserSync({
    server: {
      baseDir: config.buildDir
    },
    browser : []
  });
}
});

// ////////////////////////////////////////////////
// Default Task
// // /////////////////////////////////////////////

gulp.task('default', ['scripts', 'styles', 'html', 'browser-sync'], function(){
    //console.log("nowatch: "+(args.nowatch));

if(!args.nowatch){
    console.log("Watching for static and html changes");
    gulp.watch(config.globs.scss, ['styles']);
    gulp.watch(config.globs.staticFiles, ['html']);
}
});
