---
name: publish-social
description: >-
  Post a finished organic social post to the brand's live account, today Instagram feed posts
  (single image or carousel) and Threads posts (text, single image or carousel), through the
  plugin's meta MCP server, after an unconditional per-post approval that shows the exact text, the
  pictures in order, the alt text and the account it goes out on. Use whenever the user wants a
  drafted post actually put live: "post it", "publish the Instagram post", "put the carousel live",
  "post this to Threads", "send the launch post out", "go ahead and post [deliverable]". Reads
  campaigns/<slug>/content/<id>.md (the frontmatter write-instagram-post or write-threads-post wrote:
  platform, format, media paths with alt text, topic_tag and link for Threads; the text fenced under
  ## Caption), the active brand's social.instagram or social.threads handle from
  brands/<id>/pack.yaml, docs/qa-report.md, system/generation-log.jsonl and
  schema/social-platforms.md. Before the gate it checks the connected account is the brand's own
  (ig_get_profile / threads_get_profile), that the post was not already published, that QA holds no
  FAIL for it, and re-counts every limit. It uploads each picture to fal with upload_file (never a
  spending fal call) to give Meta the public address it fetches from, then posts with
  ig_publish_photo / ig_publish_carousel or threads_publish_text / threads_publish_image /
  threads_publish_carousel, logs a publish event and status final, and rebuilds the site. With
  publishing not set up it posts nothing and hands back the text, pictures and alt text to post by
  hand. It never edits the post, never deletes one, never schedules, and never cross-posts. Do NOT
  use to write or fix the post (write-instagram-post, write-threads-post), to check it against the
  brand's rules (run-qa), for paid ads or boosting (write-ad-creative), or for Facebook, Reels,
  Stories, video or a chain of Threads replies, which are not supported yet.
---

# publish-social — post a finished draft, with a yes for every post

This is the only skill in the engine that puts anything in front of the public. It is therefore the
most literal one: it posts **exactly** the text and pictures the draft holds, to the one account the
brand pack names for that platform, after the person has seen all of it and said go. It does not
rewrite, tidy, re-crop, convert or "fix" anything. A draft that is not ready goes back to be
redrafted, the same way `generate-image` renders an existing prompt and never improves it.

**Posting cannot be undone the way a render can.** An unspent render costs nothing; a post is public
the moment it lands, and the most anyone can do afterwards is delete it. So the gate in step 4 is
unconditional: one approval per post, every time, and no `engine.yaml` value, earlier instruction or
"post them all" relaxes it.

Scope today: **Instagram feed posts** and **single Threads posts**. Facebook Pages, Reels, Stories,
video and chains of Threads replies are not supported yet. Say so plainly if asked, and offer the
by-hand block (step 2) instead.

Campaign paths, the log and its events follow `${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md`.
Every limit is `${CLAUDE_PLUGIN_ROOT}/schema/social-platforms.md`. Everything said out loud follows
`${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md`. All three win over anything written here.

## The two platforms

Everything below is the same for both, except what this table says. Read the row for the draft's
`platform` and use nothing from the other column.

| | Instagram | Threads |
|---|---|---|
| Draft's `platform` | `instagram` | `threads` |
| Brand handle | `social.instagram` | `social.threads` |
| Readiness read | `ig_get_profile` | `threads_get_profile` |
| Formats | `single`, `carousel` (2 to 10) | `text`, `single`, `carousel` (2 to 20) |
| Picture format | JPEG only | JPEG or PNG |
| Limits | `social-platforms.md` section 2, text in characters | section 3, text in UTF-8 bytes |
| Publish tools | `ig_publish_photo`, `ig_publish_carousel` | `threads_publish_text`, `threads_publish_image`, `threads_publish_carousel` |
| Link lookup | `ig_get_media` | `threads_get_post` |
| Unclear-failure check | `ig_get_media_list` | `threads_get_posts` |
| Extra fields sent | `is_ai_generated` | `topic_tag`; `link_attachment` on a text post |
| AI-info label | yes, per step 4's rule | not available; say so in the receipt |
| Processing | can take several minutes (checked once a minute) | usually under a minute |
| Delete in the app | the post's **…** menu → **Delete** | the post's **…** menu → **Delete** |

## 1. Resolve the post

Run `${CLAUDE_PLUGIN_ROOT}/schema/preflight.md`. Then read:

- **The draft**, `campaigns/<slug>/content/<id>.md`. Its frontmatter: `platform`, `format`, `aspect`,
  `account`, `media` (paths in posting order, each with `alt_text`), and for Threads `topic_tag` and
  `link`. Its text: the contents of the fenced block under `## Caption`, character for character. Read
  it from the file, never from the conversation, even if you wrote it a minute ago. A draft with no
  frontmatter, no caption fence, a `platform` outside the table, or no pictures on a picture format
  was not made to be posted: say what is missing and offer to have it drafted properly.
- **The brand.** `campaign.brand` from `system/manifest.yaml`, then the platform's handle from
  `brands/<id>/pack.yaml`.
- **The record.** `system/generation-log.jsonl` (has this deliverable been published? what made each
  picture?) and `docs/qa-report.md` if it exists.

Only campaign work is posted. Outside a campaign there is no log to record the post in and no pack to
check the account against; offer to start a campaign or hand back the by-hand block.

## 2. Is publishing set up here?

Publishing needs, live in this session:

- **the plugin's `meta` server**, whose tools appear prefixed by the server (in Claude Code,
  `mcp__plugin_halfborg-campaign_meta__ig_get_profile` and so on). Match on the tool's own name under
  the plugin's `meta` server, and on nothing else: a Meta connector the user added to claude.ai is a
  different connection (Meta's official one handles ads, not posts) and is never used here;
- **fal**, the `mcp__fal-ai__upload_file` and `mcp__fal-ai__verify_upload` tools, for any post with
  pictures, because Meta fetches every picture from a public web address and cannot take a file from
  this computer (step 5). A Threads **text** post has no pictures and does not need fal.

**Tools present is not proof of set-up.** The `meta` server starts even with no token entered, so
the real test is one read: the platform's readiness read from the table (free, changes nothing). It
answers one of three ways:

| It returns | Means | Do |
|---|---|---|
| a profile with a `username` | connected | carry on |
| an error about a missing, invalid or expired access token (an OAuth error, code 190, "Error validating access token", "Session has expired") | not set up for this platform, or the token has run out | the by-hand block below, plus the renewal pointer |
| any other error | something else is wrong | say what came back, plainly, and post nothing |

Instagram and Threads have separate tokens, so one can be set up while the other is not.

**The tools this skill may call, and no others:** from the `meta` server, `ig_get_profile`,
`ig_publish_photo`, `ig_publish_carousel`, `ig_get_media`, `ig_get_media_list`,
`threads_get_profile`, `threads_publish_text`, `threads_publish_image`,
`threads_publish_carousel`, `threads_get_post`, `threads_get_posts`; from fal, `upload_file` and
`verify_upload`. The `meta` server also offers deleting posts, replies, comments, direct messages,
insights, searches and token tools. **Never call any of them**: they are out of this skill's job, and
the token tools would put the brand's access token into the conversation.

**When publishing is not set up**, post nothing, and do not call it an error. Say that posting to
this platform from here is not set up, so here is the post to put up by hand, then give the by-hand
block:

- the **platform and account** it is meant for;
- the **text**, verbatim, in a fenced code block, ready to paste;
- the **pictures in posting order**, each as its full path with its alt text beside it (Instagram:
  **Advanced settings → Accessibility** when posting; Threads: tap a picture, then **Alt**);
- for Threads, the **topic tag** to add and the **link** for the preview card, if any;
- for Instagram, whether to switch on the **AI info label** (step 4's rule).

Then, once and in a clause: setting up posting is a one-off, and `/halfborg-campaign:setup-engine`
walks through it; if the token has simply run out, the steps to renew it are in
`${CLAUDE_PLUGIN_ROOT}/skills/publish-social/references/meta-setup.md`. **Never ask for a token, a
password or a user id in the conversation.** Write no log line and invent no link.

If they later say they posted it themselves and give the link, log it per step 7 with the link they
gave and `"notes":"posted by hand"`; never compose a link they did not give.

## 3. Checks before the gate

Run these in order and stop at the first that fails. Each failure is a plain sentence and a route,
never a fix applied here.

1. **Already posted?** If the log holds a `publish` event for this deliverable, say it went out
   already, when, and give its link. Post it again only if they say they want a second, separate post
   of the same thing, and then still through the full gate.
2. **Right account.** No handle for this platform in the pack: stop. The brand's own handle is what
   stops one brand's campaign going out on another brand's feed, and it is a brand fact this skill
   must not infer; route to `/halfborg-campaign:setup-brand` to record it. Otherwise compare it with
   the profile's `username` (ignore case and a leading `@`). **If they differ, stop**, and name both:
   the account this workspace is connected to, and the one this brand's campaign belongs to. Never
   offer to post to the connected account anyway.
3. **The final check.** In `docs/qa-report.md`:
   - any **FAIL** on this post's doc or any of its pictures → **stop**. Name the top finding in a
     sentence and offer to send the post back to be fixed. A known problem never goes out.
   - no report, a report that does not cover this post, or a report dated before the post's latest
     log line → it has not been checked as it stands. **Do not stop**: say so in the gate's sentence
     and recommend the check first, as a choice, not a block.
   - WARNs only → carry on, and say how many are worth a look in the gate's sentence.
4. **The limits, re-counted.** Against the platform's section of `social-platforms.md`, measured with
   a tool per its section 1 — never trusting the counts written in the doc:
   - **Instagram:** caption length in characters, hashtag and @mention counts, no
     `social.hashtags.never` tag; one picture for `single`, 2 to 10 for `carousel`; every picture a
     JPEG, 8 MB or under, 320 to 1440 wide, inside the feed aspect range, every slide one shape.
   - **Threads:** text length in UTF-8 bytes, at most five unique links, no `#word` in the text, at
     most one `topic_tag` (1 to 50 characters, no `.` or `&`, not a `never` tag), `link` only on a
     `text` post; no pictures for `text`, one for `single`, 2 to 20 for `carousel`; every picture a
     JPEG or PNG, 8 MB or under, aspect within 10:1, one shape across a carousel.
   - **Both:** every picture exists and has alt text within its limit; no unfilled placeholder in the
     text (`[URL-needed]`, `[STAT/SOURCE: …]`, `[PRICE-needed]`).

   Anything over or missing: stop, say exactly what, and offer to have the post redrafted. Do not
   convert a picture, trim the text, or drop a tag or link yourself.

## 4. GATE — show exactly what goes public, one post at a time

**Never upload or call a publishing tool before the person has seen this post and said go.** One
approval covers one post as shown. A different text, a different picture, a different order or a
second post means a fresh gate. An earlier "post them all", "go ahead with the campaign", approval of
the draft, or a yes for the same campaign's post on the other platform is not approval to post this
one. Several posts ready at once still means one gate each.

Present it per `plain-language.md` section 4, in two parts.

**Part one, the sentence.** What is about to go out, where, and that it cannot be taken back.

> I'll post the launch carousel, five slides, to @acmeskin on Instagram. This goes public straight
> away and can only be deleted, not undone.

> I'll post the launch announcement, text only with a link to the serum page, to @acmeskin on
> Threads. This goes public straight away and can only be deleted, not undone.

Add the final-check status when it matters: "It has not been through the final check since it last
changed; I'd run that first", or "Two things in the check are worth a look first."

**Part two, the receipt**, under **Exactly what gets posted**, complete and unabbreviated:

- **Platform and account:** the handle, exactly as the profile returned it;
- **Post:** text only, single picture, or carousel of N;
- the **text, verbatim, in a fenced code block**, character for character what is sent, with its
  counted length (characters on Instagram, bytes on Threads);
- the **pictures in posting order**, each as its full path with its alt text (or "none");
- **Threads only:** the **topic tag** (or "none") and the **link preview** (or "none");
- **AI info label:** on Instagram, on or off, and why. It is **on** when any picture was made by a
  model (its own `generate` line, or the render a copy was made from, carries a `model`), and **off**
  only when every picture is the brand's own (`"source":"user"`) or stock. The person may switch it
  off; that is an adjustment, so show the gate again. On Threads, say plainly that Threads offers no
  such label here.

The receipt never shrinks to read better, and the sentence never contradicts it.

Then offer three plain choices of equal weight:

1. **Post it** — carry on to step 5, then step 6.
2. **I'll post it myself** — give the by-hand block from step 2 and stop. Log nothing unless they come
   back with the link.
3. **Change something first** — send the change back to be redrafted, then gate again. An
   adjustment is not a yes.

**Silence is not a yes.** If there is no clear answer, post nothing.

## 5. Put the pictures where Meta can fetch them

Skip this step for a Threads text post.

Meta's publishing APIs take a public HTTPS address for each picture, never a local file. fal's upload
gives one, and **uploading spends nothing**: `upload_file` and `verify_upload` are the only fal tools
this skill calls, and they are not renders. This happens **after** the yes in step 4 and before
anything is posted, so a picture is never uploaded for a post that was declined.

For each picture, in posting order:

1. `upload_file` with `prepare_upload: true`, the file's `file_name` and its exact `file_size` in
   bytes. It returns a signed `upload_url` and the `file_url` the file will live at.
2. PUT the raw bytes to the signed address, with the file's real type (`image/jpeg` or `image/png`):
   `curl -sS -X PUT --upload-file "<path>" -H "Content-Type: image/jpeg" "<upload_url>"`.
   Never print or log the signed address.
3. `verify_upload` with the `file_url` and the same `file_size`. Only a verified address is used.

Upload fresh on every run; never reuse an address from an earlier one. These addresses are plumbing:
they are not logged (the log records paths) and not shown. If an upload or a check fails, stop
before posting anything and say which picture would not go up.

## 6. Post it

Say first how long it may take (the table's processing row): the tool waits for the platform to
finish processing before it publishes.

**Instagram**
- **Single:** `ig_publish_photo` with `image_url` (the verified address), `caption` (the fenced text,
  exactly), `alt_text`, and `is_ai_generated` per the gate.
- **Carousel:** `ig_publish_carousel` with `items` in posting order (`type: IMAGE`, `url`,
  `alt_text` each), `caption` and `is_ai_generated`.
- Set nothing else: no location, no user tags, no paid-partnership label, no collaborators.

**Threads**
- **Text:** `threads_publish_text` with `text` (the fenced text, exactly), plus `topic_tag` and
  `link_attachment` (the draft's `link`) when the draft sets them.
- **Single:** `threads_publish_image` with `image_url`, `text`, `alt_text`, and `topic_tag` when set.
- **Carousel:** `threads_publish_carousel` with `items` in posting order (`type: IMAGE`, `url`,
  `alt_text` each), `text`, and `topic_tag` when set.
- Set nothing else. In particular **never** `crossreshare_to_ig` or `crossreshare_to_ig_dark_mode`
  (that would make a second, unapproved post on Instagram), and no poll, GIF, quote, spoiler, ghost
  post, location, reply controls or reply approvals.

Each call creates the post, waits for processing, and publishes it, returning the new post's `id`.
Then the platform's link lookup with that id (`ig_get_media` with `fields: "id,permalink,username"`,
or `threads_get_post` with `fields: "id,permalink,username"`) for the link.

**If a call fails, find out before doing anything else.** An error that came back before anything was
published is a failure to report plainly. But a timeout or an unclear error may have posted anyway,
so **never retry blind** — a retry can post it twice. Check the platform's unclear-failure list for a
post with this text in the last few minutes. If it is there, it went out: log it as posted. If it is
not, say nothing was posted, and offer to try again through a fresh gate.

## 7. Log it and rebuild

Per `campaign-structure.md` sections 4 and 4.1:

1. one `publish` event: `platform` (`instagram` or `threads`), `account` (the profile's `username`),
   `files` (the posted pictures, in order; `[]` for a Threads text post), `post_id` and `permalink`
   exactly as returned, `caption_ref: content/<id>.md`, and `ai_label` on Instagram. No link came
   back: log the `post_id` alone and say so in `notes`; never compose a link from the id;
2. one `status` → `final` line per posted file, `reason: "published to Instagram"` or `"published to
   Threads"`. A text post has no files and gets none.

Then rebuild the page once, following `build-site` for `campaigns/<slug>`.

**A post taken down later.** There is no delete here. If they want a post removed, give them its link
and say how to delete it in the app (the table's last row). When they say it is gone, log one
`status` → `superseded` line per file, with a `reason` saying it was removed from the platform, or for
a text post one `note` event saying so, and rebuild.

## 8. Report back

Per `plain-language.md` sections 5 and 6:

- **that it is live**, named as the thing it is, and on which platform and account;
- **the link**, exactly as the platform returned it — the one thing they will open;
- **anything that did not go to plan**: a picture that was slow to process, a link that did not come
  back.

End on one next action: usually the next post on the list (often the same post for the other
platform, which needs its own yes), or a look at the live post. One offer, and name no skill.

## House rules

- **A yes for every post.** The gate is unconditional and per post, per platform. Nothing relaxes it.
- **Post exactly what the file holds.** Never rewrite, trim, convert, re-crop or re-order. A draft
  that is not ready goes back; it is never fixed here.
- **The brand's own account, or nothing.** The connected account must match the brand's handle for
  that platform; a mismatch is a stop, never a choice.
- **A known problem never goes out.** A QA FAIL blocks; a missing check is a recommendation.
- **Only the listed tools, only the listed fields.** No delete, replies, comments, messages, insights
  or token tools from the `meta` server; no cross-posting; no spending fal tool.
- **No secrets in the conversation.** Never ask for, print or pass a token, password or user id.
- **Never fabricate.** Only the link and id the platform returned; never a composed link, never a post
  reported live that was not confirmed.
- **Never retry blind.** An unclear failure is checked before anything is tried again.
- British spelling, few em dashes, nothing that reads as machine-written.
