/**
 * Authors: Natalie Morcos, Zeeshan Qureshi, Michael Kozakov
 * Date: 27/03/13
 * Time: 11:32 AM
 * To change this template use File | Settings | File Templates.
 */

$(document).ready(function () {

    var favourites = []; //will hold JSON
    var loadIndex = 0;   //index first undisplayed tweet\

    /**
     * Generates a pop-up with photos
     *
     * @param media_url {String} the url of the image
     * @return <div> element
     */
    var buildPhotoPopup = function(media_url){
        var container = $('<div/>', {
            "data-role": "popup",
            "id": "photobox-tweet" + loadIndex,
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
        });
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
     * @return <a> element
     */
    var buildLink = function (type, object) {
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
                "href":'#photobox-tweet' + loadIndex,
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
                text = text.replace('#' + hashtag.text, buildLink('hashtag', hashtag));
            })
        }
        // link external urls
        if (tweetObject.entities.urls.length != 0) {
            tweetObject.entities.urls.forEach(function (url) {
                text = text.replace(url.url, buildLink('url', url));
            })
        }
        //link user mentions
        if (tweetObject.entities.user_mentions.length != 0) {
            tweetObject.entities.user_mentions.forEach(function (user_mention) {
                var link = buildLink('user_mention', user_mention);
                text = text.replace('@' + user_mention.screen_name, link);
                text = text.replace('@' + user_mention.screen_name.toLowerCase(), link);
            })
        }
        //tweetObject.entities.media
        if (tweetObject.entities.media) {
            tweetObject.entities.media.forEach(function (media) {
                var link = buildLink('media', media);
                text = text.replace(media.url, link);
                })
        }
        return text
    };

    /**
     * Populates the user page with information about given user and redirects to that page
     *
     * @param userData {Object} contains information about the user
     */
    var displayUserPage = function(userData) {
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

        //Display tweets authored by the user
        for(var i = 0; i < favourites.length; i++) {
            var tweet = favourites[i];
            if(tweet.user.id == userData.id) {
                $(buildTweet(tweet)).appendTo(tweetContainer);
            }
        }

        //Redirect to the user page
        $.mobile.changePage( "#user-page", { transition: "slide"} );
        $("#user-page").addClass("my-page");
        tweetContainer.listview('refresh');
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
        var handler = $('<span/>', {
            'class': 'user-handler',
            'html': '@' + tweetObject.user.screen_name
        }).click(function() {displayUserPage(tweetObject.user)});
        var text = $('<p/>', {
            'html': prepareTweetText(tweetObject)

        });

        name.append(handler);
        link.append(img, name, text);
        tweetContainer.append(link);

        //build the media popup if the tweet has expandable content
        if (tweetObject.entities.media){
            $('.my-page').append(buildPhotoPopup(tweetObject.entities.media[0].media_url)).trigger("create");
        }
        return tweetContainer;
    };

    /**
     * Uses global variables favourites and loadIndex to load the 10 next tweets
     * into the main display window.
     * @returns void
    */
    var populateMain = function () {

        var i = 0;
        while ((loadIndex < favourites.length) && (i < 10)) {
            var newTweet = buildTweet(favourites[loadIndex]);
            newTweet.attr('id', loadIndex); // id=index in array to easily build user profile on tweet click

            $(newTweet).appendTo("#tweetList");
            i++;
            loadIndex++;

            if (loadIndex == favourites.length) {    //will only ever execute once
                /* var sentinel = "<li id='sentinel'><a href='#'><h2>The End</h2><p>That's all folks!</p></a></li>"  */
                $('#tweetList').append("<li id='sentinel'><a href=''#'><img src='../img/icecream_star.png'><h2>The End</h2>"
                    + "<p>That's all folks!</p></a></li>");
            }
        }
        //refresh after all the appends instead of after each one
        $('#tweetList').listview('refresh');
    };

    /*Infinite Scroll*/
    $(window).scroll(function () {
        if ($(window).scrollTop() >= $(document).height() - $(window).height() - 232) {
            //load more posts
            populateMain();
        }
    });

    /*load the tweets from the local file*/
    $.getJSON('./favs.json', function (data) {
        favourites = data;
        populateMain();
    });
});
