# Section library and page archetypes

The lookup `build-landing-page` reads before it chooses a stack. Brand-agnostic: every section is described
by what it does and what it needs from the pack, never by a specific brand's facts.

Two rules govern everything below.

**Every section ladders up to the key message.** A section that does not express, evidence, or act on
`message.md`'s key message is a section the page does not need. Length is not the goal; a page that
earns the click with four sections beats one that pads to eight.

**A page has one job.** The objective from `brief.md` names it. Every CTA on the page asks for that
one action. A page with two conversion goals converts on neither.

## The section library

### Hero

**Does:** States the promise and asks for the action, above the fold.

**Needs:** The chosen tagline from `message.md` as the `<h1>` (verbatim). The key message as the
subhead, tightened. `master_visual.locked_still` as the background or adjacent image, text-free, with
the headline set as live HTML text over it. The primary CTA, pointing at `products[].url`.

**Always present.** The only mandatory section. If a visitor reads nothing else, the hero alone must
tell them what this is, who it is for, and what to do.

**Fails when:** the headline describes the product instead of the promise; the CTA is "Learn more"
rather than the actual action; the hero image carries baked-in text that competes with the `<h1>`.

### Problem / agitate

**Does:** Proves you understand the visitor's situation before you sell to them. Earns the right to
the rest of the page.

**Needs:** `audience[].pains` for the named audience (`audience_ref`). Written in the visitor's
language, not the brand's.

**Earns its place when:** the audience is problem-aware but not solution-aware; the funnel stage is
Reach or Trust; the purchase is `considered`.

**Skip when:** the visitor arrived from a Sell ad already knowing the problem. Restating it there
delays the offer and reads as padding.

**Fails when:** it manufactures anxiety the audience does not have, or crosses a `nogo`.

### Mechanism / how it works

**Does:** Makes the promise credible by explaining why it works. Converts a claim into a reason.

**Needs:** `products[].summary`, and only what `claims_allowed` permits. Three or four steps, no more.

**Earns its place when:** the product is unfamiliar, the category is crowded, or the promise sounds
too good without an explanation. Essential for `considered` purchases.

**Skip when:** the product is self-evident and the purchase is `acute`.

**Fails when:** it asserts a mechanism `claims_allowed` does not cover. This is the single most
common compliance failure on a landing page.

### Proof / social

**Does:** Answers "has this worked for someone like me."

**Needs:** `assets[]` entries of a testimonial or case-study type; `audience[].jobs` to frame whose
job got done. Real attribution or none: never invent a testimonial, a name, a photo, or a number.

**Earns its place when:** trust is the barrier. Almost always, for a `considered` purchase.

**Fails when:** the proof is generic ("loved by thousands") or fabricated. If the pack has no proof
assets, omit the section and flag the gap. A missing proof section is honest; a made-up one is not.

### Offer

**Does:** States exactly what the visitor gets, for what, and asks for the action.

**Needs:** `products[].name`, `summary`, `price` (formatted per `market.currency`), and `url`. Omit
the price entirely if the pack has none; never invent one.

**Position:** near the top for `buying_mode: acute` (the visitor already wants it, do not make them
scroll), after proof for `buying_mode: considered` (the price is only reasonable once the value is
established).

**Fails when:** the price appears before the value is established on a considered purchase, or the
CTA label describes a page rather than an action.

### Objection / FAQ

**Does:** Removes the specific reasons a ready buyer does not click.

**Needs:** `audience[].pains` reframed as hesitations, plus whatever `mandatories` require be said
plainly. Answer the three or four real objections; do not pad to ten.

**Earns its place when:** the funnel stage is Sell, or the purchase is considered and the price is
the objection.

**Fails when:** it raises objections the visitor did not have.

### Risk reversal

**Does:** Shifts the cost of being wrong from the visitor to the brand.

**Needs:** A guarantee, returns policy, or trial that **actually exists** in the pack. If the pack
does not carry one, omit the section and flag it. Never invent a guarantee: it is a promise the brand
would be held to.

### Final CTA

**Does:** Asks once more, for the same action, after the argument is complete.

**Needs:** The same CTA target as the hero. The same action, a different sentence.

**Always present** on any page longer than a single screen.

**Fails when:** it asks for a different action than the hero, splitting the page's one job.

## Archetype to stack

Pick the archetype from the objective in `brief.md`, then adjust for `funnel_stage` (from the
manifest entry) and `buying_mode` (from `products[offer_ref]`).

| Archetype | Objective in the brief | Default stack |
|---|---|---|
| **Direct sale** | Buy the product now | hero → offer → proof → objection → final CTA |
| **Considered sale** | Buy, but the price or novelty needs an argument | hero → problem → mechanism → proof → offer → objection → risk reversal → final CTA |
| **Lead capture** | Get an email address | hero → problem → proof → offer (the lead magnet) → final CTA |
| **Consult booking** | Book a call or an appointment | hero → problem → proof → mechanism → objection → final CTA |
| **Waitlist** | Register interest before launch | hero → problem → mechanism → final CTA |

### Adjustments

**By `funnel_stage`.** A Reach-ad destination and a Sell-ad destination are not the same page, even
for the same product.

- `reach` — the visitor is cold. Lead with the problem; earn the offer. Add `problem` if the archetype
  omits it, and move the offer down.
- `trust` — the visitor knows the problem and is judging you. `proof` and `mechanism` carry the page.
- `sell` — the visitor is ready. Cut `problem`, move the offer up, and let `objection` do the work.

**By `buying_mode`.**

- `acute` — the need is urgent and the product is the obvious answer. Offer high, page short. Cutting
  `mechanism` is usually right.
- `considered` — the visitor is comparing. `mechanism`, `proof`, and `risk reversal` all earn their
  place; the offer comes after them.

**By pack richness.** A thin pack cannot support every section. No `assets[]` means no proof section.
No `claims_allowed` means no mechanism section, and an offer that sells on the key message alone. Drop
the section, flag the gap, and say so in the report. A page with four honest sections beats one with
eight where half are invented.
