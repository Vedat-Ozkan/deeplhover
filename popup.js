'use strict';

//interact user setting,
//save and load setting from background.js

import "typeface-roboto/index.css"; //font for vuetify
import 'vuetify/dist/vuetify.min.css'; //vuetify css
import Vue from 'vue'; 
import App from './popup.vue';
import Vuetify from 'vuetify'; 

Vue.use(Vuetify);

new Vue({
  el: "#app",
  vuetify: new Vuetify({}),
  render: h => h(App),
})