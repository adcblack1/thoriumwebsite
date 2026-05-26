import { NextRequest, NextResponse } from 'next/server';
import { addArticle } from '@/lib/articles';

const VALID_CATEGORIES = [
    'Big tech', 'Startups', 'Hardware', 'Markets', 'Products',
    'Research', 'Policy', 'Workforce', 'Enterprise', 'Culture', 'Governance',
];

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate required fields
        if (!body.title || !body.content || !body.category) {
            return NextResponse.json(
                { error: 'Missing required fields: title, content, category' },
                { status: 400 }
            );
        }

        // Validate category
        if (!VALID_CATEGORIES.includes(body.category)) {
            return NextResponse.json(
                { error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` },
                { status: 400 }
            );
        }

        const article = await addArticle({
            title: body.title,
            subtitle: body.subtitle,
            author: body.author,
            category: body.category,
            tags: body.tags,
            thumbnail_url: body.thumbnail_url,
            content: body.content,
            newsletter_content: body.newsletter_content,
            status: body.status || 'published',
            featured: body.featured || false,
        });

        return NextResponse.json({ success: true, article }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || 'Failed to upload article' },
            { status: 500 }
        );
    }
}
