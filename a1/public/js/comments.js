$(document).ready(function(){
    var threadcount = 0;

    $(".new-topic").click(function(){
       var link = prompt("Please enter the link for your new topic:");
       while (!link){
           link = prompt("Sorry, links are mandatory. Link please:");
       }
       var title = prompt("What would you like the title to be?");
       while (!title){
           title = prompt("You can't post a topic without a title! Title please:");
        }

        $('<div id="thread' + threadcount + '"/>').appendTo('#topics');
        createThread($('#thread' + threadcount), title,link, true);
        threadcount++;

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

    $.getJSON("/topic", function(data){
        //var items = [];


        $.each(data, function(key, value){
            /* items.push('<div class="thread" id=' + count.toString() + '/> ')
             });
             $("<div/>").appendTo("#topics");
             }); */

            //make a div with id threadNUM, append it to the topics div
            $('<div id="thread' + key + '"/>').appendTo('#topics');

            //pass threadNUM to th createThread function.
            createThread($('#thread' + key), value.title,value.link, true);
            threadcount++;


            //   $('#topics').append('this is the value.title:   ' + value.title + '<br>');
        });
    });



});