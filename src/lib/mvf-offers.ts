// Single source of truth for the MVF sponsored offers + the picker logic.
// Imported by /subscribe (step 9 trio + step 11 wall) AND /confirmed (post
// email-confirm wall) so the two surfaces can never drift apart.

import { trackOfferClick } from '@/lib/meta-pixel';

// ── Answer-targeting engine ───────────────────────────────────────────────
// A faithful port of TheDeepView's offer-persona evaluator (their `I` gate +
// `M` persona wrapper, transcribed from their live bundle). TDV ships this exact
// rules-engine but runs it EMPTY (every offer unconditional) so everyone sees the
// same CPC-ranked feed. We populate it: each offer declares the survey answers it
// targets, so a Salesperson sees CRMs, an HR lead sees ATS/payroll, etc.
//
// An offer with no `personas` (or when no answers are passed) is UNCONDITIONAL —
// shown to everyone — which is exactly how /confirmed (no survey data) behaves.

export type SurveyAnswers = {
  main_goal?: string;
  seniority?: string;
  job_function?: string;
  industry?: string;
  company_size?: string;
  ai_tools?: string[]; // multi-select
};

type QuestionId = keyof SurveyAnswers;
type ComparisonOperator = 'CONTAINS' | 'NOT_CONTAINS' | 'EQUALS';

// One rule. Either an any-of option match (the common case; mirrors TDV's
// formAnswerOptionIds) or a value comparison (mirrors expectedValue + operator —
// used here mainly for "doesn't already own this tool").
type Qualification =
  | { q: QuestionId; anyOf: string[] }
  | { q: QuestionId; op: ComparisonOperator; value: string };

// A persona = a group of rules combined by `logic` (TDV's logicOperator; default
// OR). An offer can hold several personas; it qualifies if ANY persona passes
// (TDV's `.some`). Empty quals ⇒ always qualifies (TDV's hasCriteria:false).
type Persona = { name: string; logic?: 'AND' | 'OR'; quals: Qualification[] };

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
  personas?: Persona[]; // answer-targeting; omit/empty ⇒ shown to everyone
};

// EXACT survey option strings (must match src/app/subscribe/page.tsx). Centralised
// so the personas below stay typo-proof against the funnel.
const FN = {
  exec: 'Executive/Leadership',
  sales: 'Sales/Business Development',
  marketing: 'Marketing/Communications',
  product: 'Product Management',
  eng: 'Engineering/Software Development',
  data: 'Data/Analytics',
  ops: 'Operations/Project Management',
  finance: 'Finance/Accounting',
  hr: 'Human Resources',
  cs: 'Customer Success/Support',
  design: 'Design/Creative',
  strategy: 'Strategy/Consulting',
} as const;

const SIZE = {
  enterprise: 'Enterprise: over 1,000 employees',
  large: 'Large: 500 - 999 employees',
  mid: 'Mid-size: 100 - 499 employees',
  small: 'Small: 25 - 99 employees',
  startup: 'Startup: Less than 25 employees',
  solo: 'Solo/Self-Employed',
} as const;

const IND = {
  retail: 'Retail/E-commerce/Consumer Goods',
  hospitality: 'Hospitality/Travel/Entertainment',
  healthcare: 'Healthcare/Medical',
  manufacturing: 'Manufacturing/Industrial',
  transport: 'Transportation/Logistics',
  proServices: 'Professional Services',
} as const;

const SEN = {
  founder: 'Founder/CEO',
  freelance: 'Freelance/Contract',
  student: 'Student/Intern',
} as const;

export const MVF_OFFERS: MvfOffer[] = [
  { id: 'multiplier', brand: 'Multiplier', category: 'International Payroll', cpc: 13.95, budget: 15,
    cta: 'Get Started', href: 'https://thova.co/multiplier',
    blurb: 'AI-powered global payroll — hire and pay employees compliantly in 150+ countries, no local entity required.',
    logo: '/thumbnails/mvf/multiplier-logo.png', thumb: '/thumbnails/mvf/multiplier.png',
    personas: [{ name: 'People & ops leaders', logic: 'OR', quals: [
      { q: 'job_function', anyOf: [FN.hr, FN.ops, FN.exec, FN.finance] },
    ] }] },
  { id: 'bamboohr-ats', brand: 'BambooHR', category: 'Applicant Tracking', cpc: 9.62, budget: 20,
    cta: 'See Demo', href: 'https://thova.co/bamboohr-ats',
    blurb: 'AI-powered applicant tracking that screens, schedules, and moves candidates through hiring on autopilot.',
    logo: '/thumbnails/mvf/bamboohr-logo.png', thumb: '/thumbnails/mvf/bamboohr-ats.png',
    personas: [{ name: 'Hiring teams', logic: 'OR', quals: [
      { q: 'job_function', anyOf: [FN.hr, FN.exec, FN.ops] },
    ] }] },
  { id: 'zendesk', brand: 'Zendesk', category: 'IT Software', cpc: 9.07, budget: 100,
    cta: 'Try for Free', href: 'https://thova.co/zendesk',
    blurb: 'AI-powered IT and customer-service desk that resolves tickets faster.',
    logo: '/thumbnails/mvf/zendesk-logo.png', thumb: '/thumbnails/mvf/zendesk.png',
    personas: [{ name: 'Support & technical', logic: 'OR', quals: [
      { q: 'job_function', anyOf: [FN.cs, FN.eng, FN.ops, FN.data, FN.product] },
    ] }] },
  { id: 'creatio', brand: 'Creatio', category: 'CRM', cpc: 5.98, budget: 150,
    cta: 'Start Free Trial', href: 'https://thova.co/creatio',
    blurb: 'No-code CRM with AI-driven workflow automation for sales, marketing, and service teams.',
    logo: '/thumbnails/mvf/creatio-logo.png', thumb: '/thumbnails/mvf/creatio.png',
    personas: [{ name: 'Revenue & ops (scale)', logic: 'OR', quals: [
      { q: 'job_function', anyOf: [FN.sales, FN.marketing, FN.ops, FN.strategy, FN.product] },
      { q: 'company_size', anyOf: [SIZE.enterprise, SIZE.large, SIZE.mid] },
    ] }] },
  { id: 'workable', brand: 'Workable', category: 'Applicant Tracking', cpc: 5.97, budget: 115,
    cta: 'Start Free Trial', href: 'https://thova.co/workable',
    blurb: 'Post to 200+ job boards, screen with AI, and track every candidate in one place.',
    logo: '/thumbnails/mvf/workable-logo.png', thumb: '/thumbnails/mvf/workable.png',
    personas: [{ name: 'Hiring teams (SMB)', logic: 'OR', quals: [
      { q: 'job_function', anyOf: [FN.hr, FN.exec, FN.ops] },
      { q: 'company_size', anyOf: [SIZE.mid, SIZE.small, SIZE.startup] },
    ] }] },
  { id: 'wheniwork', brand: 'When I Work', category: 'Scheduling', cpc: 4.48, budget: 200,
    cta: 'Try Free', href: 'https://thova.co/wheniwork',
    blurb: 'AI-assisted scheduling that builds shifts, tracks time, and messages your team — all in one app.',
    logo: '/thumbnails/mvf/wheniwork-logo.png', thumb: '/thumbnails/mvf/wheniwork.png',
    personas: [{ name: 'Shift-based teams', logic: 'OR', quals: [
      { q: 'job_function', anyOf: [FN.ops, FN.hr] },
      { q: 'industry', anyOf: [IND.retail, IND.hospitality, IND.healthcare, IND.manufacturing, IND.transport] },
    ] }] },
  { id: 'bigin', brand: 'Bigin by Zoho', category: 'CRM', cpc: 4.18, budget: 100,
    cta: 'Start Free', href: 'https://thova.co/bigin',
    blurb: 'A pipeline-first CRM with built-in AI — set up in minutes, not weeks.',
    logo: '/thumbnails/mvf/bigin-logo.png', thumb: '/thumbnails/mvf/bigin.png',
    personas: [{ name: 'Small revenue teams', logic: 'OR', quals: [
      { q: 'job_function', anyOf: [FN.sales, FN.marketing] },
      { q: 'company_size', anyOf: [SIZE.startup, SIZE.small, SIZE.solo] },
    ] }] },
  { id: 'godaddy-pos', brand: 'GoDaddy', category: 'POS', cpc: 3.88, budget: 100,
    cta: 'Get Started', href: 'https://thova.co/godaddy-pos',
    blurb: 'AI-powered point-of-sale, payments, and an online store that all sync in one dashboard.',
    logo: '/thumbnails/mvf/godaddy-logo.png', thumb: '/thumbnails/mvf/godaddy-pos.png',
    personas: [{ name: 'Storefront & solo', logic: 'OR', quals: [
      { q: 'industry', anyOf: [IND.retail, IND.hospitality] },
      { q: 'company_size', anyOf: [SIZE.solo, SIZE.startup] },
      { q: 'seniority', anyOf: [SEN.founder] },
    ] }] },
  { id: 'sumup', brand: 'SumUp', category: 'POS', cpc: 3.58, budget: 100,
    cta: 'Get Started', href: 'https://thova.co/sumup',
    blurb: 'Card reader and POS with AI insights and no monthly fees — take payments anywhere in minutes.',
    logo: '/thumbnails/mvf/sumup-logo.png', thumb: '/thumbnails/mvf/sumup.png',
    personas: [{ name: 'Storefront & solo', logic: 'OR', quals: [
      { q: 'industry', anyOf: [IND.retail, IND.hospitality] },
      { q: 'company_size', anyOf: [SIZE.solo, SIZE.startup] },
      { q: 'seniority', anyOf: [SEN.founder] },
    ] }] },
  // Zoho Books already took 1 real click on Dub — seeded manually this one time.
  { id: 'zoho-books', brand: 'Zoho Books', category: 'Accounting', cpc: 3.49, budget: 75, used: 1,
    cta: 'Start Free', href: 'https://thova.co/zoho-books',
    blurb: 'AI-powered accounting — invoicing, expenses, and reconciliation in one suite.',
    logo: '/thumbnails/mvf/zoho-logo.png', thumb: '/thumbnails/mvf/zoho-books.png',
    personas: [{ name: 'Finance & small biz', logic: 'OR', quals: [
      { q: 'job_function', anyOf: [FN.finance] },
      { q: 'company_size', anyOf: [SIZE.startup, SIZE.small, SIZE.solo] },
      { q: 'seniority', anyOf: [SEN.freelance] },
    ] }] },
  { id: 'zoho-it', brand: 'Zoho', category: 'IT Software', cpc: 3.49, budget: 100,
    cta: 'Start Free', href: 'https://thova.co/zoho-it',
    blurb: 'AI-driven IT management and helpdesk tooling that scales with your team.',
    logo: '/thumbnails/mvf/zoho-logo.png', thumb: '/thumbnails/mvf/zoho-it.png',
    personas: [{ name: 'Technical & support', logic: 'OR', quals: [
      { q: 'job_function', anyOf: [FN.eng, FN.cs, FN.ops, FN.data] },
    ] }] },
  { id: 'xero', brand: 'Xero', category: 'Accounting', cpc: 3.13, budget: 100,
    cta: 'Try Free', href: 'https://thova.co/xero',
    blurb: 'AI-powered cloud accounting that small businesses and their accountants actually like using.',
    logo: '/thumbnails/mvf/xero-logo.svg', thumb: '/thumbnails/mvf/xero.png',
    personas: [{ name: 'Finance & small biz', logic: 'OR', quals: [
      { q: 'job_function', anyOf: [FN.finance] },
      { q: 'company_size', anyOf: [SIZE.small, SIZE.startup, SIZE.solo] },
      { q: 'industry', anyOf: [IND.proServices] },
    ] }] },
  { id: 'freshbooks', brand: 'FreshBooks', category: 'Accounting', cpc: 2.39, budget: 100,
    cta: 'Try It Free', href: 'https://thova.co/freshbooks',
    blurb: 'AI-powered invoicing and accounting built for freelancers and service businesses.',
    logo: '/thumbnails/mvf/freshbooks-logo.png', thumb: '/thumbnails/mvf/freshbooks.png',
    personas: [{ name: 'Freelancers & creatives', logic: 'OR', quals: [
      { q: 'job_function', anyOf: [FN.finance, FN.design] },
      { q: 'seniority', anyOf: [SEN.freelance, SEN.student] },
      { q: 'company_size', anyOf: [SIZE.solo] },
      { q: 'industry', anyOf: [IND.proServices] },
    ] }] },
];

// ── Evaluator (TDV's I + M, ported) ───────────────────────────────────────
const tokensFor = (a: SurveyAnswers, q: QuestionId): string[] => {
  const v = a[q];
  // Multi-select (ai_tools) arrives as an array. Single-selects are ONE whole
  // value — do NOT comma-split them: some labels contain commas (e.g.
  // "Enterprise: over 1,000 employees") and splitting would break the match.
  if (Array.isArray(v)) return v.map((s) => s.trim()).filter(Boolean);
  const s = (v ?? '').trim();
  return s ? [s] : [];
};

const matchQual = (a: SurveyAnswers, qual: Qualification): boolean => {
  const toks = tokensFor(a, qual.q);
  if ('anyOf' in qual) return qual.anyOf.some((x) => toks.includes(x));
  const hay = toks.join(',').toLowerCase();
  const needle = qual.value.toLowerCase();
  if (qual.op === 'CONTAINS') return hay.includes(needle);
  if (qual.op === 'NOT_CONTAINS') return !hay.includes(needle);
  return toks.map((t) => t.toLowerCase()).includes(needle); // EQUALS
};

const personaQualifies = (a: SurveyAnswers, p: Persona): boolean => {
  if (!p.quals.length) return true; // hasCriteria:false ⇒ always
  const res = p.quals.map((q) => matchQual(a, q));
  return (p.logic ?? 'OR') === 'AND' ? res.every(Boolean) : res.some(Boolean);
};

// Eligible if any persona qualifies. No personas, or no answers given, ⇒ everyone.
export function offerEligible(o: MvfOffer, a?: SurveyAnswers): boolean {
  if (!o.personas?.length) return true;
  if (!a) return true;
  return o.personas.some((p) => personaQualifies(a, p));
}

// ── Ranking + selection ───────────────────────────────────────────────────
// Order is: TARGETED offers first (eligible for this person), then the rest as
// backfill so a trio/wall is never short. Within each tier: in-budget first
// (TDV's pacing), then CPC descending (revenue), then category-diversified
// (TDV's one-per-category pass1 → fill pass2) so a Finance lead doesn't get three
// accounting tools stacked. `live` is the { slug: clicks } map from Dub.
const usedOf = (o: MvfOffer, live: Record<string, number>) => Math.max(o.used ?? 0, live[o.id] ?? 0);
const remaining = (o: MvfOffer, live: Record<string, number>) => Math.max(0, o.budget - usedOf(o, live));

function rankByBudgetThenCpc(list: MvfOffer[], live: Record<string, number>): MvfOffer[] {
  return [...list].sort((a, b) => {
    const ra = remaining(a, live) > 0;
    const rb = remaining(b, live) > 0;
    if (ra !== rb) return ra ? -1 : 1; // in-budget first
    return b.cpc - a.cpc;              // then CPC desc
  });
}

// Category-diversity reorder (TDV's selector): pass 1 takes one offer per category
// in ranked order; pass 2 fills the rest, capped at `count-1` per category for
// trios so no single category dominates; pass 3 is a safety fill.
function diversify(ranked: MvfOffer[], count: number): MvfOffer[] {
  const maxPer = count >= 3 ? count - 1 : count;
  const out: MvfOffer[] = [];
  const per: Record<string, number> = {};
  const take = (o: MvfOffer) => { out.push(o); per[o.category] = (per[o.category] ?? 0) + 1; };
  for (const o of ranked) { if (out.length >= count) break; if (!per[o.category]) take(o); }
  for (const o of ranked) { if (out.length >= count) break; if (out.includes(o)) continue; if ((per[o.category] ?? 0) < maxPer) take(o); }
  for (const o of ranked) { if (out.length >= count) break; if (!out.includes(o)) take(o); }
  return out;
}

// The one picker both surfaces share. answers ⇒ targeted; omit ⇒ untargeted
// (everyone), which is how /confirmed (no survey data) renders.
export function selectOffers(
  count: number,
  opts: { skip?: number; live?: Record<string, number>; answers?: SurveyAnswers } = {}
): MvfOffer[] {
  const { skip = 0, live = {}, answers } = opts;
  const eligible = rankByBudgetThenCpc(MVF_OFFERS.filter((o) => offerEligible(o, answers)), live);
  const rest = rankByBudgetThenCpc(MVF_OFFERS.filter((o) => !offerEligible(o, answers)), live);
  const ordered = [...diversify(eligible, eligible.length), ...diversify(rest, rest.length)];
  return ordered.slice(skip, skip + count);
}

// Back-compat wrappers (existing call sites). `answers` is the new optional 4th arg.
export function orderedOffers(live: Record<string, number> = {}, answers?: SurveyAnswers): MvfOffer[] {
  return selectOffers(MVF_OFFERS.length, { live, answers });
}
export function pickOffers(
  count: number,
  skip = 0,
  live: Record<string, number> = {},
  answers?: SurveyAnswers
): MvfOffer[] {
  return selectOffers(count, { skip, live, answers });
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
