#!/usr/bin/env node
/**
 * Ingests Catalyst articles into articles-db.json and creates/updates catalyst-db.json entry.
 * Reads:
 *   - article_X.md files (full length → content field)
 *   - catalyst_newsletter.md (newsletter condensed versions → newsletter_content field)
 */

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'APRIL 29 CATALYST');
const DATA_DIR = path.join(__dirname, 'src/data');

// Convert markdown-ish text to HTML
function mdToHtml(text, category) {
  // Remove the category line (e.g. "STARTUP") and the # headline
  const lines = text.split('\n');
  let bodyLines = [];
  let skipHeader = true;
  for (const line of lines) {
    if (skipHeader) {
      if (line.trim() === '' || line.trim() === category.toUpperCase() || line.startsWith('# ')) continue;
      skipHeader = false;
    }
    bodyLines.push(line);
  }
  let body = bodyLines.join('\n').trim();

  // Convert markdown links FIRST: [text](url) → <a href="url">text</a>
  body = body.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2">$1</a>');

  // Fallback: Convert raw URLs in parens: text (https://...) → <a href="...">text</a>
  // Only matches if not already inside an <a> tag (i.e. not preceded by ">")
  body = body.replace(/(?<!>)([^()<>\n]+?)\s*\((https?:\/\/[^)]+)\)/g, (match, textBefore, url) => {
    const linkText = textBefore.trim();
    return `<a href="${url}">${linkText}</a>`;
  });

  // Convert **text** to <strong>text</strong>
  body = body.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Convert bullet points (- **text** rest) to list items
  body = body.replace(/^- (.+)$/gm, '<li>$1</li>');

  // Wrap consecutive <li> in <ul>
  body = body.replace(/(<li>.*?<\/li>\n?)+/gs, (match) => `<ul>${match}</ul>`);

  // Convert paragraphs (double newline separated)
  const paragraphs = body.split(/\n\n+/);
  let html = '';
  for (const p of paragraphs) {
    const trimmed = p.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('<ul>') || trimmed.startsWith('<div') || trimmed.startsWith('<li>')) {
      html += trimmed + '\n';
    } else {
      // Handle Into the Valley header
      if (trimmed.startsWith('<strong>Into the Valley:')) {
        html += `<div class="vv-header" style="padding:0;"><img src="/thumbnails/into-the-valley.png" alt="Into the Valley" style="width:100%;height:auto;display:block;" /></div>\n`;
        const analysisText = trimmed.replace('<strong>Into the Valley:</strong>', '').trim();
        html += `<p>${analysisText}</p>\n`;
      } else {
        html += `<p>${trimmed}</p>\n`;
      }
    }
  }

  return html.trim();
}

// Extract newsletter article content from catalyst_newsletter.md
function extractNewsletterArticles(mdContent) {
  // Split by --- separators
  const sections = mdContent.split(/\n---\n/);
  const articles = [];

  for (const section of sections) {
    const trimmed = section.trim();
    // Look for article sections (have a category line and # headline)
    const categoryMatch = trimmed.match(/^(STARTUP|INDUSTRY|ENTERPRISE|WORKFORCE|GOVERNANCE|MARKETS)\n\n# (.+)/m);
    if (categoryMatch) {
      const category = categoryMatch[1];
      const headline = categoryMatch[2];
      // Everything after the headline
      const bodyStart = trimmed.indexOf(headline) + headline.length;
      let body = trimmed.substring(bodyStart).trim();

      // Convert markdown links to HTML
      body = body.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2">$1</a>');
      body = body.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      body = body.replace(/^- (.+)$/gm, '<li>$1</li>');
      body = body.replace(/(<li>.*?<\/li>\n?)+/gs, (match) => `<ul>${match}</ul>`);

      const paragraphs = body.split(/\n\n+/);
      let html = '';
      for (const p of paragraphs) {
        const t = p.trim();
        if (!t) continue;
        if (t.startsWith('<ul>') || t.startsWith('<li>')) {
          html += t + '\n';
        } else if (t.startsWith('<strong>Into the Valley:')) {
          html += `<div class="vv-header" style="padding:0;"><img src="/thumbnails/into-the-valley.png" alt="Into the Valley" style="width:100%;height:auto;display:block;" /></div>\n`;
          const analysisText = t.replace('<strong>Into the Valley:</strong>', '').trim();
          html += `<p>${analysisText}</p>\n`;
        } else {
          html += `<p>${t}</p>\n`;
        }
      }

      articles.push({ category, headline, html: html.trim() });
    }
  }
  return articles;
}

// ===== ARTICLE DEFINITIONS =====
const articleDefs = [
  {
    slug: 'the-case-against-adding-ai-incrementally',
    title: 'The case against adding AI incrementally',
    subtitle: 'One founder decided the safest thing he could do was throw away a working product and start over.',
    category: 'Startup',
    tags: ['Product Fruits'],
    thumbnail_url: '/thumbnails/the-case-against-adding-ai-incrementally.jpeg',
    reading_time: 5,
    sourceFile: 'article_1.md',
    sourceCat: 'STARTUP'
  },
  {
    slug: 'consulting-clients-are-writing-ai-discounts-into-the-fine-print',
    title: 'Consulting clients are writing AI discounts into the fine print',
    subtitle: 'Companies are now hard-coding 10% discounts into consulting contracts when the firm uses AI to deliver the work.',
    category: 'Industry',
    tags: ['McKinsey', 'KPMG', 'BCG'],
    thumbnail_url: '/thumbnails/consulting-clients-are-writing-ai-discounts-into-the-fine-print.jpeg',
    reading_time: 5,
    sourceFile: 'article_2.md',
    sourceCat: 'INDUSTRY'
  },
  {
    slug: 'why-anthropic-just-won-the-enterprise-spending-race',
    title: 'Why Anthropic just won the enterprise spending race',
    subtitle: 'Three months was all it took.',
    category: 'Enterprise',
    tags: ['Anthropic', 'OpenAI'],
    thumbnail_url: '/thumbnails/why-anthropic-just-won-the-enterprise-spending-race.jpeg',
    reading_time: 4,
    sourceFile: 'article_3.md',
    sourceCat: 'ENTERPRISE'
  }
];

// Read and convert full articles
const newsletterMd = fs.readFileSync(path.join(CONTENT_DIR, 'catalyst_newsletter.md'), 'utf-8');
const newsletterArticles = extractNewsletterArticles(newsletterMd);

const newArticles = articleDefs.map((def, i) => {
  const fullMd = fs.readFileSync(path.join(CONTENT_DIR, def.sourceFile), 'utf-8');
  const fullHtml = mdToHtml(fullMd, def.sourceCat);

  // Match newsletter article by index
  const nlArt = newsletterArticles[i];
  const newsletterHtml = nlArt ? nlArt.html : fullHtml;

  return {
    id: def.slug,
    slug: def.slug,
    title: def.title,
    subtitle: def.subtitle,
    author: 'Thorium Valley',
    category: def.category,
    tags: def.tags,
    thumbnail_url: def.thumbnail_url,
    published_at: '2026-04-29T13:00:00.000Z',
    updated_at: '2026-04-29T13:00:00.000Z',
    status: 'published',
    featured: false,
    reading_time: def.reading_time,
    publication: 'the-catalyst',
    content: fullHtml,
    newsletter_content: newsletterHtml
  };
});

// Add to articles-db.json
const articlesDb = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'articles-db.json'), 'utf-8'));
// Remove any existing entries with same slugs
const existingSlugs = new Set(newArticles.map(a => a.slug));
const filtered = articlesDb.filter(a => !existingSlugs.has(a.slug));
const updatedArticles = [...newArticles, ...filtered];
fs.writeFileSync(path.join(DATA_DIR, 'articles-db.json'), JSON.stringify(updatedArticles, null, 2), 'utf-8');
console.log(`✅ ${newArticles.length} Catalyst articles added to articles-db.json`);

// Now create catalyst-db.json entry
// Parse links from catalyst_newsletter.md
function parseLinks(md) {
  const tools = [];
  const news = [];

  // Extract OTHER TOOLS section
  const toolsMatch = md.match(/## OTHER TOOLS\n([\s\S]*?)(?=\n---)/);
  if (toolsMatch) {
    const toolLines = toolsMatch[1].trim().split('\n').filter(l => l.startsWith('- '));
    for (const line of toolLines) {
      const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
      const sponsored = line.includes('*(sponsored)*');
      const descMatch = line.match(/\*?:?\s*(.+)$/);
      if (linkMatch) {
        let desc = line.substring(line.indexOf(')') + 1).replace(/^\s*\*?\s*\(sponsored\)\s*\*?\s*:?\s*/, '').replace(/^\s*:\s*/, '').trim();
        tools.push({ name: linkMatch[1], desc, url: linkMatch[2], sponsored });
      }
    }
  }

  // Extract EVERYTHING ELSE section
  const newsMatch = md.match(/## EVERYTHING ELSE IN AI\n([\s\S]*?)(?=\n---)/);
  if (newsMatch) {
    const newsLines = newsMatch[1].trim().split('\n').filter(l => l.startsWith('- '));
    for (const line of newsLines) {
      // Handle inline links
      const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        const fullLine = line.substring(2).trim(); // remove "- "
        const linkStart = fullLine.indexOf('[');
        const linkEnd = fullLine.indexOf(')') + 1;
        const prefix = linkStart > 0 ? fullLine.substring(0, linkStart) : '';
        const rest = fullLine.substring(linkEnd).trim();
        news.push({
          ...(prefix ? { prefix } : {}),
          link_text: linkMatch[1],
          rest: rest ? (rest.startsWith('—') || rest.startsWith(',') || rest.startsWith(' —') ? ` ${rest}` : ` — ${rest}`) : '',
          url: linkMatch[2]
        });
      }
    }
  }

  return { tools, news };
}

const links = parseLinks(newsletterMd);

// Parse poll
let poll = null;
const pollMatch = newsletterMd.match(/## 📊 POLL\n\n\*\*(.+?)\*\*/);
if (pollMatch) {
  const pollLine = newsletterMd.match(/🟢\s*(.+?)\s*·\s*🔴\s*(.+?)\s*·\s*🟡\s*(.+?)\s*·\s*🔵\s*(.+)/);
  if (pollLine) {
    poll = {
      question: pollMatch[1],
      options: [pollLine[1].trim(), pollLine[2].trim(), pollLine[3].trim(), pollLine[4].trim()]
    };
  }
}

const catalystEntry = {
  id: 'catalyst-april-29-2026',
  slug: 'catalyst-april-29-2026',
  publication: 'the-catalyst',
  title: 'The Catalyst | April 29, 2026',
  date: 'April 29, 2026',
  intro: "Good Morning Thorium Valley, welcome back to the Catalyst Newsletter.\n\nToday we've got a founder who had 1,100 paying customers, clients like KPMG, and $2 million in annual revenue, and then emailed his investors to say he was stopping all work on the product and rebuilding it from scratch.\n\nWe're also looking at what happens when consulting firms brag about how much time AI saves them and their clients start doing the math. Companies are now writing automatic discounts into consulting contracts whenever AI touches the work.\n\nAnd then there's Anthropic, which somehow won the enterprise spending race while charging two and a half times more than OpenAI. The answer has less to do with pricing and more to do with who's actually making the buying decisions.",
  toc: [
    'The Case Against Adding AI Incrementally',
    'Consulting Clients Are Writing AI Discounts Into the Fine Print',
    'Why Anthropic Just Won the Enterprise Spending Race'
  ],
  article_slugs: [
    'the-case-against-adding-ai-incrementally',
    'consulting-clients-are-writing-ai-discounts-into-the-fine-print',
    'why-anthropic-just-won-the-enterprise-spending-race'
  ],
  stories: [],
  sign_off: "That's the Catalyst for this issue. If you know a company doing something interesting with AI that nobody's covering, reply and tell us about it.",
  writers: 'Jason Chen, Advait Prakash, Andrew Hales, and the Thorium Valley crew.',
  banner_image_url: '/thumbnails/banner-catalyst-2026-04-29.png',
  thumbnail_url: '/thumbnails/the-case-against-adding-ai-incrementally.jpeg',
  published_at: '2026-04-29T13:00:00.000Z',
  updated_at: '2026-04-29T13:00:00.000Z',
  status: 'published',
  links: {
    news: links.news,
    tools: links.tools
  },
  poll: poll
};

// Add to catalyst-db.json
const catalystDb = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'catalyst-db.json'), 'utf-8'));
const filteredCatalyst = catalystDb.filter(c => c.slug !== 'catalyst-april-29-2026');
const updatedCatalyst = [catalystEntry, ...filteredCatalyst];
fs.writeFileSync(path.join(DATA_DIR, 'catalyst-db.json'), JSON.stringify(updatedCatalyst, null, 2), 'utf-8');
console.log(`✅ Catalyst edition added to catalyst-db.json`);
console.log(`📰 Articles: ${newArticles.map(a => a.slug).join(', ')}`);
console.log(`🔗 Tools: ${links.tools.length}, News: ${links.news.length}`);
if (poll) console.log(`📊 Poll: "${poll.question}" (${poll.options.length} options)`);
