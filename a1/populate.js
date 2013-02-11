/**
 * Populate the Topic backend.
 *//*


var request = require('request')
  , _ = require('underscore');

apiUrl = 'http://localhost:31315';
topics = [];

function postTopic(title, link) {
  request.post(apiUrl + '/topic', function(err, res, body){ if(err) throw err; }).form({'title': title, 'link': link});
}

*/
/* Clear Topics *//*

request.get(apiUrl + '/clear', function(error, response, body){
  */
/* Populate Topics *//*

  postTopic('Do Not Type "File:///" in OS X', 'http://openradar.appspot.com/13128709')
});
*/
