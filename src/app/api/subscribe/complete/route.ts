import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// Map newsletter IDs to Beehiiv publication IDs
const PUB_MAP: Record<string, string | undefined> = {
  'thorium-valley': process.env.BEEHIIV_PUBLICATION_ID,
  'the-catalyst': process.env.BEEHIIV_PUB_CATALYST,
  'the-lab': process.env.BEEHIIV_PUB_LAB,
};

async function subscribeToBeehiiv(
  pubId: string,
  email: string,
  sendWelcome: boolean,
  customFields: { name: string; value: string }[],
  apiKey: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${pubId}/subscriptions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          reactivate_existing: true,
          send_welcome_email: sendWelcome,
          utm_source: 'subscribe_flow',
          custom_fields: customFields,
        }),
      }
    );
    if (res.ok) {
      const data = await res.json();
      return data?.data?.id || null;
    } else {
      console.error(`Beehiiv subscribe to ${pubId} failed:`, await res.text());
      return null;
    }
  } catch (err) {
    console.error(`Beehiiv subscribe error for ${pubId}:`, err);
    return null;
  }
}

// POST — finalize subscriber: push email to beehiiv publications, update records
export async function POST(request: Request) {
  try {
    const { subscriber_id, utm_source, utm_medium, utm_campaign, utm_content } = await request.json();

    if (!subscriber_id) {
      return NextResponse.json({ error: 'subscriber_id is required' }, { status: 400 });
    }

    // 0. Save UTM params to subscriber record
    if (utm_source || utm_campaign || utm_content) {
      await supabase()
        .from('subscribers')
        .update({
          utm_source: utm_source || null,
          utm_medium: utm_medium || null,
          utm_campaign: utm_campaign || null,
          utm_content: utm_content || null,
        })
        .eq('id', subscriber_id);
    }

    // 1. Get subscriber data from Supabase
    const { data: subscriber, error: fetchError } = await supabase()
      .from('subscribers')
      .select('*')
      .eq('id', subscriber_id)
      .single();

    if (fetchError || !subscriber) {
      return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
    }

    const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
    if (!BEEHIIV_API_KEY) {
      return NextResponse.json({ error: 'Beehiiv not configured' }, { status: 500 });
    }

    // 2. Determine which newsletters they selected
    const childNewsletters: string[] = subscriber.child_newsletters || [];
    const hasTV = childNewsletters.includes('thorium-valley');
    const hasCatalyst = childNewsletters.includes('the-catalyst');
    const hasLab = childNewsletters.includes('the-lab');

    // Build custom fields for subscriber data
    const customFields = [
      { name: 'first_name', value: subscriber.first_name || '' },
      { name: 'main_goal', value: subscriber.main_goal || '' },
      { name: 'seniority', value: subscriber.seniority || '' },
      { name: 'job_function', value: subscriber.job_function || '' },
      { name: 'industry', value: subscriber.industry || '' },
      { name: 'company_size', value: subscriber.company_size || '' },
      // UTM-based fields for creative performance tracking
      ...(subscriber.utm_campaign ? [{ name: 'ad_campaign', value: subscriber.utm_campaign }] : []),
      ...(subscriber.utm_content ? [{ name: 'ad_creative', value: subscriber.utm_content }] : []),
    ];

    // 3. Subscribe to each selected publication with conditional welcome emails
    // Welcome email logic:
    //   TV selected (with or without others) → TV welcome only
    //   Only Catalyst → Catalyst welcome
    //   Only Lab → Lab welcome
    //   Catalyst + Lab (no TV) → Catalyst welcome only (Catalyst welcome email
    //     includes a mention that they're also subscribed to The Lab)
    let mainBeehiivId: string | null = null;
    const subscriptionResults: Record<string, string | null> = {};

    // Always subscribe to TV main if selected
    if (hasTV) {
      const tvPubId = PUB_MAP['thorium-valley'];
      if (tvPubId) {
        mainBeehiivId = await subscribeToBeehiiv(
          tvPubId, subscriber.email, true, customFields, BEEHIIV_API_KEY
        );
        subscriptionResults['thorium-valley'] = mainBeehiivId;
      }
    }

    // Subscribe to Catalyst if selected
    if (hasCatalyst) {
      const catalystPubId = PUB_MAP['the-catalyst'];
      if (catalystPubId) {
        // Send welcome if TV is NOT selected (covers both "catalyst only" and "catalyst + lab")
        const sendWelcome = !hasTV;
        const id = await subscribeToBeehiiv(
          catalystPubId, subscriber.email, sendWelcome, customFields, BEEHIIV_API_KEY
        );
        subscriptionResults['the-catalyst'] = id;
        if (!mainBeehiivId) mainBeehiivId = id;
      }
    }

    // Subscribe to Lab if selected
    if (hasLab) {
      const labPubId = PUB_MAP['the-lab'];
      if (labPubId) {
        // Send Lab welcome ONLY if TV is NOT selected AND Catalyst is NOT selected
        // (i.e. Lab is the sole selection). If Catalyst is also selected, the
        // Catalyst welcome email already mentions the Lab subscription.
        const sendWelcome = !hasTV && !hasCatalyst;
        const id = await subscribeToBeehiiv(
          labPubId, subscriber.email, sendWelcome, customFields, BEEHIIV_API_KEY
        );
        subscriptionResults['the-lab'] = id;
        if (!mainBeehiivId) mainBeehiivId = id;
      }
    }

    // 5. SparkLoop: subscribe to partner newsletters via Upscribe API
    const SPARKLOOP_REF_CODES: Record<string, string> = {
      'tldr': '54f14dd8c3',
      'cautious-optimism': 'e83dabe785',
    };

    const selectedPartners = childNewsletters
      .filter((id) => SPARKLOOP_REF_CODES[id])
      .map((id) => SPARKLOOP_REF_CODES[id]);

    if (selectedPartners.length > 0) {
      const sparkloopApiKey = process.env.SPARKLOOP_API_KEY;
      const upscribeId = process.env.SPARKLOOP_UPSCRIBE_ID;
      if (sparkloopApiKey && upscribeId) {
        try {
          const slRes = await fetch(
            `https://api.sparkloop.app/v2/upscribes/${upscribeId}/subscribe`,
            {
              method: 'POST',
              headers: {
                'X-Api-Key': sparkloopApiKey,
                'Content-Type': 'application/json; charset=utf-8',
              },
              body: JSON.stringify({
                subscriber_email: subscriber.email,
                country_code: 'US',
                recommendations: selectedPartners.join(','),
              }),
            }
          );
          if (!slRes.ok) {
            console.error('SparkLoop subscribe failed:', await slRes.text());
          } else {
            console.log('SparkLoop subscribe success for:', selectedPartners);
          }
        } catch (slErr) {
          console.error('SparkLoop subscribe error:', slErr);
        }
      }
    }

    // 6. Update Supabase with beehiiv ID and mark complete
    const updateFields: Record<string, unknown> = {
      completed: true,
      updated_at: new Date().toISOString(),
    };
    if (mainBeehiivId) {
      updateFields.beehiiv_subscriber_id = mainBeehiivId;
    }

    await supabase()
      .from('subscribers')
      .update(updateFields)
      .eq('id', subscriber_id);

    return NextResponse.json({
      success: true,
      beehiiv_subscriber_id: mainBeehiivId,
      subscriptions: subscriptionResults,
    });
  } catch (err) {
    console.error('Complete subscribe error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
