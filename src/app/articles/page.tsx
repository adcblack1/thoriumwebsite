'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Navigation } from '@/components/navigation';
import { FooterNew } from '@/components/footer-new';
import { SubscribeCTA } from '@/components/SubscribeCTA';
import { FadeIn } from '@/components/FadeIn';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface Article {
    id: string;
    slug: string;
    title: string;
    subtitle?: string;
    category: string;
    tags?: string[];
    thumbnail_url?: string;
    published_at: string;
    reading_time?: number;
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function ArticlesPage() {
    const searchParams = useSearchParams();
    const [articles, setArticles] = useState<Article[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [activeCategory, setActiveCategory] = useState('All');

    useEffect(() => {
        fetch('/api/articles?limit=100')
            .then(res => res.json())
            .then(data => {
                const arts = data.data || [];
                setArticles(arts);
                // Extract unique categories in order — trimmed, case-insensitive dedupe,
                // empty/null skipped (they rendered as blank + duplicate pills).
                const cats: string[] = [];
                const seen = new Set<string>();
                arts.forEach((a: Article) => {
                    const cat = (a.category || '').trim();
                    if (!cat) return;
                    const key = cat.toLowerCase();
                    if (!seen.has(key)) { seen.add(key); cats.push(cat); }
                });
                setCategories(cats);
            })
            .catch(console.error);
    }, []);

    // Read category from URL query params (e.g., /articles?category=Big%20Tech)
    useEffect(() => {
        const cat = searchParams.get('category');
        if (cat && categories.length > 0) {
            // Find matching category (case-insensitive)
            const match = categories.find(c => c.toLowerCase() === cat.toLowerCase());
            if (match) setActiveCategory(match);
        }
    }, [searchParams, categories]);

    // Match categories case-insensitively so pill filters catch case-variant rows
    const filtered = articles.filter(a =>
        activeCategory === 'All' ||
        (a.category || '').trim().toLowerCase() === activeCategory.toLowerCase()
    );

    return (
        <>
            <Navigation heroTheme="dark" scrollThreshold={100} />

            {/* White area behind the navbar */}
            <div className="bg-white h-[80px] lg:h-[155px]" />

            {/* Header + filters on black bg */}
            <section style={{ backgroundColor: '#000000' }} className="pt-10 lg:pt-14 pb-0 -mt-px">
                <div className="max-w-7xl lg:max-w-5xl mx-auto px-6 pb-6">
                    <FadeIn>
                        <h1
                            className="font-times font-bold text-4xl lg:text-6xl uppercase text-center"
                            style={{ letterSpacing: '-0.05em', lineHeight: 1.08, color: '#ffffff' }}
                        >
                            All <span style={{ color: '#ffffff' }}>Articles</span>
                        </h1>
                    </FadeIn>
                </div>

                {/* Category filter row */}
                <div className="sticky top-0 z-20 relative" style={{ backgroundColor: '#000000' }}>
                    <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none lg:hidden" style={{ background: 'linear-gradient(to left, #000000 20%, transparent)' }} />
                    <div className="max-w-7xl lg:max-w-5xl mx-auto px-6 border-b border-white/20">
                        <div className="flex gap-6 overflow-x-auto py-3" style={{ scrollbarWidth: 'none' }}>
                            <style dangerouslySetInnerHTML={{ __html: '.cat-filters::-webkit-scrollbar { display: none; }' }} />

                            <button
                                onClick={() => setActiveCategory('All')}
                                className="font-inter text-xs font-semibold uppercase tracking-wider pb-2 whitespace-nowrap relative group"
                                style={{ color: activeCategory === 'All' ? '#5170ff' : '#ffffff' }}
                            >
                                All
                                <span className="absolute bottom-0 left-0 h-0.5 transition-all duration-300" style={{ backgroundColor: '#5170ff', width: activeCategory === 'All' ? '100%' : '0%' }} />
                                {activeCategory !== 'All' && (
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ backgroundColor: '#5170ff' }} />
                                )}
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className="font-inter text-xs font-semibold uppercase tracking-wider pb-2 whitespace-nowrap relative group"
                                    style={{ color: activeCategory === cat ? '#5170ff' : '#ffffff' }}
                                >
                                    {cat}
                                    <span className="absolute bottom-0 left-0 h-0.5 transition-all duration-300" style={{ backgroundColor: '#5170ff', width: activeCategory === cat ? '100%' : '0%' }} />
                                    {activeCategory !== cat && (
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ backgroundColor: '#5170ff' }} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════ */}
            {/* CONTENT AREA                                */}
            {/* ═══════════════════════════════════════════ */}

            {/* ALL: Front-page style layout */}
            {activeCategory === 'All' && articles.length > 0 && (
                <>
                    {/* LATEST – hero grid */}
                    <section className="bg-white pt-10 pb-4">
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="border-t border-[#1b1b1b]/25 mb-6" />
                            <h2 className="font-times font-bold text-2xl lg:text-3xl uppercase mb-8" style={{ letterSpacing: '-0.04em', color: '#1b1b1b' }}>
                                Latest
                            </h2>

                            {/* DESKTOP */}
                            <div className="hidden lg:flex gap-8">
                                <Link href={`/articles/${articles[0].slug}`} className="group block w-[48%] flex-shrink-0">
                                    <article className="h-full flex flex-col">
                                        <div className="relative w-full flex-1 min-h-[360px] overflow-hidden bg-[#1b1b1b]/5">
                                            {articles[0].thumbnail_url && (
                                                <Image src={articles[0].thumbnail_url} alt={articles[0].title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" priority />
                                            )}
                                        </div>
                                        <span className="font-inter font-semibold uppercase tracking-wider block text-xs mt-4 mb-1" style={{ color: '#5170ff' }}>
                                            {articles[0].category}
                                        </span>
                                        <h3 className="font-times font-bold text-[28px] leading-tight text-[#1b1b1b] group-hover:text-[#5170ff] transition-colors" style={{ letterSpacing: '-0.04em' }}>
                                            {articles[0].title}
                                        </h3>
                                        {articles[0].subtitle && (
                                            <p className="font-inter text-sm mt-2 line-clamp-2 text-[#1b1b1b]/55">{articles[0].subtitle}</p>
                                        )}
                                        <time className="font-inter font-medium block text-xs mt-2" style={{ color: 'rgba(27,27,27,0.4)' }}>
                                            {formatDate(articles[0].published_at)}
                                        </time>
                                    </article>
                                </Link>
                                <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-10">
                                    {articles.slice(1, 5).map(article => (
                                        <Link key={article.slug} href={`/articles/${article.slug}`} className="group block">
                                            <article>
                                                <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#1b1b1b]/5">
                                                    {article.thumbnail_url && (
                                                        <Image src={article.thumbnail_url} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    )}
                                                </div>
                                                <span className="font-inter font-semibold uppercase tracking-wider block text-xs mt-3 mb-1" style={{ color: '#5170ff' }}>
                                                    {article.category}
                                                </span>
                                                <h3 className="font-times font-bold text-lg leading-snug text-[#1b1b1b] group-hover:text-[#5170ff] transition-colors" style={{ letterSpacing: '-0.03em' }}>
                                                    {article.title}
                                                </h3>
                                                <time className="font-inter font-medium block text-xs mt-1" style={{ color: 'rgba(27,27,27,0.4)' }}>
                                                    {formatDate(article.published_at)}
                                                </time>
                                            </article>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* MOBILE – front-page style */}
                            <div className="lg:hidden">
                                <Link href={`/articles/${articles[0].slug}`} className="group block mb-6">
                                    <article>
                                        <div className="aspect-video relative overflow-hidden bg-[#1b1b1b]/5 mb-4">
                                            {articles[0].thumbnail_url && (
                                                <Image src={articles[0].thumbnail_url} alt={articles[0].title} fill priority className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                            )}
                                        </div>
                                        <h3 className="font-bold font-times leading-tight text-[#1b1b1b] group-hover:text-[#5170ff] transition-colors" style={{ fontSize: '28px' }}>
                                            {articles[0].title}
                                        </h3>
                                        {articles[0].subtitle && (
                                            <p className="font-inter text-sm mt-1 line-clamp-2 text-[#1b1b1b]/55">{articles[0].subtitle}</p>
                                        )}
                                        <time className="font-inter font-medium block text-xs mt-2" style={{ color: 'rgba(27,27,27,0.4)' }}>
                                            {formatDate(articles[0].published_at)}
                                        </time>
                                    </article>
                                </Link>
                                {articles.length > 1 && (
                                    <>
                                        <div className="border-t border-[#1b1b1b]/25 my-6" />
                                        <div className="space-y-6">
                                            {articles.slice(1, 5).map((article, index) => (
                                                <Link key={article.slug} href={`/articles/${article.slug}`} className="group">
                                                    <article className={`cursor-pointer flex gap-4 pb-4 ${index !== 0 ? 'pt-4 border-t border-[#1b1b1b]/25' : ''}`}>
                                                        <div className="w-28 aspect-[4/3] flex-shrink-0 bg-[#1b1b1b]/5 overflow-hidden relative">
                                                            {article.thumbnail_url ? (
                                                                <Image src={article.thumbnail_url} alt={article.title} fill className="object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-[#1b1b1b]/10">
                                                                    <span className="text-[#1b1b1b]/30 text-xs">Art</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-bold font-times leading-snug text-[#1b1b1b] group-hover:text-[#5170ff] transition-colors line-clamp-3" style={{ fontSize: '20px' }}>
                                                                {article.title}
                                                            </h3>
                                                        </div>
                                                    </article>
                                                </Link>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* CATEGORY SECTIONS */}
                    {categories.map(cat => {
                        const catArticles = articles.filter(a => (a.category || '').trim().toLowerCase() === cat.toLowerCase());
                        if (catArticles.length === 0) return null;
                        return (
                            <section key={cat} className="bg-white pb-4">
                                <div className="max-w-7xl mx-auto px-6">
                                    <div className="border-t border-[#1b1b1b]/25 mb-6 mt-8" />
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="font-times font-bold text-2xl lg:text-3xl uppercase" style={{ letterSpacing: '-0.04em', color: '#1b1b1b' }}>
                                            {cat}
                                        </h2>
                                        {catArticles.length > 4 && (
                                            <button
                                                onClick={() => setActiveCategory(cat)}
                                                className="inline-flex items-center gap-2 transition-colors font-semibold font-inter uppercase text-sm"
                                                style={{ color: '#1b1b1b' }}
                                            >
                                                View all
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                            </button>
                                        )}
                                    </div>

                                    {/* DESKTOP – 4 col grid */}
                                    <div className="hidden lg:grid lg:grid-cols-4 gap-8">
                                        {catArticles.slice(0, 4).map(article => (
                                            <Link key={article.slug} href={`/articles/${article.slug}`} className="group block">
                                                <article>
                                                    <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#1b1b1b]/5">
                                                        {article.thumbnail_url && (
                                                            <Image src={article.thumbnail_url} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                                        )}
                                                    </div>
                                                    <span className="font-inter font-semibold uppercase tracking-wider block text-xs mt-3 mb-1" style={{ color: '#5170ff' }}>
                                                        {article.category}
                                                    </span>
                                                    <h3 className="font-times font-bold text-lg leading-snug text-[#1b1b1b] group-hover:text-[#5170ff] transition-colors" style={{ letterSpacing: '-0.03em' }}>
                                                        {article.title}
                                                    </h3>
                                                    <time className="font-inter font-medium block text-xs mt-1" style={{ color: 'rgba(27,27,27,0.4)' }}>
                                                        {formatDate(article.published_at)}
                                                    </time>
                                                </article>
                                            </Link>
                                        ))}
                                    </div>

                                    {/* MOBILE – first one big, rest thumbnail rows */}
                                    <div className="lg:hidden">
                                        <Link href={`/articles/${catArticles[0].slug}`} className="group block mb-6">
                                            <article>
                                                <div className="aspect-video relative overflow-hidden bg-[#1b1b1b]/5 mb-4">
                                                    {catArticles[0].thumbnail_url && (
                                                        <Image src={catArticles[0].thumbnail_url} alt={catArticles[0].title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    )}
                                                </div>
                                                <h3 className="font-bold font-times leading-tight text-[#1b1b1b] group-hover:text-[#5170ff] transition-colors" style={{ fontSize: '28px' }}>
                                                    {catArticles[0].title}
                                                </h3>
                                            </article>
                                        </Link>
                                        {catArticles.length > 1 && (
                                            <>
                                                <div className="border-t border-[#1b1b1b]/25 my-4" />
                                                <div className="space-y-4">
                                                    {catArticles.slice(1, 4).map((article, index) => (
                                                        <Link key={article.slug} href={`/articles/${article.slug}`} className="group">
                                                            <article className={`cursor-pointer flex gap-4 pb-4 ${index !== 0 ? 'pt-4 border-t border-[#1b1b1b]/25' : ''}`}>
                                                                <div className="w-28 aspect-[4/3] flex-shrink-0 bg-[#1b1b1b]/5 overflow-hidden relative">
                                                                    {article.thumbnail_url ? (
                                                                        <Image src={article.thumbnail_url} alt={article.title} fill className="object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center bg-[#1b1b1b]/10">
                                                                            <span className="text-[#1b1b1b]/30 text-xs">Art</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="font-bold font-times leading-snug text-[#1b1b1b] group-hover:text-[#5170ff] transition-colors line-clamp-3" style={{ fontSize: '20px' }}>
                                                                        {article.title}
                                                                    </h3>
                                                                </div>
                                                            </article>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </section>
                        );
                    })}
                </>
            )}

            {/* FILTERED VIEW: specific topic selected */}
            {activeCategory !== 'All' && filtered.length > 0 && (
                <section className="bg-white pt-10 pb-16">
                    <div className="max-w-7xl mx-auto px-6">

                        {/* DESKTOP – rows of 4 */}
                        <div className="hidden lg:block">
                            {Array.from({ length: Math.ceil(filtered.length / 4) }).map((_, rowIndex) => {
                                const rowArticles = filtered.slice(rowIndex * 4, rowIndex * 4 + 4);
                                return (
                                    <div key={rowIndex}>
                                        <div className={`border-t border-[#1b1b1b]/25 ${rowIndex === 0 ? 'mb-8' : 'my-8'}`} />
                                        <div className="grid grid-cols-4 gap-x-8 gap-y-10">
                                            {rowArticles.map(article => (
                                                <Link key={article.slug} href={`/articles/${article.slug}`} className="group block">
                                                    <article>
                                                        <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#1b1b1b]/5">
                                                            {article.thumbnail_url && (
                                                                <Image src={article.thumbnail_url} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                                            )}
                                                        </div>
                                                        <span className="font-inter font-semibold uppercase tracking-wider block text-xs mt-3 mb-1" style={{ color: '#5170ff' }}>
                                                            {article.category}
                                                        </span>
                                                        <h3 className="font-times font-bold text-lg leading-snug text-[#1b1b1b] group-hover:text-[#5170ff] transition-colors" style={{ letterSpacing: '-0.03em' }}>
                                                            {article.title}
                                                        </h3>
                                                        <time className="font-inter font-medium block text-xs mt-1" style={{ color: 'rgba(27,27,27,0.4)' }}>
                                                            {formatDate(article.published_at)}
                                                        </time>
                                                    </article>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* MOBILE – front-page style: first big, rest thumbnail rows */}
                        <div className="lg:hidden">
                            <div className="border-t border-[#1b1b1b]/25 mb-6" />
                            <Link href={`/articles/${filtered[0].slug}`} className="group block mb-6">
                                <article>
                                    <div className="aspect-video relative overflow-hidden bg-[#1b1b1b]/5 mb-4">
                                        {filtered[0].thumbnail_url && (
                                            <Image src={filtered[0].thumbnail_url} alt={filtered[0].title} fill priority className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                        )}
                                    </div>
                                    <h3 className="font-bold font-times leading-tight text-[#1b1b1b] group-hover:text-[#5170ff] transition-colors" style={{ fontSize: '28px' }}>
                                        {filtered[0].title}
                                    </h3>
                                    {filtered[0].subtitle && (
                                        <p className="font-inter text-sm mt-1 line-clamp-2 text-[#1b1b1b]/55">{filtered[0].subtitle}</p>
                                    )}
                                    <time className="font-inter font-medium block text-xs mt-2" style={{ color: 'rgba(27,27,27,0.4)' }}>
                                        {formatDate(filtered[0].published_at)}
                                    </time>
                                </article>
                            </Link>
                            {filtered.length > 1 && (
                                <>
                                    <div className="border-t border-[#1b1b1b]/25 my-6" />
                                    <div className="space-y-6">
                                        {filtered.slice(1).map((article, index) => (
                                            <Link key={article.slug} href={`/articles/${article.slug}`} className="group">
                                                <article className={`cursor-pointer flex gap-4 pb-4 ${index !== 0 ? 'pt-4 border-t border-[#1b1b1b]/25' : ''}`}>
                                                    <div className="w-28 aspect-[4/3] flex-shrink-0 bg-[#1b1b1b]/5 overflow-hidden relative">
                                                        {article.thumbnail_url ? (
                                                            <Image src={article.thumbnail_url} alt={article.title} fill className="object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-[#1b1b1b]/10">
                                                                <span className="text-[#1b1b1b]/30 text-xs">Art</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold font-times leading-snug text-[#1b1b1b] group-hover:text-[#5170ff] transition-colors line-clamp-3" style={{ fontSize: '20px' }}>
                                                            {article.title}
                                                        </h3>
                                                    </div>
                                                </article>
                                            </Link>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {filtered.length === 0 && activeCategory !== 'All' && (
                <section className="bg-white py-20">
                    <div className="max-w-7xl lg:max-w-5xl mx-auto px-6 text-center">
                        <p className="font-inter text-[#1b1b1b]/40">No articles in this category yet.</p>
                    </div>
                </section>
            )}

            <FooterNew />
        </>
    );
}
