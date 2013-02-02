
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , topic = require('./topic');

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

/**
 * Serve the application index
 */
app.get('/', function(req, res){
  res.sendfile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * Routes for Topic REST API
 */
app.get('/topic', topic.list);
app.post('/topic', topic.new);
app.get('/topic/:tid', topic.get);
app.post('/topic/:tid/reply', topic.reply);
app.post('/topic/:tid/reply/:rid', topic.reply);
app.post('/topic/:tid/reply/:rid/upvote', topic.upvote);
app.get('/clear', topic.clear);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
