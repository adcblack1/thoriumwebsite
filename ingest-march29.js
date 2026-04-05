const fs = require('fs');
const path = require('path');

// Paths
const ART_DB = path.join(__dirname, 'src/data/articles-db.json');
const NL_DB = path.join(__dirname, 'src/data/newsletters-db.json');

// Load existing
const articles = JSON.parse(fs.readFileSync(ART_DB, 'utf8'));
const newsletters = JSON.parse(fs.readFileSync(NL_DB, 'utf8'));

// Helper: markdown text to HTML paragraphs
function md2html(md) {
  const paras = md.split(/\n\n+/).filter(p => p.trim());
  return paras.map(p => {
    // Skip headings and category lines
    if (p.startsWith('#') || /^[A-Z ]{3,}$/.test(p.trim())) return null;
    // Convert markdown links
    let html = p.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    // Convert bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Convert italic
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    // Convert bullet lists
    if (html.includes('\n- ')) {
      const lines = html.split('\n');
      let result = '';
      let inList = false;
      for (const line of lines) {
        if (line.startsWith('- ')) {
          if (!inList) { result += '<ul>'; inList = true; }
          let li = line.slice(2);
          li = li.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
          result += `<li>${li}</li>`;
        } else {
          if (inList) { result += '</ul>'; inList = false; }
          result += line;
        }
      }
      if (inList) result += '</ul>';
      return result;
    }
    return `<p>${html}</p>`;
  }).filter(Boolean).join('\n');
}

// ============ ARTICLE 1 ============
const art1_content = `<p>Anthropic didn't release a product. It leaked a slide.</p>
<p>Last week, an accidental data cache exposed the existence of an unreleased Anthropic model internally codenamed "Capybara," publicly referred to as <a href="https://fortune.com/2026/03/26/anthropic-says-testing-mythos-powerful-new-ai-model-after-data-leak-reveals-its-existence-step-change-in-capabilities/">Claude Mythos</a>. Anthropic called it <a href="https://fortune.com/2026/03/26/anthropic-says-testing-mythos-powerful-new-ai-model-after-data-leak-reveals-its-existence-step-change-in-capabilities/">"by far the most powerful AI model we've ever developed,"</a> with a spokesperson describing "meaningful advances in reasoning, coding, and cybersecurity."</p>
<p>That last word is what spooked Wall Street.</p>
<p>Within hours, <a href="https://www.investing.com/news/stock-market-news/cybersecurity-stocks-plunge-as-anthropics-claude-mythos-leak-sparks-ai-fear-4584897">cybersecurity stocks cratered</a>. CrowdStrike fell around 7%. Palo Alto Networks dropped roughly 6%. Fortinet, Zscaler and Cloudflare all followed. Billions in market cap vanished — not because of earnings, not because of a competitor, but because of a model that doesn't even have a release date.</p>
<p>The fear has a logic to it. Anthropic said Capybara <a href="https://fortune.com/2026/03/26/anthropic-says-testing-mythos-powerful-new-ai-model-after-data-leak-reveals-its-existence-step-change-in-capabilities/">"gets dramatically higher scores on tests of software coding, academic reasoning, and cybersecurity"</a> compared to Opus 4.6. <a href="https://fortune.com/2026/03/26/anthropic-says-testing-mythos-powerful-new-ai-model-after-data-leak-reveals-its-existence-step-change-in-capabilities/">Fortune reported</a> that the company is planning a slow rollout specifically because of the cybersecurity implications. If a model can autonomously discover zero-day vulnerabilities — previously unknown software flaws that are the bread and butter of what cybersecurity firms charge a premium to find — the market's question becomes obvious.</p>
<p>"These stocks have had tremendous runs so it's rational for any marginal news to dent their shares," Travis Prentice, Chief Investment Officer at Informed Momentum, <a href="https://www.ft.com/content/e4e15692-187e-4466-832e-ec267e792292?syn-25a6b1a6=1">told the Financial Times</a>.</p>
<p>Rational, sure. But "marginal news" undersells it. Adam Tindle, an analyst at Raymond James, <a href="https://www.investing.com/news/stock-market-news/cybersecurity-stocks-plunge-as-anthropics-claude-mythos-leak-sparks-ai-fear-4584897">noted</a> that the traditional approach to cybersecurity — built on known threat signatures and vulnerability databases — faces real pressure as AI enables the "continuous discovery of unknown exploits" faster than legacy tools can respond.</p>
<p>That's what rattled the sector. Not that Mythos will replace CrowdStrike tomorrow, but that AI is learning to do the thing cybersecurity companies are built around, and it's learning fast.</p>
<p>The irony is hard to miss. Just last week, Morningstar upgraded CrowdStrike to a wide-moat rating, arguing that AI actually increases the attack surface and makes cybersecurity companies more valuable over time. The market saw one leaked codename and sold everything anyway.</p>
<p>Kirk Materne, an analyst at Evercore ISI, <a href="https://www.investing.com/news/stock-market-news/cybersecurity-stocks-plunge-as-anthropics-claude-mythos-leak-sparks-ai-fear-4584897">put it plainly</a>: "Until the sector stops reacting to every model release, it's going to be a long and bumpy bottoming process."</p>
<div class="vv-header" style="padding:0;"><img src="/thumbnails/valley-view-header.png" alt="Our Valley View" style="display:block;width:35%;height:auto;padding:0;" /></div>
<p>This wasn't really about cybersecurity. It was a preview of what happens when AI capabilities advance fast enough to threaten entire business models with a press leak. Today it was CrowdStrike and Palo Alto. Next time it could be legal tech after a reasoning breakthrough, or analytics firms after a data science upgrade. Any industry that sells expertise AI is learning to replicate should be watching the Mythos selloff closely — not as a cybersecurity story, but as a preview of their own future trading day.</p>`;

const art1_newsletter = `<p>Anthropic didn't release a product. It leaked a slide.</p>
<p>Last week, an accidental data cache exposed the existence of an unreleased model internally codenamed "Capybara," publicly referred to as <a href="https://fortune.com/2026/03/26/anthropic-says-testing-mythos-powerful-new-ai-model-after-data-leak-reveals-its-existence-step-change-in-capabilities/">Claude Mythos</a>. Anthropic called it "by far the most powerful AI model we've ever developed," citing meaningful advances in reasoning, coding, and cybersecurity.</p>
<p>That last word is what spooked Wall Street. Within hours, <a href="https://www.investing.com/news/stock-market-news/cybersecurity-stocks-plunge-as-anthropics-claude-mythos-leak-sparks-ai-fear-4584897">cybersecurity stocks cratered</a>. CrowdStrike fell around 7%. Palo Alto Networks dropped roughly 6%. Fortinet, Zscaler, and Cloudflare all followed. Billions in market cap vanished — not because of earnings or a competitor, but because of a model that doesn't even have a release date.</p>
<p>The concern is specific: Anthropic says Mythos gets dramatically higher scores on cybersecurity benchmarks than Opus 4.6, and is planning a slow rollout specifically because of those implications. If a model can autonomously discover zero-day vulnerabilities — previously unknown software flaws that are the bread and butter of what cybersecurity firms charge a premium to find — the market's question becomes obvious.</p>
<p>Adam Tindle, an analyst at Raymond James, <a href="https://www.investing.com/news/stock-market-news/cybersecurity-stocks-plunge-as-anthropics-claude-mythos-leak-sparks-ai-fear-4584897">noted</a> that the traditional approach to cybersecurity, built on known threat signatures and vulnerability databases, faces real pressure as AI enables the "continuous discovery of unknown exploits" faster than legacy tools can respond. That's what rattled the sector. Not that Mythos will replace CrowdStrike tomorrow, but that AI is learning to do the thing cybersecurity companies are built around — and it's learning fast.</p>
<p>The irony is hard to miss. Just last week, Morningstar upgraded CrowdStrike to a wide-moat rating, arguing that AI actually increases the attack surface and makes cybersecurity companies <em>more</em> valuable over time. The market saw one leaked codename and sold everything anyway.</p>
<div class="vv-header" style="padding:0;"><img src="/thumbnails/valley-view-header.png" alt="Our Valley View" style="display:block;width:35%;height:auto;padding:0;" /></div>
<p>This wasn't really about cybersecurity. It was a preview of what happens when AI capabilities advance fast enough to threaten entire business models with a press leak. Today it was CrowdStrike and Palo Alto. Next time it could be legal tech after a reasoning breakthrough, or analytics firms after a data science upgrade. Any industry that sells expertise AI is learning to replicate should be watching the Mythos selloff closely — not as a cybersecurity story, but as a preview of their own future trading day.</p>`;

// ============ ARTICLE 2 ============
const art2_content = `<p>Eleven co-founders. Zero remaining.</p>
<p>Ross Nordeen, the last of Elon Musk's original xAI co-founders, <a href="https://www.businessinsider.com/xai-cofounder-ross-nordeen-leaves-musk-preps-spacex-ipo-2026-3">left the company on Friday</a>, according to Business Insider. His departure completes a clean sweep that's been building for months — every single person who helped Musk launch his AI lab in 2023 has now walked out the door.</p>
<p>The exits accelerated after SpaceX <a href="https://x.ai/news/xai-joins-spacex">closed its acquisition of xAI</a> in February, a deal that valued the AI lab at $250 billion on paper. Two co-founders left almost immediately after the merger closed. The rest had been trickling out since late last year, with several heading to competing labs or starting their own companies.</p>
<p>Musk, for his part, has not pretended everything is fine. He acknowledged that xAI <a href="https://techcrunch.com/2026/03/13/not-built-right-the-first-time-musks-xai-is-starting-over-again-again/">was not built right "the first time around,"</a> framing the departures less as a crisis and more as a reset.</p>
<p>The problem with a reset is that it assumes you can replace what walked out. AI labs aren't normal companies. Their value sits overwhelmingly in the heads of a small number of people who understand the architecture, the training decisions, the things that didn't work and why. When one or two senior researchers leave, it hurts. When the entire founding team leaves, you're not rebuilding — you're starting over with a $250 billion price tag and a chatbot called Grok that needs to justify it.</p>
<p>The contrast with how other companies are handling talent retention is stark. Meta, for instance, recently began <a href="https://www.businessinsider.com/meta-boost-executive-pay-compensation-targets-stock-price-market-cap-2026-3">offering aggressive stock option packages</a> to lock in its top AI leaders, betting that the cost of keeping people is far cheaper than the cost of losing them.</p>
<p>xAI is betting the opposite — that the brand, the resources, and the SpaceX infrastructure are enough to attract a new generation of talent. <a href="https://techcrunch.com/2026/03/28/elon-musks-last-co-founder-reportedly-leaves-xai/">TechCrunch reported</a> that the company is actively hiring, but details on who's replacing the co-founders and at what level remain thin.</p>
<div class="vv-header" style="padding:0;"><img src="/thumbnails/valley-view-header.png" alt="Our Valley View" style="display:block;width:35%;height:auto;padding:0;" /></div>
<p>The AI industry has no shortage of money, compute, or ambition. What it does have a shortage of is people who've actually built frontier models from scratch and know where the bodies are buried. Musk can hire brilliant engineers, and he probably will. But institutional knowledge isn't something you post a job listing for. If xAI's next chapter works, it'll be because Musk found a way to rebuild a brain trust from nothing — and that would be genuinely impressive. The more likely outcome is that $250 billion valuation starts to look like a number that was set before the people who earned it decided to leave.</p>`;

const art2_newsletter = `<p>Eleven co-founders. Zero remaining.</p>
<p>Ross Nordeen, the last of Elon Musk's original xAI co-founders, <a href="https://www.businessinsider.com/xai-cofounder-ross-nordeen-leaves-musk-preps-spacex-ipo-2026-3">left the company on Friday</a>, completing a clean sweep that's been building for months. The exits accelerated after SpaceX <a href="https://x.ai/news/xai-joins-spacex">closed its acquisition of xAI</a> in February — a deal that valued the AI lab at $250 billion on paper. Two co-founders left almost immediately after the merger. The rest had been trickling out since late last year, several heading to competing labs or starting their own companies.</p>
<p>Musk has acknowledged that xAI <a href="https://techcrunch.com/2026/03/13/not-built-right-the-first-time-musks-xai-is-starting-over-again-again/">was not built right "the first time around,"</a> framing the departures as a reset rather than a crisis. But AI labs aren't normal companies. Their value sits overwhelmingly in the heads of a small number of people who understand the architecture, the training decisions, the things that didn't work and why. When the entire founding team leaves, you're not rebuilding — you're starting over with a $250 billion price tag and a chatbot called Grok that needs to justify it.</p>
<p>Compare that to Meta, which recently began <a href="https://www.businessinsider.com/meta-boost-executive-pay-compensation-targets-stock-price-market-cap-2026-3">offering aggressive stock option packages</a> to lock in its top AI leaders, betting that the cost of keeping people is far cheaper than the cost of losing them. xAI is betting the opposite — that the brand, the resources, and the SpaceX infrastructure are enough to attract a new generation of talent. <a href="https://techcrunch.com/2026/03/28/elon-musks-last-co-founder-reportedly-leaves-xai/">TechCrunch reported</a> the company is actively hiring, but details on who's replacing the co-founders remain thin.</p>
<div class="vv-header" style="padding:0;"><img src="/thumbnails/valley-view-header.png" alt="Our Valley View" style="display:block;width:35%;height:auto;padding:0;" /></div>
<p>The AI industry has no shortage of money, compute, or ambition. What it does have a shortage of is people who've actually built frontier models from scratch and know where the bodies are buried. Musk can hire brilliant engineers, and he probably will. But institutional knowledge isn't something you post a job listing for. If xAI's next chapter works, it'll be because Musk found a way to rebuild a brain trust from nothing — and that would be genuinely impressive. The more likely outcome is that $250 billion valuation starts to look like a number that was set before the people who earned it decided to leave.</p>`;

// ============ ARTICLE 3 ============
const art3_content = `<p>Google just turned your chatbot history into a transferable asset.</p>
<p>On Thursday, Google <a href="https://x.com/GeminiApp/status/2037247063382167567">launched an import tool for Gemini</a> that lets you transfer your conversation history and saved preferences from ChatGPT or Claude in a few clicks. Your interests, your family members' names, your communication style. All ported over.</p>
<p>"Once you import these memories, Gemini will understand the same key facts you've shared with other apps, like your interests, your sibling's name, or where you grew up," <a href="https://techcrunch.com/2026/03/26/you-can-now-transfer-your-chats-and-personal-information-from-other-chatbots-directly-into-gemini/">Google said</a>. No starting from scratch.</p>
<p>It's straight out of the telecom playbook. Remember when carriers were forced to let you keep your phone number when you switched? Google is betting that if switching chatbots is just as painless, Gemini's reach will do the rest.</p>
<p>There's reason to think it could work. A <a href="https://arxiv.org/html/2603.25220v1">recent study on chatbot platform usage</a> found that over 80% of users already rely on two or more platforms, and that switching costs are "negligible." People use ChatGPT for its interface, Claude for answer quality, and so on. Google doesn't need to win every category. It just needs to make the hop frictionless.</p>
<p>The timing says a lot. Gemini has <a href="https://techcrunch.com/2026/02/04/googles-gemini-app-has-surpassed-750m-monthly-active-users/">surpassed 750 million monthly active users</a>, but ChatGPT still leads with around 900 million weekly active users. Claude is far smaller at roughly 19 million monthly users, but <a href="https://techcrunch.com/2026/03/28/anthropics-claude-popularity-with-paying-consumers-is-skyrocketing/">its paid subscriptions have more than doubled this year</a>. Google isn't responding to one rival's size. It's responding to the fact that chatbot loyalty is genuinely up for grabs.</p>
<p>As we noted earlier this week, what you're importing is more than just data. Chatbots don't simply remember facts about you. They shape themselves around your preferences, learning your tone and even telling you what you want to hear. The "memory" being ported over isn't a settings file — it's a learned relationship. Google's <a href="https://support.google.com/gemini/answer/13594961">privacy policy</a> covers imported conversations under its standard terms, meaning that data could be used to train models and improve products unless you opt out.</p>
<div class="vv-header" style="padding:0;"><img src="/thumbnails/valley-view-header.png" alt="Our Valley View" style="display:block;width:35%;height:auto;padding:0;" /></div>
<p>Benchmarks and model updates grab headlines, but the durable advantage in AI may come down to something simpler: who knows you best. Google is betting your chatbot memory is the new moat, and it just made that moat portable. For OpenAI and Anthropic, that's a problem, because Google already has a relationship with practically everyone who uses the internet. The company that wins the chatbot war long-term won't be the one with the smartest model. It'll be the one that's already everywhere you are.</p>`;

const art3_newsletter = `<p>Google just turned your chatbot history into a transferable asset.</p>
<p>On Thursday, Google <a href="https://x.com/GeminiApp/status/2037247063382167567">launched an import tool for Gemini</a> that lets you transfer your conversation history and saved preferences from ChatGPT or Claude in a few clicks. Your interests, your family members' names, your communication style — all ported over, no starting from scratch.</p>
<p>It's straight out of the telecom playbook. Remember when carriers were forced to let you keep your phone number when you switched? Google is betting that if switching chatbots is just as painless, Gemini's reach will do the rest. And most users are already bouncing between platforms anyway — people use ChatGPT for its interface, Claude for answer quality, and so on. Google doesn't need to win every category. It just needs to make the hop frictionless.</p>
<p>The timing says a lot:</p>
<ul><li>Gemini has <a href="https://techcrunch.com/2026/02/04/googles-gemini-app-has-surpassed-750m-monthly-active-users/">surpassed 750 million monthly active users</a>, but ChatGPT still leads with around 900 million weekly active users.</li><li>Claude is far smaller at roughly 19 million monthly users, but <a href="https://techcrunch.com/2026/03/28/anthropics-claude-popularity-with-paying-consumers-is-skyrocketing/">its paid subscriptions have more than doubled this year</a>.</li><li>Chatbot loyalty is genuinely up for grabs — and Google already has a relationship with practically everyone who uses the internet.</li></ul>
<p>What's worth noting is that the "memory" being ported isn't a settings file — it's a learned relationship. Chatbots shape themselves around your preferences, learning your tone and even telling you what you want to hear. Google's <a href="https://support.google.com/gemini/answer/13594961">privacy policy</a> covers imported data under its standard terms, meaning it could be used to train models unless you opt out.</p>
<div class="vv-header" style="padding:0;"><img src="/thumbnails/valley-view-header.png" alt="Our Valley View" style="display:block;width:35%;height:auto;padding:0;" /></div>
<p>Benchmarks and model updates grab headlines, but the durable advantage in AI may come down to something simpler: who knows you best. Google is betting your chatbot memory is the new moat, and it just made that moat portable. For OpenAI and Anthropic, that's a problem, because Google already has a relationship with practically everyone who uses the internet. The company that wins the chatbot war long-term won't be the one with the smartest model. It'll be the one that's already everywhere you are.</p>`;

// ============ INSERT ARTICLES ============
const newArticles = [
  {
    id: "a-leaked-model-name-crashed-an-entire-sector",
    slug: "a-leaked-model-name-crashed-an-entire-sector",
    title: "A leaked model name crashed an entire sector",
    subtitle: "Anthropic's accidentally exposed Claude Mythos wiped billions off cybersecurity stocks in a single afternoon.",
    author: "Thorium Valley",
    category: "Markets",
    tags: ["Anthropic", "Cybersecurity", "Claude Mythos", "Wall Street"],
    thumbnail_url: "/thumbnails/a-leaked-model-name-crashed-an-entire-sector.png",
    status: "published",
    featured: false,
    content: art1_content,
    newsletter_content: art1_newsletter,
    published_at: "2026-03-29T13:00:00.000Z",
    updated_at: "2026-03-29T13:00:00.000Z",
    reading_time: 3
  },
  {
    id: "every-person-who-built-xai-has-left",
    slug: "every-person-who-built-xai-has-left",
    title: "Every person who built xAI has left",
    subtitle: "The last of Elon Musk's eleven original co-founders just walked out, leaving a $250 billion company with no founding team.",
    author: "Thorium Valley",
    category: "Big Tech",
    tags: ["xAI", "Elon Musk", "SpaceX", "Talent"],
    thumbnail_url: "/thumbnails/every-person-who-built-xai-has-left.png",
    status: "published",
    featured: false,
    content: art2_content,
    newsletter_content: art2_newsletter,
    published_at: "2026-03-29T13:00:00.000Z",
    updated_at: "2026-03-29T13:00:00.000Z",
    reading_time: 2
  },
  {
    id: "google-wants-you-to-dump-chatgpt-and-made-it-easy",
    slug: "google-wants-you-to-dump-chatgpt-and-made-it-easy",
    title: "Google wants you to dump ChatGPT — and made it easy",
    subtitle: "Google's new import tool ports your ChatGPT history into Gemini in clicks, borrowing from the telecom playbook.",
    author: "Thorium Valley",
    category: "Products",
    tags: ["Google", "Gemini", "ChatGPT", "Claude"],
    thumbnail_url: "/thumbnails/google-wants-you-to-dump-chatgpt-and-made-it-easy.png",
    status: "published",
    featured: false,
    content: art3_content,
    newsletter_content: art3_newsletter,
    published_at: "2026-03-29T13:00:00.000Z",
    updated_at: "2026-03-29T13:00:00.000Z",
    reading_time: 2
  }
];

// Prepend new articles
const updatedArticles = [...newArticles, ...articles];
fs.writeFileSync(ART_DB, JSON.stringify(updatedArticles, null, 2));
console.log('✅ 3 articles inserted into articles-db.json');

// ============ BUILD NEWSLETTER ============
const newsletter = {
  id: "march-29-2026",
  slug: "march-29-2026",
  title: "Thorium Valley | March 29, 2026",
  date: "March 29, 2026",
  intro: "Welcome back. Anthropic didn't ship a product last week — it leaked a slide. That was enough to wipe billions off cybersecurity stocks in a single afternoon. Over at xAI, the last of Elon Musk's eleven original co-founders just walked out, leaving a $250 billion company with no one from its founding team still around. And Google is borrowing from the telecom playbook with a new tool that ports your ChatGPT history straight into Gemini — switching chatbots is now as easy as switching carriers. In AI right now, a rumor moves markets, talent walks, and loyalty is up for grabs.",
  toc: [
    "A leaked AI model name crashed an entire sector",
    "Every person who built xAI has left",
    "Google wants you to dump ChatGPT — and made it easy"
  ],
  article_slugs: [
    "a-leaked-model-name-crashed-an-entire-sector",
    "every-person-who-built-xai-has-left",
    "google-wants-you-to-dump-chatgpt-and-made-it-easy"
  ],
  sign_off: "That's all for today. If this issue made you think, share it with someone who needs to think harder.",
  writers: "Jason Chen, Advait Prakash, Andrew Hales, and the Thorium Valley crew.",
  banner_image_url: "/thumbnails/banner-2026-03-29.png",
  published_at: "2026-03-29T13:00:00.000Z",
  updated_at: "2026-03-29T13:00:00.000Z",
  status: "published",
  links: {
    news: [
      { link_text: "Judge blocks Pentagon's ban on Anthropic", url: "https://www.npr.org/2026/03/26/nx-s1-5762971/judge-temporarily-blocks-anthropic-ban", rest: ", calling it 'classic First Amendment retaliation'" },
      { link_text: "Meta boosts its Texas AI data center bet to $10 billion", url: "https://www.cnbc.com/2026/03/26/meta-to-spend-10-billion-on-ai-data-center-in-el-paso-1gw-by-2028.html", rest: ", up from $1.5B last year" },
      { prefix: "Physical Intelligence, a two-year-old robotics startup, is ", link_text: "in talks for an $11 billion valuation", url: "https://www.bloomberg.com/news/articles/2026-03-27/ex-deepmind-staffers-robotics-startup-in-talks-for-11-billion-valuation?srnd=homepage-americas", rest: " — double what it was four months ago" },
      { prefix: "Eli Lilly signs a ", link_text: "$2.75 billion deal with AI drug developer Insilico Medicine", url: "https://reut.rs/4lUIiMW", rest: "" },
      { prefix: "Epstein victims ", link_text: "sue Google, claiming AI Mode exposed their personal information", url: "https://gizmodo.com/epstein-victims-sue-google-claim-ai-mode-exposed-personal-information-2000739177", rest: " to the public" },
      { prefix: "Defense AI startup Shield AI ", link_text: "raises $1.5B at a $12.7 billion valuation", url: "https://techcrunch.com/2026/03/26/defense-startup-shield-ai-lands-12-7b-valuation-up-140-after-u-s-air-force-deal/", rest: " after landing a U.S. Air Force deal" },
      { prefix: "A Florida man ", link_text: "used ChatGPT to sell his house for $955K", url: "https://timesofindia.indiatimes.com/world/us/florida-man-sells-family-home-for-954800-using-chatgpt-100000-above-agent-estimates/articleshow/129872126.cms", rest: " — $100,000 above what real estate agents estimated" },
      { prefix: "Someone ", link_text: "used Claude to reverse-engineer the Apollo 11 moon landing code", url: "https://www.airealist.ai/p/reverse-engineering-the-apollo-11", rest: " — 40,000 lines of 1960s assembly for a computer with 4KB of RAM" }
    ],
    tools: [
      { name: "Codex", url: "https://the-decoder.com/openais-codex-gets-a-plugin-marketplace-for-slack-notion-figma-and-more/", desc: "OpenAI's coding agent now has a plugin marketplace that connects to Slack, Figma, Notion, Gmail, and Google Drive — so it can plan projects, pull designs, and message your team, not just write code" },
      { name: "Notion", url: "https://www.notion.com/releases/2026-03-26", desc: "Version 3.4 adds dashboards for your databases, a presentation mode that turns any doc into a slideshow, and a redesigned sidebar — plus AI agents that can build dashboards for you on command" },
      { name: "Gemini", url: "https://blog.google/innovation-and-ai/products/gemini-app/gemini-drop-march-2026/", desc: "Google's March Drop brings free Personal Intelligence to all U.S. users, Lyria 3 Pro for composing 3-minute music tracks, and faster Gemini Live conversations that hold context twice as long" },
      { name: "Google Ads", url: "https://searchengineland.com/google-brings-its-veo-video-generation-model-to-google-ads-globally-472836", desc: "Advertisers can now use Google's Veo video model to turn static images into 10-second video ads for YouTube — no video production team required" },
      { name: "Glean", url: "https://docs.glean.com/administration/assistant/features/agentic-engine", desc: "The enterprise AI assistant upgraded to a full agentic engine that plans, iterates, and pulls from all your company's knowledge sources to answer complex work questions personalized to your role" }
    ],
    jobs: [
      { company: "Anthropic", role: "Contract Recruiter, Legal", url: "https://flexionis.wuaze.com/job/contract-recruiter-legal" },
      { company: "Hugging Face", role: "AI Public Policy Manager", url: "https://flexionis.wuaze.com/job/ai-public-policy-manager-washington-dc" },
      { company: "Waymo", role: "Group Product Manager, London", url: "https://bulldogjob.com/companies/jobs/234057-group-product-manager-london-waymo" },
      { company: "McKinsey", role: "Director of Data Science, Analytics Innovation", url: "https://www.mckinsey.com/careers/search-jobs/jobs/directorofdatascience-analyticsinnovationretailcpg-96613?appsource=Circa" }
    ]
  },
  games: {
    game_poll_id: "cbe79af3-9f10-430d-b6cc-89a6f5c15ffa",
    image_a: "/thumbnails/kicker-2026-03-29-real.jpg",
    image_b: "/thumbnails/kicker-2026-03-29-ai.jpeg",
    link_a: "https://unsplash.com/photos/a-majestic-tiered-waterfall-cascades-down-a-rocky-mountainside-0E6MhYNr7qY",
    link_b: "https://gemini.google.com/share/be9c2825e946"
  },
  poll: {
    poll_id: "f17b3410-6a77-41a6-acc4-2500abd133df",
    question: "Would you trust an AI agent to work on your computer unsupervised?",
    options: ["Already do", "Not a chance", "Maybe someday", "Other"]
  },
  poll_results: {
    question: "Would you trust an AI agent to work on your computer unsupervised?",
    results: [
      { option: "Yes", pct: 100 },
      { option: "No", pct: 0 },
      { option: "Other", pct: 0 }
    ]
  },
  yesterdays_results: {
    ai_image: "/thumbnails/kicker-2026-03-27-ai.jpeg",
    real_image: "/thumbnails/kicker-2026-03-27-real.jpg",
    ai_source: "https://gemini.google.com/share/8c57f490dff2",
    real_source: "https://unsplash.com/photos/a-person-walks-along-a-wooded-path-beside-a-stream-leV1WkdqYik"
  }
};

// Prepend newsletter
const updatedNewsletters = [newsletter, ...newsletters];
fs.writeFileSync(NL_DB, JSON.stringify(updatedNewsletters, null, 2));
console.log('✅ Newsletter entry inserted into newsletters-db.json');
console.log('');
console.log('Pipeline ingestion complete for March 29, 2026!');
