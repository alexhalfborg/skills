---
name: ad-creative
description: >-
  Create, iterate, and scale ad creative for any paid advertising platform: funnel-staged paid-social
  concepts from a campaign brief, platform ad copy at volume (headlines, descriptions, primary text),
  grounded static ad concept batches, and iteration from performance data. Use whenever the user wants
  to plan, draft, write, or scale ads. Trigger on 'create ad concepts', 'plan Facebook ads', 'draft a
  TikTok ad', 'make paid social creative', 'build performance ad concepts', 'ad copy variations', 'ad
  creative', 'generate headlines', 'RSA headlines', 'bulk ad copy', 'ad iterations', 'creative
  testing', 'write me some ads', 'Google ad headlines', 'LinkedIn ad text', 'static ads', 'static ad
  concepts', 'ad templates', or 'I need more ad variations'. Inside a campaign it reads docs/brief.md
  and the brand pack (brands/<id>/pack.yaml, whose `ads` block carries the presenter guardrail, the
  angle bank, and the voice rationing rule), fans the manifest's `pipeline: ads` entry into Reach /
  Trust / Sell concepts, and registers each ad id in the generation log. Do NOT use for brand films, TV spots, or
  awareness-only work with no funnel (this is a performance framework); to script a locked video
  concept (video-ad-script); to WRITE image generation prompts (ai-image-video-prompt-builder);
  or to RENDER media (generate-image / generate-video).
---
<!-- Adapted from https://github.com/coreyhaines31/marketingskills -->

# Ad Creative

You are an expert performance creative strategist. Your goal is to generate high-performing ad creative at scale (headlines, descriptions, and primary text that drive clicks and conversions) and iterate based on real performance data.

## Where this sits in the engine

This is the ads front door. It works in two families, and which one you are in decides whether the
campaign's machine state is touched at all.

**Campaign mode** (Mode 4) is bound to a manifest `pipeline: ads` entry. It reads the brief and the
brand pack, produces funnel-staged concepts, and registers each ad id in the generation log.
This is step 1 of the ads pipeline.

**Standalone modes** (Modes 1-3) need no campaign: ad copy at volume, iteration from performance data,
and grounded static concept batches. They never touch the manifest or the log.

Either way the skill stops at copy and concepts, and the handoff depends on the format. A **video**
concept goes to `video-ad-script`, which times it into a shot-by-shot script and writes the video
generation prompt. A **static or carousel** concept goes to `visual-ideas` for rough directions and
`compose-lockup` for the finished headline-on-image; its prompt, if one is needed, comes from
`ai-image-video-prompt-builder`'s image track. `generate-image` and `generate-video` do the rendering.

## Before Starting

The campaign workspace and the active brand should have been provided to you — run
`/halfborg-skills:setup-engine` if not. For campaign modes, resolve the campaign, brand and message
per `${CLAUDE_PLUGIN_ROOT}/schema/preflight.md` first; the standalone copy modes need only a brand.

**Check for brand marketing context first:**
Before asking questions, determine which campaign you are creating ads for. Read `campaigns/<slug>/docs/brief.md` and `campaigns/<slug>/docs/message.md` if they exist. Use that context and only ask for information not already covered or specific to this task.

Gather this context (ask if not provided):

### 1. Platform & Format
- What platform? (Google Ads, Meta, LinkedIn, TikTok, Twitter/X)
- What ad format? (Search RSAs, display, social feed, stories, video)
- Are there existing ads to iterate on, or starting from scratch?

### 2. Product & Offer
- What are you promoting? (Product, feature, free trial, demo, lead magnet)
- What's the core value proposition?
- What makes this different from competitors?

### 3. Audience & Intent
- Who is the target audience?
- What stage of awareness? (Problem-aware, solution-aware, product-aware)
- What pain points or desires drive them?

### 4. Performance Data (if iterating)
- What creative is currently running?
- Which headlines/descriptions are performing best? (CTR, conversion rate, ROAS)
- Which are underperforming?
- What angles or themes have been tested?

### 5. Constraints
- Brand voice guidelines or words to avoid?
- Compliance requirements? (Industry regulations, platform policies)
- Any mandatory elements? (Brand name, trademark symbols, disclaimers)

---

## How This Skill Works

This skill supports four modes:

### Mode 1: Generate from Scratch
When starting fresh, you generate a full set of ad creative based on product context, audience insights, and platform best practices.

### Mode 2: Iterate from Performance Data
When the user provides performance data (CSV, paste, or API output), you analyze what's working, identify patterns in top performers, and generate new variations that build on winning themes while exploring new angles.

The core loop:

```
Pull performance data → Identify winning patterns → Generate new variations → Validate specs → Deliver
```

### Mode 3: Scaled Static Batches (Grounded)
For recurring static ad production at volume (e.g., 50 concepts per batch), work from a **grounded inputs corpus** and the [static ad template library](references/static-ad-templates.md). Every concept must trace to real source material — see "Grounded Inputs" below.

### Mode 4: Campaign Funnel Concepts (pipeline)
Step 1 of the campaign engine's ads pipeline. Turns an approved campaign brief into funnel-staged paid-social concepts (Reach / Trust / Sell), registers each ad id, and hands each locked concept on by format: video to `video-ad-script`, static and carousel to `visual-ideas` / `compose-lockup`. See "Campaign Funnel Concepts" below.

---

## Campaign Funnel Concepts (Mode 4)

The framework — the funnel, the four-function ad anatomy, variant permutation, the compression exception, the concept block, and the test note — lives in [references/funnel-concepts.md](references/funnel-concepts.md). Read it before producing concepts. This section covers only the inputs, the workflow, and the campaign machinery.

### Inputs, in order

1. **The campaign brief (primary input).** `campaigns/<slug>/docs/brief.md` sets the theme, the lead persona and awareness-stage focus, the hero SKUs and the funnel role each plays, and the core message and tagline candidates every concept must thread to. Read it first and let it choose the product and the angle. If there is no brief, point the user at `new-campaign`, or for a quick one-off proceed from a named product plus the brand pack.
2. **The brand pack (how to execute).** Resolve `<id>` from `campaign.brand` in `campaigns/<slug>/system/manifest.yaml` rather than asking which brand this is (`${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md` section 1.1); outside a campaign, the invocation names the brand. `brands/<id>/pack.yaml` is then the source of truth. Read it fully before planning; do not ask the user anything the pack answers. Everything an ad needs to know about the brand is in it:

   | What you need | Where it comes from |
   |---|---|
   | The audience read for ads | `audience[].pains` and `.jobs` — compress them into who is scrolling and what would stop them |
   | Who may front an ad | `ads.presenter` |
   | Voice routing and rationing | `voice.skills` plus `ads.voice_rationing` — see the branch below |
   | The angle bank | `ads.angle_bank.trigger_moments` × `.framings` |
   | Funnel-compression flags | `products[].buying_mode == "acute"` |
   | Product data and click destinations | `brand.url`, `products[].url`, `products[].price`, `products[].claims_allowed` |
   | Formats and retargeting reality | `channels[].formats` and `.notes` |
   | Guardrails | `mandatories` and `nogos` |

   **Voice, in three cases.** If `voice.skills` is absent, the brand has no first-person voice to ration: mark every concept `Voice: No` and write in the brand voice from `voice.summary`. If `voice.skills` is present and `ads.voice_rationing` is set, follow that rule. If `voice.skills` is present but `ads.voice_rationing` is absent, apply the engine default: first-person only for experiential claims, weighted top-of-funnel.

   **A brand with no `ads` block is not ads-ready. That is a hard stop — route, don't guess.** Send the user to `/halfborg-skills:setup-brand` to add one. Do not invent a presenter, write the block yourself, guess an audience, or proceed on a product you have not confirmed. The schema requires `ads.presenter` whenever the block exists, so the block's presence is your proof that a human decided who may appear in an ad. Nothing else is.

   **A thin pack is valid, and the rest of the table degrades.** Only the `ads` block is a gate. If `channels` is missing, take the channel from the brief or the manifest entry and pick formats from [references/platform-specs.md](references/platform-specs.md). If `products[].url`, `.price`, or `.claims_allowed` is missing, say so and leave the destination or figure unresolved: a Sell concept needs a real price and a real URL, so flag the gap rather than inventing one, and confirm against the live store at `brand.url` before anything runs. Never fill a pack gap with a plausible guess.

   A concept built without the brief and the pack will be generic, and generic is the failure mode this approach exists to avoid.
3. **The target product(s).** Normally taken straight from the brief's hero products; only ask when running ad-hoc with no brief.

### Workflow

1. **Read the campaign brief.** Take the theme, lead persona and awareness stage, the hero SKUs and their funnel roles, and the core message and taglines. Every concept threads to this.
2. **Load the brand pack** fully before planning. Confirm `ads.presenter`, then note the voice routing, angle bank, guardrails, product URLs, and channel formats.
3. **Pull real product data** from `products[]`: exact title, url, price, and pre-cleared claims. Verify against the live store at `brand.url` before publishing. Use real figures in Sell concepts; never invent prices or proof. For multi-size products, identify the volume bestseller as the entry SKU for Sell.
4. **Find a Trust click destination**: a real, published URL on the brand's own site. Never link to a page you have not confirmed exists, and check for cannibalisation against an existing ranking post before recommending the link or a Sell angle that competes with one.
5. **Flag funnel compression.** Default is the full three-stage funnel; nobody buys a `considered` product on impulse. Only a product marked `buying_mode: acute` gets a fourth, direct-response concept, tested as an explicit A/B against the warm-only Sell ad.
6. **Find the hooks.** Derive each stage's angle from a real problem the product solves crossed with a real product truth, permuting one `trigger_moment` against one `framing` from the angle bank, and keep it on the brief's core message. Trigger moments are audience insight informing the hook's *feeling*, not a literal visual to depict.
7. **Write each concept** against the four functions, in the concept block format. Mark every concept `Voice: Yes/No` and justify it by the rationing rule.
8. **Add the test note** for any stage where you produced variants.
9. **Flag issues proactively**: cannibalisation against existing content, data limitations, brand fit, claims needing verification (`⚠️ CLAIM CHECK`), platform ad-policy and visual-sensitivity risks (`⚠️ POLICY CHECK`), and anything `mandatories` or `nogos` forbid. See "Ad safety rules" below.

### Output and the register duty

Write the batch to `campaigns/<slug>/content/<pipeline-id>-concepts.md`, where `<pipeline-id>` is the manifest pipeline entry's `id`.

Funnel concepts mint ad ids (`GLV-R1-a`) that become media folder names for every downstream render, so when the user locks the concepts they **must** be registered. Append one `register` event per ad id, with `parent` set to the pipeline id and carrying its title, format, channel, and funnel stage; then a `generate` event for the concepts doc itself; then rebuild the site (the log step in `${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md`). These `register` events are what make the ad ids valid deliverable ids for every downstream render, so do not skip them.

Contrast this with Mode 3: a static ideation batch mints no ids, so there is nothing to register. It writes to `campaigns/<slug>/research/` and never touches the log. The discriminator is whether the work creates deliverable ids that something downstream will render, not how much output it produces.

---

## Grounded Inputs

Most AI ad generation fails on input grounding, not output quality: ungrounded generation produces plausible-sounding ads based on training data, not on what converts for this brand. For scaled production (Mode 3), maintain a durable inputs corpus:

```
brands/<id>/references/
  winning-ads/   10-20 screenshots of the highest-performing ads from the last 90 days
  reviews/       50-100 customer reviews (Trustpilot, G2, Amazon, App Store) as .md/.txt
  comments/      Top comments from existing ad campaigns — objections, unprompted praise, customer-raised angles
brands/<id>/     brand facts, voice profiles, design tokens, logo, product/screenshot assets
                 (pack.yaml, voice-profiles.md, design.md)
```

The corpus lives under the brand, not the campaign: winning ads, reviews, and comments are durable
brand facts, refreshed on their own cadence and reused across every campaign.

**Why each input matters:**
- **Winning ads** carry the hooks, structures, and angles already proven for this brand
- **Reviews** carry the exact language buyers use for pain, transformation, and unexpected benefits — pull copy from them verbatim rather than paraphrasing
- **Ad comments** are the most-skipped and highest-value input: objections ("but does it work for X?") become FAQ Card ads, and unprompted praise surfaces angles you didn't write

**Grounding rules:**
- Every concept cites its source (which review, winning ad, or comment it traces to)
- No invented claims, stats, or testimonials — ever
- If `brands/<id>/references/winning-ads/` or `brands/<id>/references/reviews/` is empty, stop and ask the user to populate it before generating. Do not generate ungrounded concepts as a fallback.
- Inputs decay: refresh `winning-ads/` as new ads scale; refresh `reviews/` and `comments/` monthly

---

## Platform Specs

Platforms reject or truncate creative that exceeds their limits, so verify every piece of copy fits the placement, and request image dimensions that match it. Per-platform character limits (Google RSA, Meta, LinkedIn, TikTok, Twitter/X) and image aspect ratios and pixel sizes live in [references/platform-specs.md](references/platform-specs.md). Validate against it in Step 3 of "Generating Ad Copy" below.

### Google RSA rules

- Headlines must make sense independently and in any combination
- Pin headlines to positions only when necessary (reduces optimisation)
- Include at least one keyword-focused headline
- Include at least one benefit-focused headline
- Include at least one CTA headline

---

## Static Ad Concepts

For static ad structure, use the 15-template library in [references/static-ad-templates.md](references/static-ad-templates.md) — layout frameworks (Us vs. Them, Stat Callout, Review Card, Before/After, Founder Message, FAQ Card, and more) with copy slots, DTC and SaaS examples, and the per-concept output format. Cycle through all 15 rather than clustering on favourites: template diversity is angle diversity.

Each concept carries a **visual brief**: a plain-language description of the layout and imagery. That is not a generator prompt, and it is not a rendered image. This skill stops at the brief. To take a chosen concept further:

- To turn a visual brief into a model-ready image or video prompt, hand it to **`ai-image-video-prompt-builder`**.
- To render that prompt into a real asset, use **`generate-image`** (this repo renders through the fal.ai MCP; default `fal-ai/nano-banana-2`) or **`generate-video`** (default `bytedance/seedance-2.0/reference-to-video`). Those skills save into `campaigns/<slug>/media/<deliverable-id>/`, append to the generation log, and rebuild the campaign site.

For placement dimensions and per-platform copy limits, see [references/platform-specs.md](references/platform-specs.md).

---

## Generating Ad Copy

### Step 1: Define Your Angles

Before writing individual headlines, establish 3-5 distinct **angles** — different reasons someone would click. Each angle should tap into a different motivation.

**Common angle categories:**

| Category | Example Angle |
|----------|---------------|
| Pain point | "Stop wasting time on X" |
| Outcome | "Achieve Y in Z days" |
| Social proof | "Join 10,000+ teams who..." |
| Curiosity | "The X secret top companies use" |
| Comparison | "Unlike X, we do Y" |
| Urgency | "Limited time: get X free" |
| Identity | "Built for [specific role/type]" |
| Contrarian | "Why [common practice] doesn't work" |

### Step 2: Generate Variations per Angle

Separate **exploring** from **testing**. They obey different rules, and conflating them is why most ad tests teach nothing.

**Exploratory generation** — filling 15 RSA headline slots, sweeping a batch of primary-text options, hunting for an angle that lands. Vary freely across word choice (synonyms, active vs. passive), specificity (numbers vs. general claims), tone (direct vs. question vs. command), and structure (short punch vs. full benefit statement). You are searching the space, not measuring it.

**Test sets** — any variant set you ship to learn which version wins. Hold everything constant except **one named variable** (Hook, CTA, or Format), and carry a test note recording what was held constant, what varied, your hypothesis, the deciding metric, and the audience. A variant set that differs on hook *and* audience *and* format teaches you nothing about what moved the numbers. The test-note format is in [references/funnel-concepts.md](references/funnel-concepts.md), and it applies to standalone test sets as much as to funnel concepts.

### Step 3: Validate Against Specs

Before delivering, check every piece of creative against the platform's character limits. Flag anything that's over and provide a trimmed alternative.

### Step 4: Organize for Upload

Present creative in a structured format that maps to the ad platform's upload requirements.

---

## Iterating from Performance Data

When the user provides performance data, follow this process:

### Step 1: Analyze Winners

Look at the top-performing creative (by CTR, conversion rate, or ROAS — ask which metric matters most) and identify:

- **Winning themes** — What topics or pain points appear in top performers?
- **Winning structures** — Questions? Statements? Commands? Numbers?
- **Winning word patterns** — Specific words or phrases that recur?
- **Character utilization** — Are top performers shorter or longer?

### Step 2: Analyze Losers

Look at the worst performers and identify:

- **Themes that fall flat** — What angles aren't resonating?
- **Common patterns in low performers** — Too generic? Too long? Wrong tone?

### Step 3: Generate New Variations

Create new creative that:
- **Doubles down** on winning themes with fresh phrasing
- **Extends** winning angles into new variations
- **Tests** 1-2 new angles not yet explored
- **Avoids** patterns found in underperformers

### Step 4: Document the Iteration

Track what was learned and what's being tested:

```
## Iteration Log
- Round: [number]
- Date: [date]
- Top performers: [list with metrics]
- Winning patterns: [summary]
- New variations: [count] headlines, [count] descriptions
- New angles being tested: [list]
- Angles retired: [list]
```

---

## Writing Quality Standards

### Headlines That Click

**Strong headlines:**
- Specific ("Cut reporting time 75%") over vague ("Save time")
- Benefits ("Ship code faster") over features ("CI/CD pipeline")
- Active voice ("Automate your reports") over passive ("Reports are automated")
- Include numbers when possible ("3x faster," "in 5 minutes," "10,000+ teams")

**Avoid:**
- Jargon the audience won't recognize
- Claims without specificity ("Best," "Leading," "Top")
- All caps or excessive punctuation
- Clickbait that the landing page can't deliver on

### Descriptions That Convert

Descriptions should complement headlines, not repeat them. Use descriptions to:
- Add proof points (numbers, testimonials, awards)
- Handle objections ("No credit card required," "Free forever for small teams")
- Reinforce CTAs ("Start your free trial today")
- Add urgency when genuine ("Limited to first 500 signups")

### Guardrails

Honour every guardrail in the brand pack's `mandatories` and `nogos`, including any this skill does not mention. The pack can add constraints; it cannot remove the test discipline or the ad safety rules below.

### Ad safety rules

These are engine rules, not brand facts. They hold for every brand, whatever the pack says.

**Never present a photoreal synthetic human passed off as a real, named person.** Read `ads.presenter`:

- `product-led` — no named person fronts the ad.
- `founder-voice-only` — the founder's real voice carries the first-person lines and they are never filmed. Show them any other way you like (illustrated, abstracted, attributed on-screen text, b-roll, product-led), but never render a photoreal face and call it them.
- `founder-on-camera` — the founder appears as a filmed person. Filmed, not generated.

A brand built on "I lived through this" stakes everything on a real person having said it. A fabricated photoreal face delivering that line is dishonest to the audience most likely to be hurt by it, and it breaks the one asset a brand cannot fake. There is no creative justification that outranks this.

**Platform ad-review is a second, separate constraint from claim compliance.** A claim-safe ad can still fail Meta or TikTok review, so check the copy *and the visual notes* against two rejection classes:

- **Personal attributes.** Copy must not assert or imply that it knows something personal about the viewer — their health condition, body, age, finances, race, religion, or sexual orientation. The tell is the accusing second person: "do you suffer from…", "your [condition]". Write the same insight in the first person, or about no one in particular, and it passes.
- **Graphic or distressing content.** Visuals must not depict distress, injury, bodily harm, or clinical close-ups of a condition. Imply the moment instead: a calm, relief-led or product-led image carries the same emotional truth and clears review.

What counts as a personal attribute or a distressing image is category-specific; the brand's `mandatories` and `nogos` name the instances that apply. Flag borderline copy with `⚠️ CLAIM CHECK` and borderline visuals with `⚠️ POLICY CHECK`. An ad the platform rejects never runs.

---

## Output Formats

### Standard Output

Organize by angle, with character counts:

```
## Angle: [Pain Point — Manual Reporting]

### Headlines (30 char max)
1. "Stop Building Reports by Hand" (29)
2. "Automate Your Weekly Reports" (28)
3. "Reports Done in 5 Min, Not 5 Hr" (31) <- OVER LIMIT, trimmed below
   -> "Reports in 5 Min, Not 5 Hrs" (27)

### Descriptions (90 char max)
1. "Marketing teams save 10+ hours/week with automated reporting. Start free." (73)
2. "Connect your data sources once. Get automated reports forever. No code required." (80)
```

### Bulk CSV Output

When generating at scale (10+ variations), offer CSV format for direct upload:

```csv
headline_1,headline_2,headline_3,description_1,description_2,platform
"Stop Manual Reporting","Automate in 5 Minutes","Join 10K+ Teams","Save 10+ hrs/week on reports. Start free.","Connect data sources once. Reports forever.","google_ads"
```

### Static Batch Output (Mode 3)

A 50-concept batch is **ideation working material**, not a set of rendered deliverables: the human scans it and picks the best 5-10 to take forward. Picking 5 winners from 50 beats picking 5 from 10.

Write the whole batch as a single markdown file: an INDEX table at the top (one row per concept — number, template, one-line hook, grounding source) and the full concepts below, in the per-concept format from [references/static-ad-templates.md](references/static-ad-templates.md).

- **Inside a campaign workspace:** save to a permitted working folder, `campaigns/<slug>/research/<batch-id>-concepts.md` (e.g. `static-batch-2026-07-10-concepts.md`). Do **not** create a `media/<id>/` folder, do **not** append to `system/generation-log.jsonl`, and do **not** rebuild the site. These are ungated copy concepts rather than rendered artifacts, and a batch is neither a manifest deliverable nor a registered pipeline sub-id, so logging one would create a ghost deliverable id that `${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md` forbids.
- **Outside a campaign:** return the batch inline, or save it wherever the user directs.

The generation-log, `media/`, and site-rebuild steps attach only when a **picked** concept is actually rendered, and that is `generate-image`'s job, not this skill's. This skill stops at copy and a visual brief.

### Iteration Report

When iterating, include a summary:

```
## Performance Summary
- Analyzed: [X] headlines, [Y] descriptions
- Top performer: "[headline]" — [metric]: [value]
- Worst performer: "[headline]" — [metric]: [value]
- Pattern: [observation]

## New Creative
[organized variations]

## Recommendations
- [What to pause, what to scale, what to test next]
```

---

## Batch Generation Workflow

For large-scale creative production (Anthropic's growth team generates 100+ variations per cycle):

### 1. Break into sub-tasks
- **Headline generation** — Focused on click-through
- **Description generation** — Focused on conversion
- **Primary text generation** — Focused on engagement (Meta/LinkedIn)

### 2. Generate in waves
- Wave 1: Core angles (3-5 angles, 5 variations each)
- Wave 2: Extended variations on top 2 angles
- Wave 3: Wild card angles (contrarian, emotional, specific)

### 3. Quality filter
- Remove anything over character limit
- Remove duplicates or near-duplicates
- Flag anything that might violate platform policies
- Ensure headline/description combinations make sense together

---

## Common Mistakes

- **Writing headlines that only work together** — RSA headlines get combined randomly
- **Ignoring character limits** — Platforms truncate without warning
- **All variations sound the same** — Vary angles, not just word choice
- **No CTA headlines** — RSAs need action-oriented headlines to drive clicks; include at least 2-3
- **Generic descriptions** — "Learn more about our solution" wastes the slot
- **Iterating without data** — Gut feelings are less reliable than metrics
- **Generating without grounding** — Ungrounded concepts read like every other ad in the feed; feed the skill winning ads, reviews, and comments first
- **Skipping the comments input** — Ad comments hold the objections and angles customers raise themselves; those usually convert best
- **Testing too many things at once** — Change one variable per test cycle
- **Retiring creative too early** — Allow 1,000+ impressions before judging

---

## Performance Data Inputs

Analytics integrations (Google Ads, Meta, LinkedIn, TikTok, GA, Klaviyo) are **not wired** in this build, so this skill does not pull performance data itself. For the iteration modes above, work from data the user provides:

- A CSV or XLSX export of ad performance the user drops into the campaign folder, or metrics pasted into chat. Ask which metric matters most (CTR, CVR, ROAS) before ranking winners and losers.
- Never fabricate metrics. If the data is missing, say what is missing, name the export that would supply it, and say that analytics integrations are not wired in this build. Do not guess at numbers to fill the gap.

For a full performance report rather than a creative-iteration pass, hand off to the **`analyst`** subagent. It owns KPI analysis, trends, and prioritised recommendations from the same CSV/XLSX inputs. If an n8n workflow that fetches ad data already exists, the n8n MCP can run it to produce a CSV this skill then reads; this skill does not build that workflow.
