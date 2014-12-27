
/**
 * Util:
 * Module to contain common methods for repeat use.
 */

(function (d, w) {

  'use strict';

  w.Util = {

    /**
     * returns a function which executes CB once it was called the same num of
     * times as it was invoked
     */

    // not used anywhere, after removed from Auth.signIn
    whenDone: function (cb) {
      var _stringCb = cb.toString();
      var _this = this;
      this.whenDone[_stringCb] || (this.whenDone[_stringCb] = 0);
      this.whenDone[_stringCb]++; //increment everytime its called
      return function () {
        // decrement count everytime callback is called.
        // when got to 0 (callback was called the same number of times whenDone
        // was invoked), invoke the actual callback (cb).
        --_this.whenDone[_stringCb] || (delete _this.whenDone[_stringCb] && cb());
      }
    },

    /**
     * sets up local storage namespace if doesnt exist yet
     */
    setupLocalStorage: function (namespace) {
      localStorage[namespace] || (localStorage[namespace] = JSON.stringify({}));
    },

    /**
     * deletes from LS
     */
    deleteLS: function (namespace, key) {
      return localStorage[namespace] && key ?
        setLS(namespace, key, null) :
        delete localStorage[namespace];
    },
    /**
     * localStorage getter
     */
    getLS: function (namespace, key) {
      this.setupLocalStorage(namespace);
      return JSON.parse(localStorage[namespace])[key];
    },

    /**
     * localStorage setter
     */
    setLS: function (namespace, key, value) {
      this.setupLocalStorage(namespace);
      var ls = JSON.parse(localStorage[namespace]);
      value
        ? ls[key] = value
        : delete ls[key];
      localStorage[namespace] = JSON.stringify(ls);
      return value;
    },

    /**
     * turn JSON into query string
     */
    parameterize: function (obj) {
      return Object.keys(obj).map(function(k) {
          return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])
      }).join('&');
    },

    /**
     * xhr requests
     */
    request: function (method, url, headers, query, cb) {
      var xhr = new XMLHttpRequest();

      headers['Content-Type'] || (headers['Content-Type'] = 'application/x-www-form-urlencoded');

      if (query && typeof query === 'object') {
        query = this.parameterize(query);
      }

      if (method === 'GET') {
        query && (url += '?' + query);
        query = null;
      }

      xhr.open(method, url, true);

      for (var key in headers) {
        xhr.setRequestHeader(key, headers[key]);
      }

      xhr.onload = function () {
        if (!~[200, 201, 202].indexOf(xhr.status))
          console.error('ERRORED: ' + xhr.responseText);
        typeof cb === 'function' && cb(JSON.parse(xhr.responseText));
      };

      xhr.send(query);
    }

  }
})(document, window);
