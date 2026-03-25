'use client';

import Link from 'next/link';
import { FadeIn } from '@/components/FadeIn';
import { Navigation } from '@/components/navigation';
import { FooterNew } from '@/components/footer-new';
import { SubscribeForm } from '@/components/subscribe-form';
import { AsciiHero } from '@/components/AsciiHero';

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1b1b1b' }}>
      <Navigation heroTheme="light" heroBorder scrolledTheme="blue" scrollThreshold={150} />

      {/* ─── MAP HERO (same as article thumbnail) ─── */}
      <AsciiHero />

      {/* ─── TITLE (below image, same as article header) ─── */}
      <section className="pt-8 pb-4">
        <div className="max-w-[780px] mx-auto px-6">
          <FadeIn>
            <span className="text-xs font-inter font-semibold uppercase tracking-widest text-[#5170ff] mb-3 block">
              About
            </span>
          </FadeIn>
          <FadeIn delay={100}>
            <h1
              className="font-times font-bold text-2xl lg:text-6xl mb-6"
              style={{ letterSpacing: '-0.05em', lineHeight: 1.08, color: '#ffffff' }}
            >
              AI is eating the world: Who cares?
            </h1>
          </FadeIn>
          <FadeIn delay={200}>
            <p className="text-sm font-inter font-medium block mt-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Written by Jason Chen
            </p>

            {/* Share buttons */}
            <div className="flex items-center gap-3 mt-4">
              <span className="text-xs font-inter font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Share</span>
              <a
                href="https://twitter.com/intent/tweet?text=AI%20is%20eating%20the%20world&url=https://thoriumvalley.com/about"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}
                aria-label="Share on X"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a
                href="https://www.linkedin.com/sharing/share-offsite/?url=https://thoriumvalley.com/about"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}
                aria-label="Share on LinkedIn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
              <a
                href="mailto:?subject=AI%20is%20eating%20the%20world&body=https://thoriumvalley.com/about"
                className="transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}
                aria-label="Share via Email"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
              </a>
              <button
                onClick={() => { navigator.clipboard.writeText('https://thoriumvalley.com/about'); }}
                className="transition-colors cursor-pointer" style={{ color: 'rgba(255,255,255,0.3)' }}
                aria-label="Copy link"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
              </button>
            </div>
          </FadeIn>
          <FadeIn delay={250}>
            <div className="border-b border-white/10 mt-8" />
          </FadeIn>
        </div>
      </section>

      {/* ─── BODY TEXT ─── */}
      <section className="py-10">
        <div className="max-w-[780px] mx-auto px-6">

          <FadeIn delay={100}>
            <style dangerouslySetInnerHTML={{
              __html: `
                .about-body > p:first-of-type::first-letter {
                  font-family: var(--font-times), 'Times New Roman MT', 'Times New Roman', serif;
                  font-size: 3.5em;
                  float: left;
                  line-height: 0.8;
                  padding-right: 8px;
                  padding-top: 4px;
                  color: #5170ff;
                  font-weight: bold;
                }
                .about-body p {
                  font-size: 20px !important;
                  font-weight: 500 !important;
                  line-height: 2.0 !important;
                  margin-bottom: 1.8em !important;
                  color: rgba(255,255,255,0.85) !important;
                }
              `
            }} />
            <div className="about-body">
              <p>
                Thorium Valley is a daily newsletter covering Artificial Intelligence.
              </p>
              <p>
                We provide news about the industry — its technology, business, policies and people; and, more importantly, we try to figure out how all of these relate to each other.
              </p>
              <p>
                There aren&apos;t many publications that simply report a &quot;model was released&quot; or &quot;a company received funding.&quot; However, there seems to be a lack of people who attempt to explain why that is important to you, or if that contradicts what they said last week with equal certainty.
              </p>
              <p>
                Artificial Intelligence moves quickly. In fact, it moves at an unreasonable speed. What happened two weeks ago may render obsolete what happened today; and, most publications treat each article independently.
              </p>
              <p>
                Instead, we would prefer to write three articles that give you insight into the landscape, than to write twelve articles that simply report on the current state.
              </p>
              <p>
                Each edition includes a quick summary of what has happened and why that is important, along with more detailed reporting for when you wish to delve deeper into the topic. We are equally interested in how Artificial Intelligence is changing the way people do things (i.e., work, hire, build and make decisions) as much as we are interested in the technology.
              </p>
              <p>
                Our audience spans a wide range. A portion of our readers are executives who are responsible for rolling out AI within their organization(s). Others are readers who are merely trying to keep up with an industry that seems to change faster than most people can follow. While we write for both groups, we believe that they are not as different as they may appear.
              </p>
              <p>
                Below are a few of our editorial viewpoints that we hold relatively firm:
              </p>
              <div className="space-y-4 mb-8">
                <p>
                  <span className="text-[#5170ff] font-medium">+</span>{' '}We report on the &quot;big-ticket items&quot; such as model releases, acquisitions and headlines. We also continue to monitor the developments that do not initially receive a lot of publicity. It is often the latter types of developments that tend to have the greatest impact. We have noticed that the articles which did not generate a great deal of interest at first, tend to remain relevant longer.
                </p>
                <p>
                  <span className="text-[#5170ff] font-medium">+</span>{' '}We have opinions and we express them in virtually everything we write. Our opinions are well-researched and carefully considered.
                </p>
                <p>
                  <span className="text-[#5170ff] font-medium">+</span>{' '}Most AI-related predictions are disguised sales pitches. The individuals who are making the most noise regarding their predictions are generally attempting to sell you something. The people working on the most impactful projects are usually too busy to create awareness about what they are working on.
                </p>
                <p>
                  <span className="text-[#5170ff] font-medium">+</span>{' '}We publish daily.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>





      <FooterNew />
    </div>
  );
}
