# Thorium Valley | March 03, 2026

Welcome back. The Pentagon has given Anthropic until Friday to drop Claude's safety restrictions for military use — or face the Defense Production Act or a blacklist from federal contractors. The legal footing is shaky, but the pressure is real. Meanwhile, Anthropic just plugged Claude Cowork into Salesforce, Slack, Excel, and a dozen other enterprise tools, betting that AI agents failed in 2025 not because the idea was wrong but because the approach was. And Google quietly shipped something Apple promised two years ago and never delivered: Gemini can now book your Uber, order your DoorDash, and run real errands inside Android apps. It still asks before it spends your money, though.

IN TODAY'S NEWSLETTER
1. Anthropic's Friday deadline: bend or break
2. Claude Cowork plugs into your entire workflow
3. Gemini can now run your errands on Android

---

PRODUCTS

# Claude Cowork now finishes what it starts

Anthropic is done building an AI that hands you a rough draft and wishes you luck.

On Tuesday, the company [announced a major expansion of Claude Cowork](https://claude.com/blog/cowork-plugins-across-enterprise), its AI agent platform, with a new plugin system that connects Claude directly to enterprise tools people actually use: Salesforce, Slack, Excel, PowerPoint, Google Workspace and more. Instead of copying Claude's output into another app, Claude now reaches into those apps itself — pulling sales data, updating project boards, building slide decks.

The goal, according to Anthropic's head of product for Claude Enterprise, is to move past drafts and suggestions to [actual completed deliverables](https://venturebeat.com/ai/anthropic-says-claude-code-transformed-programming-now-claude-cowork-is-coming-for-the-rest-of-the-enterprise/). The company was unusually candid about what changed: 2025 was supposed to be the year agents transformed the enterprise, but Anthropic now admits the hype was premature — "a failure of approach," not effort, as head of Americas Kate Jensen [put it](https://venturebeat.com/ai/anthropic-says-claude-code-transformed-programming-now-claude-cowork-is-coming-for-the-rest-of-the-enterprise/). Plugins are the new approach.

There's already evidence this isn't just a developer tool. At Epic, the healthcare tech company behind MyChart, over half of Claude Code usage now comes from non-developer roles, [according to Seth Hain](https://venturebeat.com/ai/anthropic-says-claude-code-transformed-programming-now-claude-cowork-is-coming-for-the-rest-of-the-enterprise/). And agents are working longer without checking in: Anthropic's [own research](https://www.anthropic.com/research/measuring-agent-autonomy) found that the longest Claude Code sessions nearly doubled between October 2025 and January 2026, from under 25 to over 45 minutes. Not long enough to manage your whole day, but the trajectory is steep.

Longer sessions and deeper tool access raise accountability questions. Anthropic says its guardrails are keeping pace — [80% of agent tool calls include at least one safeguard](https://www.anthropic.com/research/measuring-agent-autonomy), and only 0.8% of actions appear irreversible. But as Steve Hasker of Thomson Reuters [noted](https://venturebeat.com/ai/anthropic-says-claude-code-transformed-programming-now-claude-cowork-is-coming-for-the-rest-of-the-enterprise/), "The tools are in many senses ahead of the change management." A general counsel's office or audit firm needs to rewire how it works before it can truly take advantage.

**OUR VALLEY VIEW**

Anthropic's real play here isn't the plugins. It's becoming the intelligence layer between you and every tool you use at work, a platform move that, if it sticks, makes Claude as hard to leave as your email client. The question is whether organizations can rewire their processes fast enough to keep up with what the technology already offers. JPMorgan recently assessed that full agentic replacement of enterprise software is a post-2028 story at the earliest. Anthropic is betting it can get you hooked well before then.

---

CONSUMER

# Gemini can now run your errands on Android

For a decade, your phone's voice assistant has been mostly useless for anything beyond setting a timer. Google just quietly changed that.

On Tuesday, Google [announced](https://blog.google/products-and-platforms/platforms/android/samsung-unpacked-2026/) that Gemini can now complete multi-step tasks inside third-party Android apps on your behalf. Book an Uber, place a DoorDash order, add a calendar event — all from a single prompt. The feature launches on the Samsung Galaxy S26 and Pixel 10.

"I refer to some of the tasks that you might want to have automated as sort of digital laundry — things that you know you need to do, but are not necessarily excited about finishing," Sameer Samat, president of the Android Ecosystem at Google, [told WIRED](https://www.wired.com/story/google-gemini-task-automation-galaxy-s26-uber-doordash/).

If you're thinking "didn't Siri promise this years ago?", you're not wrong. Apple [announced remarkably similar capabilities](https://www.theverge.com/tech/884703/google-samsung-galaxy-s26-gemini-apple-siri) at its developer conference back in 2024. Those features have been delayed repeatedly and still haven't shipped.

Google's approach works differently from the old playbook. Rather than requiring custom integrations with every app, Gemini visually navigates apps the way you would — tapping buttons, filling fields, scrolling through options. It runs each app in a [secure virtual window](https://9to5google.com/2026/02/25/gemini-automation-android/) walled off from your photos, messages and everything else, with processing handled in the cloud. Crucially, Gemini doesn't actually press "buy." It prepares everything — fills the cart, picks the ride, queues the order — then [sends a notification](https://9to5google.com/2026/02/25/gemini-automation-android/) asking you to review and confirm. The human stays in the loop for the part that costs money.

On the device side, the Galaxy S26 pushes deeper with Samsung integration — users can ask Gemini to find and add events to their calendar, pull YouTube summaries, and work across Samsung and Google apps, Samsung product manager Charles Uptegrove [told CNBC](https://www.cnbc.com/2026/02/25/samsung-s26-launch-gemini-ai-apple-siri.html). The potential audience is enormous: Google says its AI features already reach more than [580 million Android devices](https://blog.google/products-and-platforms/platforms/android/samsung-unpacked-2026/) through Circle to Search alone.

Still, temper expectations. Google's own [AndroidWorld benchmark research](https://arxiv.org/html/2405.14573v3) found the best autonomous Android agent completed only about 31% of tasks successfully, versus 80% for humans. That gap likely explains why Google is starting with just three task categories and keeping the confirmation step firmly in place. IDC analyst Nabila Popal [told CNN](https://www.cnn.com/2026/02/25/tech/samsung-galaxy-s26-ai-google-gemini) that phone makers focusing here "makes complete sense, because that is where we are headed."

**OUR VALLEY VIEW**

Google has spent years announcing AI features that sounded great on stage and underwhelmed in your hand. What's different this time is the restraint. The sandbox, the confirmation step, the narrow launch categories — it all signals Google knows the cost of getting this wrong is higher than the cost of shipping slowly. The real question isn't whether Gemini can book you an Uber. It's whether it can do it reliably enough, across enough apps, that you stop thinking twice and just let it handle the digital laundry. If it can, Google will have finally delivered on a promise the entire industry has been making since 2014.

---

GOVERNANCE

# Anthropic's Friday deadline: bend or break

The Pentagon has given Anthropic until Friday to drop Claude's safety restrictions for military use — or face being blacklisted from government contracts.

Defense Secretary Pete Hegseth has given Anthropic CEO Dario Amodei until Friday to drop Claude's safety restrictions for military applications, [according to CNBC](https://www.cnbc.com/2026/02/24/anthropic-ai-hegseth-spying-defense.html). If Anthropic refuses, the Pentagon is weighing two escalation paths: invoking the Defense Production Act to compel compliance, or designating Anthropic a "supply chain risk." One senior official [told Axios](https://www.axios.com/2026/02/24/anthropic-pentagon-claude-hegseth-dario) the agency is "going to make sure they pay a price for forcing our hand like this."

The legal ground is far less certain. Using the DPA to compel a company to produce a product it deems unsafe would be "without precedent," per the Vanderbilt Policy Accelerator. A [2021 case](https://ecf.dcd.uscourts.gov/cgi-bin/show_public_doc?2021cv0280-21) involving Xiaomi's security risk designation still [wiped 10.26%](https://ecf.dcd.uscourts.gov/cgi-bin/show_public_doc?2021cv0280-21) off its market cap. Anthropic, valued at $380 billion with an IPO on the horizon, faces potentially steeper consequences. The $200 million contract at stake is 1.4% of its revenue. The contract isn't the weapon. The designation is.

While the standoff grabbed headlines, Anthropic [published version 3.0 of its Responsible Scaling Policy](https://www.anthropic.com/news/responsible-scaling-policy-v3), quietly gutting the commitment that defined it. The [previous version](https://assets.anthropic.com/m/24a47b00f10301cd/original/Anthropic-Responsible-Scaling-Policy-2024-10-15.pdf) required a hard pause if Claude's capabilities outpaced safety measures. Version 3.0 replaces that with a cost-benefit weighing. Chief Science Officer Jared Kaplan was [candid](https://www.anthropic.com/news/responsible-scaling-policy-v3) about why: holding the line while competitors raced ahead "would not help them keep up in the AI race." On the same day as the Pentagon meeting, Anthropic also launched a [major enterprise product expansion](https://www.reuters.com/business/finance/anthropic-touts-new-ai-tools-weeks-after-legal-plug-in-spurred-market-rout-2026-02-24/).

**OUR VALLEY VIEW**

The $200 million Pentagon contract is a rounding error on Anthropic's balance sheet. The supply chain risk designation is the real weapon, a financial kill switch that could spook the enterprise customers keeping the lights on. But the larger question isn't whether Anthropic folds on one military deal. It's that any AI company can now face government coercion over its safety decisions, with no legal framework to referee the dispute. Anthropic's RSP was supposed to be the industry's moral floor. The fact that Anthropic itself quietly rewrote it before the deadline even arrived tells you everything about who's winning.

---

That's all for today. If this issue made you think, share it with someone who needs to think harder.

Written by Jason Chen, Advait Prakash, Andrew Hales, and the Thorium Valley crew.

Got a tip, a correction, or a strong opinion? Reply directly — we read every one.
