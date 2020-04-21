import Vue from 'vue';
window.Vue = Vue;

Vue.config.devtools = true;

import VueResource from 'vue-resource';
Vue.use(VueResource);

import HawkSearchVue from "./HawkSearchVue";
window.HawkSearchVue = HawkSearchVue;

import "./widgets";