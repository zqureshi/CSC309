/**
 * Populate the Topic backend.
 */


var request = require('request');
apiUrl = 'http://localhost:31315';

/* Population data */
var topics = [
    {
        text:"I am Jack's Complete Lack of surprise. AMA.",
        link:'http://25.media.tumblr.com/tumblr_ligc5fecSK1qav29fo1_r1_500.gif',
        votes:20,
        replies:[
            {
                text:'I am the nameless narrator.',
                votes:5,
                replies:[
                    {
                        text:'Jack or Tyler???!?!11',
                        votes:0,
                        replies:[]
                    }
                ]
            },

            {
                text:"I am Jack's smirking revenge.",
                votes:5,
                replies:[
                    {
                        text:'http://static.tumblr.com/eimlqnz/7gym85211/tumblr_lkotx0ojxa1qcnxvno1_500.gif',
                        votes:0,
                        replies:[
                            {
                                text:'+1',
                                votes:1,
                                replies:[
                                    {
                                        text:"bro there's a button for that.",
                                        votes:4,
                                        replies:[]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        text:'Breaking news: Jack has lost his surprise :(',
        link:'http://www.lostandfound.ca',
        votes:2,
        replies:[
            {
                text:"founddd it. It's been hiding out on blogspot since 2008:http://jackslackofsurprise.blogspot.ca/",
                votes:5,
                replies:[
                    {
                        text:'Excellent hiding place. No one would ever look there anyways. #teamWordpress',
                        votes:10,
                        replies:[
                            {
                                text:'AHEM. #teamTumblr',
                                votes:7,
                                replies:[
                                    {
                                        text:'tumblrrr',
                                        votes:7,
                                        replies:[]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },

            {
                text:'as if there is a national lost and found site.',
                votes:1,
                replies:[]
            }
        ]
    }
];

/* Post a topic and all of the replies to that topic*/
function postTopic(topic) {
    request.post(apiUrl + '/topic', function(err, res, body){
        if(err) {
            throw err;
        }
        var json = JSON.parse(body);
        for(var i = 0; i < topic.votes; i++) {
            upvotePost(json.id, null)
        }
        topic.replies.forEach(function(reply) {
            postReply(reply, json.id, null);
        });
    }).form({'text': topic.text, 'link': topic.link});
}

/* Post a comment and all of the replies to that comment */
function postReply(reply, topicID, replyID) {
    request.post(apiUrl + '/topic/' + topicID +'/reply' + (replyID ? '/' + replyID : ""), function(err, res, body){
        if(err) {
            throw err;
        }
        var json = JSON.parse(body);
        for(var i = 0; i < reply.votes; i++) {
            upvotePost(topicID, json.id)
        }
        reply.replies.forEach(function(comment) {
            postReply(comment, topicID, json.id);
        });
    }).form({'text': reply.text, 'link': reply.link});
}

/* Upvote a post */
function upvotePost(topicID, replyID) {
    request.post(apiUrl + '/topic/' + topicID + (replyID ? '/reply/' + replyID : "") + '/upvote', function(err, res, body){ if(err) throw err;});
}

/* Clear Topics */
request.get(apiUrl + '/clear', function(error, response, body){

/* Populate Topics */
  topics.forEach(function(topic) {
      postTopic(topic);
  })
});

