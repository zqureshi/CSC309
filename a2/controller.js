/**
 * Model will be set by setModels method.
 */
var model;

/**
 * Set database models.
 *
 * @param dbModels
 */
exports.setModels = function(dbModels) {
  model = dbModels;
}

/**
 * Validate domain name.
 * @param blog (string)
 */
function validateDomain(blogName){
    var RegExp = /^([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,6}$/;

    if(!RegExp.test(blogName) || blogName.length > 63){
        throw 'Invalid Blog name'
    }
};

function isFollowed(blogName){
    var row = model.getBlog(blogName).success(function(row){
        return row;
    });
    return (row != undefined);
}


/** Add a blog to the db to be tracked.
 *
 * @param {request} req
 * @param {response} res
 */
exports.follow = function(req, res) {
    var blog = req.params.blogName
    try {
        validateDomain(blog);
        if(isFollowed(blog)){
            throw 'Blog already tracked'
        }
        model.addBlog(blog)
        res.json({success:true});
    } catch (e){
        res.json(400, {error:e});
    }
};

/** Get a list of trending or recent posts.
 *
 * @param {request} req
 * @param {response} res
 */
exports.getTrends = function(req, res) {

  try {
    var blogName;
    var limit = req.param.limit || 20;   //defaults to 20 posts

    if (req.params.blogName){
            blogName = req.params.blogName;
            validateDomain(blogName);
            if(!isFollowed(blogName)){
                throw 'Blog not tracked'
            };
    }
    var order = oreq.query.order && req.query.order.toLowerCase();
    if(order == "trending" || order == "recent") {
        model.getTrends(blogName, order, limit).success(function(rows){
            var trending = [];
            var post;
            var fields = ["url", "text", "image", "date", "last_track", "last_count", "tracking"];
            rows.forEach(function(row) {
                post = {};
                fields.forEach(function(field) {
                    post[field] = row[field];
                });
                trending.push(post);
            });
            res.json({"trending": trending, "order": req.query.order, "limit": limit});
        });
    } else {
        throw 'Order not specified: pick Trending or Recent';
    }
  } catch(e) {
    res.json(400, {error:e});
  }
};

