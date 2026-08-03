---
name: campaign-site-builder
description: >-
  Build (or rebuild) a campaign's single scrolling HTML page — sections for Overview, Strategy,
  Concept, Content, Media chronology, and QA — by reading the campaign's docs, content, media, and
  generation log directly and writing the page yourself. Use whenever the user asks to "compile the
  campaign into a page", "build the campaign HTML", "make a navigable view of <campaign>", "give me
  a campaign overview page", or to refresh the page after edits; other engine skills also trigger
  this automatically, once per invocation, after logging their artifacts. Produces one
  self-contained offline file at campaigns/<slug>/site/index.html. Do NOT use to build the
  campaign's own public landing page (that is landing-page, which writes a self-contained HTML page
  into media/<id>/), to write or edit any campaign content, or for anything outside a
  campaigns/<slug>/ folder.
---

# Campaign site builder — one page per campaign, authored fresh each time

Campaign paths and filenames follow `${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md`.

There is no build script here. You read the campaign's own files and write
`campaigns/<slug>/site/index.html` yourself, following the shape below and the CSS reference in
`references/page-template.html`. This trades away byte-identical output for zero install
requirements — no Node, nothing to run. The one rule that makes that trade safe: **never put
anything on the page that you did not actually read from a file.** A script cannot lie; you can, so
this is the load-bearing rule of this skill, not an aside.

## 1. Resolve the campaign

Use the path/slug the user gave; otherwise pick the most recently modified folder under
`campaigns/` and confirm the slug in one line.

If the campaign has no `system/` folder (a legacy layout — `output/`+`reference/`, or `ads/`), do
not attempt to build a page. Offer the migration recipe in
`${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md` section 7 instead.

## 2. Read the inputs, in this order

The order you read in is the order sections appear in — read everything before writing anything.

- `system/manifest.yaml` — `campaign.name` and `campaign.brand` from the `campaign:` block, and the
  registered deliverable ids. Read only the `campaign:` block's own fields; a deliverable entry
  further down the file can have its own `name:` — that is not the campaign's name.
- `system/generation-log.jsonl` — every line, parsed as JSON. A line that does not parse is skipped,
  not fatal: note it as a warning (file and line content) so the user can fix that one line. This is
  the same tolerant-parse, warn-per-bad-line behaviour the old build script had; you are doing it
  now by actually reading the file each time, not it.
- `docs/brief.md`, `docs/message.md`, `docs/qa-report.md` — whichever exist. A missing file means
  its section is simply omitted from the page — never write "not started yet" or invent what might
  be in it.
- `content/*.md` — every file, in filename order.
- `media/**` — one `Glob` per deliverable-id folder under `media/`, cross-referenced against the
  log's `generate` events by `file` path. A file on disk with no matching log line is real and
  belongs on the page, badged `unlogged` — it is not an error to hide.

## 3. Write the page: one scrolling page, six sections

Compose `campaigns/<slug>/site/index.html` directly with the Write tool, reusing the CSS and class
conventions in `references/page-template.html` verbatim — do not invent new classes for something
that conventions file already styles. Sections appear in this order as plain `<h2>` headings on one
continuous page (no tabs, no click-to-reveal); **a section with nothing to show is omitted
entirely**, not shown empty:

| Section | Built from |
|---|---|
| **Overview** | the deliverables table (manifest ids + registered pipeline sub-ids, each with its latest status from the log, artifact counts, the logged cost sum) and the collected `⚠️ CLAIM CHECK` strip, at the top of this section |
| **Strategy** | `docs/brief.md`, rendered |
| **Concept** | `docs/message.md`, rendered, plus a key-visual gallery (candidates and the locked lineage, badged) |
| **Content** | every `content/*.md`, rendered, with a short in-page anchor list at the top of just this section (it is the one that tends to run long) |
| **Media** | the chronology: `generate` events from the log sorted by time, grouped by deliverable — file reference/player, version, model, cost, status badge, prompt in a collapsed details block; on-disk files missing from the log appear badged `unlogged` |
| **QA** | `docs/qa-report.md` when present |

Media is relatively linked (`../media/...`), **never embedded/base64'd** — the page stays small and
still opens straight from disk, offline.

**"Last updated" derives from the log's own maximum `ts`, never the current time.** That is a real
fact sitting in a file you already read; do not ask for the time or stamp "now."

## House rules

- **Never fabricate.** Every fact on the page — every deliverable, every cost, every status badge —
  must trace to something you actually read this run. No invented deliverable, no guessed cost, no
  status you didn't find a log entry for. This is the one new rule that exists specifically because
  a script can no longer enforce honesty for you.
- **Render, never rewrite.** Reproduce source markdown faithfully; if a doc reads oddly, that is a
  content problem for the owning skill, not something to silently fix here.
- **Carry claim flags through, never drop them.** They exist for human sign-off.
- **One self-contained file, offline-first.** No CDNs, web fonts, or external requests, ever.
- **Never hand back to an old copy.** `site/index.html` is overwritten on each rebuild; never leave
  it half-written or patch it in place.
- **Speak plainly.** Everything you say out loud follows `${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md`:
  engine words belong in the files, not in the conversation. Report the page is rebuilt, **one
  path** in full, and how to open it (double-click it, or open it in any browser). If any claim
  flags surfaced, say how many and that they are waiting at the top of the page. Then end on a next
  action — usually an offer to walk through what is there, or to make the next thing on the list.
- UK English, no em dashes in any label or copy you author for the page.

## Redesigning the page

Only when the user asks to change how the page looks: edit `references/page-template.html`'s
`<style>` block and class inventory (documented in its header comment), then rebuild a real campaign
against it and confirm the page still renders correctly before reporting done. New sections or
different data on a card are just a change to the table above, not a script.
