---
name: write-instagram-post
description: >-
  Draft a brand's organic Instagram feed post, a single image or a carousel of up to ten slides,
  inside Instagram's own limits: the caption, the opening line before "…more", the hashtags, the
  slide plan, the alt text and the publish-ready JPEG pictures at a feed shape (4:5 by default). Use
  whenever the user wants an Instagram post written or planned: "write the Instagram post", "draft a
  carousel for the launch", "make an IG post about [product]", "plan the slides", "write the caption
  for this picture", "turn the blog into a carousel", "the Instagram deliverable on the list". Reads
  the active brand from campaign.brand in campaigns/<slug>/system/manifest.yaml and the deliverable's
  own entry there (format single | carousel, aspect, quantity = slides), brands/<id>/pack.yaml
  (audience, products with claims_allowed, voice.spelling, mandatories, nogos, social.instagram and
  social.hashtags always / never), brands/<id>/voice/shared.md plus one byline file,
  campaigns/<slug>/docs/message.md (key message, chosen tagline, master_visual.locked_still) and
  brief.md, and schema/social-platforms.md for every limit. Calls write-hook inline for the opening
  line; sends each slide's picture through generate-image (photographic, behind its cost gate) or
  compose-lockup (text on the main picture), or reuses media already marked final; then makes the
  JPEG copies Instagram accepts with ffmpeg. Writes campaigns/<slug>/content/<id>.md (frontmatter
  that publish-social reads, the caption in a fenced block) and logs it. It never posts anything. Do
  NOT use to publish or post (publish-social), for paid Instagram or Facebook ads (write-ad-creative),
  for Reels, Stories or video posts (not yet supported), to rework only the opening line of an
  existing caption (write-hook), for Threads posts (write-threads-post), or for Facebook posts.
---

# write-instagram-post — draft an organic Instagram post to Instagram's limits

This skill writes an Instagram feed post and gets its pictures ready: a single image or a carousel,
captioned in the brand's voice, with every picture at a shape and in a format Instagram will accept.
The method below is brand-agnostic. Every persona detail, product, claim, handle and hashtag comes from
the active brand's files.

**It drafts; it never posts.** Posting is `publish-social`, the only skill that touches the brand's
live account, and it reads the file this skill writes without the conversation that wrote it. That
split is the point: everything a post needs to go out has to be in the file.

Where the neighbours sit:

- `write-hook` — owns the opening line. Called inline here, in its "social post" mode.
- `generate-image` — renders any new picture, behind its own unconditional cost gate. This skill
  never calls fal for a render itself.
- `compose-lockup` — lays a headline onto the campaign's main picture for a slide that carries text.
- `write-generation-prompt` — writes the image prompt for a slide that needs a new picture.
- `publish-social` — posts the finished draft. Read-only from here.
- `write-ad-creative` — paid Instagram placements. A different discipline with different limits.
- `content-writer` — the agent that routes a "write the Instagram post" request here.

Campaign paths and filenames follow `${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md`. Every
limit (picture shape and format, caption length, hashtag and @mention counts, carousel size, alt
text) is `${CLAUDE_PLUGIN_ROOT}/schema/social-platforms.md` section 2. Both specs win over anything
written here. Everything said out loud follows `${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md`.

## 1. Before anything: resolve and load

Run `${CLAUDE_PLUGIN_ROOT}/schema/preflight.md`. Then read, in order:

1. **The deliverable.** Its entry in `system/manifest.yaml`: `id`, `format` (`single` or `carousel`),
   `aspect` (default `4x5`), `quantity` (the number of slides, for a carousel), `audience_ref`,
   `offer_ref`, `funnel_stage`, `notes`. If the request names no deliverable and the manifest has
   none for Instagram, ask whether to add one — as a question about their campaign, per preflight's
   "Writing into a campaign" — rather than inventing an id.
2. **The brand's shared voice rules**, `brands/<id>/voice/shared.md`, and **one byline file, never
   both**: `voice/customer-story.md` when the account speaks as the brand or team,
   `voice/personal-post.md` when it speaks as the founder. Most brand accounts speak as the brand; if
   the account is plainly founder-led, or the request says so, use the founder's. If it is genuinely
   unclear, ask which. With only `voice.summary` in the pack, write to that.
3. **The pack.** `audience`, `products[]` (`name`, `price`, `url`, `claims_allowed` — the **only**
   things the post may assert about a product), `voice.spelling`, `mandatories` (absent means
   unconfirmed, not none), `nogos`, and the `social` block: `social.instagram` (the handle this post
   is for) and `social.hashtags.always` / `never`.
4. **The campaign creative.** `docs/message.md` for the key message, the chosen tagline and
   `master_visual.locked_still`; `docs/brief.md` for the objective, audience and any campaign
   hashtags. **Without `message.md`, degrade with consent:** say there is no agreed message or main
   picture yet, so the post would be written from the plan alone and its pictures would not match
   the rest of the campaign, and continue only on an explicit go-ahead.
5. **The limits.** `${CLAUDE_PLUGIN_ROOT}/schema/social-platforms.md` section 2.

## 2. The post in one line

Before drafting, write the post's single job in one sentence: *who* stops scrolling for it, *what*
they get from it, and the *one thing* it asks them to do (save it, visit the link in bio, comment,
buy). A post with two jobs is two posts. Hold that sentence as the target for the first slide, the
caption and the call to action.

## 3. Plan the pictures

**One shape for the whole post.** Instagram crops every carousel slide to the first one's shape, so
a post has exactly one aspect ratio. Take it from the deliverable's `aspect`, else 4:5. It must sit
inside the feed range in `social-platforms.md` section 2.2 (4:5 to 1.91:1); a 9:16 request is a Reel
or a Story, which this skill does not make, so say so and offer 4:5.

One exception decides the shape for you: a slide that lays text onto the campaign's main picture
goes through `compose-lockup`, which keeps the main picture's own shape rather than stretching it. If
any slide needs that and the main picture is a different shape from the post, say so plainly and ask
which they want: the post at the main picture's shape (when that is inside the feed range), or the
post at 4:5 with the text moved off the picture and into the caption.

**Single image.** One picture that does the whole job on its own in the feed.

**Carousel.** Slides in posting order, within the count in `social-platforms.md` section 2.3 (2 to
10; `quantity` when the deliverable sets it, otherwise as few as the idea needs, usually 3 to 7):

- **Slide 1 is the hook.** It is the only slide most people see. It stops the scroll on its own,
  with or without text on it.
- **One idea per slide**, each one earning the swipe to the next.
- **The last slide asks.** The call to action from the one-line job, said once.

For every slide, write down: what the picture shows, any text that sits on it (short; it has to read
on a phone), and its **alt text** (what is in the picture, for someone who cannot see it; no
hashtags, within section 2.5's limit). Then decide where its picture comes from, the first that fits:

1. **A picture the campaign already has**, marked `final` in the generation log, at the post's shape.
   Reuse it as it is.
2. **Text on the campaign's main picture** → `compose-lockup`, with the slide's text as the headline.
3. **A new photographic picture** → write its prompt with `write-generation-prompt` at the post's
   shape, binding to `master_visual.locked_still` as the first reference picture so the subject and
   look match the rest of the campaign, then render it with `generate-image` into
   `media/<id>/` as `<id>-slide<N>-v<NN>.png` (or `<id>-v<NN>.png` for a single image).

Every render stops at `generate-image`'s own approval gate, which shows the prompt and the cost;
nothing here asks for or implies standing approval. If image generation is not connected, the gate
hands back the prompt to run by hand, the slide stays without a picture, and the draft says which
slides are still waiting.

## 4. Write the caption

1. **The opening line** comes from `write-hook`, called inline with the social post surface, the
   draft and the brand and campaign already resolved. It has to land inside the first ~125
   characters, before Instagram's "…more". Carry its top pick and keep its options for the doc.
   `write-hook` writes no file and no log line of its own when called this way.
2. **The body.** In the byline's voice, at its reading level, short lines and line breaks for a phone.
   It pays off the opening line and the slides; it does not narrate them one by one.
3. **One call to action.** The one-line job's ask. A caption link cannot be tapped, so a link goes
   "in bio" or is named as a page, never pasted as a bare URL.
4. **Hashtags last.** 3 to 5 by default, on their own line at the end: every
   `social.hashtags.always` tag, never a `never` tag, then the campaign's from the brief, then topical
   ones the audience actually follows. Never a wall of 30.
5. **@mentions** only for accounts the post genuinely involves, and only real handles you were given.

**Product and claim rules.** Only `claims_allowed` may be asserted about a product; anything stronger
is softened and left with an inline `⚠️ CLAIM CHECK:` flag in the doc (outside the caption fence, so
the flag is never posted). Honour every `nogo` and every `mandatory` (a disclosure that must appear,
a required disclaimer). Never invent a statistic, a customer, a quote, a price or a URL; leave a
marked placeholder and name it on hand-back. A placeholder inside the caption means the post is not
ready to go out, and the hand-back says so.

**Count it.** Measure the finished caption, hashtag count and @mention count with a tool, exactly as
`social-platforms.md` section 1 says, and fix anything over a limit before writing the doc.

## 5. Make the pictures Instagram will take

Once every slide has its picture, make the **publish-ready JPEG copy** of each, per
`social-platforms.md` section 2.2 (the ffmpeg line there), into the same folder beside its render:
`<id>-slide2-v01.png` → `<id>-slide2-v01.jpg`. Then check each JPEG with `ffprobe` and the file size:
JPEG, width 320 to 1440, aspect inside the feed range, under 8 MB, and every slide the same shape.
A copy that fails a check is a finding to fix (a re-render at the right shape), never a re-crop.

A JPEG copy is a format derivative, not a new picture: same stem and version as its render, logged
with `"source":"derived"` and the render in `refs` (`campaign-structure.md` sections 3 and 4). If the
render changes, that is a new render version and a new copy of it; never re-make a copy in place.

If ffmpeg is not available, stop at this step: the pictures are made but Instagram accepts only
JPEG, so the post cannot go out until the copies exist. Say that plainly, leave `media` pointing at
the renders, and do not hand-convert any other way.

## 6. Write the doc

Write `campaigns/<slug>/content/<id>.md`. The frontmatter is what `publish-social` reads, so it
names exact paths and nothing it cannot verify:

````markdown
---
platform: instagram
format: carousel            # single | carousel
aspect: 4x5
account: "@acmeskin"        # social.instagram from the pack; empty if the pack has none
suggested_time: "Tue 19:00" # a note for the person; nothing is scheduled
media:                      # posting order; the publish-ready JPEGs
  - path: media/ig-launch/ig-launch-slide1-v01.jpg
    alt_text: "A glass serum bottle on wet dark stone, lit from the left."
  - path: media/ig-launch/ig-launch-slide2-v01.jpg
    alt_text: "…"
---

# Instagram post — <short name>

## The post in one line
<the one-line job>

## Caption
```text
<the caption, character for character as it will be posted, hashtags included>
```
Characters: 412 of 2,200 · Hashtags: 4 of 30 · @mentions: 0 of 20

## Slides
### Slide 1 — <what it is>
- Picture: `media/ig-launch/ig-launch-slide1-v01.jpg` (from `…-slide1-v01.png`)
- Text on it: "<the words on the picture>" | none
- Alt text: <as in the frontmatter>

## Opening line options
<write-hook's ranked options, top pick first>

## Still to do
<every placeholder, flagged claim, slide still waiting for a picture — or "nothing">
````

The **caption fence is load-bearing**: a line that opens on a hashtag would otherwise render as a
heading on the campaign page, and `publish-social` posts the text inside the fence exactly. Keep any
`⚠️ CLAIM CHECK:` flag outside it. If the pack has no `social.instagram`, leave `account` empty and
say on hand-back that posting will need the handle recorded first.

A text deliverable is edited in place on a re-run (git carries its history); a changed picture is a
new render version, and `media` is updated to point at its new copy.

## 7. Log, then rebuild

Follow `campaign-structure.md` section 4.1: one `generate` line for the doc (`file` →
`content/<id>.md`, `status: iteration`, the slide count and top opening line in `notes`; no `model`
or `cost_usd`), one `generate` line per JPEG copy (`role: slide` for carousel slides, `source:
derived`, `refs` → the render, `cost_usd: 0`). Renders were logged by `generate-image` /
`compose-lockup`. Then rebuild the page once, following `build-site` for `campaigns/<slug>`.

Outside a campaign, write where the user asks and skip the log step; `publish-social` posts only
campaign work.

## 8. Self-review

1. One job, one call to action?
2. Slide 1 (or the single picture) stops the scroll on its own? Last slide asks?
3. Every slide the same shape, inside the feed range, 10 or fewer?
4. Every picture has a publish-ready JPEG copy that passed the checks, and alt text?
5. Opening line from `write-hook`, landing before "…more"?
6. Caption, hashtags and @mentions **counted** and inside the limits? Every `always` tag in, no `never`
   tag?
7. Every product claim within `claims_allowed`, stronger ones softened and flagged outside the fence?
   Every `mandatory` honoured, no `nogo`?
8. No invented stat, customer, quote, price, handle or URL?
9. Voice matches the byline? Spelling per `voice.spelling`, few em dashes, nothing from the brand's
   phrases to avoid?
10. Ladders up to the key message, uses the chosen tagline where it uses one?

## 9. Hand it back

Per `plain-language.md` sections 5 and 6, three things in this order:

1. **The opening line options**, top pick named, and the caption as it will read. These are the
   decisions they actually make.
2. **What is left for them**: every placeholder, flagged claim, slide still waiting for a picture,
   and a missing handle. Plainly, so they do not hunt for brackets.
3. **One next action.** Usually: have it checked against the brand's rules, then post it. Offer the
   check first, because a post cannot be taken back. Name no skill.

One path, the doc's, written in full.

## House rules

- **Draft, never post.** Nothing here touches the brand's account. Posting is `publish-social`.
- **The limits are counted and come from the spec.** `social-platforms.md` holds every number; this
  skill holds none of its own.
- **No render without its gate.** Every new picture goes through `generate-image` or `compose-lockup`
  and their approval stops.
- **One home, versioned names.** Slides are `<id>-slide<N>-v<NN>`, copies keep the render's stem and
  version, nothing is overwritten.
- **Never fabricate.** No invented claim, handle, link, picture path or count.
- British spelling, few em dashes, nothing that reads as machine-written.
