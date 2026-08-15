# Working on halfborg skills

This repo is the **source** of a Claude Code plugin marketplace. Nothing here runs where it sits:
`.claude-plugin/marketplace.json` is the catalogue, and each plugin is self-contained under
`plugins/<name>/`. Today there is one, `halfborg-campaign`.

There is no executable code anywhere in this repo — no script, no Node dependency, no
`package.json`. Almost all "code" here is prose that a model executes, including the campaign page
itself: `build-site` reads a campaign's own files and writes `site/index.html` directly,
rather than running a build script.

## Repo layout

```
.claude-plugin/marketplace.json   the catalogue
plugins/
  halfborg-campaign/              one plugin, self-contained
    .claude-plugin/plugin.json
    skills/<18 skills>/           one folder per skill, no category layer
    commands/ agents/ schema/ templates/ .mcp.json
```

Skills sit directly under `skills/`, which is exactly where Claude Code's default scan looks, so
they are discovered automatically. There is no `skills` array in `plugin.json` and there should not
be one — the array only ever *adds to* the default scan, so at this depth it would be pure
duplication. Add a folder with a `SKILL.md` in it and you are done. Files under `schema/` are read
as plain content and are **not** registered anywhere.

Nothing at the repo root is loaded by Claude Code except the catalogue, and a plugin's own
`CLAUDE.md` is not loaded as project context — which is why the engine's architecture document is
the `architecture` skill rather than a `CLAUDE.md`.

## Naming: one plugin per workflow family

New families get their own plugin, as a sibling folder under `plugins/`:

- **Slug is `halfborg-<family>`** — `halfborg-campaign`, and a hypothetical `halfborg-productivity`.
  Set `displayName` for the human-readable name the plugin browser shows.
- **One marketplace, `halfborg`**, listing them all. The suffix a user types after `@` is the
  marketplace name, never the repo name.
- **Relative sources**, `./plugins/<name>`, so the catalogue resolves inside this repo.
- **Split by workflow family, never by client brand or output type.** A brand is a pack the engine
  reads at runtime, not a plugin; "the video one" and "the blog one" are skills inside a family, not
  families. Getting this wrong fragments the install list and duplicates the schema contracts.

The bar for a new plugin is a genuinely different always-on context cost that someone would want to
install on its own. Ordinary new work belongs inside an existing family. Renaming or removing a
plugin means an **append-only** entry in the catalogue's `renames` map, so existing installs migrate
themselves — keep old entries forever, and never edit one.

Everything an installed plugin references internally goes through `${CLAUDE_PLUGIN_ROOT}`, so a
plugin never depends on where it was installed and never writes into itself. The files it creates —
`brands/`, `campaigns/`, `engine.yaml` — belong to the user's working directory. Note that the
placeholder is substituted inline in `SKILL.md` and agent content but **not** in files read as plain
content, so reading `schema/*.md` as ordinary repo files shows the raw placeholder. That is expected.

## Test against the local checkout

Authoring happens in this repo; the engine runs somewhere else. Keep a scratch campaign workspace
outside this repo, and **never run the engine in here** — it would scaffold `engine.yaml`, `brands/`
and `campaigns/` into the plugin source tree, which must never exist here.

Load the plugin straight from disk with `--plugin-dir`, which takes precedence over the installed
copy for that session:

```powershell
cd <scratch-workspace>
claude --plugin-dir <path-to-this-repo>/plugins/halfborg-campaign
```

`/reload-plugins` then picks up `SKILL.md` edits — no commit, no push, no reinstall. Changes to
`agents/`, `.mcp.json` or `plugin.json` want a restart.

**Do not register this checkout as the marketplace source.** `/plugin marketplace add ./` looks
ideal, because a `directory` source is read live. But marketplace names are global, and a
project-scope `extraKnownMarketplaces` does not override a user-scope entry of the same name, so
pointing `halfborg` at a working tree serves unreleased skills to *every* workspace on the machine —
real campaign workspaces included. `--plugin-dir` is per-session; prefer it.

Validate before pushing. Run both: the first checks the catalogue and the `renames` map, the second
parses skill frontmatter, agents and commands.

```powershell
claude plugin validate ./
claude plugin validate ./plugins/halfborg-campaign
```

There is no test suite, no build step and no lint config, and nothing left to smoke-test as a
script — the campaign page is validated by actually looking at the rebuilt `site/index.html` during
an end-to-end run of the pipeline in a scratch workspace, which is also how `claude plugin validate`
is complemented.

## The `schema/` directory is the authority

`schema/` holds contracts that skills **reference rather than restate**; where a skill's wording
disagrees, the spec wins. When changing behaviour, **change the spec first**, then the skills that
defer to it.

- `plain-language.md` — what a skill says out loud. Read it before touching any user-facing line.
- `preflight.md` — the shared readiness-and-routing contract. Underlying rule: *route, do not guess.*
- `campaign-structure.md` — the campaign tree, deliverable ids, the media filename grammar and the
  `generation-log.jsonl` event schema. Section 4.1 is the canonical append-and-rebuild snippet every
  producing skill copies.
- `brand-pack.schema.json`, `manifest.schema.json`, `engine.schema.json` — JSON Schema.

## Adding a skill

Skills live at `skills/<skill-name>/SKILL.md`, one folder deep, picked up by the default scan.
Frontmatter is `name` plus a long `description` carrying trigger phrases, what the skill reads, and
explicit `Do NOT use for…` routing to the sibling skill that owns that job. **The descriptions are
the routing table** — they are read by the model to decide which skill fires, and never read by a
user, so keep them precise and do not de-jargon them. Keep the negative half accurate when
responsibilities move.

`name` must match the folder. Write the `description` as a `>-` block scalar: a plain YAML scalar
breaks on the first colon-space in the prose, and a skill whose frontmatter fails to parse loads
with **empty metadata** rather than erroring, so it goes quietly unroutable. `claude plugin validate
./plugins/<name>` catches it; nothing at runtime will.

**Naming.** A skill that performs work is verb-led and says what it does: `write-brief`,
`build-site`, `generate-video`, `analyse-competitor-ads`. The exception is a skill that carries
reference knowledge rather than doing anything — that takes a noun, because a verb would advertise
an action it never performs. `architecture` is the only one today. Do not "fix" it into a verb.

Agents carry `tools:`, `model: inherit` and a `color:`.

## Prose style

British spelling, few em dashes, no phrasing that reads as AI-generated. This applies to skill
content and to generated marketing copy alike.

Beyond style, there is one rule that constrains every user-facing line: **the engine's vocabulary is
for its files, not for the conversation.** The people running this are marketers. A step that says
*write `status: candidate` to the log* keeps that string exactly; a step that says *report the
status* does not. `plain-language.md` carries the translation table, the sentence-and-receipt shape
every gate uses, and the short list of strings that are never softened — the verbatim prompt, the
model id, the money, and a path the user can open.

## Invariants

The engine's reason for existing. Do not weaken one to make a skill simpler — they are listed in
[CLAUDE.md](CLAUDE.md) and that is the single copy.

## Licence

MIT.
