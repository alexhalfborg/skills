---
name: write-threads-post
description: >-
  Draft a brand's organic Threads post inside Threads' own limits: a text-only post (optionally with
  one link preview), a single image, or a carousel of up to twenty pictures, with the 500-limit text
  counted in UTF-8 bytes, at most five links, one topic tag and alt text for every picture. Use
  whenever the user wants a Threads post written: "write the Threads post", "draft something for
  Threads", "a Threads version of the launch post", "turn this into a Threads post", "the Threads
  deliverable on the list". Reads the active brand from campaign.brand in
  campaigns/<slug>/system/manifest.yaml and the deliverable's own entry there (format text | single
  | carousel, aspect, quantity), brands/<id>/pack.yaml (audience, products with claims_allowed,
  voice.spelling, mandatories, nogos, social.threads and social.hashtags), brands/<id>/voice/shared.md
  plus one byline file, campaigns/<slug>/docs/message.md and brief.md, and schema/social-platforms.md
  section 3 for every limit. Calls write-hook inline for the opening line; reuses campaign pictures
  already marked final or sends new ones through generate-image or compose-lockup behind their cost
  gates. Writes campaigns/<slug>/content/<id>.md (frontmatter publish-social reads, the text in a
  fenced block) and logs it. It never posts. Do NOT use to publish (publish-social), for a chain of
  replies (not supported yet), for Instagram posts (write-instagram-post), for Facebook posts, for
  paid ads (write-ad-creative), or to rework only the opening line (write-hook).
---

# write-threads-post — draft an organic Threads post to Threads' limits

This skill writes one Threads post: text alone, text with a picture, or text with a carousel. Threads
is a conversation platform first, so the text carries the post and pictures are optional. The method
is brand-agnostic; every persona detail, product, claim, handle and tag comes from the brand's files.

**It drafts; it never posts.** Posting is `publish-social`, which reads the file this skill writes
without the conversation that wrote it.

It is the sibling of `write-instagram-post` and shares its shape: the same frontmatter, the same
fenced text under `## Caption`, the same slide and alt-text rules, the same picture sources. Where a
step here says "as in `write-instagram-post`", that skill's wording applies unchanged. What differs is
the platform: shorter text, counted in bytes, real links, one topic tag instead of hashtags, PNG
accepted, carousels of up to twenty.

Campaign paths and filenames follow `${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md`; every
limit is `${CLAUDE_PLUGIN_ROOT}/schema/social-platforms.md` section 3. Both win over anything here.
Everything said out loud follows `${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md`.

## 1. Before anything: resolve and load

Run `${CLAUDE_PLUGIN_ROOT}/schema/preflight.md`, then read, as in `write-instagram-post` step 1:

1. **The deliverable** in `system/manifest.yaml`: `id`, `format` (`text`, `single` or `carousel`;
   default `text`), `aspect`, `quantity` (pictures, for a carousel), `audience_ref`, `offer_ref`,
   `funnel_stage`, `notes`. No Threads deliverable and none named: ask whether to add one, never
   invent an id.
2. **Voice.** `voice/shared.md` plus one byline file, never both (the brand's or the founder's, by
   how the account speaks; ask if unclear), or `voice.summary`.
3. **The pack.** `products[]` with `claims_allowed`, `voice.spelling`, `mandatories` (absent means
   unconfirmed), `nogos`, `social.threads` (the handle this post is for), and
   `social.hashtags.always` / `never` (used for the topic tag, step 4).
4. **The campaign creative.** `docs/message.md` and `docs/brief.md`. Without `message.md`, degrade
   with consent, as in `write-instagram-post`.
5. **The limits.** `social-platforms.md` section 3.

**A Threads version of another post.** When the request is to adapt a post the campaign already has
(an Instagram caption, a blog post, an email), read it and rewrite for Threads rather than trimming
it: a cut-down Instagram caption reads as one. It may reuse that post's finished pictures as they are.

## 2. The post in one line

Write the post's single job in one sentence: who it is for, what it gives them, and the one thing it
invites (a reply, a click, a save). On Threads the invitation is often a question or a view worth
answering. A post with two jobs is two posts.

## 3. Pictures, if any

**Text** posts have none; skip to step 4.

For **single** and **carousel**, plan and source the pictures exactly as `write-instagram-post`
step 3 does (one shape for the whole post, alt text for every picture, and the sources in order:
existing `final` media, `compose-lockup`, a new render through `write-generation-prompt` and
`generate-image` behind its gate), with Threads' limits instead of Instagram's:

- up to **20** pictures in a carousel (`quantity` when set, otherwise as few as the idea needs);
- any shape up to 10:1 is accepted, so the house default is the campaign's feed shape, 4:5, or
  square; a picture already made for the campaign's Instagram post can be reused at its own shape;
- **PNG is fine.** No JPEG copy is needed, except for a render over 8 MB, which gets one made and
  logged as `write-instagram-post` step 5 describes. Check each picture with `ffprobe` and its file
  size against section 3.2. Without ffmpeg, check the file size and the format from the file itself,
  say that the picture's dimensions could not be measured, and make no JPEG copy any other way.

## 4. Write the text

1. **The opening line** comes from `write-hook`, called inline with the social post surface, the
   draft and the resolved brand and campaign. Threads shows the opening of a post in the feed, so the
   first line has to earn the rest. Keep its options for the doc; it writes no file and no log line
   of its own when called this way.
2. **The body.** Conversational, in the byline's voice, short. Threads posts read like someone
   talking, not like a caption under a picture. No line of hashtags.
3. **One invitation.** The one-line job's ask. A link is fine here and is clickable; on a **text**
   post the first link becomes the preview card, so put the one that matters first, or set it as the
   post's `link` (step 5). At most five unique links in the whole text.
4. **The topic tag, not hashtags.** Threads allows one tag per post, set as the post's `topic_tag`
   (1 to 50 characters, no `.` or `&`, no `#`). Choose it in this order: the campaign's own tag from
   the brief; else the first `social.hashtags.always` tag; never a `never` tag; none is a fine answer.
   **Never write a `#word` in the text**: the first one would silently become the post's tag.
5. **@mentions** only for real handles you were given.

**Claims and honesty**, exactly as `write-instagram-post` step 4: only `claims_allowed` about a
product, stronger claims softened and flagged with `⚠️ CLAIM CHECK:` **outside** the fence, every
`nogo` and `mandatory` honoured, nothing invented, any placeholder named on hand-back and marking the
post as not ready.

**Count it in bytes.** Measure the finished text with `printf %s "<text>" | wc -c` (or, in
PowerShell, `[Text.Encoding]::UTF8.GetByteCount($text)`) and keep it at 500 or under, per section 3.4.
Count the unique links. Fix anything over before writing the doc.

## 5. Write the doc

Write `campaigns/<slug>/content/<id>.md` in the same shape as `write-instagram-post` step 6, with the
Threads fields:

````markdown
---
platform: threads
format: text                 # text | single | carousel
aspect: 4x5                  # omit for a text post
account: "@acmeskin"         # social.threads from the pack; empty if the pack has none
topic_tag: "skincare"        # one tag, no #; omit for none
link: "https://acme.example/serum"   # text posts only: the preview card; omit for none
suggested_time: "Wed 08:30"  # a note for the person; nothing is scheduled
media: []                    # posting order; each item has path and alt_text, as on Instagram
---

# Threads post — <short name>

## The post in one line
<the one-line job>

## Caption
```text
<the post text, character for character as it will be posted>
```
Bytes: 312 of 500 · Links: 1 of 5 · Topic tag: skincare

## Pictures
<one entry per picture, as in write-instagram-post's Slides; or "none, text only">

## Opening line options
<write-hook's ranked options, top pick first>

## Still to do
<every placeholder, flagged claim, picture still waiting — or "nothing">
````

The fence is load-bearing for the same reason as on Instagram, and `publish-social` posts its
contents exactly. `link` is only for a text post, and only a URL that already appears in the text or
that the person gave you. No `social.threads` in the pack: leave `account` empty and say on hand-back
that posting will need the handle recorded first.

## 6. Log, then rebuild

Per `campaign-structure.md` section 4.1: one `generate` line for the doc (`content/<id>.md`, `status:
iteration`, the format and top opening line in `notes`), plus a `derived` line for any JPEG copy you
had to make. Renders were logged by the skills that made them. Then rebuild the page once with
`build-site`. Outside a campaign, write where asked and skip the log; only campaign work is posted.

## 7. Self-review

1. One job, one invitation, and it reads like a person talking?
2. Text at 500 bytes or under, **counted**? Five links or fewer? No `#word` anywhere in the text?
3. At most one topic tag, valid characters, no `never` tag?
4. For a text post, the link that matters comes first or is set as `link`?
5. Pictures: each within section 3.2, one shape for the post, 20 or fewer, alt text on every one?
6. Claims within `claims_allowed`, flags outside the fence, every `mandatory` honoured, no `nogo`?
7. Nothing invented: no stat, customer, quote, price, handle or URL?
8. Voice, spelling (`voice.spelling`), few em dashes, nothing from the phrases to avoid?
9. Ladders up to the key message?

## 8. Hand it back

Per `plain-language.md` sections 5 and 6: the opening line options and the post as it will read;
what is left for them (placeholders, flagged claims, a missing handle); then one next action, usually
to have it checked and then posted, offering the check first. One path, the doc's, in full. Name no
skill.

## House rules

- **Draft, never post.** Posting is `publish-social`.
- **Counted in bytes, against the spec.** `social-platforms.md` section 3 holds every number.
- **One tag, set as the tag.** Never a hashtag in the text.
- **No render without its gate.** New pictures go through `generate-image` or `compose-lockup`.
- **Never fabricate.** No invented claim, handle, link, path or count.
- British spelling, few em dashes, nothing that reads as machine-written.
