import { NextRequest, NextResponse } from 'next/server';
import { exportNewsletterForBeehiiv, exportArticleForBeehiiv, exportWelcomeForBeehiiv, exportLabForBeehiiv, exportMainForBeehiiv } from '@/lib/beehiiv-export';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const article = searchParams.get('article');
    const welcome = searchParams.get('welcome');
    const lab = searchParams.get('lab');
    const main = searchParams.get('main');

    if (!slug && !article && !lab && !main && welcome === null) {
        return NextResponse.json(
            { error: 'Provide ?slug=, ?article=, ?lab=true, ?main=true, or ?welcome=true' },
            { status: 400 }
        );
    }

    try {
        // ?main=true → most recent flagship edition
        // ?main=may-27-2026 → specific edition
        if (main !== null) {
            const mainSlug = main === 'true' || main === '' ? undefined : main;
            const result = await exportMainForBeehiiv(mainSlug);
            if (!result) {
                return NextResponse.json({ error: 'No main newsletter found' }, { status: 404 });
            }
            return NextResponse.json({ success: true, html: result.html, title: result.title });
        }

        // ?lab=true → most recent Lab edition
        // ?lab=lab-may-28-2026 → specific edition
        if (lab !== null) {
            const labSlug = lab === 'true' || lab === '' ? undefined : lab;
            const result = await exportLabForBeehiiv(labSlug);
            if (!result) {
                return NextResponse.json({ error: 'No Lab newsletter found' }, { status: 404 });
            }
            return NextResponse.json({ success: true, html: result.html, title: result.title });
        }

        if (welcome !== null) {
            const result = exportWelcomeForBeehiiv();
            return NextResponse.json({ success: true, html: result.html, title: result.title });
        }

        if (slug) {
            const result = await exportNewsletterForBeehiiv(slug);
            if (!result) {
                return NextResponse.json({ error: `Newsletter not found: ${slug}` }, { status: 404 });
            }
            return NextResponse.json({ success: true, html: result.html, newsletter_title: result.title });
        }

        if (article) {
            const result = await exportArticleForBeehiiv(article);
            if (!result) {
                return NextResponse.json({ error: `Article not found: ${article}` }, { status: 404 });
            }
            return NextResponse.json({ success: true, html: result.html, article_title: result.title });
        }
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || 'Failed to generate export' },
            { status: 500 }
        );
    }
}
