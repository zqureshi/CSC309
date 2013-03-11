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
    name: { type: Sequelize.STRING, primaryKey: true }
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
 * @param blogName
 */
exports.addBlog = function(blogName) {
  return this.Blog.create({
    name: blogName
  });
}

/**
 * List all blogs.
 */
exports.getBlogs = function() {
  return this.Blog.all();
}

Models.prototype.getTrends = function(blog, order, limit){
    //TODO: implement me.
}
