import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// POST — create a new subscriber record (Step 1)
export async function POST(request: Request) {
  try {
    const { email, child_newsletters, fbp, fbc, utm_source, utm_medium, utm_campaign, utm_content, sub_event_id } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if subscriber already exists
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
      console.error('Create subscriber error:', error);
      return NextResponse.json({ error: 'Failed to create subscriber' }, { status: 500 });
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
        try {
          // Build custom fields from UTM params available at step 1
          const step1CustomFields: { name: string; value: string }[] = [];
          if (utm_content) step1CustomFields.push({ name: 'ad_creative', value: utm_content });
          if (utm_campaign) step1CustomFields.push({ name: 'ad_campaign', value: utm_campaign });

          const res = await fetch(
            `https://api.beehiiv.com/v2/publications/${pubId}/subscriptions`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${BEEHIIV_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email,
                reactivate_existing: true,
                send_welcome_email: sendWelcome,
                utm_source: 'subscribe_flow',
                ...(step1CustomFields.length > 0 ? { custom_fields: step1CustomFields } : {}),
              }),
            }
          );
          if (res.ok) {
            const beehiivData = await res.json();
            return beehiivData?.data?.id || null;
          } else {
            console.error(`Step 1 Beehiiv subscribe to ${pubId} failed:`, await res.text());
            return null;
          }
        } catch (err) {
          console.error(`Step 1 Beehiiv error for ${pubId}:`, err);
          return null;
        }
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

        // Vibe3 always sends its own welcome — it's a separate publication
        const hasVibe3 = newsletters.includes('vibe3');
        if (hasVibe3 && PUB_MAP['vibe3']) {
          const id = await subscribeToBeehiiv(PUB_MAP['vibe3']!, true);
          if (!mainBeehiivId) mainBeehiivId = id;
        }

        // Store first beehiiv ID in Supabase
        if (mainBeehiivId) {
          await supabase()
            .from('subscribers')
            .update({ beehiiv_subscriber_id: mainBeehiivId })
            .eq('id', data.id);
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
        const user_data: Record<string, string> = {
          em: sha256(email),
          client_ip_address: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '',
          client_user_agent: request.headers.get('user-agent') || '',
          external_id: sha256(data.id), // Hashed Supabase subscriber_id — matches step-9 CAPI format
        };
        if (fbp) user_data.fbp = fbp;
        if (fbc) user_data.fbc = fbc;

        // AWAIT this fetch — Vercel serverless tears down the function once
        // the response is sent, killing any in-flight fire-and-forget fetches.
        // We need the CAPI call to complete before returning to the client.
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
      }
    }

    return NextResponse.json({ subscriber_id: data.id });
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
        .select('email')
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
                  utm_source: 'subscribe_flow',
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
