---
name: compose-lockup
description: >-
  Compose a production typographic lockup: read a campaign's locked text-free key visual, art-direct the headline onto it via a named layout archetype, then critique the render against a legibility / safe-area / crop checklist and reroll before exporting the finished laid-out static (ad, banner, poster, key visual). Use whenever the user wants the finished, headline-on-image deliverable rather than a rough idea or a raw generation: "make the Trust static", "compose the banner", "lay the headline onto the key visual", "produce the poster", "build the static for [deliverable]", "add the tagline to the master visual". Reads
  campaigns/<slug>/docs/message.md (the tagline, master_visual.headline_lockup / composition / palette, and the text-free locked_still), brands/<id>/design.md (typeface name + colour hex), the deliverable id / ratio / headline / channel / format from the manifest entry or a log-registered pipeline sub-id or the invocation, and its own references/art-direction.md (the analysis schema, archetype catalogue, and critique checklist). Delegates the render to generate-image with the fal-ai/nano-banana-pro/edit model — the key visual is the reference image and the headline text, typeface and colour go in the prompt — then reads the rendered PNG back, scores it against the checklist (channel-aware safe area, crop survival, legibility, face clearance) and rerolls on a hard fail before writing the result to campaigns/<slug>/media/<id>/. Do NOT use to invent or vary the visual CONCEPT or tagline (that is campaign-message, read-only here); to explore rough visual directions with approximate in-image text (that is visual-ideas' idea batches); to raw-render a generative image or the key visual itself with no headline (that is generate-image); or to build a working web page (that is landing-page). This lays the real headline onto an existing key visual; it is the production counterpart to visual-ideas' ideation.
---

# Compose lockup — headline onto the key visual, as a shippable static

Take a campaign's **text-free locked key visual** and its **headline**, and produce the finished laid-out deliverable: the headline art-directed onto the key visual, exported as a shippable static. This is the production typographic-lockup step the engine deliberately separates from image generation, so the key visual stays clean (it animates and re-lays without warped baked text) while the headline treatment is applied here.

The difference from the old blind pass is that this skill **looks before it prompts and critiques after it renders**: it reads the key visual and measures its negative space (Layer 1), chooses a layout archetype rather than free-forming geometry (Layer 2), and reads the rendered PNG back to score it against a legibility / safe-area / crop checklist and reroll a hard fail (Layer 3). The three rubrics live in **`references/art-direction.md`**; this file owns the workflow that runs them.

The render is done by **Nano Banana Pro Edit** (`fal-ai/nano-banana-pro/edit`, via `generate-image`), an image-**edit** model chosen for typography and layout: it takes the locked key visual as the reference and adds the headline where the prompt asks, while keeping the rest of the picture essentially unchanged. It renders the exact headline text crisply and preserves the subject and composition far better than a from-scratch generative pass.

Where the neighbours sit:

- `campaign-message` locks the **text-free** key visual and writes the `headline_lockup` spec. Read-only here — never re-imagine the concept or reword the tagline.
- `visual-ideas` makes **rough, non-production** idea variations with approximate in-image text, as `idea` files. That is ideation. This skill is production: the agreed headline, on the locked key visual, as the deliverable's primary artifact.
- `campaign-qa` is the independent drift-and-compliance gate. Layer 3 here is a **producer-side pre-check** that uses QA's Family-3 vocabulary so it does not hand QA avoidable defects — it does **not** replace QA, which still runs before anything ships.
- `generate-image` is the render engine this skill delegates to. This skill does not invent the picture; it composes the headline onto one that already exists, and it owns the lockup prompt.
- `competitor-ads` (optional, upstream) may leave `campaigns/<slug>/research/competitor-ads.md`; if present, Layer 2 reads its distilled priors to bias the archetype choice.

Campaign paths and filenames follow `${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md`; that spec wins over any path shorthand here.

## 1. Read the inputs

Resolve the campaign, brand and message per `${CLAUDE_PLUGIN_ROOT}/schema/preflight.md` before
reading anything below. Everything you say out loud follows
`${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md`: engine words belong in the files, not in the
conversation.

1. **`campaigns/<slug>/docs/message.md`** — the required input. Pull:
   - the chosen **tagline** (the default headline text, unless the deliverable overrides it),
   - from `master_visual`: `headline_lockup` (typeface / weight / case / colour / placement),
     `composition` (where the headline area is meant to sit), `palette`, and
     `locked_still` (the path to the **text-free** key visual).
   - If `message.md` is missing, stop and point the user to `campaign-message` — this skill lays a
     headline onto a locked key visual, it does not invent one. If `locked_still` is set but the file
     is missing, stop and say so.
2. **`brands/<id>/design.md`** — resolve `<id>` from `campaign.brand` in
   `campaigns/<slug>/system/manifest.yaml` rather than asking which brand this is
   (`${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md` section 1.1); you read that manifest at step 1.3 anyway.
   Read the brand **typeface name** and **colour hex** values. Freeform prose, not a schema, and often
   a minimal shape (only `colors` + `typography.fontStacks`): read what is there, carry on without
   what is missing. The headline colour comes from `headline_lockup`/`palette`; the typeface name from
   here. If neither names a face, ask for an appropriate face rather than guessing a brand font.
3. **The deliverable parameters** — the **id** (the output filename stem), the **headline text** (if
   the deliverable uses something other than the tagline), the **ratio**, and the **channel** and
   **format** (Layer 3 needs these for the safe-area and crop checks). Take these from the manifest
   entry (`campaigns/<slug>/system/manifest.yaml`) for this `id`, **or a log-registered pipeline
   sub-id** (paid-social statics arrive as `register` events in the generation log — their `format`
   and `funnel_stage` live there, not in a manifest asset entry), **or** from how the user invoked the
   skill, otherwise default the ratio to the key visual's native ratio.

## 2. Analyse the key visual (Layer 1 — read the photo)

Before writing any prompt, `Read` the `locked_still` and emit the **key-visual analysis** block
defined in `references/art-direction.md` §A: the text-free verdict, subject/face zone, the ranked
negative-space zones, whether they match `composition`'s declared reserved area, the headline-zone
backdrop tone, light direction, and legibility risks. It is a qualitative, thirds-based read — never
fabricate exact luminance numbers, pixel boxes, or hex codes.

Two of its lines are gates. **Text-free verdict:** if the still already carries a baked
headline/logo/tagline, stop — that is the upstream bug this skill exists to avoid; do not lay a second
headline over it. **Reserved-zone match:** if the emptiest area in the pixels is not where
`composition` claims, prefer the zone the pixels give you and note the divergence for the report.

This step works offline — it only reads a local file.

## 3. Direct: choose the archetype (Layer 2 — constrained choice)

From the Layer-1 analysis, the `composition`, and the deliverable's `channel`/`format`, pick **one**
preserve-compatible headline treatment from the catalogue in `references/art-direction.md` §B (type
in clean space, lower-third scrim, corner overlay, legibility gradient). The locked composition
decides which zone is available; the archetype decides how the type sits in it; the analysis decides
whether a scrim is needed for contrast. Record the choice, the target zone, and the one-line rationale
(why this treatment given the measured backdrop).

**Optional priors.** If `campaigns/<slug>/research/competitor-ads.md` exists, read its distilled
category archetype priors and let them bias the choice. The priors are a soft nudge — the locked
composition and the preserve rule still win. Absent the file, proceed on the intrinsic analysis alone;
this is a presence-checked read with no dependency.

Do not reach for a re-compositing layout (split panel, crop-to-shape, colour column). Those belong
upstream in `campaign-message` as a new key visual; say so rather than forcing one here.

## 4. Write the lockup prompt

Because GPT-Image-2 Edit preserves the reference, write an **edit instruction** from the inputs and
the archetype:

- The type of deliverable (poster, web banner, social image).
- An "add a headline to this image" instruction and the **exact headline text, in quotes**, spelled
  and punctuated exactly as `message.md` gives it (do not alter it). State the case.
- The **typeface** by name and character (from `design.md`, e.g. "a soft old-style serif" or "a bold
  rounded sans-serif like Baloo 2") and the **colour** as a name plus hex, chosen from
  `headline_lockup`/`palette` **for contrast against the measured backdrop tone** from Layer 1.
- The **archetype and target zone** from step 3: where the headline sits, and any scrim clause (a soft
  photographic gradient for legibility — never a hard band or letterbox).
- A **preserve clause**: keep the subject, palette and composition unchanged; add only the headline
  (and scrim). If the resolved model exposes a **mask** (step 5), decide one here if it helps — Layer 1
  told you exactly where the empty zone is, so a mask that confines the edit to that zone is easy to
  justify when a run keeps disturbing the subject. Most edit endpoints do **not** take a mask
  (`fal-ai/nano-banana-pro/edit` and the nano-banana-2 endpoints do not; `openai/gpt-image-2/edit`
  does), so do not depend on one: the preserve clause must be strong enough to hold on its own, naming
  the zone the headline may occupy and stating that everything outside it stays untouched.

## 5. Render via generate-image (Nano Banana Pro Edit)

First upload the key visual: `generate-image` / Nano Banana Pro Edit consume a reference **image URL**,
not a local path. Upload the `locked_still` via `mcp__fal-ai__upload_file` to get a fal-hosted URL,
**every run** — never assume a URL from a previous invocation is still valid.

Then delegate to `generate-image` with:

- **model:** `media.lockup_model` in the workspace `engine.yaml`, else `fal-ai/nano-banana-pro/edit`
  (silent fallback if `engine.yaml` is missing or names nothing). Whatever it names must be
  **edit-capable** (reference image + prompt).
- **image_urls:** `[the uploaded key visual URL]` (this model takes an **array** of reference images).
- **prompt:** the step-4 lockup prompt.
- **resolution:** `2K` on nano-banana-pro (its enum is `1K` / `2K` / `4K`, default `1K`) — headline type
  wants the pixels. On a model that exposes `quality` instead (gpt-image-2), use its highest setting.
- **aspect_ratio:** `auto`, so the output keeps the key visual's ratio. (On gpt-image-2 the equivalent
  is `image_size: auto`.) If the manifest asks for a ratio other than
  the key visual's, that ratio needs its own key visual at that crop — say so rather than stretching.
- **num_images:** 2-3, so there is a clean, correctly-spelled option to pick from.
- **output_format:** `png`.
- **mask_url** (optional, model-dependent): the mask from step 4 — only if `get_model_schema` shows the
  resolved model accepts one. Never pass it blind; an unsupported parameter fails the run.

Let `generate-image` resolve the exact fal parameter names via `get_model_schema`. Tell it the
destination is `campaigns/<slug>/media/<id>/` and the filename stem is the deliverable `id`.

**`generate-image` gates before it spends** (its step 4): the lockup prompt, model, settings and
estimated cost go to the user, who chooses between it rendering and them running it by hand. Because
this skill rerolls (step 7), declare the **whole envelope at that first gate** — `num_images` × the
2-reroll cap, and the worst-case total — so an approved loop runs to its bound without re-asking.
Rerolls inside that envelope do not re-gate; exceeding it does. If the user takes the by-hand route,
hand over the prompt and stop: Layer 3 cannot run without a render, so say so rather than reporting a
critique you did not do.

**Offline path (preserved exactly).** If the fal MCP is not connected, `generate-image` renders
nothing and hands back the prompt, model and settings. Do the same here: hand back the step-4 prompt,
the chosen archetype and target zone, the resolved settings, and the local `locked_still` path to run
by hand at fal.ai, mention `/halfborg-skills:setup-engine` once, and **write no file, no log line, and no invented
URL or cost.** Layers 1-4 still ran and inform that hand-off; Layer 3 cannot (there is no render to
read).

**Cost note.** `fal-ai/nano-banana-pro/edit` is the priciest model the engine uses per image (about
$0.15, against $0.08 for the nano-banana-2 endpoints the other render steps use), because typography
is this step's hard gate and it is the one worth paying for. Keep `num_images` lean and the reroll cap
(step 7) tight. Call `get_pricing` for the resolved model rather than reciting that figure, and never
quote a cost you did not get back from the MCP.

## 6. Critique the render (Layer 3 — read it back)

`Read` each rendered candidate and score it against the checklist in `references/art-direction.md` §C,
classing every finding **hard** or **soft**. Name what · where · which rule · the fix to try. The hard
checks are: headline spelled exactly right (the gate), the locked still preserved (not redrawn), no
second headline over baked text, legible against the backdrop, nothing overlapping the subject/face,
text/CTA inside the **channel-appropriate** safe area, and the headline surviving every `format` crop.
Soft checks (thumbnail hierarchy, typeface/colour trace, minor placement) are noted, not necessarily
rerolled.

## 7. Adjust and reroll (bounded)

If a candidate has **no hard failures**, it is a winner — pick the cleanest and go to step 8. If every
candidate has a hard failure, adjust the spec (tighten the preserve/exclusion clause, add or resize
the mask where the model supports one, change the headline colour for contrast, move the placement
zone, add or strengthen a scrim) and re-render — capped at **2 reroll rounds** to bound cost. If it still fails at the cap,
present the best candidate with its hard flags surfaced rather than looping forever, and let the user
decide. Spelling is the non-negotiable gate: never ship a misspelled headline, cap or no cap.

## 8. Write to output, log, and report

Save the chosen PNG to the deliverable's media folder, versioned per the filename grammar:

```
campaigns/<slug>/media/<id>/<id>-v<NN>.png            # single ratio
campaigns/<slug>/media/<id>/<id>-<ratio>-v<NN>.png    # if you produced more than one ratio
```

A regeneration of the same deliverable takes the next `v<NN>` — never overwrite. Then follow the log
step in `${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md`: append a `generate` line (status `iteration`) for the
saved file, and when the user approves it as the shipped static, a `status: final` line. Optionally
append one concise `note` event capturing the Layer-3 verdict (its residual soft flags) — the `note`
event is the only contract-legal home for the critique, since the log has no analysis-artifact slot.
Then rebuild the site (`node "${CLAUDE_PLUGIN_ROOT}/skills/campaign/campaign-site-builder/scripts/build-site.mjs"
"campaigns/<slug>"`).

Then report per `${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md` section 5:

- **what you made**, named as the thing it is, and what shape it is,
- **one path** — the finished PNG, in full, so they can open it,
- **the headline you set, word for word**, and where it sits on the picture, described the way a
  person looking at it would describe it. Never say "archetype",
- **what it cost**,
- **anything still worth a second look** — the residual soft flags, said as what they are ("the
  headline sits a little close to the bottle at this size") rather than as a flag count,
- plainly: nobody has checked it yet against their must-includes, the things they never say, or the
  final campaign check.

The model, the resolution and the layout you chose all went into the log. Do not recite them.

**End on a next action** per section 6 — usually whether this is the finished static, or whether they
want another go with a change.

## House rules

- **Look before you prompt.** Run the Layer-1 analysis first; the negative-space zone, backdrop tone
  and text-free verdict drive the archetype, the colour and the mask. A blind prompt is the failure
  mode this skill exists to remove.
- **Compose, never invent.** The concept, tagline, key visual and palette are locked upstream in
  `message.md`; this skill lays the agreed headline onto the agreed image via an archetype. It does
  not reword the headline, restyle the concept, or generate a new picture from scratch.
- **Spelling is the gate.** Verify the exact wording before shipping; reroll a misspelled or garbled
  headline every time.
- **Preserve the key visual.** Use the edit model with a preserve clause (and a mask, if the model
  takes one) so the
  subject and look stay put; the pass adds the headline, it does not redraw the picture. Re-compositing
  archetypes are out of scope.
- **The key visual is text-free.** If the locked still already carries baked text, stop — that is the
  upstream bug; do not lay a second headline over it.
- **Bounded reroll.** Reroll only on a hard failure, capped at 2 rounds; GPT-Image-2 Edit costs real
  money per image.
- **Safe area is channel-driven, not platform-hardcoded.** Read `channel`/`format` and apply the
  matching margins; never bake one platform's chrome into the skill.
- **Finals live in `media/<id>/`,** named `<id>[-<ratio>]-v<NN>.png`; promotion to `final` happens in
  the generation log, not by moving files. Never overwrite a version or scatter files at the repo root.
- **Fail loud.** Missing `message.md`/`locked_still`, a titled anchor, or the fal MCP down → say so and
  stop or hand back; never fabricate a path, a URL, or an image.
- **Speak plainly.** Everything you say out loud follows `${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md`: engine words belong in the files, not in the conversation. "Archetype", "Layer 3" and "hard/soft flags" are yours, not the user's.
- British spelling, no em dashes in any copy this skill authors (the headline text comes from
  `message.md` verbatim; do not alter its wording or punctuation).
