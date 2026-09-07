<!-- Templates 16-29, the Ratio / Needs fields and the render safeguards noted in write-generation-prompt
     are adapted from https://github.com/krusemediallc/arcads-claude-code (MIT). Its validated prompts,
     example fills and per-model notes are deliberately not carried over: this library stops at the
     concept, and model knowledge lives in write-generation-prompt. -->

# Static Ad Template Library

A collection of structural templates for static (image) ad creative. Each is a layout framework with slots for brand-specific copy — the structure is proven; the inputs make it yours.

Use these when generating static ad concepts at volume (Meta, Instagram, LinkedIn, display). Spread a batch across every **group** below rather than clustering on two or three favourites: template diversity is angle diversity, and the winner is usually not the one you'd have picked by hand.

## How to Use This Library

1. **Ground first.** Read the grounded inputs corpus (winning ads, reviews, ad comments, brand voice) before generating anything. See "Grounded Inputs" in SKILL.md.
2. **Cover every group.** For a batch of N concepts, take at least one template from each of the six groups and, for a 50-concept batch, at least 20 of the 29 templates (roughly 2-3 variations each). Rotate which templates sit out between batches.
3. **Fill slots from source material.** Every variation pulls its copy from a real review, a winning ad pattern, or an ad comment — and cites which one.
4. **Write the visual description.** Each concept includes enough visual direction that a designer or image-generation tool can produce it without guessing.

## Generation Rules

- Every variation must include: **template name, headline copy, body copy, ratio, what it needs, visual description, source grounding**
- **Ratio** is the placement's primary aspect ratio, in the vocabulary of [platform-specs.md](platform-specs.md) (1:1, 4:5, 9:16, 1.91:1)
- **Needs** names the real asset the concept depends on: a product hero on plain ground, a lifestyle shot, the founder's photograph, a customer's photograph with permission, or nothing beyond typography. Inside a campaign the product asset is usually the locked text-free still from `docs/message.md`; standalone, it comes from `brands/<id>/assets/`. Never let a template's need be met by a generated stand-in for something that has to be real (a face, a review, a screenshot).
- Source grounding = which review, winning ad, or comment this concept is based on
- Never produce a variation without source grounding — no invented claims, stats, or testimonials
- Pull copy directly from customer language whenever possible; don't paraphrase reviews into marketing-speak
- Match the brand voice doc on tone, not generic direct-response voice
- Real names, real stats, real quotes only — fabricated social proof is a compliance and trust violation

## The six groups

| Group | What it proves | Templates |
|---|---|---|
| Proof | Someone else says so, or the number says so | 4 Review Card, 5 Testimonial Stack, 10 Press Mention, 19 Handwritten Note, 22 With / Without Chart |
| Comparison | Why this and not that | 2 Us vs. Them, 14 Competitor Callout, 18 Comparison Table, 23 Old Way / New Way |
| Transformation | Life before, life after | 6 Before / After, 7 Problem / Solution, 24 Everyday UI Metaphor, 28 Pain-Point Checklist |
| Product | What it is, up close | 9 Feature Spotlight, 11 Lifestyle Hero, 21 Ingredient Collage, 29 Kit Flatlay |
| People | Who made it, who it is for | 8 Founder Message, 15 Origin Story, 26 Profile Card |
| Format-led | The container is the hook | 1 Headline Statement, 3 Stat Callout, 12 Numbered List, 13 FAQ Card, 16 Notes-App List, 17 Editorial Hero, 20 Letter Board Sign, 25 Printed Object, 27 Billboard Mockup |

---

## The 29 Templates

### 1. Headline Statement

Bold one-line claim. Single product hero shot. Minimal background. The headline does all the work. The brutalist variant drops the product entirely and lets oversized type fill the canvas.

- **Structure**: One dominant text line (60%+ of visual weight), product image, logo small
- **Ratio**: 1:1 (4:5 for feed)
- **Needs**: Product hero on plain ground, or nothing beyond typography
- **Copy slot**: One claim specific enough to stop the scroll
- **DTC example**: "The last greens powder you'll ever buy."
- **SaaS example**: "Close your books in 3 days, not 3 weeks."
- **Source it from**: Your strongest winning-ad hook or the most repeated benefit in reviews

### 2. Us vs. Them

Side-by-side comparison. Competitor or "old way" on the left (greyed out), your product on the right (full colour). 4-6 comparison rows.

- **Structure**: Two columns, check/cross marks per row, your side visually alive
- **Ratio**: 4:5
- **Needs**: Product hero
- **Copy slot**: Comparison rows — each row a real differentiator, not filler
- **DTC example**: "Their multivitamin: 13 ingredients. Ours: 60."
- **SaaS example**: "Spreadsheets: 6 hours a week. Us: 6 minutes."
- **Source it from**: Reviews that mention switching, or comments comparing you to a competitor

### 3. Stat Callout

One dominant number takes up 60% of the visual. Supporting context below. A chart variant puts a single simple bar or line under the number so the figure has a shape as well as a size.

- **Structure**: Giant stat, one line of context, product or logo anchor
- **Ratio**: 1:1
- **Needs**: Nothing beyond typography; product or logo as an anchor if wanted
- **Copy slot**: A real, defensible number — measurement beats superlative
- **DTC example**: "97% of users feel a difference in 14 days."
- **SaaS example**: "11 hours saved per rep, per week."
- **Source it from**: Case studies, product analytics, or survey data — never invent the number

### 4. Review Card

A five-star testimonial styled as a screenshotted product review. Reviewer name, star rating, date.

- **Structure**: Looks like a native review UI (G2, Trustpilot, Amazon, App Store — match where your buyers read reviews)
- **Ratio**: 1:1
- **Needs**: Nothing beyond typography; optional product hero beneath the card
- **Copy slot**: A real review, verbatim — the artifact's credibility is its realism
- **DTC example**: A Trustpilot card: "I've tried 6 of these. This is the only one I reordered."
- **SaaS example**: A G2-styled card: "Killed 4 tools and replaced them with this."
- **Source it from**: `brands/<id>/references/reviews/` verbatim — with permission where the platform requires it
- **Compliance note**: Match the platform where the review was actually left. Never dress a review as a private-channel exchange (messages, Slack, DMs) or as a post on a platform it never appeared on; see "Formats this library deliberately leaves out"

### 5. Testimonial Stack

Three customer quotes arranged vertically, photo + name + one-line quote each.

- **Structure**: Three short rows; quotes must be scannable in 2 seconds each
- **Ratio**: 4:5
- **Needs**: Customer photographs with permission, or initials in place of a photo; no product
- **Copy slot**: Three quotes covering *different* objections or benefits — not the same praise three times
- **DTC example**: Three customers on results, taste, and convenience
- **SaaS example**: Three roles (IC, manager, exec) each praising their own outcome
- **Source it from**: Reviews — pick for coverage, not just enthusiasm

### 6. Before / After

Split image with arrow between. Transformation framing — product results, workflow, or visual proof.

- **Structure**: Two panels, arrow or divider, minimal copy labelling each state
- **Ratio**: 1:1
- **Needs**: Two real photographs of the same subject, or the campaign's locked still for the after side
- **Copy slot**: Label the states in the customer's words ("Sunday-night spreadsheet dread" → "Reports send themselves")
- **DTC example**: Skin, energy, space — the classic visual transformation
- **SaaS example**: Cluttered 6-tab workflow → one clean dashboard
- **Compliance note**: Before/after claims are regulated in health, finance, and beauty — verify platform policy before using
- **Source it from**: Transformation language in reviews ("I used to X, now I Y")

### 7. Problem / Solution

Pain point on top (text or image), product as the answer below.

- **Structure**: Two zones — tension above, relief below
- **Ratio**: 4:5
- **Needs**: Product hero
- **Copy slot**: The pain in the customer's exact words, then the product's one-line answer
- **DTC example**: "Tired of 6 supplements every morning?" → one scoop visual
- **SaaS example**: "Your CRM knows nothing about product usage." → integration screenshot
- **Source it from**: The most common pain phrasing in `brands/<id>/references/reviews/` — verbatim beats paraphrase

### 8. Founder Message

Handwritten-style or plain-text note from the founder. Conversational, personal tone. The handwritten-letter variant sets the note on paper on a desk, signed, with the product as a prop rather than a hero.

- **Structure**: Note-style layout, founder name/photo, no product glamour shot
- **Ratio**: 4:5
- **Needs**: The founder's real photograph if one appears (never a generated face; see the presenter rule in SKILL.md), or none
- **Copy slot**: "I built this because..." — one honest paragraph, no marketing polish
- **DTC example**: "Hey — I made this because every 'healthy' snack was secretly candy."
- **SaaS example**: "I ran RevOps for 6 years. This is the tool I kept wishing existed."
- **Source it from**: The actual founding story — this template collapses if fabricated

### 9. Feature Spotlight (Ingredient Spotlight)

Product hero in the centre, 4-6 callout boxes around the edges highlighting key components. Annotated callouts with thin leader lines are the same template.

- **Structure**: Centre image, radiating callouts, each callout 3-6 words
- **Ratio**: 1:1
- **Needs**: Product hero on plain ground, centred, with space around it for the callouts
- **Copy slot**: The components buyers actually ask about — not your full feature list
- **DTC example**: Product bottle with callouts per key ingredient and what it does
- **SaaS example**: Dashboard screenshot with callouts on the 4 features reviews mention most
- **Source it from**: Which features/ingredients appear most in reviews and comments

### 10. Press Mention

"As seen in" with publication logos and a pull quote.

- **Structure**: Logo row + one strong quote + product anchor
- **Ratio**: 1:1
- **Needs**: Outlet logos you have the right to use; product hero
- **Copy slot**: A real quote from real coverage
- **DTC example**: "The category's first genuinely new idea in years." — [publication]
- **SaaS example**: Analyst or industry-newsletter quote with the outlet's logo
- **Compliance note**: Only use logos of outlets that actually covered you; check their logo-usage terms
- **Source it from**: Actual press, podcasts, newsletters, or analyst mentions

### 11. Lifestyle Hero

Product in use in a real environment. Minimal copy. Aspirational, not salesy.

- **Structure**: One photograph does the work; a short line and logo at most
- **Ratio**: 4:5 or 9:16
- **Needs**: A lifestyle shot, or the campaign's locked still
- **Copy slot**: 5-8 words, identity-flavoured ("Mornings, handled.")
- **DTC example**: Product on a kitchen counter mid-routine
- **SaaS example**: The tool on-screen in a real work moment (standup, close call, ship day)
- **Source it from**: Winning ads' visual patterns; identity language in reviews

### 12. Numbered List

"5 reasons [audience] are switching to [brand]." Icons next to each point.

- **Structure**: Numbered rows, icon + short line each, product anchor at bottom
- **Ratio**: 4:5
- **Needs**: Product hero, small
- **Copy slot**: Each reason a distinct angle — pain, outcome, proof, differentiator, price
- **DTC example**: "5 reasons runners switched to [brand] this year"
- **SaaS example**: "4 reasons finance teams are leaving [legacy tool]"
- **Source it from**: Aggregate the most common switching reasons across reviews

### 13. FAQ Card

A common objection as the question, answered directly. The comment-reply variant sets the question as a comment bubble and the answer as the brand's reply beneath it, with the product below.

- **Structure**: Question prominent, answer concise, product anchor
- **Ratio**: 1:1
- **Needs**: Nothing beyond typography; optional product hero under the answer
- **Copy slot**: The objection *as customers phrase it* — the recognition is the hook
- **DTC example**: "But does it work for sensitive skin? Yes — and here's why."
- **SaaS example**: "Will this survive our security review? SOC 2 Type II, SSO, EU hosting."
- **Compliance note**: In the comment-reply variant the question is a real comment quoted verbatim, the commenter is a first name and initial at most, and no platform chrome is drawn (no header, sponsored badge, like counts or reply box). Flag it `⚠️ POLICY CHECK`; ad review treats interface mimicry as a separate risk from the claim
- **Source it from**: `brands/<id>/references/comments/` — the objections people post publicly under your ads

### 14. Competitor Callout

Name a specific competitor (or the category default) and explain the difference. Bold but factual.

- **Structure**: Their name vs. yours, one clear axis of difference
- **Ratio**: 1:1
- **Needs**: Product hero
- **Copy slot**: A difference you can defend with facts — comparative claims invite scrutiny
- **DTC example**: "Like [competitor], minus the 14g of sugar."
- **SaaS example**: "[Competitor] charges per seat. We don't."
- **Compliance note**: Comparative advertising must be truthful and substantiatable; some platforms restrict naming competitors
- **Source it from**: Competitor mentions in reviews and comments — customers name the alternative for you

### 15. Origin Story

Founder photo with the why-we-built-this narrative. Longer copy than other formats.

- **Structure**: Portrait or team photo, 2-3 short paragraphs, product secondary
- **Ratio**: 4:5
- **Needs**: The founder's or team's real photograph
- **Copy slot**: The specific moment or frustration that started it — specificity is the credibility
- **DTC example**: "We spent 2 years and 47 batches getting this right. Here's why."
- **SaaS example**: "We were the customer. The tool we needed didn't exist, so we built it."
- **Source it from**: The real story — pairs with warm/retargeting audiences better than cold

### 16. Notes-App List

A short list written in a plain notes-app style: a title line, a few short items, the whole thing reading like something a customer jotted for themselves. The product sits below or beside the note.

- **Structure**: A pale note panel with a title and 3-5 items, product small beneath; no app chrome (no status bar, toolbar, or share icons)
- **Ratio**: 4:5
- **Needs**: Product hero, small; the note is typography
- **Copy slot**: A list a real customer would actually write — a morning routine, what they stopped buying, what they noticed in week one
- **DTC example**: "things I no longer do: 1. skip breakfast 2. buy 4 supplements 3. hit 3pm wall"
- **SaaS example**: "Monday: closed the month. Tuesday: closed the month again to check. It held."
- **Source it from**: Routine language and lists in reviews; comments that enumerate what changed

### 17. Editorial Hero

A magazine or long-read layout: a large photograph, a serif headline set as an article title, a standfirst line, and a small byline or issue-style label, all under the brand's own name.

- **Structure**: Full-bleed or two-thirds photograph, headline as an article title, one standfirst line, brand name where a masthead would sit
- **Ratio**: 1:1 or 4:5
- **Needs**: A lifestyle shot or the campaign's locked still
- **Copy slot**: A headline that reads as a story, not an offer — the argument of a feature article compressed to one line
- **DTC example**: "The quiet rise of the one-scoop morning"
- **SaaS example**: "What finance teams do with the week they got back"
- **Compliance note**: The masthead is the brand's own. A real publication's name or logo appears only when the coverage is real, and then it is a Press Mention. A magazine-cover treatment (cover lines, issue label) follows the same rule
- **Source it from**: The angle of your strongest winning ad, given an editorial register

### 18. Comparison Table

A full table rather than two columns: three or more options across the top, four to six criteria down the side, ticks and crosses or short values in the cells. A light variant reads clinical; a dark variant with a provocative title reads like a challenge to the category.

- **Structure**: Header row of options with yours last or highlighted, criteria rows, product hero below or beside
- **Ratio**: 4:5
- **Needs**: Product hero; the table is typography
- **Copy slot**: Criteria buyers actually weigh, with values you can substantiate for every column, not only your own
- **DTC example**: Four greens powders against ingredients, sugar, servings, price per day
- **SaaS example**: Three tools against per-seat pricing, integrations, SSO, time to first report
- **Compliance note**: Every cell is a claim about someone else's product; comparative advertising must be truthful and substantiatable, and some platforms restrict naming competitors. Cells you cannot verify get a `⚠️ CLAIM CHECK`
- **Source it from**: Reviews and comments that compare you to named alternatives; competitor research in `campaigns/<slug>/research/`

### 19. Handwritten Note

A real customer's words in handwriting on a physical surface: a sticky note stuck to the product, a whiteboard with a two-column scrawl, or a napkin on a café table. The surface is the hook; the words are the proof.

- **Structure**: One handwritten surface fills most of the frame, product in shot as the thing the note is about; attribution small
- **Ratio**: 4:5 (1:1 for the sticky-note flatlay)
- **Needs**: Product hero or the small units of it (sachets, tablets, a single serving); the handwriting is rendered
- **Copy slot**: A short verbatim review line, or a two-column comparison in the customer's words — 15 words at most
- **DTC example**: Sticky note on the tin: "3 weeks in. Haven't touched the other 4 bottles." — Priya, Trustpilot
- **SaaS example**: Whiteboard: "before: 6 tabs, 2 hours / after: 1 tab, 8 minutes" — a real onboarding quote
- **Compliance note**: The words are a real review, attributed to the person who wrote them. Handwriting is a treatment, not a claim that the customer wrote this note
- **Source it from**: The shortest, most physical lines in `brands/<id>/references/reviews/`

### 20. Letter Board Sign

The headline spelled out on a felt letter board or a light-box sign, photographed beside the product. Tactile, a little playful, and the constraint of the board keeps the copy short.

- **Structure**: The sign is the headline, product beside or in front of it, plain background
- **Ratio**: 1:1
- **Needs**: Product hero
- **Copy slot**: One line short enough to fit a letter board — six to nine words, no punctuation to speak of
- **DTC example**: "ONE SCOOP. FOUR BOTTLES RETIRED."
- **SaaS example**: "MONTH END CLOSED BY LUNCH"
- **Source it from**: The tightest hook in your winning ads

### 21. Ingredient Collage

The product's actual components laid out as objects around it — leaves, roots, powders, or for software the real inputs (a spreadsheet, a receipt, a calendar page) — each labelled in a word or two. Where Feature Spotlight annotates one image, this shows the things themselves.

- **Structure**: Product at centre or bottom, components arranged around it as a photographic collage, one short label each
- **Ratio**: 1:1
- **Needs**: Product hero; the components are rendered or photographed
- **Copy slot**: The components buyers ask about and what each one does, three words per label
- **DTC example**: The tin surrounded by spirulina, ashwagandha, and a probiotic capsule, labelled by what each is for
- **SaaS example**: The dashboard surrounded by the five sources it pulls from, each labelled
- **Compliance note**: Only ingredients and inputs that are actually in the product; efficacy words on a label are claims
- **Source it from**: Ingredient and feature mentions in reviews; the product's real specification in `brands/<id>/pack.yaml`

### 22. With / Without Chart

A simple chart, usually a stacked bar or a pair of bars, showing a measurable difference with and without the product. The number is the ad; the chart gives it a shape.

- **Structure**: Two bars or a stacked bar with plain labels, headline above, product small beneath in its own colour
- **Ratio**: 4:5
- **Needs**: Product hero, small; the chart is typography and colour
- **Copy slot**: One measured difference and where it came from, in the smallest honest words
- **DTC example**: Hours of afternoon energy, self-reported, before and after 30 days — with the survey named
- **SaaS example**: Hours per month to close: spreadsheet vs. the tool, from onboarding data
- **Compliance note**: The number must be real and sourced on the image or in the caption. A chart of an invented number is a fabricated stat, not a design choice
- **Source it from**: Case studies, product analytics, or survey data — never invent the number

### 23. Old Way / New Way

A small flowchart in two rows: the old process as five or six boxes joined by arrows, the new one as two. The visual argument is the length of the row.

- **Structure**: Two horizontal flows, the old one long and greyed, the new one short and in brand colour, product at the end of the new row
- **Ratio**: 1:1
- **Needs**: Product hero, small, at the end of the new flow
- **Copy slot**: Each box two or three words; the old row in the customer's own description of the faff
- **DTC example**: "wake → 4 bottles → measure → mix → forget one" against "wake → one scoop"
- **SaaS example**: "export → clean → pivot → email → chase" against "connect → done"
- **Source it from**: Reviews and comments that describe the old routine step by step

### 24. Everyday UI Metaphor

A familiar everyday screen used as a joke carrier rather than as a fake screenshot: a calendar week where every day says the same thing, a weather forecast where the outlook is the product's benefit. Drawn in a plain generic style, never with a real app's chrome.

- **Structure**: The metaphor screen fills the frame, one line of headline, product small beneath
- **Ratio**: 1:1
- **Needs**: Product hero, small; the screen is drawn
- **Copy slot**: The benefit or the pain, repeated or forecast in the metaphor's own vocabulary
- **DTC example**: A week view: Mon "3pm crash", Tue "3pm crash", ... Sun "3pm crash", then the product
- **SaaS example**: A forecast: "Mon: 100% chance of month-end. Tue: reports, clearing by lunch."
- **Compliance note**: Generic drawing only. No real app's interface, status bar, or icons; the viewer must read it as a joke, not a screenshot
- **Source it from**: Recurring-day and routine language in reviews; the pain phrasing customers repeat

### 25. Printed Object

A physical printed thing carries the copy: a till receipt itemising what you get, a scratch card revealing the offer, a museum placard beside the product, a crossword whose answers are the benefits. The object is the hook and the copy fits its conventions.

- **Structure**: The object photographed on a plain surface, product beside it as a prop, no headline outside the object
- **Ratio**: 4:5 (1:1 for the placard)
- **Needs**: Product hero as a prop; the object is rendered
- **Copy slot**: Written in the object's own grammar — line items and a total, a scratched-off panel, a placard's title, date and one-line description
- **DTC example**: A receipt: "Morning energy ... included. Four other bottles ... returned."
- **SaaS example**: A placard: "Manual month-end close, 2009-2025. Retired. On loan from the finance team."
- **Compliance note**: A receipt's total is the real price. A "newspaper" object carries the brand's own name where a masthead would be, never a real publication's
- **Source it from**: Price and offer from `brands/<id>/pack.yaml`; benefit lines from reviews

### 26. Profile Card

The product presented as a dating-style profile: a photo, a name and "age", three prompt-and-answer lines, drawn in a generic card style with no real app named or imitated. Obvious satire, which is what makes it safe.

- **Structure**: Card with photo on top, name line, three prompt-and-answer pairs, brand small at the bottom
- **Ratio**: 4:5
- **Needs**: Product hero as the profile photo
- **Copy slot**: Three prompts answered in the brand's voice, one of them a real differentiator
- **DTC example**: "Typical Sunday: being the only supplement you remember to take."
- **SaaS example**: "My love language: closing your books before you've finished your coffee."
- **Compliance note**: Generic card only; no real app's name, logo, prompts or interface
- **Source it from**: Brand personality from `voice.summary`; the differentiator from reviews

### 27. Billboard Mockup

The headline shown on an out-of-home surface: a roadside billboard, a bus shelter, a tube-car panel. Borrowed scale for a small brand, and a way to test a headline in a setting that demands it be short.

- **Structure**: A photographed or rendered OOH placement with the headline and product on it, environment kept simple
- **Ratio**: 1:1 (1.91:1 for display)
- **Needs**: Product hero; the placement is rendered
- **Copy slot**: A headline that works at ten metres — under eight words
- **DTC example**: A bus shelter: "Four bottles. One scoop. You do the maths."
- **SaaS example**: A station panel: "Month-end. Closed by lunch."
- **Compliance note**: A mockup, and the caption must not imply the poster ran. Never place it on a real, identifiable site as though it were bought
- **Source it from**: Your shortest winning hook

### 28. Pain-Point Checklist

A checklist of the audience's pains, ticked, above the product. The reader recognises themselves in the list before they see the answer.

- **Structure**: Four to six checklist rows, each ticked, a one-line answer, product beneath
- **Ratio**: 4:5
- **Needs**: Product hero
- **Copy slot**: Pains in the customer's own words, written in the first person or about no one in particular
- **DTC example**: "☑ Four bottles on the counter ☑ Forgot one anyway ☑ 3pm wall" → the product
- **SaaS example**: "☑ Export ☑ Clean ☑ Pivot ☑ Chase ☑ Repeat" → the tool
- **Compliance note**: Never "do you suffer from…" or "your [condition]". The personal-attributes rule in SKILL.md applies to every row; write the recognition without asserting anything about the viewer
- **Source it from**: The most repeated pain phrasing in `brands/<id>/references/reviews/` and `comments/`

### 29. Kit Flatlay

The product among the real objects of its owner's day, shot from above: keys, a notebook, headphones, a coffee. An identity ad rather than a product ad; the reader buys the life the kit implies.

- **Structure**: Overhead flatlay on a plain surface, product no larger than its neighbours, one short line or none
- **Ratio**: 1:1
- **Needs**: Product hero; the kit objects are rendered or photographed
- **Copy slot**: Five words or none — a label for the day rather than a claim
- **DTC example**: "Tuesday, sorted." above a desk kit with the tin in it
- **SaaS example**: A laptop showing the tool, a coffee, a closed notebook, a train ticket home at 5
- **Source it from**: Identity language in reviews ("I'm the kind of person who…"); the audience's `jobs` in `brands/<id>/pack.yaml`

---

## Formats this library deliberately leaves out

Template libraries elsewhere include ads dressed as things that never happened: a Google results page with real publication logos, a ChatGPT answer recommending the product, a Slack or iMessage thread, a TikTok creator's video screenshot, an AirDrop or notification dialog, an Instagram story with a "not sponsored" sticker, a tweet nobody posted, a newspaper page under a real masthead. Do not add them, and do not produce one when asked; name the nearest honest template instead.

Two reasons, both engine rules rather than taste. They fabricate a third party's endorsement, which breaks the grounding rule above (real names, real stats, real quotes only) and the advertising codes that require an ad to be identifiable as one and forbid a marketer posing as a consumer. And they imitate an interface, which platform ad review rejects on its own: dialogs, notifications and buttons that do nothing are "nonexistent functionality", and a screenshot-of-a-feed inside a feed is the first thing the render safeguards in `write-generation-prompt` strip out.

The honest neighbours: a real review left on a real platform is a Review Card; a real comment under your ad is the FAQ Card's comment-reply variant; a real message from a real customer, quoted with permission, is a Handwritten Note; real coverage is a Press Mention; an editorial look without coverage is an Editorial Hero under your own name.

---

## Per-Concept Output Format

Each generated concept follows this structure:

```markdown
## Concept [N]: [Template Name]

**Headline**: [the headline copy]
**Body**: [supporting copy, if the template uses it]
**Ratio**: [primary aspect ratio for the placement]
**Needs**: [the real asset this depends on: product hero / lifestyle shot / founder photo / customer photo with permission / typography only]
**Visual**: [layout description specific enough to design or generate from]
**Image prompt**: [prompt for the image tool, if generating]
**Grounded in**: [which review / winning ad / comment this traces to, quoted or named]
```

For a batch, add an `INDEX.md` listing every concept with its template type and grounding source, so the reviewer can scan 50 concepts in two minutes.

## Batch Distribution

For a standard 50-concept batch: every one of the six groups represented, at least 20 of the 29 templates used, 2-3 variations each, and the templates that sat out this time go first next time. If performance data shows certain templates consistently winning for this brand, shift to 60% proven templates / 40% full-cycle coverage — but never drop a group to zero. Fatigue is why you're generating daily; the template that's tired next month is the one you're scaling today.
