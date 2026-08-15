---
name: explore-visual-ideas
description: >-
  Turn a campaign's locked creative concept into a small batch of rough visual idea variations for
  one deliverable type (banner ad, poster, landing-page mockup, static, and so on). This is an
  ideation tool, not a production renderer: it feeds the model a deliberately minimal prompt — the
  master visual concept plus only the brand typeface and colours — and hands it the locked subject
  photo for an image-to-image edit, so the model stays free to compose. It renders several
  variations at one aspect ratio in a single batch, for a human to pick a direction. Use whenever
  the user asks to generate, explore, or riff visual ideas / concepts / directions / variations for
  a deliverable, or "show me some options" for a banner, poster, or key visual. Trigger on phrases
  like "generate visual ideas for the banner ad", "give me a few poster concepts", "explore visual
  directions for [deliverable]", "make variations of the hero image", "show me some layout options".
  Reads campaigns/<slug>/docs/message.md (tagline, master_visual.concept/subjects/palette), brands/<id>/
  design.md (typeface name and colour hex values ONLY), the deliverable type / primary ratio /
  variation count (from the manifest entry if present, else the invocation, else defaults), and the
  campaign's already-rendered locked subject photo when one exists. If no locked master visual
  exists yet, it does not silently proceed: it tells the user and offers to run off the campaign
  brief.md as looser visual guidance instead. Do NOT use to invent or vary the master visual CONCEPT
  itself (that is locked in message.md by write-message, read-only here); to do
  paid-social ad concept or funnel ideation (that is write-ad-creative); to build a production
  landing page (that is build-landing-page — output here is a non-production
  mockup image, never a working page); or when the fal MCP is not connected (this skill depends on
  it every run).
---

# Visual ideas

Turn a campaign's locked `message.md` — the master visual concept plus tagline — into a small batch of
**rough visual idea variations** for one deliverable type: a banner ad, a poster, a build-landing-page
mockup, a static, whatever the user names. The output is exploratory, not production. AI imagery is
reliable enough to spark a layout direction but not to ship, so this skill leans into that: it feeds
the model a deliberately **minimal** prompt and lets it compose, rather than pinning down every
placement and constraining the creativity that makes these images useful as starters.

That is the whole design shift. This skill does **not** write a detailed percentage-zone layout
plan, does not use curated style-reference images, and does not hard-verify tagline spelling or
placement. It provides the concept, the brand's typeface and colours, and the locked subject photo,
then generates a handful of variations at one ratio for a human to react to.

This skill reads the tagline and visual concept; it never writes or revises either (that is
`write-message`'s job, upstream). It produces **visual executions** of a concept that is already
locked, never a new concept.

## 1. Read the inputs

Resolve the campaign, brand and message per `${CLAUDE_PLUGIN_ROOT}/schema/preflight.md` before
reading anything below. Everything you say out loud follows
`${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md`: engine words belong in the files, not in the
conversation.

1. **`campaigns/<slug>/docs/message.md`** — the preferred input (campaign paths follow
   `${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md`). Pull the chosen tagline and, from the
   `master_visual` block: `concept` (the one-paragraph direction), `subjects` (the locked subject ids
   and definitions, e.g. `HANDS-1`), `palette`, and `locked_still` (the exact versioned path to the
   rendered anchor image, if `write-message` locked one). **If `message.md` does not exist yet**, do not
   silently proceed and do not stop dead: say plainly that the campaign has no main picture agreed
   yet, so these will not match anything, and ask whether to go ahead using the brief as the steer.
   Only run off the brief with that explicit go-ahead, and treat it as
   looser guidance than a locked concept — the output is even rougher and must be labelled as such.
2. **`brands/<id>/design.md`** — resolve `<id>` from `campaign.brand` in
   `campaigns/<slug>/system/manifest.yaml` rather than asking which brand this is
   (`${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md` section 1.1). Read **only** the brand typeface name and the brand colour
   values (e.g. Source Serif 4; a deep navy, an off-white, teal accents). This file is freeform prose,
   not a schema: read the values, and if a colour or the typeface is missing, carry on without it
   rather than failing. The file stores them as `#1e3a5f`; step 3 says how they are written into a
   prompt, which is not with the `#`. Do **not** import its composition, whitespace, or "avoid harsh medical
   imagery" house-style rules into the prompt — those belong to production, and pulling them in here
   just reconstitutes the over-detailed prompt this skill exists to avoid.
3. **The deliverable parameters** — the deliverable **type** (banner ad, poster, build-landing-page
   mockup, static, ...), its **primary ratio**, and the **variation count** N. Take these from the
   manifest entry (`campaigns/<slug>/system/manifest.yaml`) for this deliverable's `id` if one exists,
   otherwise from how the user invoked the skill, otherwise default: a sensible ratio for the
   deliverable type (banner/static `1x1`, poster/build-landing-page `4x5` or `9x16`) and **N = 3-4**.

There is no `visual-reference` / style-reference step. This skill never reads
`brands/<id>/references/` or globs example images.

## 2. Resolve the base image — edit mode vs text-to-image

Prefer the explicit `master_visual.locked_still` path from `message.md` when it is set — that is the
anchor still `write-message` rendered and locked. Otherwise look in
`campaigns/<slug>/media/key-visual/` for the latest locked still matching the subject id(s) named in
`master_visual.subjects` (e.g. `key-visual-<subject-id>-v<NN>.png`). In brief-only mode there is no
locked subject, so this resolves to text-to-image.

- **If one exists → edit mode.** This photo is the base for an image-to-image edit. Per the pack
  invariant that recurring subjects inherit from `message.md` and must not drift between assets, always
  prefer edit mode whenever a locked subject exists, so the subject stays consistent across the
  campaign.
- **If none exists → text-to-image mode.** The deliverable has no subject to keep consistent (a
  typographic poster, an abstract landing-page mockup), so generate from the prompt alone. Do not
  invent or reshoot a subject just to force edit mode.

Do not chain into generating and locking a brand-new subject here. If the concept clearly needs a
subject that does not exist yet, say so and point back to the still-image path
(`write-generation-prompt` + `generate-image`) rather than minting one inside an ideation run.

## 3. Write a minimal prompt

Write **one** short prompt, reused across the batch. It must be deliberately light — a few sentences,
not a spec:

- The `master_visual.concept` left in the model's own creative hands.
- The brand **typeface** name and **colour** values from step 1, as palette and type guidance. Name
  two or three at most, each as a name plus a sigil-free hex — `deep plum (hex 7A1F3D)`, never
  `#7A1F3D`, because `#` opens a reference handle.
- The **tagline** as **soft** guidance ("integrate the headline text into the composition") —
  accept that in-image text will be approximate. Do not demand exact placement, exact spelling, or a
  specific card / box treatment.
- The deliverable **type**, so the model knows it is composing a banner ad vs a poster vs a page
  mockup.

Do **not** write a percentage-zone placement plan, a type-scale rule, or a negative-space checklist.
Keeping the prompt minimal is the point of this skill. If you delegate wording to
`write-generation-prompt`, pass it only this minimal input and do not let it re-expand into a
detailed layout spec.

## 4. Upload the subject photo (edit mode only)

`generate-image` consumes reference **image URLs**, not local paths. In edit mode, upload the locked
subject photo via `mcp__fal-ai__upload_file` to get a fal-hosted URL — do this **every run**, never
assume a URL from a previous invocation is still valid. In text-to-image mode there is nothing to
upload; skip this step.

## 5. Generate the batch

Delegate to `generate-image` with the step-3 prompt, the primary ratio, and `num_images = N`, using
varied seeds so the variations actually differ:

- **Edit mode:** `model: fal-ai/nano-banana-2/edit`, passing the uploaded subject-photo URL as the
  single edit input — so it is `#Image1`, and the step-3 prompt cites that handle when it refers to
  the subject.
- **Text-to-image mode:** `model: fal-ai/nano-banana-2` (no image input).

Let `generate-image` resolve the exact fal parameter names via `get_model_schema` — do not hardcode
them, they differ from other models. If the model id does not resolve, stop and tell the user rather
than silently substituting a different model.

**`generate-image` gates before it spends** (its step 4): the prompt, model, settings and estimated
cost go to the user, who chooses between it rendering and them running it by hand. Gate once for the
batch with the `N`-image total, since this is a single batch by design. If they render by hand, take
the returned images back and present them for a direction at step 7 as usual.

One batch, one ratio. Do not expand across the full ratio set — variations, not ratios, is the axis
here.

## 6. Sanity check

View the batch and do a light pass only: each image reads as a usable idea, and in edit mode the
locked subject has not been mangled or replaced. This is **not** the old strict spelling / placement
gate — approximate or imperfect tagline text is expected and fine for ideas. Only reroll an image
that is genuinely unusable (subject destroyed, or nothing legible at all).

**If a generation is refused** (skin or condition imagery can trip a model's content filters): do not
hang or silently drop it. Report the refusal
plainly and suggest the calm, relief- or product-led framing the pack already mandates
(`pack.mandatories`) before retrying.

## 7. Present the batch for a direction

Show the user the N variations together and ask which direction to take forward (or whether to
reroll). This is the single gate in this flow. There is no per-ratio approval loop, because there is
only one ratio.

## 8. Output and report

Write each variation to:

```
campaigns/<slug>/media/<deliverable-id>/<deliverable-id>-idea-<NN>-v01.png
```

e.g. `campaigns/<slug>/media/banner-ad/banner-ad-idea-03-v01.png`. Each variation is its own `idea`
sequence number at `v01`; a reroll of the same idea takes `v02`. Log each one (status `candidate`)
and rebuild the site per the log step in `${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md`. Then
report per `${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md` section 5:

- **How many variations you made, what they are for, and what shape they are** — a count, not a list
  of paths.
- **One path**: the campaign page, in full, as the place to flick through them all.
- **What they are not.** Plainly: these are rough directions, not finished artwork. Any text in them
  is approximate, they still need production work, and nothing has been checked against the brand's
  must-includes or the things they never say.
- **Which one you would take forward, and why**, in a clause.

The model, the seeds and whether the run built on the campaign's main picture all went into the log.
Do not recite them.

**End on a next action** per section 6: offer to take the strongest one through to a finished
version. Name no skill.

## Not built yet

- **Multi-ratio export of a chosen idea.** Today a run produces variations at one ratio. Taking an
  approved idea to a full ratio set is a separate, later, production step outside this ideation skill.
- **Native design-tool export.** Once the Figma or Canva connectors are authorized, a v2 could hand
  off an editable-layer artifact instead of a flattened PNG for the chosen direction.

## House rules

- **Never invent or vary the concept.** The master visual concept and tagline are locked in
  `message.md`; this skill reads them and produces visual executions, it does not draft or re-imagine
  the concept. In brief-only mode there is no locked concept yet, so derive rough ideas from the
  brief, but still do not author a durable concept — that remains `write-message`'s job.
- **Keep the prompt minimal.** The value of this skill is giving the model room. No percentage-zone
  layout plans, no type-scale rules, no style-reference images, no house-style checklists in the
  prompt.
- **Prefer edit mode when a locked subject exists.** Only fall back to text-to-image when there is
  genuinely no subject to keep consistent, so recurring subjects do not drift between assets.
- **These are ideas, not production.** Approximate in-image text is acceptable; do not hard-verify
  spelling or placement, and always label the output as non-production in the report.
- **Fail loud on model or moderation errors.** If the model id does not resolve, or a generation is
  refused, say so — never silently swap models or drop images.
- **Speak plainly.** Everything you say out loud follows `${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md`: engine words belong in the files, not in the conversation. Never recite paths, models or seeds — they are in the log.
- British spelling, no em dashes, in any copy this skill authors (labels, report-back).
