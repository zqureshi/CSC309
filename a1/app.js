var http = require('http')
  , path = require('path')
  , url = require('url')
  , qs = require('querystring')
  , fs = require('fs')
  , topic = require('./topic');

/**
 * Create a new Route object.
 *
 * @param {RegExp} path
 * @param {String []} keys
 * @param {Function} callback
 * @constructor
 */
function Route(path, keys, callback) {
  this.path = path;
  this.keys = keys;
  this.callback = callback;
}

/* Routes for REST API */
var routes = {
  GET: [
    new Route(/^\/topic\/?$/i, [], topic.list),
    new Route(/^\/topic\/([^/]+?)\/?$/i, ['tid'], topic.get),
    new Route(/^\/clear\/?$/i, [], topic.clear)
  ],

  POST: [
    new Route(/^\/topic\/?$/i, [], topic.new),
    new Route(/^\/topic\/([^/]+?)\/reply\/?$/i, ['tid'], topic.reply),
    new Route(/^\/topic\/([^/]+?)\/reply\/([^/]+?)\/?$/i, ['tid', 'rid'], topic.reply),
    new Route(/^\/topic\/([^/]+?)\/reply\/([^/]+?)\/upvote\/?$/i, ['tid', 'rid'], topic.upvote)
  ]
};

/* MIME Types for Static Files */
var MIME_TYPES = {
  html: 'text/html',
  css: 'text/css',
  js: 'application/javascript',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png'
};

/**
 * Object which mimics the express {request} object.
 *
 * @param {ServerRequest} req
 * @constructor
 */
function Request(req) {
  this.req = req;
  this.params = {};
  this.body = {};
}

/**
 * Object which mimics the express {response} object.
 *
 * @param {ServerResponse} res
 * @constructor
 */
function Response(res) {
  this.res = res;
}

/**
 * Send a JSON response back to client.
 *
 * @param {Mixed} obj or status
 * @param {Mixed} obj
 */
Response.prototype.json = function(obj) {
  var res = this.res;

  var data = obj;
  if(arguments.length == 2) {
    res.statusCode = arguments[0];
    data = arguments[1];
  }

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

/**
 * Handle HTTP Requests and route to functions.
 *
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 */
function router(req, res) {
  var request = new Request(req)
    , response = new Response(res)
    , body = '';

  req.on('data', function(chunk) {
    body += chunk;
  });

  var candidates = routes[req.method];
  for(var i = 0; i < candidates.length; i++) {
    var match = candidates[i].path.exec(url.parse(req.url).pathname);

    if (!match) continue;

    for(var j = 0; j < candidates[i].keys.length; j++) {
      request.params[candidates[i].keys[j]] = match[j+1];
    }

    req.on('end', function() {
      request.body = qs.parse(body);
      console.log('Matched ' + req.method + ': ' + match.input + ' -> ' + candidates[i].path);
      candidates[i].callback(request, response);
    });

    return;
  }

  /* If no route matched, then serve static content */
  var file = url.parse(req.url).pathname;
  fs.readFile(path.join('./public', file == '/' ? 'index.html' : file), function(err, data){
    if (err) {
      response.json(404, {error: 'Not Found'});
      return;
    }

    console.log('Serving Static: ' + file);
    res.setHeader('Content-Type', MIME_TYPES[path.extname(file).slice(1) || 'text/plain']);
    res.end(data);
  })
}

/* Start server and listen for requests */
var PORT = process.env.PORT || 31315;
http.createServer(router).listen(PORT, function() {
  console.log('HTTP Server Listening on Port ' + PORT);
});