import React from 'react';
import { getNewsletters, getCatalystNewsletters, getLabNewsletters } from '@/lib/newsletters';
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

export const revalidate = 60;

export default async function HomePage() {
  // ── TOP SECTION: Newsletters ──
  const { data: newsletters } = await getNewsletters({ limit: 8, sort: 'newest' });

  // ── CHILD NEWSLETTERS (edition-level, not story-level) ──
  const { data: catalystNLs } = await getCatalystNewsletters({ limit: 5, sort: 'newest' });
  const { data: labNLs } = await getLabNewsletters({ limit: 5, sort: 'newest' });

  // Each edition is one item — use first toc headline as title (not generic "The Catalyst | Date")
  const buildEditionItems = (nls: typeof catalystNLs) => nls.map(nl => ({
    id: nl.id,
    slug: nl.slug,
    title: nl.toc?.[0] || nl.title,  // Use first headline as main title
    thumbnail_url: nl.thumbnail_url || nl.stories?.[0]?.thumbnail_url || '',
    linkPrefix: '/newsletter',
    published_at: nl.published_at || '',
    toc: nl.toc,
    headlines: nl.toc,
  }));

  const catalystEditions = buildEditionItems(catalystNLs);
  const labEditions = buildEditionItems(labNLs);
  const featuredCatalyst = catalystEditions[0];
  const recentCatalyst = catalystEditions.slice(1, 5);
  const featuredLab = labEditions[0];
  const recentLab = labEditions.slice(1, 5);

  // Build newsletter display items using article headlines
  const newsletterItems = await Promise.all(newsletters.map(async nl => {
    // Resolve each article slug to get titles + thumbnail
    const resolvedArticles = (await Promise.all(
      nl.article_slugs.map(s => getArticleBySlug(s))
    )).filter(Boolean);

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
  }));

  const featuredNL = newsletterItems[0];
  const recentNL = newsletterItems.slice(1, 8);

  // ── BOTTOM SECTION: Articles ──
  const { data: articles } = await getArticles({ limit: 8, sort: 'newest' });
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
  const categorySections = await getCategorySections(10);

  return (
    <div>
      <HeroSection />

      <style dangerouslySetInnerHTML={{
        __html: `
        .hp-nl-title:hover h3{color:#5170ff!important}
        .hp-nl-hl:hover p{color:#5170ff!important}
        .hp-nl-hl:hover p span{color:#5170ff!important}
      `}} />

      {/* ═══════════════════════════════════════════════════ */}
      {/* LATEST ARTICLES – 3-column newsletter grid layout  */}
      {/* ═══════════════════════════════════════════════════ */}
      <section className="relative bg-white rounded-t-[48px] -mt-12 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-3 pt-24 pb-20">

          {featuredArticle && (
            <>
              {/* DESKTOP LAYOUT - 3 columns: left list | featured center | 2 right */}
              <div className="hidden md:grid md:grid-cols-[280px_1fr_280px] gap-10">
                {/* LEFT column: small article items stacked vertically */}
                <div className="flex flex-col gap-4 border-r border-[#1b1b1b]/25 pr-6">
                  {recentArticles.slice(2, 7).map((item, index) => (
                    <Link key={item.id} href={`${item.linkPrefix}/${item.slug}`} className="group">
                      <article className={`cursor-pointer flex gap-3 ${index !== 0 ? "pt-3 border-t border-[#1b1b1b]/25" : ""} ${index !== 4 ? "pb-3" : ""}`}>
                        <div className="w-28 aspect-[4/3] flex-shrink-0 bg-[#1b1b1b]/5 overflow-hidden relative">
                          {item.thumbnail_url ? (
                            <Image src={item.thumbnail_url} alt={item.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover" />
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

                {/* MIDDLE: Featured Article */}
                <article className="cursor-pointer h-full border-r border-[#1b1b1b]/25 pr-8">
                  <Link href={`${featuredArticle.linkPrefix}/${featuredArticle.slug}`} className="group block">
                    <div className="aspect-[4/3] relative overflow-hidden bg-[#1b1b1b]/5 mb-5">
                      {featuredArticle.thumbnail_url ? (
                        <Image src={featuredArticle.thumbnail_url} alt={featuredArticle.title} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#1b1b1b]/10">
                          <span className="text-[#1b1b1b]/30">Featured</span>
                        </div>
                      )}
                      <ThumbnailOverlay />
                    </div>
                  </Link>

                  <div className="space-y-3">
                    <Link href={`${featuredArticle.linkPrefix}/${featuredArticle.slug}`} className="hp-nl-title block">
                      <h3 className="font-bold font-times leading-tight text-[#1b1b1b] transition-colors" style={{ fontSize: '36px' }}>
                        {featuredArticle.title}
                      </h3>
                    </Link>
                    {featuredArticle.subtitle && (
                      <p className="text-[#1b1b1b]/60 text-sm font-inter font-medium line-clamp-2">
                        {featuredArticle.subtitle}
                      </p>
                    )}
                    {featuredArticle.published_at && <p className="text-xs font-inter font-medium mt-1" style={{ color: "rgba(27,27,27,0.55)" }}>{formatDate(featuredArticle.published_at)}</p>}
                  </div>
                </article>

                {/* RIGHT column: 2 stacked articles */}
                <div className="flex flex-col">
                  {recentArticles.slice(0, 2).map((item, index) => (
                    <Link key={item.id} href={`${item.linkPrefix}/${item.slug}`} className="group">
                      <article className={`cursor-pointer flex-1 ${index !== 0 ? "pt-4 border-t border-[#1b1b1b]/25" : ""}`}>
                        <div className="aspect-video relative overflow-hidden bg-[#1b1b1b]/5 mb-3">
                          {item.thumbnail_url ? (
                            <Image src={item.thumbnail_url} alt={item.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#1b1b1b]/10">
                              <span className="text-[#1b1b1b]/30 text-xs">Article</span>
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
                <article className="cursor-pointer mb-6">
                  <Link href={`${featuredArticle.linkPrefix}/${featuredArticle.slug}`} className="group block">
                    <div className="aspect-video relative overflow-hidden bg-[#1b1b1b]/5 mb-4">
                      {featuredArticle.thumbnail_url ? (
                        <Image src={featuredArticle.thumbnail_url} alt={featuredArticle.title} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#1b1b1b]/10">
                          <span className="text-[#1b1b1b]/30">Featured</span>
                        </div>
                      )}
                      <ThumbnailOverlay />
                    </div>
                  </Link>
                  <Link href={`${featuredArticle.linkPrefix}/${featuredArticle.slug}`} className="hp-nl-title block">
                    <h3 className="font-bold font-times leading-tight text-[#1b1b1b] transition-colors" style={{ fontSize: '28px' }}>
                      {featuredArticle.title}
                    </h3>
                  </Link>
                  {featuredArticle.subtitle && (
                    <p className="text-[#1b1b1b]/60 text-sm font-inter font-medium line-clamp-2 mt-1">
                      {featuredArticle.subtitle}
                    </p>
                  )}
                  {featuredArticle.published_at && <p className="text-xs font-inter font-medium mt-1" style={{ color: "rgba(27,27,27,0.55)" }}>{formatDate(featuredArticle.published_at)}</p>}
                </article>

                <div className="border-t border-[#1b1b1b]/25 my-6"></div>

                <div className="grid grid-cols-[1fr_1px_1fr] gap-4">
                  {recentArticles.slice(0, 2).map((item, idx) => (
                    <React.Fragment key={item.id}>
                      {idx === 1 && <div className="bg-[#1b1b1b]/15" />}
                      <article className="cursor-pointer">
                        <Link href={`${item.linkPrefix}/${item.slug}`} className="group block">
                          <div className="relative overflow-hidden bg-[#1b1b1b]/5 mb-3" style={{ aspectRatio: '4/3' }}>
                            {item.thumbnail_url ? (
                              <Image src={item.thumbnail_url} alt={item.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[#1b1b1b]/10">
                                <span className="text-[#1b1b1b]/30 text-xs">Article</span>
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

                <div className="border-t border-[#1b1b1b]/25 my-6"></div>

                <div className="space-y-6">
                  {recentArticles.slice(2, 7).map((item, index) => (
                    <Link key={item.id} href={`${item.linkPrefix}/${item.slug}`} className="group">
                      <article className={`cursor-pointer flex gap-4 pb-4 ${index !== 0 ? "pt-4 border-t border-[#1b1b1b]/25" : ""}`}>
                        <div className="w-20 aspect-square flex-shrink-0 bg-[#1b1b1b]/5 overflow-hidden relative">
                          {item.thumbnail_url ? (
                            <Image src={item.thumbnail_url} alt={item.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#1b1b1b]/10">
                              <span className="text-[#1b1b1b]/30 text-xs">Article</span>
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

              <div className="border-t border-[#1b1b1b]/25 my-4"></div>

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


      {/* ═══════════════════════════════════════════════════ */}
      {/* TV EDITIONS – 5-grid layout with logo              */}
      {/* ═══════════════════════════════════════════════════ */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-3 pt-8 pb-20">

          {/* TV Newsletter Logo */}
          <div className="border-t border-[#1b1b1b]/25 mb-4"></div>
          <div className="mb-3 flex justify-center">
            <Image
              src="/Transparent Black Logo.png"
              alt="Thorium Valley"
              width={85}
              height={85}
              priority
              style={{ height: 'clamp(65px, 8vw, 85px)', width: 'auto', display: 'block' }}
            />
          </div>
          <div className="border-t border-[#1b1b1b]/25 mb-6"></div>

          {featuredNL ? (
            <>
              {/* DESKTOP: Featured left + 4 grid right */}
              <div className="hidden md:grid md:grid-cols-[1fr_1fr] gap-8">
                {/* Featured Newsletter - Large */}
                <Link href={`${featuredNL.linkPrefix}/${featuredNL.slug}`} className="group">
                  <article className="cursor-pointer border-r border-[#1b1b1b]/25 pr-8">
                    <div className="aspect-video relative overflow-hidden bg-[#1b1b1b]/5 mb-4">
                      {featuredNL.thumbnail_url ? (
                        <Image
                          src={featuredNL.thumbnail_url}
                          alt={featuredNL.title}
                          fill
                          priority
                          sizes="(max-width: 768px) 100vw, 50vw"
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
                      {featuredNL.title}
                    </h3>
                    {featuredNL.headlines.length > 1 && (
                      <div className="space-y-1 mt-2">
                        {featuredNL.headlines.slice(1).map((hl: string, i: number) => (
                          <p key={i} className="text-[#1b1b1b]/60 text-sm font-inter font-medium leading-snug">
                            <img src="/thumbnails/toc-bullet.png" alt="" style={{ width: '12px', height: '12px', display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> {hl}
                          </p>
                        ))}
                      </div>
                    )}
                  </article>
                </Link>

                {/* 4 Editions Grid - 2 columns with divider */}
                <div className="flex gap-6">
                  {/* Left column */}
                  <div className="flex-1 border-r border-[#1b1b1b]/25 pr-6 space-y-0">
                    {[recentNL[0], recentNL[2]].map((item, index) => (
                      item && (
                        <Link key={item.id} href={`${item.linkPrefix}/${item.slug}`} className="group">
                          <article className={`cursor-pointer ${index === 0 ? "pb-4 border-b border-[#1b1b1b]/25" : "pt-4"}`}>
                            <div className="aspect-video relative overflow-hidden bg-[#1b1b1b]/5 mb-3">
                              {item.thumbnail_url ? (
                                <Image
                                  src={item.thumbnail_url}
                                  alt={item.title}
                                  fill
                                  sizes="(max-width: 768px) 100vw, 25vw"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#1b1b1b]/10">
                                  <span className="text-[#1b1b1b]/30 text-xs">Edition</span>
                                </div>
                              )}
                              <ThumbnailOverlay />
                            </div>
                            <h3 className="font-bold font-times text-lg leading-snug text-[#1b1b1b] group-hover:text-accent transition-colors line-clamp-2">
                              {item.title}
                            </h3>
                          </article>
                        </Link>
                      )
                    ))}
                  </div>
                  {/* Right column */}
                  <div className="flex-1 space-y-0">
                    {[recentNL[1], recentNL[3]].map((item, index) => (
                      item && (
                        <Link key={item.id} href={`${item.linkPrefix}/${item.slug}`} className="group">
                          <article className={`cursor-pointer ${index === 0 ? "pb-4 border-b border-[#1b1b1b]/25" : "pt-4"}`}>
                            <div className="aspect-video relative overflow-hidden bg-[#1b1b1b]/5 mb-3">
                              {item.thumbnail_url ? (
                                <Image
                                  src={item.thumbnail_url}
                                  alt={item.title}
                                  fill
                                  sizes="(max-width: 768px) 100vw, 25vw"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#1b1b1b]/10">
                                  <span className="text-[#1b1b1b]/30 text-xs">Edition</span>
                                </div>
                              )}
                              <ThumbnailOverlay />
                            </div>
                            <h3 className="font-bold font-times text-lg leading-snug text-[#1b1b1b] group-hover:text-accent transition-colors line-clamp-2">
                              {item.title}
                            </h3>
                          </article>
                        </Link>
                      )
                    ))}
                  </div>
                </div>
              </div>

              {/* MOBILE: Stack layout */}
              <div className="md:hidden">
                <Link href={`${featuredNL.linkPrefix}/${featuredNL.slug}`} className="group">
                  <article className="cursor-pointer mb-6">
                    <div className="aspect-video relative overflow-hidden bg-[#1b1b1b]/5 mb-4">
                      {featuredNL.thumbnail_url ? (
                        <Image
                          src={featuredNL.thumbnail_url}
                          alt={featuredNL.title}
                          fill
                          sizes="100vw"
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
                      {featuredNL.title}
                    </h3>
                  </article>
                </Link>

                <div className="border-t border-[#1b1b1b]/25 my-6"></div>

                <div className="space-y-4">
                  {recentNL.slice(0, 4).map((item, index) => (
                    <Link key={item.id} href={`${item.linkPrefix}/${item.slug}`} className="group">
                      <article className={`cursor-pointer flex gap-4 pb-4 ${index !== 0 ? "pt-4 border-t border-[#1b1b1b]/25" : ""}`}>
                        <div className="w-20 aspect-square flex-shrink-0 bg-[#1b1b1b]/5 overflow-hidden relative">
                          {item.thumbnail_url ? (
                            <Image src={item.thumbnail_url} alt={item.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#1b1b1b]/10">
                              <span className="text-[#1b1b1b]/30 text-xs">Edition</span>
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

              <div className="border-t border-[#1b1b1b]/25 my-4 mt-10"></div>

              <div className="text-center">
                <Link
                  href="/newsletter?pub=Thorium+Valley"
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
              <p className="text-[#1b1b1b]/50 text-lg font-inter">No editions yet</p>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* CHILD NEWSLETTERS – Catalyst, Lab                 */}
      {/* ═══════════════════════════════════════════════════ */}

      {/* ── THE CATALYST ── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-3 pt-2 pb-16">
          <div className="border-t border-[#1b1b1b]/25 mb-4"></div>
          <div className="mb-3 flex justify-center">
            <img src="/images/catalyst-logo-dark.png" alt="The Catalyst" style={{ height: '120px', width: 'auto', display: 'block' }} />
          </div>
          <div className="border-t border-[#1b1b1b]/25 mb-6"></div>

          {featuredCatalyst ? (
            <>
              {/* DESKTOP */}
              <div className="hidden md:grid md:grid-cols-[1fr_1fr] gap-8">
                <Link href={`/newsletter/${featuredCatalyst.slug}`} className="group">
                  <article className="cursor-pointer border-r border-[#1b1b1b]/25 pr-8">
                    <div className="aspect-video relative overflow-hidden bg-[#1b1b1b]/5 mb-4">
                      {featuredCatalyst.thumbnail_url && (
                        <Image src={featuredCatalyst.thumbnail_url} alt={featuredCatalyst.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      )}
                      <ThumbnailOverlay />
                    </div>
                    <h3 className="font-bold font-times leading-tight text-[#1b1b1b] group-hover:text-accent transition-colors mb-2" style={{ fontSize: '36px' }}>
                      {featuredCatalyst.title}
                    </h3>
                    {featuredCatalyst.toc.length > 1 && (
                      <div className="space-y-1 mt-2">
                        {featuredCatalyst.toc.slice(1).map((hl: string, i: number) => (
                          <p key={i} className="text-[#1b1b1b]/60 text-sm font-inter font-medium leading-snug">
                            <img src="/thumbnails/catalyst-star.png" alt="" style={{ width: '12px', height: '12px', display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> {hl}
                          </p>
                        ))}
                      </div>
                    )}
                  </article>
                </Link>
                <div className="flex gap-6">
                  <div className="flex-1 border-r border-[#1b1b1b]/25 pr-6 space-y-0">
                    {[recentCatalyst[0], recentCatalyst[2]].map((item, index) => (
                      item && (
                        <Link key={item.id} href={`/newsletter/${item.slug}`} className="group">
                          <article className={`cursor-pointer ${index === 0 ? 'pb-4 border-b border-[#1b1b1b]/25' : 'pt-4'}`}>
                            <div className="aspect-video relative overflow-hidden bg-[#1b1b1b]/5 mb-3">
                              {item.thumbnail_url && <Image src={item.thumbnail_url} alt={item.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover" />}
                              <ThumbnailOverlay />
                            </div>
                            <h3 className="font-bold font-times text-lg leading-snug text-[#1b1b1b] group-hover:text-accent transition-colors line-clamp-2">{item.title}</h3>
                          </article>
                        </Link>
                      )
                    ))}
                  </div>
                  <div className="flex-1 space-y-0">
                    {[recentCatalyst[1], recentCatalyst[3]].map((item, index) => (
                      item && (
                        <Link key={item.id} href={`/newsletter/${item.slug}`} className="group">
                          <article className={`cursor-pointer ${index === 0 ? 'pb-4 border-b border-[#1b1b1b]/25' : 'pt-4'}`}>
                            <div className="aspect-video relative overflow-hidden bg-[#1b1b1b]/5 mb-3">
                              {item.thumbnail_url && <Image src={item.thumbnail_url} alt={item.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover" />}
                              <ThumbnailOverlay />
                            </div>
                            <h3 className="font-bold font-times text-lg leading-snug text-[#1b1b1b] group-hover:text-accent transition-colors line-clamp-2">{item.title}</h3>
                          </article>
                        </Link>
                      )
                    ))}
                  </div>
                </div>
              </div>

              {/* MOBILE */}
              <div className="md:hidden">
                <Link href={`/newsletter/${featuredCatalyst.slug}`} className="group">
                  <article className="cursor-pointer mb-6">
                    <div className="aspect-video relative overflow-hidden bg-[#1b1b1b]/5 mb-4">
                      {featuredCatalyst.thumbnail_url && <Image src={featuredCatalyst.thumbnail_url} alt={featuredCatalyst.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover" />}
                      <ThumbnailOverlay />
                    </div>
                    <h3 className="font-bold font-times leading-tight text-[#1b1b1b]" style={{ fontSize: '28px' }}>{featuredCatalyst.title}</h3>
                  </article>
                </Link>
                <div className="border-t border-[#1b1b1b]/25 my-6"></div>
                <div className="space-y-4">
                  {recentCatalyst.slice(1, 4).map((item, index) => (
                    <Link key={item.id} href={`/newsletter/${item.slug}`} className="group">
                      <article className={`cursor-pointer flex gap-4 pb-4 ${index !== 0 ? 'pt-4 border-t border-[#1b1b1b]/25' : ''}`}>
                        <div className="w-20 aspect-square flex-shrink-0 bg-[#1b1b1b]/5 overflow-hidden relative">
                          {item.thumbnail_url && <Image src={item.thumbnail_url} alt={item.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover" />}
                        </div>
                        <h3 className="font-bold font-times text-sm leading-snug text-[#1b1b1b] group-hover:text-accent transition-colors line-clamp-3">{item.title}</h3>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12"><p className="text-[#1b1b1b]/50 text-lg font-inter">No editions yet</p></div>
          )}

          <div className="border-t border-[#1b1b1b]/25 my-4 mt-10"></div>
          <div className="text-center">
            <Link href="/newsletter?pub=The+Catalyst" className="inline-flex items-center gap-2 transition-colors font-semibold font-inter uppercase" style={{ color: '#1b1b1b' }}>
              View all editions
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── THE LAB ── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-3 pt-2 pb-16">
          <div className="border-t border-[#1b1b1b]/25 mb-4"></div>
          <div className="mb-3 flex justify-center">
            <img src="/images/lab-logo-dark.png" alt="The Lab" style={{ height: '120px', width: 'auto', display: 'block' }} />
          </div>
          <div className="border-t border-[#1b1b1b]/25 mb-6"></div>

          {featuredLab ? (
            <>
              {/* DESKTOP */}
              <div className="hidden md:grid md:grid-cols-[1fr_1fr] gap-8">
                <Link href={`/newsletter/${featuredLab.slug}`} className="group">
                  <article className="cursor-pointer border-r border-[#1b1b1b]/25 pr-8">
                    <div className="aspect-video relative overflow-hidden bg-[#1b1b1b]/5 mb-4">
                      {featuredLab.thumbnail_url && (
                        <Image src={featuredLab.thumbnail_url} alt={featuredLab.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      )}
                      <ThumbnailOverlay />
                    </div>
                    <h3 className="font-bold font-times leading-tight text-[#1b1b1b] group-hover:text-accent transition-colors mb-2" style={{ fontSize: '36px' }}>
                      {featuredLab.title}
                    </h3>
                    {featuredLab.toc.length > 1 && (
                      <div className="space-y-1 mt-2">
                        {featuredLab.toc.slice(1).map((hl: string, i: number) => (
                          <p key={i} className="text-[#1b1b1b]/60 text-sm font-inter font-medium leading-snug">
                            <img src="/thumbnails/lab-star.png" alt="" style={{ width: '12px', height: '12px', display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> {hl}
                          </p>
                        ))}
                      </div>
                    )}
                  </article>
                </Link>
                <div className="flex gap-6">
                  <div className="flex-1 border-r border-[#1b1b1b]/25 pr-6 space-y-0">
                    {[recentLab[0], recentLab[2]].map((item, index) => (
                      item && (
                        <Link key={item.id} href={`/newsletter/${item.slug}`} className="group">
                          <article className={`cursor-pointer ${index === 0 ? 'pb-4 border-b border-[#1b1b1b]/25' : 'pt-4'}`}>
                            <div className="aspect-video relative overflow-hidden bg-[#1b1b1b]/5 mb-3">
                              {item.thumbnail_url && <Image src={item.thumbnail_url} alt={item.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover" />}
                              <ThumbnailOverlay />
                            </div>
                            <h3 className="font-bold font-times text-lg leading-snug text-[#1b1b1b] group-hover:text-accent transition-colors line-clamp-2">{item.title}</h3>
                          </article>
                        </Link>
                      )
                    ))}
                  </div>
                  <div className="flex-1 space-y-0">
                    {[recentLab[1], recentLab[3]].map((item, index) => (
                      item && (
                        <Link key={item.id} href={`/newsletter/${item.slug}`} className="group">
                          <article className={`cursor-pointer ${index === 0 ? 'pb-4 border-b border-[#1b1b1b]/25' : 'pt-4'}`}>
                            <div className="aspect-video relative overflow-hidden bg-[#1b1b1b]/5 mb-3">
                              {item.thumbnail_url && <Image src={item.thumbnail_url} alt={item.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover" />}
                              <ThumbnailOverlay />
                            </div>
                            <h3 className="font-bold font-times text-lg leading-snug text-[#1b1b1b] group-hover:text-accent transition-colors line-clamp-2">{item.title}</h3>
                          </article>
                        </Link>
                      )
                    ))}
                  </div>
                </div>
              </div>

              {/* MOBILE */}
              <div className="md:hidden">
                <Link href={`/newsletter/${featuredLab.slug}`} className="group">
                  <article className="cursor-pointer mb-6">
                    <div className="aspect-video relative overflow-hidden bg-[#1b1b1b]/5 mb-4">
                      {featuredLab.thumbnail_url && <Image src={featuredLab.thumbnail_url} alt={featuredLab.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover" />}
                      <ThumbnailOverlay />
                    </div>
                    <h3 className="font-bold font-times leading-tight text-[#1b1b1b]" style={{ fontSize: '28px' }}>{featuredLab.title}</h3>
                  </article>
                </Link>
                <div className="border-t border-[#1b1b1b]/25 my-6"></div>
                <div className="space-y-4">
                  {recentLab.slice(1, 4).map((item, index) => (
                    <Link key={item.id} href={`/newsletter/${item.slug}`} className="group">
                      <article className={`cursor-pointer flex gap-4 pb-4 ${index !== 0 ? 'pt-4 border-t border-[#1b1b1b]/25' : ''}`}>
                        <div className="w-20 aspect-square flex-shrink-0 bg-[#1b1b1b]/5 overflow-hidden relative">
                          {item.thumbnail_url && <Image src={item.thumbnail_url} alt={item.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover" />}
                        </div>
                        <h3 className="font-bold font-times text-sm leading-snug text-[#1b1b1b] group-hover:text-accent transition-colors line-clamp-3">{item.title}</h3>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12"><p className="text-[#1b1b1b]/50 text-lg font-inter">No editions yet</p></div>
          )}

          <div className="border-t border-[#1b1b1b]/25 my-4 mt-10"></div>
          <div className="text-center">
            <Link href="/newsletter?pub=The+Lab" className="inline-flex items-center gap-2 transition-colors font-semibold font-inter uppercase" style={{ color: '#1b1b1b' }}>
              View all editions
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════ */}
      {/* PUBLICATIONS SECTION – Newsletter signup           */}
      {/* ═══════════════════════════════════════════════════ */}


      <FooterNew />
    </div>
  );
}
