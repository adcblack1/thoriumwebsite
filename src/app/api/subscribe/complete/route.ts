import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// POST — finalize subscriber: push email to beehiiv, update beehiiv_subscriber_id
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

    // 2. Subscribe to beehiiv
    const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
    const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;
    let beehiivSubscriberId: string | null = null;

    if (BEEHIIV_API_KEY && BEEHIIV_PUBLICATION_ID) {
      try {
        const beehiivRes = await fetch(
          `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${BEEHIIV_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: subscriber.email,
              reactivate_existing: true,
              send_welcome_email: true,
              utm_source: 'subscribe_flow',
              custom_fields: [
                { name: 'first_name', value: subscriber.first_name || '' },
                { name: 'main_goal', value: subscriber.main_goal || '' },
                { name: 'seniority', value: subscriber.seniority || '' },
                { name: 'job_function', value: subscriber.job_function || '' },
                { name: 'industry', value: subscriber.industry || '' },
                { name: 'company_size', value: subscriber.company_size || '' },
              ],
            }),
          }
        );

        if (beehiivRes.ok) {
          const beehiivData = await beehiivRes.json();
          beehiivSubscriberId = beehiivData?.data?.id || null;
        } else {
          console.error('Beehiiv subscribe failed:', await beehiivRes.text());
        }
      } catch (err) {
        console.error('Beehiiv subscribe error:', err);
      }
    }

    // 3. Update Supabase with beehiiv ID and mark complete
    const updateFields: Record<string, unknown> = {
      completed: true,
      updated_at: new Date().toISOString(),
    };
    if (beehiivSubscriberId) {
      updateFields.beehiiv_subscriber_id = beehiivSubscriberId;
    }

    await supabase()
      .from('subscribers')
      .update(updateFields)
      .eq('id', subscriber_id);

    return NextResponse.json({
      success: true,
      beehiiv_subscriber_id: beehiivSubscriberId,
    });
  } catch (err) {
    console.error('Complete subscribe error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
