/**
 * One-time script to populate articles-db.json and newsletters-db.json
 * from the FEBRUARY 11TH CONTENT and FEBRUARY 12 CONTENT folders.
 *
 * Run: node --experimental-strip-types scripts/ingest-content.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const ARTICLES_DB = path.join(ROOT, 'src/data/articles-db.json');
const NEWSLETTERS_DB = path.join(ROOT, 'src/data/newsletters-db.json');

// ── Markdown → HTML ──

function mdToHtml(md: string): string {
    let html = md;

    // Remove the category line and title (first 4 lines) — we handle those separately
    // Keep only the body starting from the subtitle line
    const lines = html.split('\n');
    // Skip:  line0=CATEGORY  line1=blank  line2=# Title  line3=blank  line4=subtitle
    const bodyStart = 4; // subtitle is the first line of body
    html = lines.slice(bodyStart).join('\n');

    // Remove trailing ---
    html = html.replace(/\n---\s*$/, '');

    // Convert markdown to HTML
    // Bold: **text** → <strong>text</strong>
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic: *text* → <em>text</em>
    html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
    // Links: [text](url) → <a href="url">text</a>
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    // Remove ![](image) placeholders
    html = html.replace(/!\[.*?\]\(.*?\)\n?/g, '');

    // Process line by line
    const outputLines: string[] = [];
    const bodyLines = html.split('\n');
    let inList = false;
    let listType: 'ul' | 'ol' = 'ul';

    for (let i = 0; i < bodyLines.length; i++) {
        const line = bodyLines[i];
        const trimmed = line.trim();

        if (!trimmed) {
            if (inList) {
                outputLines.push(listType === 'ul' ? '</ul>' : '</ol>');
                inList = false;
            }
            continue;
        }

        // Headers
        if (trimmed.startsWith('## ')) {
            if (inList) { outputLines.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false; }
            outputLines.push(`<h2>${trimmed.slice(3)}</h2>`);
            continue;
        }
        if (trimmed.startsWith('### ')) {
            if (inList) { outputLines.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false; }
            outputLines.push(`<h3>${trimmed.slice(4)}</h3>`);
            continue;
        }

        // Unordered list items (- item or * item)
        if (/^[-*]\s/.test(trimmed)) {
            if (!inList) {
                outputLines.push('<ul>');
                inList = true;
                listType = 'ul';
            }
            outputLines.push(`<li>${trimmed.replace(/^[-*]\s/, '')}</li>`);
            continue;
        }

        // Ordered list items (1. item)
        if (/^\d+\.\s/.test(trimmed)) {
            if (!inList) {
                outputLines.push('<ol>');
                inList = true;
                listType = 'ol';
            }
            outputLines.push(`<li>${trimmed.replace(/^\d+\.\s/, '')}</li>`);
            continue;
        }

        // Regular paragraph
        if (inList) { outputLines.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false; }
        outputLines.push(`<p>${trimmed}</p>`);
    }

    if (inList) {
        outputLines.push(listType === 'ul' ? '</ul>' : '</ol>');
    }

    return outputLines.join('\n');
}

function parseArticleMd(md: string): { category: string; title: string; subtitle: string; body: string } {
    const lines = md.split('\n');
    const category = lines[0].trim();
    const title = lines[2].replace(/^#\s*/, '').trim();
    const subtitle = lines[4]?.trim() || '';
    const bodyHtml = mdToHtml(md);
    return { category, title, subtitle, body: bodyHtml };
}

function estimateReadingTime(html: string): number {
    const text = html.replace(/<[^>]*>/g, '');
    const words = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 230));
}

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

function randomTimeOnDate(dateStr: string): string {
    // dateStr like "2026-02-10"
    const hour = Math.floor(Math.random() * 14) + 6; // 6am-8pm
    const min = Math.floor(Math.random() * 60);
    const sec = Math.floor(Math.random() * 60);
    return `${dateStr}T${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}Z`;
}

// ── Ingest ──

interface ArticleData {
    id: string;
    slug: string;
    title: string;
    subtitle: string;
    author: string;
    category: string;
    tags: string[];
    thumbnail_url: string;
    published_at: string;
    updated_at: string;
    status: string;
    featured: boolean;
    reading_time: number;
    content: string;
}

interface NewsletterData {
    id: string;
    slug: string;
    title: string;
    date: string;
    intro: string;
    toc: string[];
    article_slugs: string[];
    sign_off: string;
    writers: string;
    published_at: string;
    updated_at: string;
    status: string;
}

function parseNewsletterMd(md: string): { title: string; intro: string; toc: string[] } {
    const lines = md.split('\n');
    const title = lines[0].replace(/^#\s*/, '').trim();
    const intro = lines[2]?.trim() || '';

    // Extract TOC items (lines starting with number + .)
    const toc: string[] = [];
    for (const line of lines) {
        const match = line.match(/^\d+\.\s+(.+)$/);
        if (match) toc.push(match[1].trim());
    }

    return { title, intro, toc };
}

const CONTENT_BASE = path.resolve(ROOT, '..');

// Articles are ALWAYS published the day BEFORE the newsletter.
// Only specify the newsletter date — article date is computed automatically.
function dayBefore(isoDate: string): string {
    const d = new Date(isoDate + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
}

const contentDays = [
    {
        folder: 'FEBRUARY 11TH CONTENT',
        newsletterDate: 'February 11, 2026',
        newsletterDateISO: '2026-02-11',
        thumbPrefix: 'feb11',
    },
    {
        folder: 'FEBRUARY 12 CONTENT',
        newsletterDate: 'February 12, 2026',
        newsletterDateISO: '2026-02-12',
        thumbPrefix: 'feb12',
    },
].map(day => ({ ...day, articleDateBase: dayBefore(day.newsletterDateISO) }));

const CATEGORY_TAGS: Record<string, string[]> = {
    'Markets': ['Markets', 'Stocks', 'SaaS'],
    'Governance': ['Energy', 'Policy', 'Infrastructure'],
    'Enterprise': ['Enterprise', 'AI Adoption', 'McKinsey'],
    'Workforce': ['Layoffs', 'Employment', 'AI Impact'],
    'Big tech': ['Elon Musk', 'xAI', 'SpaceX'],
    'Hardware': ['Nvidia', 'Semiconductors', 'Gaming'],
    'MARKETS': ['Markets', 'Stocks', 'SaaS'],
    'GOVERNANCE': ['Energy', 'Policy', 'Infrastructure'],
    'ENTERPRISE': ['Enterprise', 'AI Adoption', 'McKinsey'],
    'WORKFORCE': ['Layoffs', 'Employment', 'AI Impact'],
    'BIG TECH': ['Elon Musk', 'xAI', 'SpaceX'],
    'HARDWARE': ['Nvidia', 'Semiconductors', 'Gaming'],
};

const allArticles: ArticleData[] = [];
const allNewsletters: NewsletterData[] = [];

for (const day of contentDays) {
    const dirPath = path.join(CONTENT_BASE, day.folder);
    const articleSlugs: string[] = [];

    // Process 3 articles
    for (let i = 1; i <= 3; i++) {
        const md = fs.readFileSync(path.join(dirPath, `article_${i}.md`), 'utf-8');
        const { category, title, subtitle, body } = parseArticleMd(md);

        const slug = generateSlug(title);
        const pubDate = randomTimeOnDate(day.articleDateBase);

        // Normalize category to title case
        const normalizedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
        // Handle multi-word categories
        const catDisplay = category === 'BIG TECH' || category === 'Big tech' ? 'Big tech' : normalizedCategory;

        const article: ArticleData = {
            id: slug,
            slug,
            title,
            subtitle,
            author: 'Thorium Valley',
            category: catDisplay,
            tags: CATEGORY_TAGS[category] || [catDisplay],
            thumbnail_url: `/thumbnails/${day.thumbPrefix}-${i}.png`,
            published_at: pubDate,
            updated_at: pubDate,
            status: 'published',
            featured: i === 1,
            reading_time: estimateReadingTime(body),
            content: body,
        };

        allArticles.push(article);
        articleSlugs.push(slug);
    }

    // Process newsletter
    const nlFile = fs.readdirSync(dirPath).find(f => f.startsWith('newsletter_'));
    if (nlFile) {
        const nlMd = fs.readFileSync(path.join(dirPath, nlFile), 'utf-8');
        const { title, intro, toc } = parseNewsletterMd(nlMd);
        const nlSlug = day.newsletterDate.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        const newsletter: NewsletterData = {
            id: nlSlug,
            slug: nlSlug,
            title,
            date: day.newsletterDate,
            intro,
            toc,
            article_slugs: articleSlugs,
            sign_off: "That's all for today. If this issue made you think, share it with someone who needs to think harder.",
            writers: 'Jason Chen, Advait Prakash, Andrew Hales, and the Thorium Valley crew.',
            published_at: `${day.newsletterDateISO}T08:00:00Z`,
            updated_at: `${day.newsletterDateISO}T08:00:00Z`,
            status: 'published',
        };

        allNewsletters.push(newsletter);
    }
}

// Write databases
fs.writeFileSync(ARTICLES_DB, JSON.stringify(allArticles, null, 2), 'utf-8');
fs.writeFileSync(NEWSLETTERS_DB, JSON.stringify(allNewsletters, null, 2), 'utf-8');

console.log(`✅ Ingested ${allArticles.length} articles and ${allNewsletters.length} newsletters`);
console.log('\nArticles:');
for (const a of allArticles) {
    console.log(`  - [${a.category}] ${a.title} → /articles/${a.slug} (${a.published_at})`);
}
console.log('\nNewsletters:');
for (const n of allNewsletters) {
    console.log(`  - ${n.title} → /newsletter/${n.slug} (articles: ${n.article_slugs.join(', ')})`);
}
