---
description: Create a brand's central reference by conversation. Captures the brand skeleton in plain questions (or reads the brand's website), writes the pack — and, when wanted, the design tokens and voice profile — for the user, then optionally enriches them from the site. The user never writes YAML.
argument-hint: [brand name or website]
---

Create a brand's central reference for the user by talking to them. They should never see, edit, or hear about YAML, the schema, or "required fields". Your job is to turn a short conversation into a valid `brands/<id>/pack.yaml`, quietly — and, when the brand wants a look and a founder voice, the two files that sit beside it: `brands/<id>/design.md` (design tokens) and `brands/<id>/voice-profiles.md` (the voice corpus). The pack alone is always a complete, working brand; the other two are optional depth this command can add now or later.

## How to talk

- Plain language, no jargon. Never mention the schema, validation, or file formats. The full
  contract is `${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md`; this command is its clearest example,
  so keep it that way.
- One question at a time. Lead each with an example answer so they can just confirm or adjust.
- Keep it short. You are capturing a skeleton, not running an audit. The deep detail is filled in later, from their website.
- If `$ARGUMENTS` looks like a website, offer to read it first and pre-fill answers, so they mostly confirm rather than type.

## What to capture

Just enough to write a working pack:

1. **Brand name** — from `$ARGUMENTS` if given, otherwise ask.
2. **Positioning** — "In one sentence, what do you sell and who is it for?" Becomes the positioning line.
3. **What you sell** — at least one product or service (a name is enough; a rough price is a bonus).
4. **Who it is for** — at least one type of customer, in their own words.
5. **Where you sell** — country, main language, currency. Offer sensible defaults from their answers and confirm rather than interrogate.
6. **Rules you must follow** — "Any claims you must avoid, or rules your industry requires?" Some brands have none; that is fine. Always record the answer, even when it is "none".
7. **Voice** — ask if they already have a writing style or voice set up. If yes and they name it, reference it. If not, do not push: write a one-paragraph summary of their voice yourself from how they described the brand, and use that. Then ask one more, lightly: "Will you want blog posts in your own founder voice, or customer / transformation stories?" If yes, this brand wants the voice skills — set `voice.skills` accordingly and author a voice profile (see **Voice profile** below). If they only want short-form or product copy, the one-paragraph `voice.summary` is enough and no profile is needed.

## What to write

- Derive an `id` by slugifying the brand name (lowercase, hyphens).
- Write `brands/<id>/pack.yaml`: `version: "1"`, the brand skeleton, market, one or more products and audiences, voice (a skill reference if they have one, otherwise a prose summary), and `mandatories` — always present, even as an empty list.
- When the brand wanted a look, also write `brands/<id>/design.md` (see **Look & feel**). When it wanted founder-voice or customer-story content, also write `brands/<id>/voice-profiles.md` (see **Voice profile**). Both are written for the user in the same quiet way as the pack — they never see or edit them.
- Validate the pack against `${CLAUDE_PLUGIN_ROOT}/schema/brand-pack.schema.json` yourself. If it fails, fix it silently. Never show the user a validation error. (`design.md` and `voice-profiles.md` are freeform, not schema-validated — just write them well.)

## Ads (optional)

Ask once: "Do you run paid ads, or plan to?" If no, skip this section entirely and write no ads block.

If yes, two questions, each led with a proposed answer drawn from what they have already told you:

1. **Who fronts an ad.** Propose it from their voice and description: a brand that talks as "we" is product-led; one built on a founder's personal story is not. "I'd suggest we keep the ads product-led, with no named person on camera. Or is there someone the brand is built around?" If they name a person, ask the follow-up: can that person actually appear on camera, or should their voice carry the personal lines while they stay off it?
2. **Impulse buys.** "I'd assume nobody buys these on impulse, so every ad walks people through the full journey. Is there anything someone in real need would buy from a single ad?" Anything they name is an impulse buy; everything else is not.

Then derive the angle bank yourself rather than asking them to invent one from a blank page: cross the moments that bring someone to the brand (from the pains and jobs they described) against the emotional stances their positioning and voice suggest. Present it in plain prose and let them confirm or adjust.

Write the `ads` block with `presenter` always set, `buying_mode: acute` on any product they flagged as an impulse buy, and the agreed angle bank. Never write an `ads` block without a human answer to the presenter question: the ad tools treat that block's presence as confirmation that a person decided who may appear in an ad.

## Product photos (optional, ask only if they named products)

Ask once, plainly: "Do you have photos of any of these? Even a phone shot on a plain background is
worth more than a generated one." Explain the reason in a clause, not a lecture — a picture made up
from scratch looks like the product without being it, so anything showing a real item is better off
built on a real photo.

For anything they point you at, record the path as that product's `photo` in `pack.yaml`, relative to
the brand folder (`assets/serum-bottle.jpg`). Copy nothing and move nothing — just record where it is.

Absent is fine and stays valid; the ad and video tools ask for a photo at the moment they need one.
Never invent a path, and never record a file you have not been told exists.

## Logo (only when a website is available)

Ask nothing. Whenever you read the site — the `$ARGUMENTS` pre-fill, the **Look & feel** read, or
enrichment — try once to come away with the brand's logo, so pages built later carry it. A landing
page is real HTML rather than a rendered picture, so it is the one place a true logo file belongs.

**Where to look, in order. The first thing that verifies wins.**

1. `<link rel="icon" type="image/svg+xml">` — usually the real mark, in the ideal format.
2. A header or nav `<img>` or inline `<svg>` whose `src`, `alt`, `class` or `id` mentions logo,
   brand, or wordmark. Inline `<svg>` markup is written straight to a file as-is.
3. A `schema.org` JSON-LD `"logo"` value, or `<meta property="og:logo">`.
4. `apple-touch-icon` — typically a 180×180 PNG.
5. A `data:` URI already sitting in the markup. Decode it and write the file; that is a real logo.

Never record a `.ico`, and never fall back to `/favicon.ico`. A favicon is not a brand asset, and a
16px mark stretched across a page header is worse than no logo at all.

**Getting the file.** The jina.ai markdown fallback below surfaces `<img>` URLs but strips inline
SVG and CSS background images, which is where most header logos actually live — so read the raw HTML
too when it is reachable. Resolve a relative `src` against the site's origin. Download with
`curl -L -o "brands/<id>/assets/logo.<ext>" "<url>"`.

**Then verify the bytes on disk, not the HTTP status.** A server answering 200 with an error page is
common, and recording that as a logo is the one outcome worse than finding nothing.

- SVG starts `<svg` or `<?xml`; PNG starts with the PNG magic bytes; JPEG with `\xff\xd8`; GIF with
  `GIF8`; WEBP with `RIFF` then `WEBP`.
- Reject anything under about 1KB — that is a tracking pixel or a placeholder, not a logo.
- Prefer SVG. For anything raster, prefer 256px or more on the long edge.

Only once a file has verified, record it as `logo` under the brand block in `pack.yaml`: its `path`
relative to the brand folder (`assets/logo.svg`), the `source_url` you took it from, a `confirmed`
of `false` because nobody has looked at it yet, and `kind` if the markup makes it obvious. Save it as
`assets/logo.<ext>`, and a second file the site serves for dark backgrounds as
`assets/logo-dark.<ext>`. Do not put a version number in the name; that belongs to campaign media,
not to a brand's own files.

If nothing verifies, write no logo at all and say so at the end, in a clause: you could not find a
usable logo on the site, so pages will set their name as type until they drop the file in
themselves. Never invent a path, and never record a file you have not seen land on disk.

## Look & feel (optional)

Offer once: "Want me to capture your look — your main colours and fonts — so ads and pages come out on-brand?" Non-gating; if they decline, write no `design.md` and the image and page skills fall back to a generic-but-tasteful look.

If they agree, get the tokens honestly:

- **If a website is available** (`$ARGUMENTS` or one they mention), read it and lift the real values: the display and body typefaces, and the brand colours as hex — primary, an accent, and the page background / text neutrals.
- **Otherwise**, propose a small palette and a type pairing from the positioning, category, and voice, and let them confirm or adjust. Mark it as inferred, not measured. Never invent a specific hex and present it as theirs without saying so.

Then write a **core** `brands/<id>/design.md`: YAML frontmatter with `typography.fontStacks` (a `display` and a `body` stack, each ending in a system fallback) and a small `colors` map (`primary`, `accent`, `surface`, `on-surface`, plus `secondary`/neutrals if known), followed by three short prose sections — **Brand & Style** (2-3 sentences on the visual character), **Colors** (the named roles + hexes and when to use them), and **Typography** (display vs body face, weights, character). Keep it to that. Do **not** attempt the full Material-3 token set (the light/dark/fixed role ramps, spacing grid, elevation, component patterns) in `${CLAUDE_PLUGIN_ROOT}/templates/design.md` — that is a richer tier a brand grows into later; `landing-page` supplies tasteful defaults for anything you omit and flags the gap. `compose-lockup` and `visual-ideas` read only the typeface name and the hexes, so those two must be clearly present.

## Voice profile (optional)

Only when step 7 established the brand wants founder-voice blog posts or customer / transformation stories. This authors `brands/<id>/voice-profiles.md`, the file the `personal-post` and `customer-story` skills require — without it, those skills refuse rather than fake a voice, which is the point.

Write the sections the skills read — **"Personal post voice profile"** and/or **"Customer story voice profile"**, whichever the brand wants. Split the fields by what you can honestly know:

- **Author from the conversation** (fill these confidently): the founder persona and bio, the voice-in-one-sentence line, the team byline and framing for customer stories, the customer naming convention, geography and cultural references, the regulated-advice boundary, and the product table (derive it from the products already captured — exact names, roles, canonical URLs).
- **Corpus-only — needs the brand's real published writing** (the opener banks of real usable lines, the founder's sentence-level tells, and pointers to sample posts under `brands/<id>/voice-references/…`): fill these **only** from a site read (see **Enrich** below) or from examples the user gives you. When there is no corpus, leave them explicitly empty with a short note (e.g. "No opener bank captured yet — add real published lines here, or re-run enrichment against the site"). **Never fabricate an opener line, a tell, or a sample post.** The skills tolerate an empty tells/opener list; they do not tolerate an invented voice.

Set `pack.voice.skills` to the matching skill name(s) so the pack points at the profile you wrote.

## Enrich from your site (optional)

If a website is available, offer to deepen everything from it: "Want me to read your site and fill in the finer detail — the claims that are safe to make, what your customers are really trying to solve, and real examples of your writing voice?" Non-gating; a skeleton pack is a complete pack.

If they agree, read the site and enrich in place — never overwriting a value the user confirmed, always flagging what you could not find rather than guessing:

- **`products[].claims_allowed`** — the specific things the site actually asserts about each product, which become the only claims downstream copy may make. If the site is vague, leave it empty and say so; `landing-page` and `ad-creative` both sell on the key message alone when it is absent.
- **`audience[].pains` and `.jobs`** — the real problems and goals the site speaks to, per segment. These are the primary audience read for `ad-creative` and `landing-page`.
- **`voice-profiles.md` corpus** — pull the **real** opener lines, the founder's characteristic phrasings, and pointers to actual published posts into the profile authored above. This is the one part a conversation genuinely cannot supply.
- **`design.md`** — confirm or refine the typeface and palette against the site's real CSS, if the look step ran off inference.
- **The logo** — if no earlier site read already came away with one, take the pass described in **Logo** above now. Once per setup, not once per read.

If the brand has no published writing, say so plainly: the pack, design, and the authorable parts of the voice profile are all set, but the voice corpus stays sparse until real examples exist — no one can honestly generate a founder's real sentences from nothing.

## Finish

Confirm back in one or two plain sentences what you set up — the pack, and if you wrote them, that you captured their look (colours and fonts) and their voice so ads, pages, and posts come out on-brand. Then tell them they can start a campaign with `/halfborg-skills:new-campaign <id>`. Do not read the file contents back to them.

If you saved a logo, that file is the one thing worth them opening, so give its full path once and
say plainly that you took it off their site and it is worth a glance. If you looked and came away
with nothing, say that instead, in a clause.

## Tools 

If a url cannot be accessed, attempt to do so using jina.ai. Simply append the url in this format: https://r.jina.ai/[[url]]. This will provide markdown. 
