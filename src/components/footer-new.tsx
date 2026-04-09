"use client"

import { SubscribeForm } from "@/components/subscribe-form"
import Image from "next/image"
import Link from "next/link"

export function FooterNew() {
    return (
        <footer className="bg-[#1b1b1b] rounded-t-[40px] relative overflow-hidden border-t-2" style={{ color: 'white', borderColor: '#5170ff' }}>


            <div className="max-w-6xl mx-auto px-6 md:px-6 py-16 md:py-16 relative z-10">
                {/* Main footer content */}
                <div className="grid md:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
                    {/* Brand section */}
                    <div className="md:col-span-2 space-y-4 sm:space-y-6">
                        <div className="flex items-center gap-1.5">
                            <Link href="/">
                                <Image src="/Transparent White Text Logo New.png" alt="Thorium Valley" width={280} height={84} className="cursor-pointer hover:opacity-80 transition-opacity" />
                            </Link>
                        </div>

                        <h2 className="font-times font-normal text-2xl sm:text-3xl lg:text-4xl mt-8" style={{ color: 'white', letterSpacing: '-0.05em' }}>
                            <em className="italic" style={{ color: '#5170ff' }}>AI</em> IS EATING THE WORLD
                        </h2>

                        <p className="text-base leading-relaxed" style={{ color: 'white' }}>
                            Daily AI news and analysis for professionals who need to stay ahead. Join thousands of readers tracking the future of artificial intelligence.
                        </p>

                        <div>
                            <SubscribeForm variant="footer" />
                        </div>

                        {/* Blue divider - mobile only */}
                        <div className="border-b-2 border-[#5170ff] mt-6 md:hidden"></div>
                    </div>

                    {/* Stay Updated column */}
                    <div className="space-y-4">
                        <span className="text-base font-bold block mb-4" style={{ color: 'white' }}>Stay Updated</span>
                        <nav className="flex flex-col gap-3">
                            <Link href="/newsletter" className="text-white hover:text-white/80 transition-colors text-base" style={{ color: 'white' }}>
                                Newsletters
                            </Link>
                            <Link href="/articles" className="text-white hover:text-white/80 transition-colors text-base" style={{ color: 'white' }}>
                                Articles
                            </Link>
                        </nav>
                    </div>

                    {/* Company column */}
                    <div className="space-y-4">
                        <span className="text-base font-bold block mb-4" style={{ color: 'white' }}>Company</span>
                        <nav className="flex flex-col gap-3">
                            <Link href="/about" className="text-white hover:text-white/80 transition-colors text-base" style={{ color: 'white' }}>
                                About
                            </Link>
                            <Link href="mailto:sponsors@thoriumvalley.com" className="text-white hover:text-white/80 transition-colors text-base" style={{ color: 'white' }}>
                                Partnerships
                            </Link>
                            <Link href="/privacy" className="text-white hover:text-white/80 transition-colors text-base" style={{ color: 'white' }}>
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="text-white hover:text-white/80 transition-colors text-base" style={{ color: 'white' }}>
                                Terms & Conditions
                            </Link>
                        </nav>
                    </div>
                </div>

                {/* Bottom section */}
                <div className="border-t-2 border-[#5170ff] pt-6 sm:pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-white text-xs sm:text-sm text-center md:text-left" style={{ color: 'white' }}>
                        © {new Date().getFullYear()} COBALT NEWS LLC · Thorium Valley. All rights reserved.
                    </p>

                    <div className="flex items-center gap-3">
                        <a
                            href="https://instagram.com/thoriumvalley"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 flex items-center justify-center border border-white/20 hover:bg-white/10 transition-colors"
                            aria-label="Instagram"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                        </a>
                        <a
                            href="https://x.com/ThoriumValley"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 flex items-center justify-center border border-white/20 hover:bg-white/10 transition-colors"
                            aria-label="X (Twitter)"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.244H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </a>

                        <a
                            href="mailto:hello@thoriumvalley.com"
                            className="w-9 h-9 flex items-center justify-center border border-white/20 hover:bg-white/10 transition-colors"
                            aria-label="Email"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
