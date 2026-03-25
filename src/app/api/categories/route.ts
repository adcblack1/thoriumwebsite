import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/articles';

export async function GET() {
    return NextResponse.json(getCategories());
}
