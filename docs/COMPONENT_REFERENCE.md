# Thorium Valley - Component Reference

> **PURPOSE**: This file contains ready-to-use React/Next.js component code.
> Copy these directly into your project. All patterns extracted from firecrawled reference sites.

---

## CRITICAL BRAND RULES (Apply to ALL components)

```
COLORS:    #eeede9 (background) | #1b1b1b (text/borders) | #5170ff (accent)
FONT:      Times New Roman MT Std ONLY
CORNERS:   0px border-radius (sharp corners EVERYWHERE)
GRADIENTS: NEVER USE
CTA TEXT:  "Subscribe Free" (always)
HEADLINE:  "AI Is *Eating* the World" (eating = italic)
```

---

## 1. ROOT LAYOUT (app/layout.tsx)

```tsx
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LenisProvider } from '@/components/LenisProvider';

const timesNewRoman = localFont({
  src: [
    // IMPORTANT: Copy these .otf files from /Times New Roman MT Std/ to /public/fonts/
    // and convert to .woff2 for web performance, OR use .otf directly
    { path: '../public/fonts/TimesNewRomanMTStdRegular.otf', weight: '400', style: 'normal' },
    { path: '../public/fonts/TimesNewRomanMTStdBold.otf', weight: '700', style: 'normal' },
    { path: '../public/fonts/TimesNewRomanMTStdItalic.otf', weight: '400', style: 'italic' },
    // NOTE: Only 3 variants exist: Regular, Bold, Italic (no Bold-Italic)
  ],
  variable: '--font-times',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Thorium Valley - AI News That Matters',
  description: 'Daily AI briefings for professionals. No hype, just signal.',
  openGraph: {
    title: 'Thorium Valley',
    description: 'AI Is Eating the World',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={timesNewRoman.variable}>
      <body className="bg-[#eeede9] text-[#1b1b1b] font-times antialiased">
        <LenisProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </LenisProvider>
      </body>
    </html>
  );
}
```

---

## 2. GLOBAL CSS (app/globals.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* === BRAND COLORS (ONLY THESE 3) === */
    --color-background: #eeede9;
    --color-text: #1b1b1b;
    --color-accent: #5170ff;
    
    /* Opacity variants */
    --color-text-muted: rgba(27, 27, 27, 0.6);
    --color-border: rgba(27, 27, 27, 0.2);
    
    /* === TYPOGRAPHY === */
    --font-times: 'Times New Roman MT Std', 'Times New Roman', Georgia, serif;
    
    /* === SPACING (8px base) === */
    --spacing-1: 0.25rem;
    --spacing-2: 0.5rem;
    --spacing-3: 0.75rem;
    --spacing-4: 1rem;
    --spacing-6: 1.5rem;
    --spacing-8: 2rem;
    --spacing-12: 3rem;
    --spacing-16: 4rem;
    --spacing-24: 6rem;
    
    /* === ANIMATION === */
    --duration-fast: 150ms;
    --duration-normal: 200ms;
    --duration-slow: 300ms;
    --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  html {
    scroll-behavior: smooth;
  }
  
  body {
    font-family: var(--font-times);
    background-color: var(--color-background);
    color: var(--color-text);
  }
  
  * {
    border-radius: 0 !important; /* SHARP CORNERS EVERYWHERE */
  }
}

/* === ANIMATIONS === */
@keyframes fade-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-up { animation: fade-up 0.6s var(--ease-out) forwards; }
.animate-fade-in { animation: fade-in 0.4s var(--ease-out) forwards; }

/* Stagger delays */
.delay-100 { animation-delay: 100ms; }
.delay-200 { animation-delay: 200ms; }
.delay-300 { animation-delay: 300ms; }
.delay-400 { animation-delay: 400ms; }
.delay-500 { animation-delay: 500ms; }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 3. TAILWIND CONFIG (tailwind.config.ts)

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'tv-bg': '#eeede9',
        'tv-text': '#1b1b1b',
        'tv-accent': '#5170ff',
        'tv-muted': 'rgba(27, 27, 27, 0.6)',
        'tv-border': 'rgba(27, 27, 27, 0.2)',
      },
      fontFamily: {
        'times': ['var(--font-times)', 'Times New Roman', 'Georgia', 'serif'],
      },
      maxWidth: {
        'container': '1280px',
      },
      borderRadius: {
        'none': '0',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 4. LENIS SMOOTH SCROLL PROVIDER

```tsx
// components/LenisProvider.tsx
'use client';

import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';

export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Handle anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href') || '');
        if (target) {
          lenis.scrollTo(target as HTMLElement, { offset: -80 });
        }
      });
    });

    return () => lenis.destroy();
  }, []);

  return <>{children}</>;
}
```

---

## 5. HEADER COMPONENT (From TheDeepView pattern)

```tsx
// components/Header.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: '/newsletter', label: 'Newsletter' },
    { href: '/advertise', label: 'Advertise' },
    { href: '/about', label: 'About' },
  ];

  return (
    <header className="bg-[#eeede9] sticky top-0 z-50 border-b border-[#1b1b1b]/20">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/Transparent Black Logo.png"
              alt="Thorium Valley"
              width={40}
              height={40}
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[#1b1b1b] hover:text-[#5170ff] transition-colors text-sm font-normal"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA Group */}
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="hidden md:block text-[#1b1b1b] text-sm hover:text-[#5170ff] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="#subscribe"
              className="bg-[#5170ff] text-white px-6 py-2 text-sm font-medium hover:translate-y-[-2px] transition-transform"
            >
              Subscribe Free
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-[#1b1b1b]" />
              ) : (
                <Menu className="w-5 h-5 text-[#1b1b1b]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-[#1b1b1b]/20">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-3 text-[#1b1b1b] hover:text-[#5170ff]"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/auth/login"
              className="block py-3 text-[#1b1b1b] hover:text-[#5170ff]"
            >
              Sign In
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
```

---

## 6. NEWSLETTER FORM COMPONENT (From TheDeepView pattern)

```tsx
// components/NewsletterForm.tsx
'use client';

import { useActionState } from 'react';
import { subscribeAction } from '@/app/actions/subscribe';

interface NewsletterFormProps {
  variant?: 'hero' | 'footer' | 'inline';
  className?: string;
}

export function NewsletterForm({ variant = 'inline', className = '' }: NewsletterFormProps) {
  const [state, formAction, isPending] = useActionState(subscribeAction, null);

  return (
    <form action={formAction} className={className}>
      <div className="flex border-2 border-[#1b1b1b]">
        <input
          type="email"
          name="email"
          placeholder="Your email address"
          required
          disabled={isPending}
          className="flex-1 px-4 py-3 bg-[#eeede9] text-[#1b1b1b] placeholder-[#1b1b1b]/50 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-3 bg-[#5170ff] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? 'Subscribing...' : 'Subscribe Free'}
        </button>
      </div>

      {state?.error && (
        <p className="text-[#1b1b1b] text-sm mt-2">⚠ {state.error}</p>
      )}
      {state?.success && (
        <p className="text-[#5170ff] text-sm mt-2">✓ Check your inbox to confirm!</p>
      )}
    </form>
  );
}
```

---

## 7. SUBSCRIBE SERVER ACTION (Beehiiv Integration)

```typescript
// app/actions/subscribe.ts
'use server';

import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');

const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY!;
const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID!;

export async function subscribeAction(
  prevState: { success?: boolean; error?: string } | null,
  formData: FormData
) {
  const email = formData.get('email');
  
  const result = emailSchema.safeParse(email);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  try {
    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BEEHIIV_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: result.data,
          reactivate_existing: true,
          send_welcome_email: true,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Subscription failed');
    }

    return { success: true };
  } catch (error) {
    console.error('Subscribe error:', error);
    return { error: 'Something went wrong. Please try again.' };
  }
}
```

---

## 8. BEEHIIV API CLIENT

```typescript
// lib/beehiiv.ts
const BEEHIIV_API = 'https://api.beehiiv.com/v2';

class BeehiivClient {
  private apiKey: string;
  private publicationId: string;

  constructor() {
    this.apiKey = process.env.BEEHIIV_API_KEY!;
    this.publicationId = process.env.BEEHIIV_PUBLICATION_ID!;
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${BEEHIIV_API}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Beehiiv API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getNewsletters(options?: { limit?: number; page?: number }) {
    const params = new URLSearchParams();
    params.set('status', 'confirmed');
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.page) params.set('page', options.page.toString());
    params.append('expand[]', 'free_web_content');

    return this.fetch<{
      data: Newsletter[];
      total_results: number;
      page: number;
    }>(`/publications/${this.publicationId}/posts?${params.toString()}`);
  }

  async getNewsletterBySlug(slug: string) {
    const response = await this.getNewsletters({ limit: 100 });
    const post = response.data.find((p) => p.slug === slug);
    if (!post) return null;
    
    return this.fetch<{ data: Newsletter }>(
      `/publications/${this.publicationId}/posts/${post.id}?expand[]=free_web_content`
    ).then((res) => res.data);
  }

  async subscribe(email: string, source?: string) {
    return this.fetch(`/publications/${this.publicationId}/subscriptions`, {
      method: 'POST',
      body: JSON.stringify({
        email,
        reactivate_existing: true,
        send_welcome_email: true,
        utm_source: source || 'website',
      }),
    });
  }
}

export interface Newsletter {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  thumbnail_url?: string;
  content: { free_web_content?: string };
  created_at: string;
  published_at: string;
  status: string;
}

export const beehiiv = new BeehiivClient();
```

---

## 9. SUPABASE AUTH CLIENT

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

```typescript
// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}
```

---

## 10. NEWSLETTER CARD COMPONENT (From Rundown pattern)

```tsx
// components/NewsletterCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import type { Newsletter } from '@/lib/beehiiv';

interface NewsletterCardProps {
  newsletter: Newsletter;
  priority?: boolean;
}

export function NewsletterCard({ newsletter, priority = false }: NewsletterCardProps) {
  return (
    <Link href={`/newsletter/${newsletter.slug}`} className="group block">
      {/* Thumbnail */}
      <div className="relative aspect-[16/9] overflow-hidden bg-[#1b1b1b]/5 mb-4">
        {newsletter.thumbnail_url ? (
          <Image
            src={newsletter.thumbnail_url}
            alt={newsletter.title}
            fill
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#1b1b1b]/30">
            No image
          </div>
        )}
        {/* Category Tag */}
        <span className="absolute top-3 left-3 bg-[#5170ff] text-white text-xs font-medium px-2 py-1">
          Newsletter
        </span>
      </div>

      {/* Content */}
      <h3 className="text-[#1b1b1b] font-bold text-lg mb-2 group-hover:text-[#5170ff] transition-colors line-clamp-2">
        {newsletter.title}
      </h3>
      {newsletter.subtitle && (
        <p className="text-[#1b1b1b]/60 text-sm mb-2 line-clamp-2">
          {newsletter.subtitle}
        </p>
      )}
      <time className="text-[#1b1b1b]/50 text-sm">
        {new Date(newsletter.published_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </time>
    </Link>
  );
}
```

---

## 11. NEWSLETTER GRID COMPONENT

```tsx
// components/NewsletterGrid.tsx
import { NewsletterCard } from './NewsletterCard';
import type { Newsletter } from '@/lib/beehiiv';

interface NewsletterGridProps {
  newsletters: Newsletter[];
}

export function NewsletterGrid({ newsletters }: NewsletterGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {newsletters.map((newsletter, index) => (
        <div
          key={newsletter.id}
          className="animate-fade-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <NewsletterCard newsletter={newsletter} priority={index < 3} />
        </div>
      ))}
    </div>
  );
}
```

---

## 12. SUBSCRIBE CTA SECTION

```tsx
// components/SubscribeCTA.tsx
import { NewsletterForm } from './NewsletterForm';

export function SubscribeCTA() {
  return (
    <section id="subscribe" className="bg-[#eeede9] py-24 border-t border-[#1b1b1b]/20">
      <div className="max-w-[1280px] mx-auto px-4 text-center">
        <h2 className="text-4xl lg:text-5xl font-bold text-[#1b1b1b] mb-6">
          AI Is <em className="not-italic font-bold italic">Eating</em> the World
        </h2>
        <p className="text-[#1b1b1b]/70 mb-8 max-w-lg mx-auto text-lg">
          Join thousands of readers getting the essential AI briefing every day. Free forever.
        </p>
        <NewsletterForm className="max-w-md mx-auto" />
      </div>
    </section>
  );
}
```

---

## 13. SCROLL SUBSCRIBE POPUP

```tsx
// components/ScrollSubscribePopup.tsx
'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { NewsletterForm } from './NewsletterForm';
import { createClient } from '@/lib/supabase/client';

export function ScrollSubscribePopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    // Check if user is signed in
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsSignedIn(!!user);
    };
    checkAuth();

    // Check if already dismissed this session
    if (sessionStorage.getItem('subscribe-popup-dismissed')) {
      setIsDismissed(true);
      return;
    }

    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > 50 && !isDismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem('subscribe-popup-dismissed', 'true');
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#eeede9] border-t-2 border-[#1b1b1b] p-4 z-50 animate-fade-up">
      <div className="max-w-[600px] mx-auto relative">
        <button
          onClick={handleDismiss}
          className="absolute -top-2 right-0 p-1 text-[#1b1b1b]/50 hover:text-[#1b1b1b]"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        {isSignedIn ? (
          <p className="text-center text-[#1b1b1b]">
            Welcome back! <a href="/dashboard" className="text-[#5170ff] underline">Go to dashboard</a>
          </p>
        ) : (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[#1b1b1b] font-medium text-center md:text-left">
              Want more? Subscribe free.
            </p>
            <NewsletterForm className="w-full md:w-auto" />
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 14. FADE-IN ANIMATION WRAPPER

```tsx
// components/FadeIn.tsx
'use client';

import { useRef, useEffect, useState } from 'react';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function FadeIn({ children, delay = 0, className = '' }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '-50px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-600 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
```

---

## 15. FOOTER COMPONENT

```tsx
// components/Footer.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Linkedin, Youtube } from 'lucide-react';
import { NewsletterForm } from './NewsletterForm';

export function Footer() {
  const footerLinks = [
    { label: 'Newsletter', href: '/newsletter' },
    { label: 'Advertise', href: '/advertise' },
    { label: 'About', href: '/about' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ];

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com/thoriumvalley' },
    { icon: Linkedin, href: 'https://linkedin.com/company/thoriumvalley' },
    { icon: Youtube, href: 'https://youtube.com/@thoriumvalley' },
  ];

  return (
    <footer className="bg-[#eeede9] border-t border-[#1b1b1b]/20">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Brand + Newsletter */}
          <div className="lg:col-span-8">
            <Link href="/" className="inline-block mb-6">
              <Image src="/logo-black.png" alt="Thorium Valley" width={48} height={48} />
            </Link>
            <p className="text-[#1b1b1b]/70 mb-6 max-w-md">
              Daily AI news and analysis for professionals who need to stay ahead.
            </p>
            <NewsletterForm className="max-w-md" />
          </div>

          {/* Links */}
          <div className="lg:col-span-4">
            <h4 className="text-[#1b1b1b] font-bold mb-4">Links</h4>
            <nav className="flex flex-col gap-3 mb-8">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[#1b1b1b]/70 hover:text-[#5170ff] transition-colors text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map(({ icon: Icon, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1b1b1b]/50 hover:text-[#5170ff] transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#1b1b1b]/20 mt-12 pt-8">
          <p className="text-[#1b1b1b]/50 text-sm">
            © {new Date().getFullYear()} Thorium Valley. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
```

---

## 16. HOMEPAGE (app/page.tsx)

```tsx
// app/page.tsx
import { beehiiv } from '@/lib/beehiiv';
import { NewsletterForm } from '@/components/NewsletterForm';
import { NewsletterCard } from '@/components/NewsletterCard';
import { NewsletterGrid } from '@/components/NewsletterGrid';
import { SubscribeCTA } from '@/components/SubscribeCTA';
import { FadeIn } from '@/components/FadeIn';
import Image from 'next/image';
import Link from 'next/link';

export default async function HomePage() {
  const { data: newsletters } = await beehiiv.getNewsletters({ limit: 7 });
  const featured = newsletters[0];
  const recent = newsletters.slice(1, 7);

  return (
    <>
      {/* HERO SECTION */}
      <section className="bg-[#eeede9] py-24 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-4 text-center">
          <FadeIn>
            <h1 className="text-5xl lg:text-7xl font-bold text-[#1b1b1b] mb-6 tracking-tight">
              AI Is <em className="not-italic font-bold italic">Eating</em> the World
            </h1>
          </FadeIn>
          <FadeIn delay={100}>
            <p className="text-xl text-[#1b1b1b]/70 mb-10 max-w-xl mx-auto">
              Daily AI briefings for professionals. No hype, just signal.
            </p>
          </FadeIn>
          <FadeIn delay={200}>
            <NewsletterForm className="max-w-md mx-auto" />
          </FadeIn>
          <FadeIn delay={300}>
            <p className="text-sm text-[#1b1b1b]/50 mt-6">
              Join 50,000+ readers. Free forever.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* FEATURED NEWSLETTER */}
      {featured && (
        <section className="max-w-[1280px] mx-auto px-4 py-16">
          <FadeIn>
            <span className="text-[#1b1b1b]/50 text-sm tracking-wider mb-6 block">
              // Featured
            </span>
          </FadeIn>
          <FadeIn delay={100}>
            <Link href={`/newsletter/${featured.slug}`} className="group block">
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="aspect-[16/9] relative overflow-hidden bg-[#1b1b1b]/5">
                  {featured.thumbnail_url && (
                    <Image
                      src={featured.thumbnail_url}
                      alt={featured.title}
                      fill
                      priority
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <span className="bg-[#5170ff] text-white text-xs font-medium px-2 py-1 w-fit mb-4">
                    Latest Newsletter
                  </span>
                  <h2 className="text-3xl lg:text-4xl font-bold text-[#1b1b1b] mb-4 group-hover:text-[#5170ff] transition-colors">
                    {featured.title}
                  </h2>
                  {featured.subtitle && (
                    <p className="text-[#1b1b1b]/70 text-lg mb-4">
                      {featured.subtitle}
                    </p>
                  )}
                  <time className="text-[#1b1b1b]/50 text-sm">
                    {new Date(featured.published_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                </div>
              </div>
            </Link>
          </FadeIn>
        </section>
      )}

      {/* RECENT NEWSLETTERS */}
      <section className="max-w-[1280px] mx-auto px-4 py-16">
        <FadeIn>
          <div className="flex items-center justify-between mb-8">
            <span className="text-[#1b1b1b]/50 text-sm tracking-wider">
              // Recent
            </span>
            <Link href="/newsletter" className="text-[#5170ff] text-sm hover:underline">
              View All →
            </Link>
          </div>
        </FadeIn>
        <NewsletterGrid newsletters={recent} />
      </section>

      {/* SUBSCRIBE CTA */}
      <SubscribeCTA />
    </>
  );
}
```

---

## 17. ENVIRONMENT VARIABLES TEMPLATE

```env
# .env.local

# Beehiiv (Newsletter)
BEEHIIV_API_KEY=your_api_key_here
BEEHIIV_PUBLICATION_ID=pub_xxxxxxxx

# Supabase (Auth & Database)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Site
NEXT_PUBLIC_SITE_URL=https://thoriumvalley.com
```

---

## 18. DEPENDENCIES (package.json additions)

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@supabase/ssr": "^0.1.0",
    "@studio-freight/lenis": "^1.0.0",
    "lucide-react": "^0.300.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "@types/react": "^18.0.0",
    "@types/node": "^20.0.0"
  }
}
```

## 19. ADVERTISE PAGE (From QuickNode pattern)

```tsx
// app/advertise/page.tsx
import { FadeIn } from '@/components/FadeIn';
import Image from 'next/image';

// Metrics component (stolen from QuickNode)
function MetricItem({ value, label, accent = false }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="text-center">
      <span className={`text-5xl lg:text-6xl font-bold ${accent ? 'text-[#5170ff]' : 'text-[#1b1b1b]'}`}>
        {value}
      </span>
      <span className="block text-[#1b1b1b]/60 text-sm mt-2">{label}</span>
    </div>
  );
}

// Sponsorship offering card (sharp corners, clean)
function SponsorshipCard({ title, description, features }: { title: string; description: string; features: string[] }) {
  return (
    <div className="border-2 border-[#1b1b1b] p-8">
      <h3 className="text-2xl font-bold text-[#1b1b1b] mb-4">{title}</h3>
      <p className="text-[#1b1b1b]/70 mb-6">{description}</p>
      <ul className="space-y-2 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="text-[#1b1b1b]/80 flex items-start gap-2">
            <span className="text-[#5170ff] font-bold">→</span>
            {feature}
          </li>
        ))}
      </ul>
      <a 
        href="mailto:ads@thoriumvalley.com" 
        className="bg-[#5170ff] text-white px-6 py-3 inline-block font-medium hover:translate-y-[-2px] transition-transform"
      >
        Get in Touch
      </a>
    </div>
  );
}

export default function AdvertisePage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-[#eeede9] py-24 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-4 text-center">
          <FadeIn>
            <span className="text-[#1b1b1b]/50 text-sm tracking-wider mb-6 block">
              // Advertise
            </span>
          </FadeIn>
          <FadeIn delay={100}>
            <h1 className="text-5xl lg:text-7xl font-bold text-[#1b1b1b] mb-6 tracking-tight">
              Reach 50K+ AI Leaders Daily
            </h1>
          </FadeIn>
          <FadeIn delay={200}>
            <p className="text-xl text-[#1b1b1b]/70 mb-10 max-w-2xl mx-auto">
              Connect with decision-makers, developers, and innovators who are shaping the future of AI.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* METRICS (From QuickNode) */}
      <section className="max-w-[1280px] mx-auto px-4">
        <FadeIn>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-16 border-y border-[#1b1b1b]/20">
            <MetricItem value="50K+" label="Daily Readers" />
            <MetricItem value="45%" label="Open Rate" accent />
            <MetricItem value="3min" label="Avg Read Time" />
            <MetricItem value="100+" label="Past Sponsors" accent />
          </div>
        </FadeIn>
      </section>

      {/* GLOBE ILLUSTRATION SECTION */}
      <section className="py-24 bg-[#eeede9]">
        <div className="max-w-[1280px] mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-[#1b1b1b] mb-4">
                Global Reach, Targeted Audience
              </h2>
              <p className="text-[#1b1b1b]/70 max-w-lg mx-auto">
                Our readers span across tech hubs worldwide, from Silicon Valley to Singapore.
              </p>
            </div>
          </FadeIn>
          
          {/* Globe Placeholder - CSS line art style */}
          <FadeIn delay={100}>
            <div className="max-w-md mx-auto aspect-square relative">
              <div className="globe-container absolute inset-0 flex items-center justify-center">
                {/* Simple wireframe globe using CSS/SVG */}
                <svg viewBox="0 0 200 200" className="w-full h-full" fill="none" stroke="#1b1b1b" strokeWidth="1">
                  {/* Main circle */}
                  <circle cx="100" cy="100" r="80" />
                  {/* Horizontal lines */}
                  <ellipse cx="100" cy="100" rx="80" ry="30" />
                  <ellipse cx="100" cy="100" rx="80" ry="60" />
                  {/* Vertical lines */}
                  <ellipse cx="100" cy="100" rx="30" ry="80" />
                  <ellipse cx="100" cy="100" rx="60" ry="80" />
                  {/* Accent dots */}
                  <circle cx="60" cy="70" r="4" fill="#5170ff" stroke="none" />
                  <circle cx="130" cy="85" r="4" fill="#5170ff" stroke="none" />
                  <circle cx="100" cy="130" r="4" fill="#5170ff" stroke="none" />
                  <circle cx="75" cy="110" r="3" fill="#5170ff" stroke="none" />
                  <circle cx="140" cy="120" r="3" fill="#5170ff" stroke="none" />
                </svg>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* SPONSORSHIP OPTIONS */}
      <section className="py-24 bg-[#eeede9]">
        <div className="max-w-[1280px] mx-auto px-4">
          <FadeIn>
            <span className="text-[#1b1b1b]/50 text-sm tracking-wider mb-6 block">
              // Sponsorship Options
            </span>
          </FadeIn>
          
          <div className="grid md:grid-cols-2 gap-8">
            <FadeIn delay={100}>
              <SponsorshipCard
                title="Newsletter Sponsorship"
                description="Feature your brand at the top of our daily newsletter, reaching 50K+ engaged readers."
                features={[
                  "Prominent header placement",
                  "Custom copy and creative",
                  "Direct link to your site",
                  "Dedicated tracking pixel"
                ]}
              />
            </FadeIn>
            
            <FadeIn delay={200}>
              <SponsorshipCard
                title="Content Sponsorship"
                description="Sponsor a deep-dive article or newsletter edition aligned with your expertise."
                features={[
                  "Full newsletter takeover",
                  "Co-branded content",
                  "Social media amplification",
                  "Performance analytics"
                ]}
              />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="py-24 bg-[#eeede9] border-t border-[#1b1b1b]/20">
        <div className="max-w-[1280px] mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1b1b1b] mb-6">
              Let's Work Together
            </h2>
            <p className="text-[#1b1b1b]/70 mb-8 max-w-lg mx-auto">
              Reach out to discuss how Thorium Valley can help you connect with the AI community.
            </p>
            <a 
              href="mailto:ads@thoriumvalley.com" 
              className="bg-[#5170ff] text-white px-8 py-4 inline-block font-medium text-lg hover:translate-y-[-2px] transition-transform"
            >
              Contact Us: ads@thoriumvalley.com
            </a>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
```

```css
/* Add to globals.css */
.globe-container {
  animation: subtle-float 6s ease-in-out infinite;
}

@keyframes subtle-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

---

## CHECKLIST: Verify Each Component Uses

- [ ] Background: `#eeede9` (or `bg-[#eeede9]`)
- [ ] Text: `#1b1b1b` (or `text-[#1b1b1b]`)
- [ ] Accent: `#5170ff` (or `bg-[#5170ff]` / `text-[#5170ff]`)
- [ ] Font: Times New Roman MT Std via `font-times` class
- [ ] Corners: 0px border-radius (sharp)
- [ ] Subscribe buttons say "Subscribe Free"
- [ ] Hover animations use `transition-transform` and `translateY(-2px)`
- [ ] Cards use `hover:scale-105` for images

