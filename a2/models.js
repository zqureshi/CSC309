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
    blog: { type: Sequelize.STRING, primaryKey: true }
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
Models.prototype.addBlog = function(blogName) {
  return this.Blog.create({
    blog: blogName
  });
}

/**
 * List all blogs.
 */
Models.prototype.getBlogs = function() {
  return this.Blog.all();
}
