/**
 * TEMP preview page — example sponsor ad styled exactly like an edition article card.
 * Route: /ad-preview   (disposable; delete when done.)
 */

const SERIF = "'Times New Roman MT Std', 'Times New Roman', Georgia, serif";
const SANS = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif";
const ACCENT = '#5170ff';
const TEXT = '#2D2D2D';
const HEADING = '#2A2A2A';

const BODY: string[] = [
    'Every team is being asked to handle more support tickets with the same number of people. The queue grows, response times slip, and your best agents burn out answering the same questions on repeat.',
    'Zendesk AI resolves the repetitive tickets on its own, start to finish, so your team only handles the ones that genuinely need a person. It learns from your past conversations and help center, so it sounds like your brand from the very first reply.',
    'You can have it live in hours. Connect the channels you already use, keep full visibility into everything it resolves, and watch first response times fall while your team gets ahead of the backlog for the first time.',
    'The teams that adopt this first will run leaner and answer faster than everyone else. Zendesk is making that the new normal.',
];

export default function AdPreviewPage() {
    return (
        <main
            style={{
                minHeight: '100vh',
                background: '#FFFFFF',
                display: 'flex',
                justifyContent: 'center',
                padding: '40px 16px',
            }}
        >
            <div style={{ width: '100%', maxWidth: '680px' }}>
                {/* ── Sponsor ad card — mirrors the article-card markup ── */}
                <div
                    style={{
                        border: '1px solid #CDCDCD',
                        borderRadius: '10px',
                        margin: '20px 0',
                        padding: 0,
                        overflow: 'hidden',
                        background: '#FFFFFF',
                    }}
                >
                    {/* Banner image (top, full-width) */}
                    <div style={{ padding: 0, textAlign: 'center' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/thumbnails/mvf/zendesk.png"
                            alt="Zendesk"
                            width="100%"
                            style={{ display: 'block', width: '100%', height: 'auto' }}
                        />
                    </div>

                    {/* Blue category label → "TOGETHER WITH ZENDESK" */}
                    <div style={{ padding: '10px 15px 0', textAlign: 'left' }}>
                        <p style={{ fontFamily: SANS, color: ACCENT, fontSize: '16px', lineHeight: 1.5, letterSpacing: '0.04em', padding: 0, margin: 0 }}>
                            TOGETHER WITH ZENDESK
                        </p>
                    </div>

                    {/* Serif headline */}
                    <div style={{ padding: '4px 15px 0', textAlign: 'left' }}>
                        <div style={{ fontFamily: SERIF, fontSize: '30px', lineHeight: 1.2, color: HEADING, margin: 0, padding: 0, letterSpacing: '-0.05em' }}>
                            Resolve support tickets automatically with AI
                        </div>
                    </div>

                    {/* Divider */}
                    <div style={{ padding: '0 15px' }}>
                        <div style={{ borderBottom: '1px solid rgba(27,27,27,0.1)', margin: '12px 0 8px' }} />
                    </div>

                    {/* Body */}
                    <div style={{ padding: '0 15px', textAlign: 'left' }}>
                        {BODY.map((p, i) => (
                            <p key={i} style={{ fontFamily: SANS, fontSize: '16px', lineHeight: 1.5, color: TEXT, padding: '10px 0', margin: 0 }}>
                                {p}
                            </p>
                        ))}
                    </div>

                    {/* CTA */}
                    <div style={{ padding: '8px 15px 14px', textAlign: 'left' }}>
                        <a
                            href="https://thova.co/zendesk"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontFamily: SANS, fontSize: '14px', fontWeight: 600, color: ACCENT, textDecoration: 'none' }}
                        >
                            Try it here →
                        </a>
                    </div>
                </div>

                <p style={{ fontFamily: SANS, fontSize: '12px', color: 'rgba(27,27,27,0.45)', textAlign: 'center', marginTop: '4px' }}>
                    Preview · /ad-preview · sponsor ad styled as an edition article card
                </p>
            </div>
        </main>
    );
}
