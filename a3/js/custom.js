/**
 * Created with JetBrains WebStorm.
 * User: Owner
 * Date: 27/03/13
 * Time: 11:32 AM
 * To change this template use File | Settings | File Templates.
 */
$(document).ready(function () {

    var favourites = []; //will hold JSON
    var loadIndex = 0;   //index first undisplayed tweet

    var buildLink = function (type, object) {
        var obj;
        if (type == 'hashtag') {
            obj = $('<a/>', {
                "href": "http://twitter.com/search?q=%23" + object.text,
                "class": "intweet-link",
                "html": "#" + object.text
            });
        } else if (type == 'user_mention') {
            obj = $('<a/>', {
                "href": "http://twitter.com/" + object.screen_name,
                "class": "intweet-link",
                "html": "@" + object.screen_name
            });
        } else if (type == 'url') {
            obj = $('<a/>', {
                "href": object.expanded_url,
                "class": "intweet-link",
                "html": object.display_url
            });
        }
        return obj[0].outerHTML;

    }

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

        return text

    }

    /** Takes a tweet object from the JSON array favourites and builds then
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
            //TODO image resizing in both layouts
        });
        var name = $('<h2/>', {
            'html': tweetObject.user.name
        });
        var handler = $('<span/>', {
            'class': 'user-handler',
            'html': '@' + tweetObject.user.screen_name
        });
        var text = $('<p/>', {
            'html': prepareTweetText(tweetObject)
            //TODO pictures
        });

        name.append(handler);
        link.append(img, name, text);
        tweetContainer.append(link);
        return tweetContainer;
    };

    /** Uses global variables favourites and loadIndex to load the 10 next tweets
     * into the main display window. Returns void.
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
                $('#tweetList').append("<li id='sentinel'><a href=''#'><img src='img/icecream_star.png'><h2>The End</h2>"
                    + "<p>That's all folks!</p></a></li>");
            }
        }
        //refresh after all the appends instead of after each one
        $('#tweetList').listview('refresh');
    };

    /*Infinite Scroll*/
    $(window).scroll(function () {
        if ($(window).scrollTop() == $(document).height() - $(window).height()) {
            //load more post
            populateMain();
        }
    });

    /*load the tweets from the local file*/
    $.getJSON('./favs.json', function (data) {
        favourites = data;
        populateMain();
    });


    //TODO implement event handler for click on chevron in list view , expands user info
    /* this guy: <span class="ui-icon ui-icon-arrow-r ui-icon-shadow"> </span>
     the <li> element it's in has and id # that is the index of the tweetObject in the JSON array
     to make looking up user info easier */

    //TODO implement lightbox popup for links to pictures


});
