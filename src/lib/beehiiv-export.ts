/**
 * Beehiiv HTML Export Engine
 *
 * Generates self-contained HTML from the newsletter/article databases.
 * Output is designed to be pasted directly into Beehiiv's HTML editor.
 *
 * OPTIMIZED FOR GMAIL:
 * - Uses embedded <style> block + classes instead of inline styles
 *   (saves 50-70% vs inline styles on every element)
 * - Minifies output HTML (strips whitespace/newlines, saves ~20-30%)
 * - Target: keep total HTML under 80KB to avoid Gmail's 102KB clipping
 *
 * Rules:
 * - ALL URLs must be absolute (https://thoriumvalley.com/...)
 * - NO Next.js components (<Image>, <Link>) — plain HTML only
 */

import { getNewsletterBySlug, getNewsletters } from './newsletters';
import { getArticleBySlug, getArticles, type Article } from './articles';

// ── Design Tokens ──
const SERIF = "'Times New Roman MT Std','Times New Roman',Georgia,serif";
const SANS = "-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text',system-ui,sans-serif";
const ACCENT = '#5170ff';
const TEXT = '#2D2D2D';
const HEADING = '#2A2A2A';
const BORDER = '#CDCDCD';
const BASE_URL = 'https://www.thoriumvalley.com';

// ── Embedded CSS (one block instead of inline on every element) ──
const EMAIL_CSS = `
.tv-wrap{max-width:780px;margin:0 auto;padding:0;background:#fff;font-family:${SANS};color:${TEXT};font-size:16px;line-height:1.5;-webkit-font-smoothing:antialiased}
.tv-p{font-family:${SANS};font-size:16px;line-height:1.5;color:${TEXT};padding:10px 0;margin:0;font-weight:500}
.tv-a{color:${ACCENT};text-decoration:none}
.tv-b{font-weight:700;color:${TEXT}}
.tv-em{font-style:italic}
.tv-h1{font-family:${SERIF};font-weight:500;font-size:30px;line-height:1.2;color:${HEADING};margin:0;padding:0;letter-spacing:-0.05em}
.tv-h2{font-family:${SERIF};font-weight:500;font-size:24px;line-height:1.25;color:${HEADING};padding:10px 0 4px;margin:0}
.tv-h3{font-family:${SERIF};font-weight:500;font-size:20px;line-height:1.25;color:${HEADING};padding:10px 0 4px;margin:0}
.tv-bq{border-left:3px solid ${ACCENT};margin:10px 0;padding:4px 15px;color:rgba(45,45,45,0.8)}
.tv-ul{font-family:${SANS};margin:0;padding:0 0 0 20px;color:${TEXT};line-height:1.5;list-style:none;font-size:16px;font-weight:500}
.tv-li{margin:10px 0 0 0;padding:0 0 0 24px;font-size:16px;line-height:1.5;position:relative}
.tv-li-mark{color:${ACCENT};font-weight:700;font-size:16px;position:absolute;left:0}
.tv-ol{font-family:${SANS};margin:0 0 0 25px;padding:0;color:${TEXT};line-height:1.5;font-size:16px;font-weight:500}
.tv-cat{font-family:${SANS};color:${ACCENT};font-size:16px;font-weight:500;line-height:1.5;padding:10px 0;margin:0}
.tv-card{border:1px solid ${BORDER};border-radius:10px;margin:20px 0;padding:0;overflow:hidden}
.tv-toc-h{font-family:${SANS};font-weight:700;font-size:16px;color:${TEXT};padding:10px 0 6px;margin:0}
.tv-toc-item{font-family:${SERIF};font-weight:500;font-size:26px;line-height:1.3;color:${HEADING};padding:2px 0;margin:0;letter-spacing:-0.05em}
.tv-toc-num{color:${ACCENT}}
.tv-intro{font-family:${SANS};font-weight:500;color:${TEXT};font-size:16px;line-height:1.6;padding:12px 0;margin:0}
.tv-pad{padding:0 15px}
.tv-signoff{font-family:${SANS};font-size:16px;line-height:1.5;color:${TEXT};padding:20px 0 10px;margin:0}
.tv-writers{font-family:${SANS};font-size:14px;color:#666;font-style:italic;padding:0 0 10px;margin:0}
.tv-footer{font-family:${SANS};font-size:12px;line-height:16px;color:${TEXT};margin:0;padding:4px 0}
.tv-img{display:block;width:100%;height:auto}
`;

// ── URL Helper ──
function abs(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

/**
 * Process body HTML: absolutize URLs and replace tags with class-based versions
 */
function processBodyHtml(html: string): string {
  let out = html;

  // Absolutize href and src attributes
  out = out.replace(/(href|src)="(\/[^"]*?)"/g, (_, attr, path) => `${attr}="${abs(path)}"`);

  // Replace tags with class-based versions
  out = out.replace(/<p>/g, '<p class="tv-p">');
  out = out.replace(/<p\s+style="[^"]*"/g, '<p class="tv-p"');

  out = out.replace(/<a /g, '<a class="tv-a" ');

  out = out.replace(/<strong>/g, '<strong class="tv-b">');
  out = out.replace(/<em>/g, '<em class="tv-em">');

  out = out.replace(/<blockquote>/g, '<blockquote class="tv-bq">');

  out = out.replace(/<h2>/g, '<h2 class="tv-h2">');
  out = out.replace(/<h3>/g, '<h3 class="tv-h3">');

  out = out.replace(/<ul>/g, '<ul class="tv-ul">');
  out = out.replace(/<li>/g, '<li class="tv-li"><span class="tv-li-mark">+</span>');

  out = out.replace(/<ol>/g, '<ol class="tv-ol">');

  // Replace "Our Valley View" heading with branded image
  const vvImg = `<div style="padding:16px 0 4px"><img src="${BASE_URL}/thumbnails/valley-view-header.png" alt="Our Valley View" class="tv-img" style="max-width:200px"></div>`;
  out = out.replace(/<p[^>]*><strong[^>]*>Our Valley View<\/strong><\/p>/gi, vvImg);

  return out;
}

/**
 * Minify HTML: strip unnecessary whitespace, newlines, and spaces between tags
 */
function minify(html: string): string {
  return html
    .replace(/\n/g, '')           // remove newlines
    .replace(/\r/g, '')           // remove carriage returns
    .replace(/\t/g, '')           // remove tabs
    .replace(/\s{2,}/g, ' ')     // collapse multiple spaces
    .replace(/>\s+</g, '><')     // remove space between tags
    .trim();
}

// ── Newsletter Export ──

export function exportNewsletterForBeehiiv(slug: string): { html: string; title: string } | null {
  const newsletter = getNewsletterBySlug(slug);
  if (!newsletter) return null;

  const articles = newsletter.article_slugs
    .map((s) => getArticleBySlug(s))
    .filter(Boolean) as Article[];

  // Banner
  const bannerHtml = newsletter.banner_image_url
    ? `<div class="tv-pad" style="padding-bottom:24px;text-align:center"><img src="${abs(newsletter.banner_image_url)}" alt="${newsletter.date} banner" width="780" class="tv-img"></div>`
    : '';

  // Intro
  const introText = newsletter.intro.startsWith('Welcome back.')
    ? `<strong class="tv-b">Welcome back.</strong>${newsletter.intro.slice('Welcome back.'.length)}`
    : newsletter.intro;

  const introHtml = `<div class="tv-pad" style="text-align:left;word-break:break-word"><p class="tv-intro">${introText}</p></div>`;

  // TOC
  const tocItems = newsletter.toc.map((item, i) =>
    `<h2 class="tv-toc-item"><span class="tv-toc-num">${i + 1}.</span>&nbsp;${item}</h2>`
  ).join('');

  const tocHtml = `<div style="padding:24px 15px 0"><p class="tv-toc-h">IN TODAY&#039;S NEWSLETTER</p>${tocItems}</div>`;

  // Article cards
  const articleCardsHtml = articles.map((article) => {
    const bodyContent = (article as any).newsletter_content || article.content || '<p>Content not available.</p>';
    const processedBody = processBodyHtml(bodyContent);
    const articleUrl = `${BASE_URL}/articles/${article.slug}?utm_source=beehiiv&utm_medium=newsletter&utm_campaign=${slug}`;

    return `<div class="tv-card">` +
      `<div style="padding:10px 15px 0;text-align:left"><p class="tv-cat">${article.category.toUpperCase()}</p></div>` +
      `<div class="tv-pad" style="text-align:left"><h1 class="tv-h1">${article.title}</h1></div>` +
      (article.thumbnail_url
        ? `<div style="padding:12px 25px;text-align:center"><a href="${articleUrl}" style="display:block;text-decoration:none"><img src="${abs(article.thumbnail_url)}" alt="${article.title}" width="604" class="tv-img"></a></div>`
        : '') +
      `<div class="tv-pad" style="text-align:left;word-break:break-word">${processedBody}</div>` +
      `</div>`;
  }).join('');

  // Sign-off
  const signOffHtml = `<div class="tv-pad" style="border-top:1px solid ${BORDER};margin-top:10px">` +
    `<p class="tv-signoff">${newsletter.sign_off}</p>` +
    `<p class="tv-writers">Written by ${newsletter.writers}</p></div>`;

  // Footer
  const footerHtml = `<div class="tv-pad" style="text-align:center"><p class="tv-footer">That's all for today's Thorium Valley. See you tomorrow.</p></div>`;

  // Assemble with <style> block
  const fullHtml = `<style>${minify(EMAIL_CSS)}</style>` +
    `<div class="tv-wrap">` +
    bannerHtml + introHtml + tocHtml + articleCardsHtml + signOffHtml + footerHtml +
    `</div>`;

  return { html: minify(fullHtml), title: newsletter.title };
}

// ── Single Article Export ──

export function exportArticleForBeehiiv(slug: string): { html: string; title: string } | null {
  const article = getArticleBySlug(slug);
  if (!article) return null;

  const bodyContent = article.content || '<p>Content not available.</p>';
  const processedBody = processBodyHtml(bodyContent);
  const articleUrl = `${BASE_URL}/articles/${article.slug}`;

  const formattedDate = new Date(article.published_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const fullHtml = `<style>${minify(EMAIL_CSS)}</style>` +
    `<div class="tv-wrap">` +
    (article.category ? `<p style="font-family:${SANS};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${ACCENT};margin:0;padding:0 0 12px">${article.category}</p>` : '') +
    `<h1 class="tv-h1" style="font-weight:700;color:#1b1b1b;font-size:42px;line-height:1.1;padding:0 0 12px"><a href="${articleUrl}" class="tv-a" style="color:inherit">${article.title}</a></h1>` +
    `<p style="font-family:${SANS};font-size:14px;font-weight:500;color:rgba(27,27,27,0.55);margin:0;padding:0 0 24px">${formattedDate}</p>` +
    (article.thumbnail_url
      ? `<div style="margin:0 0 32px;overflow:hidden"><a href="${articleUrl}" style="display:block;text-decoration:none"><img src="${abs(article.thumbnail_url)}" alt="${article.title}" width="780" class="tv-img"></a></div>`
      : '') +
    `<div style="word-break:break-word">${processedBody}</div>` +
    `</div>`;

  return { html: minify(fullHtml), title: article.title };
}
// ── Welcome Email Export ──
// Uses fully inline styles (no <style> block) — same format as NW3 FINAL_HTML

export function exportWelcomeForBeehiiv(): { html: string; title: string } {
  const { data: newsletters } = getNewsletters({ limit: 1, sort: 'newest' });
  const latestNL = newsletters[0];

  const { data: allArticles } = getArticles({ limit: 20, sort: 'newest' });
  const nlSlugs = new Set(latestNL?.article_slugs || []);
  const recentArticles = allArticles
    .filter((a: any) => !nlSlugs.has(a.slug))
    .slice(0, 3);

  const firstNLArticle = latestNL?.article_slugs?.[0]
    ? allArticles.find((a: any) => a.slug === latestNL.article_slugs[0])
    : null;
  const nlTitle = firstNLArticle?.title || latestNL?.toc?.[0] || 'Our latest newsletter';
  const nlUrl = `${BASE_URL}/newsletter/${latestNL?.slug}`;

  // Inline style constants (matching NW3 FINAL_HTML exactly)
  const P = `font-family:${SANS};font-size:16px;line-height:1.5;color:${TEXT};padding:10px 0;margin:0;font-weight:500;`;
  const LI = `font-family:${SANS};font-size:16px;line-height:1.5;color:${TEXT};padding:4px 0 4px 24px;margin:0;font-weight:500;`;
  const PLUS = `color:${ACCENT};font-weight:700;`;
  const LINK = `color:${ACCENT};text-decoration:none;`;
  const IMG = `display:block;width:100%;height:auto;`;

  const fullHtml =
    // Wrap
    `<div style="max-width:780px;margin:0 auto;padding:0;background-color:#FFFFFF;font-family:${SANS};color:${TEXT};font-size:16px;line-height:1.5;-webkit-font-smoothing:antialiased;">` +
    `<div style="border:1px solid ${BORDER};border-radius:10px;overflow:hidden;">` +

    // Thorium banner
    `<div style="padding:0 0 24px;text-align:center;">` +
    `<img src="${BASE_URL}/thumbnails/welcome-banner-tvlogo.png" alt="Thorium Valley" width="780" style="${IMG}" />` +
    `</div>` +

    // Intro paragraphs
    `<div style="padding:0 15px;text-align:left;word-break:break-word;">` +
    `<p style="${P}">Hey, I'm <strong style="font-weight:700;">Jason</strong>, Co-Founder here at Thorium Valley. Welcome to the <strong style="font-weight:700;">Thorium Valley Newsletter!</strong></p>` +
    `<p style="${P}">AI moves <em>unreasonably</em> fast. Half of what happens on Monday is irrelevant by Thursday, and most coverage just moves on to the next thing.</p>` +
    `<p style="${P}"><strong style="font-weight:700;">Every weekday morning</strong>, we'll get you caught up on what's actually changing, what it means for the people making decisions around AI, and what you can probably ignore.</p>` +
    `</div>` +

    // Why Thorium Valley banner
    `<div style="padding:24px 0 0;text-align:center;">` +
    `<img src="${BASE_URL}/thumbnails/welcome-banner-whytv.png" alt="Why Thorium Valley" width="780" style="${IMG}" />` +
    `</div>` +

    `<div style="padding:0 15px;text-align:left;word-break:break-word;">` +
    `<p style="${P}">Why "Thorium Valley." Silicon Valley got its name from silicon. AI's next bottleneck is probably energy, so we went with thorium. <em>Mostly it just sounded good.</em></p>` +
    `</div>` +

    // Get Started banner
    `<div style="padding:24px 0;text-align:center;">` +
    `<img src="${BASE_URL}/thumbnails/welcome-banner-getstarted.png" alt="Get Started" width="780" style="${IMG}" />` +
    `</div>` +

    // Email filter callout — plain text, no border
    `<div style="padding:0 15px;text-align:left;word-break:break-word;">` +
    `<p style="${P}"><em>Before anything else, help us get past your email filters:</em></p>` +
    `<p style="${P}">Reply to this email with "hey" or literally anything. That one reply tells your inbox we belong there.</p>` +
    `<p style="${P}">If you're seeing this in Promotions or Spam, just move it to Primary so tomorrow's edition lands where it should.</p>` +
    `</div>` +

    // Start Here banner
    `<div style="padding:24px 0 0;text-align:center;">` +
    `<img src="${BASE_URL}/thumbnails/welcome-banner-starthere.png" alt="Start Here" width="780" style="${IMG}" />` +
    `</div>` +

    // Start here links
    `<div style="padding:0 15px;text-align:left;word-break:break-word;">` +
    `<p style="${P}"><strong style="font-weight:700;">Start here:</strong></p>` +
    `<p style="${P}">Our most recent newsletter:</p>` +
    `<p style="${LI}"><span style="${PLUS}">+</span>&nbsp;<a style="${LINK}" href="${nlUrl}">${nlTitle}</a></p>` +
    `<p style="${P}">A few pieces worth your time:</p>` +
    recentArticles.map((a: any) =>
      `<p style="${LI}"><span style="${PLUS}">+</span>&nbsp;<a style="${LINK}" href="${BASE_URL}/articles/${a.slug}">${a.title}</a></p>`
    ).join('') +
    `</div>` +

    // Thank You banner
    `<div style="padding:24px 0;text-align:center;">` +
    `<img src="${BASE_URL}/thumbnails/welcome-banner-thankyou.png" alt="Thank You" width="780" style="${IMG}" />` +
    `</div>` +

    // Closing
    `<div style="padding:0 15px;">` +
    `<p style="${P}"><strong style="font-weight:700;">One last thing.</strong></p>` +
    `<p style="${P}">Thanks for subscribing. <strong style="font-weight:700;">We don't take that for granted.</strong></p>` +
    `<p style="${P}">You'll notice we include our own take in every article. We always make it clear what's reporting and what's us thinking out loud, and we try to earn both. We'd rather be upfront about what we think than pretend we showed up without a perspective.</p>` +
    `<p style="${P}">Fair warning, we'd rather make you <em>rethink</em> something than just confirm what you already believe. That might be annoying sometimes. We think it's worth it.</p>` +
    `<p style="${P}">Glad you're here. See you tomorrow morning.</p>` +
    `<p style="${P}">Jason Chen</p>` +
    `</div>` +

    `</div>` +
    `</div>`;

  return { html: minify(fullHtml), title: 'Welcome to Thorium Valley' };
}
