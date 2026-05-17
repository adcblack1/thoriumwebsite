'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import WireframeGlobe from '@/components/WireframeGlobe';
import { Navigation } from '@/components/navigation';
import { FooterNew } from '@/components/footer-new';
import { trackLead, trackSubscribe, trackPurchase, trackLeadTier, trackQualifiedLead, setAdvancedMatching, trackSurveyComplete } from '@/lib/meta-pixel';

// Sponsored tools shown after survey
const SPONSORED_TOOLS = [
  {
    name: 'Gamma',
    primary: 'Professional presentations with a prompt.',
    subtext: 'Gamma is Loveable for slide decks. Turn your ideas into polished presentations in seconds.',
    url: 'https://try.gamma.app/f37ycs1r79mx',
    image: '/images/gamma.png',
    accent: '#F59E0B',
  },
  {
    name: 'Granola',
    primary: 'The TV team loves Granola.',
    subtext: 'The only AI notetaker that actually saves you time. Summarizes every meeting, creates action items from your perspective, and saves us ~10 hours a week per person.',
    url: 'https://granola.ai?via=thorium',
    image: '/thumbnails/granola.avif',
    featured: true,
    accent: '#F5A623',
  },
  {
    name: 'Clico',
    primary: 'Stop tab-switching to ChatGPT.',
    subtext: 'Clico is a free add-on that puts a writing helper directly inside Gmail, Google Docs, LinkedIn, and wherever else you type. No more copying your email into another tab and pasting the answer back.',
    url: 'https://tryclico.link/thorium-valley',
    image: '/images/clico-thumbnail.png',
    accent: '#7C3AED',
  },
];

// Granola partnership — single variation (replacing Littlebird A/B/C test)
const LB_UNDERLINE = 'underline decoration-[#5170ff] decoration-2 underline-offset-4';
const LB_VARIATIONS: Record<string, { label: string; mediaType: 'image' | 'video'; mediaSrc: string; headline: string; subtext: string; subtext2: string; link: string }> = {
  C: {
    label: 'Granola',
    mediaType: 'image',
    mediaSrc: '/thumbnails/granola.avif',
    headline: 'granola',
    subtext: 'Not the food. It\'s an AI notepad that does the one thing every other notetaker promises and none of them deliver: it actually makes your notes useful. You write during the meeting, it transcribes in the background, and when the call ends you get clean summaries and action items from your perspective. Saves our team about an hour a day each.',
    subtext2: 'Don\'t believe us? Try it for one call and you\'ll see what we\'re talking about.',
    link: 'https://granola.ai?via=thorium',
  },
};


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
// Exact mirror of DeepView's algorithm — verified via empirical testing (3/3 matches)
// Formula: base(seniority × companySize) + jobFunction + goal + min(10, Σ aiTools) + industry
function calculateLeadScore(data: {
  seniority: string;
  company_size: string;
  job_function: string;
  main_goal: string;
  industry: string;
  ai_tools: string[];
}): number {
  // 1. Seniority → tier
  const seniorityTier: Record<string, string> = {
    'Founder/CEO': 'A', 'C-level': 'A',
    'SVP/EVP': 'B', 'Director/VP': 'B',
    'Manager/Supervisor': 'C',
    'Mid or Entry Level': 'D', 'Freelance/Contract': 'D',
    'Student/Intern': 'E', 'Other': 'E',
  };

  // 2. Company size → column
  const sizeCol: Record<string, number> = {
    'Enterprise: over 1,000 employees': 0,
    'Large: 500 - 999 employees': 1,
    'Mid-size: 100 - 499 employees': 2,
    'Small: 25 - 99 employees': 3,
    'Startup: Less than 25 employees': 3,
    'Solo/Self-Employed': 3,
  };

  // 3. Base matrix [tier][sizeCol]
  const baseMatrix: Record<string, number[]> = {
    'A': [55, 48, 40, 30],
    'B': [45, 38, 30, 22],
    'C': [35, 28, 22, 15],
    'D': [25, 20, 15, 10],
    'E': [12, 10,  8,  5],
  };

  // 4. Job function points
  const jobPoints: Record<string, number> = {
    'Executive/Leadership': 10,
    'Engineering/Software Development': 15, 'Product Management': 15,
    'Data/Analytics': 15, 'Strategy/Consulting': 15,
    'Sales/Business Development': 10, 'Marketing/Communications': 10,
    'Operations/Project Management': 5, 'Finance/Accounting': 5,
    'Human Resources': 5, 'Customer Success/Support': 5,
    'Design/Creative': 5, 'Other': 5,
  };

  // 5. Goal points
  const goalPoints: Record<string, number> = {
    'Implement AI into my business': 10, 'Build AI-powered products': 10,
    'Automate repetitive tasks': 8, 'Supercharge my career': 6,
    'Stay ahead of industry trends': 5, 'Make more money': 5, 'Work faster': 5,
  };

  // 6. Industry points
  const industryPoints: Record<string, number> = {
    'AI/Technology/Software': 5,
    'Financial Services': 3, 'Healthcare/Medical': 3,
    'Media/Advertising/Marketing': 3, 'Telecommunications': 3,
    'Biotech/Pharmaceuticals': 1, 'Retail/E-commerce/Consumer Goods': 1,
    'Manufacturing/Industrial': 1, 'Professional Services': 1,
    'Education': 1, 'Government/Public Sector': 1,
    'Real Estate/Construction': 1, 'Transportation/Logistics': 1,
    'Energy/Utilities': 1, 'Hospitality/Travel/Entertainment': 1,
    'Non-Profit': 1, 'Other': 1,
  };

  // 7. Per-tool scoring, capped at 10
  const toolPoints: Record<string, number> = {
    'Microsoft Copilot': 4, 'Zapier': 4, 'Make': 4, 'n8n': 4,
    'ChatGPT': 3, 'Claude': 3, 'Gemini': 3, 'Perplexity': 3,
    'NotebookLM': 3, 'Cursor': 3, 'Notion AI': 3, 'Lovable': 3,
    'Midjourney': 3, 'Runway': 3, 'HeyGen': 3, 'ElevenLabs': 3, 'Canva AI': 3,
    'None yet': 0,
  };

  const tools = data.ai_tools || [];
  const toolScore = Math.min(10, tools.reduce((sum, t) => sum + (toolPoints[t] || 0), 0));

  const tier = seniorityTier[data.seniority] || 'E';
  const col = sizeCol[data.company_size] ?? 3;
  const base = (baseMatrix[tier] || baseMatrix['E'])[col];
  const job = jobPoints[data.job_function] || 5;
  const goal = goalPoints[data.main_goal] || 5;
  const ind = industryPoints[data.industry] || 1;

  return Math.min(100, Math.max(0, base + job + goal + toolScore + ind));
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
  const [lbVariation, setLbVariation] = useState<string>('C');
  const hasTrackedQL = useRef(false); // Prevent duplicate QualifiedLead fires across step 9 + 11

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

  const createSubscriber = async () => {
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: formData.email, ...metaCookies, ...utmParams }),
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

      return true;
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
        const result = await createSubscriber();
        if (result === 'resumed') { setLoading(false); return; }
        if (!result) { setLoading(false); return; }
        setAdvancedMatching(formData.email); // Set email for attribution
        // Lead event now fires at step 9 (survey completion) for better Meta optimization
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

  // ── Log sponsor tool clicks to Supabase ──
  const logToolClick = (toolName: string, page: string) => {
    if (!subscriberId) return;
    try {
      navigator.sendBeacon(
        '/api/subscribe/sponsor-click',
        new Blob(
          [JSON.stringify({ subscriber_id: subscriberId, sponsor_slug: toolName.toLowerCase(), step: page })],
          { type: 'application/json' }
        )
      );
    } catch { }
  };

  // Littlebird – show winning variation C, log view + fire QualifiedLead on page view
  useEffect(() => {
    if (step === 9) {
      trackSurveyComplete(); // Fire pixel event for funnel tracking

      // Fire Lead + QualifiedLead ONCE on reaching step 9
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

        // Client-side: Standard Subscribe (pixel) — for campaign flexibility
        trackSubscribe(eventId, subscriberId || undefined);

        // Client-side: Standard Purchase (pixel) — for value-based optimization
        // Value is dynamically set based on lead score tier ($5/$3/$1.50/$0.25)
        trackPurchase(eventId, leadScore, subscriberId || undefined);

        // Client-side: Custom tier event (lead_high/good/medium/low) — for audience building
        // Fires the tier NAME as the event name for Ads Manager columns + lookalike seeds
        trackLeadTier(eventId, leadScore, subscriberId || undefined);

        // Client-side: Custom QualifiedLead (pixel) — for internal tracking
        trackQualifiedLead({
          seniority: formData.seniority,
          company_size: formData.company_size,
          main_goal: formData.main_goal,
          job_function: formData.job_function,
          industry: formData.industry,
        }, eventId);

        // Server-side: CAPI fires BOTH Lead + QualifiedLead with matching event_ids
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

  // Step 11: Confirmation — white page with header/footer + personalized tools
  if (step === 11) {
    return (
      <>
        <Navigation variant="hero" heroTheme="dark" scrolledTheme="white" heroBorder={true} />
        <main className="min-h-screen bg-white flex flex-col items-center px-5 pt-48 pb-16">
          <div className="w-full max-w-4xl flex flex-col gap-6">
            {/* Confirmation card */}
            <div className="rounded-2xl bg-[#1b1b1b] p-8 lg:p-12 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-[#5170ff]/20 flex items-center justify-center mb-2">
                <svg className="w-8 h-8 text-[#5170ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              <h2 className="font-times font-bold text-2xl lg:text-4xl" style={{ color: '#ffffff' }}>
                One last step: confirm your email
              </h2>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Check your inbox. We just sent you a confirmation.
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

            {/* Granola partnership — single tool */}
            <div className="text-center mb-4 mt-2">
              <div className="flex items-center justify-center gap-3 lg:gap-4 mb-3">
                <img src="/Transparent White Logo.png" alt="Thorium Valley" className="h-8 lg:h-10 invert" style={{ objectFit: 'contain' }} />
                <span className="text-[#1b1b1b]/30 font-inter text-base font-light">×</span>
                <img src="/images/granola-logo.avif" alt="Granola" className="h-8 lg:h-12" style={{ objectFit: 'contain' }} />
              </div>
              <p className="font-inter text-[10px] lg:text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: '#5170ff' }}>
                Official AI Meeting Tool Partner
              </p>
            </div>
            <a
              href="https://granola.ai?via=thorium"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                logToolClick('granola', 'confirmation');
              }}
              className="block w-full max-w-lg mx-auto rounded-xl overflow-hidden transition-all group hover:shadow-lg border border-[#1b1b1b]/10"
              style={{ background: '#ffffff' }}
            >
              <div className="px-5 pt-5 pb-3">
                <h3 className="font-times text-[#1b1b1b] leading-tight" style={{ fontWeight: 500, letterSpacing: '-0.05em', fontSize: '22px' }}>
                  Why we can&rsquo;t stop talking about Granola.
                </h3>
              </div>
              <div className="px-4">
                <img src="/thumbnails/granola.avif" alt="Granola" className="w-full rounded-lg" style={{ objectFit: 'contain' }} />
              </div>
              <div className="px-5 pt-3 pb-5">
                <p className="font-inter text-[#1b1b1b]/50 text-xs leading-relaxed">
                  Not the food. It&rsquo;s an AI notepad that actually makes your notes useful. Saves our team about an hour a day each.
                </p>
                <span className="inline-block mt-2 text-[#5170ff] text-xs font-inter font-semibold group-hover:underline">
                  Try Granola free →
                </span>
              </div>
            </a>
          </div>
        </main>
        <FooterNew />
      </>
    );
  }

  return (
    <main className={`relative flex flex-col bg-black overflow-x-hidden ${step === 9 ? 'min-h-screen h-screen' : 'min-h-screen'}`}>
      {/* Globe background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-50">
        <WireframeGlobe desktopYOffset={-40} mobileYOffset={-65} mobileScale={1.65} />
      </div>

      {/* Progress bar — starts after newsletter selection (step 2) */}
      <div className="relative z-20 w-full h-1 bg-white/10">
        <motion.div
          className="h-full bg-[#5170ff]"
          initial={{ width: '0%' }}
          animate={{ width: `${step <= 2 ? 0 : Math.min(((step - 2) / 9) * 100, 100)}%` }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Main content */}
      <div className={`flex-1 flex ${step === 9 ? 'items-start lg:items-center overflow-y-auto py-4 lg:py-6' : 'items-center'} justify-center ${step === 9 ? 'px-0 lg:px-8' : 'px-3 lg:px-5'} relative z-10 ${step <= 1 ? 'mt-8 lg:-mt-44' : step === 9 ? '' : 'lg:-mt-4'}`}>
        <div className={`w-full ${step === 9 ? 'max-w-md lg:max-w-3xl mx-auto' : step === 1 ? 'max-w-md lg:max-w-2xl' : 'max-w-md'} ${step >= 2 && step !== 8 && step !== 9 && step !== 10 ? 'rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl p-6 lg:p-8' : ''}`}>
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
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full border-2 border-[#5170ff]/30" />
                    <div className="absolute inset-0 w-14 h-14 rounded-full border-2 border-[#5170ff] border-t-transparent animate-spin" />
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

              {/* Step 9: Granola partnership */}
              {step === 9 && (() => {
                const v = LB_VARIATIONS[lbVariation] || LB_VARIATIONS.C;
                return (
                  <div className="flex flex-col items-center gap-4 lg:gap-5 px-3 lg:px-0 pb-16 lg:pb-0">
                    {/* Card — stacked on mobile, side-by-side on desktop */}
                    <a
                      href={v.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        logToolClick('granola', 'tools_page');
                      }}
                      className="block w-full max-w-xl mx-auto rounded-xl overflow-hidden transition-all group hover:shadow-2xl hover:shadow-white/10"
                      style={{ background: '#ffffff' }}
                    >
                      <div className="flex flex-col">
                        {/* Blue section — logos + media */}
                        <div style={{ backgroundColor: '#5170ff' }} className="px-5 pt-3 pb-4 lg:px-8 lg:pb-6 flex flex-col items-center">
                          <div className="flex items-center justify-center gap-2 lg:gap-3 mb-1">
                            <img src="/Transparent White Logo.png" alt="Thorium Valley" className="h-5 lg:h-6" style={{ objectFit: 'contain' }} />
                            <span className="text-white/50 font-inter text-xs font-light">×</span>
                            <img src="/images/granola-logo.avif" alt="Granola" className="h-5 lg:h-7 invert brightness-0" style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                          </div>
                          <p className="font-inter text-[7px] lg:text-[8px] font-semibold uppercase tracking-[0.15em] text-center mb-3" style={{ color: '#ffffff' }}>
                            Official AI Meeting Tool Partner
                          </p>
                          <img key={v.mediaSrc} src={v.mediaSrc} alt="Granola AI" className="w-full rounded-lg shadow-xl" style={{ objectFit: 'contain' }} />
                        </div>
                        {/* White section — copy */}
                        <div className="px-6 py-3 lg:px-10 lg:py-4">
                          <span className="font-inter text-[10px] lg:text-[11px] font-semibold uppercase tracking-widest mb-1 block" style={{ color: '#5170ff' }}>
                            Our Favorite AI Tool
                          </span>
                          <h3 className="font-times text-[#1b1b1b] leading-tight mb-1.5 text-[16px] lg:text-[18px]" style={{ fontWeight: 500, letterSpacing: '-0.04em' }}>
                            Why we can&rsquo;t stop talking about <span className={LB_UNDERLINE}>Granola</span>.
                          </h3>
                          <p className="font-inter text-[#1b1b1b]/55 text-[10px] lg:text-[11px] leading-relaxed mb-0.5">{v.subtext}</p>
                          <p className="font-inter text-[#1b1b1b]/55 text-[10px] lg:text-[11px] leading-relaxed mb-2.5">{v.subtext2}</p>
                          <span className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-full font-inter font-semibold text-[13px] text-white transition-all group-hover:brightness-110" style={{ backgroundColor: '#5170ff' }}>
                            Try Granola free
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                          </span>
                          <p className="font-inter text-[8px] text-[#1b1b1b]/30 mt-1 text-center">Free to try</p>
                        </div>
                      </div>
                    </a>
                    <div className="w-full max-w-xl mx-auto">
                      <PrimaryButton onClick={() => {
                        goNext();
                      }}>Start reading →</PrimaryButton>
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

      {/* Legal links */}
      <div className={`fixed ${step === 9 ? 'bottom-0 left-0 right-0 rounded-none justify-center py-2' : 'bottom-4 left-1/2 -translate-x-1/2 rounded-full'} z-50 flex gap-8 px-5 py-2`} style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
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
      style={{ color: '#ffffff', letterSpacing: '-0.03em' }}
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
      className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ${selected
          ? 'border-[#5170ff] bg-[#5170ff]/15 text-white'
          : 'border-white/15 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/8'
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
          className="absolute left-0 right-0 mt-2 rounded-2xl border border-white/15 bg-[#1a1a1a] overflow-hidden z-50"
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
        className="subscribe-hero-h1 font-times text-center font-bold -mt-1 uppercase"
        style={{ color: '#ffffff', letterSpacing: '-0.05em' }}
      >
        <span className="lg:whitespace-nowrap">The morning paper</span>{' '}<br className="hidden lg:block" />for <span style={{ color: '#5170ff' }}>everything AI</span>
      </h1>

      <style dangerouslySetInnerHTML={{
        __html: `
        @media(max-width:1023px){.subscribe-hero-subtext{font-size:16px!important;padding-left:0.5rem!important;padding-right:0.5rem!important;}}
      `}} />
      <p
        className="subscribe-hero-subtext text-center leading-relaxed"
        style={{ color: '#ffffff', fontSize: '26px', fontWeight: 400 }}
      >
        Our free, daily briefing keeps you ahead on AI.<br />The news, tools, and strategies professionals actually need.
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

// ── Step 2: Name ───────────────────────────

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

// ── Step 3: Goal + Sponsor ─────────────────

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

// ── Step 4: Role ───────────────────────────

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

// ── Step 5: Industry ───────────────────────

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

// ── Step 6: AI Tools ───────────────────────

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
              className={`flex items-center gap-2 px-3 py-2.5 rounded-full border text-xs transition-all ${checked
                  ? 'border-[#5170ff] bg-[#5170ff]/15 text-white'
                  : 'border-white/15 bg-white/5 text-white/70 hover:border-white/25'
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

// ── Step 7: Child Newsletters ──────────────

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
                className={`w-full text-left px-4 py-4 rounded-xl border transition-all ${checked
                    ? 'border-[#5170ff] bg-[#5170ff]/10'
                    : 'border-white/15 bg-white/5 hover:border-white/25'
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


