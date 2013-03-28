/**
 * Created with JetBrains WebStorm.
 * User: Owner
 * Date: 27/03/13
 * Time: 11:32 AM
 * To change this template use File | Settings | File Templates.
 */
$(document).ready(function(){


    var favourites = []; //will hold JSON
    var loadIndex = 0;   //index first undisplayed tweet

    /** Takes a tweet object from the JSON array favourites and builds then
     * returns a div containing to relevant information.
     * @param {JSON} tweetObject
     * @returns {*|jQuery|HTMLElement}
     */
    var buildTweet = function(tweetObject){
        var tweetContainer = $('<li/>', {
            'class':'tweet-container'
        });
        var link = $('<a/>', {
            'href':'#'
        });
        var img = $('<img/>', {
            'src' : tweetObject.user.profile_image_url
            //TODO image resizing in both layouts
        });
        var name = $('<h2/>', {
            'html': tweetObject.user.name
        });
        var handler = $('<span/>', {
            'class':'user-handler',
            'html': '@' + tweetObject.user.screen_name
        });
        var text = $('<p/>', {
            'html': tweetObject.text
            //TODO parse the text for @handlers and links
        });

        name.append(handler);
        link.append(img, name, text);
        tweetContainer.append(link);
        return tweetContainer;
    }

    /** Uses global variables favourites and loadIndex to load the 10 next tweets
     * into the main display window. Returns void.
     */
    var populateMain = function(){
           var i = 0;
           while( (i < 10) & (loadIndex + i < favourites.length) ){
               var newTweet = buildTweet(favourites[loadIndex + i]);

               /* id=index in array to easily build user profile on tweet click*/
               newTweet.attr('id', loadIndex + i);

               $(newTweet).appendTo("#tweetList");
               i++;

               /*if(loadIndex + i < favourites.length){
               //TODO find something cheeky to put at the end
                   $('.ui-block-a').append("<div><p>That's all folks!</p></div>"); //will only execute once
               } */
           }
           $('#tweetList').listview('refresh')
    }

    /*infinite Scroll*/
    $(window).scroll(function(){
       if( $(window).scrollTop() == $(document).height() - $(window).height()){
           //load more post
           populateMain();
       }
    });


    /*load the tweets from the local file*/
    $.getJSON('./favs.json', function(data){
        favourites = data;
        populateMain();
    });


    //TODO implement: event handler for scrolling, call populateMain() on scroll down.
    //$(something).something(function(){ populateMain(); }

    //TODO implement event handler for click on chevron in list view , expands user info
    /* this guy: <span class="ui-icon ui-icon-arrow-r ui-icon-shadow"> </span>
    the <li> element it's in has and id # that is the index of the tweetObject in the JSON array
    to make looking up user info easier */

    //TODO implement lightbox popup for links to pictures


});
