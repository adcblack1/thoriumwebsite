# Thorium Valley | February 23, 2026

Welcome back. Artificial Analysis just overhauled its Intelligence Index — the scorecard many use to rank AI models — and the results are humbling. They replaced older academic-style benchmarks with real-world evaluations, and suddenly top models are scoring 50 or below on a 100-point scale. Some of these same models were posting scores in the high 80s on the old tests. Turns out they'd gotten really good at passing exams without necessarily being useful. The AI equivalent of acing the SAT but struggling to file your taxes.

IN TODAY'S NEWSLETTER
1. Apple Paid Google $1B. Siri Still Doesn't Work.
2. Most AI Agent Projects Are Headed for the Trash
3. The People Building AI Are Walking Out

---

BIG TECH

# Apple Paid Google $1B. Siri Still Doesn't Work.

Apple bet big that it could buy its way into the AI race. So far, it's getting a very expensive lesson in why that's harder than it sounds.

Bloomberg's Mark Gurman [reported](https://www.bloomberg.com/news/articles/2026-02-12/apple-s-latest-attempt-to-launch-new-siri-hit-snags) that the Gemini-powered Siri overhaul keeps failing internal tests — falling back to ChatGPT mid-conversation, cutting users off in the middle of sentences, and generally behaving like an assistant that doesn't know which brain it's supposed to be using. Apple has now missed its self-imposed deadline for the third time.

This was supposed to be the fix. Last November, Apple struck a deal to pay Google [roughly $1 billion a year](https://www.bloomberg.com/news/articles/2025-11-06/apple-nears-deal-to-pay-google-roughly-1-billion-a-year-for-siri-ai-model) for access to a custom 1.2 trillion parameter Gemini model — the engine that would turn Siri into something that could compete with ChatGPT, Claude, and Gemini's own chatbot. The revamped Siri, code-named "Campos," was expected to roll out with iOS 26.4 this spring. That timeline is now in serious jeopardy.

The delays have become a pattern. At WWDC in June 2024, Apple [unveiled](https://www.apple.com/newsroom/2024/06/introducing-apple-intelligence-for-iphone-ipad-and-mac/) a new Siri with on-screen awareness, personal context, and the ability to take action across apps. It was supposed to ship with iOS 18, then slipped to April 2025, then slipped again. Over a year and a half later, the features Apple promised on stage still aren't in anyone's hands.

The core problem is architectural. Apple is trying to stitch together its own on-device models, Google's cloud-based Gemini, and OpenAI's ChatGPT into a single coherent assistant. When Siri can't handle a query with Gemini, it's supposed to gracefully hand off to ChatGPT. In practice, those handoffs are anything but graceful. Apple has published [its own AI research](https://www.arxiv.org/abs/2507.13575), but its strategy has been clear: rather than building a frontier model from scratch, Apple chose to be a buyer, not a builder — betting that its ecosystem and hardware would make up the difference.

Meanwhile, the competition isn't waiting. Samsung's [Galaxy S26 Ultra](https://news.samsung.com/global/galaxy-unpacked-2026-experience-the-new-era-of-mobile-ai) is leaning heavily into agentic on-device AI. And OpenAI is building its own hardware — a Jony Ive-designed smart speaker with a camera, [slated for 2027](https://www.macrumors.com/2026/02/20/jony-ive-openai-smart-speaker-2027/). Altman called it ["the coolest piece of technology that the world will have ever seen"](https://www.macrumors.com/2026/02/20/jony-ive-openai-smart-speaker-2027/) — peak Altman hyperbole, but the intent is real: OpenAI wants to live on your kitchen counter, not just your phone. The design philosophy emphasizes a calm, [non-intrusive AI presence](https://www.theinformation.com/articles/openai-and-jony-ive-work-on-consumer-device-that-could-be-smart-speaker) in your home — a direct shot at territory Apple has owned for decades.

The irony is thick. Apple popularized the modern voice assistant with Siri in 2011 and is now scrambling to catch up with the companies it once inspired. The billion-dollar check to Google hasn't accelerated the timeline — if anything, it's added a layer of dependency making things harder.

**Our Valley View**

Apple's "buy not build" AI strategy made sense on paper: why spend years and billions developing a frontier model when Google already has one? But software integration is where Apple's legendary discipline was supposed to shine, and instead it's where the whole thing is falling apart. The longer Siri stays broken, the more iPhone users build habits around ChatGPT and Claude — habits that won't easily reverse even if Campos eventually ships. Apple still has the most valuable distribution channel in tech, with more than a billion active devices. But distribution only matters if you have something worth distributing. Right now, Apple is paying $1 billion a year for an AI brain that its own body keeps rejecting.

---

MARKETS

# Most AI agent projects are headed for the trash

The hottest buzzword in enterprise tech is "AI agent" — and most of what's being sold under that label barely qualifies.

[Gartner predicts](https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027) that more than 40% of agentic AI projects will be scrapped or significantly reworked by 2027, and of the thousands of companies now marketing agent products, roughly 130 are building something that actually meets the bar. The rest is what the industry is calling "agent washing" — vendors rebranding chatbots and basic automation as agents, banking on the fact that most buyers can't tell the difference.

The disconnect goes deeper than labeling. [McKinsey's 2025 Global Survey on AI](https://www.mckinsey.com/~/media/mckinsey/business%20functions/quantumblack/our%20insights/the%20state%20of%20ai/november%202025/the-state-of-ai-2025-agents-innovation_cmyk-v1.pdf) found just 23% of companies have scaled agentic AI beyond the pilot stage — three out of four organizations are stuck testing and spending without much to show for it.

"Agents are not simply magical plug-n-play pieces," Mistral AI CEO Arthur Mensch wrote in a [McKinsey report on agentic AI](https://www.mckinsey.com/~/media/mckinsey/business%20functions/quantumblack/our%20insights/seizing%20the%20agentic%20ai%20advantage/seizing-the-agentic-ai-advantage-june-2025.pdf). "They must work across systems, reason through ambiguity, and interact with people — not just as tools, but as collaborators." [Thomson Reuters illustrated the problem](https://www.thomsonreuters.com/en/insights/articles/premortem-your-2028-agentic-ai-pilot-program-failed) in a fictional "premortem" showing how agentic pilots collapse when firms underestimate cross-system integration, ambiguity handling, and messy human inputs.

Spending enthusiasm is cooling accordingly. As the [Wall Street Journal reported](https://www.wsj.com/articles/selling-ai-software-isnt-as-easy-as-it-used-to-be-4933e401), the golden age of unbridled AI software spending may be over, with vendors saying sales are much harder to close.

None of this means agentic AI is vaporware. The companies taking it seriously are digging in:

* Expedia flagged in its [latest 10-K filing](https://www.sec.gov/Archives/edgar/data/1324424/000132442426000008/expe-20251231.htm) that the rapid emergence of agentic AI is "likely to further intensify competition," warning that new entrants could deploy AI-driven travel capabilities faster than incumbents.
* OpenAI is [launching 'Frontier Alliances'](https://openai.com/index/frontier-alliance-partners/) with Accenture, BCG, Capgemini, and McKinsey to push enterprise AI past the pilot phase — a tacit admission that even its best models don't sell themselves.
* Inside Salesforce, a [company survey](https://www.businessinsider.com/salesforce-survey-employees-ai-impact-tasks-output-2026-2) found employees are producing more with AI tools, but the work itself isn't getting easier — suggesting AI is adding output without reducing effort.

**Our Valley View**

The coming shakeout will thin the herd, and that's a good thing for enterprises tired of wading through snake oil. The real agents — ones that can navigate messy systems and make judgment calls without a human babysitter — will earn their keep. Everyone else will quietly rebrand as "AI-powered workflows" and hope nobody remembers the pitch deck.

---

GOVERNANCE

# The People Building AI Are Walking Out

A pattern has taken shape at the industry's biggest labs: safety researchers, founding members, and senior technical staff keep heading for the exits.

At xAI, [roughly half of the original 12-person founding team has departed](https://techcrunch.com/2026/02/10/okay-now-exactly-half-of-xais-founding-team-has-left-the-company/) amid [internal pressure](https://www.businessinsider.com/elon-musk-xai-leadership-style-big-year-grok-ipo-spacex-2026-2) ahead of a potential SpaceX-xAI deal. Anthropic [lost its head of Safeguards Research](https://www.forbes.com/sites/conormurray/2026/02/09/anthropic-ai-safety-researcher-warns-of-world-in-peril-in-resignation/), who warned publicly that "the world is in peril." OpenAI has seen a steady stream of safety-focused departures — so many they barely register as news. These are the people whose job it was to make sure powerful AI doesn't go sideways.

And the people who *stay* are raising red flags, too. Boris Cherny, head of Claude and creator of Claude Code, [said on Lenny's Podcast](https://www.lennysnewsletter.com/p/head-of-claude-code-what-happens) that AI agents will "transform every computer-based job" and the change will be "painful." "As a society, this is a conversation we have to figure out together," Cherny said.

The labs, meanwhile, aren't pumping the brakes.

* OpenAI CEO Sam Altman recently [said at an AI conference](https://www.nytimes.com/2026/02/21/technology/ai-boom-backlash.html) that AI adoption has been "surprisingly slow" — a remarkable framing from a company that keeps losing safety staff.
* Nvidia CEO Jensen Huang [conceded on the No Priors podcast](https://www.nopriors.com/) that "the battle of narratives is being won by the critics" — an unusual admission from the man whose chips power the AI boom.

For businesses already deep into AI adoption, the governance picture is sobering. A [Thomson Reuters report](https://www.thomsonreuters.com/en-us/posts/sustainability/ai-governance-gap-esg-risks/) found only 41% of organizations made their AI policies accessible to employees or even required acknowledgment they exist. "These policies are just words on paper if they are not understood, embraced, and actively practiced," said Katie Fowler, director of responsible business at the Thomson Reuters Foundation.

![]

The AI industry loves to talk about "alignment" — making sure AI does what humans want. But there's a different alignment problem nobody's addressing: the growing gap between the people who build these systems and the executives racing to ship them. When safety researchers quit faster than you can hire them, that's not a retention issue. It's a canary in the coal mine. The question is whether the people still inside are paying attention.

---

That's all for today. If this issue made you think, share it with someone who needs to think harder.

Written by Jason Chen, Advait Prakash, Andrew Hales, and the Thorium Valley crew.

Got a tip, a correction, or a strong opinion? Reply directly — we read every one.
