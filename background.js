"use strict";

//tooltip background===========================================================================

let bingAccessToken;
var currentSetting = {};
var defaultList = {
  useTooltip: "true",
  translateSource: "auto",
  translateTarget: "En", // chrome.window.navigator.language,
  tooltipFontSize: "14",
  tooltipWidth: "200",
};

var bingLangCode = {
  auto: "auto-detect",
  af: "af",
  am: "am",
  ar: "ar",
  az: "az",
  bg: "bg",
  bs: "bs",
  ca: "ca",
  cs: "cs",
  cy: "cy",
  da: "da",
  de: "de",
  el: "el",
  en: "en",
  es: "es",
  et: "et",
  fa: "fa",
  fi: "fi",
  fr: "fr",
  ga: "ga",
  gu: "gu",
  hi: "hi",
  hmn: "mww",
  hr: "hr",
  ht: "ht",
  hu: "hu",
  hy: "hy",
  id: "id",
  is: "is",
  it: "it",
  iw: "he",
  ja: "ja",
  kk: "kk",
  km: "km",
  kn: "kn",
  ko: "ko",
  ku: "ku",
  lo: "lo",
  lt: "lt",
  lv: "lv",
  mg: "mg",
  mi: "mi",
  ml: "ml",
  mr: "mr",
  ms: "ms",
  mt: "mt",
  my: "my",
  ne: "ne",
  nl: "nl",
  no: "nb",
  pa: "pa",
  pl: "pl",
  ps: "ps",
  pt: "pt",
  ro: "ro",
  ru: "ru",
  sk: "sk",
  sl: "sl",
  sm: "sm",
  sq: "sq",
  sr: "sr-Cyrl",
  sv: "sv",
  sw: "sw",
  ta: "ta",
  te: "te",
  th: "th",
  tl: "fil",
  tr: "tr",
  uk: "uk",
  ur: "ur",
  vi: "vi",
  "zh-CN": "zh-Hans",
  "zh-TW": "zh-Hant",
};

//listen from contents js and background js =========================================================================================================
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  (async () => {
    if (request.type === "translate") {
      doTranslate(request, sendResponse);
    } else if (request.type === "saveSetting") {
      chrome.storage.local.set(request.options, function () {
        currentSetting = request.options;
      });
    } else if (request.type === "loadSetting") {
      loadSetting(sendResponse);
    }
  })();
  return true;
});

function loadSetting(callback) {
  chrome.storage.local.get(Object.keys(defaultList), function (options) {
    //load setting
    for (const key in defaultList) {
      if (options[key]) {
        //if value exist, load. else load defualt val
        currentSetting[key] = options[key];
      } else {
        currentSetting[key] = defaultList[key];
      }
    }
    if (typeof callback !== "undefined") {
      callback(currentSetting);
    }
  });
}

loadSetting();

async function doTranslate(request, sendResponse) {
  const { token, key, IG, IID } = await getBingAccessToken();
  var detectedLang = "";
  var translatedText = "";
  var translatorUrl = "https://api-free.deepl.com/v2/translate?";
  var translatorData = {
    auth_key: process.env.API_KEY,
    text: request.word,
    source_lang: currentSetting["translateSource"],
    target_lang: request.translateTarget,
    split_sentences: 0,
  };

  var wordLang = "";
  let response = await postMessage(
    "https://www.bing.com/ttranslatev3?isVertical=1\u0026&",
    {
      text: request.word,
      fromLang: bingLangCode[currentSetting["translateSource"].toLowerCase()],
      to: bingLangCode[request.translateTarget.toLowerCase()],
      token,
      key,
      IG,
      IID: IID && IID.length ? IID + "." + bingAccessToken.count++ : "",
    }
  );
  console.log(response);

  if (response) {
    wordLang = response[0].detectedLanguage.language;
  }

  if (
    wordLang === translatorData.source_lang.toLowerCase() ||
    translatorData.source_lang === ""
  ) {
    console.log(translatorData);
    const deepLResponse = await postMessage(translatorUrl, 
      translatorData
    );
    console.log(deepLResponse);

    if (deepLResponse) {
      if (deepLResponse.translations) {
        translatedText += deepLResponse.translations[0].text;
      }
      detectedLang = deepLResponse.translations[0].detected_source_language;
      sendResponse({
        translatedText: translatedText,
        lang: detectedLang,
      });
    } else {
      sendResponse({
        translatedText: "",
        lang: "en",
      });
    }
  }
}

async function getBingAccessToken() {
  // https://github.com/plainheart/bing-translate-api/blob/dd0319e1046d925fa4cd4850e2323c5932de837a/src/index.js#L42
  try {
    //if no access token or token is timeout, get new token
    if (
      !bingAccessToken ||
      Date.now() - bingAccessToken["tokenTs"] >
        bingAccessToken["tokenExpiryInterval"]
    ) {
      const data = await fetch("https://www.bing.com/translator").then(
        (response) => response.text()
      );
      const IG = data.match(/IG:"([^"]+)"/)[1];
      const IID = data.match(/data-iid="([^"]+)"/)[1];
      const [_key, _token, interval, _isVertical, _isAuthv2] = JSON.parse(
        data.match(/params_RichTranslateHelper\s?=\s?([^\]]+\])/)[1]
      );
      bingAccessToken = {
        IG,
        IID,
        key: _key,
        token: _token,
        tokenTs: _key,
        tokenExpiryInterval: interval,
        isAuthv2: undefined,
        count: 0,
      };
    }
    return bingAccessToken;
  } catch (e) {
    console.log(e);
  }
}

async function postMessage(url, params) {
  console.log(url + new URLSearchParams(params));
  return await fetch(url + new URLSearchParams(params), {
    method: "POST",
  })
    .then((response) => response.json())
    .catch((err) => console.log(err));
}
