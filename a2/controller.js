
var model = require('./models');

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

/** Add a block to the db to be tracked.
 *
 * @param {request} req
 * @param {response} res
 */
exports.follow = function(req, res) {
    var blog = req.params.blog
    try {
        validateDomain(blog);
        if (model.isFollowed(blog)){
            throw 'Blog already tracked'
        }
        res.json({success: model.follow(blog) });
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
    var blog;
    var limit = req.param.limit || 20;   //defaults to 20 posts

    if (req.params.blog){
            blog = req.params.blog;
            validateDomain(blog);
            if(!isFollowed(blog)){
                throw 'Blog not tracked'
            };
    } else {
        blog = "*";  //defaults to all
    }

    if(req.query.order == "Trending" || req.query.order == "Recent") {
        var rows = model.getTrends(blog, req.query.order, limit);
        //TODO parse rows, build json response object
        res.json({success:true});
    } else {
        throw 'Order not specified';
    }
  } catch(e) {
    res.json(400, {error:e});
  }
};