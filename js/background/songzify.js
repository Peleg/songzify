
//
// TODO:
// bind injected clicks to document (upvotes not working when song changes)
// upvote hotkey cmdshftU not working
// add desktop notifications
// figure out a fix for when accesstoken is expired w/o having to like the song again
// when adding new song to list, dont append li's, replace them
//
// tidy up code
// add notification saying song has been added to spotify
// add readme to GH
// add to chrome extension store
// add styling
//

/**
 *
 * Songzify:
 *
 */

(function (auth, spotify) {

  'use strict';

  function init () {
    auth = new Auth();
    spotify = new Spotify(auth);
    bindUpvotes();
  }

  /**
   * Binds listener to clicks on upvote
   */
  function bindUpvotes () {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      if (request.cmd !== 'saveSong') return;
      spotify.addSong(request.data);
      sendResponse();
    });
  }

  function addToLS (data) {
    var songs = JSON.parse(localStorage.songs || '[]');
    songs.push(data);
    localStorage.songs = JSON.stringify(songs);
  }

  init();

})();
