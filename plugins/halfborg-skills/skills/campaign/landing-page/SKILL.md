---
name: landing-page
description: >-
  Build a campaign's landing page: a real, self-contained, offline-viewable HTML page written from the brand pack, the approved brief, and the locked campaign message. Use whenever the user wants the page a campaign's traffic lands on: "build the landing page", "make the landing page for [deliverable]", "write the LP", "the page the ads point at", "we need a page for this offer", "generate the campaign landing page". Reads campaigns/<slug>/docs/brief.md (the page objective, audience, constraints), campaigns/<slug>/docs/message.md (the key message, the chosen tagline as the default hero headline, and master_visual.locked_still as the text-free hero image), campaigns/<slug>/system/manifest.yaml (its own asset entry: id, offer_ref, audience_ref, funnel_stage), brands/<id>/pack.yaml (products with price / url / claims_allowed / buying_mode, audience pains and jobs, voice, mandatories, nogos) and the whole of brands/<id>/design.md (typeface, colour hexes, radius, spacing grid, shadows, component patterns). Gates on the section stack in conversation, then writes one versioned .html into campaigns/<slug>/media/<id>/ and logs it. Do NOT use to invent the concept, key message, or tagline (that is campaign-message, read-only here); to generate imagery (that is generate-image); to produce a rough mockup IMAGE of a page rather than a working page (that is visual-ideas); to build the campaign's internal review site (that is campaign-site-builder); or to deploy or host anything, which this engine never does.
---

# Landing page — the page the campaign's traffic lands on

Turn a campaign's approved strategy and locked message into the **working page** where the promise made by every ad, email, and post is kept. This skill writes one self-contained HTML file: it opens from disk, makes no network request, and hands to a developer as-is.

It is most load-bearing when the campaign runs ads. Reach, Trust, and Sell ads all promise something and all need somewhere to land. This skill never reads the ads, and the ads never read this page: **message-match is structural**, because both bind to the same `docs/message.md` key message and tagline. What guarantees the page exists at all is `campaign-brief`, which pairs a `pipeline: ads` manifest entry with a `landing-page` asset entry.

Where the neighbours sit:

- `campaign-brief` sets the objective and writes the manifest entry this skill consumes.
- `campaign-message` locks the key message, the tagline, and the **text-free** key visual. Read-only
  here. Never re-imagine the concept or reword the tagline.
- `compose-lockup` bakes the headline **into** an image, for statics. This skill does the opposite: it sets the headline as live `<h1>` text over the clean key visual, which is exactly why the anchor is kept text-free.
- `visual-ideas` makes a rough mockup **image** of a page. That is ideation. This is the page.

Campaign paths and filenames follow `${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md`; that spec wins over any path shorthand here.

## 1. Read the inputs

Resolve the campaign, brand and message per `${CLAUDE_PLUGIN_ROOT}/schema/preflight.md` before
reading anything below. Everything you say out loud follows
`${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md`: engine words belong in the files, not in the
conversation.

1. **`campaigns/<slug>/docs/brief.md`** — the **page objective** comes from here, along with the audience, the constraints, and what is out of scope. If the brief names a conversion goal, that is the page's one job.
2. **`campaigns/<slug>/docs/message.md`** — the required creative input. Pull:
   - the **key message** (what every section must ladder up to),
   - the chosen **tagline** (the default hero headline, unless the manifest's `tagline_variant` or the invocation overrides it),
   - from `master_visual`: `locked_still` (the exact versioned path to the text-free key visual), `palette`, and `constants`.
   - If `message.md` is missing, do not fail and do not silently proceed. Say so, and offer to run off `brief.md` alone with a text hero and no key visual. A page can exist without a hero image; only the design is poorer for it.
   - If `locked_still` is set but the file is missing, say so and continue with a text hero.
3. **`campaigns/<slug>/system/manifest.yaml`** — two things. First, `campaign.brand`: that value **is the `<id>`** in the two paths below, so read it rather than asking which brand this is (`${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md` section 1.1). Second, this deliverable's entry, matched on `id` — the `id` is both the media folder name and the filename stem. Read `offer_ref` (which  product the page sells), `audience_ref` (whose pains it speaks to), `funnel_stage`, and  `tagline_variant`.
4. **`brands/<id>/pack.yaml`** — the brand facts. Read, do not ask:
   - `products[]` for the offer: `name`, `summary`, `price`, `url` (the CTA target),     `claims_allowed` (the **only** things the page may assert about the product), and `buying_mode`  (`acute` or `considered`, which moves the offer up or down the stack).
   - `audience[]` for `pains` and `jobs` — the raw material for the problem and proof sections.
   - `voice.summary` and `voice.spelling`; `voice.skills` names the voice skill(s) for any long-form body copy under a byline.
   - `brand.url`, `market.currency` (price formatting), `assets[]` (testimonials, proof).
   - `mandatories` and `nogos`. **Absent `mandatories` means unconfirmed, not none** — confirm with the user rather than assuming the brand has no rules.
5. **`brands/<id>/design.md`** — read the **whole file**. Typeface, colour hexes, border radius, the spacing grid, shadow rules, and the card / button / imagery component patterns. Unlike  `compose-lockup` and `visual-ideas`, which are restricted to the typeface name and colour hexes, a web build honours the full design system. Freeform prose, not a schema: read what is there and carry on past anything missing.

## 2. Choose the archetype and the section stack

Map the brief's objective to a page archetype, then to a section stack. The lookup lives in [references/section-library.md](references/section-library.md). **Read it before deciding.**

The two inputs that move the stack most: the `funnel_stage` on the manifest entry (a Reach-ad destination and a Sell-ad destination are not the same page) and `products[].buying_mode` (an `acute` purchase puts the offer near the top; a `considered` one earns it after proof).

Every section must ladder up to the key message. A section that does not is a section the page does not need.

## 3. The gate

Before building anything, present in conversation, and in **no file** — plain sentences, per
`${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md` section 4:

- **what the page is for**, in one line,
- **the sections, in order**, named the way a person would name them ("the headline, then the
  problem, then proof, then the offer"),
- **the headline** it will lead with, verbatim from `message.md` or the named variant,
- **each button: what it says, and where it goes** — the real destination URL,
- **every claim the page will make**, each with a word on why it is safe to say: the cleared claim it
  comes from, in their language, not the field name,
- **anything you had to leave open** because the brand's details do not cover it.

Get an explicit go-ahead. Reordering the sections is cheap now and expensive once the page is built.

## 4. Write the page

One self-contained `.html` file. It opens from disk and makes no network request.

- **Provenance header first.** An HTML comment block immediately after the doctype, recording: the deliverable `id`, the campaign slug, the source `message.md` tagline, every product claim used with the `claims_allowed` entry that permits it, the mandatories honoured, and any font substitution. This is what lets `campaign-qa` check claims without parsing prose out of markup.
- **Styles inline**, in one `<style>` block. Design tokens straight from `design.md`: the colour hexes as CSS custom properties, the radius, the spacing scale, the shadow rule.
- **No web fonts.** Offline and self-contained forbids `@import` and any CDN. Name the brand typeface first in a local-first stack that degrades to a system face of the same character, e.g. `font-family: 'Source Serif 4', 'Source Serif Pro', Georgia, serif`. Record the substitution in the provenance header.
- **The hero is the text-free key visual**, referenced relatively from the sibling media folder:
  `../key-visual/key-visual-v01.png`. Use the exact versioned path from `master_visual.locked_still`. Never use a `compose-lockup` output as the hero; its headline is baked in and would double up.
- **Semantic and responsive.** Real landmarks, a sensible heading order, a single `<h1>`, and a layout that works from a phone to a desktop without a framework.
- **Copy.** Body copy in the brand voice per `voice.summary`; product facts plain. Only
  `claims_allowed` may be asserted about a product. Honour every `nogo`.

## 5. Output and log

Save to the deliverable's media folder, versioned per the filename grammar:

```
campaigns/<slug>/media/<id>/<id>-v<NN>.html
```

A reroll takes the next `v<NN>`. **Never overwrite.** Then follow the log step in
`${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md` §4.1: append one `generate` line with `status: iteration`, and a `status: final` line when the user approves the page as shipped. The line carries no `model`, `cost_usd`, `seed`, or `source_url` — nothing was rendered by a model. Put the section stack in `notes`. Then rebuild the campaign page once — follow `campaign-site-builder` for `campaigns/<slug>`.

Then report back per `${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md` section 5: what the page does,
the sections it ended up with, the picture it leads with, where the buttons go, the claims it makes,
and anything you had to leave open. **One path** — the `.html` file, in full, so they can open it —
and tell them it opens straight from disk in a browser.

Say plainly that nobody has checked it yet: it has not been through their must-includes, the things
they never say, or the final campaign check. Then **end on a next action** per section 6 — usually an
offer to walk through it with them, or to write the next thing on the campaign's list.

## Degradation

A thin pack degrades with a flagged gap; it never guesses.

| Missing | Do |
|---|---|
| `message.md` | Offer to run off `brief.md` alone: text hero, no key visual. Never proceed silently. |
| `master_visual.locked_still` | Text hero. Flag it. |
| `products[].url` | Placeholder CTA target. Flag it. Never invent a URL. |
| `products[].price` | Omit price. Never invent one. |
| `products[].claims_allowed` | Assert nothing product-specific. Sell on the key message alone. |
| a named typeface in `design.md` | A generic stack of the right character. Flag it. |
| `mandatories` | Unconfirmed, not none. Ask. |

## House rules

- **The hero is the text-free key visual, never a lockup.** The headline is live `<h1>` text laid over the clean image. This is why `campaign-message` keeps the anchor text-free; do not undo it.
- **Never invent the message.** The key message and tagline are locked upstream in `message.md`. This skill expresses them as a page; it does not reword them.
- **Only `claims_allowed` may be asserted** about a product. Honour every mandatory and no-go.
- **Self-contained and offline.** No CDN, no web fonts, no external scripts, no analytics. The hero image, referenced relatively, is the only thing outside the file.
- **This engine never deploys.** The page has no URL. Do not publish it, and do not tell the user an ad can point at it until a human has hosted it.
- **Never overwrite a version.** A reroll is `-v02.html` beside `-v01.html`; supersession is a log  event, not a deleted file.
- **The page lives in `media/<id>/`.** Not `content/` (which is markdown only, and unversioned), and not a `landing-page/` folder (which does not exist).
- **Speak plainly.** Everything you say out loud follows `${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md`: engine words belong in the files, not in the conversation. The provenance header keeps its exact field names; the gate and the report-back do not.
- British spelling, reduce em dashes, no phrasing that reads as AI-generated. Keep first-person brand-voice copy in the brand voice and product-fact copy plain.