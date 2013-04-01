/**
 * Authors: Natalie Morcos, Zeeshan Qureshi, Michael Kozakov
 * Date: 27/03/13
 * Time: 11:32 AM
 * To change this template use File | Settings | File Templates.
 */

$(document).ready(function () {

    var favourites = []; //will hold JSON
    var userTweets = []; //tweets to be displayed on the user page

    /**
     * Generates a pop-up containing a photo
     *
     * @param media_url {String} the url of the image
     * @param tweetID {Number} the id of the tweet
     * @return <div> element
     */
    var buildPhotoPopup = function(media_url, tweetID){

        var container = $('<div/>', {
            "data-role": "popup",
            "id": "photobox-tweet" + tweetID,
            "data-overlay-theme": "a",
            "data-dismissable": "false"
        });
        var close = $('<a/>', {
            "href": "#",
            "data-rel": "back",
            "data-role": "button",
            "data-theme": "a",
            "data-icon": "delete",
            "data-iconpos": "notext",
            "class": "ui-btn-right",
            "html": "Close"
        }).click(function() {doSomething(container)});

        var img = $('<img/>',{
            "src": media_url
        });
        container.append(close, img);
        return container;
    };


    /**
     * Generates a link formatted to follow twitter's standards
     *
     * @param type {String} the url of the image
     * @param object {Object} contains information about the link
     * @param tweetID {Number} the id of the tweet
     * @return <a> element
     */
    var buildLink = function (type, object, tweetID) {
        var obj;
        if (type == 'hashtag') {
            obj = $('<a/>', {
                "href": "http://twitter.com/search?q=%23" + object.text,
                "class": "intweet-link",
                "html": "#" + object.text,
                "target": "_blank"
            });
        } else if (type == 'user_mention') {
            obj = $('<a/>', {
                "href": "http://twitter.com/" + object.screen_name,
                "class": "intweet-link",
                "html": "@" + object.screen_name,
                "target": "_blank"
            });
        } else if (type == 'url') {
            obj = $('<a/>', {
                "href": object.expanded_url,
                "class": "intweet-link",
                "html": object.display_url,
                "target": "_blank"
            });
        } else if (type == 'media') {
            obj = $('<a/>', {
                "href":'#photobox-tweet' + tweetID,
                "class": "intweet-link intweet-media",
                "html": object.display_url,
                "data-rel": "popup",
                "data-position-to": "window",
                "data-transition" : "fade"
            });
        }
        return obj[0].outerHTML;
    };

    /**
     * Formats a tweets text to follow twitter standards
     *
     * @param tweetObject {Object} contains tweet information
     * @return {String}
     */
    var prepareTweetText = function (tweetObject) {
        var text = tweetObject.text;
        //link hashtags
        if (tweetObject.entities.hashtags.length != 0) {
            tweetObject.entities.hashtags.forEach(function (hashtag) {
                text = text.replace('#' + hashtag.text, buildLink('hashtag', hashtag, tweetObject.id));
            })
        }
        // link external urls
        if (tweetObject.entities.urls.length != 0) {
            tweetObject.entities.urls.forEach(function (url) {
                text = text.replace(url.url, buildLink('url', url, tweetObject.id));
            })
        }
        //link user mentions
        if (tweetObject.entities.user_mentions.length != 0) {
            tweetObject.entities.user_mentions.forEach(function (user_mention) {
                var link = buildLink('user_mention', user_mention, tweetObject.id);
                text = text.replace('@' + user_mention.screen_name, link);
                text = text.replace('@' + user_mention.screen_name.toLowerCase(), link);
            })
        }
        //tweetObject.entities.media
        if (tweetObject.entities.media) {
            tweetObject.entities.media.forEach(function (media) {
                var link = buildLink('media', media, tweetObject.id);
                text = text.replace(media.url, link);
                })
        }
        return text
    };
    /**Formats the date string to display with the tweet.
     *
     * @param created_at
     * @returns {string}
     */
    var prepareDate = function(created_at){
        var tokens = created_at.split(" ");
        var time = tokens[3].slice(0,5);
        console.log(time)
        var hour = parseInt(time.slice(0,2));
        if(hour == 12){
            time = time + ' PM - ';
        } else if (hour == 00){
            time = "12" + time.slice(2) + ' AM - ';
        } else if (hour > 11){
            time = (hour - 12) + time.slice(2) + ' PM - ';
        } else{
            time = time + ' AM - ';
        }
        return time + tokens[1] + '. ' +  tokens[2] + ', ' + tokens[5];
    };

    /**
     * Populates the user page with information about given user and redirects to that page
     *
     * @param userData {Object} contains information about the user
     */
    var displayUserPage = function(userData) {
        userTweets = [];
        var avatar = $("<img/>", {
            'src': userData.profile_image_url,
            'id': "avatar"
        });
        $("#avatar-container").html(avatar);
        $("#username-header").text(userData.name);
        $("#username").text(userData.name);
        $("#num-following").text(userData.friends_count);
        $("#num-followers").text(userData.followers_count);

        var tweetContainer = $("#user-tweets");
        tweetContainer.html("");

        //Redirect to the user page
        $.mobile.changePage( "#user-page", { transition: "slide"} );
        $("#user-page").addClass("my-page");

        //populate user page with tweets
        for(var i = 0; i < favourites.length; i++) {
            var tweet = favourites[i];
            if(tweet.user.id == userData.id) {
                userTweets.push(tweet);
            }
        }
        userTweets.index = 0;
        populate(tweetContainer, userTweets);
    };

    /**
     * Takes a tweet object from the JSON array favourites and builds then
     * returns a div containing to relevant information.
     * @param {JSON} tweetObject
     * @returns {*|jQuery|HTMLElement}
     */
    var buildTweet = function (tweetObject) {
        var tweetContainer = $('<li/>', {
            'class': 'tweet-container'
        });
        var link = $('<a/>', {
            'href': '#'
        });
        var img = $('<img/>', {
            'src': tweetObject.user.profile_image_url
        });
        var name = $('<h2/>', {
            'html': tweetObject.user.name + " "
        });
        var date = $('<p/>', {
            'class': 'ui-li-aside',
            'html': prepareDate(tweetObject.created_at)
        });
        var handler = $('<span/>', {
            'class': 'user-handler',
            'html': '@' + tweetObject.user.screen_name
        }).click(function() {displayUserPage(tweetObject.user)});
        var text = $('<p/>', {
            'html': prepareTweetText(tweetObject)

        });

        name.append(handler);
        link.append(img, name, text, date);
        tweetContainer.append(link);

        //build the media popup if the tweet has expandable content
        if (tweetObject.entities.media){
            $('.my-page').append(buildPhotoPopup(tweetObject.entities.media[0].media_url, tweetObject.id)).trigger("create");
        }
        return tweetContainer;
    };

    /**
     * Adds 10 tweets to container starting with tweets.index
    */
    var populate = function (container, tweets, firstView) {
        var i = 0;
        while ((tweets.index < tweets.length) && (i < 10)) {
            var newTweet = buildTweet(tweets[tweets.index]);
            newTweet.attr('id', tweets.index); // id=index in array to easily build user profile on tweet click

            $(newTweet).appendTo(container);
            i++;
            tweets.index++;

            if (firstView && tweets.index == tweets.length) {  //will not add sentinel on "back"
                $('#tweetList').append("<li id='sentinel'><a href=''#'><img src='img/icecream_star.png'><h2>The End</h2>"
                    + "<p>That's all folks!</p></a></li>");
            }
        }
        //refresh after all the appends instead of after each one
        container.listview('refresh');
    };

    /*Infinite Scroll*/
    $(window).scroll(function () {
        if ($(window).scrollTop() >= $(document).height() - $(window).height() - 245) {
            //load more posts
            if(window.location.hash == "#user-page") {
                populate($("#user-tweets"), userTweets)
            }
            else {
                populate($("#tweetList"), favourites, true)
            }
        }
    });

    /*load the tweets from the local file*/
    $.getJSON('./favs.json', function (data) {
        favourites = data;
        favourites.index = 0;
        populate($("#tweetList"), favourites, true)
    });
});
