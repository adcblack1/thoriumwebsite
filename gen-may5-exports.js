const fs = require('fs');
const nl = require('./src/data/newsletters-db.json');
const lab = require('./src/data/lab-db.json');
const art = require('./src/data/articles-db.json');

const SANS = "-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text',system-ui,sans-serif";
const SERIF = "'Times New Roman MT Std','Times New Roman',Georgia,serif";
const BASE = 'https://www.thoriumvalley.com';

function processContent(html) {
  if (!html) return '';
  const P_STYLE = `font-family:${SANS};font-size:16px;line-height:1.5;color:#2D2D2D;padding:10px 0;margin:0;`;
  const LI_STYLE = `font-family:${SANS};font-size:16px;line-height:1.5;color:#2D2D2D;padding:10px 0 10px 24px;margin:0;`;
  html = html.replace(/<h2[^>]*>.*?Into the Valley.*?<\/h2>/gi, `<div style="padding:16px 0 4px;"><img src="${BASE}/IN%20THE%20VALLEY%20NEWS.png" alt="Into the Valley" style="display:block;width:100%;height:auto;padding:0;" /></div>`);
  html = html.replace(/<h2[^>]*>.*?The Verdict.*?<\/h2>/gi, `<div style="text-align:center;padding:20px 0 8px;"><img src="${BASE}/thumbnails/the-verdict.png" alt="The Verdict" style="display:block;width:100%;height:auto;" /></div>`);
  html = html.replace(/<ul>/gi, '');
  html = html.replace(/<\/ul>/gi, '');
  html = html.replace(/<li>([\s\S]*?)<\/li>/gi, `<p style="${LI_STYLE}"><span style="color:#5170ff;font-weight:700;">+</span>&nbsp;$1</p>`);
  html = html.replace(/<p>/gi, `<p style="${P_STYLE}">`);
  html = html.replace(/<strong>/gi, '<strong style="font-weight:700;">');
  html = html.replace(/<em>/gi, '<em style="font-style:italic;">');
  html = html.replace(/<a\s+href="/gi, `<a style="color:#5170ff;text-decoration:none;" href="`);
  html = html.replace(/\s+class="[^"]*"/gi, '');
  return html;
}

function dropCap(html) {
  return html.replace(/>([A-Z])/, (m, letter) => {
    return `><span style="font-family:'Times New Roman',Georgia,serif;font-size:3.5em;float:left;line-height:0.8;padding-right:8px;padding-top:4px;color:#5170ff;font-weight:bold;">${letter}</span>`;
  });
}

function articleCard(slug, campaign) {
  const a = art.find(x => x.slug === slug);
  if (!a) return '';
  const utm = `utm_source=beehiiv&utm_medium=newsletter&utm_campaign=${campaign}`;
  const url = `${BASE}/articles/${slug}?${utm}`;
  const encTitle = encodeURIComponent(a.title);
  const encUrl = encodeURIComponent(url);
  let body = processContent(a.newsletter_content);
  body = dropCap(body);
  return `<div style="border:1px solid #CDCDCD;border-radius:10px;margin:20px 0;padding:0;overflow:hidden;">
 <div style="padding:0;text-align:center;">
 <a href="${url}" style="display:block;text-decoration:none;">
 <img src="${BASE}${a.thumbnail_url}" alt="${a.title}" width="100%" style="display:block;width:100%;height:auto;" />
 </a>
 </div>
 <div style="padding:10px 15px 0;text-align:left;">
 <p style="font-family:${SANS};color:#5170ff;font-size:16px;line-height:1.5;padding:0;margin:0;">${a.category.toUpperCase()}</p>
 </div>
 <div style="padding:4px 15px 0;text-align:left;">
 <div style="font-family:${SERIF};font-size:30px;line-height:1.2;color:#2A2A2A;margin:0;padding:0;letter-spacing:-0.05em;">${a.title}</div>
 </div>
 <div style="padding:8px 15px 0;text-align:left;">
 <table cellpadding="0" cellspacing="0" border="0"><tr>
 <td style="font-family:${SANS};font-size:11px;color:rgba(27,27,27,0.4);text-transform:uppercase;letter-spacing:0.08em;padding-right:12px;">Share</td>
 <td style="padding-right:12px;"><a href="https://twitter.com/intent/tweet?text=${encTitle}&url=${encUrl}" target="_blank" style="color:rgba(27,27,27,0.4);text-decoration:none;font-family:${SANS};font-size:16px;font-weight:700;">𝕏</a></td>
 <td><a href="https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}" target="_blank" style="color:rgba(27,27,27,0.4);text-decoration:none;font-family:${SANS};font-size:14px;font-weight:700;">in</a></td>
 </tr></table>
 </div>
 <div style="padding:0 15px;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);margin:12px 0 8px;"></div></div>
 <div style="padding:0 15px;text-align:left;">
 ${body}
 </div>
 <div style="padding:8px 15px 12px;text-align:left;">
 <a href="${url}" style="font-family:${SANS};font-size:14px;font-weight:600;color:#5170ff;text-decoration:none;">Read the full story →</a>
 </div>
</div>`;
}

function labStoryCard(story, index) {
  let body = processContent(story.content);
  body = dropCap(body);
  return `<div style="border:1px solid #CDCDCD;border-radius:10px;margin:20px 0;padding:0;overflow:hidden;">
 <div style="padding:0;text-align:center;">
 <img src="${BASE}${story.thumbnail_url}" alt="${story.title}" width="100%" style="display:block;width:100%;height:auto;" />
 </div>
 <div style="padding:10px 15px 0;text-align:left;">
 <p style="font-family:${SANS};color:#5170ff;font-size:16px;line-height:1.5;padding:0;margin:0;">${story.category}</p>
 </div>
 <div style="padding:4px 15px 0;text-align:left;">
 <div style="font-family:${SERIF};font-size:30px;line-height:1.2;color:#2A2A2A;margin:0;padding:0;letter-spacing:-0.05em;">${story.title}</div>
 </div>
 <div style="padding:0 15px;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);margin:12px 0 8px;"></div></div>
 <div style="padding:0 15px 15px;text-align:left;">
 ${body}
 </div>
</div>`;
}

function buildNewsletter(data, campaign, bannerUrl, isMain) {
  const introClean = data.intro.replace('Good Morning Thorium Valley. ', '').replace('Good Morning Thorium Valley, ', '');
  let html = `<div style="max-width:780px;margin:0 auto;padding:0;background-color:#FFFFFF;font-family:${SANS};color:#2D2D2D;font-size:16px;line-height:1.5;">
<div style="padding:0 25px 24px;text-align:center;">
 <img src="${BASE}${bannerUrl}" alt="Banner" width="780" style="display:block;width:100%;height:auto;" />
</div>
<div style="padding:0 15px;text-align:left;">
 <p style="font-family:${SANS};color:#2D2D2D;font-size:16px;line-height:1.6;padding:12px 0;margin:0;"><strong style="font-weight:700;">${isMain ? 'Good Morning Thorium Valley.' : 'Good Morning Thorium Valley, welcome back to The Lab.'}</strong> ${introClean.replace(/Good Morning Thorium Valley, welcome back to The Lab\.\s*/,'').split('\n').join(`</p>\n <p style="font-family:${SANS};color:#2D2D2D;font-size:16px;line-height:1.6;padding:12px 0;margin:0;">`)}</p>
</div>`;

  // TOC
  html += `<div style="padding:24px 15px 0;">
 <img src="${BASE}/thumbnails/toc-header.png" alt="In Today's Edition" style="display:block;width:50%;height:auto;padding:10px 0 6px;">
</div>`;

  data.toc.forEach((t, i) => {
    if (isMain) {
      const slug = data.article_slugs[i];
      html += `<div style="padding:4px 15px;text-align:left;">
 <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
 <td style="font-family:${SERIF};font-size:26px;line-height:1.3;color:#2A2A2A;padding:2px 0;letter-spacing:-0.05em;">
 <img src="${BASE}/thumbnails/toc-bullet.png" alt="" width="14" height="14" style="width:14px;height:14px;vertical-align:middle;margin-right:8px;">${t}
 </td><td style="text-align:right;vertical-align:middle;white-space:nowrap;padding-left:12px;"><a href="${BASE}/articles/${slug}" style="font-family:${SANS};font-size:10px;font-weight:800;color:#5170ff;text-decoration:none;letter-spacing:0.08em;">FULL STORY</a></td>
 </tr></table>
</div>`;
    } else {
      const bulletImg = `${BASE}/thumbnails/lab-star.png`;
      html += `<div style="padding:4px 15px;text-align:left;">
 <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
 <td style="font-family:${SERIF};font-size:26px;line-height:1.3;color:#2A2A2A;padding:2px 0;letter-spacing:-0.05em;">
 <img src="${bulletImg}" alt="" width="14" height="14" style="width:14px;height:14px;vertical-align:middle;margin-right:8px;">${t}
 </td>
 </tr></table>
</div>`;
    }
  });

  // Secondary TOC
  const secBullet = isMain ? `${BASE}/thumbnails/toc-bullet.png` : `${BASE}/thumbnails/lab-star.png`;
  html += `<div style="padding:14px 15px 0;"><span style="font-family:${SANS};font-size:14px;color:rgba(27,27,27,0.5);margin-right:20px;"><img src="${secBullet}" alt="" width="10" height="10" style="width:10px;height:10px;opacity:0.4;vertical-align:middle;margin-right:6px;">${isMain ? 'What else happened today?' : 'Everything else in AI'}</span><span style="font-family:${SANS};font-size:14px;color:rgba(27,27,27,0.5);"><img src="${secBullet}" alt="" width="10" height="10" style="width:10px;height:10px;opacity:0.4;vertical-align:middle;margin-right:6px;">${isMain ? 'What AI tools should I be using?' : 'Other tools'}</span></div>`;

  // Poll
  if (data.poll) {
    const pid = data.poll.poll_id;
    html += `<div style="padding:20px 15px 0;text-align:left;">
 <p style="font-family:${SANS};font-weight:600;font-size:16px;color:#2D2D2D;margin:0;">Quickly before we dive in — <em style="font-style:italic;">${data.poll.question}</em></p>
 <div style="padding:12px 0 0;">`;
    data.poll.options.forEach(opt => {
      html += `<a href="https://thoriumvalley.com/api/poll/vote?poll=${pid}&answer=${encodeURIComponent(opt)}&sid={{subscriber_id}}" style="font-family:${SANS};font-size:13px;font-weight:700;color:#5170ff;text-decoration:none;text-transform:uppercase;letter-spacing:0.05em;margin-right:16px;">${opt.toUpperCase()}</a> `;
    });
    html += `</div>
</div>`;
  }

  // Articles or Lab stories
  if (isMain) {
    data.article_slugs.forEach(s => { html += articleCard(s, campaign); });
  } else {
    data.stories.forEach((s, i) => { html += labStoryCard(s, i); });
  }

  // News section
  html += `<div style="border:1px solid #CDCDCD;border-radius:10px;margin:20px 0;padding:0 0 15px;overflow:hidden;">
 <div style="padding:0;text-align:center;">
 <img src="${BASE}/thumbnails/news-header.png" alt="In Other News" width="100%" style="display:block;width:100%;height:auto;" />
 </div>
 <div style="padding:10px 15px 0;text-align:left;">
 <p style="font-family:${SANS};color:#5170ff;font-size:16px;margin:0;">${isMain ? 'IN OTHER NEWS' : 'EVERYTHING ELSE IN AI'}</p>
 </div>
 <div style="padding:4px 15px 0;text-align:left;">
 <div style="font-family:${SERIF};font-size:30px;line-height:1.2;color:#2A2A2A;margin:0;padding:0;letter-spacing:-0.05em;">What else happened today?</div>
 </div>
 <div style="padding:0 15px;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);margin:12px 0 8px;"></div></div>
 <div style="padding:0 15px;text-align:left;">`;

  data.links.news.forEach(n => {
    html += `<p style="font-family:${SANS};font-size:16px;line-height:1.5;color:#2D2D2D;padding:4px 0 4px 24px;margin:0;"><span style="color:#5170ff;font-weight:700;">+</span>&nbsp;${n.prefix||''}<a style="color:#5170ff;text-decoration:none;" href="${n.url}" target="_blank">${n.link_text}</a>${n.rest}</p>`;
  });

  // Jobs
  if (data.links.jobs && data.links.jobs.length > 0) {
    html += `</div>
 <div style="border-bottom:1px solid rgba(27,27,27,0.06);margin:0 15px;"></div>
 <div style="padding:14px 15px 4px;text-align:left;">
 <p style="font-family:${SANS};color:#2A2A2A;font-size:13px;font-weight:700;letter-spacing:0.06em;margin:0;">WHO'S HIRING IN AI</p>
 </div>
 <div style="padding:0 15px 5px;text-align:left;">`;
    data.links.jobs.forEach(j => {
      html += `<p style="font-family:${SANS};font-size:16px;line-height:1.5;color:#2D2D2D;padding:4px 0 4px 24px;margin:0;"><span style="color:#5170ff;font-weight:700;">+</span>&nbsp;<a style="color:#5170ff;text-decoration:none;" href="${j.url}" target="_blank">${j.company}</a> — ${j.role}</p>`;
    });
  }

  html += `</div>
</div>`;

  // Games (main only)
  if (isMain && data.games) {
    const gp = data.games;
    html += `<div style="border:1px solid #CDCDCD;border-radius:10px;margin:20px 0;padding:0 0 15px;overflow:hidden;">
 <div style="padding:0;text-align:center;">
 <img src="${BASE}/thumbnails/games-header.png" alt="AI or Real?" width="100%" style="display:block;width:100%;height:auto;" />
 </div>
 <div style="padding:10px 15px 0;text-align:left;">
 <p style="font-family:${SANS};color:#5170ff;font-size:16px;margin:0;">AI OR REAL?</p>
 </div>
 <div style="padding:4px 15px 0;text-align:left;">
 <div style="font-family:${SERIF};font-size:30px;line-height:1.2;color:#2A2A2A;margin:0;padding:0;letter-spacing:-0.05em;">One is AI. One is real. Can you tell?</div>
 </div>
 <div style="padding:0 15px;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);margin:12px 0 8px;"></div></div>
 <div style="padding:8px 0;">
 <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
 <td width="50%" style="padding:0 6px 0 15px;text-align:center;vertical-align:top;">
 <img src="${BASE}${gp.image_a}" alt="Option A" width="100%" style="display:block;width:100%;height:auto;border-radius:6px;" />
 <p style="font-family:${SERIF};font-size:20px;color:#2A2A2A;text-align:center;padding:8px 0;margin:0;">Option A</p>
 </td>
 <td width="50%" style="padding:0 15px 0 6px;text-align:center;vertical-align:top;">
 <img src="${BASE}${gp.image_b}" alt="Option B" width="100%" style="display:block;width:100%;height:auto;border-radius:6px;" />
 <p style="font-family:${SERIF};font-size:20px;color:#2A2A2A;text-align:center;padding:8px 0;margin:0;">Option B</p>
 </td>
 </tr></table>
 </div>
 <div style="padding:0 15px 16px;text-align:center;">
 <p style="font-family:${SANS};font-size:16px;color:#2D2D2D;text-align:center;margin:0;">Which image is real?</p>
 <p style="text-align:center;margin:4px 0 0;">
 <a href="https://thoriumvalley.com/api/poll/vote?poll=${gp.game_poll_id}&answer=Option%20A&sid={{subscriber_id}}" style="color:#5170ff;text-decoration:none;font-family:${SANS};font-weight:600;">Option A</a>
 <span style="color:#999;padding:0 8px;">|</span>
 <a href="https://thoriumvalley.com/api/poll/vote?poll=${gp.game_poll_id}&answer=Option%20B&sid={{subscriber_id}}" style="color:#5170ff;text-decoration:none;font-family:${SANS};font-weight:600;">Option B</a>
 </p>
 </div>`;
    if (data.yesterdays_results) {
      const yr = data.yesterdays_results;
      html += ` <div style="padding:8px 0;text-align:center;">
 <img src="${BASE}/thumbnails/yesterdays-results.png" alt="Yesterday's Results" style="display:block;width:100%;height:auto;padding:0;" />
 </div>
 <div style="padding:8px 0 20px;">
 <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
 <td width="50%" style="padding:0 6px 0 15px;text-align:center;vertical-align:top;">
 <img src="${BASE}${yr.ai_image}" alt="AI Image" width="100%" style="display:block;width:100%;height:auto;border-radius:6px;" />
 <a href="${yr.ai_source}" style="font-family:${SANS};font-size:13px;font-weight:600;color:#5170ff;text-decoration:none;display:block;padding:6px 0;text-align:center;">AI IMAGE</a>
 </td>
 <td width="50%" style="padding:0 15px 0 6px;text-align:center;vertical-align:top;">
 <img src="${BASE}${yr.real_image}" alt="Real Image" width="100%" style="display:block;width:100%;height:auto;border-radius:6px;" />
 <a href="${yr.real_source}" style="font-family:${SANS};font-size:13px;font-weight:600;color:#5170ff;text-decoration:none;display:block;padding:6px 0;text-align:center;">REAL IMAGE</a>
 </td>
 </tr></table>
 </div>`;
    }
    html += `</div>`;
  }

  // Tools
  html += `<div style="border:1px solid #CDCDCD;border-radius:10px;margin:20px 0;padding:0 0 15px;overflow:hidden;">
 <div style="padding:0;text-align:center;">
 <img src="${BASE}/thumbnails/tools-header.png" alt="AI Tools" width="100%" style="display:block;width:100%;height:auto;" />
 </div>
 <div style="padding:10px 15px 0;text-align:left;">
 <p style="font-family:${SANS};color:#5170ff;font-size:16px;margin:0;">${isMain ? 'AI TOOLS' : 'OTHER TOOLS'}</p>
 </div>
 <div style="padding:4px 15px 0;text-align:left;">
 <div style="font-family:${SERIF};font-size:30px;line-height:1.2;color:#2A2A2A;margin:0;padding:0;letter-spacing:-0.05em;">What our editors are paying attention to today</div>
 </div>
 <div style="padding:0 15px;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);margin:12px 0 8px;"></div></div>
 <div style="padding:0 15px;text-align:left;">`;

  data.links.tools.forEach(t => {
    const sponsored = t.sponsored ? ' <em style="font-style:italic;color:#999;">(Sponsored)</em>' : '';
    html += `<p style="font-family:${SANS};font-size:16px;line-height:1.5;color:#2D2D2D;padding:4px 0 4px 24px;margin:0;"><span style="color:#5170ff;font-weight:700;">+</span>&nbsp;<a style="color:#5170ff;text-decoration:none;" href="${t.url}" target="_blank">${t.name}</a>${sponsored}: ${t.desc}</p>`;
  });

  html += `</div>
</div>`;

  // Sign-off + Footer
  const footerText = isMain ? "That's all for today's Thorium Valley. See you tomorrow." : "That's all for today's Lab. See you next time.";
  html += `<div style="padding:20px 15px 10px;border-top:1px solid #CDCDCD;">
 <p style="font-family:${SANS};font-size:16px;line-height:1.5;color:#2D2D2D;margin:0;">${data.sign_off}</p>
 <p style="font-family:${SANS};font-size:14px;color:#666;font-style:italic;margin:10px 0 0;">Written by ${data.writers}</p>
</div>
<div style="padding:15px 15px;text-align:center;">
 <p style="font-family:${SANS};font-size:12px;line-height:16px;color:#2D2D2D;margin:0;padding:4px 0;">${footerText}</p>
</div>
</div>`;

  return html;
}

// === MAIN NEWSLETTER ===
const may5 = nl.find(n => n.slug === 'may-05-2026');
const mainHtml = buildNewsletter(may5, 'may-05-2026', may5.banner_image_url, true);
fs.writeFileSync('/Users/alexchun/Downloads/Thorium Valley Website/MAY 5 CONTENT/beehiiv-export.html', mainHtml);
console.log('✅ Main export:', Buffer.byteLength(mainHtml), 'bytes');

// === LAB NEWSLETTER ===
const may5lab = lab.find(l => l.slug === 'lab-may-05-2026');
const labHtml = buildNewsletter(may5lab, 'lab-may-05-2026', may5lab.banner_image_url, false);
fs.writeFileSync('/Users/alexchun/Downloads/Thorium Valley Website/MAY 4 LAB/beehiiv-export.html', labHtml);
console.log('✅ Lab export:', Buffer.byteLength(labHtml), 'bytes');
