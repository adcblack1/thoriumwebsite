'use client';

import { useState } from 'react';

export function CopyBeehiivButton({ slug, type = 'newsletter' }: { slug: string; type?: 'newsletter' | 'article' }) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'copied' | 'error'>('idle');

    const handleCopy = async () => {
        setStatus('loading');
        try {
            const param = type === 'newsletter' ? `slug=${slug}` : `article=${slug}`;
            const res = await fetch(`/api/beehiiv-export?${param}`);
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            await navigator.clipboard.writeText(data.html);
            setStatus('copied');
            setTimeout(() => setStatus('idle'), 2500);
        } catch (err) {
            console.error('Copy failed:', err);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    const labels = {
        idle: '📋 Copy Beehiiv HTML',
        loading: '⏳ Generating…',
        copied: '✅ Copied!',
        error: '❌ Failed',
    };

    return (
        <button
            onClick={handleCopy}
            disabled={status === 'loading'}
            style={{
                fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",
                fontSize: '13px',
                fontWeight: 600,
                color: status === 'copied' ? '#16a34a' : status === 'error' ? '#dc2626' : '#5170ff',
                background: 'transparent',
                border: `1px solid ${status === 'copied' ? '#16a34a' : status === 'error' ? '#dc2626' : '#5170ff'}`,
                borderRadius: '6px',
                padding: '6px 14px',
                cursor: status === 'loading' ? 'wait' : 'pointer',
                transition: 'all 0.2s',
                opacity: status === 'loading' ? 0.6 : 1,
            }}
        >
            {labels[status]}
        </button>
    );
}
