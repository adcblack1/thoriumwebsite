import { NextResponse } from 'next/server';
import { getDubClicks } from '@/lib/dub';

// GET /api/offers → { [slug]: clicks } for every thova.co short link.
// The /subscribe picker fetches this on mount to budget-gate offers by real
// Dub click counts. The DUB_API_KEY stays server-side; only the counts ship.
// Cached 5 min (matches the upstream Dub fetch cache).
export async function GET() {
  const clicks = await getDubClicks();
  return NextResponse.json(clicks, {
    headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' },
  });
}
