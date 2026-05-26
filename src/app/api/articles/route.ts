import { NextRequest, NextResponse } from 'next/server';
import { getArticles } from '@/lib/articles';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit')) || 20;
    const page = Number(searchParams.get('page')) || 1;
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || 'published';

    const result = await getArticles({ limit, page, category, status });

    return NextResponse.json(result);
}
