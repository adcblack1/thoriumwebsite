'use client';

interface PhoneMockupProps {
    children: React.ReactNode;
    className?: string;
}

export function PhoneMockup({ children, className = '' }: PhoneMockupProps) {
    return (
        <div className={`relative inline-block ${className}`}>
            {/* iPhone 17 Pro frame — forged aluminum unibody */}
            <div style={{
                position: 'relative',
                width: '320px',
                height: '660px',
                background: 'linear-gradient(160deg, #2a2a2e 0%, #1c1c1e 40%, #2a2a2e 100%)',
                borderRadius: '52px',
                padding: '10px',
                boxShadow: `
          0 30px 80px rgba(0,0,0,0.5),
          0 0 0 0.5px rgba(255,255,255,0.1),
          inset 0 0.5px 0 rgba(255,255,255,0.08),
          inset 0 -0.5px 0 rgba(0,0,0,0.3)
        `,
            }}>
                {/* Frame edge —  aluminum highlight */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '52px',
                    background: 'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, transparent 30%, rgba(255,255,255,0.03) 100%)',
                    pointerEvents: 'none',
                }} />

                {/* Left buttons: mute switch + volume */}
                <div style={{ position: 'absolute', left: '-2px', top: '100px', width: '2.5px', height: '22px', background: 'linear-gradient(180deg, #3a3a3e, #1c1c1e)', borderRadius: '2px 0 0 2px' }} />
                <div style={{ position: 'absolute', left: '-2px', top: '150px', width: '2.5px', height: '34px', background: 'linear-gradient(180deg, #3a3a3e, #1c1c1e)', borderRadius: '2px 0 0 2px' }} />
                <div style={{ position: 'absolute', left: '-2px', top: '192px', width: '2.5px', height: '34px', background: 'linear-gradient(180deg, #3a3a3e, #1c1c1e)', borderRadius: '2px 0 0 2px' }} />

                {/* Right: power button */}
                <div style={{ position: 'absolute', right: '-2px', top: '170px', width: '2.5px', height: '50px', background: 'linear-gradient(180deg, #3a3a3e, #1c1c1e)', borderRadius: '0 2px 2px 0' }} />

                {/* Screen */}
                <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    borderRadius: '44px',
                    overflow: 'hidden',
                    background: '#000',
                }}>
                    {/* Dynamic Island */}
                    <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '100px',
                        height: '28px',
                        background: '#000',
                        borderRadius: '20px',
                        zIndex: 30,
                    }}>
                        {/* Camera dot */}
                        <div style={{
                            position: 'absolute',
                            right: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle at 35% 35%, #1a1a2e, #0a0a12)',
                            boxShadow: 'inset 0 0 2px rgba(81,112,255,0.15)',
                        }} />
                    </div>

                    {/* Status bar */}
                    <div style={{
                        position: 'absolute',
                        top: '14px',
                        left: '28px',
                        right: '28px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        zIndex: 25,
                        fontSize: '12px',
                        fontWeight: 600,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                        color: '#000',
                        letterSpacing: '0.01em',
                    }}>
                        <span>9:41</span>
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                            <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor">
                                <rect x="0" y="7.5" width="2.8" height="3.5" rx="0.7" />
                                <rect x="3.8" y="5" width="2.8" height="6" rx="0.7" />
                                <rect x="7.6" y="2.5" width="2.8" height="8.5" rx="0.7" />
                                <rect x="11.4" y="0" width="2.8" height="11" rx="0.7" />
                            </svg>
                            <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
                                <path d="M7 8a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
                                <path d="M3.5 6.5a5 5 0 017 0" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                                <path d="M1 3.5a9 9 0 0112 0" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                            </svg>
                            <svg width="24" height="11" viewBox="0 0 24 11" fill="currentColor">
                                <rect x="0" y="1" width="20" height="9" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1" />
                                <rect x="2" y="3" width="16" height="5" rx="1.5" />
                                <rect x="21" y="3.5" width="2" height="4" rx="1" opacity="0.4" />
                            </svg>
                        </div>
                    </div>

                    {/* Content area */}
                    <div style={{
                        width: '100%',
                        height: '100%',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        WebkitOverflowScrolling: 'touch',
                        paddingTop: '48px',
                        background: '#f2f2f7',
                    }} className="phone-scroll">
                        {children}
                    </div>

                    {/* Home indicator */}
                    <div style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '120px',
                        height: '4px',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '2px',
                        zIndex: 30,
                    }} />
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .phone-scroll::-webkit-scrollbar { display: none; }
        .phone-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
        </div>
    );
}
