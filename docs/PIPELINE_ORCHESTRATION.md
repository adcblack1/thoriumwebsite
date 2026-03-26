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
| 1. Content | Raw articles + newsletter markdown + kicker images + poll (optional) | Reviewed `.md` files | Writer guidelines |
| 2. Ingestion | `.md` files + thumbnails + banner + kickers + poll.json | `articles-db.json`, `newsletters-db.json`, `/public/thumbnails/` | [ARTICLE_FORMAT.md](file:///Users/alexchun/Downloads/Thorium%20Valley%20Website/ARTICLE_FORMAT.md), [NEWSLETTER_FORMAT.md](file:///Users/alexchun/Downloads/Thorium%20Valley%20Website/NEWSLETTER_FORMAT.md) |
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
├── newsletter_latest.md          ← now includes ## LINKS section
├── poll.json                     ← ONLY on poll issues (every other newsletter)
├── kickers/                      ← "AI or Real?" game images (EVERY newsletter)
│   ├── YYYY-MM-DD_meta.json      ← { date, query, photographer, unsplash_url, description }
│   ├── YYYY-MM-DD_gemini_link.txt  ← single line: gemini share URL for the AI image
│   ├── YYYY-MM-DD_kicker_unsplash.jpg    ← real photograph
│   └── Gemini_Generated_Image_*.jpeg     ← AI-generated photo (filename varies)
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

### 2a. Article Images
1. Rename `thumbnail_N_vN.png` → `{article-title-slug}.png`
2. Rename `banner_YYYY-MM-DD.png` → `banner-YYYY-MM-DD.png`
3. Copy all to `thorium-valley/public/thumbnails/`

### 2a-ii. Kicker Images (every newsletter)
1. Find the real photo: `kickers/YYYY-MM-DD_kicker_unsplash.jpg`
2. Find the AI photo: `kickers/Gemini_Generated_Image_*.jpeg` (glob — filename varies)
3. Copy real photo → `public/thumbnails/kicker-YYYY-MM-DD-real.jpg`
4. Copy AI photo → `public/thumbnails/kicker-YYYY-MM-DD-ai.jpeg`

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

### 2c-ii. Links → `newsletters-db.json` (every newsletter)
Parse the `## LINKS` section from the newsletter markdown. It has 3 sub-sections:

**In Other News** — extract each bullet as:
```json
{ "prefix": "Text before link ", "link_text": "linked portion", "rest": " text after link", "url": "https://..." }
```
- `prefix` is optional — only include if there is text before the hyperlink
- `link_text` is ONLY the hyperlinked text from the markdown `[link text](url)`
- `rest` is the remaining text after the link
- The bullet format in the markdown is: `[Linked text](url) rest of text` OR `prefix text [linked text](url) rest of text`
- Store as `links.news[]`

**AI Tools** — extract each bullet as:
```json
{ "name": "Tool Name", "desc": "Description text...", "url": "https://..." }
```
- The markdown format is: `[Tool Name](url): Description text`
- Name is NOT bold — just a regular hyperlink
- Store as `links.tools[]`

**AI Jobs** — extract each bullet as:
```json
{ "company": "Company", "role": "Job Title", "url": "https://..." }
```
- The markdown format is: `[Company](url) — Job Title`
- Store as `links.jobs[]`

### 2c-iii. Games → `newsletters-db.json` + Supabase (every newsletter)
1. Read `kickers/YYYY-MM-DD_meta.json` → get `unsplash_url`
2. Read `kickers/YYYY-MM-DD_gemini_link.txt` → get gemini share URL
3. **Create a game poll in Supabase:**
   ```sql
   INSERT INTO polls (newsletter_slug, type, question, options, correct_answer)
   VALUES ('SLUG', 'game', 'Which image is real?', '["Option A", "Option B"]', 'Option B')
   RETURNING id;
   ```
   - Set `correct_answer` to whichever option contains the REAL image (not AI)
   - Save the returned `id` as `game_poll_id`
4. Build the `games` object:
```json
{
  "game_poll_id": "UUID-FROM-STEP-3",
  "image_a": "/thumbnails/kicker-YYYY-MM-DD-ai.jpeg",
  "image_b": "/thumbnails/kicker-YYYY-MM-DD-real.jpg",
  "link_a": "https://gemini.google.com/share/...",
  "link_b": "https://unsplash.com/photos/..."
}
```
- `game_poll_id` is used to generate vote URLs in the email and website
- `link_a` / `link_b` are source URLs — **only used in Yesterday's Results** (answer reveal), NOT in the GAMES section
- In GAMES, clicking an image/option goes to `/api/poll/vote?poll={game_poll_id}&answer=Option A&sid={{subscriber_id}}`

> **IMPORTANT:** The order of image_a / image_b should be deliberately randomized each issue. Sometimes the AI image should be Option A, sometimes Option B. This prevents readers from guessing a pattern. Alternate or randomize. Set `correct_answer` accordingly.

### 2c-iv. Poll → `newsletters-db.json` + Supabase (every OTHER newsletter)

**Step 1 — Check if this is a poll issue:**
- If `poll.json` exists in the content folder → this IS a poll issue
- If `poll.json` does NOT exist → this is NOT a poll issue → set `poll: null`

**Step 2 — If this IS a poll issue:**
- Read `poll.json`: `{ "question": "...", "options": ["Yes", "No", "Other"], "date": "..." }`
- **Create the poll in Supabase:**
  ```sql
  INSERT INTO polls (newsletter_slug, type, question, options)
  VALUES ('SLUG', 'poll', 'Question text?', '["Yes", "No", "Other"]')
  RETURNING id;
  ```
- Save the returned `id` as `poll_id`
- Set `poll: { "poll_id": "UUID-FROM-SUPABASE", "question": "...", "options": ["Yes", "No", "Other"] }`
- The `poll_id` is used to generate vote URLs: `/api/poll/vote?poll={poll_id}&answer=Yes&sid={{subscriber_id}}`

**Step 3 — Check if the PREVIOUS newsletter had a poll (for poll_results):**
- Open `newsletters-db.json`, find the most recent entry (by `published_at`)
- If that entry has a `poll` field that is NOT null:
  - **Query Supabase for the results:**
    ```sql
    SELECT answer, COUNT(*) as count
    FROM poll_votes
    WHERE poll_id = 'PREVIOUS-POLL-ID'
    GROUP BY answer;
    ```
  - Calculate percentages from the counts
  - Set `poll_results: { "question": "...", "results": [{ "option": "Yes", "pct": 62 }, ...] }`
- If the previous newsletter had `poll: null` → set `poll_results: null`

### 2c-v. Yesterday's Results → `newsletters-db.json` (every newsletter)

**Look-back logic:**
1. Open `newsletters-db.json`, find the most recent entry (by `published_at`)
2. If that entry has a `games` field that is NOT null:
   - Copy the previous newsletter's game images and source links into `yesterdays_results`:
   ```json
   {
     "ai_image": "/thumbnails/kicker-PREV-DATE-ai.jpeg",
     "real_image": "/thumbnails/kicker-PREV-DATE-real.jpg",
     "ai_source": "https://gemini.google.com/share/...",
     "real_source": "https://unsplash.com/photos/..."
   }
   ```
   - The `ai_image` is whichever image from the previous game was the AI-generated one
   - The `real_image` is the real unsplash photo
   - **NOTE:** This reveals the answer. In the GAMES section, images are labeled "Option A/B" (answer hidden). In Yesterday's Results, they are labeled "AI IMAGE" / "REAL IMAGE" (answer revealed).
3. If no previous newsletter exists OR it had `games: null` → set `yesterdays_results: null`

### 2d. Verify
- All `article_slugs` in newsletter match slugs in `articles-db.json`
- All image paths exist in `public/thumbnails/`
- Dev server renders correctly at `/newsletter/{slug}` and `/articles/{slug}`
- Verify: LINKS card shows 3 sub-sections with correct partial hyperlinks
- Verify: GAMES card shows 2 side-by-side images with "Option A" / "Option B" labels
- Verify: POLL card shows question with stacked vertical hyperlinks (if poll issue)
- Verify: Yesterday's Results shows 2 images with "AI IMAGE" / "REAL IMAGE" labels (if not first issue)

---

## Section Scheduling Rules

| Section | Frequency | Source | Condition |
|---------|-----------|--------|-----------|
| Articles (3) | Every newsletter | `article_*.md` files | Always |
| LINKS | Every newsletter | `## LINKS` in newsletter markdown | Always |
| GAMES ("AI or Real?") | Every newsletter | `kickers/` folder | Always |
| POLL ("WHAT DO YOU THINK?") | Every other newsletter | `poll.json` in content folder | Only if `poll.json` exists |
| POLL RESULTS | Every other newsletter | Previous newsletter's `poll` + user-provided results | Only if previous had a poll |
| Yesterday's Results | Every newsletter (except first) | Previous newsletter's `games` field | Only if previous had games |

### Permanent Banners (hosted at `thoriumvalley.com/thumbnails/`)
These banners are reused EVERY issue. They are already on the site. Do NOT re-upload them.

| Banner | Path | Used in |
|--------|------|---------|
| In Other News | `/thumbnails/links-in-other-news.png` | LINKS section |
| AI Tools | `/thumbnails/links-ai-tools.png` | LINKS section |
| AI Jobs | `/thumbnails/links-ai-jobs.png` | LINKS section |
| AI or Real | `/thumbnails/games-ai-or-real.png` | GAMES section |
| Yesterday's Results | `/thumbnails/yesterdays-results.png` | Yesterday's Results |

---

## Phase 3: Website

**No manual action.** The website reads directly from the JSON databases and renders:
- `/newsletter/{slug}` — full newsletter with banner, intro, TOC, article cards, LINKS, GAMES, POLL, sign-off, Yesterday's Results, footer
- `/articles/{slug}` — full article with hero image, drop cap, content, Valley View

### Section Rendering Details

**LINKS** — One bordered card (category label: `LINKS`) containing 3 sub-sections, each with its permanent banner image followed by bulleted content:
- In Other News: blue `+` markers, partial hyperlinks (only the linked text is blue, rest is plain)
- AI Tools: blue `+` markers, tool name is a hyperlink (NOT bold), followed by `: description`
- AI Jobs: blue `+` markers, company name is a hyperlink, followed by ` — Role`

**GAMES** — Bordered card (category label: `GAMES`) with AI or Real banner, two side-by-side images (clickable — linking to `/api/poll/vote` to record the subscriber's answer, NOT to the source URLs). "Option A" / "Option B" labels in serif font (Times New Roman MT Std, weight 500), and "Which image is real?" text with Option A | Option B vote links. NO "Login or Subscribe" text.

**POLL** — Bordered card (category label: `WHAT DO YOU THINK?` — no italic on YOU). Left-aligned. Question in serif font weight 500 (NOT bold). Options are stacked vertical hyperlinks (NOT buttons) linking to `/api/poll/vote`. "Vote by selecting an answer!" in muted text below.

**Yesterday's Results** — NO bordered card. Appears after sign-off, before subscribe block. Shows the Yesterday's Results banner, then two side-by-side images with "AI IMAGE" and "REAL IMAGE" labels (both hyperlinked to their source URLs, uppercase, accent blue, letter-spacing 0.1em).

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
curl -s "https://thoriumvalley.com/api/beehiiv-export?slug=march-25-2026"
```
Returns JSON with `html` field containing the email-ready HTML.

**Option C — Single article export**
```bash
curl -s "https://thoriumvalley.com/api/beehiiv-export?article=judge-says-pentagon-was-out-to-punish-anthropic"
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
- Use **`<table>` layouts** for side-by-side images in GAMES and Yesterday's Results sections (CSS grid/flexbox don't work in email clients)
- Match the website's visual design exactly:
  - Serif font: `'Times New Roman MT Std','Times New Roman',Georgia,serif` — **weight 500**
  - Sans font: `-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text',system-ui,sans-serif` — **weight 500**
  - Accent: `#5170ff`
  - Body text: `#2D2D2D`, **16px**, line-height 1.5
  - Heading text: `#2A2A2A`
  - Card border: `1px solid #CDCDCD`, `border-radius: 10px`
  - Container width: `780px`
  - Article titles: plain text (not linked) — only images are linked

### 4e. Email Assembly Order

The Beehiiv export engine (`beehiiv-export.ts`) assembles sections in this order:
```
Banner → Intro → TOC → Article Cards → LINKS → GAMES → POLL → Sign-off → Yesterday's Results → Footer
```

---

## Quick Reference: Full Pipeline Run

```
1. Receive content folder
2. Read ARTICLE_FORMAT.md + NEWSLETTER_FORMAT.md + this file
3. Rename & copy article images to public/thumbnails/
4. Copy kicker images to public/thumbnails/ (kicker-YYYY-MM-DD-real.jpg + kicker-YYYY-MM-DD-ai.jpeg)
5. Add articles to articles-db.json
6. Add newsletter to newsletters-db.json INCLUDING:
   - links (parsed from ## LINKS in newsletter md)
     - news[]: { prefix?, link_text, rest, url }
     - tools[]: { name, desc, url }
     - jobs[]: { company, role, url }
   - games (from kickers/ folder + meta.json + gemini_link.txt + Supabase INSERT)
     - game_poll_id from Supabase INSERT INTO polls
   - poll (from poll.json IF it exists, else null + Supabase INSERT)
     - poll_id from Supabase INSERT INTO polls
   - poll_results (from Supabase query of PREVIOUS poll votes, else null)
   - yesterdays_results (from PREVIOUS newsletter's games IF it had one, else null)
7. Verify site renders correctly
8. Deploy: `vercel --prod`
9. Export Beehiiv HTML: visit /newsletter/{slug}?admin=true → Copy
10. Paste into Beehiiv → Send
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
| `src/lib/newsletters.ts` | Newsletter TypeScript interface + CRUD functions |
| `src/lib/beehiiv-export.ts` | Beehiiv HTML export engine (includes LINKS, GAMES, POLL, Yesterday's Results generators) |
| `src/lib/supabase.ts` | Browser-side Supabase client |
| `src/lib/supabase-server.ts` | Server-side Supabase client (API routes) |
| `src/app/newsletter/[slug]/page.tsx` | Website newsletter renderer (includes all 4 new sections) |
| `src/app/api/beehiiv-export/route.ts` | Export API endpoint |
| `src/app/api/poll/vote/route.ts` | Vote recording API — inserts vote (one per subscriber), redirects to results with returnTo |
| `src/app/api/poll/feedback/route.ts` | Additional feedback submission API |
| `src/app/api/auth/sync-subscriber/route.ts` | Syncs Supabase auth user with Beehiiv subscriber — subscribes if checkbox checked, stores beehiiv_subscriber_id in profiles |
| `src/app/poll/results/page.tsx` | Vote confirmation page — shows results, percentage bars, feedback textarea, "already voted" notice |
| `src/components/VoteButton.tsx` | Auth-aware vote button — checks localStorage/Supabase for subscriber ID, opens sign-in modal if needed, persists pending vote across reload |
| `src/components/AuthSyncHandler.tsx` | Client component for post-Google-OAuth subscriber sync (reads ?sync=true param) |
| `src/components/SignInModal.tsx` | Sign-in modal (OTP + Google) — auto-checked newsletter checkbox, calls sync-subscriber after OTP verify |
| `src/components/CopyBeehiivButton.tsx` | Admin clipboard button |
| `public/thumbnails/links-*.png` | Permanent LINKS section banners (In Other News, AI Tools, AI Jobs) |
| `public/thumbnails/games-ai-or-real.png` | Permanent GAMES section banner |
| `public/thumbnails/yesterdays-results.png` | Permanent Yesterday's Results banner |
| `public/thumbnails/kicker-YYYY-MM-DD-*.jpg/.jpeg` | Per-issue game images (real + AI) |

---

## Supabase Infrastructure — Self-Hosted Poll System

**Project:** Thorium Valley (`iyaypvpkozntojbasjuh`, us-east-1)
**URL:** `https://iyaypvpkozntojbasjuh.supabase.co`

### Database Tables

| Table | Purpose |
|-------|---------|
| `polls` | Stores all polls and games. Fields: `id` (uuid PK), `newsletter_slug`, `type` (poll/game), `question`, `options` (jsonb), `correct_answer` (nullable), `created_at` |
| `poll_votes` | One vote per subscriber per poll. Fields: `id`, `poll_id` (FK), `subscriber_id`, `answer`, `created_at`. UNIQUE on `(poll_id, subscriber_id)` |
| `poll_feedback` | Optional text feedback. Fields: `id`, `poll_id` (FK), `subscriber_id`, `feedback`, `created_at` |
| `profiles` | Maps Supabase auth users to Beehiiv subscriber IDs. Fields: `id` (uuid PK, FK → auth.users), `email`, `beehiiv_subscriber_id`, `created_at`, `updated_at`. Auto-created on user signup via trigger. |

### Vote Flow — Email (Beehiiv)

```
Subscriber clicks poll option in email
  ↓
https://thoriumvalley.com/api/poll/vote?poll={id}&answer=Yes&sid={{subscriber_id}}
  ↓
Beehiiv replaces {{subscriber_id}} with actual subscriber ID at send time
  ↓
/api/poll/vote checks if subscriber already voted:
  - YES → redirects to results with "already_voted=true" (shows original answer)
  - NO → inserts vote → redirects to results
  ↓
Results page shows ✅/❌ + percentage bars + feedback textarea
Continue → homepage (no returnTo in email links)
```

### Vote Flow — Website (Auth-Aware)

```
User clicks vote option on newsletter page
  ↓
VoteButton (client component) checks for subscriber ID:
  1. localStorage cache ("tv_subscriber_id")
  2. Supabase session → profiles table → beehiiv_subscriber_id
  ↓
If subscriber ID found → navigate to /api/poll/vote?...&sid={real_id}&returnTo={current_page}
If NOT found → save pending vote to localStorage → open SignInModal
  ↓
User signs in (OTP or Google OAuth):
  - OTP: after verify, calls /api/auth/sync-subscriber → subscribes to Beehiiv (if checkbox checked) → stores beehiiv_subscriber_id in profiles + localStorage
  - Google: saves checkbox to localStorage → redirects to /auth/callback → AuthSyncHandler calls /api/auth/sync-subscriber on page load
  ↓
Page reloads → VoteButton detects pending vote in localStorage → auto-completes vote
  ↓
Results page → Continue → redirects back to the newsletter page (via returnTo param)
```

### Key Rules — ALWAYS ENFORCE
- **One vote per subscriber per poll** — votes are INSERTED, not upserted. Duplicate attempts show "already voted" notice with original answer.
- **Email links** use `{{subscriber_id}}` — Beehiiv merge tag replaced per subscriber at send time
- **Website links** use `VoteButton` component — checks auth, prompts sign-in if needed, uses real `beehiiv_subscriber_id` (NOT `website-visitor`)
- **Sign-in auto-subscribes to Beehiiv** — the newsletter checkbox is auto-checked. On sign-in, `/api/auth/sync-subscriber` calls the Beehiiv API and stores the returned subscriber ID in the `profiles` table.
- **Both OTP and Google OAuth** trigger subscriber sync — OTP calls sync directly after verify; Google OAuth uses `AuthSyncHandler` component after redirect
- In **GAMES**, image clicks and Option A/B links go to the vote API — NOT to the source URLs
- Source URLs (gemini/unsplash) are ONLY used in **Yesterday's Results** (where the answer is revealed)
- The AI agent creates polls in Supabase during ingestion and stores the returned `id` as `game_poll_id` / `poll_id` in the newsletter JSON
- For **poll results**, the AI agent queries Supabase `poll_votes` to get aggregated counts instead of asking the user for manual input
- The **results page** shows a feedback textarea. When the subscriber types feedback and clicks Continue, it is saved to `poll_feedback` table BEFORE redirecting
- **Continue button** redirects to `returnTo` param (newsletter page for website users, homepage for email users)

### How AI Agents Interact with Supabase (MCP)

AI agents MUST use the **Supabase MCP server** (`supabase-mcp-server`) for all database operations. The project ID is `iyaypvpkozntojbasjuh`.

**Creating a new game poll (every newsletter):**
```
Use mcp_supabase-mcp-server_execute_sql with:
  project_id: "iyaypvpkozntojbasjuh"
  query: "INSERT INTO polls (newsletter_slug, type, question, options, correct_answer) VALUES ('SLUG', 'game', 'Which image is real?', '[\"Option A\", \"Option B\"]', 'Option B') RETURNING id;"
```
→ Use the returned `id` as `game_poll_id` in newsletters-db.json

**Creating a new poll (every other newsletter, only if poll.json exists):**
```
Use mcp_supabase-mcp-server_execute_sql with:
  project_id: "iyaypvpkozntojbasjuh"
  query: "INSERT INTO polls (newsletter_slug, type, question, options) VALUES ('SLUG', 'poll', 'Question?', '[\"Yes\", \"No\", \"Other\"]') RETURNING id;"
```
→ Use the returned `id` as `poll_id` in newsletters-db.json

**Retrieving poll results for the next newsletter (automated):**
```
Use mcp_supabase-mcp-server_execute_sql with:
  project_id: "iyaypvpkozntojbasjuh"
  query: "SELECT answer, COUNT(*) as count FROM poll_votes WHERE poll_id = 'PREVIOUS-POLL-ID' GROUP BY answer;"
```
→ Calculate percentages, set `poll_results` in newsletters-db.json

**Retrieving game results for reference:**
```
Use mcp_supabase-mcp-server_execute_sql with:
  project_id: "iyaypvpkozntojbasjuh"
  query: "SELECT answer, COUNT(*) as count FROM poll_votes WHERE poll_id = 'GAME-POLL-ID' GROUP BY answer;"
```

**Viewing subscriber feedback:**
```
Use mcp_supabase-mcp-server_execute_sql with:
  project_id: "iyaypvpkozntojbasjuh"
  query: "SELECT subscriber_id, feedback, created_at FROM poll_feedback WHERE poll_id = 'POLL-ID' ORDER BY created_at DESC;"
```

