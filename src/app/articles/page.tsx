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
                // Extract unique categories in order
                const cats: string[] = [];
                arts.forEach((a: Article) => {
                    if (!cats.includes(a.category)) cats.push(a.category);
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

    const filtered = activeCategory === 'All'
        ? articles
        : articles.filter(a => a.category === activeCategory);

    return (
        <>
            <Navigation heroTheme="dark" scrollThreshold={100} />

            {/* White area behind the navbar */}
            <div className="bg-white h-[80px] lg:h-[155px]" />

            {/* Header + Category filters on blue bg — starts right below the navbar border */}
            <section style={{ backgroundColor: '#5170ff' }} className="pt-10 lg:pt-14 pb-0 -mt-px">
                <div className="max-w-7xl lg:max-w-5xl mx-auto px-6 pb-6">
                    <FadeIn>
                        <h1
                            className="font-times font-bold text-4xl lg:text-6xl uppercase"
                            style={{ letterSpacing: '-0.05em', lineHeight: 1.08, color: '#ffffff' }}
                        >
                            All Articles
                        </h1>
                    </FadeIn>
                </div>

                {/* Category filters */}
                <div className="sticky top-0 z-20 relative" style={{ backgroundColor: '#5170ff' }}>
                    {/* Right fade for mobile scroll hint */}
                    <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none lg:hidden" style={{ background: 'linear-gradient(to left, #5170ff 20%, transparent)' }} />
                    <div className="max-w-7xl lg:max-w-5xl mx-auto px-6 border-b border-white/20">
                        <div className="flex gap-6 overflow-x-auto py-3" style={{ scrollbarWidth: 'none' }}>
                            <style dangerouslySetInnerHTML={{ __html: '.cat-filters::-webkit-scrollbar { display: none; }' }} />
                            <button
                                onClick={() => setActiveCategory('All')}
                                className="font-inter text-xs font-semibold uppercase tracking-wider pb-2 whitespace-nowrap relative group"
                                style={{ color: '#ffffff' }}
                            >
                                All
                                <span
                                    className="absolute bottom-0 left-0 h-0.5 bg-white transition-all duration-300"
                                    style={{ width: activeCategory === 'All' ? '100%' : '0%' }}
                                />
                                {activeCategory !== 'All' && (
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300" />
                                )}
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className="font-inter text-xs font-semibold uppercase tracking-wider pb-2 whitespace-nowrap relative group"
                                    style={{ color: '#ffffff' }}
                                >
                                    {cat}
                                    <span
                                        className="absolute bottom-0 left-0 h-0.5 bg-white transition-all duration-300"
                                        style={{ width: activeCategory === cat ? '100%' : '0%' }}
                                    />
                                    {activeCategory !== cat && (
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* All articles – vertical list */}
            <section className="bg-white py-10">
                <div className="max-w-7xl lg:max-w-5xl mx-auto px-6 article-list">
                    {filtered.map((article, index) => (
                        <Link key={article.slug} href={`/articles/${article.slug}`} className="group block">
                            <article className={`flex gap-5 lg:gap-8 lg:flex-row-reverse pb-6 ${index !== 0 ? 'pt-6 border-t border-[#1b1b1b]/25' : ''}`}>
                                <div className="w-20 lg:w-80 aspect-square lg:aspect-video flex-shrink-0 self-start bg-[#1b1b1b]/5 overflow-hidden relative">
                                    {article.thumbnail_url ? (
                                        <Image
                                            src={article.thumbnail_url}
                                            alt={article.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-[#1b1b1b]/10">
                                            <span className="text-[#1b1b1b]/30 text-xs">Article</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <span className="font-inter font-semibold uppercase tracking-wider block text-[10px] lg:text-sm mb-1 lg:mb-2" style={{ color: '#5170ff' }}>
                                        {article.category}
                                    </span>
                                    <h3 className="font-bold font-times leading-snug text-[#1b1b1b] group-hover:text-[#5170ff] transition-colors line-clamp-2 text-sm" style={{ letterSpacing: '-0.03em' }}>
                                        {article.title}
                                    </h3>
                                    {article.subtitle && (
                                        <p className="font-inter text-xs lg:text-sm mt-1 lg:mt-2 line-clamp-1 text-[#1b1b1b]/55 group-hover:text-[#5170ff] transition-colors">
                                            {article.subtitle}
                                        </p>
                                    )}
                                    <time className="font-inter font-medium block text-[10px] lg:text-sm mt-1 lg:mt-2" style={{ color: 'rgba(27,27,27,0.4)' }}>
                                        {formatDate(article.published_at)}
                                    </time>
                                </div>
                            </article>
                        </Link>
                    ))}

                    {/* Desktop font size override + hover blue */}
                    <style dangerouslySetInnerHTML={{
                        __html: `
                      @media(min-width:1024px){.article-list h3{font-size:26px!important}}
                      .article-list .group:hover h3,
                      .article-list .group:hover p{color:#5170ff!important}
                    `}} />

                    {filtered.length === 0 && (
                        <div className="py-20 text-center">
                            <p className="font-inter text-[#1b1b1b]/40">No articles in this category yet.</p>
                        </div>
                    )}
                </div>
            </section>

            <FooterNew />
        </>
    );
}
