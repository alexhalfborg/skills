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

The fal MCP is a plugin-scoped streamable-HTTP server declared in the `halfborg-skills` plugin's
`.mcp.json` (`fal-ai` → `https://mcp.fal.ai/mcp`), authenticated with the plugin's `fal_key`
setting. When connected it exposes:

- `mcp__fal-ai__search_models` — find models by keyword
- `mcp__fal-ai__get_model_schema` — the exact input parameters for a model
- `mcp__fal-ai__run_model` — run a model and return result(s)
- `mcp__fal-ai__get_pricing` — a model's cost

Before doing anything, confirm those `mcp__fal-ai__*` tools are actually available.

**If they are not, stop rendering — but do not stop.** No key is a supported way to run this
workspace, not a failure. Say that plainly: image generation is not connected here, so you will hand
them the picture to make at fal.ai instead. Never call it an error and never apologise for it.

You were *given* a prompt, so you already hold everything the user needs to render it themselves.
Resolve the model and settings exactly as you would have (steps 2-3, minus the `get_model_schema`
call you cannot make), then hand back a paste-ready block — the same shape as the receipt in step 4:

- the **prompt**, verbatim and unedited, in a fenced code block;
- the **model id** you would have used, exactly;
- the **settings** you resolved, as plain labels and real values — size, how many pictures, seed if
  any, reference pictures;
- where to run it: <https://fal.ai/models>.

Then, once and in a clause: `/halfborg-skills:setup-engine` sets a key up if they would rather these
came out here next time.

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

## 4. GATE — say what it costs, show what gets sent, let them choose

**Never call `run_model` before the user has seen the prompt and said go.** This gate is
unconditional: it applies to every render, every model, every caller, however cheap the image and
however clearly the user asked for one earlier in the conversation. Rendering spends the user's money
against their key, so the decision to spend is theirs each time.

Present it in two parts, in this order, per
`${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md` section 4. They do different jobs and neither
substitutes for the other.

**Part one, the sentence.** One or two lines of plain English: what you are about to make, how many,
what shape, and what it will cost. This is what they decide on, and for most runs it is all they
will read.

> I will make one square picture of the serum bottle on wet stone. About $0.04.

Say the count as a count ("one picture", "three pictures"), the shape as a shape ("square",
"portrait", "vertical, for reels") and the money as money. Name no setting here.

**Part two, the receipt.** Under a short heading — **Exactly what gets sent** — complete and
unabbreviated:

- the **prompt, verbatim, in a fenced code block**. Unedited, character for character what goes to
  the model. Never a summary, never a tidied version, never a description of it. This is the text
  they are approving;
- the **model id** exactly as it will be sent, on its own line. Gloss it in plain words beside it if
  you like ("Nano Banana 2"); never replace it with the gloss, because the id is what gets billed;
- the **settings**, as plain labels and real values — `Size: square (1:1)`, `Pictures: 1`,
  `Starting point: 51823` (omit the line entirely when you are not setting a seed). Show every value
  that will actually be sent. Plain labels, never the raw parameter names;
- the **reference picture(s)**, if any, as filenames in the order the model receives them;
- the **estimated cost**: the figure, the word "estimate", and how you got there
  (`get_pricing` × number of pictures). If pricing failed, say so and invent no number.

The receipt is not decoration and it does not shrink. It exists because the user is agreeing to one
specific piece of text being sent and one specific amount being spent, and neither is knowable from a
paraphrase. Summarising the prompt, hiding the model id behind the friendly name, dropping a setting
because it looks technical, or rounding the cost away all break the same rule. **Plain language is
the job of part one. Part two is a receipt, and receipts are literal.**

Then ask, as three plain choices of equal weight:

1. **You make it** — proceed to step 5.
2. **They run it themselves** — hand back the same paste-ready block as the offline path in step 1
   (prompt, model id, settings, reference files, and <https://fal.ai/models>), then **stop**: write no
   file, append no log line, invent no URL or cost. If they later hand back a rendered file or URL,
   save and log it per steps 6-7, recording what actually happened — the model they used, and no
   cost figure you did not receive.
3. **Change something first** — adjust the settings (or send the prompt back to
   `ai-image-video-prompt-builder` for a creative change), then show this gate again. An adjustment
   is not a yes.

**What a yes covers.** One yes covers the run as shown. A different prompt, a different model, or a
different number of pictures means a fresh gate. A caller running a bounded reroll loop
(`compose-lockup`, `reference-kit`) may ask once for the whole loop, but only by saying up front how
many tries it will make and the worst-case total; a reroll inside that envelope does not re-gate,
anything past it does.

**Silence is not a yes.** If you cannot get an answer, do not render.

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
unregistered id is usually a typo, and creating the folder anyway leaves an orphan that only QA
catches, much later. Warn and confirm, do not block — and ask it as a question about their campaign,
not about the register:

> I have nothing called `launch-blog` on this campaign. Did you mean the launch email, or is this
> something new you want adding?

See `${CLAUDE_PLUGIN_ROOT}/schema/preflight.md`.

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

**Log it and rebuild the page.** For each downloaded image, follow the log step in
`${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md`: append one `generate` line to
`campaigns/<slug>/system/generation-log.jsonl` (birth status `candidate` for candidates and ideas,
`iteration` otherwise; include the prompt or a `prompt_ref`, the model, seed, source URL, and cost).
Once every image from this call is logged, rebuild the page **once** — follow `campaign-site-builder`
for `campaigns/<slug>`; never once per image.

## 7. Report back, and keep the claim posture

Follow `${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md` section 5, and report only **real returned
values** — never a placeholder or an imagined link:

- **what you made**, named as the thing it is ("the square version of the launch static"), and how
  many;
- **one path** — the file they would open, written out in full. If you saved several, that is a
  count, not a list;
- **what it cost**, if you spent anything. This is spoken, always;
- **anything that did not go to plan**: a model you substituted for the one approved, a setting the
  schema would not take, a download that failed.

The model, the seed and the source URL went into the generation log in step 6. That is what makes it
safe to leave them out of the conversation — do not recite them.

The image is a generated asset, not a cleared one: brand and claim review still apply before it
ships (the brand's `pack.mandatories` and `pack.nogos`). Say that in the user's terms — it has not
been checked against their must-includes or the things they never say — rather than by field name.
The generation-log entry and site rebuild from step 6 are part of the render, not an optional extra.

**End on a next action**, per section 6 of the same spec. What that is depends on why the picture
exists: inside `campaign-message` it is "pick one and I will lock it in"; on a deliverable it is
"want the headline laid onto it?"; standalone it is "want another go with a change?" One offer, not
a menu.

## House rules

- **Never spend without a yes.** Step 4 gates every render: a plain sentence with the cost in it,
  then a literal receipt — the verbatim prompt, the exact model id, the real settings, the estimate.
  The by-hand route is offered alongside rendering it here, at equal weight. No approval, no
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
- **Speak plainly.** Everything you say out loud follows
  `${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md`: engine words belong in the files, not in the
  conversation. The one place that never softens is the gate receipt — the prompt, the model id and
  the money stay exact.
- UK English, no em dashes in anything you author.
