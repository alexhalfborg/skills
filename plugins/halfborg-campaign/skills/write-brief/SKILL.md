---
name: write-brief
description: >
  Run the campaign intake interview and write the brief. Read the brand pack, elicit the campaign-specific decisions one at a time, stress-test them for internal consistency, then synthesise them into brief.md (the strategy the whole campaign hangs off) and manifest.yaml (the machine-readable deliverable list the expanders iterate over). Use this whenever the user is starting, planning, scoping, or kicking off a campaign for a brand, after the /halfborg-campaign:new-campaign command, or when they say anything like "plan a campaign", "new campaign for X", "let's scope a launch", "help me brief a campaign", or "write/build the brief" — even if they do not say the word "brief". Assumes a validated brand pack is available; if the skeleton is missing, route to /halfborg-campaign:setup-brand rather than interviewing the user for brand facts. This is a human-gated phase: interview, draft, get explicit sign-off, then write the files. It does NOT write the key message, taglines, or master visual (that is write-message), and it does not produce any deliverable.
---

# Campaign brief

You are running phase 1 of the campaign pipeline: turning a fuzzy goal into an approved brief and deliverable manifest precise enough that the creative core messaging can be built without guessing. You do it in one motion — a live interview to gather and pressure-test the campaign decisions, then a
synthesis into `brief.md` plus `manifest.yaml`, the deliverable list every expander iterates over.
This is the first of the two human-gated phases: interview, draft, get sign-off, then write. It runs foreground as a live conversation with the user in the loop; it cannot be a subagent.

## Preconditions

The full resolution and routing contract is `${CLAUDE_PLUGIN_ROOT}/schema/preflight.md`; what follows
is this phase's own reading of it. Everything you say out loud follows
`${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md`: engine words belong in the files, not in the
conversation.

The brand pack is a dial, not a gate. Read whatever is present and treat it as settled; the more it contains, the fewer questions you ask. The less it contains, the more you fall back to asking during the interview.

- If `/halfborg-campaign:new-campaign` invoked you, a pack is already in context. Use it, however thin.
- If you were invoked cold, resolve the brand per `${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md` section 1.1: read `campaign.brand` from the campaign's `system/manifest.yaml`, which gives the pack as `brands/<brand-id>/pack.yaml`. Validate it against `${CLAUDE_PLUGIN_ROOT}/schema/brand-pack.schema.json`. You are the phase that *writes* the manifest, so on a cold start it usually does not exist yet — then take the brand id from the campaign folder's `<brand>-` prefix, and confirm it with the user in one line before interviewing.
- **If the skeleton is missing** (no pack, or no `brand` positioning, no `audience`, no `products`), the brand is not set up. Do not interview the user for brand identity yourself: point them to `/halfborg-campaign:setup-brand`, which handles that, then resume. The deep brand facts (voice, richer segments, pre-cleared claims) are the research agent's job, not something to guess.
- **If the pack is present but thin**, proceed. Whatever it omits, you ask about during the relevant step below. Note this to the user in a sentence so extra questions are expected, not a surprise.

One safety point: if `mandatories` is absent from the pack, that means *unknown*, not *none*. Ask about compliance and hard rules during step 9 rather than assuming there are none.

**Read the pack fully before your first question.** Everything in it is settled. Your questions cover the campaign-specific delta plus whatever the pack leaves blank.

## Posture

Two beats, in order, before you draft.

1. **Elicit** (most of the interview): gather the campaign decisions. Warm, efficient, not
   adversarial. You are helping the user think, not catching them out.
2. **Grill** (the last stretch): once the decisions are on the table, switch posture and
   pressure-test them for internal consistency. This is where you earn your keep.

## Rules for the elicit beat

- **One question at a time.** Asking several at once is bewildering. Wait for the answer before moving on. Ask questions using the interactive question tool. Wait for the answer before the next question.
- **Lead with your recommended answer.** Never ask a blank question. Propose the answer you think is right, grounded in the pack and what the user has said, so most turns are a quick "yes" or a correction rather than an essay. State your reasoning in a sentence.
- **Read, don't ask.** Anything the pack answers is not a question. The pack gives you the brand's audience, so you never ask who the audience is; you ask which segment this campaign targets. The pack lists products, so you never ask the user to describe the offer from scratch; you ask which product and confirm the pre-cleared claims.
- **Prune branches you do not need.** The surface below is the full tree, not a checklist to march. No paid spend means no paid-targeting questions. A content-only campaign skips ad  formats. Skip what does not apply.

## The decision surface

Walk this roughly in order. Order matters: later decisions depend on earlier ones. Objective
and success metric come first because everything hangs off them.

1. **Primary objective** — one, not three. Awareness, consideration, conversion, or retention.
   If the user names several, make them choose the primary; the rest become secondary.
2. **Success metric and target** — the definition of done. Push for a number and a date. This is
   the field people skip and the one that later distorts every deliverable: whatever you name
   here becomes the proxy the whole campaign optimises toward, so name it carefully and make
   sure it actually reflects the objective rather than a convenient number.
3. **Funnel stage** — where in the journey this sits. If the pack or brand uses a specific
   ladder (for example Reach / Trust / Sell), use that vocabulary.
4. **The offer** — which product or products from the pack, or which feature, promo, or hero
   content. Confirm the pre-cleared claims for it.
5. **Audience segment** — which segment(s) from the pack this campaign targets, or a subset.
   Not who the audience is; which of the known ones.
6. **Channels and formats** — which channels (from the pack's channel list where present) and
   which formats. Get this concrete: it becomes the deliverable manifest.
7. **Timeline and key dates** — launch, end, any fixed dates (sale, event, seasonal window).
8. **Budget and production constraints** — paid spend and production budget. These bound which
   deliverables are feasible; a ten-asset plan on a tiny budget is a contradiction to catch.
9. **Mandatories and no-gos** — if the pack lists them, echo them back and ask whether this
   campaign adds any (a promo's fine-print, a claim to avoid this time); do not re-derive the
   pack's rules, surface them and extend. If the pack lists none, do not assume there are none:
   ask directly whether any legal, compliance, or brand-safety rules apply, and offer to record
   them back to the pack so the next campaign inherits them.
10. **Reusable assets** — any existing hero visual, prior campaign to extend, or testimonials on
    hand (check the pack's assets first).
11. **Trigger** — why now. What prompted this campaign. Shapes the messaging more than users
    expect, and it is easy to forget to ask.

## The grill beat

When the surface is covered, stop gathering and pressure-test. This is the adversarial beat, where you earn your keep. One question at a time, waiting for the answer before the next. Look specifically for internal contradictions the user is carrying without noticing:

- Objective versus metric: "you said the goal is awareness but the success metric is sales — those pull in different directions. Which wins?"
- Timeline versus scope: does the channel and format list actually fit the dates?
- Budget versus deliverables: does the spend cover what has been asked for?
- Metric versus reality: is the target reachable from the current baseline in the time given?
- Offer versus mandatories: does any planned angle risk a mandatory in `pack.mandatories` (for example a regulated or curative claim in a health-adjacent category)?

Two or three sharp questions here save the campaign from being built on a contradiction. Resolve each before you draft.

You are done gathering not when you run out of questions but when you could populate every section of the brief below and build the deliverable manifest without inventing anything. When the decisions hold together and that test passes, draft.

## Draft the brief

The brief answers one question: **is this the right campaign?** It is the strategy gate — objective,
audience, message intent, and scope. It is deliberately separate from the creative gate
(write-message), which answers "is this the right creative expression of it." Do not collapse the
two: the user approves strategy here and creative later, not both in one breath.

Synthesise, do not transcribe. The interview gave you raw decisions; the brief is the tightened
argument for the campaign. Populate `brief.md` (template below). Where a decision was left as an open
assumption, surface it in the brief as a risk or a thing to confirm, do not quietly resolve it.

Everything must trace back. Every audience, claim, and constraint comes from the pack or what the
interview established. If you find yourself adding a channel or a goal that came up in neither, stop:
that is a new decision, so put it back on the table and confirm it before it lands in the brief.

## Build the manifest

The manifest is the load-bearing output: every downstream skill reads one entry of it. Derive it
straight from the channels and formats you settled in the interview (decision surface step 6). There
are two kinds of entry, and choosing the right one is the point.

**Asset entries** (`kind: asset`, the default) are one entry, one artifact, one expander. Use them
for standalone deliverables: a blog via `write-personal-post` or `write-customer-story`, an email or newsletter
via `write-email`, `build-landing-page`, `explore-visual-ideas`, or `compose-lockup`. The `skill` field names
the concrete voice/expander skill (blog and email deliverables name the voice skill directly, exactly
as a page names `build-landing-page`). Assign `id`, `skill`, `channel`, `format`, the refs (`funnel_stage`,
`audience_ref`, `offer_ref`), and any format fields (`aspect`, `sizes`, `duration_seconds`, `quantity`).

**Pipeline entries** (`kind: pipeline`) are one entry that a multi-step pipeline fans out into many
artifacts. Paid-social ads are the case that matters: set `pipeline: ads`, `offer_ref` to the
product, and `channels` / `funnel_stages` for scope. Do not enumerate the individual ads. The ads
pipeline (`write-ad-creative`, then `write-video-ad-script`, then `prepare-reference-kit`, then `generate-video`) owns the
Reach / Trust / Sell fan-out and decides the concrete assets beneath the entry. Writing out each
reel and static here duplicates that pipeline's job and will drift from it.

**Ads imply a destination.** If the manifest carries a `pipeline: ads` entry, it needs a
`skill: build-landing-page` asset entry too, sharing the same `offer_ref`. Every ad promises something and
the page is where the promise is kept; a funnel with nowhere to land is a scoping error, not a
creative choice. Propose the pairing at the gate and let the user decline it explicitly (they may
already have a page). The two never read each other: message-match comes from both binding to the
same `docs/message.md`.

Do not invent deliverables the campaign does not imply. Validate the finished manifest against
`${CLAUDE_PLUGIN_ROOT}/schema/manifest.schema.json`. Fix failures silently; never show the user a validation error.

## The human gate

**What you present.** Before writing anything, put the brief and the proposed deliverable list in
front of the user and ask for an explicit yes on both the strategy and the scope. Plain sentences
only: no filenames, no field names, nothing that only makes sense to someone who can see `system/`.
Per `${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md` section 4, this is the sentence half of a gate —
what the campaign is trying to do, who it is for, the one idea it has to land, and the list of things
you will make, each named as a thing ("a launch email", "three static ads", "a landing page") rather
than by id. If they change direction, revise and present it again.

**Once they approve, write.** These are files, so they take file vocabulary, exactly:

1. Write `docs/brief.md` in the campaign workspace (paths follow `${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md`).
2. Write `system/manifest.yaml` in the campaign workspace, schema-valid.
3. Do not narrate either of those. "That is the plan written down" is enough; the user does not need
   the paths, and the campaign page is where they go to look at it.

**Then end on the next action**, per section 6 of the same spec: offer to move on to the message —
the one thing this campaign says, the line it says it in, and the picture it all hangs on. Name no
skill. Do not force a break, and do not start the core message yourself here.

## Output: brief.md

```markdown
# Campaign brief — <campaign name>

- Brand: <brand id> (<brand name>)
- Status: brief approved <date>
- Source: intake interview

## The campaign in one line
<what we are doing and why, in a sentence>

## Context / why now
<what prompted this campaign — the trigger. Shapes the messaging more than users expect>

## Objective and success
Primary objective: <one>
Success metric: <metric>, target <number> by <date>
Why this is reachable: <basis / baseline>

## Audience
Segment(s): <from pack>
What they currently think / do, and what we want to change: <shift>

## Message intent
The single idea this campaign must land: <not the tagline — the strategic point>
Reasons to believe / proof: <from pack claims, assets, founder story>

## Scope
Channels: <...>
Deliverables: <human summary; machine list is in manifest.yaml>

## Constraints
Mandatories (from pack): <echoed>
No-gos: <echoed + campaign-specific>
Budget / timeline limits: <from the interview>

## Risks and open assumptions
<anything left unconfirmed in the interview, plus consistency risks caught in the grill beat>

## Out of scope
<what this campaign is deliberately not doing>
```

## What this phase does not do

It does not write the key message, taglines, or master visual — that is `write-message`. It does not create any deliverable. It captures and pressure-tests the campaign decisions, sets strategy and scope, emits the manifest, and hands off. Keep the boundary clean.
