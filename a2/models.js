/**
 * Module Dependencies
 */

var path = require('path')
  , Sequelize = require('sequelize')
  , cheerio = require('cheerio');

/**
 * Expose Models
 */

exports = module.exports = Models;

/**
 * Constructor for our models that sets up db connection and syncs tables.
 *
 * @constructor
 */

function Models(init) {
  /**
   * Set up database connection
   */
  var sequelize = new Sequelize(null, null, null, {
    dialect: 'sqlite',
    storage: path.join(__dirname, 'db.sqlite'),
    logging: false
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
    text: Sequelize.TEXT,
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
    /* If callback provided then call it */
    if(init) init();
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
Models.prototype.addBlog = function(blogName) {
  return this.Blog.create({
    blogName: blogName
  });
}

/**
 * List all blogs.
 */
Models.prototype.getBlogs = function() {
  return this.Blog.all();
}

function scrapeText(html) {
  if(html) {
    return cheerio.load(html).root().text();
  } else {
    return '';
  }
}

/**
 * Update tracking info for each fetched post.
 *
 * @param blogName
 * @param fetchedPost
 */
Models.prototype.trackPost = function(blogName, fetchedPost) {
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

      switch(post.type) {
        case 'text':
        case 'chat':
          post.text = fetchedPost.title ? scrapeText(fetchedPost.title) + '\n' : '';
          post.text += scrapeText(fetchedPost.body);
          break;

        case 'photo':
          var photo = fetchedPost.photos[0];
          post.text = scrapeText(fetchedPost.caption || photo.caption);
          post.image = photo.original_size.url;
          break;

        case 'quote':
          post.text = scrapeText(fetchedPost.text);
          break;

        case 'link':
          post.text = fetchedPost.title ? scrapeText(fetchedPost.title) + '\n' : '';
          post.text += scrapeText(fetchedPost.description);
          break;

        case 'audio':
          post.text = scrapeText(fetchedPost.caption);
          post.image = fetchedPost.album_art;
          break;

        case 'video':
          post.text = scrapeText(fetchedPost.caption);
          break;

        case 'answer':
          post.text = scrapeText(fetchedPost.question) + '\n';
          post.text += scrapeText(fetchedPost.answer);
          break;
      }
    }

    /* Update tracking */
    post.sequence += 1;
    post.last_track = new Date();
    post.increment = fetchedPost.note_count - post.last_count;
    post.last_count = fetchedPost.note_count;

    var tracking = JSON.parse(scrapeText(post.tracking));
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
Models.prototype.getTrends = function(blog, order, limit){
  var trending = (order == "trending");
  var query = {
      order: ['? DESC', trending ? 'last_count' : 'date'],
      where: ["? ? ?",
                    (trending ? "" : "last_track >= date('now','-1 hour')"),
                    (!trending && blog ? "AND" : ""),
                    (blog ? "likedBy = " + blog : "")
             ],
      limit: limit
    };
  return this.Posts.findAll(query);
};

/**Checks for the blog blogName in the db
 *
 * @param {String} blogName
 * @returns {*}
 */
Models.prototype.getBlog = function(blogName){
    return this.Blog.find({where: {name: blogName} })
};
