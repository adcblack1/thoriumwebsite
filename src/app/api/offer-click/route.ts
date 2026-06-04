import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const PIXEL_ID = '773797471916037';
const API_VERSION = 'v22.0';

/** SHA-256 hash (lowercased, trimmed) per Meta CAPI requirements. */
function sha256(value: string): string {
  return crypto.createHash('sha256').update(value.toLowerCase().trim()).digest('hex');
}

/**
 * POST /api/offer-click
 *
 * Server-side Meta Conversions API for sponsored-offer clicks on the /subscribe
 * tools page. Fires ONE custom "OfferClick" event valued at the offer's partner
 * CPC (the real revenue we earn per click). Shares event_id with the client
 * pixel (trackOfferClick) so Meta deduplicates them into a single event.
 *
 * Body: {
 *   event_id: string,        // shared with pixel for dedup
 *   offer_id: string,
 *   brand?: string,
 *   category?: string,
 *   cpc: number,             // partner CPC → event value
 *   page?: string,           // 'tools_page' | 'confirmation'
 *   email?: string,          // SHA-256 hashed for matching
 *   first_name?: string,     // SHA-256 hashed
 *   fbp?: string,            // _fbp cookie (not hashed)
 *   fbc?: string,            // _fbc cookie (not hashed)
 *   subscriber_id?: string,  // external_id (hashed)
 * }
 */
export async function POST(request: NextRequest) {
  // The existing /api/meta-capi route reads META_CAPI_TOKEN, but .env.local
  // defines META_ACCESS_TOKEN — accept either so this works regardless.
  const token = process.env.META_CAPI_TOKEN || process.env.META_ACCESS_TOKEN;
  if (!token) {
    console.warn('[CAPI:OfferClick] No Meta token set — skipping server event');
    return NextResponse.json({ ok: false, error: 'Token not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const {
      event_id,
      offer_id,
      brand,
      category,
      cpc,
      page,
      email,
      first_name,
      fbp,
      fbc,
      subscriber_id,
    } = body;

    if (!event_id || !offer_id) {
      return NextResponse.json({ ok: false, error: 'Missing event_id or offer_id' }, { status: 400 });
    }

    // Build user_data with hashed PII (mirrors /api/meta-capi).
    const user_data: Record<string, string> = {
      client_ip_address: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '',
      client_user_agent: request.headers.get('user-agent') || '',
    };
    if (email) user_data.em = sha256(email);
    if (first_name) user_data.fn = sha256(first_name);
    if (fbp) user_data.fbp = fbp;
    if (fbc) user_data.fbc = fbc;
    if (subscriber_id) user_data.external_id = sha256(subscriber_id);

    const offerClickEvent = {
      event_name: 'OfferClick',
      event_time: Math.floor(Date.now() / 1000),
      event_id, // same id as the client pixel → Meta dedups
      event_source_url: 'https://thoriumvalley.com/subscribe',
      action_source: 'website',
      user_data,
      custom_data: {
        value: Number(cpc) || 0,
        currency: 'USD',
        content_ids: [offer_id],
        content_name: brand || offer_id,
        content_category: category || '',
        ...(page && { offer_page: page }),
      },
    };

    const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [offerClickEvent], access_token: token }),
    });
    const result = await res.json();

    if (!res.ok) {
      console.error('[CAPI:OfferClick] Meta API error:', JSON.stringify(result));
      return NextResponse.json({ ok: false, error: result }, { status: res.status });
    }

    console.log(`[CAPI:OfferClick] sent (${brand || offer_id} $${cpc}):`, result);
    return NextResponse.json({ ok: true, events_received: result.events_received });
  } catch (err) {
    console.error('[CAPI:OfferClick] Failed:', err);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}
