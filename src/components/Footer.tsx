import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Linkedin, Youtube } from 'lucide-react';
import { NewsletterForm } from './NewsletterForm';

export function Footer() {
  return (
    <footer className="bg-[#1b1b1b] border-t-2 border-[#1b1b1b]">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-16">
        {/* Main Footer Grid - Logo/form on left, links on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Logo + Description + Newsletter Form */}
          <div className="lg:col-span-5">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/Transparent White Text Logo New.png"
                alt="Thorium Valley"
                width={120}
                height={36}
              />
            </Link>
            <p className="text-white text-sm mb-6">
              Daily AI news and analysis for professionals who need to stay ahead.
            </p>
            <NewsletterForm />
            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              <a
                href="https://twitter.com/thoriumvalley"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#5170ff] transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com/company/thoriumvalley"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#5170ff] transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com/@thoriumvalley"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#5170ff] transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="mailto:hello@thoriumvalley.com"
                className="text-white hover:text-[#5170ff] transition-colors"
                aria-label="Email"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden lg:block lg:col-span-3"></div>

          {/* Right: Navigation */}
          <div className="lg:col-span-2">
            <span className="text-white font-bold mb-4 text-sm block">Navigation</span>
            <nav className="flex flex-col gap-3">
              <Link href="/" className="text-white hover:text-[#5170ff] transition-colors text-sm no-underline">
                Home
              </Link>
              <Link href="/newsletter" className="text-white hover:text-[#5170ff] transition-colors text-sm no-underline">
                Newsletter
              </Link>
              <Link href="mailto:sponsors@thoriumvalley.com" className="text-white hover:text-[#5170ff] transition-colors text-sm no-underline">
                Partnerships
              </Link>
              <Link href="/about" className="text-white hover:text-[#5170ff] transition-colors text-sm no-underline">
                About
              </Link>
            </nav>
          </div>

          {/* Right: Legal */}
          <div className="lg:col-span-2">
            <span className="text-white font-bold mb-4 text-sm block">Legal</span>
            <nav className="flex flex-col gap-3">
              <Link href="/privacy" className="text-white hover:text-[#5170ff] transition-colors text-sm no-underline">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-white hover:text-[#5170ff] transition-colors text-sm no-underline">
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 mt-12 pt-8">
          <p className="text-white text-sm">
            &copy; {new Date().getFullYear()} Thorium Valley. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
