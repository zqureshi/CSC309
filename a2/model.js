/*
    blogs(
        blog     VARCHAR(63) PRIMARY KEY
        );
    posts (
        id,             INT    PRIMARY KEY
        liked-by,       VARCHAR(63) REFERENCES blogs(blog)
        url,            VARCHAR(70)   //will be "http://{base-hostname} -- needs to be parsed from tumblr response"
        date-created,   VARCHAR(23)
        content,        VARCHAR
        type,           VARCHAR(5) (text |image)
        count,          INT
        increment,      INT
        tracking        //I don't know how long to make this? this will be the log.
    );
*/

var sqlite3 = require('sqlite3').verbose()    /*https://github.com/developmentseed/node-sqlite3/wiki/API*/
    , fs = require('fs')
    , squel = require ("squel");

var db = new sqlite3.Database('a2db.sqlite3', function(err){
    if (err){
        throw 'error creating db'
    }
    createTables();
});


function createTables(){

    db.run("CREATE TABLE IF NOT EXISTS blogs (blog VARCHAR(63) PRIMARY KEY)", function(err){
        if(err){
            throw 'error making table blogs'
        }
        //TODO create posts table
    });
}

/** Returns true if the blog is already being tracked by the db, false otherwise.
 *
 * @param blog
 */
exports.isFollowed = function(blog){

    var q = squel.select()
            .from("blogs")
            .where("blog = '" + blog + "'").toString();

    var row = db.get(q, function(err, row){
        if (err){
            throw 'look up error'
        }
        return row;
    });
   return row != undefined;
}

/** Adds a blog to be tracked to the database. Assumes blog is a valid domain and
 * not yet in the database. Returns true if successful, else throws an error.
 *
 * @param  blog
 */
exports.follow = function(blog){

    var q = squel.insert()
               .into("blogs")
               .set("blog",blog).toString();
               /* INSERT INTO blogs (blog) VALUES({blog})*/

    db.run(q, function(err){
           if(err){
              throw " Insertion Error"
           };
        });
        return true;
}


/** Returns the {limit} most recent posts liked by {blog}, sorted by
 * date created regardless of popularity. Assumes {blog} is a tracked blog.
 *
 * @param {int} limit
 * @param {string) blog
 */
exports.recent = function (limit, blog){
    //TODO complete

   var q = squel.select().from("posts").toString();


}

/**
 *
 * @param {int} limit
 * @param {sting} blog
 */

exports.trendingPosts = function(limit, blog){
      //TODO write trendingPosts method

}