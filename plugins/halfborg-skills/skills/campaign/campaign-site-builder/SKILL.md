---
name: campaign-site-builder
description: >-
  Build (or rebuild) a campaign's single navigable HTML page — tabs for Overview, Strategy,
  Concept, Content, Media chronology, and QA — by running the bundled deterministic build
  script over the campaign's docs, content, media, and generation log. Use whenever the user
  asks to "compile the campaign into a page", "build the campaign HTML", "make a navigable
  view of <campaign>", "give me a campaign overview page", or to refresh the page after
  edits; other engine skills also run the script automatically after logging each generated
  artifact. Produces one self-contained offline file at campaigns/<slug>/site/index.html.
  Do NOT use to build the campaign's own public landing page (that is landing-page, which writes a
  self-contained HTML page into media/<id>/), to write or edit any campaign content, or for anything
  outside a campaigns/<slug>/ folder.
---

# Campaign site builder — one deterministic page per campaign

Campaign paths and filenames follow `${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md`.

The heavy lifting is **not** an LLM job. This skill owns a deterministic build script that
compiles a campaign into a single self-contained tabbed page:

```
node "${CLAUDE_PLUGIN_ROOT}/skills/campaign/campaign-site-builder/scripts/build-site.mjs" campaigns/<slug>
```

The script (Node ≥ 18, zero dependencies) reads `docs/*.md`, `content/*.md`, the `media/` tree,
and `system/generation-log.jsonl`, and writes `campaigns/<slug>/site/index.html` — overwritten on
each run, gitignored, never hand-edited. Same inputs give a byte-identical page, and a rebuild is
sub-second, which is why every artifact-producing skill runs it after appending to the generation
log (the "log step" in the structure spec).

## Default behaviour: run the script

1. Resolve the campaign: use the path/slug the user gave; otherwise pick the most recently
   modified folder under `campaigns/` and confirm the slug in one line.
2. Run the script. It exits non-zero with a clear message on a legacy-layout campaign (no
   `system/` folder) — in that case offer the migration recipe in the structure spec rather
   than building anything by hand.
3. Relay its output: the page path, tab count, log-event count, and **every warning verbatim**
   (warnings are malformed generation-log lines; offer to fix the offending line, and only that
   line).
4. Tell the user how to view it (open `site/index.html` in a browser or VSCode's HTML preview)
   and how many claim flags surfaced on the Overview tab.

That is the whole job in the normal case. Do not re-render the markdown yourself, and do not
edit `site/index.html` directly — a hand edit is destroyed by the next rebuild.

## What the script builds

| Tab | Fed by |
|---|---|
| **Overview** | deliverables table (manifest ids + registered pipeline sub-ids, latest status, artifact counts, logged cost) and the collected `⚠️ CLAIM CHECK` strip |
| **Strategy** | `docs/brief.md` |
| **Concept** | `docs/message.md` plus a key-visual gallery (candidates and the locked lineage, badged) |
| **Content** | every `content/*.md`, with a table of contents |
| **Media** | the chronology: `generate` events from the log sorted by time, grouped by deliverable — thumbnail/player, version, model, cost, status badge, prompt in a collapsed details block; files on disk missing from the log appear badged "unlogged" |
| **QA** | `docs/qa-report.md` when present |

Tabs with nothing to show are omitted. Media is relatively linked (`../media/...`), never
embedded, so the page stays small and works offline from disk.

## When the LLM earns its keep: redesigning the page

Only when the user asks to change how the page looks or what it shows:

- Layout, styling, CSS classes: edit `references/page-template.html` (the fixed shell whose
  placeholders and class inventory are documented in its header comment).
- New sections, different grouping, extra data on cards: edit `scripts/build-site.mjs`.
- After either edit, re-run the script against a real campaign and confirm the page renders
  before reporting done. Keep the script deterministic: no wall-clock timestamps, no
  randomness, no network — "last updated" must derive from the log, not `Date.now()`.

## House rules

- **Render, never rewrite.** The script reproduces source markdown faithfully; if a doc reads
  oddly, that is a content problem for the owning skill, not something to fix here.
- **Carry claim flags through, never drop them.** They exist for human sign-off.
- **One self-contained file, offline-first.** No CDNs, web fonts, or external requests, ever.
- UK English, no em dashes in any label or copy you author for the shell.
