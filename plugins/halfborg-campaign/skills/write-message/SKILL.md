---
name: write-message
description: >
  Create the creative message of a campaign: the key message, tagline options, and the master visual
  concept. Read the brand pack and the approved brief, then write message.md, the single source every
  deliverable expander draws on for what to say and how it should look. Use this after the brief is
  approved, whenever the user says write the key message, come up with taglines, define the visual
  concept. This is the last human-gated phase: present message, tagline options, and 2-3 rendered visual directions, get the user to pick a tagline and pick one direction, then render and lock the chosen master visual as the campaign's anchor still and write message.md. It renders and locks that master-visual still (a reference anchor), but does NOT produce channel deliverables (no reels, ads, blogs); the expanders do that from message.md and the locked still. Do not use to set strategy or scope (that is campaign-brief).
---

# Campaign Message

You are running phase 2, the creative gate. It answers "is this the right creative expression of
the campaign", where the brief already answered "is this the right campaign". You produce three
things in `docs/message.md` — the key message, tagline options, and the master visual concept — plus one
rendered, locked master-visual still in `media/key-visual/` and a paste-able render prompt inside
`message.md`. This is the artifact every downstream expander reads, so its precision decides whether the
campaign holds together or drifts. It runs foreground, with the user in the loop.

Campaign paths and filenames follow `${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md`; that spec wins over any
path shorthand here.

## Preconditions

The full resolution and routing contract is `${CLAUDE_PLUGIN_ROOT}/schema/preflight.md`. Everything
you say out loud follows `${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md`: engine words belong in the
files, not in the conversation. The specifics for this phase:

- You need the brand pack and an approved `docs/brief.md`. If they are not already in context (a
  cold start in a fresh conversation), resolve them from files rather than asking: read
  `campaign.brand` from `campaigns/<slug>/system/manifest.yaml` — which `campaign-brief` has written
  by the time you run — and load `brands/<brand-id>/pack.yaml`
  (`${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md` section 1.1).
- If the brief is missing or not signed off, do not proceed. Run campaign-brief first.
- Read both. The brief's "message intent" is your brief for the key message. The pack's voice and
  claims bound what you can say. Do not contradict either.
- Rendering the candidate visuals needs the `fal-ai` MCP (via `generate-image`). If it is connected,
  render the candidates; **if it is not, do not block the phase** — author the spec and the paste-able
  prompt, present the directions as written descriptions, leave `locked_still` pending, and tell the
  user in plain words that image generation is not connected here, so they can pick a direction now
  and you will make the actual picture once it is. Never say "mint", "anchor still" or "MCP" out
  loud. The message, tagline and concept gate all still run without rendering.
  `media/key-visual/` is created on the first render; it need not exist beforehand.

## The key message

One idea, stated once, plainly. This is not the tagline. It is the strategic point the whole
campaign has to land, written so a human immediately understands what the campaign is arguing.
Everything else serves it. Draw it straight from the brief's message intent; if you
find yourself inventing a new argument, you have drifted from the brief.

## Taglines

Offer two or three options, not one and not ten. Each should express the key message in the
brand's voice (invoke the pack's voice skills or summary). Mark one as your recommendation and say
in a sentence why. These are options for the user to choose between, so make them genuinely
different in angle, not three rewordings of the same line. Do not settle on one yourself; the pick
is the user's.

## The master visual concept

> **Multiplicity lives only at the selection stage.** You generate 2-3 distinct directions and
> render one image of each *only so the user can choose*. The instant the user picks, `message.md`
> records **exactly one** `master_visual` concept and **exactly one** locked still. Downstream
> anti-drift is unchanged: every expander regenerates from one spec and binds to one rendered still.
> This skill never ships multiple concepts.

This is the load-bearing part. Once chosen, every image and video expander regenerates assets from
this one spec plus the locked still, so if the spec is vague they will each interpret it differently
and the campaign will look incoherent across formats. Specify it as named fields, not a paragraph of
mood. Write it so someone could hand any one field to a generator and get a consistent result.

Each direction, and the final chosen one, is populated as the master_visual named fields:

- concept: one line naming the visual idea.
- subjects: define each recurring subject or character precisely enough to reproduce across
  assets (who or what, defining features, wardrobe or form, anything that must stay constant).
  Give each a stable id (subject-1, subject-2) so expanders reference the same definition rather
  than reinventing it per asset.
- palette: specific colours, not "warm tones". Reference the brand's colours where
  `brands/<id>/design.md` has them — that file is where colour lives, not `pack.yaml`, which carries
  no colour field at all.
- lighting: the light treatment that must carry across assets.
- composition: the layout logic (where the subject sits, negative space, focal point). Include where
  the headline lockup is expected to go (e.g. "clean upper third reserved for the headline") so the
  key visual leaves room, even though the anchor itself carries no text.
- headline_lockup: how the headline should be set **downstream**, as a spec for `compose-lockup` — the
  typeface (from `brands/<id>/design.md`), weight/case, colour, and placement. This is a description of
  the lockup layer, **not** text to bake into the anchor still. Reference the brand's fonts where the
  pack/design.md defines them.
- motif: the one recurring element that signals this campaign at a glance.
- constants: what must not change across sizes, ratios, or formats. This is the anti-drift list. The
  anchor still is **text-free** (no baked headline, tagline, or logo) — that is itself a constant.

Ground it in the brand. Pull colours and fonts from `brands/<id>/design.md`, and products and assets
from the pack, rather than inventing a look that fights the brand's identity.

### Generate 2-3 candidate directions

Draft two or three genuinely distinct visual directions, the way the taglines are distinct in angle
rather than three rewordings of one. Each is a compact master_visual mini-spec (the named fields
above). Distinct means a different visual idea, not a different crop of the same one. Ground every
direction in the pack.

### Render one image per direction

Render one representative image per direction so the user chooses from pictures, not prose. There is
no locked subject yet — this is the phase that mints it — so these are **text-to-image**. Write your
own deliberately minimal prompt per direction (concept plus the brand colours and the deliverable's
hero framing), in the same minimal-prompt spirit as `visual-ideas`; do not pin down every placement.
Name two or three colours at most, each as a name plus a sigil-free hex — `deep plum (hex 7A1F3D)`,
never `#7A1F3D`, since `#` opens a reference handle in a prompt.

**Render the key visual text-free — no headline, no tagline, no logo.** The anchor carries the
subject and the look, not the words. Typography is a separate downstream lockup layer (`compose-lockup`
sets the headline onto statics; video burns captions in during the edit), so the anchor must stay a
clean image: baked-in type warps when the still is animated and cannot be re-laid per ratio or
localised. State "no text, no lettering, no logo, no watermark anywhere" in every candidate prompt.

Delegate the actual render to `generate-image`, which **gates before it spends** (its step 4): the
candidate prompts, model, settings and estimated cost go to the user, who chooses between it rendering
and them running the prompts by hand at fal.ai. Present all 2-3 candidate prompts at one gate with the
combined estimate, not one gate per direction. If they render by hand, take the returned stills back
and carry on with the pick and the lock exactly as if you had rendered them.

Use its default `fal-ai/nano-banana-2`. One image per direction, one
ratio (the campaign's hero or native ratio). These candidates are working inputs, so save them to
`campaigns/<slug>/media/key-visual/key-visual-candidate-<A|B|C>-v01.png`, and log each one
(status `candidate`) per the log step in the structure spec.

If a render is refused (skin or condition imagery can trip content filters), do not hang or silently
drop it: report the refusal plainly and reframe to the calm, relief- or product-led framing the pack
already mandates (`pack.mandatories`) before retrying.

### Lock the chosen direction

Only after the user picks (in the gate below): write that one direction's full named-field spec as
the single `master_visual`, re-download its render from the fal source URL to
`campaigns/<slug>/media/key-visual/key-visual-v01.png` (the first lock is always `v01`), record the
render's model, seed, and source URL, and write the paste-able prompt into `message.md`. Append a
`status: locked` event for that exact file to the generation log (the log step in the structure
spec). The locked still is the **text-free key visual** — confirm it carries no headline, tagline,
or logo before locking; if the chosen render picked up stray lettering, re-render it clean (new
seed) rather than locking type into the anchor. If the master visual has several recurring subjects
that genuinely appear apart across assets, lock a still per subject as
`media/key-visual/key-visual-<subject-id>-v01.png`; otherwise lock a single composite anchor. The
non-chosen candidates stay in `media/key-visual/` as `candidate` files for reference only.

**Prompt quality — lean default, with a "more" path.** The minimal self-written prompt above is the
default for both candidates and the lock. For the *chosen* direction only, you may escalate: route it
through `ai-image-video-prompt-builder` for a higher-fidelity Nano Banana prompt (and optionally a
stronger model) before locking, since the paste-able prompt and the anchor still are durable
artifacts the whole campaign leans on. Spend that extra pass on the one winner, never the losers.

## The human gate

**What you present.** Before writing anything, put three things in front of the user: the key
message, the tagline options, and the 2-3 rendered visual directions. Ask them to pick a tagline
**and pick one rendered picture**. Per `${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md` section 4,
this half is plain sentences and pictures only — describe each direction in the words a person would
use looking at it, and **never show the `master_visual` YAML here**. It is the file's vocabulary, not
theirs; the "The look, in a sentence" lines you write into `message.md` are what you say out loud.

If they push back on the visuals, offer three moves in plain terms: (a) run the same direction again
for a different take, (b) change one thing about a direction and redo just that one, or (c) start
again with a fresh set. Lock only once they have chosen a tagline and approved an actual rendered
image.

**Once they approve, write.** Files take file vocabulary, exactly:

1. Write `docs/message.md` in the campaign workspace, recording the chosen tagline, the plain-English
   "The look, in a sentence" summary, the full `master_visual` spec, the locked-still path, the
   render metadata (model / seed / source URL), and the paste-able render prompt. Save the chosen
   render as the locked anchor still (see "Lock the chosen direction" above).
2. Do not read any of that back. "That is the message and the look locked in" covers it.

**Then end on the next action**, per section 6 of the same spec: offer to start making the actual
things on the campaign's list, naming two or three of them as things ("the three static ads and the
launch email"), not as manifest entries or a phase. Say in a clause that everything from here builds
on the picture they just chose, so it all hangs together. Name no skill, and do not start producing
deliverables yourself here.

If the user adjusts the visual after it was locked, re-render to the **next version**
(`media/key-visual/key-visual-v02.png`, then `v03`…) — never overwrite an earlier version. Append a
`status: locked` log event for the new file (the previous lock is implicitly superseded), update
`message.md`'s `locked_still` to the new exact versioned path, and append "master visual re-locked
<date>" to the Status line.

## Output: message.md

```markdown
# Campaign message — <campaign name>

- Brand: <brand id> (<brand name>)
- Status: message approved <date>; master visual locked <date>
- Source: docs/brief.md

## Key message
<the one idea, one line>

## Tagline
Chosen: <the tagline the user picked>
Considered: <the other options, kept for reference>

## The look, in a sentence
<two or three plain lines a non-specialist can read: what you see, the mood, and the one or two
things that stay the same in every picture. This is the part quoted at the gate and on the campaign
page; the block below is for the skills that build on it.>

## Master visual concept
```yaml
master_visual:
  concept: <one line — the single chosen direction>
  subjects:
    - id: subject-1
      definition: <precise, reproducible description>
    # add more if the campaign has more recurring subjects
  palette: <specific colours, referencing pack colours where set>
  lighting: <the light treatment>
  composition: <layout logic, incl. where the headline lockup goes>
  headline_lockup: <downstream lockup spec — typeface, weight/case, colour, placement; NOT baked into the still>
  motif: <the recurring signal element>
  constants: <what must not change across sizes and formats; the anchor still is text-free>
  locked_still: media/key-visual/key-visual-v<NN>.png   # exact versioned path of the locked, TEXT-FREE key visual
  render:
    model: fal-ai/nano-banana-2
    seed: <seed>
    source_url: <fal URL the locked still was downloaded from>
```

## Render prompt (paste-able)
Paste into your own image tool to regenerate the anchor still. It renders the **text-free key visual**
only — no headline, tagline, logo, or watermark. The headline is added downstream by `compose-lockup`.
```text
<full text-to-image prompt for the chosen concept, Nano Banana style — ending with "no text, no
lettering, no logo, no watermark anywhere">
```

## Considered directions
- A — <one line> — media/key-visual/key-visual-candidate-A-v01.png   [chosen]
- B — <one line> — media/key-visual/key-visual-candidate-B-v01.png
- C — <one line> — media/key-visual/key-visual-candidate-C-v01.png

## Why this works
<a few lines tying the message, tagline, and visual back to the brief's intent and the audience>
```

## What this phase does not do

It does not create channel deliverables. It does not resize, script, or write anything for a specific
channel; the expanders do that, each reading message.md plus its manifest entry. It **does** render the
candidate visuals and lock ONE master-visual still, but that still is a reference anchor, not a
shippable channel asset. Message ships exactly one concept and one locked still; the 2-3 directions exist
only for the pick, they are not outputs. Keep the boundary clean: the message defines and anchors the
creative, the expanders apply it.