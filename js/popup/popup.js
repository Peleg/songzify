(function (d, w, el, link, form) {

  'use strict';

  function init () {
    el = d.getElementById('songs');
    link = d.getElementById('songs-toggle');
    form = d.getElementById('form');
    populateSongs();
    bindShowToggle();
    bindForm();
  }

  function bindForm (data, inputs) {
    inputs = form.getElementsByTagName('input');
    form.onsubmit = function (e) {
      e.preventDefault();
      data = {
        artist : inputs[0].value,
        song   : inputs[1].value,
        time   : +new Date()
      };
      chrome.runtime.sendMessage({
        cmd  : 'saveSong',
        data : data
      }, populateSongs);
    };
  }

  function bindShowToggle () {
    link.onclick = function (e) {
      e.preventDefault();
      (el.style.display === 'block' ? hide : show)();
    };

    function toggle (style, text) {
      el.style.display = style;
      link.innerText = text;
    }

    function show () {
      toggle('block', 'Hide songs');
    }

    function hide () {
      toggle('none', 'Show songs');
    }
  }

  function populateSongs () {
    var songs = localStorage.songs;
    if (!songs) return;
    songs = JSON.parse(songs);
    if (!songs.tracks || !songs.tracks.length) return;

    var li;
    var fragment = d.createElement('ul');

    songs.tracks.forEach(function (song) {
      li = d.createElement('li');
      li.innerText = song.artist + ' - ' + song.song;
      fragment.appendChild(li);
    });

    el.innerHTML = fragment.innerHTML;
  }

  w.onload = init;

})(document, window);
