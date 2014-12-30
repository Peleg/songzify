(function (d, w, newLink, link) {

  'use strict';

  var _selectors = {
    thumbLink       : 'li.miniplayer-track-action.thumb-up',
    songContainer   : '.miniplayer-info-track-title',
    artistContainer : '.miniplayer-info-artist-name'
  };

  d.addEventListener('DOMSubtreeModified', getThumb);

  function getThumb (e) {
    newLink = d.querySelector(_selectors.thumbLink);
    if (!newLink) return;

    link && link.removeEventListener('click', logVote);
    link = newLink;
    link.addEventListener('click', logVote);
  }

  // can also get from page title
  function nowPlaying () {
    return {
      song   : d.querySelector(_selectors.songContainer).innerText,
      artist : d.querySelector(_selectors.artistContainer).innerText.slice(3), // remove 'by '
      time   : +new Date()
    };
  }

  function logVote () {
    var data = nowPlaying();
    chrome.runtime.sendMessage({
      cmd  : 'saveSong',
      data : data
    }, function () { // on response
      console.clear();
      console.log("LIKED " + data.artist + " : " + data.song);
    });
  }

})(document, window);
