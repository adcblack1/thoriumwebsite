'use client';

import { useState } from 'react';
import WireframeGlobe from '@/components/WireframeGlobe';
import { Navigation } from '@/components/navigation';

// ─── VARIATION DATA ────────────────────────────────────────
// A/B/C/D copy variations for the Littlebird partnership.
// Same card layout as the subscribe flow tools step.

const VARIATIONS = {
  A: {
    label: 'A — Original (Current)',
    headline: "AI TOOLS",
    subheadline: <>We picked these tools for <em>you</em></>,
    tools: [
      {
        name: 'Littlebird',
        primary: "If you've ever forgotten what someone said in a meeting, use Littlebird.",
        subtext: 'Littlebird is your AI memory for every meeting, tab, and thing you worked on. It watches your screen, takes notes in real time, and remembers everything — so when you forget where you saw something, you just ask.',
        secondarySubtext: 'No more digging through Slack threads, Notion pages, or old emails. Littlebird gives you instant recall across your entire workday.',
        url: 'https://try.littlebird.ai/thorium-valley',
        image: '/thumbnails/littlebird.webp',
        cta: 'Get your all-in-one AI assistant',
        ctaSub: 'Free to try · Works on Mac and Windows',
        featured: true,
      },
      {
        name: 'Gamma',
        primary: 'Professional presentations with a prompt.',
        subtext: 'Gamma is Loveable for slide decks. Turn your ideas into polished presentations in seconds.',
        url: 'https://try.gamma.app/f37ycs1r79mx',
        image: '/images/gamma.png',
      },
      {
        name: 'Clico',
        primary: 'Stop tab-switching to ChatGPT.',
        subtext: 'Clico is a free add-on that puts a writing helper directly inside Gmail, Google Docs, LinkedIn, and wherever else you type.',
        url: 'https://tryclico.link/thorium-valley',
        image: '/images/clico-thumbnail.png',
      },
    ],
  },
  B: {
    label: 'B — Littlebird Hero (Solo Feature)',
    headline: "FEATURED TOOL",
    subheadline: <>Our editors' pick this week</>,
    tools: [
      {
        name: 'Littlebird',
        primary: "Your meetings are full of decisions. Littlebird remembers all of them.",
        subtext: 'Littlebird watches your screen, takes notes in real time, and gives you instant recall across every meeting, tab, and document you touched.',
        secondarySubtext: 'Stop asking "wait, what did we decide?" — Littlebird already knows.',
        url: 'https://try.littlebird.ai/thorium-valley',
        image: '/thumbnails/littlebird.webp',
        cta: 'Try Littlebird free',
        ctaSub: 'Works on Mac and Windows · No credit card required',
        featured: true,
      },
    ],
  },
  C: {
    label: 'C — Problem/Solution Framing',
    headline: "AI TOOLS",
    subheadline: <>Stop losing context. Start remembering everything.</>,
    tools: [
      {
        name: 'Littlebird',
        primary: "The average knowledge worker spends 2 hours a day searching for information they've already seen.",
        subtext: 'Littlebird eliminates that. It watches your screen passively, indexes everything — meetings, tabs, documents — and gives you instant search across your entire workday.',
        secondarySubtext: 'Think of it as a photographic memory for your computer.',
        url: 'https://try.littlebird.ai/thorium-valley',
        image: '/thumbnails/littlebird.webp',
        cta: 'Get your AI memory',
        ctaSub: 'Free to try · Works on Mac and Windows',
        featured: true,
      },
      {
        name: 'Gamma',
        primary: 'Professional presentations with a prompt.',
        subtext: 'Gamma is Loveable for slide decks. Turn your ideas into polished presentations in seconds.',
        url: 'https://try.gamma.app/f37ycs1r79mx',
        image: '/images/gamma.png',
      },
      {
        name: 'Clico',
        primary: 'Stop tab-switching to ChatGPT.',
        subtext: 'Clico is a free add-on that puts a writing helper directly inside Gmail, Google Docs, LinkedIn, and wherever else you type.',
        url: 'https://tryclico.link/thorium-valley',
        image: '/images/clico-thumbnail.png',
      },
    ],
  },
  D: {
    label: 'D — Social Proof + Urgency',
    headline: "RECOMMENDED BY THORIUM VALLEY",
    subheadline: <>The tool 12,000+ of our readers already use</>,
    tools: [
      {
        name: 'Littlebird',
        primary: "We've tested 200+ AI tools. Littlebird is the one we actually kept using.",
        subtext: "It runs quietly in the background, remembering every meeting, every tab, every doc. When you need to find something you saw three days ago, you just ask. That's it.",
        secondarySubtext: "It's the closest thing to a second brain that actually works.",
        url: 'https://try.littlebird.ai/thorium-valley',
        image: '/thumbnails/littlebird.webp',
        cta: 'See why we recommend it',
        ctaSub: 'Free to try · Used by teams at Google, Stripe, and Notion',
        featured: true,
      },
      {
        name: 'Gamma',
        primary: 'Professional presentations with a prompt.',
        subtext: 'Gamma is Loveable for slide decks. Turn your ideas into polished presentations in seconds.',
        url: 'https://try.gamma.app/f37ycs1r79mx',
        image: '/images/gamma.png',
      },
      {
        name: 'Clico',
        primary: 'Stop tab-switching to ChatGPT.',
        subtext: 'Clico is a free add-on that puts a writing helper directly inside Gmail, Google Docs, LinkedIn, and wherever else you type.',
        url: 'https://tryclico.link/thorium-valley',
        image: '/images/clico-thumbnail.png',
      },
    ],
  },
};

type VariationKey = keyof typeof VARIATIONS;

export default function ToolsPreviewPage() {
  const [activeVariation, setActiveVariation] = useState<VariationKey>('A');
  const variation = VARIATIONS[activeVariation];

  return (
    <main className="relative min-h-screen flex flex-col bg-black overflow-x-hidden">
      {/* Globe background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-50">
        <WireframeGlobe desktopYOffset={-40} mobileYOffset={-65} mobileScale={1.65} />
      </div>

      {/* Variation switcher — fixed top bar */}
      <div className="relative z-50 w-full bg-[#5170ff] text-white">
        <div className="max-w-4xl mx-auto px-4 py-3 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider mr-3 opacity-80">Variation:</span>
          {(Object.keys(VARIATIONS) as VariationKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setActiveVariation(key)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeVariation === key
                  ? 'bg-white text-[#5170ff]'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {VARIATIONS[key].label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar mock */}
      <div className="relative z-20 w-full h-1 bg-white/10">
        <div className="h-full bg-[#5170ff]" style={{ width: '78%' }} />
      </div>

      {/* Main content — exact same layout as subscribe step 9 */}
      <div className="flex-1 flex items-center justify-center px-3 lg:px-5 relative z-10 lg:-mt-4">
        <div className="w-full max-w-4xl">
          <div className="flex flex-col items-center gap-6">
            {/* Header */}
            <div className="text-center mb-2">
              <p className="text-xs font-inter font-semibold uppercase tracking-widest mb-2" style={{ color: '#5170ff' }}>
                {variation.headline} <span className="text-white/40 normal-case font-normal">(Sponsored)</span>
              </p>
              <h2 className="font-times text-2xl lg:text-3xl" style={{ fontWeight: 500, letterSpacing: '-0.05em', color: '#ffffff' }}>
                {variation.subheadline}
              </h2>
            </div>

            {/* Cards */}
            <div className="w-full flex flex-col lg:flex-row items-stretch justify-center gap-5">
              {variation.tools.map((tool, i) => {
                const isFeatured = tool.featured;
                const toolCount = variation.tools.length;

                // If only 1 tool (Variation B), make it full width featured
                if (toolCount === 1 && isFeatured) {
                  return (
                    <a
                      key={tool.name}
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl overflow-hidden transition-all group hover:shadow-lg hover:shadow-white/10 w-full"
                      style={{ background: '#ffffff' }}
                    >
                      <div className="flex flex-col lg:flex-row">
                        {/* Left side — image */}
                        <div className="lg:w-1/2 p-5">
                          <img
                            src={tool.image}
                            alt={tool.name}
                            className="w-full rounded-lg"
                            style={{ objectFit: 'contain' }}
                          />
                        </div>
                        {/* Right side — copy */}
                        <div className="lg:w-1/2 p-6 flex flex-col justify-center">
                          <p className="text-xs font-inter font-semibold uppercase tracking-widest mb-3" style={{ color: '#5170ff' }}>
                            FEATURED TOOL
                          </p>
                          <h3 className="font-times text-[#1b1b1b] leading-tight mb-4" style={{ fontWeight: 500, letterSpacing: '-0.05em', fontSize: '24px' }}>
                            {tool.primary}
                          </h3>
                          <p className="font-inter text-[#1b1b1b]/60 text-sm leading-relaxed mb-3">
                            {tool.subtext}
                          </p>
                          {tool.secondarySubtext && (
                            <p className="font-inter text-[#1b1b1b]/60 text-sm leading-relaxed mb-5">
                              {tool.secondarySubtext}
                            </p>
                          )}
                          {tool.cta && (
                            <>
                              <span
                                className="inline-block w-full text-center py-3.5 rounded-full text-white font-inter font-semibold text-sm transition-all group-hover:opacity-90"
                                style={{ backgroundColor: '#5170ff' }}
                              >
                                {tool.cta}
                              </span>
                              {tool.ctaSub && (
                                <p className="text-center text-[#1b1b1b]/40 text-xs mt-2 font-inter">{tool.ctaSub}</p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </a>
                  );
                }

                // Multi-tool layout — Littlebird centered & featured
                if (isFeatured) {
                  return (
                    <a
                      key={tool.name}
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl overflow-hidden transition-all group hover:shadow-lg hover:shadow-white/10 lg:order-2 w-full lg:flex-1 lg:z-10"
                      style={{ background: '#ffffff' }}
                    >
                      <div className="px-5 pt-5 pb-1">
                        <p className="text-[10px] font-inter font-semibold uppercase tracking-widest mb-2" style={{ color: '#5170ff' }}>
                          FEATURED TOOL
                        </p>
                        <h3 className="font-times text-[#1b1b1b] leading-tight" style={{ fontWeight: 500, letterSpacing: '-0.05em', fontSize: '22px' }}>
                          {tool.primary}
                        </h3>
                      </div>
                      <div className="px-4 py-2">
                        <img src={tool.image} alt={tool.name} className="w-full rounded-lg" style={{ objectFit: 'contain' }} />
                      </div>
                      <div className="px-5 pt-2 pb-2">
                        <p className="font-inter text-[#1b1b1b]/50 text-xs leading-relaxed">{tool.subtext}</p>
                        {tool.secondarySubtext && (
                          <p className="font-inter text-[#1b1b1b]/50 text-xs leading-relaxed mt-2">{tool.secondarySubtext}</p>
                        )}
                      </div>
                      {tool.cta && (
                        <div className="px-5 pb-5 pt-1">
                          <span
                            className="block w-full text-center py-3 rounded-full text-white font-inter font-semibold text-sm transition-all group-hover:opacity-90"
                            style={{ backgroundColor: '#5170ff' }}
                          >
                            {tool.cta}
                          </span>
                          {tool.ctaSub && (
                            <p className="text-center text-[#1b1b1b]/40 text-xs mt-2 font-inter">{tool.ctaSub}</p>
                          )}
                        </div>
                      )}
                    </a>
                  );
                }

                // Non-featured side cards
                const sideOrder = i === 0 ? 'lg:order-1' : 'lg:order-3';
                return (
                  <a
                    key={tool.name}
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block rounded-xl overflow-hidden transition-all group hover:shadow-lg hover:shadow-white/10 ${sideOrder} w-full lg:flex-1 lg:scale-[0.92]`}
                    style={{ background: '#ffffff' }}
                  >
                    <div className="px-5 pt-5 pb-3">
                      <h3 className="font-times text-[#1b1b1b] leading-tight" style={{ fontWeight: 500, letterSpacing: '-0.05em', fontSize: '22px' }}>
                        {tool.primary}
                      </h3>
                    </div>
                    <div className="px-4">
                      <img src={tool.image} alt={tool.name} className="w-full rounded-lg" style={{ objectFit: 'contain' }} />
                    </div>
                    <div className="px-5 pt-3 pb-5">
                      <p className="font-inter text-[#1b1b1b]/50 text-xs leading-relaxed">{tool.subtext}</p>
                      <span className="inline-block mt-2 text-[#5170ff] text-xs font-inter font-semibold group-hover:underline">
                        Try {tool.name} →
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Continue button */}
            <button
              className="w-full max-w-md py-4 rounded-full font-inter font-semibold text-base transition-all hover:-translate-y-[2px]"
              style={{ backgroundColor: '#5170ff', color: '#ffffff' }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>

      {/* Legal links */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex justify-center gap-8 px-5 py-2 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-xs transition-colors whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Privacy Policy
        </a>
        <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-xs transition-colors whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Terms of Service
        </a>
      </div>
    </main>
  );
}
