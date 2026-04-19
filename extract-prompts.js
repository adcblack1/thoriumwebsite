/**
 * Extract prompts from catalyst-db.json and lab-db.json stories
 * and append them to prompts-db.json
 */
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'src', 'data');
const promptsPath = path.join(dataDir, 'prompts-db.json');
const existingPrompts = JSON.parse(fs.readFileSync(promptsPath, 'utf-8'));
const existingSlugs = new Set(existingPrompts.map(p => p.slug));

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractPrompts(dbPath, publication) {
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  const newPrompts = [];

  for (const edition of db) {
    if (!edition.stories) continue;
    for (const story of edition.stories) {
      const storySlug = slugify(story.title);
      if (existingSlugs.has(storySlug)) {
        console.log(`  SKIP (exists): ${storySlug}`);
        continue;
      }

      // Extract prompt from <pre><code>...</code></pre>
      const match = story.content.match(/<pre><code>([\s\S]*?)<\/code><\/pre>/);
      if (!match) {
        console.log(`  SKIP (no prompt): ${story.title}`);
        continue;
      }

      // Determine type from section header
      const isFormula = story.content.includes('<h2>The Formula</h2>');
      const isVerdict = story.content.includes('<h2>The Verdict</h2>');
      const type = isFormula ? 'formula' : isVerdict ? 'verdict' : 'formula';

      // Decode HTML entities in the prompt
      let promptText = match[1]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"');

      const entry = {
        slug: storySlug,
        title: story.title,
        newsletter_slug: edition.slug,
        publication: publication,
        type: type,
        prompt: promptText
      };

      newPrompts.push(entry);
      console.log(`  ADD: ${storySlug} (${type})`);
    }
  }
  return newPrompts;
}

console.log('Extracting from catalyst-db.json...');
const catalystPrompts = extractPrompts(
  path.join(dataDir, 'catalyst-db.json'),
  'the-catalyst'
);

console.log('Extracting from lab-db.json...');
const labPrompts = extractPrompts(
  path.join(dataDir, 'lab-db.json'),
  'the-lab'
);

const allNew = [...catalystPrompts, ...labPrompts];
if (allNew.length === 0) {
  console.log('\nNo new prompts to add.');
} else {
  const merged = [...existingPrompts, ...allNew];
  fs.writeFileSync(promptsPath, JSON.stringify(merged, null, 2) + '\n');
  console.log(`\nAdded ${allNew.length} new prompts. Total: ${merged.length}`);
}
