
var model = require('./models');

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


/** Add a blog to the db to be tracked.
 *
 * @param {request} req
 * @param {response} res
 */
exports.follow = function(req, res) {
    var blog = req.params.blogName
    try {
        validateDomain(blog);
        if (model.isFollowed(blogName)){
            throw 'Blog already tracked'
        }
        res.json({success: model.follow(blogName) });
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


    if(req.query.order == "Trending" || req.query.order == "Recent") {
        var rows = model.getTrends(blogName, req.query.order, limit);
        //TODO parse rows, build json response object
        res.json({success:true});
    } else {
        throw 'Order not specified';
    }
  } catch(e) {
    res.json(400, {error:e});
  }
};