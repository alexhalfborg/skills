---
name: reference-kit
description: >-
  Prepare the identity reference stills a video ad's generation prompt binds to, each one on-model with the campaign's locked master visual. Reference-to-video models (the engine default bytedance/seedance-2.0/reference-to-video, Kling reference) take several uploaded stills that carry IDENTITY — what a character, product, palette or style looks like — while the prompt carries composition; this skill produces the ones that do not already exist. Use whenever a video ad needs an identity reference that the master visual doesn't already supply: "prepare the reference kit for [AD-ID]", "generate the reference stills for the video", "make the identity references", "render the @Image2 product reference", "I need reference images for the video ad". It is the identity twin of compose-lockup: reuse-first (it prefers the locked still, per-subject key-visual stills, a pack product photo, or a prior locked render and generates only genuine gaps), it edits/derives each still off the locked master visual, critiques the render for on-model consistency, rerolls a hard fail, then locks the result and hands its exact path back so the video prompt can cite it. Reads campaigns/<slug>/docs/message.md (master_visual.subjects / locked_still / palette / lighting / motif / constants), brands/<id>/design.md (palette, typeface), brands/<id>/pack.yaml (products, ads.presenter guardrail), and the reference declaration video-ad-script wrote into the script doc. Delegates the render to generate-image with an identity-preserving edit model; writes into campaigns/<slug>/media/<id>/ with a `ref` role token. Do NOT use to invent the campaign CONCEPT or a recurring CHARACTER the master visual never locked (that is campaign-message — this skill fills ad-scoped prop/insert/setting gaps only and routes a missing recurring subject back); to lay a HEADLINE onto an image (compose-lockup); to WRITE the video or image prompt (ai-image-video-prompt-builder / video-ad-script); or to RENDER the clip (generate-video). It produces still reference inputs, not the finished ad.
---

# Reference kit — the identity stills a video prompt binds to

A reference-to-video model does not take a start frame. It takes a small set of **identity
references** — stills that tell it what a character, a product, a palette or a style *looks like* —
and the prompt supplies all composition (shot size, angle, camera, cuts). This skill produces the
identity references a video ad needs that do not already exist, each one **on-model with the locked
master visual**, and hands their exact locked paths back so `video-ad-script`'s prompt can cite them
as `@Image1`, `@Image2`, and so on.

It is the **identity twin of `compose-lockup`**. Where compose-lockup reads the locked text-free key
visual and lays a *headline* onto it, this skill reads the same key visual and derives an *identity
still* from it — the founder isolated on a clean background, the hero product on white, an ad-scoped
prop lit to match the campaign look. Both are the same loop: read the locked still, write an edit
prompt, delegate the render to `generate-image`, read the render back, critique, and reroll a hard
fail before locking.

This is step 1.5 of the ads pipeline's video branch: `ad-creative` → `video-ad-script` (declares the
kit) → **`reference-kit`** (fills the gaps) → `generate-video` (binds them).

Where the neighbours sit:

- `campaign-message` locks the **text-free** master visual and, for a campaign with recurring
  subjects, can lock **one still per subject** (`media/key-visual/key-visual-<subject-id>-v01.png`).
  Read-only here. It is the source of truth for recurring subjects — this skill never re-imagines one.
- `video-ad-script` **declares** which `@ImageN` references its prompt will need, mapping each to
  REUSE or GENERATE. This skill acts on the GENERATE gaps and returns their locked paths.
- `generate-image` is the render engine this skill delegates to (an identity-preserving edit model).
  This skill does not invent the render; it owns the reference prompt.
- `generate-video` binds the reference stills at render time and gates on cost. This skill never
  renders the clip and never spends on video.
- `campaign-qa` is the independent gate. The Layer-3 critique here is a producer-side pre-check, not
  a substitute for QA.

Campaign paths and filenames follow `${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md`; that spec wins over any
path shorthand here.

## 1. Read the inputs

The campaign workspace and the active brand should have been provided to you — run
`/campaign-engine:setup-engine` if not. Resolve the campaign, brand and message per
`${CLAUDE_PLUGIN_ROOT}/schema/preflight.md` before reading anything below.

1. **`campaigns/<slug>/docs/message.md`** — the required input. Pull from `master_visual`:
   `subjects[]` (each `id` + `definition`), `locked_still` (the text-free key visual path), `palette`,
   `lighting`, `motif`, and `constants`. If `message.md` is missing, stop and point the user to
   `campaign-message` — this skill derives references from a locked master visual, it does not invent
   one. If `locked_still` is set but the file is missing, stop and say so.
2. **The reference declaration** — the REUSE/GENERATE map `video-ad-script` wrote into the script doc
   (`content/<pipeline-id>-scripts.md` or `content/<ad-id>-script.md`), listing each `@ImageN` the
   prompt will need with its role, identity definition, and (for a REUSE) its path. If you were
   invoked without one, build the map yourself from the script's subject block and shot grammar.
3. **`brands/<id>/design.md`** — resolve `<id>` from `campaign.brand` in
   `campaigns/<slug>/system/manifest.yaml` (`${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md` section 1.1), not
   by asking. Read the **palette hexes** and **typeface** so a generated prop matches the brand look.
   Minimal shape is fine: read what is there, carry on without what is missing.
4. **`brands/<id>/pack.yaml`** — the `products[]` (a real product photo is the preferred reference for
   a hero SKU) and **`ads.presenter`** (the presenter guardrail, step 2).

## 2. Resolve the gap list (Layer 1 — reuse before you generate)

For each declared reference, decide **REUSE** or **GENERATE**. Generation is the exception; most
references reuse an asset that already exists. In preference order, REUSE:

- the `master_visual.locked_still` (the primary subject's identity is already in it),
- a per-subject `media/key-visual/key-visual-<subject-id>-v01.png` locked by `campaign-message`,
- a **real product photograph** from `pack.yaml` when a hero object must match a live SKU
  (`generate-video` already defaults to this as a second reference — prefer the real photo over a
  render),
- a prior locked render already under `media/`.

Name the exact path for every REUSE and move on — it needs no work here.

Mark **GENERATE** only for a genuine gap: an identity the prompt needs that no existing asset
supplies. Then apply two boundaries before generating:

- **Ad-scoped props only.** A prop, insert, or setting that appears in *this* ad is yours to
  generate, style-consistent with the locked still. A missing **recurring character or subject** is
  **not** yours to invent — `message.md` is the source of truth for recurring subjects. This applies
  to any recurring subject the locked still does **not already contain**: a faced protagonist in a
  script whose anchor is product-led (hands only) is uncovered, not an ad-scoped prop, so route it
  back rather than isolating a face that is not in the still to isolate. Say the master visual should
  be re-locked in `campaign-message` to add the subject (and lock its per-subject still), and generate
  an ad-hoc stand-in here only if the user explicitly says to.
- **Presenter guardrail.** If `ads.presenter` is `founder-voice-only`, never generate that person as a
  photoreal face. Their real voice carries the first-person lines; a face is not synthesised. Honour
  the same rule for any real, named person.

If the gap list is empty after reuse — a common, good outcome — report that no generation was needed,
list the REUSE paths back to `video-ad-script`, and stop.

## 3. Write the reference prompt (per gap)

Two shapes, depending on whether the subject is already in the locked still:

- **In the locked still (isolate / re-pose).** Write an **edit** instruction off the locked still:
  isolate or re-pose the subject on a clean, neutral, evenly lit background; preserve identity, form,
  material, palette and lighting character; add nothing. It is text-free — no headline, tagline, or
  logo, same as the anchor.
- **A new ad-scoped prop (derive the look).** The prop is not in the still to edit out, so generate it
  fresh, but pass the locked still as a **style/palette** reference and carry `palette`, `lighting`
  and `design.md` hexes as constants, so the new object reads as part of the same campaign. Give the
  prop's definition from the declaration. Text-free.

In both cases state the reference's **role** (`identity` / `product` / `style` / `scene`) so the
critique and the downstream `@ImageN` handle agree, and keep the framing clean and single-subject — a
reference locks identity best from an isolated, uncluttered still, not a busy scene.

## 4. Render via generate-image

First upload the reference image(s) the edit needs: `generate-image` consumes reference **image
URLs**, not local paths. Upload the `locked_still` (and any style reference) via
`mcp__fal-ai__upload_file` to get fal-hosted URLs **every run** — never assume a URL from a previous
invocation is still valid.

Then delegate to `generate-image` with:

- **model:** `media.reference_model` in the workspace `engine.yaml`, else
  `fal-ai/nano-banana-2/edit` (silent fallback if `engine.yaml` is missing or names nothing).
  Whatever it names must be an **identity-preserving edit-capable** endpoint — it takes an `image_urls`
  reference plus a prompt, so it is the `/edit` endpoint, **not** the base text-to-image one (that
  base endpoint exposes no image input). nano-banana is the character/object-consistency specialist,
  which is exactly what this step needs and why the engine points every edit-mode render at it.
- **image_urls:** the uploaded reference URL(s) (the locked still, plus a style reference if used).
- **prompt:** the step-3 reference prompt.
- **num_images:** 2-3, so there is a clean on-model option to pick from.
- **output_format:** `png`.

Let `generate-image` resolve the exact fal parameter names via `get_model_schema`. Tell it the
destination is `campaigns/<slug>/media/<id>/` (the ad's own deliverable folder) and the filename stem
is the deliverable `id`.

**`generate-image` gates before it spends** (its step 4): the prompt, model, settings and estimated
cost go to the user, who chooses between it rendering and them running it by hand. Gate **once for the
whole kit**, not once per gap — this skill is reuse-first, so present the list of genuine gaps
together with the per-gap prompts and the worst-case total (gaps × `num_images` × the reroll cap) and
take one decision on it. If the user renders by hand, collect the returned stills, then lock and cite
them exactly as if you had rendered them.

**Offline path (mirrors compose-lockup and generate-image exactly).** If the fal MCP is not connected,
`generate-image` renders nothing. Do the same here: hand back, per gap, the step-3 prompt, the model,
the resolved settings, and the local reference path(s) to run by hand at fal.ai; list the REUSE paths;
mention `/campaign-engine:setup-engine` once; and **write no file, no log line, and no invented URL or cost.**
`video-ad-script`'s Step B then cites the planned paths and flags them, and `generate-video` lists
them in its own offline hand-back. Layer 3 cannot run — there is no render to read.

## 5. Critique the render (Layer 3 — read it back)

`Read` each rendered candidate and score it, classing every finding **hard** or **soft**. Name
what · where · which rule · the fix to try. The hard checks:

- **On-model identity** — the subject matches its `master_visual` definition (and the locked still
  where it appears): same face/build/wardrobe for a person, same material/form/colour for an object.
- **Text-free** — no headline, tagline, logo, or watermark baked in (a reference carries no type).
- **Presenter guardrail intact** — no photoreal synthetic face of a real, named person barred by
  `ads.presenter`.
- **Clean isolation** — a single clear subject on an uncluttered background; no unwanted scene bleed
  or extra objects that would confuse the identity lock.

Soft checks (palette/lighting trace, minor pose, background tone) are noted, not necessarily rerolled.

## 6. Adjust and reroll (bounded)

If a candidate has **no hard failures**, it is a winner — auto-pick the cleanest and go to step 7. If
every candidate has a hard failure, adjust the spec (tighten the preserve/isolation clause, restate
the identity invariants, strengthen the style reference, simplify the background) and re-render —
capped at **2 reroll rounds** to bound cost. If it still fails at the cap, present the best candidate
with its hard flags surfaced and let the user decide. On-model identity is the gate this skill exists
to hold: never lock a reference that does not look like its subject.

## 7. Write to output, log, and report

Save the chosen PNG to the ad's media folder, versioned per the filename grammar with the `ref` role
and a short descriptive slug:

```
campaigns/<slug>/media/<id>/<id>-ref-<slug>-v<NN>.png    # e.g. AD-R1-b/AD-R1-b-ref-serum-bottle-v01.png
```

A regeneration of the same reference takes the next `v<NN>` — never overwrite. Then follow the log
step in `${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md`: append a `generate` line (status `iteration`, role
`ref`, with the prompt or `prompt_ref`, model, seed, source URL, cost), then a **`status: locked`**
line — the contract defines `locked` precisely as the status for "reference inputs the campaign binds
to." Optionally append one `note` event capturing the Layer-3 verdict (residual soft flags). Then
rebuild the site (`node "${CLAUDE_PLUGIN_ROOT}/skills/campaign-site-builder/scripts/build-site.mjs"
"campaigns/<slug>"`).

Then report:

- **the exact locked path of every reference in the kit** — both the ones you generated and the REUSE
  paths — in the pass order the video prompt should list them, so `video-ad-script`'s Step B can drop
  them straight into `REFERENCES (in pass order)` and bind each to its `@ImageN`,
- the model and cost of anything you rendered,
- any residual **soft** flags from Layer 3 for QA to weigh,
- plainly: these are generated assets, not cleared ones — `pack.mandatories`, `pack.nogos` and
  `campaign-qa` still apply before anything ships.

## House rules

- **Reuse before you generate.** Prefer the locked still, a per-subject key-visual, a real product
  photo, or a prior locked render. Generation is the exception, and an empty gap list is a good result.
- **Derive, never invent the concept.** The look, palette and subjects are locked upstream in
  `message.md`. This skill isolates, re-poses, or style-matches — it does not restyle the campaign.
- **Ad-scoped props only; recurring characters trace to message.md.** A missing recurring subject is
  re-locked in `campaign-message`, not invented here.
- **References are text-free.** An identity reference carries no headline or logo, just like the anchor.
- **Honour the presenter guardrail.** Never render a real, named person as a photoreal face when the
  pack bars it.
- **Preserve identity.** Use the edit model with a preserve/isolation clause; the pass isolates the
  subject, it does not redraw it into someone else.
- **Bounded reroll.** Reroll only on a hard failure, capped at 2 rounds; every render costs money.
- **Lock what the campaign binds to.** A picked reference gets a `status: locked` log line; downstream
  pointers name its exact versioned path. Never overwrite a version or scatter files at the repo root.
- **Fail loud.** Missing `message.md`/`locked_still`, or the fal MCP down → say so and stop or hand
  back; never fabricate a path, a URL, or an image.
- British spelling, no em dashes in any copy this skill authors.
