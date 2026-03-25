import { NextRequest, NextResponse } from 'next/server';
import { generateNewsletterHTML, NewsletterEdition } from '@/lib/newsletter-template';
import { getArticleBySlug } from '@/lib/articles';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // If article slugs are provided, pull content from database
        if (body.article_slugs && Array.isArray(body.article_slugs)) {
            const articles = body.article_slugs.map((slug: string) => {
                const dbArticle = getArticleBySlug(slug);
                if (!dbArticle) throw new Error(`Article not found: ${slug}`);
                return {
                    category_label: dbArticle.category.toUpperCase(),
                    title_plain: dbArticle.title,
                    title_italic: '',
                    hero_image_url: dbArticle.thumbnail_url || '',
                    body_html: dbArticle.content,
                    article_url: `https://thoriumvalley.com/articles/${dbArticle.slug}`,
                    author_name: dbArticle.author || 'Thorium Valley',
                };
            });

            const edition: NewsletterEdition = {
                subject_emoji: body.subject_emoji,
                subject_line: body.subject_line || 'Thorium Valley Daily',
                date: body.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                intro: body.intro || '',
                editor: body.editor || 'Thorium Valley',
                banner_image_url: body.banner_image_url,
                articles,
                links: body.links,
                sponsor: body.sponsor,
            };

            const html = generateNewsletterHTML(edition);
            return NextResponse.json({ success: true, html, subject: `${edition.subject_emoji || ''} ${edition.subject_line}`.trim() });
        }

        // Otherwise, expect a full NewsletterEdition object
        if (!body.articles || !Array.isArray(body.articles) || body.articles.length === 0) {
            return NextResponse.json(
                { error: 'Must provide either article_slugs or articles array' },
                { status: 400 }
            );
        }

        const edition: NewsletterEdition = {
            subject_emoji: body.subject_emoji,
            subject_line: body.subject_line || 'Thorium Valley Daily',
            date: body.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            intro: body.intro || '',
            editor: body.editor || 'Thorium Valley',
            banner_image_url: body.banner_image_url,
            articles: body.articles,
            links: body.links,
            sponsor: body.sponsor,
        };

        const html = generateNewsletterHTML(edition);
        return NextResponse.json({ success: true, html, subject: `${edition.subject_emoji || ''} ${edition.subject_line}`.trim() });

    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || 'Failed to generate newsletter' },
            { status: 500 }
        );
    }
}
