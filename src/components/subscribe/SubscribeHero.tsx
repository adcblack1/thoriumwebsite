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
      style={{ background: '#000000' }}
    >
      {/* Clouds removed — solid black background. */}

      {/* Card column */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mt-0 w-full max-w-[420px] lg:mt-4 lg:max-w-[600px]"
      >
        {/* Card + tags wrapper. Narrower than the column so the square card
            leaves cloud margin on both sides for the tags to peek into. Tags are
            positioned relative to THIS box (the card's footprint), so they
            straddle the card edge — in front of the cloud (z-10 within the
            column) but behind the card (z-20). */}
        <div className="relative mx-auto w-full max-w-[400px] lg:max-w-[520px]">
          {/* Tech / Business tags removed per request. */}

          {/* Black card — single box, white text (the deployed look). */}
          <div
            className="relative z-20 flex w-full flex-col items-center justify-center rounded-[30px] px-6 py-9 text-center text-white shadow-[0_28px_70px_-18px_rgba(0,0,0,0.7)] lg:rounded-[36px] lg:px-10 lg:py-11"
            style={{ background: '#000000' }}
          >
            {/* Wordmark */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/subscribe/wordmark.png"
              alt="Thorium Valley"
              className="w-[135px] lg:w-[135px]"
            />

            {/* Headline — Times New Roman MT; "AI" hand-underlined in blue. */}
            <h1
              className="font-times mt-4 lg:mt-6"
              style={{ fontSize: 'clamp(38px, 4.6vw, 60px)', lineHeight: 1.08, fontWeight: 400, color: '#ffffff', letterSpacing: '-0.07em' }}
            >
              Make Sense of the
              <br />
              <span style={{ color: '#5170ff' }}>
                Age of{' '}
                <span className="relative inline-block">
                  AI
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/subscribe/ai-underline-blue.png"
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute left-1/2 w-[130%] max-w-none -translate-x-1/2 select-none"
                    style={{ bottom: '0.04em' }}
                  />
                </span>
              </span>
            </h1>

            {/* Subtext */}
            <p className="font-inter mt-3 lg:mt-4" style={{ fontSize: 'clamp(17px, 1.6vw, 22px)', lineHeight: 1.45, fontWeight: 500, color: LIGHT }}>
              Our free, daily newsletter makes you smarter about AI.
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
                style={{ background: '#5170ff', color: '#ffffff', boxShadow: '0 0 14px 2px rgba(81,112,255,0.45), 0 0 26px 5px rgba(81,112,255,0.22)' }}
              >
                {loading ? '…' : 'Subscribe'}
              </button>
            </form>

            {error && (
              <p className="font-inter mt-2 font-medium" style={{ fontSize: '13px', color: '#ffb4ab' }}>
                {error}
              </p>
            )}

            {/* Fine print */}
            <p className="font-inter mt-2 lg:mt-3" style={{ fontSize: 'clamp(10px, 0.85vw, 12px)', color: LIGHT }}>
              5 minutes. Every morning. No longer invite-only.
            </p>
          </div>
        </div>

        {/* Social proof — single image: avatars + 5,043 count + company logos (white art on navy). */}
        <div className="relative z-30 mt-8 flex w-full flex-col items-center lg:mt-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/subscribe/social-proof.webp"
            alt="Join 5,043 leaders from companies like Meta, Google, Morgan Stanley, Cisco, Adobe, Anduril, and Fidelity"
            className="w-full max-w-[480px] h-auto select-none"
          />
        </div>
      </motion.div>
    </main>
  );
}
