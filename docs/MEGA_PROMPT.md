# THORIUM VALLEY WEBSITE - MASTER BUILD PROMPT

Copy and paste this entire prompt to Claude CLI to initiate the website build.

---

## START PROMPT

You are building the Thorium Valley AI news website. This is a premium, newsletter-first news site that must look professionally designed and completely consistent throughout.

### 🚨 CRITICAL FIRST STEP
Before writing ANY code, read these files completely in order:
1. `CLAUDE.md` - Brand guidelines, component patterns, workflow rules
2. `tokens.css` - Design system with CSS variables
3. `COMPONENT_REFERENCE.md` - **Ready-to-use React code - COPY DIRECTLY**
4. `plan.md` - Build checklist to track progress

**IMPORTANT**: COMPONENT_REFERENCE.md contains complete, working React components. DO NOT rewrite them - copy them directly into your project.

### PROJECT CONTEXT
- **Type**: AI news/newsletter website (similar to TheDeepView.com)
- **Priority**: Newsletter subscriptions are the primary goal
- **Aesthetic**: Editorial, clean, sophisticated (not "techy" or "startup")

### BRAND CONSTRAINTS (MEMORIZE THESE)

**Colors (ONLY 3 - NO EXCEPTIONS)**:
```css
Background: #eeede9  /* Cream - entire site background */
Text/Borders: #1b1b1b  /* Near-black - all text, lines, borders */
Accent: #5170ff  /* Blue - buttons, links, highlights */
```

**Typography (ONE FONT ONLY)**:
- Font: Times New Roman MT Std
- Use font files from `/Times New Roman MT Std/` directory
- Headlines: Bold weight
- Body: Regular weight
- Emphasis: Italic weight
- NO Inter, Roboto, Arial, or any other font

**Styling Rules**:
- Sharp corners ONLY (0 border-radius everywhere)
- NO gradients (user explicitly prohibited)
- NO rounded buttons or cards
- Borders and lines use #1b1b1b color

### LOGO ASSETS
- `/Transparent Black Logo.png` - TV icon for light backgrounds
- `/Transparent White Logo.png` - TV icon for dark sections
- `/Transparent Black Text Logo.png` - "Thorium" wordmark for light backgrounds
- Both logos have blue sparkle accent matching #5170ff

### KEY CTA TEXT
- ALL subscribe buttons say: "Subscribe Free" (never just "Subscribe")
- Hero/CTA headline: "AI Is *Eating* the World" (eating = italicized)

### SITE STRUCTURE
```
/                    → Homepage (newsletter-first layout)
/newsletter          → Newsletter archive
/newsletter/[slug]   → Individual newsletter
/advertise           → Advertise page with globe illustration
/about               → About page
/privacy             → Privacy policy
/terms               → Terms of service
```

### HOMEPAGE LAYOUT (Copy from TheDeepView pattern)
```
┌─────────────────────────────────────────────────┐
│ HEADER: [Logo] ...nav links... [Sign In] [Subscribe Free] │
├─────────────────────────────────────────────────┤
│ HERO: Headline + Newsletter Form                │
├─────────────────────────────────────────────────┤
│ FEATURED: Most recent newsletter (large card)   │
├─────────────────────────────────────────────────┤
│ RECENT: Grid of newsletter cards (3 columns)    │
├─────────────────────────────────────────────────┤
│ CATEGORIES: Articles by topic (// Big Tech etc) │
├─────────────────────────────────────────────────┤
│ CTA: "AI Is *Eating* the World" + Subscribe form│
├─────────────────────────────────────────────────┤
│ FOOTER: Links, social, copyright                │
└─────────────────────────────────────────────────┘
```

### BACKEND REQUIREMENTS
1. **Beehiiv API** - Newsletter subscription and content
   - API endpoint: POST /api/subscribe
   - Fetch newsletter content from Beehiiv
2. **Supabase** - Auth and user data
   - Magic link authentication
   - User session management
3. **Scroll Subscribe Popup** - When user scrolls 50% down article:
   - If not subscribed: Show subscribe form
   - If subscribed but not signed in: Show "Sign In" link

### ANIMATION REQUIREMENTS (From reference sites)
- Page load: Staggered fade-in (nav → hero → content)
- Scroll: Subtle fade-up on section enter
- Cards: translateY(-4px) on hover
- Buttons: translateY(-2px) on hover
- Use Lenis for smooth scroll (optional)
- Respect prefers-reduced-motion

### CONTENT FORMATTING RULES
- **Bullet points**: All `<ul>` lists in article and newsletter content use `+` as the marker (blue `#5170ff`, font-weight 600). Lists have `padding: 0 0 0 20px`, list items have `padding-left: 24px` with the `+` absolutely positioned. Font size and weight must match body text (20px, 500). This is set via inline `<style>` in both article and newsletter page templates.
- **Newsletter page title**: Use Inter font at `fontSize: 18px` (inline style to override global h1). Display the first TOC headline (`newsletter.toc[0]`) as the title, NOT the generic "Thorium Valley | Date" title. Date below in `text-sm font-medium` at `rgba(27,27,27,0.55)`.
- **Newsletter images**: Must have `padding: 0 20px` for left/right indentation inside the content area.
- **Article page layout**: Show thumbnail hero image (16:9, full-width, no rounded corners, no max-width). Title in large Times New Roman (`text-3xl`/`text-5xl`, bold, -0.05em letter-spacing). Category tag above title, date below, share buttons (X, LinkedIn, Email, Copy Link), then a thin divider.
- **Article page**: Do NOT use `PageHeroWrapper` — use `Navigation` directly with a custom header layout (same pattern as newsletter page).
- **Article body text**: 20px, weight 500, **double-spaced** (line-height: 2.0), 1.8em paragraph margins. Links must be blue (#5170ff) with underline on hover. Section headings (h2/h3) in **Times New Roman MT**, 36px, with -0.04em letter-spacing.
- **"Valley View" section**: Always render as "Valley View", never "Our Valley View". The `<strong>Valley View</strong>` in article HTML is converted to `<h2 class="valley-view-heading">` at render time. Styled in Times New Roman MT, 36px, weight 500, with 2.5em top margin. This transformation happens via `.replace()` in the `dangerouslySetInnerHTML` prop.
- **No horizontal rules**: All `<hr>` elements and `<p>---</p>` paragraphs are stripped from article content at render time. The CSS also hides any remaining `<hr>` with `display: none !important`. Do NOT generate `---` or `<hr>` in article content.
- **Hyperlinks in articles**: Must ALWAYS be preserved — never strip `<a>` tags from article content. Links should be visually distinct (blue #5170ff).
- **Article dating rule**: Articles are ALWAYS published the day BEFORE the newsletter that references them. The ingest script computes `articleDateBase` automatically from `newsletterDateISO - 1 day`. You only need to specify the newsletter date when adding new content.

### WORKFLOW (Follow exactly)

**PHASE 1 - SETUP**:
1. Initialize Next.js 14 with TypeScript and App Router
2. Run: `npx create-next-app@latest thorium-valley --typescript --tailwind --app --src-dir --import-alias "@/*"`
3. Install dependencies: `npm install @studio-freight/lenis`
4. Set up fonts and copy logo assets
5. Update plan.md: Check off completed items

**PHASE 2 - DESIGN TOKENS**:
1. Copy tokens.css content to styles/globals.css
2. Configure tailwind.config to use CSS variables
3. Verify colors and fonts render correctly
4. Update plan.md

**PHASE 3 - COMPONENTS**:
Build in this order (one at a time, verify each):
1. Header.tsx
2. Footer.tsx
3. NewsletterForm.tsx
4. NewsletterCard.tsx
5. NewsletterGrid.tsx
6. SubscribeCTA.tsx
7. FadeIn.tsx (animation wrapper)
After each component: Verify it renders correctly, then update plan.md

**PHASE 4+ - FOLLOW plan.md**:
Continue through all 14 phases in plan.md, checking off items as completed.

### QUALITY CHECKS (Run after each component)
- [ ] Uses ONLY #eeede9, #1b1b1b, #5170ff
- [ ] Uses ONLY Times New Roman MT font
- [ ] Has 0 border-radius (sharp corners)
- [ ] No gradients anywhere
- [ ] No shadows (shadow-sm, shadow-md, shadow-lg)
- [ ] Mobile responsive
- [ ] Animations are subtle and consistent

### 🔄 ANTI-DRIFT PROTOCOL (CRITICAL FOR LONG SESSIONS)
Every 30 minutes or every 5 components, STOP and verify:
1. Re-read the 3 colors: #eeede9, #1b1b1b, #5170ff - using ANY others?
2. Check recent code for `rounded`, `shadow`, `gradient` - remove if found
3. Check recent code for Tailwind default colors (blue-500, gray-100) - replace with hex
4. Verify all buttons say "Subscribe Free" not just "Subscribe"
5. If inventing a new pattern, STOP - check COMPONENT_REFERENCE.md first

**IF YOU CATCH YOURSELF DRIFTING:**
- Re-read CLAUDE.md "NEVER DO THESE" section
- Re-read COMPONENT_REFERENCE.md for the component you're building
- Delete any code that doesn't match the documented patterns

### START NOW
1. Read CLAUDE.md completely
2. Read tokens.css completely
3. Read plan.md completely
4. Begin Phase 1: Initialize Next.js project
5. Update plan.md as you complete each task

Remember: This website must look like a professional editorial publication, NOT a generic tech startup site. Every component should feel refined and intentional.

## END PROMPT

---

## USAGE INSTRUCTIONS

1. Open terminal in the `/Users/alexchun/Downloads/Thorium Valley Website/` directory
2. Run Claude CLI: `claude`
3. Paste the entire prompt above (from "You are building..." to "...refined and intentional.")
4. Let Claude work through the plan.md checklist
5. Monitor progress and provide feedback as needed

## TIPS FOR BEST RESULTS
- If Claude drifts from the design, remind it to re-read CLAUDE.md
- If colors are wrong, remind: "Only #eeede9, #1b1b1b, #5170ff"
- If fonts are wrong, remind: "Only Times New Roman MT Std"
- If corners are rounded, remind: "Sharp corners only - 0 border-radius"
- Check plan.md to see what Claude has completed
