# Art direction — analysis schema, archetype catalogue, critique checklist

`compose-lockup` reads this before it prompts and again after it renders. The SKILL.md owns the
workflow (what to read, how to delegate the render, how to log); this file owns the three
brand-agnostic rubrics the art-director steps run on:

- **A. Key-visual analysis** — the structured read of the locked still (step 2, before prompting).
- **B. Archetype catalogue** — the constrained set of headline treatments to choose from (step 3).
- **C. Critique checklist** — what a rendered candidate is scored against (step 6), in the same
  vocabulary `campaign-qa` uses in Family 3 of its own checklist.

Two rules govern everything here. **Compose, never invent:** the concept, tagline, palette and the
locked composition are fixed upstream in `message.md`; these rubrics decide *how the agreed headline
sits on the agreed picture*, never a new picture. **Preserve the key visual:** the render is an edit
pass over a locked still, so every treatment below is one an edit model can apply without redrawing
the photo. Anything that re-composes the photo is out of scope (see the end of section B).

---

## A. Key-visual analysis schema (Layer 1 — read the photo)

`Read` the `locked_still` and emit this block before writing the prompt. It is a **qualitative,
thirds-based** read, not measurement. Describe the frame as a 3×3 grid (top/middle/bottom ×
left/centre/right). Do **not** fabricate exact luminance values, pixel bounding boxes, or hex codes —
a vision read approximates those, and a made-up number is worse than an honest description. Where you
are unsure, say so.

```
key-visual analysis — <locked_still path>
- text-free verdict: clean | HAS BAKED TEXT (headline/logo/tagline seen at <zone>)  ← if not clean, STOP
- observed aspect: <e.g. ~4:5 portrait, 928x1152>
- subject zone: <where the subject sits, in thirds>; face present? <yes @ zone | no>
- negative-space zones (ranked): 1) <zone> — <how clean, how large>; 2) <zone> — <...>
- reserved-zone match: composition declares "<quote from message.md.composition>" →
    matches the pixels | MISMATCH: the emptiest area is actually <zone>  ← flag either way
- headline-zone backdrop: <light|dark>, <warm|cool>, <clean|some texture>  (drives colour + scrim)
- light direction: <e.g. warm lamp from lower-left>; headroom at top: <yes|no>
- legibility risks: <any high-detail / high-contrast area where type would fight the picture>
```

The **text-free verdict** is where the "anchor must be text-free" invariant is actually enforced —
against real pixels, not the prose promise. The **reserved-zone match** is the point of reading the
photo at all: the still is sometimes hand-supplied and may not match what `composition` claims, so
verify rather than trust. If the reserved zone the prose names is not actually clean, prefer the zone
the pixels give you and note the divergence for the report.

---

## B. Archetype catalogue (Layer 2 — art direction as constrained choice)

Pick **one** treatment for the headline, chosen from the analysis in A, the `composition` from
`message.md`, and the deliverable's `channel`/`format`. The locked composition decides *which zone*
is available; the archetype decides *how the type sits in it*; the analysis decides *whether a scrim
is needed for contrast*. Creativity is the combination (archetype × zone × scrim × on-palette
colour), not new geometry.

If `campaigns/<slug>/research/competitor-ads.md` exists, its distilled priors may **bias** this
choice (e.g. the category's winners skew lower-third bold-claim). The priors are a soft nudge; the
locked composition and the preserve rule still win.

| Archetype | Choose when | Target zone | Treatment & scrim |
|---|---|---|---|
| **Type in clean space** | A large, low-detail zone with adequate contrast already exists (the default when the anchor was built with reserved space). | The primary negative-space zone from A. | Headline set directly on the photo, no scrim. On-palette colour picked for contrast against the measured backdrop. |
| **Lower-third scrim** | The natural empty area is at the bottom but slightly busy, or a feed static wants the headline/CTA low. | Bottom third. | A **soft photographic gradient** rising from the base for legibility — never a hard solid band or letterbox (that breaks the common "no letterboxing" constant and the text-free look). |
| **Corner overlay** | The clean space is a corner, not a full band; or a short lockup wants to tuck out of the subject's way. | One corner's negative space (from A). | Headline in the corner, optionally on a small soft scrim if the corner has texture. Keep clear of the subject/face. |
| **Legibility gradient** | The best headline zone overlaps some mid-detail texture and no fully clean zone exists. | The chosen zone. | A subtle directional darkening/lightening **only to buy contrast** for the type — a legibility device, not a redesign. Minimum strength that makes the text read. |

**Out of scope — do not use (they re-compose the locked photo).** Split panel, photo cropped to a
shape, photo bled to one side behind a solid colour column, or any full redraw. These fight the
"preserve the key visual" invariant and the upstream-locked composition, and an edit model renders
them unreliably. If a deliverable genuinely needs one, that is a new or alternate **key visual** and
belongs upstream in `campaign-message`, not in a lockup pass — say so rather than forcing it here.

---

## C. Art-director critique checklist (Layer 3 — read the render back)

After the render, `Read` each candidate and score it against this matrix. The vocabulary mirrors
`campaign-qa`'s Family 3 on purpose: this is the **producer-side pre-check** so QA does not receive
avoidable defects — it does **not** replace `campaign-qa`, the independent gate that still runs before
anything ships. For each finding name **what · where · which rule · the fix to try** (the fix feeds
the reroll in step 7).

Each check is **hard** (a defect that must be fixed before the candidate can win — adjust the spec
and reroll, bounded to the step-7 cap) or **soft** (note it, ship if it is the best of the batch).

| Check | Rule | Class |
|---|---|---|
| **Headline correctness** | Spelled and punctuated exactly as `message.md` gives it; no garble, no invented sub-line. | **hard** (the gate — never ship a misspelling) |
| **Locked-still fidelity** | The subject, palette and composition are the locked still's; the headline was *added*, the picture not *redrawn* or drifted. | **hard** |
| **Text-free anchor honoured** | No second headline/logo laid over pre-existing baked text (should have been caught in A). | **hard** |
| **Legibility** | Every text run reads clearly against what sits behind it (contrast, scrim if used is doing its job). | **hard** if illegible |
| **Subject/face clearance** | Nothing overlaps the subject's face or the key product. | **hard** |
| **Safe area** | Text and any CTA sit inside the safe margins for the deliverable's `channel`/`format` (see below). | **hard** if clipped by known chrome, else **soft** |
| **Crop survival** | The headline survives every crop the `format` ships (e.g. 1×1, 4×5, 9×16) — nothing critical is lost at the tighter ratio. | **hard** if lost |
| **Thumbnail hierarchy** | The headline still reads and the hierarchy holds at feed-thumbnail size. | **soft** |
| **Typeface trace** | The set type reads as the brand display face from `design.md` (or a noted same-character substitute). | **soft** |
| **Colour trace** | The headline/graphic colour traces to an on-palette `design.md` hex. | **soft** |

**Safe-area guidance is channel-derived, never hardcoded to one platform.** Read the deliverable's
`channel`/`format` and apply the matching margins:

- **Feed statics** (1×1, 4×5 — e.g. Instagram/Facebook feed): keep text within roughly a 10% margin
  all sides; keep the headline clear of the very bottom edge where feed UI and CTA chrome overlay.
- **Vertical stories/reels** (9×16 — e.g. Reels, Stories, TikTok): keep text inside the central safe
  band, clear of the top ~14% and bottom ~20% where platform UI sits.
- **Unknown channel:** fall back to a generic ~10% all-sides safe margin.

These are examples the `channel` field selects among, not a Meta-only rule — a different platform in
the pack's vocabulary picks its own margins.
