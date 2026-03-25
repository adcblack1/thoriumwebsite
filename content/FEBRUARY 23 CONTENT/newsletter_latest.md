# Thorium Valley | February 22, 2026

Welcome back. Jensen Huang is doing the tech CEO equivalent of shaking a wrapped present in front of you. In an interview last week, the NVIDIA chief teased that "a chip that will surprise the world" will be unveiled at GTC next month. No specifics—that would ruin the buildup. But the AI chip race is moving fast enough that even a grain of salt might be underselling the hype.

IN TODAY'S NEWSLETTER
1. The Most Popular AI Tool Is a Security Disaster
2. China's AI Video App Just Lawyered Up Hollywood
3. Use AI or Lose Your Promotion. Accenture Made It Official.

---

GOVERNANCE

# Big Tech is banning OpenClaw

The AI agent that broke the internet is getting kicked off company networks.

Just months after OpenClaw became the fastest-growing project in GitHub history, Meta and several other tech firms have [restricted or outright banned](https://www.wired.com/story/openclaw-banned-by-tech-companies-as-security-concerns-mount/) employees from using it on company hardware. The culprit: a growing pile of security vulnerabilities that makes the platform a liability for any organization touching sensitive data.

OpenClaw lets you set up AI agents that automate entire workflows — clearing your inbox, syncing apps, drafting replies in your voice. It [hit 200,000 GitHub stars](https://openclaw.report/news/openclaw-200k-github-stars) in under three months, with people buying dedicated Mac Minis just to run it. But the same openness that made it a viral sensation is now its biggest liability.

Internal memos are circulating across the industry. Massive CEO Jason Grad [warned employees](https://www.wired.com/story/openclaw-banned-by-tech-companies-as-security-concerns-mount/): "While cool, it is currently unvetted and high-risk for our environment. Please keep Clawdbot off all company hardware and away from work-linked accounts."

The fears are well-grounded. Censys researchers [identified more than 21,000 publicly exposed OpenClaw instances](https://censys.com/blog/openclaw-in-the-wild-mapping-the-public-exposure-of-a-viral-ai-assistant) sitting on the open internet — agents with their front doors unlocked. Cisco researchers demonstrated that a malicious plug-in could rise to the top spot in OpenClaw's skill marketplace while actively siphoning user data. And the problem extends beyond OpenClaw: a [study of more than 31,000 AI agent plug-ins](https://arxiv.org/abs/2601.10338) across two major marketplaces found that 26.1% contained at least one security vulnerability.

A community-built tool called [SecureClaw](https://github.com/adversa-ai/secureclaw) has launched to help users lock down deployments, but it's a Band-Aid on a structural problem. Meanwhile, OpenAI [hired OpenClaw creator Peter Steinberger](https://steipete.me/posts/2026/openclaw) and is establishing a foundation to steward the project — a bet that OpenClaw's potential outweighs its current mess.

Guy Pistone, CEO of enterprise AI firm Valere, [summed up](https://www.wired.com/story/openclaw-banned-by-tech-companies-as-security-concerns-mount/) the tension: "Whoever figures out how to make it secure for businesses is definitely going to have a winner."

OpenClaw's crisis is a preview of the security reckoning heading for every AI agent platform. As these tools gain deeper access to our data and systems, the attack surface compounds. The fundamental tension between open-source accessibility and enterprise-grade security is the defining challenge of the agentic era — and right now, nobody's solved it.

---

CULTURE

# ByteDance made Tom Cruise fight Brad Pitt. Hollywood is not amused.

A viral clip from ByteDance's Seedance 2.0 showing hyper-realistic depictions of Tom Cruise and Brad Pitt trading punches racked up millions of views last week and set off alarm bells across the entertainment industry. Neither actor consented or was compensated — and the quality was good enough to [spook even veteran filmmakers](https://www.nytimes.com/2026/02/16/movies/tom-cruise-brad-pitt-artificial-intelligence-seedance.html).

"For all of us who work in the industry and devoted our careers and lives to it, I just think it's nothing short of terrifying," said Rhett Reese, the screenwriter behind the *Deadpool* franchise. "I could just see it costing jobs all over the place."

Seedance 2.0 generates cinema-quality video with sound and dialogue from simple text prompts. Users quickly churned out clips featuring Spider-Man, Will Smith and other protected figures, prompting Disney and Paramount to [fire off cease-and-desist letters](https://www.axios.com/2026/02/14/disney-cease-desist-bytedance-seedance-copyright). SAG-AFTRA, which fought a 118-day strike in 2023 largely over AI protections, called Seedance 2.0 a tool that [disregards "law, ethics, industry standards and basic principles of consent."](https://www.sagaftra.org/sag-aftra-statement-seedance-20)

ByteDance [told the BBC](https://www.bbc.com/news/technology-2026-02-16-bytedance-seedance) it "respects intellectual property rights" and is "taking steps to strengthen current safeguards" — but notably did not take the tool offline.

The contrast with U.S. labs is the whole story in miniature. Months earlier, OpenAI [announced a landmark licensing deal](https://openai.com/index/disney-sora-agreement) with Disney to bring characters into Sora and ChatGPT Images *with* authorization. American AI companies are, however grudgingly, learning to play ball with content owners. Chinese platforms, operating under a different legal framework and far from Hollywood's lawyers, don't face the same pressure.

Dan Neely, CEO of AI consultancy Vermillio, [told Axios](https://www.axios.com/2026/02/19/hollywood-chinese-ai-bytedance-seedance) the situation "feels like another DeepSeek and Sora 2 moment, where the real issue is not just model capability but who sets the default." U.S. copyright law and [right-of-publicity protections](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4686869) give studios and actors real legal tools domestically — but a cease-and-desist to a company headquartered in Beijing, operating servers in China, carries about as much weight as a sternly worded tweet.

**Our Valley View:** Hollywood's IP fight is no longer just about American AI labs that can be sued into licensing deals. It's about Chinese platforms that can build tools of staggering capability and release them to millions before a single lawyer picks up the phone. The OpenAI-Disney deal proves the consent-based model *can* work — but only when both parties are playing under the same rules. ByteDance will strengthen its filters just enough to quiet the noise. The next Seedance moment, though, is a matter of when, not if. And next time, the fake fight might not be between movie stars — it might be your CEO in a video you never authorized.

---

WORKFORCE

# Use AI or Lose Your Promotion. Accenture Made It Official.

The world's largest consulting firm is done asking nicely. Accenture has told senior staff that "regular adoption of AI would be required to progress to leadership positions," [the Financial Times reported](https://www.ft.com/content/accenture-promotions-ai-mandate) on Wednesday. The company is now tracking weekly AI tool logins and feeding that data directly into promotion decisions.

Accenture isn't alone. Meta has reportedly begun linking AI usage to performance reviews and bonuses. And McKinsey CEO Bob Sternfels [said last month](https://hbr.org/podcast/2026/01/where-mckinsey-and-consulting-go-from-here) that his firm has launched tens of thousands of internal AI agents and eventually plans to have one for each of its 40,000-plus employees. The message from the C-suite is clear: the era of optional AI experimentation is over.

**But here's the awkward part.** The productivity boom that's supposed to justify all of this? It hasn't shown up yet.

A [National Bureau of Economic Research study](https://www.nber.org/papers/w34836) of nearly 6,000 CEO and executive responses found that AI has had essentially no measurable impact on employment or productivity at the macroeconomic level. "[AI is everywhere except in the incoming macroeconomic data](https://www.apolloacademy.com/waiting-for-the-ai-j-curve/)," said Torsten Slok, chief economist at Apollo. Nobel laureate Daron Acemoglu has echoed the sentiment — calling AI's projected 0.5% productivity gain over a decade real but "disappointing relative to the promises" being made.

A [BCG survey](https://www.bcg.com/publications/2026/as-ai-investments-surge-ceos-take-the-lead) of 2,400 executives found that while AI adoption is surging, most companies still can't translate it into measurable business value — and [the gap](https://media-publications.bcg.com/The-Widening-AI-Value-Gap-Sept-2025.pdf) between companies capturing AI value and those still searching for it is actually widening.

Even Microsoft is wrestling with this disconnect. Jared Spataro, who leads Microsoft's AI at Work efforts, [acknowledged](https://www.investing.com/news/transcripts/microsoft-at-goldman-sachs-conference-ai-strategy-and-copilot-vision-93CH-4234626) he was struggling to show Copilot ROI "because a lot of knowledge work doesn't translate directly into top-line or bottom-line figures." Meanwhile, his colleague Mustafa Suleyman [declared](https://www.ft.com/content/microsoft-mustafa-suleyman-ai-automation-interview) that most tasks involving "sitting down at a computer" will be fully automated within 18 months. Same company. Months apart.

Anthropic CEO Dario Amodei has [doubled down](https://www.darioamodei.com/essay/the-adolescence-of-technology) on his warning that AI's impact on jobs is coming fast, arguing that current macro data simply lags behind what the technology can already do.

Accenture's mandate is a big bet. The company is telling 784,000 employees that AI fluency is a condition of advancement, even as the evidence that AI meaningfully boosts white-collar productivity remains thin. If the productivity boom materializes, Accenture will look like a visionary. If it doesn't, it will have built a promotion system around tool logins rather than job performance. For everyone outside Accenture, the lesson is simpler: whether or not AI is making you more productive today, your employer increasingly believes it should be — and plans to manage you accordingly.

---

That's all for today. If this issue made you think, share it with someone who needs to think harder.

Written by Jason Chen, Advait Prakash, Andrew Hales, and the Thorium Valley crew.

Got a tip, a correction, or a strong opinion? Reply directly — we read every one.
