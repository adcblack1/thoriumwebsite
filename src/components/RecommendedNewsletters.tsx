import Link from 'next/link';
import Image from 'next/image';
import { getNewsletters, type Newsletter } from '@/lib/newsletters';
import { getArticleBySlug } from '@/lib/articles';

interface RecommendedNewslettersProps {
    currentSlug: string;
    limit?: number;
}

export function RecommendedNewsletters({ currentSlug, limit = 3 }: RecommendedNewslettersProps) {
    // Get recent newsletters excluding current
    const all = getNewsletters({ limit: limit + 1 });
    const recommended = all.data
        .filter((n: Newsletter) => n.slug !== currentSlug)
        .slice(0, limit);

    if (recommended.length === 0) return null;

    // For each newsletter, get the first article's thumbnail
    const items = recommended.map((nl: Newsletter) => {
        const firstSlug = nl.article_slugs?.[0];
        const firstArticle = firstSlug ? getArticleBySlug(firstSlug) : null;
        return {
            ...nl,
            firstArticleThumbnail: firstArticle?.thumbnail_url || nl.banner_image_url,
            firstHeadline: nl.toc?.[0] || nl.title,
        };
    });

    return (
        <section style={{ padding: '0 15px', marginTop: '32px', marginBottom: '48px' }}>
            {/* Section Header — blue Times uppercase, matching front page */}
            <div className="mb-6 border-b border-[#1b1b1b]/20 pb-3">
                <h2 className="font-times text-4xl lg:text-5xl font-bold uppercase" style={{ letterSpacing: '-0.05em', color: '#1b1b1b' }}>
                    More Editions
                </h2>
            </div>

            {/* DESKTOP: 3-column grid — first article thumbnail, first headline only */}
            <div className="hidden md:grid md:grid-cols-3 gap-6">
                {items.map((item) => (
                    <Link key={item.id} href={`/newsletter/${item.slug}`} className="group">
                        <article className="cursor-pointer">
                            <div className="aspect-video relative overflow-hidden bg-white/5 mb-3">
                                {item.firstArticleThumbnail ? (
                                    <Image
                                        src={item.firstArticleThumbnail}
                                        alt={item.firstHeadline}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-white/10">
                                        <span className="text-white/30 text-xs">Newsletter</span>
                                    </div>
                                )}
                            </div>
                            <h3 className="font-bold font-times text-lg leading-snug text-white group-hover:text-[#5170ff] transition-colors">
                                {item.firstHeadline}
                            </h3>
                        </article>
                    </Link>
                ))}
            </div>

            {/* MOBILE: Thumbnail-left list — first article thumbnail, first headline only */}
            <div className="md:hidden space-y-0">
                {items.map((item, index: number) => (
                    <Link key={item.id} href={`/newsletter/${item.slug}`} className="group block">
                        <article className={`cursor-pointer flex gap-4 pb-4 ${index !== 0 ? 'pt-4 border-t border-white/25' : ''}`}>
                            <div className="w-20 aspect-square flex-shrink-0 bg-white/5 overflow-hidden relative">
                                {item.firstArticleThumbnail ? (
                                    <Image
                                        src={item.firstArticleThumbnail}
                                        alt={item.firstHeadline}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-white/10">
                                        <span className="text-white/30 text-xs">Newsletter</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <h3 className="font-bold font-times text-sm leading-snug text-white group-hover:text-[#5170ff] transition-colors">
                                    {item.firstHeadline}
                                </h3>
                            </div>
                        </article>
                    </Link>
                ))}
            </div>
        </section>
    );
}
