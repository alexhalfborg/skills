# Meadowlark — shared voice rules

**This whole file is an invented example, for shape only.** Meadowlark is a brand that does not
exist. Copy the structure, never the content.

Every voice skill reads this file, whoever the byline is. It holds the rules that are true of all
the brand's writing. Anything that changes with the byline — persona, openers, sign-off, point of
view — lives in the byline's own file next to this one:

```
brands/<id>/voice/
  shared.md            this file
  personal-post.md     the founder's first-person voice
  customer-story.md    the team's third-person voice
  references/          real published pieces, kept whole
```

The brand's *facts* live in `pack.yaml`: products, prices, claims, must-includes, never-says, and
the UK/US spelling setting. This file holds voice and evidence only. Do not restate a pack value
here. A field that restates another source is a field that will contradict it later.

## How to read the tiers

Every field is marked with one of three words. They tell whoever fills this in how far they are
allowed to go.

- ***Ask*** — answered in conversation. Fill it confidently.
- ***Infer*** — proposed from what the brand has already said, then confirmed. Say in the field
  that it was inferred, so the next person knows nobody has verified it.
- ***Corpus*** — comes only from the brand's real published writing. Where there is none, leave the
  field explicitly empty with a note saying what would fill it. **Never invent one.** An invented
  example is worse than an empty section, because everything downstream reads it as evidence.

---

## Reading level and jargon
*Ask*

Who has to understand this on first read, written as a person rather than a score.

- **Target reader's reading ability:** a 16-year-old reading English as a second language.
- **Jargon rule:** technical terms are allowed, but each one is introduced and explained in plain
  words the first time it appears in a piece.
- **Words we explain rather than assume:** L-theanine, adaptogen, sleep latency.

A reading level is a floor on clarity. It is not a ceiling on the ideas. Simplify the sentence and
keep the argument.

## Regional register and dose
*Ask*

Whether this brand's writing carries a local variety of English, which features it may use, and
**how much**. A register is seasoning. State a dose, or the writing turns into parody.

- **Register:** Singapore and Malaysian English, lightly.
- **Features it may use** (list only features the brand's own published writing actually shows):
  - *Topic-comment sentence structure* — the subject is named first, then the remark about it.
  - *Dropped tense marking in casual asides*, where a speaker of the register would drop it.
- **Dose:** at most **one** instance per piece, drawn only from the list above.
- **Slang:** sparing, and only terms that have been in print locally for years. Local slang ages
  fast and shuts out the half of the audience who did not grow up with it. It is a different lever
  from grammar and it gets a different setting.
- **Where it must not appear:** product descriptions, dosage or safety lines, prices, anything
  someone might act on.

If the brand writes plain standard English, write "none" here and the writing skills will not reach
for a register at all. Absent is not the same as "none", so say which.

## Mood
*Ask*

The emotional register the writing lands on, in a sentence or two.

Optimistic and encouraging overall. Honest about what goes wrong, and about how long things
actually take, but the piece ends somewhere hopeful. In practical advice, cautionary and reassuring
sit together: name the risk plainly, then say what to do about it.

## Tense and time perspective
*Infer*

Which tense carries which job. Inferred from the brand's description; nobody has confirmed it.

Past tense for reflection and for anything the founder or a customer lived through. Present tense
for instruction and for anything still true. A piece usually moves from one to the other rather
than mixing them inside a paragraph.

## Paragraph rhythm and punctuation
*Infer*

Fill this in **only** where the brand differs from the writing skills' own defaults. Anything left
blank uses the skill default, which is already sensible.

- **Paragraph length:** no more than two sentences before a break. *(skill default: one to four)*
- **Sentence length:** varied. Short declaratives to land a point, longer ones to explain a
  mechanism. Never several long ones in a row.
- **Voice:** mostly active.
- **Em dashes:** none at all. Commas, full stops, semicolons and brackets instead.
  *(skill default: at most one or two in a long piece)*
- **Sentence openers:** starting a sentence with "And" or "But" is characteristic here, not an
  error. Use it for emphasis rather than as a tic.

## Geography and cultural references
*Ask*

Local institutions, media, currency conventions and idiom that make advice feel concrete, plus
anything to steer clear of.

Singapore and Malaysia. Prices in SGD, with MYR in brackets where a piece is aimed at both. Local
health authorities and broadsheets are fair to cite by name. Avoid references that assume a
temperate climate or a Northern Hemisphere calendar.

## Trusted sources for citations
*Infer / Corpus*

Where a factual claim may be sourced from. Anything not on this list needs a second look before it
goes in.

Peer-reviewed sleep and nutrition journals; national health authority guidance; the broadsheet
press for news hooks only, never for a mechanism claim.

## Regulated-advice boundary
*Ask*

What the brand's writing must not do, and where to send the reader instead.

No personalised medical advice, no dosage recommendations for individuals, and no positioning of a
product as a treatment for a diagnosed condition. Where a reader's situation sounds clinical, say
plainly that it is worth speaking to a doctor or pharmacist, and do not soften that into a
suggestion.

## Product table
*Ask, derived from the pack*

Exact names and real URLs only, so no piece has to guess. Never invent a URL. If one is not
certain, leave it marked as needed.

| Product | What it is for | Canonical URL |
|---|---|---|
| Meadowlark Wind-Down No. 1 | The evening tea; the entry product | https://example.invalid/wind-down-1 |
| Meadowlark Wind-Down No. 2 | Caffeine-free, for people sensitive to the No. 1 blend | https://example.invalid/wind-down-2 |
| The Slow Evening Set | Gift set; both blends and the pot | https://example.invalid/slow-evening-set |

## Phrases to avoid
*Starter list, then Ask*

The phrases below are a starting point, not a rule handed down. They are the ones that read as
machine-written to most people writing in English today.

**This is your list.** Delete anything that is genuinely your voice, and add whatever the starter
misses: a competitor's slogan, a term your regulator dislikes, a word you simply hate.

- "Doing the heavy lifting"
- "The real question is…"
- "Here's the thing nobody is talking about"
- "That's the real story"
- "The good news is…"
- "What most people miss"
- "This is where it gets interesting"
- "It's not about [X], it's about [Y]"
- "It's important to note"
- "Delve" / "delve into" / "dive into"
- "Tapestry", "bustling", "realm", "embark", "virtuoso", "symphony", "testament",
  "metamorphosis", "indelible", "gossamer", "enigma", "pesky", "reverberate", "nestled",
  "metropolis", "labyrinthine"
- "In the world of", "in today's world", "in today's fast-paced [anything]"
- "Navigating the landscape", "navigating the complexities"
- "Moreover", "consequently", "thus", "notably", "subsequently"
- "This is not an exhaustive list"
- "In summary", "to summarize"
- "Hustle and bustle"
- "Game changer", "game-changing"
- "Revolutionize", "revolutionary", "miracle", "transformative". Let the evidence and the timeline
  do the work.
- "Sights unseen", "sounds unheard"
- "Unlocking creativity" / "unlocking potential" / "unlock the power of"
- "At the end of the day"
- "Lifesaver", *outside* a direct customer quote. Fine inside a blockquote if the customer actually
  said it; the narrative voice should not editorialise that way.
- "Journey" as a marketing buzzword. A specific, real journey noun phrase is fine where that is
  genuinely the brand's vocabulary; "wellness journey" as vibe-fluff is not.
- "Holistic", "foster", "vital", "vibrant" as filler. All four have honest literal uses. Avoid them
  only where the word is doing mood rather than meaning.

## Rewrite pairs
*Starter pairs, then Corpus preferred*

Habits worth fixing by example rather than by rule. The starter pairs are generic. Add the brand's
own once there is published writing to draw them from.

| Instead of | Write |
|---|---|
| "This revolutionary product will transform your life." | "This tea can help you get to sleep sooner." |
| "It's important to note that the deadline is approaching." | "The deadline is approaching." |
| "We offer a range of solutions designed to help you achieve better rest." | "We sell two teas. Both are for the hour before bed." |
