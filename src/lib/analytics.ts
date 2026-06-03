// GA4 event helper — safe call regardless of gtag availability
export const trackEvent = (
  eventName: string,
  params: Record<string, any> = {}
) => {
  try {
    if (typeof (window as any).gtag === "function") {
      (window as any).gtag("event", eventName, params);
    }
  } catch {
    // no-op
  }
};