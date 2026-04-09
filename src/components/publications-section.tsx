'use client';

import React, { useState } from 'react';

const NEWSLETTERS = [
  {
    id: 'thorium-valley',
    name: 'Thorium Valley',
    logo: '/Transparent Black Logo.png',
    description: 'Our flagship daily newsletter covering everything happening in AI. News, tools, and what it means for you.',
    frequency: 'Daily',
    flagship: true,
  },
  {
    id: 'the-catalyst',
    name: 'The Catalyst',
    logo: '/images/catalyst-logo-dark.png',
    description: 'How businesses and people are implementing AI and how to do it yourself.',
    frequency: 'Biweekly',
  },
  {
    id: 'the-lab',
    name: 'The Lab',
    logo: '/images/lab-logo-dark.png',
    description: 'Interesting and useful AI tools and whether they\'re worth trying out.',
    frequency: 'Biweekly',
  },
];

export function PublicationsSection() {
  const [email, setEmail] = useState('');
  const [selected, setSelected] = useState<string[]>(NEWSLETTERS.map(n => n.id));
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleNewsletter = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitting || selected.length === 0) return;

    setSubmitting(true);
    try {
      // Create subscriber record first
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      const subscriberId = data.subscriber_id;

      if (subscriberId) {
        // Save selected newsletters to subscriber record
        await fetch('/api/subscribe', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscriber_id: subscriberId,
            child_newsletters: selected,
          }),
        });

        // Store progress and redirect to subscribe flow
        // Step 3 = name (they already picked newsletters)
        const formData = {
          email,
          first_name: data.data?.first_name || '',
          main_goal: data.data?.main_goal || '',
          seniority: data.data?.seniority || '',
          job_function: data.data?.job_function || '',
          industry: data.data?.industry || '',
          company_size: data.data?.company_size || '',
          ai_tools: data.data?.ai_tools || [],
          child_newsletters: selected,
        };

        // If returning subscriber, figure out resume step
        let resumeStep = 3; // skip newsletter step since they already chose
        if (data.existing && data.data) {
          if (data.data.first_name && data.data.main_goal) {
            if (!data.data.seniority || !data.data.job_function) resumeStep = 5;
            else if (!data.data.industry || !data.data.company_size) resumeStep = 6;
            else if (!data.data.ai_tools || data.data.ai_tools.length === 0) resumeStep = 7;
            else resumeStep = 8;
          } else if (data.data.first_name) {
            resumeStep = 4;
          }
        }

        localStorage.setItem('tv_subscribe_progress', JSON.stringify({
          formData,
          step: resumeStep,
          subscriberId,
        }));

        window.location.href = `/subscribe?step=${resumeStep}`;
      }
    } catch {
      console.error('Subscribe error');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-3 pt-8 pb-20">
          <div className="border-t border-[#1b1b1b]/25 mb-8" />
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-full bg-[#5170ff]/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-[#5170ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-times font-bold text-2xl text-[#1b1b1b] mb-2">You&apos;re in.</h3>
            <p className="text-[#1b1b1b]/50 text-sm font-inter">Check your inbox to confirm your email.</p>
          </div>
        </div>
      </section>
    );
  }

  const tvNewsletter = NEWSLETTERS[0];
  const childNewsletters = NEWSLETTERS.slice(1);

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-3 pt-4 pb-8">
        <div className="border-t border-[#1b1b1b]/25 mb-16" />

        <div className="rounded-2xl border border-black/10 bg-black p-6 lg:p-10 max-w-5xl mx-auto">

        <h2
          className="font-times mb-4 uppercase text-center"
          style={{
            letterSpacing: '-0.07em',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: 'clamp(42px, 5vw, 55px)',
          }}
        >
          Newsletters
        </h2>

        {/* Subscribe form */}
        <div className="max-w-lg mx-auto mb-10">
          <style dangerouslySetInnerHTML={{ __html: '@media(max-width:767px){.nl-subtext-home{font-size:20px!important;font-weight:400!important;}}' }} />
          <p className="nl-subtext-home text-center font-inter leading-snug mb-5" style={{ fontSize: 'clamp(20px, 1.8vw, 24px)', fontWeight: 500, color: 'rgba(255,255,255,0.75)' }}>
            Subscribe to our newsletters to cover every base of AI.
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Work email"
              required
              className="flex-1 px-4 py-3 rounded-lg border border-white/20 text-sm font-inter text-white placeholder:text-white/40 focus:outline-none focus:border-[#5170ff] transition-colors bg-white/10"
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-lg bg-[#5170ff] text-white text-sm font-inter font-semibold hover:bg-[#3d5ce0] active:scale-[0.97] transition-all disabled:opacity-50"
            >
              {submitting ? '...' : 'Subscribe'}
            </button>
          </form>
        </div>

        {/* DESKTOP: 3 cards – TV center, depth on sides */}
        <div className="hidden md:flex flex-nowrap gap-4 items-stretch justify-center">
          {[
            { ...NEWSLETTERS[1], order: 'order-1', depth: true, logoH: 'h-20' },
            { ...NEWSLETTERS[0], order: 'order-2', depth: false, logoH: 'h-12' },
            { ...NEWSLETTERS[2], order: 'order-3', depth: true, logoH: 'h-20' },
          ].map((nl) => {
            const isSelected = selected.includes(nl.id);
            return (
              <button
                key={nl.id}
                type="button"
                onClick={() => toggleNewsletter(nl.id)}
                className={`flex-1 text-left border rounded-xl p-5 flex flex-col transition-all duration-200 ${nl.order} ${
                  isSelected
                    ? 'border-[#5170ff] shadow-md shadow-[#5170ff]/10'
                    : 'border-[#1b1b1b]/15'
                } ${nl.depth ? 'scale-[0.88]' : 'z-10'}`}
                style={{ background: '#ffffff', color: '#1b1b1b' }}
              >
                <div className="flex items-start justify-between mb-0">
                  {nl.flagship ? (
                    <img src={nl.logo} alt={nl.name} className={`${nl.logoH} mb-4 w-auto object-contain`} />
                  ) : (
                    <div className={`${nl.logoH} w-auto flex items-center`}>
                      <img src={nl.logo} alt={nl.name} className={`${nl.logoH} w-auto object-contain`} />
                    </div>
                  )}
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-inter font-medium uppercase tracking-wider flex-shrink-0 ${
                      isSelected
                        ? 'bg-[#5170ff]/15 text-[#5170ff]'
                        : 'bg-[#1b1b1b]/8 text-[#1b1b1b]/50'
                    }`}
                  >
                    {nl.frequency}
                  </span>
                </div>

                <p className="text-xs font-inter leading-relaxed flex-1 mb-3" style={{ color: '#1b1b1b' }}>
                  {nl.description}
                </p>

                <div className="flex items-center gap-1.5 mt-auto">
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-[#5170ff]' : 'border border-[#1b1b1b]/25'
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-xs font-inter font-medium ${
                      isSelected ? 'text-[#5170ff]' : 'text-[#1b1b1b]/40'
                    }`}
                  >
                    Selected
                  </span>
                </div>
              </button>
            );
          })}
        </div>


        <div className="hidden md:block border-t border-[#1b1b1b]/25 mt-12 mb-6"></div>

        <div className="hidden md:block text-center mb-6">
          <a
            href="/subscribe"
            className="inline-flex items-center gap-2 transition-colors font-semibold font-inter uppercase"
            style={{ color: '#1b1b1b' }}
          >
            View all newsletters
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>


        {/* MOBILE: horizontal scroll – matching /newsletter */}
        <div className="md:hidden flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          {[NEWSLETTERS[0], NEWSLETTERS[1], NEWSLETTERS[2]].map((nl) => {
            const isSelected = selected.includes(nl.id);
            return (
              <button
                key={nl.id}
                type="button"
                onClick={() => toggleNewsletter(nl.id)}
                className={`flex-shrink-0 w-[55%] text-left rounded-xl p-4 flex flex-col transition-all duration-200 border ${
                  isSelected
                    ? 'border-[#5170ff] shadow-md shadow-[#5170ff]/10'
                    : 'border-[#1b1b1b]/15'
                }`}
                style={{ background: '#ffffff', color: '#1b1b1b' }}
              >
                <div className={`flex items-center justify-between ${nl.flagship ? 'mb-2' : 'mb-0'}`}>
                  <img src={nl.logo} alt={nl.name} className={`${nl.flagship ? 'h-8' : 'h-12'} w-auto object-contain`} />
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-inter font-medium uppercase tracking-wider flex-shrink-0 ${
                    isSelected ? 'bg-[#5170ff]/15 text-[#5170ff]' : 'bg-[#1b1b1b]/8 text-[#1b1b1b]/50'
                  }`}>
                    {nl.frequency}
                  </span>
                </div>
                <p className="text-xs font-inter leading-snug flex-1 mb-2" style={{ color: '#1b1b1b' }}>
                  {nl.description}
                </p>
                <div className="flex items-center gap-1 mt-auto">
                  <div className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-colors ${isSelected ? 'bg-[#5170ff]' : 'border border-[#1b1b1b]/25'}`}>
                    {isSelected && <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className={`text-[10px] font-inter font-medium ${isSelected ? 'text-[#5170ff]' : 'text-[#1b1b1b]/40'}`}>Selected</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* MOBILE: divider + View All after cards */}
        <div className="md:hidden">
          <div className="border-t border-[#1b1b1b]/25 mt-8 mb-6"></div>
          <div className="text-center mb-6">
            <a
              href="/subscribe"
              className="inline-flex items-center gap-2 transition-colors font-semibold font-inter uppercase"
              style={{ color: '#1b1b1b' }}
            >
              View all newsletters
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
        </div>{/* end glass panel */}
      </div>
    </section>
  );
}

