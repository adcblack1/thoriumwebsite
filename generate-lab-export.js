#!/usr/bin/env node
/**
 * Lab Newsletter Beehiiv Export Generator
 * Reads lab-db.json and produces email-safe inline-styled HTML
 */
const fs = require('fs');
const path = require('path');

const slug = process.argv[2];
if (!slug) { console.error('Usage: node generate-lab-export.js <slug>'); process.exit(1); }

const labs = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/data/lab-db.json'), 'utf-8'));
const nl = labs.find(n => n.slug === slug);
if (!nl) { console.error(`Lab newsletter "${slug}" not found`); process.exit(1); }

const BASE = 'https://www.thoriumvalley.com';
const SERIF = "'Times New Roman MT Std','Times New Roman',Georgia,serif";
const SANS = "-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text',system-ui,sans-serif";
const ACCENT = '#5170ff';
const TEXT = '#2D2D2D';
const HEADING = '#2A2A2A';

function p(text) {
  return `<p style="font-family:${SANS};font-size:16px;line-height:1.5;color:${TEXT};padding:10px 0;margin:0;">${text}</p>`;
}

function encAnswer(ans) { return encodeURIComponent(ans); }

// ═══ BUILD HTML ═══

let html = '';

// Wrapper
html += `<div style="max-width:780px;margin:0 auto;padding:0;background-color:#FFFFFF;font-family:${SANS};color:${TEXT};font-size:16px;line-height:1.5;">\n`;

// Banner
html += `<div style="padding:0 25px 24px;text-align:center;">\n`;
html += ` <img src="${BASE}${nl.banner_image_url}" alt="Banner" width="780" style="display:block;width:100%;height:auto;" />\n`;
html += `</div>\n`;

// Intro
html += `<div style="padding:0 15px;text-align:left;">\n`;
const introLines = nl.intro.split('\n\n').filter(Boolean);
for (const line of introLines) {
  if (line.startsWith('Good Morning')) {
    const parts = line.split('.', 2);
    const greeting = parts[0] + '.';
    const rest = line.substring(greeting.length).trim();
    html += ` <p style="font-family:${SANS};color:${TEXT};font-size:16px;line-height:1.6;padding:12px 0;margin:0;"><strong style="font-weight:700;">${greeting}</strong> ${rest}</p>\n`;
  } else {
    html += ` <p style="font-family:${SANS};color:${TEXT};font-size:16px;line-height:1.6;padding:12px 0;margin:0;">${line}</p>\n`;
  }
}
html += `</div>`;

// TOC header
html += `<div style="padding:24px 15px 0;">\n`;
html += ` <img src="${BASE}/thumbnails/toc-header.png" alt="In Today's Edition" style="display:block;width:50%;height:auto;padding:10px 0 6px;">\n`;
html += `</div>`;

// TOC items (Lab uses lab-star.png bullet)
for (const item of nl.toc) {
  html += `<div style="padding:4px 15px;text-align:left;">\n`;
  html += ` <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>\n`;
  html += ` <td style="font-family:${SERIF};font-size:26px;line-height:1.3;color:${HEADING};padding:2px 0;letter-spacing:-0.05em;">\n`;
  html += ` <img src="${BASE}/thumbnails/lab-star.png" alt="" width="14" height="14" style="width:14px;height:14px;vertical-align:middle;margin-right:8px;">${item}\n`;
  html += ` </td>\n`;
  html += ` </tr></table>\n`;
  html += `</div>`;
}

// "Everything else" + "Other tools" footer
html += `<div style="padding:14px 15px 0;"><span style="font-family:${SANS};font-size:14px;color:rgba(27,27,27,0.5);margin-right:20px;"><img src="${BASE}/thumbnails/lab-star.png" alt="" width="10" height="10" style="width:10px;height:10px;opacity:0.4;vertical-align:middle;margin-right:6px;">Everything else in AI</span><span style="font-family:${SANS};font-size:14px;color:rgba(27,27,27,0.5);"><img src="${BASE}/thumbnails/lab-star.png" alt="" width="10" height="10" style="width:10px;height:10px;opacity:0.4;vertical-align:middle;margin-right:6px;">Other tools</span></div>`;

// Poll (before stories)
if (nl.poll) {
  html += `<div style="padding:20px 15px 0;text-align:left;">\n`;
  html += ` <p style="font-family:${SANS};font-weight:600;font-size:16px;color:${TEXT};margin:0;">Quickly before we dive in — <em style="font-style:italic;">${nl.poll.question}</em></p>\n`;
  html += ` <div style="padding:12px 0 0;">`;
  for (const opt of nl.poll.options) {
    const url = `https://thoriumvalley.com/api/poll/vote?poll=${nl.poll.poll_id}&answer=${encAnswer(opt)}&sid={{subscriber_id}}`;
    html += `<a href="${url}" style="font-family:${SANS};font-size:13px;font-weight:700;color:${ACCENT};text-decoration:none;text-transform:uppercase;letter-spacing:0.05em;margin-right:16px;">${opt.toUpperCase()}</a> `;
  }
  html += `</div>\n`;
  html += `</div>`;
}

// Previous poll results
if (nl.poll_results) {
  html += `<div style="padding:10px 15px 0;text-align:left;">\n`;
  html += ` <p style="font-family:${SANS};font-size:14px;color:#666;margin:0;"><em>Last issue's poll: "${nl.poll_results.question}"</em></p>\n`;
  for (const r of nl.poll_results.results) {
    html += ` <p style="font-family:${SANS};font-size:14px;color:#666;margin:2px 0;">${r.option}: ${r.pct}%</p>\n`;
  }
  html += `</div>`;
}

// Stories (each in a bordered card)
for (const story of nl.stories) {
  html += `<div style="border:1px solid #CDCDCD;border-radius:10px;margin:20px 0;padding:0;overflow:hidden;">\n`;
  
  // Thumbnail
  if (story.thumbnail_url) {
    html += ` <div style="padding:0;text-align:center;">\n`;
    html += ` <img src="${BASE}${story.thumbnail_url}" alt="${story.title}" width="100%" style="display:block;width:100%;height:auto;" />\n`;
    html += ` </div>\n`;
  }
  
  // Category
  html += ` <div style="padding:10px 15px 0;text-align:left;">\n`;
  html += ` <p style="font-family:${SANS};color:${ACCENT};font-size:16px;line-height:1.5;padding:0;margin:0;">${story.category}</p>\n`;
  html += ` </div>\n`;
  
  // Title
  html += ` <div style="padding:4px 15px 0;text-align:left;">\n`;
  html += ` <div style="font-family:${SERIF};font-size:30px;line-height:1.2;color:${HEADING};margin:0;padding:0;letter-spacing:-0.05em;">${story.title}</div>\n`;
  html += ` </div>\n`;
  
  // Divider
  html += ` <div style="padding:0 15px;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);margin:12px 0 8px;"></div></div>\n`;
  
  // Content — need to add drop cap to first paragraph
  html += ` <div style="padding:0 15px 15px;text-align:left;">\n`;
  
  let content = story.content;
  // Add drop cap to first paragraph
  const firstParaMatch = content.match(/^(<p[^>]*>)/);
  if (firstParaMatch) {
    // Get the first real text character after the opening <p> tag
    const afterTag = content.substring(firstParaMatch[0].length);
    // Skip any opening tags (like <strong>)
    const textMatch = afterTag.match(/^(?:<[^>]+>)*(.)/);
    if (textMatch) {
      const firstChar = textMatch[1];
      const prefix = afterTag.substring(0, textMatch.index + textMatch[0].length - 1);
      const rest = afterTag.substring(textMatch.index + textMatch[0].length);
      content = firstParaMatch[0] + prefix + `<span style="font-family:'Times New Roman',Georgia,serif;font-size:3.5em;float:left;line-height:0.8;padding-right:8px;padding-top:4px;color:${ACCENT};font-weight:bold;">${firstChar}</span>` + rest;
    }
  }
  
  // Convert the Verdict section: replace <h2>The Verdict</h2> with the verdict image
  content = content.replace(/<h2>The Verdict<\/h2>/g, `<div style="text-align:center;padding:20px 0 8px;"><img src="${BASE}/thumbnails/the-verdict.png" alt="The Verdict" style="display:block;width:100%;height:auto;" /></div>`);
  
  // Convert <h3> (Ask Claude headers)
  content = content.replace(/<h3>([^<]+)<\/h3>/g, `<p style="font-family:${SANS};font-size:18px;font-weight:700;color:${HEADING};padding:12px 0 4px;margin:0;">$1</p>`);
  
  // Convert bullet lists to styled bullets
  content = content.replace(/<ul>([\s\S]*?)<\/ul>/g, (match, inner) => {
    return inner.replace(/<li>([\s\S]*?)<\/li>/g, (m, liContent) => {
      return `<p style="font-family:${SANS};font-size:16px;line-height:1.5;color:${TEXT};padding:10px 0 10px 24px;margin:0;"><span style="color:${ACCENT};font-weight:700;">+</span>&nbsp;${liContent}</p>`;
    });
  });
  
  // Convert code blocks to styled prompts
  content = content.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, `<div style="background:#f5f5f7;border-radius:8px;padding:16px;margin:12px 0;font-family:monospace;font-size:14px;line-height:1.5;color:${TEXT};white-space:pre-wrap;">$1</div>`);
  
  html += ` ${content}\n`;
  html += ` </div>\n`;
  html += `</div>`;
}

// Everything Else in AI (News card)
if (nl.links && nl.links.news && nl.links.news.length > 0) {
  html += `<div style="border:1px solid #CDCDCD;border-radius:10px;margin:20px 0;padding:0 0 15px;overflow:hidden;">\n`;
  html += ` <div style="padding:0;text-align:center;">\n`;
  html += ` <img src="${BASE}/thumbnails/news-header.png" alt="In Other News" width="100%" style="display:block;width:100%;height:auto;" />\n`;
  html += ` </div>\n`;
  html += ` <div style="padding:10px 15px 0;text-align:left;">\n`;
  html += ` <p style="font-family:${SANS};color:${ACCENT};font-size:16px;margin:0;">EVERYTHING ELSE IN AI</p>\n`;
  html += ` </div>\n`;
  html += ` <div style="padding:4px 15px 0;text-align:left;">\n`;
  html += ` <div style="font-family:${SERIF};font-size:30px;line-height:1.2;color:${HEADING};margin:0;padding:0;letter-spacing:-0.05em;">What else happened today?</div>\n`;
  html += ` </div>\n`;
  html += ` <div style="padding:0 15px;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);margin:12px 0 8px;"></div></div>\n`;
  html += ` <div style="padding:0 15px;text-align:left;">`;
  
  for (const item of nl.links.news) {
    const prefix = item.prefix ? `${item.prefix} ` : '';
    html += `<p style="font-family:${SANS};font-size:16px;line-height:1.5;color:${TEXT};padding:4px 0 4px 24px;margin:0;"><span style="color:${ACCENT};font-weight:700;">+</span>&nbsp;${prefix}<a style="color:${ACCENT};text-decoration:none;" href="${item.url}" target="_blank">${item.link_text}</a>${item.rest}</p>`;
  }
  
  html += `</div>\n`;
  html += `</div>`;
}

// Tools card
if (nl.links && nl.links.tools && nl.links.tools.length > 0) {
  html += `<div style="border:1px solid #CDCDCD;border-radius:10px;margin:20px 0;padding:0 0 15px;overflow:hidden;">\n`;
  html += ` <div style="padding:0;text-align:center;">\n`;
  html += ` <img src="${BASE}/thumbnails/tools-header.png" alt="AI Tools" width="100%" style="display:block;width:100%;height:auto;" />\n`;
  html += ` </div>\n`;
  html += ` <div style="padding:10px 15px 0;text-align:left;">\n`;
  html += ` <p style="font-family:${SANS};color:${ACCENT};font-size:16px;margin:0;">OTHER TOOLS</p>\n`;
  html += ` </div>\n`;
  html += ` <div style="padding:4px 15px 0;text-align:left;">\n`;
  html += ` <div style="font-family:${SERIF};font-size:30px;line-height:1.2;color:${HEADING};margin:0;padding:0;letter-spacing:-0.05em;">What our editors are paying attention to today</div>\n`;
  html += ` </div>\n`;
  html += ` <div style="padding:0 15px;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);margin:12px 0 8px;"></div></div>\n`;
  html += ` <div style="padding:0 15px;text-align:left;">`;
  
  for (const tool of nl.links.tools) {
    const sponsored = tool.sponsored ? ' <span style="font-size:12px;color:#999;">(sponsored)</span>' : '';
    html += `<p style="font-family:${SANS};font-size:16px;line-height:1.5;color:${TEXT};padding:4px 0 4px 24px;margin:0;"><span style="color:${ACCENT};font-weight:700;">+</span>&nbsp;<a style="color:${ACCENT};text-decoration:none;" href="${tool.url}" target="_blank">${tool.name}</a>: ${tool.desc}${sponsored}</p>`;
  }
  
  html += `</div>\n`;
  html += `</div>`;
}

// Sign off
html += `<div style="padding:20px 15px 10px;border-top:1px solid #CDCDCD;">\n`;
html += ` <p style="font-family:${SANS};font-size:16px;line-height:1.5;color:${TEXT};margin:0;">${nl.sign_off}</p>\n`;
html += ` <p style="font-family:${SANS};font-size:14px;color:#666;font-style:italic;margin:10px 0 0;">Written by ${nl.writers}</p>\n`;
html += `</div>\n`;

// Footer
html += `<div style="padding:15px 15px;text-align:center;">\n`;
html += ` <p style="font-family:${SANS};font-size:12px;line-height:16px;color:${TEXT};margin:0;padding:4px 0;">That's all for today's Lab. See you next time.</p>\n`;
html += `</div>\n`;

// Close wrapper
html += `</div>`;

// Output
const outDir = path.join(__dirname, '..', 'MAY 6 LAB');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'beehiiv-export.html');
fs.writeFileSync(outFile, html, 'utf-8');

const sizeKB = (Buffer.byteLength(html, 'utf-8') / 1024).toFixed(1);
console.log(`✅ Lab export written to: ${outFile}`);
console.log(`📦 Size: ${sizeKB} KB`);
