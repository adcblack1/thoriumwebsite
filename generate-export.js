#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const slug = process.argv[2];
if (!slug) { console.error('Usage: node generate-export.js <slug>'); process.exit(1); }

const newsletters = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/data/newsletters-db.json'), 'utf-8'));
const articles = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/data/articles-db.json'), 'utf-8'));

const nl = newsletters.find(n => n.slug === slug);
if (!nl) { console.error(`Newsletter "${slug}" not found`); process.exit(1); }

const BASE = 'https://www.thoriumvalley.com';
const SERIF = "'Times New Roman MT Std','Times New Roman',Georgia,serif";
const SANS = "-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text',system-ui,sans-serif";
const ACCENT = '#5170ff';
const TEXT = '#2D2D2D';
const HEADING = '#2A2A2A';

function enc(s) { return encodeURIComponent(s); }

function processBody(html, isFirst) {
  // Absolutize src/href
  html = html.replace(/src="\/(?!\/)/g, `src="${BASE}/`);
  html = html.replace(/href="\/(?!\/)/g, `href="${BASE}/`);
  // Style all <a> tags
  html = html.replace(/<a /g, `<a style="color:${ACCENT};text-decoration:none;" target="_blank" `);
  // Replace vv-header div with into-the-valley image
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
    `<p style="font-family:${SANS};font-size:16px;line-height:1.5;color:${TEXT};padding:4px 0 4px 24px;margin:0;"><span style="color:${ACCENT};font-weight:700;">+</span>&nbsp;${content}</p>`
  );
  // Drop cap on first paragraph
  if (isFirst !== false) {
    let done = false;
    html = html.replace(/>([A-Z])/,  (match, letter) => {
      if (done) return match;
      done = true;
      return `><span style="font-family:'Times New Roman',Georgia,serif;font-size:3.5em;float:left;line-height:0.8;padding-right:8px;padding-top:4px;color:${ACCENT};font-weight:bold;">${letter}</span>`;
    });
  }
  // Strip CSS classes
  html = html.replace(/ class="[^"]*"/g, '');
  return html;
}

function articleCard(art, idx) {
  const artUrl = `${BASE}/articles/${art.slug}`;
  const thumbUrl = `${BASE}${art.thumbnail_url}`;
  const body = processBody(art.newsletter_content, true);
  return `
<div style="border:1px solid #CDCDCD;border-radius:10px;margin:20px 0;padding:0;overflow:hidden;">
  <div style="padding:0;text-align:center;">
    <a href="${artUrl}" style="display:block;text-decoration:none;">
      <img src="${thumbUrl}" alt="${art.title}" width="100%" style="display:block;width:100%;height:auto;" />
    </a>
  </div>
  <div style="padding:10px 15px 0;text-align:left;">
    <p style="font-family:${SANS};color:${ACCENT};font-size:16px;font-weight:500;line-height:1.5;padding:0;margin:0;">${art.category.toUpperCase()}</p>
  </div>
  <div style="padding:4px 15px 0;text-align:left;">
    <div style="font-family:${SERIF};font-size:30px;line-height:1.2;color:${HEADING};margin:0;padding:0;letter-spacing:-0.05em;">${art.title}</div>
  </div>
  <div style="padding:8px 15px 0;text-align:left;">
    <table cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="font-family:${SANS};font-size:11px;color:rgba(27,27,27,0.4);text-transform:uppercase;letter-spacing:0.08em;padding-right:12px;">Share</td>
      <td style="padding-right:12px;"><a href="https://twitter.com/intent/tweet?text=${enc(art.title)}&url=${enc(artUrl)}" target="_blank" style="color:rgba(27,27,27,0.4);text-decoration:none;font-size:14px;">𝕏</a></td>
      <td><a href="https://www.linkedin.com/sharing/share-offsite/?url=${enc(artUrl)}" target="_blank" style="color:rgba(27,27,27,0.4);text-decoration:none;font-size:14px;">in</a></td>
    </tr></table>
  </div>
  <div style="padding:0 15px;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);margin:12px 0 8px;"></div></div>
  <div style="padding:0 15px;text-align:left;word-break:break-word;">
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

function jobItem(item) {
  return `<p style="font-family:${SANS};font-size:16px;line-height:1.5;color:${TEXT};padding:4px 0 4px 24px;margin:0;"><span style="color:${ACCENT};font-weight:700;">+</span>&nbsp;<a style="color:${ACCENT};text-decoration:none;" href="${item.url}" target="_blank">${item.company}</a> — ${item.role}</p>`;
}

function toolItem(item) {
  return `<p style="font-family:${SANS};font-size:16px;line-height:1.5;color:${TEXT};padding:4px 0 4px 24px;margin:0;"><span style="color:${ACCENT};font-weight:700;">+</span>&nbsp;<a style="color:${ACCENT};text-decoration:none;" href="${item.url}" target="_blank">${item.name}</a>: ${item.desc}</p>`;
}

// ===== BUILD HTML =====
const artObjs = nl.article_slugs.map(s => articles.find(a => a.slug === s)).filter(Boolean);
let html = '';

// Outer wrapper
html += `<div style="max-width:780px;margin:0 auto;padding:0;background-color:#FFFFFF;font-family:${SANS};color:${TEXT};font-size:16px;line-height:1.5;">`;

// 1. Banner
html += `<div style="padding:0 25px 24px;text-align:center;"><img src="${BASE}${nl.banner_image_url}" alt="Banner" width="780" style="display:block;width:100%;height:auto;" /></div>`;

// 2. Intro
const introParagraphs = nl.intro.split('\n\n');
html += `<div style="padding:0 15px;text-align:left;word-break:break-word;">`;
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

// 3. TOC
html += `<div style="padding:24px 15px 0;"><img src="${BASE}/thumbnails/toc-header.png" alt="In Today's Newsletter" style="display:block;width:50%;height:auto;padding:10px 0 6px;"></div>`;
nl.toc.forEach((title, i) => {
  const artSlug = nl.article_slugs[i];
  html += `<div style="padding:4px 15px;text-align:left;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="font-family:${SERIF};font-size:26px;line-height:1.3;color:${HEADING};padding:2px 0;letter-spacing:-0.05em;">
      <img src="${BASE}/thumbnails/toc-bullet.png" width="14" height="14" style="width:14px;height:14px;vertical-align:middle;margin-right:8px;">${title}
    </td>
    <td style="text-align:right;vertical-align:middle;white-space:nowrap;padding-left:12px;">
      <a href="${BASE}/articles/${artSlug}" style="font-family:${SANS};font-size:10px;font-weight:800;color:${ACCENT};text-decoration:none;letter-spacing:0.08em;">FULL STORY</a>
    </td>
  </tr></table>
</div>`;
});

// 4. Secondary TOC
html += `<div style="padding:14px 15px 0;">
  <span style="font-family:${SANS};font-size:14px;color:rgba(27,27,27,0.5);margin-right:20px;">
    <img src="${BASE}/thumbnails/toc-bullet.png" width="10" height="10" style="opacity:0.4;vertical-align:middle;margin-right:6px;">What else happened today?
  </span>
  <span style="font-family:${SANS};font-size:14px;color:rgba(27,27,27,0.5);">
    <img src="${BASE}/thumbnails/toc-bullet.png" width="10" height="10" style="opacity:0.4;vertical-align:middle;margin-right:6px;">What AI tools should I be using?
  </span>
</div>`;

// 5. Quick Poll (if exists)
if (nl.poll) {
  const pollId = nl.poll.poll_id;
  html += `<div style="padding:20px 15px 0;text-align:left;">
  <p style="font-family:${SANS};font-weight:600;font-size:16px;color:${TEXT};margin:0;">Quickly before we dive in — <em style="font-style:italic;">${nl.poll.question}</em></p>
  <div style="padding:12px 0 0;">`;
  nl.poll.options.forEach(opt => {
    html += `<a href="${BASE}/api/poll/vote?poll=${pollId}&answer=${enc(opt)}&sid={{subscriber_id}}" style="font-family:${SANS};font-size:13px;font-weight:700;color:${ACCENT};text-decoration:none;text-transform:uppercase;letter-spacing:0.05em;margin-right:16px;">${opt.toUpperCase()}</a>`;
  });
  html += `</div></div>`;
}

// 6. Article Cards
artObjs.forEach((art, i) => { html += articleCard(art, i); });

// 7. News + Jobs Card
html += `<div style="border:1px solid #CDCDCD;border-radius:10px;margin:20px 0;padding:0 0 15px;overflow:hidden;">
  <div style="padding:0;text-align:center;"><img src="${BASE}/thumbnails/news-header.png" alt="In Other News" width="100%" style="display:block;width:100%;height:auto;" /></div>
  <div style="padding:10px 15px 0;"><p style="font-family:${SANS};color:${ACCENT};font-size:16px;margin:0;">IN OTHER NEWS</p></div>
  <div style="padding:4px 15px 0;"><div style="font-family:${SERIF};font-size:30px;line-height:1.2;color:${HEADING};margin:0;letter-spacing:-0.05em;">What else happened today?</div></div>
  <div style="padding:0 15px;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);margin:12px 0 8px;"></div></div>
  <div style="padding:0 15px;">${nl.links.news.map(newsItem).join('\n')}</div>
  <div style="border-bottom:1px solid rgba(27,27,27,0.06);margin:0 15px;"></div>
  <div style="padding:14px 15px 4px;"><p style="font-family:${SANS};color:${HEADING};font-size:13px;font-weight:700;letter-spacing:0.06em;margin:0;">WHO'S HIRING IN AI</p></div>
  <div style="padding:0 15px 5px;">${nl.links.jobs.map(jobItem).join('\n')}</div>
</div>`;

// 8. Games Card
if (nl.games) {
  const gid = nl.games.game_poll_id;
  html += `<div style="border:1px solid #CDCDCD;border-radius:10px;margin:20px 0;padding:0 0 15px;overflow:hidden;">
  <div style="padding:0;text-align:center;"><img src="${BASE}/thumbnails/games-header.png" alt="Games" width="100%" style="display:block;width:100%;height:auto;" /></div>
  <div style="padding:10px 15px 0;"><p style="font-family:${SANS};color:${ACCENT};font-size:16px;margin:0;">GAMES</p></div>
  <div style="padding:4px 15px 0;"><div style="font-family:${SERIF};font-size:30px;line-height:1.2;color:${HEADING};margin:0;letter-spacing:-0.05em;">AI or real — can you tell the difference?</div></div>
  <div style="padding:0 15px;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);margin:12px 0 8px;"></div></div>
  <div style="padding:0 15px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td width="48%" style="text-align:center;vertical-align:top;">
        <a href="${BASE}/api/poll/vote?poll=${gid}&answer=Option+A&sid={{subscriber_id}}" style="text-decoration:none;">
          <img src="${BASE}${nl.games.image_a}" alt="Option A" style="display:block;width:100%;height:auto;border-radius:6px;" />
          <p style="font-family:${SERIF};font-size:14px;color:${HEADING};margin:8px 0 0;letter-spacing:-0.02em;">Option A</p>
        </a>
      </td>
      <td width="4%"></td>
      <td width="48%" style="text-align:center;vertical-align:top;">
        <a href="${BASE}/api/poll/vote?poll=${gid}&answer=Option+B&sid={{subscriber_id}}" style="text-decoration:none;">
          <img src="${BASE}${nl.games.image_b}" alt="Option B" style="display:block;width:100%;height:auto;border-radius:6px;" />
          <p style="font-family:${SERIF};font-size:14px;color:${HEADING};margin:8px 0 0;letter-spacing:-0.02em;">Option B</p>
        </a>
      </td>
    </tr></table>
    <p style="font-family:${SANS};font-size:14px;color:${TEXT};margin:12px 0 0;text-align:center;">Which image is real? <a href="${BASE}/api/poll/vote?poll=${gid}&answer=Option+A&sid={{subscriber_id}}" style="color:${ACCENT};text-decoration:none;">Option A</a> | <a href="${BASE}/api/poll/vote?poll=${gid}&answer=Option+B&sid={{subscriber_id}}" style="color:${ACCENT};text-decoration:none;">Option B</a></p>
  </div>`;

  // Yesterday's Results (inside games card)
  if (nl.yesterdays_results) {
    const yr = nl.yesterdays_results;
    html += `
  <div style="padding:16px 0 4px;"><img src="${BASE}/thumbnails/yesterdays-results.png" alt="Yesterday's Results" style="display:block;width:100%;height:auto;" /></div>
  <div style="padding:0 15px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td width="48%" style="text-align:center;vertical-align:top;">
        <a href="${yr.ai_source}" target="_blank" style="text-decoration:none;">
          <img src="${BASE}${yr.ai_image}" alt="AI Image" style="display:block;width:100%;height:auto;border-radius:6px;" />
          <p style="font-family:${SERIF};font-size:14px;color:${HEADING};margin:8px 0 0;">AI IMAGE</p>
        </a>
      </td>
      <td width="4%"></td>
      <td width="48%" style="text-align:center;vertical-align:top;">
        <a href="${yr.real_source}" target="_blank" style="text-decoration:none;">
          <img src="${BASE}${yr.real_image}" alt="Real Image" style="display:block;width:100%;height:auto;border-radius:6px;" />
          <p style="font-family:${SERIF};font-size:14px;color:${HEADING};margin:8px 0 0;">REAL IMAGE</p>
        </a>
      </td>
    </tr></table>
  </div>`;
  }
  html += `</div>`;
}

// 9. AI Tools Card
html += `<div style="border:1px solid #CDCDCD;border-radius:10px;margin:20px 0;padding:0 0 15px;overflow:hidden;">
  <div style="padding:0;text-align:center;"><img src="${BASE}/thumbnails/tools-header.png" alt="AI Tools" width="100%" style="display:block;width:100%;height:auto;" /></div>
  <div style="padding:10px 15px 0;"><p style="font-family:${SANS};color:${ACCENT};font-size:16px;margin:0;">AI TOOLS</p></div>
  <div style="padding:4px 15px 0;"><div style="font-family:${SERIF};font-size:30px;line-height:1.2;color:${HEADING};margin:0;letter-spacing:-0.05em;">What our editors are paying attention to today</div></div>
  <div style="padding:0 15px;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);margin:12px 0 8px;"></div></div>
  <div style="padding:0 15px;">${nl.links.tools.map(toolItem).join('\n')}</div>
</div>`;

// 10. Sign-off + Footer
html += `<div style="padding:20px 15px 0;text-align:left;">
  <p style="font-family:${SANS};font-size:16px;color:${TEXT};margin:0;padding:4px 0;">${nl.sign_off}</p>
  <p style="font-family:${SANS};font-size:14px;color:${TEXT};margin:0;padding:8px 0 0;">Written by ${nl.writers}</p>
  <p style="font-family:${SANS};font-size:14px;color:${TEXT};margin:0;padding:4px 0;">Got a tip, a correction, or a strong opinion? Reply directly — we read every one.</p>
</div>`;

html += `<div style="padding:15px 15px;text-align:center;">
  <p style="font-family:${SANS};font-size:12px;line-height:16px;color:${TEXT};margin:0;padding:4px 0;">That's all for today's Thorium Valley. See you tomorrow.</p>
</div>`;

// Close outer wrapper
html += `</div>`;

// Write output
const outDir = path.join(__dirname, '..', 'APRIL 29 CONTENT');
const outPath = path.join(outDir, 'beehiiv-export.html');
fs.writeFileSync(outPath, html, 'utf-8');
const sizeKB = (Buffer.byteLength(html, 'utf-8') / 1024).toFixed(1);
console.log(`✅ Export written to: ${outPath}`);
console.log(`📦 Size: ${sizeKB} KB`);
