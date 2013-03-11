/**
 * Module Dependencies
 */

var path = require('path')
  , Sequelize = require('sequelize');

/**
 * Expose Models
 */

exports = module.exports = new Models();

/**
 * Constructor for our models that sets up db connection and syncs tables.
 *
 * @constructor
 */

function Models() {
  /**
   * Set up database connection
   */
  var sequelize = new Sequelize(null, null, null, {
    dialect: 'sqlite',
    storage: path.join(__dirname, 'db.sqlite')
  });

  /**
   * Define models for sequelize
   */
  this.Blog = sequelize.define('Blog', {
    blogName: { type: Sequelize.STRING, primaryKey: true }
  });

  this.Posts = sequelize.define('Posts', {
    id: { type: Sequelize.INTEGER, primaryKey: true },
    likedBy: Sequelize.STRING,
    url: Sequelize.STRING,
    date: Sequelize.DATE, // date posted, not current date
    text: Sequelize.STRING,
    image: Sequelize.STRING,
    type: Sequelize.STRING,
    last_track: Sequelize.DATE,
    last_count: Sequelize.INTEGER,
    increment: Sequelize.INTEGER,
    sequence: Sequelize.INTEGER,

    // { [ { "timestamp": <time-tracked>, "sequence": <int>,
    // "increment": <int>, "count": <int>}, {...}, ...]}
    tracking: Sequelize.TEXT
  });


  /**
   * Sync Database
   */
  sequelize.sync().success(function() {
    console.log('DB Sync Complete.');
  }).error(function() {
    console.log('Error in DB Sync!!');
    process.exit(1);
  });
}

/**
 * Add a new blog to database.
 *
 * @param {String} blogName 
 */
exports.addBlog = function(blogName) {
  return this.Blog.create({
    blogName: blogName
  });
}

/**
 * List all blogs.
 */
exports.getBlogs = function() {
  return this.Blog.all();
}

/**
 * Update tracking info for each fetched post.
 *
 * @param blogName
 * @param fetchedPost
 */
exports.trackPost = function(blogName, fetchedPost) {
  var self = this;

  this.Posts.find(fetchedPost.id).success(function(post) {
    if (!post) {
      /* Post doesn't exist, build it */
      post = self.Posts.build({
        id: fetchedPost.id,
        likedBy: blogName,
        url: fetchedPost.post_url,
        date: new Date(fetchedPost.date),
        type: fetchedPost.type,
        last_track: new Date(),
        last_count: fetchedPost.note_count,
        increment: 0,
        sequence: 0,
        tracking: '[]'
      });

      if(post.type == 'photo') {
        var photo = fetchedPost.photos[0];
        post.text = photo.caption;
        post.image = photo.original_size.url;
      } else if(post.type == 'text') {
        post.text = fetchedPost.title ? fetchedPost.title + '\n' : '';
        post.text += fetchedPost.body;
      }
    }

    /* Update tracking */
    post.sequence += 1;
    post.last_track = new Date();
    post.increment = post.last_count - fetchedPost.note_count;
    post.last_count = fetchedPost.note_count;

    /**
     * TODO: Currently working around sqlite quoting bug in sequelize by replacing.
     * Submit a pull request with the fix later on and remove replace statement.
     */
    var tracking = JSON.parse(post.tracking.replace(/\\\"/g, '"'));
    tracking.unshift({
      timestamp: post.last_track,
      sequence: post.sequence,
      increment: post.increment,
      count: post.last_count
    });
    post.tracking = JSON.stringify(tracking);

    /* Save to db */
    post.save().error(function(error) {
      console.log(error);
    })
  });
}

/**
 * Returns trending posts in the specified order
 *
 * @param {String} blog the blog hostname 
 * @param {String} order 
 * @param {Number} limit
 */
exports.getTrends = function(blog, order, limit){
  var query = {
      order: ['? DESC', (order == "Trending") ? 'count' : 'datePosted'],
      limit: limit
    };
  blog && (query['where'] = ['likedBy = ?', blog]);
  return this.Posts.findAll(query);
}


/**Checks for the blog blogName in the db
 *
 * @param {String} blogName
 * @returns {*}
 */
exports.getBlog = function(blogName){
    return this.Blog.find({where: {name: blogName} })

}
