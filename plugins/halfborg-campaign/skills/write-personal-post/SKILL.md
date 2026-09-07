---
name: write-personal-post
description: >-
  Write blog posts and articles in a brand's first-person founder voice. Use
  this skill whenever the user asks to write, draft, rewrite, or edit content
  under a brand's founder byline. Trigger on phrases like "write a blog post
  about... in [founder]'s voice", "draft an article in the founder's voice",
  "rewrite this in [founder]'s voice", "make this sound like [founder]", or
  any content request that names a founder or brand blog by name. Covers
  news/research commentary, practical how-to guides, and personal product
  stories tied to the founder's own experience. Reads the active brand's
  shared voice rules (reading level, regional register, mood, paragraph
  rhythm, product table, phrases to avoid) from brands/<id>/voice/shared.md
  and its personal-post profile (persona, bio, opener bank, tells, annotated
  excerpts, sample posts) from brands/<id>/voice/personal-post.md; the
  methodology here (opener patterns, empathy+authority structure, sentence
  rhythm, content-type templates, honesty rules) is brand-agnostic and carries
  no phrase list of its own. Do NOT use for third-person customer testimonial
  / transformation-story posts (use write-customer-story), or when no brand's
  personal-post profile exists yet.
---

# write-personal-post — write in a brand's first-person founder voice

This skill writes first-person blog content as a brand's founder. The methodology below (how to
open a post, how to blend empathy with authority, how to structure each content type, the honesty
rules, the self-review checklist) is brand-agnostic and applies to any founder voice. It carries no
brand facts of its own — every persona detail, product, sample post, and real opener line comes
from the active brand's profile.

## Before anything: load the brand's voice profile

First, resolve `<id>`. Inside a campaign, the brand is `campaign.brand` in the campaign's
`system/manifest.yaml` — read it rather than asking, per `${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md`
section 1.1. Outside a campaign, the invocation names the brand.

This skill then needs, in order:

1. **The brand's shared voice rules.** `brands/<id>/voice/shared.md` — true of everything the brand
   publishes. It supplies the reading level and jargon rule, the regional register and its dose,
   the mood, the tense habits, the paragraph rhythm, geography and cultural references, trusted
   sources for citations, the regulated-advice boundary, the product table, the phrases this brand
   avoids, and its rewrite pairs.
2. **The brand's personal-post profile.** `brands/<id>/voice/personal-post.md` — read it fully
   before drafting. It supplies the founder's persona and bio, the voice-in-one-sentence
   description, any voice-era boundary, the point of view, the greeting and sign-off, the opener
   bank (real, usable lines), sentence-level tells, the literary devices this founder actually
   uses, the annotated excerpt bank, a worked customer-story callout, and pointers to sample posts.
3. **The brand pack.** `brands/<id>/pack.yaml` for audience, spelling, and mandatories not
   restated in the profile.

**Do not read `voice/customer-story.md`.** It is a different byline with deliberately opposite
rules, and loading it here bleeds third-person habits into a first-person post.

If no voice profile exists for the active brand, say so, **route the user to
`/halfborg-campaign:setup-brand`** — which authors the `voice/` files — and stop rather than inventing
a persona, a product, or a customer. Do not draft in a generic "founder voice" with no source material — the
whole point of this skill is that the founder's voice is a specific, real thing the profile
supplies, not something to improvise.

## The voice in one sentence

Read this from the profile's "Voice in one sentence" field before drafting, and hold it in mind as
the target for every paragraph.

## Voice era boundary, if the profile flags one

Some brands have published under the same byline for years, and the voice may have drifted. If the
profile names an era boundary (e.g. "only posts from date X onward reflect the current voice"),
respect it: do not use pre-boundary content as a style reference even if it shares the byline, and
prefer the sample posts the profile points to. If the profile names no era boundary, there is
nothing to apply here.

## Voice fundamentals

### Open with the reader's situation, a news hook, or the founder's own memory — never with a definition

Five opener patterns fit a founder voice. Pick the one that matches the post type. **Never open
with "X is a condition that…" or "In today's world, more and more people are dealing with…"** —
these are the definitional/generic-listicle openings this voice actively avoids.

1. **Sensory question** that anchors the reader in their own situation (best for practical guides).
   Illustrative shape only — pull the brand's real line from the profile's opener bank:
   > *"Have you ever caught yourself wincing at the one step in your routine that's supposed to be
   > making things better?"*
2. **News/research hook** (best for commentary on a relevant news story or new study): quote the
   source briefly, with a link, then pivot to what it means for the reader.
3. **The founder's own memory or experience** (best for personal product stories, journey posts):
   ground the post in something the founder actually lived through, often followed by a direct
   line like *"I know, because I've been there."*
4. **Customer pattern** (best for guides and "common problem" posts): anchor the founder's
   expertise in a repeated, real interaction with the community, not a generic claim.
5. **Recognition / shared-calculation hook** (best for cost, access, or system-level commentary):
   name a comparison the reader has likely made themselves.

### Speak to the reader, not at them

Use direct "you" generously, but always paired with empathy and lived knowledge — never lecturing.

- **Good:** *"You'll typically notice [symptom] that feels [sensation]."*
- **Good:** *"Here's something that catches a lot of people off guard: [counter-intuitive tip]."*
- **Bad:** *"It is important that readers understand the proper sequence for X."* (clinical,
  third-person, distancing.)

When the founder references their own community, keep it concrete and unflashy: *"I've seen
hundreds of people in our community struggle with this."*, *"I hear this from customers all the
time."*

### Empathy + authority blend — the signature move

Almost every long-form post performs the same two-step:

1. Validate the reader's frustration in plain language, briefly — two or three sentences, not
   extended emotional throat-clearing.
2. Pivot to structured, evidence-backed expertise: types, causes, routines, named specifics,
   citation links.

### First-person, but not self-indulgent

This is the founder's voice in the first person, but the "I" must serve the reader, not the
writer. Use "I" when:

- Sharing a specific experience that informs advice.
- Referencing things the founder tried that didn't work.
- Anchoring expertise in the community ("I hear this constantly", "I've seen hundreds of
  customers…").
- Stating an honest opinion or limit.

Do not use "I" to manufacture warmth that isn't earned. If a specific founder anecdote is needed
and not already supplied by the profile or the user, leave a placeholder:
`[FOUNDER'S PERSONAL NOTE: short paragraph from the founder about their own experience with X]` —
see the Honesty rules below.

### Spelling and cultural context

Use the spelling convention from `pack.voice.spelling` (UK or US). If the shared rules list geography
or cultural references specific to the brand's market (local institutions, media sources, currency
conventions, regional idiom to avoid), draw on those to make the advice feel local and concrete. If
they have no such section, don't invent one — write in neutral, geography-agnostic terms.

### Reading level and jargon

Write to the reading level the shared rules name, and honour the jargon rule beside it: where a
brand says technical terms get introduced and explained on first use, do that every time, not just
when it feels necessary.

A reading level is a floor on clarity, not a ceiling on the ideas. Simplify the sentence and keep
the argument. If the shared rules name no reading level, write for an intelligent general reader.

### Regional register, in doses

Some brands write in a local variety of English rather than a standard one. This section is the
single home for how that is applied; the sibling voice skills defer to it.

If the shared rules name a register, apply it exactly as they dose it: the stated number of
instances per piece, drawn only from the features the profile lists, never improvised from a general
sense of the accent. One well-placed construction reads as a real person. Three read as mimicry, and
mimicry of a variety the writer does not own is the failure mode here.

Keep the register out of anything that has to be precise: a product description, a dosage or safety
line, a price, anything the reader might act on. Slang takes its own, lower setting, because it ages
faster and shuts out readers who did not grow up with it.

If the shared rules name no register, write standard English and reach for nothing.

### Mood and time

Land the emotional register the shared rules name, and follow their tense habits. A brand that
reflects in past tense and instructs in present tense should not blur the two inside a paragraph.

### Sentence rhythm and punctuation

The shared rules may name this brand's own limits under paragraph rhythm and punctuation. **Where
they do, they win over the defaults below.**

- Paragraphs are short: 1 to 4 sentences by default, or whatever limit the profile sets. Even long
  posts feel airy because of paragraph breaks.
- Sentences vary. Mix tight declaratives with longer explanatory ones. Prefer active voice.
- Em-dashes exist but are used **sparingly**: at most one or two in a long post by default, or none
  at all where the profile says so. Prefer commas, full stops, semicolons, parentheses.
- Parenthetical asides work well for tone or honesty.
- Single-sentence paragraphs are allowed for emphasis, used deliberately, not every other line.

### Literary devices

Four moves suit a founder voice. Reach for them where they earn their place, never as decoration.

- **Analogy or metaphor**, usually domestic, to explain a mechanism the reader has no vocabulary for.
- **Personification** of a system, a body, or an object, which makes an abstract process feel like
  something with intent.
- **A rhetorical question mid-post**, not only in the opener, to hand the reader a decision.
- **A personal anecdote**, which is the one device that also builds trust.

If the profile lists the devices this founder actually uses, with real examples, prefer those and
stay inside that set. Never invent a signature metaphor for a real person.

### Rewrite pairs

Two habits are worth fixing by example. Both are generic; the profile may add the brand's own, which
take precedence.

- **Hype into plain statement.** "This revolutionary product will transform your life" becomes
  "this product can help you".
- **Filler into the sentence underneath it.** "It's important to note that the deadline is
  approaching" becomes "the deadline is approaching".

## Content types and routing

The founder writes (at least) three kinds of posts. Pick the right structure before drafting. (A
fourth content type on the same blog — customer testimonial / story posts — uses a different
byline and voice; see the routing note after Type 3.)

### Type 1 — News / research commentary

**When:** a relevant news article or new study has just appeared, or a regulatory/industry change
has just happened.

**Structure:**
1. **Opener** (pattern 2 or 5): quote the source briefly with a link, then pivot to what it means.
2. **What changed / what the source said.** A clear, 2–4 paragraph summary, with linked sources.
   Quote key numbers directly, with citations.
3. **The local/market-specific picture.** What's true in the brand's specific market that isn't
   true elsewhere — pull from the profile's geography section if it has one.
4. **What this means if you're not [the headline group].** Most readers aren't in the affected
   group the news is about; tell them why it matters anyway.
5. **What still helps.** Bring it back to the brand's actual products/services, linked in context,
   explicit that they don't replace professional care where relevant.
6. **Closing call (optional):** invite the reader to engage, comment, or share their story.

### Type 2 — Practical guide

**When:** the post answers "what is X, what causes X, what do I do about X" for a specific
condition, problem, or topic in the brand's category.

**Structure:**
1. **Opener** (pattern 1 or 4): sensory question or community-pattern observation.
2. **What does [the problem] actually look like?** Sub-types as sub-headings, each with a plain-
   language cause and, where relevant, a write-customer-story callout (see below).
3. **Why this is common for the target audience.** Bolded triggers as paragraph leads.
4. **When to escalate / when you should be worried.** A short, direct red-flag list.
5. **A step-by-step routine.** Numbered steps, each explaining the *why* before naming a
   product, linked in context with one sentence on why this one.
6. **Common practical questions.** Direct, paragraph-form answers to real situational questions.
7. **When to see a professional.** Bullet list of escalation triggers. Always present if the
   category has any safety dimension.
8. **Products mentioned in this guide.** Numbered list in routine order, one-line descriptions.
9. **Closing.** Short, acknowledges the realistic timeline, invites the reader to reach out.
10. **Related reading.** 3–5 links to other posts on the brand's blog.

### Type 3 — Personal product story

**When:** the founder wants to recommend a single product through the lens of their own journey.
Less polished than the practical guide, more diary-like.

**Structure:**
1. **Opener** (pattern 3): direct address to the reader going through the same thing right now.
   Short validation, then a link to the founder's own related journey content.
2. **The problem this product addresses.** Plain language on what was going wrong.
3. **What I tried first.** A bullet list of things the founder actually tried that didn't work,
   each with a one-sentence "why it didn't work" — this is the trust-building section.
4. **The product that worked better.** Name, mechanism in plain English, key ingredients/features,
   pros noticed, and at least one honest caveat. Never sell without naming a limit.
5. **The routine.** Numbered steps with the product positioned in context.
6. **Alternatives.** Other brand products that solve the same problem for people who can't use the
   first one — generous, reader-first.
7. **Closing.** A short paragraph reminding the reader that progress isn't always linear.

### Note on customer testimonial posts (handled separately)

Standalone customer story posts run under a different byline and a different voice (third-person,
"we/our"). That format has its own skill: **`write-customer-story`**. If the user asks the founder
for a customer testimonial post, either clarify which format they want, or route to
`write-customer-story`.

## Product integration rules

Link products in context, not as a stuffed list. The pattern is always: **the reader has a
specific problem → here's the product that solves it → here's the mechanism in one sentence →
linked product name.** Use the shared rules' product table for exact names, roles, and canonical URLs
— never invent a product, mechanism, or URL. If a URL isn't certain, leave a placeholder like
`[Product Name](URL-needed)` rather than guessing.

Every product mention names at least one trade-off or limitation if any exists. If a product
genuinely has none, name a *use limit* instead (e.g. "a little goes a long way").

## Customer-story callouts inside guides

Practical guides can feature a short blockquoted customer story to make abstract advice concrete —
see the personal-post profile's worked customer-story callout. Rules:

- Use the customer's first name only (or honorific + surname where appropriate).
- Link the descriptive phrase to the actual testimonial post if one exists.
- One specific outcome with a measurable timeline.
- If the testimonial URL isn't known, leave a placeholder — **do not invent a URL.**
- If the user hasn't supplied a real customer to feature, don't invent one. Either omit the
  callout or insert a placeholder: `[CUSTOMER STORY: insert real testimonial — first name,
  specific outcome, timeline, link]`.

## Honesty and medical/regulated-content rules — non-negotiable

Personal-post content often reaches an audience acting on what it says. The following apply to
every draft, no exceptions.

1. **Do not invent the founder's personal anecdotes.** If a draft needs a specific founder
   experience the user hasn't supplied, insert `[FOUNDER'S PERSONAL NOTE: short paragraph from the
   founder about their own experience with X]` and let them fill it in. A fabricated anecdote
   attached to a real person's byline is a real harm.
2. **Do not invent customer stories or testimonials.** Real names linked to real testimonial posts
   only; placeholders otherwise.
3. **Do not invent statistics, study citations, or news quotes.** Every number or claim attributed
   to a source must be sourced — find one through web search, or leave
   `[STAT/SOURCE: specific figure with citation needed]`. Use the shared rules' trusted-sources list
   if it has one.
4. **Include an escalation qualifier** ("consult a professional if…") in any post that discusses
   severity, where the category has a safety dimension. Not optional if the brand's category
   involves health, safety, or regulated claims.
5. **Never position the brand's product as a replacement for professional/medical treatment**
   where that boundary matters to the category. State it plainly when relevant.
6. **Never invent a product, mechanism, or ingredient list.** If not in the profile's product
   table and the user hasn't supplied source material, ask first.
7. **Never invent a URL.** Every link is either real and verifiable, or a clearly marked
   placeholder.
8. **Honour the shared rules' regulated-advice boundary, if it names one** (e.g. no personalised
   medical/diet/legal advice on the blog) — redirect to the paid service or professional channel
   it names instead.

## Phrases to avoid

The list belongs to the brand, not to this skill. Read **Phrases to avoid** in the shared voice
rules and treat it as binding: if a draft contains one, rewrite that sentence. A brand that has
deleted an entry from its own list has decided the phrase is genuinely its voice, and that decision
stands.

If the brand has no such list, fall back to your own judgement about what reads as machine-written,
and say so when you hand the draft back rather than pretending the check happened.

**Nuance on cliché:** a sentence-starting "But", "And", or "So" is fine and can be characteristic.
Single-word punctuation paragraphs are fine if used sparingly for emphasis.

**Nuance on em-dashes:** reduce them. A single em-dash in a long post is fine; more than two is too
many — rewrite.

## Sentence-level tells

A distinctive voice has a handful of characteristic phrases that read as authentic rather than
cliché. If the profile lists the brand's own tells, use them where they fit — don't force them. If
the profile has none, don't invent a fixed phrase list; let the voice come from the structure and
rules above.

## Self-review checklist

Before handing the draft back, work down this list:

1. Does the opening match one of the five patterns? Not a definition or "in today's world".
2. Is the voice consistently first-person founder? Not "we", not impersonal third person.
3. Are the founder's personal anecdotes either drawn from a real source or marked as
   `[FOUNDER'S PERSONAL NOTE: …]` placeholders? No fabrication.
4. Are customer stories either real (with linked testimonial post) or marked as
   `[CUSTOMER STORY: …]` placeholders? No fabrication.
5. Are statistics and news claims either sourced with a real link or marked `[STAT/SOURCE: …]`?
6. For severity-related posts, is there an explicit escalation qualifier?
7. Are products linked in context, with one sentence on why they fit this step?
8. Does every product mention name at least one trade-off, limit, or use caveat where appropriate?
9. Is there at least one internal cross-link to another post or product page?
10. Correct spelling convention throughout (per `pack.voice.spelling`)?
11. Local/cultural context applied where the profile supplies one?
12. Paragraphs within the profile's own limit, or 1–4 sentences if it sets none? Plenty of white
    space?
13. Em-dashes within the profile's own limit, or used sparingly (max 1–2 in a typical post) if it
    sets none?
14. Anything from the brand's phrases-to-avoid list? Run a check.
15. Written at the profile's reading level, with every technical term explained on first use?
16. Regional register applied at its stated dose and no more, and kept out of the precise lines?
17. Does the closing match the post type?
18. Would the reader feel met and informed, not lectured? If not, soften the expert sections with
    more validation.

## Reference writing

Two tiers, and the first is the one more likely to exist.

**The annotated excerpt bank** in the personal-post profile: short real passages, each with a note
saying what it demonstrates. Read it before drafting. It is the closest thing to watching this
founder write, and the commentary tells you which move to copy.

**Whole sample posts**, if the profile points to any (typically at
`brands/<id>/voice/references/founder/`). Read whichever is closest to the content type being
requested. An excerpt shows a move; a whole post shows structure, which no excerpt can.

Use both where both exist. They are the concrete, in-voice examples this generic methodology can't
supply on its own.

## When to ask the user before drafting

Ask before writing if any of these are true:

- The post needs a specific founder anecdote that isn't already in published content or supplied
  by the user.
- The post needs a customer story and the user hasn't supplied the source testimonial or a link.
- The post cites a specific news article, study, or statement the user hasn't linked.
- The post recommends a product not listed in the shared rules' product table.
- The request is ambiguous about post type (guide? personal story? news commentary? — ask).

For everything else, go ahead and draft. Always honest, always linked, always grounded.

## When you hand it back

Follow `${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md` sections 5 and 6. Three things, in this
order:

1. **Every placeholder you left**, listed plainly — the founder's own anecdote, an unsourced figure,
   a customer story you would not invent. Say what each one needs and who can supply it. Do not
   leave them to find the square brackets themselves.
2. **The one thing worth checking** in the draft: usually whether it actually sounds like the person
   whose name is on it.
3. **One next action** — the next thing on the campaign's list, named as a thing, or an offer of a
   different angle on the same post. Name no skill.
