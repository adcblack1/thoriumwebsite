/**
 * Meta Pixel tracking utility
 * Fires standard events via the fbq global, with an image-pixel fallback.
 */

const PIXEL_ID = '773797471916037';

/**
 * Fire a standard Meta Pixel event.
 * Uses window.fbq if available, otherwise falls back to a 1x1 tracking pixel.
 */
export function trackEvent(eventName: string, params?: Record<string, string>) {
  if (typeof window === 'undefined') return;

  // Method 1: Use fbq if loaded
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fbq = (window as any).fbq;
    if (typeof fbq === 'function') {
      fbq('track', eventName, params || {});
      console.log(`[Meta Pixel] Tracked "${eventName}" via fbq`, params || '');
      return;
    }
  } catch (e) {
    console.warn('[Meta Pixel] fbq call failed:', e);
  }

  // Method 2: Fallback — fire a 1x1 image pixel directly
  try {
    const url = new URL('https://www.facebook.com/tr');
    url.searchParams.set('id', PIXEL_ID);
    url.searchParams.set('ev', eventName);
    url.searchParams.set('noscript', '1');
    if (params) {
      url.searchParams.set('cd', JSON.stringify(params));
    }
    const img = new Image(1, 1);
    img.src = url.toString();
    console.log(`[Meta Pixel] Tracked "${eventName}" via image fallback`, params || '');
  } catch (e) {
    console.warn('[Meta Pixel] image fallback failed:', e);
  }
}

/**
 * Fire a custom Meta Pixel event (uses fbq('trackCustom')).
 */
export function trackCustomEvent(eventName: string, params?: Record<string, string>) {
  if (typeof window === 'undefined') return;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fbq = (window as any).fbq;
    if (typeof fbq === 'function') {
      fbq('trackCustom', eventName, params || {});
      console.log(`[Meta Pixel] Tracked custom "${eventName}" via fbq`, params || '');
      return;
    }
  } catch (e) {
    console.warn('[Meta Pixel] fbq trackCustom failed:', e);
  }

  // Fallback — image pixel
  try {
    const url = new URL('https://www.facebook.com/tr');
    url.searchParams.set('id', PIXEL_ID);
    url.searchParams.set('ev', eventName);
    url.searchParams.set('noscript', '1');
    if (params) {
      url.searchParams.set('cd', JSON.stringify(params));
    }
    const img = new Image(1, 1);
    img.src = url.toString();
    console.log(`[Meta Pixel] Tracked custom "${eventName}" via image fallback`, params || '');
  } catch (e) {
    console.warn('[Meta Pixel] image fallback failed:', e);
  }
}

/**
 * Track a Lead event (fires on Step 1 — email submit).
 * Used for general tracking/analytics. Do NOT optimize Meta campaigns toward this.
 */
export function trackLead() {
  trackEvent('Lead');
}

/**
 * Track a QualifiedLead — fires ONLY when the subscriber matches ICP.
 * This is the event you optimize Meta campaigns toward.
 * Custom Conversion ID in Meta: 1525148129028608
 *
 * ICP blocklist: do NOT fire if seniority === 'Student' or company_size === 'Just me'
 */
export function trackQualifiedLead(surveyData: {
  seniority: string;
  company_size: string;
  main_goal?: string;
  job_function?: string;
  industry?: string;
}) {
  // ICP filter — block unqualified leads
  if (surveyData.seniority === 'Student') return;
  if (surveyData.company_size === 'Just me') return;

  trackCustomEvent('QualifiedLead', {
    seniority: surveyData.seniority,
    company_size: surveyData.company_size,
    ...(surveyData.main_goal && { main_goal: surveyData.main_goal }),
    ...(surveyData.job_function && { job_function: surveyData.job_function }),
    ...(surveyData.industry && { industry: surveyData.industry }),
  });
}
