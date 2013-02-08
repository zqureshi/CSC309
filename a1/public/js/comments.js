$(document).ready(function(){
    /**
     * Tracks the number of root threads.
     * @type {Number}
     */
    var threadcount = 0;

    //hidden unless in use
    $("#new-topic-form").hide();

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
       $("#new-topic-form")[0].reset()
       $( this ).hide();

       var $form = $( this ),
           title = $form.find('textarea[name="title"]').val(),
           link = $form.find('input[name="link"]').val(),
           url = $form.attr( 'action' );

       var posting = $.post( url, { "title": title, "link" : link});

       posting.done(function(data){
           var content = $( data ).find( '#content' );
           $('<div id="thread' + threadcount + '"/>').appendTo('#topics');
           createThread($('#thread' + threadcount), data.title, data.link, true);
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

      /*  var link = jQuery ('<a/>', {
            'href' : link,
            'text' : "  |  " +  link + '<br>' */

        var upvoteButton = jQuery('<a/>', {
            'class' : 'upvote-container',
            'href' : "#",
            'style' : "float:right",
            'html' : '<img class="upvotes-icon" src="http://0-media-cdn.foolz.us/ffuuka/board/a/image/1346/77/1346778185717.png"/>'

        });

        if (isRoot){
            container.append(comment, '<a href="' + link + '">  |  '+  link + '<br></a>', replyButton, repliesContainer);
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
                    createThread(repliesContainer, textBox.val());
                }
            });
        });
        isRoot && replyButton.click();
    };

    /**
     * Initial get on /topics, populating page.
     */
    $.getJSON("/topic", function(data){
        //var items = [];

        /* create a new div for each thread*/
        $.each(data, function(key, value){
            $('<div id="thread' + key + '"/>').appendTo('#topics');
            createThread($('#thread' + key), value.title,value.link, true);
            threadcount++;
        });
    });

});