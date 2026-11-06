# QA checklist — the concrete check matrix

`run-qa` reads this before judging. It is the brand-agnostic rubric: the four check families,
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
| No unlogged media | Every file under `media/<id>/` (except a clearly-marked `_ref-*` input, and the contents of an `edit-talking-head` edit folder `media/<id>/<id>-edit/`, which is a working folder per `campaign-structure.md` §3.1) has a `generate` line. | WARN (traceability) |
| Stock provenance | Every `generate` line with a stock `source` (`pexels`, `pixabay`, or any other library) carries `credit` and `source_url`. | FAIL (cannot be credited or licence-checked) |
| Source-image licence | Every `generate` line with `"source":"reference"` carries `credit`, `source_url` and `licence`, and the `licence` is public domain, CC0, CC BY or the UK OGL (`edit-talking-head` `broll-rules.md` §3.2). Open `source_url` if you can and confirm the page still states that licence for the image. | FAIL (missing, or a licence that does not allow the use) / WARN (page could not be opened to re-check) |
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
| Social: caption limits | For a social post (`content/<id>.md` with `platform:` frontmatter), the text inside the `## Caption` fence, **measured with a tool**, is within `schema/social-platforms.md`'s limits for that platform: length (characters on Instagram, UTF-8 bytes on Threads), hashtags, links and @mentions. | FAIL (over a hard limit) |
| Social: caption ready | No unfilled placeholder (`[URL-needed]`, `[STAT/SOURCE: …]`, `[PRICE-needed]`) and no `⚠️` flag inside the caption fence. A flag outside the fence is reconciled as above. | FAIL (placeholder or flag that would be posted) |
| Social: hashtag rules | **Instagram:** every `pack.social.hashtags.always` tag is present; no `pack.social.hashtags.never` tag is. **Threads:** no `#word` anywhere in the text (the first would silently become the post's tag), at most one `topic_tag`, valid per `social-platforms.md` §3.4, and not a `never` tag; `always` tags do not apply, since Threads allows one tag. A pack with no `social.hashtags` has nothing to check for the brand rules; say so rather than passing it silently. | FAIL (a `never` tag, a hashtag in Threads text, an invalid or second tag) / WARN (an Instagram `always` tag missing) |
| Social: opening line | The opening line works on its own in the feed (on Instagram, before the "…more" cut at about the first 125 characters, a display behaviour, not an API rule) and does not open on hashtags. | WARN |
| Social: alt text | Every picture in the frontmatter's `media` has alt text within the limit, describing the picture rather than repeating the caption. | WARN (missing or a second caption) / FAIL (over the limit) |
| Social: account | The frontmatter's `account` matches the pack's handle for its platform (`social.instagram`, `social.threads`). Empty or absent handle means it cannot be posted from the engine yet. | WARN |

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
| Stock faces | talking-head shorts with `broll` cutaways | Sample a frame inside each cutaway's beat (times are in `content/<id>-broll-plan.md`). A recognisable person in stock footage on a **paid** short implies an endorsement neither stock licence allows (Pexels forbids it outright, Pixabay forbids misleading use), with no model release guaranteed. On an organic short it is a finding only when the words under it make a claim. | FAIL (paid) / WARN (organic, under a claim) |
| Source-image credit on screen | talking-head shorts with a `"source":"reference"` cutaway | Extract a frame near the start and near the end of its beat. Its logged `credit` is on screen in both, word for word, whole, readable, inside the 4:5 band (y 285 to 1635). | FAIL (missing, cut off or different) |
| Caption spelling | talking-head shorts | Burned-in captions spell the brand and every product name exactly as the pack does. Sample frames where those names are spoken. | FAIL (brand or product misspelled) / WARN (other word) |
| Social: picture spec | each picture a social post's frontmatter lists | Exists; the platform's format (JPEG for Instagram); within the file-size and width limits; aspect inside the feed range; per `schema/social-platforms.md`, read with `ffprobe` and the file size. A JPEG copy is checked as posted, its render as the art. | FAIL (would be rejected: wrong format, over size, out of range, missing) |
| Social: one shape | carousel posts | Every slide has the same aspect ratio, since the platform crops all slides to the first. Slide count within the platform's carousel limit. | FAIL |
| Social: copy matches render | each `"source":"derived"` JPEG | Its `refs[0]` render exists and is the latest version of that slide; a copy made from a superseded render is stale. | WARN |

**Three do-not traps.** (1) `explore-visual-ideas` outputs (role `idea`) carry *approximate* in-image text by
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
