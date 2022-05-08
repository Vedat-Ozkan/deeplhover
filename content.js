'use strict';


import $ from "jquery";
import 'bootstrap/js/dist/tooltip';
var isUrl = require('is-url');

//init environment
var currentSetting = {};
var tooltipContainer;
var clientX = 0;
var clientY = 0;
var mouseTarget = null;
var activatedWord = null;
var doProcessPos = false;
var mouseMoved = false;
var settingLoaded = false;
var style = $("<style>").appendTo("head");

//use mouse position for tooltip position
$(document).mousemove(function(event) {
  clientX = event.clientX;
  clientY = event.clientY;
  mouseTarget = event.target;
  mouseMoved = true;
  setTooltipPosition();
});

document.addEventListener("visibilitychange", function() { 
  if (document.visibilityState === "hidden") {
    mouseMoved = false;
    hideTooltip();
  } else {
    activatedWord = null;
  }
});

//tooltip: init
$(function() {
  getSetting(); //load setting from background js

  $('<div/>', {
    id: 'mttContainer',
    class: 'bootstrapiso', //apply bootstrap isolation css using bootstrapiso class
    css: {
      "left": 0,
      "top": 0,
      "position": "fixed",
      "z-index": "100000200",
      "width": "500px",
      "margin-left": "-250px",
    }
  }).appendTo(document.body);

  tooltipContainer = $('#mttContainer');
  tooltipContainer.tooltip({
    placement: "top",
    container: "#mttContainer",
    trigger: "manual"
  });
});

//determineTooltipShowHide : word detection, show & hide
setInterval(async function() {
  if (document.visibilityState == "visible" && mouseMoved == true && settingLoaded == true && currentSetting["useTooltip"] != "false") { 
    var word = getMouseOverWord(clientX, clientY); //get mouse positioned text
    word = filterWord(word); //filter out one that is url,over 1000length,no normal char
    if (word.length != 0 && activatedWord != word) { 
      console.log(word);
      var response = await translateSentence(word, currentSetting["translateTarget"]);
      activatedWord = word;

      if (!response || response.translatedText == "") {
        hideTooltip();
      } else {
        tooltipContainer.attr('data-original-title', response.translatedText);
        doProcessPos = true;
        setTooltipPosition();
        tooltipContainer.tooltip("show");
      }

    } else if (word.length == 0 && activatedWord != null) { 
      activatedWord = null;
      tooltipContainer.tooltip("hide");
    }
  }
}, 1500);

function getMouseOverWord(clientX, clientY) {

  //get mouse positioned char
  var range = document.caretRangeFromPoint(clientX, clientY);
  //if no range or is not text, give null
  if (range == null || range.startContainer.nodeType !== Node.TEXT_NODE) {
    return "";
  }

  //expand char to get word,sentence,
  range.expand('textedit');
  range.setStartBefore(range.startContainer);
  range.setEndAfter(range.startContainer);

  //check mouse is actually in text bound rect
  var rect = range.getBoundingClientRect(); //mouse in word rect
  if (rect.left > clientX || rect.right < clientX ||
    rect.top > clientY || rect.bottom < clientY) {
    return "";
  }
  return range.toString();
}

function filterWord(word) {
  word = word.replace(/\s+/g, ' ').trim(); //replace whitespace as single space
  if (word.length > 1000 || //filter out text that has over 1000length
    isUrl(word) || //if it is url
    !/[^\s\d»«…~`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?\$\xA2-\xA5\u058F\u060B\u09F2\u09F3\u09FB\u0AF1\u0BF9\u0E3F\u17DB\u20A0-\u20BD\uA838\uFDFC\uFE69\uFF04\uFFE0\uFFE1\uFFE5\uFFE6]/g.test(word)) { // filter one that only include num,space and special char(include currency sign) as combination
    word = "";
  }
  return word;
}

function hideTooltip() {
  doProcessPos = false;
  tooltipContainer.tooltip("hide");
}

function setTooltipPosition() {
  if (activatedWord != null && doProcessPos == true) {
    tooltipContainer.css("transform", "translate(" + clientX + "px," + clientY + "px)");
  }
}

//send to background.js for background processing and setting handling 
function translateSentence(word, translateTarget) {
  return sendMessagePromise({
    type: 'translate',
    word: word,
    translateTarget: translateTarget,
  });
}

function getSetting() { //load setting from background js
  chrome.runtime.sendMessage({
      type: 'loadSetting'
    },
    response => {
      currentSetting = response;
      changeTooltipStyle(currentSetting);
      settingLoaded = true;
    }
  );
}

chrome.storage.onChanged.addListener(function(changes, namespace) { //update current setting value,
  for (var key in changes) {
    currentSetting[key] = changes[key].newValue;
  }
  changeTooltipStyle(currentSetting);
});

function changeTooltipStyle(setting) {
  style.html(`
    .bootstrapiso .tooltip {
      font-size: ` + setting["tooltipFontSize"] + `px;
    }
    .bootstrapiso .tooltip-inner {
      max-width: ` + setting["tooltipWidth"] + `px;
    }
    `);
}

function sendMessagePromise(item) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(item, response => {
      resolve(response);
    });
  });
}
