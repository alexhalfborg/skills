---
name: write-email
description: >-
  Write a brand's marketing emails and newsletters in the brand's own voice. Use this skill whenever
  the user asks to write, draft, or rewrite an email, a newsletter, an email sequence, a broadcast, or
  a launch/announcement email under a brand byline. Trigger on phrases like "write the launch email",
  "draft the newsletter", "write an email sequence for [offer]", "the welcome email", "rewrite this
  email in [brand]'s voice", "the abandoned-cart email", "our monthly newsletter". Reads the active
  brand's shared voice rules from brands/<id>/voice/shared.md plus the byline's own profile —
  brands/<id>/voice/personal-post.md for a founder broadcast or brands/<id>/voice/customer-story.md for a
  team newsletter (the same corpus write-personal-post and write-customer-story use — no separate email
  profile is required, and only one byline is ever loaded), brands/<id>/pack.yaml (audience,
  products with price/url/claims_allowed, voice.spelling, mandatories, nogos), and, inside a campaign,
  campaigns/<slug>/docs/message.md (key message + chosen tagline) and brief.md (objective, audience).
  Its own methodology — subject line and preview text, the one-idea section flow, a single primary CTA,
  sequence cadence, and the honesty rules — is brand-agnostic and works fully offline (no external
  marketing skill needed). Output lands in campaigns/<slug>/content/<name>.md, logged and site-rebuilt.
  Do NOT use for blog posts or articles (write-personal-post for founder voice, write-customer-story for
  testimonials), for paid-ad copy (write-ad-creative), for organic social captions, or to design an HTML
  email template (this writes the copy; it does not build markup).
---

# write-email — write a brand's emails and newsletters in its own voice

This skill writes email and newsletter **copy** in a brand's voice. The methodology below (how to
write a subject line, how to structure a broadcast versus a sequence, the single-CTA discipline, the
honesty rules, the self-review checklist) is brand-agnostic and applies to any brand. It carries no
brand facts of its own — every persona detail, product, price, URL, and real turn of phrase comes
from the active brand's profile and pack.

It is the bundled, offline email peer of the voice skills: where `write-personal-post` writes the founder's
blog and `write-customer-story` writes third-person testimonials, this writes the inbox. There is no
external dependency — everything it needs is in the brand's own files.

Where the neighbours sit:

- `write-personal-post` / `write-customer-story` — the blog voices. This skill reuses the **same** voice profile
  they read (founder or team), so a newsletter sounds like the brand's other writing.
- `content-writer` — the agent that routes a written-content request to the right voice skill; it
  invokes this one for email/newsletter surfaces.
- `write-message` — locks the key message and tagline a campaign email must ladder up to. Read-only.
- `write-ad-creative` — paid copy, a different discipline. Email is owned, permissioned, and long-lived; it
  is not an ad.

Campaign paths and filenames follow `${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md`; that spec wins over any
path shorthand here.

## Before anything: load the voice and the facts

First resolve `<id>`. Inside a campaign, the brand is `campaign.brand` in the campaign's
`system/manifest.yaml` — read it rather than asking, per `${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md`
section 1.1. Outside a campaign, the invocation names the brand.

Then read, in order:

1. **The brand's shared voice rules.** `brands/<id>/voice/shared.md` — the reading level and jargon
   rule, the regional register and its dose, the mood, the tense habits, the paragraph rhythm, the
   product table, the regulated-advice boundary, the phrases this brand avoids, and its rewrite pairs.
2. **One byline profile, never both.** Decide the byline first, then read only that file: a
   founder-voice broadcast reads `brands/<id>/voice/personal-post.md` (persona,
   voice-in-one-sentence, point of view, greeting and sign-off, opener bank, sentence-level tells);
   a team/brand newsletter reads `brands/<id>/voice/customer-story.md` (team byline and framing,
   naming convention, greeting and sign-off, opener bank). The two contradict each other on purpose,
   so loading both puts opposite rules in front of you. Newsletters most often go out in the
   founder's first person; if the request is ambiguous, ask which byline, or default to the founder
   for a personal broadcast and the team for a roundup. If the brand has neither profile, say so,
   **route the user to `/halfborg-campaign:setup-brand`** — which authors the `voice/` files — and
   stop rather than inventing a persona.
3. **The brand pack.** `brands/<id>/pack.yaml` — `audience` (pains and jobs, the reason to open),
   `products[]` (`name`, `price`, `url` for the CTA, `claims_allowed` — the **only** things an email
   may assert about a product), `voice.spelling`, `mandatories` and `nogos`. **Absent `mandatories`
   means unconfirmed, not none** — confirm rather than assuming the brand has no rules (many email
   markets also carry a legal footer / unsubscribe requirement; ask if it is not stated).
4. **The campaign creative, if this belongs to a campaign.** `docs/message.md` for the key message the
   email must ladder up to and the chosen tagline; `docs/brief.md` for the objective and audience. The
   email expresses the locked message; it does not invent a new one. If this is campaign work and
   `message.md` is missing, do not silently proceed: say there is no locked message, offer to write
   from `brief.md` alone, and only continue with that explicit go-ahead. Outside a campaign, neither
   file is expected — resolve what applies per `${CLAUDE_PLUGIN_ROOT}/schema/preflight.md`.

## The email in one line

Before drafting, write the email's single job in one sentence: *who* it is to, *why it lands now*, and
the *one action* it asks for. An email with two jobs is two emails. Hold that sentence as the target
for the subject line, the body, and the CTA.

## Subject line and preview text

The subject line and the preview text (the grey snippet after the subject) are one two-part unit and
the only thing that earns the open.

- Draft **3–5 subject-line options** and let the user pick; do not ship a single guess.
- Range across the useful registers: a curiosity/question line, a plain benefit line, a
  news/timeliness line, and the brand's own voice tell. Match the profile's register — a warm
  peer-to-peer brand does not send a hype subject line.
- Keep it short enough to survive a phone inbox (aim ~40 characters). No ALL CAPS, minimal emoji, and
  nothing on the `nogos` list — an email subject is still a brand claim.
- The **preview text** completes or complicates the subject; it never repeats it. It is not throwaway —
  a blank preview shows raw HTML or the first body line.

## Structure by email type

Pick the type before drafting.

### Type A — Broadcast / newsletter (one-to-many, no reply expected)

1. **A greeting that sounds like the brand**, not "Dear valued customer". Use the byline profile's
   **Greeting** verbatim if it has one. If it says none, open straight into the first line. If the
   field is missing altogether, set the closeness from its warmth line and the shared rules' mood.
2. **A single lead idea**, opened with a line from the byline profile's **Opener bank** (a real
   memory, a reader situation, a news hook) — the same openers the blog voice uses, compressed for
   the inbox. Where the bank is empty, the annotated excerpts show how this byline gets going.
3. **The body, one idea deep, not many idea shallow.** A newsletter roundup may carry 2–3 short blocks,
   but each is self-contained with its own tiny CTA; a broadcast carries one. Short paragraphs (1–3
   lines by default, or the shared rules' own limit where it is tighter) — inboxes are read on phones.
4. **One primary call to action**, as a clear text link or button label pointing at a real
   `products[].url` or page. Secondary links are fine; there is only **one primary**.
5. **A warm sign-off** in the byline's voice, taken verbatim from the profile's **Sign-off** field.
   If that field says "not set", **ask** — do not sign a name on someone's behalf, and do not invent
   a closing line for a real person.
6. **The footer**: whatever `mandatories` require (an unsubscribe line, a physical address, a
   disclaimer). Never omit a required footer; flag it if the pack does not specify one.

### Type B — Sequence (welcome, launch, nurture, cart, post-purchase)

A sequence is several emails with **one arc** and **one goal**, each email earning the next open.

- State the arc first: how many emails, the beat each one plays, and the single conversion goal.
- Common beats: **welcome** (deliver the promised thing, set the relationship, one small next step);
  **launch** (tease → open → value → proof → urgency/close, one email per beat); **nurture** (teach,
  no ask or a soft ask); **cart/abandon** (remove the specific friction, do not just nag); **post-
  purchase** (onboard, reassure, invite the review or the next product).
- Each email is a Type-A structure with **one CTA**; escalation across the sequence is in urgency and
  proof, never in stacking more asks into one email.
- Space the cadence to the goal (a launch is tight, a nurture is patient) and say the intended send
  gaps in the doc.

## Product and claim rules

Link products in context, not as a stuffed list: **the reader has a problem → here is the product that
helps → one sentence on how → the linked name at its real `url`.** Use the pack's product table for
exact names, prices and canonical URLs — never invent a product, price, mechanism or URL; leave a
`[URL-needed]` / `[PRICE-needed]` placeholder if unsure. Only `claims_allowed` may be asserted about a
product; anything stronger gets softened and left with an inline `⚠️ CLAIM CHECK:` flag rather than
shipped. Honour every `nogo`.

## Honesty rules — non-negotiable

Email reaches a permissioned audience who act on it. Same discipline as `write-personal-post`:

1. **No invented statistic, study, quote, customer, product, mechanism, or URL.** Source it, or leave a
   clearly-marked `[STAT/SOURCE: …]` / `[URL-needed]` placeholder.
2. **No fabricated scarcity or fake urgency.** A deadline in an email is real or it is not in the email.
   No "only 3 left" unless it is true.
3. **Honour the regulated-advice boundary** the shared voice rules name (e.g. relief/soothing language
   only, no cure or medical claims) — even when quoting a customer who used stronger words.
4. **Avoid the phrases the brand avoids.** The list is `Phrases to avoid` in the shared voice rules,
   and it is binding here as it is on the blog. This skill keeps no list of its own. If the brand has
   none, use your own judgement about what reads as machine-written and say so on hand-back.
5. **The unsubscribe / legal footer is not optional** where the market requires it. If the pack does not
   state the requirement, flag it rather than guessing the legal text.

## Where the output goes

Campaign work → `campaigns/<slug>/content/<descriptive-name>.md` (e.g. `content/launch-email.md`, or a
sequence in one doc with each email under an `## Email N —` heading). Paths per
`${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md`. Then follow that spec's §4.1 log step: append one `generate`
line per deliverable doc (`status: iteration`, `file` pointing at the `.md`, the subject-line options
or arc in `notes`; no `model`/`cost_usd` — nothing was rendered by a model). Then rebuild the page
once — follow `build-site` for `campaigns/<slug>`.

Outside a campaign, write where the user asks and skip the log step.

## Self-review checklist

Before handing back:

1. One job, one primary CTA? (If two asks, split into two emails.)
2. Subject line: 3–5 options offered, short, on-voice, nothing on `nogos`?
3. Preview text present and not a repeat of the subject?
4. Voice matches the chosen byline's profile? Not generic "marketing email" tone?
5. Every product claim within `claims_allowed`? Stronger claims softened or `⚠️ CLAIM CHECK:` flagged?
6. Real product names, prices and URLs — or clearly-marked placeholders? No invented links.
7. No fabricated stat, quote, customer, or scarcity?
8. Regulated-advice boundary honoured where the profile names one?
9. Required footer (unsubscribe / address / disclaimer) present, or flagged as needed?
10. Correct spelling convention (`voice.spelling`)? Written at the profile's reading level, with any
    regional register at its stated dose? Paragraphs and em dashes within the shared rules' limits?
    Nothing from the brand's phrases-to-avoid list?
11. Inside a campaign: does the email ladder up to the `message.md` key message and use the chosen tagline?
12. Short paragraphs, phone-readable, scannable?

## When to ask before drafting

Ask if: the byline is ambiguous (founder or team); the email cites a real deadline, offer, or price the
user has not given; it needs a customer story not supplied; the footer/legal requirement is unstated; or
the request is really a sequence with an unstated goal or length. For everything else, draft — always
honest, always one job, always linked to a real place.

## When you hand it back

Follow `${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md` sections 5 and 6. Three things, in this
order:

1. **The subject-line options**, so they can pick one. This is the decision they actually have to
   make.
2. **What you left for them to fill or confirm** — every placeholder, every real deadline, price or
   link you would not invent, and any claim you flagged. Name them plainly; do not make them hunt
   through the draft for square brackets.
3. **One next action.** The next thing on the campaign's list, named as a thing, or an offer of a
   second version with a different angle. One offer, not a menu, and name no skill.
