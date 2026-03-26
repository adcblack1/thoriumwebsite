import { getNewsletterBySlug } from '@/lib/newsletters';
import { getArticleBySlug } from '@/lib/articles';
import { SubscribeForm } from '@/components/subscribe-form';
import { SubscribeCTA } from '@/components/SubscribeCTA';
import { RecommendedNewsletters } from '@/components/RecommendedNewsletters';
import { FooterNew } from '@/components/footer-new';
import { Navigation } from '@/components/navigation';
import { CopyBeehiivButton } from '@/components/CopyBeehiivButton';
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
    .nl-body .vv-header img { padding: 0 !important; }
    @media (max-width: 780px) {
      .nl-shell-wrap { padding-left: 12px !important; padding-right: 12px !important; }
    }
  `;

  const breadcrumb = (
    <nav className="flex items-center justify-center gap-2 text-sm">
      <Link href="/" className="hover:text-[#5170ff] transition-colors">Home</Link>
      <span>/</span>
      <Link href="/newsletter" className="hover:text-[#5170ff] transition-colors">Newsletter</Link>
      <span>/</span>
      <span className="text-[#5170ff]">{newsletter.date}</span>
    </nav>
  );

  return (
    <>
      <Navigation scrollThreshold={150} heroBorder heroTheme="dark" scrolledTheme="blue" />
      {/* Simple newsletter header */}
      <section className="bg-white pt-40 lg:pt-48 pb-8">
        <div className="max-w-[780px] mx-auto px-6">
          <h1
            className="font-inter font-semibold text-[#1b1b1b] mb-2"
            style={{ fontSize: '18px', letterSpacing: '-0.02em', lineHeight: 1.3 }}
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

        {/* ── INTRO ── */}
        <div style={{ padding: `0 ${PAD}`, textAlign: 'left', wordBreak: 'break-word' }}>
          <p
            style={{ fontFamily: SANS, fontWeight: 500, color: '#2D2D2D', fontSize: '16px', lineHeight: '1.6', padding: '12px 0', margin: 0 }}
            dangerouslySetInnerHTML={{
              __html: newsletter.intro.startsWith('Welcome back.')
                ? `<strong style="font-weight:700">Welcome back.</strong>${newsletter.intro.slice('Welcome back.'.length)}`
                : newsletter.intro
            }}
          />
        </div>

        {/* ── TABLE OF CONTENTS ── */}
        <div style={{ padding: `24px ${PAD} 0` }}>
          <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: '16px', color: '#2D2D2D', padding: '10px 0 6px', margin: 0 }}>
            IN TODAY&apos;S NEWSLETTER
          </p>
          {newsletter.toc.map((item, i) => (
            <h2 key={i} style={{ fontFamily: SERIF, fontWeight: 400, fontSize: '26px', lineHeight: '1.3', color: '#2A2A2A', padding: '2px 0', margin: 0, letterSpacing: '-0.05em' }}>
              <a href={`#article-${i + 1}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                <span style={{ color: ACCENT }}>{i + 1}.</span>&nbsp;{item}
              </a>
            </h2>
          ))}
        </div>

        {/* ── ARTICLE CARDS ── */}
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

              {/* Hero image */}
              {article.thumbnail_url && (
                <div style={{ padding: '12px 25px', textAlign: 'center' }}>
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

              {/* Body content — prefer newsletter_content (condensed), fall back to full content */}
              <div
                className="nl-body"
                style={{ padding: `0 ${PAD}`, textAlign: 'left', wordBreak: 'break-word' }}
                dangerouslySetInnerHTML={{
                  __html: ((article as any).newsletter_content || article.content || '<p>Content not available.</p>')
                    .replace(/<p[^>]*><strong[^>]*>Our Valley View<\/strong><\/p>/gi,
                      '<div class="vv-header" style="padding:16px 0 4px;"><img src="/thumbnails/valley-view-header.png" alt="Our Valley View" style="display:block;max-width:200px;height:auto;padding:0;" /></div>'),
                }}
              />

            </div>
          );
        })}

        {/* ══════ LINKS SECTION ══════ */}
        {newsletter.links && (
          <div style={{
            border: '1px solid #CDCDCD',
            borderRadius: '10px',
            margin: '20px 0',
            padding: 0,
            overflow: 'hidden',
          }}>
            {/* Category label */}
            <div style={{ padding: `10px ${PAD} 0`, textAlign: 'left' }}>
              <p style={{ fontFamily: SANS, color: ACCENT, fontSize: '16px', fontWeight: 400, lineHeight: '1.5', padding: '10px 0', margin: 0 }}>
                LINKS
              </p>
            </div>

            {/* In Other News */}
            {newsletter.links.news && newsletter.links.news.length > 0 && (
              <>
                <div style={{ padding: '8px 15px 20px', textAlign: 'center' }}>
                  <Image src="/thumbnails/links-in-other-news.png" alt="In Other News" width={780} height={60} style={{ display: 'block', width: '100%', height: 'auto' }} />
                </div>
                <div className="nl-body" style={{ padding: `0 ${PAD}`, textAlign: 'left', wordBreak: 'break-word' }}>
                  <ul style={{ fontFamily: SANS, margin: 0, padding: '0 0 0 20px', color: '#2D2D2D', lineHeight: '1.5', listStyle: 'none', fontSize: '16px', fontWeight: 500 }}>
                    {newsletter.links.news.map((item, i) => (
                      <li key={i} style={{ margin: '10px 0 0 0', padding: '0 0 0 24px', fontSize: '16px', lineHeight: '1.5', position: 'relative' }}>
                        <span style={{ color: ACCENT, fontWeight: 700, fontSize: '16px', position: 'absolute', left: 0 }}>+</span>
                        {item.prefix && <>{item.prefix}</>}<a href={item.url} style={{ color: ACCENT, textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">{item.link_text}</a>{item.rest}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* AI Tools */}
            {newsletter.links.tools && newsletter.links.tools.length > 0 && (
              <>
                <div style={{ padding: '16px 15px 20px', textAlign: 'center' }}>
                  <Image src="/thumbnails/links-ai-tools.png" alt="AI Tools" width={780} height={60} style={{ display: 'block', width: '100%', height: 'auto' }} />
                </div>
                <div className="nl-body" style={{ padding: `0 ${PAD}`, textAlign: 'left', wordBreak: 'break-word' }}>
                  <ul style={{ fontFamily: SANS, margin: 0, padding: '0 0 0 20px', color: '#2D2D2D', lineHeight: '1.5', listStyle: 'none', fontSize: '16px', fontWeight: 500 }}>
                    {newsletter.links.tools.map((item, i) => (
                      <li key={i} style={{ margin: '10px 0 0 0', padding: '0 0 0 24px', fontSize: '16px', lineHeight: '1.5', position: 'relative' }}>
                        <span style={{ color: ACCENT, fontWeight: 700, fontSize: '16px', position: 'absolute', left: 0 }}>+</span>
                        <a href={item.url} style={{ color: ACCENT, textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">{item.name}</a>: {item.desc}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* AI Jobs */}
            {newsletter.links.jobs && newsletter.links.jobs.length > 0 && (
              <>
                <div style={{ padding: '16px 15px 20px', textAlign: 'center' }}>
                  <Image src="/thumbnails/links-ai-jobs.png" alt="AI Jobs" width={780} height={60} style={{ display: 'block', width: '100%', height: 'auto' }} />
                </div>
                <div className="nl-body" style={{ padding: `0 ${PAD} 15px`, textAlign: 'left', wordBreak: 'break-word' }}>
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

        {/* ══════ GAMES SECTION ══════ */}
        {newsletter.games && (
          <div style={{
            border: '1px solid #CDCDCD',
            borderRadius: '10px',
            margin: '20px 0',
            padding: 0,
            overflow: 'hidden',
          }}>
            <div style={{ padding: `10px ${PAD} 0`, textAlign: 'left' }}>
              <p style={{ fontFamily: SANS, color: ACCENT, fontSize: '16px', fontWeight: 400, lineHeight: '1.5', padding: '10px 0', margin: 0 }}>
                GAMES
              </p>
            </div>
            <div style={{ padding: '8px 15px', textAlign: 'center' }}>
              <Image src="/thumbnails/games-ai-or-real.png" alt="AI or Real" width={780} height={100} style={{ display: 'block', width: '100%', height: 'auto' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px 15px 0' }}>
              <div style={{ textAlign: 'center' }}>
                <a href={newsletter.games.game_poll_id ? `/api/poll/vote?poll=${newsletter.games.game_poll_id}&answer=${encodeURIComponent('Option A')}&sid=website-visitor` : '#'} style={{ display: 'block' }}>
                  <Image src={newsletter.games.image_a} alt="Option A" width={350} height={500} style={{ display: 'block', width: '100%', height: 'auto', borderRadius: '6px' }} />
                </a>
                <p style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '20px', color: '#2A2A2A', padding: '8px 0', margin: 0, letterSpacing: '-0.03em' }}>
                  Option A
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <a href={newsletter.games.game_poll_id ? `/api/poll/vote?poll=${newsletter.games.game_poll_id}&answer=${encodeURIComponent('Option B')}&sid=website-visitor` : '#'} style={{ display: 'block' }}>
                  <Image src={newsletter.games.image_b} alt="Option B" width={350} height={500} style={{ display: 'block', width: '100%', height: 'auto', borderRadius: '6px' }} />
                </a>
                <p style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '20px', color: '#2A2A2A', padding: '8px 0', margin: 0, letterSpacing: '-0.03em' }}>
                  Option B
                </p>
              </div>
            </div>
            <div style={{ padding: `8px ${PAD} 15px`, textAlign: 'center' }}>
              <p style={{ fontFamily: SANS, fontSize: '16px', fontWeight: 500, color: '#2D2D2D', margin: 0, padding: '4px 0' }}>
                Which image is real?
              </p>
              <p style={{ fontFamily: SANS, fontSize: '16px', margin: 0, padding: '4px 0' }}>
                <a href={newsletter.games.game_poll_id ? `/api/poll/vote?poll=${newsletter.games.game_poll_id}&answer=${encodeURIComponent('Option A')}&sid=website-visitor` : '#'} style={{ color: ACCENT, textDecoration: 'none', fontWeight: 600 }}>Option A</a>
                <span style={{ color: '#999', padding: '0 8px' }}>|</span>
                <a href={newsletter.games.game_poll_id ? `/api/poll/vote?poll=${newsletter.games.game_poll_id}&answer=${encodeURIComponent('Option B')}&sid=website-visitor` : '#'} style={{ color: ACCENT, textDecoration: 'none', fontWeight: 600 }}>Option B</a>
              </p>

            </div>
          </div>
        )}

        {/* ══════ POLL SECTION ══════ */}
        {newsletter.poll && (
          <div style={{
            border: '1px solid #CDCDCD',
            borderRadius: '10px',
            margin: '20px 0',
            padding: 0,
            overflow: 'hidden',
          }}>
            <div style={{ padding: `10px ${PAD} 0`, textAlign: 'left' }}>
              <p style={{ fontFamily: SANS, color: ACCENT, fontSize: '16px', fontWeight: 400, lineHeight: '1.5', padding: '10px 0', margin: 0 }}>
                WHAT DO YOU THINK?
              </p>
            </div>
            <div style={{ padding: `0 ${PAD} 20px`, textAlign: 'left' }}>
              <p style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '20px', color: '#2A2A2A', padding: '8px 0 12px', margin: 0, lineHeight: '1.3' }}>
                {newsletter.poll.question}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {newsletter.poll.options.map((opt, i) => (
                  <a key={i} href={newsletter.poll?.poll_id ? `/api/poll/vote?poll=${newsletter.poll.poll_id}&answer=${encodeURIComponent(opt)}&sid=website-visitor` : '#'} style={{
                    fontFamily: SANS,
                    fontSize: '16px',
                    fontWeight: 500,
                    color: ACCENT,
                    textDecoration: 'none',
                  }}>
                    {opt}
                  </a>
                ))}
              </div>
              <p style={{ fontFamily: SANS, fontSize: '13px', color: '#999', margin: 0, padding: '12px 0 0' }}>
                Vote by selecting an answer!
              </p>
            </div>
          </div>
        )}

        {/* ── SIGN-OFF ── */}
        <div style={{ padding: `0 ${PAD}`, borderTop: '1px solid #CDCDCD', marginTop: '10px' }}>
          <p style={{ fontFamily: SANS, fontSize: '16px', lineHeight: '1.5', color: '#2D2D2D', padding: '20px 0 10px', margin: 0 }}>
            {newsletter.sign_off}
          </p>
          <p style={{ fontFamily: SANS, fontSize: '14px', color: '#666', fontStyle: 'italic', padding: '0 0 10px', margin: 0 }}>
            Written by {newsletter.writers}
          </p>
        </div>

        {/* ══════ YESTERDAY'S RESULTS (no border) ══════ */}
        {newsletter.yesterdays_results && (
          <div style={{ margin: '20px 0', padding: 0 }}>
            <div style={{ textAlign: 'center', padding: '0 15px' }}>
              <Image src="/thumbnails/yesterdays-results.png" alt="Yesterday's Results" width={780} height={60} style={{ display: 'block', width: '100%', height: 'auto' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px 15px 0' }}>
              <div style={{ textAlign: 'center' }}>
                <Image src={newsletter.yesterdays_results.ai_image} alt="AI Image" width={350} height={500} style={{ display: 'block', width: '100%', height: 'auto', borderRadius: '6px' }} />
                <a href={newsletter.yesterdays_results.ai_source} target="_blank" rel="noopener noreferrer" style={{ fontFamily: SANS, fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: ACCENT, textDecoration: 'none', display: 'block', padding: '8px 0' }}>
                  AI IMAGE
                </a>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Image src={newsletter.yesterdays_results.real_image} alt="Real Image" width={350} height={500} style={{ display: 'block', width: '100%', height: 'auto', borderRadius: '6px' }} />
                <a href={newsletter.yesterdays_results.real_source} target="_blank" rel="noopener noreferrer" style={{ fontFamily: SANS, fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: ACCENT, textDecoration: 'none', display: 'block', padding: '8px 0' }}>
                  REAL IMAGE
                </a>
              </div>
            </div>
          </div>
        )}

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
