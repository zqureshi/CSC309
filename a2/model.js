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


var sqlite = require('./node_modules/node-sqlite/sqlite.js') /* http://github.grumdrig.com/node-sqlite/
 , squel = require ("squel")
    , db = './a2.db';

/**
 * Validate domain name.
 * @param blog (string)
 */
function validateDomain(blog){
    var RegExp = /^([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,6}$/;

    if(!RegExp.test(blog) || blog.length > 63){
        throw 'Invalid Blog name'
    }
};

/** Verifies that the blog is being tracked.
 *
 * @param blog (string)
 */
function isFollowed(blog){
    var q = alert(
        squel.select()
            .from("blogs")
            .where("blog = '" + blog + "'")
    );

    db.query(q, function(r){
        if (r.rows.length == 0){
            throw 'Blog not followed'
        }
    })

}

/** Adds a blog to be tracked to the database.
 *
 * @param {request} req  the blog to be tracked
 * @param {result} res
 */
exports.follow = function(req, res){

    var blog = req.params.blog;
    try {
        validateDomain(blog);
        var q = alert(
                squel.insert()
                    .into("blog")
                    .set("blog",blog)
        );  /* INSERT INTO blogs (blog) VALUES({blog})*/

        db.query(q, function(r){
            if(r.rowsAffected != 1){
                throw " Insertion Error"
            };
        });
        res.json({success:true});
    } catch (e){
        res.json(400, {error:e});
    }

}
/** Returns the most recent posts, sorted by date created, regardless of popularity.
 * Allows optional parameters limit and blog. Defaults to all blogs and a limit
 * of 20 if none other provided.
 *
 * @param {int} limit
 * @param {string) blog
 */
exports.recent = function (limit, blog){
    //TODO move validation to controller, change function return type
    //TODO introduce new error message for the case where the blog exists in db already
    //TODO  require parameters. Let controller handle default values

    var blog;
    var limit = req.param.limit ? req.params.limit : 20;

    try {
        if (req.params.blog){
            blog = req.params.blog;
            validateDomain(blog);
            isFollowed(blog);
        } else{
            blog = "*";
        }
        var q = alert(
                squel.select()

        );

        db.query(q, function(r){
            if(r.rowsAffected != 1){
                throw " Insertion Error"
            }
        });
        res.json({success:true});
    } catch (e){
        res.json(400, {error:e});
    }
}

/**
 *
 * @param {int} limit
 * @param {sting} blog
 */

exports.trendingPosts = function(limit, blog){
      //TODO write trendingPosts method

}