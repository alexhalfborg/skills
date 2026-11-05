# Campaign workspace structure

The canonical contract for how a campaign folder is laid out, how files are named, and how every
generated artifact is logged. Engine skills reference this document instead of restating paths;
where a skill's own wording disagrees with this spec, **this spec wins**.

This document is brand-agnostic. Example ids (`AD-R1-b`, `banner-ad`) are placeholders.

**Path note.** `${CLAUDE_PLUGIN_ROOT}` below means the plugin's install directory.
Unlike a SKILL.md, this file is read as plain content, so that placeholder is **not** substituted
for you — use the resolved absolute path the skill that sent you here already had. Everything else
(`campaigns/…`, `brands/…`, `engine.yaml`) is relative to the working directory, as written.

## 1. The tree

```
campaigns/<brand>-<YYYY-MM-DD>-<slug>/
  docs/                     human-approved gate artifacts
    brief.md                phase 1 output (human-gated)
    message.md              phase 2 output (human-gated)
    qa-report.md            phase 4 output
  content/                  text deliverables (.md): blogs, emails, concepts, scripts, prompt docs
  media/                    ALL generated media; one subfolder per deliverable id
    <deliverable-id>/       every iteration side by side, never overwritten, never deleted
  system/                   machine state
    manifest.yaml           phase 1 output, validated against ${CLAUDE_PLUGIN_ROOT}/schema/manifest.schema.json
    generation-log.jsonl    append-only generation log (section 4)
    README.md               one line: brand id, campaign name, created date
  site/                     generated site (section 6); never hand-edited; gitignored
```

Extra working folders (`research/`, `reports/`, `reviews/`) are permitted alongside these five,
but must not shadow them. The site builder ignores folders it does not know.

Elsewhere in the engine the campaign folder is written `campaigns/<slug>/`. There, `<slug>` means
**the whole folder name**, not the trailing segment of the grammar above. The folder is a single
opaque handle: skills interpolate it, nothing takes it apart.

### 1.1 The brand prefix, and resolving the brand

The `<brand>` prefix is a **human affordance**: it makes `ls campaigns/` group by brand and lets a
folder announce its owner without opening a file. It is not the machine contract. Brand ids permit
hyphens, so the prefix is only separable by anchoring on the date pattern — string surgery where a
required field already exists. **Do not parse it to determine the brand** (the one exception is the
pre-manifest window below, where there is nothing else to read).

**The authoritative brand link is `campaign.brand` in `system/manifest.yaml`** (required by
`${CLAUDE_PLUGIN_ROOT}/schema/manifest.schema.json`). To resolve the brand from inside a campaign — including on
a cold start, in a fresh conversation, with nothing carried over in context:

1. Read `campaign.brand` from `<campaign>/system/manifest.yaml`. That value is the brand id.
2. The brand's pack is `brands/<brand-id>/pack.yaml`; its voice corpus is the
   `brands/<brand-id>/voice/` folder (`shared.md` plus one file per byline); its design tokens are
   `brands/<brand-id>/design.md`.

This is what "the active brand" means anywhere in the engine. Whenever the manifest can answer,
it does: do not ask the user, and do not read the brand off the folder name.

The one window where the manifest does not yet exist is between `/halfborg-campaign:new-campaign` scaffolding the
folder and `write-brief` writing the manifest. In that window the brand comes from the
`/halfborg-campaign:new-campaign` argument, and the folder prefix is the durable record. Once the manifest exists it
is the only source that counts; if the prefix and `campaign.brand` ever disagree, **the field
wins** and the folder should be renamed to match. The site builder warns on that mismatch.

## 2. Deliverable ids

A `media/` subfolder name **is** a deliverable id. Valid ids are:

1. **Manifest ids** — the `id` of an asset entry in `system/manifest.yaml`. The manifest id is the
   folder name and the filename stem for that deliverable's artifacts.
2. **`key-visual`** — engine-reserved. Holds `write-message`'s candidate directions and the locked
   master-visual anchor lineage.
3. **Pipeline sub-ids** — ids a pipeline invents when it fans out (e.g. ad ids like `AD-R1-b`, or
   `AD-T1-static` for a static execution). Sub-ids must be **registered** in the generation log by
   the pipeline step that creates them (for the ads pipeline: `write-ad-creative`, when concepts
   lock) via one `register` event per sub-id carrying `parent` = the manifest pipeline id. Every
   later log entry's `deliverable` must be a manifest id, `key-visual`, or a registered sub-id —
   no unregistered ("ghost") ids.

The manifest itself never enumerates a pipeline's sub-assets; the pipeline owns its fan-out and the
log's `register` events are the sub-id registry.

## 3. Filename grammar (media)

```
<deliverable-id>[-<role>][-<seq>][-<ratio>]-v<NN>.<ext>
```

- **deliverable-id** — the registered id, case preserved exactly; always equals the containing
  folder name.
- **role** — lowercase token, omitted for the deliverable's primary artifact. Open set; initial
  tokens:
  - `candidate` — direction options awaiting a human pick
  - `setup` — a start frame rendered only to animate
  - `clip` — one video segment of a multi-clip deliverable
  - `idea` — a `explore-visual-ideas` ideation variation
  - `ref` — an identity reference still (a `prepare-reference-kit` artifact) bound as a `#ImageN` reference
    and recorded in the consuming render's `refs` (section 4)
  - `aroll` — recorded footage a person supplied (a talking-head take), copied in by
    `edit-talking-head`. The `-v<NN>` counts takes: a re-record is `v02`
  - `broll` — a cutaway laid over the A-roll: stock footage fetched by `edit-talking-head`, a stock
    still (`.jpg`) it fetched to animate with a slow zoom when no clip fitted, or a clip
    `generate-video` rendered for that beat
  - `edit` — the edit project folder `edit-talking-head` works in (section 3.1). A folder, not a
    media file
  - `slide` — one picture of a carousel social post, in posting order. A single-image post has no
    role token: its one picture is the deliverable's primary artifact
- **seq** — distinguishes siblings of the same role: letters for candidates (`A`, `B`, `C`),
  numbers fused to the role for clips, cutaways and slides (`clip1`, `clip2`, `broll3`, `slide2`), two-digit numbers
  for ideas (`idea-01`), and a short descriptive slug for setup frames (`setup-guilt-receipts`) and
  reference stills (`ref-serum-bottle`).
- **ratio** — `1x1`, `4x5`, `9x16`, `16x9`… only when a deliverable ships multiple ratios.
- **v\<NN\>** — mandatory on every media file. Two digits, starting `v01`. Increment when
  regenerating the **same logical artifact** (a re-roll, a fix, a re-lock). A different concept,
  angle, or clip is a new role/seq at `v01`, not a version bump.
- **ext** — the file's real format. A **format derivative** of an existing file (a JPEG made from a
  PNG render, because a platform accepts only JPEG) keeps the source's stem and version and changes
  only the extension: `post-v02.png` → `post-v02.jpg`. It is a new file, never a replacement, and is
  logged with `"source":"derived"` (section 4). A changed picture is a new version of the render,
  never a re-made derivative.

**Never overwrite, never delete.** A new generation is always a new file; supersession is recorded
in the log (section 4), not by removing files. This is what lets a marketing manager and art
director scroll a deliverable's whole history in one folder.

Worked examples:

```
media/key-visual/key-visual-candidate-B-v01.png
media/key-visual/key-visual-v02.png
media/AD-T1-static/AD-T1-static-v01.png
media/AD-T1-static/AD-T1-static-9x16-v01.png
media/AD-R1-b/AD-R1-b-setup-guilt-receipts-v01.png
media/AD-R1-b/AD-R1-b-ref-serum-bottle-v01.png
media/AD-R1-b/AD-R1-b-clip2-v01.mp4
media/banner-ad/banner-ad-idea-03-v01.png
media/short-03/short-03-aroll-v01.mp4
media/short-03/short-03-broll2-v01.mp4
media/short-03/short-03-broll4-v01.jpg
media/short-03/short-03-v02.mp4
media/ig-launch/ig-launch-slide1-v01.png
media/ig-launch/ig-launch-slide1-v01.jpg
media/ig-launch/ig-launch-slide2-v02.png
```

### 3.1 The edit project folder

`edit-talking-head` assembles a short in a HyperFrames project folder beside the footage it cuts:
`media/<id>/<id>-edit/`. The folder is a working space, not a media file, so the grammar above
governs only the versioned files inside it that record an edit:

```
media/short-03/short-03-edit/
  short-03-edit-v01.html          the edit: which parts of the take are kept, where each cutaway sits,
                                  the opening title, the zoom cuts and where each overlay sits
  short-03-edit-v02.html          a re-edit is a new file, never a rewrite of v01
  compositions/
    short-03-captions-v01.html    the captions for edit v01
    short-03-graphic3-v01.html    the graphic card at beat 3 of edit v01
    short-03-overlay5-v01.html    the overlay (a highlight or chapter label on the face) numbered 5
                                  in edit v01
  transcript-aroll-v01.json       word timings for take v01
  options/                        option thumbnails shown on the campaign page while picking cutaways
```

The rest of the folder (`hyperframes.json`, `package.json`, `compositions/components/`) is
HyperFrames' own scaffolding. An edit file reaches the footage as `../<id>-aroll-v01.mp4`, so the
take and the cutaways stay where every other media file lives and are never copied. The rendered
short is not in the folder: it is `media/<id>/<id>-v<NN>.mp4`, and its version matches the edit file
that produced it.

## 4. The generation log

`system/generation-log.jsonl` — append-only, one minified JSON object per line. JSONL, not YAML:
an append is one self-contained line with no indentation to get wrong, a malformed line is
skippable rather than poisoning the file, and prompt text full of `:`/`"`/`#` is safely escaped
inside a JSON string.

Common required fields on every entry: `ts` (ISO 8601 with offset), `event`, `skill`,
`deliverable`.

Every field name and status value below is **file vocabulary**. Write them exactly; never say them
out loud. Logging `model`, `seed`, `cost_usd` and `source_url` is precisely what makes it safe to
leave them out of the conversation — see `${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md` sections 1
and 5.

| event | meaning | additional fields |
|---|---|---|
| `generate` | an artifact was created | `file` (campaign-root-relative, forward slashes — required), `status` (`candidate` or `iteration` — required), `role`, `parent` (pipeline id, for sub-ids), `prompt` (full text, newlines as `\n`) or `prompt_ref` (path#anchor of a prompt doc), `refs` (the reference images this render bound to — see below), `model`, `seed`, `source_url`, `cost_usd`, `source`, `credit`, `notes` |
| `register` | a pipeline sub-id now exists | `parent` (required), `title`, `format`, `channel`, `funnel_stage` |
| `status` | promotion/demotion of an existing file | `file` (required), `status` ∈ `locked` / `final` / `superseded` / `rejected` (required), `reason` |
| `publish` | a post went live on a platform | `platform` (`instagram`, `threads` — required), `account` (the handle it went out on, as the platform returned it — required), `files` (the posted pictures, in posting order, `[]` for a text-only post — required), `post_id` and `permalink` (exactly as the platform returned them — required), `caption_ref` (the `content/<id>.md` the caption came from — required), `ai_label` (whether the AI-info label was applied), `notes` |
| `note` | free-form annotation | `notes` (required), `file` optional |

Entries reconstructed after the fact (migrations) add `"backfilled": true`.

**`refs` — what a render bound to.** An ordered array of strings, one per reference image passed to
the model. **The array index is the handle number:** `refs[0]` is the `#Image1` the prompt cites,
`refs[1]` is `#Image2`, and so on. That one rule records the whole binding, so there is no separate
handle field.

- **Paths, not URLs.** A fal-hosted URL is ephemeral and is re-uploaded every run, so logging one
  logs something that will not be true tomorrow. Record the file.
- Campaign-root-relative with forward slashes, the same convention as `file` — **except** for a
  reference that lives outside the campaign, which is written as given. A real product photograph
  under `brands/<id>/` is a legitimate reference and often the one most worth recording; a
  campaign-relative-only rule would silently drop it.
- **Optional, and absent means _unknown_, not _none_.** Every entry written before this field
  existed lacks it. Nothing needs backfilling for its own sake.
- Not yet surfaced on the campaign page — `build-site` ignores it for now.

A render that cites `#Image2` in its prompt and has no `refs` is a render nobody can reproduce, which
is the whole reason the field exists.

**`source` and `credit` — media nobody generated.** Not every file in `media/` came out of a model.
A take the user recorded and a stock clip fetched from a library are logged with a `generate` event
like anything else, so they appear on the campaign page and QA can trace them, but with no `model`
and no `prompt`:

- `source` names where the file came from: `user` for footage a person supplied, the stock
  library it came from, `pexels` or `pixabay`, or `derived` for a format derivative (section 3)
  made from another file in the campaign, which is named in `refs[0]`. Absent means generated, which
  is every entry written before this field existed. A `derived` entry has no `credit`, and
  `cost_usd` is `0`.
- `credit` is the creator's name exactly as the library gave it, followed by the library
  (`"Jane Doe on Pexels"`, `"Sam Lee on Pixabay"`). Required whenever `source` is a stock library.
  Neither library demands attribution, but Pexels' API terms ask for credit where possible, and a
  stock clip with no recorded creator is one nobody can credit later.
- `source_url` is the library's page for the clip, not the file link, so a person can open it and
  check the licence. `cost_usd` is `0`.

**Status model.** A file is born `candidate` (options awaiting a pick, ideation) or `iteration`
(a working generation). Promotion is a `status` event: `locked` for anchors/reference inputs the
campaign binds to, `final` for a shippable deliverable. Demotion: `superseded`, `rejected`. The
current status of a file is its most recent log event; a new `locked` event for a deliverable
implicitly supersedes the previous lock. **No `latest`/`final` file copies** — pointers in docs
(e.g. `message.md` `master_visual.locked_still`) name the exact versioned path.

**A published post.** Publishing is recorded twice, because it is two facts: one `publish` event for
the post (where it went and the link to it), then one `status` → `final` line per posted file, so the
file's own status says it shipped. `post_id` and `permalink` are what the platform returned, never
composed from a pattern; a post whose link did not come back is logged with the `post_id` alone and
says so in `notes`. A post taken down afterwards is not un-logged: each of its files gets a `status`
→ `superseded` line whose `reason` says it was removed from the platform and by whom.

Example lines:

```json
{"ts":"2026-07-08T16:26:00+08:00","event":"generate","skill":"generate-video","deliverable":"AD-R1-b","parent":"paid-funnel","role":"clip","file":"media/AD-R1-b/AD-R1-b-clip1-v01.mp4","prompt_ref":"content/AD-R1-b-scripts.md#segment-1","refs":["media/key-visual/key-visual-v02.png","brands/lumen/assets/serum-bottle.jpg"],"model":"bytedance/seedance-2.0/image-to-video","cost_usd":0.62,"status":"iteration"}
{"ts":"2026-07-09T07:00:00+08:00","event":"status","skill":"write-message","deliverable":"key-visual","file":"media/key-visual/key-visual-v02.png","status":"locked","reason":"re-rolled full-bleed, removed inner-border artifact"}
{"ts":"2026-11-04T10:12:00+08:00","event":"generate","skill":"edit-talking-head","deliverable":"short-03","role":"broll","file":"media/short-03/short-03-broll2-v01.mp4","source":"pexels","source_url":"https://www.pexels.com/video/1234567/","credit":"Jane Doe on Pexels","cost_usd":0,"status":"iteration","notes":"beat 2, over \"the dashboard you check every morning\""}
{"ts":"2026-11-12T09:40:00+08:00","event":"generate","skill":"write-instagram-post","deliverable":"ig-launch","role":"slide","file":"media/ig-launch/ig-launch-slide1-v01.jpg","source":"derived","refs":["media/ig-launch/ig-launch-slide1-v01.png"],"cost_usd":0,"status":"iteration","notes":"publish-ready JPEG, 1080x1350"}
{"ts":"2026-11-12T10:05:00+08:00","event":"publish","skill":"publish-social","deliverable":"ig-launch","platform":"instagram","account":"acmeskin","files":["media/ig-launch/ig-launch-slide1-v01.jpg","media/ig-launch/ig-launch-slide2-v02.jpg"],"post_id":"17890000000000000","permalink":"https://www.instagram.com/p/AbC123xYz/","caption_ref":"content/ig-launch.md","ai_label":true}
{"ts":"2026-11-12T10:05:01+08:00","event":"status","skill":"publish-social","deliverable":"ig-launch","file":"media/ig-launch/ig-launch-slide1-v01.jpg","status":"final","reason":"published to Instagram"}
```

**Skill names in old logs.** `skill` records the producing skill's name verbatim, and those names
changed in 0.3.0 (`campaign-brief` became `write-brief`, `campaign-message` became `write-message`,
and so on). A campaign started before that upgrade therefore carries both vocabularies in one file.
That is expected and correct: the log is append-only history and is never rewritten. Nothing reads
`skill` as a key — it is provenance, rendered as a label on the campaign page — so a mixed log needs
no migration and no special handling.

### 4.1 The log step (canonical append-and-rebuild instruction)

Every skill that produces a campaign artifact (media **or** a text deliverable in `content/`) logs
one minified JSON line per artifact as it is produced, using a quoting-proof mechanism so prompt
text cannot break shell parsing. Once every artifact from this invocation is logged, rebuild the
page **once** — never once per artifact.

Bash:

```bash
cat >> "campaigns/<slug>/system/generation-log.jsonl" <<'JSONL'
{"ts":"...","event":"generate","skill":"...","deliverable":"...","file":"...","status":"iteration"}
JSONL
```

PowerShell:

```powershell
Add-Content -Path "campaigns/<slug>/system/generation-log.jsonl" -Value @'
{"ts":"...","event":"generate","skill":"...","deliverable":"...","file":"...","status":"iteration"}
'@
```

Then, once — after this invocation's last artifact is logged, not after each one — rebuild the
page: follow the `build-site` skill's instructions for `campaigns/<slug>`. It reads the
updated log, manifest, docs, content and media and writes `site/index.html` itself; there is no
script to run.

Rules:

- Never rewrite, reorder, or delete existing lines.
- If a batch partially fails, still rebuild once at the end with whatever succeeded logged.
- If the log file is missing (older campaign), create it empty first; `/halfborg-campaign:new-campaign` scaffolds it.
- Re-reading the log on every rebuild is itself the log linter: a malformed line is skipped and
  reported as a warning, exactly as before, just by the skill reading it rather than a script.

## 5. Text deliverables (`content/`)

One `.md` per deliverable:

- Asset entries: `content/<id>.md` (e.g. `content/launch-blog.md`).
- Ads pipeline docs: `content/<pipeline-id>-concepts.md`, `content/<pipeline-id>-scripts.md`,
  `content/<pipeline-id>-prompts.md`; per-ad prompt docs `content/<sub-id>-prompts.md`. A video
  ad's generation prompt is not its own doc: `write-video-ad-script` appends it to the scripts doc under
  `## Generation prompts`, so a `-prompts.md` holds image prompts.
- Hook options: `content/<id>-hooks.md`, written by a direct `write-hook` run on deliverable `<id>`
  and logged against that same id. Not a deliverable of its own, so it never needs a manifest entry.
  Re-runs add a round below the last rather than replacing it.
- Cut and cutaway plan: `content/<id>-broll-plan.md`, written by `edit-talking-head` at its
  approval stop and logged against `<id>`. A re-edit adds a round below the last.
- Social posts: `content/<id>.md` like any asset entry, but with YAML frontmatter that
  `publish-social` reads without the conversation that wrote it (the platform, the format, the
  pictures in posting order with their alt text) and the caption in a fenced block under
  `## Caption`, exactly as it will be posted. The fence is load-bearing: a caption line opening on a
  hashtag would otherwise render as a heading. The shape is owned by `write-instagram-post` (and its
  `write-threads-post`, and later siblings for other platforms); the limits it is drafted to are
  `${CLAUDE_PLUGIN_ROOT}/schema/social-platforms.md`.
- No brand-name prefixes — the campaign folder already scopes them.

Text files are **not** filename-versioned; they are edited in place and git carries their history.
Filename versioning (section 3) applies to `media/` only. Text deliverables still get a `generate`
log entry on creation (with `file` pointing at the `.md`) so they appear in the site's Content
section and chronology.

## 6. The site

`site/index.html` is a self-contained, offline-viewable page written **only** by the
`build-site` skill, following `${CLAUDE_PLUGIN_ROOT}/skills/build-site/SKILL.md`.
It renders the docs, content, and the media chronology from the generation log, with media
relatively linked (`../media/...`). Never hand-edit it; it is overwritten on each rebuild and
gitignored (`campaigns/*/site/`). The rebuild is authored by Claude, not run by a deterministic
script — the exact wording can vary between runs, but it must never contain anything not actually
present in the campaign's own files.

## 7. Legacy campaigns

Campaigns created before this spec (an `output/` + `reference/` layout, or an `ads/` layout) are
read-only history. `build-site` will not attempt to build a page for one (no `system/`
folder to read). To bring one forward, follow the migration recipe: move gate docs to `docs/`, text
deliverables to `content/`, media into `media/<deliverable-id>/` folders with grammar-compliant
versioned names, manifest and README to `system/`, then backfill `system/generation-log.jsonl` with
`"backfilled": true` entries dated from file history.
