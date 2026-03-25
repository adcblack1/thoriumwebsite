# Thorium Valley — Article Formatting Guide

> **Purpose**: This file tells any AI assistant how to format articles for Thorium Valley's database. Copy-paste your raw article text to an AI, point it to this file, and it will output the correct JSON.

---

## Instructions for AI

When a user gives you an article (raw text, markdown, Google Doc paste, etc.), convert it into the JSON format below and output it. The user will then paste it into the upload API or directly into `src/data/articles-db.json`.

---

## JSON Schema

```json
{
  "title": "Your Article Headline Here",
  "subtitle": "A one-sentence summary of the article (max ~150 chars)",
  "author": "Author Name (default: Thorium Valley)",
  "category": "One of the 11 categories below",
  "tags": ["Tag1", "Tag2", "Tag3"],
  "thumbnail_url": "/thumbnails/your-image.avif",
  "status": "published",
  "featured": false,
  "content": "<p>Full HTML content here...</p>",
  "newsletter_content": "<p>Condensed newsletter version here...</p>"
}
```

### Image Naming Convention

**CRITICAL: When adding articles, rename thumbnail files to match the article title slug.**

- Source file: `thumbnail_1_v1.png`
- Renamed to: `/thumbnails/pentagon-threatens-to-blacklist-anthropic.png` (based on article title)
- Copy renamed images to `thorium-valley/public/thumbnails/`
- Banner images: `banner-YYYY-MM-DD.png` (e.g., `banner-2026-02-22.png`)
- **Banner source location**: Banners are stored in `/Users/alexchun/Downloads/Main Thumnails/`. The latest banner is always the highest-numbered file (e.g., `t4.png` is newer than `t3.png`). Always check this folder for the most recent banner when ingesting new content.

**DO NOT** leave thumbnails with generic names like `thumbnail_1_v1.png` in the public directory.

### Required Fields
| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Article headline |
| `category` | string | Must be one of the 11 categories listed below |
| `content` | string | Full article body as HTML |

### Optional Fields
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `subtitle` | string | `""` | Short summary shown in previews |
| `author` | string | `"Thorium Valley"` | Author byline |
| `tags` | string[] | `[]` | Topical tags for filtering |
| `thumbnail_url` | string | `""` | Path to thumbnail image |
| `newsletter_content` | string | `""` | Condensed HTML for the newsletter email version. Shorter and punchier than the full `content`. If empty, the full `content` is used in newsletters. |
| `status` | string | `"published"` | `"draft"` or `"published"` |
| `featured` | boolean | `false` | Pin to top of homepage |

### Auto-Generated Fields (do NOT include these)
- `id` — auto-generated from title slug
- `slug` — auto-generated from title
- `published_at` — set to current timestamp
- `updated_at` — set to current timestamp
- `reading_time` — estimated from word count

---

## 11 Categories

Use exactly one of these:

1. **Big tech** — Google, Apple, Meta, Microsoft, Amazon, OpenAI, Anthropic
2. **Startups** — Funding rounds, new companies, startup ecosystem
3. **Hardware** — GPUs, chips, devices, robotics, physical tech
4. **Markets** — Stock market, valuations, M&A, financial impact
5. **Products** — Product launches, features, reviews, tools
6. **Research** — Papers, breakthroughs, benchmarks, academic
7. **Policy** — Regulation, government, law, compliance
8. **Workforce** — Jobs, hiring, layoffs, skills, remote work
9. **Enterprise** — Enterprise AI, B2B, deployment, integration, ROI
10. **Culture** — AI in society, ethics, art, media, opinions
11. **Governance** — Corporate governance, AI safety, board decisions

---

## Content Formatting Rules

The `content` field must be **valid HTML**. Use these elements:

```html
<p>Paragraph text</p>
<h2>Section Headings (use h2, not h1)</h2>
<h3>Sub-headings if needed</h3>
<ul><li>Bullet points</li></ul>
<ol><li>Numbered lists</li></ol>
<blockquote><p>Quotes from people or reports</p></blockquote>
<strong>Bold text</strong>
<em>Italic text</em>
<a href="https://example.com">Links</a>
```

### Do NOT use:
- `<h1>` — the page title is rendered separately
- `<script>` or `<style>` — stripped for security
- Markdown — convert to HTML
- Raw URLs — wrap in `<a>` tags

### Valley View Section (REQUIRED)

Every article **must** end with a "Valley View" opinion section. Format it as a **standalone heading** followed by the opinion text in a **separate paragraph**:

```html
<p><strong>Our Valley View</strong></p>
<p>The opinion text goes here as a regular paragraph...</p>
```

**Rules:**
- Use `<p><strong>Our Valley View</strong></p>` as a standalone paragraph (no colon!)
- The opinion text goes in the **next** `<p>` tag — NEVER inline on the same line as the heading
- Do NOT use a colon after "Valley View"
- Do NOT use `<h2>` or `<h3>` — the template handles the styling automatically
- The template will convert this into a branded serif block heading

**Correct:**
```html
<p><strong>Our Valley View</strong></p>
<p>The uncomfortable truth is that...</p>
```

**Wrong (will cause styling bugs):**
```html
<!-- WRONG: inline with colon -->
<p><strong>Our Valley View:</strong> The uncomfortable truth is that...</p>

<!-- WRONG: using heading tags -->
<h2>Our Valley View</h2>
<p>The uncomfortable truth is that...</p>
```

### Style Tips
- Start with a strong opening paragraph (no heading first)
- Use `<h2>` to break into 3-5 sections — the website automatically adds equal top and bottom spacing around `<h2>` headings, so don't add extra `<br>` or empty `<p>` tags around them
- Include at least one `<blockquote>` for a key quote
- End with a forward-looking paragraph or CTA
- Keep paragraphs to 2-4 sentences max

---

## Example: Converting Raw Text to JSON

### Input (raw text from user):
```
Title: NVIDIA Announces Blackwell Ultra

NVIDIA just announced Blackwell Ultra, their next-gen GPU architecture. 
Jensen Huang revealed it at GTC with a 5x performance increase over Hopper.

Key specs:
- 208 billion transistors
- 4nm process
- 192GB HBM3e memory

"This is the engine of the AI revolution," Huang said.

Available Q3 2026 starting at $40,000 per unit.
```

### Output (formatted JSON):
```json
{
  "title": "NVIDIA Announces Blackwell Ultra: 5x Performance Increase Over Hopper",
  "subtitle": "Next-gen GPUs promise to accelerate AI training and inference to new heights.",
  "author": "Thorium Valley",
  "category": "Hardware",
  "tags": ["NVIDIA", "GPUs", "Blackwell"],
  "thumbnail_url": "",
  "status": "published",
  "featured": false,
  "content": "<p>NVIDIA just announced Blackwell Ultra, their next-generation GPU architecture. CEO Jensen Huang revealed the chip at GTC 2026, showcasing a staggering 5x performance increase over the current Hopper generation.</p><h2>Key Specifications</h2><ul><li><strong>208 billion transistors</strong> — the most complex chip ever built</li><li><strong>4nm process</strong> — manufactured by TSMC</li><li><strong>192GB HBM3e memory</strong> — massive bandwidth for large model training</li></ul><blockquote><p>\"This is the engine of the AI revolution,\" Huang said during the keynote presentation.</p></blockquote><h2>Availability and Pricing</h2><p>Blackwell Ultra will be available in Q3 2026, with pricing starting at $40,000 per unit. Major cloud providers including AWS, Google Cloud, and Azure have already placed orders.</p>"
}
```

---

## Upload Methods

### Method 1: API Upload
```bash
curl -X POST http://localhost:3000/api/articles/upload \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Your Title",
    "subtitle": "Your subtitle",
    "category": "Big tech",
    "tags": ["Tag1", "Tag2"],
    "content": "<p>Your HTML content...</p>"
  }'
```

### Method 2: Direct JSON Edit
Open `src/data/articles-db.json` and add a new object to the array. Include all fields from the schema above (the auto-generated fields will be set when using the API, but must be manually added for direct edits).

---

## Step-by-Step Ingestion Guide for AI

When the user gives you a content folder (e.g., `FEBRUARY 26 CONTENT/`), follow these steps **exactly**:

### Understanding the Content Folder Structure

> **CRITICAL — Read this first. Every content folder contains TWO types of files:**
>
> | File | What it is | Where it goes |
> |------|-----------|---------------|
> | `article_N.md` | The **FULL article** (long-form, detailed) | `content` field in `articles-db.json` |
> | `newsletter_latest.md` | The **NEWSLETTER** containing **condensed versions** of the same articles | `newsletter_content` field in `articles-db.json` + newsletter metadata in `newsletters-db.json` |
>
> **The `article_N.md` files are NOT newsletter content.** They are the full standalone articles displayed on `/articles/{slug}`.
>
> **The `newsletter_latest.md` file IS the newsletter.** It contains shorter, punchier versions of the same stories. These condensed versions go into each article's `newsletter_content` field. The newsletter's intro, TOC, sign-off, and writers go into `newsletters-db.json`.

### How to extract `newsletter_content` from `newsletter_latest.md`

The newsletter file contains all articles in condensed form, separated by `---` dividers. Each article section starts with a category label (e.g., `PRODUCTS`) followed by a `# Title`. To get the `newsletter_content` for article N:

1. Find the matching article section in `newsletter_latest.md` by its title
2. Convert that section's markdown body (everything after the `# Title` line until the next `---` or end of file) to HTML
3. Use that HTML as the `newsletter_content` for the corresponding article in `articles-db.json`

**Do NOT use the full `article_N.md` content as `newsletter_content`.** The newsletter versions are intentionally shorter.

> **CRITICAL: NEVER write `newsletter_content` by hand or try to "condense" the full article yourself. The condensed versions ALREADY EXIST in `newsletter_latest.md`. Extract them directly from that file and convert to HTML. This is the ONLY acceptable source for `newsletter_content`.**
>
> **Context:** Previously, `newsletter_content` was written manually during ingestion instead of being extracted from the newsletter source file. This resulted in the `/newsletter/` pages showing text that didn't match the actual newsletter — it was close but not the real thing. The article files (`article_1.md`, etc.) and the newsletter file (`newsletter_latest.md`) cover the same stories but are written differently. The newsletter versions are shorter and punchier. Always use the newsletter file as the source.

### Step 1: Read Content Files
- Read all `article_N.md` files — these are the **FULL articles**
- Read `newsletter_latest.md` — this is the **NEWSLETTER** (condensed article versions + metadata)
- Identify all `thumbnail_N.png` files in the content folder

### Step 2: Get the Banner Image
- **Banners are NOT in the content folder.** They are stored separately in `/Users/alexchun/Downloads/Main Thumnails/`
- Always check that folder and use the **highest-numbered file** (e.g., `t5.png` is newer than `t4.png`)
- Copy it to `thorium-valley/public/thumbnails/` as `banner-YYYY-MM-DD.png` (using the newsletter date)

### Step 3: Rename and Copy Thumbnails
- Rename each `thumbnail_N.png` to match its article's title slug (e.g., `anthropics-friday-deadline-bend-or-break.png`)
- Copy all renamed thumbnails to `thorium-valley/public/thumbnails/`

### Step 4: Add Articles to `articles-db.json`
For each `article_N.md`:
1. Parse the category from line 1 of the markdown
2. Parse the title from the `# ` heading
3. Convert the **full** markdown body to valid HTML → this is the `content` field
4. Find the matching section in `newsletter_latest.md` and convert its **condensed** body to HTML → this is the `newsletter_content` field
5. Generate: `id`, `slug` (from title), `subtitle`, `tags`, `reading_time`
6. Set `thumbnail_url` to the renamed image path
7. **Prepend** the JSON object to `src/data/articles-db.json` (newest articles first)

### Step 5: Add Newsletter to `newsletters-db.json`
From `newsletter_latest.md`:
1. Extract the `intro` paragraph (the "Welcome back..." paragraph before "IN TODAY'S NEWSLETTER"). **Use the EXACT text from the file. Do NOT rewrite, summarize, or rephrase it. Copy it character for character.**
2. Extract the `toc` (the numbered items under "IN TODAY'S NEWSLETTER")
3. Set `article_slugs` to match exactly the slugs you created in Step 4 — **order must match the newsletter's TOC order**, which may differ from the article_N numbering
4. Set `banner_image_url` to the banner path from Step 2
5. Set `sign_off` and `writers` from the newsletter's closing lines
6. **Prepend** the JSON object to `src/data/newsletters-db.json` (newest first)

### Step 6: Verify
- Confirm all `article_slugs` in the newsletter match slugs in `articles-db.json`
- Confirm all image paths exist in `public/thumbnails/`
- The website will automatically display everything — no code changes needed

> **The entire ingestion process is just editing two JSON files and copying images. The website reads directly from these databases.**
