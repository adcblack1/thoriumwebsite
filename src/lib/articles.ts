import fs from 'fs';
import path from 'path';

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
}

const DB_PATH = path.join(process.cwd(), 'src/data/articles-db.json');

function readDB(): Article[] {
    try {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function writeDB(articles: Article[]): void {
    fs.writeFileSync(DB_PATH, JSON.stringify(articles, null, 2), 'utf-8');
}

// ── Query functions ──

export function getArticles(options?: {
    limit?: number;
    page?: number;
    category?: string;
    status?: string;
    sort?: 'newest' | 'oldest';
}): { data: Article[]; total: number; page: number } {
    let articles = readDB();

    // Filter by status (default: published only)
    const statusFilter = options?.status || 'published';
    if (statusFilter !== 'all') {
        articles = articles.filter((a) => a.status === statusFilter);
    }

    // Filter by category
    if (options?.category) {
        articles = articles.filter(
            (a) => a.category.toLowerCase() === options.category!.toLowerCase()
        );
    }

    // Sort
    const sortDir = options?.sort || 'newest';
    articles.sort((a, b) => {
        const da = new Date(a.published_at).getTime();
        const db = new Date(b.published_at).getTime();
        return sortDir === 'newest' ? db - da : da - db;
    });

    const total = articles.length;
    const limit = options?.limit || 20;
    const page = options?.page || 1;
    const start = (page - 1) * limit;
    const data = articles.slice(start, start + limit);

    return { data, total, page };
}

export function getArticleBySlug(slug: string): Article | null {
    const articles = readDB();
    return articles.find((a) => a.slug === slug) || null;
}

export function getArticlesByCategory(category: string, limit = 10): Article[] {
    const articles = readDB().filter(
        (a) => a.status === 'published' && a.category.toLowerCase() === category.toLowerCase()
    );
    articles.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    return articles.slice(0, limit);
}

export function getFeaturedArticles(limit = 5): Article[] {
    const articles = readDB().filter((a) => a.status === 'published');
    // Featured first, then by date
    articles.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
    });
    return articles.slice(0, limit);
}

// Canonical display order for category sections
const CATEGORY_ORDER = [
    'Big Tech', 'Markets', 'Culture', 'Startups', 'Products', 'Consumer',
    'Workforce', 'Enterprise', 'Governance', 'Research', 'Hardware', 'Policy',
];

export function getCategorySections(limit = 4): { category: string; articles: Article[] }[] {
    const allPublished = readDB().filter((a) => a.status === 'published');
    // Group by category
    const grouped: Record<string, Article[]> = {};
    for (const a of allPublished) {
        const cat = a.category;
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(a);
    }
    // Sort each group by newest first
    for (const cat of Object.keys(grouped)) {
        grouped[cat].sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
        grouped[cat] = grouped[cat].slice(0, limit);
    }
    // Return in canonical order, only categories that have articles
    return CATEGORY_ORDER
        .filter((cat) => grouped[cat] && grouped[cat].length > 0)
        .map((cat) => ({ category: cat, articles: grouped[cat] }));
}

export function getCategories(): string[] {
    const allPublished = readDB().filter((a) => a.status === 'published');
    const cats = new Set(allPublished.map((a) => a.category));
    return CATEGORY_ORDER.filter((cat) => cats.has(cat));
}

// ── Write functions ──

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

function estimateReadingTime(html: string): number {
    const text = html.replace(/<[^>]*>/g, '');
    const words = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 230));
}

export function addArticle(input: {
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
}): Article {
    const articles = readDB();
    const now = new Date().toISOString();
    const slug = generateSlug(input.title);

    // Prevent duplicate slugs
    let finalSlug = slug;
    let counter = 1;
    while (articles.some((a) => a.slug === finalSlug)) {
        finalSlug = `${slug}-${counter}`;
        counter++;
    }

    const article: Article = {
        id: finalSlug,
        slug: finalSlug,
        title: input.title,
        subtitle: input.subtitle || '',
        author: input.author || 'Thorium Valley',
        category: input.category,
        tags: input.tags || [],
        thumbnail_url: input.thumbnail_url || '',
        published_at: input.published_at || now,
        updated_at: now,
        status: input.status || 'published',
        featured: input.featured || false,
        reading_time: estimateReadingTime(input.content),
        content: input.content,
        newsletter_content: input.newsletter_content || '',
    };

    articles.push(article);
    writeDB(articles);
    return article;
}

export function updateArticle(slug: string, updates: Partial<Article>): Article | null {
    const articles = readDB();
    const idx = articles.findIndex((a) => a.slug === slug);
    if (idx === -1) return null;

    articles[idx] = {
        ...articles[idx],
        ...updates,
        updated_at: new Date().toISOString(),
    };
    writeDB(articles);
    return articles[idx];
}

export function deleteArticle(slug: string): boolean {
    const articles = readDB();
    const idx = articles.findIndex((a) => a.slug === slug);
    if (idx === -1) return false;
    articles.splice(idx, 1);
    writeDB(articles);
    return true;
}
