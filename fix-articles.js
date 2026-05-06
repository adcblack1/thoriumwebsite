const fs = require('fs');
const path = require('path');

const articlesPath = path.join(__dirname, 'src/data/articles-db.json');
const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));

const may5Slugs = [
  'anthropic-blocked-openclaw-openai-was-waiting',
  '59-percent-of-companies-admit-ai-layoffs-are-for-show',
  'may-day-protesters-marched-on-the-ai-labs'
];

// Read the full articles from content folder
const art1 = fs.readFileSync(path.join(__dirname, '../MAY 5 CONTENT/article_1.md'), 'utf8');
const art2 = fs.readFileSync(path.join(__dirname, '../MAY 5 CONTENT/article_2.md'), 'utf8');
const art3 = fs.readFileSync(path.join(__dirname, '../MAY 5 CONTENT/article_3.md'), 'utf8');

function convertArticleMd(md) {
  let html = '';
  const lines = md.split('\n');
  let inList = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inList) { html += '</ul>\n'; inList = false; }
      continue;
    }
    // Skip category line (first non-empty, all caps)
    if (/^[A-Z]+$/.test(trimmed)) continue;
    // Skip title
    if (trimmed.startsWith('# ')) continue;
    
    // Into the Valley header
    if (trimmed.startsWith('**Into the Valley:**') || trimmed.startsWith('**Into the Valley**:')) {
      if (inList) { html += '</ul>\n'; inList = false; }
      const rest = trimmed.replace(/\*\*Into the Valley[:\*]*\**/g, '').trim();
      html += '<h2>Into the Valley</h2>\n';
      if (rest) html += `<p>${inlineConvert(rest)}</p>\n`;
      continue;
    }
    
    // Bullet
    if (trimmed.startsWith('- ')) {
      if (!inList) { html += '<ul>\n'; inList = true; }
      html += `<li>${inlineConvert(trimmed.slice(2))}</li>\n`;
      continue;
    }
    
    if (inList) { html += '</ul>\n'; inList = false; }
    html += `<p>${inlineConvert(trimmed)}</p>\n`;
  }
  if (inList) html += '</ul>\n';
  return html.trim();
}

function inlineConvert(text) {
  // Convert inline URL references: "text (https://url)" → "<a href="url">text</a>"
  // This format appears in the article files as: "some text (https://example.com)"
  text = text.replace(/([^(]*?)\s*\((https?:\/\/[^)]+)\)/g, (match, preceding, url) => {
    const trimPreceding = preceding.trim();
    if (!trimPreceding) return match;
    
    // Find the last sentence fragment before the URL
    // Look for the meaningful phrase that the URL applies to
    // Strategy: find the last "verb + object" or the last clause
    return `<a href="${url}">${trimPreceding}</a>`;
  });
  
  // Convert markdown bold
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Convert markdown italic
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  // Convert markdown links [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  return text;
}

// The issue: article_1.md uses "text (url)" format instead of [text](url)
// The newsletter_20260504_171132.md uses proper [text](url) format
// For the `content` field we need the FULL article with proper <a> tags
// Best approach: use the newsletter markdown (which has proper links) to generate content from the FULL articles
// Since the newsletter md has condensed versions with proper links, use those as newsletter_content
// For content field, manually process the article md files

for (const article of articles) {
  if (article.slug === 'anthropic-blocked-openclaw-openai-was-waiting') {
    article.content = convertArticleMd(art1);
  } else if (article.slug === '59-percent-of-companies-admit-ai-layoffs-are-for-show') {
    article.content = convertArticleMd(art2);
  } else if (article.slug === 'may-day-protesters-marched-on-the-ai-labs') {
    article.content = convertArticleMd(art3);
  }
}

fs.writeFileSync(articlesPath, JSON.stringify(articles, null, 2));
console.log('✅ Article content fields rebuilt with proper link conversion');

// Verify first article
const a1 = articles.find(a => a.slug === 'anthropic-blocked-openclaw-openai-was-waiting');
const linkCount = (a1.content.match(/<a href=/g) || []).length;
console.log(`   Article 1 link count: ${linkCount}`);
console.log(`   First 200 chars: ${a1.content.substring(0, 200)}`);
