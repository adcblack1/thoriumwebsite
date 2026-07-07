import { createClient } from '@supabase/supabase-js';
import { NextResponse, after } from 'next/server';
import { beehiivUtm } from '@/lib/beehiiv-utm';

const supabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// POST — create a new subscriber record (Step 1)
export async function POST(request: Request) {
  try {
    const { email, child_newsletters, fbp, fbc, utm_source, utm_medium, utm_campaign, utm_content, sub_event_id } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Getting the subscriber onto beehiiv (the actual list) must NOT depend on
    // the tracking database being healthy. If Supabase is slow/down we skip the
    // tracking row and STILL add them to beehiiv below — a DB hiccup must never
    // cost a paid signup again (that's exactly what the July 2 outage did).
    let subscriberId: string | null = null;

    // Existence check is best-effort: if the DB errors we just proceed, and
    // beehiiv's reactivate_existing handles any duplicate cleanly.
    try {
      const { data: existing } = await supabase()
        .from('subscribers')
        .select('id')
        .eq('email', email)
        .single();

      if (existing) {
        // Return full subscriber record so client can restore progress
        const { data: fullRecord } = await supabase()
          .from('subscribers')
          .select('*')
          .eq('id', existing.id)
          .single();

        return NextResponse.json({
          subscriber_id: existing.id,
          existing: true,
          data: fullRecord,
        });
      }
    } catch (e) {
      console.error('Existence check failed (continuing to beehiiv):', e);
    }

    // Insert the tracking row (best-effort). On failure we DO NOT abort — we
    // fall through to the beehiiv subscribe so the person still lands on the list.
    try {
      const { data, error } = await supabase()
        .from('subscribers')
        .insert({
          email,
          ...(child_newsletters ? { child_newsletters } : {}),
          ...(fbp ? { fbp } : {}),
          ...(fbc ? { fbc } : {}),
          ...(utm_source ? { utm_source } : {}),
          ...(utm_medium ? { utm_medium } : {}),
          ...(utm_campaign ? { utm_campaign } : {}),
          ...(utm_content ? { utm_content } : {}),
        })
        .select('id')
        .single();

      if (error) {
        console.error('Create subscriber row failed (continuing to beehiiv):', error);
      } else {
        subscriberId = data?.id ?? null;
      }
    } catch (e) {
      console.error('Create subscriber threw (continuing to beehiiv):', e);
    }

    // Immediately subscribe to ALL selected Beehiiv publications
    const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
    const PUB_MAP: Record<string, string | undefined> = {
      'thorium-valley': process.env.BEEHIIV_PUBLICATION_ID,
      'the-catalyst': process.env.BEEHIIV_PUB_CATALYST,
      'the-lab': process.env.BEEHIIV_PUB_LAB,
      'vibe3': process.env.BEEHIIV_PUB_VIBE3,
    };

    if (BEEHIIV_API_KEY) {
      // Determine which newsletters to subscribe to
      const newsletters: string[] = child_newsletters && child_newsletters.length > 0
        ? child_newsletters
        : ['thorium-valley']; // Default to TV if no selections passed

      // Subscribe to each selected publication
      const subscribeToBeehiiv = async (pubId: string, sendWelcome: boolean) => {
        // Build custom fields from UTM params available at step 1
        const step1CustomFields: { name: string; value: string }[] = [];
        if (utm_content) step1CustomFields.push({ name: 'ad_creative', value: utm_content });
        if (utm_campaign) step1CustomFields.push({ name: 'ad_campaign', value: utm_campaign });

        const body = JSON.stringify({
          email,
          reactivate_existing: true,
          send_welcome_email: sendWelcome,
          ...beehiivUtm({ utm_source, utm_campaign, utm_content }),
          ...(step1CustomFields.length > 0 ? { custom_fields: step1CustomFields } : {}),
        });

        // Retry on 429 (rate limit), honoring Retry-After. A transient throttle
        // must never drop a subscriber off a list — that's how the main-list adds
        // were being lost when the engagement cron flooded beehiiv.
        for (let attempt = 0; attempt < 4; attempt++) {
          try {
            const res = await fetch(
              `https://api.beehiiv.com/v2/publications/${pubId}/subscriptions`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${BEEHIIV_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body,
              }
            );
            if (res.ok) {
              const beehiivData = await res.json();
              return beehiivData?.data?.id || null;
            }
            if (res.status === 429) {
              const retryAfter = Number(res.headers.get('retry-after'));
              await new Promise((r) => setTimeout(r, Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 500 * (attempt + 1)));
              continue;
            }
            console.error(`Step 1 Beehiiv subscribe to ${pubId} failed:`, await res.text());
            return null;
          } catch (err) {
            console.error(`Step 1 Beehiiv error for ${pubId}:`, err);
            await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
          }
        }
        console.error(`Step 1 Beehiiv subscribe to ${pubId} failed: still rate-limited after retries`);
        return null;
      };

      // Subscribe to all selected Beehiiv publications (awaited to ensure completion on Vercel)
      {
        let mainBeehiivId: string | null = null;
        const hasTV = newsletters.includes('thorium-valley');
        const hasCatalyst = newsletters.includes('the-catalyst');
        const hasLab = newsletters.includes('the-lab');

        // Welcome email logic: TV gets welcome if selected, otherwise first child does
        if (hasTV && PUB_MAP['thorium-valley']) {
          mainBeehiivId = await subscribeToBeehiiv(PUB_MAP['thorium-valley']!, true);
        }
        if (hasCatalyst && PUB_MAP['the-catalyst']) {
          const sendWelcome = !hasTV; // Only send Catalyst welcome if TV didn't
          const id = await subscribeToBeehiiv(PUB_MAP['the-catalyst']!, sendWelcome);
          if (!mainBeehiivId) mainBeehiivId = id;
        }
        if (hasLab && PUB_MAP['the-lab']) {
          const sendWelcome = !hasTV && !hasCatalyst; // Only if no prior welcome
          const id = await subscribeToBeehiiv(PUB_MAP['the-lab']!, sendWelcome);
          if (!mainBeehiivId) mainBeehiivId = id;
        }

        // Vibe3 welcome email only sent from vibe3.xyz/subscribe, not here
        const hasVibe3 = newsletters.includes('vibe3');
        if (hasVibe3 && PUB_MAP['vibe3']) {
          const id = await subscribeToBeehiiv(PUB_MAP['vibe3']!, false);
          if (!mainBeehiivId) mainBeehiivId = id;
        }

        // Store first beehiiv ID in Supabase (best-effort — only if we have a tracking row)
        if (mainBeehiivId && subscriberId) {
          try {
            await supabase()
              .from('subscribers')
              .update({ beehiiv_subscriber_id: mainBeehiivId })
              .eq('id', subscriberId);
          } catch (e) {
            console.error('Store beehiiv id failed (non-fatal):', e);
          }
        }
      }
    }

    // Fire CAPI subscriber.created event for deduplication with client-side pixel
    if (sub_event_id) {
      const CAPI_TOKEN = process.env.META_CAPI_TOKEN;
      const PIXEL_ID = '773797471916037';
      if (CAPI_TOKEN) {
        const crypto = await import('crypto');
        const sha256 = (v: string) => crypto.createHash('sha256').update(v.toLowerCase().trim()).digest('hex');
        // Pass all available identifiers to maximize Event Match Quality (EMQ)
        // and link this step-1 event to step-9 events via external_id
        // Prefer IPv6 over IPv4 when available — Meta requires matching IP version
        // between browser pixel (often IPv6) and CAPI (often IPv4) for max EMQ
        const ipCandidates: string[] = [];
        const xff = request.headers.get('x-forwarded-for');
        if (xff) ipCandidates.push(...xff.split(',').map(s => s.trim()).filter(Boolean));
        const xri = request.headers.get('x-real-ip');
        if (xri) ipCandidates.push(xri.trim());
        const bestIp = ipCandidates.find(ip => ip.includes(':')) || ipCandidates[0] || '';

        const user_data: Record<string, string> = {
          em: sha256(email),
          client_ip_address: bestIp,
          client_user_agent: request.headers.get('user-agent') || '',
          // Hashed Supabase subscriber_id — matches step-9 CAPI format. Omitted
          // if the tracking row failed to write (DB down); email still matches.
          ...(subscriberId ? { external_id: sha256(subscriberId) } : {}),
        };
        if (fbp) user_data.fbp = fbp;
        if (fbc) user_data.fbc = fbc;

        // Use after() from next/server to defer the CAPI call until AFTER
        // the response is sent. Vercel keeps the function alive specifically
        // for after() callbacks, fixing the fire-and-forget bug while
        // preserving fast response time for the user.
        after(async () => {
          try {
            const capiRes = await fetch(`https://graph.facebook.com/v22.0/${PIXEL_ID}/events`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                data: [{
                  event_name: 'subscriber.created',
                  event_time: Math.floor(Date.now() / 1000),
                  event_id: sub_event_id,
                  event_source_url: 'https://thoriumvalley.com/subscribe',
                  action_source: 'website',
                  user_data,
                }],
                access_token: CAPI_TOKEN,
              }),
            });
            if (!capiRes.ok) {
              console.error('[CAPI subscriber.created] Error:', await capiRes.text());
            } else {
              console.log('[CAPI subscriber.created] Sent for', email);
            }
          } catch (err) {
            console.error('[CAPI subscriber.created] Failed:', err);
          }
        });
      }
    }

    return NextResponse.json({ subscriber_id: subscriberId });
  } catch (err) {
    console.error('Subscribe API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH — update subscriber fields (Steps 2-8)
export async function PATCH(request: Request) {
  try {
    const { subscriber_id, ...fields } = await request.json();

    if (!subscriber_id) {
      return NextResponse.json({ error: 'subscriber_id is required' }, { status: 400 });
    }

    const { error } = await supabase()
      .from('subscribers')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', subscriber_id);

    if (error) {
      console.error('Update subscriber error:', error);
      return NextResponse.json({ error: 'Failed to update subscriber' }, { status: 500 });
    }

    // If child_newsletters was just saved, fire SparkLoop + Beehiiv immediately
    if (fields.child_newsletters) {
      // Get subscriber email (needed for both SparkLoop and Beehiiv)
      const { data: sub } = await supabase()
        .from('subscribers')
        .select('email, utm_source, utm_campaign, utm_content')
        .eq('id', subscriber_id)
        .single();

      if (sub?.email) {
        // SparkLoop for paid partners
        const SPARKLOOP_REF_CODES: Record<string, string> = {
        };

        const selectedPartners = (fields.child_newsletters as string[])
          .filter((id: string) => SPARKLOOP_REF_CODES[id])
          .map((id: string) => SPARKLOOP_REF_CODES[id]);

        if (selectedPartners.length > 0) {
          const sparkloopApiKey = process.env.SPARKLOOP_API_KEY;
          const upscribeId = process.env.SPARKLOOP_UPSCRIBE_ID;
          if (sparkloopApiKey && upscribeId) {
            await fetch(
              `https://api.sparkloop.app/v2/upscribes/${upscribeId}/subscribe`,
              {
                method: 'POST',
                headers: {
                  'X-Api-Key': sparkloopApiKey,
                  'Content-Type': 'application/json; charset=utf-8',
                },
                body: JSON.stringify({
                  subscriber_email: sub.email,
                  country_code: 'US',
                  recommendations: selectedPartners.join(','),
                }),
              }
            ).then(async (res) => {
              if (!res.ok) console.error('SparkLoop failed:', await res.text());
              else console.log('SparkLoop success:', selectedPartners);
            }).catch((err) => console.error('SparkLoop error:', err));
          }
        }

        // Beehiiv for Catalyst and Lab — subscribe immediately at step 2
        const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
        const CHILD_PUB_MAP: Record<string, string | undefined> = {
          'the-catalyst': process.env.BEEHIIV_PUB_CATALYST,
          'the-lab': process.env.BEEHIIV_PUB_LAB,
          'vibe3': process.env.BEEHIIV_PUB_VIBE3,
        };

        if (BEEHIIV_API_KEY) {
          const selectedChildren = (fields.child_newsletters as string[])
            .filter((id: string) => CHILD_PUB_MAP[id] && CHILD_PUB_MAP[id]);

          for (const nlId of selectedChildren) {
            const pubId = CHILD_PUB_MAP[nlId]!;
            await fetch(
              `https://api.beehiiv.com/v2/publications/${pubId}/subscriptions`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${BEEHIIV_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email: sub.email,
                  reactivate_existing: true,
                  send_welcome_email: false, // TV welcome already sent at step 1
                  ...beehiivUtm({ utm_source: sub.utm_source, utm_campaign: sub.utm_campaign, utm_content: sub.utm_content }),
                }),
              }
            ).then(async (res) => {
              if (!res.ok) console.error(`Step 2 Beehiiv ${nlId} failed:`, await res.text());
              else console.log(`Step 2 Beehiiv ${nlId} success`);
            }).catch((err) => console.error(`Step 2 Beehiiv ${nlId} error:`, err));
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Subscribe PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
