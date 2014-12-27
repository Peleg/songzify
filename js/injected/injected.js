(function (d, w, thumbLink) {

  'use strict';

  var _selectors = {
    thumbLink       : '.ui-icon-thumb-up',
    songContainer   : '.fullplayer-info-track-title',
    artistContainer : '.fullplayer-info-artist-name'
  };

  d.addEventListener('DOMSubtreeModified', getThumb);

  function getThumb () {
    thumbLink = d.querySelector(_selectors.thumbLink);
    if (!thumbLink) return;

    d.removeEventListener('DOMSubtreeModified', getThumb);
    thumbLink.addEventListener('click', logVote);
  }

  // can also get from page title
  function nowPlaying () {
    return {
      song   : d.querySelector(_selectors.songContainer).innerText,
      artist : d.querySelector(_selectors.artistContainer).children[0].innerText,
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
