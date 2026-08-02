# Preflight — is this workspace ready, and where do I route if not?

The shared contract for deciding whether an engine skill can do its work, and what to do when it
cannot. Skills reference this document instead of restating the checks; where a skill's own wording
disagrees with this spec, **this spec wins**.

**The one rule underneath all of it: route, do not guess.** Every failure below has a named
destination. Taking that route is a complete, successful outcome — not an error, and not a
half-finished task. What is never acceptable is inventing the missing thing: a brand fact, a
campaign, a manifest entry, a deliverable id, a locked still, or a path.

Run the two tiers in order. Tier 1 is free; only reach for tier 2 when the artifact chain matters to
what you are about to do.

This document decides **where** you route. How that sounds out loud is
`${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md` section 7: name what is missing in the user's own
terms, keep the slash command exact, and do not treat a route as an apology.

---

## Tier 1 — context (free, no tool calls)

`/halfborg-skills:setup-engine` writes a `## Campaign engine` block into the workspace's `CLAUDE.md`
(or `AGENTS.md`). Project instructions load on every turn, so **that block being in your context is
itself the proof that the workspace is set up** — and it already tells you the layout and which
brands exist. Use it before you touch the filesystem.

Skills do not restate this check, and never narrate it. It costs nothing and it is invisible: if the
block is there, you already have your answer; if it is not, fall through to tier 2 quietly. The user
hears about readiness only when a route below is actually taken.

- **Block present.** Proceed. Treat its layout as current, and skip tier 2's workspace check — its
  presence already answers that. No tool calls needed.
- **Block absent.** This is a **hint, not a verdict.** The block is missing in two very different
  situations: a folder that was never set up, and a perfectly good workspace whose owner set it up by
  hand or deleted the block. Fall through to tier 2 and let the filesystem decide. If tier 2's
  workspace check then passes, proceed with the work and mention
  `/halfborg-skills:setup-engine` once, in a clause, as the thing that would make future sessions
  cheaper — never as a blocker. Only stop if tier 2 itself fails.

Two caveats worth keeping straight. The block is a *static* signal: it is refreshed when
`/halfborg-skills:setup-engine` re-runs, so a brand added five minutes ago may not appear in it yet —
when the brand list matters, verify against `brands/` rather than trusting the block alone. And it
says nothing about any individual campaign's progress, because that changes within a session. For
anything on the artifact chain, go to tier 2 regardless of what tier 1 said.

---

## Tier 2 — filesystem (the artifact chain)

Four resolution steps. Stop at the first one that fails, take its route, and do not continue.

### 2.1 Workspace

No `engine.yaml`, no `brands/`, and no `campaigns/` → this directory is not a campaign workspace.

**Route:** `/halfborg-skills:setup-engine`.

Do not scaffold silently, and do not start a campaign in a directory that was never set up as one. If
*some* of the three are present, the workspace exists — proceed; a missing `engine.yaml` alone is
never a blocker, because every value it holds has a fallback in the skill that reads it.

### 2.2 Campaign

`campaigns/<slug>/system/manifest.yaml` must exist. It is the campaign's identity: it names the
campaign and, in `campaign.brand`, carries the authoritative brand link.

| State | Meaning | Route |
|---|---|---|
| No `campaigns/<slug>/` folder | The campaign was never started | `/halfborg-skills:new-campaign <brand-id> [name]` |
| Folder exists, no `system/manifest.yaml` | `/halfborg-skills:new-campaign` scaffolded it but the brief never completed — the manifest is a phase-1 output | `campaign-brief` |
| Folder exists, no `system/` at all | Legacy layout | The migration recipe in `campaign-structure.md` section 7 |
| More than one campaign folder and no slug given | Ambiguous | List them and ask which. Never assume the most recent. |

Never write a `manifest.yaml` yourself to get unblocked — that is `campaign-brief`'s output and it
requires the human-gated interview behind it.

### 2.3 Brand

Read `campaign.brand` from `campaigns/<slug>/system/manifest.yaml` and resolve
`brands/<brand-id>/pack.yaml`. **Always this field** — never the `<brand>-` prefix on the campaign
folder, which is a human affordance for browsing, and never the brand named earlier in conversation.
If prefix and field disagree, the field wins. See `campaign-structure.md` section 1.1.

- **Pack missing**, or present but failing the skeleton check (`brand` with a name and positioning,
  at least one `audience`, at least one `products` entry) → the brand is not set up.
  **Route:** `/halfborg-skills:setup-brand`. Do not interview the user for brand identity from inside
  another skill, and never infer a brand fact you cannot read.
- **Pack thin but valid** (no voice, no channels, no `mandatories`, sparse claims) → proceed. Richness
  is a dial, not a gate; expect the phase to ask a few more questions. Say that as a plain heads-up
  ("I will ask you a couple of extra things as we go"), never as a complaint about the pack.
- **`mandatories` absent** means *unconfirmed*, not *none*. Confirm rather than assuming the brand has
  no rules — and ask for it as "anything that has to appear on everything you publish", not by name.
- **`ads` block absent** and the task is an ad → hard stop, route to `/halfborg-skills:setup-brand`.
  The block's presence is the proof that a human decided who may appear in an ad; never invent a
  presenter or write the block yourself.

### 2.4 Message

`campaigns/<slug>/docs/message.md` carries the key message, the chosen tagline, and the
`master_visual` spec with its `locked_still` pointer.

**Route when missing:** `campaign-message`.

Whether a missing `message.md` stops you or merely degrades you is the individual skill's call, and
each one states it. Do not override that here. The three shapes in use:

- **Stop and route** — the skill's whole job is to lay something onto the locked visual, so there is
  nothing to do without it (`compose-lockup`, `reference-kit`).
- **Degrade with consent** — the skill can run off `brief.md` alone, but must say so and get an
  explicit go-ahead first, never proceed silently (`landing-page`, `visual-ideas`).
- **Degrade and note** — the skill continues against `brief.md` and records the reduced check in its
  output (`campaign-qa`, where drift checks fall back to brief alignment).

If `locked_still` is set but the file it points at does not exist, say so plainly rather than
rendering a replacement — a re-lock belongs to `campaign-message`.

---

## Writing into a campaign

Two rules that apply to every skill that produces an artifact, checked at the point of writing rather
than at the start.

**Deliverable ids are registered, not invented.** Before creating `media/<deliverable-id>/`, confirm
the id appears in `system/manifest.yaml` or was registered in `system/generation-log.jsonl`. An
unregistered id is usually a typo, and creating the folder anyway leaves an orphan that only QA
catches, much later.

Warn and confirm, do not block. Ask it as a question about their campaign, not about the register —
name the thing, say you have nothing by that name on this campaign's list, offer the closest match
you do have, and carry on once they answer:

> I have nothing called `launch-blog` on this campaign. Did you mean the launch email, or is this
> something new you want adding?

**Log, then rebuild.** Append one line to `system/generation-log.jsonl` and run the site builder, per
`campaign-structure.md` section 4.1. A render that happened but was not logged is invisible to QA and
to the campaign page.
