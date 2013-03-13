/**
 * Model will be set by setModels method.
 */
var model;

/**
 * HTTP Error Codes
 *
 * @param dbModels
 */
var BAD_REQUEST = 400
  , NOT_FOUND = 404
  , SERVER_ERROR = 500;

/**
 * Set database models.
 *
 * @param dbModels
 */
exports.setModels = function(dbModels) {
    model = dbModels;
};

/**
 * Check whether blogName is a valid domain name
 *
 * @param {String} blogName the name of the blog to be validated.
 */
function validateDomain(blogName){
    var RegExp = /^([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,6}$/;

    if(!RegExp.test(blogName) || blogName.length > 63){
        throw 'Invalid Blog name'
    }
}

/**
 * Looks for blog in the database and calls callback(req, res, row)
 *
 * @param {request} req
 * @param {response} res
 * @param {String} blog
 * @param {function} callback
 */
function findBlog(req, res, blog, callback) {
    model.getBlog(blog)
        .success(function(row){
            callback(req, res, row);
        })
        .error(function(err) {
            res.json(SERVER_ERROR, {error:err});
        });
}

/**
 * Add a blog to the db to be tracked.
 * Throw exception if blog is already tracked.
 *
 * @param {request} req
 * @param {response} res
 */
exports.follow = function(req, res) {
    var blog = req.body.blog;
    try {
        validateDomain(blog);
        var onSuccess = function(request, response, row) {
            if(row) {
                //blog already tracked --do not send to db
                response.json({success:true});
            } else {
                model.addBlog(blog).success(function() {
                    response.json({success:true});
                }).error(function(err){
                    response.json(SERVER_ERROR, {error:err})
                });
            }
        };
        findBlog(req, res, blog, onSuccess);
    }
    catch(e) {
        res.json(BAD_REQUEST, {error: e});
    }
};

/**
 * Get a list of trending or recent posts.
 * Throw exception if untracked blog is specified.
 *
 * @param {request} req
 * @param {response} res
 */
exports.getTrends = function(req, res) {
    try {
        var blogName;
        var limit = req.query.limit || 20; //defaults to 20 posts
        limit = parseInt(limit);
        if(isNaN(limit) || limit <= 0) {
            throw 'Invalid parameter: limit has to be a number'
        }


        var proceed = function(request, response, blog, lim) {
            var order = request.query.order && request.query.order.toLowerCase();
            if(order == "trending" || order == "recent") {
                model.getTrends(blog, order, lim)
                    .success(function(rows){
                        var trending = [];
                        var post;
                        var fields = ["url", "text", "image", "date", "last_track", "last_count"];
                        rows.forEach(function(row) {
                            post = {};
                            fields.forEach(function(field) {
                                post[field] = row[field];
                            });
                            post["tracking"] = JSON.parse(row["tracking"]);
                            trending.push(post);
                        });
                        response.json({"trending": trending, "order": order, "limit": lim});
                    })
                    .error(function(err) {
                        response.json(SERVER_ERROR, {error: err});
                    });
            } else {
                response.json(BAD_REQUEST, {error: 'Order not specified: pick Trending or Recent'});
            }
        };

        if (blogName = req.params.blogName){
            var onSuccess = function(request, response, row) {
                if(row) {
                    proceed(request, response, blogName, limit)
                } else {
                    response.json(NOT_FOUND, {error: 'Blog not tracked'});
                }
            };
            findBlog(req, res, blogName, onSuccess);
        }
        else {
            proceed(req, res, blogName, limit);
        }
    } catch(e) {
        res.json(BAD_REQUEST, {error: e});
    }
};

