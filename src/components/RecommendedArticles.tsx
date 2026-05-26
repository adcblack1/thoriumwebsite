import Link from 'next/link';
import Image from 'next/image';
import { getArticles, getArticlesByCategory, type Article } from '@/lib/articles';

interface RecommendedArticlesProps {
    currentSlug: string;
    currentCategory: string;
    limit?: number;
}

export async function RecommendedArticles({ currentSlug, currentCategory, limit = 3 }: RecommendedArticlesProps) {
    // Same-category first, then fill with recent
    const sameCat = (await getArticlesByCategory(currentCategory, limit + 1))
        .filter(a => a.slug !== currentSlug);

    let recommended: Article[] = sameCat.slice(0, limit);

    if (recommended.length < limit) {
        const usedSlugs = new Set([currentSlug, ...recommended.map(a => a.slug)]);
        const recent = (await getArticles({ limit: limit + 5 })).data
            .filter((a: Article) => !usedSlugs.has(a.slug));
        recommended = [...recommended, ...recent].slice(0, limit);
    }

    if (recommended.length === 0) return null;

    return (
        <section className="mt-16 mb-16">
            {/* Section Header — matches front page category headers */}
            <div className="mb-6 border-b border-[#1b1b1b]/25 pb-3">
                <h2 className="font-times text-4xl lg:text-5xl font-bold uppercase" style={{ letterSpacing: '-0.05em', color: '#1b1b1b' }}>
                    More Articles
                </h2>
            </div>

            {/* DESKTOP: 3-column grid — thumbnail on top, category, title */}
            <div className="hidden md:grid md:grid-cols-3 gap-6">
                {recommended.map((article) => (
                    <Link key={article.slug} href={`/articles/${article.slug}`} className="group">
                        <article className="cursor-pointer">
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
                            </div>
                            <span className="font-inter font-semibold uppercase tracking-wider block text-xs mb-1" style={{ color: '#5170ff' }}>
                                {article.category}
                            </span>
                            <h3 className="font-bold font-times text-lg leading-snug text-[#1b1b1b] group-hover:text-[#5170ff] transition-colors">
                                {article.title}
                            </h3>
                        </article>
                    </Link>
                ))}
            </div>

            {/* MOBILE: Thumbnail-left list — matches front page mobile layout */}
            <div className="md:hidden space-y-0">
                {recommended.map((article, index) => (
                    <Link key={article.slug} href={`/articles/${article.slug}`} className="group">
                        <article className={`cursor-pointer flex gap-4 pb-4 ${index !== 0 ? 'pt-4 border-t border-[#1b1b1b]/25' : ''}`}>
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
                                <span className="font-inter font-semibold uppercase tracking-wider block text-[10px] mb-1" style={{ color: '#5170ff' }}>
                                    {article.category}
                                </span>
                                <h3 className="font-bold font-times text-sm leading-snug text-[#1b1b1b] group-hover:text-[#5170ff] transition-colors">
                                    {article.title}
                                </h3>
                            </div>
                        </article>
                    </Link>
                ))}
            </div>
        </section>
    );
}
