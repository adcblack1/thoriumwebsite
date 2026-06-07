import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// POST — mark a subscriber as email-confirmed
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }

    // Find the subscriber
    const { data: subscriber, error: fetchError } = await supabase()
      .from('subscribers')
      .select('id, email_confirmed')
      .eq('email', email)
      .single();

    if (fetchError || !subscriber) {
      // Still return success — don't leak whether email exists
      return NextResponse.json({ success: true });
    }

    // Mark as confirmed
    if (!subscriber.email_confirmed) {
      await supabase()
        .from('subscribers')
        .update({
          email_confirmed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriber.id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Confirm subscribe error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
