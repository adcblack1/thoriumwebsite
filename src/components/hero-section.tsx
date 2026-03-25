"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { SubscribeForm } from "@/components/subscribe-form"
import WireframeGlobe from "@/components/WireframeGlobe"

export function HeroSection() {
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > window.innerHeight * 0.8)
        }

        window.addEventListener("scroll", handleScroll, { passive: true })
        handleScroll()

        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <>
            <Navigation />

            {/* HERO SECTION - Changes from black to white based on scroll */}
            <main
                className={`relative min-h-screen lg:min-h-[97vh] flex items-center justify-center overflow-hidden pt-10 lg:pt-48 pb-10 lg:pb-24 transition-colors duration-500 ${isScrolled ? 'bg-white' : 'bg-black'
                    }`}
            >

                {/* Wireframe globe behind text */}
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 pt-10 ${isScrolled ? 'opacity-10' : 'opacity-50'}`}>
                    <WireframeGlobe desktopYOffset={20} />
                </div>

                <section id="subscribe" className="px-6 flex flex-col items-center gap-6 relative z-10">
                    <h1
                        className="font-times text-center text-balance font-bold text-5xl lg:text-7xl transition-colors duration-500"
                        style={{ color: isScrolled ? '#1b1b1b' : '#ffffff', letterSpacing: '-0.05em' }}
                    >
                        <em className="italic" style={{ color: '#5170ff' }}>AI</em> IS EATING<br />THE WORLD
                    </h1>

                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @media(max-width:1023px){.hero-subtext{font-size:20px!important;padding-left:2rem!important;padding-right:2rem!important;}}
                    `}} />
                    <p
                        className="hero-subtext text-center leading-relaxed max-w-2xl transition-colors duration-500 px-14"
                        style={{ color: isScrolled ? '#1b1b1b' : '#ffffff', fontSize: '26px', fontWeight: 400 }}
                    >
                        Get our free, daily newsletter that keeps you ahead in AI.
                    </p>

                    <div className="w-full max-w-sm lg:max-w-md">
                        <SubscribeForm variant="hero" />
                    </div>

                    <p
                        className="text-xs transition-colors duration-500 -mt-4"
                        style={{ color: isScrolled ? 'rgba(27,27,27,0.5)' : 'rgba(255,255,255,0.6)' }}
                    >
                        Free forever. Unsubscribe anytime. Thorium Valley.
                    </p>
                </section>
            </main>
        </>
    )
}
