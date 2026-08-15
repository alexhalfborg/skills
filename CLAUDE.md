# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

The **source** of a Claude Code plugin marketplace — not a campaign workspace. Everything here is
authored content that gets *installed elsewhere*: `.claude-plugin/marketplace.json` is the catalogue,
and each plugin is self-contained under `plugins/<name>/`. Today there is one plugin,
`halfborg-campaign` (the campaign engine).

Keep the two worlds straight when working here:

- **This repo** holds skills, commands, agents, schemas and templates. Nothing at the repo root is
  loaded by Claude Code except the catalogue, and a plugin's own `CLAUDE.md` is *not* loaded as
  project context (that is why the engine's architecture doc had to become the `architecture`
  skill rather than a `CLAUDE.md`).
- **A user's workspace** holds `engine.yaml`, `brands/`, `campaigns/`. Those directories are created
  by the plugin at runtime and never exist in this repo. The installed plugin is read-only and never
  writes into itself.

There is no executable code anywhere in this repo — no script, no Node dependency, no
`package.json`. All "code" here is prose that an LLM executes, including the campaign page itself:
`build-site` reads a campaign's own files and writes `site/index.html` directly, rather
than running a build script.

## Commands

```powershell
claude plugin validate ./                          # catalogue, plugin manifest, renames map
claude plugin validate ./plugins/halfborg-campaign # + skill frontmatter, agents, commands
```

Run both before pushing. The second is the one that catches a `SKILL.md` whose frontmatter fails to
parse — which loads with empty metadata rather than erroring, so the skill goes quietly unroutable.

### The dev loop

Authoring happens in this repo; the engine runs somewhere else. Keep a scratch campaign workspace in
a folder outside this repo, and **never run the engine in here** — no `setup-engine`, no
`new-campaign`. It would scaffold `engine.yaml`, `brands/` and `campaigns/` into the plugin source
tree, which per the section above must never exist here. Preflight normally catches it (no
`## Campaign engine` block, no artifact chain) and routes to `setup-engine` rather than scaffolding
silently, but that is a backstop, not a lock.

Iterate against the working tree with `--plugin-dir`, which loads the plugin **directly from disk**
and takes precedence over the installed copy for that session:

```powershell
cd <scratch-workspace>
claude --plugin-dir <path-to-this-repo>/plugins/halfborg-campaign
```

Then `/reload-plugins` in that session picks up `SKILL.md` edits — no commit, no push, no reinstall.
A new skill folder needs nothing else, since `skills/` is scanned by default; changes to `agents/`
or `.mcp.json` want a restart.

Two things that look like shortcuts and are not:

- **Do not register this checkout as the marketplace source.** `/plugin marketplace add ./` creates a
  `directory` source that *is* read live, so it looks ideal — but marketplace names are global, and a
  project-scope `extraKnownMarketplaces` does **not** override a user-scope entry of the same name.
  Pointing the marketplace at a working tree therefore serves unreleased skills to *every* workspace
  on that machine, real campaign workspaces included. `--plugin-dir` is per-session; prefer it.
- **Do not disable the plugin here** with `enabledPlugins: false` in a repo-level
  `.claude/settings.json`. Because `--plugin-dir` points into this tree, that disable also suppresses
  the plugin in the scratch workspace and silently breaks the loop above.

There is no test suite, no build step and no lint config, and nothing left to smoke-test as a
script — the campaign page is validated by actually looking at the rebuilt `site/index.html` during
an end-to-end run of the pipeline in a scratch workspace (reset it by deleting `engine.yaml`,
`brands/` and `campaigns/`), which is also how `claude plugin validate` is complemented.

[CONTRIBUTING.md](CONTRIBUTING.md) is the human-facing version of most of this file. The root
`README.md` and the plugin's `README.md` are written for **marketers with no Claude Code
experience** — keep contributor detail out of both.

## Architecture of the plugin

Read [skills/architecture/SKILL.md](plugins/halfborg-campaign/skills/architecture/SKILL.md)
first — it is the architecture reference every other skill assumes. The short version:

Four phases, first two human-gated:
`write-brief` → `write-message` → expansion (the many expander skills) → `run-qa`.
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

**Adding a skill.** Skills live at `skills/<skill-name>/SKILL.md`, exactly where Claude Code's
default scan looks, so a new folder is discovered with no registration. `plugin.json` has no `skills`
array and should not gain one — the array only *adds to* the default scan, so at this depth it is
duplication that goes stale.

**Naming.** A skill that performs work is verb-led: `write-brief`, `build-site`, `generate-video`.
A skill that carries reference knowledge instead takes a noun, because a verb would advertise an
action it never performs — `architecture` is the only one, and it is deliberate.

**Plugins.** One per workflow family, slug `halfborg-<family>`, sibling folders under `plugins/` with
relative `./plugins/<name>` sources, all in the single `halfborg` marketplace. Never split by client
brand or output type. Ordinary new work belongs inside an existing family; a second *plugin* is only
justified by a very different always-on context cost. A rename or removal adds an **append-only**
entry to the catalogue's `renames` map.

**Skill frontmatter.** `name` matching the folder, plus a long `description` that carries trigger
phrases, what the skill reads, and explicit `Do NOT use for…` routing to the sibling skill that owns
that job. The descriptions are the routing table — keep the negative half accurate when
responsibilities move. Write `description` as a `>-` block scalar: a plain scalar breaks on the first
colon-space in the prose, and broken frontmatter loads as *empty metadata* rather than failing, so
the skill silently stops routing. Only `claude plugin validate ./plugins/<name>` catches it.
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
