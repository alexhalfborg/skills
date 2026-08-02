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
2. The brand's pack is `brands/<brand-id>/pack.yaml`; its voice corpus is
   `brands/<brand-id>/voice-profiles.md`; its design tokens are `brands/<brand-id>/design.md`.

This is what "the active brand" means anywhere in the engine. Whenever the manifest can answer,
it does: do not ask the user, and do not read the brand off the folder name.

The one window where the manifest does not yet exist is between `/halfborg-skills:new-campaign` scaffolding the
folder and `campaign-brief` writing the manifest. In that window the brand comes from the
`/halfborg-skills:new-campaign` argument, and the folder prefix is the durable record. Once the manifest exists it
is the only source that counts; if the prefix and `campaign.brand` ever disagree, **the field
wins** and the folder should be renamed to match. The site builder warns on that mismatch.

## 2. Deliverable ids

A `media/` subfolder name **is** a deliverable id. Valid ids are:

1. **Manifest ids** — the `id` of an asset entry in `system/manifest.yaml`. The manifest id is the
   folder name and the filename stem for that deliverable's artifacts.
2. **`key-visual`** — engine-reserved. Holds `campaign-message`'s candidate directions and the locked
   master-visual anchor lineage.
3. **Pipeline sub-ids** — ids a pipeline invents when it fans out (e.g. ad ids like `AD-R1-b`, or
   `AD-T1-static` for a static execution). Sub-ids must be **registered** in the generation log by
   the pipeline step that creates them (for the ads pipeline: `ad-creative`, when concepts
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
  - `idea` — a `visual-ideas` ideation variation
  - `ref` — an identity reference still (a `reference-kit` artifact) bound as a video `@ImageN`
- **seq** — distinguishes siblings of the same role: letters for candidates (`A`, `B`, `C`),
  numbers fused to the role for clips (`clip1`, `clip2`), two-digit numbers for ideas (`idea-01`),
  and a short descriptive slug for setup frames (`setup-guilt-receipts`) and reference stills
  (`ref-serum-bottle`).
- **ratio** — `1x1`, `9x16`, `16x9`… only when a deliverable ships multiple ratios.
- **v\<NN\>** — mandatory on every media file. Two digits, starting `v01`. Increment when
  regenerating the **same logical artifact** (a re-roll, a fix, a re-lock). A different concept,
  angle, or clip is a new role/seq at `v01`, not a version bump.

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
```

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
| `generate` | an artifact was created | `file` (campaign-root-relative, forward slashes — required), `status` (`candidate` or `iteration` — required), `role`, `parent` (pipeline id, for sub-ids), `prompt` (full text, newlines as `\n`) or `prompt_ref` (path#anchor of a prompt doc), `model`, `seed`, `source_url`, `cost_usd`, `notes` |
| `register` | a pipeline sub-id now exists | `parent` (required), `title`, `format`, `channel`, `funnel_stage` |
| `status` | promotion/demotion of an existing file | `file` (required), `status` ∈ `locked` / `final` / `superseded` / `rejected` (required), `reason` |
| `note` | free-form annotation | `notes` (required), `file` optional |

Entries reconstructed after the fact (migrations) add `"backfilled": true`.

**Status model.** A file is born `candidate` (options awaiting a pick, ideation) or `iteration`
(a working generation). Promotion is a `status` event: `locked` for anchors/reference inputs the
campaign binds to, `final` for a shippable deliverable. Demotion: `superseded`, `rejected`. The
current status of a file is its most recent log event; a new `locked` event for a deliverable
implicitly supersedes the previous lock. **No `latest`/`final` file copies** — pointers in docs
(e.g. `message.md` `master_visual.locked_still`) name the exact versioned path.

Example lines:

```json
{"ts":"2026-07-08T16:26:00+08:00","event":"generate","skill":"generate-video","deliverable":"AD-R1-b","parent":"paid-funnel","role":"clip","file":"media/AD-R1-b/AD-R1-b-clip1-v01.mp4","prompt_ref":"content/AD-R1-b-scripts.md#segment-1","model":"bytedance/seedance-2.0/image-to-video","cost_usd":0.62,"status":"iteration"}
{"ts":"2026-07-09T07:00:00+08:00","event":"status","skill":"campaign-message","deliverable":"key-visual","file":"media/key-visual/key-visual-v02.png","status":"locked","reason":"re-rolled full-bleed, removed inner-border artifact"}
```

### 4.1 The log step (canonical append-and-rebuild instruction)

Every skill that produces a campaign artifact (media **or** a text deliverable in `content/`)
finishes by appending exactly one minified JSON line per artifact and rebuilding the site. Use a
quoting-proof mechanism so prompt text cannot break shell parsing.

Bash:

```bash
cat >> "campaigns/<slug>/system/generation-log.jsonl" <<'JSONL'
{"ts":"...","event":"generate","skill":"...","deliverable":"...","file":"...","status":"iteration"}
JSONL
node "${CLAUDE_PLUGIN_ROOT}/skills/campaign/campaign-site-builder/scripts/build-site.mjs" "campaigns/<slug>"
```

PowerShell:

```powershell
Add-Content -Path "campaigns/<slug>/system/generation-log.jsonl" -Value @'
{"ts":"...","event":"generate","skill":"...","deliverable":"...","file":"...","status":"iteration"}
'@
node "${CLAUDE_PLUGIN_ROOT}/skills/campaign/campaign-site-builder/scripts/build-site.mjs" "campaigns/<slug>"
```

Rules:

- Never rewrite, reorder, or delete existing lines.
- If the build script warns that the line just appended is malformed, fix only that line.
- If the log file is missing (older campaign), create it empty first; `/halfborg-skills:new-campaign` scaffolds it.
- The build script re-parses every line on every run and warns per malformed line, so it doubles as
  the log linter.

## 5. Text deliverables (`content/`)

One `.md` per deliverable:

- Asset entries: `content/<id>.md` (e.g. `content/launch-blog.md`).
- Ads pipeline docs: `content/<pipeline-id>-concepts.md`, `content/<pipeline-id>-scripts.md`,
  `content/<pipeline-id>-prompts.md`; per-ad prompt docs `content/<sub-id>-prompts.md`. A video
  ad's generation prompt is not its own doc: `video-ad-script` appends it to the scripts doc under
  `## Generation prompts`, so a `-prompts.md` holds image prompts.
- No brand-name prefixes — the campaign folder already scopes them.

Text files are **not** filename-versioned; they are edited in place and git carries their history.
Filename versioning (section 3) applies to `media/` only. Text deliverables still get a `generate`
log entry on creation (with `file` pointing at the `.md`) so they appear in the site's Content tab
and chronology.

## 6. The site

`site/index.html` is a self-contained, offline-viewable page generated **only** by:

```
node "${CLAUDE_PLUGIN_ROOT}/skills/campaign/campaign-site-builder/scripts/build-site.mjs" <campaign-path>
```

It renders the docs, content, and the media chronology from the generation log, with media
relatively linked (`../media/...`). Never hand-edit it; it is overwritten on each build and
gitignored (`campaigns/*/site/`). The rebuild is deterministic: same inputs, byte-identical output.

## 7. Legacy campaigns

Campaigns created before this spec (an `output/` + `reference/` layout, or an `ads/` layout) are
read-only history. The build script refuses them with a clear error (no `system/` folder). To bring
one forward, follow the migration recipe: move gate docs to `docs/`, text deliverables to
`content/`, media into `media/<deliverable-id>/` folders with grammar-compliant versioned names,
manifest and README to `system/`, then backfill `system/generation-log.jsonl` with
`"backfilled": true` entries dated from file history.
