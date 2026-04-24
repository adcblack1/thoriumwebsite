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
    const { email, child_newsletters, fbp, fbc } = await request.json();

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
    };

    if (BEEHIIV_API_KEY) {
      // Determine which newsletters to subscribe to
      const newsletters: string[] = child_newsletters && child_newsletters.length > 0
        ? child_newsletters
        : ['thorium-valley']; // Default to TV if no selections passed

      // Subscribe to each selected publication
      const subscribeToBeehiiv = async (pubId: string, sendWelcome: boolean) => {
        try {
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

      // Fire all subscriptions (don't await — let them run in background)
      (async () => {
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

        // Store first beehiiv ID in Supabase
        if (mainBeehiivId) {
          await supabase()
            .from('subscribers')
            .update({ beehiiv_subscriber_id: mainBeehiivId })
            .eq('id', data.id);
        }
      })();
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
          'tldr': '54f14dd8c3',
        };

        const selectedPartners = (fields.child_newsletters as string[])
          .filter((id: string) => SPARKLOOP_REF_CODES[id])
          .map((id: string) => SPARKLOOP_REF_CODES[id]);

        if (selectedPartners.length > 0) {
          const sparkloopApiKey = process.env.SPARKLOOP_API_KEY;
          const upscribeId = process.env.SPARKLOOP_UPSCRIBE_ID;
          if (sparkloopApiKey && upscribeId) {
            fetch(
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
        };

        if (BEEHIIV_API_KEY) {
          const selectedChildren = (fields.child_newsletters as string[])
            .filter((id: string) => CHILD_PUB_MAP[id] && CHILD_PUB_MAP[id]);

          for (const nlId of selectedChildren) {
            const pubId = CHILD_PUB_MAP[nlId]!;
            fetch(
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
