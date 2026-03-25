# Thorium Valley Website - Claude Code Configuration

## 🚨 CRITICAL: READ THESE FILES BEFORE WRITING ANY CODE 🚨

1. **CLAUDE.md** (this file) - Brand guidelines, design rules, workflow
2. **tokens.css** - CSS design tokens (colors, typography, spacing)
3. **plan.md** - 14-phase build checklist to track progress
4. **COMPONENT_REFERENCE.md** - Ready-to-use React component code (COPY DIRECTLY)

All component code in COMPONENT_REFERENCE.md is pre-configured with correct colors, fonts, and patterns. **Copy it directly instead of writing from scratch.**

---

## 🛑 ANTI-SLOP MANDATE: READ THIS FIRST 🛑

**EVERYTHING in this project comes from firecrawled reference sites. You are NOT to invent, improvise, or "improve" anything.**

The reference sites are:
- **TheDeepView.com** - Newsletter structure, layout, forms
- **Rundown.ai** - Hero headlines, animations, sharp corners
- **QuickNode.com** - Metric displays, tech styling, advertise patterns
- **Perplexity Hub** - Warm backgrounds, category pills, clean cards

### Rules:
1. If a pattern isn't documented here or in COMPONENT_REFERENCE.md, DO NOT CREATE IT
2. If unsure how something should look, copy EXACTLY from reference site patterns
3. DO NOT add your own creative interpretations
4. DO NOT use default Tailwind colors or generic UI patterns
5. EVERY color, font, spacing value must come from tokens.css

---

## BRAND IDENTITY

### Colors (ONLY THESE THREE)
```css
--color-background: #eeede9;   /* Light cream - ENTIRE site background like TheDeepView */
--color-text: #1b1b1b;         /* Near-black - ALL text, borders, lines */
--color-accent: #5170ff;       /* Blue - Subscribe buttons, links, sparkle logo accent */
```

### Typography (ONLY THIS FONT)
- **Font Family**: `'Times New Roman MT Std', 'Times New Roman', Georgia, serif`
- Use the provided font files in `/Times New Roman MT Std/` directory
- Headlines: Bold weight
- Body: Regular weight  
- Emphasis: Italic weight
- NO OTHER FONTS ALLOWED

### Logo Assets
- **TV Icon (Light BG)**: `/Transparent Black Logo.png` - Use on cream backgrounds
- **TV Icon (Dark BG)**: `/Transparent White Logo.png` - Use if ever on dark sections
- **Text Logo (Light BG)**: `/Transparent Black Text Logo.png` - "Thorium" wordmark
- **Text Logo (Dark BG)**: `/Transparent White Text Logo.png`
- All logos have blue sparkle accent that matches `#5170ff`

---

## DESIGN RULES (STOLEN FROM REFERENCE SITES)

### From TheDeepView.com (Newsletter Structure)
- Newsletter subscription is PRIMARY CTA - featured prominently
- Clean, uncluttered layout with generous whitespace
- Article grid: Clean cards with subtle borders
- High contrast, readable typography
- Maximum width: 1280px centered container
- Newsletter form: Border container, email input + button inline

### From Rundown.ai (Animations & Headlines)
- Hero headline: Large (48-64px), bold statement
- Form inline style: Input + button side by side
- Hover animations: Subtle translateY on cards (200ms ease)
- Stagger animations: 100ms delay between elements
- Sharp corners throughout (0px border-radius)

### From QuickNode (Tech Aesthetic)
- Section labels in comment style: `// Section Name`
- Colored text highlights for emphasis
- Large metric displays where relevant
- Dark inputs with light text (for contrast areas)

### From Perplexity Hub (Warm Background)
- Off-white/cream background creates sophisticated feel
- Classic blue links (#5170ff matches this)
- Topic pills for category filters
- Monospace labels for categories
- Clean card layout with dates

---

## SITE ARCHITECTURE

### Pages Required
```
/                    → Homepage (Newsletter-first like TheDeepView)
/newsletter          → Newsletter archive (chronological grid)
/newsletter/[slug]   → Individual newsletter page
/advertise           → Advertise page (globe illustration)
/about               → About page
/privacy             → Privacy policy
/terms               → Terms of service
```

### Homepage Structure (From TheDeepView pattern)
```
┌─────────────────────────────────────────────────────────────┐
│ NAVIGATION                                                   │
│ [TV Logo] ............. Nav Links ......... [Sign In] [Subscribe Free] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                    HERO SECTION                              │
│            "AI Is *Eating* the World"                        │
│         (eating = italicized Times New Roman)                │
│              [Email Input] [Subscribe Free]                  │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│               FEATURED NEWSLETTER                            │
│         (Most recent newsletter, large card)                 │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│              RECENT NEWSLETTERS                              │
│    (Grid of newsletter cards, 3 columns desktop)             │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│              CATEGORY SECTIONS                               │
│    // Big Tech    // Research    // Tools                    │
│    (Article cards organized by category)                     │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│           SUBSCRIBE CTA SECTION                              │
│      "AI Is *Eating* the World"                              │
│     [Email Input] [Subscribe Free]                           │
├─────────────────────────────────────────────────────────────┤
│                    FOOTER                                    │
│   [Logo] Links | Social | © 2026 Thorium Valley             │
└─────────────────────────────────────────────────────────────┘
```

---

## COMPONENT SPECIFICATIONS

### Navigation Header (From TheDeepView pattern)
```html
<header class="bg-[#eeede9] max-w-[1280px] mx-auto flex flex-col relative z-50 py-5">
  <div class="relative flex items-center justify-between px-4 lg:px-6 border-b border-[#1b1b1b]/20">
    <!-- Logo -->
    <a href="/">
      <img src="/Transparent Black Logo.png" alt="Thorium Valley" class="h-10" />
    </a>
    
    <!-- Nav Links (desktop) -->
    <nav class="hidden lg:flex items-center gap-8">
      <a href="/newsletter" class="text-[#1b1b1b] hover:text-[#5170ff] font-normal">Newsletter</a>
      <a href="/advertise" class="text-[#1b1b1b] hover:text-[#5170ff] font-normal">Advertise</a>
      <a href="/about" class="text-[#1b1b1b] hover:text-[#5170ff] font-normal">About</a>
    </nav>
    
    <!-- CTA Group -->
    <div class="flex items-center gap-4">
      <a href="/auth/login" class="text-[#1b1b1b] text-sm font-normal">Sign In</a>
      <button class="bg-[#5170ff] text-white px-6 py-2 text-sm font-medium">
        Subscribe Free
      </button>
    </div>
  </div>
</header>
```

### Subscribe Button (From TheDeepView/Rundown pattern)
- Background: `#5170ff` (our blue accent)
- Text: White, medium weight
- Padding: `px-6 py-2`
- NO border-radius (sharp corners from Rundown)
- Hover: Slight darken or translateY(-2px)
- Text: "Subscribe Free" (ALWAYS this exact text for subscribe CTAs)

### Newsletter Form (From TheDeepView pattern)
```html
<form class="flex border-2 border-[#1b1b1b] max-w-md">
  <input 
    type="email" 
    placeholder="Your email address"
    class="flex-1 px-4 py-3 bg-[#eeede9] text-[#1b1b1b] placeholder-[#1b1b1b]/50 focus:outline-none"
  />
  <button 
    type="submit"
    class="px-6 py-3 bg-[#5170ff] text-white font-medium"
  >
    Subscribe Free
  </button>
</form>
```

### Article/Newsletter Card (From Rundown pattern)
```html
<a href="/newsletter/slug" class="group block">
  <!-- Image -->
  <div class="aspect-[16/9] overflow-hidden bg-[#1b1b1b]/5 mb-4">
    <img 
      src="thumbnail.jpg" 
      alt="Title"
      class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
    />
    <!-- Category Tag -->
    <span class="absolute top-3 left-3 bg-[#5170ff] text-white text-xs font-medium px-2 py-1">
      Category
    </span>
  </div>
  
  <!-- Content -->
  <h3 class="text-[#1b1b1b] font-bold text-lg mb-2 group-hover:text-[#5170ff] transition-colors">
    Article Title Here
  </h3>
  <time class="text-[#1b1b1b]/60 text-sm">
    January 26, 2026
  </time>
</a>
```

### Section Label (From QuickNode pattern)
```html
<span class="text-[#1b1b1b]/60 text-sm font-normal tracking-wider">
  // Section Name
</span>
```

### Subscribe CTA Section (Before Footer)
```html
<section class="bg-[#eeede9] py-24 border-t border-[#1b1b1b]/20">
  <div class="max-w-[1280px] mx-auto px-4 text-center">
    <h2 class="text-4xl lg:text-5xl font-bold text-[#1b1b1b] mb-6">
      AI Is <em>Eating</em> the World
    </h2>
    <p class="text-[#1b1b1b]/70 mb-8 max-w-lg mx-auto">
      Join thousands of readers getting the essential AI briefing every day.
    </p>
    <form class="flex justify-center border-2 border-[#1b1b1b] max-w-md mx-auto">
      <input type="email" placeholder="Your email address" class="..." />
      <button type="submit" class="bg-[#5170ff] text-white px-6 py-3 font-medium">
        Subscribe Free
      </button>
    </form>
  </div>
</section>
```

---

## ANIMATION PATTERNS (From Reference Sites)

### Scroll Fade-In (Apply to cards, sections)
```css
@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-up {
  animation: fade-up 0.6s ease-out forwards;
}
```

### Card Hover (From Rundown)
```css
.card:hover {
  transform: translateY(-4px);
}

.card {
  transition: transform 0.2s ease;
}
```

### Stagger Children (From Rundown/Perplexity)
- First element: 0ms delay
- Each subsequent: +100ms
- Example: 0ms, 100ms, 200ms, 300ms...

### Smooth Scroll Between Sections
- Use Lenis or CSS scroll-behavior: smooth
- Anchor links scroll smoothly

### Page Load Sequence
```
0ms    - Navigation fades in
100ms  - Hero headline fades up
200ms  - Hero subtext fades up
300ms  - Newsletter form fades up
500ms  - Featured article fades in
600ms+ - Grid items stagger in
```

---

## SCROLL-TRIGGERED SUBSCRIBE POPUP

When user scrolls past 50% of article content AND is not signed in:
```html
<div class="fixed bottom-0 left-0 right-0 bg-[#eeede9] border-t-2 border-[#1b1b1b] p-4 z-50">
  <div class="max-w-[600px] mx-auto flex items-center justify-between gap-4">
    <p class="text-[#1b1b1b] font-medium">Want more? Subscribe free.</p>
    <form class="flex border border-[#1b1b1b]">
      <input type="email" class="px-3 py-2 bg-[#eeede9]" placeholder="Email" />
      <button class="bg-[#5170ff] text-white px-4 py-2">Subscribe Free</button>
    </form>
  </div>
</div>
```

If already subscribed, show: "Already a subscriber? Sign in"

---

## BACKEND INTEGRATION

### Beehiiv Newsletter API
```typescript
// Environment variables needed:
BEEHIIV_API_KEY=xxx
BEEHIIV_PUBLICATION_ID=xxx

// Subscribe endpoint
POST https://api.beehiiv.com/v2/publications/{pub_id}/subscriptions
{
  "email": "user@example.com",
  "send_welcome_email": true
}
```

### Supabase (Auth & Data)
```typescript
// Environment variables needed:
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

// Tables:
- subscribers (synced with Beehiiv)
- articles (content for website)
- newsletters (newsletter editions)
```

---

## ADVERTISE PAGE SPECIFICATIONS (From QuickNode/Rundown patterns)

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ NAVIGATION (same as all pages)                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                    HERO SECTION                              │
│         "Reach [X]+ AI Leaders Daily"                       │
│         Subtext about audience quality                       │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│              METRICS ROW (From QuickNode)                   │
│    ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐       │
│    │ 50K+   │   │  45%   │   │  3min  │   │ 100+   │       │
│    │Readers │   │OpenRate│   │ReadTime│   │Companies│      │
│    └────────┘   └────────┘   └────────┘   └────────┘       │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│              GLOBE ILLUSTRATION (Line art)                  │
│                   SVG wireframe                              │
│           Colors: #1b1b1b lines, #5170ff nodes              │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│              SPONSORSHIP OPTIONS                             │
│         (Cards with offerings and pricing)                   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│              CONTACT CTA                                     │
│         [Email or Form to get in touch]                      │
├─────────────────────────────────────────────────────────────┤
│                    FOOTER                                    │
└─────────────────────────────────────────────────────────────┘
```

### Metric Display Component (Stolen from QuickNode)
```html
<div class="grid grid-cols-2 lg:grid-cols-4 gap-8 py-16 border-y border-[#1b1b1b]/20">
  <div class="text-center">
    <span class="text-5xl font-bold text-[#1b1b1b]">50K+</span>
    <span class="block text-[#1b1b1b]/60 text-sm mt-2">Daily Readers</span>
  </div>
  <div class="text-center">
    <span class="text-5xl font-bold text-[#5170ff]">45%</span>
    <span class="block text-[#1b1b1b]/60 text-sm mt-2">Open Rate</span>
  </div>
  <div class="text-center">
    <span class="text-5xl font-bold text-[#1b1b1b]">3min</span>
    <span class="block text-[#1b1b1b]/60 text-sm mt-2">Avg Read Time</span>
  </div>
  <div class="text-center">
    <span class="text-5xl font-bold text-[#5170ff]">100+</span>
    <span class="block text-[#1b1b1b]/60 text-sm mt-2">Sponsors</span>
  </div>
</div>
```

### Globe Illustration (Line Art Style)
- **Style**: Wireframe/line art (NOT 3D render, NOT gradient)
- **Colors**: `#1b1b1b` for lines, `#5170ff` for accent nodes/dots
- **Animation**: Subtle slow rotation or floating effect (CSS only)
- **Reference**: QuickNode uses similar tech illustrations
```css
.globe-container {
  animation: subtle-float 6s ease-in-out infinite;
}

@keyframes subtle-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

### Sponsorship Cards (Sharp corners, clean)
```html
<div class="border-2 border-[#1b1b1b] p-8">
  <h3 class="text-2xl font-bold text-[#1b1b1b] mb-4">Newsletter Sponsorship</h3>
  <p class="text-[#1b1b1b]/70 mb-6">Featured placement in our daily newsletter...</p>
  <a href="mailto:ads@thoriumvalley.com" class="bg-[#5170ff] text-white px-6 py-3 inline-block font-medium">
    Get in Touch
  </a>
</div>
```

---

## TECH STACK

```
Framework: Next.js 14+ (App Router)
Styling: Tailwind CSS + CSS Variables
Fonts: Local Times New Roman MT Std files
Animation: CSS only (keyframes + transitions)
Smooth Scroll: Lenis
CMS: Beehiiv for newsletters
Auth: Supabase Auth
Database: Supabase Postgres
Deployment: Vercel
```

---

## FILE STRUCTURE

```
thorium-valley-website/
├── app/
│   ├── layout.tsx                 # Root layout with fonts, providers
│   ├── page.tsx                   # Homepage
│   ├── newsletter/
│   │   ├── page.tsx              # Newsletter archive
│   │   └── [slug]/page.tsx       # Individual newsletter
│   ├── advertise/page.tsx        # Advertise page
│   ├── about/page.tsx            # About page
│   ├── privacy/page.tsx          # Privacy policy
│   ├── terms/page.tsx            # Terms of service
│   ├── auth/
│   │   ├── login/page.tsx        # Login page
│   │   └── callback/route.ts     # Auth callback
│   └── api/
│       ├── subscribe/route.ts    # Beehiiv subscribe endpoint
│       └── newsletters/route.ts  # Fetch newsletters
├── components/
│   ├── Header.tsx                # Navigation header
│   ├── Footer.tsx                # Site footer
│   ├── NewsletterForm.tsx        # Reusable subscribe form
│   ├── NewsletterCard.tsx        # Newsletter/article card
│   ├── NewsletterGrid.tsx        # Grid of cards
│   ├── SubscribeCTA.tsx          # Pre-footer subscribe section
│   ├── ScrollSubscribePopup.tsx  # Scroll-triggered popup
│   ├── GlobeIllustration.tsx     # Advertise page globe
│   └── FadeIn.tsx                # Scroll animation wrapper
├── lib/
│   ├── beehiiv.ts                # Beehiiv API client
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   └── server.ts             # Server client
│   └── utils.ts                  # Helpers
├── styles/
│   ├── globals.css               # Global styles, tokens
│   └── fonts.css                 # Font-face declarations
├── public/
│   ├── fonts/                    # Copy .otf files here from /Times New Roman MT Std/
│   ├── Transparent Black Logo.png           # Icon for light bg
│   ├── Transparent White Logo.png           # Icon for dark bg
│   ├── Transparent Black Text Logo.png      # Wordmark for light bg
│   └── Transparent White Text Logo.png      # Wordmark for dark bg
└── .env.local                    # Environment variables
```

---

## WORKFLOW

### Phase 1: Foundation
1. Initialize Next.js project with TypeScript
2. Set up Tailwind CSS with design tokens
3. Configure fonts (Times New Roman MT Std)
4. Copy logo assets to public folder
5. Create base layout with fonts applied

### Phase 2: Components
1. Build Header component
2. Build Footer component
3. Build NewsletterForm component
4. Build NewsletterCard component
5. Build NewsletterGrid component
6. Build SubscribeCTA section
7. Build FadeIn animation wrapper

### Phase 3: Pages
1. Build homepage with all sections
2. Build newsletter archive page
3. Build individual newsletter page
4. Build advertise page with globe illustration
5. Build about, privacy, terms pages

### Phase 4: Backend
1. Set up Supabase project
2. Configure Beehiiv API integration
3. Create API routes for subscribe
4. Implement auth flow
5. Build scroll-triggered subscribe popup

### Phase 5: Polish
1. Add all animations (fade-in, hover, stagger)
2. Implement smooth scroll
3. Add mock articles for testing
4. Test all forms and buttons
5. Verify mobile responsiveness
6. Run accessibility audit

---

## 🚫 NEVER DO THESE (CRITICAL - WILL CAUSE AI SLOP)

### Colors
- ❌ DO NOT use any color other than #eeede9, #1b1b1b, #5170ff
- ❌ DO NOT use Tailwind default colors (blue-500, gray-100, etc.)
- ❌ DO NOT add opacity colors not defined in tokens.css

### Typography
- ❌ DO NOT use any font other than Times New Roman MT Std
- ❌ DO NOT use Inter, Roboto, Arial, SF Pro, Helvetica
- ❌ DO NOT use Google Fonts
- ❌ DO NOT use font weights not in font files (only Regular 400, Bold 700, Italic - NO medium/500)

### Styling
- ❌ DO NOT use gradients (user explicitly said NO)
- ❌ DO NOT use rounded corners (sharp corners only, border-radius: 0)
- ❌ DO NOT use shadows (shadow-sm, shadow-md, etc.)
- ❌ DO NOT use blur effects or glassmorphism

### Components
- ❌ DO NOT invent components - only use patterns from reference sites
- ❌ DO NOT create "creative" layouts not shown in this file
- ❌ DO NOT add icons not specified (no Lucide icons except where shown)
- ❌ DO NOT use hero patterns with large background images

### Content
- ❌ DO NOT use stock photos - use placeholders or generated thumbnails
- ❌ DO NOT write placeholder text like "Lorem ipsum"
- ❌ DO NOT change "Subscribe Free" to any other text
- ❌ DO NOT modify "AI Is *Eating* the World" headline

### Animations
- ❌ DO NOT add unnecessary animations - keep it subtle and consistent
- ❌ DO NOT use bounce, shake, or attention-grabbing animations
- ❌ DO NOT animate everything - only what's specified

---

## ✅ ALWAYS DO THESE

### Brand
- ✅ ALWAYS use the three brand colors only (#eeede9, #1b1b1b, #5170ff)
- ✅ ALWAYS use Times New Roman MT font from local files
- ✅ ALWAYS use "Subscribe Free" for subscribe CTAs (exact text)
- ✅ ALWAYS use "AI Is *Eating* the World" with eating italicized

### Styling
- ✅ ALWAYS use sharp corners (border-radius: 0)
- ✅ ALWAYS maintain consistent spacing (8px base unit from tokens.css)
- ✅ ALWAYS use CSS variables from tokens.css
- ✅ ALWAYS apply max-w-[1280px] to container elements

### Patterns
- ✅ ALWAYS reference the design patterns from this file
- ✅ ALWAYS copy components from COMPONENT_REFERENCE.md
- ✅ ALWAYS check against reference sites before inventing

### Technical
- ✅ ALWAYS test on mobile
- ✅ ALWAYS implement smooth scroll (Lenis)
- ✅ ALWAYS add fade-in animations on scroll
- ✅ ALWAYS include prefers-reduced-motion support

### Quality
- ✅ ALWAYS verify colors match exactly
- ✅ ALWAYS verify fonts load correctly
- ✅ ALWAYS verify animations are subtle

---

## FINAL CHECK: Before Submitting Any Code

1. [ ] Are ALL colors from the 3-color palette?
2. [ ] Is ALL text in Times New Roman MT?
3. [ ] Are ALL corners sharp (0 radius)?
4. [ ] Are there NO gradients?
5. [ ] Does "Subscribe Free" appear on all subscribe buttons?
6. [ ] Is the headline "AI Is *Eating* the World" with italic?
7. [ ] Are animations subtle and purposeful?
8. [ ] Does it match the reference site patterns?
