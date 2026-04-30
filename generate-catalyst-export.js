#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const slug = process.argv[2];
if (!slug) { console.error('Usage: node generate-catalyst-export.js <slug>'); process.exit(1); }

const catalysts = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/data/catalyst-db.json'), 'utf-8'));
const articles = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/data/articles-db.json'), 'utf-8'));

const nl = catalysts.find(n => n.slug === slug);
if (!nl) { console.error(`Catalyst "${slug}" not found`); process.exit(1); }

const BASE = 'https://www.thoriumvalley.com';
const SERIF = "'Times New Roman MT Std','Times New Roman',Georgia,serif";
const SANS = "-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text',system-ui,sans-serif";
const ACCENT = '#5170ff';
const TEXT = '#2D2D2D';
const HEADING = '#2A2A2A';
const UTM = `utm_source=beehiiv&utm_medium=newsletter&utm_campaign=${slug}`;

function enc(s) { return encodeURIComponent(s); }

function processBody(html) {
  // Style <a> tags
  html = html.replace(/<a /g, `<a style="color:${ACCENT};text-decoration:none;" target="_blank" `);
  // Replace Into the Valley header — use the SAME image as the main newsletter
  html = html.replace(/<div[^>]*class="vv-header"[^>]*>.*?<\/div>/gs,
    `<div style="padding:16px 0 4px;"><img src="${BASE}/thumbnails/into-the-valley.png" alt="Into the Valley" style="display:block;width:100%;height:auto;padding:0;" /></div>`);
  // Style <p> tags
  html = html.replace(/<p>/g, `<p style="font-family:${SANS};font-size:16px;line-height:1.5;color:${TEXT};padding:10px 0;margin:0;">`);
  // Style <strong>
  html = html.replace(/<strong>/g, '<strong style="font-weight:700;">');
  // Style <em>
  html = html.replace(/<em>/g, '<em style="font-style:italic;">');
  // Convert <ul>/<li> to + markers
  html = html.replace(/<ul>/g, '');
  html = html.replace(/<\/ul>/g, '');
  html = html.replace(/<li>(.*?)<\/li>/gs, (_, content) =>
    `<p style="font-family:${SANS};font-size:16px;line-height:1.5;color:${TEXT};padding:10px 0 10px 24px;margin:0;"><span style="color:${ACCENT};font-weight:700;">+</span>&nbsp;${content}</p>`
  );
  // Drop cap on first <p>
  let done = false;
  html = html.replace(/>([A-Z])/,  (match, letter) => {
    if (done) return match;
    done = true;
    return `><span style="font-family:'Times New Roman',Georgia,serif;font-size:3.5em;float:left;line-height:0.8;padding-right:8px;padding-top:4px;color:${ACCENT};font-weight:bold;">${letter}</span>`;
  });
  // Strip CSS classes
  html = html.replace(/ class="[^"]*"/g, '');
  return html;
}

function articleCard(art) {
  const artUrl = `${BASE}/articles/${art.slug}?${UTM}`;
  const thumbUrl = `${BASE}${art.thumbnail_url}`;
  const body = processBody(art.newsletter_content);
  return `
<div style="border:1px solid #CDCDCD;border-radius:10px;margin:20px 0;padding:0;overflow:hidden;">
  <div style="padding:0;text-align:center;">
    <a href="${artUrl}" style="display:block;text-decoration:none;">
      <img src="${thumbUrl}" alt="${art.title}" width="100%" style="display:block;width:100%;height:auto;" />
    </a>
  </div>
  <div style="padding:10px 15px 0;text-align:left;">
    <p style="font-family:${SANS};color:${ACCENT};font-size:16px;line-height:1.5;padding:0;margin:0;">${art.category.toUpperCase()}</p>
  </div>
  <div style="padding:4px 15px 0;text-align:left;">
    <div style="font-family:${SERIF};font-size:30px;line-height:1.2;color:${HEADING};margin:0;padding:0;letter-spacing:-0.05em;">${art.title}</div>
  </div>
  <div style="padding:8px 15px 0;text-align:left;">
    <table cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="font-family:${SANS};font-size:11px;color:rgba(27,27,27,0.4);text-transform:uppercase;letter-spacing:0.08em;padding-right:12px;">Share</td>
      <td style="padding-right:12px;"><a href="https://twitter.com/intent/tweet?text=${enc(art.title)}&url=${enc(artUrl)}" target="_blank" style="color:rgba(27,27,27,0.4);text-decoration:none;font-family:${SANS};font-size:14px;font-weight:700;">𝕏</a></td>
      <td><a href="https://www.linkedin.com/sharing/share-offsite/?url=${enc(artUrl)}" target="_blank" style="color:rgba(27,27,27,0.4);text-decoration:none;font-family:${SANS};font-size:14px;font-weight:700;">in</a></td>
    </tr></table>
  </div>
  <div style="padding:0 15px;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);margin:12px 0 8px;"></div></div>
  <div style="padding:0 15px;text-align:left;">
    ${body}
  </div>
  <div style="padding:8px 15px 12px;text-align:left;">
    <a href="${artUrl}" style="font-family:${SANS};font-size:14px;font-weight:600;color:${ACCENT};text-decoration:none;">Read the full story →</a>
  </div>
</div>`;
}

function newsItem(item) {
  const prefix = item.prefix || '';
  return `<p style="font-family:${SANS};font-size:16px;line-height:1.5;color:${TEXT};padding:4px 0 4px 24px;margin:0;"><span style="color:${ACCENT};font-weight:700;">+</span>&nbsp;${prefix}<a style="color:${ACCENT};text-decoration:none;" href="${item.url}" target="_blank">${item.link_text}</a>${item.rest}</p>`;
}

function toolItem(item) {
  const sponsored = item.sponsored ? ' <em style="font-style:italic;color:rgba(27,27,27,0.4);font-size:13px;">(sponsored)</em>' : '';
  return `<p style="font-family:${SANS};font-size:16px;line-height:1.5;color:${TEXT};padding:4px 0 4px 24px;margin:0;"><span style="color:${ACCENT};font-weight:700;">+</span>&nbsp;<a style="color:${ACCENT};text-decoration:none;" href="${item.url}" target="_blank">${item.name}</a>${sponsored}: ${item.desc}</p>`;
}

// ===== BUILD HTML =====
const artObjs = nl.article_slugs.map(s => articles.find(a => a.slug === s)).filter(Boolean);
if (artObjs.length !== nl.article_slugs.length) {
  console.error(`⚠️  Only found ${artObjs.length} of ${nl.article_slugs.length} articles in articles-db.json`);
  nl.article_slugs.forEach(s => {
    if (!articles.find(a => a.slug === s)) console.error(`  MISSING: ${s}`);
  });
}

let html = '';

// Outer wrapper
html += `<div style="max-width:780px;margin:0 auto;padding:0;background-color:#FFFFFF;font-family:${SANS};color:${TEXT};font-size:16px;line-height:1.5;">`;

// 1. Banner
html += `<div style="padding:0 25px 24px;text-align:center;"><img src="${BASE}${nl.banner_image_url}" alt="The Catalyst" width="780" style="display:block;width:100%;height:auto;" /></div>`;

// 2. Intro
const introParagraphs = nl.intro.split('\n\n');
html += `<div style="padding:0 15px;text-align:left;">`;
introParagraphs.forEach((p, i) => {
  if (i === 0) {
    const boldEnd = p.indexOf('.');
    const boldPart = p.substring(0, boldEnd + 1);
    const rest = p.substring(boldEnd + 1);
    html += `<p style="font-family:${SANS};color:${TEXT};font-size:16px;line-height:1.6;padding:12px 0;margin:0;"><strong style="font-weight:700;">${boldPart}</strong>${rest}</p>`;
  } else {
    html += `<p style="font-family:${SANS};color:${TEXT};font-size:16px;line-height:1.6;padding:12px 0;margin:0;">${p}</p>`;
  }
});
html += `</div>`;

// 3. TOC — "IN THIS ISSUE"
html += `<div style="padding:24px 15px 0;"><img src="${BASE}/thumbnails/toc-header.png" alt="In This Issue" style="display:block;width:50%;height:auto;padding:10px 0 6px;"></div>`;
nl.toc.forEach((title, i) => {
  const artSlug = nl.article_slugs[i];
  html += `<div style="padding:4px 15px;text-align:left;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="font-family:${SERIF};font-size:26px;line-height:1.3;color:${HEADING};padding:2px 0;letter-spacing:-0.05em;">
      <img src="${BASE}/thumbnails/toc-bullet.png" width="14" height="14" style="width:14px;height:14px;vertical-align:middle;margin-right:8px;">${title}
    </td>
    <td style="text-align:right;vertical-align:middle;white-space:nowrap;padding-left:12px;">
      <a href="${BASE}/articles/${artSlug}?${UTM}" style="font-family:${SANS};font-size:10px;font-weight:800;color:${ACCENT};text-decoration:none;letter-spacing:0.08em;">FULL STORY</a>
    </td>
  </tr></table>
</div>`;
});

if (nl.poll) {
  const pollId = nl.poll.poll_id;
  html += `<div style="padding:20px 15px 0;text-align:left;">
  <p style="font-family:${SANS};font-weight:600;font-size:16px;color:${TEXT};margin:0;"><em style="font-style:italic;">${nl.poll.question}</em></p>
  <div style="padding:12px 0 0;">`;
  nl.poll.options.forEach(opt => {
    html += `<a href="${BASE}/api/poll/vote?poll=${pollId}&answer=${enc(opt)}&sid={{subscriber_id}}" style="font-family:${SANS};font-size:13px;font-weight:700;color:${ACCENT};text-decoration:none;text-transform:uppercase;letter-spacing:0.05em;margin-right:16px;">${opt.toUpperCase()}</a> `;
  });
  html += `</div></div>`;
}

// 5. Article Cards
artObjs.forEach(art => { html += articleCard(art); });

// 6. OTHER TOOLS card
if (nl.links && nl.links.tools && nl.links.tools.length > 0) {
  html += `<div style="border:1px solid #CDCDCD;border-radius:10px;margin:20px 0;padding:0 0 15px;overflow:hidden;">
  <div style="padding:14px 15px 0;"><p style="font-family:${SANS};color:${ACCENT};font-size:16px;margin:0;">OTHER TOOLS</p></div>
  <div style="padding:4px 15px 0;"><div style="font-family:${SERIF};font-size:30px;line-height:1.2;color:${HEADING};margin:0;letter-spacing:-0.05em;">What our editors are paying attention to this week</div></div>
  <div style="padding:0 15px;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);margin:12px 0 8px;"></div></div>
  <div style="padding:0 15px;">${nl.links.tools.map(toolItem).join('\n')}</div>
</div>`;
}

// 7. EVERYTHING ELSE IN AI card
if (nl.links && nl.links.news && nl.links.news.length > 0) {
  html += `<div style="border:1px solid #CDCDCD;border-radius:10px;margin:20px 0;padding:0 0 15px;overflow:hidden;">
  <div style="padding:14px 15px 0;"><p style="font-family:${SANS};color:${ACCENT};font-size:16px;margin:0;">EVERYTHING ELSE IN AI</p></div>
  <div style="padding:0 15px;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);margin:12px 0 8px;"></div></div>
  <div style="padding:0 15px;">${nl.links.news.map(newsItem).join('\n')}</div>
</div>`;
}

// 8. Sign-off + Footer
html += `<div style="padding:20px 15px 0;text-align:left;">
  <p style="font-family:${SANS};font-size:16px;color:${TEXT};margin:0;padding:4px 0;">${nl.sign_off}</p>
  <p style="font-family:${SANS};font-size:14px;color:${TEXT};margin:0;padding:8px 0 0;">Written by ${nl.writers}</p>
  <p style="font-family:${SANS};font-size:14px;color:${TEXT};margin:0;padding:4px 0;">Know someone making a big bet on AI at their company? We want the story. Reply directly.</p>
</div>`;

html += `</div>`;

// Write output
const outDir = path.join(__dirname, '..', 'APRIL 29 CATALYST');
const outPath = path.join(outDir, 'beehiiv-export.html');
fs.writeFileSync(outPath, html, 'utf-8');
const sizeKB = (Buffer.byteLength(html, 'utf-8') / 1024).toFixed(1);
console.log(`✅ Catalyst export written to: ${outPath}`);
console.log(`📦 Size: ${sizeKB} KB`);
