var gulp = require( 'gulp' ) ;
var nunjucksRender = require( 'gulp-nunjucks-render' ) ;
var browserSync   = require('browser-sync').create();
var httpProxy     = require('http-proxy');

var reload = browserSync.reload;

var PATH = {
    src: {
      baseDir: 'src',
      STYLES: 'src/styles',
      SCRIPTS: 'src/scripts'},
    dst: {
      baseDir: 'dist',
      STYLES: 'dist/styles',
      SCRIPTS: 'dist/scripts'
    }
} ;
var TEMPL = PATH.src.baseDir+'/templates';

gulp.task('serve', ['html', 'styles', 'scripts'], function() {
  const proxy = httpProxy.createProxyServer({
    target: 'http://192.168.1.3:8888',
    changeOrigin: true,
    secure: false
  });

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

gulp.task( 'html', function() {
    return gulp.src( PATH.src.baseDir + '/**.+(html|nunjucks)' )
    .pipe( nunjucksRender({path: [TEMPL]}) )
    .pipe( gulp.dest( PATH.dst.baseDir ) ) ;
} ) ;
