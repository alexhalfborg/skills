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

Search Pexels with `pexels_search_videos`, query from the beat, `orientation: portrait`, up to 15
results. If fewer than three pass the rules below, search again with `orientation: landscape` and
`size: large` (4K). Then apply these rules to every result:

**Resolution.** A portrait clip needs a rendition at least 1080 wide. A landscape clip needs one at
least 3840 wide: cropping a 1920×1080 clip to vertical leaves about 608 pixels of width, which
looks soft once it is enlarged to fill a phone. Download the **smallest rendition that clears the
bar**, not the largest; 4K portrait files are big and gain nothing at 1080×1920. List results carry
only the top few renditions; `pexels_get_video` returns all of them.

**Length.** The clip must run at least the beat's length plus 0.5 seconds, so the cutaway can skip
the first half-second (where stock often fades in). Pexels search cannot filter by length, so check
`duration` on every result yourself.

**What is in it.** Download the clip's thumbnail (`image`) into `<id>-edit/options/` and look at it
(section 5). Reject anything with:

- on-screen text, a logo, a watermark, or a competitor's brand mark
- anything the brand has said never to show or say (`pack.nogos`)
- a look that fights the campaign's main picture, when there is one
- **a recognisable face, on a paid short.** The Pexels licence forbids implying that a person
  endorses anything, and model releases for its footage are not guaranteed. On paid media that risk
  is not worth taking. On organic shorts a face is allowed, but never under a claim, a product line
  or a testimonial, where it would read as that person vouching for it.

A short is **paid** when its deliverable list entry has a `funnel_stage`, or its `channel` or
`format` names an ad. When the entry does not settle it, ask once.

**Keep the best two or three per beat**, ranked, each with its Pexels page, creator name, length,
the rendition you would download, and the thumbnail you looked at.

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

The campaign page is offline by design, so it cannot load thumbnails from Pexels. Download each
option's thumbnail into `media/<id>/<id>-edit/options/` as `beat<N>-<letter>.jpg` (`beat2-a.jpg`,
`beat2-b.jpg`), then open each one and look at it before it reaches the plan. The plan doc links them
as `../media/<id>/<id>-edit/options/beat2-a.jpg`: that relative path resolves both from `content/`
and from `site/`, since both sit beside `media/`.

These thumbnails are working files for the decision, not deliverables, so they are not logged.

## 6. The Pexels licence, in brief

- Free to use, including commercially and in ads, and free to modify. Attribution is not required.
- Not allowed: implying that a person or brand in the footage endorses anything; showing an
  identifiable person in a bad or offensive light; selling unaltered copies; redistributing the
  footage on a stock site; using it as part of a trademark or logo.
- Pexels' API terms ask for the creator to be credited where possible. The skill logs the creator
  with every clip and offers a credits line for the post description; nothing goes on screen.
- Full terms: <https://www.pexels.com/license/>. The API allows 200 requests an hour and 20,000 a
  month. One short uses a few dozen.
