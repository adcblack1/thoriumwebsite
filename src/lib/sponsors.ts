// ============================================
// SPONSOR CONFIGURATION
// Edit this file to swap sponsors in/out.
// No code changes needed — just update the data.
// ============================================

export interface Sponsor {
  slug: string;
  name: string;
  logo: string;        // Path to logo in /public/sponsors/
  copy: string;         // One line of ad copy
  url: string;          // Destination URL (opens in new tab)
  cta?: string;         // Button text (defaults to "Try it free")
}

// ============================================
// STEP 3: Goal-mapped sponsor offers
// After selecting their goal, subscribers see
// ONE sponsor card mapped to their answer.
// ============================================
export const goalSponsors: Record<string, Sponsor> = {
  'Implement AI at my company': {
    slug: 'motion',
    name: 'Motion',
    logo: '/sponsors/motion.png',
    copy: 'AI-powered project management that plans your team\'s work automatically.',
    url: 'https://www.usemotion.com',
    cta: 'Try Motion free',
  },
  'Stay ahead of industry trends': {
    slug: 'bearly',
    name: 'Bearly.AI',
    logo: '/sponsors/bearly.png',
    copy: 'Summarize any document instantly with state-of-the-art AI models.',
    url: 'https://bearly.ai',
    cta: 'Try Bearly free',
  },
  'Work faster with AI': {
    slug: 'gamma',
    name: 'Gamma',
    logo: '/sponsors/gamma.png',
    copy: 'Create stunning presentations in seconds with AI.',
    url: 'https://gamma.app',
    cta: 'Try Gamma free',
  },
  'Automate repetitive work': {
    slug: 'salesforge',
    name: 'Salesforge',
    logo: '/sponsors/salesforge.png',
    copy: 'AI-powered sales outreach that writes and sends itself.',
    url: 'https://www.salesforge.ai',
    cta: 'Try Salesforge free',
  },
  'Build products with AI': {
    slug: 'lovable',
    name: 'Lovable',
    logo: '/sponsors/lovable.png',
    copy: 'Ship full-stack apps from a single prompt. No coding required.',
    url: 'https://lovable.dev',
    cta: 'Try Lovable free',
  },
  'Grow my career': {
    slug: 'shadow',
    name: 'Shadow',
    logo: '/sponsors/shadow.png',
    copy: 'AI meeting assistant that records, transcribes, and summarizes — invisibly.',
    url: 'https://shadow.do',
    cta: 'Try Shadow free',
  },
};

// ============================================
// STEP 8: Sponsor wall
// Show 4-6 tiles on the "Recommended for you" page.
// Optional: filter by seniority/function arrays.
// Empty arrays = show to everyone.
// ============================================
export const wallSponsors: (Sponsor & {
  seniority?: string[];
  function?: string[];
})[] = [
  {
    slug: 'gamma',
    name: 'Gamma',
    logo: '/sponsors/gamma.png',
    copy: 'Beautiful presentations, powered by AI.',
    url: 'https://gamma.app',
    cta: 'Try Gamma',
  },
  {
    slug: 'motion',
    name: 'Motion',
    logo: '/sponsors/motion.png',
    copy: 'AI that plans your entire workday.',
    url: 'https://www.usemotion.com',
    cta: 'Try Motion',
  },
  {
    slug: 'lovable',
    name: 'Lovable',
    logo: '/sponsors/lovable.png',
    copy: 'Build apps with AI. No code needed.',
    url: 'https://lovable.dev',
    cta: 'Try Lovable',
  },
  {
    slug: 'bearly',
    name: 'Bearly.AI',
    logo: '/sponsors/bearly.png',
    copy: 'Read faster with AI-powered summaries.',
    url: 'https://bearly.ai',
    cta: 'Try Bearly',
  },
  {
    slug: 'shadow',
    name: 'Shadow',
    logo: '/sponsors/shadow.png',
    copy: 'Never take meeting notes again.',
    url: 'https://shadow.do',
    cta: 'Try Shadow',
  },
  {
    slug: 'salesforge',
    name: 'Salesforge',
    logo: '/sponsors/salesforge.png',
    copy: 'AI sales outreach on autopilot.',
    url: 'https://www.salesforge.ai',
    cta: 'Try Salesforge',
  },
];
