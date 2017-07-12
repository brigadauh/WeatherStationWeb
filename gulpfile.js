var gulp = require( 'gulp' ) ;
var nunjucksRender = require( 'gulp-nunjucks-render' ) ;
var browserSync   = require('browser-sync').create();
var httpProxy     = require('http-proxy');

var reload = browserSync.reload;

var PATH = {
    src: {
      baseDir: 'src',
      STYLES: 'src/styles',
      SCRIPTS: 'src/scripts',
      IMAGES: 'src/images'
    },
    dst: {
      baseDir: 'dist',
      STYLES: 'dist/styles',
      SCRIPTS: 'dist/scripts',
      IMAGES: 'dist/images'
    }
} ;
var TEMPL = PATH.src.baseDir+'/templates';

gulp.task('serve', ['html', 'styles', 'scripts','images','misc'], function() {
  const proxy = httpProxy.createProxyServer({
    target: 'http://192.168.1.3:8888',
    changeOrigin: true,
    secure: false
  });
  proxy.on (
      'error',
      function(err,req,res)
      {
          res.writeHead(500, {'Content-Type': 'text/plain'});
          res.end('Cannot connect to wapi server');

      }
  )

  browserSync.init({
    notify: false,
    open: false,
    port: 9000,
    server: {
      baseDir: [PATH.dst.baseDir, PATH.src.baseDir],
      routes: {
        // '/bower_components': 'bower_components'
      }
    },
    middleware: function(req, res, next) {
      if (req.url.indexOf('api') !== -1) {
        var p = proxy.web(req, res);
        return;
      }

      return next();
    }
  });
  gulp.watch(PATH.src.baseDir+"/*.html").on('change', reload);
  gulp.watch(PATH.src.SCRIPTS+"/*.js",['scripts']);
  gulp.watch(PATH.src.SCC+"/*.css",['styles']);
});
gulp.task('styles', function() {
    return gulp.src(PATH.src.STYLES+"/*.css")
        .pipe(gulp.dest(PATH.dst.STYLES))
        .pipe(reload({stream: true}));
});
gulp.task('scripts', function() {
    return gulp.src(PATH.src.SCRIPTS+"/*.js")
        .pipe(gulp.dest(PATH.dst.SCRIPTS))
        .pipe(reload({stream: true}));
});
gulp.task('images',function() {
    return gulp.src(PATH.src.IMAGES+"/*.*")
        .pipe(gulp.dest(PATH.dst.IMAGES));
});
gulp.task( 'html', function() {
    return gulp.src( [PATH.src.baseDir + '/**.+(html|nunjucks)' ] )
    .pipe( nunjucksRender({path: [TEMPL]}) )
    .pipe( gulp.dest( PATH.dst.baseDir ) ) ;
} ) ;
gulp.task('misc', function(){
    return gulp.src([PATH.src.baseDir+'/favicon.ico'])
        .pipe(gulp.dest( PATH.dst.baseDir ) ) ;
});
