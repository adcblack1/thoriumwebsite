'use client';

import { useState } from 'react';
import { GradientBackground } from '@/components/gradient-background';
import { Navigation } from '@/components/navigation';
import { SubscribeCTA } from '@/components/SubscribeCTA';
import { FooterNew } from '@/components/footer-new';
import { FadeIn } from '@/components/FadeIn';
import { SubscribeForm } from '@/components/subscribe-form';

// Animated counter hook
function AnimatedMetric({ value, suffix = '', label, accent = false }: { value: number; suffix?: string; label: string; accent?: boolean }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  return (
    <FadeIn>
      <div
        className="text-center"
        ref={(el) => {
          if (el && !hasAnimated) {
            const observer = new IntersectionObserver(([entry]) => {
              if (entry.isIntersecting) {
                setHasAnimated(true);
                let start = 0;
                const end = value;
                const duration = 1500;
                const stepTime = Math.abs(Math.floor(duration / end));
                const timer = setInterval(() => {
                  start += 1;
                  setCount(start);
                  if (start >= end) clearInterval(timer);
                }, stepTime);
                observer.disconnect();
              }
            }, { threshold: 0.3 });
            observer.observe(el);
          }
        }}
      >
        <span className={`text-5xl lg:text-7xl font-bold tracking-tight ${accent ? 'text-[#5170ff]' : 'text-white'}`}>
          {count}{suffix}
        </span>
        <span className="block text-white/60 text-base mt-3 font-medium">{label}</span>
      </div>
    </FadeIn>
  );
}

// Sponsorship tier card
function TierCard({ title, price, description, features, popular = false, cta = 'Get Started' }: {
  title: string; price: string; description: string; features: string[]; popular?: boolean; cta?: string;
}) {
  return (
    <div className={`relative border-2 p-8 lg:p-10 transition-all duration-300 hover:-translate-y-1 ${popular ? 'border-[#5170ff] bg-[#5170ff]/5' : 'border-[#1b1b1b]/20 hover:border-[#5170ff]/50'}`}>
      {popular && (
        <span className="absolute -top-3 left-8 bg-[#5170ff] text-white text-xs font-bold px-4 py-1 tracking-wider uppercase">
          Most Popular
        </span>
      )}
      <h3 className="text-2xl font-bold text-[#1b1b1b] mb-2">{title}</h3>
      <p className="text-3xl font-bold text-[#5170ff] mb-4">{price}</p>
      <p className="text-[#1b1b1b]/60 mb-8 text-base leading-relaxed">{description}</p>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3 text-[#1b1b1b]/80 text-base">
            <svg className="w-5 h-5 text-[#5170ff] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <a
        href="mailto:ads@thoriumvalley.com"
        className={`block text-center px-6 py-4 font-semibold text-base transition-all duration-300 no-underline ${popular
          ? 'bg-[#5170ff] text-white hover:bg-[#5170ff]/90 hover:-translate-y-[2px]'
          : 'bg-[#1b1b1b] text-white hover:bg-[#1b1b1b]/90 hover:-translate-y-[2px]'
          }`}
      >
        {cta}
      </a>
    </div>
  );
}

// Process step
function ProcessStep({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="relative flex gap-6 items-start">
      <div className="w-12 h-12 shrink-0 bg-[#5170ff] text-white flex items-center justify-center font-bold text-lg">
        {number}
      </div>
      <div>
        <h4 className="text-lg font-bold text-[#1b1b1b] mb-1">{title}</h4>
        <p className="text-[#1b1b1b]/60 text-base leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// FAQ Accordion item
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#1b1b1b]/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="text-lg font-semibold text-[#1b1b1b]">{question}</span>
        <svg
          className={`w-5 h-5 text-[#5170ff] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-40 pb-5' : 'max-h-0'}`}>
        <p className="text-[#1b1b1b]/60 text-base leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export default function PartnershipsPage() {
  return (
    <>
      {/* DARK HERO WITH GRADIENT */}
      <Navigation />
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <GradientBackground />
        <div className="max-w-[1280px] mx-auto px-6 text-center relative z-10">
          <FadeIn>
            <span className="inline-block text-[#5170ff] text-sm font-semibold tracking-[0.2em] uppercase mb-6">
              Partnerships
            </span>
          </FadeIn>
          <FadeIn delay={100}>
            <h1
              className="font-times text-5xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 uppercase"
              style={{ letterSpacing: '-0.05em' }}
            >
              Reach 50K+ <em className="italic">AI</em> Leaders
            </h1>
          </FadeIn>
          <FadeIn delay={200}>
            <p className="text-white/70 text-xl lg:text-2xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ fontSize: '24px', fontWeight: 500 }}>
              Connect with decision-makers, developers, and innovators shaping the future of artificial intelligence.
            </p>
          </FadeIn>
          <FadeIn delay={300}>
            <a
              href="mailto:ads@thoriumvalley.com"
              className="inline-block bg-white text-[#1b1b1b] px-10 py-4 font-semibold text-base hover:-translate-y-[2px] transition-all duration-300 no-underline rounded-full"
            >
              Get in Touch →
            </a>
          </FadeIn>
        </div>
      </section>

      {/* ANIMATED METRICS - Dark section */}
      <section className="bg-[#0a0a0f] py-24">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <AnimatedMetric value={50} suffix="K+" label="Daily Readers" />
            <AnimatedMetric value={45} suffix="%" label="Open Rate" accent />
            <AnimatedMetric value={3} suffix="min" label="Avg Read Time" />
            <AnimatedMetric value={100} suffix="+" label="Past Sponsors" accent />
          </div>
        </div>
      </section>

      {/* AUDIENCE BREAKDOWN */}
      <section className="bg-white py-24 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-[#5170ff] text-sm font-semibold tracking-[0.2em] uppercase mb-4 block">Our Audience</span>
              <h2 className="font-times text-3xl lg:text-5xl font-bold text-[#1b1b1b] tracking-tight">
                Who Reads Thorium Valley
              </h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            <FadeIn delay={100}>
              <div className="border-2 border-[#1b1b1b]/10 p-8 hover:border-[#5170ff] transition-colors duration-300">
                <div className="text-4xl mb-4">🏢</div>
                <h3 className="text-xl font-bold text-[#1b1b1b] mb-2">C-Suite & VPs</h3>
                <p className="text-[#5170ff] text-3xl font-bold mb-2">32%</p>
                <p className="text-[#1b1b1b]/60 text-base">CTOs, VPs of Engineering, and senior leadership at Fortune 500 companies and high-growth startups.</p>
              </div>
            </FadeIn>
            <FadeIn delay={200}>
              <div className="border-2 border-[#1b1b1b]/10 p-8 hover:border-[#5170ff] transition-colors duration-300">
                <div className="text-4xl mb-4">💻</div>
                <h3 className="text-xl font-bold text-[#1b1b1b] mb-2">Engineers & Developers</h3>
                <p className="text-[#5170ff] text-3xl font-bold mb-2">41%</p>
                <p className="text-[#1b1b1b]/60 text-base">ML engineers, data scientists, and full-stack developers building with AI daily.</p>
              </div>
            </FadeIn>
            <FadeIn delay={300}>
              <div className="border-2 border-[#1b1b1b]/10 p-8 hover:border-[#5170ff] transition-colors duration-300">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-[#1b1b1b] mb-2">Investors & Analysts</h3>
                <p className="text-[#5170ff] text-3xl font-bold mb-2">27%</p>
                <p className="text-[#1b1b1b]/60 text-base">VCs, analysts, and fund managers tracking AI markets and emerging opportunities.</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* TRUSTED BY - Logo bar */}
      <section className="bg-[#f8f8f8] py-16 border-y border-[#1b1b1b]/10">
        <div className="max-w-[1280px] mx-auto px-6">
          <FadeIn>
            <p className="text-center text-[#1b1b1b]/50 text-sm font-semibold tracking-[0.2em] uppercase mb-10">
              Trusted By Industry Leaders
            </p>
            <div className="flex flex-wrap items-center justify-center gap-12 lg:gap-16 opacity-40">
              {['NVIDIA', 'OpenAI', 'Google', 'Microsoft', 'Anthropic', 'Meta'].map((brand) => (
                <span key={brand} className="text-2xl font-bold text-[#1b1b1b] tracking-tight">
                  {brand}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* GLOBAL REACH - Improved globe */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <div>
                <span className="text-[#5170ff] text-sm font-semibold tracking-[0.2em] uppercase mb-4 block">Global Reach</span>
                <h2 className="font-times text-3xl lg:text-5xl font-bold text-[#1b1b1b] mb-6 tracking-tight">
                  Silicon Valley to Singapore
                </h2>
                <p className="text-[#1b1b1b]/60 text-base leading-relaxed mb-8">
                  Our readers span every major tech hub worldwide. From San Francisco to London, from Tel Aviv to Tokyo — Thorium Valley reaches the people building the future.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="border-l-2 border-[#5170ff] pl-4">
                    <p className="text-2xl font-bold text-[#1b1b1b]">78%</p>
                    <p className="text-[#1b1b1b]/60 text-sm">North America</p>
                  </div>
                  <div className="border-l-2 border-[#5170ff] pl-4">
                    <p className="text-2xl font-bold text-[#1b1b1b]">14%</p>
                    <p className="text-[#1b1b1b]/60 text-sm">Europe</p>
                  </div>
                  <div className="border-l-2 border-[#5170ff] pl-4">
                    <p className="text-2xl font-bold text-[#1b1b1b]">5%</p>
                    <p className="text-[#1b1b1b]/60 text-sm">Asia Pacific</p>
                  </div>
                  <div className="border-l-2 border-[#5170ff] pl-4">
                    <p className="text-2xl font-bold text-[#1b1b1b]">3%</p>
                    <p className="text-[#1b1b1b]/60 text-sm">Rest of World</p>
                  </div>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={200}>
              <div className="max-w-md mx-auto aspect-square relative">
                <svg viewBox="0 0 200 200" className="w-full h-full" fill="none" stroke="#1b1b1b" strokeWidth="0.5" opacity="0.3">
                  <circle cx="100" cy="100" r="80" />
                  <ellipse cx="100" cy="100" rx="80" ry="30" />
                  <ellipse cx="100" cy="100" rx="80" ry="55" />
                  <ellipse cx="100" cy="100" rx="30" ry="80" />
                  <ellipse cx="100" cy="100" rx="55" ry="80" />
                  {/* Animated pulse dots */}
                  <circle cx="60" cy="70" r="4" fill="#5170ff" stroke="none" opacity="0.9">
                    <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="130" cy="85" r="4" fill="#5170ff" stroke="none" opacity="0.9">
                    <animate attributeName="r" values="3;5;3" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="100" cy="130" r="4" fill="#5170ff" stroke="none" opacity="0.9">
                    <animate attributeName="r" values="3;5;3" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="75" cy="110" r="3" fill="#5170ff" stroke="none" opacity="0.7">
                    <animate attributeName="r" values="2;4;2" dur="2.2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="140" cy="120" r="3" fill="#5170ff" stroke="none" opacity="0.7">
                    <animate attributeName="r" values="2;4;2" dur="1.9s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="95" cy="55" r="3" fill="#5170ff" stroke="none" opacity="0.6">
                    <animate attributeName="r" values="2;4;2" dur="2.3s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="115" cy="145" r="3" fill="#5170ff" stroke="none" opacity="0.6">
                    <animate attributeName="r" values="2;4;2" dur="2.1s" repeatCount="indefinite" />
                  </circle>
                </svg>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* SPONSORSHIP TIERS */}
      <section className="py-24 lg:py-32 bg-[#f8f8f8]">
        <div className="max-w-[1280px] mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-[#5170ff] text-sm font-semibold tracking-[0.2em] uppercase mb-4 block">Sponsorship Options</span>
              <h2 className="font-times text-3xl lg:text-5xl font-bold text-[#1b1b1b] tracking-tight mb-4">
                Choose Your Tier
              </h2>
              <p className="text-[#1b1b1b]/60 text-base max-w-lg mx-auto">
                Flexible options to fit your budget and goals. All tiers include dedicated account management.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            <FadeIn delay={100}>
              <TierCard
                title="Spotlight"
                price="Custom"
                description="Perfect for brand awareness with a targeted audience of AI professionals."
                features={[
                  'Logo in newsletter header',
                  'Single CTA link placement',
                  'Branded "Presented by" tag',
                  'Performance report',
                ]}
              />
            </FadeIn>
            <FadeIn delay={200}>
              <TierCard
                title="Deep Dive"
                price="Custom"
                description="Maximum visibility with dedicated content placement and social amplification."
                popular
                features={[
                  'Primary header sponsorship',
                  'Custom 150-word ad copy',
                  'Direct link with UTM tracking',
                  'Dedicated analytics dashboard',
                  'Social media amplification',
                ]}
              />
            </FadeIn>
            <FadeIn delay={300}>
              <TierCard
                title="Takeover"
                price="Custom"
                description="Full newsletter takeover with co-branded content and multi-channel distribution."
                features={[
                  'Full edition sponsorship',
                  'Co-branded deep-dive article',
                  'Multi-channel distribution',
                  'Premium analytics + A/B tests',
                  'Dedicated account manager',
                  'Custom audience segmentation',
                ]}
                cta="Contact Us"
              />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-[800px] mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-[#5170ff] text-sm font-semibold tracking-[0.2em] uppercase mb-4 block">How It Works</span>
              <h2 className="font-times text-3xl lg:text-5xl font-bold text-[#1b1b1b] tracking-tight">
                Simple Process, Big Results
              </h2>
            </div>
          </FadeIn>

          <div className="space-y-10">
            <FadeIn delay={100}>
              <ProcessStep number="01" title="Reach Out" description="Send us an email or fill out our interest form. We'll schedule a call within 24 hours to discuss your goals." />
            </FadeIn>
            <FadeIn delay={200}>
              <ProcessStep number="02" title="Customize" description="We'll craft a sponsorship package tailored to your audience, budget, and campaign objectives." />
            </FadeIn>
            <FadeIn delay={300}>
              <ProcessStep number="03" title="Launch" description="Your sponsorship goes live to 50K+ engaged readers. We handle creative, placement, and optimization." />
            </FadeIn>
            <FadeIn delay={400}>
              <ProcessStep number="04" title="Measure" description="Receive detailed analytics including open rates, click-throughs, and engagement metrics within 48 hours." />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="py-24 bg-[#0a0a0f] relative overflow-hidden">
        {/* Subtle gradient */}
        <div className="absolute inset-0 opacity-30" style={{
          background: 'radial-gradient(circle at 30% 50%, rgba(81, 112, 255, 0.3) 0%, transparent 60%)',
        }} />
        <div className="max-w-[900px] mx-auto px-6 relative z-10">
          <FadeIn>
            <div className="text-center">
              <svg className="w-10 h-10 text-[#5170ff] mx-auto mb-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <blockquote className="text-2xl lg:text-3xl text-white font-medium leading-relaxed mb-8">
                Thorium Valley delivered the most engaged audience we&apos;ve seen from any newsletter sponsorship. The quality of readers is unmatched.
              </blockquote>
              <div>
                <p className="text-white font-semibold text-base">Head of Growth</p>
                <p className="text-white/60 text-sm">Series B AI Startup</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-[700px] mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-[#5170ff] text-sm font-semibold tracking-[0.2em] uppercase mb-4 block">FAQ</span>
              <h2 className="font-times text-3xl lg:text-5xl font-bold text-[#1b1b1b] tracking-tight">
                Common Questions
              </h2>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <div>
              <FAQItem
                question="What's the typical ROI for sponsors?"
                answer="Our sponsors typically see 2-4x ROI on their investment. With a 45% open rate and highly engaged audience, click-through rates average 3-5% — well above industry standards."
              />
              <FAQItem
                question="How far in advance should I book?"
                answer="We recommend booking 2-4 weeks in advance for standard placements. Takeover sponsorships should be booked at least 4-6 weeks ahead due to high demand."
              />
              <FAQItem
                question="Can I target specific audience segments?"
                answer="Yes! Our Takeover tier includes custom audience segmentation. We can target by role (engineers vs. executives), company size, or specific interest areas."
              />
              <FAQItem
                question="What creative assets do I need to provide?"
                answer="For Spotlight: just your logo and a CTA link. For Deep Dive: a headline, 150-word description, and CTA. We handle all formatting and design work."
              />
              <FAQItem
                question="Do you offer multi-week packages?"
                answer="Absolutely. We offer discounted rates for multi-week commitments. Contact us for custom package pricing tailored to your campaign timeline."
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FINAL CTA - Dark with gradient */}
      <section className="py-24 lg:py-32 bg-[#0a0a0f] relative overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{
          background: 'radial-gradient(circle at 70% 50%, rgba(81, 112, 255, 0.4) 0%, transparent 50%)',
        }} />
        <div className="max-w-[1280px] mx-auto px-6 text-center relative z-10">
          <FadeIn>
            <h2 className="font-times text-4xl lg:text-6xl font-bold text-white mb-6 tracking-tight" style={{ letterSpacing: '-0.05em' }}>
              Let&apos;s Work Together
            </h2>
            <p className="text-white/60 text-base max-w-lg mx-auto mb-10 leading-relaxed" style={{ fontSize: '18px' }}>
              Ready to reach 50,000+ AI professionals? Get in touch and we&apos;ll build a campaign that delivers results.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:ads@thoriumvalley.com"
                className="inline-block bg-[#5170ff] text-white px-10 py-4 font-semibold text-base hover:-translate-y-[2px] transition-all duration-300 no-underline rounded-full"
              >
                Contact Us →
              </a>
              <a
                href="mailto:ads@thoriumvalley.com"
                className="inline-block text-white/70 hover:text-white px-10 py-4 font-medium text-base transition-all duration-300 no-underline"
              >
                ads@thoriumvalley.com
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Subscribe CTA */}
      <SubscribeCTA />

      {/* Footer */}
      <FooterNew />
    </>
  );
}
