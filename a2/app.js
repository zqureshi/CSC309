
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , controller = require('./controller')
  , Models = require('./models')
  , Tracker = require('./tracker');

/**
 * Initialize database connection.
 */
var models = new Models(init);

function init() {
  var app = express();

  app.configure(function(){
    app.set('port', process.env.PORT || 31315);
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
  });

  app.configure('development', function(){
    app.use(express.errorHandler());
  });

  app.post('/blog', controller.follow);
  app.get('/blog/:blogName/trends', controller.getTrends);
  app.get('/blogs/trends', controller.getTrends);

  /* Inject models */
  Tracker.setModels(models);
  controller.setModels(models);

  /* Start tracker and update every 3600 seconds + initial update */
  var tracker = new Tracker(3600, true);

  http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
  });
}
