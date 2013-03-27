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
        var tweetContainer = $('<div/>', {
            'class':'tweet-container'
        });
        //TODO: implement
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

               $('.ui-block-a').append(newTweet);
               i++;
               if(loadIndex + i < favourites.length){
                   $('.ui-block-a').append("<div><p>That's all folks!</p></div>"); //will only execute once
               }
           }
    }

    /*load the tweets from the local file*/
    $.getJSON('./favs.json', function(data){
        favourites.push(data);
        populateMain();
    });


    //TODO implement: event handler for scrolling, call populateMain() on scroll down.
    //$(something).something(function(){ populateMain(); }


});
