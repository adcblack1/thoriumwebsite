'use client';

import { useState } from 'react';
import WireframeGlobe from '@/components/WireframeGlobe';

// ─── A/B/C VARIATIONS ──────────────────────────────────────
const LB = <span className="underline decoration-[#5170ff] decoration-2 underline-offset-4">Littlebird</span>;

const VARIATIONS = {
  A: {
    label: 'A — Meeting Recall',
    mediaType: 'image' as const,
    mediaSrc: '/thumbnails/littlebird-meeting.png',
    headline: <>If you&rsquo;ve ever forgotten what someone said in a meeting, use {LB}.</>,
    subtext: "Littlebird is your AI memory for every meeting, tab, and thing you worked on. It watches your screen, takes notes in real time, and remembers everything \u2014 so when you forget where you saw something, you just ask.",
    subtext2: "No more retracing your steps through old emails, notes, and browser tabs. Littlebird gives you instant recall across your entire workday.",
  },
  B: {
    label: 'B — Productivity',
    mediaType: 'image' as const,
    mediaSrc: '/thumbnails/littlebird-productive.avif',
    headline: <>The AI tool that makes you more productive.</>,
    subtext: "Littlebird runs quietly in the background and remembers everything you see, read, and work on. When you need to pick up where you left off, pull up a detail from last week, or find that one thing you saw somewhere \u2014 just ask.",
    subtext2: "It\u2019s like having a second brain that never forgets. Less time searching, more time doing the work that actually matters.",
  },
  C: {
    label: 'C — Video Demo',
    mediaType: 'video' as const,
    mediaSrc: '/thumbnails/littlebird-demo.mp4',
    headline: <>The AI assistant that already knows what you&rsquo;re working on.</>,
    subtext: "Littlebird watches your screen in real time and builds a searchable memory of your entire workday \u2014 every meeting, every tab, every document. When you need context, you don\u2019t dig. You ask.",
    subtext2: "The more you work, the more it remembers. Less time searching, more time on the work that actually matters.",
  },
};

type VariationKey = keyof typeof VARIATIONS;

export default function LittlebirdDemoPage() {
  const [active, setActive] = useState<VariationKey>('A');
  const v = VARIATIONS[active];

  return (
    <main className="relative min-h-screen bg-black overflow-x-hidden">
      {/* Globe background */}
      <div className="fixed inset-0 flex items-center justify-center opacity-50">
        <WireframeGlobe desktopYOffset={-40} mobileYOffset={-65} mobileScale={1.65} />
      </div>

      {/* Progress bar */}
      <div className="relative z-20 w-full h-1 bg-white/10">
        <div className="h-full bg-[#5170ff]" style={{ width: '78%' }} />
      </div>

      {/* A/B/C Switcher */}
      <div className="relative z-50 w-full bg-[#5170ff]/90 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60 mr-2">Variation:</span>
          {(Object.keys(VARIATIONS) as VariationKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                active === key
                  ? 'bg-white text-[#5170ff]'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {VARIATIONS[key].label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="relative z-10 flex flex-col items-center px-3 lg:px-5 py-12 lg:py-16">
        <div className="w-full max-w-3xl">
          <div className="flex flex-col items-center gap-6">

            {/* White card */}
            <a
              href="https://try.littlebird.ai/thorium-valley"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-2xl overflow-hidden transition-all group hover:shadow-2xl hover:shadow-white/10"
              style={{ background: '#ffffff' }}
            >
              {/* Blue section — logos + media */}
              <div style={{ backgroundColor: '#5170ff' }} className="px-6 pt-8 lg:pt-10 pb-6 lg:pb-8">
                {/* Co-branding: TV logo × Littlebird logo */}
                <div className="flex items-center justify-center gap-4 lg:gap-5 mb-3">
                  <img
                    src="/Transparent White Logo.png"
                    alt="Thorium Valley"
                    className="h-12 lg:h-16"
                    style={{ objectFit: 'contain' }}
                  />
                  <span className="text-white/50 font-inter text-lg lg:text-xl font-light">×</span>
                  <img
                    src="/images/littlebird-logo-white.svg"
                    alt="Littlebird"
                    className="h-12 lg:h-20"
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                {/* Partner text */}
                <p
                  className="font-inter text-[10px] lg:text-[11px] font-semibold uppercase tracking-[0.15em] text-center mb-6 lg:mb-8"
                  style={{ color: '#ffffff' }}
                >
                  Official AI Assistant Partner
                </p>

                {/* Media — image or looping video */}
                {v.mediaType === 'video' ? (
                  <video
                    key={v.mediaSrc}
                    src={v.mediaSrc}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full lg:w-[90%] mx-auto rounded-xl shadow-2xl"
                  />
                ) : (
                  <img
                    key={v.mediaSrc}
                    src={v.mediaSrc}
                    alt="Littlebird AI"
                    className="w-full lg:w-[90%] mx-auto rounded-xl shadow-2xl"
                    style={{ objectFit: 'contain' }}
                  />
                )}
              </div>

              {/* White section — copy */}
              <div className="px-6 py-6 lg:px-10 lg:py-8">
                {/* Eyebrow */}
                <span
                  className="font-inter text-[11px] font-semibold uppercase tracking-widest mb-3 block"
                  style={{ color: '#5170ff' }}
                >
                  Our Team&apos;s Favorite AI Tool
                </span>

                {/* Headline */}
                <h3
                  className="font-times text-[#1b1b1b] leading-tight mb-3"
                  style={{ fontWeight: 500, letterSpacing: '-0.04em', fontSize: '26px' }}
                >
                  {v.headline}
                </h3>

                {/* Body copy */}
                <p className="font-inter text-[#1b1b1b]/55 text-sm leading-relaxed mb-2">
                  {v.subtext}
                </p>
                <p className="font-inter text-[#1b1b1b]/55 text-sm leading-relaxed mb-6">
                  {v.subtext2}
                </p>

                {/* CTA Button */}
                <span
                  className="flex items-center justify-center gap-2 w-full px-8 py-3.5 rounded-full font-inter font-semibold text-sm text-white transition-all group-hover:brightness-110"
                  style={{ backgroundColor: '#5170ff' }}
                >
                  Get your all-in-one AI assistant
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                </span>

                {/* Trust line */}
                <p className="font-inter text-[11px] text-[#1b1b1b]/30 mt-3 text-center">
                  Free to try
                </p>
              </div>
            </a>

            {/* Lead magnet CTA */}
            <button
              className="w-full max-w-md py-4 rounded-full font-inter font-semibold text-base transition-all hover:-translate-y-[2px] hover:brightness-110"
              style={{ backgroundColor: '#5170ff', color: '#ffffff' }}
            >
              Start reading →
            </button>

            {/* Legal links */}
            <div className="flex justify-center gap-8 mt-4 mb-8">
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-xs transition-colors whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Privacy Policy
              </a>
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-xs transition-colors whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Terms of Service
              </a>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
