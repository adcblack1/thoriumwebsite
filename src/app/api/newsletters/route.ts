import { getNewsletters } from '@/lib/newsletters';
import { getArticleCardsBySlugs } from '@/lib/articles';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const publication = searchParams.get('publication') || undefined;

    try {
        const { data: newsletters } = await getNewsletters({ limit, sort: 'newest', publication: publication || 'all' });

        // One batched query for every referenced article (title/subtitle/thumb
        // only) instead of a full-row query per slug per newsletter (old N+1).
        const articleCards = await getArticleCardsBySlugs(
            newsletters.flatMap(nl => nl.article_slugs || [])
        );

        const enriched = newsletters.map(nl => {
            // First slug that actually resolves (same behavior as the old
            // resolvedArticles.filter(Boolean)[0]).
            const firstSlug = (nl.article_slugs || []).find(s => articleCards.has(s));
            const firstArticle = firstSlug ? articleCards.get(firstSlug) : undefined;

            // For child newsletters with stories, use the first story's thumbnail
            const storyThumb = nl.stories?.[0]?.thumbnail_url;

            return {
                id: nl.id,
                slug: nl.slug,
                publication: nl.publication || 'thorium-valley',
                title: firstArticle?.title || nl.toc?.[0] || nl.stories?.[0]?.title || nl.title,
                subtitle: firstArticle?.subtitle || '',
                thumbnail_url: nl.thumbnail_url || firstArticle?.thumbnail_url || storyThumb || '',
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
