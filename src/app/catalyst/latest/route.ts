import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.redirect(
        new URL('/newsletter?category=catalyst', process.env.NEXT_PUBLIC_SITE_URL || 'https://www.thoriumvalley.com'),
        { status: 302 }
    );
}
