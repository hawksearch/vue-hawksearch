import Vue from 'vue';
window.Vue = Vue;

Vue.config.devtools = true;

import HawksearchVue from "./HawksearchVue";
window.HawksearchVue = HawksearchVue;
window.moment = require('moment-mini');

HawksearchVue.init();

import 'styles/app.scss';

export * from './components';

export { default as tConfig } from './i18n';
export { default as TrackingEvent } from './TrackingEvent';

Array.prototype.max = function max() {
  return Math.max.apply(null, this);
};

Array.prototype.min = function min() {
  return Math.min.apply(null, this);
};

export default HawksearchVue;