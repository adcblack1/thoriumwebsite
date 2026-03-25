# Thorium Valley — Newsletter Formatting Guide

> **Purpose**: This file tells any AI assistant how to assemble a Thorium Valley newsletter edition from articles in the database. The output is a structured JSON that can be fed to the template engine to produce HTML email.

---

## Newsletter Edition Schema

```json
{
  "subject_emoji": "⚙️",
  "subject_line": "Open models rise as Moonshot sets $10B target",
  "date": "February 18, 2026",
  "intro": "Welcome back. Here's the intro paragraph summarizing today's edition...",
  "editor": "Thorium Valley",
  "banner_image_url": "/thumbnails/banner-2026-02-18.png",
  "articles": [
    {
      "slug": "article-slug-from-database",
      "category_label": "PRODUCTS",
      "title_plain": "Sonnet 4.6: ",
      "title_italic": "Anthropic goes beyond techies",
      "hero_image_url": "https://example.com/thumbnail.png",
      "body_html": "<p>Article body...</p><ul><li>Bullet point</li></ul>",
      "author_name": "Thorium Valley"
    }
  ],
  "links": {
    "news": [
      { "text": "Meta, Nvidia strike", "link_text": "multi-billion dollar deal for AI chips", "url": "https://..." }
    ],
    "products": [
      { "name": "Wordpress AI Assistant:", "description": "Built-in AI helper for websites.", "url": "https://..." }
    ],
    "jobs": [
      { "company": "OpenAI", "role": "AI Deployment Engineer", "url": "https://..." }
    ]
  },
  "sponsor": {
    "name": "SPONSOR NAME",
    "label": "TOGETHER WITH SPONSOR NAME",
    "title": "Your ad headline here",
    "hero_image_url": "https://...",
    "body_html": "<p>Ad copy...</p>",
    "cta_text": "Learn More",
    "cta_url": "https://..."
  }
}
```

### Banner Image

The `banner_image_url` is displayed **above the welcome/intro message** in the newsletter email. It is a full-width image at the top of the newsletter. This is different from article thumbnails.

- **Banner source location**: Banners are stored in `/Users/alexchun/Downloads/Main Thumnails/`. Always use the **highest-numbered file** (e.g., `t5.png` is newer than `t4.png`).
- Copy the banner to `thorium-valley/public/thumbnails/` as `banner-YYYY-MM-DD.png` (using the newsletter date)
- **Banners are NOT included in the content folder** — they must be fetched from `Main Thumnails/` separately
- The article preview thumbnail on the website is always the **article 1** thumbnail, NOT the banner

---

## Newsletter Database Schema (`newsletters-db.json`)

When ingesting a new newsletter, add a JSON object to `src/data/newsletters-db.json` with these fields:

```json
{
  "id": "february-22-2026",
  "slug": "february-22-2026",
  "title": "Thorium Valley | February 22, 2026",
  "date": "February 22, 2026",
  "intro": "Welcome back. ...",
  "toc": ["Article 1 title", "Article 2 title", "Article 3 title"],
  "article_slugs": ["article-1-slug", "article-2-slug", "article-3-slug"],
  "sign_off": "That's all for today...",
  "writers": "Jason Chen, Advait Prakash, Andrew Hales, and the Thorium Valley crew.",
  "banner_image_url": "/thumbnails/banner-2026-02-22.png",
  "published_at": "2026-02-22T13:00:00.000Z",
  "updated_at": "2026-02-22T13:00:00.000Z",
  "status": "published"
}
```

> **IMPORTANT:** The `article_slugs` must exactly match slugs in `articles-db.json`. The website uses these slugs to link newsletter articles to their full article pages. Each article's `hero_image_url` in the newsletter links to `/articles/{slug}`.

---

## Category → Section Label Map

Our 11 website categories map to newsletter section labels like this:

| Category | Newsletter Label |
|----------|-----------------|
| Big tech | BIG TECH |
| Startups | STARTUPS |
| Hardware | HARDWARE |
| Markets | MARKETS |
| Products | PRODUCTS |
| Research | RESEARCH |
| Policy | POLICY |
| Workforce | WORKFORCE |
| Enterprise | ENTERPRISE |
| Culture | CULTURE |
| Governance | GOVERNANCE |

The label is displayed in `#5170ff` (Thorium Valley blue) above the article title.

---

## How to Build a Newsletter Edition

1. **Pick 2-3 articles** from the database (usually today's most important stories)
2. **Write an intro paragraph** that ties together the day's themes. **The intro MUST start with "Welcome back."** — the website automatically renders this in bold.
3. **For each article**, use the `newsletter_content` field (condensed email version). If `newsletter_content` is empty, fall back to the full `content`. You can also override with custom `body_html` in the `articles[]` array.
4. **Split the title**: choose which words should be italic for emphasis (the subtitle/angle portion)
5. **Collect 5-8 "In Other News" links** — short one-line news items
6. **Add product launches and job listings** if available
7. **Optionally add a sponsor block** between articles 1 and 2 (or 2 and 3)

> **Note:** Each article has TWO content versions:
> - `content` — full-length website article
> - `newsletter_content` — condensed, punchier version for the email newsletter
>
> These are stored separately in the articles database. The newsletter should always use the condensed version.

> **Valley View Image:** In newsletters, the `<p><strong>Our Valley View</strong></p>` heading is automatically replaced with a branded image (`/thumbnails/valley-view-header.png`) at render time — both on the website and in the Beehiiv HTML export. **No manual changes needed.** Just keep using the standard `<p><strong>Our Valley View</strong></p>` format in the article database and the system handles the rest.

---

## Design Tokens (Thorium Valley brand)

```
Accent / Links:        #5170ff
Text color:            #2D2D2D
Heading color:         #2A2A2A
Secondary text:        #1b1b1b (with opacity)
Heading font:          'Times New Roman MT Std', 'Times New Roman', Georgia, serif — weight 500
Body font:             -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif — weight 500
Body font size:        16px, line-height 1.5
CTA button:            #5170ff background, #FFFFFF text
Card border:           #CDCDCD, 1px solid, 10px radius
Background:            #FFFFFF
Newsletter width:      780px (website), 670px (legacy email template)
```

---

## Example: Converting 3 Articles to Newsletter JSON

Given these article slugs from the database:
- `openai-announces-gpt-5-preview` (Big tech)
- `meta-llama-4-open-source` (Research)
- `ai-regulation-update-2026` (Policy)

Output:
```json
{
  "subject_emoji": "🚀",
  "subject_line": "GPT-5 preview arrives as open models close the gap",
  "date": "February 10, 2026",
  "intro": "Welcome back. OpenAI unveiled GPT-5 with breakthrough reasoning, Meta matched proprietary models with an open-source release, and the EU AI Act entered enforcement. Here's what matters.",
  "editor": "Thorium Valley",
  "articles": [
    {
      "slug": "openai-announces-gpt-5-preview",
      "category_label": "BIG TECH",
      "title_plain": "GPT-5 Preview: ",
      "title_italic": "OpenAI's breakthrough in reasoning",
      "hero_image_url": "/thumb-1.avif",
      "body_html": "<p>OpenAI has officially unveiled a preview of GPT-5...</p>",
      "author_name": "Thorium Valley"
    },
    {
      "slug": "meta-llama-4-open-source",
      "category_label": "RESEARCH",
      "title_plain": "",
      "title_italic": "Open models level up",
      "hero_image_url": "/thumb-4.avif",
      "body_html": "<p>Meta has released Llama 4...</p>",
      "author_name": "Thorium Valley"
    },
    {
      "slug": "ai-regulation-update-2026",
      "category_label": "POLICY",
      "title_plain": "EU AI Act: ",
      "title_italic": "What companies need to know",
      "hero_image_url": "/thumb-5.webp",
      "body_html": "<p>The European Union's AI Act...</p>",
      "author_name": "Thorium Valley"
    }
  ],
  "links": {
    "news": [
      { "text": "Google strikes deal with", "link_text": "Ormat for 150MW of geothermal energy", "url": "https://example.com" }
    ],
    "products": [],
    "jobs": []
  }
}
```

---

## Gmail Clipping Optimization

> **CRITICAL:** Gmail clips (truncates) any email whose raw HTML source exceeds **102 KB**. The clipped email shows "[Message clipped] View entire message" at the bottom. This counts ALL raw HTML text — tags, class names, content, image URL strings — but NOT the actual image file sizes (images load externally).

The Beehiiv export engine (`src/lib/beehiiv-export.ts`) is optimized to stay under this limit:

1. **Embedded `<style>` block** — Uses CSS classes (e.g., `class="tv-p"`) instead of repeating inline styles on every `<p>`, `<a>`, `<li>`, etc. Saves 50-70% on style-related HTML size.
2. **HTML minification** — Strips whitespace, newlines, and extra spaces between tags. Saves ~20-30%.
3. **Target: keep total HTML under 80 KB** to leave room for Beehiiv's footer/unsubscribe links.

If emails still get clipped, check:
- Beehiiv editor shows a **weight warning** near 102 KB — click it to see exact size
- View email source in Gmail ("Show original") to measure actual body size
- Shorten `newsletter_content` in articles if needed (the condensed versions should be punchier than full articles)

---

## Upload Methods

### Method 1: API
```bash
curl -X POST http://localhost:3000/api/newsletter/generate \
  -H "Content-Type: application/json" \
  -d '{ ... newsletter JSON ... }'
```

Returns the full HTML email string, ready to paste into Beehiiv or any email sender.

### Method 2: AI Workflow
1. Tell an AI: "Read `NEWSLETTER_FORMAT.md` and build today's newsletter from these articles: [paste slugs or article text]"
2. The AI outputs the JSON above
3. POST it to `/api/newsletter/generate` to get final HTML email

### Method 3: Beehiiv Export (recommended for email delivery)

After ingesting the newsletter into the database (see `PIPELINE_ORCHESTRATION.md`):

1. Visit `/newsletter/{slug}?admin=true`
2. Click **"📋 Copy Beehiiv HTML"** — the email-ready HTML is copied to clipboard
3. In Beehiiv editor, switch to HTML view and paste
4. All images and links point to `thoriumvalley.com` — no manual editing needed
5. Disable SEO in Beehiiv Settings → Website to avoid duplicate indexing

**API alternative:**
```bash
curl -s "https://thoriumvalley.com/api/beehiiv-export?slug=february-23-2026"
```

**Single article export:**
```bash
curl -s "https://thoriumvalley.com/api/beehiiv-export?article=article-slug-here"
```
