import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// POST — log a sponsor click
export async function POST(request: Request) {
  try {
    const { subscriber_id, sponsor_slug, step } = await request.json();

    if (!subscriber_id || !sponsor_slug || !step) {
      return NextResponse.json(
        { error: 'subscriber_id, sponsor_slug, and step are required' },
        { status: 400 }
      );
    }

    const { error } = await supabase()
      .from('sponsor_clicks')
      .insert({
        subscriber_id,
        sponsor_slug,
        step,
      });

    if (error) {
      console.error('Sponsor click log error:', error);
      return NextResponse.json({ error: 'Failed to log click' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Sponsor click API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
