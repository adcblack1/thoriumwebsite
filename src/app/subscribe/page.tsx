'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import WireframeGlobe from '@/components/WireframeGlobe';
import { Navigation } from '@/components/navigation';
import { FooterNew } from '@/components/footer-new';
import { trackLead } from '@/lib/meta-pixel';

// Sponsored tools shown after survey
const SPONSORED_TOOLS = [
  {
    name: 'Chronicle',
    primary: 'Professional presentations with a prompt.',
    subtext: 'Chronicle is Loveable for slide decks. Turn your ideas into polished presentations in seconds.',
    url: 'https://chr.so/thorium-valley',
    image: '/thumbnails/chronicle.jpg',
    accent: '#F59E0B',
  },
  {
    name: 'Littlebird',
    primary: "If you've ever forgotten what someone said in a meeting, use Littlebird.",
    subtext: 'Littlebird is your AI memory for every meeting, tab, and thing you worked on.',
    url: 'https://try.littlebird.ai/thorium-valley',
    image: '/thumbnails/littlebird.webp',
    featured: true,
    accent: '#4A9B8E',
  },
  {
    name: 'Galaxy.ai',
    primary: 'Use one subscription for every AI.',
    subtext: 'Galaxy.ai lets you use Claude, Perplexity, Gemini, ChatGPT all under a single subscription.',
    url: 'https://try.galaxy.ai/thorium-valley',
    image: '/thumbnails/galaxy.png',
    accent: '#7C3AED',
  },
];

// ============================================
// FLOW CONFIGURATION
// ============================================

const GOALS = [
  'Implement AI at my company',
  'Stay ahead of industry trends',
  'Work faster with AI',
  'Automate repetitive work',
  'Build products with AI',
  'Grow my career',
];

const SENIORITY = [
  'Founder/CEO',
  'C-Suite',
  'VP/Director',
  'Manager',
  'Individual Contributor',
  'Freelance/Solo',
  'Student',
];

const JOB_FUNCTIONS = [
  'Running the company',
  'Sales/Revenue',
  'Marketing/Content',
  'Product/Engineering',
  'Data/Analytics',
  'Operations/Project Management',
  'Finance',
  'Legal/Compliance',
  'HR/People',
  'Customer Success',
  'Design',
  'Strategy/Consulting',
  'Other',
];

const INDUSTRIES = [
  'AI/Tech/Software',
  'Financial Services',
  'Healthcare',
  'Retail/E-commerce',
  'Media/Marketing/Advertising',
  'Professional Services',
  'Education',
  'Manufacturing',
  'Real Estate/Construction',
  'Government',
  'Other',
];

const COMPANY_SIZES = [
  'Just me',
  '2-25',
  '26-100',
  '101-500',
  '501-1,000',
  '1,000+',
];

const AI_TOOLS = [
  'ChatGPT', 'Claude', 'Gemini', 'Microsoft Copilot', 'Perplexity',
  'Cursor', 'Notion AI', 'Midjourney', 'Zapier', 'Make',
  'n8n', 'NotebookLM', 'HeyGen', 'Runway', 'ElevenLabs',
  'Canva AI', 'Lovable', 'None yet',
];

const CHILD_NEWSLETTERS = [
  {
    id: 'the-catalyst',
    name: 'The Catalyst',
    logo: '/images/catalyst-logo.png',
    description: 'How businesses and people are implementing AI and how to do it yourself.',
    frequency: 'Biweekly',
  },
  {
    id: 'the-lab',
    name: 'The Lab',
    logo: '/images/lab-logo.png',
    description: 'Interesting and useful AI tools and whether they\'re worth trying out.',
    frequency: 'Biweekly',
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

  const [formData, setFormData] = useState<FormData>({
    email: '',
    first_name: '',
    main_goal: '',
    seniority: '',
    job_function: '',
    industry: '',
    company_size: '',
    ai_tools: [],
    child_newsletters: ['thorium-valley', 'the-catalyst', 'the-lab'],
  });

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
    } catch {}
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
      } catch {}
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
      body: JSON.stringify({ email: formData.email }),
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
          child_newsletters: existing.child_newsletters || ['thorium-valley', 'the-catalyst', 'the-lab'],
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
      body: JSON.stringify({ subscriber_id: subscriberId }),
    });
    // Clear saved progress on completion
    try { localStorage.removeItem('tv_subscribe_progress'); } catch {}
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
        trackLead();
      } else if (step === 2) {
        await updateSubscriber({ child_newsletters: formData.child_newsletters });
      } else if (step === 3) {
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

    // Trigger beehiiv at step 8 (confirmation)
    if (step === 7) {
      completeSubscription();
    }
  };

  const goBack = () => {
    if (step === 1) return;
    setDirection(-1);
    setStep(prev => prev - 1);
  };

  // Auto-advance for loading steps (8 and 10)
  useEffect(() => {
    if (step === 8) {
      const delay = 3000 + Math.random() * 2000; // 3-5 seconds
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
        <main className="min-h-screen bg-white flex items-center justify-center px-5 pt-24 pb-16">
          <div className="w-full max-w-lg flex flex-col gap-6">
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

            {/* Personalized tools */}
            <div className="rounded-2xl bg-[#1b1b1b] p-6">
              <h3 className="font-times font-bold text-lg text-white mb-4 text-center">
                Your personalized tools
              </h3>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {[SPONSORED_TOOLS[1], SPONSORED_TOOLS[0], SPONSORED_TOOLS[2]].map((tool) => (
                  <a
                    key={tool.name}
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl overflow-hidden border border-white/10 hover:border-[#5170ff]/30 transition-all group flex-1"
                    style={{ background: '#1b1b1b' }}
                  >
                    <div
                      className="w-full h-20 flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${tool.accent}33, ${tool.accent}11)` }}
                    >
                      <span className="font-times font-bold text-white text-base" style={{ letterSpacing: '-0.03em' }}>
                        {tool.name}
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="font-times font-bold text-white text-xs leading-snug mb-1">{tool.primary}</p>
                      <p className="font-inter text-white/50 text-[10px] leading-relaxed">{tool.subtext}</p>
                      <span className="inline-block mt-2 text-[#5170ff] text-[10px] font-inter font-semibold group-hover:underline">Try it →</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </main>
        <FooterNew />
      </>
    );
  }

  return (
    <main className="relative min-h-screen flex flex-col bg-black overflow-hidden">
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
      <div className="flex-1 flex items-center justify-center px-5 relative z-10">
        <div className={`w-full ${step === 9 ? 'max-w-4xl' : 'max-w-md'} ${step >= 2 && step !== 8 && step !== 10 ? 'rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl p-6 lg:p-8' : ''}`}>
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

              {/* Step 9: Recommended tools */}
              {step === 9 && (
                <div className="flex flex-col items-center gap-6">
                  <div className="text-center mb-2">
                    <p className="text-xs font-inter font-semibold uppercase tracking-widest mb-2" style={{ color: '#5170ff' }}>AI TOOLS</p>
                    <h2 className="font-times text-2xl lg:text-3xl" style={{ fontWeight: 500, letterSpacing: '-0.05em', color: '#ffffff' }}>
                      We picked these tools for <em>you</em>
                    </h2>
                    <p className="text-xs font-inter mt-3 max-w-sm mx-auto leading-relaxed" style={{ color: '#ffffff' }}>
                      These are the ones we recommend for your goals and background.
                    </p>
                  </div>

                  {/* Cards - side by side on desktop, stacked on mobile (Littlebird first) */}
                  <div className="w-full flex flex-col lg:flex-row items-center lg:items-end justify-center gap-5 lg:gap-5">
                    {[SPONSORED_TOOLS[1], SPONSORED_TOOLS[0], SPONSORED_TOOLS[2]].map((tool, i) => {
                      const desktopOrder = i === 0 ? 'lg:order-2' : i === 1 ? 'lg:order-1' : 'lg:order-3';
                      const isDesktopCenter = i === 0;

                      return (
                        <a
                          key={tool.name}
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block rounded-xl overflow-hidden transition-all group hover:shadow-lg hover:shadow-white/10 ${
                            desktopOrder
                          } ${
                            isDesktopCenter
                              ? 'lg:flex-1 lg:max-w-[340px] lg:z-10'
                              : 'lg:flex-1 lg:max-w-[280px] lg:scale-[0.92] lg:opacity-70 lg:hover:opacity-100'
                          } w-full`}
                          style={{ background: '#ffffff' }}
                        >
                          {/* Headline */}
                          <div className="px-5 pt-5 pb-3">
                            <h3 className="font-times text-[#1b1b1b] leading-tight" style={{ fontWeight: 500, letterSpacing: '-0.05em', fontSize: isDesktopCenter ? '20px' : '17px' }}>
                              {tool.primary}
                            </h3>
                          </div>
                          {/* Screenshot thumbnail */}
                          <div className="px-4">
                            <img
                              src={tool.image}
                              alt={tool.name}
                              className="w-full rounded-lg object-cover"
                              style={{ height: isDesktopCenter ? '160px' : '130px' }}
                            />
                          </div>
                          {/* Subtext */}
                          <div className="px-5 pt-3 pb-5">
                            <p className="font-inter text-[#1b1b1b]/50 text-[11px] leading-relaxed">
                              {tool.subtext}
                            </p>
                            <span className="inline-block mt-2 text-[#5170ff] text-xs font-inter font-semibold group-hover:underline">
                              Try {tool.name} →
                            </span>
                          </div>
                        </a>
                      );
                    })}
                  </div>

                  <PrimaryButton onClick={goNext}>Continue</PrimaryButton>
                </div>
              )}

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
      <div className="relative z-10 flex justify-center gap-8 pb-6">
        <a
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs transition-colors"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          Privacy Policy
        </a>
        <a
          href="/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs transition-colors"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          Terms of Service
        </a>
      </div>
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
      className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ${
        selected
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
        className={`w-full px-5 py-3.5 rounded-full bg-white/10 border text-sm text-left outline-none cursor-pointer transition-all duration-200 flex items-center justify-between ${
          isOpen ? 'border-[#5170ff] bg-white/[0.12]' : value ? 'border-white/30' : 'border-white/20'
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
          <style dangerouslySetInnerHTML={{ __html: `
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
                className={`w-full text-left px-5 py-2.5 text-sm transition-colors duration-100 ${
                  value === opt
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
      <div style={{ transform: 'translateY(-30px)' }}>
        <Image
          src="/Transparent White Logo.png"
          alt="Thorium Valley"
          width={55}
          height={55}
          priority
        />
      </div>
      <h1
        className="font-times text-center text-balance font-bold text-5xl lg:text-7xl -mt-1"
        style={{ color: '#ffffff', letterSpacing: '-0.05em' }}
      >
        <em className="italic" style={{ color: '#5170ff' }}>AI</em> IS EATING<br />THE WORLD
      </h1>

      <style dangerouslySetInnerHTML={{
        __html: `
        @media(max-width:1023px){.subscribe-hero-subtext{font-size:20px!important;padding-left:2rem!important;padding-right:2rem!important;}}
      `}} />
      <p
        className="subscribe-hero-subtext text-center leading-relaxed max-w-2xl px-14"
        style={{ color: '#ffffff', fontSize: '26px', fontWeight: 400 }}
      >
        Our free, daily briefing keeps you ahead on AI.
      </p>

      <div className="w-full max-w-sm lg:max-w-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onNext();
          }}
        >
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2.5 sm:py-3 border border-white/20">
            <input
              type="email"
              placeholder="Work Email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              className="flex-1 min-w-0 bg-transparent text-white placeholder:text-white/60 outline-none text-sm sm:text-base"
              required
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-3 sm:px-6 py-2 rounded-full bg-white text-[#1b1b1b] text-sm sm:text-base font-medium hover:bg-white/90 transition-colors whitespace-nowrap disabled:opacity-50 shrink-0"
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

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 max-h-[360px] overflow-y-auto pr-1">
        {AI_TOOLS.map((tool) => {
          const checked = formData.ai_tools.includes(tool);
          return (
            <button
              key={tool}
              onClick={() => toggle(tool)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs transition-all ${
                checked
                  ? 'border-[#5170ff] bg-[#5170ff]/15 text-white'
                  : 'border-white/15 bg-white/5 text-white/70 hover:border-white/25'
              }`}
            >
              <div
                className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-all ${
                  checked
                    ? 'bg-[#5170ff] border-[#5170ff]'
                    : 'border-white/30 bg-transparent'
                }`}
              >
                {checked && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              {tool}
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

  return (
    <div>
      <StepHeading>Cover all bases of AI</StepHeading>
      <StepSubtext>More from Thorium Valley</StepSubtext>

      <div className="flex flex-col gap-3">
        {CHILD_NEWSLETTERS.map((nl) => {
          const checked = formData.child_newsletters.includes(nl.id);
          return (
            <button
              key={nl.id}
              onClick={() => toggle(nl.id)}
              className={`w-full text-left px-4 py-4 rounded-xl border transition-all ${
                checked
                  ? 'border-[#5170ff] bg-[#5170ff]/10'
                  : 'border-white/15 bg-white/5 hover:border-white/25'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 mt-0.5 rounded flex-shrink-0 flex items-center justify-center border transition-all ${
                    checked
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
                      className="h-14 w-auto object-contain"
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

      <div className="mt-6 space-y-3">
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


