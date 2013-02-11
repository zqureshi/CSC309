/**
 * Topic REST API
 */

/**
 * Store a list of topics and its replies.
 *
 * @type {Array}
 */
var topics = [
  {
    id: 0,
    text: "I am Jack's Complete Lack of surprise. AMA.",
    link: 'http://25.media.tumblr.com/tumblr_ligc5fecSK1qav29fo1_r1_500.gif',
    voteWeight: 0,
    votes: 0,
    replies: [
      {

        id: "0:0",
        text: 'I am the nameless narrator.',
        votes: 0,
        voteWeight: 0,
        replies: [
          {

            id: "0:0:0",
            text: 'Jack or Tyler???!?!11',
            votes: 0,
            voteWeight: 0,
            replies: []
          }
        ]
      },

      {
        id: "0:1",
        text: "I am Jack's smirking revenge.",
        votes: 0,
        voteWeight: 0,
        replies: [
            {
                id: "0:1:0",
                text: 'http://static.tumblr.com/eimlqnz/7gym85211/tumblr_lkotx0ojxa1qcnxvno1_500.gif',
                voteWeight: 0,
                votes: 0,
                replies: []
}]
            },
            {
            id: "0:1:1",
            text: '+1',
            voteWeight: 0,
            votes: 0,
            replies: [
                {
                    id: "0:1:1:0",
                    text: "bro there's a button for that.",
                    voteWeight: 0,
                    votes: 0,
                    replies: []
                }
            ]
            }

    ]
  }, {
        id: 1,
        text: 'News number 2: Jack has lost his surprise :(',
        link: 'http://www.lostandfound.ca',
        votes: 0,
        voteWeight : 0,
        replies: [ {
            id: "1:0",
            text: "founddd it. It's been hiding out on blogspot since 2008: http://jackslackofsurprise.blogspot.ca/",
            votes: 0,
            voteWeight: 0,
            replies: [
                {
                    id: "1:0:0",
                    text: 'Excellent hiding place. No one would ever look there anyways. #teamWordpress',
                    votes: 0,
                    voteWeight: 0,
                    replies: [{
                        id: "1:0:0:0",
                        text: 'AHEM. #teamTumblr',
                        votes: 0,
                        voteWeight: 0,
                        replies: []
                    }]
                }
            ]
        },

            {
                id: "1:1",
                text: 'as if there is a national lost and found site.',
                voteWeight: 0,
                votes: 0,
                replies: []
            }]
    }
];

/**
 * Check if element exists and is of the required type,
 * else throw an exception.
 *
 * @param obj
 * @param elem
 * @param {String} type
 */
function _validate(obj, elem, type) {
  if(obj[elem] == undefined || typeof obj[elem] != type) {
    throw 'Invalid ' + elem;
  }
}

/**
 * Check if element exists and is a string, else throw an exception.
 *
 * @param obj
 * @param elem
 */
function validateString(obj, elem) {
  _validate(obj, elem, 'string');
}

/**
 * Validate given Topic ID.
 * @param tid
 */
function validateTopicId(tid) {
  _validate({Topic: tid}, 'Topic', 'string');
  if(isNaN(Number(tid)) || tid < 0 || tid >= topics.length ) {
    throw 'Invalid Topic';
  }
}

/**
 * Return a listing of all topics as JSON.
 *
 * @param {request} req
 * @param {response} res
 */
exports.list = function(req, res) {
  res.json(topics);
}

/**
 * Create a new topic and return its id.
 *
 * @param {request} req
 * @param {response}  res
 */
exports.new = function(req, res) {
  try {
    var topic = req.body;
    validateString(topic, 'text');
    validateString(topic, 'link');

    /* Push Topic and set ID */
    var id = topics.push({
      id: null,
      text: topic.text,
      link: topic.link,
      votes: 0,
      replies: []
    }) - 1;
    topics[id].id = id;

    /* Return success */
    res.json(topics[id]);
  } catch(e) {
    res.json(400, {error: e});
  }
}

/**
 * Return topic with the given :tid.
 *
 * @param {request} req
 * @param {response} res
 */
exports.get = function(req, res) {
  var tid = req.params.tid;
  try {
    validateTopicId(tid);
    res.json(topics[tid]);
  } catch(e) {
    res.json(400, {error: e});
  }
}

/**
 * Reply to a topic or another reply.
 *
 * @param {request} req
 * @param {response} res
 */
exports.reply = function(req, res) {
  var tid = req.params.tid;


  try {
    validateTopicId(tid);
    validateString(req.body, 'text');

    /* Traverse thread to find parent to reply to */
    var parent =  topic = topics[tid];
    var path = req.params.rid != undefined ? req.params.rid.split(':') : [];
    while(path.length > 0) {
      var rid = path.shift();
      if(parent.replies[rid] != undefined) {
        parent = parent.replies[rid];
      } else {
        throw 'Invalid Reply ID';
      }
    }

    /* Append reply */
    var id = parent.replies.push({
      id: null,
      text: req.body.text,
      votes: 0,
      voteWeight : 0,
      replies: []
    }) - 1;

    /* Calculate and update reply id */
    parent.replies[id].id = parent.id + ':' + id;


    res.json(parent.replies[id]);
  } catch(e) {
    res.json(400, {error: e});
  }
}

/**
 * Upvote a reply.
 *
 * @param {request} req
 * @param {response} res
 */
exports.upvote = function(req, res) {
  var tid = req.params.tid;

  try {
    validateTopicId(tid);

    /* Traverse thread to find comment to upvote */
    var parent = topic = topics[tid];
    var path = req.params.rid != undefined ? req.params.rid.split(':') : [];
    var thread = [topic];
    while(path.length > 0) {
      var reply = parent.replies[path.shift()];
      if(reply != undefined) {
        thread.push(reply);
        parent = reply;
      } else {
        throw 'Invalid Reply ID';
      }
    }

    /* Update the vote weight of elements in path */
    thread.forEach(function(child) {
      child.voteWeight += 1;
    });

    thread[thread.length - 1].votes += 1;

    res.json(thread.pop());
  } catch(e) {
    res.json(400, {error: e});
  }
}

/**
 * Clear all topics, to be used for unit test fixtures.
 *
 * @param {request} req
 * @param {response} res
 */
exports.clear = function(req, res) {
  topics.length = 0;
  res.json({success: true});
}
