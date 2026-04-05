/**
 * Beehiiv HTML Export Engine v2
 *
 * Table-based, fully-inline-styled HTML for Beehiiv email.
 * Modeled on newsletter-template.ts (proven to render in Beehiiv).
 *
 * RULES:
 * - ALL styles are INLINE (Beehiiv strips <style> blocks and CSS classes)
 * - ALL layouts use <table> (flexbox/grid don't work in email)
 * - NO <ul>/<li> tags (Beehiiv adds its own bullets) — use table rows with + markers
 * - ALL URLs are absolute (https://thoriumvalley.com/...)
 * - NO Next.js components — plain HTML only
 * - Valley View header and Yesterday's Results divider are 100% width
 * - Target: keep total HTML under 80KB (Gmail clips at 102KB)
 */

import { getNewsletterBySlug, type Newsletter } from './newsletters';
import { getArticleBySlug, type Article } from './articles';

// ── Design Tokens ──
const SERIF = "'Times New Roman MT Std','Times New Roman',Georgia,serif";
const SANS = "-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text',system-ui,sans-serif";
const ACCENT = '#5170ff';
const TEXT = '#2D2D2D';
const HEADING = '#2A2A2A';
const BORDER = '#CDCDCD';
const BASE = 'https://www.thoriumvalley.com';
const WIDTH = 780;

// ── URL Helper ──
function abs(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}

// ── Table-based Building Blocks ──

function wrapCard(inner: string): string {
  return `<tr><td>` +
    `<table width="100%" border="0" cellspacing="0" cellpadding="0">` +
    `<tr><td height="10" style="line-height:1px;font-size:1px;height:10px;">&nbsp;</td></tr>` +
    `<tr><td style="border:1px solid ${BORDER};border-radius:10px;padding:0;overflow:hidden;">` +
    `<table width="100%" border="0" cellspacing="0" cellpadding="0">${inner}</table>` +
    `</td></tr>` +
    `<tr><td height="10" style="line-height:1px;font-size:1px;height:10px;">&nbsp;</td></tr>` +
    `</table></td></tr>`;
}

function fullWidthImage(url: string, alt: string, linkUrl?: string): string {
  const img = `<img src="${url}" alt="${alt}" width="100%" style="display:block;width:100%;height:auto;" border="0"/>`;
  const content = linkUrl ? `<a href="${linkUrl}" style="display:block;text-decoration:none;">${img}</a>` : img;
  return `<tr><td style="padding:0;text-align:center;">${content}</td></tr>`;
}

function categoryLabel(label: string): string {
  return `<tr><td style="padding:10px 15px 0;text-align:left;">` +
    `<p style="font-family:${SANS};color:${ACCENT};font-size:16px;font-weight:500;line-height:1.5;margin:0;padding:0;">${label}</p>` +
    `</td></tr>`;
}

function sectionHeadline(text: string): string {
  return `<tr><td style="padding:4px 15px 0;text-align:left;">` +
    `<div style="font-family:${SERIF};font-weight:500;font-size:30px;line-height:1.2;color:${HEADING};margin:0;padding:0;letter-spacing:-0.05em;">${text}</div>` +
    `</td></tr>`;
}

function thinDivider(): string {
  return `<tr><td style="padding:0 15px;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);margin:12px 0 8px;"></div></td></tr>`;
}

function bodyText(html: string): string {
  return `<tr><td style="padding:0 15px;text-align:left;word-break:break-word;">` +
    `<div style="font-family:${SANS};font-weight:500;color:${TEXT};font-size:16px;line-height:1.5;">${html}</div>` +
    `</td></tr>`;
}

function spacer(h: number): string {
  return `<tr><td height="${h}" style="line-height:1px;font-size:1px;height:${h}px;">&nbsp;</td></tr>`;
}

// Process article body HTML: absolutize URLs, replace VV header, style links
function processBody(html: string): string {
  let out = html;
  // Absolutize
  out = out.replace(/(href|src)="(\/[^"]*?)"/g, (_, attr, path) => `${attr}="${abs(path)}"`);
  // Style links inline
  out = out.replace(/<a /g, `<a style="color:${ACCENT};text-decoration:none;" `);
  // Style paragraphs inline
  out = out.replace(/<p>/g, `<p style="font-family:${SANS};font-size:16px;line-height:1.5;color:${TEXT};padding:4px 0;margin:0;font-weight:500;">`);
  out = out.replace(/<p\s+style="[^"]*"/g, (m) => m); // leave existing styled p tags
  // Bold/italic
  out = out.replace(/<strong>/g, `<strong style="font-weight:700;color:${TEXT};">`);
  out = out.replace(/<em>/g, `<em style="font-style:italic;">`);
  // Convert ul/li to div-based (no Beehiiv bullet override)
  out = out.replace(/<ul>/g, `<div style="margin:0;padding:0 0 0 20px;">`);
  out = out.replace(/<\/ul>/g, '</div>');
  out = out.replace(/<li>/g, `<div style="margin:10px 0 0 0;padding:0 0 0 24px;position:relative;font-size:16px;line-height:1.5;"><span style="color:${ACCENT};font-weight:700;position:absolute;left:0;">+</span>`);
  out = out.replace(/<\/li>/g, '</div>');
  // Tweet embeds → styled blockquote with link (no JS widgets in email)
  out = out.replace(/<div class="tweet-embed" data-tweet-url="([^"]+)"[^>]*><\/div>/gi, (_, url) => {
    // Extract username from URL: https://x.com/username/status/... or https://twitter.com/username/status/...
    const match = url.match(/(?:x\.com|twitter\.com)\/([^/]+)\/status/);
    const username = match ? `@${match[1]}` : 'View post';
    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:12px 0;">` +
      `<tr><td style="border-left:3px solid ${ACCENT};padding:12px 16px;background:#f8f9fa;border-radius:0 6px 6px 0;">` +
      `<p style="font-family:${SANS};font-size:14px;color:#555;margin:0 0 6px;font-weight:500;">` +
      `<a href="${url}" style="color:${ACCENT};text-decoration:none;font-weight:600;" target="_blank">${username} on X \u2197</a></p>` +
      `<p style="font-family:${SANS};font-size:13px;color:#888;margin:0;">` +
      `<a href="${url}" style="color:#888;text-decoration:underline;" target="_blank">View the full post →</a></p>` +
      `</td></tr></table>`;
  });
  // Valley View header → 100% width image
  const vvImg = `<div style="padding:8px 0;text-align:center;"><img src="${BASE}/thumbnails/into-the-valley.png" alt="Into the Valley" style="display:block;width:100%;height:auto;padding:0;"></div>`;
  out = out.replace(/<p[^>]*><strong[^>]*>Our Valley View<\/strong><\/p>/gi, vvImg);
  out = out.replace(/<div class="vv-header"[^>]*>.*?<\/div>/gi, vvImg);
  return out;
}

// ── Link Item Builder (table row with blue + marker) ──
function linkItem(content: string): string {
  return `<tr><td style="padding:8px 15px 0;text-align:left;font-family:${SANS};font-size:16px;line-height:1.5;color:${TEXT};font-weight:500;">` +
    `<span style="color:${ACCENT};font-weight:700;margin-right:8px;">+</span>${content}` +
    `</td></tr>`;
}

// ── Share Buttons Row ──
function shareRow(articleUrl: string, title: string): string {
  const shareText = encodeURIComponent(title);
  const shareUrl = encodeURIComponent(articleUrl);
  return `<tr><td style="padding:8px 15px 0;text-align:left;">` +
    `<table cellpadding="0" cellspacing="0" border="0"><tr>` +
    `<td style="font-family:${SANS};font-size:11px;font-weight:500;color:rgba(27,27,27,0.4);text-transform:uppercase;letter-spacing:0.08em;padding-right:12px;">Share</td>` +
    `<td style="padding-right:12px;"><a href="https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}" target="_blank" style="color:rgba(27,27,27,0.4);text-decoration:none;font-size:14px;">𝕏</a></td>` +
    `<td style="padding-right:12px;"><a href="https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}" target="_blank" style="color:rgba(27,27,27,0.4);text-decoration:none;font-size:14px;">in</a></td>` +
    `<td><a href="mailto:?subject=${shareText}&body=${shareUrl}" style="color:rgba(27,27,27,0.4);text-decoration:none;font-size:14px;">✉</a></td>` +
    `</tr></table></td></tr>`;
}

// ── Section Generators ──

function generateNewsJobsCard(nl: Newsletter): string {
  if (!nl.links) return '';
  const { news, jobs } = nl.links;
  if ((!news || !news.length) && (!jobs || !jobs.length)) return '';

  let inner = '';
  inner += fullWidthImage(abs('/thumbnails/news-header.png'), 'In Other News');
  inner += categoryLabel('IN OTHER NEWS');
  inner += sectionHeadline('What else happened today?');
  inner += thinDivider();

  if (news && news.length) {
    news.forEach(item => {
      const rest = item.rest && !item.rest.startsWith(' ') && !item.rest.startsWith(',') && !item.rest.startsWith(' —') ? ` ${item.rest}` : (item.rest || '');
      inner += linkItem(`${item.prefix || ''}<a href="${item.url}" style="color:${ACCENT};text-decoration:none;">${item.link_text}</a>${rest}`);
    });
  }

  if (jobs && jobs.length) {
    inner += `<tr><td style="padding:16px 15px 0;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);"></div></td></tr>`;
    inner += `<tr><td style="padding:12px 15px 0;text-align:left;"><p style="font-family:${SANS};color:#000;font-size:16px;font-weight:700;margin:0;">WHO'S HIRING IN AI</p></td></tr>`;
    jobs.forEach(item => {
      inner += linkItem(`<a href="${item.url}" style="color:${ACCENT};text-decoration:none;">${item.company}</a> — ${item.role}`);
    });
  }

  inner += spacer(15);
  return wrapCard(inner);
}

function generateGamesCard(nl: Newsletter): string {
  if (!nl.games) return '';
  const g = nl.games;
  const VOTE_BASE = 'https://thoriumvalley.com';
  const voteA = g.game_poll_id ? `${VOTE_BASE}/api/poll/vote?poll=${g.game_poll_id}&answer=${encodeURIComponent('Option A')}&sid={{subscriber_id}}` : '#';
  const voteB = g.game_poll_id ? `${VOTE_BASE}/api/poll/vote?poll=${g.game_poll_id}&answer=${encodeURIComponent('Option B')}&sid={{subscriber_id}}` : '#';

  let inner = '';
  inner += fullWidthImage(abs('/thumbnails/games-header.png'), 'Games');
  inner += categoryLabel('GAMES');
  inner += sectionHeadline('AI or real — can you tell the difference?');
  inner += thinDivider();

  // Two side-by-side images
  inner += `<tr><td style="padding:16px 15px 0;">` +
    `<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>` +
    `<td width="50%" style="padding:0 6px 0 0;text-align:center;vertical-align:top;">` +
    `<a href="${voteA}" style="display:block;text-decoration:none;"><img src="${abs(g.image_a)}" alt="Option A" width="100%" style="display:block;width:100%;height:auto;border-radius:6px;" border="0"></a>` +
    `<p style="font-family:${SERIF};font-weight:500;font-size:20px;color:${HEADING};text-align:center;padding:8px 0;margin:0;">Option A</p></td>` +
    `<td width="50%" style="padding:0 0 0 6px;text-align:center;vertical-align:top;">` +
    `<a href="${voteB}" style="display:block;text-decoration:none;"><img src="${abs(g.image_b)}" alt="Option B" width="100%" style="display:block;width:100%;height:auto;border-radius:6px;" border="0"></a>` +
    `<p style="font-family:${SERIF};font-weight:500;font-size:20px;color:${HEADING};text-align:center;padding:8px 0;margin:0;">Option B</p></td>` +
    `</tr></table></td></tr>`;

  // Vote links
  inner += `<tr><td style="padding:0 15px 16px;text-align:center;">` +
    `<p style="font-family:${SANS};font-size:16px;color:${TEXT};font-weight:500;text-align:center;margin:0;">Which image is real?</p>` +
    `<p style="text-align:center;margin:4px 0 0;">` +
    `<a href="${voteA}" style="color:${ACCENT};text-decoration:none;font-family:${SANS};font-weight:600;">Option A</a>` +
    `<span style="color:#999;padding:0 8px;">|</span>` +
    `<a href="${voteB}" style="color:${ACCENT};text-decoration:none;font-family:${SANS};font-weight:600;">Option B</a></p>` +
    `</td></tr>`;

  // Yesterday's Results
  if (nl.yesterdays_results) {
    const yr = nl.yesterdays_results;
    inner += `<tr><td style="padding:8px 0;text-align:center;">` +
      `<img src="${abs('/thumbnails/yesterdays-results.png')}" alt="Yesterday's Results" style="display:block;width:100%;height:auto;padding:0;" border="0">` +
      `</td></tr>`;
    inner += `<tr><td style="padding:8px 0 20px;">` +
      `<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>` +
      `<td width="50%" style="padding:0 6px 0 0;text-align:center;vertical-align:top;">` +
      `<img src="${abs(yr.ai_image)}" alt="AI Image" width="100%" style="display:block;width:100%;height:auto;border-radius:6px;" border="0">` +
      `<a href="${yr.ai_source}" style="font-family:${SANS};font-size:13px;font-weight:600;color:${ACCENT};text-decoration:none;display:block;padding:6px 0;text-align:center;">AI IMAGE</a></td>` +
      `<td width="50%" style="padding:0 0 0 6px;text-align:center;vertical-align:top;">` +
      `<img src="${abs(yr.real_image)}" alt="Real Image" width="100%" style="display:block;width:100%;height:auto;border-radius:6px;" border="0">` +
      `<a href="${yr.real_source}" style="font-family:${SANS};font-size:13px;font-weight:600;color:${ACCENT};text-decoration:none;display:block;padding:6px 0;text-align:center;">REAL IMAGE</a></td>` +
      `</tr></table></td></tr>`;
  }

  return wrapCard(inner);
}

function generateToolsCard(nl: Newsletter): string {
  if (!nl.links?.tools || !nl.links.tools.length) return '';
  const tools = nl.links.tools;

  let inner = '';
  inner += fullWidthImage(abs('/thumbnails/tools-header.png'), 'AI Tools');
  inner += categoryLabel('AI TOOLS');
  inner += sectionHeadline('What our editors are paying attention to today');
  inner += thinDivider();

  tools.forEach(item => {
    inner += linkItem(`<a href="${item.url}" style="color:${ACCENT};text-decoration:none;">${item.name}</a>: ${item.desc}`);
  });

  inner += spacer(15);
  return wrapCard(inner);
}

// ── Main Export ──

export function exportNewsletterForBeehiiv(slug: string): { html: string; title: string } | null {
  const newsletter = getNewsletterBySlug(slug);
  if (!newsletter) return null;

  const articles = newsletter.article_slugs
    .map((s) => getArticleBySlug(s))
    .filter(Boolean) as Article[];

  // Banner
  const bannerRow = newsletter.banner_image_url
    ? `<tr><td style="padding:0 0 8px;text-align:center;"><img src="${abs(newsletter.banner_image_url)}" alt="${newsletter.date} banner" width="100%" style="display:block;width:100%;height:auto;" border="0"></td></tr>`
    : '';

  // Intro
  const gmMatch = newsletter.intro.match(/^(Good Morning Thorium Valley[,.])/i);
  const wbMatch = newsletter.intro.match(/^(Welcome back[^,.]*[,.])/i);
  let introText: string;
  if (gmMatch) {
    introText = `<strong style="font-weight:700;">${gmMatch[0].replace(/,$/, '.')}</strong> ${newsletter.intro.slice(gmMatch[0].length).trimStart()}`;
  } else if (wbMatch) {
    introText = `<strong style="font-weight:700;">${wbMatch[0]}</strong>${newsletter.intro.slice(wbMatch[0].length)}`;
  } else {
    introText = newsletter.intro;
  }
  const introRow = `<tr><td style="padding:0 15px;text-align:left;word-break:break-word;">` +
    `<p style="font-family:${SANS};font-weight:500;color:${TEXT};font-size:16px;line-height:1.6;padding:12px 0;margin:0;">${introText}</p>` +
    `</td></tr>`;

  // TOC — table layout for right-aligned FULL STORY (no flex — doesn't work in email)
  const tocItems = newsletter.toc.map((item, i) => {
    const articleSlug = articles[i]?.slug;
    const fullStoryCell = articleSlug
      ? `<td style="text-align:right;vertical-align:middle;white-space:nowrap;padding-left:12px;"><a href="${BASE}/articles/${articleSlug}" style="font-family:${SANS};font-size:10px;font-weight:800;color:${ACCENT};text-decoration:none;letter-spacing:0.08em;">FULL STORY</a></td>`
      : '';
    return `<tr><td style="padding:4px 15px;text-align:left;">` +
      `<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>` +
      `<td style="font-family:${SERIF};font-weight:500;font-size:26px;line-height:1.3;color:${HEADING};margin:0;padding:2px 0;letter-spacing:-0.05em;">` +
      `<img src="${BASE}/thumbnails/toc-bullet.png" alt="" width="14" height="14" style="width:14px;height:14px;vertical-align:middle;margin-right:8px;">` +
      `${item}</td>${fullStoryCell}` +
      `</tr></table></td></tr>`;
  }).join('');

  const tocRows = `<tr><td style="padding:24px 15px 0;">` +
    `<img src="${BASE}/thumbnails/toc-header.png" alt="In Today's Edition" style="display:block;width:50%;height:auto;padding:10px 0 6px;">` +
    `</td></tr>${tocItems}`;

  // Secondary TOC
  let secTocRow = '';
  const hasNews = newsletter.links?.news && newsletter.links.news.length > 0;
  const hasTools = newsletter.links?.tools && newsletter.links.tools.length > 0;
  if (hasNews || hasTools) {
    let secContent = '';
    if (hasNews) secContent += `<span style="font-family:${SANS};font-size:14px;font-weight:500;color:rgba(27,27,27,0.5);margin-right:20px;"><img src="${BASE}/thumbnails/toc-bullet.png" alt="" width="10" height="10" style="width:10px;height:10px;opacity:0.4;vertical-align:middle;margin-right:6px;">What else happened today?</span>`;
    if (hasTools) secContent += `<span style="font-family:${SANS};font-size:14px;font-weight:500;color:rgba(27,27,27,0.5);"><img src="${BASE}/thumbnails/toc-bullet.png" alt="" width="10" height="10" style="width:10px;height:10px;opacity:0.4;vertical-align:middle;margin-right:6px;">What AI tools should I be using?</span>`;
    secTocRow = `<tr><td style="padding:14px 15px 0;">${secContent}</td></tr>`;
  }

  // Quick Poll
  let quickPollRow = '';
  if (newsletter.poll) {
    const p = newsletter.poll;
    const VOTE_BASE = 'https://thoriumvalley.com';
    const allOptions = [...p.options, ...(p.options.some(o => o.toLowerCase() === 'other') ? [] : ['Other'])];
    const optLinks = allOptions.map(opt =>
      `<a href="${p.poll_id ? `${VOTE_BASE}/api/poll/vote?poll=${p.poll_id}&answer=${encodeURIComponent(opt)}&sid={{subscriber_id}}` : '#'}" style="font-family:${SANS};font-size:14px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:${ACCENT};text-decoration:none;">${opt}</a>`
    ).join(`<span style="color:#ccc;padding:0 6px;"> </span>`);
    quickPollRow = `<tr><td style="padding:32px 15px 24px;">` +
      `<p style="font-family:${SANS};font-size:16px;color:${TEXT};font-weight:500;margin:0;">Quickly before we dive in — <em style="font-style:italic;">${p.question}</em></p>` +
      `<div style="margin-top:10px;">${optLinks}</div>` +
      `</td></tr>`;
  }

  // Poll Results
  let pollResultsRow = '';
  if (newsletter.poll_results) {
    const pr = newsletter.poll_results;
    const resultBars = pr.results.map(r =>
      `<div style="margin:4px 0;font-family:${SANS};font-size:14px;color:${TEXT};">` +
      `<span style="font-weight:600;">${r.option}</span> <span style="color:#999;">${r.pct}%</span></div>`
    ).join('');
    pollResultsRow = `<tr><td style="padding:0 15px 16px;">` +
      `<p style="font-family:${SANS};font-size:14px;color:#999;font-weight:500;margin:0 0 8px;">Last poll: ${pr.question}</p>` +
      `${resultBars}</td></tr>`;
  }

  // Article cards
  const articleRows = articles.map(article => {
    const bodyContent = (article as any).newsletter_content || article.content || '<p>Content not available.</p>';
    const processed = processBody(bodyContent);
    const articleUrl = `${BASE}/articles/${article.slug}?utm_source=beehiiv&utm_medium=newsletter&utm_campaign=${slug}`;

    let inner = '';
    if (article.thumbnail_url) {
      inner += fullWidthImage(abs(article.thumbnail_url), article.title, articleUrl);
    }
    inner += categoryLabel(article.category.toUpperCase());
    inner += sectionHeadline(article.title);
    inner += shareRow(articleUrl, article.title);
    inner += thinDivider();
    inner += bodyText(processed);
    // Read full story link
    inner += `<tr><td style="padding:8px 15px 0;text-align:left;"><a href="${articleUrl}" style="font-family:${SANS};font-size:14px;font-weight:600;color:${ACCENT};text-decoration:none;">Read the full story →</a></td></tr>`;
    inner += spacer(12);

    return wrapCard(inner);
  }).join('');

  // Sign-off
  const signOffRow = `<tr><td style="padding:20px 15px 10px;border-top:1px solid ${BORDER};">` +
    `<p style="font-family:${SANS};font-size:16px;line-height:1.5;color:${TEXT};margin:0;">${newsletter.sign_off}</p>` +
    `<p style="font-family:${SANS};font-size:14px;color:#666;font-style:italic;margin:10px 0 0;">Written by ${newsletter.writers}</p>` +
    `</td></tr>`;

  // Footer
  const footerRow = `<tr><td style="padding:10px 15px;text-align:center;">` +
    `<p style="font-family:${SANS};font-size:12px;color:${TEXT};margin:0;">That's all for today's Thorium Valley. See you tomorrow.</p>` +
    `</td></tr>`;

  // Assemble
  const newsJobsCard = generateNewsJobsCard(newsletter);
  const gamesCard = generateGamesCard(newsletter);
  const toolsCard = generateToolsCard(newsletter);

  const emailBody = [
    bannerRow, introRow, tocRows, secTocRow, quickPollRow, pollResultsRow,
    articleRows,
    newsJobsCard, gamesCard, toolsCard,
    signOffRow, footerRow
  ].join('');

  const fullHtml = `<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#fff;">` +
    `<tr><td align="center">` +
    `<table width="${WIDTH}" border="0" cellspacing="0" cellpadding="0" style="width:${WIDTH}px;max-width:${WIDTH}px;">` +
    `<tr><td style="padding:0;">` +
    `<table width="100%" border="0" cellspacing="0" cellpadding="0">${emailBody}</table>` +
    `</td></tr></table></td></tr></table>`;

  return { html: fullHtml, title: newsletter.title };
}

// ── Single Article Export ──

export function exportArticleForBeehiiv(slug: string): { html: string; title: string } | null {
  const article = getArticleBySlug(slug);
  if (!article) return null;

  const bodyContent = article.content || '<p>Content not available.</p>';
  const processed = processBody(bodyContent);
  const articleUrl = `${BASE}/articles/${article.slug}`;

  let inner = '';
  if (article.thumbnail_url) {
    inner += fullWidthImage(abs(article.thumbnail_url), article.title, articleUrl);
  }
  inner += categoryLabel(article.category.toUpperCase());
  inner += sectionHeadline(article.title);
  inner += thinDivider();
  inner += bodyText(processed);

  const fullHtml = `<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#fff;">` +
    `<tr><td align="center">` +
    `<table width="${WIDTH}" border="0" cellspacing="0" cellpadding="0" style="width:${WIDTH}px;max-width:${WIDTH}px;">` +
    `<tr><td style="padding:0;">` +
    `<table width="100%" border="0" cellspacing="0" cellpadding="0">${wrapCard(inner)}</table>` +
    `</td></tr></table></td></tr></table>`;

  return { html: fullHtml, title: article.title };
}

// ── Welcome Email Export ──

export function exportWelcomeForBeehiiv(): { html: string; title: string } {
  const welcomeHtml = `<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#fff;">` +
    `<tr><td align="center">` +
    `<table width="${WIDTH}" border="0" cellspacing="0" cellpadding="0" style="width:${WIDTH}px;max-width:${WIDTH}px;">` +
    `<tr><td style="padding:20px 15px;text-align:left;">` +
    `<p style="font-family:${SANS};font-size:16px;line-height:1.6;color:${TEXT};margin:0;">` +
    `<strong style="font-weight:700;">Welcome to Thorium Valley.</strong> You're now part of the smartest AI newsletter on the internet. Every weekday, we break down what's actually happening in AI — no hype, no filler, just the stories that matter.</p>` +
    `</td></tr></table></td></tr></table>`;
  return { html: welcomeHtml, title: 'Welcome to Thorium Valley' };
}
