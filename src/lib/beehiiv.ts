const BEEHIIV_API = 'https://api.beehiiv.com/v2';

class BeehiivClient {
  private apiKey: string;
  private publicationId: string;

  constructor() {
    this.apiKey = process.env.BEEHIIV_API_KEY || '';
    this.publicationId = process.env.BEEHIIV_PUBLICATION_ID || '';
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${BEEHIIV_API}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Beehiiv API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getNewsletters(options?: { limit?: number; page?: number }) {
    // If not configured, return mock data
    if (!this.apiKey || !this.publicationId) {
      return { data: getMockNewsletters(options?.limit || 6), total_results: 10, page: 1 };
    }

    const params = new URLSearchParams();
    params.set('status', 'confirmed');
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.page) params.set('page', options.page.toString());
    params.append('expand[]', 'free_web_content');

    return this.fetch<{
      data: Newsletter[];
      total_results: number;
      page: number;
    }>(`/publications/${this.publicationId}/posts?${params.toString()}`);
  }

  async getNewsletterBySlug(slug: string) {
    // If not configured, return mock data
    if (!this.apiKey || !this.publicationId) {
      const mockNewsletters = getMockNewsletters(10);
      return mockNewsletters.find((n) => n.slug === slug) || mockNewsletters[0];
    }

    const response = await this.getNewsletters({ limit: 100 });
    const post = response.data.find((p) => p.slug === slug);
    if (!post) return null;

    return this.fetch<{ data: Newsletter }>(
      `/publications/${this.publicationId}/posts/${post.id}?expand[]=free_web_content`
    ).then((res) => res.data);
  }

  async subscribe(email: string, source?: string) {
    return this.fetch(`/publications/${this.publicationId}/subscriptions`, {
      method: 'POST',
      body: JSON.stringify({
        email,
        reactivate_existing: true,
        send_welcome_email: true,
        utm_source: source || 'website',
      }),
    });
  }
}

export interface Newsletter {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  thumbnail_url?: string;
  content: { free_web_content?: string };
  created_at: string;
  published_at: string;
  status: string;
}

export const beehiiv = new BeehiivClient();

// Mock data for development
function getMockNewsletters(count: number): Newsletter[] {
  const mockArticles = [
    {
      id: '1',
      slug: 'openai-announces-gpt-5-preview',
      title: 'OpenAI Announces GPT-5 Preview with Breakthrough Reasoning Capabilities',
      subtitle: 'The next generation model shows significant improvements in complex reasoning, coding, and multimodal understanding.',
      thumbnail_url: '/thumb-1.avif',
    },
    {
      id: '2',
      slug: 'anthropic-claude-enterprise',
      title: 'Anthropic Launches Claude Enterprise for Large Organizations',
      subtitle: 'New enterprise tier offers enhanced security, custom model fine-tuning, and dedicated support.',
      thumbnail_url: '/thumb-2.avif',
    },
    {
      id: '3',
      slug: 'google-gemini-2-launch',
      title: 'Google Unveils Gemini 2.0 with Revolutionary Agent Capabilities',
      subtitle: 'The new model can autonomously browse the web, write code, and complete complex multi-step tasks.',
      thumbnail_url: '/thumb-3.avif',
    },
    {
      id: '4',
      slug: 'meta-llama-4-open-source',
      title: 'Meta Releases Llama 4: The Most Powerful Open Source Model Yet',
      subtitle: 'Benchmarks show Llama 4 matching proprietary models while remaining fully open source.',
      thumbnail_url: '/thumb-4.avif',
    },
    {
      id: '5',
      slug: 'ai-regulation-update-2026',
      title: 'EU AI Act Takes Effect: What Companies Need to Know',
      subtitle: 'Compliance deadlines approaching for high-risk AI systems as enforcement begins.',
      thumbnail_url: '/thumb-5.webp',
    },
    {
      id: '6',
      slug: 'ai-agents-enterprise-adoption',
      title: 'AI Agents Go Mainstream: Fortune 500 Companies Lead Adoption',
      subtitle: 'Survey shows 70% of large enterprises now deploying autonomous AI agents in production.',
      thumbnail_url: '/thumb-6.avif',
    },
    {
      id: '7',
      slug: 'nvidia-blackwell-ultra-announcement',
      title: 'NVIDIA Announces Blackwell Ultra: 5x Performance Increase',
      subtitle: 'Next-gen GPUs promise to accelerate AI training and inference to new heights.',
      thumbnail_url: '/thumb-7.avif',
    },
    {
      id: '8',
      slug: 'ai-healthcare-breakthrough',
      title: 'AI System Achieves Human-Level Diagnosis Across 50 Conditions',
      subtitle: 'Stanford study shows AI matching expert physicians in diagnostic accuracy.',
      thumbnail_url: '/thumb-8.avif',
    },
    {
      id: '9',
      slug: 'apple-ai-strategy-2026',
      title: "Apple's AI Strategy Revealed: On-Device Intelligence Takes Center Stage",
      subtitle: 'Privacy-focused approach prioritizes local processing over cloud-based AI.',
      thumbnail_url: '/thumb-9.avif',
    },
    {
      id: '10',
      slug: 'coding-assistants-comparison',
      title: 'The State of AI Coding Assistants: Which Tool Leads in 2026?',
      subtitle: 'Comprehensive comparison of GitHub Copilot, Claude Code, and emerging competitors.',
      thumbnail_url: '/thumb-10.avif',
    },
  ];

  const articleContents: Record<string, string> = {
    '1': `
      <img src="/placeholder-1.jpg" alt="OpenAI GPT-5 Preview" style="width:100%;border-radius:4px;margin-bottom:24px" />
      <p>OpenAI has officially unveiled a preview of GPT-5, the company's most ambitious model to date. In a live demonstration at their San Francisco headquarters, CEO Sam Altman showcased capabilities that represent a significant leap forward in artificial intelligence reasoning and comprehension.</p>
      <h2>What's New in GPT-5</h2>
      <p>The model introduces what OpenAI calls "deep reasoning chains" — the ability to break down complex problems into sub-steps and verify each one before proceeding. In benchmarks, GPT-5 scored 92% on the notoriously difficult ARC-AGI test, up from GPT-4's 54%.</p>
      <blockquote><p>"This isn't just an incremental improvement. GPT-5 represents a fundamental shift in how these models approach problem-solving," said Altman during the presentation. "It doesn't just generate answers — it thinks through them."</p></blockquote>
      <img src="/article-inline-1.jpg" alt="OpenAI research lab" style="width:100%;border-radius:4px;margin:24px 0" />
      <h2>Key Capabilities</h2>
      <ul>
        <li><strong>Advanced Reasoning:</strong> Multi-step mathematical proofs, complex code generation with built-in debugging, and logical deduction that rivals expert human performance.</li>
        <li><strong>True Multimodal Understanding:</strong> Seamless integration of text, images, audio, and video in a single context window of 1 million tokens.</li>
        <li><strong>Tool Use:</strong> Native ability to browse the web, execute code, manage files, and interact with external APIs without plugins.</li>
        <li><strong>Reduced Hallucination:</strong> A new "verification layer" that cross-checks generated claims against its training data, reducing factual errors by 78%.</li>
      </ul>
      <h2>Pricing and Availability</h2>
      <p>GPT-5 will be available to ChatGPT Plus subscribers starting March 1, with API access rolling out to enterprise customers in April. OpenAI has not yet announced pricing for API usage, but sources familiar with the matter suggest it will be approximately 3x the cost of GPT-4 Turbo.</p>
      <p>The announcement sent OpenAI's valuation soaring, with reports suggesting the company's latest funding round values it at over $300 billion — making it the most valuable private company in the world.</p>
      <h2>Industry Reaction</h2>
      <p>Competitors were quick to respond. Google's Demis Hassabis called the demo "impressive but expected," noting that Gemini 2.0's own agentic capabilities are "on par or ahead in several benchmarks." Anthropic declined to comment but is widely expected to announce Claude 4 within the coming weeks.</p>
      <p>For enterprise customers, the implications are significant. Early testing partners — including McKinsey, Goldman Sachs, and Stripe — reported productivity gains of 40-60% on complex analytical tasks that previously required senior-level expertise.</p>
      <p><em>We'll continue tracking the GPT-5 rollout. Subscribe to stay ahead of the curve.</em></p>
    `,
    '2': `
      <img src="/placeholder-2.jpg" alt="Anthropic Claude Enterprise" style="width:100%;border-radius:4px;margin-bottom:24px" />
      <p>Anthropic has launched Claude Enterprise, a new tier specifically designed for large organizations that need enhanced security, compliance, and customization capabilities. The move marks Anthropic's most aggressive push into the enterprise market to date.</p>
      <h2>Enterprise Features</h2>
      <p>Claude Enterprise includes several features that set it apart from the standard Claude offering:</p>
      <ul>
        <li><strong>Custom Model Fine-Tuning:</strong> Organizations can fine-tune Claude on their proprietary data while maintaining Anthropic's constitutional AI safety guarantees.</li>
        <li><strong>SOC 2 Type II Compliance:</strong> Full audit trail, data residency controls, and zero-retention policies for sensitive industries.</li>
        <li><strong>Dedicated Infrastructure:</strong> Isolated compute instances that ensure consistent performance and data isolation.</li>
        <li><strong>Admin Dashboard:</strong> Centralized management of users, permissions, usage analytics, and cost controls.</li>
      </ul>
      <blockquote><p>"Enterprise AI adoption has been held back by legitimate security concerns," said Anthropic CEO Dario Amodei. "Claude Enterprise addresses those concerns head-on while delivering the reasoning capabilities our customers need."</p></blockquote>
      <img src="/article-inline-2.jpg" alt="AI conference presentation" style="width:100%;border-radius:4px;margin:24px 0" />
      <h2>Pricing Structure</h2>
      <p>Claude Enterprise starts at $60 per user per month for teams of 50 or more, with custom pricing for organizations over 1,000 seats. This positions it competitively against OpenAI's ChatGPT Enterprise ($60/user) and Google's Gemini for Workspace ($30/user).</p>
      <h2>Early Adopters</h2>
      <p>Several major organizations have already signed on as launch partners, including Bridgewater Associates, Notion, and GitLab. Bridgewater's CTO reported that Claude Enterprise reduced their research analysis time by 55% while maintaining the accuracy standards required in financial services.</p>
      <p>The enterprise AI market is projected to reach $150 billion by 2027, and Anthropic's move positions them as a serious contender alongside OpenAI and Google in capturing enterprise budgets.</p>
    `,
    '3': `
      <img src="/placeholder-3.jpg" alt="Google Gemini 2.0" style="width:100%;border-radius:4px;margin-bottom:24px" />
      <p>Google has taken the wraps off Gemini 2.0, and the headline feature is clear: autonomous AI agents that can perform complex, multi-step tasks across the web and Google's ecosystem of products.</p>
      <h2>Agentic AI Goes Mainstream</h2>
      <p>Unlike traditional chatbots that respond to individual prompts, Gemini 2.0's agents can be given high-level objectives and work independently to achieve them. During the demo, Google showed an agent planning a complete international trip — booking flights, comparing hotels, creating an itinerary, and even adjusting based on weather forecasts — all from a single instruction.</p>
      <blockquote><p>"We're moving from AI as a tool you use to AI as a colleague that works alongside you," said Google CEO Sundar Pichai during the keynote. "Gemini 2.0 doesn't just answer questions — it takes action."</p></blockquote>
      <h2>Deep Integration with Google Workspace</h2>
      <p>Perhaps the most practical advancement is Gemini 2.0's deep integration with Google Workspace. The model can now:</p>
      <ul>
        <li>Draft and send emails based on context from your calendar and documents</li>
        <li>Create presentations by analyzing spreadsheet data and generating charts</li>
        <li>Summarize meeting recordings and automatically create action items in Google Tasks</li>
        <li>Build and modify Google Sheets formulas using natural language</li>
      </ul>
      <h2>Safety and Control</h2>
      <p>Google emphasized that all agent actions require explicit user approval before execution — a "human-in-the-loop" approach that addresses concerns about autonomous AI systems making decisions without oversight. Users can set permission levels, from fully supervised to "trusted" mode for routine tasks.</p>
      <p>Gemini 2.0 is rolling out to Google One AI Premium subscribers immediately, with Workspace integration coming in Q2 2026.</p>
    `,
    '4': `
      <img src="/placeholder-4.jpg" alt="Meta Llama 4" style="width:100%;border-radius:4px;margin-bottom:24px" />
      <p>Meta has released Llama 4, and the AI community is buzzing. For the first time, an open-source model is matching — and in some cases surpassing — the performance of leading proprietary models like GPT-4 and Claude 3.5 Sonnet.</p>
      <h2>Benchmark Results</h2>
      <p>Llama 4 comes in three sizes: 8B, 70B, and 405B parameters. The flagship 405B model achieves remarkable scores across standard benchmarks:</p>
      <ul>
        <li><strong>MMLU:</strong> 89.2% (vs GPT-4's 86.4%)</li>
        <li><strong>HumanEval:</strong> 85.7% (vs GPT-4's 67%)</li>
        <li><strong>GSM8K:</strong> 96.8% (vs GPT-4's 92%)</li>
        <li><strong>ARC Challenge:</strong> 71.3% (vs GPT-4's 54%)</li>
      </ul>
      <blockquote><p>"Open source isn't just catching up — it's leading," said Meta's Chief AI Scientist Yann LeCun. "Llama 4 proves that the open model can be the best model."</p></blockquote>
      <h2>What Makes Llama 4 Different</h2>
      <p>Beyond raw performance, Llama 4 introduces several architectural innovations. The model uses a new "mixture of depths" approach that dynamically allocates computation based on task complexity, making it significantly more efficient than previous architectures.</p>
      <p>The 8B model, in particular, is turning heads. It runs comfortably on a single consumer GPU with 16GB of VRAM, yet performs comparably to GPT-3.5 Turbo — making frontier-level AI accessible to individual developers and small teams.</p>
      <h2>Commercial Implications</h2>
      <p>Llama 4 is released under Meta's permissive license, allowing commercial use without royalties for companies with fewer than 700 million monthly active users. This has significant implications for the AI industry, potentially reducing costs for startups and enterprises that currently pay premium prices for API access to proprietary models.</p>
      <p>Several companies, including Perplexity, Groq, and Together AI, have already deployed Llama 4 variants, offering API access at a fraction of the cost of GPT-4.</p>
    `,
    '5': `
      <img src="/placeholder-5.jpg" alt="EU AI Act" style="width:100%;border-radius:4px;margin-bottom:24px" />
      <p>The European Union's AI Act has officially entered its enforcement phase, and companies deploying artificial intelligence in Europe are racing to ensure compliance. With fines of up to €35 million or 7% of global annual revenue — whichever is higher — the stakes couldn't be greater.</p>
      <h2>What's Changing</h2>
      <p>The AI Act establishes a risk-based framework that categorizes AI systems into four tiers:</p>
      <ul>
        <li><strong>Unacceptable Risk:</strong> Banned entirely. Includes social scoring systems, real-time biometric surveillance (with exceptions for law enforcement), and AI that manipulates human behavior.</li>
        <li><strong>High Risk:</strong> Subject to strict requirements including human oversight, transparency, and regular auditing. Covers AI used in hiring, credit scoring, law enforcement, and healthcare.</li>
        <li><strong>Limited Risk:</strong> Must meet transparency requirements. Users must be informed when interacting with AI chatbots or viewing AI-generated content.</li>
        <li><strong>Minimal Risk:</strong> No restrictions. Includes AI-powered spam filters, recommendation systems, and video games.</li>
      </ul>
      <h2>Impact on US Companies</h2>
      <p>The extraterritorial scope of the AI Act means that any company offering AI services to EU residents must comply, regardless of where the company is headquartered. This has caught several US tech giants off guard.</p>
      <blockquote><p>"The EU AI Act is effectively becoming a global standard, much like GDPR did for data privacy," noted Stanford's Institute for Human-Centered AI in a recent analysis. "Companies that comply with the AI Act will likely meet or exceed requirements in most other jurisdictions."</p></blockquote>
      <h2>Compliance Timeline</h2>
      <p>Key dates that organizations need to be aware of: banned AI practices must cease immediately, high-risk AI system requirements take effect in August 2026, and general-purpose AI model obligations begin in March 2027. Organizations should be conducting AI audits now to identify systems that fall under regulated categories.</p>
    `,
  };

  // Default full content for articles without specific content
  const defaultContent = (title: string, thumbnailUrl: string) => `
    <img src="${thumbnailUrl}" alt="${title}" style="width:100%;border-radius:4px;margin-bottom:24px" />
    <p>The artificial intelligence landscape continues to evolve at an unprecedented pace. This week's developments underscore the rapid advancement of AI capabilities and the growing importance of staying informed about these changes.</p>
    <h2>The Big Picture</h2>
    <p>Industry analysts have noted that the pace of AI development has accelerated significantly over the past year. What once took months to achieve is now accomplished in weeks, and the implications for businesses, developers, and consumers are profound.</p>
    <blockquote><p>"We're witnessing the most significant technological shift since the advent of the internet," said a leading AI researcher. "The organizations that understand and adapt to these changes will define the next decade of innovation."</p></blockquote>
    <img src="/article-inline-1.jpg" alt="AI research lab" style="width:100%;border-radius:4px;margin:24px 0" />
    <h2>Key Developments</h2>
    <ul>
      <li><strong>Performance Gains:</strong> New model architectures are achieving better results with fewer parameters, making advanced AI more accessible and cost-effective.</li>
      <li><strong>Enterprise Adoption:</strong> Fortune 500 companies are moving beyond pilot programs to full-scale AI deployment across operations.</li>
      <li><strong>Regulatory Framework:</strong> Governments worldwide are establishing guidelines that balance innovation with responsible AI development.</li>
      <li><strong>Open Source Momentum:</strong> The open-source AI community continues to close the gap with proprietary models, democratizing access to advanced capabilities.</li>
    </ul>
    <h2>What This Means For You</h2>
    <p>Whether you're a developer, executive, or investor, these trends have direct implications for your work. The key takeaway: AI is no longer a future consideration — it's a present-day imperative that demands attention and action.</p>
    <p>The companies leading in AI adoption share common traits: they invest in talent, experiment rapidly, and maintain a clear strategic vision for how AI fits into their broader objectives. Those who wait for the technology to "mature" risk being left behind by competitors who are building AI capabilities today.</p>
    <img src="/article-inline-2.jpg" alt="AI conference" style="width:100%;border-radius:4px;margin:24px 0" />
    <h2>Looking Ahead</h2>
    <p>The coming months promise even more significant developments. Major announcements are expected from several leading AI companies, and the regulatory landscape continues to crystallize. We'll be tracking all of it.</p>
    <p><em>Stay ahead of the curve — subscribe to Thorium Valley for daily AI briefings delivered to your inbox every morning.</em></p>
  `;

  return mockArticles.slice(0, count).map((article, index) => ({
    ...article,
    content: {
      free_web_content: articleContents[article.id] || defaultContent(article.title, article.thumbnail_url || ''),
    },
    created_at: new Date(Date.now() - index * 86400000).toISOString(),
    published_at: new Date(Date.now() - index * 86400000).toISOString(),
    status: 'confirmed',
  }));
}
