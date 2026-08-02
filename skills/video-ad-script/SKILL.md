---
name: video-ad-script
description: >-
  Expand a locked video ad concept into a production-ready script, then into the
  video generation prompt that renders it. Use whenever the user has a video ad
  concept (from ad-creative or written by hand) and asks to script it, write the
  script, turn the concept into a script, or draft the shooting/voiceover script.
  Trigger on phrases like "script this video ad", "write the script for [AD-ID]",
  "turn this concept into a shooting script", "draft the AV script", "write the
  script and prompt for [AD-ID]". Produces a timed two-column audio/video script
  with a shot grammar, gates on human approval, prepares the identity reference kit
  the prompt binds to (delegating any gaps to reference-kit), then appends one
  ready-to-render video generation prompt per segment (authored by
  ai-image-video-prompt-builder's video track). Reads the brand pack only to route
  first-person voice. Do NOT
  use to invent a concept from scratch (use ad-creative first); to script a static
  or carousel concept (ad-creative for the copy, visual-ideas for directions,
  compose-lockup for the finished static); or to RENDER the clip (generate-video).
---

# Video Ad Script

Take one locked video concept and expand it into a script someone can produce
from, then into the prompt that generates it. The concept already carries the
spine (Hook, Build, Payoff, Direct) and seed copy (on-screen text, a voiceover
note, visual notes). This skill sequences and times that material into the actual
ad, and hands the render step a prompt built from the script's own shot grammar.
It does not re-decide strategy, and it does not render.

This is step 2 of the campaign engine's ads pipeline: `ad-creative` →
**`video-ad-script`** → `generate-video`, with `reference-kit` filling any
identity-reference gaps between the approved script and the render.

## Inputs

- **A video concept block** (the output of `ad-creative`, or an equivalent the
  user supplies). It tells you the stage, format, the four functions, and whether
  the ad uses the brand voice.
- **The target model.** The script's segment count depends on the model's
  duration cap, and the prompt's whole shape depends on whether the model is
  single-take or multi-shot. Settle this once, here, before writing anything.
  Default to `generate-video`'s default,
  `bytedance/seedance-2.0/reference-to-video` (multi-shot, 15-second cap, takes
  identity references rather than a start frame), and say that you have.
- **The brand pack** (`brands/<id>/pack.yaml`), but only if the concept's Voice is
  Yes. Resolve `<id>` from `campaign.brand` in `campaigns/<slug>/system/manifest.yaml`
  rather than asking (`${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md` section 1.1).
  You need the voice skill named in `voice.skills` to write first-person
  lines, and `ads.presenter` to know whether that person may be shown. If Voice is
  Yes and you cannot identify the voice skill, ask before writing those lines. If
  Voice is No, you do not need the pack.

If no concept is provided, do not invent one. Ask for it, or point the user to
`ad-creative`.

## Video only

Check the concept's format before writing anything. A static or carousel concept
has no time axis, no shots, and no clip to generate, so it does not belong here.
Say so in one line and route it: `ad-creative` already wrote its copy,
`visual-ideas` explores rough visual directions, and `compose-lockup` produces
the finished headline-on-image static. Do not build a timed table for it, and do
not improvise a copy breakdown.

## Step A: the script

Video plays the four functions out in time, so the script is a timed table with
audio against video. Produce:

```
## [AD-ID] script — v1
Source concept: [AD-ID] · [Stage] · [format]    Status: Script
Runtime target: [from the concept's format spec]
Target model: [model id] · [single-take | multi-shot] · [duration cap]
Segments: [how many generations, and why — one unless the runtime exceeds the model's cap]
Aspect: 9:16 · captions burned in · sound-off safe
Voice: [Yes/No — restate the concept's justification]
Hook must land by: 0:03
```

| Time | Audio (VO / SFX / music) | Video (shot, action, framing) | On-screen text |
|------|--------------------------|-------------------------------|----------------|
| 0:00-0:03 | hook VO if Voice:Yes | size, angle, camera, what we see | the hook line, big |
| ... | ... | ... | ... |

```
Caption (post text): [the build]
CTA / destination: [from the concept]
```

**Segment awareness.** A **segment** is one generation, and its length is set by
the target model you settled on above. Older tools generate roughly 5 to 8
seconds per prompt and cannot cut, so each shot is its own segment. Current
multi-shot models generate a whole sequence, cuts included, in one prompt:
Seedance 2.0 runs to 15 seconds.

Write the ad as **one segment** whenever it fits under the cap. Split it only
when it does not, and split at a beat boundary, never mid-thought. Two segments
are two independent generations, so they will drift from each other even with
shared references; prefer a hard cut at the seam over a match cut that will not
match.

Set the table's time blocks to the **shots**, and note which segment each shot
belongs to. Shots are exactly what they sound like: today's models take
direction on framing, angle and camera movement, so name them.

**Voice routing.** Write a short routing note under the table:
- First-person experiential lines: run through the voice skill named in the pack's
  `voice.skills` before locking.
- Product-fact, price, and proof lines: not the brand voice; write directly.

## Character / subject consistency (conditional)

This applies only when a concept commits to a **recurring subject** within an ad
(a person, character, or object that must look the same across shots) **and**
the ad has more than a couple of shots. A 2-shot ad does not need this; a 6-shot
narrative does. Skip it entirely when there is no recurring subject.

The script cannot guarantee visual consistency. It produces text; the pixels come
later from the prompt and the generation tool. What the script does is make
consistency *possible* downstream by defining the subject once, unambiguously.
The drift mechanism is the reason: any variation in how the subject is worded
produces a different result, and independent generations drift even from identical
wording. Re-describing the subject in each shot row is the single biggest cause of
a character changing across an ad.

**Author the subject; do not ask for it.** The concept's visual notes already
chose the subject. Draft its definition from them and present it to lock. Do not
block on a question, and do not ask for a reference image (that is a downstream
artifact). The only time to ask is when the subject is an *existing* named
entity whose definition is nowhere available, since authoring one would
fabricate or mismatch an asset that already exists.

**Define once, at the top of the script, and reference by ID.** Separate what
must hold from what is meant to change. The second half is an obligation, not a
menu: these are the things that make one shot different from the next, and a
script that leaves them constant produces an ad in which every cut lands on the
same picture.

```
Subject: CHAR-1
Identity invariants (must never drift): identity / face, hair, build, age range,
  wardrobe, hero-object material and form, colour palette
Scene variables (must change across shots): shot size, camera angle, camera move,
  subject action, background element
```

Then each shot row references the ID and carries its grammar, e.g. "CHAR-1,
wide, low angle, slow drift in, looking away", never a fresh prose description
of appearance.

**A single generation does not hold an un-referenced subject together.** The most
tempting wrong turn here is to reason "the ad is one generation, so the character
stays consistent within it, no reference needed." That is false, and it is the exact
mistake that ships a drifting ad. Under reference-to-video, identity comes from a
**reference**, not from sharing one generation: a recurring subject the prompt never
hands a reference for is re-invented at every internal cut, so a face, hair or
wardrobe wanders across the shots. "One segment" decides how many *generations* you
run; it says nothing about whether a subject is *anchored*. Anchoring is the job of
the reference kit below.

**The subject-coverage test (run it before you write REUSE).** For every recurring
subject that appears in **two or more shots**, ask one question: does the asset you
are about to REUSE actually *contain that subject's identity-defining features*? A
product-led master visual that shows only hands does **not** contain a face, hair or
wardrobe. If the subject shows features the candidate asset lacks, it is **not
covered** — do not paper over the gap by pointing `@Image1` at the anchor and hoping.
Two honest outcomes:

- **Route it to `campaign-message`.** If the uncovered subject belongs in the
  campaign (a faced protagonist a Reach reel wants), say the master visual should be
  re-locked to add that subject and lock its per-subject still
  (`media/key-visual/key-visual-<subject-id>-v01.png`). That still then becomes a
  REUSE. A recurring character the master visual never locked is never the kit's to
  invent.
- **Pull the shots back.** If the subject should not really be in the ad, rewrite the
  shots to what the anchor covers (e.g. hands and forearms only, product-led), so
  there is nothing un-anchored to drift.

**Declare the reference kit; do not render it in step A.** A reference-to-video
model binds a small set of **identity references** — stills that say what the
subject *looks like*, not start frames. So under the subject definition, enumerate
each `@ImageN` the prompt will need and map each to one of:

- **REUSE** — an asset that already exists **and that covers the feature it stands
  for** (per the coverage test above): `message.md`'s `master_visual.locked_still`, a
  per-subject `media/key-visual/key-visual-<subject-id>-v01.png`, a real product photo
  from the pack, or an earlier locked render under `media/`. Name its exact path.
- **GENERATE** — a genuine gap: an identity the prompt needs that no existing asset
  supplies (an ad-scoped prop, insert, or setting).

**Every recurring faced subject earns its own reference.** The kit an ad with a
recurring person needs is **not one image**. At minimum it lists the master still (for
scene, palette and lighting), that subject's own identity still (face, hair, build,
wardrobe), and the real product photo when a hero SKU must match. A `REFERENCES`
block that names a single `@Image1` for an ad with a recurring faced subject is the
failure this whole section exists to prevent — treat it as a defect, not a shortcut.

Do not render anything here, and do not flag a GENERATE gap as a `generate-image`
"start frame" — that conflates two different things, and `generate-video` forbids a
start frame for the reference-to-video model. Identity references are produced after
approval by `reference-kit` (below); step A only declares what the kit must contain.
A GENERATE gap that is a **recurring character** the master visual never locked is
not the kit's to invent: say the master visual should be re-locked in
`campaign-message` to add that subject.

## Cut variety (3+ shots)

A sequence of shots that all sit at the same distance, from the same angle, on a
locked-off camera is not an edit. It is one picture, four times. The script is
where that is prevented, because the script is what decides what we see.

**Shot grammar.** Each shot declares three axes:

- **size** — ECU / CU / MS / WS
- **angle** — overhead / eye-level / low / high three-quarter / profile
- **camera** — locked-off / slow drift / push-in / pull-back / tilt / rack focus

**The contrast rule.** Adjacent shots must differ on **at least two of the three
axes**, and no two shots in the ad may share the same size + angle pair. A
deliberate bookend or visual rhyme may repeat a framing, but say in one line
that it is intentional, so a reader can tell craft from carelessness.

**Insert shots.** Any sequence of four or more shots carries at least one
**insert**: a detail of the world rather than another framing of the subject. An
object, a texture, a light. Inserts are what give an edit its rhythm, they carry
no subject-drift risk because the recurring subject is not in frame, and the
best ones illustrate the line of voiceover they sit under.

**Fidelity.** When a hero object must match a real reference, keep camera moves
slow and single-vector, and do not stack a move onto a size change onto an angle
change in one shot. Variety comes from cutting between shots, not from doing
everything at once inside one.

**Pre-lock self-check.** Before stamping `Status: Script`, emit the grammar as a
table and confirm the rule passes:

```
| Shot | Segment | Size | Angle | Camera | Insert? |
```

A script that cannot show this table does not lock. If two adjacent shots differ
on only one axis, fix the script rather than the table.

## The gate

Write the script to `campaigns/<slug>/content/<pipeline-id>-scripts.md` (or
`content/<ad-id>-script.md` for a single ad scripted on its own), mark it
`Status: Script`, log the doc with a `generate` event, and rebuild the site, per
the log step in `${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md`.

**Then present it and stop.** Do not write the generation prompt for a script the
user has not approved. Prompt work done against a script that still changes is
thrown away, and a prompt sitting under an unapproved script reads as though the
script were settled. Tell the user the script is ready to lock, and that the
generation prompt is the next step once they approve it.

## Reference kit (after approval, before the prompt)

The video prompt cites each reference by an exact `@ImageN` file path, so the
references must exist before you write it. Once the script is approved, resolve the
reference kit you declared in step A:

- **REUSE** entries need no work — carry their exact paths forward.
- **GENERATE** gaps: invoke `reference-kit` (via the Skill tool) for the ad. It
  derives each missing identity still off the locked master visual, critiques it for
  on-model consistency, locks it, and hands back its exact versioned path (e.g.
  `media/<ad-id>/<ad-id>-ref-<slug>-v01.png`). It is reuse-first, so it may report
  that no generation was needed.

`reference-kit` inherits this skill's guardrails: it renders no real, named person's
face barred by `ads.presenter`, and it will route a missing **recurring character**
back to `campaign-message` rather than invent one.

**Offline:** if the fal MCP is down, `reference-kit` renders nothing and hands back
the reference prompts and reused paths. Write the video prompt against the **planned**
paths and flag each unrendered reference as a dependency; `generate-video` lists them
in its own offline hand-back.

## Step B: the generation prompt (after approval)

Once the user approves the script and the reference kit is resolved, write one video
prompt per **segment**, which for a multi-shot model may cover the whole ad.

**Do not author prompt craft here.** Invoke `ai-image-video-prompt-builder` (its
video track) via the Skill tool, once per segment. That skill owns the single-take
versus multi-shot rules, the `@ImageN` reference convention, the `AUDIO:`
contract, and the output template. Feed it, from the script:

- the target model, the aspect ratio, and the seconds budgeted to this segment
- the subject definition and its `CHAR-n` ID, verbatim, invariants included
- this segment's shot rows, in order: size, angle, camera, action
- the audio decision (below)
- the reference image(s) this segment binds to, with their file paths

Two seams break most often, so state both when you hand off:

1. **The `AUDIO:` line is mandatory** for an audio-capable model. `generate-video`
   reads it to set `generate_audio`, and will otherwise raise it at the cost gate.
   A concept whose Voice is No, with the voiceover laid on in the edit, is
   `AUDIO: none` — say that plainly rather than omitting the line. Audio-on
   synthesises speech, so a guess can put words in a real person's mouth.
2. **References carry identity, not composition.** Each reference still is a
   `@ImageN` handle, and pass order is what binds a file to its handle. Every
   reference the prompt uses must be named in the prompt text with its role
   stated, and listed under `REFERENCES (in pass order)`. The **resolved reference
   kit** supplies the exact locked paths — the REUSE paths and the ones
   `reference-kit` just generated and locked; list them in the order the prompt
   cites them. Only if a gap could not be rendered (offline) do you cite its
   planned path and flag it as a dependency, rather than a path that is not there.

Append the returned block(s) **verbatim** to the same scripts doc, under:

```
## Generation prompts

### Segment 1
[the builder's TITLE / PROMPT / AUDIO / REFERENCES / EXCLUSIONS / NOTES block]
```

Then re-log the doc with an `iteration` status and rebuild the site.

End by telling the user the prompt is ready to render, and that `generate-video`
is the next step: it will show a cost estimate and gate before it spends.

Image prompts (a reference still, a thumbnail) are a separate artifact. They come
from `ai-image-video-prompt-builder`'s image track and land in
`content/<pipeline-id>-prompts.md` or per-ad `content/<ad-id>-prompts.md`, logged
the same way.

## Visual-direction guardrail

Scripting adds detail to the concept's visuals and on-screen text, so it is where
rejection-risk imagery quietly creeps in. When you write the video column, image
direction, or on-screen text:

- Carry any `⚠️ CLAIM CHECK` or `⚠️ POLICY CHECK` flag from the source concept forward
  into the script; do not silently drop or "fix" it. If your own added detail creates a
  new risk, add a fresh flag.

Carry those flags into the generation prompt and the reference-kit declaration too, and
honour the pack's `mandatories` and `nogos` throughout. Never render a photoreal
synthetic face as a real, named person — in a clip **or** a reference still: if
`ads.presenter` is `founder-voice-only`, that person's real voice carries the
first-person lines and is never generated as a face.

## House rules

British spelling. No em dashes. Avoid AI clichés. Keep first-person copy in the
brand voice; keep product-fact copy plain.
