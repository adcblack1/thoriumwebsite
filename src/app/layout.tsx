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
  title: {
    default: 'Thorium Valley',
    template: '%s - Thorium Valley',
  },
  description: 'Daily AI news and analysis for professionals who need to stay ahead. Join thousands of readers tracking the future of artificial intelligence. Subscribe.',
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
    description: 'AI Is Eating the World. Our free, daily briefing keeps you ahead on AI.',
    siteName: 'Thorium Valley',
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
                  "description": "Daily AI news and analysis for professionals who need to stay ahead. Join thousands of readers tracking the future of artificial intelligence.",
                  "publisher": { "@type": "Organization", "name": "Thorium Valley" },
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://www.thoriumvalley.com/articles?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "Organization",
                  "name": "Thorium Valley",
                  "url": "https://www.thoriumvalley.com",
                  "logo": "https://www.thoriumvalley.com/Transparent%20White%20Text%20Logo%20New.png",
                  "description": "Thorium Valley is a daily AI news briefing service that keeps professionals ahead of the curve in artificial intelligence.",
                  "sameAs": [
                    "https://www.instagram.com/thoriumvalley"
                  ]
                },
                {
                  "@type": "SiteNavigationElement",
                  "name": "Subscribe",
                  "url": "https://www.thoriumvalley.com/subscribe",
                  "description": "Subscribe to Thorium Valley's free daily AI newsletter."
                },
                {
                  "@type": "SiteNavigationElement",
                  "name": "All Articles",
                  "url": "https://www.thoriumvalley.com/articles",
                  "description": "Read the latest AI news, analysis, and deep dives."
                },
                {
                  "@type": "SiteNavigationElement",
                  "name": "Newsletter",
                  "url": "https://www.thoriumvalley.com/newsletter",
                  "description": "Browse the Thorium Valley newsletter archive."
                },
                {
                  "@type": "SiteNavigationElement",
                  "name": "About",
                  "url": "https://www.thoriumvalley.com/about",
                  "description": "Learn about Thorium Valley and its mission."
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
              fbq('set', 'autoConfig', false, '773797471916037');
              fbq('track', 'PageView');

              // Block Meta's automatic Lead events (cs_est:true) while allowing our manual ones
              (function() {
                var _origFbq = fbq;
                fbq = function() {
                  var args = Array.prototype.slice.call(arguments);
                  // Block auto-fired Lead events (they lack our lead_score parameter)
                  if (args[0] === 'track' && args[1] === 'Lead') {
                    var params = args[2] || {};
                    if (!params.lead_score && params.lead_score !== 0) {
                      console.log('[Meta Pixel] Blocked automatic Lead event (cs_est)');
                      return;
                    }
                  }
                  return _origFbq.apply(this, args);
                };
                // Preserve all fbq properties
                for (var k in _origFbq) { if (_origFbq.hasOwnProperty(k)) fbq[k] = _origFbq[k]; }
                fbq.callMethod = _origFbq.callMethod;
                fbq.queue = _origFbq.queue;
                fbq.loaded = _origFbq.loaded;
                fbq.version = _origFbq.version;
                fbq.push = fbq;
              })();
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

