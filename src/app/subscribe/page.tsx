'use client';

import { SubscribeForm } from '@/components/subscribe-form';
import Image from 'next/image';
import Link from 'next/link';
import WireframeGlobe from '@/components/WireframeGlobe';


export default function SubscribePage() {
    return (
        <main className="relative min-h-screen flex flex-col bg-black">

            {/* Wireframe globe behind text */}
            <div className="absolute inset-0 flex items-center justify-center opacity-50">
                <WireframeGlobe mobileYOffset={-130} desktopYOffset={-60} />
            </div>

            {/* Logo above globe - mobile only */}
            <div className="absolute top-28 left-1/2 -translate-x-1/2 z-10 lg:hidden">
                <Image
                    src="/Transparent White Logo.png"
                    alt="Thorium Valley"
                    width={45}
                    height={45}
                    priority
                />
            </div>


            {/* Main content area */}
            <div className="flex-1 flex items-center justify-center px-6 relative z-10 pt-10">
                <section className="flex flex-col items-center gap-4 lg:gap-6 mt-36 lg:mt-0">
                    {/* Desktop logo inline */}
                    <Image
                        src="/Transparent White Logo.png"
                        alt="Thorium Valley"
                        width={55}
                        height={55}
                        className="hidden lg:block mb-2"
                        priority
                    />
                    <h1
                        className="font-times text-center font-bold text-3xl lg:text-7xl"
                        style={{ color: '#ffffff', letterSpacing: '-0.05em' }}
                    >
                        <em className="italic" style={{ color: '#5170ff' }}>AI</em> IS EATING<br />THE WORLD
                    </h1>

                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @media(max-width:1023px){.subscribe-subtext{font-size:20px!important;font-weight:400!important;padding-left:2rem!important;padding-right:2rem!important;}}
                        @media(min-width:1024px){.subscribe-subtext{font-size:26px!important;font-weight:400!important;line-height:1.625!important;padding-left:3.5rem!important;padding-right:3.5rem!important;}}
                    `}} />
                    <p
                        className="subscribe-subtext text-center leading-relaxed max-w-2xl px-8 text-[20px]"
                        style={{ color: '#ffffff', fontWeight: 400 }}
                    >
                        Get our free, daily newsletter that keeps you ahead in AI.
                    </p>

                    <div className="w-full max-w-sm lg:max-w-md">
                        <SubscribeForm variant="hero" redirectOnSuccess />
                    </div>

                    <p
                        className="text-xs -mt-4"
                        style={{ color: 'rgba(255,255,255,0.6)' }}
                    >
                        Free forever. Unsubscribe anytime.
                    </p>
                </section>
            </div>

            {/* iPhone mockup at bottom with legal links */}
            <div className="relative z-10">
                {/* Desktop: links flanking phone */}
                <div className="hidden lg:flex items-end justify-center gap-8">
                    <Link
                        href="/privacy"
                        className="text-xs mb-8 hover:text-white/80 transition-colors"
                        style={{ color: 'rgba(255,255,255,0.35)' }}
                    >
                        Privacy Policy
                    </Link>
                    <div className="h-[380px] overflow-hidden">
                        <Image
                            src="/iphone-mockup.png"
                            alt="Thorium Valley newsletter on iPhone"
                            width={300}
                            height={600}
                            className="w-[300px]"
                            style={{ objectFit: 'contain' }}
                            priority
                        />
                    </div>
                    <Link
                        href="/terms"
                        className="text-xs mb-8 hover:text-white/80 transition-colors"
                        style={{ color: 'rgba(255,255,255,0.35)' }}
                    >
                        Terms of Service
                    </Link>
                </div>
                {/* Mobile: phone centered, links at edges */}
                <div className="lg:hidden mt-6">
                    <div className="flex justify-center">
                        <div className="h-[380px] overflow-hidden">
                            <Image
                                src="/iphone-mockup.png"
                                alt="Thorium Valley newsletter on iPhone"
                                width={300}
                                height={600}
                                className="w-[220px]"
                                style={{ objectFit: 'contain' }}
                                priority
                            />
                        </div>
                    </div>
                    <div className="flex justify-between w-full px-4 mt-4 pb-4">
                        <Link href="/privacy" className="text-xs hover:text-white/80 transition-colors" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="text-xs hover:text-white/80 transition-colors" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>


        </main>
    );
}
