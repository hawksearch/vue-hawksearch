import Vue from 'vue';
window.Vue = Vue;

Vue.config.devtools = true;

import VueResource from 'vue-resource';
Vue.use(VueResource);

import HawksearchVue from "./HawksearchVue";
window.HawksearchVue = HawksearchVue;

import 'styles/app.scss';

export * from "./widgets";
export * from './components';
export { default as HawksearchStore } from './store';
export { default as tConfig } from './i18n';
export default HawksearchVue;
