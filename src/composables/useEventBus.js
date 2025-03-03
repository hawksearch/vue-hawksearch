const listeners = new Map();

export default function useEventBus() {
  function emit(event, payload = null) {
    if (listeners.has(event)) {
      listeners.get(event).forEach((callback) => callback(payload));
    }
  }

  function on(event, callback) {
    if (!listeners.has(event)) {
      listeners.set(event, []);
    }
    listeners.get(event).push(callback);
  }

  function off(event, callback) {
    if (listeners.has(event)) {
      listeners.set(
        event,
        listeners.get(event).filter((cb) => cb !== callback)
      );
    }
  }

  return { emit, on, off };
}
