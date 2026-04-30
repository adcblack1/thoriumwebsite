import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _supabase;
}

const MAX_PER_VARIATION = 50;
const VARIATIONS = ['A', 'B', 'C'] as const;

// GET — assign a variation (balanced) or get results
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Results mode
  if (searchParams.get('results') === 'true') {
    const { data } = await getSupabase().from('littlebird_test').select('variation, event_type');
    const counts: Record<string, { views: number; clicks: number; skips: number }> = {};
    for (const v of VARIATIONS) counts[v] = { views: 0, clicks: 0, skips: 0 };
    for (const e of data || []) {
      if (!counts[e.variation]) continue;
      if (e.event_type === 'view') counts[e.variation].views++;
      if (e.event_type === 'click') counts[e.variation].clicks++;
      if (e.event_type === 'skip') counts[e.variation].skips++;
    }
    const total = Object.values(counts).reduce((s, c) => s + c.views, 0);
    return NextResponse.json({ counts, total, done: total >= MAX_PER_VARIATION * VARIATIONS.length });
  }

  // Assignment mode — pick the variation with fewest views
  const { data: viewRows } = await getSupabase()
    .from('littlebird_test')
    .select('variation')
    .eq('event_type', 'view');

  const viewCounts: Record<string, number> = {};
  for (const v of VARIATIONS) viewCounts[v] = 0;
  for (const row of viewRows || []) {
    if (viewCounts[row.variation] !== undefined) viewCounts[row.variation]++;
  }

  // Filter to variations that haven't hit the cap
  const available = VARIATIONS.filter((v) => viewCounts[v] < MAX_PER_VARIATION);
  if (available.length === 0) {
    return NextResponse.json({ variation: 'A', done: true });
  }

  // Pick the one with fewest views (random if tied)
  const minViews = Math.min(...available.map((v) => viewCounts[v]));
  const candidates = available.filter((v) => viewCounts[v] === minViews);
  const chosen = candidates[Math.floor(Math.random() * candidates.length)];

  return NextResponse.json({ variation: chosen, done: false });
}

// POST — log an event
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { variation, type, uid } = body;

  if (!VARIATIONS.includes(variation) || !['view', 'click', 'skip'].includes(type)) {
    return NextResponse.json({ error: 'Invalid' }, { status: 400 });
  }

  // Dedupe: don't log duplicate events for same uid+variation+type
  const { data: existing } = await getSupabase()
    .from('littlebird_test')
    .select('id')
    .eq('uid', uid)
    .eq('variation', variation)
    .eq('event_type', type)
    .limit(1);

  if (!existing || existing.length === 0) {
    await getSupabase().from('littlebird_test').insert({
      variation,
      event_type: type,
      uid,
    });
  }

  return NextResponse.json({ ok: true });
}
