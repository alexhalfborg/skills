---
name: generate-video
description: >-
  Render a real video from a prompt plus reference images using the fal.ai MCP server (default model
  bytedance/seedance-2.0/reference-to-video), showing a cost estimate and waiting for explicit approval
  before it spends, then downloading the clip into the campaign's media folder. Use whenever the
  user has a video prompt and a still in hand and asks to actually render it: "generate a video",
  "render this video prompt", "turn this prompt into a video", "animate this still", "image-to-video",
  "use fal for video", "make the video for [AD-ID]". Takes a text prompt and up to nine reference
  images (local paths or URLs), plus optional model, duration, resolution, aspect ratio, and audio;
  calls the fal MCP (search_models / get_model_schema / get_pricing / upload_file / submit_job /
  check_job / get_job_result), estimates cost, GATES on user approval — always showing the verbatim
  prompt, settings and estimate first and offering the choice to render it here or by hand — saves the returned .mp4 to
  campaigns/<slug>/media/<deliverable-id>/ with a versioned filename, logs the generation, verifies it
  with ffprobe/ffmpeg (duration, resolution, a sample frame), and reports the local path, source URL,
  model, and cost. Works without fal connected too: when the fal MCP is not connected it renders nothing
  and hands back the prompt, model, settings, and reference stills to run by hand at fal.ai. Do
  NOT use to
  WRITE or design the prompt (that is write-generation-prompt) or to generate a still image
  (that is generate-image) — this skill renders an existing video prompt, it does not invent one.
---

# generate-video — render a video prompt into a real clip

Take an existing video prompt plus its reference images and produce an actual video file via the
**fal.ai MCP server**. This is the video counterpart to `generate-image`: it is deliberately literal,
it does **not** rewrite, "improve", or invent the prompt (that is `write-generation-prompt`'s
job), and it **never fabricates** a video URL or a local path. Video is expensive and long-running,
so this skill always shows the verbatim prompt with a cost estimate and **stops for explicit approval
before spending** (step 5), letting the user choose between you rendering it and them running it by
hand. If the MCP cannot run, it renders nothing and hands the prompt back to run by hand (step 1) — no
key is a supported way to run this workspace.

Default model: **`bytedance/seedance-2.0/reference-to-video`** — up to nine reference images (also
videos and audio), addressed inside the prompt as `#Image1`, `#Image2` and so on, with native audio
and director-level camera control, 4-15 seconds per generation.

**The references are not a first frame.** They tell the model what things *look like* — a character,
a product, a palette, a style. Composition, shot size, camera moves, and any cuts come from the
**prompt**. Two consequences follow, and both matter:

- A short ad is usually **one generation**, not a stack of stitched clips. Seedance 2.0 does
  multi-shot editing within a single prompt, so ask the script how many segments it declared rather
  than assuming one prompt equals one shot.
- You do **not** need a rendered start frame per shot. Do not send anyone to `generate-image` to make
  one. That requirement belongs only to the `image-to-video` override below.

Use **`bytedance/seedance-2.0/image-to-video`** instead only when the job is genuinely to animate one
exact still (it takes a single `image_url` start frame plus an optional `end_image_url`, and its
composition is fixed by that frame). Say so when you switch, and note the trade: it caps at 720p.

Everything below is overridable per run. Output: `campaigns/<slug>/media/<deliverable-id>/` with a
versioned filename — campaign paths and filenames follow `${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md`,
which wins over any path shorthand here.

## 1. Preconditions — is the MCP live, and is ffmpeg present?

**Local tooling: `ffprobe` / `ffmpeg`.** Step 8 verifies the downloaded clip with `ffprobe` (metadata)
and `ffmpeg` (a still frame to eyeball), so a working ffmpeg is what lets you check the output.
Confirm with `ffprobe -version` rather than assuming — it is an optional dependency and may not be
installed. ffmpeg is required only for verification, never for rendering: if it cannot be found,
still deliver the clip but say clearly that you could **not** check it — in those words, not as
"unverified" — rather than skipping silently or claiming a check you did not run. This is the only
place ffmpeg is checked at all — nothing upstream checks it for you, so confirm it here, every time.

**The fal MCP.** The fal MCP is a plugin-scoped streamable-HTTP server declared in the
`halfborg-campaign` plugin's `.mcp.json` (`fal-ai` → `https://mcp.fal.ai/mcp-relay`, fal's OAuth
relay), which the user signs in to once through `/mcp`. There is no key. Video uses the **async job** tools, not a
single `run_model` call. When connected the server exposes:

- `mcp__fal-ai__search_models` — find models by keyword / category
- `mcp__fal-ai__get_model_schema` — the exact input parameters for a model
- `mcp__fal-ai__get_pricing` — a model's cost
- `mcp__fal-ai__upload_file` — upload a local file and get a fal-hosted URL
- `mcp__fal-ai__submit_job` — queue a long-running job (returns a job/request id)
- `mcp__fal-ai__check_job` — poll a queued job's status
- `mcp__fal-ai__get_job_result` — fetch the finished job's output
- `mcp__fal-ai__cancel_job` — cancel a queued job (for user aborts)

Before doing anything, confirm those `mcp__fal-ai__*` tools are actually available.

**If they are not, stop rendering — but do not stop.** Not connecting fal is a supported way to run this
workspace, not a failure. Say that plainly: video generation is not connected here, so you will hand
them everything needed to make the clip at fal.ai instead. Never call it an error and never
apologise for it.

You were *given* a prompt and stills, so you already hold everything the user needs to render it
themselves. Resolve the model and settings exactly as you would have (steps 2-3, minus the
`get_model_schema` call you cannot make), then hand back a paste-ready block — the same shape as the
receipt in step 5:

- the **prompt**, verbatim and unedited, in a fenced code block;
- the **model id** you would have used, exactly;
- the **settings** you resolved, as plain labels and real values — length, size, shape, sound on or
  off;
- the **reference stills** as local paths, each with the `#ImageN` handle it maps to. Say in one
  sentence that at fal.ai they attach each still by typing `#` in the prompt box, in the order listed,
  and that the prompt already refers to them by those handles;
- where to run it: <https://fal.ai/models>.

Then, once and in a clause: signing in to fal with `/mcp` (or `/halfborg-campaign:setup-engine` for a walkthrough) is all it takes if they would rather these
came out here next time.

What does *not* change: **write no file, append no log line, and invent no URL, path, duration, or
cost.** An unavailable MCP still means no video (the engine rule: never fabricate metrics or
generated-media links) — it just no longer means no output. There is nothing to cost-gate here:
handing back a prompt spends nothing.

## 2. Gather the inputs

Required:
- **prompt** — the video prompt (the motion / action description). If the user hasn't given one, ask
  for it (or offer to build one with `write-generation-prompt` first). Do not write the
  creative prompt yourself here.
- **reference images** — up to nine stills that tell the model what things look like, passed as
  `image_urls` and addressed in the prompt as `#Image1`, `#Image2`, and so on. Local paths or URLs.
  They are **not** start frames: they carry identity, not composition. If this is campaign work and
  the user hasn't named any, default to the campaign's locked still (`docs/message.md`
  `master_visual.locked_still`, e.g. `media/key-visual/key-visual-v02.png`) so the video matches the
  campaign's canonical subject, and add the real product photograph (`products[].photo` in the pack)
  as a second reference when a hero object must match a live SKU. If that field is empty and the clip
  turns on a real product, **ask for the photo rather than rendering a stand-in** — a synthesised SKU
  looks like the product without being it. A video prompt from `write-video-ad-script` may cite further
  identity references (an ad-scoped prop, a second subject) that `prepare-reference-kit` has already rendered
  and locked off the master visual — pass those as additional `#ImageN` stills. They are still identity
  references, not start frames, so this does not change the rule below.

  **The binding rule, stated once for this whole skill.** `image_urls` is ordered and the order is the
  only thing connecting a picture to the prompt: `image_urls[0]` is `#Image1`, `image_urls[1]` is
  `#Image2`. The prompt must **cite** every reference by its handle, and you must pass every handle the
  prompt cites. Neither half errors when it is wrong — a handle with no file is quietly ignored, and a
  file the prompt never names is quietly unused. So check the two agree before submitting, and **never
  re-order, drop, or pad `image_urls` to resolve a mismatch**: fix the prompt or stop. Steps 5 and 6
  refer back to this rule rather than restating it.

  Do **not** route to `generate-image` to manufacture a start frame per shot. Under reference-to-video
  there is no such thing. (The `image-to-video` override does require exactly one real start frame;
  the rule applies only there.)

Optional (use sensible defaults, confirm only if ambiguous):
- **model** — precedence: what the user named for this run, else `media.video_model` in the workspace `engine.yaml`, else `bytedance/seedance-2.0/reference-to-video`. `engine.yaml` is a dial, not a
  gate: if it is missing, unreadable, or has no `media.video_model`, fall back **silently** and render
  anyway. Never mention the file or ask the user to create one.
- **duration** — seconds. Seedance 2 accepts `4`–`15` (as strings) or `auto`. If this is a manifest
  asset entry, read `duration_seconds` from it (the manifest schema carries `duration_seconds` for
  video entries) and map to the nearest allowed value. Default `auto`. A script that declared one
  segment expects **one** generation covering the whole segment, not one call per shot.
- **resolution** — read the model schema; the ceiling is **per endpoint**, not per model family.
  `reference-to-video` accepts `480p` / `720p` / `1080p` / `4k`; `image-to-video` currently caps at
  `720p`. Never carry one endpoint's ceiling across to the other, and never offer a resolution the
  chosen endpoint's schema does not list. Default `720p`. Higher resolution costs more.
- **aspect ratio** — `auto` / `21:9` / `16:9` / `4:3` / `1:1` / `3:4` / `9:16`. Default `auto`; set it
  from the deliverable's ratio when known (e.g. `9:16` for a reel). Under reference-to-video there is
  no start frame to infer the ratio from, so state it explicitly rather than leaving it to `auto`.
- **end frame** — `image-to-video` only: an optional `end_image_url` to transition to; upload it too
  if it is a local file. `reference-to-video` has no end-frame parameter.
- **audio** — **the skill does not decide this.** Whether a brand will put a synthesised voice or
  synthesised sound on its creative is a brand decision, and it has already been made upstream: it
  travels down the artifact chain as the concept's `Voice:` flag, the script's voice-routing note,
  and finally the prompt's `AUDIO:` block. Read that block and obey it. `AUDIO: none` or "silent"
  means `generate_audio: false`; a specified audio bed means `true`. If the prompt says nothing about
  audio, **raise it at the approval gate in step 5** and let the user answer. Never hardcode a
  default, never infer one from brand facts this skill does not read, and never quietly flip it.
  Note the model generates lip-synced speech when audio is on, so a wrong guess here can fabricate a
  voice for a real person. Cost is identical either way, so there is nothing to trade off.
- **seed** — pass through **only if the resolved schema lists a `seed` input.** It is not universal:
  `reference-to-video` currently exposes no seed input, though it does return one. Never log a seed
  you did not actually set; record the returned seed as an output, not as a reproducibility promise.
- **output folder** — see step 6.

Note: `bytedance/seedance-2.0/image-to-video` takes a **single** start image (plus optional end
frame) and fixes composition to it. Reach for it only when animating one exact still is the point.

### Rendering a whole script (batch)

Ask the script how many **segments** it declared. Under reference-to-video a segment is one
generation, and a short ad usually fits in one, cuts and all. Only a script that exceeds the model's
duration cap is a batch. When there genuinely is more than one segment (or several ads at once):

1. **References first, not start frames.** Confirm every segment cites reference images that exist,
   and that the `#ImageN` handles in the prompt match the `image_urls` you are about to pass. Do not
   render any start frames.
2. **Quote the set, gate once.** Sum the per-segment estimates and present **one** combined cost block
   for the batch, then take a **single** approval — do not prompt per segment. On approval, render
   each in order, reporting progress. On any failure, keep going and report which succeeded, which
   failed, and the total actually charged.
3. **Continuity across segments is not guaranteed.** Independent generations drift even from shared
   references. Say so, and prefer a hard cut at the seam over a match-cut that will not match.

## 3. Resolve the model and its schema

Call `get_model_schema` for the chosen model **before** running, so you use the exact parameter names
it expects. For `bytedance/seedance-2.0/reference-to-video` the current fields are: `prompt`
(required), `image_urls`, `video_urls`, `audio_urls`, `aspect_ratio`, `generate_audio`, `resolution`,
`bitrate_mode`, `duration`, `end_user_id`. Note there is **no** `image_url`, no `end_image_url`, and
no `seed` input. The sibling `image-to-video` endpoint takes `image_url` (required), `end_image_url`,
and `seed` instead. The two are not interchangeable — always re-read the schema, never guess, and
never copy a parameter name across from the other endpoint.

- If the model id is not found, call `search_models` (category `image-to-video`, or the user's
  intent), pick the closest current model, and **tell the user what you substituted** and why.

## 4. Upload the reference images

Every reference must be a URL (max 30 MB each; JPEG / PNG / WebP; up to 9 images, and no more than 12
files across all modalities). If the user gave local files (the usual case — the locked still lives on
disk), call `upload_file` on each to get fal-hosted URLs. Pass existing URLs through unchanged.
**Never fabricate a URL** — if an upload fails, stop and report it.

**Upload in the order step 2 fixed, and keep it.** The binding rule is in step 2; apply it here. A
mismatch shows up later as a subject that does not match the campaign's anchor, never as an error.

## 5. Estimate cost, then GATE on approval

**Never submit before the user approves.** `generate-image` gates the same way; what differs here is
the size of the number — video costs multiples of a still, so the estimate carries more weight and the
by-hand route is more often the sensible pick.

1. Establish the rate. Seedance 2 is priced **per second of output, by resolution** — per fal's docs
   roughly **~$0.30/second at 720p** (720p with audio is listed at ~$0.3034/s; audio does not change
   the price), with `480p` materially cheaper. The generic `get_pricing` tool returns an opaque
   per-`unit` figure that does not map cleanly to a total, so prefer the per-second rate (confirm the
   current number via `search_docs` "seedance 2.0 pricing" when in doubt). Estimate = rate ×
   duration; e.g. a 6 s 720p clip ≈ ~$1.80. Always state it is an **estimate**; the exact charge is
   only known once the job returns. Do not present a fabricated precise figure.
2. Present it in two parts, in this order, per
   `${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md` section 4. They do different jobs and neither
   substitutes for the other.

   **Part one, the sentence.** One or two lines of plain English: what the clip is, how long, and
   what it will cost. Cost is the whole reason this gate exists here, so it goes in the first
   sentence.

   > A 6-second vertical clip of the bottle on wet stone, with sound. Around $1.80 — video is
   > priced by the second, so a 15-second version would be closer to $4.50.

   Say the length as seconds, the shape as a shape ("vertical, for reels"), the money as money.
   Name no setting here.

   **Part two, the receipt.** Under a short heading — **Exactly what gets sent** — complete and
   unabbreviated:

   - the **prompt, verbatim, in a fenced code block**. Unedited, character for character what goes
     to the model. Never a summary: the user approves the text that gets sent, so show it;
   - the **model id** exactly as it will be sent, on its own line, glossable but never replaced by
     the gloss;
   - the **settings**, as plain labels and real values — `Length: 6 seconds`, `Size: 720p`,
     `Shape: vertical (9:16)`, `Sound: on`;
   - the **reference pictures**, each as a filename **and** the `#ImageN` handle it maps to, in
     order. Keep the handles exactly as written: they are what the prompt cites, and they are what
     the user needs if they take the by-hand route;
   - the **estimated cost with its arithmetic** — `$0.30/second × 6 seconds = about $1.80` — the
     word "estimate", and the note that the exact charge is only known once the job returns.

   The receipt does not shrink to be friendly. Summarising the prompt, hiding the model id behind
   the friendly name, dropping a setting because it looks technical, or rounding the cost away all
   break the same rule. **Plain language is the job of part one. Part two is a receipt, and receipts
   are literal.**
3. **If the prompt did not state whether audio is generated, ask here**, in part one, as a plain
   sentence. Do not resolve it yourself: say that sound-on means the model invents speech and
   effects, that this is a brand call rather than yours, and that you would rather check before
   spending.
4. **Stop and ask which route they want**, three plain choices of equal weight:
   - **You make it** — proceed to step 6 on an explicit go.
   - **They run it themselves** — hand back the same paste-ready block as the offline path in step 1
     (prompt, model id, settings, the reference stills in `#ImageN` order, and
     <https://fal.ai/models>), then **stop**: write no file, append no log line, invent no URL or
     cost. If they later hand back a rendered clip, save, verify and log it per steps 7-8, recording
     only what actually happened.
   - **Change something first** — adjust and show this gate again. An adjustment is not a yes.

   Do not `submit_job` until the user says go, and treat silence as a no. If they decline outright,
   do nothing and offer a cheaper cut — shorter, or smaller. One yes covers the run as shown: any
   change to the prompt, model, length or size means a fresh gate.

## 6. Submit, poll, and fetch the result

On approval:
1. `submit_job` with the resolved model id and inputs mapped to the schema's exact parameter names.
   Keep the returned job / request id.
2. Poll `check_job` until the job is complete. Video takes a while; poll at a sensible cadence and
   keep the user informed rather than blocking silently. If the user aborts, `cancel_job`.
   **Poll with the `check_job` MCP tool — it returns a structured status. Do not improvise a shell
   loop that greps the raw status URL for a literal like `"status":"COMPLETED"`: fal returns
   pretty-printed JSON (`"status": "COMPLETED"`, with a space), so an exact-substring match silently
   never fires and the loop sleeps forever, looking like a hang. If you must poll in a shell (e.g.
   foreground `sleep` is blocked so you background the wait), match tolerantly and
   case-insensitively (`grep -iE 'completed|failed'`), never an exact quoted-JSON fragment, and stop
   on failure states too.**
3. `get_job_result` to fetch the finished output (the hosted `video` URL, and a `seed` the model
   reports back). Treat that seed as a record of what happened, not as a knob you set, unless the
   endpoint's schema actually accepted a `seed` input.

Report failures honestly — a failed or cancelled job means no clip; say so.

## 7. Save the output into the workspace

`get_job_result` returns a hosted video URL on fal. Download it locally — a hosted URL is not a
deliverable on its own.

**Destination:**
- If the work is inside a campaign (the user named a campaign, or you're operating on files under
  `campaigns/<slug>/`), save to **`campaigns/<slug>/media/<deliverable-id>/`** where the deliverable
  id is a registered ad/sub-id or manifest id (per the structure spec). Name the file by the grammar:
  a clip of a multi-clip ad is `<deliverable-id>-clip<N>-v<NN>.mp4` (e.g. `AD-R1-b-clip2-v01.mp4`);
  a single-video deliverable is `<deliverable-id>-v<NN>.mp4`. **Never overwrite** — a re-render of
  the same clip takes the next `v<NN>`.
- Otherwise (not campaign work), ask the user for a destination folder before downloading. Do not dump
  files at the repo root.

**Check the deliverable id before you create its folder.** Confirm it appears in
`campaigns/<slug>/system/manifest.yaml` or was registered in `system/generation-log.jsonl`. An
unregistered id is usually a typo, and creating the folder anyway leaves an orphan that only QA
catches, much later. Warn and confirm, do not block — and ask it as a question about their campaign,
not about the register:

> I have nothing called `launch-teaser` on this campaign. Did you mean the launch reel, or is this
> something new you want adding?

See `${CLAUDE_PLUGIN_ROOT}/schema/preflight.md`.

**Download** the URL, keeping the real file extension from the URL (usually `.mp4`). Create the
destination folder first if it does not exist.

```powershell
# PowerShell (main thread)
Invoke-WebRequest -Uri "<fal-video-url>" -OutFile "campaigns/<slug>/media/<deliverable-id>/<deliverable-id>-clip1-v01.mp4"
```

```bash
# Bash tool (e.g. inside the paid-creative agent)
curl -L -o "campaigns/<slug>/media/<deliverable-id>/<deliverable-id>-clip1-v01.mp4" "<fal-video-url>"
```

**Log it and rebuild the page.** Follow the log step in `${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md`:
append one `generate` line per clip to `campaigns/<slug>/system/generation-log.jsonl` (role `clip`,
status `iteration`, with the prompt or `prompt_ref`, `refs` — the reference stills as **paths**, in
handle order, since the fal URLs are re-uploaded every run and a logged URL is a logged untruth —
model, seed, source URL, and the cost you know
from step 5). Once every clip from this invocation is logged, rebuild the page **once** — follow
`build-site` for `campaigns/<slug>`; for a batch script (below) that means once for the
whole batch, never once per clip or segment.

## 8. Verify the downloaded clip (ffprobe / ffmpeg)

A hosted job returning "complete" is not proof of a good file: the download can truncate, the codec
can be wrong, or the render can drift from what was asked. Before you report success, **check the
actual file on disk** with the local ffmpeg tools (see the precondition in step 1).

1. **Probe the metadata.** Run `ffprobe` on the saved path and confirm the file is a real video:

   ```bash
   # Bash tool (the paid-creative agent runs here)
   ffprobe -v error -show_entries format=duration,size:stream=codec_type,codec_name,width,height,r_frame_rate,nb_frames \
     -of default=noprint_wrappers=1 "campaigns/<slug>/media/<deliverable-id>/<clip-file>.mp4"
   ```

   ```powershell
   # PowerShell (main thread)
   ffprobe -v error -show_entries format=duration,size:stream=codec_type,codec_name,width,height,r_frame_rate,nb_frames -of default=noprint_wrappers=1 "campaigns/<slug>/media/<deliverable-id>/<clip-file>.mp4"
   ```

   Check that: there is a `codec_type=video` stream; `duration` is close to what you requested (a clip
   much shorter than the requested seconds is a red flag for truncation); `width`/`height` match the
   requested resolution and aspect ratio (e.g. 720×1280 for a `720p` `9:16` reel); and `size` is
   non-trivial (a near-zero file is a failed download). If audio was requested, confirm an
   `codec_type=audio` stream is present too.

2. **Eyeball a frame.** Extract one still and Read it, so you actually look at the render rather than
   trusting its metadata:

   ```bash
   ffmpeg -y -v error -i "campaigns/<slug>/media/<deliverable-id>/<clip-file>.mp4" -frames:v 1 -q:v 3 "<scratchpad>/verify-frame.jpg"
   ```

   Read the JPG and sanity-check it: right subject, on-brand, not garbled or a black frame. For a clip
   that animates a start frame under the `image-to-video` override, the first frame should resemble it.
   Write the frame to the scratchpad, not into `media/` — it is a throwaway check, not a deliverable;
   delete it after.

   **When the prompt asked for multiple shots, one frame proves nothing.** Sample a frame near the
   midpoint of each intended shot (`-ss <seconds>` before `-i`) and confirm the cuts actually landed:
   the compositions should differ, and any hero object should match its reference in every shot.
   Multi-shot adherence is not guaranteed, so count the shots you can see and report that number
   rather than the number the script asked for.

3. **On a mismatch**, do not silently pass it off. Report what is wrong (truncated, wrong resolution,
   corrupt, off-subject) and offer to re-render. A clip that fails verification is not a finished
   deliverable.

## 9. Report back, and keep the claim posture

Follow `${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md` section 5, and report only **real returned
values** — never a placeholder or an imagined link:

- **what you made**, named as the thing it is ("the vertical clip for the launch ad");
- **one path** — the clip they would open, written out in full;
- **what it cost**: the estimate, plus the confirmed charge if the result or their fal dashboard
  exposes it. This is spoken, always;
- **what you checked, in plain terms.** Not the tool names and not the field names: "I opened the
  file and checked it — 6 seconds, 720 by 1280, sound on it, and the frames I sampled look right."
  If the local video tools were missing, say what that costs them: "I could not open the file to
  check it afterwards, so the length and size are what the model reported rather than what I
  measured — worth playing it once before you use it";
- **anything that did not go to plan**: a model you substituted, fewer shots than the script asked
  for, a length that came back short.

The model, the seed and the source URL went into the generation log in step 7. That is what makes it
safe to leave them out of the conversation — do not recite them.

The video is a generated asset, not a cleared one: brand and claim review still apply before it ships
(the brand's `pack.mandatories` and `pack.nogos`). Say that in the user's terms — it has not been
checked against their must-includes or the things they never say — rather than by field name. The
generation-log entry and site rebuild from step 7 are part of the render, not an optional extra.

**End on a next action**, per section 6 of the same spec: one offer, phrased as work. Usually that is
whether they want to watch it before you carry on, or the next clip in the set.

## House rules

- **Render, never invent.** This skill executes an existing prompt; it does not write, embellish, or
  "fix" the creative. Prompt authoring is `write-generation-prompt`.
- **References carry identity, the prompt carries composition.** Under reference-to-video there is no
  start frame to render, so never route to `generate-image` to manufacture one. Only the
  `image-to-video` override needs a real start frame, and there it needs exactly one.
- **Never re-order the references.** Pass order binds a file to its handle (step 2). On a mismatch,
  fix the prompt or stop — never shuffle, drop, or pad `image_urls` to make it line up.
- **Ask for a real product photo; never synthesise a live SKU.** If `products[].photo` is empty and
  the clip turns on a real product, ask. Asking costs one question.
- **Audio is the brand's call, not this skill's.** Obey the prompt's `AUDIO:` block. If it is silent
  on the question, ask at the cost gate. Audio-on synthesises speech, so guessing here can put words
  in a real person's mouth.
- **Always gate, and always show the prompt.** A plain sentence with the cost in it, then a literal
  receipt — the verbatim prompt, the exact model id, the real settings, the estimate and its
  arithmetic. Offer the by-hand route at equal weight, and wait for an explicit go before
  `submit_job`. Video is expensive; never spend on a hunch, and never gate on a paraphrase of the
  prompt the user is approving.
- **Never fabricate URLs or paths.** Report only what the job actually returned and what you actually
  saved. If the MCP is down or a job fails, produce no video and say so.
- **Lean by default.** One generation, `720p`, default duration,
  `bytedance/seedance-2.0/reference-to-video`, unless the user asks for more or a different model.
  Cost scales with resolution and duration. A short ad is usually one generation, not one per shot.
- **Verify the schema before running.** Always `get_model_schema` so parameter names are exact.
- **Verify the clip before reporting.** After download, `ffprobe` the file and eyeball an extracted
  frame (step 8). Never call a clip finished on the strength of a "job complete" alone. If ffmpeg is
  missing, deliver but flag the clip as unverified — do not pretend you checked.
- **One home, versioned names.** Every campaign clip → `campaigns/<slug>/media/<deliverable-id>/`
  with a grammar-compliant `-v<NN>` filename; never overwrite an existing version and never scatter
  files at the repo root. Log every render (one `generate` line) and rebuild the site.
- **Speak plainly.** Everything you say out loud follows
  `${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md`: engine words belong in the files, not in the
  conversation. The one place that never softens is the gate receipt — the prompt, the model id and
  the money stay exact.
- UK English, no em dashes in anything you author.
