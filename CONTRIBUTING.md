# Working on halfborg skills

This repo is the **source** of a Claude Code plugin marketplace. Nothing here runs where it sits:
`.claude-plugin/marketplace.json` is the catalogue, and each plugin is self-contained under
`plugins/<name>/`. Today there is one, `halfborg-skills`.

There is no executable code anywhere in this repo — no script, no Node dependency, no
`package.json`. Almost all "code" here is prose that a model executes, including the campaign page
itself: `campaign-site-builder` reads a campaign's own files and writes `site/index.html` directly,
rather than running a build script.

## Repo layout

```
.claude-plugin/marketplace.json   the catalogue
plugins/
  halfborg-skills/                one plugin, self-contained
    .claude-plugin/plugin.json
    skills/campaign/<18 skills>/  grouped by domain
    commands/ agents/ schema/ templates/ .mcp.json
```

Skills are grouped by domain under `skills/`, so a new area of work is a new category folder
alongside `campaign/`. Because they sit a level deeper than Claude Code's default scan, each one is
listed explicitly in `plugin.json`'s `skills` array — add a skill, add its path. Files under
`schema/` are read as plain content and are **not** registered anywhere.

A second *plugin* is only worth it for something with a very different always-on context cost that
you would want installable on its own; that is a folder under `plugins/` plus one entry in
`marketplace.json`. Ordinary new work belongs inside `halfborg-skills`. Nothing at the repo root is
loaded by Claude Code except the catalogue, and a plugin's own `CLAUDE.md` is not loaded as project
context — which is why the engine's architecture document is the `campaign-engine` skill rather than
a `CLAUDE.md`.

Everything an installed plugin references internally goes through `${CLAUDE_PLUGIN_ROOT}`, so a
plugin never depends on where it was installed and never writes into itself. The files it creates —
`brands/`, `campaigns/`, `engine.yaml` — belong to the user's working directory. Note that the
placeholder is substituted inline in `SKILL.md` and agent content but **not** in files read as plain
content, so reading `schema/*.md` as ordinary repo files shows the raw placeholder. That is expected.

## Test against the local checkout

Install from the checkout rather than GitHub, so you test the code in front of you:

```
/plugin marketplace add ./                        # from this repo's root
/plugin install halfborg-skills@halfborg
```

`SKILL.md` edits take effect immediately. Changes to `agents/`, `.mcp.json` or `plugin.json` need
`/reload-plugins` or a restart.

Validate before pushing:

```
claude plugin validate ./
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

Skills live at `skills/<category>/<skill-name>/SKILL.md`. Frontmatter is `name` plus a long
`description` carrying trigger phrases, what the skill reads, and explicit `Do NOT use for…` routing
to the sibling skill that owns that job. **The descriptions are the routing table** — they are read
by the model to decide which skill fires, and never read by a user, so keep them precise and do not
de-jargon them. Keep the negative half accurate when responsibilities move.

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
