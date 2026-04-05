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
    const { email } = await request.json();

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
      .insert({ email })
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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Subscribe PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
