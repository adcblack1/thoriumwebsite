const fs = require('fs');
const path = require('path');

const ARTICLES_DB = path.join(__dirname, 'src/data/articles-db.json');
const NEWSLETTERS_DB = path.join(__dirname, 'src/data/newsletters-db.json');

const articles = JSON.parse(fs.readFileSync(ARTICLES_DB, 'utf8'));
const newsletters = JSON.parse(fs.readFileSync(NEWSLETTERS_DB, 'utf8'));

const NOW = '2026-04-02T13:00:00.000Z';

// ═══════════════════════════════════════════
// ARTICLE 1: OpenAI bought a talk show
// ═══════════════════════════════════════════
const article1 = {
  id: 'openai-bought-a-talk-show-now-what',
  slug: 'openai-bought-a-talk-show-now-what',
  title: 'OpenAI bought a talk show. Now what?',
  subtitle: 'The AI lab acquired TBPN after a year of messaging missteps — but owning a media channel raises new questions about trust.',
  author: 'Thorium Valley',
  category: 'Big tech',
  tags: ['OpenAI', 'Media', 'Trust'],
  thumbnail_url: '/thumbnails/openai-bought-a-talk-show-now-what.png',
  status: 'published',
  featured: false,
  reading_time: '4 min read',
  published_at: NOW,
  updated_at: NOW,
  content: `<p>OpenAI just got into the media business.</p>
<p>On Thursday, the company <a href="https://openai.com/index/openai-acquires-tbpn/">acquired TBPN</a>, a daily streaming tech talk show that's built a following among founders, operators and tech workers. The show <a href="https://m.economictimes.com/tech/technology/openai-acquires-tbpn/articleshow/129986132.cms">averages about 70,000 viewers per episode across platforms</a>. It's the first time a major AI lab has bought a media property outright.</p>
<p>Fidji Simo, one of OpenAI's top executives, <a href="https://openai.com/index/openai-acquires-tbpn/">shared in an internal company memo</a> that "the standard communications playbook just doesn't apply to us." The goal, she said, is to "create a space for real, constructive conversation about the changes A.I. creates — with builders and people using the technology at the center."</p>
<p>This didn't come out of nowhere. OpenAI has had a rough stretch with public messaging. The company shut down Sora after its AI video tool <a href="https://x.com/soraofficialapp/status/2036546752535470382">never found its footing</a>, dealt with backlash when a GPT-4o update came across as sycophantic, and has built up what Forbes <a href="https://www.forbes.com/sites/phoebeliu/2026/04/01/the-openai-graveyard-all-the-deals-and-products-that-havent-happened/">cataloged</a> as a growing list of dead products and unfinished deals. Altman himself acknowledged the company will "make some good decisions and some missteps."</p>
<p>A show like TBPN offers something blog posts and press releases can't: a recurring platform where OpenAI gets to pick the guests, set the tone and shape how people think about AI, week after week. With a <a href="https://openai.com/index/accelerating-the-next-phase-ai/">$122 billion funding round</a> freshly closed — the largest in history — the company has the resources to make the play.</p>
<p>OpenAI isn't just a company that ships products, though. It builds the models that increasingly shape how people find and process information online. A <a href="https://www.nber.org/papers/w34100">field experiment from the National Bureau of Economic Research</a> found that generative AI tools can meaningfully shift users' news consumption and their perceptions of trustworthiness. Owning TBPN adds a media channel on top of that influence — one with a human face and a live audience.</p>
<p><strong>Our Valley View</strong></p>
<p>OpenAI has spent the past year watching journalists, regulators and Anthropic shape the public story about AI and clearly decided it'd rather hold the microphone itself. The gamble is that audiences won't notice the difference between an independent tech show and a corporate one with better lighting. They will. <a href="https://www.edelman.com/sites/g/files/aatuss191/files/fr/2025-08/Top%20Findings_2025%20EdelmanTrust%20Barometer_Insights%20for%20the%20Technology%20Sector%20%281%29.pdf">Trust in AI companies has been falling for years</a>, dropping from 61% in 2019 to 56% as of 2025 according to Edelman. If TBPN stays editorially independent, it could genuinely help OpenAI — but if it starts feeling like a company newsletter with a studio audience, it'll do more damage than any bad press cycle could.</p>`,
  newsletter_content: `<p>OpenAI just got into the media business.</p>
<p>On Thursday, the company <a href="https://openai.com/index/openai-acquires-tbpn/">acquired TBPN</a>, a daily streaming tech talk show popular with founders and operators. It's the first time a major AI lab has bought a media property outright. In an internal memo, OpenAI exec Fidji Simo said "the standard communications playbook just doesn't apply to us" and framed the show as a space for real conversation about AI — with builders at the center.</p>
<p>The timing isn't subtle. OpenAI has had a rough stretch with public messaging: Sora <a href="https://x.com/soraofficialapp/status/2036546752535470382">shut down after never finding its footing</a>, a sycophantic GPT-4o update drew backlash, and Forbes <a href="https://www.forbes.com/sites/phoebeliu/2026/04/01/the-openai-graveyard-all-the-deals-and-products-that-havent-happened/">cataloged</a> a growing graveyard of dead products and unfinished deals. With a <a href="https://openai.com/index/accelerating-the-next-phase-ai/">$122 billion funding round</a> freshly closed, the company clearly decided it'd rather hold the microphone than keep watching journalists, regulators, and Anthropic shape the public story about AI.</p>
<p>A show like TBPN offers something blog posts can't: a recurring platform where OpenAI picks the guests, sets the tone, and shapes how people think about AI week after week. But OpenAI isn't just any company with a PR problem — it builds the models that increasingly shape how people find and process information online. Owning a media channel on top of that influence is a different kind of power.</p>
<p><strong>Our Valley View</strong></p>
<p>The gamble is that audiences won't notice the difference between an independent tech show and a corporate one with better lighting. They will. <a href="https://www.edelman.com/sites/g/files/aatuss191/files/fr/2025-08/Top%20Findings_2025%20EdelmanTrust%20Barometer_Insights%20for%20the%20Technology%20Sector%20%281%29.pdf">Trust in AI companies has been falling for years</a>, dropping from 61% to 56% since 2019 according to Edelman. If TBPN stays editorially independent, it could genuinely help OpenAI. If it starts feeling like a company newsletter with a studio audience, it'll do more damage than any bad press cycle could.</p>`
};

// ═══════════════════════════════════════════
// ARTICLE 2: Oracle traded 30,000 jobs
// ═══════════════════════════════════════════
const article2 = {
  id: 'oracle-traded-30000-jobs-for-ai-data-centers',
  slug: 'oracle-traded-30000-jobs-for-ai-data-centers',
  title: 'Oracle traded 30,000 jobs for AI data centers',
  subtitle: 'The company told the SEC that AI code generation made thousands of developers replaceable — then redirected the savings into $50 billion of GPU infrastructure.',
  author: 'Thorium Valley',
  category: 'Markets',
  tags: ['Oracle', 'Workforce', 'AI Layoffs'],
  thumbnail_url: '/thumbnails/oracle-traded-30000-jobs-for-ai-data-centers.png',
  status: 'published',
  featured: false,
  reading_time: '5 min read',
  published_at: NOW,
  updated_at: NOW,
  content: `<p>Most companies won't admit AI is replacing their workers. Oracle just put it in an SEC filing.</p>
<p>In its latest <a href="https://www.sec.gov/Archives/edgar/data/1341439/000119312526100148/orcl-ex99_1.htm">earnings report</a>, the company told investors that "AI models for generating computer code have become so efficient that we have been restructuring our product development teams into smaller, more agile and productive groups." That's a Fortune 500 company telling regulators, on the record, that AI made thousands of its developers replaceable.</p>
<p>The restructuring means up to 30,000 layoffs, roughly 18% of Oracle's 162,000-person workforce. Workers <a href="https://www.cio.com/article/4153113/oracle-cuts-up-to-30000-jobs-globally-putting-enterprise-support-and-roadmaps-at-risk.html">found out via 6 a.m. emails</a> and had their system access cut immediately. Oracle has set aside <a href="https://www.sec.gov/Archives/edgar/data/1341439/000119312526101045/R13.htm">$2.1 billion in restructuring costs</a> for this fiscal year, up $500 million from its estimate just three months ago.</p>
<p>The money is going straight into machines. Related Digital has <a href="https://www.investing.com/news/stock-market-news/related-digital-finalizes-16b-financing-for-oracle-data-center-93CH-4593813">finalized a $16 billion financing package</a> to back Oracle data center buildouts, and Oracle's total AI and cloud infrastructure spend is expected to hit around $50 billion this year. The trade is about as literal as it gets: fewer engineers, more GPUs.</p>
<p>Oracle isn't the only company cutting headcount. Roughly 60,000 jobs were slashed in March, with AI <a href="https://www.challengergray.com/blog/challenger-report-march-cuts-rise-25-from-february-ai-leads-reasons/">cited as a primary driver</a>. But where most of those companies hid behind words like "restructuring" or "operational efficiency," Oracle pointed at AI code generation by name in a public filing. That kind of candor is rare.</p>
<p>So far, investors aren't rewarding the bet. Oracle stock is down around 25% year to date. As we noted last week, Morningstar stripped the company of its wide-moat status as part of a broader assessment of which legacy tech companies are most exposed to AI disruption. The company also signed the White House Ratepayer Protection Pledge to shield communities from rising data center energy costs while committing $16 billion to the exact infrastructure those communities are pushing back on.</p>
<p><strong>Our Valley View</strong></p>
<p>Oracle is the first major tech company to draw a straight line from AI capabilities to mass layoffs in a public filing, and it probably won't be the last. <a href="https://arxiv.org/abs/2603.20617">Researchers at the University of Pennsylvania and Boston University</a> have a name for what's happening here: the "AI layoff trap," where the savings look clean on a spreadsheet but the loss of institutional knowledge quietly erodes the productivity gains that justified the cuts. Oracle is betting $50 billion that the math works anyway. If AI code generation is as good as the company says, this is a bold restructuring. If it's not, they just fired 30,000 people and spent $2.1 billion to find out.</p>`,
  newsletter_content: `<p>Most companies won't admit AI is replacing their workers. Oracle just put it in an SEC filing.</p>
<p>In its latest <a href="https://www.sec.gov/Archives/edgar/data/1341439/000119312526100148/orcl-ex99_1.htm">earnings report</a>, the company told investors that "AI models for generating computer code have become so efficient that we have been restructuring our product development teams into smaller, more agile and productive groups." That's a Fortune 500 company telling regulators, on the record, that AI made thousands of its developers replaceable.</p>
<p>The restructuring means up to <a href="https://www.cio.com/article/4153113/oracle-cuts-up-to-30000-jobs-globally-putting-enterprise-support-and-roadmaps-at-risk.html">30,000 layoffs</a> — roughly 18% of Oracle's workforce — and the money freed up is going straight into machines:</p>
<ul>
<li>Oracle's total AI and cloud infrastructure spend is expected to hit around <strong>$50 billion</strong> this year, backed in part by a <a href="https://www.investing.com/news/stock-market-news/related-digital-finalizes-16b-financing-for-oracle-data-center-93CH-4593813">$16 billion financing package</a> from Related Digital for new data center buildouts.</li>
<li>The company has set aside <a href="https://www.sec.gov/Archives/edgar/data/1341439/000119312526101045/R13.htm">$2.1 billion in restructuring costs</a> this fiscal year — up $500 million from its estimate just three months ago.</li>
</ul>
<p>The trade is about as literal as it gets: fewer engineers, more GPUs. And while other companies have <a href="https://www.challengergray.com/blog/challenger-report-march-cuts-rise-25-from-february-ai-leads-reasons/">cited AI as a driver</a> behind recent layoffs, they hid behind terms like "restructuring" or "operational efficiency." Oracle pointed at AI code generation by name in a public filing. That kind of candor is rare.</p>
<p><strong>Our Valley View</strong></p>
<p>So far, investors aren't rewarding the bet — Oracle stock is down around 25% year to date. And <a href="https://arxiv.org/abs/2603.20617">researchers at the University of Pennsylvania and Boston University</a> warn of an "AI layoff trap": the savings look clean on a spreadsheet, but the loss of institutional knowledge quietly erodes the productivity gains that justified the cuts. Oracle is betting $50 billion that the math works anyway. If AI code generation is as good as the company says, this is a bold restructuring. If it's not, they just fired 30,000 people to find out.</p>`
};

// ═══════════════════════════════════════════
// ARTICLE 3: The CEO who fired 80% for AI
// ═══════════════════════════════════════════
const article3 = {
  id: 'the-ceo-who-fired-80-percent-for-ai-has-no-regrets',
  slug: 'the-ceo-who-fired-80-percent-for-ai-has-no-regrets',
  title: 'The CEO who fired 80% for AI has no regrets',
  subtitle: "IgniteTech's Eric Vaughan says he'd fire resisters again — but the data on enterprise AI success rates tells a different story.",
  author: 'Thorium Valley',
  category: 'Workforce',
  tags: ['Workforce', 'AI Adoption', 'Enterprise'],
  thumbnail_url: '/thumbnails/the-ceo-who-fired-80-percent-for-ai-has-no-regrets.png',
  status: 'published',
  featured: false,
  reading_time: '5 min read',
  published_at: NOW,
  updated_at: NOW,
  content: `<p>Eric Vaughan told nearly 80% of his employees to leave because they wouldn't use AI. He says he'd do it again in a heartbeat.</p>
<p>Vaughan is the CEO of IgniteTech, a Texas-based enterprise software company. In early 2023, he <a href="https://www.aimonday.ai/">introduced</a> something called "AI Monday" — a mandatory day every week where nobody could take customer calls, work on budgets, or do anything but AI projects.</p>
<p>Most of the staff pushed back. Some openly refused.</p>
<blockquote><p>"We said goodbye to those people," Vaughan <a href="https://m.economictimes.com/magazines/panache/ceo-eric-vaughan-of-ignitetech-fired-80-of-staff-for-resisting-ai-adoption-we-said-goodbye-to-those-people-would-i-do-it-again-absolutely/articleshow/123480997.cms">told The Economic Times</a>. "Would I do it again? Absolutely."</p></blockquote>
<p>He's since described the move as a matter of survival, saying he believes every company is facing an existential threat from AI-driven transformation. He claims the remaining 20% of his workforce has maintained or exceeded previous output.</p>
<p>Vaughan's approach is extreme, but the impulse behind it is everywhere. Outplacement firm Challenger, Gray &amp; Christmas <a href="https://www.challengergray.com/wp-content/uploads/2026/03/CR22678739921002.pdf">found</a> that companies across tech are shifting budgets toward AI at the expense of headcount, while separate studies from Stanford and Harvard show coding roles taking the biggest hit.</p>
<p>That confidence hasn't translated broadly. According to an <a href="https://mlq.ai/media/quarterly_decks/v0.1_State_of_AI_in_Business_2025_Report.pdf">MIT study</a> of 153 senior leaders and over 300 AI initiatives, 95% of enterprise AI solutions fail to reach production and deliver zero return. The tech works in demos. It struggles with real work.</p>
<p>Klarna found that out firsthand. The fintech company went all-in on AI to replace customer service roles, then <a href="https://fortune.com/2025/05/09/klarna-ai-humans-return-on-investment/">publicly admitted</a> that cost had been "a too predominant evaluation factor," resulting in "lower quality."</p>
<p>Kathy Ross, a senior director analyst at Gartner, <a href="https://www.businessinsider.com/sneaky-truth-ai-layoffs-switcheroo-meta-microsoft-2026-3">pushed back</a> further on the idea that these layoffs prove AI is actually working. "AI might have played a role, but they're not a result necessarily of AI successes," she told Business Insider. "Instead, the layoffs seem to be part of a broader strategy to reinvest funds in AI, hoping for success down the line."</p>
<p><strong>Our Valley View</strong></p>
<p>The real risk with a story like Vaughan's isn't that he's wrong — it's that he becomes a template. When other CEOs read the headline and decide that gutting headcount is the move, most of them won't have spent a year on "AI Mondays" before pulling the trigger. Klarna already showed what happens when the math doesn't hold. The AI workforce transformation is real, but right now the gap between CEO confidence and actual AI results is wider than anyone in the corner office wants to admit.</p>`,
  newsletter_content: `<p>Eric Vaughan, CEO of Texas-based enterprise software company IgniteTech, told nearly 80% of his employees to leave because they wouldn't use AI. He says he'd <a href="https://m.economictimes.com/magazines/panache/ceo-eric-vaughan-of-ignitetech-fired-80-of-staff-for-resisting-ai-adoption-we-said-goodbye-to-those-people-would-i-do-it-again-absolutely/articleshow/123480997.cms">do it again in a heartbeat</a>.</p>
<p>In early 2023, Vaughan <a href="https://www.aimonday.ai/">introduced</a> "AI Monday" — a mandatory weekly day where nobody could take customer calls or work on budgets, only AI projects. Most of the staff pushed back. Some openly refused. He let them go and claims the remaining 20% has maintained or exceeded previous output.</p>
<p>His approach is extreme, but the impulse behind it is everywhere. Outplacement firm Challenger, Gray &amp; Christmas <a href="https://www.challengergray.com/wp-content/uploads/2026/03/CR22678739921002.pdf">found</a> companies across tech are shifting budgets toward AI at the expense of headcount. The "replace humans with AI" playbook is becoming a default CEO move.</p>
<p>The problem is that the confidence is running way ahead of the results. An <a href="https://mlq.ai/media/quarterly_decks/v0.1_State_of_AI_in_Business_2025_Report.pdf">MIT study</a> of over 300 AI initiatives found that 95% of enterprise AI solutions fail to reach production and deliver zero return. And Klarna, which went all-in on AI for customer service, <a href="https://fortune.com/2025/05/09/klarna-ai-humans-return-on-investment/">publicly admitted</a> that cost had been "a too predominant evaluation factor," resulting in "lower quality." The tech works in demos. It struggles with real work.</p>
<p><strong>Our Valley View</strong></p>
<p>The real risk with a story like Vaughan's isn't that he's wrong — it's that he becomes a template. When other CEOs read the headline and decide gutting headcount is the move, most of them won't have spent a year on "AI Mondays" before pulling the trigger. The AI workforce transformation is real, but the gap between CEO confidence and actual AI results is wider than anyone in the corner office wants to admit.</p>`
};

// ═══════════════════════════════════════════
// PREPEND ARTICLES
// ═══════════════════════════════════════════
articles.unshift(article1, article2, article3);
fs.writeFileSync(ARTICLES_DB, JSON.stringify(articles, null, 2) + '\n');
console.log('✅ 3 articles added to articles-db.json');

// ═══════════════════════════════════════════
// NEWSLETTER
// ═══════════════════════════════════════════
const newsletter = {
  id: 'april-02-2026',
  slug: 'april-02-2026',
  title: 'A leaked model name crashed an entire sector',
  date: 'April 2, 2026',
  intro: "Good Morning Thorium Valley. OpenAI bought a talk show. After a year of dead products, sycophancy backlash, and Forbes cataloging a graveyard of unfinished deals, I guess they figured if you can't win the narrative, buy the narrator.\n\nOracle laid off 30,000 people and told the SEC that AI code generation made them replaceable. Most companies at least dress that up as \"restructuring.\" Stock's already down 25% this year, so the bar for a better strategy wasn't exactly high.\n\nAnd a Texas CEO who fired 80% of his staff for refusing to use AI says he'd do it again without thinking twice. So much for the careful rollout everyone keeps promising. No shortage of conviction in today's stories. The receipts? Harder to come by.",
  toc: [
    'OpenAI bought a talk show. Now what?',
    'Oracle traded 30,000 jobs for AI data centers',
    'The CEO who fired 80% for AI has no regrets'
  ],
  article_slugs: [
    'openai-bought-a-talk-show-now-what',
    'oracle-traded-30000-jobs-for-ai-data-centers',
    'the-ceo-who-fired-80-percent-for-ai-has-no-regrets'
  ],
  sign_off: "That's all for today. If this issue made you think, share it with someone who needs to think harder.",
  writers: 'Jason Chen, Advait Prakash, Andrew Hales, and the Thorium Valley crew.',
  banner_image_url: '/thumbnails/banner-2026-04-02.png',
  published_at: NOW,
  updated_at: NOW,
  status: 'published',
  links: {
    news: [
      { link_text: 'Jack Dorsey says AI should replace middle managers', rest: ' after Block cuts 4,000 jobs', url: 'http://www.coindesk.com/tech/2026/04/01/jack-dorsey-says-ai-should-replace-corporate-hierarchy-after-block-cuts-4-000-jobs' },
      { prefix: 'Anthropic accidentally ', link_text: 'leaked 512,000 lines of Claude Code\'s source code', rest: ' via a misconfigured npm package — a developer rewrote the whole thing overnight with AI', url: 'https://fortune.com/2026/03/31/anthropic-source-code-claude-code-data-leak-second-security-lapse-days-after-accidentally-revealing-mythos/' },
      { prefix: 'A federal court ', link_text: 'blocked the Trump administration\'s ban on Anthropic', rest: ' for government contractors', url: 'https://www.mondaq.com/unitedstates/government-contracts-procurement-ppp/1767292/update-federal-court-enjoins-trump-administrations-anthropic-ban-for-government-contractors' },
      { prefix: 'Los Alamos National Lab ', link_text: 'installed ChatGPT on a nuclear supercomputer', rest: ' — here\'s what happened', url: 'https://www.vox.com/technology/484250/los-alamos-nuclear-ai-openai-chatgpt' },
      { prefix: 'GitHub Copilot caught ', link_text: 'sneaking ads into developers\' pull requests', rest: ' — over 11,000 repos affected', url: 'https://officechai.com/ai/user-discovers-that-github-copilot-edited-an-ad-into-their-pr-company-responds/' },
      { prefix: 'Governor Newsom signs ', link_text: 'executive order to strengthen AI protections', rest: ' as the White House rolls back federal standards', url: 'https://www.gov.ca.gov/2026/03/30/as-trump-rolls-back-protections-governor-newsom-signs-first-of-its-kind-executive-order-to-strengthen-ai-protections-and-responsible-use/' },
      { prefix: 'Rhoda AI ', link_text: 'exits stealth with $450 million', rest: ' to bring robots out of the lab and into the real world', url: 'https://www.intelligence360.news/rhoda-ai-exits-stealth-with-450-million-series-a-to-bring-robots-out-of-the-lab-and-into-the-real-world/' },
      { prefix: 'A dietician was ', link_text: 'struck off the UK register for using ChatGPT', rest: ' to answer questions during a remote NHS job interview from Nigeria', url: 'http://www.dailymail.co.uk/news/article-15700965/Dietician-struck-UK-register-using-ChatGPT-real-time-answers-remote-interview-NHS-job-Nigeria.html' }
    ],
    tools: [
      { name: 'Gemini', desc: 'Google now lets you import your full chat history and saved memories from ChatGPT and Claude directly into Gemini — so you can switch without starting over', url: 'https://www.ghacks.net/2026/03/31/google-adds-chatgpt-and-claude-import-tools-to-gemini-for-memory-and-chat-history/' },
      { name: 'Gmail AI Inbox', desc: 'A new AI-powered view in Gmail prioritizes your important messages, generates to-do lists, and groups updates by topic so you don\'t have to read every email yourself', url: 'https://9to5google.com/2026/03/31/gmail-ai-inbox-beta-ultra/' },
      { name: 'Telegram', desc: 'The messaging app now has a built-in AI text editor that can fix grammar, rewrite your messages in different styles, or translate them — all right in the chat bar before you hit send', url: 'https://telegram.org/blog/ai-editor-mighty-polls-and-more' },
      { name: 'GitHub Copilot CLI', desc: 'A new /fleet command lets Copilot break a coding task into pieces and work on multiple files simultaneously with parallel agents — like having a whole dev team in your terminal', url: 'https://github.blog/ai-and-ml/github-copilot/run-multiple-agents-at-once-with-fleet-in-copilot-cli/' },
      { name: 'Google Vids', desc: 'Google\'s video creation tool now lets you create customizable AI avatars you can direct, plus free users get 10 AI-generated video clips per month', url: 'https://9to5google.com/2026/04/02/google-vids-ai-avatars/' }
    ],
    jobs: [
      { company: 'Walt Disney Imagineering', role: 'Executive, AI Platform Engineering', url: 'https://wdwnt.com/2026/03/walt-disney-imagineering-hiring-ai-executive/' },
      { company: 'Anthropic', role: 'Research Engineer, Frontier Red Team (Hardware Lead)', url: 'https://flexionis.wuaze.com/job/research-engineer-frontier-red-team-hardware-lead' },
      { company: 'Netflix', role: 'Principal ML Architect, Content Promotion & Distribution', url: 'https://flexionis.wuaze.com/job/principal-machine-learning-architect-l7-content-promotion-distribution-6' },
      { company: 'Humana', role: 'Lead, AI Product Management', url: 'https://careers.humana.com/us/en/job/R-410731/Lead-AI-Product-Management' }
    ]
  },
  games: {
    game_poll_id: 'dd9e403c-cdaa-4fff-950f-aebc729152c4',
    image_a: '/thumbnails/kicker-2026-04-02-ai.jpeg',
    image_b: '/thumbnails/kicker-2026-04-02-real.jpg',
    link_a: 'https://gemini.google.com/share/a1b7e3de01f5',
    link_b: 'https://unsplash.com/photos/gray-concrete-road-between-green-trees-during-daytime-X4AAT4a3y28'
  },
  poll: {
    poll_id: '787df239-6506-4d79-b866-f29f93ddda02',
    question: 'Would you trust an AI agent to work on your computer unsupervised?',
    options: ['Already do', 'Not a chance', 'Maybe someday', 'Other']
  },
  poll_results: null,
  yesterdays_results: {
    ai_image: '/thumbnails/kicker-2026-03-29-ai.jpeg',
    real_image: '/thumbnails/kicker-2026-03-29-real.jpg',
    ai_source: 'https://gemini.google.com/share/be9c2825e946',
    real_source: 'https://unsplash.com/photos/a-majestic-tiered-waterfall-cascades-down-a-rocky-mountainside-0E6MhYNr7qY'
  }
};

newsletters.unshift(newsletter);
fs.writeFileSync(NEWSLETTERS_DB, JSON.stringify(newsletters, null, 2) + '\n');
console.log('✅ Newsletter april-02-2026 added to newsletters-db.json');
console.log('Done!');
