% CSC309 Assignment 1
% Michael Kozakov, Natalie Morcos, Zeeshan Qureshi
% 11 Feb 2013

Requirements
============

  + Node.js
  + Request - (Used by `populate.js` to post topics / replies)
  + Express - (__optional__, to be used with `app_express.js`)

Usage
=====

Install Dependencies (Optional):

    $ npm install

Start Server:

    $ node app

Populate Data:

    $ node populate

\pagebreak

RESTful API
===========

`GET /topic`
 :    Get a listing of all the topics

`GET /topic/:tid`
 :    Get topic with given :tid.

`POST /topic`
 :    Post a new topic and return the newly created tree on success. \
      *@param* `text` The text of the Topic \
      *@param* `link` The link of the Topic

`POST /topic/:tid/upvote`
 :    Upvote a given Topic tid. \

`POST /topic/:tid/reply`
 :    Post a new reply to given Topic tid. \
      *@param* `text` The text of the Reply \

`POST /topic/:tid/reply/:rid`
 :    Post a new reply to given Reply rid. \
      *@param* `text` The text of the Reply \

`POST /topic/:tid/reply/:rid/upvote`
 :    Upvote given Reply rid. \

Project Structure
=================

The node.js app creates an HTTP server and listens for incoming request
and dispatches requests to respective methods. Most of the heavy lifting
is done by the `Route` object which takes an expression of the form
"/(path | :var)\*" and compiles it to a regular expression with
capturing groups and add to list of registered callbacks.

Now when a request comes in, it is matched successively with each of the
regexes and if successful, the captured variables are assigned values
and the callback is invoked. e.g. `/topic/0` maps to `/topic/:tid` and
when the `topics.get` method is called, the value of the variable `tid`
is set to 0.

If no route matches, then static content is served from the /public
folder and if nothing in there matches, then a 404 is returned.

The JSON data transported over the network is exactly how it's stored in
the application and there is a sample data model in `topic.js`.

`app.js`

 :    The bare node.js server that listens to HTTP requests and routes to
      methods in `topic.js`.

`topic.js`

 :    The main server logic of the REST API lives here.

`populate.js`

 :    The node.js based population script that sends RESTful API requests to
      the server.

`app_express.js`

 :    The optional express based HTTP server / router that does the same thing
      as `app.js` but with prettier console logging and more validation.
