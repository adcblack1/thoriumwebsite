'use client';

import { Navigation } from '@/components/navigation';
import { FooterNew } from '@/components/footer-new';

export default function LittlebirdDemoPage() {
  return (
    <>
      <Navigation variant="hero" heroTheme="dark" scrolledTheme="white" heroBorder={true} />
      <main className="min-h-screen bg-white flex flex-col items-center px-5 pt-48 pb-24">
        <div className="w-full max-w-4xl">

          {/* Section header — matches the signup flow style */}
          <div className="text-center mb-8">
            <p
              className="text-xs font-inter font-semibold uppercase tracking-widest mb-2"
              style={{ color: '#5170ff' }}
            >
              AI TOOLS{' '}
              <span className="text-[#1b1b1b]/40 normal-case font-normal">(Sponsored)</span>
            </p>
            <h2
              className="font-times text-2xl lg:text-3xl"
              style={{ fontWeight: 500, letterSpacing: '-0.05em', color: '#1b1b1b' }}
            >
              We picked these tools for <em>you</em>
            </h2>
          </div>

          {/* Littlebird card — single horizontal layout */}
          <a
            href="https://try.littlebird.ai/thorium-valley"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-2xl overflow-hidden border border-[#1b1b1b]/10 transition-all group hover:shadow-xl hover:border-[#1b1b1b]/20"
            style={{ background: '#ffffff' }}
          >
            <div className="flex flex-col lg:flex-row">
              {/* Left — Thumbnail */}
              <div className="lg:w-[45%] flex-shrink-0 bg-gradient-to-br from-[#e8f4f1] to-[#d4ebe5] p-5 lg:p-6 flex items-center justify-center">
                <img
                  src="/thumbnails/littlebird.webp"
                  alt="Littlebird AI — Time Allocation Reflection"
                  className="w-full rounded-xl shadow-lg"
                  style={{ objectFit: 'contain' }}
                />
              </div>

              {/* Right — Copy */}
              <div className="flex-1 flex flex-col justify-center px-6 py-6 lg:px-10 lg:py-8">
                {/* Eyebrow */}
                <div className="flex items-center gap-2.5 mb-4">
                  <span
                    className="font-inter text-[11px] font-semibold uppercase tracking-widest"
                    style={{ color: '#4A9B8E' }}
                  >
                    Featured Tool
                  </span>
                </div>

                {/* Headline */}
                <h3
                  className="font-times text-[#1b1b1b] leading-tight mb-3"
                  style={{ fontWeight: 500, letterSpacing: '-0.04em', fontSize: '26px' }}
                >
                  If you&apos;ve ever forgotten what someone said in a meeting, use Littlebird.
                </h3>

                {/* Body copy */}
                <p className="font-inter text-[#1b1b1b]/55 text-sm leading-relaxed mb-2">
                  Littlebird is your AI memory for every meeting, tab, and thing you worked on. It watches your screen, takes notes in real time, and remembers everything — so when you forget where you saw something, you just ask.
                </p>
                <p className="font-inter text-[#1b1b1b]/55 text-sm leading-relaxed mb-6">
                  No more digging through Slack threads, Notion pages, or old emails. Littlebird gives you instant recall across your entire workday.
                </p>

                {/* CTA Button */}
                <button
                  className="w-full lg:w-auto px-8 py-3.5 rounded-full font-inter font-semibold text-sm text-white transition-all hover:brightness-110 active:scale-[0.98]"
                  style={{ backgroundColor: '#2563EB' }}
                >
                  Get your all-in-one AI assistant
                </button>

                {/* Trust line */}
                <p className="font-inter text-[11px] text-[#1b1b1b]/30 mt-3">
                  Free to try · Works on Mac and Windows
                </p>
              </div>
            </div>
          </a>

        </div>
      </main>
      <FooterNew />
    </>
  );
}
