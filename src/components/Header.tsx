'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { SignInModal } from '@/components/SignInModal';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  const navLinks = [
    { href: '/newsletter', label: 'Newsletter' },
    { href: 'mailto:sponsors@thoriumvalley.com', label: 'Partnerships' },
    { href: '/about', label: 'About' },
  ];

  return (
    <>
    <header className="bg-[#ffffff] sticky top-0 z-50 border-b border-[#1b1b1b]/20">
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
                className="text-[#1b1b1b] hover:text-[#5170ff] transition-colors text-sm font-normal no-underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA Group */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSignInOpen(true)}
              className="hidden md:block text-[#1b1b1b] text-sm hover:text-[#5170ff] transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <Link
              href="#subscribe"
              className="bg-[#5170ff] text-white px-6 py-2 text-sm font-medium hover:-translate-y-[2px] transition-transform no-underline"
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
                className="block py-3 text-[#1b1b1b] hover:text-[#5170ff] no-underline"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => { setIsMenuOpen(false); setIsSignInOpen(true); }}
              className="block py-3 text-[#1b1b1b] hover:text-[#5170ff] text-left w-full"
            >
              Sign In
            </button>
          </nav>
        )}
      </div>
    </header>
    <SignInModal isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
    </>
  );
}
