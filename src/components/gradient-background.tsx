"use client"

export function GradientBackground() {
    return (
        <div className="absolute inset-0 -z-10 overflow-hidden bg-[#0a0a0f]">
            {/* Dot Grid Pattern */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    backgroundImage: `radial-gradient(circle, rgba(81, 112, 255, 0.15) 1px, transparent 1px)`,
                    backgroundSize: '24px 24px',
                }}
            />

            {/* Top-left corner glow - blue */}
            <div
                className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] opacity-70"
                style={{
                    background: 'radial-gradient(circle, rgba(81, 112, 255, 0.7) 0%, rgba(81, 112, 255, 0.25) 40%, transparent 70%)',
                    filter: 'blur(80px)',
                }}
            />

            {/* Top-right corner glow - purple/indigo */}
            <div
                className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] opacity-50"
                style={{
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.7) 0%, rgba(139, 92, 246, 0.25) 40%, transparent 70%)',
                    filter: 'blur(100px)',
                }}
            />

            {/* Bottom corners subtle glow */}
            <div
                className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] opacity-20"
                style={{
                    background: 'radial-gradient(circle, rgba(81, 112, 255, 0.4) 0%, transparent 60%)',
                    filter: 'blur(60px)',
                }}
            />

            <div
                className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] opacity-20"
                style={{
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 60%)',
                    filter: 'blur(60px)',
                }}
            />

            {/* Vignette overlay */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 0%, rgba(10, 10, 15, 0.4) 100%)',
                }}
            />

            {/* Subtle noise texture */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />
        </div>
    )
}
