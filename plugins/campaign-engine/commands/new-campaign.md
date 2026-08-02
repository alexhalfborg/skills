---
description: Start a new marketing campaign. Resolves and validates the brand pack, scaffolds the campaign workspace, then hands off to the brief.
argument-hint: <brand-id> [campaign name]
---

Start a new marketing campaign. The brand argument is `$1`; anything after it in `$ARGUMENTS` is the campaign name.

Do the plumbing first, then hand off to the brief. Do not start asking campaign questions until the pack is loaded and valid.

## 1. Resolve the pack

Look for the brand pack at `brands/$1/pack.yaml`.

- If `$1` is empty, list the folders under `brands/` and ask which brand this campaign is for. Stop.
- If the file does not exist, list the brands already set up under `brands/`, and tell the user they can set this brand up first with `/campaign-engine:setup-brand`. Do not invent a pack or infer brand facts.

## 2. Validate the pack

Parse `brands/$1/pack.yaml` and validate it against `${CLAUDE_PLUGIN_ROOT}/schema/brand-pack.schema.json`. The pack is a dial, not a gate: separate blocking from thin.

- **Blocking (skeleton missing):** if the pack is absent or fails validation on the skeleton (`brand` with name and positioning, at least one `audience`, at least one `products` entry), the brand is not set up. Do not stop dead and do not interview the user for brand identity here: point them to `/campaign-engine:setup-brand`, which will interview them and write the pack. Then they can re-run this.
- **Non-blocking (pack is thin):** if the skeleton is present but the recommended parts are sparse (no voice, no channels, no mandatories, thin segments or claims), that is fine. Proceed. Note briefly that the brief phase will ask a few extra questions to cover the gaps. A richer pack means fewer questions; a thin one still works.

Everything brand-specific comes from the pack. The more of it is filled in, the less the brief phase has to ask.

## 3. Scaffold the workspace

Derive a slug from the campaign name in `$ARGUMENTS`. If no name was given, ask for a short one.

Create `campaigns/$1-<YYYY-MM-DD>-<slug>/` per `${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md` — the brand id
prefixes the folder name — containing:

- `docs/` — empty (the gated phases write `brief.md`, `message.md`, `qa-report.md` here)
- `content/` — empty (text deliverables land here)
- `media/` — empty (generated media lands here, one subfolder per deliverable id)
- `system/README.md` — one line noting the brand id, campaign name, and creation date
- `system/generation-log.jsonl` — empty file (the append-only generation log)

The phases create `docs/brief.md`, `system/manifest.yaml`, `docs/message.md`, and `docs/qa-report.md` when they run — do not create those placeholders now. `site/` appears on the first site build.

## 4. Hand off to the brief

Load the validated pack into context and begin by following the `campaign-brief` skill, which runs the intake interview and writes the brief. Pass it the pack and the campaign workspace path.

Keep every question to the campaign. Anything the pack already answers is not a question.