
/**
 *
 * Hotkeys:
 *
 * Binds keyboard keys to Songza actions.
 * To modify, make sure to change in manifest.json as well.
 *
 */

(function (d, w) {

  'use strict';

  var _selectors = {
    'play-pause' : '.miniplayer-control-play-pause',
    'next-track' : '.miniplayer-control-skip',
    'thumb-up'   : '.ui-icon-thumb-up'
  };

  chrome.commands.onCommand.addListener(executeCmd);

  function triggerClick(tabId, selector) {
    chrome.tabs.executeScript(tabId, {
      code: "document.querySelector('" + selector + "').click();"
    });
  }

  function executeCmd (cmd) {
    // query the open songza tab
    chrome.tabs.query({
      'url': '*://songza.com/*'
    }, function(tabs) {
      if (tabs && tabs.length) {
        triggerClick(tabs[0].id, _selectors[cmd]);
      }
    });
  }

})(document, window);
