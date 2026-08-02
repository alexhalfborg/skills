# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

The **source** of a Claude Code plugin marketplace — not a campaign workspace. Everything here is
authored content that gets *installed elsewhere*: `.claude-plugin/marketplace.json` is the catalogue,
and each plugin is self-contained under `plugins/<name>/`. Today there is one plugin,
`halfborg-skills` (the campaign engine).

Keep the two worlds straight when working here:

- **This repo** holds skills, commands, agents, schemas and templates. Nothing at the repo root is
  loaded by Claude Code except the catalogue, and a plugin's own `CLAUDE.md` is *not* loaded as
  project context (that is why the engine's architecture doc had to become the `campaign-engine`
  skill rather than a `CLAUDE.md`).
- **A user's workspace** holds `engine.yaml`, `brands/`, `campaigns/`. Those directories are created
  by the plugin at runtime and never exist in this repo. The installed plugin is read-only and never
  writes into itself.

Almost all "code" here is prose that an LLM executes. The only executable is
[build-site.mjs](plugins/halfborg-skills/skills/campaign/campaign-site-builder/scripts/build-site.mjs)
(415 lines, Node ≥18, zero dependencies, no `package.json` anywhere).

## Commands

```powershell
claude plugin validate ./            # validate the marketplace + plugin manifests; run before pushing
```

Test against the local checkout, never the GitHub copy:

```
/plugin marketplace add ./           # from this repo's root
/plugin install halfborg-skills@halfborg
```

`SKILL.md` edits take effect immediately. Changes to `agents/`, `.mcp.json` or `plugin.json` need
`/reload-plugins` or a restart.

Smoke-test the site builder directly against any campaign folder — it is deterministic (same inputs,
byte-identical output) and doubles as the generation-log linter, warning per malformed line:

```powershell
node plugins/halfborg-skills/skills/campaign/campaign-site-builder/scripts/build-site.mjs <campaign-path>
```

There is no test suite, no build step and no lint config. Validation is `claude plugin validate` plus
an end-to-end run of the pipeline in a scratch workspace.

[CONTRIBUTING.md](CONTRIBUTING.md) is the human-facing version of most of this file. The root
`README.md` and the plugin's `README.md` are written for **marketers with no Claude Code
experience** — keep contributor detail out of both.

## Architecture of the plugin

Read [skills/campaign/campaign-engine/SKILL.md](plugins/halfborg-skills/skills/campaign/campaign-engine/SKILL.md)
first — it is the architecture reference every other skill assumes. The short version:

Four phases, first two human-gated:
`campaign-brief` → `campaign-message` → expansion (the many expander skills) → `campaign-qa`.
The artifact chain between phases is the interface: `docs/brief.md` + `system/manifest.yaml` →
`docs/message.md` → `content/` + `media/`. Changing one of those shapes means updating the phase that
writes it *and* every phase that reads it.

### The `schema/` directory is the authority

`schema/` holds contracts that skills **reference rather than restate**; where a skill's wording
disagrees, the spec wins. When changing behaviour, change the spec first, then the skills that defer
to it:

- `plain-language.md` — what a skill says out loud. The engine's words belong in its files, not in
  the conversation; section 2 lists the strings that are never translated (the verbatim prompt, the
  model id, the money, a path they can open). Read it before touching any user-facing line.
- `preflight.md` — the shared readiness-and-routing contract (referenced 19×). Two tiers: the
  `## Campaign engine` block in the workspace's CLAUDE.md as a free context check, then the
  filesystem artifact chain. Underlying rule: *route, do not guess.*
- `campaign-structure.md` — the campaign tree, deliverable ids, the media filename grammar
  (`<id>[-<role>][-<seq>][-<ratio>]-v<NN>.<ext>`), and the `generation-log.jsonl` event schema
  (referenced 48×). Section 4.1 is the canonical append-and-rebuild snippet every producing skill
  copies.
- `brand-pack.schema.json`, `manifest.schema.json`, `engine.schema.json` — JSON Schema.

### Path resolution

Anything the plugin references internally goes through `${CLAUDE_PLUGIN_ROOT}`; workspace paths
(`brands/`, `campaigns/`, `engine.yaml`) stay relative to the user's working directory. The
placeholder is substituted inline in `SKILL.md` and agent content but **not** in files read as plain
content (e.g. `schema/*.md`), which is why those files tell the reader to use the already-resolved
absolute path. Reading these files as plain repo files shows the raw placeholder — expected.

## Conventions when editing

**Adding a skill.** Skills live at `skills/<category>/<skill-name>/SKILL.md` — a level deeper than
Claude Code's default scan — so each one must also be listed in `plugin.json`'s `skills` array. A new
area of work is a new category folder alongside `campaign/`. Ordinary new work belongs inside
`halfborg-skills`; a second *plugin* is only justified by a very different always-on context cost.

**Skill frontmatter.** `name` plus a long `description` that carries trigger phrases, what the skill
reads, and explicit `Do NOT use for…` routing to the sibling skill that owns that job. The
descriptions are the routing table — keep the negative half accurate when responsibilities move.
Agents carry `tools:`, `model: inherit`, and a `color:`.

**Invariants that constrain any edit.** These are the engine's reason for existing; do not weaken one
to make a skill simpler:

- Never hardcode a brand name, claim or asset into an engine skill — if a skill needs a brand fact it
  reads `brands/<id>/pack.yaml`. "The active brand" always means `campaign.brand` in the campaign's
  `system/manifest.yaml`, never the folder-name prefix.
- State lives in files, not the conversation, so any phase can be picked up cold.
- The two human gates and the pre-render approval gate are unconditional — no `engine.yaml` value
  relaxes them, and no expander may bypass `generate-image` / `generate-video`, the only skills that
  touch fal.
- Never fabricate a generated-media link, cost or log line. Without a fal key the render skills hand
  back the prompt/model/settings and write nothing — a supported mode, not a degraded one.
- The fal key is the plugin's `fal_key` userConfig, substituted into `.mcp.json` by the harness. No
  skill reads it; test for rendering by checking for live `mcp__fal-ai__*` tools, not for a file.
  Never instruct a user to paste a key into chat.
- Media is versioned and never overwritten; candidate / locked / final / superseded is a *status in
  the generation log*, not a folder.

**Prose style** (applies to skill content and to generated marketing copy alike): British spelling,
few em dashes, no phrasing that reads as AI-generated.

**Who is reading.** Users are marketers, not developers. Skill frontmatter `description` fields are
the routing table and are never read by a user — keep them precise and jargon-heavy if that is what
routes accurately. Everything a skill *says out loud* is the opposite, and `schema/plain-language.md`
governs it: engine vocabulary belongs in the files, plain English in the conversation, and a short
list of strings (the verbatim render prompt, the model id, the money, a path the user can open)
never softens.
