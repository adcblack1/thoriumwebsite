GOVERNANCE

# Big Tech is banning OpenClaw

The AI agent that broke the internet is getting kicked off company networks.

Just months after OpenClaw — the open-source platform that lets anyone run autonomous AI agents around the clock — became the fastest-growing project in GitHub history, Meta and several other tech firms have [restricted or outright banned](https://www.wired.com/story/openclaw-banned-by-tech-companies-as-security-concerns-mount/) employees from using it on company hardware. The culprit: a growing pile of security vulnerabilities that makes the platform a liability for any organization touching sensitive data.

If you missed the hype cycle: OpenClaw (which started life as WhatsApp Relay, then Clawd, then Moltbot) lets you set up AI agents that automate entire workflows — clearing your inbox, syncing your apps, drafting replies in your voice. It [hit 200,000 GitHub stars](https://openclaw.report/news/openclaw-200k-github-stars) in under three months. People were buying dedicated Mac Minis just to run it.

But the same openness that made OpenClaw a viral sensation is now its biggest liability.

Internal memos are making the rounds across the industry. Jason Grad, cofounder and CEO of Massive, [warned employees](https://www.wired.com/story/openclaw-banned-by-tech-companies-as-security-concerns-mount/): "You've likely seen Clawdbot trending on X/LinkedIn. While cool, it is currently unvetted and high-risk for our environment. Please keep Clawdbot off all company hardware and away from work-linked accounts."

The fears are well-grounded. Censys security researchers [identified more than 21,000 publicly exposed OpenClaw instances](https://censys.com/blog/openclaw-in-the-wild-mapping-the-public-exposure-of-a-viral-ai-assistant) sitting on the open internet — AI agents with their front doors essentially unlocked. Cisco researchers took it further, demonstrating that a malicious plug-in could rise to the top spot in OpenClaw's skill marketplace while actively siphoning user data in the background. Imagine a five-star app in the App Store that's quietly reading your texts.

And the problem extends well beyond OpenClaw. A [study of more than 31,000 AI agent plug-ins](https://arxiv.org/abs/2601.10338) across two major marketplaces found that over one in four — 26.1% — contained at least one security vulnerability. When you're handing an AI agent the keys to your email, calendar and file systems, that's not an abstract concern. It's a live wire.

- A community-built security tool called [SecureClaw](https://github.com/adversa-ai/secureclaw) has launched to help users lock down their deployments, but it's a Band-Aid on a structural problem.
- Meanwhile, OpenAI [hired OpenClaw creator Peter Steinberger](https://steipete.me/posts/2026/openclaw) and is establishing a foundation to steward the project's development — a bet that OpenClaw's potential outweighs its current mess.

Guy Pistone, CEO of enterprise AI firm Valere, [summed up](https://www.wired.com/story/openclaw-banned-by-tech-companies-as-security-concerns-mount/) the tension many companies are feeling: "If we don't think we can do it in a reasonable time, we'll forgo it. Whoever figures out how to make it secure for businesses is definitely going to have a winner."

OpenClaw's crisis isn't really about OpenClaw — it's a preview of the security reckoning heading for every AI agent platform. As these tools gain deeper access to our data and systems, the attack surface doesn't just grow — it compounds. OpenAI bringing Steinberger in-house suggests the company sees the project as worth saving, not scrapping. But the fundamental tension between open-source accessibility and enterprise-grade security is the defining challenge of the agentic era — and right now, nobody's solved it.