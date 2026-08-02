# Seed: the `## Campaign engine` project-instructions block

`/halfborg-skills:setup-engine` writes this block into the workspace's `CLAUDE.md` (or `AGENTS.md`).
It is the engine's always-in-context signal: because it loads on every turn, a skill can tell from
its presence alone that the workspace is set up, and read the layout and the brand list without a
single tool call. That is why it carries **facts, not just routing**.

Rules for writing it:

- Fill every `[bracketed]` part from what you actually found. Never ship a placeholder.
- The `### Brands` list is generated — one line per brand found under `brands/`. On a re-run,
  refresh it.
- Keep the whole block under ~30 lines. It is paid for on every turn of every session.
- Show the user the drafted block and let them edit it before you write.

---

## Campaign engine

This repo is a campaign workspace. Brand facts live in `brands/<id>/pack.yaml` (plus optional
`design.md` for design tokens and `voice-profiles.md` for the writing corpus). Campaign work lives in
`campaigns/<brand>-<YYYY-MM-DD>-<slug>/`, with gate artifacts in `docs/`, text deliverables in
`content/`, generated media in `media/<deliverable-id>/`, and machine state in `system/`. Engine
defaults are in `engine.yaml`. The engine itself is the `campaign-engine` plugin and is read-only —
never edit a brand fact into a skill, and never hand-edit anything under `system/` or `site/`.

### Pipeline

Brief → Message → Expansion → QA. The first two are **human-gated**: interview, draft, get explicit
sign-off, *then* write the artifact. Do not automate past a gate or collapse two into one. State
lives in files, not the conversation, so each phase reads the previous phase's artifact rather than
relying on chat history. Rendering an image or video always stops for approval first, with the
verbatim prompt and a cost estimate.

### Commands

- `/halfborg-skills:setup-brand [name or website]` — add a brand
- `/halfborg-skills:new-campaign <brand-id> [campaign name]` — start a campaign
- `/halfborg-skills:setup-engine` — re-check the workspace and what is wired

### Brands

[one line per brand found under `brands/`, e.g.:]
[- `acme` — Acme Tools. Ads configured (presenter: founder), founder voice + customer stories.]
[- `beta-co` — Beta Co. No ads block yet.]

Full architecture, contracts and invariants: run the `campaign-engine` skill.
