# Funnel Ad Concepts

The framework for paid-social performance concepts (Facebook, Instagram, TikTok): the funnel, the ad
anatomy, variant generation, and the test discipline. Campaign mode in SKILL.md drives this; the
framework stays the same across brands and campaigns, and only the brief and the brand pack change.

This is a performance/direct-response framework. It does not fit brand films, TV spots, or
awareness-only work with no funnel.

## The spine: three stages, one journey

Performance audiences move through Eugene Schwartz's awareness stages predictably, and each stage needs
a different ad. Every concept does exactly one of three jobs. Never mix two jobs in one ad.

**Reach (Problem-Aware).** Names a specific problem experience so precisely the right person thinks
"that's me". No product. Soft CTA or none. Its job is cheap, qualified attention that also fills the
retargeting pools. This is where video earns its budget because a 25%+ view builds the warm audience.

**Trust (Solution-Aware).** Introduces a *category* of solution and positions the brand as the guide.
Runs to people who engaged with a Reach ad. CTA is "learn more" or a click to content, never "buy now".
Stories and credibility carry it. Usually static or carousel.

**Sell (Product-Aware).** Sells one SKU with specifics: price, mechanism, proof. Hard CTA. Retargets
warm audiences only. This is where ROAS lives, and it works *because* the first two stages warmed the
audience. Usually static.

Default output for a product is one concept per stage. Add a fourth only when the pack marks the
product `buying_mode: acute` (see below).

## The four functions: how one ad is built

Every ad performs four functions. They are universal in purpose but change *form* by format and
*weighting* by stage.

- **Hook** earns the scroll-stop or first read. On video it lives in the first 3 seconds and must work
  with sound off.
- **Build** holds attention past the hook. Usually the "why", or credibility.
- **Payoff** is the reward for attention. For Reach it is emotional; for Sell it is proof plus offer.
- **Direct** is the single next action. Soft or absent for Reach, hard for Sell.

**Flex by format.** Video plays the four functions out in time (hook, build, payoff, direct). A static
image has no time axis: the image is the hook, the headline fuses hook and payoff into one line and
carries most of the weight, and the caption is the build. Do not force a three-act structure onto a
static.

**Flex by stage.** Reach is almost all hook and build, with an emotional payoff and no hard direct.
Sell inverts it: compressed hook (audience is warm), long payoff of proof and offer, hard direct.
Applying a hook-heavy structure to a Sell ad over-teases and under-closes.

**Static layouts.** Trust and Sell concepts are usually static or carousel, so pick a structure rather
than inventing one. The 15-template library in [static-ad-templates.md](static-ad-templates.md) supplies
the layout vocabulary: Review Card and Testimonial Stack for Trust credibility, Us vs. Them and Stat
Callout and FAQ Card for Sell proof, Before/After and Problem/Solution where the transformation is the
argument. Name the template in the concept's visual notes.

## Variant generation: permute the brand's angle bank

Producing varied concepts is only useful if the variants are testable, so variant generation and the
test note are one feature, not two. Build them together.

The pack carries an **angle bank** at `ads.angle_bank`: the brand's recurring **trigger moments**
crossed with its **emotional framings**. A trigger moment is whatever brings someone to the brand,
which is a problem for one brand, a desire or an occasion for another; the axis does not presuppose
suffering. Generate variants (usually 2-3 per stage being tested) by permuting one trigger moment
against one framing, holding everything else constant. Each permutation is a variant; the test
note below records what is being held constant and what varies. Do not generate variants by changing
several things at once. A variant set that differs on hook *and* audience *and* format teaches you
nothing about what moved the numbers.

Trigger moments are audience insight informing the hook's *feeling*, not a literal visual to depict.
Name the emotional truth in copy; imply the moment in the visual.

If the pack has no angle bank yet, say so. Building it is the first task, ahead of producing
variants, and the grounded inputs corpus (`brands/<id>/references/{winning-ads,reviews,comments}/`,
see "Grounded Inputs" in SKILL.md) is where the trigger moments and framings come from.

## The funnel-compression exception

The default is the full three-stage funnel: no shortcut. Nobody buys a `considered` product on impulse.
The exception is a product the pack marks `buying_mode: acute`: one that addresses acute, high-intent
need and can convert cold high-intent traffic in a single direct-response ad. For a flagged product,
add a fourth concept: a short direct-response ad to a narrow high-intent cold audience, run as an A/B
test *against* the warm-only Sell ad. Present it as a test, not a recommendation. It is the framework's
deliberate exception. Every other product runs the full funnel.

## Concept output block

For each concept, output this block:

```
### [AD-ID] — [Stage] ([format])
Product: ... | Funnel: full/compression-test | Voice: Yes/No
Audience: ...
Status: Concept

Hook:   ...
Build:  ...
Payoff: ...
Direct: ...

On-screen text: ...
Voiceover script: ...   (or "None" with a one-line reason)
Visual notes: ...
Asset link:  (blank)
Destination link: ...
```

Ad IDs follow a short product code plus stage: Reach = R, Trust = T, Sell = S, compression
direct-response = A. Variants append a letter: `EMU-R1-a`, `EMU-R1-b`.

## Test note

If you produced variants, follow the concepts with a **test note**:

```
## Test note — [Product] [batch date]
Held constant: ...
Variable under test: [Hook / CTA / Format — exactly one]
Variants:
  [AD-ID]-a: [what differs]
  [AD-ID]-b: [what differs]
Hypothesis: [which you expect to win and why]
Read on: [the deciding metric: 3s view rate / CTR / ROAS]
Audience: [cold / 25% video-viewers / 180d site visitors]
```

## House rules

Honour every guardrail in the pack's `mandatories` and `nogos`, including any this framework does not
mention, and the engine's own ad safety rules in SKILL.md (the presenter guardrail, and platform
ad-review as a constraint separate from claim compliance). Concepts and their **visual notes** must
respect both: an ad the platform rejects never runs. The pack can add constraints; it cannot remove
the test discipline or the safety rules.
