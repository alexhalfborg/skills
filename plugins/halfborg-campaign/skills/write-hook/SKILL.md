---
name: write-hook
description: >-
  Suggest up to five ranked hooks for a piece of organic content: the one line that earns the open,
  the click, or the stop. Reads the content, works out its strongest true promise, then drafts for
  the surface it is going out on: an email subject line paired with preview text, an article or blog
  headline, the first line of a social post, a YouTube video title, or a single line for a short that
  works both as first-frame text and as its platform title. Use whenever the user wants a headline,
  subject line, title, or hook for content that already exists. Trigger on "write a headline for
  this", "subject line options", "give me a YouTube title", "title for this short", "what should the
  first frame say", "better hook for this post", "what should I call this", "punch up the title".
  Also called inline by write-email, write-personal-post and write-customer-story, which hold no hook
  method of their own. Accepts pasted text, a file path, a campaign deliverable id, a web URL, a video
  script or transcript, or a video file (frames sampled with ffmpeg; the audio is never heard, so it
  asks for a transcript when speech carries the piece). Reads the active brand's
  brands/<id>/voice/shared.md plus one byline profile, brands/<id>/pack.yaml (audience,
  claims_allowed, nogos, voice.spelling) and, inside a campaign, campaigns/<slug>/docs/message.md;
  runs without a brand and says what it could not check. Ranks best first with a reason for each,
  never predicts open or click rates, and keeps every hook paid off by the content. Inside a campaign
  a direct request writes campaigns/<slug>/content/<source-id>-hooks.md, logged and site-rebuilt, and
  applies the picked line to the source only when asked. Do NOT use for paid-ad headlines, primary
  text, or ad hooks (write-ad-creative, or write-video-ad-script for a video ad's opening seconds),
  for the campaign tagline (write-message), to set a headline onto an image (compose-lockup), to
  draft the content itself (write-email, write-personal-post, write-customer-story), or to render
  anything.
---

# write-hook — the line that earns attention

This skill reads a finished or near-finished piece of content and suggests the line that gets it
noticed: up to five options, ranked, each one a different angle and each one something the content
actually delivers. It writes words only. It never touches fal, never sets type on a picture, and
never drafts the content underneath.

The method (the angles, the per-surface rules, the ranking order, the clickbait test) is
brand-agnostic and lives in [references/hook-craft.md](references/hook-craft.md). Read it before
drafting. Every brand fact comes from the brand's own files.

Where the neighbours sit:

- `write-email`, `write-personal-post`, `write-customer-story` — draft the content, then call this
  skill inline for the subject line or headline. They hold no hook method of their own; this is it.
- `write-ad-creative` / `write-video-ad-script` — paid hooks. An ad's hook is tied to its funnel
  stage, its angle bank and the presenter decision in the pack's `ads` block, so it stays there.
  If the request is for an ad, say so in a line and route it.
- `write-message` — owns the campaign's tagline. Read-only here. A hook may echo the tagline; it is
  not a replacement for it.
- `compose-lockup` and the render skills — put words onto pictures and clips. This skill hands them
  the words.
- `content-writer` — the agent that routes a direct hook request here.

Campaign paths and filenames follow `${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md`;
readiness and routes follow `${CLAUDE_PLUGIN_ROOT}/schema/preflight.md`. Both win over any
shorthand here.

## Two modes

**Direct.** The user asked for hooks. You resolve the brand, read the content, write the hooks doc
inside a campaign (or keep it in the conversation outside one), hand back, and apply the pick if
asked.

**Inline.** Another skill called you partway through its own work and passed you the draft, the
surface, and the brand and campaign it has already resolved. Do not re-resolve them and do not ask
the user anything. Return the output block (below) to the caller and stop: **no hooks doc, no log
line, no rebuild, no hand-back.** The caller puts the options in its own doc and its own log line,
and presents them to the user itself.

## Before anything: resolve the brand and read the rules

Three cases. Take the first that applies.

1. **Inside a campaign.** The brand is `campaign.brand` in the campaign's `system/manifest.yaml`
   (`campaign-structure.md` section 1.1), never the folder prefix. Run the preflight tiers as far as
   the brand (2.3). Then read:
   - `brands/<id>/voice/shared.md`: reading level, regional register, mood, spelling, the
     regulated-advice boundary, and the phrases this brand avoids. Binding on every hook.
   - **One byline profile, never both.** Match the content's own byline: first-person founder
     writing reads `voice/personal-post.md`, team or third-person writing reads
     `voice/customer-story.md`. Only the register and any opener tells matter here; the rest of the
     profile is for drafting long-form.
   - `brands/<id>/pack.yaml`: `audience` (pains and jobs, the reason to care), `products[].claims_allowed`
     (the only things a hook may assert about a product), `nogos`, `voice.spelling`.
   - `docs/message.md`: the key message and the chosen tagline. A hook must not contradict the key
     message. If `message.md` is missing, carry on and note that the hooks were not checked against
     the campaign's message (preflight 2.4, "degrade and note").
2. **A named brand, no campaign.** The same reads, minus `message.md`. If the brand has no
   `pack.yaml`, do not interview the user for brand facts: say the brand is not set up yet, offer to
   carry on without it, and mention `/halfborg-campaign:setup-brand` as the way to set it up.
3. **No brand at all.** Proceed. Match the content's own spelling and register. Say plainly in the
   hand-back that no brand voice or cleared claims were checked, so any product claim in a hook is
   the user's to confirm.

If a voice profile is missing but the pack exists, use the pack's `voice.summary` and note that the
voice was matched to a summary rather than the brand's own writing.

## Read the content

Read the whole piece. A hook built on the first paragraph alone over-promises on the rest.

| Input | How to read it |
|---|---|
| Pasted text, or a file path | Read it in full. |
| A campaign deliverable id | Read `content/<id>.md`. If the id is on neither the manifest nor the log, warn and confirm per preflight ("Writing into a campaign"): name it, offer the closest match, carry on once they answer. |
| A web URL | Fetch it and read the article body. If the fetch fails or returns only a shell (a paywall, a video platform page), say so and ask for the text or a transcript. |
| A video script or transcript | Read it. Note the spoken opening line: for a short, the hook must add to it, not repeat it. |
| A video file | Sample frames, then decide whether speech carries it. See below. |

### A video file

The audio is never heard. Do not send it anywhere to be transcribed: only the render skills touch
fal, and this skill depends on no outside transcript tool.

1. Confirm ffmpeg with `ffprobe -version`. If it is not there, ask for the script, a transcript, or
   a one-line summary of what is said, and stop until you have one.
2. Read the duration and frame size:

   ```bash
   ffprobe -v error -show_entries format=duration:stream=width,height -of default=noprint_wrappers=1 "<video-file>"
   ```

3. Pull the first frame and five more spread evenly across the clip into a temporary folder outside
   the campaign (the session scratchpad), one command per timestamp:

   ```bash
   ffmpeg -y -v error -ss <seconds> -i "<video-file>" -frames:v 1 -q:v 3 "<scratchpad>/hook-frame-<n>.jpg"
   ```

4. Look at each frame. Note any on-screen text, what is shown, and whether the first frame already
   carries text a new line would collide with.
5. **If the frames suggest the piece is carried by speech** (someone talking to camera, captions
   cut mid-sentence, an interview set-up), say you could not hear it and ask for a transcript or a
   one-line summary of what is said **before ranking anything**. Do not draft from a guess about
   what someone said.
6. If the piece is visual (a product demo with no presenter, b-roll, text slides), draft from the
   frames and note that the audio was not heard.

### Which surface

Work it out from the content and where it came from: an email doc, a blog or article, a social
caption, a video script or file. For video, a vertical clip or a script of about a minute or less
is a short; anything longer is a long-form video. If the user named the surface, theirs wins. Ask
only when it is genuinely unclear, typically when a piece is being repurposed (a blog post that is
about to become a short). One surface per run; if they want two, run twice.

## Read it before you write a word

Before drafting, pin down four things. They become "The read" in the output block.

- **Promise.** The single most valuable thing the reader gets from this piece.
- **Reader.** Who it is for. Use the pack's `audience` persona when one fits.
- **Specific.** The most concrete detail in the piece: a number, a name, a moment, an object.
  Specifics carry hooks; generalities do not.
- **Pays off.** What the piece actually delivers, stated plainly. Every hook must stay inside this
  line.

If the piece has no clear promise, say so. A hook cannot fix a piece that does not know what it is
for, and the better advice may be to tighten the piece first.

## Draft, rank, filter

1. **Draft wide.** Eight to ten candidates across the angles in
   [references/hook-craft.md](references/hook-craft.md), following that file's rules for the
   surface: length, what the line has to do on its own, and what it must never do.
2. **Cut to distinct.** Two candidates on the same angle making the same promise are one option.
   Keep the stronger.
3. **Filter for honesty.** Run the clickbait test from the reference file on every survivor:
   - the content pays it off, in full;
   - any product claim sits inside that product's `claims_allowed`; nothing touches `nogos`;
   - any urgency is real (a real deadline, a real launch date), never manufactured;
   - nothing from the brand's phrases-to-avoid list; the brand's spelling throughout.

   A hook that fails on payoff but would work if the content did more does not go in the list. It
   goes under **Stronger, not yet earned**, with what the content would need to add to earn it.
   A hook that fails on claims or `nogos` is dropped.
4. **Rank** best first by the reference file's ranking order, and name a top pick with the reason in
   a clause. Up to five. **If only three honest, distinct options exist, return three.** Never pad.
5. **Never predict performance.** No expected open rate, click-through rate, or "this will do 2x".
   There is no data behind such a figure, and an invented number is worse than none.

## The output block

The same shape in both modes. In direct mode it is the body of the hooks doc; inline, it is what you
return to the caller.

```markdown
## Hooks: <surface> for <source name>

Source: <path, deliverable id, URL, or "pasted text"> · Surface: <email | article | social post | video | short>
Brand: <brand id, or "none: voice and claims not checked"> · Message: <checked | not available>

**The read**
- Promise: …
- Reader: …
- Specific: …
- Pays off: …

**Options, best first**

1. **<the hook>**
   Preview: <preview text, emails only>
   Angle: <angle> · <n> characters · <one-line reason>
2. …

**Top pick:** 1, because <clause>.

**Stronger, not yet earned** (only if any)
- "<hook>": the piece would need <what it would need to add>.

**Not checked** (only if any)
- <audio not heard / no brand voice / no campaign message / a claim the user must confirm>

**Picked:** not yet
```

Character counts are counted, not estimated.

## Where the output goes

**Direct, inside a campaign, with a source that is a campaign deliverable.** Write
`campaigns/<slug>/content/<source-id>-hooks.md`, where `<source-id>` is the source's manifest id or
registered sub-id. On a re-run for the same source, add the new block below the old one under a
`## Round <n>` heading rather than deleting earlier rounds, so earlier options and picks stay visible.
Then follow `campaign-structure.md` section 4.1: append one `generate` line, then rebuild the page
once by following `build-site` for `campaigns/<slug>`.

```json
{"ts":"...","event":"generate","skill":"write-hook","deliverable":"<source-id>","file":"content/<source-id>-hooks.md","status":"candidate","notes":"<surface>; top pick: <the hook>"}
```

No `model` and no `cost_usd`: nothing was rendered.

**Direct, anything else** (outside a campaign, or content that is not one of the campaign's
deliverables). Keep the block in the conversation. If they ask to save it, write it where they say,
and log nothing.

**Inline.** Return the block to the caller. Write nothing yourself.

## Applying the pick

When the user picks an option, by number or with their own edit of it:

1. If they edited it, run the honesty filter on the edited line. If it now fails, say why in one
   sentence and offer the nearest version that passes; do not refuse to apply a line they insist on,
   but leave a `⚠️ CLAIM CHECK:` flag beside it in the source when the problem is a claim.
2. Offer to write it into the source. Change nothing until they say yes. Where it goes:
   - an article: the H1;
   - an email doc: the subject line and the preview text, both;
   - a video script: the title line in the script's header (and the first-frame on-screen text
     for a short);
   - a social post: the first line.

   Text deliverables are edited in place; git keeps the history.
3. If the source is not a file (pasted text, a URL, a video file), hand the line back for them to
   use.
4. In a campaign, set `**Picked:**` in the hooks doc to the chosen line, append one `note` line to
   the log, and rebuild once:

   ```json
   {"ts":"...","event":"note","skill":"write-hook","deliverable":"<source-id>","file":"content/<source-id>-hooks.md","notes":"picked: <the hook>; applied to <source file | not applied>"}
   ```

Putting the line onto a picture or a clip is not this skill's job. If they want the first-frame text
burned into a short or set onto a static, offer that as the next step and let the right skill do it.

## When to ask before drafting

Ask if: the video is carried by speech and you have no transcript; a URL would not load; the
surface is genuinely ambiguous; or the hook would need a fact the content does not give (a real
deadline, a price, a date). For everything else, draft.

## Self-review checklist

1. Did you read the whole piece, not just the opening?
2. Is every option paid off by the content, with nothing promised that the piece does not deliver?
3. Every product claim inside `claims_allowed`, nothing on `nogos`, no manufactured urgency?
4. Five or fewer, each a different angle, with nothing padded?
5. Ranked, with a top pick and a reason, and no predicted open or click figure anywhere?
6. Within the surface's length rules, with counted characters?
7. Emails: every subject paired with preview text that completes or complicates it, never repeats it?
8. Shorts: one line, readable in about a second, not a repeat of the spoken opening?
9. The brand's spelling, register, and phrases-to-avoid list honoured, or the gap noted?
10. Everything you could not check (audio, brand, message, a claim) listed under **Not checked**?
11. Direct in a campaign: hooks doc written, one log line, one rebuild? Inline: nothing written?

## When you hand it back

Direct mode only; inline, the caller hands back. Follow `${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md`
sections 5 and 6. Three things, in this order:

1. **The options, best first, with the top pick named.** This is the decision they actually have to
   make. Show the lines themselves; the angle and reason can be a few words each.
2. **What you could not check**, plainly: the audio you did not hear, the brand voice or campaign
   message you had nothing to check against, any claim they need to confirm, and any stronger hook
   the piece has not yet earned.
3. **One next action.** Usually an offer to put the top pick into the piece itself. Name no skill.
