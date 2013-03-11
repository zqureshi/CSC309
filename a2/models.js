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
    likedBy: { type: Sequelize.STRING },
    url: { type: Sequelize.STRING },
    datePosted: { type: Sequelize.DATE },
    content: {type: Sequelize.STRING},
    type: {type: Sequelize.STRING },// ('text'|'image')
    count: {type: Sequelize.INTEGER},
    increment: {type: Sequelize.INTEGER},
    // { [ { "timestamp": <time-tracked>, "sequence": <int>,
    // "increment": <int>, "count": <int>}, {...}, ...]}
    tracking: { type: Sequelize.TEXT }
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
};
