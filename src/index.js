import { createApp } from 'vue';
import moment from 'moment-mini';
import HawksearchVue from "./HawksearchVue";
import '@/styles/app.scss';

window.Vue = { createApp, config: {} };
window.HawksearchVue = HawksearchVue;
window.moment = moment;

const app = createApp(HawksearchVue);

const eventBus = {
  events: {},
  on(event, callback) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  },
  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  },
  emit(event, ...args) {
    if (!this.events[event]) return;
    this.events[event].forEach(cb => cb(...args));
  }
};

app.config.globalProperties.$bus = eventBus;
const vm = app.mount('#app');

const root = vm.$root || vm;
if (!root.$on) {
  root.$on = eventBus.on.bind(eventBus);
  root.$off = eventBus.off.bind(eventBus);
  root.$emit = eventBus.emit.bind(eventBus);
}

export default HawksearchVue;
