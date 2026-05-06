const fs = require('fs');
const path = require('path');

const labPath = path.join(__dirname, 'src/data/lab-db.json');
const labDb = JSON.parse(fs.readFileSync(labPath, 'utf8'));

const entry = labDb.find(l => l.slug === 'lab-may-05-2026');
if (!entry) { console.log('❌ lab-may-05-2026 not found'); process.exit(1); }

// Add <h2>The Verdict</h2> before the final verdict paragraph in each story
// Story 1: DeepSeek V4 — verdict starts with "If you do basic writing..."
entry.stories[0].content = entry.stories[0].content.replace(
  '<p>If you do basic writing, brainstorming, or coding and genuinely',
  '<h2>The Verdict</h2>\n<p>If you do basic writing, brainstorming, or coding and genuinely'
);

// Story 2: Claude Design — verdict starts with "That's ultimately the right way..."
entry.stories[1].content = entry.stories[1].content.replace(
  "<p>That's ultimately the right way to think about Claude Design",
  "<h2>The Verdict</h2>\n<p>That's ultimately the right way to think about Claude Design"
);

// Story 3: HeyGen — verdict starts with "For teams that just need..."
entry.stories[2].content = entry.stories[2].content.replace(
  '<p>For teams that just need to get videos made',
  '<h2>The Verdict</h2>\n<p>For teams that just need to get videos made'
);

fs.writeFileSync(labPath, JSON.stringify(labDb, null, 2));
console.log('✅ Added <h2>The Verdict</h2> to all 3 Lab stories');

// Verify
entry.stories.forEach((s, i) => {
  const hasVerdict = s.content.includes('<h2>The Verdict</h2>');
  console.log(`   Story ${i+1} (${s.title}): Verdict header = ${hasVerdict}`);
});
