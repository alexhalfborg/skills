# Social platforms — organic post limits

The canonical contract for what an organic social post may be on each platform the engine drafts
for and publishes to: picture sizes, text limits, counts. Skills reference this document instead of
restating the numbers; where a skill's own wording disagrees with this spec, **this spec wins**.

It covers **organic** posts only. Paid placements have their own limits, which live with the ads
pipeline in `${CLAUDE_PLUGIN_ROOT}/skills/write-ad-creative/references/platform-specs.md`.

**Path note.** `${CLAUDE_PLUGIN_ROOT}` below means the plugin's install directory. Unlike a SKILL.md,
this file is read as plain content, so that placeholder is **not** substituted for you — use the
resolved absolute path the skill that sent you here already had.

**Platforms move these numbers.** Every figure carries where it came from and when it was last
checked. A figure marked *uncertain* is one the source contradicts itself on; work to the stricter
reading. When a platform changes a limit, change it here first, then the skills that defer to it.

Read by: `write-instagram-post` and `write-threads-post` (drafting to the limits), `publish-social`
(re-checking before the gate), `run-qa` (the platform check in Family 2 and Family 3).

---

## 1. How to count

- **Counted, not estimated.** Measure every length with a tool, never by eye: `wc -m` on the text in
  Bash, or `(Get-Content -Raw <file>).Length` in PowerShell, run over exactly the text that will be
  sent. Count hashtags and @mentions by matching them, not by scanning.
- **The caption includes its hashtags.** A caption's length is the whole text as posted, hashtags,
  line breaks and emoji included.
- **Characters or bytes, per platform.** Instagram's limit is counted in characters (`wc -m`).
  Threads counts emoji by their UTF-8 bytes, so a Threads text is counted in bytes (`wc -c`), the
  stricter reading. Each platform's section says which.
- **A hashtag** is `#` followed by letters, numbers or underscores, up to the first space or
  punctuation. **An @mention** is `@` followed by a handle.
- Image checks read the file itself: `ffprobe -v error -show_entries stream=width,height,codec_name
  -of csv=p=0 <file>` for size and format, and the file size on disk for weight.

---

## 2. Instagram

Organic feed posts through the Instagram Content Publishing API, as `publish-social` sends them.
Sources: <https://developers.facebook.com/docs/instagram-platform/content-publishing> and
<https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media>.
Last checked 2026-11-03.

### 2.1 What can be posted

| Format | In scope | Notes |
|---|---|---|
| Single image | yes | one picture plus a caption |
| Carousel | yes | 2 to 10 pictures plus one caption (section 2.3) |
| Reel | not yet | video; a later release |
| Story | not yet | expires after 24 hours; a later release |

- **The account must be professional** (Business or Creator). A personal account cannot publish
  through the API at all. `publish-social` finds this out from the account itself, never assumes it.
- **No scheduling.** The API has no scheduled-publish option for Instagram, and an unpublished
  container expires after 24 hours. A post goes out when it is approved. A draft's `suggested_time`
  is a note for the person, never an instruction to anything.

### 2.2 Pictures

| Rule | Limit | Severity when broken |
|---|---|---|
| Format | **JPEG only** | the API rejects anything else |
| Colour | sRGB | the API converts other spaces, unpredictably |
| File size | ≤ 8 MB | rejected |
| Aspect ratio (width ÷ height) | **0.8 to 1.91** — from 4:5 portrait to 1.91:1 landscape | rejected |
| Width | 320 to 1440 px; wider is scaled down, narrower scaled up | outside the range is resized by Instagram, not rejected |
| Recommended | **1080 × 1350 (4:5)** — the tallest feed shape, so the most screen | house default, not an API rule |
| Square | 1080 × 1080 (1:1) | acceptable |

The engine's renders are PNG, so every picture is posted as a **JPEG derivative** of its render:
same stem, same version, `.jpg` (`${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md` section 3).
Make it with ffmpeg, capping the width at 1440 and keeping the shape:

```bash
ffmpeg -hide_banner -loglevel error -i "<render>.png" -vf "scale='min(1440,iw)':-2" -q:v 2 "<render>.jpg"
```

Never re-crop to force a picture into range. A 9:16 render is outside the feed range and needs a
picture made at a feed shape, not a crop of the vertical one.

### 2.3 Carousels

| Rule | Limit |
|---|---|
| Items | 2 to 10. The API itself allows 20, but the server the engine publishes through caps a carousel at 10, so **10 is the working limit** |
| Shape | every item is cropped to the **first** item's aspect ratio, so every slide must share one ratio |
| Captions | one caption for the whole post; slides cannot carry their own |
| Alt text | per picture (section 2.5) |

### 2.4 Caption

| Rule | Limit | Notes |
|---|---|---|
| Length | ≤ 2,200 characters | hard limit |
| Before "…more" | about the first 125 characters | how the app displays a caption, not an API rule. The opening line has to work on its own here |
| Hashtags | ≤ 30 | hard limit. House default **3 to 5**, at the end of the caption |
| @mentions | ≤ 20 | hard limit |
| Links | not clickable in a caption | write "link in bio" style directions rather than a URL that cannot be tapped |

### 2.5 Alt text

| Rule | Limit |
|---|---|
| Length | ≤ 1,000 characters |
| Applies to | images only (not Reels or Stories) |

Every picture in a draft carries alt text. It describes what is in the picture for someone who
cannot see it; it is not a second caption and carries no hashtags.

### 2.6 Account limits

| Rule | Limit |
|---|---|
| Posts per rolling 24 hours | about **100**; a carousel counts as one. *Uncertain:* the same documentation page also says 50, so treat 50 as the safe ceiling |
| Labels | an AI-info label may be applied to a post (`is_ai_generated`); see `publish-social` |

---

## 3. Threads

Single posts through the Threads API, as `publish-social` sends them. Sources:
<https://developers.facebook.com/docs/threads/overview> and
<https://developers.facebook.com/docs/threads/posts>. Last checked 2026-11-03.

### 3.1 What can be posted

| Format | In scope | Notes |
|---|---|---|
| Text only | yes | the native Threads post; may carry one link preview |
| Single image | yes | one picture plus text |
| Carousel | yes | 2 to 20 pictures plus one text (section 3.3) |
| A thread of replies (a chain of posts) | not yet | each reply is its own post and its own approval; a later release |
| Video | not yet | a later release |

- **No scheduling** through the server the engine uses. `suggested_time` is a note for the person.
- **No AI-info label** exists in the Threads publishing options the engine uses, so none is applied
  or offered.
- **Never cross-shared.** The API can also share a post to the linked Instagram account as a Story;
  the engine never does, because that would be a second, unapproved post.

### 3.2 Pictures

| Rule | Limit | Severity when broken |
|---|---|---|
| Format | JPEG or PNG | anything else is not supported |
| Colour | sRGB | other spaces are converted |
| File size | ≤ 8 MB | rejected |
| Aspect ratio | up to 10:1 either way | rejected |
| Width | 320 to 1440 px; wider is scaled down, narrower scaled up | resized, not rejected |
| House default | the post's pictures at the campaign's feed shape, 4:5, or square | a choice, not an API rule |

PNG renders post as they are. A JPEG copy (section 2.2's ffmpeg line, logged as `derived`) is needed
only for a render over 8 MB. A picture already made as an Instagram JPEG copy can be reused as is.

### 3.3 Carousels

| Rule | Limit |
|---|---|
| Items | 2 to 20; the server allows 20 too |
| Text | one for the whole post |
| Alt text | per picture |
| Rate limit | a carousel counts as one post |

### 3.4 Text

| Rule | Limit | Notes |
|---|---|---|
| Length | ≤ **500**, counted in **UTF-8 bytes** for safety | Meta counts emoji by their UTF-8 bytes, so one emoji uses several of the 500. Work to the stricter reading: count the whole text with `printf %s "<text>" \| wc -c` (bytes), not `wc -m`. For plain English text the two are the same |
| Links | ≤ 5, counting every unique URL in the text | since 2025-12-22 a post with more is rejected |
| Link preview | text-only posts only | the first URL in the text, or the post's `link`, becomes the preview card. A picture post shows no preview card |
| Topic tag | **exactly one per post at most**, 1 to 50 characters, no `.` or `&` | set as the post's `topic_tag`, never as a hashtag in the text: the first `#word` in the text would otherwise become the post's tag |
| Hashtags in the text | none | see topic tag. A Threads post is not tagged the Instagram way |
| @mentions | real handles only | no documented cap |

### 3.5 Alt text

Per picture, ≤ 1,000 characters. Same rules as section 2.5.

### 3.6 Account limits

| Rule | Limit |
|---|---|
| Posts per rolling 24 hours | 250 published through the API; a carousel counts as one |
| Account | any Threads profile the token belongs to; the app must list it as a tester until Meta approves the app for wider use |

## 4. Facebook Pages

Not yet drafted for. `write-facebook-post` will add this section with its own source and date.
