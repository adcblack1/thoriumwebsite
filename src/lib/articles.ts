import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Article {
    id: string;
    slug: string;
    title: string;
    subtitle: string;
    author: string;
    category: string;
    tags: string[];
    thumbnail_url: string;
    thumbnail_mobile_url?: string;
    published_at: string;
    updated_at: string;
    status: 'draft' | 'published';
    featured: boolean;
    reading_time: number;
    content: string;
    newsletter_content?: string;  // condensed version for email newsletter
    publication?: string;
}

// Map Supabase row → Article interface
function mapRow(row: any): Article {
    return {
        id: row.id || row.slug,
        slug: row.slug,
        title: row.headline || row.slug,
        subtitle: row.subtitle || row.hook || '',
        author: row.author || 'Thorium Valley',
        category: row.category || '',
        tags: row.tags || [],
        thumbnail_url: row.thumbnail_url || '',
        published_at: row.published_at || row.created_at || '',
        updated_at: row.updated_at || row.created_at || '',
        status: row.status || 'published',
        featured: row.featured || false,
        reading_time: row.reading_time || 4,
        content: row.body || '',
        newsletter_content: row.condensed_content || '',
        publication: row.newsletter || 'main',
    };
}

// ── Query functions ──

export async function getArticles(options?: {
    limit?: number;
    page?: number;
    category?: string;
    status?: string;
    sort?: 'newest' | 'oldest';
    publication?: string;
}): Promise<{ data: Article[]; total: number; page: number }> {
    const limit = options?.limit || 20;
    const page = options?.page || 1;
    const start = (page - 1) * limit;
    const statusFilter = options?.status || 'published';
    const sortDir = options?.sort || 'newest';

    let query = supabase
        .from('newsroom_articles')
        .select('*', { count: 'exact' });

    if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
    }
    if (options?.category) {
        query = query.ilike('category', options.category);
    }
    if (options?.publication) {
        query = query.eq('newsletter', options.publication);
    } else {
        // Exclude lab articles from public listings — lab content is newsletter-only
        query = query.neq('newsletter', 'lab');
    }

    query = query.order('published_at', { ascending: sortDir === 'oldest' });
    query = query.range(start, start + limit - 1);

    const { data, error, count } = await query;
    if (error) { console.error('getArticles error:', error); return { data: [], total: 0, page }; }

    return {
        data: (data || []).map(mapRow),
        total: count || 0,
        page,
    };
}

// Light batched lookup for newsletter cards — one query for many slugs, no
// article bodies. Replaces the per-slug getArticleBySlug N+1 in /api/newsletters.
export async function getArticleCardsBySlugs(
    slugs: string[]
): Promise<Map<string, { title: string; subtitle: string; thumbnail_url: string }>> {
    const unique = [...new Set(slugs.filter(Boolean))];
    const map = new Map<string, { title: string; subtitle: string; thumbnail_url: string }>();
    if (!unique.length) return map;
    const { data, error } = await supabase
        .from('newsroom_articles')
        .select('slug, headline, subtitle, hook, thumbnail_url')
        .in('slug', unique);
    if (error || !data) { console.error('getArticleCardsBySlugs error:', error); return map; }
    for (const row of data) {
        map.set(row.slug, {
            title: row.headline || row.slug,
            subtitle: row.subtitle || row.hook || '',
            thumbnail_url: row.thumbnail_url || '',
        });
    }
    return map;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
    const { data, error } = await supabase
        .from('newsroom_articles')
        .select('*')
        .eq('slug', slug)
        .single();
    if (error || !data) return null;
    return mapRow(data);
}

// Server-side article search for the nav search overlay. Light select (no bodies —
// the old client-side approach shipped a ~2 MB payload before it could match anything),
// case-insensitive across headline, hook, subtitle, and category.
export async function searchArticles(q: string, limit = 20): Promise<Array<{
    slug: string; title: string; subtitle: string; category: string; thumbnail_url: string;
}>> {
    // Sanitize: strip PostgREST or-filter delimiters + LIKE wildcards from user input
    const clean = q.replace(/[%_,()]/g, ' ').trim();
    if (clean.length < 2) return [];
    const pat = `%${clean}%`;
    const { data, error } = await supabase
        .from('newsroom_articles')
        .select('slug, headline, subtitle, hook, category, thumbnail_url')
        .eq('status', 'published')
        .neq('newsletter', 'lab')
        .or(`headline.ilike.${pat},hook.ilike.${pat},subtitle.ilike.${pat},category.ilike.${pat}`)
        .order('published_at', { ascending: false })
        .limit(limit);
    if (error) { console.error('searchArticles error:', error); return []; }
    return (data || []).map(row => ({
        slug: row.slug,
        title: row.headline || row.slug,
        subtitle: row.subtitle || row.hook || '',
        category: row.category || '',
        thumbnail_url: row.thumbnail_url || '',
    }));
}

export async function getArticlesByCategory(category: string, limit = 10): Promise<Article[]> {
    const { data, error } = await supabase
        .from('newsroom_articles')
        .select('*')
        .eq('status', 'published')
        .ilike('category', category)
        .order('published_at', { ascending: false })
        .limit(limit);
    if (error) { console.error('getArticlesByCategory error:', error); return []; }
    return (data || []).map(mapRow);
}

export async function getFeaturedArticles(limit = 5): Promise<Article[]> {
    // Get featured first, then fill with newest
    const { data: featured } = await supabase
        .from('newsroom_articles')
        .select('*')
        .eq('status', 'published')
        .eq('featured', true)
        .order('published_at', { ascending: false })
        .limit(limit);

    const featuredMapped = (featured || []).map(mapRow);
    if (featuredMapped.length >= limit) return featuredMapped.slice(0, limit);

    // Fill remaining with newest non-featured
    const remaining = limit - featuredMapped.length;
    const featuredSlugs = featuredMapped.map(a => a.slug);
    const { data: rest } = await supabase
        .from('newsroom_articles')
        .select('*')
        .eq('status', 'published')
        .not('slug', 'in', `(${featuredSlugs.map(s => `"${s}"`).join(',')})`)
        .order('published_at', { ascending: false })
        .limit(remaining);

    return [...featuredMapped, ...(rest || []).map(mapRow)];
}

// Canonical display order for category sections
const CATEGORY_ORDER = [
    'Big Tech', 'Markets', 'Culture', 'Startups', 'Products', 'Consumer',
    'Workforce', 'Enterprise', 'Governance', 'Research', 'Hardware', 'Policy',
];

export async function getCategorySections(limit = 4): Promise<{ category: string; articles: Article[] }[]> {
    const { data, error } = await supabase
        .from('newsroom_articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

    if (error) { console.error('getCategorySections error:', error); return []; }

    const allPublished = (data || []).map(mapRow);
    const grouped: Record<string, Article[]> = {};
    for (const a of allPublished) {
        const cat = a.category;
        if (!grouped[cat]) grouped[cat] = [];
        if (grouped[cat].length < limit) grouped[cat].push(a);
    }

    return CATEGORY_ORDER
        .filter((cat) => grouped[cat] && grouped[cat].length > 0)
        .map((cat) => ({ category: cat, articles: grouped[cat] }));
}

export async function getCategories(): Promise<string[]> {
    const { data, error } = await supabase
        .from('newsroom_articles')
        .select('category')
        .eq('status', 'published');

    if (error) { console.error('getCategories error:', error); return []; }
    const cats = new Set((data || []).map((r: any) => r.category));
    return CATEGORY_ORDER.filter((cat) => cats.has(cat));
}

export async function getCompanies(): Promise<string[]> {
    const { data, error } = await supabase
        .from('newsroom_articles')
        .select('tags')
        .eq('status', 'published');

    if (error) { console.error('getCompanies error:', error); return []; }
    const allTags = new Set((data || []).flatMap((r: any) => r.tags || []));
    // Return all unique tags as companies (no static order file needed)
    return Array.from(allTags).sort();
}

// ── Write functions ──

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

export async function addArticle(input: {
    title: string;
    subtitle?: string;
    author?: string;
    category: string;
    tags?: string[];
    thumbnail_url?: string;
    content: string;
    newsletter_content?: string;
    status?: 'draft' | 'published';
    featured?: boolean;
    published_at?: string;
    newsletter?: string;
    article_number?: number;
}): Promise<Article> {
    const now = new Date().toISOString();
    const slug = generateSlug(input.title);
    const edDate = (input.published_at || now).substring(0, 10);

    const row = {
        newsletter: input.newsletter || 'main',
        edition_date: edDate,
        article_number: input.article_number || 1,
        slug,
        headline: input.title,
        hook: input.subtitle || '',
        subtitle: input.subtitle || '',
        category: input.category,
        tags: input.tags || [],
        body: input.content,
        condensed_content: input.newsletter_content || '',
        thumbnail_url: input.thumbnail_url || '',
        featured: input.featured || false,
        author: input.author || 'Thorium Valley',
        status: input.status || 'published',
        published_at: input.published_at || now,
    };

    const { data, error } = await supabase
        .from('newsroom_articles')
        .insert(row)
        .select()
        .single();

    if (error) throw new Error(`addArticle failed: ${error.message}`);
    return mapRow(data);
}

export async function updateArticle(slug: string, updates: Partial<Article>): Promise<Article | null> {
    const mapped: any = {};
    if (updates.title !== undefined) mapped.headline = updates.title;
    if (updates.subtitle !== undefined) { mapped.subtitle = updates.subtitle; mapped.hook = updates.subtitle; }
    if (updates.content !== undefined) mapped.body = updates.content;
    if (updates.newsletter_content !== undefined) mapped.condensed_content = updates.newsletter_content;
    if (updates.category !== undefined) mapped.category = updates.category;
    if (updates.tags !== undefined) mapped.tags = updates.tags;
    if (updates.thumbnail_url !== undefined) mapped.thumbnail_url = updates.thumbnail_url;
    if (updates.featured !== undefined) mapped.featured = updates.featured;
    if (updates.status !== undefined) mapped.status = updates.status;
    if (updates.author !== undefined) mapped.author = updates.author;
    mapped.updated_at = new Date().toISOString();

    const { data, error } = await supabase
        .from('newsroom_articles')
        .update(mapped)
        .eq('slug', slug)
        .select()
        .single();

    if (error || !data) return null;
    return mapRow(data);
}

export async function deleteArticle(slug: string): Promise<boolean> {
    const { error } = await supabase
        .from('newsroom_articles')
        .delete()
        .eq('slug', slug);
    return !error;
}
