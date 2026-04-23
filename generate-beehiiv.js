#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const newsletters = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/data/newsletters-db.json'), 'utf8'));
const articles = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/data/articles-db.json'), 'utf8'));
const catalysts = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/data/catalyst-db.json'), 'utf8'));

const BASE = 'https://www.thoriumvalley.com';
const BLUE = '#5170ff';
const SYS_FONT = "-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text',system-ui,sans-serif";
const SERIF = "'Times New Roman MT Std','Times New Roman',Georgia,serif";
const DROP_CAP = `font-family:'Times New Roman',Georgia,serif;font-size:3.5em;float:left;line-height:0.8;padding-right:8px;padding-top:4px;color:${BLUE};font-weight:bold;`;
const P_STYLE = `font-family:${SYS_FONT};font-size:16px;line-height:1.5;color:#2D2D2D;padding:10px 0;margin:0;`;
const BULLET_IMG = (size=14) => `<img src="${BASE}/thumbnails/toc-bullet.png" alt="" width="${size}" height="${size}" style="width:${size}px;height:${size}px;vertical-align:middle;margin-right:${size>10?8:6}px;${size<=10?'opacity:0.4;':''}">`;

function htmlEsc(s) { return s.replace(/&/g,'&amp;').replace(/'/g,'&#x27;').replace(/"/g,'&quot;'); }
function encURI(s) { return encodeURIComponent(s).replace(/%20/g,'%20'); }

function newsItem(prefix, linkText, rest, url) {
  let out = `<p style="font-family:${SYS_FONT};font-size:16px;line-height:1.5;color:#2D2D2D;padding:4px 0 4px 24px;margin:0;"><span style="color:${BLUE};font-weight:700;">+</span>&nbsp;`;
  if (prefix) out += htmlEsc(prefix);
  out += `<a style="color:${BLUE};text-decoration:none;" href="${url}" target="_blank">${linkText}</a>`;
  if (rest) out += htmlEsc(rest);
  out += '</p>';
  return out;
}

function toolItem(t) {
  return `<p style="font-family:${SYS_FONT};font-size:16px;line-height:1.5;color:#2D2D2D;padding:4px 0 4px 24px;margin:0;"><span style="color:${BLUE};font-weight:700;">+</span>&nbsp;<a style="color:${BLUE};text-decoration:none;" href="${t.url}" target="_blank">${t.name}</a>: ${htmlEsc(t.desc)}</p>`;
}

function jobItem(j) {
  return `<p style="font-family:${SYS_FONT};font-size:16px;line-height:1.5;color:#2D2D2D;padding:4px 0 4px 24px;margin:0;"><span style="color:${BLUE};font-weight:700;">+</span>&nbsp;<a style="color:${BLUE};text-decoration:none;" href="${j.url}" target="_blank">${j.company}</a> &mdash; ${htmlEsc(j.role)}</p>`;
}

function shareRow(title, slug, campaign) {
  const articleUrl = `${BASE}/articles/${slug}?utm_source=beehiiv&utm_medium=newsletter&utm_campaign=${campaign}`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encURI(title)}&url=${encodeURIComponent(articleUrl)}`;
  const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`;
  return `<div style="padding:8px 15px 0;text-align:left;">
 <table cellpadding="0" cellspacing="0" border="0"><tr>
 <td style="font-family:${SYS_FONT};font-size:11px;color:rgba(27,27,27,0.4);text-transform:uppercase;letter-spacing:0.08em;padding-right:12px;">Share</td>
 <td style="padding-right:12px;"><a href="${tweetUrl}" target="_blank" style="color:rgba(27,27,27,0.4);text-decoration:none;font-family:${SYS_FONT};font-size:16px;font-weight:700;">X</a></td>
 <td><a href="${liUrl}" target="_blank" style="color:rgba(27,27,27,0.4);text-decoration:none;font-family:${SYS_FONT};font-size:14px;font-weight:700;">in</a></td>
 </tr></table>
</div>`;
}

const ITV_IMG = `<div style="padding:16px 0 4px;"><img src="${BASE}/IN%20THE%20VALLEY%20NEWS.png" alt="Into the Valley" style="display:block;width:100%;height:auto;padding:0;" /></div>`;

function processBody(html) {
  let body = html;
  // Replace Valley View / Into the Valley headers with image
  body = body.replace(/<p[^>]*>\s*<strong[^>]*>\s*(?:Into the Valley|Our Valley View)\s*<\/strong>\s*<\/p>/gi, ITV_IMG);
  // Convert <ul>/<li> to <p> with + markers
  body = body.replace(/<ul>/g, '').replace(/<\/ul>/g, '');
  body = body.replace(/<li>/g, `<p style="font-family:${SYS_FONT};font-size:16px;line-height:1.5;color:#2D2D2D;padding:4px 0 4px 24px;margin:0;"><span style="color:${BLUE};font-weight:700;">+</span>&nbsp;`);
  body = body.replace(/<\/li>/g, '</p>');
  // Style links
  body = body.replace(/<a /g, `<a style="color:${BLUE};text-decoration:none;" `);
  // Style <strong>
  body = body.replace(/<strong>/g, '<strong style="font-weight:700;color:#2D2D2D;">');
  // Style <p> tags without existing styles
  body = body.replace(/<p>(?!style)/g, `<p style="${P_STYLE}">`);
  return body;
}

function articleCard(art, campaign) {
  let body = processBody(art.newsletter_content);
  
  const articleUrl = `${BASE}/articles/${art.slug}?utm_source=beehiiv&utm_medium=newsletter&utm_campaign=${campaign}`;
  const firstLetter = body.match(/>([A-Z])/)?.[1] || 'T';
  // Add drop cap to first paragraph
  body = body.replace(/<p style="[^"]*">/, (m) => m + `<span style="${DROP_CAP}">${firstLetter}</span>`);
  body = body.replace(new RegExp(`>${firstLetter}`), '>');

  return `<div style="border:1px solid #CDCDCD;border-radius:10px;margin:20px 0;padding:0;overflow:hidden;">
 <div style="padding:0;text-align:center;">
 <a href="${articleUrl}" style="display:block;text-decoration:none;">
 <img src="${BASE}${art.thumbnail_url}" alt="${htmlEsc(art.title)}" width="100%" style="display:block;width:100%;height:auto;" />
 </a>
 </div>
 <div style="padding:10px 15px 0;text-align:left;">
 <p style="font-family:${SYS_FONT};color:${BLUE};font-size:16px;line-height:1.5;padding:0;margin:0;">${(art.category||'MARKETS').toUpperCase()}</p>
 </div>
 <div style="padding:4px 15px 0;text-align:left;">
 <div style="font-family:${SERIF};font-size:30px;line-height:1.2;color:#2A2A2A;margin:0;padding:0;letter-spacing:-0.05em;">${htmlEsc(art.title)}</div>
 </div>
${shareRow(art.title, art.slug, campaign)}
 <div style="padding:0 15px;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);margin:12px 0 8px;"></div></div>
 <div style="padding:0 15px;text-align:left;">
${body}
 </div>
 <div style="padding:8px 15px 12px;text-align:left;">
 <a href="${articleUrl}" style="font-family:${SYS_FONT};font-size:14px;font-weight:600;color:${BLUE};text-decoration:none;">Read the full story &rarr;</a>
 </div>
</div>`;
}

function pollSection(poll, pollId) {
  const q = htmlEsc(poll.question);
  let out = `<div style="padding:20px 15px 10px;text-align:left;">
 <p style="font-family:${SYS_FONT};font-size:16px;line-height:1.5;color:#2D2D2D;margin:0;">Quickly before we dive in &mdash; <em style="font-style:italic;">${q}</em></p>
 <div style="padding:10px 0 0;">`;
  poll.options.forEach((opt, i) => {
    const voteUrl = `${BASE}/api/poll/vote?poll=${pollId}&answer=${encURI(opt)}&sid={{subscriber_id}}`;
    if (i > 0) out += `<span style="color:rgba(27,27,27,0.2);margin:0 10px;">|</span>\n  `;
    out += `<a href="${voteUrl}" style="font-family:${SYS_FONT};font-size:14px;font-weight:600;color:${BLUE};text-decoration:none;">${opt}</a>  `;
  });
  out += '</div>\n</div>';
  return out;
}

// ============ FLAGSHIP ============
function generateFlagship(nl) {
  const campaign = nl.slug;
  const arts = nl.article_slugs.map(s => articles.find(a => a.slug === s)).filter(Boolean);
  const pollId = 'a2f89c41-3d74-4e8b-b5c1-9e76d4f31a28';

  let html = `<div style="max-width:780px;margin:0 auto;padding:0;background-color:#FFFFFF;font-family:${SYS_FONT};color:#2D2D2D;font-size:16px;line-height:1.5;">
<div style="padding:0 25px 24px;text-align:center;">
 <img src="${BASE}/thumbnails/banner-2026-04-22.png" alt="April 22, 2026 banner" width="780" style="display:block;width:100%;height:auto;" />
</div>
<div style="padding:24px 15px 0;">
 <img src="${BASE}/thumbnails/toc-header.png" alt="In Today's Newsletter" style="display:block;width:50%;height:auto;padding:10px 0 6px;">
</div>`;

  // TOC
  nl.toc.forEach((t, i) => {
    const slug = nl.article_slugs[i];
    const articleUrl = `${BASE}/articles/${slug}?utm_source=beehiiv&utm_medium=newsletter&utm_campaign=${campaign}`;
    html += `<div style="padding:4px 15px;text-align:left;">
 <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
 <td style="font-family:${SERIF};font-size:26px;line-height:1.3;color:#2A2A2A;padding:2px 0;letter-spacing:-0.05em;">
 ${BULLET_IMG()}${htmlEsc(t)}
 </td><td style="text-align:right;vertical-align:middle;white-space:nowrap;padding-left:12px;">
  <a href="${articleUrl}" style="font-family:${SYS_FONT};font-size:10px;font-weight:800;color:${BLUE};text-decoration:none;letter-spacing:0.08em;">FULL STORY</a>
 </td>
 </tr></table>
</div>`;
  });

  // Sub-TOC
  html += `<div style="padding:14px 15px 0;"><span style="font-family:${SYS_FONT};font-size:14px;color:rgba(27,27,27,0.5);margin-right:20px;">${BULLET_IMG(10)}What else happened today?</span><span style="font-family:${SYS_FONT};font-size:14px;color:rgba(27,27,27,0.5);">${BULLET_IMG(10)}What AI tools should I be using?</span></div>`;

  // Intro
  const introParas = nl.intro.split('\n\n');
  html += `<div style="padding:20px 15px 0;text-align:left;">`;
  introParas.forEach((p, i) => {
    if (i === 0) {
      const first = p.charAt(0);
      html += ` <p style="font-family:${SYS_FONT};color:#2D2D2D;font-size:16px;line-height:1.6;padding:12px 0 0;margin:0;"><span style="${DROP_CAP}">${first}</span>${htmlEsc(p.slice(1))}</p>`;
    } else {
      html += ` <p style="font-family:${SYS_FONT};color:#2D2D2D;font-size:16px;line-height:1.6;padding:12px 0 0;margin:0;">${htmlEsc(p)}</p>`;
    }
  });
  html += '</div>';

  // Poll
  html += pollSection(nl.poll, pollId);

  // Article cards
  arts.forEach(art => { html += articleCard(art, campaign); });

  // Games card (AI or Real?)
  if (nl.games) {
    const gp = nl.games;
    html += `<div style="border:1px solid #CDCDCD;border-radius:10px;margin:20px 0;padding:0 0 15px;overflow:hidden;">
 <div style="padding:0;text-align:center;">
 <img src="${BASE}/thumbnails/games-header.png" alt="AI or Real" width="100%" style="display:block;width:100%;height:auto;" />
 </div>
 <div style="padding:10px 15px 0;text-align:left;"><p style="font-family:${SYS_FONT};color:${BLUE};font-size:16px;margin:0;">GAMES</p></div>
 <div style="padding:4px 15px 0;text-align:left;"><div style="font-family:${SERIF};font-size:30px;line-height:1.2;color:#2A2A2A;margin:0;padding:0;letter-spacing:-0.05em;">AI or real &mdash; can you tell the difference?</div></div>
 <div style="padding:0 15px;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);margin:12px 0 8px;"></div></div>
 <div style="padding:0 15px;text-align:center;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
  <td width="48%" style="text-align:center;vertical-align:top;padding:8px;">
   <a href="${BASE}/api/poll/vote?poll=${gp.game_poll_id}&answer=Option%20A&sid={{subscriber_id}}" style="text-decoration:none;">
   <img src="${BASE}${gp.image_a}" alt="Option A" width="100%" style="display:block;width:100%;height:auto;border-radius:6px;" />
   </a>
   <p style="font-family:${SERIF};font-size:18px;color:#2A2A2A;margin:8px 0 0;letter-spacing:-0.03em;">Option A</p>
  </td>
  <td width="4%"></td>
  <td width="48%" style="text-align:center;vertical-align:top;padding:8px;">
   <a href="${BASE}/api/poll/vote?poll=${gp.game_poll_id}&answer=Option%20B&sid={{subscriber_id}}" style="text-decoration:none;">
   <img src="${BASE}${gp.image_b}" alt="Option B" width="100%" style="display:block;width:100%;height:auto;border-radius:6px;" />
   </a>
   <p style="font-family:${SERIF};font-size:18px;color:#2A2A2A;margin:8px 0 0;letter-spacing:-0.03em;">Option B</p>
  </td>
  </tr></table>
 </div>
 <div style="padding:12px 15px 0;text-align:left;">
  <p style="font-family:${SYS_FONT};font-size:16px;color:#2D2D2D;margin:0;">Which image is real?</p>
  <div style="padding:8px 0 0;">
   <a href="${BASE}/api/poll/vote?poll=${gp.game_poll_id}&answer=Option%20A&sid={{subscriber_id}}" style="font-family:${SYS_FONT};font-size:14px;font-weight:600;color:${BLUE};text-decoration:none;">Option A</a>
   <span style="color:rgba(27,27,27,0.2);margin:0 10px;">|</span>
   <a href="${BASE}/api/poll/vote?poll=${gp.game_poll_id}&answer=Option%20B&sid={{subscriber_id}}" style="font-family:${SYS_FONT};font-size:14px;font-weight:600;color:${BLUE};text-decoration:none;">Option B</a>
  </div>
 </div>`;
    // Yesterday's Results (from previous newsletter)
    if (nl.yesterdays_results) {
      const yr = nl.yesterdays_results;
      html += `\n <div style="padding:16px 0 4px;"><img src="${BASE}/thumbnails/yesterdays-results.png" alt="Yesterday's Results" style="display:block;width:100%;height:auto;padding:0;" /></div>
 <div style="padding:0 15px;text-align:center;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
  <td width="48%" style="text-align:center;vertical-align:top;padding:8px;">
   <a href="${yr.ai_source}" target="_blank" style="text-decoration:none;">
   <img src="${BASE}${yr.ai_image}" alt="AI Image" width="100%" style="display:block;width:100%;height:auto;border-radius:6px;" />
   </a>
   <p style="font-family:${SERIF};font-size:18px;color:#2A2A2A;margin:8px 0 0;letter-spacing:-0.03em;">AI IMAGE</p>
  </td>
  <td width="4%"></td>
  <td width="48%" style="text-align:center;vertical-align:top;padding:8px;">
   <a href="${yr.real_source}" target="_blank" style="text-decoration:none;">
   <img src="${BASE}${yr.real_image}" alt="Real Image" width="100%" style="display:block;width:100%;height:auto;border-radius:6px;" />
   </a>
   <p style="font-family:${SERIF};font-size:18px;color:#2A2A2A;margin:8px 0 0;letter-spacing:-0.03em;">REAL IMAGE</p>
  </td>
  </tr></table>
 </div>`;
    }
    html += '\n</div>';
  }

  // News section
  html += `<div style="border:1px solid #CDCDCD;border-radius:10px;margin:20px 0;padding:0 0 15px;overflow:hidden;">
 <div style="padding:0;text-align:center;">
 <img src="${BASE}/thumbnails/news-header.png" alt="In Other News" width="100%" style="display:block;width:100%;height:auto;" />
 </div>
 <div style="padding:10px 15px 0;text-align:left;"><p style="font-family:${SYS_FONT};color:${BLUE};font-size:16px;margin:0;">IN OTHER NEWS</p></div>
 <div style="padding:4px 15px 0;text-align:left;"><div style="font-family:${SERIF};font-size:30px;line-height:1.2;color:#2A2A2A;margin:0;padding:0;letter-spacing:-0.05em;">What else happened today?</div></div>
 <div style="padding:0 15px;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);margin:12px 0 8px;"></div></div>
 <div style="padding:0 15px;text-align:left;">`;
  nl.links.news.forEach(n => { html += newsItem(n.prefix||'', n.link_text, n.rest||'', n.url); });
  html += '</div>';

  // Jobs
  if (nl.links.jobs && nl.links.jobs.length > 0) {
    html += `<div style="border-bottom:1px solid rgba(27,27,27,0.06);margin:0 15px;"></div>
 <div style="padding:14px 15px 4px;text-align:left;">
 <p style="font-family:${SYS_FONT};color:#2A2A2A;font-size:13px;font-weight:700;letter-spacing:0.06em;margin:0;">WHO'S HIRING IN AI</p>
 </div>
 <div style="padding:0 15px 5px;text-align:left;">`;
    nl.links.jobs.forEach(j => { html += jobItem(j); });
    html += '</div>';
  }
  html += '</div>';

  // Tools section
  html += `<div style="border:1px solid #CDCDCD;border-radius:10px;margin:20px 0;padding:0 0 15px;overflow:hidden;">
 <div style="padding:0;text-align:center;">
 <img src="${BASE}/thumbnails/tools-header.png" alt="AI Tools" width="100%" style="display:block;width:100%;height:auto;" />
 </div>
 <div style="padding:10px 15px 0;text-align:left;"><p style="font-family:${SYS_FONT};color:${BLUE};font-size:16px;margin:0;">AI TOOLS</p></div>
 <div style="padding:4px 15px 0;text-align:left;"><div style="font-family:${SERIF};font-size:30px;line-height:1.2;color:#2A2A2A;margin:0;padding:0;letter-spacing:-0.05em;">What our editors are paying attention to today</div></div>
 <div style="padding:0 15px;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);margin:12px 0 8px;"></div></div>
 <div style="padding:0 15px;text-align:left;">`;
  nl.links.tools.forEach(t => { html += toolItem(t); });
  html += '</div>\n</div>';

  // Sign off
  html += `<div style="padding:20px 15px 10px;border-top:1px solid #CDCDCD;">
 <p style="font-family:${SYS_FONT};font-size:16px;line-height:1.5;color:#2D2D2D;margin:0;">${htmlEsc(nl.sign_off)}</p>
 <p style="font-family:${SYS_FONT};font-size:14px;color:#666;font-style:italic;margin:10px 0 0;">Written by ${htmlEsc(nl.writers)}</p>
</div>
<div style="padding:15px 15px;text-align:center;">
 <p style="font-family:${SYS_FONT};font-size:12px;line-height:16px;color:#2D2D2D;margin:0;padding:4px 0;">That's all for today's Thorium Valley. See you tomorrow.</p>
</div>
</div>`;
  return html;
}

// ============ CATALYST ============
function generateCatalyst(cat) {
  const campaign = cat.slug;
  const pollId = 'b4e3a71f-8c92-4d5a-a1f7-3c89d5e62b47';
  const STAR = '✦';
  const PURPLE = '#8c52ff';
  const starStyle = `color:${PURPLE};font-size:16px;vertical-align:middle;margin-right:8px;`;

  let html = `<div style="max-width:780px;margin:0 auto;padding:0;background-color:#FFFFFF;font-family:${SYS_FONT};color:#2D2D2D;font-size:16px;line-height:1.5;">
<div style="padding:0 25px 24px;text-align:center;">
 <img src="${BASE}${cat.banner_image_url}" alt="Catalyst ${cat.date}" width="780" style="display:block;width:100%;height:auto;" />
</div>
<div style="padding:24px 15px 0;">
 <img src="${BASE}/thumbnails/toc-header.png" alt="In Today's Newsletter" style="display:block;width:50%;height:auto;padding:10px 0 6px;">
</div>`;

  // TOC with colored stars
  cat.toc.forEach(t => {
    html += `<div style="padding:4px 15px;text-align:left;">
 <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
 <td style="font-family:${SERIF};font-size:26px;line-height:1.3;color:#2A2A2A;padding:2px 0;letter-spacing:-0.05em;">
 <span style="${starStyle}">${STAR}</span>${htmlEsc(t)}
 </td></tr></table>
</div>`;
  });

  // Sub-TOC with stars
  html += `<div style="padding:14px 15px 0;"><span style="font-family:${SYS_FONT};font-size:14px;color:rgba(27,27,27,0.5);margin-right:20px;"><span style="color:${PURPLE};opacity:0.4;margin-right:6px;">${STAR}</span>What else happened today?</span><span style="font-family:${SYS_FONT};font-size:14px;color:rgba(27,27,27,0.5);"><span style="color:${PURPLE};opacity:0.4;margin-right:6px;">${STAR}</span>What AI tools should I be using?</span></div>`;

  // Intro
  const introParas = cat.intro.split('\n\n');
  html += `<div style="padding:20px 15px 0;text-align:left;">`;
  introParas.forEach((p, i) => {
    if (i === 0) {
      const first = p.charAt(0);
      html += ` <p style="font-family:${SYS_FONT};color:#2D2D2D;font-size:16px;line-height:1.6;padding:12px 0 0;margin:0;"><span style="${DROP_CAP}">${first}</span>${htmlEsc(p.slice(1))}</p>`;
    } else {
      html += ` <p style="font-family:${SYS_FONT};color:#2D2D2D;font-size:16px;line-height:1.6;padding:12px 0 0;margin:0;">${htmlEsc(p)}</p>`;
    }
  });
  html += '</div>';

  // Poll
  html += pollSection(cat.poll, pollId);

  // Story cards
  cat.stories.forEach(story => {
    // Generate prompt slug from story title
    const promptSlug = story.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    // Clean content - remove the "Have Claude Explain" / "Ask Claude" section header and prompt block
    let body = story.content;
    // Remove <h3>Have Claude...</h3> and everything after it (the prompt block)  
    body = body.replace(/<h3>Have Claude Explain This to Me<\/h3>[\s\S]*$/, '');
    body = body.replace(/<h3>Ask Claude If It's Right for You<\/h3>[\s\S]*$/, '');
    body = body.replace(/<h3>Ask Claude If It&#39;s Right for You<\/h3>[\s\S]*$/, '');
    // Remove <h2>The Formula</h2> and replace with image
    body = body.replace(/<h2>The Formula<\/h2>/, `<div style="text-align:center;padding:20px 0 8px;"><img src="${BASE}/thumbnails/the-formula.png" alt="The Formula" style="display:block;width:100%;height:auto;" /></div>`);
    // Remove <h2>The Verdict</h2> and replace with image
    body = body.replace(/<h2>The Verdict<\/h2>/, `<div style="text-align:center;padding:20px 0 8px;"><img src="${BASE}/thumbnails/the-verdict.png" alt="The Verdict" style="display:block;width:100%;height:auto;" /></div>`);
    // Process body (style links, paragraphs, etc)
    body = processBody(body);

    html += `<div style="border:1px solid #CDCDCD;border-radius:10px;margin:20px 0;padding:0;overflow:hidden;">
 <div style="padding:0;text-align:center;">
 <img src="${BASE}${story.thumbnail_url}" alt="${htmlEsc(story.title)}" width="100%" style="display:block;width:100%;height:auto;" />
 </div>
 <div style="padding:10px 15px 0;text-align:left;">
 <p style="font-family:${SYS_FONT};color:${BLUE};font-size:16px;margin:0;">${story.category}</p>
 </div>
 <div style="padding:4px 15px 0;text-align:left;">
 <div style="font-family:${SERIF};font-size:30px;line-height:1.2;color:#2A2A2A;margin:0;padding:0;letter-spacing:-0.05em;">${htmlEsc(story.title)}</div>
 </div>
 <div style="padding:0 15px;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);margin:12px 0 8px;"></div></div>
 <div style="padding:0 15px 15px;text-align:left;">
${body}`;
    if (promptSlug) {
      html += `<p style="padding:16px 0 4px;margin:0;"><a href="${BASE}/prompts/${promptSlug}" style="color:${BLUE};text-decoration:none;font-family:${SYS_FONT};font-size:14px;font-weight:600;letter-spacing:0.02em;">Have Claude explain this to me →</a></p>`;
    }
    html += ` </div>
</div>`;
  });

  // News section
  html += `<div style="border:1px solid #CDCDCD;border-radius:10px;margin:20px 0;padding:0 0 15px;overflow:hidden;">
 <div style="padding:0;text-align:center;">
 <img src="${BASE}/thumbnails/news-header.png" alt="In Other News" width="100%" style="display:block;width:100%;height:auto;" />
 </div>
 <div style="padding:10px 15px 0;text-align:left;"><p style="font-family:${SYS_FONT};color:${BLUE};font-size:16px;margin:0;">IN OTHER NEWS</p></div>
 <div style="padding:4px 15px 0;text-align:left;"><div style="font-family:${SERIF};font-size:30px;line-height:1.2;color:#2A2A2A;margin:0;padding:0;letter-spacing:-0.05em;">What else happened today?</div></div>
 <div style="padding:0 15px;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);margin:12px 0 8px;"></div></div>
 <div style="padding:0 15px;text-align:left;">`;
  cat.links.news.forEach(n => { html += newsItem(n.prefix||'', n.link_text, n.rest||'', n.url); });
  html += '</div>\n</div>';

  // Tools section
  html += `<div style="border:1px solid #CDCDCD;border-radius:10px;margin:20px 0;padding:0 0 15px;overflow:hidden;">
 <div style="padding:0;text-align:center;">
 <img src="${BASE}/thumbnails/tools-header.png" alt="AI Tools" width="100%" style="display:block;width:100%;height:auto;" />
 </div>
 <div style="padding:10px 15px 0;text-align:left;"><p style="font-family:${SYS_FONT};color:${BLUE};font-size:16px;margin:0;">AI TOOLS</p></div>
 <div style="padding:4px 15px 0;text-align:left;"><div style="font-family:${SERIF};font-size:30px;line-height:1.2;color:#2A2A2A;margin:0;padding:0;letter-spacing:-0.05em;">What our editors are paying attention to today</div></div>
 <div style="padding:0 15px;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);margin:12px 0 8px;"></div></div>
 <div style="padding:0 15px;text-align:left;">`;
  cat.links.tools.forEach(t => { html += toolItem(t); });
  html += '</div>\n</div>';

  // Sign off
  html += `<div style="padding:20px 15px 10px;border-top:1px solid #CDCDCD;">
 <p style="font-family:${SYS_FONT};font-size:16px;line-height:1.5;color:#2D2D2D;margin:0;">${htmlEsc(cat.sign_off)}</p>
 <p style="font-family:${SYS_FONT};font-size:14px;color:#666;font-style:italic;margin:10px 0 0;">Written by ${htmlEsc(cat.writers)}</p>
</div>
<div style="padding:15px 15px;text-align:center;">
 <p style="font-family:${SYS_FONT};font-size:12px;line-height:16px;color:#2D2D2D;margin:0;padding:4px 0;">That's all for today's Catalyst. See you next time.</p>
</div>
</div>`;
  return html;
}

// Generate flagship (April 22)
const nl22 = newsletters.find(n => n.slug === 'april-22-2026');
const flagshipHTML = generateFlagship(nl22);
const flagshipOut = path.resolve(__dirname, '../APRIL 21 CONTENT/beehiiv-export.html');
fs.writeFileSync(flagshipOut, flagshipHTML + '\n');
console.log(`Flagship: ${flagshipOut} (${(flagshipHTML.length/1024).toFixed(1)}KB)`);

// Generate catalyst (April 21)
const cat21 = catalysts.find(c => c.slug === 'catalyst-april-22-2026');
const catalystHTML = generateCatalyst(cat21);
const catalystOut = path.resolve(__dirname, '../APRIL 21 CATALYST/beehiiv-export.html');
fs.writeFileSync(catalystOut, catalystHTML + '\n');
console.log(`Catalyst: ${catalystOut} (${(catalystHTML.length/1024).toFixed(1)}KB)`);
