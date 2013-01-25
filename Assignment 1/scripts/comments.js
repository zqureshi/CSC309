//javascript goes here
$(document).ready(function(){
	var postComment = function() {
		alert("posting comment");
	}
	var submitBtn = $(".submit-comment-btn").click(postComment);
	//TODO: replace with AJAX request
});