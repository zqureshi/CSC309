/**
 * Module dependencies
 */

var models = require('./models')
  , request = require('request')
  , format = require('util').format;

/**
 * Tumblr configuration
 *
 * @type {string}
 */
var API_KEY = 'i8sgnI5lLiJoLWOcHDfui5beoTMFBdJbOHxU7yeidZQ310Z8nJ'
  , API_LIMIT = 50
  , LIKES_URL = 'http://api.tumblr.com/v2/blog/%s/likes?api_key=%s&limit=%s';

/**
 * Expose Tracker.
 *
 * @type {Function}
 */
exports = module.exports = Tracker;

/**
 * Schedule an update of tumblr blogs every 'interval' seconds.
 *
 * @param interval
 * @param initialUpdate
 * @constructor
 */
function Tracker(interval, initialUpdate) {
  /* Track once at startup and then at every interval */
  initialUpdate && trackBlogs();
  setInterval(trackBlogs, interval * 1000);
}

/**
 * Fetch all followed blogs from db and update each one.
 */
function trackBlogs() {
  models.getBlogs().success(function(blogs) {
    for(var i = 0; i < blogs.length; i++) {
      updateBlog(blogs[i].blogName);
    };
  });
}

/**
 * Fetch likes for given blogName and update tracking info for each post liked.
 *
 * @param blogName
 */
function updateBlog(blogName) {
  console.log('Updating ', blogName);
  request.get(format(LIKES_URL, blogName, API_KEY, API_LIMIT), function(err, res, body) {
    if(!err && res.statusCode == 200) {
      var likedPosts = JSON.parse(body).response.liked_posts;
      for(var i = 0; i < likedPosts.length; i++) {
        models.trackPost(blogName, likedPosts[i]);
      };
    } else {
      console.log(format('Error %s while fetching %s!', res.statusCode, blogName));
    }
  });
}
