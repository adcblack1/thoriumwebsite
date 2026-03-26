import fs from 'fs';
import path from 'path';

export interface Newsletter {
    id: string;
    slug: string;
    title: string;
    date: string;
    intro: string;
    toc: string[];
    article_slugs: string[];
    sign_off: string;
    writers: string;
    banner_image_url?: string;
    published_at: string;
    updated_at: string;
    status: 'draft' | 'published';

    // LINKS section (every newsletter)
    links?: {
        news: { prefix?: string; link_text: string; rest: string; url: string }[];
        tools: { name: string; desc: string; url: string }[];
        jobs: { company: string; role: string; url: string }[];
    };

    // GAMES section — "AI or Real?" (every newsletter)
    games?: {
        game_poll_id?: string;  // Supabase poll ID for vote tracking
        image_a: string;
        image_b: string;
        link_a?: string;   // source URL (gemini) — used in Yesterday's Results only
        link_b?: string;   // source URL (unsplash) — used in Yesterday's Results only
    };

    // POLL section (every other newsletter)
    poll?: {
        poll_id?: string;  // Supabase poll ID for vote tracking
        question: string;
        options: string[];
    } | null;

    // POLL RESULTS (from previous newsletter's poll)
    poll_results?: {
        question: string;
        results: { option: string; pct: number }[];
    } | null;

    // YESTERDAY'S RESULTS (from previous newsletter's games)
    yesterdays_results?: {
        ai_image: string;
        real_image: string;
        ai_source: string;
        real_source: string;
    } | null;
}

const DB_PATH = path.join(process.cwd(), 'src/data/newsletters-db.json');

function readDB(): Newsletter[] {
    try {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function writeDB(newsletters: Newsletter[]): void {
    fs.writeFileSync(DB_PATH, JSON.stringify(newsletters, null, 2), 'utf-8');
}

// ── Query functions ──

export function getNewsletters(options?: {
    limit?: number;
    page?: number;
    status?: string;
    sort?: 'newest' | 'oldest';
}): { data: Newsletter[]; total: number; page: number } {
    let newsletters = readDB();

    const statusFilter = options?.status || 'published';
    if (statusFilter !== 'all') {
        newsletters = newsletters.filter((n) => n.status === statusFilter);
    }

    const sortDir = options?.sort || 'newest';
    newsletters.sort((a, b) => {
        const da = new Date(a.published_at).getTime();
        const db = new Date(b.published_at).getTime();
        return sortDir === 'newest' ? db - da : da - db;
    });

    const total = newsletters.length;
    const limit = options?.limit || 20;
    const page = options?.page || 1;
    const start = (page - 1) * limit;
    const data = newsletters.slice(start, start + limit);

    return { data, total, page };
}

export function getNewsletterBySlug(slug: string): Newsletter | null {
    const newsletters = readDB();
    return newsletters.find((n) => n.slug === slug) || null;
}

// ── Write functions ──

export function addNewsletter(input: {
    title: string;
    date: string;
    intro: string;
    toc: string[];
    article_slugs: string[];
    sign_off?: string;
    writers?: string;
    banner_image_url?: string;
    published_at?: string;
    status?: 'draft' | 'published';
    links?: Newsletter['links'];
    games?: Newsletter['games'];
    poll?: Newsletter['poll'];
    poll_results?: Newsletter['poll_results'];
    yesterdays_results?: Newsletter['yesterdays_results'];
}): Newsletter {
    const newsletters = readDB();
    const slug = input.date
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    const now = new Date().toISOString();

    const newsletter: Newsletter = {
        id: slug,
        slug,
        title: input.title,
        date: input.date,
        intro: input.intro,
        toc: input.toc,
        article_slugs: input.article_slugs,
        sign_off: input.sign_off || "That's all for today. If this issue made you think, share it with someone who needs to think harder.",
        writers: input.writers || 'Jason Chen, Advait Prakash, Andrew Hales, and the Thorium Valley crew.',
        banner_image_url: input.banner_image_url || '',
        published_at: input.published_at || now,
        updated_at: now,
        status: input.status || 'published',
        ...(input.links && { links: input.links }),
        ...(input.games && { games: input.games }),
        ...(input.poll !== undefined && { poll: input.poll }),
        ...(input.poll_results !== undefined && { poll_results: input.poll_results }),
        ...(input.yesterdays_results !== undefined && { yesterdays_results: input.yesterdays_results }),
    };

    newsletters.push(newsletter);
    writeDB(newsletters);
    return newsletter;
}
