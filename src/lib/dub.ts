// Server-only Dub (dub.co) helper. Imported only by the /api/offers route, so
// DUB_API_KEY never reaches the browser (it's a non-NEXT_PUBLIC_ env var).
//
// Returns click counts for every thova.co short link, keyed by the link slug
// (which equals our MVF offer id, e.g. "multiplier", "zoho-books"). The
// /subscribe picker uses these to budget-gate offers by REAL clicks.

const DUB_API = 'https://api.dub.co';
const DOMAIN = 'thova.co';

export type DubClicks = Record<string, number>;

/**
 * Fetch { slug: clicks } for all thova.co links. Cached 5 min via Next's fetch
 * cache so Dub is hit at most once per 5 min regardless of page traffic.
 * Never throws — returns {} on missing key / network error / bad response, in
 * which case the picker falls back to the static `used` seeds in page.tsx.
 */
export async function getDubClicks(): Promise<DubClicks> {
  const key = process.env.DUB_API_KEY;
  if (!key) return {};

  try {
    const res = await fetch(`${DUB_API}/links?domain=${DOMAIN}&pageSize=100`, {
      headers: { Authorization: `Bearer ${key}` },
      next: { revalidate: 300 }, // cache upstream response 5 min
    });
    if (!res.ok) return {};

    const links: Array<{ key?: string; clicks?: number }> = await res.json();
    if (!Array.isArray(links)) return {};

    const out: DubClicks = {};
    for (const l of links) {
      if (l?.key) out[l.key] = Number(l.clicks ?? 0);
    }
    return out;
  } catch {
    return {};
  }
}
