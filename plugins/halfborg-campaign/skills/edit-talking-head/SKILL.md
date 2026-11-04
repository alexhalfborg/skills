---
name: edit-talking-head
description: >-
  Turn a raw vertical talking-head recording into a finished 9:16 short: tighten the take (cut
  pauses, ums and false starts), open on the hook as a title in a brand-colour box held inside the
  4:5 crop for 3 to 5 seconds, open each sentence on the face then cut to stock b-roll or
  animated HyperFrames graphic cards (figure, phrase, reaction emoji, bar chart, step diagram, and a
  mock newspaper or web page for a cited article or study) until it ends, never meme GIFs or
  borrowed film/TV clips, punch in with zoom cuts on a
  single-angle take (listicle headlines, keywords), burn in fixed-size brand-styled word-by-word
  captions, and render the MP4 locally with HyperFrames (pinned npx hyperframes@0.9.6, free, no
  account). Use whenever the user has recorded footage of a person speaking to camera and wants it
  edited: "edit my talking head", "add b-roll to this", "cut the short", "tighten this take",
  "caption this video", "find b-roll for this video", "edit the short for [deliverable]". Reads the
  take from campaigns/<slug>/media/<id>/, the manifest entry (channel, format, funnel_stage), the
  script in content/<id>*.md if one exists (its [B-ROLL: ...] cues come first, its spelling fixes
  the captions), the short's picked first-frame line from content/<id>-hooks.md or the script
  (calling write-hook inline for options when none is picked), brands/<id>/pack.yaml (brand.name,
  products[].name, nogos, voice.spelling), brands/<id>/design.md (typeface, accent and dark
  colours) and, if present, docs/message.md.
  Transcribes with a local engine (Parakeet), finds silences with ffmpeg silencedetect, searches
  stock through whichever of the plugin's stock MCPs is live (pexels: pexels_search_videos /
  pexels_get_video; pixabay: pixabay_search_videos / pixabay_get_video), and stops
  once at a single approval of the cut list, the title, the cutaway picks and the zoom cuts, written to
  content/<id>-broll-plan.md with thumbnails shown on the campaign page. Writes the edit project to
  media/<id>/<id>-edit/, cutaways as media/<id>/<id>-broll<N>-v<NN>.mp4 logged with source_url and
  credit, and the short as media/<id>/<id>-v<NN>.mp4, verified with ffprobe and sampled frames.
  Never calls fal itself: an AI-generated cutaway goes through generate-video and its cost gate.
  Without a stock library it hands back search terms and links; without HyperFrames or Node it stops after the
  approval and hands back the cut list and clips. Do NOT use to write the script or the hook
  (write-video-ad-script, write-hook), to generate footage from a prompt (generate-video), to edit
  footage that is not a person talking to camera, or to join, trim or reformat ad clips.
---

# edit-talking-head: from a raw take to a finished short

Someone has recorded themselves talking to camera on a phone. This skill turns that take into a
short that is ready to post:

- the pauses, ums and false starts are cut out
- the hook opens the short as a title in a box of the brand's colour, placed so a 4:5 crop keeps it
- each sentence opens on the speaker, then cuts to stock clips or graphic cards until it ends
- on a single camera angle, zoom cuts punch in on listicle headlines and keywords
- captions light up word by word, one size throughout, in the brand's type and colour
- the result is rendered as a 1080×1920 MP4

It edits; it does not write. The words are the speaker's own, the script, if any, is upstream, and
so is the title line.

Three methods sit beside this file. Read them before the step that needs them:

- [references/broll-rules.md](references/broll-rules.md): how to tighten; the opening title; where
  cutaways, graphic cards and zoom cuts go and where they never go; which stock passes; how captions
  are corrected, re-timed and grouped.
- [references/hyperframes.md](references/hyperframes.md): every command and attribute, pinned to
  the version that was tested.
- [references/graphic-cards.md](references/graphic-cards.md): the HTML for each kind of graphic
  card, tested at the same version.
- `${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md` section 3.1: the edit folder's layout. Paths
  and filenames follow that spec, which wins over any shorthand here.

Readiness and routes follow `${CLAUDE_PLUGIN_ROOT}/schema/preflight.md`. Everything said out loud
follows `${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md`.

Where the neighbours sit:

- `write-video-ad-script` and the founder's own script skills write what is said. `write-hook` writes
  the first-frame line that becomes the opening title. This skill reads their output, calling
  `write-hook` inline when no line has been picked, and never rewrites it.
- `generate-video` is the only way a generated cutaway gets made. It owns the cost and the approval
  for that clip. This skill never touches fal.
- `run-qa` checks the finished short later. This skill never calls it.
- `content-writer` and `paid-creative` are the agents that bring a request here, for organic and paid
  shorts respectively.

## 1. Preflight and the take

Run the preflight tiers through 2.3 (workspace, campaign, brand). The deliverable is an asset entry
on the campaign's list, usually `format: talking-head-short`. A running series of shorts lives in
one long-running campaign with one entry per short, so a new short is a new entry, added the way
any deliverable is added. If the user names a short that is not on the list, ask, per preflight's
"Writing into a campaign".

**The message is optional here** (preflight 2.4, "degrade and note"). A series campaign often has no
`docs/message.md`. Read it if it exists, to check cutaways against the campaign's look and key
message. If it does not exist, carry on and note in the plan that those checks were skipped.

**The take.** It belongs at `media/<id>/<id>-aroll-v01.mp4`. If the user hands you a file somewhere
else, copy it there (the next free `vNN` if a take already exists, never overwriting) and log it:

```json
{"ts":"…","event":"generate","skill":"edit-talking-head","deliverable":"<id>","role":"aroll","file":"media/<id>/<id>-aroll-v01.mp4","source":"user","status":"iteration","notes":"copied from <the path they gave>"}
```

Then `ffprobe` it. You need its duration and its width and height. If it is wider than it is tall,
it will be centre-cropped to vertical, which may cut the speaker off at the edges. Say so in one
plain sentence before carrying on: "This was filmed sideways, so I will crop the middle of it to
vertical. If you are not in the centre of the frame you may get cut off."

## 2. What is available on this machine

Check everything once, up front, so the user hears about a gap before the work starts rather than
halfway through:

- **`npx -y hyperframes@0.9.6 doctor`** reports Node, ffmpeg, Chrome and the speech engines in one go
  (`hyperframes.md` section 1). If `npx` itself is missing, Node is not installed.
- **The stock libraries.** Check whether `pixabay_search_videos` (the plugin's `pixabay` server) and
  `pexels_search_videos` (its `pexels` server) are live. Either is enough. Never look for a key and
  never ask for one.

What each gap costs, said plainly and once:

| Missing | What happens |
|---|---|
| Node, or HyperFrames will not run | Plan and fetch as normal. At the end, hand back the cut list as timestamps and the downloaded cutaways, to assemble in any editor. Nothing is rendered. |
| ffmpeg | Stop before planning. Without it neither the pauses nor the render can be worked out. Say that plainly. |
| a speech engine | Offer to install Parakeet: a one-time download of several hundred megabytes, about a minute (`hyperframes.md` section 3). If they decline, stop. Without words there is nothing to cut or caption. |
| a stock library (Pixabay or Pexels) | Plan as normal, but each stock beat carries a search link instead of picks (step 5). |

None of these is an error, and none needs an apology. If neither library is live, mention once, in a
clause, that a free Pixabay key turns on stock search: it is entered under `/plugin`, the
**Installed** tab, **Halfborg Campaign Engine**, where Claude Code asks for it. Do not suggest a
Pexels key; Pexels has stopped issuing new ones. A user who already has one can enter it in the same
place.

## 3. Transcribe, find the pauses, tighten

1. Scaffold the edit folder if it does not exist (`hyperframes.md` section 2), including deleting
   the two instruction files init leaves behind.
2. Transcribe the take with Parakeet (`hyperframes.md` section 3) and rename the result to
   `transcript-aroll-vNN.json`. A take that was already transcribed is not transcribed again.
3. Find the silences with ffmpeg (`hyperframes.md` section 4).
4. Work out the kept parts by `broll-rules.md` section 1: pauses cut to about 0.1 seconds, fillers
   cut with their surrounding pauses, the last complete take of every false start, doubtful repeats
   kept and flagged.

Tightening never touches the take. It is a list of start and end times that the edit file plays in
order (`hyperframes.md` section 6).

## 4. Plan the short

Read the script, if one exists (`content/<id>.md`, or the `content/` doc the manifest entry or the
user points at). Then shape the tightened timeline by `broll-rules.md` section 2.

**The title.** Find the short's first-frame line, in this order:

1. `**Picked:**` in `content/<id>-hooks.md`, the latest round;
2. the first-frame on-screen text in the script's header;
3. neither: call `write-hook` inline on the tightened transcript, surface `short`. Its top pick
   becomes the proposed title and its other options go in the plan, so the user chooses at the same
   stop as everything else.

Time it and place it by section 2's "The opening title".

**The beats.** Script cues first, then your own. Each sentence opens on the face and cuts away to
its end, except the sentences that stay on the face: the hook under the title, listicle headlines,
the turn and the call to action. Mark each beat `stock`, `graphic` or `generate`. Where only the
brand's real product or screen would do, keep the face and say so.

**The zoom cuts.** On a single-angle take at least 1080 wide, mark the zoom-ins and zoom-outs on
listicle headlines, leaned-on keywords and jump cuts that land on the face. Extract one frame from
inside each zoomed stretch into the scratchpad and look where the face is, to set the zoom's centre.

Correct the transcript for captions now (`broll-rules.md` section 4), so the corrections appear in
the plan. A graphic card uses the corrected words too.

## 5. Find the stock

For every `stock` beat, search and filter by `broll-rules.md` section 3. **Which library:** with
only one live, use it. With both live, search Pexels first, and search Pixabay for a beat only when
fewer than three Pexels results pass. Fetch each candidate's thumbnail into `<id>-edit/options/` and
look at it (section 5 of the same file). Keep the best two or three per beat, whichever library they
came from. A beat where nothing passes goes down the fallback list in `broll-rules.md` section 2
("When nothing fits a beat"), and the plan says so. Never a meme GIF or a borrowed clip.

**Source cards need their source.** For each source card, open the article or study if you can and
copy its headline or title, publication or authors, and date exactly. If you cannot open it, or the
speaker names no source, the plan asks the user for the link, or for the headline, publication and
date pasted in. Nothing on a source card is written from memory.

**Without a stock library**, give each stock beat its search query and a link the user can open:
`https://pixabay.com/videos/search/<query>/?orientation=vertical`, with spaces in the query as
`%20`. If they ask for Pexels instead, the link is
`https://www.pexels.com/search/videos/<query>/?orientation=portrait`.

If they later drop downloaded clips in, treat each one as a stock pick:

1. Copy it to `<id>-broll<N>-v01.mp4` (the next free `vNN` if one exists) for the beat they name.
2. `ffprobe` it against the resolution and length bar in `broll-rules.md` section 3, and extract
   one frame from inside the length the beat will use, into the scratchpad. Look at it for the
   rejects in the same section. A clip that fails is reported with the reason; it is not used
   without the user saying so.
3. Ask who made it and the page they took it from, because the credit is needed for the record.
   Log it as step 7 does, with `source` set to the library they name (`pixabay`, `pexels`), or to
   `user` when it is their own footage, which needs no credit.

## 6. The approval stop

This is the one place the skill waits. Write `content/<id>-broll-plan.md`, log it
(`"role"` omitted, `"file":"content/<id>-broll-plan.md"`), and rebuild the campaign page so the
thumbnails can be seen. A re-edit adds a new round below the last rather than replacing the doc.

The doc, in this order:

1. **The cut.** Original length, tightened length, and what came out, in plain words with
   timestamps: "9 pauses shortened", "'um' at 0:04", "the first try at 'the thing most people
   miss…' (0:12 to 0:18)". Doubtful repeats that were kept, each with a timestamp. The silence
   threshold used.
2. **Caption corrections.** Every word changed from what the transcript heard, before and after.
3. **The title.** The line, where it came from (the hooks doc, the script, or `write-hook` just now,
   with its other options listed), how long it stays up (0:00 to 0:04), and the box colour.
4. **The cutaways.** One block per beat: number, time on the finished short, the words under it,
   the idea, then what goes there. For stock, the options, each with its thumbnail
   (`![beat 2, option a](../media/<id>/<id>-edit/options/beat2-a.jpg)`), its length, its creator,
   and its page on the library it came from (Pixabay or Pexels), the recommended option first. For a
   graphic card, its kind and everything on it ("figure: 300 / customers"; "bar chart: before 12%,
   after 31%"), with where each number came from (the words at 0:21, or the source). A source card
   gives the link and the headline as published, and flags any gap between what the speaker says and
   what the source says. A `generate` beat says
   what it would show and that it would cost money to make, with no figure, because
   `generate-video` quotes the price.
5. **Zoom cuts.** Each one with its in and out times and the words it marks ("0:12 to 0:14,
   'Number four: not tidying up'"), or why there are none (more than one camera angle, a soft take).
6. **What the face keeps.** The hook, the listicle headlines, the turn and the call to action, with
   their times, so the user can see the cutaways stay off them.
7. **Notes.** Anything the user should know: a sideways take, a stand-in font, a title line too long
   for three lines, a step that could not be checked because there was no campaign message.

Then present it per `plain-language.md` section 4. **The sentence:** how long the short will be, how
much was cut, how many cutaways and where to look:

> I have cut your 58-second take to 41 seconds: nine long pauses, two ums and one restart came out.
> It opens on "Why your shop feels busy but sells less", then eight cutaways (six stock clips, two
> graphics) and three zoom cuts, nothing to pay for. Open the campaign page to see them, then tell
> me what to swap.

**The receipt:** the page path in full, the title line, and the beats as a short numbered list
(time, words, the recommended pick or the card's words in a few words) so they can answer without
opening anything. Then stop and wait.

**Answers.** "Beat 3, option B." "Drop beat 5." "Use option 2 for the title." "No zoom on the
second one." "Keep the 'no, no, no'." "Leave the ums in." Apply
each one to the plan doc, re-show only what changed, and wait again. **An adjustment is not
approval, and silence is not approval.** Proceed on an explicit go: "go", "looks good", "make it".

**Generated beats.** If any beat is `generate` and the user wants it made, route it through
`write-generation-prompt`'s video track and then `generate-video`, which shows its own cost and
asks its own question. Ask it to save the clip as `<id>-broll<N>-v01.mp4` with role `broll`. If they
decline the cost, that beat falls back to its best stock option or to the face; ask which.

## 7. Fetch the picks

Graphic cards and zoom cuts need nothing fetched; they are built in step 8. For each approved stock
pick, get its full rendition list from the library it came from
(`pexels_get_video` or `pixabay_get_video`), choose the smallest rendition that clears the
resolution bar (`broll-rules.md` section 3), and download it:

```bash
curl -L -o "campaigns/<slug>/media/<id>/<id>-broll<N>-v01.mp4" "<the rendition link>"
```

`<N>` is the beat number. A swapped pick on a re-edit is the next `vNN` of the same beat. Never
overwrite. `ffprobe` each download: a video stream, at least the length the beat needs, and the
width and height you chose. Log each one:

```json
{"ts":"…","event":"generate","skill":"edit-talking-head","deliverable":"<id>","role":"broll","file":"media/<id>/<id>-broll2-v01.mp4","source":"pexels","source_url":"https://www.pexels.com/video/<pexels id>/","credit":"<creator name> on Pexels","cost_usd":0,"status":"iteration","notes":"beat 2, over \"<the words>\""}
{"ts":"…","event":"generate","skill":"edit-talking-head","deliverable":"<id>","role":"broll","file":"media/<id>/<id>-broll3-v01.mp4","source":"pixabay","source_url":"<the result's pageURL>","credit":"<user> on Pixabay","cost_usd":0,"status":"iteration","notes":"beat 3, over \"<the words>\""}
```

`source_url` is the clip's page on the library, never the download link, which expires. `credit` is
not optional for stock. A clip whose creator you cannot name is not used.

## 8. Build the edit

`vNN` is one more than the highest edit file in the folder, and every file below carries it.

1. Write `compositions/<id>-captions-vNN.html` from the installed component, with the changes in
   `hyperframes.md` section 5: vertical size, the lowered position, one fixed size, the brand's
   typeface and accent from `design.md`, and the corrected, re-timed words in groups of up to 14
   characters.
2. Write `compositions/<id>-graphic<N>-vNN.html` for each graphic beat from its template in
   `graphic-cards.md`, in the brand's colours and type.
3. Write `<id>-edit-vNN.html` (`hyperframes.md` section 6): the kept parts end to end, each stock or
   generated cutaway at its beat starting half a second into its clip, each graphic card mounted at
   its beat, the captions, the opening title on top (section 6.1), and the zoom cuts in the timeline
   (section 6.3).

If `design.md` is missing, use white captions with a neutral dark highlight, a near-black title box
and near-black cards, and say they are not in the brand's colours yet.

## 9. Render and check

Say roughly how long it will take before starting (`hyperframes.md` section 7), then render to
`media/<id>/<id>-vNN.mp4`, where `vNN` matches the edit file.

**Without HyperFrames or Node**, do not render. Hand back the cut list (kept parts as take
timestamps), the title line with its timing, the cutaway picks with their positions, each graphic
card's words with its position, the zoom cuts as in and out times, and the downloaded files, so the
short can be assembled in CapCut or any editor. Write nothing that pretends to be the short.

**Check the file before you call it done**, the way `generate-video` step 8 does:

- `ffprobe`: a video stream at 1080×1920, an audio stream, and a duration within a tenth of a second
  of the tightened length.
- Extract frames into the scratchpad, not into `media/`: the very first frame, one in the middle of
  each of two or three cutaways (a graphic card among them, if there is one), one inside a zoom cut,
  and one in the call to action. On the first frame, draw the 4:5 crop as a box
  (`drawbox=x=0:y=285:w=1080:h=1350:color=red@0.9:t=6`) before you look.
- Look at each. The title is there in the first frame, whole and inside the 4:5 box. The face is
  where it should be and fills the frame inside a zoom cut. The cutaways and cards fill the frame,
  and nothing on a card is cut off or overlapping. Look at every chart, diagram, source and reaction
  card, not just a sample: chart bars are in proportion to their values, and a reaction emoji is
  Noto's glossy, rounded design (a flat, outlined face means the font failed to load).
  The captions are legible, spelled right, the same size throughout and on one line; a caption that
  wrapped onto two lines means its group was too long for this typeface, so regroup it shorter and
  render again.
- If something is wrong, say what in the first sentence and offer the fix. A short that fails the
  check is not finished.

If the check itself cannot run, say exactly that: "I could not open the file to check it, so watch
it once before you post it."

## 10. Log and report

Log the short:

```json
{"ts":"…","event":"generate","skill":"edit-talking-head","deliverable":"<id>","file":"media/<id>/<id>-v01.mp4","status":"iteration","notes":"edit media/<id>/<id>-edit/<id>-edit-v01.html; take aroll-v01; 41.2s from 58.0s; title \"Why your shop feels busy but sells less\"; 8 cutaways (6 stock, 2 graphic); 3 zoom cuts"}
```

Then rebuild the campaign page once, for everything this run logged (`campaign-structure.md` 4.1).

Report per `plain-language.md` section 5: what it is ("your 41-second short about morning
dashboards"), the one path to open (the MP4, in full), what you checked, and what you did not do or
could not check. Offer, once, a credits line they can paste into the post description:
"B-roll: Jane Doe on Pexels, Sam Lee on Pixabay."

End on one next action. Usually: watch it and tell me what to change. When they say it is ready to
post, log a `status` event with `"status":"final"` for that MP4.

**Re-edits.** Any change makes new files: a new round in the plan doc, swapped cutaways as new
versions, a new edit file, a new render, each one version up. Nothing is rewritten, so every
earlier cut stays watchable.

## House rules

- **Edit, never write.** The speaker's words are the content. Cut them only by the rules in
  `broll-rules.md`, and never reorder sentences to "improve" the argument. The title is the picked
  line word for word, and a graphic card shows only words and figures the speaker said.
- **The hook survives the crop.** The opening title is in the first frame and inside the 4:5 crop,
  every time. The captions may sit lower; the title may not.
- **One stop, and it is real.** Nothing is fetched or rendered before the user approves the cut and
  the cutaways together. An adjustment is not a yes.
- **Never touch fal.** A generated cutaway is `generate-video`'s job and its money question.
- **Never fabricate.** No invented clip, creator, link, duration or check, and no chart value,
  headline, quote or source that was not said or published. A stock clip with no creator is not
  used. If a render or a check did not happen, say so.
- **Nothing borrowed.** No meme GIFs and no film, TV, sport or social clips. A source card is a
  plain mock of the page, never the publication's logo, design or a screenshot.
- **The take is never altered.** Tightening is a list of times. The take is never re-encoded,
  trimmed in place or overwritten.
- **Faces on paid shorts.** No recognisable person in stock cutaways on paid media. On organic, never
  under a claim or a product line.
- **Pinned tools.** `hyperframes@0.9.6`, local engines only, none of HeyGen's paid services.
- **Speak plainly.** Pauses, ums, the title, cutaways, graphics, zoom cuts, captions, the short. Not
  keep-ranges, compositions, sub-compositions, tracks, transforms or renditions.
- UK English, no em dashes in anything you author.
