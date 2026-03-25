import { NextRequest, NextResponse } from 'next/server';
import { exportNewsletterForBeehiiv, exportArticleForBeehiiv, exportWelcomeForBeehiiv } from '@/lib/beehiiv-export';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const article = searchParams.get('article');
    const welcome = searchParams.get('welcome');

    if (!slug && !article && welcome === null) {
        return NextResponse.json(
            { error: 'Provide ?slug=newsletter-slug or ?article=article-slug or ?welcome=true' },
            { status: 400 }
        );
    }

    try {
        if (welcome !== null) {
            const result = exportWelcomeForBeehiiv();
            return NextResponse.json({
                success: true,
                html: result.html,
                title: result.title,
            });
        }

        if (slug) {
            const result = exportNewsletterForBeehiiv(slug);
            if (!result) {
                return NextResponse.json({ error: `Newsletter not found: ${slug}` }, { status: 404 });
            }
            return NextResponse.json({
                success: true,
                html: result.html,
                newsletter_title: result.title,
            });
        }

        if (article) {
            const result = exportArticleForBeehiiv(article);
            if (!result) {
                return NextResponse.json({ error: `Article not found: ${article}` }, { status: 404 });
            }
            return NextResponse.json({
                success: true,
                html: result.html,
                article_title: result.title,
            });
        }
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || 'Failed to generate export' },
            { status: 500 }
        );
    }
}
