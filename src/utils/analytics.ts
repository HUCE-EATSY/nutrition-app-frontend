type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

export function trackEvent(name: string, payload?: AnalyticsPayload) {
  if (__DEV__) {
    console.log(`[analytics] ${name}`, payload ?? {});
  }
}
