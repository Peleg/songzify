
/**
 *
 * Auth:
 * Handles authorization and authentication of Spotify user.
 *
 */

(function (d, w) {

  'use strict';

  var _namespace = 'auth';

  var _spotifyEP  = 'https://api.spotify.com/v1/';

  function Auth () {
    this.accessToken  =
    this.refreshToken =
    this.playlistId   =
    this.userId       = null;
  }

  Auth.prototype.isSignedIn = function () {
    return !!(
      this.getAccessToken() &&
      this.getUserId() &&
      this.getPlaylistId()
    );
  }

  // TODO: make user customizable
  var _playlistName = 'Songzify';

  Auth.prototype.signIn = function (cb) {
    var _this = this;
    this.signOut();
    this.requestAuthorization(function () {
      _this.requestUserId(function () {
        if (_this.getPlaylistId()) {
          typeof cb === 'function' && cb();
        } else {
          _this.requestPlaylistId(_playlistName, cb);
        }
      });
    });
  }

  Auth.prototype.signOut = function () {
    this.setAccessToken(null);
  }

  /**
   * LocalStorage
   */
  Auth.prototype.setLS = function (key, value) {
    return Util.setLS(_namespace, key, value);
  }

  Auth.prototype.getLS = function (key) {
    return Util.getLS(_namespace, key);
  }

  /**
   * AccessToken
   */
  Auth.prototype.getAccessToken = function () {
    return this.accessToken || (this.accessToken = this.getLS('accessToken'));
  }

  Auth.prototype.setAccessToken = function (token) {
    return this.accessToken = this.setLS('accessToken', token);
  }

  /**
   * RefreshToken
   */
  Auth.prototype.getRefreshToken = function () {
    return this.refreshToken || (this.refreshToken = this.getLS('refreshToken'));
  }

  Auth.prototype.setRefreshToken = function (token) {
    return this.refreshToken = this.setLS('refreshToken', token);
  }

  /**
   * PlaylistId
   */
  Auth.prototype.getPlaylistId = function () {
    return this.playlistId || (this.playlistId = this.getLS('playlistId'));
  }

  Auth.prototype.setPlaylistId = function (token) {
    return this.playlistId = this.setLS('playlistId', token);
  }

  /**
   * UserId
   */
  Auth.prototype.getUserId = function () {
    return this.userId || (this.userId = this.getLS('userId'));
  }

  Auth.prototype.setUserId = function (token) {
    return this.userId = this.setLS('userId', token);
  }

  /**
   * PROFILE DETAILS
   */

  /**
   * gets currently signed in user id from spotify
   */
  Auth.prototype.requestUserId = function (cb) {
    var _this = this;
    Util.request('GET', _spotifyEP + 'me', {
      'Authorization' : 'Bearer ' + this.getAccessToken()
    }, null, function (responseJSON) {
      _this.setUserId(responseJSON.id);
      typeof cb === 'function' && cb();
    });
  }

  /**
   * request playlist ID from spotify and sets it in LS
   * creates one if doesnt exist
   *
   * TODO: should paginate, and look over all playlists. Not just first 50
   *
   * NOTE: Spotify seems to cache playlist names. So when this method is called
   * within short time interval, it may create multiple playlists of the same name
   */
  Auth.prototype.requestPlaylistId = function (name, cb) {
    var _this = this;
    var EP = _spotifyEP + 'users/' + this.getUserId() + '/playlists';
    Util.request('GET', EP, {
      'Authorization' : 'Bearer ' + this.getAccessToken()
    }, {
      'limit': 50
    }, function (responseJSON) {
      var userPlaylists = responseJSON.items;
      for (var i = 0; i < userPlaylists.length; i++) {
        if (userPlaylists[i].name === _playlistName) {
          _this.setPlaylistId(userPlaylists[i].id);
          typeof cb === 'function' && cb();
          return;
        }
      }
      // Create the playlist:
      Util.request('POST', EP, {
        'Authorization' : 'Bearer ' + _this.getAccessToken(),
        'Content-Type'  : 'application/json'
      }, JSON.stringify({
        'name'   : _playlistName,
        'public' : false
      }), function (responseJSON) {
        _this.setPlaylistId(responseJSON.id);
        typeof cb === 'function' && cb();
      });
    });
  };

  /**
   * OAUTH LOGIC
   * TODO: move to own file
   */

  var _redirectURI     = chrome.extension.getURL('html/oauth.html');
  var _scope           = 'playlist-modify-private';
  var _spotifyAcctEP   = 'https://accounts.spotify.com/';
  var _spotifyTokenURI = _spotifyAcctEP + 'api/token';
  var _spotifyAuthURI  = _spotifyAcctEP + 'authorize?' +
                        'client_id=' + Config._clientId +
                        '&response_type=code' +
                        '&redirect_uri=' + _redirectURI +
                        '&scope=' + _scope;

  /**
   * opens a new tab with spotify's auth
   */
  Auth.prototype._requestAuth = function (cb) {
    chrome.tabs.create({
      url: _spotifyAuthURI
    });
    chrome.tabs.onUpdated.addListener(this._callbackHandler.bind(this, cb));
  };

  /**
   * handles redirect back from spotify auth.
   */
  Auth.prototype._callbackHandler = function (cb) {
    // get tab with this extension's url
    var _this = this;
    chrome.tabs.query({
      'url': _redirectURI + '?code=*'
    }, function(tabs) {
      if (tabs && tabs.length) {
        var url = tabs[0].url;
        var code = url.slice(url.indexOf('code=') + 5);
        chrome.tabs.onUpdated.removeListener(_this._callbackHandler.bind(_this, cb));
        chrome.tabs.remove(tabs[0].id);
        _this._requestTokens(code, cb);
      }
    });
  };

  /**
   * uses auth code to generate accessToken and refreshToken
   */
  Auth.prototype._requestTokens = function (code, cb) {
    var _this = this;
    Util.request('POST', _spotifyTokenURI, {
      'Authorization' : 'Basic ' + btoa(Config._clientId + ':' + Config._clientSecret)
    }, {
      'grant_type'   : 'authorization_code',
      'code'         : code,
      'redirect_uri' : _redirectURI
    }, function (responseJSON) {
      var accessToken = responseJSON.access_token;
      var refreshToken = responseJSON.refresh_token;
      _this.setAccessToken(accessToken);
      _this.setRefreshToken(refreshToken);
      typeof cb === 'function' && cb();
    })
  };

  /**
   * used to get new accessToken when there is a refreshToken
   */
  Auth.prototype._requestAccessToken = function (refreshToken, cb) {
    var _this = this;
    Util.request('POST', _spotifyTokenURI, {
      'Authorization' : 'Basic ' + btoa(Config._clientId + ':' + Config._clientSecret)
    }, {
      'grant_type'    : 'refresh_token',
      'refresh_token' : refreshToken
    }, function (responseJSON) {
      var accessToken = responseJSON.access_token;
      _this.setAccessToken(accessToken);
      typeof cb === 'function' && cb();
    });
  };

  Auth.prototype.requestAuthorization = function (cb) {
    var _this;
    if (this.getRefreshToken()) {
      this._requestAccessToken(this.getRefreshToken(), cb)
    } else {
      this._requestAuth(cb);
    }
  };

  w.Auth = Auth;

})(document, window);
