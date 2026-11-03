# Cutting a talking head: the rules

The editorial method behind `edit-talking-head`, in the order the skill applies it: tighten the take,
place the cutaways, choose the stock, then fix and re-time the captions. Every number here is a
default the user can override for one run in plain words ("keep it looser", "more b-roll", "leave
the ums in"). Record any override in the plan doc, so the next re-edit starts from what was agreed
rather than from these defaults.

## 1. Tightening the take

Inputs: the transcript's words (which words, in order) and ffmpeg's silences (where the pauses are).
Never infer a pause from a gap between words; the transcript stretches words across pauses
(`hyperframes.md` section 3).

**Pauses.** Every silence of 0.35 seconds or more is cut down so about 0.1 seconds of air remains:
keep 0.05 seconds after the speech stops and 0.07 seconds before it starts again. The slightly
longer lead-in protects the first consonant of the next word. A pause under 0.35 seconds is rhythm,
not dead air, so it stays.

**The ends.** Cut the silence before the first word down to 0.05 seconds. Keep 0.3 seconds after
the last word, so the short does not end mid-breath.

**Fillers.** Remove standalone "um", "uh", "er", "erm" and "ah". A filler is cut together with the
pauses on either side of it: the cut runs from the silence before the filler to the silence after
it, so no stub of a breath or half a vowel is left behind. Keep "like", "you know", "so", "basically"
and "I mean": cutting those changes the meaning or the speaker's rhythm, and a viewer hears the
splice.

**False starts and retakes.** When the speaker starts a sentence, stops, and says it again, keep
the **last complete take** and cut everything back to where the first attempt began. Signals: the
same opening words repeated; a sentence abandoned mid-clause; "sorry", "let me say that again",
"from the top". When you cannot tell whether a repeat is a retake or deliberate emphasis ("no, no,
no"), keep it and flag it in the plan. Never cut a doubtful take silently.

**Never cut inside a word.** Every cut point lands in a silence. If two words run together with no
silence between them, they are not a cut point.

**The output** is a list of kept parts, each a start and end in the take, in order. Summed, they
give the tightened length. If tightening removed more than half the take, say so in the plan: it
usually means a retake was misread, or the threshold needs adjusting (`hyperframes.md` section 4).

**Looser and tighter.** "Keep it looser": cut only silences of 0.6 seconds or more, leave 0.15
seconds either side, and keep fillers. "Tighter": cut from 0.25 seconds and leave 0.08 seconds.

## 2. Placing the cutaways

All times here are on the **tightened** timeline, after section 1.

**Script cues come first.** If the short was scripted and the script has a bracketed cue
(`[B-ROLL: dashboard close-up]`, `[CUT TO: …]`, a slide cue), find the words it sits beside in the
transcript and place a cutaway there, with the cue as its idea. Add your own cutaways only where the
script has none. A cue the person wrote on purpose outranks one you infer.

**The face stays on screen for:**

- **the hook.** The first sentence or the first 2 seconds, whichever is longer. A viewer decides in
  that window whether a person is talking to them; a stock clip there loses them.
- **any punchline or turn.** The line the whole short builds to ("It is not.").
- **the call to action.** "Follow for more", "link in bio", the last sentence.
- **anything that points at the speaker**: "look at me", "I", "honestly", a facial reaction the
  words depend on.

**Cut away on the concrete:** a noun someone can picture ("the dashboard", "a shop floor"), a number
("three hundred customers"), a claim, an example, a place, a before-and-after. Abstract stretches
("the thing about strategy is…") stay on the face, because stock for an abstraction is wallpaper.

**Pacing.**

- One cutaway roughly every 3 to 6 seconds of runtime.
- Each one 1.5 to 3 seconds long.
- At least 1 second of face between two cutaways.
- Cutaways cover no more than about 40% of the runtime in total. A talking head is a person talking;
  past this point it becomes a slideshow with a voiceover.

**Cover the jump cuts.** Every kept-part boundary from section 1 is a visible jump in the face. When
a cutaway can sit across one, starting at least 0.3 seconds before it and ending at least 0.3
seconds after, prefer that placement over an equally good one that covers nothing. That is the
oldest reason b-roll exists.

**Snap to words.** A cutaway starts at the start of a word and ends at the end of a word.

**Each beat records:** its start and end on the tightened timeline, the words spoken under it, the
idea in a few plain words, the source (`stock` or `generate`), and the search query.

### Stock or generated

`stock` is the default. Choose `generate` only when stock cannot show the idea and a generated clip
honestly can (a stylised metaphor, an impossible camera move, a scene matching the campaign's main
picture). A generated cutaway goes through `generate-video` and is paid for, so it is offered, never
assumed.

**Neither can show the brand's own product, screen or premises.** A stock dashboard is not their
dashboard, and a generated product is a stand-in that looks like the product without being it. When
a beat needs the real thing, keep the face and say in the plan that the user's own footage of it
would go there. (Their own footage library is planned, not built yet.)

## 3. Choosing the stock

The query comes from the beat. How to search depends on the library (SKILL.md step 5 says which
to use):

**Pexels.** `pexels_search_videos` with `orientation: portrait`, up to 15 results. If fewer than
three pass the rules below, search again with `orientation: landscape` and `size: large` (4K).
List results carry only the top few renditions; `pexels_get_video` returns all of them.

**Pixabay.** `pixabay_search_videos` with `video_type: film`, `safesearch: true`, `per_page: 20` and
`min_height: 1920`. Pixabay's video search has no orientation filter, but that height floor lets
through exactly the clips that can clear the resolution bar below: an upright clip at 1080×1920, or a
4K landscape one at 2160 high. Tell portrait from landscape by the result's width and height. Search
results show only the medium rendition, so call `pixabay_get_video` on each candidate that passes
the length check to see all four renditions (`tiny`, `small`, `medium`, `large`; `large` is empty
when there is no 4K) and their thumbnails.

Then apply these rules to every result, from either library:

**Resolution.** A portrait clip needs a rendition at least 1080 wide. A landscape clip needs one at
least 3840 wide: cropping a 1920×1080 clip to vertical leaves about 608 pixels of width, which
looks soft once it is enlarged to fill a phone. Download the **smallest rendition that clears the
bar**, not the largest; 4K portrait files are big and gain nothing at 1080×1920.

**Length.** The clip must run at least the beat's length plus 0.5 seconds, so the cutaway can skip
the first half-second (where stock often fades in). Neither library's search can filter by length,
so check `duration` on every result yourself.

**What is in it.** Download the clip's thumbnail into `<id>-edit/options/` and look at it
(section 5). On Pexels it is the result's `image`; on Pixabay, the `thumbnail` of the rendition you
would download. If a Pixabay rendition has no thumbnail, take one frame from about a second into its
`tiny` rendition with ffmpeg instead. Reject anything with:

- on-screen text, a logo, a watermark, or a competitor's brand mark
- anything the brand has said never to show or say (`pack.nogos`)
- a look that fights the campaign's main picture, when there is one
- **a recognisable face, on a paid short.** Neither library guarantees a model release, and both
  licences forbid misleading use: Pexels names implied endorsement outright, and Pixabay leaves any
  third party's consent to you. On paid media that risk is not worth taking. On organic shorts a face is allowed, but never under a claim, a product line
  or a testimonial, where it would read as that person vouching for it.

A short is **paid** when its deliverable list entry has a `funnel_stage`, or its `channel` or
`format` names an ad. When the entry does not settle it, ask once.

**Keep the best two or three per beat**, ranked, each with its library, its page there, creator
name, length, the rendition you would download, and the thumbnail you looked at.

## 4. Captions: correct, then re-time

**Correct before captioning.** Speech engines mangle names. Before any word reaches a caption,
fix the transcript against, in this order:

1. the script, if the short has one: its spelling of every name, product and term wins;
2. the pack: `brand.name`, every `products[].name`, and any spelling in `pack.voice.spelling`;
3. the brand's spelling convention (British or American) for ordinary words.

Fix the text and keep the timings. When one spoken name came out as two words ("half board" for
"Halfborg"), merge them into one word spanning both timings. List every correction in the plan, so
a wrong fix is caught at the approval stop rather than after the render.

**Drop what was cut.** Words inside a removed range (fillers, abandoned takes) leave the captions.

**Re-time onto the tightened timeline.** For a word inside kept part *k*:

```
new start = word start - part k's start in the take + part k's start on the timeline
new end   = min(word end, part k's end in the take) - part k's start in the take + part k's start on the timeline
```

The `min` matters: it stops a word the transcript stretched across a pause from overhanging the cut.

**Group** the words 2 to 3 at a time, never across a sentence end, and give a long word (ten letters
or more) a group of its own when it would otherwise wrap.

## 5. Looking at the options

The campaign page is offline by design, so it cannot load thumbnails from a stock library (and
Pixabay's terms forbid linking to them permanently anyway). Download each
option's thumbnail into `media/<id>/<id>-edit/options/` as `beat<N>-<letter>.jpg` (`beat2-a.jpg`,
`beat2-b.jpg`), then open each one and look at it before it reaches the plan. The plan doc links them
as `../media/<id>/<id>-edit/options/beat2-a.jpg`: that relative path resolves both from `content/`
and from `site/`, since both sit beside `media/`.

These thumbnails are working files for the decision, not deliverables, so they are not logged.

## 6. The stock licences, in brief

Both libraries are free for commercial use, ads included, and free to modify. Neither requires
attribution. The skill logs the creator with every clip anyway and offers a credits line for the
post description; nothing goes on screen.

**Pixabay** (the Pixabay Content License):

- Not allowed: selling or distributing a clip on its own, unchanged; using a clip that shows a
  recognisable trademark, logo or brand commercially (already a reject in section 3); using footage
  in a misleading or deceptive way, or an immoral or illegal one, especially footage of
  recognisable people; using it as part of a trademark or business name.
- Some clips may carry other people's rights, and checking for that is the user's job, which is
  one more reason for the paid-short face rule.
- API terms: show where results come from (the plan doc names the library and the creator), cache
  searches for 24 hours, no automated bulk downloading, no permanent hotlinking. The skill searches
  once per beat and downloads only the approved picks, so it meets all four.
- Full terms: <https://pixabay.com/service/license-summary/>. The API allows 100 requests a minute.

**Pexels** (the Pexels licence):

- Not allowed: implying that a person or brand in the footage endorses anything; showing an
  identifiable person in a bad or offensive light; selling unaltered copies; redistributing the
  footage on a stock site; using it as part of a trademark or logo.
- Pexels' API terms ask for the creator to be credited where possible.
- Full terms: <https://www.pexels.com/license/>. The API allows 200 requests an hour and 20,000 a
  month. Pexels stopped issuing new API keys in late 2026; existing keys still work.

One short uses a few dozen requests on either.
