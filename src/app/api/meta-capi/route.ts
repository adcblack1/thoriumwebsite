import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const PIXEL_ID = '773797471916037';
const API_VERSION = 'v22.0';

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
/**
 * Determine lead tier and dollar value from a 0-100 lead score.
 * Mirrors DeepView's exact tier boundaries.
 */
function getLeadTier(score: number): { tier: string; value: number } {
  if (score > 74) return { tier: 'lead_high', value: 5.00 };
  if (score > 59) return { tier: 'lead_good', value: 3.00 };
  if (score > 40) return { tier: 'lead_medium', value: 1.50 };
  return { tier: 'lead_low', value: 0.25 };
}

/**
 * POST /api/meta-capi
 *
 * Sends 5 events to Meta's Conversions API in a single request:
 *   1. Lead        — standard, for campaign optimization
 *   2. Subscribe   — standard, for email capture signal
 *   3. Purchase    — standard, with dynamic value for VBO
 *   4. Custom tier — lead_high/good/medium/low for audiences + columns
 *   5. QualifiedLead — custom, for internal tracking
 *
 * All share event_id base for deduplication with client-side pixel.
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
      lead_score,
      subscriber_id,
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
    if (fbp) user_data.fbp = fbp;
    if (fbc) user_data.fbc = fbc;
    if (subscriber_id) user_data.external_id = sha256(subscriber_id);

    // Build custom_data with survey fields
    const survey_data: Record<string, string> = {};
    if (seniority) survey_data.seniority = seniority;
    if (company_size) survey_data.company_size = company_size;
    if (main_goal) survey_data.main_goal = main_goal;
    if (job_function) survey_data.job_function = job_function;
    if (industry) survey_data.industry = industry;

    const now = Math.floor(Date.now() / 1000);
    const source_url = 'https://thoriumvalley.com/subscribe';

    // Get tier + dollar value from lead score
    const { tier, value } = getLeadTier(lead_score ?? 0);

    // Event 1: Standard Lead
    const leadEvent = {
      event_name: 'Lead',
      event_time: now,
      event_id: `lead_${event_id}`,
      event_source_url: source_url,
      action_source: 'website',
      user_data,
      custom_data: {
        ...(lead_score !== undefined && { lead_score }),
        ...survey_data,
      },
    };

    // Event 2: Standard Subscribe
    const subscribeEvent = {
      event_name: 'Subscribe',
      event_time: now,
      event_id: `sub_${event_id}`,
      event_source_url: source_url,
      action_source: 'website',
      user_data,
      custom_data: survey_data,
    };

    // Event 3: Standard Purchase (with dynamic tier value for VBO)
    const purchaseEvent = {
      event_name: 'Purchase',
      event_time: now,
      event_id: `pur_${event_id}`,
      event_source_url: source_url,
      action_source: 'website',
      user_data,
      custom_data: {
        value,
        currency: 'USD',
        lead_type: tier,
        ...survey_data,
      },
    };

    // Event 4: Custom tier event (lead_high / lead_good / lead_medium / lead_low)
    const tierEvent = {
      event_name: tier,
      event_time: now,
      event_id: `tier_${event_id}`,
      event_source_url: source_url,
      action_source: 'website',
      user_data,
      custom_data: {
        lead_type: tier,
        ...survey_data,
      },
    };

    // Event 5: Custom QualifiedLead (internal tracking + legacy)
    const qualifiedLeadEvent = {
      event_name: 'QualifiedLead',
      event_time: now,
      event_id: event_id,
      event_source_url: source_url,
      action_source: 'website',
      user_data,
      custom_data: survey_data,
    };

    // Send ALL events to Meta in a single API call
    const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [leadEvent, subscribeEvent, purchaseEvent, tierEvent, qualifiedLeadEvent],
        access_token: token,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error('[CAPI] Meta API error:', JSON.stringify(result));
      return NextResponse.json({ ok: false, error: result }, { status: res.status });
    }

    console.log(`[CAPI] 5 events sent (Lead + Subscribe + Purchase[$${value}] + ${tier} + QualifiedLead):`, result);
    return NextResponse.json({ ok: true, events_received: result.events_received, tier, value });
  } catch (err) {
    console.error('[CAPI] Failed to send events:', err);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}
