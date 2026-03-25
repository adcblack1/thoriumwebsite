"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"
import precomputedDots from "./globe-dots.json"

interface WireframeGlobeProps {
    className?: string
    mobileYOffset?: number
    desktopYOffset?: number
}

export default function WireframeGlobe({ className = "", mobileYOffset = -20, desktopYOffset = 0 }: WireframeGlobeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return

        const canvas = canvasRef.current
        const container = containerRef.current
        const context = canvas.getContext("2d")
        if (!context) return

        const resize = () => {
            const rect = container.getBoundingClientRect()
            const w = rect.width
            const h = rect.height
            const dpr = window.devicePixelRatio || 1
            canvas.width = w * dpr
            canvas.height = h * dpr
            canvas.style.width = `${w}px`
            canvas.style.height = `${h}px`
            context.scale(dpr, dpr)
            return { w, h }
        }

        let { w, h } = resize()
        const isMobile = w < 768
        const radius = Math.min(w, h) / (isMobile ? 1.8 : 2.5)

        const projection = d3
            .geoOrthographic()
            .scale(radius)
            .translate([w / 2, isMobile ? h / 2 + mobileYOffset : h / 2 + desktopYOffset])
            .clipAngle(90)

        const path = d3.geoPath().projection(projection).context(context)

        // Pre-loaded dots — no fetch needed
        const allDots = precomputedDots as [number, number][]

        const render = () => {
            context.clearRect(0, 0, w, h)
            const currentScale = projection.scale()
            const scaleFactor = currentScale / radius
            const center = projection.translate()

            // Globe circle
            context.beginPath()
            context.arc(center[0], center[1], currentScale, 0, 2 * Math.PI)
            context.fillStyle = "rgba(0,0,0,0.3)"
            context.fill()
            context.strokeStyle = "rgba(255,255,255,0.2)"
            context.lineWidth = 1.5 * scaleFactor
            context.stroke()

            // Graticule
            const graticule = d3.geoGraticule()
            context.beginPath()
            path(graticule())
            context.strokeStyle = "rgba(255,255,255,0.06)"
            context.lineWidth = 0.5 * scaleFactor
            context.stroke()

            // Halftone dots (pre-computed, instant)
            allDots.forEach((dot) => {
                const projected = projection(dot)
                if (projected && projected[0] >= 0 && projected[0] <= w && projected[1] >= 0 && projected[1] <= h) {
                    context.beginPath()
                    context.arc(projected[0], projected[1], 1.6 * scaleFactor, 0, 2 * Math.PI)
                    context.fillStyle = "rgba(255,255,255,0.5)"
                    context.fill()
                }
            })
        }

        // Auto-rotation — starts immediately
        const rotation: [number, number] = [0, -15]
        const rotationSpeed = isMobile ? 0.12 : 0.17

        const rotationTimer = d3.timer(() => {
            rotation[0] += rotationSpeed
            projection.rotate(rotation)
            render()
        })

        const handleResize = () => {
            const dims = resize()
            w = dims.w
            h = dims.h
            const nowMobile = w < 768
            projection.translate([w / 2, nowMobile ? h / 2 + mobileYOffset : h / 2 + desktopYOffset])
            projection.scale(Math.min(w, h) / (nowMobile ? 1.8 : 2.5))
            render()
        }
        window.addEventListener("resize", handleResize)

        return () => {
            rotationTimer.stop()
            window.removeEventListener("resize", handleResize)
        }
    }, [])

    return (
        <div ref={containerRef} className={`w-full h-full ${className}`}>
            <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ display: 'block' }}
            />
        </div>
    )
}
