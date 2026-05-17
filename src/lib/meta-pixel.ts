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
 * Determine lead tier and dollar value from a 0-100 lead score.
 * Mirrors DeepView's exact tier boundaries:
 *   >74 = lead_high ($5), 60-74 = lead_good ($3),
 *   41-59 = lead_medium ($1.50), <41 = lead_low ($0.25)
 */
function getLeadTier(score: number): { tier: string; value: number } {
  if (score > 74) return { tier: 'lead_high', value: 5.00 };
  if (score > 59) return { tier: 'lead_good', value: 3.00 };
  if (score > 40) return { tier: 'lead_medium', value: 1.50 };
  return { tier: 'lead_low', value: 0.25 };
}

/**
 * Track a Lead event (fires at Step 9 — survey completion).
 * This is the primary optimization event for Meta campaigns.
 * Includes value/currency for ROAS and lead_score for quality signal.
 * Pass eventId to deduplicate with the server-side CAPI event.
 */
export function trackLead(eventId?: string, leadScore?: number, externalId?: string) {
  if (typeof window === 'undefined') return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fbq = (window as any).fbq;
    if (typeof fbq === 'function') {
      const params: Record<string, unknown> = {};
      if (leadScore !== undefined) params.lead_score = leadScore;
      if (externalId) params.external_id = externalId;
      if (eventId) {
        fbq('track', 'Lead', params, { eventID: eventId });
      } else {
        fbq('track', 'Lead', params);
      }
      console.log(`[Meta Pixel] Tracked "Lead" via fbq`, eventId ? `(eventID: ${eventId})` : '', leadScore !== undefined ? `(lead_score: ${leadScore})` : '');
      return;
    }
  } catch (e) {
    console.warn('[Meta Pixel] Lead tracking failed:', e);
  }
}

/**
 * Track a Subscribe event — standard Meta event for email capture.
 * Fires alongside Lead for campaign flexibility.
 */
export function trackSubscribe(eventId?: string, externalId?: string) {
  if (typeof window === 'undefined') return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fbq = (window as any).fbq;
    if (typeof fbq === 'function') {
      const params: Record<string, unknown> = {};
      if (externalId) params.external_id = externalId;
      if (eventId) {
        fbq('track', 'Subscribe', params, { eventID: `sub_${eventId}` });
      } else {
        fbq('track', 'Subscribe', params);
      }
      console.log(`[Meta Pixel] Tracked "Subscribe" via fbq`);
    }
  } catch (e) {
    console.warn('[Meta Pixel] Subscribe tracking failed:', e);
  }
}

/**
 * Track a Purchase event with dynamic value from lead scoring.
 * This is the KEY event for value-based optimization (VBO).
 * Meta uses the value to optimize for high-scoring subscribers.
 */
export function trackPurchase(eventId?: string, leadScore?: number, externalId?: string) {
  if (typeof window === 'undefined') return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fbq = (window as any).fbq;
    if (typeof fbq === 'function') {
      const { value } = getLeadTier(leadScore ?? 0);
      const params: Record<string, unknown> = { value, currency: 'USD' };
      if (externalId) params.external_id = externalId;
      if (eventId) {
        fbq('track', 'Purchase', params, { eventID: `pur_${eventId}` });
      } else {
        fbq('track', 'Purchase', params);
      }
      console.log(`[Meta Pixel] Tracked "Purchase" via fbq (value: $${value})`);
    }
  } catch (e) {
    console.warn('[Meta Pixel] Purchase tracking failed:', e);
  }
}

/**
 * Track a custom tier event (lead_high, lead_good, lead_medium, lead_low).
 * Fires the TIER NAME as the event name — used for audience building,
 * Ads Manager columns, and lookalike seed audiences.
 */
export function trackLeadTier(eventId?: string, leadScore?: number, externalId?: string) {
  if (typeof window === 'undefined') return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fbq = (window as any).fbq;
    if (typeof fbq === 'function') {
      const { tier } = getLeadTier(leadScore ?? 0);
      const params: Record<string, unknown> = { lead_type: tier };
      if (externalId) params.external_id = externalId;
      if (eventId) {
        fbq('trackCustom', tier, params, { eventID: `tier_${eventId}` });
      } else {
        fbq('trackCustom', tier, params);
      }
      console.log(`[Meta Pixel] Tracked custom "${tier}" via fbq`);
    }
  } catch (e) {
    console.warn('[Meta Pixel] Tier tracking failed:', e);
  }
}


