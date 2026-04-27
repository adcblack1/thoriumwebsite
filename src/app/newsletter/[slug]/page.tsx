import { getNewsletterBySlug } from '@/lib/newsletters';
import { getArticleBySlug } from '@/lib/articles';
import { SubscribeForm } from '@/components/subscribe-form';
import { SubscribeCTA } from '@/components/SubscribeCTA';
import { RecommendedNewsletters } from '@/components/RecommendedNewsletters';
import { FooterNew } from '@/components/footer-new';
import { Navigation } from '@/components/navigation';
import { CopyBeehiivButton } from '@/components/CopyBeehiivButton';
import { VoteButton } from '@/components/VoteButton';
import { ArticleContent } from '@/components/ArticleContent';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

/* ─── Font stacks (must match globals.css :root vars) ─── */
const SERIF = "'Times New Roman MT Std', 'Times New Roman', Georgia, serif";
const SANS = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif";
const ACCENT = '#5170ff';
const PAD = '15px';

interface NewsletterPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: NewsletterPageProps) {
  const { slug } = await params;
  const newsletter = getNewsletterBySlug(slug);
  if (!newsletter) return { title: 'Newsletter Not Found - Thorium Valley' };
  return {
    title: `${newsletter.title} - Thorium Valley`,
    description: newsletter.intro.slice(0, 160),
  };
}

export default async function NewsletterPage({ params, searchParams }: NewsletterPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const isAdmin = resolvedSearchParams?.admin === 'true';
  const newsletter = getNewsletterBySlug(slug);
  if (!newsletter) notFound();

  const pub = (newsletter as any).publication || '';
  const isCatalyst = pub === 'the-catalyst' || slug.startsWith('catalyst-');
  const isLab = pub === 'the-lab' || slug.startsWith('lab-');
  const tocBullet = isCatalyst ? '/thumbnails/catalyst-star.png' : isLab ? '/thumbnails/lab-star.png' : '/thumbnails/toc-bullet.png';

  const articles = newsletter.article_slugs
    .map((s) => getArticleBySlug(s))
    .filter(Boolean);

  const formattedDate = new Date(newsletter.published_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  /* ─── Scoped styles for dangerouslySetInnerHTML content ─── */
  const scopedCSS = `
    .nl-body p { font-family: ${SANS} !important; font-size: 16px !important; line-height: 1.5 !important; color: #2D2D2D !important; padding: 10px 0 !important; margin: 0 !important; font-weight: 500 !important; }
    .nl-body p a { color: ${ACCENT} !important; text-decoration: none !important; }
    .nl-body p strong, .nl-body p b { font-weight: inherit !important; color: #2D2D2D !important; }
    .nl-body p em, .nl-body p i { font-style: italic !important; }
    .nl-body ul { font-family: ${SANS} !important; margin: 0 !important; padding: 0 0 0 20px !important; color: #2D2D2D !important; line-height: 1.5 !important; list-style: none !important; font-size: 16px !important; font-weight: 500 !important; }
    .nl-body ul > li { margin: 10px 0 0 0 !important; padding: 0 0 0 24px !important; font-size: 16px !important; line-height: 1.5 !important; position: relative !important; }
    .nl-body ul > li::before { content: '+' !important; position: absolute !important; left: 0 !important; color: ${ACCENT} !important; font-weight: 700 !important; font-size: 16px !important; }
    .nl-body ul > li a { color: ${ACCENT} !important; text-decoration: none !important; }
    .nl-body ol { font-family: ${SANS} !important; margin: 0 0 0 25px !important; padding: 0 !important; color: #2D2D2D !important; line-height: 1.5 !important; font-size: 16px !important; font-weight: 500 !important; }
    .nl-body ol > li { margin: 10px 0 0 0 !important; padding: 0 !important; font-size: 16px !important; line-height: 1.5 !important; }
    .nl-body ol > li a { color: ${ACCENT} !important; text-decoration: none !important; }
    .nl-body h2, .nl-body h3 { font-family: ${SERIF} !important; font-weight: 500 !important; font-size: 24px !important; line-height: 1.25 !important; color: #2A2A2A !important; padding: 10px 0 4px !important; margin: 0 !important; letter-spacing: normal !important; }
    .nl-body h3 { font-size: 20px !important; }
    .nl-body blockquote { border-left: 3px solid ${ACCENT} !important; margin: 10px 0 !important; padding: 4px 15px !important; color: rgba(45,45,45,0.8) !important; }
    .nl-body a { color: ${ACCENT} !important; text-decoration: none !important; }
    .nl-body img { padding: 0 20px !important; max-width: 100% !important; height: auto !important; box-sizing: border-box !important; }
    .nl-body .section-header-img { margin-left: -15px !important; margin-right: -15px !important; width: calc(100% + 30px) !important; max-width: none !important; padding: 0 !important; height: auto !important; display: block !important; }
    .nl-body .vv-header img { padding: 0 !important; width: 100% !important; max-width: none !important; margin: 0 !important; }
    .nl-body > p:first-of-type::first-letter, .nl-body > div:first-child > p:first-of-type::first-letter { font-family: 'Times New Roman', 'Times', serif !important; font-size: 3.5em !important; float: left !important; line-height: 0.8 !important; padding-right: 8px !important; padding-top: 4px !important; color: ${ACCENT} !important; font-weight: bold !important; }
    .intro-dropcap { font-family: 'Times New Roman', 'Times', serif !important; font-size: 3.5em !important; float: left !important; line-height: 0.8 !important; padding-right: 8px !important; padding-top: 4px !important; color: ${ACCENT} !important; font-weight: bold !important; }
    @media (max-width: 780px) {
      .nl-shell-wrap { padding-left: 12px !important; padding-right: 12px !important; }
      .toc-header-img { width: 50% !important; }
      .nl-header-section { padding-top: 5.5rem !important; }
      .nl-header-title { font-size: 22px !important; }
    }
    .nl-breadcrumb-link:hover { color: #5170ff !important; }
  `;

  const breadcrumb = (
    <nav className="flex items-center justify-center gap-2 text-sm">
      <Link href="/" className="nl-breadcrumb-link transition-colors">Home</Link>
      <span>/</span>
      <Link href="/newsletter" className="nl-breadcrumb-link transition-colors">Newsletter</Link>
      <span>/</span>
      <span className="text-[#5170ff]">{newsletter.date}</span>
    </nav>
  );

  return (
    <>
      <Navigation scrollThreshold={150} heroBorder heroTheme="dark" scrolledTheme="blue" />
      {/* Simple newsletter header */}
      <section className="nl-header-section bg-white pt-40 lg:pt-48 pb-8">
        <div className="max-w-[780px] mx-auto px-6">
          <h1
            className="nl-header-title font-times font-semibold text-[#1b1b1b] mb-2"
            style={{ fontSize: '28px', letterSpacing: '-0.02em', lineHeight: 1.3 }}
          >
            {newsletter.toc?.[0] || newsletter.title}
          </h1>
          <time className="text-sm font-inter font-medium block" style={{ color: 'rgba(27,27,27,0.55)' }}>
            {formattedDate}
          </time>
          {isAdmin && (
            <div className="mt-4">
              <CopyBeehiivButton slug={slug} type="newsletter" />
            </div>
          )}
          <div className="border-b border-[#1b1b1b]/15 mt-6" />
        </div>
      </section>
      <style dangerouslySetInnerHTML={{ __html: scopedCSS }} />

      {/* ═══ NEWSLETTER SHELL — 680px desktop, full-width mobile ═══ */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media(min-width:1024px){.nl-shell-wrap{max-width:680px!important;}}
      `}} />
      <div className="nl-shell-wrap" style={{
        maxWidth: '780px',
        margin: '0 auto',
        padding: 0,
        backgroundColor: '#FFFFFF',
        fontFamily: SANS,
        color: '#2D2D2D',
        fontSize: '16px',
        lineHeight: '1.5',
        WebkitFontSmoothing: 'antialiased',
      }}>

        {/* ── BANNER IMAGE (above intro) ── */}
        {newsletter.banner_image_url && (
          <div style={{ padding: `0 25px 24px`, textAlign: 'center' }}>
            <Image
              src={newsletter.banner_image_url}
              alt={`${newsletter.date} banner`}
              width={780}
              height={440}
              style={{ display: 'block', width: '100%', height: 'auto' }}
            />
          </div>
        )}

        {/* ── TABLE OF CONTENTS (right after banner) ── */}
        <div style={{ padding: `24px ${PAD} 0` }}>
          <img src="/thumbnails/toc-header.png" alt="In Today's Edition" className="toc-header-img" style={{ display: 'block', width: '35%', height: 'auto', padding: '10px 0 6px' }} />
          {newsletter.toc.map((item, i) => (
            <h2 key={i} style={{ fontFamily: SERIF, fontWeight: 400, fontSize: '26px', lineHeight: '1.3', color: '#2A2A2A', padding: '2px 0', margin: 0, letterSpacing: '-0.05em' }}>
              <a href={`#article-${i + 1}`} style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <img src={tocBullet} alt="" style={{ width: '14px', height: '14px', flexShrink: 0, alignSelf: 'center' }} /><span>{item}</span>
              </a>
            </h2>
          ))}

          {/* Secondary TOC items */}
          <div style={{ display: 'flex', gap: '20px', padding: '14px 0 0', flexWrap: 'wrap' }}>
            {newsletter.links?.news && newsletter.links.news.length > 0 && (
              <a href="#links-section" style={{ fontFamily: SANS, fontSize: '14px', fontWeight: 500, color: 'rgba(27,27,27,0.5)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <img src={tocBullet} alt="" style={{ width: '10px', height: '10px', opacity: 0.4 }} />What else happened today?
              </a>
            )}
            {newsletter.links?.tools && newsletter.links.tools.length > 0 && (
              <a href="#tools-section" style={{ fontFamily: SANS, fontSize: '14px', fontWeight: 500, color: 'rgba(27,27,27,0.5)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <img src={tocBullet} alt="" style={{ width: '10px', height: '10px', opacity: 0.4 }} />What AI tools should I be using?
              </a>
            )}
          </div>
        </div>

        {/* ── INTRO (split into paragraphs, after TOC) ── */}
        <div style={{ borderBottom: '1px solid rgba(27,27,27,0.1)', margin: `16px ${PAD} 0` }} />
        <div className="nl-intro" style={{ padding: `20px ${PAD} 0`, textAlign: 'left', wordBreak: 'break-word' }}>
          {(() => {
            let paragraphs = newsletter.intro.split('\n\n');
            // Merge greeting-only paragraph with the next one so drop cap flows into content
            const greetOnly = /^(Good Morning Thorium Valley[,.]|Welcome back[^,.]*[,.])\s*$/;
            if (paragraphs.length > 1 && greetOnly.test(paragraphs[0])) {
              paragraphs = [paragraphs[0].trimEnd() + ' ' + paragraphs[1], ...paragraphs.slice(2)];
            }
            return paragraphs.map((paragraph, idx) => {
              if (idx === 0) {
                const greetMatch = paragraph.match(/^(Good Morning Thorium Valley[,.]|Welcome back[^,.]*[,.])/);
                return (
                  <p key={idx} style={{ fontFamily: SANS, fontWeight: 500, color: '#2D2D2D', fontSize: '16px', lineHeight: '1.6', padding: '8px 0', margin: 0 }}
                    dangerouslySetInnerHTML={{
                      __html: greetMatch
                        ? `<span class="intro-dropcap">${greetMatch[0][0]}</span>${greetMatch[0].slice(1).replace(/,$/, '.')} ${paragraph.slice(greetMatch[0].length).trimStart()}`
                        : paragraph
                    }}
                  />
                );
              }
              return (
                <p key={idx} style={{ fontFamily: SANS, fontWeight: 500, color: '#2D2D2D', fontSize: '16px', lineHeight: '1.6', padding: '8px 0', margin: 0 }}
                  dangerouslySetInnerHTML={{ __html: paragraph }}
                />
              );
            });
          })()}
        </div>

        {/* ── QUICK POLL (below TOC) ── */}
        {newsletter.poll && (
          <div style={{ padding: `8px ${PAD} 24px` }}>
            <p style={{ fontFamily: SANS, fontWeight: 500, color: '#2D2D2D', fontSize: '16px', lineHeight: '1.6', margin: 0 }}>
              Quickly before we dive in — <em>{newsletter.poll.question}</em>
            </p>
            <style dangerouslySetInnerHTML={{ __html: `@media(max-width:780px){ .poll-options { flex-direction: column !important; gap: 8px !important; } }` }} />
            <div className="poll-options" style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
              {[...newsletter.poll.options, ...(!newsletter.poll.options.some((o: string) => o.toLowerCase() === 'other') ? ['Other'] : [])].map((option: string) => (
                <VoteButton
                  key={option}
                  pollId={newsletter.poll!.poll_id || ''}
                  answer={option}
                  style={{
                    fontFamily: SANS,
                    fontSize: '14px',
                    fontWeight: 700,
                    color: ACCENT,
                    textDecoration: 'none',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase' as const,
                  }}
                >
                  {option}
                </VoteButton>
              ))}
            </div>
          </div>
        )}

        {/* ── ARTICLE CARDS (flagship newsletters) ── */}
        {articles.map((article, articleIndex) => {
          if (!article) return null;
          return (
            <div key={article.slug} id={`article-${articleIndex + 1}`} style={{
              backgroundColor: 'transparent',
              border: '1px solid #CDCDCD',
              borderRadius: '10px',
              margin: '20px 0',
              padding: 0,
              overflow: 'hidden',
              scrollMarginTop: '100px',
            }}>

              {/* Hero image */}
              {article.thumbnail_url && (
                <div style={{ padding: '0', textAlign: 'center' }}>
                  <Link href={`/articles/${article.slug}`} style={{ display: 'block' }}>
                    <Image
                      src={article.thumbnail_url}
                      alt={article.title}
                      width={604}
                      height={340}
                      style={{ display: 'block', width: '100%', height: 'auto' }}
                    />
                  </Link>
                </div>
              )}

              {/* Category label */}
              <div style={{ padding: `10px ${PAD} 0`, textAlign: 'left' }}>
                <p style={{ fontFamily: SANS, color: ACCENT, fontSize: '16px', fontWeight: 400, lineHeight: '1.5', padding: '10px 0', margin: 0 }}>
                  {article.category.toUpperCase()}
                </p>
              </div>

              {/* Title */}
              <div style={{ padding: `0 ${PAD}`, textAlign: 'left' }}>
                <h1 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: '30px', lineHeight: '1.2', color: '#2A2A2A', margin: 0, padding: 0, letterSpacing: '-0.05em' }}>
                  <Link href={`/articles/${article.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {article.title}
                  </Link>
                </h1>
              </div>

              {/* Share buttons */}
              {(() => {
                const articleUrl = `https://thoriumvalley.com/articles/${article.slug}`;
                const shareText = encodeURIComponent(article.title);
                const shareUrl = encodeURIComponent(articleUrl);
                return (
                  <div style={{ padding: `8px ${PAD} 0`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontFamily: SANS, fontSize: '11px', fontWeight: 500, color: 'rgba(27,27,27,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Share</span>
                    <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(27,27,27,0.4)', textDecoration: 'none' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                    </a>

                    <a href={`mailto:?subject=${shareText}&body=${shareUrl}`} style={{ color: 'rgba(27,27,27,0.4)', textDecoration: 'none' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                    </a>
                  </div>
                );
              })()}

              {/* Divider */}
              <div style={{ borderBottom: '1px solid rgba(27,27,27,0.1)', margin: `12px ${PAD} 0` }} />

              {/* Body content — prefer newsletter_content (condensed), fall back to full content */}
              <div style={{ padding: `0 ${PAD}`, textAlign: 'left', wordBreak: 'break-word' }}>
                <ArticleContent
                  className="nl-body"
                  html={((article as any).newsletter_content || article.content || '<p>Content not available.</p>')
                    .replace(/\/thumbnails\/valley-view-header\.png/g, '/IN THE VALLEY NEWS.png')
                    .replace(/\/thumbnails\/into-the-valley\.png/g, '/IN THE VALLEY NEWS.png')
                    .replace(/<p[^>]*><strong[^>]*>Our Valley View<\/strong><\/p>/gi,
                      '<div class="vv-header" style="padding:0;"><img src="/IN THE VALLEY NEWS.png" alt="In the Valley" style="display:block;width:35%;height:auto;padding:0;" /></div>')
                    .replace(/<p[^>]*><strong[^>]*>OUR VALLEY VIEW<\/strong><\/p>/gi,
                      '<div class="vv-header" style="padding:0;"><img src="/IN THE VALLEY NEWS.png" alt="In the Valley" style="display:block;width:35%;height:auto;padding:0;" /></div>')
                    .replace(/<p[^>]*>\s*<strong[^>]*>\s*Into the Valley\s*<\/strong>\s*<\/p>/gi,
                      '<div class="vv-header" style="padding:0;"><img src="/IN THE VALLEY NEWS.png" alt="Into the Valley" style="display:block;width:35%;height:auto;padding:0;" /></div>')
                    .replace(/<h2>Into the Valley<\/h2>/gi,
                      '<div class="vv-header" style="padding:0;"><img src="/IN THE VALLEY NEWS.png" alt="Into the Valley" style="display:block;width:35%;height:auto;padding:0;" /></div>')}
                />
              </div>

              {/* Read full story link */}
              <div style={{ padding: `8px ${PAD} 12px`, textAlign: 'left' }}>
                <Link href={`/articles/${article.slug}`} style={{ fontFamily: SANS, fontSize: '14px', fontWeight: 600, color: ACCENT, textDecoration: 'none' }}>
                  Read the full story →
                </Link>
              </div>

            </div>
          );
        })}

        {/* ── STORY CARDS (child newsletters: Catalyst, Lab) ── */}
        {newsletter.stories && newsletter.stories.length > 0 && newsletter.stories.map((story, storyIndex) => {
          // Transform story content:
          // 1. Replace "The Formula" / "The Verdict" headers with images
          // 2. Replace "Have Claude Explain..." + prompt block with a link to /prompts/slug
          const storySlug = story.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          let transformedContent = (story.content || '<p>Content not available.</p>')
            .replace(/<h2>The Formula<\/h2>/gi,
              '<div style="text-align:center;padding:20px 0 8px;"><img class="section-header-img" src="/thumbnails/the-formula.png" alt="The Formula" /></div>')
            .replace(/<h2>The Verdict<\/h2>/gi,
              '<div style="text-align:center;padding:20px 0 8px;"><img class="section-header-img" src="/thumbnails/the-verdict.png" alt="The Verdict" /></div>')
            .replace(/<h2>Into the Valley<\/h2>/gi,
              '<div style="text-align:center;padding:20px 0 8px;"><img class="section-header-img" src="/IN THE VALLEY NEWS.png" alt="Into the Valley" style="width:35%;height:auto;" /></div>')
            .replace(/<h3>Have Claude Explain This to Me<\/h3>\s*<p>Copy this prompt into Claude:<\/p>\s*<pre><code>[\s\S]*?<\/code><\/pre>/gi,
              `<p style="padding:16px 0 4px;margin:0;"><a href="/prompts/${storySlug}" style="color:#5170ff;text-decoration:none;font-family:${SANS};font-size:14px;font-weight:600;letter-spacing:0.02em;">Have Claude explain this to me →</a></p>`)
            .replace(/<h3>Ask Claude If It's Right for You<\/h3>\s*<p>Copy this prompt into Claude:<\/p>\s*<pre><code>[\s\S]*?<\/code><\/pre>/gi,
              `<p style="padding:16px 0 4px;margin:0;"><a href="/prompts/${storySlug}" style="color:${ACCENT};text-decoration:none;font-family:${SANS};font-size:14px;font-weight:600;letter-spacing:0.02em;">Ask Claude if it&#39;s right for me →</a></p>`);

          return (
          <div key={storyIndex} id={`article-${storyIndex + 1}`} style={{
            backgroundColor: 'transparent',
            border: '1px solid #CDCDCD',
            borderRadius: '10px',
            margin: '20px 0',
            padding: 0,
            overflow: 'hidden',
            scrollMarginTop: '100px',
          }}>

            {/* Story thumbnail */}
            {story.thumbnail_url && (
              <div style={{ padding: '0', textAlign: 'center' }}>
                <Image
                  src={story.thumbnail_url}
                  alt={story.title}
                  width={604}
                  height={340}
                  style={{ display: 'block', width: '100%', height: 'auto' }}
                />
              </div>
            )}

            {/* Category label */}
            <div style={{ padding: `10px ${PAD} 0`, textAlign: 'left' }}>
              <p style={{ fontFamily: SANS, color: ACCENT, fontSize: '16px', fontWeight: 400, lineHeight: '1.5', padding: '10px 0', margin: 0 }}>
                {story.category.toUpperCase()}
              </p>
            </div>

            {/* Title */}
            <div style={{ padding: `0 ${PAD}`, textAlign: 'left' }}>
              <h1 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: '30px', lineHeight: '1.2', color: '#2A2A2A', margin: 0, padding: 0, letterSpacing: '-0.05em' }}>
                {story.title}
              </h1>
            </div>

            {/* Share buttons */}
            {(() => {
              const shareText = encodeURIComponent(story.title);
              const shareUrl = encodeURIComponent(`https://thoriumvalley.com/newsletter/${newsletter.slug}`);
              return (
                <div style={{ padding: `8px ${PAD} 0`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontFamily: SANS, fontSize: '11px', fontWeight: 500, color: 'rgba(27,27,27,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Share</span>
                  <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(27,27,27,0.4)', textDecoration: 'none' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  </a>
                  <a href={`mailto:?subject=${shareText}&body=${shareUrl}`} style={{ color: 'rgba(27,27,27,0.4)', textDecoration: 'none' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                  </a>
                </div>
              );
            })()}

            {/* Divider */}
            <div style={{ borderBottom: '1px solid rgba(27,27,27,0.1)', margin: `12px ${PAD} 0` }} />

            {/* Story body content */}
            <div style={{ padding: `0 ${PAD}`, textAlign: 'left', wordBreak: 'break-word' }}>
              <ArticleContent className="nl-body" html={transformedContent} />
            </div>
          </div>
          );
        })}

        {/* ══════ IN OTHER NEWS + JOBS ══════ */}
        {newsletter.links && (newsletter.links.news?.length || newsletter.links.jobs?.length) && (
          <div id="links-section" style={{
            backgroundColor: 'transparent',
            border: '1px solid #CDCDCD',
            borderRadius: '10px',
            margin: '20px 0',
            padding: 0,
            overflow: 'hidden',
          }}>
            {/* Hero image */}
            <div style={{ padding: 0, textAlign: 'center' }}>
              <Image
                src="/thumbnails/news-header.png"
                alt="In Other News"
                width={780}
                height={340}
                style={{ display: 'block', width: '100%', height: 'auto' }}
              />
            </div>

            {/* Category + Headline */}
            <div style={{ padding: `16px ${PAD} 0`, textAlign: 'left' }}>
              <p style={{ fontFamily: SANS, color: ACCENT, fontSize: '16px', fontWeight: 400, lineHeight: '1.5', padding: '0', margin: 0 }}>
                IN OTHER NEWS
              </p>
            </div>
            <div style={{ padding: `4px ${PAD} 0`, textAlign: 'left' }}>
              <h1 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: '30px', lineHeight: '1.2', color: '#2A2A2A', margin: 0, padding: 0, letterSpacing: '-0.05em' }}>
                What else happened today
              </h1>
            </div>

            {/* Divider */}
            <div style={{ borderBottom: '1px solid rgba(27,27,27,0.1)', margin: `12px ${PAD} 0` }} />

            {/* News links */}
            {newsletter.links.news && newsletter.links.news.length > 0 && (
              <div style={{ padding: `8px ${PAD} 16px`, textAlign: 'left', wordBreak: 'break-word' }}>
                <ul style={{ fontFamily: SANS, margin: 0, padding: '0 0 0 20px', color: '#2D2D2D', lineHeight: '1.5', listStyle: 'none', fontSize: '16px', fontWeight: 500 }}>
                  {newsletter.links.news.map((item, i) => (
                    <li key={i} style={{ margin: '10px 0 0 0', padding: '0 0 0 24px', fontSize: '16px', lineHeight: '1.5', position: 'relative' }}>
                      <span style={{ color: ACCENT, fontWeight: 700, fontSize: '16px', position: 'absolute', left: 0 }}>+</span>
                      {item.prefix && <>{item.prefix}</>}<a href={item.url} style={{ color: ACCENT, textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">{item.link_text}</a>{item.rest}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Jobs segue */}
            {newsletter.links.jobs && newsletter.links.jobs.length > 0 && (
              <>
                <div style={{ borderBottom: '1px solid rgba(27,27,27,0.06)', margin: `0 ${PAD}` }} />
                <div style={{ padding: `14px ${PAD} 4px`, textAlign: 'left' }}>
                  <p style={{ fontFamily: SANS, color: '#2A2A2A', fontSize: '13px', fontWeight: 700, letterSpacing: '0.06em', margin: 0 }}>
                    WHO&apos;S HIRING IN AI
                  </p>
                </div>
                <div style={{ padding: `0 ${PAD} 20px`, textAlign: 'left', wordBreak: 'break-word' }}>
                  <ul style={{ fontFamily: SANS, margin: 0, padding: '0 0 0 20px', color: '#2D2D2D', lineHeight: '1.5', listStyle: 'none', fontSize: '16px', fontWeight: 500 }}>
                    {newsletter.links.jobs.map((item, i) => (
                      <li key={i} style={{ margin: '10px 0 0 0', padding: '0 0 0 24px', fontSize: '16px', lineHeight: '1.5', position: 'relative' }}>
                        <span style={{ color: ACCENT, fontWeight: 700, fontSize: '16px', position: 'absolute', left: 0 }}>+</span>
                        <a href={item.url} style={{ color: ACCENT, textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">{item.company}</a> — {item.role}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════ GAMES SECTION (new location) ══════ */}
        {newsletter.games && (
          <div style={{
            backgroundColor: 'transparent',
            border: '1px solid #CDCDCD',
            borderRadius: '10px',
            margin: '20px 0',
            padding: 0,
            overflow: 'hidden',
          }}>
            {/* Hero image */}
            <div style={{ padding: 0, textAlign: 'center' }}>
              <Image
                src="/thumbnails/games-header.png"
                alt="Games"
                width={780}
                height={340}
                style={{ display: 'block', width: '100%', height: 'auto' }}
              />
            </div>

            {/* Category + Headline */}
            <div style={{ padding: `16px ${PAD} 0`, textAlign: 'left' }}>
              <p style={{ fontFamily: SANS, color: ACCENT, fontSize: '16px', fontWeight: 400, lineHeight: '1.5', padding: '0', margin: 0 }}>
                GAMES
              </p>
            </div>
            <div style={{ padding: `4px ${PAD} 0`, textAlign: 'left' }}>
              <h1 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: '30px', lineHeight: '1.2', color: '#2A2A2A', margin: 0, padding: 0, letterSpacing: '-0.05em' }}>
                AI or real — can you tell the difference?
              </h1>
            </div>

            {/* Divider */}
            <div style={{ borderBottom: '1px solid rgba(27,27,27,0.1)', margin: `12px ${PAD} 0` }} />

            {/* Today's game images */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: `16px ${PAD} 0` }}>
              <div style={{ textAlign: 'center' }}>
                <VoteButton pollId={newsletter.games.game_poll_id || ''} answer="Option A" style={{ display: 'block' }}>
                  <Image src={newsletter.games.image_a} alt="Option A" width={350} height={500} style={{ display: 'block', width: '100%', height: 'auto', borderRadius: '6px' }} />
                </VoteButton>
                <p style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '20px', color: '#2A2A2A', padding: '8px 0', margin: 0, letterSpacing: '-0.03em' }}>
                  Option A
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <VoteButton pollId={newsletter.games.game_poll_id || ''} answer="Option B" style={{ display: 'block' }}>
                  <Image src={newsletter.games.image_b} alt="Option B" width={350} height={500} style={{ display: 'block', width: '100%', height: 'auto', borderRadius: '6px' }} />
                </VoteButton>
                <p style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '20px', color: '#2A2A2A', padding: '8px 0', margin: 0, letterSpacing: '-0.03em' }}>
                  Option B
                </p>
              </div>
            </div>
            <div style={{ padding: `0 ${PAD} 16px`, textAlign: 'center' }}>
              <p style={{ fontFamily: SANS, fontSize: '16px', fontWeight: 500, color: '#2D2D2D', margin: 0, padding: '4px 0' }}>
                Which image is real?
              </p>
              <p style={{ fontFamily: SANS, fontSize: '16px', margin: 0, padding: '4px 0' }}>
                <VoteButton pollId={newsletter.games.game_poll_id || ''} answer="Option A" style={{ color: ACCENT, textDecoration: 'none', fontWeight: 600 }}>Option A</VoteButton>
                <span style={{ color: '#999', padding: '0 8px' }}>|</span>
                <VoteButton pollId={newsletter.games.game_poll_id || ''} answer="Option B" style={{ color: ACCENT, textDecoration: 'none', fontWeight: 600 }}>Option B</VoteButton>
              </p>
            </div>

            {/* Yesterday's Results divider */}
            <div style={{ padding: '8px 0', textAlign: 'center' }}>
              <img src="/thumbnails/yesterdays-results.png" alt="Yesterday's Results" style={{ display: 'block', width: '100%', height: 'auto', padding: 0 }} />
            </div>

            {/* Yesterday's images with source links */}
            {newsletter.yesterdays_results && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: `8px ${PAD} 20px` }}>
                <div style={{ textAlign: 'center' }}>
                  <Image src={newsletter.yesterdays_results.ai_image} alt="AI Image" width={350} height={500} style={{ display: 'block', width: '100%', height: 'auto', borderRadius: '6px' }} />
                  <a href={newsletter.yesterdays_results.ai_source} target="_blank" rel="noopener noreferrer" style={{ fontFamily: SANS, fontSize: '13px', fontWeight: 600, color: ACCENT, textDecoration: 'none', display: 'block', padding: '6px 0' }}>
                    AI IMAGE
                  </a>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Image src={newsletter.yesterdays_results.real_image} alt="Real Image" width={350} height={500} style={{ display: 'block', width: '100%', height: 'auto', borderRadius: '6px' }} />
                  <a href={newsletter.yesterdays_results.real_source} target="_blank" rel="noopener noreferrer" style={{ fontFamily: SANS, fontSize: '13px', fontWeight: 600, color: ACCENT, textDecoration: 'none', display: 'block', padding: '6px 0' }}>
                    REAL IMAGE
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════ TOOLS WE'RE WATCHING ══════ */}
        {newsletter.links?.tools && newsletter.links.tools.length > 0 && (
          <div id="tools-section" style={{
            backgroundColor: 'transparent',
            border: '1px solid #CDCDCD',
            borderRadius: '10px',
            margin: '20px 0',
            padding: 0,
            overflow: 'hidden',
          }}>
            {/* Hero image */}
            <div style={{ padding: 0, textAlign: 'center' }}>
              <Image
                src="/thumbnails/tools-header.png"
                alt="Tools We're Watching"
                width={780}
                height={340}
                style={{ display: 'block', width: '100%', height: 'auto' }}
              />
            </div>

            {/* Section headline */}
            <div style={{ padding: `16px ${PAD} 0`, textAlign: 'left' }}>
              <p style={{ fontFamily: SANS, color: ACCENT, fontSize: '16px', fontWeight: 400, lineHeight: '1.5', padding: '0', margin: 0 }}>
                AI TOOLS
              </p>
            </div>
            <div style={{ padding: `4px ${PAD} 0`, textAlign: 'left' }}>
              <h1 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: '30px', lineHeight: '1.2', color: '#2A2A2A', margin: 0, padding: 0, letterSpacing: '-0.05em' }}>
                What our editors are paying attention to today
              </h1>
            </div>

            {/* Divider */}
            <div style={{ borderBottom: '1px solid rgba(27,27,27,0.1)', margin: `12px ${PAD} 0` }} />

            {/* Tools list */}
            <div style={{ padding: `8px ${PAD} 20px`, textAlign: 'left', wordBreak: 'break-word' }}>
              {newsletter.links.tools.map((item, i) => (
                <div key={i} style={{ padding: '10px 0', borderBottom: i < newsletter.links!.tools!.length - 1 ? '1px solid rgba(27,27,27,0.06)' : 'none' }}>
                  <p style={{ fontFamily: SANS, fontSize: '16px', fontWeight: 500, color: '#2D2D2D', lineHeight: '1.5', margin: 0 }}>
                    <a href={item.url} style={{ color: ACCENT, textDecoration: 'none', fontWeight: 700 }} target="_blank" rel="noopener noreferrer">{item.name}</a>{(item as any).sponsored && <span style={{ fontFamily: SANS, fontSize: '12px', fontWeight: 500, color: 'rgba(27,27,27,0.4)', marginLeft: '6px' }}>(Sponsored)</span>} — {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Old LINKS section removed — content now in dedicated cards above */}

        {/* Old GAMES section removed — now in dedicated card above */}

        {/* Old POLL section removed — now inline at top */}

        {/* ── SIGN-OFF ── */}
        <div style={{ padding: `0 ${PAD}`, borderTop: '1px solid #CDCDCD', marginTop: '10px' }}>
          <p style={{ fontFamily: SANS, fontSize: '16px', lineHeight: '1.5', color: '#2D2D2D', padding: '20px 0 10px', margin: 0 }}>
            {newsletter.sign_off}
          </p>
          <p style={{ fontFamily: SANS, fontSize: '14px', color: '#666', fontStyle: 'italic', padding: '0 0 10px', margin: 0 }}>
            Written by the Thorium Valley Crew
          </p>
        </div>

        {/* Old YESTERDAY'S RESULTS removed — now in games card */}

        {/* ── SUBSCRIBE ── */}
        <div style={{ margin: '20px 0', padding: `20px ${PAD}`, border: '1px solid #CDCDCD', borderRadius: '10px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: '24px', lineHeight: '1.25', color: '#2A2A2A', margin: '0 0 8px', letterSpacing: 'normal' }}>
            Enjoyed this newsletter?
          </h2>
          <p style={{ fontFamily: SANS, fontSize: '14px', color: '#666', margin: '0 0 16px' }}>
            Get daily AI briefings delivered straight to your inbox.
          </p>
          <SubscribeForm variant="navbar" />
        </div>

        {/* ── FOOTER TEXT ── */}
        <div style={{ padding: `15px ${PAD}`, textAlign: 'center' }}>
          <p style={{ fontFamily: SANS, fontSize: '12px', lineHeight: '16px', color: '#2D2D2D', margin: 0, padding: '4px 0' }}>
            That&apos;s all for today&apos;s Thorium Valley. See you tomorrow.
          </p>
        </div>

        {/* ── MORE EDITIONS ── */}
        <RecommendedNewsletters currentSlug={slug} />

      </div>

      <FooterNew />
    </>
  );
}
