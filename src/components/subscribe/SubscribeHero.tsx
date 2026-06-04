'use client';

/**
 * SubscribeHero — first screen of /subscribe (navy + pink-cloud reskin).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * VISUAL ONLY — NO FUNCTIONALITY LIVES HERE
 * ─────────────────────────────────────────────────────────────────────────
 * All subscription logic (validation, API calls, tracking, step routing) is
 * owned by the parent, src/app/subscribe/page.tsx. This component keeps the
 * exact same decoupled, presentational contract it always had: it reads
 * `email`, reports edits via `onEmailChange`, fires `onSubmit` on submit, and
 * renders `loading` / `error`. Reskinning it changes pixels, not behaviour.
 *
 * Design tokens (from the Canva landing mock the user supplied):
 *   • #002f5b navy — page + card background
 *   • pink halftone clouds + ticket confetti — /images/subscribe/clouds-*.png
 *     (the dark areas of those PNGs are transparent, so the navy shows through)
 *   • "Thorium Valley" wordmark — /images/subscribe/wordmark.png  (white)
 *   • hand-drawn "AI" underline — /images/subscribe/ai-underline.png (white)
 *   • "Tech" / "Business" tags — the user-supplied art, cleaned to transparent
 *     navy parallelograms: /images/subscribe/tech-tag.png + business-tag.png.
 *     The tilt is baked into the art, so NO CSS rotation is applied. They sit
 *     IN FRONT of the cloud backdrop but BEHIND the card, peeking past its edge.
 *
 * Typography: the headline is Times New Roman MT at -0.07em letter-spacing;
 * EVERYTHING else is real Inter (loaded + scoped in subscribe/layout.tsx via
 * `.subscribe-root`, see globals.css).
 *
 * NOTE on text colour: globals.css has an UNLAYERED `p { color: var(--color-text) }`
 * rule (#1b1b1b). Unlayered element rules beat Tailwind's layered `text-white/*`
 * utilities, so light text on <p>/headings must be set with an inline `style`.
 * That's why the subtext + "No longer invite only." use inline #efefef.
 */

import { motion, useReducedMotion } from 'framer-motion';

const NAVY = '#002f5b';
const LIGHT = '#efefef'; // subtext + fine print, per spec

// Real white company logos (files already in /public/images/companies).
const LOGO_ROWS: { file: string; alt: string; h: number }[][] = [
  [
    { file: 'meta white logo.png', alt: 'Meta', h: 19 },
    { file: 'google logo white.png', alt: 'Google', h: 22 },
  ],
  [
    { file: 'morgan stanley white logo.png', alt: 'Morgan Stanley', h: 16 },
    { file: 'cisco white logo.png', alt: 'Cisco', h: 17 },
    { file: 'adobe white logo.png', alt: 'Adobe', h: 22 },
  ],
  [
    { file: 'anduril white logo.png', alt: 'Anduril', h: 18 },
    { file: 'fidelity white logo.png', alt: 'Fidelity Investments', h: 20 },
  ],
];
const logoSrc = (file: string) => `/images/companies/${file.replace(/ /g, '%20')}`;

// ── Props — the SAME decoupled contract the funnel already used ──
type SubscribeHeroProps = {
  email: string;
  onEmailChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
};

export default function SubscribeHero({
  email,
  onEmailChange,
  onSubmit,
  loading,
  error,
}: SubscribeHeroProps) {
  const reduce = useReducedMotion();

  return (
    <main
      className="relative flex min-h-[100svh] w-full flex-col items-center overflow-hidden px-4 py-8"
      style={{ background: NAVY }}
    >
      {/* Pink cloud + confetti backdrop (transparent → navy shows through). */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/subscribe/clouds-mobile.png"
        alt=""
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-0 z-0 w-full max-w-[560px] -translate-x-1/2 select-none lg:hidden"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/subscribe/clouds-desktop.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 z-0 hidden w-full max-w-[1600px] -translate-x-[59%] select-none lg:block"
      />

      {/* Card column */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mt-28 w-full max-w-[420px] lg:mt-32 lg:max-w-[540px]"
      >
        {/* Card + tags wrapper. Narrower than the column so the square card
            leaves cloud margin on both sides for the tags to peek into. Tags are
            positioned relative to THIS box (the card's footprint), so they
            straddle the card edge — in front of the cloud (z-10 within the
            column) but behind the card (z-20). */}
        <div className="relative mx-auto w-full max-w-[330px] lg:max-w-[440px]">
          {/* Tech tag — user-supplied art (tilt baked in). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/subscribe/tech-tag.png"
            alt="Tech"
            className="pointer-events-none absolute z-10 select-none top-[-42px] left-[-30px] w-[104px] lg:top-[-58px] lg:left-[-44px] lg:w-[146px]"
            style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.30))' }}
          />
          {/* Business tag — user-supplied art (tilt baked in). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/subscribe/business-tag.png"
            alt="Business"
            className="pointer-events-none absolute z-10 select-none top-[95%] right-[-32px] w-[130px] lg:right-[-50px] lg:w-[182px]"
            style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.30))' }}
          />

          {/* Navy card — mobile drop shadow per spec; every child is real DOM */}
          <div
            className="relative z-20 flex aspect-square w-full flex-col items-center justify-center rounded-[30px] px-6 text-center text-white shadow-[0_28px_70px_-18px_rgba(0,0,0,0.7)] lg:rounded-[36px] lg:px-10"
            style={{ background: NAVY }}
          >
            {/* Wordmark (a touch smaller per feedback) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/subscribe/wordmark.png"
              alt="Thorium Valley"
              className="w-[88px] lg:w-[120px]"
            />

            {/* Headline — Times New Roman MT, -0.07em, "AI" hand-underlined.
                Sized down a touch alongside the wordmark per feedback. */}
            <h1
              className="font-times mt-4 lg:mt-6"
              style={{ fontSize: 'clamp(26px, 3.3vw, 40px)', lineHeight: 1.08, fontWeight: 400, color: '#ffffff', letterSpacing: '-0.07em' }}
            >
              The front page of{' '}
              <span className="relative inline-block">
                AI
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/subscribe/ai-underline.png"
                  alt=""
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 w-[210%] -translate-x-1/2 select-none"
                  style={{ bottom: '0.04em' }}
                />
              </span>
              .
            </h1>

            {/* Subtext — Inter, #efefef per feedback */}
            <p className="font-inter mt-3 lg:mt-4" style={{ fontSize: 'clamp(13px, 1.15vw, 16px)', lineHeight: 1.45, color: LIGHT }}>
              Our free, daily newsletter turns professionals into AI experts.
            </p>

            {/* Form — the live wiring (unchanged contract) */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
              }}
              className="mt-5 flex w-full flex-col items-center gap-2.5 lg:mt-6 lg:gap-3"
            >
              <label htmlFor="subscribe-email" className="sr-only">
                Email address
              </label>
              <input
                id="subscribe-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                disabled={loading}
                placeholder="Your email address"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                className="font-inter h-11 w-full rounded-lg border-0 px-5 text-[15px] outline-none placeholder:text-[#9ea0a9] lg:h-[52px] lg:px-5 lg:text-[16px]"
                style={{ background: '#fcfcfc', color: NAVY }}
              />
              <button
                type="submit"
                disabled={loading}
                className="font-inter h-11 w-full rounded-lg text-[15px] font-semibold transition-transform active:scale-[0.99] disabled:opacity-60 lg:h-[52px] lg:text-[16px]"
                style={{ background: '#ffffff', color: '#000000', boxShadow: '0 0 14px 2px rgba(255,255,255,0.28), 0 0 26px 5px rgba(255,255,255,0.12)' }}
              >
                {loading ? '…' : 'Subscribe'}
              </button>
            </form>

            {error && (
              <p className="font-inter mt-2 font-medium" style={{ fontSize: '13px', color: '#ffb4ab' }}>
                {error}
              </p>
            )}

            {/* No longer invite only — #efefef per feedback */}
            <p className="font-inter mt-2 lg:mt-3" style={{ fontSize: 'clamp(10px, 0.85vw, 12px)', color: LIGHT }}>
              No longer invite only.
            </p>
          </div>
        </div>

        {/* Social proof — OUTSIDE the card, on the navy background, per feedback. */}
        <div className="relative z-30 mt-8 flex w-full flex-col items-center text-center lg:mt-10">
          <p className="font-inter" style={{ fontSize: 'clamp(13px, 1.1vw, 16px)', color: LIGHT }}>
            Join 5,043{' '}
            <span className="relative inline-block">
              Leaders
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/subscribe/ai-underline.png"
                alt=""
                aria-hidden
                className="pointer-events-none absolute left-1/2 w-[118%] -translate-x-1/2 select-none"
                style={{ bottom: '-0.18em' }}
              />
            </span>{' '}
            from companies like
          </p>
          <div className="mt-5 flex w-full flex-col items-center gap-4 lg:mt-6 lg:gap-5">
            {LOGO_ROWS.map((row, i) => (
              <div key={i} className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 lg:gap-x-9 lg:gap-y-4">
                {row.map((l) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={l.alt}
                    src={logoSrc(l.file)}
                    alt={l.alt}
                    className="object-contain"
                    style={{ height: `clamp(${l.h}px, ${(l.h * 0.105).toFixed(2)}vw, ${Math.round(l.h * 1.4)}px)`, width: 'auto' }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </main>
  );
}
