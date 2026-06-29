import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Newsletter {
    id: string;
    slug: string;
    publication?: string; // 'thorium-valley' | 'the-catalyst' | 'the-lab'
    title: string;
    date: string;
    intro: string;
    toc: string[];
    article_slugs: string[];
    stories?: {
        title: string;
        category: string;
        thumbnail_url: string;
        content: string;
    }[];
    sign_off: string;
    writers: string;
    banner_image_url?: string;
    thumbnail_url?: string;
    published_at: string;
    updated_at: string;
    status: 'draft' | 'published';
    description?: string;

    links?: {
        news: { prefix?: string; link_text: string; rest: string; url: string }[];
        tools: { name: string; desc: string; url: string; sponsored?: boolean }[];
        jobs: { company: string; role: string; url: string }[];
    };

    games?: {
        game_poll_id?: string;
        image_a: string;
        image_b: string;
        link_a?: string;
        link_b?: string;
    };

    poll?: {
        poll_id?: string;
        question: string;
        options: string[];
    } | null;

    poll_results?: {
        question: string;
        results: { option: string; pct: number }[];
    } | null;

    yesterdays_results?: {
        ai_image: string;
        real_image: string;
        ai_source: string;
        real_source: string;
    } | null;
}

// Map newsletter column values to publication names
const NL_MAP: Record<string, string> = {
    'main': 'thorium-valley',
    'catalyst': 'the-catalyst',
    'lab': 'the-lab',
};

const PUB_TO_NL: Record<string, string> = {
    'thorium-valley': 'main',
    'the-catalyst': 'catalyst',
    'the-lab': 'lab',
};

// Some Catalyst/Lab issues were ingested with the "IN THIS ISSUE" TOC block still
// appended to the intro. The TOC is rendered separately from `toc`, so strip that
// trailing block here — the single load chokepoint — to avoid showing it twice.
function stripInThisIssue(intro: string): string {
    const i = intro.search(/\n+[ \t#>*]*IN (?:THIS ISSUE|TODAY.?S EDITION)\b/i);
    return i === -1 ? intro : intro.slice(0, i).trimEnd();
}

// The `links` JSONB is auto-populated by an external pipeline that sometimes writes
// MALFORMED items: the whole "- [Name](url): desc" markdown dumped into name/company
// (url empty), and a stray "-" prefix on news headlines. Every reader goes through
// mapRow, so we repair on read here — the site and exports stay clean no matter what
// the pipeline writes. (See also vibe3-site/exports/gen-*.js which carry the same guard.)
function parseMdLink(text?: string, fallbackUrl?: string) {
    const m = (text || '').match(/^\s*[-*]?\s*\[([^\]]+)\]\(([^)]+)\)\s*:?\s*([\s\S]*)$/);
    if (m) return { name: m[1].trim(), url: m[2].trim(), rest: m[3].trim() };
    return { name: (text || '').replace(/^\s*[-*]\s*/, '').trim(), url: fallbackUrl || '', rest: '' };
}

function normalizeLinks(links: any) {
    if (!links || typeof links !== 'object') return links || undefined;
    const hasMd = (s?: string) => /\[[^\]]+\]\([^)]+\)/.test(s || '');
    const fixPrefix = (p?: string) => { const s = (p || '').replace(/^\s*[-*]\s*/, '').trim(); return s ? s + ' ' : ''; };
    const out: any = { ...links };
    if (Array.isArray(links.news)) out.news = links.news.map((n: any) =>
        hasMd(n?.link_text)
            ? ((p) => ({ prefix: fixPrefix(n.prefix), link_text: p.name, url: p.url || n.url || '', rest: p.rest || n.rest || '' }))(parseMdLink(n.link_text, n.url))
            : { ...n, prefix: fixPrefix(n?.prefix) });
    if (Array.isArray(links.tools)) out.tools = links.tools.map((t: any) =>
        hasMd(t?.name)
            ? ((p) => ({ name: p.name, url: p.url, desc: p.rest, sponsored: !!t.sponsored }))(parseMdLink(t.name, t.url))
            : t);
    if (Array.isArray(links.jobs)) out.jobs = links.jobs.map((j: any) =>
        hasMd(j?.company)
            ? ((p) => ({ company: p.name, url: p.url, role: p.rest, salary: j.salary || '' }))(parseMdLink(j.company, j.url))
            : j);
    return out;
}

function mapRow(row: any): Newsletter {
    return {
        id: row.id || row.slug,
        slug: row.slug || '',
        publication: NL_MAP[row.newsletter] || row.newsletter,
        title: row.title || '',
        date: row.date || '',
        intro: stripInThisIssue(row.intro || ''),
        toc: row.toc || [],
        article_slugs: row.article_slugs || [],
        sign_off: row.sign_off || '',
        writers: row.writers || '',
        banner_image_url: row.banner_image_url || '',
        thumbnail_url: row.thumbnail_url || '',
        published_at: row.published_at || row.created_at || '',
        updated_at: row.created_at || '',
        status: row.status || 'published',
        description: row.description || '',
        stories: row.stories || undefined,
        links: normalizeLinks(row.links),
        games: row.games || undefined,
        poll: row.poll || undefined,
        poll_results: row.poll_results || undefined,
        yesterdays_results: row.yesterdays_results || undefined,
    };
}

// ── Query functions ──

export async function getNewsletters(options?: {
    limit?: number;
    page?: number;
    status?: string;
    sort?: 'newest' | 'oldest';
    publication?: string;
}): Promise<{ data: Newsletter[]; total: number; page: number }> {
    const limit = options?.limit || 20;
    const page = options?.page || 1;
    const start = (page - 1) * limit;
    const statusFilter = options?.status || 'published';
    const sortDir = options?.sort || 'newest';

    let query = supabase
        .from('published_newsletters')
        .select('*', { count: 'exact' });

    if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
    }

    // Publication filter
    if (options?.publication && options.publication !== 'all') {
        const nlVal = PUB_TO_NL[options.publication] || options.publication;
        query = query.eq('newsletter', nlVal);
    }
    // Default: flagship only (when no publication specified)
    if (!options?.publication) {
        query = query.eq('newsletter', 'main');
    }

    query = query.order('published_at', { ascending: sortDir === 'oldest' });
    query = query.range(start, start + limit - 1);

    const { data, error, count } = await query;
    if (error) { console.error('getNewsletters error:', error); return { data: [], total: 0, page }; }

    return {
        data: (data || []).map(mapRow),
        total: count || 0,
        page,
    };
}

export async function getCatalystNewsletters(options?: {
    limit?: number;
    sort?: 'newest' | 'oldest';
}): Promise<{ data: Newsletter[]; total: number }> {
    const result = await getNewsletters({ ...options, publication: 'the-catalyst' });
    return { data: result.data, total: result.total };
}

export async function getLabNewsletters(options?: {
    limit?: number;
    sort?: 'newest' | 'oldest';
}): Promise<{ data: Newsletter[]; total: number }> {
    const result = await getNewsletters({ ...options, publication: 'the-lab' });
    return { data: result.data, total: result.total };
}

export async function getNewsletterBySlug(slug: string): Promise<Newsletter | null> {
    const { data, error } = await supabase
        .from('published_newsletters')
        .select('*')
        .eq('slug', slug)
        .single();
    if (error || !data) return null;
    return mapRow(data);
}

// ── Write functions ──

export async function addNewsletter(input: {
    title: string;
    date: string;
    intro: string;
    toc: string[];
    article_slugs: string[];
    publication?: string;
    sign_off?: string;
    writers?: string;
    banner_image_url?: string;
    thumbnail_url?: string;
    published_at?: string;
    status?: 'draft' | 'published';
    links?: Newsletter['links'];
    games?: Newsletter['games'];
    poll?: Newsletter['poll'];
    poll_results?: Newsletter['poll_results'];
    yesterdays_results?: Newsletter['yesterdays_results'];
}): Promise<Newsletter> {
    const now = new Date().toISOString();
    const slug = input.date
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    const nlType = PUB_TO_NL[input.publication || 'thorium-valley'] || 'main';
    const edDate = (input.published_at || now).substring(0, 10);

    const row = {
        newsletter: nlType,
        edition_date: edDate,
        slug,
        title: input.title,
        date: input.date,
        intro: input.intro,
        toc: input.toc,
        article_slugs: input.article_slugs,
        sign_off: input.sign_off || "That's all for today. If this issue made you think, share it with someone who needs to think harder.",
        writers: input.writers || 'Jason Chen, Advait Prakash, Andrew Hales, and the Thorium Valley crew.',
        banner_image_url: input.banner_image_url || '',
        thumbnail_url: input.thumbnail_url || '',
        status: input.status || 'published',
        published_at: input.published_at || now,
        links: input.links || null,
        poll: input.poll || null,
        games: input.games || null,
        poll_results: input.poll_results || null,
        yesterdays_results: input.yesterdays_results || null,
    };

    const { data, error } = await supabase
        .from('published_newsletters')
        .insert(row)
        .select()
        .single();

    if (error) throw new Error(`addNewsletter failed: ${error.message}`);
    return mapRow(data);
}
