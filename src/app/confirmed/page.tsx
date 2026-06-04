'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { FooterNew } from '@/components/footer-new';
import OfferWall from '@/components/subscribe/OfferWall';
import Link from 'next/link';

export default function ConfirmedPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const confirmedRef = useRef(false);

  // Mark email as confirmed in Supabase
  useEffect(() => {
    if (!email || confirmedRef.current) return;
    confirmedRef.current = true;

    fetch('/api/subscribe/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).catch(() => {});
  }, [email]);

  return (
    <>
      <Navigation variant="hero" heroTheme="dark" scrolledTheme="white" heroBorder={true} />
      <main className="min-h-screen bg-white flex flex-col items-center px-5 pt-20 lg:pt-52 pb-16">
        <div className="w-full max-w-4xl flex flex-col items-center gap-6">
        <div className="w-full max-w-lg rounded-2xl bg-[#1b1b1b] p-8 lg:p-12 flex flex-col items-center gap-4 text-center">
          {/* TV Logo */}
          <img
            src="/Transparent White Logo.png"
            alt="Thorium Valley"
            className="h-14 w-auto object-contain mb-2"
          />

          <h2 className="font-times font-bold text-2xl lg:text-4xl" style={{ color: '#ffffff' }}>
            You&apos;re all set!
          </h2>
          <p className="text-sm" style={{ color: '#ffffff' }}>
            Your subscription is confirmed. Your first edition arrives tomorrow morning.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
            <Link
              href="/newsletter/latest"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full bg-white text-sm font-semibold hover:bg-white/90 active:scale-[0.98] transition-all"
              style={{ color: '#1b1b1b' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Read latest edition
            </Link>
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full border-2 border-white/30 text-sm font-semibold hover:border-white/50 active:scale-[0.98] transition-all"
              style={{ color: '#ffffff' }}
            >
              Go to homepage
            </Link>
          </div>

          <p className="text-xs mt-4" style={{ color: '#ffffff' }}>
            Thank you for subscribing to Thorium Valley.
          </p>
        </div>

          {/* Same sponsored-offer wall as the funnel confirmation step. */}
          <OfferWall page="confirmed" email={email || undefined} skip={3} />
        </div>
      </main>
      <FooterNew />
    </>
  );
}
