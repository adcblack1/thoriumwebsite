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
    const { email, child_newsletters } = await request.json();

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
      })
      .select('id')
      .single();

    if (error) {
      console.error('Create subscriber error:', error);
      return NextResponse.json({ error: 'Failed to create subscriber' }, { status: 500 });
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

    // If child_newsletters was just saved, fire SparkLoop immediately
    if (fields.child_newsletters) {
      const SPARKLOOP_REF_CODES: Record<string, string> = {
        'tldr': '54f14dd8c3',
        'cautious-optimism': 'e83dabe785',
      };

      const selectedPartners = (fields.child_newsletters as string[])
        .filter((id: string) => SPARKLOOP_REF_CODES[id])
        .map((id: string) => SPARKLOOP_REF_CODES[id]);

      if (selectedPartners.length > 0) {
        const sparkloopApiKey = process.env.SPARKLOOP_API_KEY;
        const upscribeId = process.env.SPARKLOOP_UPSCRIBE_ID;
        if (sparkloopApiKey && upscribeId) {
          // Get subscriber email
          const { data: sub } = await supabase()
            .from('subscribers')
            .select('email')
            .eq('id', subscriber_id)
            .single();

          if (sub?.email) {
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
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Subscribe PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
