"use client"

import { useEffect, useState, useRef } from "react"

export function AsciiHero() {
    const [svgContent, setSvgContent] = useState<string>("")
    const [mounted, setMounted] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        const loadSVG = async () => {
            try {
                const response = await fetch("/map-dark.svg?v=2")
                const svgText = await response.text()
                setSvgContent(svgText)
            } catch (error) {
                console.error("Failed to load SVG:", error)
            }
        }

        if (mounted) {
            loadSVG()
        }
    }, [mounted])

    return (
        <section className="pt-36 lg:pt-44" style={{ backgroundColor: '#1b1b1b' }}>
            {/* CSS animation applied to ALL rects immediately — no JS delay */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes glimmer {
                    0% { opacity: 1; }
                    100% { opacity: 0.1; }
                }
                #map-svg svg {
                    width: 100%;
                    height: 100%;
                }
                #map-svg rect {
                    animation: glimmer var(--d, 1.2s) ease-in-out var(--del, 0s) infinite alternate;
                }
                /* Stagger via nth-child groups for natural randomness */
                #map-svg rect:nth-child(5n+1) { --d: 0.8s; --del: 0.1s; }
                #map-svg rect:nth-child(5n+2) { --d: 1.4s; --del: 0.5s; }
                #map-svg rect:nth-child(5n+3) { --d: 1.0s; --del: 0.3s; }
                #map-svg rect:nth-child(5n+4) { --d: 1.8s; --del: 0.7s; }
                #map-svg rect:nth-child(5n+5) { --d: 1.2s; --del: 0.9s; }
                #map-svg rect:nth-child(7n+1) { --d: 1.6s; --del: 0.2s; }
                #map-svg rect:nth-child(7n+3) { --d: 0.9s; --del: 0.6s; }
                #map-svg rect:nth-child(7n+5) { --d: 1.3s; --del: 0.4s; }
                #map-svg rect:nth-child(11n+1) { --d: 0.7s; --del: 0.8s; }
                #map-svg rect:nth-child(11n+4) { --d: 1.5s; --del: 0.15s; }
                #map-svg rect:nth-child(11n+7) { --d: 1.1s; --del: 0.55s; }
                #map-svg rect:nth-child(11n+9) { --d: 1.7s; --del: 0.35s; }
                #map-svg rect:nth-child(13n+2) { --d: 0.6s; --del: 0.45s; }
                #map-svg rect:nth-child(13n+6) { --d: 1.9s; --del: 0.25s; }
                #map-svg rect:nth-child(13n+10) { --d: 1.05s; --del: 0.75s; }
            `}} />
            <div className="max-w-[1100px] mx-auto">
                <div
                    className="relative w-full aspect-[16/9] overflow-hidden"
                    style={{ backgroundColor: "#1b1b1b" }}
                >
                    {mounted && svgContent ? (
                        <div
                            ref={containerRef}
                            id="map-svg"
                            className="absolute inset-0 flex items-center justify-center"
                            dangerouslySetInnerHTML={{ __html: svgContent }}
                        />
                    ) : (
                        <div className="absolute inset-0 bg-[#1b1b1b]" />
                    )}
                </div>
            </div>
        </section>
    )
}
