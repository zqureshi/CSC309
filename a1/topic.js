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
    title: 'Hacker News',
    link: 'http://news.ycombinator.com/',
    votes: 0,
    replies: [
      {
        id: "0",
        text: 'Reply 1',
        votes: 0,
        replies: [
          {
            id: "0:0",
            text: 'Reply 1.1',
            votes: 0,
            replies: []
          }
        ]
      },

      {
        id: "1",
        text: 'Reply 2',
        votes: 0,
        replies: []
      }
    ]
  }, {
        id: 1,
        title: 'News number 2: Jack has lost his surprise :(',
        link: 'http://news.ycombinator.com/',
        votes: 0,
        replies: []
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
    validateString(topic, 'title');
    validateString(topic, 'link');

    /* Push Topic and set ID */
    var id = topics.push({
      id: null,
      title: topic.title,
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
 * Reply to a topic or another rpely.
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
      replies: []
    }) - 1;

    /* Calculate and update reply id */
    if(parent != topic) {
      parent.replies[id].id = parent.id + ':' + id;
    } else {
      parent.replies[id].id = id;
    }

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
    validateString(req.params, 'rid');

    /* Traverse path and store each element */
    var parent = topic = topics[tid];
    var path = req.params.rid.split(':');
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

    /* Upvote each element in path */
    thread.forEach(function(reply) {
      reply.votes += 1;
    });

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
