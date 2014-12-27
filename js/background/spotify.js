(function (d, w) {

  'use strict';

  var _spotifyEP  = 'https://api.spotify.com/v1/';
  var _searchEP   = _spotifyEP + 'search';

  function Spotify (auth) {
    this.auth = auth;
    this.playlistId = auth.getPlaylistId();
    this.userId = auth.getUserId();
  }

  /**
   * Adds song to Spotify. If not signed in, signs in, then add songs.
   */
  Spotify.prototype.addSong = function (songData, cb) {
    var _this = this;
    this.requestSongUri(songData, function (responseJSON) {
      var song = responseJSON.tracks.items[0];
      if (!song) return console.error('song not found');

      var cb = function () {
        _this.addToLS(songData);
      };

      if (_this.auth.isSignedIn()) {
        _this.addToPlaylist(song.uri, cb);
      } else {
        _this.auth.signIn(function () {
          _this.addToPlaylist(song.uri, cb);
        });
      }
    });
  };

  /**
   * Gets song uri from spotify
   */
  Spotify.prototype.requestSongUri = function (songData, cb) {
    var q = 'q=artist:' + songData.artist +
            ' track:' + songData.song +
            '&type=track' +
            '&limit=1';
    this.request('GET', _searchEP, {}, encodeURI(q), cb);
  };

  Spotify.prototype.addToPlaylist = function (songURI, cb) {
    var _addTrackEP = _spotifyEP + 'users/' +
      this.auth.getUserId() + '/playlists/' +
      this.auth.getPlaylistId() + '/tracks';
    var _this = this;
    var q = { uris: [songURI] };

    this.request('POST', _addTrackEP, {
      'Authorization' : 'Bearer ' + this.auth.getAccessToken(),
      'Content-Type'  : 'application/json'
    }, JSON.stringify(q), cb);
  };

  Spotify.prototype.addToLS = function (songData) {
    var songs = Util.getLS('songs', 'tracks') || [];
    songs.push(songData);
    Util.setLS('songs', 'tracks', songs);
  };

  /**
   * wrapper to Util.request. If error is due to old access token, sign user out
   * so Auth will signin again before continuing
   */
  Spotify.prototype.request = function () {
    var _this = this;
    var args = [].slice.call(arguments);
    var cb = args[Util.request.length - 1];
    args[Util.request.length - 1] = function (responseJSON) {
      responseJSON.error && responseJSON.error.message === 'The access token expired'
        ? _this.auth.signOut()
        : typeof cb === 'function' && cb(responseJSON);
    };
    Util.request.apply(Util, args);
  };

  w.Spotify = Spotify;

})(document, window);
