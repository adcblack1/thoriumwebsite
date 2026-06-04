'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import SubscribeHero from '@/components/subscribe/SubscribeHero';
import WireframeGlobe from '@/components/WireframeGlobe';
import { Navigation } from '@/components/navigation';
import { FooterNew } from '@/components/footer-new';
import { trackLead, trackSubscribe, trackPurchase, trackLeadTier, setAdvancedMatching } from '@/lib/meta-pixel';
import { MvfOffer, pickOffers, logMvfOfferClick } from '@/lib/mvf-offers';
import OfferWall from '@/components/subscribe/OfferWall';

// ── MVF CPC offer pool — June 2026 order book ───────────────────────────────
// Each href is a thova.co/<id> Dub short link that redirects through the MVF
// (appwiki.nl) link to the advertiser. `cpc` is the *partner* CPC we earn per
// click, straight from the MVF order sheet. The picker mirrors The Deep View
// exactly: of the offers that still have click budget, show the highest-CPC
// ones first. No persona/answer targeting — pure revenue ranking (just like TDV).
//
// PLACEHOLDERS: `logo`, `thumb`, and `blurb` are stand-ins. Drop real art into
// /public/thumbnails/mvf/ (keep the filenames) and rewrite the blurbs — nothing
// else changes; the picker + layout stay the same.
// MvfOffer type, the MVF_OFFERS catalog, the revenue-ranked picker, and the
// click logger now live in @/lib/mvf-offers — shared with the <OfferWall> used
// on this page's step-11 confirmation and on the /confirmed page.


const GOALS = [
  'Implement AI into my business',
  'Supercharge my career',
  'Stay ahead of industry trends',
  'Automate repetitive tasks',
  'Build AI-powered products',
  'Make more money',
  'Work faster',
];

const SENIORITY = [
  'Founder/CEO',
  'C-level',
  'SVP/EVP',
  'Director/VP',
  'Manager/Supervisor',
  'Mid or Entry Level',
  'Freelance/Contract',
  'Student/Intern',
  'Other',
];

const JOB_FUNCTIONS = [
  'Executive/Leadership',
  'Sales/Business Development',
  'Marketing/Communications',
  'Product Management',
  'Engineering/Software Development',
  'Data/Analytics',
  'Operations/Project Management',
  'Finance/Accounting',
  'Human Resources',
  'Customer Success/Support',
  'Design/Creative',
  'Strategy/Consulting',
  'Other',
];

const INDUSTRIES = [
  'AI/Technology/Software',
  'Financial Services',
  'Healthcare/Medical',
  'Biotech/Pharmaceuticals',
  'Retail/E-commerce/Consumer Goods',
  'Manufacturing/Industrial',
  'Media/Advertising/Marketing',
  'Professional Services',
  'Education',
  'Government/Public Sector',
  'Real Estate/Construction',
  'Transportation/Logistics',
  'Energy/Utilities',
  'Telecommunications',
  'Hospitality/Travel/Entertainment',
  'Non-Profit',
  'Other',
];

const COMPANY_SIZES = [
  'Enterprise: over 1,000 employees',
  'Large: 500 - 999 employees',
  'Mid-size: 100 - 499 employees',
  'Small: 25 - 99 employees',
  'Startup: Less than 25 employees',
  'Solo/Self-Employed',
];

const AI_TOOLS: { name: string; logo: string | null }[] = [
  { name: 'ChatGPT', logo: '/images/tools/chatgpt.webp' },
  { name: 'Claude', logo: '/images/tools/claude.svg' },
  { name: 'Gemini', logo: '/images/tools/gemini.webp' },
  { name: 'Microsoft Copilot', logo: '/images/tools/copilot.png' },
  { name: 'Perplexity', logo: '/images/tools/perplxity.png' },
  { name: 'Midjourney', logo: '/images/tools/midjourney.svg' },
  { name: 'Zapier', logo: '/images/tools/zapier.png' },
  { name: 'n8n', logo: '/images/tools/n8n.webp' },
  { name: 'Make', logo: '/images/tools/make.png' },
  { name: 'NotebookLM', logo: '/images/tools/notebook.png' },
  { name: 'Cursor', logo: '/images/tools/cursor.png' },
  { name: 'HeyGen', logo: '/images/tools/heygen.png' },
  { name: 'Runway', logo: '/images/tools/runway.png' },
  { name: 'Notion AI', logo: '/images/tools/notion.png' },
  { name: 'ElevenLabs', logo: '/images/tools/elevenlabs.webp' },
  { name: 'Canva AI', logo: '/images/tools/canva.png' },
  { name: 'Lovable', logo: '/images/tools/loveable.png' },
  { name: 'None yet', logo: null },
];

// ── Lead Scoring (0-100) ──────────────────
// Direct port of TheDeepView's algorithm v2.0, transcribed from their live bundle.
// score = base(seniority tier × company size) + jobFunction + goal + min(10, Σ tool-set bonuses) + industry
// TDV's scorer also reads role_title / company_name / company_niche, but their funnel never
// collects those (no survey question, no enrichment) so they resolve empty and add 0 for every
// lead — we omit them to keep parity exact.
const normStr = (s: string) => (s || '').trim().toLowerCase();

function calculateLeadScore(data: {
  seniority: string;
  company_size: string;
  job_function: string;
  main_goal: string;
  industry: string;
  ai_tools: string[];
}): number {
  // Seniority → tier (TDV map `d`; default E). No option maps to D — TDV only reaches
  // tier D via role_title keywords, which this funnel never collects.
  const tierBySeniority: Record<string, string> = {
    'founder/ceo': 'A', 'c-level': 'A', 'c-suite/founder': 'A',
    'svp/evp': 'B', 'director/vp': 'B', 'vp/director': 'B', director: 'B',
    manager: 'C', 'manager/supervisor': 'C',
    'individual contributor': 'E', 'mid or entry level': 'E',
    'freelance/contract': 'E', 'student/intern': 'E', other: 'E',
  };
  const tier = tierBySeniority[normStr(data.seniority)] || 'E';

  // Company size → column (TDV map `c` with includes() fallback; default mid)
  const sizeKey = normStr(data.company_size);
  const sizeMap: Record<string, 'enterprise' | 'large' | 'mid' | 'small'> = {
    'enterprise: over 1,000 employees': 'enterprise',
    'large: 500 - 999 employees': 'large',
    'mid-size: 100 - 499 employees': 'mid',
    'small: less than 100 employees': 'small',
    'small: 25 - 99 employees': 'small',
    'startup: less than 25 employees': 'small',
    'solo/self-employed': 'small',
  };
  let sizeCol: 'enterprise' | 'large' | 'mid' | 'small';
  if (sizeMap[sizeKey]) sizeCol = sizeMap[sizeKey];
  else if (sizeKey.includes('over 1,000')) sizeCol = 'enterprise';
  else if (sizeKey.includes('500') && sizeKey.includes('999')) sizeCol = 'large';
  else if (sizeKey.includes('100') && sizeKey.includes('499')) sizeCol = 'mid';
  else if (sizeKey.includes('25 - 99') || sizeKey.includes('less than 100')) sizeCol = 'small';
  else if (sizeKey.includes('startup') || sizeKey.includes('solo')) sizeCol = 'small';
  else sizeCol = 'mid';

  // Base matrix (TDV map `p`)
  const baseMatrix: Record<string, Record<string, number>> = {
    A: { enterprise: 55, large: 48, mid: 40, small: 30 },
    B: { enterprise: 45, large: 38, mid: 30, small: 22 },
    C: { enterprise: 35, large: 28, mid: 22, small: 15 },
    D: { enterprise: 25, large: 20, mid: 15, small: 10 },
    E: { enterprise: 12, large: 10, mid: 8, small: 5 },
  };
  const base = baseMatrix[tier][sizeCol];

  // Job function (TDV map `m`, then keyword fallback; default 0)
  const fnExact: Record<string, number> = {
    'it/computers/electronics': 15, engineering: 15, 'product management': 15,
    'strategy/consulting': 15, marketing: 10, sales: 10, 'business leadership': 10,
    'finance/accounting': 5, 'business ops': 5, operations: 5, legal: 5,
    'human resources': 5, 'creative/design': 5,
  };
  const fnKey = normStr(data.job_function);
  let jobPts: number;
  if (fnKey in fnExact) jobPts = fnExact[fnKey];
  else if (/engineering|software|product|strategy|consulting/.test(fnKey)) jobPts = 15;
  else if (/marketing|communications|sales|business development|executive|leadership/.test(fnKey)) jobPts = 10;
  else if (/finance|accounting|ops|operations|project|legal|human resources|creative|design/.test(fnKey) || fnKey === 'hr') jobPts = 5;
  else jobPts = 0;

  // Goal (TDV map `u`; default 0)
  const goalPoints: Record<string, number> = {
    'implement ai into my business': 10, 'build ai-powered products': 10,
    'automate repetitive tasks': 8, 'supercharge my career': 6,
    'stay ahead of industry trends': 5, 'work faster': 5, 'make more money': 5,
    other: 4,
  };
  const goalPts = goalPoints[normStr(data.main_goal)] || 0;

  // AI tools — one flat bonus per set if any tool from it is selected, capped at 10 (TDV sets f/h/x)
  const setF = new Set(['microsoft copilot', 'copilot', 'zapier', 'make', 'n8n']);
  const setH = new Set(['midjourney', 'runway', 'synthesia', 'heygen', 'elevenlabs', 'canva ai', 'canvaai']);
  const setX = new Set(['chatgpt', 'claude', 'gemini', 'perplexity', 'notebooklm', 'cursor']);
  const picked = new Set((data.ai_tools || []).map(normStr));
  let toolPts = 0;
  if ([...setF].some((t) => picked.has(t))) toolPts += 4;
  if ([...setH].some((t) => picked.has(t))) toolPts += 3;
  if ([...setX].some((t) => picked.has(t))) toolPts += 3;
  toolPts = Math.min(10, toolPts);

  // Industry (TDV sets g/v on industry+niche; else 1 unless blank/"other" → 0). Niche always empty here.
  const ind = normStr(data.industry);
  const setG = ['ai', 'technology', 'software', 'computers/technology', 'information technology/services', 'software/hardware/networking'];
  const setV = ['media', 'advertising', 'marketing', 'finance', 'financial', 'healthcare', 'medical', 'telecommunications'];
  let indPts: number;
  if (setG.some((k) => ind.includes(k))) indPts = 5;
  else if (setV.some((k) => ind.includes(k))) indPts = 3;
  else indPts = ['', '--', 'other'].includes(ind) ? 0 : 1;

  return Math.min(100, Math.max(0, Math.round(base + jobPts + goalPts + toolPts + indPts)));
}

const CHILD_NEWSLETTERS = [
  {
    id: 'thorium-valley',
    name: 'Thorium Valley',
    logo: '/images/tv-logo-white.png',
    description: 'Our flagship daily newsletter covering everything happening in AI.',
    frequency: 'Daily',
    isPartner: false,
  },
  {
    id: 'the-catalyst',
    name: 'The Catalyst',
    logo: '/images/catalyst-logo.png',
    description: 'How businesses and people are implementing AI.',
    frequency: 'Biweekly',
    isPartner: false,
  },
  {
    id: 'the-lab',
    name: 'The Lab',
    logo: '/images/lab-logo.png',
    description: 'Independent reviews of the AI tools your team is paying for.',
    frequency: 'Biweekly',
    isPartner: false,
  },
  {
    id: 'vibe3',
    name: 'Vibe3',
    logo: '/images/vibe3-logo.png',
    description: 'Where AI is going next. The frontier of agents, autonomous systems, and what\'s coming before anyone else sees it.',
    frequency: 'Biweekly',
    isPartner: false,
  },
];

// ============================================
// TYPES
// ============================================

interface FormData {
  email: string;
  first_name: string;
  main_goal: string;
  seniority: string;
  job_function: string;
  industry: string;
  company_size: string;
  ai_tools: string[];
  child_newsletters: string[];
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function SubscribePage() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [subscriberId, setSubscriberId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const hasTrackedQL = useRef(false); // Prevent duplicate QualifiedLead fires across step 9 + 11
  const [dubClicks, setDubClicks] = useState<Record<string, number>>({}); // live { slug: clicks } from Dub for budget-gating

  // ── UTM params captured on arrival ──
  const [utmParams, setUtmParams] = useState<{
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
  }>({});

  // ── Meta fbp/fbc cookies for CAPI attribution ──
  const [metaCookies, setMetaCookies] = useState<{ fbp?: string; fbc?: string }>({});

  const [formData, setFormData] = useState<FormData>({
    email: '',
    first_name: '',
    main_goal: '',
    seniority: '',
    job_function: '',
    industry: '',
    company_size: '',
    ai_tools: [],
    child_newsletters: ['thorium-valley', 'the-catalyst', 'the-lab', 'vibe3'],
  });

  // ── Capture UTM params + Meta cookies on mount ──
  useEffect(() => {
    const utm: typeof utmParams = {};
    const src = searchParams.get('utm_source');
    const med = searchParams.get('utm_medium');
    const camp = searchParams.get('utm_campaign');
    const cont = searchParams.get('utm_content');
    if (src) utm.utm_source = src;
    if (med) utm.utm_medium = med;
    if (camp) utm.utm_campaign = camp;
    if (cont) utm.utm_content = cont;
    if (Object.keys(utm).length > 0) setUtmParams(utm);

    // Read _fbp and _fbc cookies for Meta Conversions API attribution
    const cookies = document.cookie.split(';').reduce((acc, c) => {
      const [k, v] = c.trim().split('=');
      if (k && v) acc[k] = v;
      return acc;
    }, {} as Record<string, string>);
    const mc: typeof metaCookies = {};
    if (cookies['_fbp']) mc.fbp = cookies['_fbp'];
    
    if (cookies['_fbc']) {
      mc.fbc = cookies['_fbc'];
    } else {
      // Construct fbc from URL fbclid if pixel is blocked
      const fbclid = searchParams.get('fbclid');
      if (fbclid) {
        mc.fbc = `fb.1.${Date.now()}.${fbclid}`;
      }
    }

    if (Object.keys(mc).length > 0) setMetaCookies(mc);
  }, [searchParams]);

  // ── iOS Safari: keep the document canvas (the safe-area zones behind the
  // dynamic island + home indicator) matching the current step's background so
  // there are no white bars top/bottom. Steps 1–10 are navy; step 11 is white.
  useEffect(() => {
    const color = step === 11 ? '#ffffff' : '#002f5b';
    document.documentElement.style.backgroundColor = color;
    document.body.style.backgroundColor = color;
  }, [step]);
  // Reset the canvas when leaving the funnel so other routes keep their bg.
  useEffect(() => () => {
    document.documentElement.style.backgroundColor = '';
    document.body.style.backgroundColor = '';
  }, []);

  // ── Sync live Dub click counts for offer budget-gating ──
  // Fetches { slug: clicks } from /api/offers (server-cached 5 min). On failure
  // dubClicks stays {} and the picker uses the static `used` seeds. Runs once on
  // mount — by step 9 the data is ready, so offers reflect real click budgets.
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

  // ── Restore from localStorage on mount ──
  // Only restore if arriving via ?step= (from a subscribe form).
  // Direct visits to /subscribe always start fresh at step 1.
  useEffect(() => {
    const stepParam = searchParams.get('step');
    if (!stepParam) return; // Direct visit — start fresh

    try {
      const saved = localStorage.getItem('tv_subscribe_progress');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.formData) setFormData(parsed.formData);
        if (parsed.step && parsed.step > 1) setStep(parsed.step);
        if (parsed.subscriberId) setSubscriberId(parsed.subscriberId);
      }
    } catch { }
  }, [searchParams]);

  // ── Save to localStorage on every change ──
  useEffect(() => {
    if (step >= 2 || formData.email) {
      try {
        localStorage.setItem('tv_subscribe_progress', JSON.stringify({
          formData,
          step,
          subscriberId,
        }));
      } catch { }
    }
  }, [formData, step, subscriberId]);


  const updateField = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  // ── Helper: figure out which step a returning subscriber left off at ──
  const getResumeStep = (data: Partial<FormData>): number => {
    // Step 2 = newsletters (always let them see it)
    if (!data.first_name) return 3;
    if (!data.main_goal) return 4;
    if (!data.seniority || !data.job_function) return 5;
    if (!data.industry || !data.company_size) return 6;
    if (!data.ai_tools || (data.ai_tools as string[]).length === 0) return 7;
    return 8; // All filled, go to confirmation
  };

  // ── API helpers ──────────────────────────

  const createSubscriber = async (subEventId?: string) => {
    // Re-read _fbp/_fbc cookies fresh at submit time.
    // The fbq script can set _fbp AFTER the mount-time useEffect runs,
    // which is why fbp coverage was only ~31% in EMQ diagnostics.
    // Start from existing state (preserves synthetic fbc built from fbclid)
    // and overwrite with any newer cookie values found right now.
    const freshCookies: { fbp?: string; fbc?: string } = { ...metaCookies };
    const cookiesNow = document.cookie.split(';').reduce((acc, c) => {
      const [k, v] = c.trim().split('=');
      if (k && v) acc[k] = v;
      return acc;
    }, {} as Record<string, string>);
    if (cookiesNow['_fbp']) freshCookies.fbp = cookiesNow['_fbp'];
    if (cookiesNow['_fbc']) freshCookies.fbc = cookiesNow['_fbc'];

    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: formData.email, ...freshCookies, ...utmParams, ...(subEventId ? { sub_event_id: subEventId } : {}) }),
    });
    const data = await res.json();
    if (data.subscriber_id) {
      setSubscriberId(data.subscriber_id);

      // If returning subscriber, restore their progress
      if (data.existing && data.data) {
        const existing = data.data;
        const restored: FormData = {
          email: formData.email,
          first_name: existing.first_name || '',
          main_goal: existing.main_goal || '',
          seniority: existing.seniority || '',
          job_function: existing.job_function || '',
          industry: existing.industry || '',
          company_size: existing.company_size || '',
          ai_tools: existing.ai_tools || [],
          child_newsletters: existing.child_newsletters || ['thorium-valley', 'the-catalyst', 'the-lab', 'vibe3'],
        };
        setFormData(restored);

        // Jump to where they left off
        const resumeStep = getResumeStep(restored);
        setDirection(1);
        setStep(resumeStep);
        return 'resumed';
      }

      // Return the actual subscriber_id so callers can use it immediately
      // (React state update is async and won't be available on next line)
      return data.subscriber_id as string;
    }
    setError(data.error || 'Failed to create subscriber');
    return false;
  };

  const updateSubscriber = async (fields: Partial<FormData>) => {
    if (!subscriberId) return true; // Skip if no subscriber yet
    const res = await fetch('/api/subscribe', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriber_id: subscriberId, ...fields }),
    });
    return res.ok;
  };

  const completeSubscription = async () => {
    if (!subscriberId) return;
    await fetch('/api/subscribe/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscriber_id: subscriberId,
        ...utmParams,
      }),
    });
    // Clear saved progress on completion
    try { localStorage.removeItem('tv_subscribe_progress'); } catch { }
  };



  // ── Navigation ───────────────────────────

  const goNext = async () => {
    setLoading(true);
    setError(null);

    try {
      if (step === 1) {
        if (!formData.email) { setError('Please enter your email'); setLoading(false); return; }
        // Generate Subscribe event_id BEFORE createSubscriber so CAPI + pixel share the same ID
        const subEventId = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        const result = await createSubscriber(subEventId);
        if (result === 'resumed') { setLoading(false); return; }
        if (!result) { setLoading(false); return; }
        setAdvancedMatching(formData.email);
        // Use the returned subscriber_id directly — React state (subscriberId) is stale here
        // because setSubscriberId was just called and hasn't re-rendered yet
        const newSubId = typeof result === 'string' ? result : subscriberId || undefined;
        trackSubscribe(subEventId, newSubId);
      } else if (step === 2) {
        await updateSubscriber({ child_newsletters: formData.child_newsletters });
      } else if (step === 3) {
        if (!formData.first_name.trim()) { setError('Please enter your name'); setLoading(false); return; }
        await updateSubscriber({ first_name: formData.first_name });
      } else if (step === 4) {
        if (!formData.main_goal) { setError('Please select a goal'); setLoading(false); return; }
        await updateSubscriber({ main_goal: formData.main_goal });
      } else if (step === 5) {
        if (!formData.seniority || !formData.job_function) {
          setError('Please fill in both fields');
          setLoading(false);
          return;
        }
        await updateSubscriber({
          seniority: formData.seniority,
          job_function: formData.job_function,
        });
      } else if (step === 6) {
        if (!formData.industry || !formData.company_size) {
          setError('Please fill in both fields');
          setLoading(false);
          return;
        }
        await updateSubscriber({
          industry: formData.industry,
          company_size: formData.company_size,
        });
      } else if (step === 7) {
        if (formData.ai_tools.length === 0) { setError('Please select at least one option'); setLoading(false); return; }
        await updateSubscriber({ ai_tools: formData.ai_tools });
      } else if (step >= 8 && step <= 10) {
        // Loading/tools steps — no data to save
      } else if (step === 11) {
        return; // Final step, no next
      }

      setDirection(1);
      setStep(prev => Math.min(prev + 1, 11));
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);

    // Trigger beehiiv at step 7→8 transition (after all survey data collected)
    // QualifiedLead (ICP) now fires on Littlebird click instead (step 9 + 11)
    if (step === 7) {
      completeSubscription();
    }
  };

  const goBack = () => {
    if (step === 1) return;
    setDirection(-1);
    setStep(prev => prev - 1);
  };

  // ── Log a sponsor offer click (Supabase + Meta pixel + CAPI) ──
  // Thin wrapper over the shared logger so step 9 and the step-11 wall behave
  // identically to the /confirmed wall.
  const logToolClick = (offer: MvfOffer, page: string) => {
    logMvfOfferClick(offer, page, {
      email: formData.email,
      firstName: formData.first_name,
      subscriberId: subscriberId || undefined,
      fbp: metaCookies.fbp,
      fbc: metaCookies.fbc,
    });
  };

  // Step 9 — fire Lead, Purchase, and tier events for Meta optimization
  useEffect(() => {
    if (step === 9) {


      // Fire Lead + Purchase + Tier ONCE on reaching step 9
      // Both pixel (client) and CAPI (server) fire with the same event_id
      // so Meta deduplicates them into a single conversion
      if (!hasTrackedQL.current) {
        hasTrackedQL.current = true;
        const eventId = `ql_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

        // Calculate lead score (0-100)
        const leadScore = calculateLeadScore({
          seniority: formData.seniority,
          company_size: formData.company_size,
          job_function: formData.job_function,
          main_goal: formData.main_goal,
          industry: formData.industry,
          ai_tools: formData.ai_tools,
        });
        console.log(`[Lead Score] ${leadScore}/100`, { seniority: formData.seniority, company_size: formData.company_size });

        // Client-side: Standard Lead (pixel) — for dual tracking with CAPI
        trackLead(`lead_${eventId}`, leadScore, subscriberId || undefined);


        // Client-side: Standard Purchase (pixel) — for value-based optimization
        // Value is dynamically set based on lead score tier ($5/$3/$1.50/$0.25)
        trackPurchase(eventId, leadScore, subscriberId || undefined);

        // Client-side: Custom tier event (lead_high/good/medium/low) — for audience building
        // Fires the tier NAME as the event name for Ads Manager columns + lookalike seeds
        trackLeadTier(eventId, leadScore, subscriberId || undefined);



        // Server-side: CAPI fires Lead + Purchase + Tier with matching event_ids
        fetch('/api/meta-capi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_id: eventId,
            email: formData.email,
            first_name: formData.first_name,
            fbp: metaCookies.fbp,
            fbc: metaCookies.fbc,
            seniority: formData.seniority,
            company_size: formData.company_size,
            main_goal: formData.main_goal,
            job_function: formData.job_function,
            industry: formData.industry,
            lead_score: leadScore,
            subscriber_id: subscriberId,
          }),
        }).catch(() => { });
      }

      const uid = formData.email || 'anon';
      fetch('/api/littlebird-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variation: 'C', type: 'view', uid }),
      }).catch(() => { });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Auto-advance for loading steps (8 and 10)
  useEffect(() => {
    if (step === 8) {
      const delay = 3000 + Math.random() * 2000;
      const timer = setTimeout(() => {
        setDirection(1);
        setStep(9);
      }, delay);
      return () => clearTimeout(timer);
    }
    if (step === 10) {
      const timer = setTimeout(() => {
        setDirection(1);
        setStep(11);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // ── Animation ────────────────────────────

  const variants = {
    enter: (d: number) => ({
      x: d > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (d: number) => ({
      x: d > 0 ? -60 : 60,
      opacity: 0,
    }),
  };

  // ── Render ───────────────────────────────

  // Step 1: Redesigned hero (navy + pink-cloud reskin).
  // Pure presentational component — wired to the SAME funnel handlers, so
  // submission/validation/tracking and steps 2–11 are unchanged. To roll back
  // to the old black hero, just delete this block (the original <StepEmail/>
  // and its step===1 layout below remain intact as a fallback).
  if (step === 1) {
    return (
      <>
        <SubscribeHero
          email={formData.email}
          onEmailChange={(v) => updateField('email', v)}
          onSubmit={goNext}
          loading={loading}
          error={error}
        />
        {/* Legal links — same fixed bar as the rest of the flow */}
        <div
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-50 flex -translate-x-1/2 gap-8 rounded-full px-5 py-2"
          style={{ backgroundColor: 'rgba(0,33,64,0.88)', backdropFilter: 'blur(8px)' }}
        >
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs transition-colors whitespace-nowrap"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs transition-colors whitespace-nowrap"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            Terms of Service
          </a>
        </div>
      </>
    );
  }

  // Step 11: Confirmation — white page with header/footer + personalized tools
  if (step === 11) {
    return (
      <>
        <Navigation variant="hero" heroTheme="dark" scrolledTheme="white" heroBorder={true} />
        <main className="min-h-screen bg-white flex flex-col items-center px-5 pt-24 lg:pt-48 pb-16">
          <div className="w-full max-w-4xl flex flex-col gap-6">
            {/* Confirmation card */}
            <div className="rounded-2xl bg-black p-8 lg:p-12 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-[#5170ff] flex items-center justify-center mb-1">
                <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <p className="font-inter text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: '#5170ff' }}>
                You&rsquo;re subscribed
              </p>
              <h2 className="font-times font-bold text-3xl lg:text-5xl leading-tight" style={{ color: '#ffffff' }}>
                One last step: <em style={{ color: '#ffffff' }}>confirm your email</em>
              </h2>
              <p className="text-sm lg:text-base max-w-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                We just sent a confirmation link to your inbox. Tap it to lock in your free subscription and start reading.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
                <a
                  href="https://mail.google.com/mail/u/0/#search/from%3Anews%40mail.thoriumvalley.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full bg-white text-sm font-semibold hover:bg-white/90 active:scale-[0.98] transition-all"
                  style={{ color: '#1b1b1b' }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M2 6l10 7 10-7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                    <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth={2} />
                  </svg>
                  Open Gmail
                </a>
                <a
                  href="https://outlook.live.com/mail/0/inbox?search=from%3Anews%40mail.thoriumvalley.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full border-2 border-white/30 text-sm font-semibold hover:border-white/50 active:scale-[0.98] transition-all"
                  style={{ color: '#ffffff' }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M2 6l10 7 10-7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                    <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth={2} />
                  </svg>
                  Open Outlook
                </a>
              </div>

              <p className="text-xs mt-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Don&apos;t see it? Check your spam, promotions, or junk folder.
              </p>
            </div>

            {/* Full sponsored-offer wall — shared component, identical to /confirmed. */}
            <OfferWall
              page="confirmation"
              email={formData.email}
              firstName={formData.first_name}
              subscriberId={subscriberId || undefined}
              skip={3}
            />
          </div>
        </main>
        <FooterNew />
      </>
    );
  }

  return (
    <main className={`relative flex flex-col overflow-x-hidden ${step === 9 ? 'min-h-screen h-screen' : 'min-h-screen'}`} style={{ background: '#002f5b' }}>
      {/* Clouds removed for steps 2–11 — solid navy background only. */}

      {/* Progress bar — starts after newsletter selection (step 2). */}
      <div className="relative z-20 w-full h-1 bg-white/10">
        <motion.div
          className="h-full bg-[#5170ff]"
          initial={{ width: '0%' }}
          animate={{ width: `${step <= 2 ? 0 : Math.min(((step - 2) / 9) * 100, 100)}%` }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Main content — box steps are top-anchored (logo pinned at a fixed
          top spot, box starts right below it). Loaders (8/10) stay centered. */}
      <div className={`flex-1 flex justify-center relative z-10 ${step === 9 ? 'px-0 lg:px-8' : 'px-3 lg:px-5'} ${step === 8 || step === 10 ? 'items-center' : 'items-start pt-16 lg:pt-20'} ${step === 9 ? 'overflow-y-auto pb-10 lg:pb-6' : ''}`}>
        <div className={`flex w-full flex-col items-center mx-auto ${step === 9 ? 'max-w-md lg:max-w-3xl' : 'max-w-md'}`}>
          {/* Thorium Valley text logo (wordmark) pinned at the top — same spot
              across steps; the box starts right below it. White on the navy
              steps; inverted to black on the white step 9. Shown on 3–7
              everywhere; on 9 desktop-only. Hidden on step 2. */}
          {step !== 2 && step !== 8 && step !== 10 && (
            <div className="flex justify-center mb-6 lg:mb-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/subscribe/wordmark.png"
                alt="Thorium Valley"
                className="w-[112px] lg:w-[142px] select-none"
              />
            </div>
          )}
          <div className={`w-full ${step >= 2 && step !== 8 && step !== 9 && step !== 10 ? 'rounded-2xl bg-[#002f5b] p-6 lg:p-8 shadow-[0_24px_70px_-18px_rgba(0,0,0,0.6)]' : ''}`}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {step === 1 && (
                <StepEmail
                  formData={formData}
                  updateField={updateField}
                  onNext={goNext}
                  loading={loading}
                  error={error}
                />
              )}
              {step === 2 && (
                <StepNewsletters
                  formData={formData}
                  updateField={updateField}
                  onNext={goNext}
                  onBack={goBack}
                  loading={loading}
                />
              )}
              {step === 3 && (
                <StepName
                  formData={formData}
                  updateField={updateField}
                  onNext={goNext}
                  onBack={goBack}
                  loading={loading}
                />
              )}
              {step === 4 && (
                <StepGoal
                  formData={formData}
                  updateField={updateField}
                  onNext={goNext}
                  onBack={goBack}
                  loading={loading}
                  error={error}
                />
              )}
              {step === 5 && (
                <StepRole
                  formData={formData}
                  updateField={updateField}
                  onNext={goNext}
                  onBack={goBack}
                  loading={loading}
                  error={error}
                />
              )}
              {step === 6 && (
                <StepIndustry
                  formData={formData}
                  updateField={updateField}
                  onNext={goNext}
                  onBack={goBack}
                  loading={loading}
                  error={error}
                />
              )}
              {step === 7 && (
                <StepTools
                  formData={formData}
                  updateField={updateField}
                  onNext={goNext}
                  onBack={goBack}
                  loading={loading}
                />
              )}

              {/* Step 8: Loading — finding tools */}
              {step === 8 && (
                <div className="flex flex-col items-center gap-6 py-12">
                  <div className="w-56 h-56 lg:w-64 lg:h-64">
                    <WireframeGlobe mobileScale={2.5} speedMultiplier={3} />
                  </div>
                  <div className="text-center">
                    <h2 className="font-times font-bold text-xl lg:text-2xl mb-2" style={{ color: '#ffffff' }}>
                      Finding the best tools for you...
                    </h2>
                    <p className="text-sm animate-pulse" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Personalizing your experience
                    </p>
                  </div>
                </div>
              )}

              {/* Step 9: Recommended tools — top 3 by CPC × remaining budget
                  (The Deep View's picker; no persona/answer targeting). */}
              {step === 9 && (() => {
                const heroOffers = pickOffers(3, 0, dubClicks);
                const renderCard = (o: MvfOffer) => (
                  <a
                    key={o.id}
                    href={o.href}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    onClick={() => logToolClick(o, 'tools_page')}
                    className="group flex flex-col w-full rounded-2xl overflow-hidden bg-white border border-[#1b1b1b]/10 transition-all hover:shadow-2xl hover:shadow-white/10 active:scale-[0.99]"
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
                      <p className="font-inter text-[#1b1b1b]/55 text-[13px] leading-snug mb-2">{o.blurb}</p>
                      <span className="inline-flex items-center gap-1 font-inter font-semibold text-[13px] group-hover:underline" style={{ color: '#5170ff' }}>
                        {o.cta}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                      </span>
                    </div>
                  </a>
                );
                return (
                  <div className="flex flex-col items-center gap-4 px-3 lg:px-0 pb-20 lg:pb-6 w-full">
                    <h2 className="font-times text-[22px] lg:text-[26px] text-center leading-snug px-4" style={{ color: '#ffffff' }}>
                      Some AI tools we recommend for you.
                    </h2>

                    {/* Mobile: stacked large cards */}
                    <div className="lg:hidden w-full max-w-md mx-auto flex flex-col gap-4">
                      {heroOffers.map(renderCard)}
                    </div>

                    {/* Desktop: top pick full-size in front, the other two
                        slightly smaller and tucked behind on each side. */}
                    <div className="hidden lg:flex items-center justify-center w-full pt-2">
                      {heroOffers[1] && (
                        <div className="w-[400px] shrink-0 scale-[0.9] origin-right -mr-4 z-0 opacity-90">
                          {renderCard(heroOffers[1])}
                        </div>
                      )}
                      {heroOffers[0] && (
                        <div className="w-[440px] shrink-0 relative z-20 rounded-2xl shadow-2xl">
                          {renderCard(heroOffers[0])}
                        </div>
                      )}
                      {heroOffers[2] && (
                        <div className="w-[400px] shrink-0 scale-[0.9] origin-left -ml-4 z-0 opacity-90">
                          {renderCard(heroOffers[2])}
                        </div>
                      )}
                    </div>

                    <p className="font-inter text-[10px] text-center max-w-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      Paid partner recommendations. We only feature tools we&rsquo;d use ourselves.
                    </p>

                    <div className="w-full max-w-md mx-auto">
                      <button
                        onClick={() => {
                          goNext();
                        }}
                        className="w-full py-3.5 rounded-full bg-white text-black text-base font-semibold hover:bg-white/90 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2"
                      >
                        Become an AI expert
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Step 10: Thank you loading */}
              {step === 10 && (
                <div className="flex flex-col items-center gap-6 py-12">
                  <div className="relative">
                    <svg className="w-12 h-12 text-[#5170ff] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <h2 className="font-times font-bold text-xl lg:text-2xl mb-2" style={{ color: '#ffffff' }}>
                      Thanks for completing the survey!
                    </h2>
                    <p className="text-sm animate-pulse" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Setting up your experience...
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Legal links — dark navy pill on the navy steps; on the white steps
          (8/9/10) it goes transparent with black text so nothing reads blue. */}
      <div
        className={`fixed z-50 flex gap-8 px-5 ${step === 9 ? 'bottom-0 left-0 right-0 rounded-none justify-center pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]' : 'bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 rounded-full py-2'}`}
        style={{
          backgroundColor: 'rgba(0,33,64,0.88)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <a
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs transition-colors whitespace-nowrap"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          Privacy Policy
        </a>
        <a
          href="/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs transition-colors whitespace-nowrap"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          Terms of Service
        </a>
      </div>

      {/* Company logos — social proof (desktop + mobile, absolute so it doesn't shift form) */}
      {step === 1 && (
        <>
          {/* Desktop */}
          <div
            className="absolute bottom-0 left-0 right-0 z-[5] hidden lg:flex flex-col items-center"
            style={{ paddingBottom: '160px' }}
          >
            <p
              className="text-center mb-6"
              style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px', fontWeight: 400 }}
            >
              Join professionals from companies like
            </p>
            <div className="flex items-center justify-center gap-x-12 gap-y-5 flex-wrap px-16 max-w-[700px]">
              {[
                { src: '/images/companies/google logo white.png', alt: 'Google', h: 28 },
                { src: '/images/companies/meta white logo.png', alt: 'Meta', h: 26 },
                { src: '/images/companies/anduril white logo.png', alt: 'Anduril', h: 22 },
                { src: '/images/companies/cisco white logo.png', alt: 'Cisco', h: 30 },
                { src: '/images/companies/fidelity white logo.png', alt: 'Fidelity', h: 24 },
                { src: '/images/companies/adobe white logo.png', alt: 'Adobe', h: 28 },
                { src: '/images/companies/morgan stanley white logo.png', alt: 'Morgan Stanley', h: 26 },
              ].map((logo) => (
                <img
                  key={logo.alt}
                  src={logo.src}
                  alt={logo.alt}
                  style={{ height: logo.h, width: 'auto' }}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </main>
  );
}

// ============================================
// SHARED UI COMPONENTS
// ============================================

function StepHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-times text-center font-bold text-2xl lg:text-4xl mb-2"
      style={{ color: '#ffffff', letterSpacing: '-0.05em' }}
    >
      {children}
    </h2>
  );
}

function StepSubtext({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-center text-sm lg:text-base mb-6" style={{ color: '#ffffff' }}>
      {children}
    </p>
  );
}

function PrimaryButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-3.5 rounded-full bg-white text-[#1b1b1b] text-base font-semibold hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full py-3 rounded-full text-sm font-medium transition-all hover:bg-white/10"
      style={{ color: 'rgba(255,255,255,0.5)' }}
    >
      ← Back
    </button>
  );
}

function NavButtons({
  onNext,
  onBack,
  loading,
  nextLabel = 'Next',
  disableNext,
}: {
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
  nextLabel?: string;
  disableNext?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 mt-6">
      <PrimaryButton onClick={onNext} disabled={loading || disableNext}>
        {loading ? '...' : nextLabel}
      </PrimaryButton>
      <BackButton onClick={onBack} />
    </div>
  );
}

function SelectableCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm ${selected
          ? 'bg-[#5170ff]/20 text-white shadow-[0_10px_28px_-8px_rgba(0,0,0,0.55)]'
          : 'bg-white/5 text-white/80 shadow-[0_8px_22px_-10px_rgba(0,0,0,0.5)] hover:bg-white/[0.08]'
        }`}
    >
      {children}
    </button>
  );
}

function StyledSelect({
  value,
  onChange,
  options,
  placeholder,
  isOpen,
  onToggle,
  onClose,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose?.();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  return (
    <div ref={ref} className="relative" id={id}>
      <button
        type="button"
        onClick={onToggle}
        className={`w-full px-5 py-3.5 rounded-full bg-white/10 border text-sm text-left outline-none cursor-pointer transition-all duration-200 flex items-center justify-between ${isOpen ? 'border-[#5170ff] bg-white/[0.12]' : value ? 'border-white/30' : 'border-white/20'
          }`}
      >
        <span style={{ color: value ? '#fff' : 'rgba(255,255,255,0.4)' }}>
          {value || placeholder}
        </span>
        <svg
          className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200"
          style={{ color: 'rgba(255,255,255,0.5)', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M8 11L3 6h10z" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute left-0 right-0 mt-2 rounded-2xl border border-white/15 bg-[#0a3a68] overflow-hidden z-50"
          style={{
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            animation: 'dropdownIn 0.15s ease-out',
          }}
        >
          <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes dropdownIn {
              from { opacity: 0; transform: translateY(-6px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}} />
          <div className="max-h-[240px] overflow-y-auto py-1.5" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.15) transparent' }}>
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  onClose?.();
                }}
                className={`w-full text-left px-5 py-2.5 text-sm transition-colors duration-100 ${value === opt
                    ? 'text-[#5170ff] bg-[#5170ff]/10 font-medium'
                    : 'text-white/80 hover:bg-white/[0.06] hover:text-white'
                  }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}



// ============================================
// STEP COMPONENTS
// ============================================

// ── Step 1: Email ──────────────────────────

function StepEmail({
  formData,
  updateField,
  onNext,
  loading,
  error,
}: {
  formData: FormData;
  updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  onNext: () => void;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div style={{ transform: 'translateY(-12px)' }}>
        <Image
          src="/Transparent White Logo.png"
          alt="Thorium Valley"
          width={55}
          height={55}
          priority
        />
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
        @media(max-width:1023px){.subscribe-hero-h1{font-size:32px!important;}}
        @media(min-width:1024px){.subscribe-hero-h1{font-size:3.5rem!important;}}
      `}} />
      <h1
        className="subscribe-hero-h1 font-times text-center font-bold -mt-1"
        style={{ color: '#ffffff', letterSpacing: '-0.05em' }}
      >
        Know What Actually<br />Matters in <span style={{ color: '#5170ff' }}>AI</span>
      </h1>

      <style dangerouslySetInnerHTML={{
        __html: `
        @media(max-width:1023px){.subscribe-hero-subtext{font-size:16px!important;padding-left:0.5rem!important;padding-right:0.5rem!important;}}
      `}} />
      <p
        className="subscribe-hero-subtext text-center leading-relaxed"
        style={{ color: '#ffffff', fontSize: '26px', fontWeight: 400 }}
      >
        Our free daily briefing keeps you ahead on AI. The news<br className="hidden lg:block" /> publication written by people who actually work in AI.
      </p>

      <div className="w-full max-w-sm lg:max-w-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onNext();
          }}
        >
          {/* Desktop: stacked like mobile */}
          <div className="hidden lg:flex flex-col gap-3">
            <input
              type="email"
              placeholder="Work Email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              className="w-full bg-white/10 backdrop-blur-sm text-white placeholder:text-white/60 outline-none text-base px-5 py-4 rounded-xl border border-white/20"
              required
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-white text-[#1b1b1b] text-base font-semibold hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {loading ? '...' : 'Subscribe'}
            </button>
          </div>
          {/* Mobile: stacked input + button */}
          <div className="flex flex-col gap-3 lg:hidden">
            <input
              type="email"
              placeholder="Work Email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              className="w-full bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50 outline-none text-base px-5 py-4 rounded-xl border border-white/20"
              required
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-white text-[#1b1b1b] text-base font-semibold hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {loading ? '...' : 'Subscribe'}
            </button>
          </div>
        </form>
        {error && (
          <p className="mt-3 text-sm text-center text-red-400">{error}</p>
        )}
      </div>

      <p className="text-xs text-center -mt-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
        Free forever. Unsubscribe anytime.
      </p>

      {/* Social proof - mobile only */}
      <div className="lg:hidden mt-16 flex flex-col items-center gap-3">
        <p
          className="text-center"
          style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 400 }}
        >
          Join professionals from companies like
        </p>
        <div className="flex items-center justify-center gap-x-7 gap-y-4 flex-wrap px-4 max-w-[340px]">
          {[
            { src: '/images/companies/google logo white.png', alt: 'Google', h: 20 },
            { src: '/images/companies/meta white logo.png', alt: 'Meta', h: 20 },
            { src: '/images/companies/morgan stanley white logo.png', alt: 'Morgan Stanley', h: 20 },
            { src: '/images/companies/cisco white logo.png', alt: 'Cisco', h: 20 },
            { src: '/images/companies/fidelity white logo.png', alt: 'Fidelity', h: 20 },
            { src: '/images/companies/adobe white logo.png', alt: 'Adobe', h: 20 },
            { src: '/images/companies/anduril white logo.png', alt: 'Anduril', h: 20 },
          ].map((logo) => (
            <img
              key={logo.alt}
              src={logo.src}
              alt={logo.alt}
              style={{ height: logo.h, width: 'auto' }}
            />
          ))}
        </div>
      </div>

    </div>
  );
}

// ── Step 3: Name ───────────────────────────

function StepName({
  formData,
  updateField,
  onNext,
  onBack,
  loading,
}: {
  formData: FormData;
  updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
}) {
  return (
    <div>
      <StepHeading>What should we call you?</StepHeading>
      <StepSubtext>Just your first name is fine.</StepSubtext>

      <input
        type="text"
        placeholder="First name"
        value={formData.first_name}
        onChange={(e) => updateField('first_name', e.target.value)}
        className="w-full px-5 py-3.5 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 outline-none text-base focus:border-[#5170ff] transition-colors"
        autoFocus
        onKeyDown={(e) => e.key === 'Enter' && onNext()}
      />

      <NavButtons onNext={onNext} onBack={onBack} loading={loading} />
    </div>
  );
}

// ── Step 4: Goal ─────────────────

function StepGoal({
  formData,
  updateField,
  onNext,
  onBack,
  loading,
  error,
}: {
  formData: FormData;
  updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div>
      <StepHeading>What&apos;s your main goal?</StepHeading>
      <StepSubtext>Pick the one that matters most right now.</StepSubtext>

      <div className="flex flex-col gap-2">
        {GOALS.map((goal) => (
          <SelectableCard
            key={goal}
            selected={formData.main_goal === goal}
            onClick={() => updateField('main_goal', goal)}
          >
            {goal}
          </SelectableCard>
        ))}
      </div>

      {error && (
        <p className="mt-3 text-sm text-center text-red-400">{error}</p>
      )}

      <NavButtons onNext={onNext} onBack={onBack} loading={loading} />
    </div>
  );
}

// ── Step 5: Role ───────────────────────────

function StepRole({
  formData,
  updateField,
  onNext,
  onBack,
  loading,
  error,
}: {
  formData: FormData;
  updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <div>
      <StepHeading>Tell us about your role</StepHeading>
      <StepSubtext>We&apos;ll use this to personalize your experience.</StepSubtext>

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
            What level are you at?
          </label>
          <StyledSelect
            value={formData.seniority}
            onChange={(v) => {
              updateField('seniority', v);
              setTimeout(() => setOpenDropdown('job_function'), 100);
            }}
            options={SENIORITY}
            placeholder="Select your level"
            isOpen={openDropdown === 'seniority'}
            onToggle={() => setOpenDropdown(openDropdown === 'seniority' ? null : 'seniority')}
            onClose={() => setOpenDropdown(null)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
            What do you do day to day?
          </label>
          <StyledSelect
            value={formData.job_function}
            onChange={(v) => updateField('job_function', v)}
            options={JOB_FUNCTIONS}
            placeholder="Select your function"
            isOpen={openDropdown === 'job_function'}
            onToggle={() => setOpenDropdown(openDropdown === 'job_function' ? null : 'job_function')}
            onClose={() => setOpenDropdown(null)}
          />
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-center text-red-400">{error}</p>
      )}

      <NavButtons onNext={onNext} onBack={onBack} loading={loading} />
    </div>
  );
}

// ── Step 6: Industry ───────────────────────

function StepIndustry({
  formData,
  updateField,
  onNext,
  onBack,
  loading,
  error,
}: {
  formData: FormData;
  updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <div>
      <StepHeading>Your industry</StepHeading>
      <StepSubtext>Almost there. Two more quick ones.</StepSubtext>

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
            What industry are you in?
          </label>
          <StyledSelect
            value={formData.industry}
            onChange={(v) => {
              updateField('industry', v);
              setTimeout(() => setOpenDropdown('company_size'), 100);
            }}
            options={INDUSTRIES}
            placeholder="Select your industry"
            isOpen={openDropdown === 'industry'}
            onToggle={() => setOpenDropdown(openDropdown === 'industry' ? null : 'industry')}
            onClose={() => setOpenDropdown(null)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
            How big is your company?
          </label>
          <StyledSelect
            value={formData.company_size}
            onChange={(v) => updateField('company_size', v)}
            options={COMPANY_SIZES}
            placeholder="Select company size"
            isOpen={openDropdown === 'company_size'}
            onToggle={() => setOpenDropdown(openDropdown === 'company_size' ? null : 'company_size')}
            onClose={() => setOpenDropdown(null)}
          />
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-center text-red-400">{error}</p>
      )}

      <NavButtons onNext={onNext} onBack={onBack} loading={loading} />
    </div>
  );
}

// ── Step 7: AI Tools ───────────────────────

function StepTools({
  formData,
  updateField,
  onNext,
  onBack,
  loading,
}: {
  formData: FormData;
  updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
}) {
  const toggle = (tool: string) => {
    const current = formData.ai_tools;
    if (tool === 'None yet') {
      updateField('ai_tools', current.includes('None yet') ? [] : ['None yet']);
      return;
    }
    const filtered = current.filter((t) => t !== 'None yet');
    if (filtered.includes(tool)) {
      updateField('ai_tools', filtered.filter((t) => t !== tool));
    } else {
      updateField('ai_tools', [...filtered, tool]);
    }
  };

  return (
    <div>
      <StepHeading>Which AI tools are you using?</StepHeading>
      <StepSubtext>Select all that apply.</StepSubtext>

      <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-1">
        {AI_TOOLS.map((tool) => {
          const checked = formData.ai_tools.includes(tool.name);
          return (
            <button
              key={tool.name}
              onClick={() => toggle(tool.name)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-full text-xs transition-all ${checked
                  ? 'bg-[#5170ff]/20 text-white shadow-[0_6px_16px_-6px_rgba(0,0,0,0.5)]'
                  : 'bg-white/5 text-white/70 shadow-[0_4px_12px_-7px_rgba(0,0,0,0.45)] hover:bg-white/10'
                }`}
            >
              {tool.logo && (
                <img
                  src={tool.logo}
                  alt=""
                  className="w-4 h-4 object-contain flex-shrink-0"
                />
              )}
              <span className="truncate">{tool.name}</span>
            </button>
          );
        })}
      </div>

      <NavButtons onNext={onNext} onBack={onBack} loading={loading} />
    </div>
  );
}

// ── Step 2: Child Newsletters ──────────────

function StepNewsletters({
  formData,
  updateField,
  onNext,
  onBack,
  loading,
}: {
  formData: FormData;
  updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
}) {
  const toggle = (id: string) => {
    const current = formData.child_newsletters;
    if (current.includes(id)) {
      updateField('child_newsletters', current.filter((n) => n !== id));
    } else {
      updateField('child_newsletters', [...current, id]);
    }
  };

  const handleSkip = () => {
    // Remove child newsletters but keep thorium-valley if present
    const keepTV = formData.child_newsletters.includes('thorium-valley');
    updateField('child_newsletters', keepTV ? ['thorium-valley'] : []);
    onNext();
  };

  // Build the list of newsletters to display based on current selections:
  // - TV selected → show un-selected siblings (Catalyst/Lab) + all partners
  // - Catalyst/Lab only (no TV) → show ONLY partners (don't push TV)
  const hasTV = formData.child_newsletters.includes('thorium-valley');
  const displayNewsletters = CHILD_NEWSLETTERS.filter((nl) => {
    // Never show TV as a recommendation card
    if (nl.id === 'thorium-valley') return false;
    // Partners always show (regardless of TV)
    if (nl.isPartner) return true;
    // Siblings (Catalyst/Lab) only show if TV is selected
    return hasTV;
  });

  return (
    <div>
      <StepHeading>Cover all bases of AI</StepHeading>
      <StepSubtext>More from Thorium Valley</StepSubtext>

      {displayNewsletters.length > 0 && (
        <div className="flex flex-col gap-3">
          {displayNewsletters.map((nl) => {
            const checked = formData.child_newsletters.includes(nl.id);
            return (
              <button
                key={nl.id}
                onClick={() => toggle(nl.id)}
                className={`w-full text-left px-4 py-4 rounded-xl transition-all ${checked
                    ? 'bg-[#5170ff]/15 shadow-[0_10px_28px_-8px_rgba(0,0,0,0.55)]'
                    : 'bg-white/5 shadow-[0_8px_22px_-10px_rgba(0,0,0,0.5)] hover:bg-white/[0.08]'
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 mt-0.5 rounded flex-shrink-0 flex items-center justify-center border transition-all ${checked
                        ? 'bg-[#5170ff] border-[#5170ff]'
                        : 'border-white/30 bg-transparent'
                      }`}
                  >
                    {checked && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <img
                        src={nl.logo}
                        alt=""
                        className={`${nl.id === 'vibe3' ? 'h-10' : 'h-14'} w-auto object-contain`}
                        style={{ mixBlendMode: 'screen' }}
                      />
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white">
                        {nl.frequency}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: '#ffffff' }}>{nl.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-6 space-y-3 pb-12 lg:pb-0">
        <PrimaryButton onClick={onNext} disabled={loading}>Subscribe</PrimaryButton>
        <button
          onClick={handleSkip}
          className="w-full py-3 text-sm text-white/60 hover:text-white transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}


