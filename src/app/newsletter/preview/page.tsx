import { generateNewsletterHTML, NewsletterEdition } from '@/lib/newsletter-template';
import { getFeaturedArticles } from '@/lib/articles';

export const metadata = {
    title: 'Newsletter Preview - Thorium Valley',
};

export default function NewsletterPreviewPage() {
    // Build a sample newsletter from database articles
    const articles = getFeaturedArticles(3);

    const edition: NewsletterEdition = {
        subject_emoji: '⚡',
        subject_line: 'GPT-5 preview arrives as open models close the gap',
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        intro: 'OpenAI unveiled GPT-5 with breakthrough reasoning capabilities. Meanwhile, Anthropic launched Claude Enterprise for large organizations, and Google took the wraps off Gemini 2.0 with autonomous agent capabilities.',
        editor: 'Thorium Valley',
        articles: articles.map((a) => {
            const colonIdx = a.title.indexOf(':');
            const hasColon = colonIdx !== -1;
            return {
                category_label: a.category.toUpperCase(),
                title_plain: hasColon ? a.title.slice(0, colonIdx + 1) + ' ' : '',
                title_italic: hasColon ? a.title.slice(colonIdx + 1).trim() : a.title,
                hero_image_url: a.thumbnail_url || '',
                body_html: a.content,
                article_url: `https://thoriumvalley.com/articles/${a.slug}`,
                author_name: a.author || 'Thorium Valley',
            };
        }),
        links: {
            news: [
                { text: 'Meta, Nvidia strike', link_text: 'multi-billion dollar deal for AI chips', url: 'https://ft.com' },
                { text: 'Google strikes deal with', link_text: 'Ormat for 150MW of geothermal energy', url: 'https://bloomberg.com' },
                { text: 'Mistral', link_text: 'acquires Koyeb for AI deployment', url: 'https://techcrunch.com' },
                { text: 'Cloud startup Render raises', link_text: '$100M at $1.5B valuation', url: 'https://cnbc.com' },
            ],
            products: [
                { name: 'Claude Cowork:', description: 'Anthropic launches collaborative AI workspace.', url: 'https://anthropic.com' },
                { name: 'Gemini Agents:', description: 'Google\'s autonomous task completion system.', url: 'https://google.com' },
            ],
            jobs: [
                { company: 'OpenAI', role: 'AI Deployment Engineer', url: 'https://openai.com/careers' },
                { company: 'Anthropic', role: 'Forward Deployed Engineer', url: 'https://anthropic.com/careers' },
            ],
        },
    };

    const html = generateNewsletterHTML(edition);

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
            <div style={{ marginBottom: '20px', padding: '12px 16px', background: '#f5f5f5', borderRadius: '8px', fontFamily: 'system-ui' }}>
                <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#666' }}>NEWSLETTER PREVIEW</p>
                <p style={{ margin: '0', fontSize: '14px', fontWeight: 'bold' }}>
                    {edition.subject_emoji} {edition.subject_line}
                </p>
            </div>
            <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
    );
}
