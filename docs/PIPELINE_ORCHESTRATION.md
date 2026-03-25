# Thorium Valley — Pipeline Orchestration

> **Purpose**: Master directive governing the full content lifecycle — from raw articles through database ingestion to Beehiiv email delivery. Every AI assistant working on Thorium Valley content MUST read this file first.

---

## Pipeline Overview

```
Phase 1          Phase 2              Phase 3            Phase 4
CONTENT    →     INGESTION      →     WEBSITE      →     BEEHIIV EXPORT
(raw .md)        (→ JSON DBs)         (auto-renders)     (→ paste into Beehiiv)
```

| Phase | Input | Output | Directive |
|-------|-------|--------|-----------|
| 1. Content | Raw articles + newsletter markdown | Reviewed `.md` files | Writer guidelines |
| 2. Ingestion | `.md` files + thumbnails + banner | `articles-db.json`, `newsletters-db.json`, `/public/thumbnails/` | [ARTICLE_FORMAT.md](file:///Users/alexchun/Downloads/Thorium%20Valley%20Website/ARTICLE_FORMAT.md), [NEWSLETTER_FORMAT.md](file:///Users/alexchun/Downloads/Thorium%20Valley%20Website/NEWSLETTER_FORMAT.md) |
| 3. Website | JSON databases | Live pages at thoriumvalley.com | Automatic — no action needed |
| 4. Beehiiv Export | JSON databases | Self-contained HTML for email | This file (below) |

---

## Phase 1: Content

Articles and newsletters are written externally and delivered as a content folder:

```
MONTH DD CONTENT/
├── article_1.md
├── article_2.md
├── article_3.md
├── newsletter_latest.md
├── thumbnail_1_vN.png
├── thumbnail_2_vN.png
├── thumbnail_3_vN.png
└── banner_YYYY-MM-DD.png
```

No pipeline action required in this phase — content arrives ready for ingestion.

---

## Phase 2: Ingestion

**Full instructions:** [ARTICLE_FORMAT.md](file:///Users/alexchun/Downloads/Thorium%20Valley%20Website/ARTICLE_FORMAT.md) and [NEWSLETTER_FORMAT.md](file:///Users/alexchun/Downloads/Thorium%20Valley%20Website/NEWSLETTER_FORMAT.md)

**Summary of steps:**

### 2a. Images
1. Rename `thumbnail_N_vN.png` → `{article-title-slug}.png`
2. Rename `banner_YYYY-MM-DD.png` → `banner-YYYY-MM-DD.png`
3. Copy all to `thorium-valley/public/thumbnails/`

### 2b. Articles → `articles-db.json`
For each article:
1. Parse category, title, tags from the `.md` file
2. Convert markdown body → valid HTML (see ARTICLE_FORMAT.md rules)
3. Extract the condensed `newsletter_content` from the newsletter `.md`
4. Generate: `id`, `slug`, `reading_time`, `published_at`, `updated_at`
5. Set `thumbnail_url` to renamed path
6. Append to `src/data/articles-db.json`

### 2c. Newsletter → `newsletters-db.json`
1. Extract: `intro`, `toc`, `sign_off`, `writers`
2. Set `article_slugs` (must match slugs from 2b exactly)
3. Set `banner_image_url` to renamed banner path
4. Generate: `id`, `slug`, `published_at`, `updated_at`
5. Append to `src/data/newsletters-db.json`

### 2d. Verify
- All `article_slugs` in newsletter match slugs in `articles-db.json`
- All image paths exist in `public/thumbnails/`
- Dev server renders correctly at `/newsletter/{slug}` and `/articles/{slug}`

---

## Phase 3: Website

**No manual action.** The website reads directly from the JSON databases and renders:
- `/newsletter/{slug}` — full newsletter with banner, intro, TOC, article cards
- `/articles/{slug}` — full article with hero image, drop cap, content, Valley View

---

## Phase 4: Beehiiv Export

After ingestion, generate email-safe HTML from the databases and paste into Beehiiv.

### 4a. Generate the HTML

**Option A — Admin UI (recommended)**
1. Visit `https://thoriumvalley.com/newsletter/{slug}?admin=true`
2. Click **"Copy Beehiiv HTML"** button
3. HTML is copied to clipboard

**Option B — API**
```bash
curl -s "https://thoriumvalley.com/api/beehiiv-export?slug=february-23-2026"
```
Returns JSON with `html` field containing the email-ready HTML.

**Option C — Single article export**
```bash
curl -s "https://thoriumvalley.com/api/beehiiv-export?article=the-pentagon-just-threatened-to-blacklist-anthropic"
```

### 4b. Paste into Beehiiv
1. Open Beehiiv editor for the new newsletter
2. Switch to **HTML view**
3. Paste the copied HTML
4. Preview to verify — all images and links point to `thoriumvalley.com`

### 4c. Beehiiv Settings
- **Disable SEO**: Settings → Website → turn off public-facing site
- **No edits needed**: the HTML is self-contained with inline styles
- **Images**: served from `https://thoriumvalley.com/thumbnails/...`
- **Article links**: point to `https://thoriumvalley.com/articles/{slug}`

### 4d. HTML Export Rules

The exported HTML must:
- Use an **embedded `<style>` block** with CSS classes (e.g., `tv-p`, `tv-a`) — NOT inline styles on every element (saves 50-70% HTML size to avoid Gmail's 102KB clipping limit)
- **Minify** all output HTML (strip whitespace/newlines between tags)
- Use **no pseudo-elements** (`::before`, `::after` — unsupported in email)
- Use **absolute URLs** for all images and links
- Use **`<img>` tags** (not Next.js `<Image>`)
- Use **`<a href>` tags** (not Next.js `<Link>`)
- Keep total HTML **under 80 KB** (Gmail clips at 102 KB; Beehiiv footer adds ~5-10 KB)
- Match the website's visual design exactly:
  - Serif font: `'Times New Roman MT Std','Times New Roman',Georgia,serif` — **weight 500**
  - Sans font: `-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text',system-ui,sans-serif` — **weight 500**
  - Accent: `#5170ff`
  - Body text: `#2D2D2D`, **16px**, line-height 1.5
  - Heading text: `#2A2A2A`
  - Card border: `1px solid #CDCDCD`, `border-radius: 10px`
  - Container width: `780px`
  - Article titles: plain text (not linked) — only images are linked

---

## Quick Reference: Full Pipeline Run

```
1. Receive content folder
2. Read ARTICLE_FORMAT.md + NEWSLETTER_FORMAT.md
3. Rename & copy images to public/thumbnails/
4. Add articles to articles-db.json
5. Add newsletter to newsletters-db.json
6. Verify site renders correctly
7. Deploy: `vercel --prod`
8. Export Beehiiv HTML: visit /newsletter/{slug}?admin=true → Copy
9. Paste into Beehiiv → Send
```

---

## File Map

| File | Purpose |
|------|---------|
| `PIPELINE_ORCHESTRATION.md` | This file — master directive |
| `ARTICLE_FORMAT.md` | Article JSON schema + ingestion rules |
| `NEWSLETTER_FORMAT.md` | Newsletter JSON schema + assembly rules |
| `src/data/articles-db.json` | Article database |
| `src/data/newsletters-db.json` | Newsletter database |
| `src/lib/beehiiv-export.ts` | Beehiiv HTML export engine |
| `src/app/api/beehiiv-export/route.ts` | Export API endpoint |
| `src/components/CopyBeehiivButton.tsx` | Admin clipboard button |
