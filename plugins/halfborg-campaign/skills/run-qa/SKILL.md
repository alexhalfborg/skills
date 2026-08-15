---
name: run-qa
description: >-
  Run a campaign's phase-4 QA pass: the independent drift-and-compliance gate that reads every
  artifact and writes docs/qa-report.md. Use whenever the user wants to QA, check, review for
  compliance, or sign off a campaign or a single deliverable before it ships: "run QA on this
  campaign", "check the campaign for drift", "QA the landing page", "is this on-brand and compliant",
  "review the ads against the message", "check the visuals against the design", "final compliance
  pass". Reads the active brand from campaign.brand in campaigns/<slug>/system/manifest.yaml, then
  brands/<id>/pack.yaml (mandatories, nogos, products[].claims_allowed, voice), brands/<id>/design.md
  (typeface, colour hexes), campaigns/<slug>/docs/message.md (key message, tagline, master_visual
  constants and locked_still), docs/brief.md, system/manifest.yaml and system/generation-log.jsonl,
  plus content/*.md and every file under media/<id>/. Checks four families — structure & completeness,
  copy & claims, VISUAL compliance (reads each PNG against design tokens + master_visual constants;
  ffprobe + an extracted frame for video; no paid fal calls), and message drift — reconciles the
  inline CLAIM CHECK / POLICY CHECK flags the expanders leave, and writes a per-artifact PASS/WARN/FAIL
  report with a concrete proposed fix per finding, then rebuilds the site. Runs full-campaign by
  default or scoped to one deliverable. Do NOT use to PRODUCE or fix artifacts (the expander skills do
  that — QA proposes fixes, it does not apply them), to invent the message or concept (write-message),
  or to build the campaign review site (build-site, which QA merely triggers).
---

# run-qa — the campaign's drift-and-compliance gate

Phase 4. After expansion has produced the deliverables, this skill reads every artifact against the
locked message and the brand pack, and writes `docs/qa-report.md`: a per-artifact **PASS / WARN /
FAIL** with a concrete proposed fix for each finding, and one overall gate verdict. It is the
independent check the whole pipeline defers to — the skill that turns the recurring
*"this is a generated asset, not a cleared one … run-qa before it ships"* promise into an
actual clearance pass.

QA **proposes** fixes; it does not apply them. Remedying a finding is the producing skill's job
(re-render, reword, re-lock). QA's output is the report, not an edited artifact.

Where the neighbours sit:

- The **expander skills feed QA; they never invoke it.** `generate-image`, `generate-video`,
  `build-landing-page`, `write-personal-post`, `write-customer-story`, `write-email`, `write-video-ad-script`,
  `explore-visual-ideas`, `compose-lockup` and `write-ad-creative` each self-check inline, leave `⚠️ CLAIM CHECK` /
  `⚠️ POLICY CHECK` flags, and (build-landing-page) write a provenance header, then forward-point to this
  skill. QA is invoked as the phase-4 step or on demand — **never called by a producer.** This is the
  decoupling that keeps the gate independent.
- `write-message` locks the key message, tagline and the text-free master visual QA checks drift
  against. Read-only here.
- `build-site` renders the report: writing `docs/qa-report.md` and rebuilding is the whole
  integration. QA triggers the build; it does not write `site/` itself.

Campaign paths and filenames follow `${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md`; that spec wins over any
path shorthand here. The concrete rule-by-rule matrix, severity rubric and report skeleton live in
[references/qa-checklist.md](references/qa-checklist.md) — **read it before judging.**

## Preconditions

Resolve the campaign, the manifest and the pack per `${CLAUDE_PLUGIN_ROOT}/schema/preflight.md`
**before** reading anything below. Everything you say out loud follows
`${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md`: engine words belong in the files, not in the
conversation — and this skill has more of them than any other, so it needs the rule most. QA reads
the whole artifact chain, so it is the skill most exposed to a chain that was never built:

- **No `system/manifest.yaml`** — there is no deliverable list to check against and no
  `campaign.brand` to resolve. Stop and route: to `write-brief` if the campaign folder exists, to
  `/halfborg-campaign:new-campaign` if it does not. Never QA a campaign by inferring what it ought to
  have contained.
- **No `brands/<id>/pack.yaml`, or a pack failing the skeleton check** — there is nothing to judge
  compliance against. Stop and route to `/halfborg-campaign:setup-brand`.
- **No `docs/brief.md`** — record it as a structural FAIL and continue; the message and pack still
  support most checks.
- **No `docs/message.md`** — do not fail. Note it and check against `brief.md` alone, with drift
  checks degraded to brief alignment, and say so in the report.

## 1. Read the inputs & set scope

1. **`campaigns/<slug>/system/manifest.yaml`** — read `campaign.brand`; that value **is the `<id>`**
   for the brand paths below, so read it rather than asking which brand this is
   (`${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md` section 1.1). Read every deliverable entry (asset ids,
   `pipeline` entries, `funnel_stage`, refs).
2. **`brands/<id>/pack.yaml`** — `mandatories`, `nogos`, each `products[].claims_allowed` (the
   **only** things a deliverable may assert about that product), `voice.summary`, `voice.spelling`,
   and `audience` pains/jobs. **Absent `mandatories` means unconfirmed, not none** — WARN and confirm,
   never assume the brand has no rules.
3. **`brands/<id>/design.md`** — the `colors` hexes and `typography.fontStacks` the applied text and
   graphics in visuals must trace to. Freeform prose past the frontmatter; read what is there, carry
   on past anything missing.
4. **`campaigns/<slug>/docs/message.md`** — the drift baseline. Pull the **key message**, the chosen
   **tagline**, and the `master_visual` block: `constants` (the anti-drift list), `locked_still` (the
   exact text-free anchor path), `palette`, `headline_lockup`, `subjects`. If `message.md` is missing,
   do not fail — note it and check against `brief.md` alone (drift checks degrade to brief alignment).
5. **`campaigns/<slug>/docs/brief.md`** — objective, audience, and the explicit out-of-scope list.
6. **`system/generation-log.jsonl`** and the files on disk — enumerate `content/*.md` and every file
   under `media/<id>/`. The log is the truth for status and provenance; the disk is the truth for
   what exists. Completeness is the reconciliation of the two.

**Scope.** Default is a **full-campaign** pass. If the invocation names a deliverable id or subset
(e.g. "QA the landing page"), run **scoped mode**: check only that deliverable, limit Family 1's
campaign-level completeness to it, and write the report as a scoped section rather than a
whole-campaign verdict. A scoped run never blocks the campaign for *other* deliverables being
incomplete.

## 2. Run the four check families

Work the matrix in [references/qa-checklist.md](references/qa-checklist.md). In brief:

- **Family 1 — Structure & completeness.** Manifest ids and registered pipeline sub-ids that have no
  artifact; media on disk with no `generate` line; ghost ids (a log `deliverable` that is not a
  manifest id, `key-visual`, or a registered sub-id); filename-grammar violations; nothing yet
  promoted to `final`. Agree with the site builder's Overview roll-up; if you disagree, re-read the log.
- **Family 2 — Copy & claims.** Over `content/*.md`, build-landing-page HTML and ad copy: every product
  claim within that product's `claims_allowed`; `mandatories` honoured and `nogos` absent; register
  vs `voice.summary`; spelling vs `voice.spelling`; no fabricated stat/quote/customer/URL. Read the
  landing page's provenance header rather than parsing claims out of markup. **Reconcile** every
  inline `⚠️ CLAIM CHECK` / `⚠️ POLICY CHECK` — clear it or escalate it, never duplicate or drop it.
- **Family 3 — Visual compliance** (no paid fal calls; all local reads). `Read` each shippable PNG.
  Judge the **photo** against `master_visual` (subject, palette description, lighting, composition,
  `constants`) and the **applied layers** (lockup headline, graphics, page chrome) against `design.md`
  tokens — because a photographic key visual is deliberately not recoloured to brand hues, hex/typeface
  checks apply to the applied text/graphics, not the photo pixels. Check `compose-lockup` output for
  locked-still fidelity (added headline, not a redrawn image) and headline spelling. Confirm the
  `key-visual` anchor is **text-free**. For each `.mp4`: `ffprobe` (stream present, duration ≈ intended,
  width×height match the intended resolution/ratio, audio if requested), then `ffmpeg` extract 1+
  sample frames to the **scratchpad** and `Read` them (right subject, on-brand, not black/garbled).
  Two traps: do not spelling-check `explore-visual-ideas` `idea` outputs (approximate in-image text by design),
  and if `ffmpeg`/`ffprobe` is absent, mark the clip **"unverified" (WARN)** rather than claim a check
  you did not run.
- **Family 4 — Message drift.** Every deliverable ladders up to the one key message; taglines are the
  chosen one (or a declared `tagline_variant`); the subject reads the same across assets; no two
  deliverables make incompatible promises; nothing contradicts the brief.

Give every artifact an explicit verdict — record PASS, not only failures. "Not checked" is never a
silent PASS.

## 3. Write docs/qa-report.md

Write the report to `campaigns/<slug>/docs/qa-report.md` using the skeleton in
[references/qa-checklist.md](references/qa-checklist.md): a summary pipe table (artifact · family ·
verdict · note), findings grouped FAIL then WARN, a terse Passed list, and an Open-claim-flags section
that carries `⚠️ CLAIM CHECK` lines through **verbatim** so the site builder surfaces them on Overview.
Each finding names **what · where (`file:path`) · which rule (the exact `mandatories` line,
`claims_allowed` entry, `design.md` token, or `master_visual.constants` clause) · a concrete proposed
fix** (the claim to swap, the corrected line, or a re-render note — proposed, never applied).

The overall **gate verdict** rolls up: any open FAIL → **blocked**; no FAIL but open WARNs →
**fix-then-ship**; clean → **ship**. Even a clean verdict is advisory — a human signs off before
anything is published.

Cite only real on-disk paths and real sampled values. Never invent a hex, a claim allowance, a cost,
or a PASS you did not derive from the artifact — the same "never fabricate" rule the render skills follow.

## 4. Rebuild the site

`docs/qa-report.md` lives in `docs/`, which is **not** filename-versioned — it is edited in place and
git carries its history, exactly like `brief.md` and `message.md`. Consistent with those gate docs, the
report needs no `generate` log line to appear; the **QA section is already covered** by
`build-site` and picks up `docs/qa-report.md` directly. Optionally append one `note` event so
the QA run shows in the chronology (`{"event":"note","skill":"run-qa","deliverable":"<scope>","notes":"QA pass: <verdict>"}`).
Then rebuild the page once — follow `build-site` for `campaigns/<slug>`.

Then report to the user, per `${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md` sections 5 and 6. The
report file keeps `PASS` / `WARN` / `FAIL` and the verdict words exactly; **the conversation does
not.** Say:

- **where the campaign stands**, in their words — clean; worth a look; or needs fixing before it goes
  out;
- **how many of each**, as a count of things to fix and things to look at;
- **the two or three findings that actually matter**, each in a sentence: what is wrong, in which
  piece, and the fix you propose;
- **one path** — the report, in full, for the rest of the list;
- **that you have changed nothing.** Say it plainly and say why: you check, you do not edit.

**Then end on a next action.** You are routing, not repairing: offer to hand the top finding back to
be redone — named as the work ("want me to get that email rewritten first?"), not as a skill — and to
run this check again once fixes have landed. Naming who fixes it and offering to start them off is
still QA proposing. Do not edit an artifact here, and do not re-run until a fix has actually landed.

## Degradation

| Missing | Do |
|---|---|
| `message.md` | Check against `brief.md` alone; note that drift checks are limited. Never skip silently. |
| `design.md` | Skip the typeface/hex traces with a note; still run `master_visual.constants` visual checks. |
| `mandatories` | Unconfirmed, not none. WARN and ask, rather than passing the campaign as clean. |
| `ffprobe` / `ffmpeg` | Mark each video "unverified" (WARN) in the report. Out loud: you could not open the clips to check them. Never claim a video check you did not run. |
| no media yet | Run Families 1, 2 and 4; note that there were no pictures or clips to look at yet. |
| a legacy campaign (no `system/`) | The build script cannot read this campaign's layout. Say that plainly, offer to bring it up to date (the migration recipe in `campaign-structure.md` section 7), and do not QA a layout the log contract does not cover. |

## House rules

- **QA is independent and it proposes; it does not produce or apply.** No expander invokes it; it never
  edits an artifact. Every finding carries a proposed fix, and the producing skill acts on it.
- **The pack and the message are the source of truth.** A finding cites a specific rule — a
  `mandatories` line, a `claims_allowed` entry, a `design.md` token, a `master_visual.constants` clause.
  A finding with no rule behind it is an opinion, not a QA finding; drop it or mark it a nudge.
- **Judge the photo by the message, the applied text by the design tokens.** Do not fault a
  natural-coloured key visual for lacking a brand hex.
- **Reconcile the inline flags, never duplicate them.** Every `⚠️ CLAIM CHECK` / `⚠️ POLICY CHECK` the
  expanders left is either cleared with its allowance or escalated; carry the open ones through verbatim.
- **Never fabricate.** Only real paths, real sampled values, real costs. No invented hex, allowance, or PASS.
- **Absent `mandatories` is unconfirmed, not none.** Confirm rather than assume.
- **The report is a file; the summary is a conversation.** `PASS` / `WARN` / `FAIL`, the verdict
  words and the rule citations stay exact inside `qa-report.md`, because the site builder and the
  next QA pass read them. Out loud, follow `${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md`: what is
  wrong, in which piece, and what you would do about it.
- British spelling, reduce em dashes, no phrasing that reads as AI-generated.
