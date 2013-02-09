$(document).ready(function(){
    /**
     * Tracks the number of root threads.
     * @type {Number}
     */
    var threadcount = 0;

    /**
     * Helper function for initial get on /topics.
     * @param replies  a nested array of json objects having properties id, title, votes, and replies.
     * @param parentID  a string of containing the id of the replies' parent
     */
    var _nestReplies = function(replies, parentID){
        $.each(replies, function(key, value){
               var reply = createThread( parentID + ':' + key, value.text);
               $('#' + parentID).append(reply);
               if(value.replies){
                _nestReplies(value.replies, parentID + ':' + key);
               }
            });
    };

    /**
     * Initial get on /topics, populating page.
     */
    $.getJSON("/topic", function(data){
        $.each(data, function(key, value){
            var newTopic = createThread(threadcount, value.title, value.link );
            $('#topics').append(newTopic);

            if(value.replies){
                _nestReplies(value.replies, 'thread' + key);
            }
            threadcount++;
        });
    });

    /**
     * Event Handler for the New Topic Button.
     */
    $("#new-topic-button").click(function(){
        $("#new-topic-form").toggle('fast');
    });

    $('html').click(function() {
        $("#new-topic-form").hide();
    });

    $('.header-container').click(function(event){
        event.stopPropagation();
    });

    /**
     * Event Handler for the Submit button. Posts form data to API.
     * If post successful, displays new thread on page without refresh.
     */
    $('#new-topic-form').submit(function(event){
       event.preventDefault();
       $( this ).hide();

       var $form = $( this ),
           title = $form.find('textarea[name="title"]').val(),
           link = $form.find('input[name="link"]').val(),
           url = $form.attr( 'action' );

       var posting = $.post( url, { "title": title, "link" : link}, function() {
           $("#new-topic-form")[0].reset()
       });

       posting.done(function(data){
           var newTopic = createThread(threadcount, value.title, value.link );
           $('#topics').append(newTopic);
           threadcount++;
       });
    });

    var createThread = function(container, commentText, link, isRoot) {
        var comment = jQuery('<div/>', {
            'class': 'comment' + (isRoot ? ' root-comment lead' : ""),
            'html': commentText
        });

        var replyButton = jQuery('<a/>', {
            'href' : '#',
            'class': 'reply-button',
            'text': "reply"
        });
        var repliesContainer = jQuery('<div/>', {
            'class': 'replies-container'
        });

        var link = jQuery ('<a/>', {
            'href' : link,
            'html' : "  |  " +  link + '<br>'
        });

        var upvoteButton = jQuery('<i/>', {
            'class' : 'upvote-icon icon-thumbs-up icon-2x pull-left icon-muted'
        });

        upvoteButton.css( 'cursor', 'pointer' );

        upvoteButton.hover(function(){
            upvoteButton.removeClass("icon-muted");
        },function(){
            upvoteButton.addClass("icon-muted");
        });

        upvoteButton.click(function() {
            var onSuccess = function() {
                upvoteButton.unbind('mouseenter mouseleave');
                upvoteButton.removeClass("icon-muted","cursor", "pointer");
            };
            onSuccess();//upvoteButton.post("/topic/:tid/reply/:rid/upvote")

        });

        //APPEND VOTES TO UPVOTE CONTAINER,
        // make href on upvotes function post data to server
        //peding post success, display on page

        if (isRoot){
            container.append(comment, link, replyButton, repliesContainer);
        } else {
            container.append(upvoteButton, comment, replyButton, repliesContainer);
        }

        replyButton.click(function() {
            $('.comment-editor').hide();
            $('.reply-button').show();
            var commentEditor = jQuery('<div/>', {
                'class': 'comment-editor'
            });
            var textBox = jQuery('<textarea/>', {
                'class': 'comment-box',
                'maxlength': 140
            });
            var saveCommentBtn = jQuery('<button>save</button>', {
                'class': 'save-reply-button'
            });
            commentEditor.append(textBox, saveCommentBtn);
            repliesContainer.append(commentEditor);
            replyButton.hide();
            saveCommentBtn.click(function() {
                if(textBox.val()) {
                    commentEditor.remove();
                    replyButton.show();
                    //POST DATA TO SERVER ON SUCCESS PROCEED TO DISPLAY ON PAGE
                    createThread(repliesContainer, textBox.val());
                }
            });
        });
    };

});