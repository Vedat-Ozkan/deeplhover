'use strict';

// Some of the code from https://github.com/ttop32/MouseTooltipTranslator

//tooltip background===========================================================================

import $ from "jquery";

var currentSetting = {};
var defaultList = {
  "useTooltip": "true",
  "translateSource": "auto",
  "translateTarget": window.navigator.language,
  "tooltipFontSize": "14",
  "tooltipWidth": "200",
}

//listen from contents js and background js =========================================================================================================
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === 'translate') {
    doTranslate(request, sendResponse);
  } else if (request.type === 'saveSetting') {
    chrome.storage.local.set(request.options, function () {
      currentSetting = request.options;
    });
  } else if (request.type === 'loadSetting') {
    loadSetting(sendResponse);
  }
  return true;
});


function loadSetting(callback) {
  chrome.storage.local.get(Object.keys(defaultList), function (options) { //load setting
    $.each(defaultList, function (key, item) {
      if (options[key]) { //if value exist, load. else load defualt val
        currentSetting[key] = options[key];
      } else {
        currentSetting[key] = defaultList[key];
      }
    });
    if (typeof callback !== 'undefined') {
      callback(currentSetting);
    };
  });
}

loadSetting();

async function doTranslate(request, sendResponse) {
  var detectedLang = "";
  var translatedText = "";
  var translatorUrl = "https://api-free.deepl.com/v2/translate";
  var translatorData = {
    auth_key: process.env.API_KEY,
    text: request.word,
    source_lang: currentSetting["translateSource"],
    target_lang: request.translateTarget,
  };

  var wordLang = ""
  var detectLang = {
    q: request.word,
  }
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "https://translate.googleapis.com/translate_a/t?client=dict-chrome-ex",
    data: detectLang,
    success: function (res) {
      wordLang = res.ld_result.srclangs[0].substr(0, 2).toUpperCase()
      if (wordLang === translatorData.source_lang || translatorData.source_lang === "") {
        $.ajax({
          type: "POST",
          dataType: "json",
          url: translatorUrl,
          data: translatorData,
          success: function (res) {
            if (res.translations) {
              translatedText += res.translations[0].text;
            }
            detectedLang = res.translations[0].detected_source_language;
            sendResponse({
              "translatedText": translatedText,
              "lang": detectedLang
            });
          },
          error: function (xhr, status, error) {
            console.log({
              error: error,
              xhr: xhr
            });
            sendResponse({
              "translatedText": "",
              "lang": "en"
            });
          }
        });
      } else {
        sendResponse({
          "translatedText": "",
          "lang": "en"
        });
      }
    },
    error: function (xhr, status, error) {
      console.log({
        error: error,
        xhr: xhr
      });
      sendResponse({
        "translatedText": "",
        "lang": "en"
      });
    }
  });
}
