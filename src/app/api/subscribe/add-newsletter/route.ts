import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

const PUB_MAP: Record<string, string | undefined> = {
  'thorium-valley': process.env.BEEHIIV_PUBLICATION_ID,
  'the-catalyst': process.env.BEEHIIV_PUB_CATALYST,
  'the-lab': process.env.BEEHIIV_PUB_LAB,
};

// POST — add a single newsletter subscription (cross-sell)
export async function POST(request: Request) {
  try {
    const { subscriber_id, newsletter_id } = await request.json();

    if (!subscriber_id || !newsletter_id) {
      return NextResponse.json(
        { error: 'subscriber_id and newsletter_id are required' },
        { status: 400 }
      );
    }

    // 1. Get subscriber
    const { data: subscriber, error: fetchError } = await supabase()
      .from('subscribers')
      .select('*')
      .eq('id', subscriber_id)
      .single();

    if (fetchError || !subscriber) {
      return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
    }

    // 2. Add newsletter to child_newsletters array
    const current: string[] = subscriber.child_newsletters || [];
    if (!current.includes(newsletter_id)) {
      current.push(newsletter_id);
      await supabase()
        .from('subscribers')
        .update({
          child_newsletters: current,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriber_id);
    }

    // 3. Subscribe to Beehiiv publication
    const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
    const pubId = PUB_MAP[newsletter_id];

    if (BEEHIIV_API_KEY && pubId) {
      try {
        await fetch(
          `https://api.beehiiv.com/v2/publications/${pubId}/subscriptions`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${BEEHIIV_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: subscriber.email,
              reactivate_existing: true,
              send_welcome_email: false, // Don't send welcome for cross-sell adds
              utm_source: 'cross_sell',
            }),
          }
        );
      } catch (err) {
        console.error(`Cross-sell Beehiiv subscribe error for ${newsletter_id}:`, err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Add newsletter error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
