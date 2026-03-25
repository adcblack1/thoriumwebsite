BIG TECH

# Two engineers built OpenAI's most-used internal tool

Even the company building the world's most advanced AI couldn't find its own data.

OpenAI has more than 4,000 employees, 600 petabytes of data, and 70,000 datasets. For a while, the people building the future of AI were stuck doing what everyone else does: hunting through similar-looking tables trying to figure out which one actually had what they needed.

"We have a lot of tables that are fairly similar, and I spend tons of time trying to figure out how they're different and which to use," one internal user [said](https://openai.com/index/inside-our-in-house-data-agent/). "Some include logged-out users, some don't."

Two engineers fixed it. They built an internal data agent — an AI that lets anyone at OpenAI ask questions about company data in plain English — and it quietly became the most widely used tool at the company, now serving [more than 3,500 users](https://openai.com/index/inside-our-in-house-data-agent/) across engineering, product, and research.

"The agent is used for any kind of analysis," Emma Tang, OpenAI's head of data infrastructure, [said](https://venturebeat.com/orchestration/openais-ai-data-agent-built-by-two-engineers-now-serves-4-000-employees-and). "Almost every team in the company uses it."

The agent was built using the same tools OpenAI sells to outside developers — GPT-5.2, Codex, and the Embeddings API — with roughly [70% of its code AI-generated](https://venturebeat.com/orchestration/openais-ai-data-agent-built-by-two-engineers-now-serves-4-000-employees-and). One of its best features is a memory layer that learns which tables to use over time. Without it, a routine query about ChatGPT Image Gen's logged-in daily active users took over 22 minutes. With memory enabled, the same question [took 82 seconds](https://openai.com/index/inside-our-in-house-data-agent/).

OpenAI made a point of noting that none of this required secret internal technology, describing the tools as ["the same tools we make available to developers everywhere."](https://openai.com/index/inside-our-in-house-data-agent/)

Every large company is chasing some version of this. AI that can sit on top of messy, sprawling data and make it useful without routing every question through an analytics team. Snowflake built its [Intelligence platform](https://www.snowflake.com/en/news/press-releases/snowflake-intelligence-and-data-science-agent-deliver-the-next-frontier-of-data-agents-for-enterprise-ai-and-ml/) with data agents designed for exactly this. Baris Gultekin, Snowflake's Head of AI, said the prerequisite is an "AI-ready information ecosystem" where enterprise data is unified and governed enough for agents to actually work with. Chevron is already there: analyst Ben Vander Heide said moving to a cloud-based data stack "has fundamentally changed how we approach data analytics," letting teams move from [legacy systems to agent-ready infrastructure](https://www.thoughtspot.com/press-releases/thoughtspot-unveils-dataspot-to-accelerate-agentic-analytics-for-every-databricks-customer).

The catch is trust. If AI is writing more of the code powering these systems, somebody needs to verify it works. A [Sonar survey](https://www.sonarsource.com/company/press-releases/sonar-data-reveals-critical-verification-gap-in-ai-coding/) of more than 1,100 developers found that 96% don't fully trust AI-generated code, yet only 48% always review it before shipping. And 88% cite negative impacts, specifically regarding the generation of code that looks correct but isn't reliable, or is unnecessary and duplicative.

"Value is no longer defined by the speed of writing code, but by the confidence in deploying it," Tariq Shaukat, CEO of Sonar, [said](https://www.sonarsource.com/company/press-releases/sonar-data-reveals-critical-verification-gap-in-ai-coding/).

OpenAI's internal answer is an automated testing pipeline that catches errors before they reach users. Whether most organizations can replicate that discipline is another question entirely. Lareina Yee, senior partner and McKinsey Global Institute director, [wrote](https://www.mckinsey.com/~/media/mckinsey/business%20functions/mckinsey%20digital/our%20insights/the%20top%20trends%20in%20tech%202025/mckinsey-technology-trends-outlook-2025.pdf) that "AI agents won't just automate tasks, they will reshape how work gets done. Organizations that learn to build teams that bring people and agent coworkers together will unlock new levels of speed, scale, and innovation."

**OUR VALLEY VIEW**

The most revealing detail here isn't the agent itself. It's that OpenAI had the same "which table has my numbers?" problem as everyone else, and two engineers with publicly available tools fixed it. That's encouraging if you're trying to build something similar, and a little uncomfortable if you sell data analytics software for a living. The barrier to building useful AI agents is dropping fast. The question is whether your data is clean enough to meet it.