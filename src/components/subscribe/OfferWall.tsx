'use client';

import { useState, useEffect } from 'react';
import { MvfOffer, MVF_OFFERS, pickOffers, logMvfOfferClick } from '@/lib/mvf-offers';

/**
 * The sponsored-offer "wall" shown after conversion (TheDeepView's thank-you
 * pattern): EVERY in-budget offer, highest CPC first, revealed 6 at a time via
 * "Load more". Used on both the /subscribe step-11 confirmation and the
 * /confirmed (post email-confirm) page so the two surfaces stay identical.
 *
 * Self-contained: fetches live Dub click counts for budget-gating, reads the
 * Meta fbp/fbc cookies for CAPI attribution, and logs each click (pixel + CAPI
 * + Supabase). Pass whatever identity context the surface has.
 */
export default function OfferWall({
  page,
  email,
  firstName,
  subscriberId,
  skip = 0,
  initialShown = 6,
}: {
  page: string;
  email?: string;
  firstName?: string;
  subscriberId?: string;
  skip?: number;       // offers already shown elsewhere (e.g. the funnel tools page) to skip
  initialShown?: number;
}) {
  const [shown, setShown] = useState(initialShown);
  const [dubClicks, setDubClicks] = useState<Record<string, number>>({});
  const [cookies, setCookies] = useState<{ fbp?: string; fbc?: string }>({});

  // Live Dub click counts for budget-gating (server-cached 5 min). On failure we
  // keep {} and fall back to the static `used` seeds.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/offers')
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: unknown) => {
        if (!cancelled && data && typeof data === 'object') {
          setDubClicks(data as Record<string, number>);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Meta _fbp / _fbc cookies for CAPI attribution.
  useEffect(() => {
    const c = document.cookie.split(';').reduce((acc, x) => {
      const [k, v] = x.trim().split('=');
      if (k && v) acc[k] = v;
      return acc;
    }, {} as Record<string, string>);
    const mc: { fbp?: string; fbc?: string } = {};
    if (c['_fbp']) mc.fbp = c['_fbp'];
    if (c['_fbc']) mc.fbc = c['_fbc'];
    setCookies(mc);
  }, []);

  const wall = pickOffers(MVF_OFFERS.length, skip, dubClicks); // CPC desc; skip the funnel tools-page offers so this continues from #(skip+1), mirroring TDV's thank-you wall
  const onOfferClick = (o: MvfOffer) =>
    logMvfOfferClick(o, page, { email, firstName, subscriberId, fbp: cookies.fbp, fbc: cookies.fbc });

  return (
    <div className="w-full max-w-md sm:max-w-2xl lg:max-w-4xl mx-auto mt-2">
      <p
        className="font-inter text-[10px] lg:text-[11px] font-semibold uppercase tracking-[0.15em] text-center mb-3"
        style={{ color: '#5170ff' }}
      >
        More tools we recommend
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {wall.slice(0, shown).map((o) => (
          <a
            key={o.id}
            href={o.href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() => onOfferClick(o)}
            className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-[#1b1b1b]/10 transition-all hover:shadow-lg active:scale-[0.99]"
          >
            {/* Screenshot banner */}
            <div className="aspect-[16/9] bg-[#f3f3f1] overflow-hidden">
              <img src={o.thumb} alt={o.brand} className="w-full h-full object-cover" />
            </div>
            <div className="px-4 py-3.5 flex flex-col">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-7 h-7 shrink-0 rounded-md bg-[#f3f3f1] flex items-center justify-center overflow-hidden">
                  <img src={o.logo} alt="" className="w-full h-full object-contain p-1" />
                </span>
                <span className="font-times text-[#1b1b1b] text-[18px] lg:text-[19px]" style={{ fontWeight: 600, letterSpacing: '-0.02em' }}>{o.brand}</span>
                <span className="font-inter text-[8px] uppercase tracking-wider text-[#5170ff] bg-[#5170ff]/10 px-1.5 py-0.5 ml-auto">{o.category}</span>
              </div>
              <p className="font-inter text-[#1b1b1b]/55 text-[13px] leading-snug mb-3">{o.blurb}</p>
              <span className="w-full py-2.5 rounded-full bg-[#5170ff] text-white text-[14px] font-semibold inline-flex items-center justify-center gap-1.5 group-hover:bg-[#5170ff]/90 transition-colors">
                {o.cta}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </span>
            </div>
          </a>
        ))}
      </div>
      {shown < wall.length && (
        <button
          type="button"
          onClick={() => setShown((n) => n + 6)}
          className="mt-4 mx-auto block font-inter text-[12px] font-semibold px-6 py-2.5 rounded-lg border border-[#1b1b1b]/20 text-[#1b1b1b]/70 hover:text-[#1b1b1b] hover:border-[#1b1b1b]/40 transition-colors"
        >
          Load more
        </button>
      )}
    </div>
  );
}
