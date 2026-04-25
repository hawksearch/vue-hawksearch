import { createApp } from 'vue';
import HawksearchVue from "./HawksearchVue";
import '@/styles/app.scss'

window.Vue = { createApp, config: {} };
window.HawksearchVue = HawksearchVue;

Array.prototype.max = function max() {
  return Math.max.apply(null, this);
};

Array.prototype.min = function min() {
  return Math.min.apply(null, this);
};

export default HawksearchVue;
