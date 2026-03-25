# NW3 Directive — Navigating Web3 Newsletter HTML Generator

## Purpose
This directive converts the Navigating Web3 (NW3) newsletter markdown content into a single, self-contained HTML email block. The HTML mirrors the exact structure, padding, fonts, and card style used by Thorium Valley's newsletter template.

---

## Content Location

All NW3 content lives in:
```
/Users/alexchun/Downloads/Thorium Valley Website/nw3 Client/
```

Each edition is in a date-named subfolder (e.g., `3-10/`, `3-11/`, etc.). **Always use the most recent folder.**

### Files in Each Folder
| File | Purpose |
|---|---|
| `newsletter_YYYY-MM-DD.md` | The full newsletter with condensed articles, quick hits, jobs, airdrops, intro, and outro |
| `article_1_YYYY-MM-DD.md` | Full article 1 (NOT used for HTML — only the newsletter file matters) |
| `article_2_YYYY-MM-DD.md` | Full article 2 (NOT used for HTML) |
| `article_3_YYYY-MM-DD.md` | Full article 3 (NOT used for HTML) |
| `banner *.png` OR `Nw3.png` OR similar | The banner image for this edition |
| `thumbnail_*.png` or `*.jpeg` or `*.png` | Thumbnails for articles (3 images) |

> **CRITICAL: Only the `newsletter_YYYY-MM-DD.md` is used for the HTML output. The individual article files are for the website — this directive is ONLY about the newsletter HTML.**

---

## How to Identify Content

### Banner Image
- Look for a file starting with `banner` or `Nw3` in the most recent folder
- This goes at the very top of the HTML, full-width

### Article Thumbnails
- The 3 non-banner image files are article thumbnails
- Match them to articles in order: thumbnail 1 → article 1, etc.
- If filenames don't clearly indicate order, use alphabetical or creation order

---

## Newsletter Structure (from the markdown)

The `newsletter_YYYY-MM-DD.md` has this exact structure:

```
# Navigating Web3 | [Date]

[Intro paragraph starting with "Welcome back."]

IN TODAY'S NEWSLETTER
1. [Article 1 title]
2. [Article 2 title]  
3. [Article 3 title]
+ Quick Hits, Jobs in Web3, Airdrop Hunter

---

[CATEGORY 1]
## [Article 1 Title]
[Body with bullet points and links]
**Navigating Web3**
[Opinion paragraph]

---

[CATEGORY 2]
## [Article 2 Title]
[Body]
**Navigating Web3**
[Opinion paragraph]

---

[CATEGORY 3]
## [Article 3 Title]
[Body]
**Navigating Web3**
[Opinion paragraph]

---

## QUICK HITS
Other stories worth knowing about today:
- [bullet items with links]

---

## JOBS IN WEB3
Real roles at real companies, posted this week:
- [Company](url): Role

---

## AIRDROP HUNTER
Free money opportunities (DYOR, not financial advice):
- [Protocol](url): Description

---

[Outro text]
Written by the Navigating Web3 crew.
[Footer text]
[Disclaimer]
```

---

## Fixed Assets (NEVER change these URLs)

### "Navigating Web3" Section Header (replaces "OUR VALLEY VIEW")
Used as an image above each article's opinion section:
```
https://beehiiv-images-production.s3.amazonaws.com/uploads/asset/file/228ae2ec-5186-47b0-a972-65579ef99e51/The_Navigation.png?t=1773200213
```

### Bottom Section Header Images
These appear as full-width header images above each bottom section:

| Section | Image URL |
|---|---|
| In Other News (Quick Hits) | `https://beehiiv-images-production.s3.amazonaws.com/uploads/asset/file/a8bc047a-7a69-4e65-8cc7-41d1af9fd87d/In_Other_News.png?t=1773200214` |
| Job Board (Jobs in Web3) | `https://beehiiv-images-production.s3.amazonaws.com/uploads/asset/file/6dd06799-cea9-496c-b402-d080cffb6835/Job_Board.png?t=1773200214` |
| Airdrop Hunter | `https://beehiiv-images-production.s3.amazonaws.com/uploads/asset/file/d8d1f47f-3d1a-4948-a565-be41a4ade9cf/Airdrop_Hunter.png?t=1773200214` |

---

## Design Tokens

```
Accent color:   #5170ff (blue — same as TV)
Text color:     #1b1b1b
Text secondary: #2D2D2D
Background:     #FFFFFF
Border:         #CDCDCD
CTA button bg:  #5170ff
CTA text:       #FFFFFF
Heading font:   'Times New Roman MT Std','Times New Roman',Georgia,serif
Body font:      -apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif
Email width:    670px
```

---

## HTML Structure (exact order)

1. **Date** — right-aligned, small text (font-weight: 400)
2. **Banner Image** — full-width, from the folder
3. **Intro** — "Welcome back." is ALWAYS bold. Rest of intro is font-weight: 400. Followed by em dash + "Navigating Web3"
4. **TOC** — "IN TODAY'S NEWSLETTER" header (font-weight: 700 — the ONLY bold text in the entire HTML). Only the 3 numbered article titles. Do NOT include the `+ Quick Hits, Jobs in Web3, Airdrop Hunter` line
5. **Article Cards** (×3) — each in a bordered card:
   - Category label (blue text, font-weight: 400, e.g., "BITCOIN")
   - Title (serif font, font-weight: 400 — NOT bold)
   - Thumbnail image
   - Body HTML (bullet points with links, all font-weight: 400)
   - "Navigating Web3" image (the fixed URL above) — full-width inside the card
   - Opinion paragraph below the image (font-weight: 400)
6. **LINKS label** — blue "LINKS" text at the top of the bottom card
7. **In Other News** — header image → bullet list
8. **Job Board** — header image → bullet list  
9. **Airdrop Hunter** — header image → bullet list
10. **Footer** — outro text, sign-off, disclaimer

> [!IMPORTANT]
> The ONLY elements with bold are: the "IN TODAY'S NEWSLETTER" label (font-weight: 700) and "Welcome back." at the start of the intro. Every other piece of text — titles, body, category labels, links, opinion text — is font-weight: 400.

---

## Markdown → HTML Conversion Rules

> [!CAUTION]
> **NO BOLD TEXT ANYWHERE.** All `**text**` in the markdown must be STRIPPED of bold markers and rendered as plain text (font-weight: 400). Do NOT wrap in `<strong>` tags. This matches the Thorium Valley website style.

- `**text**` → plain text (remove the `**` markers, do NOT make bold)
- `[text](url)` → `<a href="url" style="color:#5170ff;text-decoration:underline;" target="_blank">text</a>`
- `- item` → `<li>` inside `<ul>` with `list-style:none`. Every `<li>` gets an inline blue `+` span prefix (`<span style="color:#5170ff;font-weight:700;position:absolute;left:0;">+</span>`). NEVER use disc/circle/square bullets — always `+` signs
- `**Navigating Web3**` → render the "The Navigation" image full-width, then the following paragraph as the opinion text (NOT bold)
- Category labels (e.g., `BITCOIN`, `AI x CRYPTO`, `REGULATION`) → blue category text above the title
- `## Title` → h1 heading in serif font, **font-weight: 400** (NOT bold)
- `---` → card separator (end current card, start new one)
- Paragraphs → `<p>` tags with body font styling, font-weight: 400

---

## Execution Steps

### Step 1: Find the Most Recent Folder
- Look in `/Users/alexchun/Downloads/Thorium Valley Website/nw3 Client/`
- Pick the folder with the highest date number (e.g., `3-11` > `3-10`)

### Step 2: Read the Newsletter File
- Read `newsletter_YYYY-MM-DD.md` from that folder
- Parse the intro, TOC, articles, quick hits, jobs, airdrops, and outro

### Step 3: Identify Images
- Find the banner image (contains "banner" or "Nw3" in name, or the largest .png)
- Find 3 thumbnail images for articles
- These need to be uploaded to beehiiv or hosted somewhere — for preview, use local file:// paths

### Step 4: Generate the HTML
- Use the EXACT same HTML structure as the Thorium Valley `newsletter-template.ts`
- Same card borders, padding, fonts, spacing
- Replace TV-specific content:
  - "OUR VALLEY VIEW" → the "Navigating Web3" header image
  - "Thorium Valley" → "Navigating Web3" in footer/sign-off
  - Subscribe CTA → Navigating Web3 subscribe link
- Add the 3 bottom sections (In Other News, Job Board, Airdrop Hunter) each with:
  1. A "LINKS" label at the top of the card
  2. The section header image (full-width)
  3. Bullet list of items

### Step 5: Output
- Save the complete HTML to `/tmp/nw3-preview.html`
- The user can open this in a browser to verify
- Also serve it on local dev at a preview route if needed

---

## Outro Format (from the newsletter)

The outro is the text after the last `---` separator. It includes:
1. The sign-off line (e.g., "That's all for today. If this issue helped you navigate the noise...")
2. "Written by the Navigating Web3 crew."
3. "Got a tip, a correction, or a hot take? Reply directly. We read every one."
4. Disclaimer: "This newsletter is for informational and educational purposes only and is not financial advice..."

All of this goes in the footer section.

---

> **REMEMBER: This directive generates ONE big HTML block. Nothing goes on the Thorium Valley website. This is purely for email/beehiiv use.**
