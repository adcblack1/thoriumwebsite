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
    const { subscriber_id } = await request.json();

    if (!subscriber_id) {
      return NextResponse.json({ error: 'subscriber_id is required' }, { status: 400 });
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
    ];

    // 3. Subscribe to each selected publication with conditional welcome emails
    // Welcome email logic:
    //   TV selected (with or without others) → TV welcome only
    //   Only Catalyst → Catalyst welcome
    //   Only Lab → Lab welcome
    //   Catalyst + Lab (no TV) → both get welcome emails
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
        // Send welcome email only if TV is NOT selected
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
        // Send welcome email only if TV is NOT selected
        const sendWelcome = !hasTV;
        const id = await subscribeToBeehiiv(
          labPubId, subscriber.email, sendWelcome, customFields, BEEHIIV_API_KEY
        );
        subscriptionResults['the-lab'] = id;
        if (!mainBeehiivId) mainBeehiivId = id;
      }
    }

    // 4. Update Supabase with beehiiv ID and mark complete
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
