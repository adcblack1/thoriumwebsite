// Single source of truth for the MVF sponsored offers + the picker logic.
// Imported by /subscribe (step 9 trio + step 11 wall) AND /confirmed (post
// email-confirm wall) so the two surfaces can never drift apart.

import { trackOfferClick } from '@/lib/meta-pixel';

export type MvfOffer = {
  id: string;
  brand: string;
  category: string;
  cpc: number;     // partner CPC — $ we earn per click
  budget: number;  // clicks ordered this month
  used?: number;   // clicks delivered so far (seed manually or sync from Dub; 0 = full budget)
  blurb: string;
  cta: string;
  href: string;    // thova.co/<id> Dub short link → appwiki.nl MVF redirect → advertiser
  logo: string;    // /thumbnails/mvf/<id>-logo.png
  thumb: string;   // /thumbnails/mvf/<id>.png
};

export const MVF_OFFERS: MvfOffer[] = [
  { id: 'multiplier', brand: 'Multiplier', category: 'International Payroll', cpc: 13.95, budget: 15,
    cta: 'Get Started', href: 'https://thova.co/multiplier',
    blurb: 'AI-powered global payroll — hire and pay employees compliantly in 150+ countries, no local entity required.',
    logo: '/thumbnails/mvf/multiplier-logo.png', thumb: '/thumbnails/mvf/multiplier.png' },
  { id: 'bamboohr-ats', brand: 'BambooHR', category: 'Applicant Tracking', cpc: 9.62, budget: 20,
    cta: 'See Demo', href: 'https://thova.co/bamboohr-ats',
    blurb: 'AI-powered applicant tracking that screens, schedules, and moves candidates through hiring on autopilot.',
    logo: '/thumbnails/mvf/bamboohr-logo.png', thumb: '/thumbnails/mvf/bamboohr-ats.png' },
  { id: 'zendesk', brand: 'Zendesk', category: 'IT Software', cpc: 9.07, budget: 100,
    cta: 'Try for Free', href: 'https://thova.co/zendesk',
    blurb: 'AI-powered IT and customer-service desk that resolves tickets faster.',
    logo: '/thumbnails/mvf/zendesk-logo.png', thumb: '/thumbnails/mvf/zendesk.png' },
  { id: 'creatio', brand: 'Creatio', category: 'CRM', cpc: 5.98, budget: 150,
    cta: 'Start Free Trial', href: 'https://thova.co/creatio',
    blurb: 'No-code CRM with AI-driven workflow automation for sales, marketing, and service teams.',
    logo: '/thumbnails/mvf/creatio-logo.png', thumb: '/thumbnails/mvf/creatio.png' },
  { id: 'workable', brand: 'Workable', category: 'Applicant Tracking', cpc: 5.97, budget: 115,
    cta: 'Start Free Trial', href: 'https://thova.co/workable',
    blurb: 'Post to 200+ job boards, screen with AI, and track every candidate in one place.',
    logo: '/thumbnails/mvf/workable-logo.png', thumb: '/thumbnails/mvf/workable.png' },
  { id: 'wheniwork', brand: 'When I Work', category: 'Scheduling', cpc: 4.48, budget: 200,
    cta: 'Try Free', href: 'https://thova.co/wheniwork',
    blurb: 'AI-assisted scheduling that builds shifts, tracks time, and messages your team — all in one app.',
    logo: '/thumbnails/mvf/wheniwork-logo.png', thumb: '/thumbnails/mvf/wheniwork.png' },
  { id: 'bigin', brand: 'Bigin by Zoho', category: 'CRM', cpc: 4.18, budget: 100,
    cta: 'Start Free', href: 'https://thova.co/bigin',
    blurb: 'A pipeline-first CRM with built-in AI — set up in minutes, not weeks.',
    logo: '/thumbnails/mvf/bigin-logo.png', thumb: '/thumbnails/mvf/bigin.png' },
  { id: 'godaddy-pos', brand: 'GoDaddy', category: 'POS', cpc: 3.88, budget: 100,
    cta: 'Get Started', href: 'https://thova.co/godaddy-pos',
    blurb: 'AI-powered point-of-sale, payments, and an online store that all sync in one dashboard.',
    logo: '/thumbnails/mvf/godaddy-logo.png', thumb: '/thumbnails/mvf/godaddy-pos.png' },
  { id: 'sumup', brand: 'SumUp', category: 'POS', cpc: 3.58, budget: 100,
    cta: 'Get Started', href: 'https://thova.co/sumup',
    blurb: 'Card reader and POS with AI insights and no monthly fees — take payments anywhere in minutes.',
    logo: '/thumbnails/mvf/sumup-logo.png', thumb: '/thumbnails/mvf/sumup.png' },
  // Zoho Books already took 1 real click on Dub — seeded manually this one time.
  { id: 'zoho-books', brand: 'Zoho Books', category: 'Accounting', cpc: 3.49, budget: 75, used: 1,
    cta: 'Start Free', href: 'https://thova.co/zoho-books',
    blurb: 'AI-powered accounting — invoicing, expenses, and reconciliation in one suite.',
    logo: '/thumbnails/mvf/zoho-logo.png', thumb: '/thumbnails/mvf/zoho-books.png' },
  { id: 'zoho-it', brand: 'Zoho', category: 'IT Software', cpc: 3.49, budget: 100,
    cta: 'Start Free', href: 'https://thova.co/zoho-it',
    blurb: 'AI-driven IT management and helpdesk tooling that scales with your team.',
    logo: '/thumbnails/mvf/zoho-logo.png', thumb: '/thumbnails/mvf/zoho-it.png' },
  { id: 'xero', brand: 'Xero', category: 'Accounting', cpc: 3.13, budget: 100,
    cta: 'Try Free', href: 'https://thova.co/xero',
    blurb: 'AI-powered cloud accounting that small businesses and their accountants actually like using.',
    logo: '/thumbnails/mvf/xero-logo.svg', thumb: '/thumbnails/mvf/xero.png' },
  { id: 'freshbooks', brand: 'FreshBooks', category: 'Accounting', cpc: 2.39, budget: 100,
    cta: 'Try It Free', href: 'https://thova.co/freshbooks',
    blurb: 'AI-powered invoicing and accounting built for freelancers and service businesses.',
    logo: '/thumbnails/mvf/freshbooks-logo.png', thumb: '/thumbnails/mvf/freshbooks.png' },
];

// Revenue-ranked, deterministic, NO persona/answer targeting (verified live: HR
// vs Engineering personas returned identical offers on TheDeepView's tools page).
// Two tiers:
//   TIER 1 — offers still IN budget (clicks remaining > 0), highest CPC first.
//   TIER 2 — offers OUT of budget, highest CPC first, appended as backfill so the
//            list never runs short once daily caps are hit.
// `live` is the { slug: clicks } map from Dub (/api/offers). Each offer's usage is
// max(manual seed, live Dub clicks): the static `used` is a floor, real clicks take
// over once they exceed it. Empty {} ⇒ pure seeds, identical server/client (no
// hydration mismatch).
export function orderedOffers(live: Record<string, number> = {}): MvfOffer[] {
  const usedOf = (o: MvfOffer) => Math.max(o.used ?? 0, live[o.id] ?? 0);
  const remaining = (o: MvfOffer) => Math.max(0, o.budget - usedOf(o));
  const byCpc = (a: MvfOffer, b: MvfOffer) => b.cpc - a.cpc;
  const inBudget = MVF_OFFERS.filter((o) => remaining(o) > 0).sort(byCpc);
  const capped = MVF_OFFERS.filter((o) => remaining(o) <= 0).sort(byCpc);
  return [...inBudget, ...capped];
}

// `skip` lets a second surface pick up where an earlier one left off so no offer
// repeats. (Both confirmation walls use skip=0 — they show the full ranked list.)
export function pickOffers(count: number, skip = 0, live: Record<string, number> = {}): MvfOffer[] {
  return orderedOffers(live).slice(skip, skip + count);
}

export type OfferClickCtx = {
  email?: string;
  firstName?: string;
  subscriberId?: string;
  fbp?: string;
  fbc?: string;
};

// Log a sponsor-offer click: Supabase (only if we have a subscriberId) + Meta
// pixel + Meta CAPI. Pixel and CAPI share one event_id so Meta dedups them into a
// single OfferClick conversion valued at the offer's CPC (real revenue per click).
export function logMvfOfferClick(offer: MvfOffer, page: string, ctx: OfferClickCtx = {}) {
  // 1. Supabase sponsor-click log (gated on subscriberId)
  if (ctx.subscriberId) {
    try {
      navigator.sendBeacon(
        '/api/subscribe/sponsor-click',
        new Blob(
          [JSON.stringify({ subscriber_id: ctx.subscriberId, sponsor_slug: offer.id, step: page })],
          { type: 'application/json' }
        )
      );
    } catch { }
  }

  // 2. Meta OfferClick — value = the offer's CPC. Same event_id on pixel + CAPI.
  const eventId = `offerclick_${offer.id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  trackOfferClick(offer.id, offer.brand, offer.category, offer.cpc, eventId, ctx.subscriberId || undefined);
  try {
    fetch('/api/offer-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true, // survive any navigation
      body: JSON.stringify({
        event_id: eventId,
        offer_id: offer.id,
        brand: offer.brand,
        category: offer.category,
        cpc: offer.cpc,
        page,
        email: ctx.email,
        first_name: ctx.firstName,
        fbp: ctx.fbp,
        fbc: ctx.fbc,
        subscriber_id: ctx.subscriberId,
      }),
    }).catch(() => { });
  } catch { }
}
