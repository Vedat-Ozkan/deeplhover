<template>
  <v-app id="app" v-cloak color="#7A93AC">
    <v-card dark flat>
      <v-toolbar color="#102b46" elevation="1">
        <v-toolbar-title>DeepL Hover</v-toolbar-title>
      </v-toolbar>
      <v-list flat id="settingListBox" color="#617073">
        <v-list-item v-for="(value, name) in settingList" :key="name">
          <v-select
            color="#7A93AC"
            v-model="selectedList[name]"
            :items="Object.keys(value.optionList)"
            :label="value.description"
            @change="onSelectChange($event, name)"
          ></v-select>
        </v-list-item>
      </v-list>
    </v-card>
  </v-app>
</template>

<script>
var sourceLangList = {
  Bulgarian: "BG",
  Czech: "CS",
  Danish: "DA",
  German: "DE",
  Greek: "EL",
  English: "EN",
  Spanish: "ES",
  Estonian: "ET",
  Finnish: "FI",
  French: "FR",
  Hungarian: "HU",
  Italian: "IT",
  Japanese: "JA",
  Lithuanian: "LT",
  Latvian: "LV",
  Dutch: "NL",
  Polish: "PL",
  "Portuguese - All varieties": "PT",
  Romanian: "RO",
  Russian: "RU",
  Slovak: "SK",
  Slovenain: "SL",
  Swedish: "SV",
  Chinese: "ZH",
};

var targetLangList = JSON.parse(JSON.stringify(sourceLangList)); //copy
sourceLangList["Auto Detect"] = "";
targetLangList["English (British)"] = "EN-GB";
targetLangList["English (US)"] = "EN-US";
targetLangList["Portuguese (Brazilian)"] = "PT-BR";
targetLangList["Portuguese (Non-Brazilian)"] = "PT-PT";

var toggleList = {
  On: "true",
  Off: "false",
};

var tooltipFontSizeList = {}; //font size 5 to 20
for (let i = 5; i < 21; i++) {
  tooltipFontSizeList[i] = i;
}

var tooltipWidth = {};
for (let i = 100; i < 600; i += 100) {
  tooltipWidth[i] = i;
}

var settingList = {
  useTooltip: {
    description: "Enable Tooltip",
    optionList: toggleList,
  },
  translateSource: {
    description: "Translate From",
    optionList: sourceLangList,
  },
  translateTarget: {
    description: "Translate Into",
    optionList: targetLangList,
  },
  tooltipFontSize: {
    description: "Tooltip Font Size",
    optionList: tooltipFontSizeList,
  },
  tooltipWidth: {
    description: "Tooltip Width",
    optionList: tooltipWidth,
  },
};

export function getSettingFromStorage() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(Object.keys(defaultList), function(loadedSetting) {
      //load setting
      var currentSetting = {};
      for (var key in defaultList) {
        if (loadedSetting[key]) {
          //if value exist, load. else load defualt val
          currentSetting[key] = loadedSetting[key];
        } else {
          currentSetting[key] = defaultList[key];
        }
      }
      resolve(currentSetting);
    });
  });
}


export default {
  name: "app",
  data: function () {
    return {
      settingList: settingList,
      selectedList: {},
      showAbout: false,
      currentSetting: {},
    };
  },
  async beforeCreate() {
    this.currentSetting = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: "loadSetting",
        },
        (response) => {
          resolve(response);
        }
      );
    });

    this.loadSelectListFromSetting();
  },
  methods: {
    loadSelectListFromSetting() {
      var result = {}
      //transform currentSetting(name:option_select_id) to selectedList(name:option_select_name)
      for (const [key_option_id, val_selected_id1] of Object.entries(this.currentSetting)) {
        for (const [key_selected_name, val_selected_id2] of Object.entries(settingList[key_option_id]["optionList"])) {
          if (val_selected_id1 == val_selected_id2) {
            result[key_option_id] = key_selected_name;
          }
        }
      }
      this.selectedList = result;
    },
    onSelectChange(event, name) {
      this.currentSetting[name] = settingList[name]["optionList"][event];
      this.changeSetting();
    },
    changeSetting() {
      chrome.runtime.sendMessage(
        {
          //save setting from background.js
          type: "saveSetting",
          options: this.currentSetting,
        },
        (response) => {}
      );
    },
  },
};
</script>
