import { getArticles, getArticleBySlug } from '@/lib/articles';
import { SubscribeCTA } from '@/components/SubscribeCTA';
import { ArticleContent } from '@/components/ArticleContent';
import { SubscribeForm } from '@/components/subscribe-form';
import { FadeIn } from '@/components/FadeIn';
import { Navigation } from '@/components/navigation';
import { FooterNew } from '@/components/footer-new';
import { RecommendedArticles } from '@/components/RecommendedArticles';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

interface ArticlePageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps) {
    const { slug } = await params;
    const article = getArticleBySlug(slug);

    if (!article) {
        return { title: 'Article Not Found - Thorium Valley' };
    }

    return {
        title: `${article.title} - Thorium Valley`,
        description: article.subtitle || 'Read the latest AI news from Thorium Valley.',
    };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
    const { slug } = await params;
    const article = getArticleBySlug(slug);

    if (!article) {
        notFound();
    }

    const formattedDate = new Date(article.published_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    // Build share URLs
    const articleUrl = `https://thoriumvalley.com/articles/${slug}`;
    const shareText = encodeURIComponent(article.title);
    const shareUrl = encodeURIComponent(articleUrl);

    return (
        <>
            <Navigation scrollThreshold={150} heroBorder heroTheme="dark" scrolledTheme="blue" />

            {/* Thumbnail hero image */}
            {article.thumbnail_url && (
                <section className="bg-white pt-36 lg:pt-44">
                    <div className="max-w-[1100px] mx-auto article-hero-mobile">
                        <div className="relative w-full aspect-[16/9] overflow-hidden">
                            <Image
                                src={article.thumbnail_url}
                                alt={article.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    </div>
                </section>
            )}

            {/* Article header */}
            <section className={`bg-white ${article.thumbnail_url ? 'pt-8' : 'pt-40 lg:pt-48'} pb-4 article-header-mobile`}>
                <div className="max-w-[780px] mx-auto px-6">
                    {article.category && (
                        <span className="text-xs font-inter font-semibold uppercase tracking-widest text-[#5170ff] mb-3 block">
                            {article.category}
                        </span>
                    )}
                    <h1
                        className="font-times font-bold text-[#1b1b1b] mb-3 text-3xl lg:text-5xl article-headline-mobile"
                        style={{ letterSpacing: '-0.05em', lineHeight: 1.1 }}
                    >
                        {article.title}
                    </h1>

                    <time className="text-sm font-inter font-medium block" style={{ color: 'rgba(27,27,27,0.55)' }}>
                        {formattedDate}
                    </time>

                    {/* Share buttons */}
                    <div className="flex items-center gap-3 mt-4">
                        <span className="text-xs font-inter font-medium text-[#1b1b1b]/40 uppercase tracking-wider">Share</span>
                        <a
                            href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#1b1b1b]/40 hover:text-[#5170ff] transition-colors"
                            aria-label="Share on X"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                        </a>
                        <a
                            href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#1b1b1b]/40 hover:text-[#5170ff] transition-colors"
                            aria-label="Share on LinkedIn"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                        </a>
                        <a
                            href={`mailto:?subject=${shareText}&body=${shareUrl}`}
                            className="text-[#1b1b1b]/40 hover:text-[#5170ff] transition-colors"
                            aria-label="Share via Email"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                        </a>
                        <button
                            onClick={undefined}
                            className="text-[#1b1b1b]/40 hover:text-[#5170ff] transition-colors"
                            aria-label="Copy link"
                            data-copy-url={articleUrl}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                        </button>
                    </div>
                    <div className="border-b border-[#1b1b1b]/10 mt-6" />
                </div>
            </section>

            {/* ARTICLE CONTENT */}
            <article className="max-w-[780px] mx-auto px-6 py-10 bg-white">
                <FadeIn>
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        .article-body > p:first-of-type::first-letter {
                            font-family: 'Times New Roman', 'Times', serif;
                            font-size: 3.5em;
                            float: left;
                            line-height: 0.8;
                            padding-right: 8px;
                            padding-top: 4px;
                            color: #5170ff;
                            font-weight: bold;
                        }
                        .article-body p {
                            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif !important;
                            font-size: 20px !important;
                            font-weight: 500 !important;
                            line-height: 2.0 !important;
                            margin-bottom: 1.8em !important;
                        }
                        .article-body strong, .article-body b {
                            font-weight: inherit !important;
                        }
                        .article-body a {
                            color: #5170ff !important;
                            text-decoration: none;
                            border-bottom: 1px solid transparent;
                            transition: border-color 0.2s;
                        }
                        .article-body a:hover {
                            border-bottom-color: #5170ff;
                        }
                        .article-body h2, .article-body h3 {
                            font-family: var(--font-times), 'Times New Roman MT', 'Times New Roman', 'Times', serif !important;
                            letter-spacing: -0.04em;
                            margin-top: 2em;
                            margin-bottom: 0.5em;
                            font-size: 36px !important;
                            line-height: 1.15 !important;
                        }
                        .article-body ul {
                            list-style: none;
                            padding: 0 0 0 20px !important;
                            margin: 0 !important;
                        }
                        .article-body ul > li {
                            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif !important;
                            position: relative;
                            padding-left: 24px !important;
                            font-size: 20px !important;
                            font-weight: 500 !important;
                            line-height: 2.0 !important;
                            margin: 0 0 20px 0 !important;
                        }
                        .article-body ul > li::before {
                            content: '+';
                            position: absolute;
                            left: 0;
                            color: #5170ff;
                            font-weight: 600;
                        }
                        .article-body hr {
                            display: none !important;
                        }
                        .article-body .valley-view-heading {
                            font-family: var(--font-times), 'Times New Roman MT', 'Times New Roman', 'Times', serif !important;
                            font-size: 36px !important;
                            font-weight: 500 !important;
                            letter-spacing: -0.04em;
                            line-height: 1.15 !important;
                            margin-top: 2em !important;
                            margin-bottom: 0.8em !important;
                            color: #1b1b1b;
                            display: block;
                        }
                        .article-body .valley-view-inline {
                            font-family: var(--font-times), 'Times New Roman MT', 'Times New Roman', 'Times', serif !important;
                            font-size: 36px !important;
                            font-weight: 500 !important;
                            letter-spacing: -0.04em;
                            line-height: 1.15 !important;
                            color: #1b1b1b;
                        }
                        .article-body .valley-view-inline em {
                            font-style: italic;
                        }
                        .article-body p:has(.valley-view-inline) {
                            font-size: 20px !important;
                            font-weight: 500 !important;
                            line-height: 2.0 !important;
                            margin-top: 3em !important;
                        }
                        /* ── MOBILE OVERRIDES ── */
                        @media (max-width: 768px) {
                            .article-body p {
                                font-size: 18px !important;
                                line-height: 1.5 !important;
                                margin-bottom: 1.2em !important;
                            }
                            .article-body ul > li {
                                font-size: 18px !important;
                                line-height: 1.5 !important;
                            }
                            .article-body h2, .article-body h3 {
                                font-size: 28px !important;
                            }
                            .article-body .valley-view-heading,
                            .article-body .valley-view-inline {
                                font-size: 28px !important;
                            }
                            .article-body p:has(.valley-view-inline) {
                                font-size: 18px !important;
                                line-height: 1.5 !important;
                            }
                            .article-hero-mobile {
                                padding-left: 12px !important;
                                padding-right: 12px !important;
                            }
                            .article-header-mobile {
                                padding-top: 20px !important;
                            }
                            .article-headline-mobile {
                                font-size: 38px !important;
                            }
                        }
                    `}} />
                    <ArticleContent
                        className="article-body prose prose-lg max-w-none
              prose-headings:text-[#1b1b1b] prose-headings:font-bold
              prose-p:text-[#1b1b1b]
              prose-strong:text-[#1b1b1b]
              prose-ul:text-[#1b1b1b] prose-ol:text-[#1b1b1b]
              prose-blockquote:border-l-[#5170ff] prose-blockquote:text-[#1b1b1b]/80"
                        html={(article.content || '<p>Content not available.</p>')
                                .replace(/Our Valley View/g, 'Valley View')
                                .replace(/<p>\s*<strong>Valley View:?<\/strong>\s*<\/p>/g, '<h2 class="valley-view-heading">Valley View</h2>')
                                .replace(/<p>\s*<strong>Valley View:?<\/strong>\s*([\s\S]*?)<\/p>/g, '<h2 class="valley-view-heading">Valley View</h2><p>$1</p>')
                                .replace(/<p>---<\/p>/g, '')
                                .replace(/<hr\s*\/?>/g, '')}
                    />
                </FadeIn>



                {/* INLINE SUBSCRIBE */}
                <FadeIn delay={200}>
                    <div className="mt-16 p-8 border-2 border-[#1b1b1b]">
                        <h3 className="text-xl font-bold text-[#1b1b1b] mb-2">
                            Enjoyed this article?
                        </h3>
                        <p className="text-[#1b1b1b]/70 mb-4">
                            Get daily AI briefings delivered straight to your inbox.
                        </p>
                        <SubscribeForm variant="navbar" />
                    </div>
                </FadeIn>

                {/* RECOMMENDED ARTICLES */}
                <RecommendedArticles
                    currentSlug={slug}
                    currentCategory={article.category}
                />
            </article>

            <FooterNew />
        </>
    );
}
