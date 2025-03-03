import { ref } from 'vue';
import TrackingEvent from "../TrackingEvent";

const trackEvent = ref(null);

export default function useTrackingEvent() {
  function createTrackEvent(config) {
    if (config && config.trackEventUrl) {
      trackEvent.value = new TrackingEvent(config);
    }
    return trackEvent.value;
  }

  return { createTrackEvent, trackEvent };
}
