import { notFound } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { FooterNew } from '@/components/footer-new';
import Link from 'next/link';
import promptsDB from '@/data/prompts-db.json';
import { CopyPromptButton } from './CopyPromptButton';

interface PromptPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PromptPageProps) {
  const { slug } = await params;
  const prompt = (promptsDB as any[]).find((p) => p.slug === slug);
  if (!prompt) return { title: 'Prompt Not Found - Thorium Valley' };
  return {
    title: `${prompt.title} - Prompt - Thorium Valley`,
    description: `Copy this prompt to have Claude help you with: ${prompt.title}`,
  };
}

export default async function PromptPage({ params }: PromptPageProps) {
  const { slug } = await params;
  const prompt = (promptsDB as any[]).find((p) => p.slug === slug);
  if (!prompt) notFound();

  // Find story position: count how many prompts from same newsletter come before this one
  const siblingsInOrder = (promptsDB as any[]).filter((p) => p.newsletter_slug === prompt.newsletter_slug);
  const storyIndex = siblingsInOrder.findIndex((p) => p.slug === slug);

  const pubLabel =
    prompt.publication === 'the-catalyst'
      ? 'The Catalyst'
      : prompt.publication === 'the-lab'
        ? 'The Lab'
        : 'Thorium Valley';

  return (
    <>
      <Navigation scrollThreshold={150} heroBorder heroTheme="dark" scrolledTheme="blue" />

      <main className="bg-white min-h-screen pt-36 lg:pt-44 pb-24">
        <div className="max-w-[640px] mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-8 font-inter" style={{ color: 'rgba(27,27,27,0.5)' }}>
            <Link href="/" className="hover:text-[#5170ff] transition-colors">Home</Link>
            <span>/</span>
            <Link href={`/newsletter/${prompt.newsletter_slug}`} className="hover:text-[#5170ff] transition-colors">{pubLabel}</Link>
            <span>/</span>
            <span className="text-[#5170ff]">Prompt</span>
          </nav>

          {/* Header image */}
          <div className="flex justify-center mb-6">
            <img
              src={prompt.type === 'formula' ? '/thumbnails/the-formula.png' : '/thumbnails/the-verdict.png'}
              alt={prompt.type === 'formula' ? 'The Formula' : 'The Verdict'}
              style={{ height: '40px', width: 'auto' }}
            />
          </div>

          {/* Story title */}
          <h1
            className="font-times font-semibold text-center mb-2"
            style={{ fontSize: '26px', letterSpacing: '-0.02em', lineHeight: 1.3, color: '#1b1b1b' }}
          >
            {prompt.title}
          </h1>

          <p className="text-center font-inter text-sm mb-8" style={{ color: 'rgba(27,27,27,0.5)' }}>
            Copy this prompt and paste it into Claude to get personalized guidance.
          </p>

          {/* Prompt box */}
          <div
            className="relative rounded-xl border overflow-hidden"
            style={{ borderColor: 'rgba(27,27,27,0.15)', backgroundColor: '#fafafa' }}
          >
            {/* Copy button (top right) */}
            <div className="absolute top-3 right-3 z-10">
              <CopyPromptButton prompt={prompt.prompt} />
            </div>

            {/* Prompt text */}
            <pre
              className="font-inter text-sm leading-relaxed p-6 pr-20 overflow-x-auto whitespace-pre-wrap"
              style={{ color: '#2D2D2D', margin: 0, fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Monaco, monospace", fontSize: '13px', lineHeight: '1.7' }}
            >
              {prompt.prompt}
            </pre>
          </div>

          {/* Back link — anchors to the story they were reading */}
          <div className="mt-8 text-center">
            <Link
              href={`/newsletter/${prompt.newsletter_slug}#article-${storyIndex + 1}`}
              className="font-inter text-sm font-medium transition-colors hover:text-[#5170ff]"
              style={{ color: 'rgba(27,27,27,0.5)' }}
            >
              ← Back to newsletter
            </Link>
          </div>
        </div>
      </main>

      <FooterNew />
    </>
  );
}
