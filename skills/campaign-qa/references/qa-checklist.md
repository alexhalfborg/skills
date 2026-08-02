# QA checklist — the concrete check matrix

`campaign-qa` reads this before judging. It is the brand-agnostic rubric: the four check families,
the exact rule each check tests, the severity it carries, and the shape of a finding. The SKILL.md
owns the workflow (what to read, scope, how to write the report); this file owns *what a violation
is*. Where a brand's own `mandatories`, `nogos`, `claims_allowed`, `design.md` tokens or
`master_visual.constants` say something stricter, the brand wins — this rubric never overrides a
pack rule, it applies it.

## Severity rubric

Every finding is one of three:

- **FAIL** — ships a real problem: an unpermitted product claim, a `nogo` breach, a mandatory not
  honoured, a design-token or `master_visual.constants` violation in a shippable visual, a manifest
  deliverable with no artifact, a fabricated link/stat. A campaign with any open FAIL is **blocked**.
- **WARN** — a drift or gap that a human should see but that does not by itself block: a soft voice
  or register mismatch, an unlogged working file, a thin-pack gap that forced a guess, a video that
  could not be verified because `ffmpeg` is absent, nothing yet promoted to `final`.
- **PASS** — checked and clean. Record PASS explicitly for each artifact so the report shows what was
  inspected, not only what failed. "Not checked" is never silently a PASS.

Overall gate verdict rolls up: any open FAIL → **blocked**; no FAIL but open WARNs → **fix-then-ship**;
clean → **ship** (still advisory — a human signs off before anything is published).

Every finding, whatever the family, names four things: **what** (the defect in one line), **where**
(`file:path`, and line/section where it helps), **which rule** (the exact `pack.mandatories` line,
`claims_allowed` entry, `design.md` token, or `master_visual.constants` clause it breaks), and a
**proposed fix** (a concrete edit, corrected line, or re-render note — never applied, only proposed).

---

## Family 1 — Structure & completeness

Checked against `system/manifest.yaml`, `system/generation-log.jsonl`, and the files on disk under
`media/` and `content/`. In **scoped mode** these are limited to the named deliverable; a scoped run
does not FAIL the campaign for other deliverables being incomplete.

| Check | Rule | Severity if broken |
|---|---|---|
| Manifest fulfilment | Every `kind: asset` manifest id has at least one artifact (media file or `content/<id>.md`). An asset id names its own artifact directly, so a missing one is a hard gap. | FAIL (missing deliverable) |
| Pipeline fulfilment | Every `register`ed pipeline sub-id that is expected to ship has an artifact on disk. A sub-id that is only *registered* — its concept locked in the parent pipeline's doc — with no media is **concepted, not produced**. | WARN by default; FAIL only if the campaign is being signed off as complete-in-full; WARN if working iterations exist but none is `final` |
| No ghost ids | Every `generate`/`status` log `deliverable` is a manifest id, `key-visual`, or a registered sub-id. | FAIL (log integrity) |
| No unlogged media | Every file under `media/<id>/` (except a clearly-marked `_ref-*` input) has a `generate` line. | WARN (traceability) |
| Reference inputs | An `_ref-*` source image used by a render is either logged or explicitly noted as a supplied input. | WARN |
| Filename grammar | Media filenames match `<id>[-role][-seq][-ratio]-v<NN>.<ext>` (`campaign-structure.md` §3). | WARN |
| Version integrity | No overwritten versions; a re-roll is a new `v<NN>`. (A gap in the log where a file exists but has no birth `generate` is the signal.) | WARN |
| Ship status | Anything presented/described as shipped has a `status: final` (or `locked` for anchors) event. | WARN if nothing is `final`; FAIL if a doc names a file as final that the log never promoted |

**Completeness severity, and reading the Overview roll-up.** The distinction that decides the gate: a
manifest **asset** id with no artifact is FAIL (it names its own artifact); a pipeline **sub-id** with
a locked concept in the parent's doc but no media is WARN — *name the fork explicitly* in the finding,
because it hardens to FAIL the moment the user treats the campaign as ready to ship in full. Do not
duplicate the site builder's Overview roll-up; **agree with it** — but know it counts `generate`
events per id, so a `register`-only sub-id shows 0 artifacts even though its concept exists in prose.
Do not misread that 0 as "nothing was done". If your completeness count disagrees with
`site/index.html`, re-read the log — the log is the truth.

---

## Family 2 — Copy & claims

Checked over `content/*.md`, any `media/*/*.html` (landing pages), and ad copy. Read the pack's
`products[].claims_allowed`, `mandatories`, `nogos`, `voice.summary`, `voice.spelling`.

| Check | Rule | Severity if broken |
|---|---|---|
| Claims within allowance | Every assertion about a product is covered by that product's `claims_allowed`. Nothing stronger. | FAIL |
| Provenance header | For a landing page, read its HTML provenance-comment (claim → `claims_allowed` entry). Reconcile it against the visible copy; a claim in the body but not the header, or a header claim with no allowance, is a finding. | FAIL (unpermitted) / WARN (header out of sync) |
| Mandatories honoured | Every `pack.mandatories` line is satisfied wherever it applies (e.g. a required disclaimer, an approval step, an escalation qualifier). Absent `mandatories` = **unconfirmed, not none** — WARN and ask, never assume clean. | FAIL (breach) / WARN (unconfirmed) |
| No-gos absent | No copy does anything on `pack.nogos` (e.g. cure/guarantee language, hype, competitor knocks). | FAIL |
| Voice register | Body copy under a byline matches `voice.summary` and the routed voice skill's register. A plainly off-voice piece is a finding; a slightly stiff one is a nudge. | WARN |
| Spelling convention | Spelling matches `voice.spelling` (e.g. UK). House rule: British spelling, reduced em dashes, no AI-tell phrasing. | WARN |
| No fabrication | No invented statistic, study, quote, customer, product, mechanism, or URL. An unmarked claim that should carry a source is a finding; a clearly-marked `[STAT/SOURCE: …]` / `[URL-needed]` placeholder is not (it is honest, but flag it as unfinished). | FAIL (fabrication) / WARN (open placeholder) |
| Flag reconciliation | Resolve every inline `⚠️ CLAIM CHECK` / `⚠️ POLICY CHECK` the expander skills left: confirm it is now cleared (with the allowance that clears it) or escalate it as an open FAIL/WARN. **Do not re-raise a flag as if new; do not drop one.** | matches the underlying issue |

---

## Family 3 — Visual compliance

Checked over the shippable images and videos under `media/<id>/`. No paid model calls — read the
local file. Read `brands/<id>/design.md` (the `colors` hexes and `typography.fontStacks`) and
`message.md` `master_visual` (`constants`, `locked_still`, `palette`, `headline_lockup`, `subjects`).

**The photo-vs-layer distinction is the whole game.** A photographic key visual is deliberately
**not** recoloured to brand hues — `master_visual.palette` says so. So do not fault a photo for
lacking `#6B5B95`. Hex and typeface checks apply to the **applied layers**: a `compose-lockup`
headline, a graphic/badge, page chrome, a caption. Judge the *photo* against `master_visual`
(subject, palette description, lighting, composition, `constants`); judge the *applied text/graphics*
against `design.md` tokens.

| Check | Applies to | Rule | Severity if broken |
|---|---|---|---|
| Anti-drift constants | every visual derived from the anchor | Honours each `master_visual.constants` clause (e.g. subject stays as defined, no recolouring of a natural-coloured product, no letterboxing, anchor stays text-free). | FAIL |
| Subject fidelity | statics, video frames | The recurring subject matches `master_visual.subjects[].definition` — not redrawn, not drifted (a character/product matches across assets). | FAIL (visible drift) / WARN (minor) |
| Locked-still fidelity | `compose-lockup` output | The composed static preserves the locked still's subject, palette and composition; the headline was **added**, the image not **redrawn**. | FAIL if redrawn |
| Typeface trace | applied text (lockups, page chrome) | The typeface reads as the brand display/body face from `design.md` `typography.fontStacks` (or an acceptable same-character substitute, which must be noted, not silent). | WARN |
| Colour trace | applied text/graphics | Laid-on text and graphic colours trace to `design.md` `colors` hexes. | WARN |
| Headline correctness | `compose-lockup` output | The headline is spelled exactly right, in the brand typeface character and an on-palette colour, legibly placed. | FAIL (misspelled/garbled) / WARN (placement) |
| Text-free anchor | `key-visual` locked still | The locked master visual carries no baked headline/logo/tagline. A titled anchor is a defect. | FAIL |
| Video technical | `.mp4` deliverables | `ffprobe`: a video stream present, duration ≈ intended, width×height match the intended resolution/ratio, an audio stream if audio was requested, non-trivial file size. | FAIL (wrong spec) |
| Video content | `.mp4` deliverables | Extract 1+ sample frames to the **scratchpad**, `Read` them: right subject, on-brand, not a black/garbled frame; for multi-shot, the cuts are actually present. | FAIL (garbled) / WARN (soft) |

**Three do-not traps.** (1) `visual-ideas` outputs (role `idea`) carry *approximate* in-image text by
design — **do not spelling-check them**; they are ideation, not production. Check them only for gross
subject drift, and only if they are being treated as shippable. (2) If `ffprobe`/`ffmpeg` is absent,
mark the clip **"unverified" (WARN)** — never claim a video check you did not run. (3) A raw render
mid-pipeline may intentionally lack burned-in captions, music, or an end-card — the ads pipeline
finishes those in a later editing pass. Check the render for subject / brand / technical correctness;
do not FAIL it for a missing caption or silent audio unless the deliverable is declared the finished ad
(then a missing end-card or required caption is a real gap). WARN it as a working cut instead.

---

## Family 4 — Message drift & consistency

Checked across every artifact against `docs/message.md`. This is the cross-artifact family that a
single expander could never run, and the reason QA is a campaign-level phase.

| Check | Rule | Severity if broken |
|---|---|---|
| Key-message ladder | Every deliverable ladders up to the one `message.md` key message. A piece that argues a different promise is drift. | FAIL (contradicts) / WARN (tangential) |
| Tagline consistency | Where a deliverable uses the campaign tagline, it is the **chosen** tagline from `message.md`, not a considered-but-rejected variant or an ad-libbed reword (allow declared per-deliverable `tagline_variant`). | WARN |
| Cross-asset subject | The subject/character reads the same across statics, video and page (all bind to `master_visual.subjects`), not reinvented per asset. | WARN (also seen in Family 3) |
| No internal contradiction | No two deliverables make incompatible promises (price, offer, timeline, audience). | FAIL |
| Brief alignment | Nothing contradicts the `brief.md` objective, audience, or explicit out-of-scope list. | WARN |

---

## Report skeleton

Write `docs/qa-report.md` as markdown the site builder renders (`#`–`####`, `**bold**`, `>` quotes,
fenced code, and **GitHub pipe tables** with a `|---|` separator row). Suggested shape:

```
# QA report — <campaign name>

- Scope: full campaign  |  deliverable <id>
- Verdict: ship | fix-then-ship | blocked
- Date: <YYYY-MM-DD>

## Summary
<one pipe table: artifact | family | verdict | note>

## Findings
### FAIL
<each: what · where (file:path) · rule · proposed fix>
### WARN
<each: same shape>

## Passed
<terse list of artifacts checked and clean, by family>

## Open claim flags
<carry ⚠️ CLAIM CHECK lines through verbatim so Overview surfaces them>
```

Carry `⚠️ CLAIM CHECK` lines through **verbatim** — the site builder greps them onto the Overview
claim strip. Cite only real on-disk paths and real sampled values; never invent a hex, a claim
allowance, or a PASS you did not derive from the artifact.
