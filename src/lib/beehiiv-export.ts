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

// ── Markdown → HTML (for condensed_content which is stored as markdown) ──
export function mdToHtml(md: string): string {
  if (!md) return '';
  // Already HTML? Return as-is
  if (md.trimStart().startsWith('<p>') || md.trimStart().startsWith('<div>')) return md;
  let html = md;
  // Strip leading category + headline (e.g. "PRODUCTS\n\n# AI is now writing the AI\n\n")
  html = html.replace(/^[A-Z\s&]+\n\n#[^\n]+\n\n/, '');
  // Convert **bold**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Convert *italic* / _italic_
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/(?<!\w)_(.+?)_(?!\w)/g, '<em>$1</em>');
  // Convert [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  // Split into blocks
  const blocks = html.split(/\n\n+/);
  const out: string[] = [];
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    // Bullet list
    if (trimmed.match(/^[-*]\s/m)) {
      const items = trimmed.split(/\n/).filter(l => l.match(/^[-*]\s/)).map(l => `<li>${l.replace(/^[-*]\s+/, '')}</li>`);
      out.push(`<ul>${items.join('')}</ul>`);
    }
    // Header
    else if (trimmed.match(/^#{1,6}\s/)) {
      out.push(`<p><strong>${trimmed.replace(/^#+\s*/, '')}</strong></p>`);
    }
    else {
      // Paragraph — handle single newlines as line breaks within block
      out.push(`<p>${trimmed.replace(/\n/g, '<br>')}</p>`);
    }
  }
  return out.join('\n');
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
  const vvImg = `<div style="padding:8px 0;text-align:center;"><img src="${BASE}/IN THE VALLEY NEWS.png" alt="In the Valley" style="display:block;width:100%;height:auto;padding:0;"></div>`;
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

export async function exportNewsletterForBeehiiv(slug: string): Promise<{ html: string; title: string } | null> {
  return exportMainForBeehiiv(slug);
}

export async function exportMainForBeehiiv(slug?: string): Promise<{ html: string; title: string } | null> {
  let newsletter: Newsletter | null = null;
  if (slug) {
    newsletter = await getNewsletterBySlug(slug);
  } else {
    const { data } = await (await import('./newsletters')).getNewsletters({ limit: 1, sort: 'newest' });
    newsletter = data?.[0] || null;
  }
  if (!newsletter) return null;

  const articles = (await Promise.all(
    newsletter.article_slugs.map((s) => getArticleBySlug(s))
  )).filter(Boolean) as Article[];

  const INTER = 'Inter,sans-serif';
  const TIMES = "'Times New Roman',serif";
  const AC = '#5170ff';
  const SITE = 'https://www.thoriumvalley.com';
  const VOTE_BASE = 'https://www.thoriumvalley.com';
  const nlSlug = newsletter.slug;

  const bannerUrl = newsletter.banner_image_url?.startsWith('http')
    ? newsletter.banner_image_url : `${SITE}${newsletter.banner_image_url || ''}`;
  const bannerHtml = bannerUrl ? `<div style="padding:0 25px 24px;text-align:center;">\n <img src="${bannerUrl}" alt="${newsletter.date} banner" width="780" style="display:block;width:100%;height:auto;" />\n</div>` : '';

  const tocHeader = `<div style="padding:24px 15px 0;">\n <img src="${SITE}/thumbnails/toc-header.png" alt="In Today's Newsletter" style="display:block;width:50%;height:auto;padding:10px 0 6px;">\n</div>`;

  const tocItems = newsletter.toc.map((item, i) => {
    const articleSlug = articles[i]?.slug;
    const fsl = articleSlug ? `<td style="text-align:right;vertical-align:middle;white-space:nowrap;padding-left:12px;">\n  <a href="${SITE}/articles/${articleSlug}?utm_source=beehiiv&utm_medium=newsletter&utm_campaign=${nlSlug}" style="font-family:${INTER};font-size:10px;font-weight:800;color:${AC};text-decoration:none;letter-spacing:0.08em;">FULL STORY</a>\n </td>` : '';
    return `<div style="padding:4px 15px;text-align:left;">\n <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>\n <td style="font-family:${TIMES};font-size:26px;line-height:1.3;color:#2A2A2A;padding:2px 0;letter-spacing:-0.05em;">\n <img src="${SITE}/thumbnails/toc-bullet.png" alt="" width="14" height="14" style="width:14px;height:14px;vertical-align:middle;margin-right:8px;">${item.replace(/'/g, '&#x27;')}\n </td>${fsl}\n </tr></table>\n</div>`;
  }).join('');

  let secToc = '';
  const hasNews = newsletter.links?.news?.length;
  const hasTools = newsletter.links?.tools?.length;
  if (hasNews || hasTools) {
    let spans = '';
    if (hasNews) spans += `<span style="font-family:${INTER};font-size:14px;color:rgba(27,27,27,0.5);margin-right:20px;"><img src="${SITE}/thumbnails/toc-bullet.png" alt="" width="10" height="10" style="width:10px;height:10px;opacity:0.4;vertical-align:middle;margin-right:6px;">What else happened today?</span>`;
    if (hasTools) spans += `<span style="font-family:${INTER};font-size:14px;color:rgba(27,27,27,0.5);"><img src="${SITE}/thumbnails/toc-bullet.png" alt="" width="10" height="10" style="width:10px;height:10px;opacity:0.4;vertical-align:middle;margin-right:6px;">What AI tools should I be using?</span>`;
    secToc = `<div style="padding:14px 15px 0;">${spans}</div>`;
  }

  const introRaw = newsletter.intro.replace(/\nIN THIS ISSUE[\s\S]*$/, '').trim();
  const introParas = introRaw.split('\n\n').filter(Boolean);
  const introHtml = `<div style="padding:20px 15px 0;text-align:left;">\n${introParas.map((p, i) => {
    const esc = p.replace(/'/g, '&#x27;');
    if (i === 0) return ` <p style="font-family:${INTER};color:#2D2D2D;font-size:16px;line-height:1.6;padding:12px 0 0;margin:0;"><span style="font-family:${TIMES};font-size:3.5em;float:left;line-height:0.8;padding-right:8px;padding-top:4px;color:${AC};font-weight:bold;">${p.charAt(0)}</span>${esc.slice(1)}</p>`;
    return ` <p style="font-family:${INTER};color:#2D2D2D;font-size:16px;line-height:1.6;padding:12px 0 0;margin:0;">${esc}</p>`;
  }).join('\n')}\n</div>`;

  let pollHtml = '';
  if (newsletter.poll) {
    const p = newsletter.poll;
    const opts = p.options.map(opt => {
      const href = p.poll_id ? `${VOTE_BASE}/api/poll/vote?poll=${p.poll_id}&answer=${encodeURIComponent(opt)}&sid={{subscriber_id}}` : '#';
      return `  <a href="${href}" style="font-family:${INTER};font-size:14px;font-weight:600;color:${AC};text-decoration:none;">${opt.replace(/'/g, '&#x27;')}</a>`;
    }).join(`  <span style="color:rgba(27,27,27,0.2);margin:0 10px;">|</span>\n`);
    pollHtml = `<div style="padding:20px 15px 10px;text-align:left;">\n <p style="font-family:${INTER};font-size:16px;line-height:1.5;color:#2D2D2D;margin:0;">Quickly before we dive in &mdash; <em style="font-style:italic;">${p.question.replace(/'/g, '&#x27;')}</em></p>\n <div style="padding:10px 0 0;">\n${opts}\n </div>\n</div>`;
  }

  const articleCards = articles.map(article => {
    const aUrl = `${SITE}/articles/${article.slug}?utm_source=beehiiv&utm_medium=newsletter&utm_campaign=${nlSlug}`;
    const sT = encodeURIComponent(article.title);
    const sU = encodeURIComponent(aUrl);
    let content = mdToHtml((article as any).newsletter_content || article.content || '<p>Content not available.</p>');
    content = content.replace(/<a /g, `<a style="color:${AC};text-decoration:none;" `);
    content = content.replace(/<p>(?!<)/g, `<p style="font-family:${INTER};font-size:16px;line-height:1.5;color:#2D2D2D;padding:10px 0;margin:0;">`);
    content = content.replace(/<p><strong/g, `<p style="font-family:${INTER};font-size:16px;line-height:1.5;color:#2D2D2D;padding:10px 0;margin:0;"><strong`);
    content = content.replace(/<ul>/g, `<ul style="margin:0;padding:0 0 0 20px;">`);
    content = content.replace(/<li>/g, `<li style="font-family:${INTER};font-size:16px;line-height:1.5;color:#2D2D2D;padding:4px 0;">`);
    content = content.replace(/<p[^>]*><strong[^>]*>Our Valley View<\/strong><\/p>/gi, `<div style="padding:20px 0 8px;text-align:center;"><img src="${SITE}/IN%20THE%20VALLEY%20NEWS.png" alt="Into the Valley" style="display:block;width:100%;height:auto;margin:0 auto;padding:0;" /></div>`);
    content = content.replace(/<p[^>]*><strong[^>]*>Into the Valley<\/strong><\/p>/gi, `<div style="padding:20px 0 8px;text-align:center;"><img src="${SITE}/IN%20THE%20VALLEY%20NEWS.png" alt="Into the Valley" style="display:block;width:100%;height:auto;margin:0 auto;padding:0;" /></div>`);
    content = content.replace(/<div class="vv-header"[^>]*>.*?<\/div>/gi, `<div style="padding:20px 0 8px;text-align:center;"><img src="${SITE}/IN%20THE%20VALLEY%20NEWS.png" alt="Into the Valley" style="display:block;width:100%;height:auto;margin:0 auto;padding:0;" /></div>`);
    const fm = content.match(/^<p[^>]*>(.)/);
    if (fm) content = content.replace(new RegExp(`^(<p[^>]*>)${fm[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`), `$1<span style="font-family:${TIMES};font-size:3.5em;float:left;line-height:0.8;padding-right:8px;padding-top:4px;color:${AC};font-weight:bold;">${fm[1]}</span>`);
    const thumb = article.thumbnail_url ? `<div style="padding:0;text-align:center;">\n <a href="${aUrl}" style="display:block;text-decoration:none;">\n <img src="${abs(article.thumbnail_url)}" alt="${article.title.replace(/"/g, '&quot;')}" width="100%" style="display:block;width:100%;height:auto;" />\n </a>\n </div>` : '';
    return `<div style="border:1px solid #CDCDCD;border-radius:10px;margin:20px 0;padding:0;overflow:hidden;">\n ${thumb}\n <div style="padding:10px 15px 0;text-align:left;">\n <p style="font-family:${INTER};color:${AC};font-size:16px;line-height:1.5;padding:0;margin:0;">${article.category.toUpperCase()}</p>\n </div>\n <div style="padding:4px 15px 0;text-align:left;">\n <div style="font-family:${TIMES};font-size:30px;line-height:1.2;color:#2A2A2A;margin:0;padding:0;letter-spacing:-0.05em;">${article.title.replace(/'/g, '&#x27;')}</div>\n </div>\n<div style="padding:8px 15px 0;text-align:left;">\n <table cellpadding="0" cellspacing="0" border="0"><tr>\n <td style="font-family:${INTER};font-size:11px;color:rgba(27,27,27,0.4);text-transform:uppercase;letter-spacing:0.08em;padding-right:12px;">Share</td>\n <td style="padding-right:12px;"><a href="https://twitter.com/intent/tweet?text=${sT}&url=${sU}" target="_blank" style="color:rgba(27,27,27,0.4);text-decoration:none;font-family:${INTER};font-size:16px;font-weight:700;">X</a></td>\n <td><a href="https://www.linkedin.com/sharing/share-offsite/?url=${sU}" target="_blank" style="color:rgba(27,27,27,0.4);text-decoration:none;font-family:${INTER};font-size:14px;font-weight:700;">in</a></td>\n </tr></table>\n</div>\n <div style="padding:0 15px;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);margin:12px 0 8px;"></div></div>\n <div style="padding:0 15px;text-align:left;">\n${content}\n </div>\n <div style="padding:8px 15px 12px;text-align:left;">\n <a href="${aUrl}" style="font-family:${INTER};font-size:14px;font-weight:600;color:${AC};text-decoration:none;">Read the full story &rarr;</a>\n </div>\n</div>`;
  }).join('\n');

  let newsCard = '';
  if (newsletter.links?.news?.length) {
    const ni = newsletter.links.news.map(item => {
      const rest = item.rest ? (item.rest.startsWith(' ') || item.rest.startsWith(',') ? item.rest : ` ${item.rest}`) : '';
      const prefix = (item as any).prefix ? `${(item as any).prefix} ` : '';
      return ` <p style="font-family:${INTER};font-size:16px;line-height:1.5;color:#2D2D2D;padding:4px 0 4px 24px;margin:0;"><span style="color:${AC};font-weight:700;">+</span>&nbsp;${prefix}<a style="color:${AC};text-decoration:none;" href="${item.url}" target="_blank">${item.link_text.replace(/'/g, '&#x27;')}</a>${rest.replace(/'/g, '&#x27;')}</p>`;
    }).join('\n');
    let jobsSec = '';
    if (newsletter.links.jobs?.length) {
      const ji = newsletter.links.jobs.map(item => ` <p style="font-family:${INTER};font-size:16px;line-height:1.5;color:#2D2D2D;padding:4px 0 4px 24px;margin:0;"><span style="color:${AC};font-weight:700;">+</span>&nbsp;<a style="color:${AC};text-decoration:none;" href="${item.url}" target="_blank">${item.company}</a> &mdash; ${item.role}</p>`).join('\n');
      jobsSec = `\n <div style="border-bottom:1px solid rgba(27,27,27,0.06);margin:0 15px;"></div>\n <div style="padding:14px 15px 4px;"><p style="font-family:${INTER};color:#2A2A2A;font-size:13px;font-weight:700;letter-spacing:0.06em;margin:0;">WHO'S HIRING IN AI</p></div>\n <div style="padding:0 15px 5px;">\n${ji}\n </div>`;
    }
    newsCard = `<div style="border:1px solid #CDCDCD;border-radius:10px;margin:20px 0;padding:0 0 15px;overflow:hidden;">\n <div style="padding:0;text-align:center;"><img src="${SITE}/thumbnails/news-header.png" alt="In Other News" width="100%" style="display:block;width:100%;height:auto;" /></div>\n <div style="padding:10px 15px 0;"><p style="font-family:${INTER};color:${AC};font-size:16px;margin:0;">IN OTHER NEWS</p></div>\n <div style="padding:4px 15px 0;"><div style="font-family:${TIMES};font-size:30px;line-height:1.2;color:#2A2A2A;margin:0;letter-spacing:-0.05em;">What else happened today?</div></div>\n <div style="padding:0 15px;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);margin:12px 0 8px;"></div></div>\n <div style="padding:0 15px;">\n${ni}\n </div>${jobsSec}\n</div>`;
  }

  let gamesCard = '';
  if (newsletter.games) {
    const g = newsletter.games;
    const vA = g.game_poll_id ? `${VOTE_BASE}/api/poll/vote?poll=${g.game_poll_id}&answer=${encodeURIComponent('Option A')}&sid={{subscriber_id}}` : '#';
    const vB = g.game_poll_id ? `${VOTE_BASE}/api/poll/vote?poll=${g.game_poll_id}&answer=${encodeURIComponent('Option B')}&sid={{subscriber_id}}` : '#';
    let yrSec = '';
    if (newsletter.yesterdays_results) {
      const yr = newsletter.yesterdays_results;
      yrSec = `\n <div style="padding:8px 0;text-align:center;"><img src="${abs('/thumbnails/yesterdays-results.png')}" alt="Yesterday's Results" style="display:block;width:100%;height:auto;padding:0;" /></div>\n <div style="padding:8px 0 20px;">\n <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>\n <td width="50%" style="padding:0 6px 0 15px;text-align:center;vertical-align:top;">\n <img src="${abs(yr.ai_image)}" alt="AI Image" width="100%" style="display:block;width:100%;height:auto;border-radius:6px;" />\n <a href="${yr.ai_source}" style="font-family:${INTER};font-size:13px;font-weight:600;color:${AC};text-decoration:none;display:block;padding:6px 0;text-align:center;">AI IMAGE</a></td>\n <td width="50%" style="padding:0 15px 0 6px;text-align:center;vertical-align:top;">\n <img src="${abs(yr.real_image)}" alt="Real Image" width="100%" style="display:block;width:100%;height:auto;border-radius:6px;" />\n <a href="${yr.real_source}" style="font-family:${INTER};font-size:13px;font-weight:600;color:${AC};text-decoration:none;display:block;padding:6px 0;text-align:center;">REAL IMAGE</a></td>\n </tr></table>\n </div>`;
    }
    gamesCard = `<div style="border:1px solid #CDCDCD;border-radius:10px;margin:20px 0;padding:0 0 15px;overflow:hidden;">\n <div style="padding:0;text-align:center;"><img src="${SITE}/thumbnails/games-header.png" alt="AI or Real?" width="100%" style="display:block;width:100%;height:auto;" /></div>\n <div style="padding:10px 15px 0;"><p style="font-family:${INTER};color:${AC};font-size:16px;margin:0;">AI OR REAL?</p></div>\n <div style="padding:4px 15px 0;"><div style="font-family:${TIMES};font-size:30px;line-height:1.2;color:#2A2A2A;margin:0;letter-spacing:-0.05em;">One is AI. One is real. Can you tell?</div></div>\n <div style="padding:0 15px;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);margin:12px 0 8px;"></div></div>\n <div style="padding:8px 0;">\n <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>\n <td width="50%" style="padding:0 6px 0 15px;text-align:center;vertical-align:top;">\n <img src="${abs(g.image_a)}" alt="Option A" width="100%" style="display:block;width:100%;height:auto;border-radius:6px;" />\n <p style="font-family:${TIMES};font-size:20px;color:#2A2A2A;text-align:center;padding:8px 0;margin:0;">Option A</p></td>\n <td width="50%" style="padding:0 15px 0 6px;text-align:center;vertical-align:top;">\n <img src="${abs(g.image_b)}" alt="Option B" width="100%" style="display:block;width:100%;height:auto;border-radius:6px;" />\n <p style="font-family:${TIMES};font-size:20px;color:#2A2A2A;text-align:center;padding:8px 0;margin:0;">Option B</p></td>\n </tr></table>\n </div>\n <div style="padding:0 15px 16px;text-align:center;">\n <p style="font-family:${INTER};font-size:16px;color:#2D2D2D;text-align:center;margin:0;">Which image is real?</p>\n <p style="text-align:center;margin:4px 0 0;">\n <a href="${vA}" style="color:${AC};text-decoration:none;font-family:${INTER};font-weight:600;">Option A</a>\n <span style="color:#999;padding:0 8px;">|</span>\n <a href="${vB}" style="color:${AC};text-decoration:none;font-family:${INTER};font-weight:600;">Option B</a>\n </p>\n </div>${yrSec}\n</div>`;
  }

  let toolsCard = '';
  if (newsletter.links?.tools?.length) {
    const ti = newsletter.links.tools.map(item => ` <p style="font-family:${INTER};font-size:16px;line-height:1.5;color:#2D2D2D;padding:4px 0 4px 24px;margin:0;"><span style="color:${AC};font-weight:700;">+</span>&nbsp;<a style="color:${AC};text-decoration:none;" href="${item.url}" target="_blank">${item.name}</a>: ${(item.desc || '').replace(/'/g, '&#x27;')}</p>`).join('\n');
    toolsCard = `<div style="border:1px solid #CDCDCD;border-radius:10px;margin:20px 0;padding:0 0 15px;overflow:hidden;">\n <div style="padding:0;text-align:center;"><img src="${SITE}/thumbnails/tools-header.png" alt="AI Tools" width="100%" style="display:block;width:100%;height:auto;" /></div>\n <div style="padding:10px 15px 0;"><p style="font-family:${INTER};color:${AC};font-size:16px;margin:0;">AI TOOLS</p></div>\n <div style="padding:4px 15px 0;"><div style="font-family:${TIMES};font-size:30px;line-height:1.2;color:#2A2A2A;margin:0;letter-spacing:-0.05em;">What our editors are paying attention to today</div></div>\n <div style="padding:0 15px;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);margin:12px 0 8px;"></div></div>\n <div style="padding:0 15px;">\n${ti}\n </div>\n</div>`;
  }

  const so = newsletter.sign_off || "That's all for today. If this issue made you think, share it with someone who needs to think harder.";
  const wr = newsletter.writers || 'Jason Chen, Advait Prakash, Andrew Hales, and the Thorium Valley crew.';
  const signOff = `<div style="padding:20px 15px 10px;border-top:1px solid #CDCDCD;">\n <p style="font-family:${INTER};font-size:16px;line-height:1.5;color:#2D2D2D;margin:0;">${so.replace(/'/g, '&#x27;')}</p>\n <p style="font-family:${INTER};font-size:14px;color:#666;font-style:italic;margin:10px 0 0;">Written by ${wr}</p>\n</div>`;
  const footer = `<div style="padding:15px 15px;text-align:center;">\n <p style="font-family:${INTER};font-size:12px;line-height:16px;color:#2D2D2D;margin:0;padding:4px 0;">That's all for today's Thorium Valley. See you tomorrow.</p>\n</div>`;

  return { html: `<div style="max-width:780px;margin:0 auto;padding:0;background-color:#FFFFFF;font-family:${INTER};color:#2D2D2D;font-size:16px;line-height:1.5;">\n${bannerHtml}\n${tocHeader}\n${tocItems}\n${secToc}\n${introHtml}\n${pollHtml}\n${articleCards}\n${newsCard}\n${gamesCard}\n${toolsCard}\n${signOff}\n${footer}\n</div>`, title: newsletter.toc?.[0] || newsletter.title };
}
// ── Single Article Export ──

export async function exportArticleForBeehiiv(slug: string): Promise<{ html: string; title: string } | null> {
  const article = await getArticleBySlug(slug);
  if (!article) return null;

  const bodyContent = mdToHtml(article.content || '<p>Content not available.</p>');
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

// ── Lab / Child Newsletter Export ──
// Uses div-based layout (not table) to match the proven Lab Beehiiv template.

export async function exportLabForBeehiiv(slug?: string): Promise<{ html: string; title: string } | null> {
  // If no slug, find the most recent Lab edition
  let newsletter: Newsletter | null = null;
  if (slug) {
    newsletter = await getNewsletterBySlug(slug);
  } else {
    const { getLabNewsletters } = await import('./newsletters');
    const { data } = await getLabNewsletters({ limit: 1, sort: 'newest' });
    newsletter = data?.[0] || null;
  }
  if (!newsletter || !newsletter.stories?.length) return null;

  const INTER = 'Inter,sans-serif';
  const TIMES = "'Times New Roman',serif";
  const AC = '#5170ff';
  const SITE = 'https://www.thoriumvalley.com';
  const VOTE_BASE = 'https://www.thoriumvalley.com';

  // ── Banner ──
  const bannerUrl = newsletter.banner_image_url?.startsWith('http')
    ? newsletter.banner_image_url
    : `${SITE}${newsletter.banner_image_url || '/thumbnails/banner-lab.png'}`;
  const bannerHtml = `<div style="padding:0 25px 24px;text-align:center;">
 <img src="${bannerUrl}" alt="Lab ${newsletter.date}" width="780" style="display:block;width:100%;height:auto;" />
</div>`;

  // ── TOC ──
  const tocHeader = `<div style="padding:24px 15px 0;">
 <img src="${SITE}/thumbnails/toc-header.png" alt="In Today's Newsletter" style="display:block;width:50%;height:auto;padding:10px 0 6px;">
</div>`;

  const tocItems = newsletter.toc.map(item =>
    `<div style="padding:4px 15px;text-align:left;">
 <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
 <td style="font-family:${TIMES};font-size:26px;line-height:1.3;color:#2A2A2A;padding:2px 0;letter-spacing:-0.05em;">
 <img src="${SITE}/thumbnails/lab-star.png" alt="" width="14" height="14" style="width:14px;height:14px;vertical-align:middle;margin-right:8px;">${item.replace(/'/g, '&#x27;')}
 </td></tr></table>
</div>`
  ).join('\n');

  // Secondary TOC
  const hasNews = newsletter.links?.news?.length;
  const hasTools = newsletter.links?.tools?.length;
  let secToc = '';
  if (hasNews || hasTools) {
    let spans = '';
    if (hasNews) spans += `<span style="font-family:${INTER};font-size:14px;color:rgba(27,27,27,0.5);margin-right:20px;"><img src="${SITE}/thumbnails/lab-star.png" alt="" width="10" height="10" style="width:10px;height:10px;opacity:0.4;vertical-align:middle;margin-right:6px;">What else happened today?</span>`;
    if (hasTools) spans += `<span style="font-family:${INTER};font-size:14px;color:rgba(27,27,27,0.5);"><img src="${SITE}/thumbnails/lab-star.png" alt="" width="10" height="10" style="width:10px;height:10px;opacity:0.4;vertical-align:middle;margin-right:6px;">What AI tools should I be using?</span>`;
    secToc = `<div style="padding:14px 15px 0;">${spans}</div>`;
  }

  // ── Intro (with drop cap) ──
  const introRaw = newsletter.intro
    .replace(/\nIN THIS ISSUE[\s\S]*$/, '') // strip baked-in TOC
    .trim();
  const introParagraphs = introRaw.split('\n\n').filter(Boolean);
  const introHtml = `<div style="padding:20px 15px 0;text-align:left;">
${introParagraphs.map((p, i) => {
    if (i === 0) {
      const first = p.charAt(0);
      const rest = p.slice(1);
      return ` <p style="font-family:${INTER};color:#2D2D2D;font-size:16px;line-height:1.6;padding:12px 0 0;margin:0;"><span style="font-family:${TIMES};font-size:3.5em;float:left;line-height:0.8;padding-right:8px;padding-top:4px;color:${AC};font-weight:bold;">${first}</span>${rest.replace(/'/g, '&#x27;')}</p>`;
    }
    return ` <p style="font-family:${INTER};color:#2D2D2D;font-size:16px;line-height:1.6;padding:12px 0 0;margin:0;">${p.replace(/'/g, '&#x27;')}</p>`;
  }).join('\n')}
</div>`;

  // ── Poll ──
  let pollHtml = '';
  if (newsletter.poll) {
    const p = newsletter.poll;
    const allOpts = [...p.options, ...(p.options.some(o => o.toLowerCase() === 'other') ? [] : ['Other'])];
    const optLinks = allOpts.map(opt => {
      const href = p.poll_id
        ? `${VOTE_BASE}/api/poll/vote?poll=${p.poll_id}&answer=${encodeURIComponent(opt)}&sid={{subscriber_id}}`
        : '#';
      return `  <a href="${href}" style="font-family:${INTER};font-size:14px;font-weight:600;color:${AC};text-decoration:none;">${opt.replace(/'/g, '&#x27;')}</a>`;
    }).join(`  <span style="color:rgba(27,27,27,0.2);margin:0 10px;">|</span>\n`);

    pollHtml = `<div style="padding:20px 15px 10px;text-align:left;">
 <p style="font-family:${INTER};font-size:16px;line-height:1.5;color:#2D2D2D;margin:0;">Quickly before we dive in &mdash; <em style="font-style:italic;">${p.question.replace(/'/g, '&#x27;')}</em></p>
 <div style="padding:10px 0 0;">
${optLinks}
 </div>
</div>`;
  }

  // ── Story Cards ──
  const storyCards = newsletter.stories.map(story => {
    const storySlug = story.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const articleUrl = `${SITE}/newsletter/${newsletter!.slug}`;
    const shareText = encodeURIComponent(story.title);
    const shareUrl = encodeURIComponent(articleUrl);

    // Process content: ensure links are styled
    let content = mdToHtml(story.content || '<p>Content not available.</p>');
    content = content.replace(/<a /g, `<a style="color:${AC};text-decoration:none;" target="_blank" `);
    // Add drop cap to first paragraph
    content = content.replace(
      /^<p>(<strong[^>]*>.*?<\/strong>)<\/p>/,
      (_, bold) => `<p style="font-family:${INTER};font-size:16px;line-height:1.5;color:#2D2D2D;padding:10px 0;margin:0;">${bold}</p>`
    );
    // Style remaining bare <p> tags
    content = content.replace(/<p>(?!<)/g, `<p style="font-family:${INTER};font-size:16px;line-height:1.5;color:#2D2D2D;padding:10px 0;margin:0;">`);
    // Style <ul>/<li>
    content = content.replace(/<ul>/g, `<ul style="margin:0;padding:0 0 0 20px;">`);
    content = content.replace(/<li>/g, `<li style="font-family:${INTER};font-size:16px;line-height:1.5;color:#2D2D2D;padding:4px 0;">`);
    // Replace The Verdict / The Formula with images
    content = content.replace(/<h2>The Verdict<\/h2>/gi,
      `<div style="text-align:center;padding:20px 0 8px;"><img src="${SITE}/thumbnails/the-verdict.png" alt="The Verdict" style="display:block;width:100%;height:auto;" /></div>`);
    content = content.replace(/<h2>The Formula<\/h2>/gi,
      `<div style="text-align:center;padding:20px 0 8px;"><img src="${SITE}/thumbnails/the-formula.png" alt="The Formula" style="display:block;width:100%;height:auto;" /></div>`);

    const thumbImg = story.thumbnail_url
      ? `<div style="padding:0;text-align:center;">
 <img src="${story.thumbnail_url}" alt="${story.title.replace(/"/g, '&quot;')}" width="100%" style="display:block;width:100%;height:auto;" />
 </div>`
      : '';

    return `<div style="border:1px solid #CDCDCD;border-radius:10px;margin:20px 0;padding:0;overflow:hidden;">
 ${thumbImg}
 <div style="padding:10px 15px 0;text-align:left;">
 <p style="font-family:${INTER};color:${AC};font-size:16px;line-height:1.5;padding:0;margin:0;">${(story.category || 'GENERAL').toUpperCase()}</p>
 </div>
 <div style="padding:4px 15px 0;text-align:left;">
 <div style="font-family:${TIMES};font-size:30px;line-height:1.2;color:#2A2A2A;margin:0;padding:0;letter-spacing:-0.05em;">${story.title.replace(/'/g, '&#x27;')}</div>
 </div>
<div style="padding:8px 15px 0;text-align:left;">
 <table cellpadding="0" cellspacing="0" border="0"><tr>
 <td style="font-family:${INTER};font-size:11px;color:rgba(27,27,27,0.4);text-transform:uppercase;letter-spacing:0.08em;padding-right:12px;">Share</td>
 <td style="padding-right:12px;"><a href="https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}" target="_blank" style="color:rgba(27,27,27,0.4);text-decoration:none;font-family:${INTER};font-size:16px;font-weight:700;">X</a></td>
 <td><a href="https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}" target="_blank" style="color:rgba(27,27,27,0.4);text-decoration:none;font-family:${INTER};font-size:14px;font-weight:700;">in</a></td>
 </tr></table>
</div>
 <div style="padding:0 15px;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);margin:12px 0 8px;"></div></div>
 <div style="padding:0 15px;text-align:left;">
${content}
 </div>
 <div style="padding:8px 15px 12px;text-align:left;">
 <a href="${articleUrl}" style="font-family:${INTER};font-size:14px;font-weight:600;color:${AC};text-decoration:none;">Read the full story &rarr;</a>
 </div>
</div>`;
  }).join('\n');

  // ── Links: News ──
  let newsCard = '';
  if (newsletter.links?.news?.length) {
    const newsItems = newsletter.links.news.map(item => {
      const rest = item.rest ? (item.rest.startsWith(' ') || item.rest.startsWith(',') ? item.rest : ` ${item.rest}`) : '';
      const prefix = (item as any).prefix ? `${(item as any).prefix} ` : '';
      return ` <p style="font-family:${INTER};font-size:16px;line-height:1.5;color:#2D2D2D;padding:4px 0 4px 24px;margin:0;"><span style="color:${AC};font-weight:700;">+</span>&nbsp;${prefix}<a style="color:${AC};text-decoration:none;" href="${item.url}" target="_blank">${item.link_text.replace(/'/g, '&#x27;')}</a>${rest.replace(/'/g, '&#x27;')}</p>`;
    }).join('\n');
    newsCard = `<div style="border:1px solid #CDCDCD;border-radius:10px;margin:20px 0;padding:0 0 15px;overflow:hidden;">
 <div style="padding:0;text-align:center;"><img src="${SITE}/thumbnails/news-header.png" alt="In Other News" width="100%" style="display:block;width:100%;height:auto;" /></div>
 <div style="padding:10px 15px 0;"><p style="font-family:${INTER};color:${AC};font-size:16px;margin:0;">EVERYTHING ELSE IN AI</p></div>
 <div style="padding:4px 15px 0;"><div style="font-family:${TIMES};font-size:30px;line-height:1.2;color:#2A2A2A;margin:0;letter-spacing:-0.05em;">What else happened today?</div></div>
 <div style="padding:0 15px;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);margin:12px 0 8px;"></div></div>
 <div style="padding:0 15px;">
${newsItems}
 </div>
</div>`;
  }

  // ── Links: Tools ──
  let toolsCard = '';
  if (newsletter.links?.tools?.length) {
    const toolItems = newsletter.links.tools.map(item => {
      const sponsored = item.desc?.includes('(sponsored)') ? ' <span style="color:#999;font-style:italic;">(sponsored)</span>' : '';
      const desc = item.desc?.replace(/\*?\(sponsored\)\*?:?\s*/, '') || '';
      return ` <p style="font-family:${INTER};font-size:16px;line-height:1.5;color:#2D2D2D;padding:4px 0 4px 24px;margin:0;"><span style="color:${AC};font-weight:700;">+</span>&nbsp;<a style="color:${AC};text-decoration:none;" href="${item.url}" target="_blank">${item.name}</a>${sponsored}${desc ? ': ' + desc.replace(/'/g, '&#x27;') : ''}</p>`;
    }).join('\n');
    toolsCard = `<div style="border:1px solid #CDCDCD;border-radius:10px;margin:20px 0;padding:0 0 15px;overflow:hidden;">
 <div style="padding:0;text-align:center;"><img src="${SITE}/thumbnails/tools-header.png" alt="AI Tools" width="100%" style="display:block;width:100%;height:auto;" /></div>
 <div style="padding:10px 15px 0;"><p style="font-family:${INTER};color:${AC};font-size:16px;margin:0;">OTHER TOOLS</p></div>
 <div style="padding:4px 15px 0;"><div style="font-family:${TIMES};font-size:30px;line-height:1.2;color:#2A2A2A;margin:0;letter-spacing:-0.05em;">What our editors are paying attention to today</div></div>
 <div style="padding:0 15px;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);margin:12px 0 8px;"></div></div>
 <div style="padding:0 15px;">
${toolItems}
 </div>
</div>`;
  }

  // ── Sign-off + Footer ──
  const signOff = newsletter.sign_off || "That's the Lab for this week. If a tool in here saved you time or wasted it, tell us — reply directly.";
  const writers = newsletter.writers || 'Jason Chen, Advait Prakash, Andrew Hales, and the Thorium Valley crew.';
  const signOffHtml = `<div style="padding:20px 15px 10px;border-top:1px solid #CDCDCD;">
 <p style="font-family:${INTER};font-size:16px;line-height:1.5;color:#2D2D2D;margin:0;">${signOff.replace(/'/g, '&#x27;')}</p>
 <p style="font-family:${INTER};font-size:14px;color:#666;font-style:italic;margin:10px 0 0;">Written by ${writers}</p>
</div>`;
  const footer = `<div style="padding:15px 15px;text-align:center;">
 <p style="font-family:${INTER};font-size:12px;line-height:16px;color:#2D2D2D;margin:0;padding:4px 0;">That's all for today's Lab. See you next time.</p>
</div>`;

  // ── Assemble ──
  const fullHtml = `<div style="max-width:780px;margin:0 auto;padding:0;background-color:#FFFFFF;font-family:${INTER};color:#2D2D2D;font-size:16px;line-height:1.5;">
${bannerHtml}
${tocHeader}
${tocItems}
${secToc}
${introHtml}
${pollHtml}
${storyCards}
${newsCard}
${toolsCard}
${signOffHtml}
${footer}
</div>`;

  return { html: fullHtml, title: newsletter.toc?.[0] || newsletter.title };
}

// ── Catalyst Newsletter Export ──
// Uses div-based layout matching Lab template structure, with Catalyst-specific overrides:
//   - TOC bullets: ✦ character in #8c52ff purple
//   - Category labels: #5170ff
//   - Has FULL STORY links in TOC
//   - Articles from article_slugs (not stories)
//   - Into the Valley header image
//   - News: "EVERYTHING ELSE IN AI" / Tools: "OTHER TOOLS"
//   - Sponsored tools with (sponsored) tag

export async function exportCatalystForBeehiiv(slug?: string): Promise<{ html: string; title: string } | null> {
  let newsletter: Newsletter | null = null;
  if (slug) {
    newsletter = await getNewsletterBySlug(slug);
  } else {
    const { getCatalystNewsletters } = await import('./newsletters');
    const { data } = await getCatalystNewsletters({ limit: 1, sort: 'newest' });
    newsletter = data?.[0] || null;
  }
  if (!newsletter) return null;

  // Catalyst uses article_slugs, not stories
  const articles = (await Promise.all(
    newsletter.article_slugs.map((s) => getArticleBySlug(s))
  )).filter(Boolean) as Article[];
  if (!articles.length) return null;

  const INTER = 'Inter,sans-serif';
  const TIMES = "'Times New Roman',serif";
  const AC = '#5170ff';
  const CAT_PURPLE = '#8c52ff';
  const SITE = 'https://www.thoriumvalley.com';
  const VOTE_BASE = 'https://www.thoriumvalley.com';
  const nlSlug = newsletter.slug;

  // ── Banner ──
  const bannerUrl = newsletter.banner_image_url?.startsWith('http')
    ? newsletter.banner_image_url
    : `${SITE}${newsletter.banner_image_url || '/thumbnails/banner-catalyst.png'}`;
  const bannerHtml = `<div style="padding:0 25px 24px;text-align:center;">\n <img src="${bannerUrl}" alt="Catalyst ${newsletter.date}" width="780" style="display:block;width:100%;height:auto;" />\n</div>`;

  // ── TOC ──
  const tocHeader = `<div style="padding:24px 15px 0;">\n <img src="${SITE}/thumbnails/toc-header.png" alt="In Today's Newsletter" style="display:block;width:50%;height:auto;padding:10px 0 6px;">\n</div>`;

  const tocItems = newsletter.toc.map((item, i) => {
    const articleSlug = articles[i]?.slug;
    const fsl = articleSlug
      ? `<td style="text-align:right;vertical-align:middle;white-space:nowrap;padding-left:12px;">\n  <a href="${SITE}/articles/${articleSlug}?utm_source=beehiiv&utm_medium=newsletter&utm_campaign=${nlSlug}" style="font-family:${INTER};font-size:10px;font-weight:800;color:${AC};text-decoration:none;letter-spacing:0.08em;">FULL STORY</a>\n </td>`
      : '';
    return `<div style="padding:4px 15px;text-align:left;">\n <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>\n <td style="font-family:${TIMES};font-size:26px;line-height:1.3;color:#2A2A2A;padding:2px 0;letter-spacing:-0.05em;">\n <span style="color:${CAT_PURPLE};font-size:16px;margin-right:8px;">&#10022;</span>${item.replace(/'/g, '&#x27;')}\n </td>${fsl}\n </tr></table>\n</div>`;
  }).join('');

  // Secondary TOC
  const hasNews = newsletter.links?.news?.length;
  const hasTools = newsletter.links?.tools?.length;
  let secToc = '';
  if (hasNews || hasTools) {
    let spans = '';
    if (hasNews) spans += `<span style="font-family:${INTER};font-size:14px;color:rgba(27,27,27,0.5);margin-right:20px;"><span style="color:${CAT_PURPLE};font-size:10px;opacity:0.4;margin-right:6px;">&#10022;</span>What else happened today?</span>`;
    if (hasTools) spans += `<span style="font-family:${INTER};font-size:14px;color:rgba(27,27,27,0.5);"><span style="color:${CAT_PURPLE};font-size:10px;opacity:0.4;margin-right:6px;">&#10022;</span>What AI tools should I be using?</span>`;
    secToc = `<div style="padding:14px 15px 0;">${spans}</div>`;
  }

  // ── Intro ──
  const introRaw = newsletter.intro.replace(/\nIN THIS ISSUE[\s\S]*$/, '').trim();
  const introParas = introRaw.split('\n\n').filter(Boolean);
  const introHtml = `<div style="padding:20px 15px 0;text-align:left;">\n${introParas.map((p, i) => {
    const esc = p.replace(/'/g, '&#x27;');
    if (i === 0) return ` <p style="font-family:${INTER};color:#2D2D2D;font-size:16px;line-height:1.6;padding:12px 0 0;margin:0;"><span style="font-family:${TIMES};font-size:3.5em;float:left;line-height:0.8;padding-right:8px;padding-top:4px;color:${AC};font-weight:bold;">${p.charAt(0)}</span>${esc.slice(1)}</p>`;
    return ` <p style="font-family:${INTER};color:#2D2D2D;font-size:16px;line-height:1.6;padding:12px 0 0;margin:0;">${esc}</p>`;
  }).join('\n')}\n</div>`;

  // ── Poll ──
  let pollHtml = '';
  if (newsletter.poll) {
    const p = newsletter.poll;
    const allOpts = [...p.options, ...(p.options.some(o => o.toLowerCase() === 'other') ? [] : ['Other'])];
    const optLinks = allOpts.map(opt => {
      const href = p.poll_id
        ? `${VOTE_BASE}/api/poll/vote?poll=${p.poll_id}&answer=${encodeURIComponent(opt)}&sid={{subscriber_id}}`
        : '#';
      return `  <a href="${href}" style="font-family:${INTER};font-size:14px;font-weight:600;color:${AC};text-decoration:none;">${opt.replace(/'/g, '&#x27;')}</a>`;
    }).join(`  <span style="color:rgba(27,27,27,0.2);margin:0 10px;">|</span>\n`);

    pollHtml = `<div style="padding:20px 15px 10px;text-align:left;">\n <p style="font-family:${INTER};font-size:16px;line-height:1.5;color:#2D2D2D;margin:0;">Quickly before we dive in &mdash; <em style="font-style:italic;">${p.question.replace(/'/g, '&#x27;')}</em></p>\n <div style="padding:10px 0 0;">\n${optLinks}\n </div>\n</div>`;
  }

  // ── Article Cards ──
  const articleCards = articles.map(article => {
    const aUrl = `${SITE}/articles/${article.slug}?utm_source=beehiiv&utm_medium=newsletter&utm_campaign=${nlSlug}`;
    const sT = encodeURIComponent(article.title);
    const sU = encodeURIComponent(aUrl);
    let content = mdToHtml((article as any).newsletter_content || (article as any).condensed_content || article.content || '<p>Content not available.</p>');
    content = content.replace(/<a /g, `<a style="color:${AC};text-decoration:none;" target="_blank" `);
    content = content.replace(/<p>(?!<)/g, `<p style="font-family:${INTER};font-size:16px;line-height:1.5;color:#2D2D2D;padding:10px 0;margin:0;">`);
    content = content.replace(/<p><strong/g, `<p style="font-family:${INTER};font-size:16px;line-height:1.5;color:#2D2D2D;padding:10px 0;margin:0;"><strong`);
    content = content.replace(/<ul>/g, `<ul style="margin:0;padding:0 0 0 20px;">`);
    content = content.replace(/<li>/g, `<li style="font-family:${INTER};font-size:16px;line-height:1.5;color:#2D2D2D;padding:4px 0;">`);
    // Into the Valley header
    content = content.replace(/<p[^>]*><strong[^>]*>Into the Valley<\/strong><\/p>/gi, `<div style="padding:20px 0 8px;text-align:center;"><img src="${SITE}/IN%20THE%20VALLEY%20NEWS.png" alt="Into the Valley" style="display:block;width:100%;height:auto;margin:0 auto;padding:0;" /></div>`);
    content = content.replace(/<p[^>]*><strong[^>]*>Our Valley View<\/strong><\/p>/gi, `<div style="padding:20px 0 8px;text-align:center;"><img src="${SITE}/IN%20THE%20VALLEY%20NEWS.png" alt="Into the Valley" style="display:block;width:100%;height:auto;margin:0 auto;padding:0;" /></div>`);
    content = content.replace(/<h2>Into the Valley<\/h2>/gi, `<div style="padding:20px 0 8px;text-align:center;"><img src="${SITE}/IN%20THE%20VALLEY%20NEWS.png" alt="Into the Valley" style="display:block;width:100%;height:auto;margin:0 auto;padding:0;" /></div>`);
    content = content.replace(/<div class="vv-header"[^>]*>.*?<\/div>/gi, `<div style="padding:20px 0 8px;text-align:center;"><img src="${SITE}/IN%20THE%20VALLEY%20NEWS.png" alt="Into the Valley" style="display:block;width:100%;height:auto;margin:0 auto;padding:0;" /></div>`);
    // Drop cap
    const fm = content.match(/^<p[^>]*>(.)/);
    if (fm) content = content.replace(new RegExp(`^(<p[^>]*>)${fm[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`), `$1<span style="font-family:${TIMES};font-size:3.5em;float:left;line-height:0.8;padding-right:8px;padding-top:4px;color:${AC};font-weight:bold;">${fm[1]}</span>`);
    const thumb = article.thumbnail_url ? `<div style="padding:0;text-align:center;">\n <a href="${aUrl}" style="display:block;text-decoration:none;">\n <img src="${abs(article.thumbnail_url)}" alt="${article.title.replace(/"/g, '&quot;')}" width="100%" style="display:block;width:100%;height:auto;" />\n </a>\n </div>` : '';
    return `<div style="border:1px solid #CDCDCD;border-radius:10px;margin:20px 0;padding:0;overflow:hidden;">\n ${thumb}\n <div style="padding:10px 15px 0;text-align:left;">\n <p style="font-family:${INTER};color:${AC};font-size:16px;line-height:1.5;padding:0;margin:0;">${article.category.toUpperCase()}</p>\n </div>\n <div style="padding:4px 15px 0;text-align:left;">\n <div style="font-family:${TIMES};font-size:30px;line-height:1.2;color:#2A2A2A;margin:0;padding:0;letter-spacing:-0.05em;">${article.title.replace(/'/g, '&#x27;')}</div>\n </div>\n<div style="padding:8px 15px 0;text-align:left;">\n <table cellpadding="0" cellspacing="0" border="0"><tr>\n <td style="font-family:${INTER};font-size:11px;color:rgba(27,27,27,0.4);text-transform:uppercase;letter-spacing:0.08em;padding-right:12px;">Share</td>\n <td style="padding-right:12px;"><a href="https://twitter.com/intent/tweet?text=${sT}&url=${sU}" target="_blank" style="color:rgba(27,27,27,0.4);text-decoration:none;font-family:${INTER};font-size:16px;font-weight:700;">X</a></td>\n <td><a href="https://www.linkedin.com/sharing/share-offsite/?url=${sU}" target="_blank" style="color:rgba(27,27,27,0.4);text-decoration:none;font-family:${INTER};font-size:14px;font-weight:700;">in</a></td>\n </tr></table>\n</div>\n <div style="padding:0 15px;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);margin:12px 0 8px;"></div></div>\n <div style="padding:0 15px;text-align:left;">\n${content}\n </div>\n <div style="padding:8px 15px 12px;text-align:left;">\n <a href="${aUrl}" style="font-family:${INTER};font-size:14px;font-weight:600;color:${AC};text-decoration:none;">Read the full story &rarr;</a>\n </div>\n</div>`;
  }).join('\n');

  // ── News Card ──
  let newsCard = '';
  if (newsletter.links?.news?.length) {
    const newsItems = newsletter.links.news.map(item => {
      const rest = item.rest ? (item.rest.startsWith(' ') || item.rest.startsWith(',') ? item.rest : ` ${item.rest}`) : '';
      const prefix = (item as any).prefix ? `${(item as any).prefix} ` : '';
      return ` <p style="font-family:${INTER};font-size:16px;line-height:1.5;color:#2D2D2D;padding:4px 0 4px 24px;margin:0;"><span style="color:${AC};font-weight:700;">+</span>&nbsp;${prefix}<a style="color:${AC};text-decoration:none;" href="${item.url}" target="_blank">${item.link_text.replace(/'/g, '&#x27;')}</a>${rest.replace(/'/g, '&#x27;')}</p>`;
    }).join('\n');
    newsCard = `<div style="border:1px solid #CDCDCD;border-radius:10px;margin:20px 0;padding:0 0 15px;overflow:hidden;">\n <div style="padding:0;text-align:center;"><img src="${SITE}/thumbnails/news-header.png" alt="In Other News" width="100%" style="display:block;width:100%;height:auto;" /></div>\n <div style="padding:10px 15px 0;"><p style="font-family:${INTER};color:${AC};font-size:16px;margin:0;">EVERYTHING ELSE IN AI</p></div>\n <div style="padding:4px 15px 0;"><div style="font-family:${TIMES};font-size:30px;line-height:1.2;color:#2A2A2A;margin:0;letter-spacing:-0.05em;">What else happened today?</div></div>\n <div style="padding:0 15px;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);margin:12px 0 8px;"></div></div>\n <div style="padding:0 15px;text-align:left;">\n${newsItems}\n </div>\n</div>`;
  }

  // ── Tools Card ──
  let toolsCard = '';
  if (newsletter.links?.tools?.length) {
    const toolItems = newsletter.links.tools.map(item => {
      const sponsored = (item.desc || '').includes('(sponsored)') ? ' <span style="color:#999;font-style:italic;">(sponsored)</span>' : '';
      const desc = (item.desc || '').replace(/\*?\(sponsored\)\*?:?\s*/, '');
      return ` <p style="font-family:${INTER};font-size:16px;line-height:1.5;color:#2D2D2D;padding:4px 0 4px 24px;margin:0;"><span style="color:${AC};font-weight:700;">+</span>&nbsp;<a style="color:${AC};text-decoration:none;" href="${item.url}" target="_blank">${item.name}</a>${sponsored}${desc ? ': ' + desc.replace(/'/g, '&#x27;') : ''}</p>`;
    }).join('\n');
    toolsCard = `<div style="border:1px solid #CDCDCD;border-radius:10px;margin:20px 0;padding:0 0 15px;overflow:hidden;">\n <div style="padding:0;text-align:center;"><img src="${SITE}/thumbnails/tools-header.png" alt="AI Tools" width="100%" style="display:block;width:100%;height:auto;" /></div>\n <div style="padding:10px 15px 0;"><p style="font-family:${INTER};color:${AC};font-size:16px;margin:0;">OTHER TOOLS</p></div>\n <div style="padding:4px 15px 0;"><div style="font-family:${TIMES};font-size:30px;line-height:1.2;color:#2A2A2A;margin:0;letter-spacing:-0.05em;">What our editors are paying attention to today</div></div>\n <div style="padding:0 15px;"><div style="border-bottom:1px solid rgba(27,27,27,0.1);margin:12px 0 8px;"></div></div>\n <div style="padding:0 15px;text-align:left;">\n${toolItems}\n </div>\n</div>`;
  }

  // ── Sign-off + Footer ──
  const so = newsletter.sign_off || "That's the Catalyst for this issue. If you know a company doing something interesting with AI that nobody's covering, reply and tell us about it.";
  const wr = newsletter.writers || 'Jason Chen, Advait Prakash, Andrew Hales, and the Thorium Valley crew.';
  const signOffHtml = `<div style="padding:20px 15px 10px;border-top:1px solid #CDCDCD;">\n <p style="font-family:${INTER};font-size:16px;line-height:1.5;color:#2D2D2D;margin:0;">${so.replace(/'/g, '&#x27;')}</p>\n <p style="font-family:${INTER};font-size:14px;color:#666;font-style:italic;margin:10px 0 0;">Written by ${wr}</p>\n</div>`;
  const footer = `<div style="padding:15px 15px;text-align:center;">\n <p style="font-family:${INTER};font-size:12px;line-height:16px;color:#2D2D2D;margin:0;padding:4px 0;">That's all for today's Catalyst. See you next time.</p>\n</div>`;

  // ── Assemble ──
  const fullHtml = `<div style="max-width:780px;margin:0 auto;padding:0;background-color:#FFFFFF;font-family:${INTER};color:#2D2D2D;font-size:16px;line-height:1.5;">\n${bannerHtml}\n${tocHeader}\n${tocItems}\n${secToc}\n${introHtml}\n${pollHtml}\n${articleCards}\n${newsCard}\n${toolsCard}\n${signOffHtml}\n${footer}\n</div>`;

  return { html: fullHtml, title: newsletter.toc?.[0] || newsletter.title };
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
