---
title: "5 AI Workflows You Should Be Using Right Now"
date: 2026-05-11
excerpt: "Practical AI workflows that actually move the needle for software engineering teams."
---

## Purpose

This post is about AI workflows that actually change how you build software. The goal is to show a few workflows that help engineers plan better, move faster, and keep quality high while working with AI coding tools. These are patterns you can start using today, whether you are working in a small repo, a monolith, or across multiple packages.

## 1. Haven't Used AI Skills Yet? Start here!

[AI Skills](https://cursor.com/docs/skills) are one of the few standards adopted across every major AI coding tool, making them the most portable building block for your workflows. They work in [Cursor](https://cursor.com/docs/skills), [Claude](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview), and [Codex](https://developers.openai.com/codex/skills) with no changes required.

Skills are brought into context dynamically when the agent decides they are relevant, and can be forced into context on demand as well. Skills are intended to be iterated on and updated by all maintainers, just like code.

An AI skill is simply a folder with a `SKILL.md` file, plus other related files. An example structure:

```text
.cursor/skills/
└── diagnose-order-issue/
    ├── SKILL.md
    ├── scripts/
    │   └── fetch_order.py
    └── example_responses/
        └── order_success.json
```

Every skill is anchored by a `SKILL.md` with a `name` and `description` in the frontmatter, followed by the skill content. An example `SKILL.md`:

```markdown
---
name: diagnose-order-issue
description: >-
  Use when a customer reports a problem with their order. Fetches live order
  data and analyzes it for fulfillment delays, missing items, or payment issues.
---

# Diagnose Order Issue
Run the script to pull the order, then analyze the response for the root cause.

## Steps
1. Fetch the order:
python scripts/fetch_order.py --order-id <ORDER_ID>

2. Analyze the response for:
   - `status`: flag anything not in `shipped` or `delivered`
   - `items`: check for missing or partially fulfilled lines
   - `fulfillment.delay_reason`: surface any carrier or warehouse notes
   - `payment.status`: identify holds or failed charges

3. Summarize the issue and suggest a resolution for the support team.

## Reference
See `example_responses/order_success.json` and `order_delayed.json` for expected shapes.
```

**Usage**: To use a skill, invoke it manually with `/skill-name`, or simply give a prompt related to the topic, and the AI agent should pick up the skill into context. Make sure your `description` field is specific enough to trigger automatically. If it loads inconsistently, tighten the description.

```text
/diagnose-order-issue look into order abc-123 and provide some hypotheses on how the order is still "In Progress" after 10 days.
```

**Common Use Cases for AI Skills:**

- **Anything you do more than twice**: Have tons of feature flags flying around that never get taken down? What about dependency upgrades, dead code cleanup, or regenerating boilerplate after a schema change? Anything you do more than twice is a skill candidate.
- **Operational Tasks**: Have a common maintenance or customer-related workflow? Turn this into a skill. Think of the `diagnose-order-issue` above.
- **Debugging**: Create an AI skill for looking into your logs using common queries, workflows, and patterns that you might manually do right now.
- **Simple things**: Are pull request (PR) descriptions time consuming to write up? Or writing up a Jira ticket from a bug report? Turn this into a skill with your preferences to streamline your workflow.

Remember to commit your skills to the repo alongside your code. If your team can't find them, they won't use them.

> Tip: Use Cursor's [/create-skill](https://cursor.com/help/customization/skills#how-do-i-create-a-skill) to easily facilitate the creation of skills.

## 2. Plan First, Code Second

Before any non-trivial task, **use plan mode**. It frontloads a lot of the task by surfacing edge cases, aligning on implementation details, and preventing the kind of rewrites that come from letting an agent run without enough context. A few minutes of planning can easily save thirty minutes of review.

Most plan modes output a detailed markdown file that outlines the task the AI plans to achieve, and **how** it plans to achieve it.

There are tons of different plan modes that can be leveraged. Each of the big three AI coding tools have their own versions:

- [Cursor Plan Mode](https://cursor.com/docs/agent/plan-mode)
- [Claude Code Plan Mode](https://code.claude.com/docs/en/glossary#plan-mode)
- [Codex Plan Mode](https://developers.openai.com/codex/learn/best-practices#plan-first-for-difficult-tasks)

You can also create your own plan mode workflow. [Spec Driven Development (SDD)](https://github.com/github/spec-kit/blob/main/spec-driven.md) and the [Compound Engineering Framework](https://github.com/everyinc/compound-engineering-plugin) are solid starting points for building your own planning workflow on top of AI tools.

Here is an excerpt from plan mode in Cursor.

1. Send off the prompt: `/plan Look into my website and come up with a plan to add a new "/about-me" page.`
2. Let the plan bake. It's very common that the AI will investigate your codebase for a few minutes to capture all details and surface relevant unknowns.
3. Read the markdown plan that is generated.
4. **READ** the markdown plan that is generated. The markdown plans that are generated often **look** really good at first glance, but hide a lot of mistakes. It's imperative to read every piece of it to ensure that the AI got its assumptions right. It's often a good idea to have the AI include some pseudocode of how it plans to implement your change, in order to get an idea of what you're about to receive later on.
5. Execute the plan! Let the AI go off and implement the change you asked. Depending on how large the task is, this can easily go 10+ minutes.
6. Review the code extensively. Make sure the code is aligned to your team's standards. Follow-up with the AI for quick fixes. If the follow-ups pile up or become too time consuming, consider restarting from plan mode and explicitly including what the agent missed the first time.

## 3. Embrace Using HTML

Markdown is great for notes, plans, and simple writeups. But sometimes you want the AI to show you something, not just describe it. This is where HTML is surprisingly useful.

The idea from [The Unreasonable Effectiveness of HTML](https://thariqs.github.io/html-effectiveness/) is simple: ask your agent to generate a small HTML artifact when the output would benefit from layout, visuals, or interaction. Instead of reading a giant markdown file, you can review the same information as a visual page with things like tables, timelines, and diagrams.

This is useful for things like:

- Building a tiny slide deck for a meeting.
- Explaining a complex system flow with boxes, arrows, and expandable details.
- Creating an incident timeline, status report, or debugging dashboard.

I especially liked this [PR writeup example](https://thariqs.github.io/html-effectiveness/17-pr-writeup.html). For larger code reviews, the HTML artifact can provide a cleaner path through the change by ordering files logically and explaining the context as you go.

The key is not to replace markdown everywhere. Use HTML when the shape of the information matters. If the output has spatial relationships, multiple options, visual states, or interaction, HTML can make the review loop much faster.

## 4. Multi-Root Workspaces

If your change touches more than one package, don't context-switch. Multi-root workspaces let you load multiple repos into a single AI session so the agent can reason across all of them at once.

This is especially useful when one package depends on another, or when your implementation needs to follow patterns from a separate codebase. Instead of copy-pasting files, describing folder structures, or hoping the agent guesses correctly, you can give it direct access to the relevant repositories.

The result is less manual context gathering and fewer wrong assumptions. The agent can trace the relationship between packages directly, which makes cross-repo changes much easier to plan, implement, and review.

This is easy to set up too. For example, in Claude Code, this can be instantiated on startup using the `--add-dir` flag:

```bash
$ cd ~/backend
$ claude --add-dir ~/frontend
```

You can also add directories during a live Claude Code session using the [/add-dir](https://code.claude.com/docs/en/commands#all-commands) command.

## 5. When to Embrace the Vibes

While it's important to keep the quality bar high, there are still valid scenarios to embrace vibe coding.

The important thing to note is that **code is cheap** now. Tools and scripts that wouldn't have been worth spending time on in the past are now things that can be spun up in a few minutes with a solid prompt.

Some **good** use cases for vibe coding are outlined below:

- Curious how a feature would work when hooked up end-to-end? Put together a proof of concept to prove any theories.
- Want to test the limits of AI? Use the emerging [/goal](https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex) workflow, go to sleep, and wake up to see what your agent cooked up.
- Want to programmatically run a one-time analysis on a collection of JSON files? Generate a quick script to help give you the answer you're looking for.
- Not sure how a UI should look for a new page? Have the AI spin up three different UIs for your idea, and evaluate what the best one is. I've done this for my website, and often find myself combining parts of each into my final UI.

## Conclusion

Better AI output starts with better engineering habits around the tool. These workflows are not revolutionary on their own, but they compound quickly. The more context, structure, and review discipline you give your AI tools, the more useful they become.