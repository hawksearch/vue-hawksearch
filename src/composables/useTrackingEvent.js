import { inject, provide } from 'vue';
import TrackingEvent from "../TrackingEvent";

const trackingEventKey = Symbol('trackingEvent');

export function provideTrackingEvent(config) {
  const trackEvent = config && config.trackEventUrl
    ? new TrackingEvent(config)
    : null;

  provide(trackingEventKey, trackEvent);
  return trackEvent;
}

export default function useTrackingEvent() {
  return { trackEvent: inject(trackingEventKey, null) };
}
