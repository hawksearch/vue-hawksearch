import { createApp } from 'vue';
import moment from 'moment-mini';
window.Vue = { createApp, config: {} };

import HawksearchVue from "./HawksearchVue";

import '@/styles/app.scss'

window.HawksearchVue = HawksearchVue;
window.moment = moment;

Array.prototype.max = function max() {
  return Math.max.apply(null, this);
};

Array.prototype.min = function min() {
  return Math.min.apply(null, this);
};

export default HawksearchVue;
