---
name: generate-image
description: >-
  Generate a real image from an image prompt using the fal.ai MCP server (default model
  fal-ai/nano-banana-2), then download it into the campaign's media folder. Use whenever
  the user has an image prompt in hand and asks to actually render it: "generate an image",
  "render this prompt", "make an image from this prompt", "turn this prompt into an image",
  "use fal to generate", "create the visual for [AD-ID]". Takes a text prompt (plus optional
  model, aspect ratio, number of images, seed, and reference image URLs for nano-banana edits),
  calls the fal MCP (search_models / get_model_schema / run_model / get_pricing), GATES on user
  approval — always showing the prompt, model, settings and estimated cost first and offering the
  choice to render it here or by hand — then saves the
  returned image(s) to campaigns/<slug>/media/<deliverable-id>/ with a versioned grammar-compliant
  filename, logs the generation, and reports the local path, source URL, model, and cost. Works
  without a FAL key too: when the fal MCP is not connected it renders nothing and hands back the
  prompt, model, and settings to run by hand at fal.ai. Do NOT use to WRITE or design a prompt
  (that is ai-image-video-prompt-builder) or to generate video — this skill renders an existing
  prompt, it does not invent one.
---

# generate-image — render an image prompt into a real asset

Take an existing image prompt and produce an actual image file via the **fal.ai MCP server**.
This is the one place in the workspace that moves past a paste-ready prompt to a rendered asset,
so it is deliberately literal: it does **not** rewrite, "improve", or invent the prompt (that is
`ai-image-video-prompt-builder`'s job) and it **never fabricates** an image URL or a local path. If the
MCP cannot run, it renders nothing and hands the prompt back to run by hand (step 1) — no key is a
supported way to run this workspace.

**It also never renders unasked.** Step 4 is an unconditional human gate: the prompt, model, settings
and estimated cost go to the user first, and they choose whether you render it or they run it by hand.
Rendering spends real money against their key, so the same hand-back block the offline path produces is
always on offer — the difference is that offline it is the only option, and online it is a choice.

Default model: **`fal-ai/nano-banana-2`** (image-conditioned edits supported via
`fal-ai/nano-banana-2/edit`).
Everything below is overridable per run. **Every campaign image lands in
`campaigns/<slug>/media/<deliverable-id>/`** with a versioned filename per
`${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md` (that spec wins over any path shorthand here). The image's
*role* decides the filename token, not the folder: `candidate` for direction options, `setup` for
start frames, `idea` for ideation variations, and no role token for the deliverable's primary
artifact. Whether it is "working" or "final" is a status in the generation log, not a location.

## 1. Preconditions — is the MCP live?

The fal MCP is a plugin-scoped streamable-HTTP server declared in the campaign-engine plugin's
`.mcp.json` (`fal-ai` → `https://mcp.fal.ai/mcp`), authenticated with the plugin's `fal_key`
setting. When connected it exposes:

- `mcp__fal-ai__search_models` — find models by keyword
- `mcp__fal-ai__get_model_schema` — the exact input parameters for a model
- `mcp__fal-ai__run_model` — run a model and return result(s)
- `mcp__fal-ai__get_pricing` — a model's cost

Before doing anything, confirm those `mcp__fal-ai__*` tools are actually available.

**If they are not, stop rendering — but do not stop.** No key is a supported way to run this
workspace, not a failure. You were *given* a prompt, so you already hold everything the user needs to
render it themselves. Resolve the model and settings exactly as you would have (steps 2-3, minus the
`get_model_schema` call you cannot make), then hand back a paste-ready block:

- the **prompt**, verbatim and unedited;
- the **model id** you would have used;
- the **settings** you resolved — aspect ratio, number of images, seed, reference images;
- where to run it: <https://fal.ai/models>.

Then, once and briefly: `/halfborg-skills:setup-engine` sets a key up if they want renders in place next time.

What does *not* change: **write no file, append no log line, and invent no URL, path, or cost.** An
unavailable MCP still means no image (the engine rule: never fabricate metrics or generated-media
links) — it just no longer means no output.

## 2. Gather the inputs

Required:
- **prompt** — the image prompt. If the user hasn't given one, ask for it (or offer to build one
  with `ai-image-video-prompt-builder` first). Do not write the creative prompt yourself here.

Optional (use sensible defaults, confirm only if ambiguous):
- **model** — precedence: what the user named for this run, else `media.image_model` in the workspace `engine.yaml`, else `fal-ai/nano-banana-2`. `engine.yaml` is a dial, not a gate: if it is
  missing, unreadable, or has no `media.image_model`, fall back **silently** and render anyway. Never
  mention the file or ask the user to create one.
- **aspect ratio / image size** — e.g. `1:1`, `4:5`, `9:16`, `16:9`. Map to whatever the model's
  schema expects (see step 3). Default to what the prompt implies, else the model default.
- **number of images** — default **1**. Only batch when asked (cost is per image).
- **seed** — pass through if the user wants reproducibility.
- **reference image URL(s)** — nano-banana supports image-conditioned edits; pass these through
  when the user provides source/reference images.
- **output folder** — see step 6.

## 3. Resolve the model and its schema

Call `get_model_schema` for the chosen model **before** running, so you use the exact parameter
names it expects (they differ between models — `prompt`, `image_size` vs `aspect_ratio`,
`num_images`, `seed`, `image_urls`, etc.). Do not guess parameter names.

- If the model id is not found, call `search_models` (e.g. "nano banana", or the user's intent
  like "text to image"), pick the closest current model, and **tell the user what you
  substituted** and why.
- Optionally call `get_pricing` so you can report an estimated cost before spending.

## 4. GATE — show the prompt, let the user choose who renders

**Never call `run_model` before the user has seen the prompt and said go.** This gate is
unconditional: it applies to every render, every model, every caller, however cheap the image and
however clearly the user asked for one earlier in the conversation. Rendering spends the user's money
against their key, so the decision to spend is theirs each time.

Present the run as one compact block:

- the **prompt, verbatim** in a fenced code block — unedited, exactly what will be sent;
- the **model id** resolved in step 3;
- the **settings** — aspect ratio, resolution/quality, `num_images`, seed, output format;
- the **reference image(s)**, if any, as local paths or URLs, in the order the model receives them;
- the **estimated cost** (`get_pricing` × `num_images`), flagged as an estimate.

Then ask which they want, offering both routes plainly:

1. **You render it** — proceed to step 5.
2. **They render it by hand** — hand back the same paste-ready block as the offline path in step 1
   (prompt, model, settings, reference paths, and <https://fal.ai/models>), then **stop**: write no
   file, append no log line, invent no URL or cost. If they later hand back a rendered file or URL,
   save and log it per steps 6-7, recording what actually happened — the model they used, and no
   cost figure you did not receive.
3. **Adjust first** — change the settings (or send the prompt back to `ai-image-video-prompt-builder`
   for a creative change), then re-present this gate. Do not treat an adjustment as approval.

**What approval covers.** One approval covers the run as presented. Changing the prompt, the model,
or `num_images` means a fresh gate. A caller running a bounded reroll loop (`compose-lockup`,
`reference-kit`) may ask once for the whole loop, but only by stating the **reroll cap and the
worst-case total spend** up front; a reroll that stays inside that approved envelope does not re-gate,
and anything beyond it does.

**Silence is not approval.** If you cannot get an answer, do not render.

## 5. Generate

On approval, call `run_model` with the resolved model id and the inputs mapped to the schema's exact
parameter names. Keep it to one image unless the user asked for more.

## 6. Save the output into the workspace

`run_model` returns hosted image URL(s) on fal. Download them locally — a hosted URL is not a
deliverable on its own.

**Destination — `media/<deliverable-id>/`, named by the grammar:**
- If the work is inside a campaign, save to `campaigns/<slug>/media/<deliverable-id>/` where the
  deliverable id is a manifest id, `key-visual`, or a registered pipeline sub-id (per the structure
  spec). Build the filename as `<deliverable-id>[-<role>][-<seq>][-<ratio>]-v<NN>.<ext>`:
  - a candidate direction → `key-visual-candidate-B-v01.png`
  - a setup start frame → `AD-R1-b-setup-<slug>-v01.png`
  - an ideation variation → `banner-ad-idea-03-v01.png`
  - the deliverable's primary image → `AD-T1-static-v01.png`
  - **Never overwrite**: if the file exists, this is a regeneration — use the next `v<NN>`.
- Otherwise (not campaign work), ask the user for a destination folder before downloading. Do not dump
  images at the repo root.

**Check the deliverable id before you create its folder.** Confirm it appears in
`campaigns/<slug>/system/manifest.yaml` or was registered in `system/generation-log.jsonl`. An
unregistered id is usually a typo, and creating the folder anyway mints a ghost that only QA catches,
much later. This is **warn and confirm, not block**: name the id, say it is not registered, offer the
closest registered match, and proceed once the user confirms. See
`${CLAUDE_PLUGIN_ROOT}/schema/preflight.md`.

**Download** each URL with whatever shell you have, keeping the real file extension from the URL.
Create the destination folder first if it does not exist.

```powershell
# PowerShell (main thread)
Invoke-WebRequest -Uri "<fal-image-url>" -OutFile "campaigns/<slug>/media/<deliverable-id>/<name>-v01.png"
```

```bash
# Bash tool (e.g. inside the paid-creative agent)
curl -L -o "campaigns/<slug>/media/<deliverable-id>/<name>-v01.png" "<fal-image-url>"
```

**Log it and rebuild the site.** For each downloaded image, follow the log step in
`${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md`: append one `generate` line to
`campaigns/<slug>/system/generation-log.jsonl` (birth status `candidate` for candidates and ideas,
`iteration` otherwise; include the prompt or a `prompt_ref`, the model, seed, source URL, and cost),
then run:

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/campaign/campaign-site-builder/scripts/build-site.mjs" "campaigns/<slug>"
```

## 7. Report back, and keep the claim posture

Report only **real returned values** — never a placeholder or an imagined link:
- the local path(s) of the downloaded image(s),
- the source fal URL(s),
- the model used (note any substitution from step 3),
- the estimated cost if you fetched pricing.

The image is a generated asset, not a cleared one: brand and claim review still apply before it
ships (the brand's `pack.mandatories` and `pack.nogos`). The generation-log
entry and site rebuild from step 6 are part of the render, not an optional extra.

## House rules

- **Never spend without a yes.** Step 4 gates every render. Show the prompt, the model, the settings
  and the estimated cost, and offer the by-hand route alongside rendering it here. No approval, no
  `run_model` — and an earlier "make me some images" is not standing approval for this one.
- **Render, never invent.** This skill executes an existing prompt; it does not write, embellish,
  or "fix" the creative. Prompt authoring is `ai-image-video-prompt-builder`.
- **Never fabricate URLs or paths.** Report only what `run_model` actually returned and what you
  actually saved. If the MCP is down, produce no image and say so.
- **Lean by default.** One image, `fal-ai/nano-banana-2`, unless the user asks for more or a
  different model. Cost is per image.
- **Verify the schema before running.** Always `get_model_schema` so parameter names are exact.
- **One home, versioned names.** Every campaign image → `campaigns/<slug>/media/<deliverable-id>/`
  with a grammar-compliant `-v<NN>` filename; role is a filename token, status lives in the log.
  Never overwrite an existing version and never scatter files at the repo root.
- **Log every render** (one `generate` line) and rebuild the site. An unlogged image shows up on
  the campaign page badged "unlogged" — that is a defect to fix, not a cosmetic.
- UK English, no em dashes in anything you author.
