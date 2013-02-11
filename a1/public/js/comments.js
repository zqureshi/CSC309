$(document).ready(function () {

    /**
     * Toggles new topic form display.
     */
    $('#new-topic-button').click(function () {
        $('#new-topic-form').toggle('fast');
    });

    /**
     * Collapses new topic form, comment editor, and all expanded replies.
     */
    $('html').click(function () {
        $('#new-topic-form').hide();
        $('.comment-editor').hide();
        $('.reply-button').show();
    });

    /**
     * Prevents new topic form from being hidden on header click.
     */
    $('.header-container').click(function (event) {
        event.stopPropagation();
    });

    /**
     * Prevents replies from collapsing on container click.
     */
    $('.container').click(function (event) {
        event.stopPropagation();
    });

    /**
     * Posts form data to API.
     * If successful, displays new thread on page without refresh.
     */
    $('#new-topic-form').submit(function (event) {
        event.preventDefault();
        $(this).hide();

        var $form = $(this),
            title = $form.find('textarea[name="title"]').val(),
            link = $form.find('input[name="link"]').val(),
            url = $form.attr('action');

        var posting = $.post(url, { 'text':title, 'link':link});

        posting.done(function (data) {

            $('#new-topic-form')[0].reset();
            $('#topics').append(createThread(data.id, data.votes, data.voteWeight, data.text, data.link));
            $('html, body').animate({
                scrollTop:$('#thread' + String(data.id).replace(/:/g, '\\:')).offset().top
            }, 1000);
        });
    });

    /**
     * Creates a comment thread (tree) and places the post with
     * the specified id and text at the root of the thread.
     *
     * @param id {String} the id of the thread, which also specifies the ids of parents
     *     threads, all the way to the root. Use colons to separate the parent ids. E.g. 1:1:3:2
     * @param numVotes {Number} the number of times this comment was up-voted
     * @param voteWeight {Number} the cumulative number of upvotes on the post and its replies
     * @param text {String} the text inside the comment
     * @param url {String} the url which will be displayed if the comment is a Topic
     * @returns {jQuery} a div element with the class 'comment-thread' and the id 'thread' + id
     */
    var createThread = function (id, numVotes, voteWeight, text, url) {
        id = String(id);

        var thread = $('<div/>', {
            'class':'comment-thread',
            'id':'thread' + id
        });

        var post = createPost(id, numVotes, voteWeight, text, url);

        if (id.indexOf(':') == -1){
            /* toggle replies when topic text clicked */
            post.find('.topic-text').click(function () {
                toggleCollapse(id);
                $('.comment-editor').hide();
                $('.footer-buttons').show();
            });

            /* expand replies if "reply" button is clicked*/
            post.find('.reply-button').click(function () {
                if(thread.attr("collapsed") != 'false')
                toggleCollapse(id);
            });
        }

        return thread.append(post);
    };

    /**
     * Creates a post with a voting area. This should be placed inside a thread.
     *
     * @param id {String} the id of the post, which matches the thread id
     * @param numVotes {Number} the number of times this comment was up-voted
     * @param voteWeight {Number} the cumulative number of upvotes on the post and its replies
     * @param text {String} the text inside the comment
     * @param url {String} the url which will be displayed if the comment is a Topic
     * @returns {jQuery} a div element with the class 'post' and the id 'post' + id
     */
    var createPost = function (id, numVotes, voteWeight, text, url) {
        var isTopic = id.indexOf(':') == -1;

        /* Find the topicID and the postID from the full id */
        var topicID = '',
            postID = '';
        if (isTopic) {
            topicID = id;
        } else {
            var topicIndex = id.indexOf(':');
            topicID = id.substring(0, topicIndex);
            postID = id.substring(topicIndex + 1)
        }

        /* generate upvote area and footer with reply button*/
        var upvoteContainer = createUpvoteContainer(topicID, postID, numVotes,(isTopic ? voteWeight : null));
        var footer = createFooter(topicID, postID);

        /* prevent upvoting from collapsing replies*/

        /* create the post */
        var postText = $('<div/>', {
            'class':'post-text' + (isTopic ? ' topic-text lead' : ''),
            'text':text
        });
        var link = isTopic && url ? $('<a/>', {
            'class':'post-link',
            'text':'| ' + url.substring(0, 30) + (url.length > 30 ? '...' : ''),
            'href':url,
            'target':'_blank'
        }) : '';
        var entryContainer = $('<div/>', {
            'class':'entry-container'
        }).append(postText, link, footer);

        var post = $('<div/>', {
            'class':'post',
            'id':'post' + id
        });

        /* add the upvoteContainer and entryContainer to the post*/
        return post.append(upvoteContainer, entryContainer);
    };

    /**
     * Creates the elements to be placed under the comment.
     *
     * @param topicID {String} the id of the topic, under which this comment exists
     * @param postID {String} the path from the topic to the comment (not includeing the comment), separated by colons.
     * @returns {jQuery} a div element with the class 'post-footer'
     */
    var createFooter = function (topicID, postID) {
        var footer = $('<div/>', {
            'class':'post-footer'
        });

        var footerButtons = $('<div/>', {
            'class':'footer-buttons'
        });

        var replyButton = $('<a/>', {
            'class':'reply-button',
            'text':'reply'
        });

        var replyIcon = $('<i>', {
          'class': 'icon-comment',
          'style': 'margin-right: 3px;'
        });

        replyButton.prepend(replyIcon);
        footerButtons.append(replyButton);

        /* Reply button actions*/
        replyButton.click(function () {
            /* Hide all active comment editors */
            $('.comment-editor').hide();
            $('.footer-buttons').show();

            /* Create new editor */
            var commentEditor = $('<div/>', {
                'class':'comment-editor'
            });
            var textBox = $('<textarea/>', {
                'class':'comment-box',
                'maxlength':140
            });
            var saveCommentBtn = $('<button/>', {
                'text':'save',
                'class':'save-reply-button btn'
            });
            commentEditor.append(textBox, saveCommentBtn);
            footer.append(commentEditor);
            footerButtons.hide();

            /* Saving the comment */
            saveCommentBtn.click(function () {
                if (textBox.val()) {

                    var onSuccess = function (data) {
                        commentEditor.remove();
                        footerButtons.show();
                        var reply = createThread(data.id, String(data.votes), data.voteWeight, data.text, null);
                        console.log(reply);
                        var selector = '#thread' + topicID + (postID ? '\\:' + postID.replace(/:/g, '\\:') : '');
                        $(selector).append(reply);
                        $('html, body').animate({
                            scrollTop:$(selector).offset().top
                        }, 1000);
                    };
                    var url = '/topic/' + topicID + '/reply' + (postID ? '/' + postID : '');
                    $.post(url, {'text':textBox.val()}, function (result) {
                        onSuccess(result)
                    });
                }
            });
        });

        if(!postID) {

            var collapseExpandButton = $('<a/>', {
                'class':'expand-collapse-button'
            });
            collapseExpandButton.click(function() {
                toggleCollapse(topicID);
            });
            footerButtons.append(collapseExpandButton);
        }

        return footer.append(footerButtons);
    };

    /**
     * Creates the up-vote area.
     *
     * @param topicID {String} the id of the topic, under which this comment exists
     * @param postID {String} the path from the topic to the comment (not includeing the comment), separated by colons.
     * @param numVotes {Number} the number of times this comment has been up-voted
     * @param voteWeight {Number} the cumulative number of upvotes on the post and its replies
     * @returns {jQuery} a div element with the class 'voting-container'
     */
    var createUpvoteContainer = function (topicID, postID, numVotes, voteWeight) {
        var upvoteContainer = $('<div/>', {
            'class':'voting-container'
        });
        var upvoteButton = $('<i/>', {
            'class':'upvote-icon icon-thumbs-up icon-muted'
        });
        var voteCount = $('<span/>', {
            'class':'vote-count',
            'text':String(numVotes)
        });
        var voteWeight = voteWeight ? $('<span/>', {
            'class':'weight-container',
            'html':'<span class="vote-weight">' + voteWeight + '</span> | '
        }) : '';

        /* Style changes on hover */
        upvoteButton.hover(function () {
            upvoteButton.removeClass('icon-muted');
        }, function () {
            upvoteButton.addClass('icon-muted');
        });

        /* Up-vote button actions */
        upvoteButton.click(function () {
            $.post('/topic/' + topicID + (postID ? '/reply/' + postID : '') + '/upvote', function (data) {
                upvoteButton.removeClass('icon-muted');
                upvoteButton.unbind('mouseenter mouseleave');
                upvoteButton.unbind('click');
                voteCount.html(data.votes);
                var topicWeight = upvoteButton.parents('.comment-thread').find('.vote-weight');
                topicWeight.html(parseInt(topicWeight.html()) + 1);
            });
        });
        return upvoteContainer.append(upvoteButton, voteWeight, voteCount);
    };

    var toggleCollapse = function(topicID) {
        var topic = $("#thread" + topicID);
        if(topic.attr("collapsed") == "true") {
            topic.find('[id*=":"]').show();
            topic.attr("collapsed", "false");
            $("#post" + topicID).find(".expand-collapse-button").html("hide comments");
        }
        else {
            topic.find('[id*=":"]').hide();
            topic.attr("collapsed", "true");
            $("#post" + topicID).find(".expand-collapse-button").html("show comments");
        }
    };

    /**
     * Sorts the posts and their comments by the total number of votes in the thread.
     *
     * @param posts {Array} an array of posts
     */
    var sortPosts = function (posts) {
        posts.sort(function (a, b) {
            return b.voteWeight - a.voteWeight;
        });

        posts.forEach(function (post) {
            sortPosts(post.replies);
        });
    };

    /**
     * Initial get on /topics, populating page.
     */
    $.getJSON('/topic', function (data) {
        sortPosts(data);
        var populate = function (parentThread, posts) {
            posts.forEach(function (post) {
                var childThread = createThread(post.id, post.votes, post.voteWeight, post.text, post.link);
                if(!post.link){
                    childThread.css('display', 'none');
                }
                parentThread.append(childThread);
                populate(childThread, post.replies);
            });
        };
        populate($('#topics'), data);
        data.forEach(function(topic) {
            toggleCollapse(topic.id);
        })
    });

});
