import { ref } from 'vue';
import TrackingEvent from "../TrackingEvent";

export default function useTrackingEvent() {
  const trackEvent = ref(null);

  function createTrackEvent(config) {
    if (config && config.trackEventUrl) {
      trackEvent.value = new TrackingEvent(config);
    }
    return trackEvent.value;
  }

  return { createTrackEvent, trackEvent };
}
