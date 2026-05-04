'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Navigation } from '@/components/navigation';
import { FooterNew } from '@/components/footer-new';
import { SubscribeCTA } from '@/components/SubscribeCTA';
import { SubscribeForm } from '@/components/subscribe-form';
import { FadeIn } from '@/components/FadeIn';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface NewsletterItem {
  id: string;
  slug: string;
  publication?: string;
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

const PUB_TO_FILTER: Record<string, string> = {
  'Thorium Valley': 'thorium-valley',
  'The Catalyst': 'the-catalyst',
  'The Lab': 'the-lab',
};

export default function NewsletterArchivePage() {
  const [newsletters, setNewsletters] = useState<NewsletterItem[]>([]);
  const searchParams = useSearchParams();
  const [activePub, setActivePub] = useState('Thorium Valley');
  const [selected, setSelected] = useState<string[]>(['thorium-valley', 'the-catalyst', 'the-lab']);
  const starSrc = activePub === 'The Catalyst' ? '/thumbnails/catalyst-star.png' : activePub === 'The Lab' ? '/thumbnails/lab-star.png' : '/thumbnails/toc-bullet.png';

  // Read ?pub= or ?category= from URL on mount
  useEffect(() => {
    const pubParam = searchParams.get('pub');
    const categoryParam = searchParams.get('category');
    
    if (pubParam) {
      const validPubs = ['Thorium Valley', 'The Catalyst', 'The Lab'];
      const match = validPubs.find(p => p === pubParam);
      if (match) setActivePub(match);
    } else if (categoryParam) {
      const categoryMap: Record<string, string> = {
        'catalyst': 'The Catalyst',
        'the-catalyst': 'The Catalyst',
        'lab': 'The Lab',
        'the-lab': 'The Lab',
        'thorium-valley': 'Thorium Valley',
        'tv': 'Thorium Valley',
      };
      const match = categoryMap[categoryParam.toLowerCase()];
      if (match) setActivePub(match);
    }
  }, [searchParams]);

  const toggleNewsletter = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  useEffect(() => {
    const pubFilter = PUB_TO_FILTER[activePub] || 'thorium-valley';
    fetch(`/api/newsletters?limit=50&publication=${pubFilter}`)
      .then(res => res.json())
      .then(data => setNewsletters(data.data || []))
      .catch(console.error);
  }, [activePub]);

  return (
    <>
      <Navigation heroTheme="dark" scrollThreshold={100} />

      {/* White area behind the navbar */}
      <div className="bg-white h-[80px] lg:h-[155px]" />

      {/* Header – black bg */}
      <section style={{ backgroundColor: '#000000' }} className="pt-10 lg:pt-14 pb-0 -mt-px px-6">
        <div className="max-w-7xl lg:max-w-5xl mx-auto pb-8">
          <div className="rounded-2xl md:border md:border-white/10 bg-black/60 backdrop-blur-xl p-4 lg:p-10">
          <FadeIn>
            <h1
              className="font-times font-bold text-4xl lg:text-6xl uppercase text-center"
              style={{ letterSpacing: '-0.05em', lineHeight: 1.08, color: '#ffffff' }}
            >
              Newsletters
            </h1>
            <style dangerouslySetInnerHTML={{ __html: '@media(max-width:767px){.nl-subtext{font-size:20px!important;font-weight:400!important;}}' }} />
            <p className="nl-subtext font-inter mt-3 text-center leading-snug" style={{ fontSize: 'clamp(20px, 1.8vw, 24px)', fontWeight: 500, color: 'rgba(255,255,255,0.75)' }}>
              Subscribe to our newsletters to cover every base of AI.
            </p>
            <div className="mt-4 max-w-md mx-auto newsletter-cta">
              <style dangerouslySetInnerHTML={{ __html: '.newsletter-cta button[type="submit"] { background: #5170ff !important; color: #fff !important; }' }} />
              <SubscribeForm variant="hero" selectedNewsletters={selected} />
            </div>
          </FadeIn>

          <div className="mt-8">
          {/* DESKTOP: 3 across – TV center, depth on sides */}
          <div className="hidden md:flex flex-nowrap gap-4 items-stretch justify-center">
            {[
              { id: 'the-catalyst', name: 'The Catalyst', logo: '/images/catalyst-logo-dark.png', desc: 'How businesses and people are implementing AI.', freq: 'Biweekly', order: 'order-1', depth: true, logoH: 'h-20' },
              { id: 'thorium-valley', name: 'Thorium Valley', logo: '/Transparent Black Logo.png', desc: 'Our flagship daily newsletter covering everything happening in AI. News, tools, and what it means for you.', freq: 'Daily', flagship: true, order: 'order-2', depth: false, logoH: 'h-12' },
              { id: 'the-lab', name: 'The Lab', logo: '/images/lab-logo-dark.png', desc: 'Independent reviews of the AI tools your team is paying for.', freq: 'Biweekly', order: 'order-3', depth: true, logoH: 'h-20' },
            ].map((nl) => {
              const isSelected = selected.includes(nl.id);
              return (
                <button
                  key={nl.name}
                  type="button"
                  onClick={() => toggleNewsletter(nl.id)}
                  className={`flex-1 text-left rounded-xl p-5 flex flex-col transition-all duration-200 border text-[#1b1b1b] ${nl.order} ${
                    isSelected ? 'border-[#5170ff] shadow-md shadow-[#5170ff]/10' : 'border-[#1b1b1b]/15'
                  } ${nl.depth ? 'scale-[0.88]' : 'z-10'}`}
                  style={{ background: '#ffffff', color: '#1b1b1b' }}
                >
                  <div className="flex items-start justify-between mb-0">
                    {nl.flagship ? (
                      <img src={nl.logo} alt={nl.name} className={`${nl.logoH} mb-4 w-auto object-contain`} />
                    ) : (
                      <div className={`${nl.logoH} w-auto flex items-center`}>
                        <img src={nl.logo} alt={nl.name} className={`${nl.logoH} w-auto object-contain`} />
                      </div>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-inter font-medium uppercase tracking-wider flex-shrink-0 ${
                      isSelected ? 'bg-[#5170ff]/15 text-[#5170ff]' : 'bg-[#1b1b1b]/8 text-[#1b1b1b]/50'
                    }`}>
                      {nl.freq}
                    </span>
                  </div>
                  <p className="text-xs font-inter leading-relaxed flex-1 mb-3" style={{ color: '#1b1b1b' }}>
                    {nl.desc}
                  </p>
                  <div className="flex items-center gap-1.5 mt-auto">
                    <div className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-[#5170ff]' : 'border border-[#1b1b1b]/25'
                    }`}>
                      {isSelected && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-xs font-inter font-medium ${isSelected ? 'text-[#5170ff]' : 'text-[#1b1b1b]/40'}`}>
                      Selected
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* MOBILE: horizontal scroll – TV first */}
          <div className="md:hidden flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
            <style dangerouslySetInnerHTML={{ __html: '.md\\:hidden::-webkit-scrollbar { display: none; }' }} />
            {[
              { id: 'thorium-valley', name: 'Thorium Valley', logo: '/Transparent Black Logo.png', desc: 'Our flagship daily newsletter covering everything happening in AI.', freq: 'Daily', flagship: true, logoH: 'h-8' },
              { id: 'the-catalyst', name: 'The Catalyst', logo: '/images/catalyst-logo-dark.png', desc: 'How businesses and people are implementing AI.', freq: 'Biweekly', logoH: 'h-12' },
              { id: 'the-lab', name: 'The Lab', logo: '/images/lab-logo-dark.png', desc: 'Independent reviews of the AI tools your team is paying for.', freq: 'Biweekly', logoH: 'h-12' },
            ].map((nl) => {
              const isSelected = selected.includes(nl.id);
              return (
                <button
                  key={nl.name}
                  type="button"
                  onClick={() => toggleNewsletter(nl.id)}
                  className={`flex-shrink-0 w-[55%] text-left rounded-xl p-4 flex flex-col transition-all duration-200 border text-[#1b1b1b] ${
                    isSelected ? 'border-[#5170ff] shadow-md shadow-[#5170ff]/10' : 'border-[#1b1b1b]/15'
                  }`}
                  style={{ background: '#ffffff', color: '#1b1b1b' }}
                >
                  <div className={`flex items-center justify-between ${nl.flagship ? 'mb-2' : 'mb-0'}`}>
                    {nl.flagship ? (
                      <img src={nl.logo} alt={nl.name} className={`${nl.logoH} w-auto object-contain`} />
                    ) : (
                      <img src={nl.logo} alt={nl.name} className={`${nl.logoH} w-auto object-contain`} />
                    )}
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-inter font-medium uppercase tracking-wider flex-shrink-0 ${
                      isSelected ? 'bg-[#5170ff]/15 text-[#5170ff]' : 'bg-[#1b1b1b]/8 text-[#1b1b1b]/50'
                    }`}>
                      {nl.freq}
                    </span>
                  </div>
                  <p className="text-xs font-inter leading-snug flex-1 mb-2" style={{ color: '#1b1b1b' }}>
                    {nl.desc}
                  </p>
                  <div className="flex items-center gap-1 mt-auto">
                    <div className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-[#5170ff]' : 'border border-[#1b1b1b]/25'
                    }`}>
                      {isSelected && (
                        <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-[10px] font-inter font-medium ${isSelected ? 'text-[#5170ff]' : 'text-[#1b1b1b]/40'}`}>
                      Selected
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          </div>{/* end mt-8 */}
          </div>{/* end glass panel */}
        </div>{/* end max-w */}

        {/* Section break */}
        <div className="max-w-7xl lg:max-w-5xl mx-auto px-6">
          <div className="border-t border-white/20" />
        </div>

        {/* Publication filter bar */}
        <div className="sticky top-0 z-20 relative" style={{ backgroundColor: '#000000' }}>
          <div className="max-w-7xl lg:max-w-5xl mx-auto px-6 border-b border-white/20">
            <div className="flex gap-8 overflow-x-auto py-3 md:justify-center" style={{ scrollbarWidth: 'none' }}>
              {(['Thorium Valley', 'The Catalyst', 'The Lab'] as const).map(pub => (
                <button
                  key={pub}
                  onClick={() => setActivePub(pub)}
                  className="font-inter text-xs font-semibold uppercase tracking-wider pb-2 whitespace-nowrap relative group"
                  style={{ color: activePub === pub ? '#5170ff' : '#ffffff' }}
                >
                  {pub}
                  <span
                    className="absolute bottom-0 left-0 h-0.5 transition-all duration-300"
                    style={{ backgroundColor: '#5170ff', width: activePub === pub ? '100%' : '0%' }}
                  />
                  {activePub !== pub && (
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ backgroundColor: '#5170ff' }} />
                  )}
                </button>
              ))}
            </div>
          </div>
          {/* Right fade hint on mobile */}
          <div className="md:hidden absolute right-0 top-0 bottom-0 w-12 pointer-events-none" style={{ background: 'linear-gradient(to right, transparent, #000000)' }} />
        </div>
      </section>

      {/* Newsletter list */}
      <section className="bg-white pt-10 pb-16 px-6">
        <div className="max-w-7xl mx-auto">

          {/* Logo header – matches front page style */}
          <div className="border-t border-[#1b1b1b]/25 mb-4"></div>
          <div className="mb-3 flex justify-center">
            <img
              src={
                activePub === 'The Catalyst'
                  ? '/images/catalyst-logo-dark.png'
                  : activePub === 'The Lab'
                    ? '/images/lab-logo-dark.png'
                    : '/Transparent Black Logo.png'
              }
              alt={activePub}
              style={{
                height: activePub === 'Thorium Valley' ? 'clamp(65px, 8vw, 85px)' : '120px',
                width: 'auto',
                display: 'block',
              }}
            />
          </div>
          <div className="border-t border-[#1b1b1b]/25 mb-6"></div>

          {newsletters.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-inter text-[#1b1b1b]/40">No editions yet.</p>
            </div>
          ) : (
            <>


              {/* ─── DESKTOP: hero grid (1 big + 4 in 2×2) then rows of 4 ─── */}
              <div className="hidden lg:block">
                <div className="flex gap-8">
                  {/* Hero – left */}
                  <Link href={`/newsletter/${newsletters[0].slug}`} className="group block w-[48%] flex-shrink-0">
                    <article className="h-full flex flex-col">
                      <div className="relative w-full flex-1 min-h-[360px] overflow-hidden bg-[#1b1b1b]/5">
                        {newsletters[0].thumbnail_url && (
                          <Image src={newsletters[0].thumbnail_url} alt={newsletters[0].title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" priority />
                        )}
                      </div>
                      <h3 className="font-times font-bold text-[28px] leading-tight text-[#1b1b1b] group-hover:text-[#5170ff] transition-colors mt-4" style={{ letterSpacing: '-0.04em' }}>
                        {newsletters[0].title}
                      </h3>
                      {newsletters[0].toc && newsletters[0].toc.length > 1 && (
                        <div className="mt-2 space-y-1">
                          {newsletters[0].toc.slice(1, 3).map((hl, i) => (
                            <p key={i} className="font-inter text-sm font-medium text-[#1b1b1b]/70">
                              <img src={starSrc} alt="" style={{ width: '12px', height: '12px', display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> {hl}
                            </p>
                          ))}
                        </div>
                      )}
                      <time className="font-inter font-medium block text-xs mt-2" style={{ color: 'rgba(27,27,27,0.4)' }}>
                        {formatDate(newsletters[0].published_at)}
                      </time>
                    </article>
                  </Link>

                  {/* 4 smaller – right 2×2 */}
                  {newsletters.length > 1 && (
                    <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-10">
                      {newsletters.slice(1, 5).map(nl => (
                        <Link key={nl.slug} href={`/newsletter/${nl.slug}`} className="group block">
                          <article>
                            <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#1b1b1b]/5">
                              {nl.thumbnail_url && (
                                <Image src={nl.thumbnail_url} alt={nl.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                              )}
                            </div>
                            <h3 className="font-times font-bold text-lg leading-snug text-[#1b1b1b] group-hover:text-[#5170ff] transition-colors mt-3" style={{ letterSpacing: '-0.03em' }}>
                              {nl.title}
                            </h3>
                            <time className="font-inter font-medium block text-xs mt-1" style={{ color: 'rgba(27,27,27,0.4)' }}>
                              {formatDate(nl.published_at)}
                            </time>
                          </article>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Remaining – vertical list */}
                {newsletters.length > 5 && (
                  <div className="border-t border-[#1b1b1b]/25 mt-10">
                    {newsletters.slice(5).map((nl, index) => (
                      <Link key={nl.slug} href={`/newsletter/${nl.slug}`} className="group block">
                        <article className={`flex gap-8 py-8 ${index !== 0 ? 'border-t border-[#1b1b1b]/25' : ''}`}>
                          {/* Text – left */}
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h3 className="font-times font-bold text-[26px] leading-snug text-[#1b1b1b] group-hover:text-[#5170ff] transition-colors" style={{ letterSpacing: '-0.03em' }}>
                              {nl.title}
                            </h3>
                            {nl.toc && nl.toc.length > 1 && (
                              <div className="mt-2 space-y-1">
                                {nl.toc.slice(1, 3).map((hl, i) => (
                                  <p key={i} className="font-inter text-sm font-medium text-[#1b1b1b]/70">
                                    <img src={starSrc} alt="" style={{ width: '12px', height: '12px', display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> {hl}
                                  </p>
                                ))}
                              </div>
                            )}
                            <time className="font-inter font-medium block text-sm mt-2" style={{ color: 'rgba(27,27,27,0.4)' }}>
                              {formatDate(nl.published_at)}
                            </time>
                          </div>
                          {/* Thumbnail – right */}
                          <div className="w-72 aspect-video flex-shrink-0 bg-[#1b1b1b]/5 overflow-hidden relative">
                            {nl.thumbnail_url ? (
                              <Image src={nl.thumbnail_url} alt={nl.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[#1b1b1b]/10">
                                <span className="text-[#1b1b1b]/30 text-xs">Newsletter</span>
                              </div>
                            )}
                          </div>
                        </article>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* ─── MOBILE: front-page style ─── */}
              <div className="lg:hidden">
                {/* Big featured */}
                <Link href={`/newsletter/${newsletters[0].slug}`} className="group block mb-6">
                  <article>
                    <div className="aspect-video relative overflow-hidden bg-[#1b1b1b]/5 mb-4">
                      {newsletters[0].thumbnail_url && (
                        <Image src={newsletters[0].thumbnail_url} alt={newsletters[0].title} fill priority className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      )}
                    </div>
                    <h3 className="font-bold font-times leading-tight text-[#1b1b1b] group-hover:text-[#5170ff] transition-colors" style={{ fontSize: '28px' }}>
                      {newsletters[0].title}
                    </h3>
                    {newsletters[0].toc && newsletters[0].toc.length > 1 && (
                      <div className="mt-2 space-y-1">
                        {newsletters[0].toc.slice(1, 3).map((hl, i) => (
                          <p key={i} className="font-inter text-sm font-medium text-[#1b1b1b]/70">
                            <span style={{ color: '#5170ff' }}>✦</span> {hl}
                          </p>
                        ))}
                      </div>
                    )}
                    <time className="font-inter font-medium block text-xs mt-2" style={{ color: 'rgba(27,27,27,0.4)' }}>
                      {formatDate(newsletters[0].published_at)}
                    </time>
                  </article>
                </Link>

                {/* Remaining – thumbnail + title rows */}
                {newsletters.length > 1 && (
                  <>
                    <div className="border-t border-[#1b1b1b]/25 my-6" />
                    <div className="space-y-6">
                      {newsletters.slice(1).map((nl, index) => (
                        <Link key={nl.slug} href={`/newsletter/${nl.slug}`} className="group">
                          <article className={`cursor-pointer flex gap-4 pb-4 ${index !== 0 ? 'pt-4 border-t border-[#1b1b1b]/25' : ''}`}>
                            <div className="w-28 aspect-[4/3] flex-shrink-0 bg-[#1b1b1b]/5 overflow-hidden relative">
                              {nl.thumbnail_url ? (
                                <Image src={nl.thumbnail_url} alt={nl.title} fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#1b1b1b]/10">
                                  <span className="text-[#1b1b1b]/30 text-xs">Newsletter</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium font-times leading-snug text-[#1b1b1b] group-hover:text-[#5170ff] transition-colors line-clamp-3" style={{ fontSize: '20px', fontWeight: 500 }}>
                                {nl.title}
                              </h3>
                              {nl.toc && nl.toc.length > 1 && (
                                <div className="mt-1 space-y-0.5">
                                  {nl.toc.slice(1, 3).map((hl, i) => (
                                    <p key={i} className="font-inter text-xs font-medium text-[#1b1b1b]/70 line-clamp-1">
                                      <img src={starSrc} alt="" style={{ width: '12px', height: '12px', display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> {hl}
                                    </p>
                                  ))}
                                </div>
                              )}
                              <time className="font-inter font-medium block text-xs mt-1" style={{ color: 'rgba(27,27,27,0.4)' }}>
                                {formatDate(nl.published_at)}
                              </time>
                            </div>
                          </article>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      <FooterNew />
    </>
  );
}
