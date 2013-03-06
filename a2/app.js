
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , controller = require('./controller');

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
app.get('/blog/:baseHostname/trends', controller.getTrends);
app.get('/blogs/trends', controller.getTrends);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
