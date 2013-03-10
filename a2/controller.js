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

exports.getTrends = function(req, res) {
  //TODO: write getTrends method
  // use the paramters req.query.limit and req.query.order
  // if req.params.blogHostname is specified, only show trends for that blog
};


exports.getRecent = function (req,res){
    //TODO complete

    var blog;
    var limit = req.param.limit ? req.params.limit : 20;   //defaults to 20 posts

    try {
        if (req.params.blog){
            blog = req.params.blog;
            validateDomain(blog);
            if(!isFollowed(blog)){
                throw 'Blog not tracked'
            };
        } else{
            blog = "*";  //defaults to all
        }

        var rows = model.recent(limit, blog);
        //TODO parse rows, build json response object
        res.json({success:true});
    } catch (e){
        res.json(400, {error:e});
    }

}