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
 * Optional eventId for CAPI deduplication.
 */
export function trackCustomEvent(eventName: string, params?: Record<string, string>, eventId?: string) {
  if (typeof window === 'undefined') return;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fbq = (window as any).fbq;
    if (typeof fbq === 'function') {
      if (eventId) {
        fbq('trackCustom', eventName, params || {}, { eventID: eventId });
      } else {
        fbq('trackCustom', eventName, params || {});
      }
      console.log(`[Meta Pixel] Tracked custom "${eventName}" via fbq`, params || '', eventId ? `(eventID: ${eventId})` : '');
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
 * Advanced matching is now handled server-side via CAPI.
 * The CAPI route sends the hashed email directly to Meta, which is more
 * reliable than client-side matching and avoids the fbq('init') double-fire bug.
 *
 * This function is kept as a no-op so existing call sites don't break.
 */
export function setAdvancedMatching(_email: string) {
  // No-op: CAPI sends hashed email server-side for matching.
  // Do NOT call fbq('init') here — it creates a duplicate pixel instance.
}

/**
 * Track a Lead event (fires at Step 9 — survey completion).
 * This is the primary optimization event for Meta campaigns.
 * Includes value/currency for ROAS calculations.
 * Pass eventId to deduplicate with the server-side CAPI event.
 */
export function trackLead(eventId?: string) {
  if (typeof window === 'undefined') return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fbq = (window as any).fbq;
    if (typeof fbq === 'function') {
      if (eventId) {
        fbq('track', 'Lead', { value: 5, currency: 'USD' }, { eventID: eventId });
      } else {
        fbq('track', 'Lead', { value: 5, currency: 'USD' });
      }
      console.log(`[Meta Pixel] Tracked "Lead" via fbq`, eventId ? `(eventID: ${eventId})` : '');
      return;
    }
  } catch (e) {
    console.warn('[Meta Pixel] Lead tracking failed:', e);
  }
}

/**
 * Track a SurveyComplete event — fires when someone reaches step 9 (tools/Littlebird).
 * Used to measure survey completion → sponsor click conversion rate.
 */
export function trackSurveyComplete() {
  trackCustomEvent('SurveyComplete');
}

/**
 * Track a QualifiedLead — fires when the subscriber reaches step 9 (page view).
 * This is the event you optimize Meta campaigns toward.
 * Custom Conversion ID in Meta: 1810429086599820
 */
export function trackQualifiedLead(surveyData: {
  seniority: string;
  company_size: string;
  main_goal?: string;
  job_function?: string;
  industry?: string;
}, eventId?: string) {
  trackCustomEvent('QualifiedLead', {
    seniority: surveyData.seniority,
    company_size: surveyData.company_size,
    ...(surveyData.main_goal && { main_goal: surveyData.main_goal }),
    ...(surveyData.job_function && { job_function: surveyData.job_function }),
    ...(surveyData.industry && { industry: surveyData.industry }),
  }, eventId);
}
