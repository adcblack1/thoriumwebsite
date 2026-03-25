/**
 * Thorium Valley Newsletter HTML Template Engine
 *
 * Generates email-safe HTML modeled on The Deep View's layout,
 * using Thorium Valley's brand colors and fonts.
 */

// ── Design Tokens ──
const TV = {
  accent: '#5170ff',
  text: '#1b1b1b',
  textSecondary: '#2D2D2D',
  headingColor: '#1b1b1b',
  bg: '#FFFFFF',
  border: '#CDCDCD',
  cta: '#5170ff',
  ctaText: '#FFFFFF',
  headingFont: "'Times New Roman MT Std','Times New Roman',Georgia,serif",
  bodyFont: "-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif",
  width: 670,
};

// ── Types ──
export interface NewsletterArticle {
  category_label: string;
  title_plain: string;
  title_italic: string;
  hero_image_url: string;
  body_html: string;
  article_url?: string;
  author_name?: string;
}

export interface NewsletterLink {
  text: string;
  link_text: string;
  url: string;
}

export interface ProductLink {
  name: string;
  description: string;
  url: string;
}

export interface JobLink {
  company: string;
  role: string;
  url: string;
}

export interface SponsorBlock {
  name: string;
  label: string;
  title: string;
  hero_image_url: string;
  body_html: string;
  cta_text: string;
  cta_url: string;
}

export interface NewsletterEdition {
  subject_emoji?: string;
  subject_line: string;
  date: string;
  intro: string;
  editor?: string;
  banner_image_url?: string;
  articles: NewsletterArticle[];
  links?: {
    news?: NewsletterLink[];
    products?: ProductLink[];
    jobs?: JobLink[];
  };
  sponsor?: SponsorBlock;
}

// ── Template Builders ──

function wrapCard(innerHtml: string): string {
  return `
<tr><td>
  <table role="none" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr><td height="8" style="line-height:1px;font-size:1px;height:8px;">&nbsp;</td></tr>
    <tr><td style="background-color:transparent;border:1px solid ${TV.border};border-radius:10px;padding:0;">
      <table role="none" width="100%" border="0" cellspacing="0" cellpadding="0">
        ${innerHtml}
      </table>
    </td></tr>
    <tr><td height="8" style="line-height:1px;font-size:1px;height:8px;">&nbsp;</td></tr>
  </table>
</td></tr>`;
}

function categoryLabel(label: string): string {
  return `
<tr><td align="left" style="padding:10px 15px 0;text-align:left;word-break:break-word;">
  <p style="font-family:${TV.bodyFont};font-weight:400;color:${TV.accent};font-size:14px;line-height:1.5;padding:6px 0;margin:0;">
    ${label}
  </p>
</td></tr>`;
}

function articleTitle(plain: string, italic: string): string {
  return `
<tr><td align="left" style="padding:0 15px;text-align:left;">
  <h1 style="font-family:${TV.headingFont};font-weight:700;font-size:26px;color:${TV.headingColor};line-height:1.25;margin:0;padding:4px 0;">
    ${plain ? `<span>${plain}</span>` : ''}${italic ? `<span style="font-style:italic;">${italic}</span>` : ''}
  </h1>
</td></tr>`;
}

function heroImage(url: string, linkUrl?: string): string {
  const img = `<img src="${url}" alt="" height="auto" width="100%" style="display:block;width:100%;border-radius:4px;" border="0"/>`;
  const content = linkUrl
    ? `<a href="${linkUrl}" style="text-decoration:none;" target="_blank">${img}</a>`
    : img;
  return `
<tr><td align="center" style="padding:8px 15px;">
  <table role="none" border="0" cellspacing="0" cellpadding="0" style="margin:0 auto;">
    <tr><td align="center" style="width:100%;">${content}</td></tr>
  </table>
</td></tr>`;
}

function bodyBlock(html: string): string {
  return `
<tr><td align="left" style="padding:0 15px;text-align:left;word-break:break-word;">
  <div style="font-family:${TV.bodyFont};font-weight:400;color:${TV.textSecondary};font-size:16px;line-height:1.6;">
    ${html}
  </div>
</td></tr>`;
}

function authorByline(name: string): string {
  return `
<tr><td align="left" style="padding:8px 15px;">
  <p style="font-family:${TV.bodyFont};font-size:13px;color:${TV.textSecondary};margin:0;font-style:italic;">— ${name}</p>
</td></tr>`;
}

function dividerLine(): string {
  return `
<tr><td style="padding:6px 15px;">
  <div style="height:1px;background:linear-gradient(90deg,transparent,${TV.accent},transparent);"></div>
</td></tr>`;
}

function buildArticleCard(article: NewsletterArticle): string {
  const inner = [
    categoryLabel(article.category_label),
    articleTitle(article.title_plain, article.title_italic),
    article.hero_image_url ? heroImage(article.hero_image_url, article.article_url) : '',
    bodyBlock(article.body_html),
    dividerLine(),
    article.author_name ? authorByline(article.author_name) : '',
  ].join('');
  return wrapCard(inner);
}

function buildSponsorCard(sponsor: SponsorBlock): string {
  const inner = [
    categoryLabel(sponsor.label),
    articleTitle(sponsor.title, ''),
    sponsor.hero_image_url ? heroImage(sponsor.hero_image_url, sponsor.cta_url) : '',
    bodyBlock(sponsor.body_html),
    `<tr><td align="center" style="padding:8px 15px 16px;">
      <table role="none" border="0" cellspacing="0" cellpadding="0">
        <tr><td style="border-radius:8px;background-color:${TV.cta};padding:12px 28px;">
          <a href="${sponsor.cta_url}" style="font-family:${TV.bodyFont};font-size:14px;font-weight:700;color:${TV.ctaText};text-decoration:none;display:block;" target="_blank">
            ${sponsor.cta_text}
          </a>
        </td></tr>
      </table>
    </td></tr>`,
  ].join('');
  return wrapCard(inner);
}

function buildTOC(articles: NewsletterArticle[]): string {
  const items = articles.map((a, i) =>
    `<tr><td align="left" style="padding:2px 15px;text-align:left;">
      <h2 style="font-family:${TV.headingFont};font-weight:400;font-size:22px;color:${TV.headingColor};line-height:1.3;margin:0;padding:2px 0;">
        <span style="color:${TV.accent};">${i + 1}.</span> ${a.title_plain}${a.title_italic}
      </h2>
    </td></tr>`
  ).join('');

  return `
<tr><td align="left" style="padding:4px 15px;text-align:left;word-break:break-word;">
  <p style="font-family:${TV.bodyFont};font-weight:700;font-size:14px;color:${TV.textSecondary};margin:0;padding:10px 0 2px;">IN TODAY'S NEWSLETTER</p>
</td></tr>
${items}`;
}

function buildLinksCard(links: NewsletterEdition['links']): string {
  if (!links) return '';

  const parts: string[] = [];

  // News links
  if (links.news && links.news.length > 0) {
    const items = links.news.map(l =>
      `<li style="font-family:${TV.bodyFont};margin:8px 0 0 0;padding:0;color:${TV.textSecondary};font-size:15px;line-height:1.6;">
        ${l.text} <a href="${l.url}" style="color:${TV.accent};text-decoration:underline;" target="_blank">${l.link_text}</a>
      </li>`
    ).join('');
    parts.push(`
      <tr><td style="padding:10px 15px 0;">
        <p style="font-family:${TV.bodyFont};font-weight:700;font-size:13px;color:${TV.accent};margin:0;padding:0;">IN OTHER NEWS</p>
      </td></tr>
      <tr><td style="padding:4px 30px 12px;">
        <ul style="font-family:${TV.bodyFont};margin:0 0 0 20px;padding:0;list-style-type:disc;font-size:15px;color:${TV.textSecondary};">
          ${items}
        </ul>
      </td></tr>`);
  }

  // Product launches
  if (links.products && links.products.length > 0) {
    const items = links.products.map(p =>
      `<li style="font-family:${TV.bodyFont};margin:8px 0 0 0;padding:0;color:${TV.textSecondary};font-size:15px;line-height:1.6;">
        <a href="${p.url}" style="color:${TV.accent};text-decoration:underline;font-weight:700;" target="_blank">${p.name}</a> ${p.description}
      </li>`
    ).join('');
    parts.push(`
      <tr><td style="padding:10px 15px 0;">
        <p style="font-family:${TV.bodyFont};font-weight:700;font-size:13px;color:${TV.accent};margin:0;padding:0;">PRODUCT LAUNCHES</p>
      </td></tr>
      <tr><td style="padding:4px 30px 12px;">
        <ul style="font-family:${TV.bodyFont};margin:0 0 0 20px;padding:0;list-style-type:disc;font-size:15px;color:${TV.textSecondary};">
          ${items}
        </ul>
      </td></tr>`);
  }

  // Job listings
  if (links.jobs && links.jobs.length > 0) {
    const items = links.jobs.map(j =>
      `<li style="font-family:${TV.bodyFont};margin:8px 0 0 0;padding:0;color:${TV.textSecondary};font-size:15px;line-height:1.6;">
        <a href="${j.url}" style="color:${TV.accent};text-decoration:underline;font-weight:700;" target="_blank">${j.company}</a>: ${j.role}
      </li>`
    ).join('');
    parts.push(`
      <tr><td style="padding:10px 15px 0;">
        <p style="font-family:${TV.bodyFont};font-weight:700;font-size:13px;color:${TV.accent};margin:0;padding:0;">JOBS</p>
      </td></tr>
      <tr><td style="padding:4px 30px 12px;">
        <ul style="font-family:${TV.bodyFont};margin:0 0 0 20px;padding:0;list-style-type:disc;font-size:15px;color:${TV.textSecondary};">
          ${items}
        </ul>
      </td></tr>`);
  }

  if (parts.length === 0) return '';
  return wrapCard([categoryLabel('LINKS'), ...parts].join(''));
}

function buildFooter(): string {
  return `
<tr><td style="padding:20px 15px 10px;text-align:center;">
  <p style="font-family:${TV.bodyFont};font-size:13px;color:${TV.textSecondary};margin:0;padding:0;">
    That's all for today's Thorium Valley. See you tomorrow.
  </p>
</td></tr>
<tr><td style="padding:10px 15px;text-align:center;">
  <table role="none" border="0" cellspacing="0" cellpadding="0" style="margin:0 auto;">
    <tr>
      <td style="border-radius:8px;background-color:${TV.cta};padding:12px 28px;">
        <a href="https://thoriumvalley.com/subscribe" style="font-family:${TV.bodyFont};font-size:14px;font-weight:700;color:${TV.ctaText};text-decoration:none;display:block;" target="_blank">
          Subscribe to Thorium Valley
        </a>
      </td>
    </tr>
  </table>
</td></tr>
<tr><td style="padding:16px 15px 8px;text-align:center;">
  <div style="height:1px;background:linear-gradient(90deg,transparent,${TV.accent},transparent);"></div>
</td></tr>
<tr><td style="padding:8px 15px 20px;text-align:center;">
  <p style="font-family:${TV.bodyFont};font-size:11px;color:${TV.textSecondary};opacity:0.6;margin:0;padding:0;">
    © ${new Date().getFullYear()} Thorium Valley. All rights reserved.<br/>
    <a href="https://thoriumvalley.com" style="color:${TV.accent};text-decoration:underline;">thoriumvalley.com</a>
  </p>
</td></tr>`;
}

// ── Main Generator ──

export function generateNewsletterHTML(edition: NewsletterEdition): string {
  const subject = `${edition.subject_emoji ? edition.subject_emoji + ' ' : ''}${edition.subject_line}`;

  // Build article cards with sponsor inserted after first article
  const articleCards: string[] = [];
  edition.articles.forEach((article, i) => {
    articleCards.push(buildArticleCard(article));
    if (i === 0 && edition.sponsor) {
      articleCards.push(buildSponsorCard(edition.sponsor));
    }
  });

  const linksCard = buildLinksCard(edition.links);

  const emailBody = `
<!-- HEADER -->
<tr><td style="padding:15px 15px 0;">
  <table role="none" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr><td align="right" style="font-family:${TV.bodyFont};font-size:12px;color:${TV.textSecondary};padding-bottom:12px;">
      ${edition.date}
    </td></tr>
  </table>
</td></tr>

${edition.banner_image_url ? `
<!-- BANNER -->
<tr><td align="center" style="padding:0 15px 8px;">
  <img src="${edition.banner_image_url}" alt="Thorium Valley" height="auto" width="100%" style="display:block;width:100%;" border="0"/>
</td></tr>` : `
<!-- LOGO -->
<tr><td align="center" style="padding:8px 15px 16px;">
  <h1 style="font-family:${TV.headingFont};font-size:28px;font-weight:700;color:${TV.headingColor};margin:0;letter-spacing:-0.05em;">THORIUM VALLEY</h1>
</td></tr>`}

<!-- INTRO -->
<tr><td align="left" style="padding:0 15px;text-align:left;word-break:break-word;">
  <p style="font-family:${TV.bodyFont};font-weight:400;color:${TV.textSecondary};font-size:16px;line-height:1.6;padding:8px 0;margin:0;">
    <strong>Welcome back.</strong> ${edition.intro}<br/>
    <em>—</em> ${edition.editor || 'Thorium Valley'}
  </p>
</td></tr>

<!-- TOC -->
${buildTOC(edition.articles)}

<!-- ARTICLES -->
${articleCards.join('\n')}

<!-- LINKS -->
${linksCard}

<!-- FOOTER -->
${buildFooter()}
`;

  // Wrap in full email HTML shell
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" style="font-size:16px;">
<head>
  <meta charset="utf-8"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="color-scheme" content="light"/>
  <title>${subject}</title>
  <style>
    :root { color-scheme: light; }
    body { margin:0; padding:0; min-width:100%!important; -webkit-font-smoothing:antialiased!important; background-color:${TV.bg}; }
    img { border:0; outline:none; }
    table { mso-table-lspace:0; mso-table-rspace:0; }
    td, a, span { mso-line-height-rule:exactly; }
    a { color:${TV.accent}; text-decoration:underline; }
    p a { color:${TV.accent}!important; text-decoration:underline; }
    h1, h2, h3 { margin:0; padding:0; }
    h1 { font-family:${TV.headingFont}; font-weight:700; font-size:26px; color:${TV.headingColor}; line-height:1.25; }
    h2 { font-family:${TV.headingFont}; font-weight:400; font-size:22px; color:${TV.headingColor}; line-height:1.25; }
    p { font-family:${TV.bodyFont}; font-weight:400; color:${TV.textSecondary}; font-size:16px; line-height:1.6; padding:8px 0; margin:0; }
    ul { font-family:${TV.bodyFont}; margin:0 0 0 20px; padding:0; color:${TV.textSecondary}; line-height:24px; list-style-type:disc; font-size:16px; }
    ul > li { margin:8px 0 0 0; padding:0; }
    ol { font-family:${TV.bodyFont}; margin:0 0 0 20px; padding:0; color:${TV.textSecondary}; line-height:24px; font-size:16px; }
    ol > li { margin:8px 0 0 0; padding:0; }
    blockquote { border-left:3px solid ${TV.accent}; margin:12px 0; padding:8px 16px; }
    blockquote p { color:${TV.textSecondary}; font-style:italic; }
    @media only screen and (max-width:667px) {
      .email-container { width:100%!important; }
      .responsive-img img { width:100%!important; height:auto!important; }
      .mobile-pad { padding-left:8px!important; padding-right:8px!important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${TV.bg};">
  <table role="none" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:${TV.bg};">
    <tr><td align="center">
      <table role="none" width="${TV.width}" border="0" cellspacing="0" cellpadding="0" class="email-container" style="width:${TV.width}px;max-width:${TV.width}px;table-layout:fixed;">
        <tr><td class="mobile-pad" align="center" style="padding:10px;">
          <table role="none" width="100%" border="0" cellspacing="0" cellpadding="0" style="border:1px solid ${TV.bg};border-radius:10px;background-color:${TV.bg};">
            ${emailBody}
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
