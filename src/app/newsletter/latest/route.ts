import { NextResponse } from 'next/server';
import { getNewsletters } from '@/lib/newsletters';

export const dynamic = 'force-dynamic';

export async function GET() {
    const { data } = getNewsletters({ limit: 1, sort: 'newest' });

    if (data.length > 0) {
        return NextResponse.redirect(
            new URL(`/newsletter/${data[0].slug}`, process.env.NEXT_PUBLIC_SITE_URL || 'https://www.thoriumvalley.com'),
            { status: 302 }
        );
    }

    // Fallback: no newsletters found
    return NextResponse.redirect(
        new URL('/newsletter', process.env.NEXT_PUBLIC_SITE_URL || 'https://www.thoriumvalley.com'),
        { status: 302 }
    );
}
