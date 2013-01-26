$(document).ready(function(){
    var createThread = function(container, commentText, isRoot) {
        var comment = jQuery('<div/>', {
            'class': 'comment' + (isRoot ? ' root-comment' : ""),
            'text': commentText
        });
        var replyButton = jQuery('<a/>', {
            'href' : '#',
            'class': 'reply-button',
            'text': "reply"
        });
        var repliesContainer = jQuery('<div/>', {
            'class': 'replies-container'
        });

        container.append(comment, replyButton, repliesContainer);
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
    createThread($("#thread"), "I am Jack's Complete Lack of Surprise. AMA", true);
});