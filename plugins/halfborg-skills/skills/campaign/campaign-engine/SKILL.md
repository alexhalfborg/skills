---
name: campaign-engine
description: The campaign engine's architecture, contracts and invariants — the reference every other engine skill assumes. Read this when you need to know how the pipeline fits together rather than to execute one phase of it: what the four phases are and which are human-gated, where brand facts versus campaign work live, what the artifact chain between phases is, how deliverables are named and logged, and which rules are non-negotiable (never render without approval, never hardcode a brand fact into a skill, never fabricate a generated-media link). Use it when the user asks how the engine works, how the pieces connect, why a phase is structured a certain way, where something belongs, what a contract requires, or when you are extending or debugging the engine itself. Also use it to orient at the start of campaign work in an unfamiliar workspace. Do NOT use it to run a phase — campaign-brief, campaign-message, the expander skills and campaign-qa each own their own procedure.
---

# Campaign engine

A brand-agnostic marketing campaign engine. It turns a fuzzy goal into a full set of campaign
deliverables through a fixed pipeline of skills, reading everything brand-specific from a per-brand
pack. Nothing in the engine names a specific brand; swap the pack, get a different brand, same
pipeline.

## The one principle that governs everything

**Engine vs brand pack.** The pipeline (commands, skills, schemas) is reusable IP and stays free of
any one brand's facts. All brand-specific content lives in `brands/<id>/` and all campaign work
lives in `campaigns/<slug>/`, in the user's working directory. The engine itself ships as a plugin
and is read-only. So never hardcode a brand name, claim, or asset into an engine skill. If a skill
needs a brand fact, it reads the pack.

**State lives in files, not the conversation.** Each phase writes a durable artifact the next phase
reads. A campaign can be picked up in a fresh conversation because the workspace holds the state. Do
not rely on chat history to carry context between phases.

## The pipeline

Four phases. The first two are human-gated: a person approves before the phase writes its artifact.
Do not automate past a gate, and do not collapse gates. Expansion is where work fans out; QA guards
the seams.

1. **Brief** (`campaign-brief`, human-gated) reads the pack, runs the intake interview to elicit and
   pressure-test the campaign decisions, and writes `docs/brief.md` (the strategy the whole campaign
   hangs off) plus `system/manifest.yaml` (the deliverable list).
2. **Message** (`campaign-message`, human-gated) reads the pack and brief, and writes
   `docs/message.md`: the key message, chosen tagline, and master visual concept. It also renders
   2-3 candidate directions, locks the chosen one as a **text-free key visual** in
   `media/key-visual/`, and records a paste-able render prompt in `message.md`. The coupling point
   every image and video deliverable depends on is that rendered, locked still plus one
   `master_visual` spec, so downstream anti-drift binds to a real image, not only prose. The anchor
   carries the subject and look but **no headline, logo, or baked text** — typography is a
   downstream lockup layer (`compose-lockup` for statics, burned-in captions for video), so the
   clean key visual can be re-laid per ratio and animated without warping type. Multiplicity exists
   only at the pick; message commits to exactly one concept and one still.
3. **Expansion** reads the pack, brief, and message, and turns each manifest entry into
   deliverables: text into `content/`, generated media into `media/<deliverable-id>/`. Two shapes
   (see below).
4. **QA** (`campaign-qa`) checks every artifact against `message.md` and the pack for drift and
   compliance — including generated visuals against `design.md` tokens and the locked master visual
   — reconciles the inline claim/policy flags, and writes `docs/qa-report.md` with a per-artifact
   PASS/WARN/FAIL and a proposed fix per finding. It runs full-campaign or scoped to one
   deliverable, and no expander invokes it: producers feed it, QA reads.

Every skill that produces a campaign artifact appends one line to the campaign's append-only
generation log (`system/generation-log.jsonl`) and then, once per invocation, rebuilds the campaign
page itself, per the `campaign-site-builder` skill, so `site/index.html` — the whole campaign as one
scrolling page, chronology included — stays current.

## How to operate

- **Before anything else, run the preflight.** `${CLAUDE_PLUGIN_ROOT}/schema/preflight.md` is the
  shared contract for deciding whether this workspace and this campaign are ready, and where to
  route when they are not. Every engine skill defers to it rather than restating the checks.
- Asked to start, plan, or scope a campaign: run `/halfborg-skills:new-campaign <brand-id> [name]`.
  It validates the pack, scaffolds the workspace, and hands to the brief.
- If the brand is not set up (no `brands/<id>/pack.yaml`): run `/halfborg-skills:setup-brand` first.
  It captures the brand by conversation and writes a valid pack — plus, when the brand wants a look
  and a founder voice, its `design.md` and `voice-profiles.md`; the user never edits YAML.
- If the workspace itself is fresh (no `engine.yaml` and no `## Campaign engine` block in
  `CLAUDE.md`, or the user asks about setup, API keys, or why images will not render): run
  `/halfborg-skills:setup-engine`. It reports what is wired, scaffolds the workspace, writes the
  engine defaults and the project instructions block, and points at the fal key setting. It is
  optional and gates nothing — never make it a prerequisite for anything.
- Move one phase at a time and respect the gates. After each gated phase, get sign-off, write the
  artifact, and offer the next phase rather than running ahead.

## Expansion: two entry shapes

The manifest distinguishes these, and picking the right one matters.

- **Asset entries** (`kind: asset`): one entry, one artifact, one expander. Used for standalone
  deliverables via the voice skills `personal-post` / `customer-story` (blog copy) and
  `email-newsletter` (emails and newsletters), plus `landing-page` (a self-contained HTML page,
  written into `media/<id>/`), `visual-ideas` (rough visual idea variations for a deliverable), and
  `compose-lockup` (production typographic lockup: headline set onto the clean key visual for a
  static/banner/poster). Written deliverables name the concrete voice skill in the manifest `skill:`
  field; `content-writer` is the agent that routes such a request to the right voice skill.
- **Pipeline entries** (`kind: pipeline`): one entry a multi-step pipeline fans out into many
  artifacts. Paid-social ads is the case: `pipeline: ads` runs `ad-creative` (campaign mode), then
  `video-ad-script`, then `reference-kit` for any identity-reference gaps, then `generate-video`. It
  owns the Reach / Trust / Sell fan-out. `campaign-brief` must not enumerate individual ads; the
  pipeline decides the concrete assets.

## Layout: the plugin versus the workspace

The engine ships as a plugin, installed read-only into a cache directory. Everything the user owns
lives in their working directory. Keep the two straight: never write into the plugin, never expect
brand or campaign files inside it.

**The plugin** (`${CLAUDE_PLUGIN_ROOT}/`, read-only):

```
commands/                     setup-engine, setup-brand, new-campaign
skills/                       every engine skill, including this one
schema/                       the contracts (below), plus preflight.md
templates/                    seeds copied into a workspace: engine.yaml, claude-md-block.md, design.md
.mcp.json                     the fal-ai server, authenticated with the plugin's fal_key setting
```

**The workspace** (the working directory, user-owned):

```
CLAUDE.md                     holds the `## Campaign engine` block written by /halfborg-skills:setup-engine
engine.yaml                   engine-level defaults (model ids, cost). Committed; NEVER secrets.
brands/<id>/
  pack.yaml                   ALL brand facts, including the `ads` block (validated)
  design.md                   design tokens (typeface, colour hex); written by /halfborg-skills:setup-brand
  voice-profiles.md           voice corpus (persona, opener banks); written by /halfborg-skills:setup-brand
  assets/                     the brand's own real files: logo.svg (embedded by landing-page only),
                              product photographs referenced by products[].photo. Not versioned.
campaigns/<brand>-<YYYY-MM-DD>-<slug>/
  docs/                       approved gate artifacts: brief.md, message.md, qa-report.md
  content/                    text deliverables (.md): blogs, concepts, scripts, prompt docs
  media/<deliverable-id>/     ALL generated media, iterations side by side, versioned, never overwritten
  system/                     manifest.yaml, generation-log.jsonl (append-only), README.md
  site/                       generated index.html (gitignored; rebuilt by campaign-site-builder)
```

**One home per deliverable, status in the log.** Every generated media file lives in
`media/<deliverable-id>/` under a versioned name (`<id>[-<role>][-<seq>][-<ratio>]-v<NN>.<ext>`),
so a deliverable's whole iteration history sits in one folder. Whether a file is a candidate, a
working iteration, the locked anchor, or the shipped final is a **status in the generation log**,
not a folder location; re-renders take the next `v<NN>` and never overwrite. Text deliverables live
in `content/`, edited in place (git carries their history). The full contract — tree, deliverable-id
registration, filename grammar, log schema, and the log step every render skill follows — is
`${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md`; skills reference it rather than restating paths.

## Contracts

Validate against the schema, silently fix failures, and never show a user a validation error.

- `engine.yaml` (workspace root) against `${CLAUDE_PLUGIN_ROOT}/schema/engine.schema.json`. Only
  `engine` is required; a file with just `engine: {version: 1}` is valid. Like the pack, it is a
  dial, not a gate: a missing or invalid file is not an error, because every value it holds has a
  literal fallback in the skill that reads it (precedence: invocation argument -> `engine.yaml` ->
  skill default). It is committed and holds **no secrets** — the fal key is a plugin setting.
- `brands/<id>/pack.yaml` against `${CLAUDE_PLUGIN_ROOT}/schema/brand-pack.schema.json`. Only the
  brand skeleton (id, name, positioning) is required; everything else is optional. A thin pack is
  valid: the more it holds, the fewer questions the brief phase asks. Pack richness is a dial, not a
  gate. The one exception is the optional `ads` block: if it is present at all, `ads.presenter` is
  **required**, because the ads pipeline reads the block's presence as proof that a human decided
  who may appear in an ad. Richness is a dial; that guardrail is a gate.
- `campaigns/<slug>/system/manifest.yaml` against
  `${CLAUDE_PLUGIN_ROOT}/schema/manifest.schema.json`.
- Campaign paths, filenames, and the generation log against
  `${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md` (prose contract, not JSON Schema; the build
  script lints the log on every run).
- Phase readiness and routing against `${CLAUDE_PLUGIN_ROOT}/schema/preflight.md`.
- Everything said to the user against `${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md`. The engine's
  words are for its files; the person reading them is a marketer. The contract carries the
  translation table, the sentence-and-receipt shape every gate uses, and the list of strings that are
  never softened — the verbatim prompt, the model id, the money, a path they can open.
- `message.md` and `voice-profiles.md` are structured but not schema-validated. They are the
  least-guarded seam; `campaign-qa` is where pack-to-profile and message-to-asset consistency
  should be checked.

**Why ads facts live in the pack but voice does not.** An ads profile holds brand facts: who fronts
an ad, which products are impulse buys, which moments and framings a hook can draw on. Facts belong
in the validated pack, where a schema can guard them. `voice-profiles.md` holds something different:
a writing corpus (persona, opener banks of the founder's real sentences, sample-post pointers). That
is prose evidence, not brand data, so it keeps its own markdown file. Both delta files —
`voice-profiles.md` and `design.md` — are authored by `/halfborg-skills:setup-brand`: the quick
interview writes what it can from the conversation, and the optional site-read enrichment tier fills
the corpus-only parts (the real opener lines, sentence tells, and sample-post pointers) that only a
brand's published writing can supply. If a would-be delta file's content turns out to be facts the
pack could hold, it belongs in the pack.

The artifact chain is the interface between phases: `docs/brief.md` + `system/manifest.yaml` ->
`docs/message.md` -> `content/` + `media/`. Treat these shapes as fixed; changing one means updating
the phase that writes it and the phases that read it.

## Invariants

- The pack is the source of truth for brand facts. Read, do not ask: anything the pack answers is
  not a question for the user.
- **"The active brand" means `campaign.brand` in the campaign's `system/manifest.yaml`.** That field
  is the authoritative brand link and resolves the pack to `brands/<brand-id>/pack.yaml`. Read it
  rather than asking the user or relying on context carried from `/halfborg-skills:new-campaign`, so
  a cold-started skill can find its pack in a fresh conversation. The `<brand>` prefix on the
  campaign folder is a human affordance for browsing, never parsed; if prefix and field disagree,
  the field wins. See `${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md` section 1.1.
- `mandatories` absent means unconfirmed, not none. Always confirm compliance rather than assuming
  a brand has no rules. Regulated categories (health, beauty, finance, food) usually carry claim
  restrictions and a human approval step before publishing; ask rather than assume.
- Recurring subjects (people, characters) inherit from `message.md` `master_visual.subjects`, and
  `campaign-message` renders and locks the canonical still they bind to (`master_visual.locked_still`,
  an **exact versioned path** such as `media/key-visual/key-visual-v02.png`; a re-lock renders the
  next version and updates the pointer, never overwrites). That locked still is a **text-free key
  visual**: the headline is not baked in, so the anchor animates and re-lays cleanly. Expanders bind
  to that image and definition rather than reinventing the subject per asset, so a character matches
  across a reel, a static, and everything else, and add the headline themselves — `compose-lockup`
  for statics, edit-burned captions for video. For video, the identity references the model binds to
  are prepared by `reference-kit` off that same locked still (reuse-first; it generates only
  ad-scoped props/settings, never a recurring subject the master visual never locked — that is
  re-locked in `campaign-message`).
- Brand design tokens (typeface, colour hex) live in `brands/<id>/design.md`, written by
  `/halfborg-skills:setup-brand`, not baked into the anchor or hardcoded in an engine skill.
  `compose-lockup` and `visual-ideas` read the typeface name and hexes from there; `landing-page`
  reads the whole file.
- Voice is a reference, not a redraft. `pack.voice.skills` names the voice skill(s) expanders
  invoke; the pack does not restate the voice.
- **The fal key is a plugin setting, never a file in the workspace.** It is declared as the plugin's
  `fal_key` user config, stored in secure storage, and substituted into the plugin's `.mcp.json`
  `Authorization` header by the harness — so no skill ever reads it and no skill ever needs the
  value. To test whether rendering is available, check for live `mcp__fal-ai__*` tools, not for a
  file. Secrets never go in `engine.yaml`, a brand pack, a campaign, or the conversation. Never ask
  the user to paste a key into chat; point them at `/plugin` → **Installed** → **halfborg-skills**,
  where Claude Code asks for it, or at
  `/halfborg-skills:setup-engine`. (A workspace running the engine unpackaged may instead set a
  `FAL_KEY` env var in the gitignored `.claude/settings.local.json`; that file must never be read.)
- No key is a supported way to run this workspace, not a degraded one. `generate-image` and
  `generate-video` render when the fal MCP is live and otherwise hand back the prompt, model id, and
  settings to run by hand at fal.ai — writing no file, no log line, and no invented URL or cost.
  This is the same "never fabricate a generated-image link" rule seen from the offline side.
- **Never render without human approval.** Every fal call — image and video alike — stops first, in
  two parts: a plain sentence saying what is about to be made and what it costs, then a literal
  receipt carrying the **verbatim prompt**, the exact model id, the resolved settings and the
  estimate. The sentence is what they decide on; the receipt is what they are agreeing to, and it
  never shrinks to read better. It then offers two routes: the engine renders it, or the user renders
  it by hand at fal.ai. This gate lives
  in `generate-image` (step 4) and `generate-video` (step 5), which are the only skills that touch
  fal, so every caller inherits it and no expander may bypass it. It is unconditional: no
  `engine.yaml` value relaxes it, and an earlier "make the visuals" is not standing approval for a
  specific render. A caller with a bounded reroll loop (`compose-lockup`, `reference-kit`) gates once
  by declaring the reroll cap and worst-case spend up front; work inside that envelope does not
  re-ask, anything beyond it does. The by-hand route is the offline hand-back block, so the two paths
  produce the same artifact — offline it is the only option, online it is the user's choice.

## Content house rules

British spelling. Reduce em dashes. Avoid clichéd phrasing that reads as AI-generated. Keep
first-person brand-voice copy in the brand voice and product-fact copy plain. Honour every mandatory
and no-go in the pack.

The same discipline applies to what a skill *says*, not only what it writes: engine vocabulary is for
the files, and the conversation gets plain English. `${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md`
is the contract, and every skill defers to it.

## Local tooling and external skills

See `references/integrations.md` beside this file for what ffmpeg and the fal MCP each unlock, and
exactly how the engine behaves when either is absent. The short version: both are optional and
neither blocks a phase.

Generation prompts are written by `ai-image-video-prompt-builder`, bundled here (one skill, an image
track for Nano Banana and a video track for Veo / Gemini Omni etc.). Image prompts call it directly;
video prompts reach it through `video-ad-script`, which feeds it the script's shot grammar and appends
the result to the script doc. Brand packs reference the generic `personal-post` and `customer-story`
skills by name (`pack.voice.skills`), also bundled; each reads its brand's writing corpus from
`brands/<id>/voice-profiles.md`. The remaining externals are the generic `marketing:*` skills and
`xlsx`, which resolve only on claude.ai and degrade gracefully when absent (the agent does the task
directly).
