import { NextRequest, NextResponse } from 'next/server';
import { searchArticles } from '@/lib/articles';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const results = await searchArticles(q);
    return NextResponse.json({ data: results });
}
