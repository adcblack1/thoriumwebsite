'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Navigation } from '@/components/navigation';
import { FooterNew } from '@/components/footer-new';
import { SubscribeCTA } from '@/components/SubscribeCTA';
import { SubscribeForm } from '@/components/subscribe-form';
import { FadeIn } from '@/components/FadeIn';
import { useState, useEffect } from 'react';

interface NewsletterItem {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  thumbnail_url?: string;
  published_at: string;
  toc: string[];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function NewsletterArchivePage() {
  const [newsletters, setNewsletters] = useState<NewsletterItem[]>([]);

  useEffect(() => {
    fetch('/api/newsletters?limit=50')
      .then(res => res.json())
      .then(data => setNewsletters(data.data || []))
      .catch(console.error);
  }, []);

  return (
    <>
      <Navigation heroTheme="dark" scrollThreshold={100} />

      {/* White area behind the navbar */}
      <div className="bg-white h-[80px] lg:h-[155px]" />

      {/* Header – blue bg matching /articles */}
      <section style={{ backgroundColor: '#5170ff' }} className="pt-10 lg:pt-14 pb-8 -mt-px px-6">
        <div className="max-w-7xl lg:max-w-5xl mx-auto">
          <FadeIn>
            <h1
              className="font-times font-bold text-4xl lg:text-6xl uppercase"
              style={{ letterSpacing: '-0.05em', lineHeight: 1.08, color: '#ffffff' }}
            >
              Newsletter Editions
            </h1>
            <p className="font-inter mt-3 text-sm lg:text-base" style={{ color: 'rgba(255,255,255,0.75)' }}>
              AI is eating the world. Stay ahead with our free daily newsletter.
            </p>
            <div className="mt-4 max-w-md">
              <SubscribeForm variant="hero" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Newsletter list */}
      <section className="bg-white py-10 px-6">
        <div className="max-w-7xl lg:max-w-5xl mx-auto newsletter-list">
          {newsletters.map((newsletter, index) => (
            <article key={newsletter.id} className={`flex gap-5 pb-6 ${index !== 0 ? 'pt-6 border-t border-[#1b1b1b]/25' : ''}`}>
              {/* Thumbnail */}
              <Link href={`/newsletter/${newsletter.slug}`} className="group w-20 lg:w-56 aspect-square lg:aspect-video flex-shrink-0 self-start bg-[#1b1b1b]/5 overflow-hidden relative block">
                {newsletter.thumbnail_url ? (
                  <Image
                    src={newsletter.thumbnail_url}
                    alt={newsletter.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#1b1b1b]/10">
                    <span className="text-[#1b1b1b]/30 text-xs">Newsletter</span>
                  </div>
                )}
              </Link>

              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <Link href={`/newsletter/${newsletter.slug}`} className="nl-title-link">
                  <h3
                    className="font-bold font-times leading-snug text-[#1b1b1b] line-clamp-2 text-sm transition-colors"
                    style={{ letterSpacing: '-0.03em' }}
                  >
                    {newsletter.title}
                  </h3>
                </Link>
                {/* + headlines (toc) */}
                {newsletter.toc && newsletter.toc.length > 1 && (
                  <div className="mt-1.5 lg:mt-2 space-y-0.5">
                    {newsletter.toc.slice(1, 3).map((hl, i) => (
                      <Link key={i} href={`/newsletter/${newsletter.slug}#article-${i + 2}`} className="nl-hl-link block">
                        <p className="font-inter text-[10px] lg:text-sm font-medium line-clamp-1 text-[#1b1b1b] transition-colors">
                          <span style={{ color: '#5170ff' }}>+</span> {hl}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
                <time className="font-inter font-medium block text-[10px] lg:text-sm mt-1 lg:mt-2" style={{ color: 'rgba(27,27,27,0.4)' }}>
                  {formatDate(newsletter.published_at)}
                </time>
              </div>
            </article>
          ))}

          {/* Desktop font size + independent hover */}
          <style dangerouslySetInnerHTML={{
            __html: `
            @media(min-width:1024px){.newsletter-list h3{font-size:26px!important}}
            .nl-title-link:hover h3{color:#5170ff!important}
            .nl-hl-link:hover p{color:#5170ff!important}
            .nl-hl-link:hover p span{color:#5170ff!important}
          `}} />

          {newsletters.length === 0 && (
            <div className="py-20 text-center">
              <p className="font-inter text-[#1b1b1b]/40">No newsletters yet.</p>
            </div>
          )}
        </div>
      </section>

      <FooterNew />
    </>
  );
}
