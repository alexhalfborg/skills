---
name: write-customer-story
description: >-
  Write third-person customer testimonial and "transformation story" posts
  for a brand's blog, under the brand's team byline (not the founder's). Use
  this skill whenever the user asks for a customer story post, transformation
  story, testimonial post, before-and-after case study, or any post centred
  on a named customer's journey with the brand. Trigger on phrases like
  "write a customer story about [name]", "draft a testimonial post", "write a
  transformation story", "case study for [brand]", or any request that
  involves a named customer's outcome as the central subject. Third-person
  about the customer, "we / our" for the brand, customer blockquotes, product
  walkthrough, before/after photos. Reads the active brand's shared voice
  rules (reading level, regional register, mood, paragraph rhythm, product
  table, phrases to avoid) from brands/<id>/voice/shared.md and its
  customer-story profile (team byline, naming convention, opener bank,
  annotated excerpts, sample posts) from brands/<id>/voice/customer-story.md;
  the methodology here (quote taxonomy, results-timeline structure, honesty
  rules) is brand-agnostic and carries no phrase list of its own. Do NOT use
  for the founder's first-person posts (use write-personal-post), or when no
  brand's customer-story profile exists yet.
---

# Customer Story Voice — Third-person customer testimonial and transformation posts

This skill writes a recurring format: a real customer reaches out to the brand, follows a
recommended product or service, and sees a real result. The post tells that story, shows the
before/after, and quotes the customer extensively. It runs under the brand's team byline, not the
founder's, and uses a different voice from write-personal-post's first-person guides and personal
product stories.

The methodology below (opener patterns, quote taxonomy, structure template, honesty rules, self-
review checklist) is brand-agnostic. It carries no brand facts of its own — the byline name, real
product table, and real sample posts come from the active brand's profile.

## Before anything: load the brand's voice profile

First, resolve `<id>`. Inside a campaign, the brand is `campaign.brand` in the campaign's
`system/manifest.yaml` — read it rather than asking, per `${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md`
section 1.1. Outside a campaign, the invocation names the brand.

This skill then needs, in order:

1. **The brand's shared voice rules.** `brands/<id>/voice/shared.md` — true of everything the brand
   publishes. It supplies the reading level and jargon rule, the regional register and its dose,
   the mood, the tense habits, the paragraph rhythm, geography and cultural references, trusted
   sources, the regulated-advice boundary, the product table, the phrases this brand avoids, and
   its rewrite pairs.
2. **The brand's customer-story profile.** `brands/<id>/voice/customer-story.md` — read it fully
   before drafting. It supplies the team byline and framing, the point of view, the customer naming
   convention, the founder cross-link (if the brand's founder has a relevant story to link to), the
   greeting and sign-off, the opener bank, the annotated excerpt bank, and pointers to sample posts.
3. **The brand pack.** `brands/<id>/pack.yaml` for audience, spelling, and mandatories.

**Do not read `voice/personal-post.md`.** It is the founder's first-person byline with deliberately
opposite rules, including openers this voice is allowed to use and that one forbids. Loading it here
pulls "I" into a post that must never carry one.

If no voice profile exists for the active brand, say so, **route the user to
`/halfborg-campaign:setup-brand`** — which authors the `voice/` files — and stop rather than inventing
a byline, a customer, or a product. This format only works with real source material.

## The voice in one sentence

A brand team member telling a real customer's journey in third person, weaving the customer's own
words through the narrative, walking the reader step-by-step through the products or service that
worked — with respect for the customer's experience, honest about the timeline, and never
overselling.

## What separates this from write-personal-post

- **Byline:** the brand's team (per the profile), not the founder. The post never says "I" except
  inside customer quotes.
- **Pronoun for the brand:** "we" / "our" throughout.
- **Subject:** the central character is the customer, not the writer. The founder, if referenced
  at all, appears in third person (e.g. "our founder"), per the profile's framing.
- **Tone:** narrative + product/service walkthrough. Less empathy-as-opener, more
  situation-establishing.
- **Definitional openings allowed.** Unlike write-personal-post, an educational lead ("What is X?") is
  fine here, since the post often serves double duty as an educational primer that the customer's
  story then illustrates.

If the user has asked for the founder's own voice, or a post under the founder's byline, route to
`write-personal-post` instead.

## Voice fundamentals

### Two opener patterns

1. **Educational definitional lead + customer-as-illustration** (common when the post needs to
   teach the reader something general before showing how it played out for the customer): open
   with a short definitional section on the condition/problem/topic, then transition into the named
   customer's story — *"[Customer] went through exactly this. Here's what that looked like, and
   what eventually helped."*
2. **Direct customer setup** (use when the topic is one the reader already understands): open
   directly on the customer's situation, no definitional lead needed.

Pull the brand's real worked examples of both patterns from the profile's opener bank. Never open
with the founder's first-person voice (a sensory "you" question, or "I") — that belongs to
write-personal-post, not this skill.

### Third-person about the customer, but use their real name throughout

The customer is named (with their permission) — first name from the first paragraph and
consistently, or an honorific + surname where appropriate for the situation. Avoid coy phrasings
like "one customer" or "a young mum"; the named-real-person reality is what makes the post
credible.

### "We" / "our" for the brand, never "I"

The writer is positioned as part of the brand's team. Always "our consultant advised…", "with
guidance from us…", "we've supported many people who've walked this path…", never "I recommended"
or "in my view".

If the post needs the founder's lived experience as authority backing, reference them in third
person with a link, per the profile's founder cross-link section — never put words in the
founder's mouth.

### Quote the customer extensively — long blockquotes, lightly edited

The post's emotional authority comes from the customer's own voice. Quote them generously — 3 to 5
long quotes is typical. Light editing for clarity and grammar is fine; preserve their voice and any
specific phrasing that captures the experience. Common quote types, aim for one per slot where the
customer actually said something fitting:

- **The situation quote** — the difficulty before.
- **The decision quote** — why they tried something different.
- **The product/service quote** — what worked, in their words.
- **The outcome quote** — what changed.
- **The forward-looking quote** — life after, message to others.

Do not fabricate quotes — see the honesty rules below.

### Step-by-step walkthrough, with the customer's voice woven through

The product/service section is the load-bearing middle of the post:

1. **Section heading:** "Our Recommendation", "What [Name] Changed", or similar.
2. **Each product/step gets its own sub-heading**, framed around what fits the customer's
   situation.
3. **Each step explains what it does** in one short paragraph, linked, mechanism in plain
   language.
4. **A customer quote about that step**, in a blockquote, wherever one exists.

### Before/after evidence with factual captions

If the format includes before/after photos, caption each factually and unflashily, prefixed with
something like *"Above: …"*. A small but characteristic honesty move: note anything else the photo
shows that isn't the point (e.g. an unrelated detail visible in frame) — it signals care rather
than staging.

### Results section with a concrete timeline

Always include a results section that names the timeline explicitly — the transformation is
calibrated by time-to-improvement, not by adjectives. A time-anchored cadence (e.g. one week, two
weeks, one month), each with a specific observation, reads as credible; vague adjectives don't.

### Closing reflection

End with two short beats:
1. **What the change meant beyond the surface result** — sleep, confidence, work, relationships,
   daily life.
2. **The customer's message to others** — a short quoted line about hope, patience, or
   persistence.

### Products/services recommended — clean list at the end

Always end with a clean list of everything mentioned in the post, each linked. This serves as a
quick-glance reference.

## Structure template

Use this as the scaffold for every customer story post. Adapt sections as needed for the specific
story.

```
H1: [Title — usually framed around the outcome or the named customer's hook]

[Optional H2: educational lead — 3–6 paragraphs, with linked sources for any
 factual claims. Skip if the topic is self-evident from the title.]

[Optional callout link inside the educational lead, pointing to the founder's
 own related first-person post, per the profile's founder cross-link.]

## [Customer name]'s Story (or similar)

[1–2 paragraphs introducing the customer — their situation, what they do,
 how long they've had the problem, what they tried before.]

[Blockquote: situation quote in the customer's own words]

[1–2 paragraphs setting up the decision point: what changed, why they
 reached out to the brand.]

[Blockquote: decision quote]

### What [Name] Changed (or "Our Recommendation")

[Step 1 paragraph + linked product/service + mechanism in plain English]

[Blockquote: customer quote about that step, where available]

[Step 2, 3, 4 as needed]

### [Name]'s Results

[1–2 paragraphs describing the timeline with specific observations.]

[Before/after evidence, if the format uses it, with factual captions.]

[1 paragraph reflection on what the change meant beyond the surface result.]

[Optional: a forward-looking customer quote.]

[Optional: link to the founder's own related story, per the profile.]

### Products/services recommended

- [Item 1](URL)
- [Item 2](URL)
```

## Product integration rules

Use the shared rules' product table for exact names, roles, and canonical URLs — never invent a
product, mechanism, or URL. If a product mentioned in the customer's story isn't in the table, ask
for the canonical reference rather than guessing.

## Honesty and integrity rules — non-negotiable

These posts are about real people with real experiences. Readers may act on them. The following
apply to every draft, no exceptions.

1. **Do not invent a customer, customer story, quotes, timeline, or photos.** The post must be
   built from real source material — a real testimonial, with permission. If the user hasn't
   supplied the customer's actual words, ask. Do not paraphrase a real situation into invented
   quotes; blockquotes must be the customer's actual words (lightly edited for clarity).
2. **Do not invent before/after evidence.** If the format uses photos and the user hasn't supplied
   them, insert `[BEFORE PHOTO: from customer, detail, date]` / `[AFTER PHOTO: from customer, X
   later, detail]` placeholders.
3. **Do not invent timelines.** Specific timeframes are factual claims. If the user hasn't
   supplied the actual timeline, ask.
4. **Do not invent products/services used.** The customer's actual experience — confirmed by the
   customer or by the brand's own records — is the only source. Don't assume a standard routine;
   ask for the actual list.
5. **Include a safety/representativeness qualifier where the category warrants it** — e.g. "every
   journey is different, and what worked for [name] may not be the right approach for someone
   else", plus an escalation note if the category has a safety dimension.
6. **Reference the founder's lived experience in third person only, per the profile.** Don't put
   words in the founder's mouth.
7. **Get permission, in writing, before publishing.** The skill can't enforce this, but should
   remind the user: *"Confirm the customer has given written permission to publish their story,
   name, and photos before publication."* Add this as a final note on every draft.
8. **No mid-article hard-sell interruptions.** Products/services are linked in context within the
   walkthrough; the list at the end is the only "here's where to get it" section.

## Phrases to avoid

The list belongs to the brand, not to this skill. Read **Phrases to avoid** in the shared voice
rules and treat it as binding: if a draft contains one, rewrite that sentence. A brand that has
deleted an entry from its own list has decided the phrase is genuinely its voice, and that decision
stands.

Two entries matter more in this format than anywhere else, so check them by hand even if the brand's
list is short. Superlatives such as "miracle", "transformative" or "revolutionary" do the customer's
work for them; let the evidence and the timeline carry it. And a word like "lifesaver" is fine
inside a blockquote where the customer actually said it, but the narrative voice should never
editorialise that way.

If the brand has no such list, fall back to your own judgement about what reads as machine-written,
and say so when you hand the draft back rather than pretending the check happened.

## Rhythm and punctuation

The shared rules may name this brand's own limits under paragraph rhythm and punctuation. **Where
they do, they win over the defaults here.** Keeping to them matters: these posts sit on the same
blog as the founder's, and a different rhythm reads as a different publication.

- Paragraphs run 1 to 4 sentences by default, or whatever limit the profile sets.
- Em-dashes sparingly: at most one or two in a long post by default, or none at all where the
  profile says so. Prefer commas, semicolons, full stops, parentheses.

## Reading level and register

Write at the reading level the shared rules name, explaining any technical term on first use. If
they name a regional register, apply it at its stated dose and no more, and keep it out of product
descriptions, safety lines and prices. The full mechanic is in `write-personal-post`; it applies
here unchanged.

Customer quotes are exempt from all of this. Quote people as they speak.

## Self-review checklist

Before handing the draft back:

1. Is the byline implicitly the brand's team (no "I" outside customer quotes)?
2. Is "we / our" used consistently when referring to the brand's actions or recommendations?
3. Is the customer named consistently, per the profile's naming convention?
4. Are customer quotes real, supplied by the user, and lightly edited only?
5. Are there at least 3 customer blockquotes spread through the post (situation, decision/product,
   outcome)?
6. Is the timeline named explicitly in the results section?
7. If the format uses photos, are they either supplied or marked with placeholders?
8. Is there a products/services-recommended list at the end with everything linked?
9. Is there a safety/representativeness qualifier where the category warrants it?
10. Is the founder (if referenced) in third person only, per the profile — no "I" sneaking in from
    their side?
11. Correct spelling convention throughout (per `pack.voice.spelling`)?
12. Anything from the brand's phrases-to-avoid list, superlatives included? Run a check.
13. Paragraphs and em-dashes within the profile's own limits, or the defaults if it sets none?
14. Written at the profile's reading level, with any register applied at its stated dose?
15. Final note to user reminding them to confirm the customer's written permission to publish.

## Reference writing

Two tiers, and the first is the one more likely to exist.

**The annotated excerpt bank** in the customer-story profile: short real passages, each with a note
saying what it demonstrates. Read it before drafting; the commentary tells you which move to copy.

**Whole sample posts**, if the profile points to any (typically at
`brands/<id>/voice/references/customer-stories/`). Read whichever is closer to the target format. An
excerpt shows a move; a whole post shows structure, which no excerpt can.

Use both where both exist. They are the concrete, in-voice examples this generic methodology can't
supply on its own.

## When to ask the user before drafting

Ask before writing if any of these are true:

- The user hasn't supplied the actual customer's name and/or written permission to publish.
- The user hasn't supplied the customer's actual quotes. *(Do not fabricate quotes. Even
  paraphrased "based on their story" quotes are not allowed in this format.)*
- The user hasn't supplied the products/services the customer actually used.
- The format uses photos and the user hasn't supplied them or confirmed they'll be added.
- The user hasn't supplied the timeline.
- The customer is a minor and there's no explicit confirmation that a parent/guardian has
  consented and that only the parent's name will be used in the byline content.

For everything else, go ahead and draft. End the draft with the standing reminder to confirm
written permission before publication.

## When you hand it back

Follow `${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md` sections 5 and 6. Three things, in this
order:

1. **The permission question, first and plainly.** Has the customer given written permission to
   publish their story, their name and their photos? This is the one thing that stops the piece
   going out, so it leads — never tuck it under the good news.
2. **Every placeholder you left**, listed plainly, with what each one needs: a missing quote, a
   timeline, a photo, a product they actually used.
3. **One next action** — the next thing on the campaign's list, named as a thing, or an offer of a
   shorter cut for social. Name no skill.
