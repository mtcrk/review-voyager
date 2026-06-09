const trackEvent = (eventName, params = {}) => {
  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params);
    }
  } catch {
  }
};
export {
  trackEvent
};
