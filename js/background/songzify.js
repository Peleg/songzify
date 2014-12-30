
//
// TODO:
// upvote hotkey cmdshftU not working
// add desktop notifications
// let users enter playlistId from popup. lookup is shitty
// if song not found, try free form search!
// dont allow dups
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
