type AnalyticsValue = string | number | boolean;

type AnalyticsParams = Record<string, AnalyticsValue | undefined>;

const getGtag = () =>
  typeof window !== 'undefined' && typeof window.gtag === 'function'
    ? window.gtag
    : null;

export const trackEvent = (eventName: string, params: AnalyticsParams = {}) => {
  const gtag = getGtag();
  if (!gtag) return;

  gtag('event', eventName, params);
};

export const trackLeadEvent = (
  eventName: string,
  params: AnalyticsParams = {},
) => {
  trackEvent(eventName, {
    transport_type: 'beacon',
    ...params,
  });
};
