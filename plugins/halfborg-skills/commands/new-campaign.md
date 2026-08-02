---
description: Start a new marketing campaign. Resolves and validates the brand pack, scaffolds the campaign workspace, then hands off to the brief.
argument-hint: <brand-id> [campaign name]
---

Start a new marketing campaign. The brand argument is `$1`; anything after it in `$ARGUMENTS` is the campaign name.

Do the plumbing first, then hand off to the brief. Do not start asking campaign questions until the brand's details are loaded and usable.

**How this sounds.** The user is a marketer starting a campaign, not an operator running a setup routine. Everything you say follows `${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md`: no "pack", no "schema", no "skeleton", no "manifest", no folder listing read aloud. Steps 1 to 3 should be close to silent — a line to confirm which brand and what the campaign is called, and then you are into the brief.

## 1. Find the brand's details

Look for the brand pack at `brands/$1/pack.yaml`.

- If `$1` is empty, ask which brand this campaign is for, offering the ones already set up by name. Stop.
- If the file does not exist, say you have not got that brand set up yet, name the ones you do have, and point them at `/halfborg-skills:setup-brand` to add it. Do not invent a pack or infer brand facts.

## 2. Check they are usable

Parse `brands/$1/pack.yaml` and validate it against `${CLAUDE_PLUGIN_ROOT}/schema/brand-pack.schema.json`. Richness is a dial, not a gate: separate blocking from thin. **Never show the user a validation error** — this step is either silent or a route.

- **Blocking (the basics are missing):** if the pack is absent or fails validation on the skeleton (`brand` with name and positioning, at least one `audience`, at least one `products` entry), the brand is not set up. Do not stop dead and do not interview the user for brand identity here. Say what you are missing in their terms — who they sell to, and what they sell — and send them to `/halfborg-skills:setup-brand`, which asks them properly. Then they can re-run this.
- **Non-blocking (thin but usable):** if the basics are there but the rest is sparse (no voice, no channels, no mandatories, thin segments or claims), that is fine. Proceed. Say in one clause that you will ask a couple of extra things as you go. Never characterise their brand setup as thin, incomplete or poor.

Everything brand-specific comes from what they have already told you. The more of it is filled in, the less the brief has to ask.

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

Do not narrate any of this. One line — the campaign is set up under this name — is the whole report, and only if a name needed confirming.

## 4. Hand off to the brief

Load the validated pack into context and begin by following the `campaign-brief` skill, which runs the intake interview and writes the brief. Pass it the pack and the campaign workspace path. Do not announce the handover or name the skill: from the user's side this is one continuous conversation that has just moved on to the first question about their campaign.

Keep every question to the campaign. Anything the brand's details already answer is not a question.