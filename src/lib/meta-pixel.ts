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
      console.log(`[Meta Pixel] Tracked "${eventName}" via fbq`);
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
    console.log(`[Meta Pixel] Tracked "${eventName}" via image fallback`);
  } catch (e) {
    console.warn('[Meta Pixel] image fallback failed:', e);
  }
}

/**
 * Track a Lead event (newsletter subscribe).
 */
export function trackLead() {
  trackEvent('Lead');
}
