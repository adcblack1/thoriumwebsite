const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'src/data/articles-db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Read the source markdown
const md = fs.readFileSync('/Users/alexchun/Downloads/Thorium Valley Website/MAY 5 CONTENT/newsletter_20260504_171132.md', 'utf8');

// Parse the 3 articles from markdown
function mdToHtml(text) {
  // Convert markdown links [text](url) -> <a href="url">text</a>
  let html = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  // Convert bold **text** -> <strong>text</strong>
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Convert italic *text* -> <em>text</em> (but not inside <strong>)
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  return html;
}

function extractArticle(md, startHeading) {
  // Find the article section
  const headingIndex = md.indexOf('# ' + startHeading);
  if (headingIndex === -1) throw new Error(`Heading not found: ${startHeading}`);
  
  // Find the end (next --- or end of file)
  const afterHeading = md.substring(headingIndex);
  const lines = afterHeading.split('\n');
  
  let paragraphs = [];
  let currentPara = '';
  let inList = false;
  let listItems = [];
  let skipTitle = true;
  let foundIntoTheValley = false;
  
  for (const line of lines) {
    // Skip the title line
    if (skipTitle && line.startsWith('# ')) { skipTitle = false; continue; }
    
    // Stop at separator
    if (line.trim() === '---') break;
    
    // Skip empty category labels  
    if (['MARKETS', 'WORKFORCE', 'GOVERNANCE'].includes(line.trim())) continue;
    
    // Handle subtitle (first non-empty line after title)
    if (line.trim() === '') {
      if (currentPara.trim()) {
        paragraphs.push(currentPara.trim());
        currentPara = '';
      }
      if (inList && listItems.length > 0) {
        paragraphs.push({ type: 'list', items: listItems });
        listItems = [];
        inList = false;
      }
      continue;
    }
    
    // Handle list items
    if (line.trim().startsWith('- ')) {
      inList = true;
      listItems.push(line.trim().substring(2));
      continue;
    }
    
    // Handle "Into the Valley" section
    if (line.trim().startsWith('**Into the Valley:**')) {
      const ivText = line.trim().replace('**Into the Valley:**', '').trim();
      paragraphs.push({ type: 'into_the_valley', text: ivText });
      continue;
    }
    
    // Regular text
    currentPara += (currentPara ? ' ' : '') + line.trim();
  }
  
  if (currentPara.trim()) paragraphs.push(currentPara.trim());
  if (listItems.length > 0) paragraphs.push({ type: 'list', items: listItems });
  
  // Build HTML
  let html = '';
  for (const p of paragraphs) {
    if (typeof p === 'string') {
      html += `<p>${mdToHtml(p)}</p>\n`;
    } else if (p.type === 'list') {
      html += '<ul>\n';
      for (const item of p.items) {
        html += `<li>${mdToHtml(item)}</li>\n`;
      }
      html += '</ul>\n';
    } else if (p.type === 'into_the_valley') {
      html += `<h2>Into the Valley</h2>\n<p>${mdToHtml(p.text)}</p>`;
    }
  }
  
  return html.trim();
}

// Article 1: Anthropic blocked OpenClaw
const art1Content = extractArticle(md, 'Anthropic blocked OpenClaw. OpenAI was waiting.');
const art1 = db.find(a => a.slug === 'anthropic-blocked-openclaw-openai-was-waiting');
if (art1) {
  art1.content = art1Content;
  console.log('✅ Fixed: anthropic-blocked-openclaw-openai-was-waiting');
  // Verify link count
  const linkCount = (art1Content.match(/<a href=/g) || []).length;
  console.log(`   Links: ${linkCount}`);
}

// Article 2: 59% of companies
const art2Content = extractArticle(md, '59% of companies admit AI layoffs are for show');
const art2 = db.find(a => a.slug === '59-percent-of-companies-admit-ai-layoffs-are-for-show');
if (art2) {
  art2.content = art2Content;
  console.log('✅ Fixed: 59-percent-of-companies-admit-ai-layoffs-are-for-show');
  const linkCount = (art2Content.match(/<a href=/g) || []).length;
  console.log(`   Links: ${linkCount}`);
}

// Article 3: May Day protesters
const art3Content = extractArticle(md, 'May Day protesters marched on the AI labs');
const art3 = db.find(a => a.slug === 'may-day-protesters-marched-on-the-ai-labs');
if (art3) {
  art3.content = art3Content;
  console.log('✅ Fixed: may-day-protesters-marched-on-the-ai-labs');
  const linkCount = (art3Content.match(/<a href=/g) || []).length;
  console.log(`   Links: ${linkCount}`);
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('\n✅ All article content fields fixed and saved');
