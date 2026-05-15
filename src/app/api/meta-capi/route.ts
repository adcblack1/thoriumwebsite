import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const PIXEL_ID = '773797471916037';
const API_VERSION = 'v21.0';

/**
 * Hash a value with SHA-256 for Meta CAPI.
 * Meta requires lowercase, trimmed, SHA-256 hashed user data.
 */
function sha256(value: string): string {
  return crypto
    .createHash('sha256')
    .update(value.toLowerCase().trim())
    .digest('hex');
}

/**
 * POST /api/meta-capi
 *
 * Sends BOTH a standard Lead event AND a custom QualifiedLead event
 * to Meta's Conversions API in a single request.
 *
 * Lead fires as a standard event (for Meta campaign optimization).
 * QualifiedLead fires as a custom event (for internal tracking).
 * Both share the same event_id base so Meta can deduplicate with any
 * client-side pixel events.
 *
 * Body: {
 *   event_id: string,        // Shared with pixel for dedup
 *   email: string,           // Will be SHA-256 hashed
 *   first_name?: string,     // Will be SHA-256 hashed
 *   fbp?: string,            // _fbp cookie (NOT hashed)
 *   fbc?: string,            // _fbc cookie (NOT hashed)
 *   seniority?: string,
 *   company_size?: string,
 *   main_goal?: string,
 *   job_function?: string,
 *   industry?: string,
 * }
 */
export async function POST(request: NextRequest) {
  const token = process.env.META_CAPI_TOKEN;
  if (!token) {
    console.warn('[CAPI] META_CAPI_TOKEN not set — skipping server event');
    return NextResponse.json({ ok: false, error: 'Token not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const {
      event_id,
      email,
      first_name,
      fbp,
      fbc,
      seniority,
      company_size,
      main_goal,
      job_function,
      industry,
    } = body;

    if (!email || !event_id) {
      return NextResponse.json({ ok: false, error: 'Missing email or event_id' }, { status: 400 });
    }

    // Build user_data with hashed PII
    const user_data: Record<string, string> = {
      em: sha256(email),
      client_ip_address: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '',
      client_user_agent: request.headers.get('user-agent') || '',
    };

    if (first_name) user_data.fn = sha256(first_name);
    if (fbp) user_data.fbp = fbp;   // NOT hashed — Meta's own cookie
    if (fbc) user_data.fbc = fbc;    // NOT hashed — Meta's click ID

    // Build custom_data with survey fields
    const custom_data: Record<string, string> = {};
    if (seniority) custom_data.seniority = seniority;
    if (company_size) custom_data.company_size = company_size;
    if (main_goal) custom_data.main_goal = main_goal;
    if (job_function) custom_data.job_function = job_function;
    if (industry) custom_data.industry = industry;

    const now = Math.floor(Date.now() / 1000);

    // Event 1: Standard Lead (what Meta campaigns optimize toward)
    const leadEvent = {
      event_name: 'Lead',
      event_time: now,
      event_id: `lead_${event_id}`,     // Unique ID for Lead dedup
      event_source_url: 'https://thoriumvalley.com/subscribe',
      action_source: 'website',
      user_data,
      custom_data: {
        value: 5.00,
        currency: 'USD',
        ...custom_data,
      },
    };

    // Event 2: Custom QualifiedLead (internal tracking + legacy)
    const qualifiedLeadEvent = {
      event_name: 'QualifiedLead',
      event_time: now,
      event_id,
      event_source_url: 'https://thoriumvalley.com/subscribe',
      action_source: 'website',
      user_data,
      custom_data,
    };

    // Send BOTH events to Meta in a single API call
    const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [leadEvent, qualifiedLeadEvent],
        access_token: token,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error('[CAPI] Meta API error:', JSON.stringify(result));
      return NextResponse.json({ ok: false, error: result }, { status: res.status });
    }

    console.log('[CAPI] Lead + QualifiedLead sent successfully:', result);
    return NextResponse.json({ ok: true, events_received: result.events_received });
  } catch (err) {
    console.error('[CAPI] Failed to send event:', err);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}
