const fs = require('fs');
const path = require('path');

// ── Paths ──
const DATA = path.join(__dirname, 'src/data');
const articlesPath = path.join(DATA, 'articles-db.json');
const newslettersPath = path.join(DATA, 'newsletters-db.json');
const labPath = path.join(DATA, 'lab-db.json');

// ── Load existing ──
const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
const newsletters = JSON.parse(fs.readFileSync(newslettersPath, 'utf8'));
const labDb = JSON.parse(fs.readFileSync(labPath, 'utf8'));

// ── Helper: convert article markdown to HTML ──
function mdToHtml(md) {
  let html = '';
  const lines = md.split('\n');
  let inList = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inList) { html += '</ul>\n'; inList = false; }
      continue;
    }
    if (trimmed.startsWith('- **')) {
      if (!inList) { html += '<ul>\n'; inList = true; }
      // Parse bullet: - **text**: rest
      const content = trimmed.slice(2);
      html += `<li>${convertInline(content)}</li>\n`;
    } else if (trimmed.startsWith('**Into the Valley:**')) {
      if (inList) { html += '</ul>\n'; inList = false; }
      const text = trimmed.replace('**Into the Valley:**', '').trim();
      html += `<h2>Into the Valley</h2>\n<p>${convertInline(text)}</p>\n`;
    } else if (trimmed.startsWith('# ')) {
      // skip title
    } else {
      if (inList) { html += '</ul>\n'; inList = false; }
      html += `<p>${convertInline(trimmed)}</p>\n`;
    }
  }
  if (inList) html += '</ul>\n';
  return html.trim();
}

function convertInline(text) {
  // Convert markdown links: [text](url) → <a href="url">text</a>
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  // Convert bold: **text** → <strong>text</strong>
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Convert italic: *text* → <em>text</em>
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return text;
}

// ── Article 1: Anthropic blocked OpenClaw ──
const art1Full = fs.readFileSync(path.join(__dirname, '../MAY 5 CONTENT/article_1.md'), 'utf8');
const art1Html = mdToHtml(art1Full);

// Newsletter content from newsletter md (condensed version)
const newsletterMd = fs.readFileSync(path.join(__dirname, '../MAY 5 CONTENT/newsletter_20260504_171132.md'), 'utf8');

// Extract condensed articles from newsletter md
function extractCondensed(md, titleStart) {
  const lines = md.split('\n');
  let capturing = false;
  let captured = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('# ' + titleStart)) {
      capturing = true;
      continue;
    }
    if (capturing && lines[i].trim() === '---') break;
    if (capturing) captured.push(lines[i]);
  }
  // Remove leading category label line
  while (captured.length && !captured[0].trim()) captured.shift();
  return captured.join('\n').trim();
}

const condensed1 = extractCondensed(newsletterMd, 'Anthropic blocked OpenClaw');
const condensed2 = extractCondensed(newsletterMd, '59% of companies admit AI layoffs');
const condensed3 = extractCondensed(newsletterMd, 'May Day protesters marched');

const art1NewsletterHtml = mdToHtml('# skip\n\n' + condensed1);
const art2Full = fs.readFileSync(path.join(__dirname, '../MAY 5 CONTENT/article_2.md'), 'utf8');
const art2Html = mdToHtml(art2Full);
const art2NewsletterHtml = mdToHtml('# skip\n\n' + condensed2);
const art3Full = fs.readFileSync(path.join(__dirname, '../MAY 5 CONTENT/article_3.md'), 'utf8');
const art3Html = mdToHtml(art3Full);
const art3NewsletterHtml = mdToHtml('# skip\n\n' + condensed3);

// ── New articles ──
const newArticles = [
  {
    id: 'anthropic-blocked-openclaw-openai-was-waiting',
    slug: 'anthropic-blocked-openclaw-openai-was-waiting',
    title: 'Anthropic blocked OpenClaw. OpenAI was waiting.',
    category: 'Markets',
    tags: ['Anthropic', 'OpenAI'],
    thumbnail_url: '/thumbnails/anthropic-blocked-openclaw-openai-was-waiting.png',
    content: art1Html,
    newsletter_content: art1NewsletterHtml,
    reading_time: '4 min',
    published_at: '2026-05-05T13:00:00.000Z',
    updated_at: '2026-05-05T13:00:00.000Z',
    status: 'published',
    featured: false
  },
  {
    id: '59-percent-of-companies-admit-ai-layoffs-are-for-show',
    slug: '59-percent-of-companies-admit-ai-layoffs-are-for-show',
    title: '59% of companies admit AI layoffs are for show',
    category: 'Workforce',
    tags: ['Meta', 'Microsoft'],
    thumbnail_url: '/thumbnails/59-percent-of-companies-admit-ai-layoffs-are-for-show.png',
    content: art2Html,
    newsletter_content: art2NewsletterHtml,
    reading_time: '4 min',
    published_at: '2026-05-05T13:00:00.000Z',
    updated_at: '2026-05-05T13:00:00.000Z',
    status: 'published',
    featured: false
  },
  {
    id: 'may-day-protesters-marched-on-the-ai-labs',
    slug: 'may-day-protesters-marched-on-the-ai-labs',
    title: 'May Day protesters marched on the AI labs',
    category: 'Governance',
    tags: ['Anthropic', 'OpenAI', 'xAI', 'Google'],
    thumbnail_url: '/thumbnails/may-day-protesters-marched-on-the-ai-labs.png',
    content: art3Html,
    newsletter_content: art3NewsletterHtml,
    reading_time: '3 min',
    published_at: '2026-05-05T13:00:00.000Z',
    updated_at: '2026-05-05T13:00:00.000Z',
    status: 'published',
    featured: false
  }
];

// Prepend new articles
articles.unshift(...newArticles);
fs.writeFileSync(articlesPath, JSON.stringify(articles, null, 2));
console.log('✅ articles-db.json updated (3 new articles prepended)');

// ── Newsletter entry ──
const newNewsletter = {
  id: 'may-05-2026',
  slug: 'may-05-2026',
  title: 'Thorium Valley | May 5, 2026',
  date: 'May 5, 2026',
  intro: "Good Morning Thorium Valley. Anthropic cut OpenClaw off from Claude subscriptions. Four weeks later, OpenAI opened the door for all of those users. Sam Altman signed off with \"Happy lobstering.\" Real subtle, Sam.\n\nTurns out 59% of companies admit they exaggerate AI's role in layoffs because it plays better with investors. Ninety-two percent of them are still hiring this year. The AI job apocalypse is looking a lot more like a PR strategy than an actual workforce shift.\n\nAnd on May Day, protesters showed up at Anthropic, OpenAI, and xAI — not with op-eds or tweets, but picket signs. AI labs are used to congressional pressure. Angry crowds at the front door is a different thing entirely.",
  toc: [
    'Anthropic blocked OpenClaw. OpenAI was waiting.',
    '59% of companies admit AI layoffs are for show',
    'May Day protesters marched on the AI labs'
  ],
  article_slugs: [
    'anthropic-blocked-openclaw-openai-was-waiting',
    '59-percent-of-companies-admit-ai-layoffs-are-for-show',
    'may-day-protesters-marched-on-the-ai-labs'
  ],
  sign_off: "That's all for today. If this issue made you think, share it with someone who needs to think harder.",
  writers: 'Jason Chen, Advait Prakash, Andrew Hales, and the Thorium Valley crew.',
  banner_image_url: '/thumbnails/banner-2026-05-05.png',
  published_at: '2026-05-05T13:00:00.000Z',
  updated_at: '2026-05-05T13:00:00.000Z',
  status: 'published',
  links: {
    news: [
      { link_text: 'Meta cuts 8,000 jobs', rest: " to fund its $125–145B AI infrastructure splurge — Zuckerberg told staff it's a zero-sum choice between people and compute", url: 'https://finance.biggo.com/news/202605021200_Meta_Cuts_8000_Jobs_for_AI_Infrastructure' },
      { link_text: 'Musk admitted on the stand', rest: " that xAI trained on OpenAI's models — a rough first week in his $130B lawsuit against Altman", url: 'https://www.cnbc.com/2026/05/02/musk-testimony-dominated-first-week-musk-v-altman-trial-in-oakland.html' },
      { prefix: 'Families of a Canadian school shooting ', link_text: 'sue OpenAI', rest: ", alleging ChatGPT failed to alert police after flagging the shooter's account months earlier", url: 'https://www.kqed.org/news/12082064/openai-back-in-court-over-canada-school-shooters-use-of-chatgpt' },
      { link_text: "Anthropic's use of entire books for AI training counts as fair use", rest: ' — even though it downloaded 7 million e-books from illegal sources', url: 'https://themunicheye.com/anthropic-partial-win-copyright-case-23639' },
      { link_text: 'VS Code quietly started crediting GitHub Copilot', rest: ' as co-author on every git commit — even when AI features were turned off', url: 'https://awesomeagents.ai/news/vscode-1-118-copilot-coauthor-commits/' },
      { prefix: 'Wall Street now expects Big Tech AI spending to ', link_text: 'top $1 trillion in 2027', rest: ' after Microsoft, Google, Amazon, and Meta all raised their 2026 budgets', url: 'https://www.briefs.co/news/ai-capex-1-trillion/' },
      { link_text: "The creator of the 'This is fine' meme says", rest: " AI startup Artisan stole his art for a subway ad — and he's looking for a lawyer", url: 'https://tech.yahoo.com/ai/deals/articles/fine-creator-says-ai-startup-201651894.html' },
      { link_text: "Sony's table tennis robot", rest: ' beat elite human players three out of five matches — reacting to 20 m/s balls in under half a second', url: 'https://techxplore.com/news/2026-04-table-tennis-robot-defeats-world.html' }
    ],
    tools: [
      { name: 'Gemini', desc: "Google's AI app just got a major redesign — image generation, video, music, deep research, and canvas are now grouped into one clean scrollable menu instead of scattered across the app", url: 'https://www.fortuneindia.com/technology/google-rolls-out-gemini-redesign-with-unified-tools-layout/135832', sponsored: false },
      { name: 'Adobe for Creativity + Claude', desc: "A new connector lets Claude orchestrate workflows across 50+ Adobe tools — tell it what you need in plain English and it handles the Photoshop edits, video reframing, and asset packaging for you", url: 'https://bluelightningtv.com/2026/05/02/claude-now-runs-adobe-creative-cloud-workflows/', sponsored: false },
      { name: 'Cursor 3.0', desc: "The AI coding editor now lets you spin up multiple agents working in parallel — one refactors your code while another writes tests, and you can hand off long tasks to the cloud and close your laptop", url: 'https://dev.to/ashutosh_maurya/the-third-era-of-coding-exploring-cursor-30-5mf', sponsored: false },
      { name: 'Google TV + Gemini', desc: "You can now create AI images with Nano Banana, generate videos with Veo, and search your Google Photos by voice — all from your TV remote", url: 'https://ppc.land/google-tv-brings-gemini-image-and-video-creation-to-the-living-room/', sponsored: false },
      { name: 'MLJAR Studio', desc: "A desktop app that turns plain English questions about your data into executable Python notebooks — everything runs locally on your machine, so sensitive data never leaves your computer", url: 'https://headlinesbriefing.com/dev/hacker-news/mljar-studio-private-ai-data-analyst-tool-for-local-machine-learning-workflows-672e43cb', sponsored: false }
    ],
    jobs: [
      { company: 'Ontra', role: 'Senior Product Manager', url: 'https://www.ontra.ai/job/senior-product-manager/' },
      { company: 'Microsoft AI', role: 'Principal Product Marketing Manager', url: 'https://microsoft.ai/job/principal-product-marketing-manager-4/' },
      { company: 'Airbnb', role: 'Staff Platform Manager, AI Personalization', url: 'https://careers.airbnb.com/positions/7834495/' },
      { company: 'Nuro', role: 'Senior/Staff ML Research Scientist, Generative Modeling for Planning', url: 'https://underprompt.com/jobs/seniorstaff-machine-learning-research-scientist-generative-modeling-for-planning-nuro' }
    ]
  },
  games: {
    game_poll_id: '1d1c0ec0-3a9b-4959-9914-fe24a3d37e63',
    image_a: '/thumbnails/kicker-2026-05-05-ai.jpeg',
    image_b: '/thumbnails/kicker-2026-05-05-real.jpg',
    link_a: 'https://gemini.google.com/share/7aff46a8fa54',
    link_b: 'https://unsplash.com/photos/river-winding-through-forested-hills-at-sunset-wWFcv6e08pc'
  },
  poll: {
    poll_id: 'c3efec12-a9d6-4909-bb76-97256d99bebf',
    question: 'Are most "AI layoffs" actually about AI?',
    options: ['Yes', 'No', 'Other']
  },
  poll_results: {
    question: 'Do you trust AI-generated answers in search results enough to skip clicking the original source?',
    total_votes: 3,
    results: [
      { answer: 'Yes', count: 1, percentage: 33 },
      { answer: 'No', count: 2, percentage: 67 }
    ]
  },
  yesterdays_results: {
    ai_image: '/thumbnails/kicker-2026-05-04-ai.jpeg',
    real_image: '/thumbnails/kicker-2026-05-04-real.jpg',
    ai_source: 'https://gemini.google.com/share/35046a7a18d7',
    real_source: 'https://unsplash.com/photos/sunlight-streams-through-a-natural-rock-arch-over-the-ocean-Ssf_ASosll0'
  }
};

newsletters.unshift(newNewsletter);
fs.writeFileSync(newslettersPath, JSON.stringify(newsletters, null, 2));
console.log('✅ newsletters-db.json updated (may-05-2026 prepended)');

// ── Lab newsletter ──
const labMd = fs.readFileSync(path.join(__dirname, '../MAY 4 LAB/lab_newsletter.md'), 'utf8');

function labStoryToHtml(md) {
  let html = '';
  const lines = md.split('\n');
  let inList = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inList) { html += '</ul>\n'; inList = false; }
      continue;
    }
    if (trimmed.startsWith('# ') || trimmed.startsWith('## ')) continue;
    if (trimmed.startsWith('### ')) {
      // CTA link like ### [Try DeepSeek V4 →](url)
      const match = trimmed.match(/###\s+\[(.+?)\]\((.+?)\)/);
      if (match) {
        html += `<p><a href="${match[2]}">${match[1]}</a></p>\n`;
      }
      continue;
    }
    if (trimmed.startsWith('- ')) {
      if (!inList) { html += '<ul>\n'; inList = true; }
      html += `<li>${convertInline(trimmed.slice(2))}</li>\n`;
    } else {
      if (inList) { html += '</ul>\n'; inList = false; }
      html += `<p>${convertInline(trimmed)}</p>\n`;
    }
  }
  if (inList) html += '</ul>\n';
  return html.trim();
}

// Parse lab stories
function parseLabStories(md) {
  const sections = md.split('---');
  const stories = [];
  const thumbMap = {
    'Is DeepSeek V4 Almost as Good as ChatGPT?': '/thumbnails/is-deepseek-v4-almost-as-good-as-chatgpt.jpeg',
    "Claude Design Can't Make Images. It Doesn't Need To.": '/thumbnails/claude-design-cant-make-images-it-doesnt-need-to.jpeg',
    'Your Company Has No Excuse Not to Make That Training Video': '/thumbnails/your-company-has-no-excuse-not-to-make-that-training-video.jpeg'
  };
  const catMap = {
    'Is DeepSeek V4 Almost as Good as ChatGPT?': 'ASSISTANT',
    "Claude Design Can't Make Images. It Doesn't Need To.": 'DESIGN',
    'Your Company Has No Excuse Not to Make That Training Video': 'PRODUCTIVITY'
  };

  for (const section of sections) {
    const lines = section.trim().split('\n');
    let title = null;
    let storyLines = [];
    let foundTitle = false;
    for (const line of lines) {
      if (!foundTitle && line.trim().startsWith('# ') && !line.trim().startsWith('# The Lab')) {
        title = line.trim().replace('# ', '');
        foundTitle = true;
        continue;
      }
      if (foundTitle) storyLines.push(line);
    }
    if (title && thumbMap[title]) {
      stories.push({
        title,
        category: catMap[title] || 'TOOLS',
        thumbnail_url: thumbMap[title],
        content: labStoryToHtml(storyLines.join('\n'))
      });
    }
  }
  return stories;
}

const labStories = parseLabStories(labMd);

// Parse lab links
function parseLabNews(md) {
  const newsMatch = md.match(/## EVERYTHING ELSE IN AI\n([\s\S]*?)(?=\n---|\n$)/);
  if (!newsMatch) return [];
  const items = [];
  for (const line of newsMatch[1].split('\n')) {
    const m = line.trim().match(/^-\s+\[(.+?)\]\((.+?)\)\s*(.*)$/);
    if (m) {
      items.push({ link_text: m[1], rest: m[3] ? ' ' + m[3].replace(/^[—–-]\s*/, '— ') : '', url: m[2] });
    }
  }
  return items;
}

function parseLabTools(md) {
  const toolsMatch = md.match(/## OTHER TOOLS\n([\s\S]*?)(?=\n---|\n$)/);
  if (!toolsMatch) return [];
  const items = [];
  for (const line of toolsMatch[1].split('\n')) {
    const m = line.trim().match(/^-\s+\[(.+?)\]\((.+?)\)(?:\s*\*(sponsored)\*)?\s*:\s*(.+)$/);
    if (m) {
      items.push({ name: m[1], desc: m[4].trim(), url: m[2], sponsored: !!m[3] });
    }
  }
  return items;
}

const labNews = parseLabNews(labMd);
const labTools = parseLabTools(labMd);

// Previous Lab poll results
const prevLabPollResults = {
  question: 'What is your honest reaction when someone recommends a new AI tool?',
  total_votes: 3,
  results: [
    { answer: 'Ooh, signing up right now', count: 1, percentage: 33 },
    { answer: 'Added to a list I will never look at', count: 1, percentage: 33 },
    { answer: 'I will wait for someone else to test it first', count: 1, percentage: 33 }
  ]
};

const newLab = {
  id: 'lab-may-05-2026',
  slug: 'lab-may-05-2026',
  publication: 'the-lab',
  title: "Is DeepSeek V4 Almost as Good as ChatGPT?",
  date: 'May 5, 2026',
  intro: "Good Morning Thorium Valley, welcome back to The Lab.\n\nToday we're looking at a free chatbot that scores surprisingly close to the ones you're paying $20 a month for.\n\nWe're also checking out a new design tool that can't generate images, which sounds broken until you see what it actually builds instead.\n\nAnd we're testing whether an AI video maker can finally kill your company's excuse for not making that training video.",
  toc: [
    'Is DeepSeek V4 Almost as Good as ChatGPT?',
    "Claude Design Can't Make Images. It Doesn't Need To.",
    'Your Company Has No Excuse Not to Make That Training Video'
  ],
  article_slugs: [],
  stories: labStories,
  sign_off: "That's the Lab for this week. If a tool in here saved you time or wasted it, tell us — reply directly.",
  writers: 'Jason Chen, Advait Prakash, Andrew Hales, and the Thorium Valley crew.',
  banner_image_url: '/thumbnails/banner-lab-2026-05-05.png',
  thumbnail_url: '/thumbnails/is-deepseek-v4-almost-as-good-as-chatgpt.jpeg',
  published_at: '2026-05-05T13:00:00.000Z',
  updated_at: '2026-05-05T13:00:00.000Z',
  status: 'published',
  links: {
    news: labNews,
    tools: labTools,
    jobs: []
  },
  games: null,
  poll: {
    poll_id: 'feff7e35-2b40-439c-96c2-ce00517d25ec',
    question: "What's your honest reaction when someone recommends a new AI tool?",
    options: [
      'Ooh, signing up right now',
      "Added to a list I'll never look at",
      'I already have too many',
      "I'll wait for someone else to test it first",
      'Other'
    ]
  },
  poll_results: prevLabPollResults,
  yesterdays_results: null
};

labDb.unshift(newLab);
fs.writeFileSync(labPath, JSON.stringify(labDb, null, 2));
console.log('✅ lab-db.json updated (lab-may-05-2026 prepended)');
console.log(`   Stories: ${labStories.length}`);
console.log(`   News items: ${labNews.length}`);
console.log(`   Tools: ${labTools.length}`);
