import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import Script from 'next/script';
import { AuthSyncHandler } from '@/components/AuthSyncHandler';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Thorium Valley',
  description: 'Daily AI briefings for professionals. No hype, just signal.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Thorium Valley',
    description: 'AI Is Eating the World',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="application-name" content="Thorium Valley" />
        <meta name="facebook-domain-verification" content="rcst4sqe4kdlxa0er8s8as83nsy6sk" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "name": "Thorium Valley",
                  "url": "https://www.thoriumvalley.com",
                  "description": "Thorium Valley is a free daily AI newsletter that delivers curated news briefings for professionals. No hype, just signal.",
                  "publisher": { "@type": "Organization", "name": "Thorium Valley" }
                },
                {
                  "@type": "Organization",
                  "name": "Thorium Valley",
                  "url": "https://www.thoriumvalley.com",
                  "logo": "https://www.thoriumvalley.com/Transparent%20White%20Text%20Logo%20New.png",
                  "description": "Thorium Valley is a daily AI news briefing service that keeps professionals ahead of the curve in artificial intelligence.",
                  "sameAs": []
                },
                {
                  "@type": "WebApplication",
                  "name": "Thorium Valley",
                  "url": "https://www.thoriumvalley.com",
                  "applicationCategory": "NewsApplication",
                  "description": "Thorium Valley delivers free daily AI news briefings. Subscribe to stay ahead in artificial intelligence with curated articles, market analysis, and governance coverage.",
                  "operatingSystem": "All",
                  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
                }
              ]
            })
          }}
        />
        <Script
          id="fb-pixel-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '773797471916037');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=773797471916037&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </head>
      <body className="bg-[#ffffff] text-[#1b1b1b] antialiased">
        <Suspense fallback={null}>
          <AuthSyncHandler />
          {children}
        </Suspense>
      </body>
    </html>
  );
}

