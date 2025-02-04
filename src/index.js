import HawksearchVue from './HawksearchVue';
import { version } from './version';

HawksearchVue.version = version;

if (typeof window !== 'undefined') {
  window.HawksearchVue = HawksearchVue;
}

if (typeof window !== 'undefined') {
  window.moment = moment;
}

HawksearchVue.init();

import './styles/app.scss';

export * from './components';
export { default as tConfig } from './i18n';
export { default as TrackingEvent } from './TrackingEvent';

export const arrayMax = (arr) => Math.max(...arr);
export const arrayMin = (arr) => Math.min(...arr);

export default HawksearchVue;
