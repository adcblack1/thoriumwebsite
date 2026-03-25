'use client';

import { useState } from 'react';
import { FadeIn } from '@/components/FadeIn';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Implement Supabase magic link auth
    // For now, just simulate the flow
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSent(true);
    setIsLoading(false);
  };

  return (
    <section className="bg-[#ffffff] min-h-[calc(100vh-200px)] py-24 lg:py-32">
      <div className="max-w-[400px] mx-auto px-4">
        <FadeIn>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#1b1b1b] mb-4">Sign In</h1>
            <p className="text-[#1b1b1b]/70">
              Enter your email to receive a magic link.
            </p>
          </div>
        </FadeIn>

        {isSent ? (
          <FadeIn delay={100}>
            <div className="border-2 border-[#1b1b1b] p-8 text-center">
              <h2 className="text-xl font-bold text-[#1b1b1b] mb-2">
                Check your inbox
              </h2>
              <p className="text-[#1b1b1b]/70 mb-4">
                We sent a magic link to <strong>{email}</strong>
              </p>
              <button
                onClick={() => setIsSent(false)}
                className="text-[#5170ff] hover:underline"
              >
                Try a different email
              </button>
            </div>
          </FadeIn>
        ) : (
          <FadeIn delay={100}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm text-[#1b1b1b] mb-2"
                >
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border-2 border-[#1b1b1b] bg-[#ffffff] text-[#1b1b1b] placeholder-[#1b1b1b]/50 focus:outline-none focus:border-[#5170ff] disabled:opacity-50"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#5170ff] text-white py-3 font-medium hover:-translate-y-[2px] transition-transform disabled:opacity-50 disabled:translate-y-0"
              >
                {isLoading ? 'Sending...' : 'Send Magic Link'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[#1b1b1b]/50 text-sm">
                Don&apos;t have an account?{' '}
                <Link href="#subscribe" className="text-[#5170ff] hover:underline">
                  Subscribe Free
                </Link>
              </p>
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
