import { getNewsletters } from '@/lib/newsletters';
import { getArticleBySlug } from '@/lib/articles';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    try {
        const { data: newsletters } = getNewsletters({ limit, sort: 'newest' });

        // Resolve article data for each newsletter
        const enriched = newsletters.map(nl => {
            const resolvedArticles = nl.article_slugs
                .map(s => getArticleBySlug(s))
                .filter(Boolean);

            const firstArticle = resolvedArticles[0];
            return {
                id: nl.id,
                slug: nl.slug,
                title: firstArticle?.title || nl.title,
                subtitle: firstArticle?.subtitle || '',
                thumbnail_url: firstArticle?.thumbnail_url || '',
                published_at: nl.published_at,
                toc: nl.toc,
                date: nl.date,
                intro: nl.intro,
                article_slugs: nl.article_slugs,
                sign_off: nl.sign_off,
                writers: nl.writers,
                banner_image_url: nl.banner_image_url || '',
            };
        });

        return NextResponse.json({ data: enriched });
    } catch (error) {
        console.error('Error fetching newsletters:', error);
        return NextResponse.json({ data: [], error: 'Failed to fetch newsletters' }, { status: 500 });
    }
}
