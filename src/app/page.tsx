import React from 'react';
import { getNewsletters } from '@/lib/newsletters';
import { getArticles, getArticleBySlug, getCategorySections } from '@/lib/articles';
import { HeroSection } from '@/components/hero-section';
import { FooterNew } from '@/components/footer-new';
import Image from 'next/image';
import Link from 'next/link';

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function ThumbnailOverlay() {
  return (
    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 z-10" />
  );
}

export default async function HomePage() {
  // ── TOP SECTION: Newsletters ──
  const { data: newsletters } = getNewsletters({ limit: 8, sort: 'newest' });

  // Build newsletter display items using article headlines
  const newsletterItems = newsletters.map(nl => {
    // Resolve each article slug to get titles + thumbnail
    const resolvedArticles = nl.article_slugs
      .map(s => getArticleBySlug(s))
      .filter(Boolean);

    const firstArticle = resolvedArticles[0];
    return {
      id: nl.id,
      slug: nl.slug,
      title: firstArticle?.title || nl.title,
      headlines: nl.toc,
      thumbnail_url: firstArticle?.thumbnail_url || '',
      linkPrefix: '/newsletter',
      category: 'Newsletter',
      published_at: nl.published_at || '',
    };
  });

  const featuredNL = newsletterItems[0];
  const recentNL = newsletterItems.slice(1, 8);

  // ── BOTTOM SECTION: Articles ──
  const { data: articles } = getArticles({ limit: 8, sort: 'newest' });
  const articleItems = articles.map(a => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    subtitle: a.subtitle,
    thumbnail_url: a.thumbnail_url,
    category: a.category,
    linkPrefix: '/articles',
    published_at: a.published_at || '',
  }));

  const featuredArticle = articleItems[0];
  const recentArticles = articleItems.slice(1, 8);

  // ── CATEGORY SECTIONS ──
  const categorySections = getCategorySections(10);

  return (
    <div>
      <HeroSection />

      {/* ═══════════════════════════════════════════════════ */}
      {/* NEWSLETTERS SECTION – Original 3-column layout    */}
      {/* ═══════════════════════════════════════════════════ */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .hp-nl-title:hover h3{color:#5170ff!important}
        .hp-nl-hl:hover p{color:#5170ff!important}
        .hp-nl-hl:hover p span{color:#5170ff!important}
      `}} />
      <section className="relative bg-white rounded-t-[48px] -mt-12 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-3 pt-24 pb-20">

          {/* TV Editions Header Image */}
          <div className="border-t border-[#1b1b1b]/25 mb-8"></div>
          <div className="mb-6 flex justify-center">
            <img
              src="/tv-editions-header.png"
              alt="TV Editions"
              style={{ height: '45px', width: 'auto', display: 'block' }}
            />
          </div>
          <div className="border-t border-[#1b1b1b]/25 mb-10"></div>

          {featuredNL ? (
            <>
              {/* DESKTOP LAYOUT - 3 columns: left list | featured center | 2 right */}
              <div className="hidden md:grid md:grid-cols-[280px_1fr_280px] gap-10">
                {/* LEFT column: small newsletter items stacked vertically */}
                <div className="flex flex-col gap-4 border-r border-[#1b1b1b]/25 pr-6">
                  {recentNL.slice(2, 7).map((item, index) => (
                    <Link key={item.id} href={`${item.linkPrefix}/${item.slug}`} className="group">
                      <article className={`cursor-pointer flex gap-3 ${index !== 0 ? "pt-3 border-t border-[#1b1b1b]/25" : ""} ${index !== 4 ? "pb-3" : ""}`}>
                        <div className="w-28 aspect-[4/3] flex-shrink-0 bg-[#1b1b1b]/5 overflow-hidden relative">
                          {item.thumbnail_url ? (
                            <Image
                              src={item.thumbnail_url}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#1b1b1b]/10">
                              <span className="text-[#1b1b1b]/30 text-xs">Art</span>
                            </div>
                          )}
                        </div>
                        <h3 className="font-bold font-times leading-snug text-[#1b1b1b] group-hover:text-accent transition-colors line-clamp-3" style={{ fontSize: '20px' }}>
                          {item.title}
                        </h3>

                      </article>
                    </Link>
                  ))}
                </div>

                {/* MIDDLE: Featured Newsletter */}
                <article className="cursor-pointer h-full border-r border-[#1b1b1b]/25 pr-8">
                  <Link href={`${featuredNL.linkPrefix}/${featuredNL.slug}`} className="group block">
                    <div className="aspect-[4/3] relative overflow-hidden bg-[#1b1b1b]/5 mb-5">
                      {featuredNL.thumbnail_url ? (
                        <Image
                          src={featuredNL.thumbnail_url}
                          alt={featuredNL.title}
                          fill
                          priority
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#1b1b1b]/10">
                          <span className="text-[#1b1b1b]/30">Featured Newsletter</span>
                        </div>
                      )}
                      <ThumbnailOverlay />
                    </div>
                  </Link>

                  <div className="space-y-3">
                    {/* First article headline as main title */}
                    <Link href={`${featuredNL.linkPrefix}/${featuredNL.slug}`} className="hp-nl-title block">
                      <h3 className="font-bold font-times leading-tight text-[#1b1b1b] transition-colors" style={{ fontSize: '36px' }}>
                        {featuredNL.title}
                      </h3>
                    </Link>

                    {/* +2nd and +3rd headlines below */}
                    {featuredNL.headlines.length > 1 && (
                      <div className="space-y-1">
                        {featuredNL.headlines.slice(1).map((hl, i) => (
                          <Link key={i} href={`${featuredNL.linkPrefix}/${featuredNL.slug}#article-${i + 2}`} className="hp-nl-hl block">
                            <p className="text-[#1b1b1b]/60 text-base font-inter font-medium leading-snug transition-colors">
                              <span className="text-[#5170ff] font-medium">✦</span> {hl}
                            </p>
                          </Link>
                        ))}
                      </div>
                    )}

                  </div>
                </article>

                {/* RIGHT column: 2 stacked newsletters */}
                <div className="flex flex-col">
                  {recentNL.slice(0, 2).map((item, index) => (
                    <Link key={item.id} href={`${item.linkPrefix}/${item.slug}`} className="group">
                      <article className={`cursor-pointer flex-1 ${index !== 0 ? "pt-4 border-t border-[#1b1b1b]/25" : ""}`}>
                        <div className="aspect-video relative overflow-hidden bg-[#1b1b1b]/5 mb-3">
                          {item.thumbnail_url ? (
                            <Image
                              src={item.thumbnail_url}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#1b1b1b]/10">
                              <span className="text-[#1b1b1b]/30 text-xs">Newsletter</span>
                            </div>
                          )}
                          <ThumbnailOverlay />
                        </div>
                        <h3 className="font-bold font-times leading-snug text-[#1b1b1b] group-hover:text-accent transition-colors pb-4" style={{ fontSize: '26px' }}>
                          {item.title}
                        </h3>

                      </article>
                    </Link>
                  ))}
                </div>
              </div>

              {/* MOBILE LAYOUT */}
              <div className="md:hidden">
                {/* Section Header */}


                {/* Featured Newsletter */}
                <article className="cursor-pointer mb-6">
                  <Link href={`${featuredNL.linkPrefix}/${featuredNL.slug}`} className="group block">
                    <div className="aspect-video relative overflow-hidden bg-[#1b1b1b]/5 mb-4">
                      {featuredNL.thumbnail_url ? (
                        <Image
                          src={featuredNL.thumbnail_url}
                          alt={featuredNL.title}
                          fill
                          priority
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#1b1b1b]/10">
                          <span className="text-[#1b1b1b]/30">Featured Newsletter</span>
                        </div>
                      )}
                      <ThumbnailOverlay />
                    </div>
                  </Link>
                  <Link href={`${featuredNL.linkPrefix}/${featuredNL.slug}`} className="hp-nl-title block">
                    <h3 className="font-bold font-times leading-tight text-[#1b1b1b] transition-colors" style={{ fontSize: '28px' }}>
                      {featuredNL.title}
                    </h3>
                  </Link>
                  {featuredNL.headlines.length > 1 && (
                    <div className="mt-2 space-y-1">
                      {featuredNL.headlines.slice(1).map((hl, i) => (
                        <Link key={i} href={`${featuredNL.linkPrefix}/${featuredNL.slug}#article-${i + 2}`} className="hp-nl-hl block">
                          <p className="text-[#1b1b1b]/60 text-sm font-inter font-medium transition-colors">
                            <span className="text-[#5170ff] font-medium">✦</span> {hl}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}

                </article>

                {/* Divider */}
                <div className="border-t border-[#1b1b1b]/25 my-6"></div>

                {/* 2nd and 3rd newsletters — side by side */}
                <div className="grid grid-cols-[1fr_1px_1fr] gap-4">
                  {recentNL.slice(0, 2).map((item, idx) => (
                    <React.Fragment key={item.id}>
                      {idx === 1 && <div className="bg-[#1b1b1b]/15" />}
                      <article className="cursor-pointer">
                        <Link href={`${item.linkPrefix}/${item.slug}`} className="group block">
                          <div className="relative overflow-hidden bg-[#1b1b1b]/5 mb-3" style={{ aspectRatio: '4/3' }}>
                            {item.thumbnail_url ? (
                              <Image
                                src={item.thumbnail_url}
                                alt={item.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[#1b1b1b]/10">
                                <span className="text-[#1b1b1b]/30 text-xs">Newsletter</span>
                              </div>
                            )}
                            <ThumbnailOverlay />
                          </div>
                        </Link>
                        <Link href={`${item.linkPrefix}/${item.slug}`} className="hp-nl-title block">
                          <h3 className="font-bold font-times leading-tight text-[#1b1b1b] transition-colors" style={{ fontSize: '20px' }}>
                            {item.title}
                          </h3>
                        </Link>
                      </article>
                    </React.Fragment>
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t border-[#1b1b1b]/25 my-6"></div>

                {/* Remaining newsletters - thumbnail left, title right */}
                <div className="space-y-6">
                  {recentNL.slice(2, 7).map((item, index) => (
                    <Link key={item.id} href={`${item.linkPrefix}/${item.slug}`} className="group">
                      <article className={`cursor-pointer flex gap-4 pb-4 ${index !== 0 ? "pt-4 border-t border-[#1b1b1b]/25" : ""}`}>
                        <div className="w-20 aspect-square flex-shrink-0 bg-[#1b1b1b]/5 overflow-hidden relative">
                          {item.thumbnail_url ? (
                            <Image
                              src={item.thumbnail_url}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#1b1b1b]/10">
                              <span className="text-[#1b1b1b]/30 text-xs">Newsletter</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold font-times text-sm leading-snug text-[#1b1b1b] group-hover:text-accent transition-colors line-clamp-3">
                            {item.title}
                          </h3>

                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[#1b1b1b]/25 my-4"></div>

              <div className="text-center">
                <Link
                  href="/newsletter"
                  className="inline-flex items-center gap-2 transition-colors font-semibold font-inter uppercase"
                  style={{ color: '#1b1b1b' }}
                >
                  View all editions
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-[#1b1b1b]/50 text-lg font-inter">No newsletters yet</p>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* PUBLICATIONS SECTION – Catalyst, Lab, Operator     */}
      {/* ═══════════════════════════════════════════════════ */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-3 pt-8 pb-20">
          <div className="border-t border-[#1b1b1b]/25 mb-8"></div>
          <h2 className="font-times mb-2 uppercase text-center italic" style={{ letterSpacing: '-0.07em', color: '#1b1b1b', fontWeight: 900, fontStyle: 'italic', fontSize: 'clamp(30px, 4vw, 45px)' }}>
            <span style={{ color: '#5170ff' }}>Our</span> Publications
          </h2>
          <p className="text-center text-[#1b1b1b]/50 text-sm font-inter mb-8">Cover all bases of AI</p>
          <div className="border-t border-[#1b1b1b]/25 mb-10"></div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* The Catalyst */}
            <Link href="/subscribe" className="group block">
              <div className="rounded-2xl bg-[#1b1b1b] p-6 h-full flex flex-col transition-transform duration-300 group-hover:scale-[1.02]">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src="/images/catalyst-logo.png"
                    alt="The Catalyst"
                    className="h-10 w-auto object-contain"
                    style={{ mixBlendMode: 'screen' }}
                  />
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60 font-inter font-medium uppercase tracking-wider">
                    Biweekly
                  </span>
                </div>
                <p className="text-white/80 text-sm font-inter leading-relaxed flex-1">
                  How businesses and people are implementing AI — and how to do it yourself.
                </p>
                <div className="mt-5 flex items-center gap-2 text-[#5170ff] text-xs font-inter font-semibold group-hover:gap-3 transition-all">
                  Subscribe
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            </Link>

            {/* The Lab */}
            <Link href="/subscribe" className="group block">
              <div className="rounded-2xl bg-[#1b1b1b] p-6 h-full flex flex-col transition-transform duration-300 group-hover:scale-[1.02]">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src="/images/lab-logo.png"
                    alt="The Lab"
                    className="h-10 w-auto object-contain"
                    style={{ mixBlendMode: 'screen' }}
                  />
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60 font-inter font-medium uppercase tracking-wider">
                    Biweekly
                  </span>
                </div>
                <p className="text-white/80 text-sm font-inter leading-relaxed flex-1">
                  Interesting and useful AI tools — and whether they&apos;re worth trying out.
                </p>
                <div className="mt-5 flex items-center gap-2 text-[#5170ff] text-xs font-inter font-semibold group-hover:gap-3 transition-all">
                  Subscribe
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            </Link>

            {/* The Operator */}
            <Link href="/subscribe" className="group block">
              <div className="rounded-2xl bg-[#1b1b1b] p-6 h-full flex flex-col transition-transform duration-300 group-hover:scale-[1.02]">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src="/images/operator-logo.png"
                    alt="The Operator"
                    className="h-10 w-auto object-contain"
                    style={{ mixBlendMode: 'screen' }}
                  />
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60 font-inter font-medium uppercase tracking-wider">
                    Biweekly
                  </span>
                </div>
                <p className="text-white/80 text-sm font-inter leading-relaxed flex-1">
                  Showcasing what people are building with AI agents, with explanations and tutorials on how to do it yourself.
                </p>
                <div className="mt-5 flex items-center gap-2 text-[#5170ff] text-xs font-inter font-semibold group-hover:gap-3 transition-all">
                  Subscribe
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* LATEST ARTICLES SECTION – Separate below           */}
      {/* ═══════════════════════════════════════════════════ */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-3 pt-8 pb-20">
          {/* Section Header */}
          <div className="border-t border-[#1b1b1b]/25 mb-8"></div>
          <h2 className="font-times mb-6 uppercase text-center italic" style={{ letterSpacing: '-0.07em', color: '#1b1b1b', fontWeight: 900, fontStyle: 'italic', fontSize: 'clamp(30px, 4vw, 45px)' }}>
            <span style={{ color: '#5170ff' }}>Latest</span> Articles
          </h2>
          <div className="border-t border-[#1b1b1b]/25 mb-10"></div>

          {featuredArticle && (
            <>
              {/* DESKTOP: Featured left + 4 grid right */}
              <div className="hidden md:grid md:grid-cols-[1fr_1fr] gap-8">
                {/* Featured Article - Large */}
                <Link href={`${featuredArticle.linkPrefix}/${featuredArticle.slug}`} className="group">
                  <article className="cursor-pointer border-r border-[#1b1b1b]/25 pr-8">
                    <div className="aspect-video relative overflow-hidden bg-[#1b1b1b]/5 mb-4">
                      {featuredArticle.thumbnail_url ? (
                        <Image
                          src={featuredArticle.thumbnail_url}
                          alt={featuredArticle.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#1b1b1b]/10">
                          <span className="text-[#1b1b1b]/30">Featured</span>
                        </div>
                      )}
                      <ThumbnailOverlay />
                    </div>
                    <h3 className="font-bold font-times leading-tight text-[#1b1b1b] group-hover:text-accent transition-colors mb-2" style={{ fontSize: '36px' }}>
                      {featuredArticle.title}
                    </h3>
                    {featuredArticle.subtitle && (
                      <p className="text-[#1b1b1b]/60 text-sm font-inter font-medium line-clamp-2">
                        {featuredArticle.subtitle}
                      </p>
                    )}
                    {featuredArticle.published_at && <p className="text-xs font-inter font-medium mt-1" style={{ color: "rgba(27,27,27,0.55)" }}>{formatDate(featuredArticle.published_at)}</p>}
                  </article>
                </Link>

                {/* 4 Articles Grid - 2 columns with divider */}
                <div className="flex gap-6">
                  {/* Left column */}
                  <div className="flex-1 border-r border-[#1b1b1b]/25 pr-6 space-y-0">
                    {[recentArticles[0], recentArticles[2]].map((article, index) => (
                      article && (
                        <Link key={article.id} href={`${article.linkPrefix}/${article.slug}`} className="group">
                          <article className={`cursor-pointer ${index === 0 ? "pb-4 border-b border-[#1b1b1b]/25" : "pt-4"}`}>
                            <div className="aspect-video relative overflow-hidden bg-[#1b1b1b]/5 mb-3">
                              {article.thumbnail_url ? (
                                <Image
                                  src={article.thumbnail_url}
                                  alt={article.title}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#1b1b1b]/10">
                                  <span className="text-[#1b1b1b]/30 text-xs">Article</span>
                                </div>
                              )}
                              <ThumbnailOverlay />
                            </div>
                            <h3 className="font-bold font-times text-lg leading-snug text-[#1b1b1b] group-hover:text-accent transition-colors line-clamp-2">
                              {article.title}
                            </h3>
                            {article.published_at && <p className="text-xs font-inter font-medium mt-1" style={{ color: "rgba(27,27,27,0.55)" }}>{formatDate(article.published_at)}</p>}
                          </article>
                        </Link>
                      )
                    ))}
                  </div>
                  {/* Right column */}
                  <div className="flex-1 space-y-0">
                    {[recentArticles[1], recentArticles[3]].map((article, index) => (
                      article && (
                        <Link key={article.id} href={`${article.linkPrefix}/${article.slug}`} className="group">
                          <article className={`cursor-pointer ${index === 0 ? "pb-4 border-b border-[#1b1b1b]/25" : "pt-4"}`}>
                            <div className="aspect-video relative overflow-hidden bg-[#1b1b1b]/5 mb-3">
                              {article.thumbnail_url ? (
                                <Image
                                  src={article.thumbnail_url}
                                  alt={article.title}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#1b1b1b]/10">
                                  <span className="text-[#1b1b1b]/30 text-xs">Article</span>
                                </div>
                              )}
                              <ThumbnailOverlay />
                            </div>
                            <h3 className="font-bold font-times text-lg leading-snug text-[#1b1b1b] group-hover:text-accent transition-colors line-clamp-2">
                              {article.title}
                            </h3>
                            {article.published_at && <p className="text-xs font-inter font-medium mt-1" style={{ color: "rgba(27,27,27,0.55)" }}>{formatDate(article.published_at)}</p>}
                          </article>
                        </Link>
                      )
                    ))}
                  </div>
                </div>
              </div>

              {/* MOBILE: Stack layout */}
              <div className="md:hidden">
                {/* Featured Article */}
                <Link href={`${featuredArticle.linkPrefix}/${featuredArticle.slug}`} className="group">
                  <article className="cursor-pointer mb-6">
                    <div className="aspect-video relative overflow-hidden bg-[#1b1b1b]/5 mb-4">
                      {featuredArticle.thumbnail_url ? (
                        <Image
                          src={featuredArticle.thumbnail_url}
                          alt={featuredArticle.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#1b1b1b]/10">
                          <span className="text-[#1b1b1b]/30">Featured</span>
                        </div>
                      )}
                      <ThumbnailOverlay />
                    </div>
                    <h3 className="font-bold font-times leading-tight text-[#1b1b1b] group-hover:text-accent transition-colors" style={{ fontSize: '28px' }}>
                      {featuredArticle.title}
                    </h3>
                    {featuredArticle.subtitle && (
                      <p className="text-[#1b1b1b]/60 text-sm font-inter font-medium line-clamp-2 mt-1">
                        {featuredArticle.subtitle}
                      </p>
                    )}
                    {featuredArticle.published_at && <p className="text-xs font-inter font-medium mt-1" style={{ color: "rgba(27,27,27,0.55)" }}>{formatDate(featuredArticle.published_at)}</p>}
                  </article>
                </Link>

                {/* Divider */}
                <div className="border-t border-[#1b1b1b]/25 my-6"></div>

                {/* 4 Articles - thumbnail left, title right */}
                <div className="space-y-4">
                  {recentArticles.slice(0, 4).map((article, index) => (
                    <Link key={article.id} href={`${article.linkPrefix}/${article.slug}`} className="group">
                      <article className={`cursor-pointer flex gap-4 pb-4 ${index !== 0 ? "pt-4 border-t border-[#1b1b1b]/25" : ""}`}>
                        <div className="w-20 aspect-square flex-shrink-0 bg-[#1b1b1b]/5 overflow-hidden relative">
                          {article.thumbnail_url ? (
                            <Image
                              src={article.thumbnail_url}
                              alt={article.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#1b1b1b]/10">
                              <span className="text-[#1b1b1b]/30 text-xs">Article</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold font-times text-sm leading-snug text-[#1b1b1b] group-hover:text-accent transition-colors line-clamp-3">
                            {article.title}
                          </h3>
                          {article.published_at && <p className="text-[10px] font-inter font-medium mt-1" style={{ color: "rgba(27,27,27,0.55)" }}>{formatDate(article.published_at)}</p>}
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[#1b1b1b]/25 my-4 mt-10"></div>

              {/* View all articles button */}
              <div className="text-center">
                <Link
                  href="/articles"
                  className="inline-flex items-center gap-2 transition-colors font-semibold font-inter uppercase"
                  style={{ color: '#1b1b1b' }}
                >
                  View all articles
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>




      <FooterNew />
    </div>
  );
}
