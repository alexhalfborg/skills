# Cutting a talking head: the rules

The editorial method behind `edit-talking-head`, in the order the skill applies it: tighten the take,
shape the short (the opening title, the cutaways, the graphic cards and the zoom cuts), choose the
stock, then fix and re-time the captions. Every number here is a default the user can override for
one run in plain words ("keep it looser", "more face", "no zoom cuts", "keep the title up longer",
"leave the ums in"). Record any override in the plan doc, so the next re-edit starts from what was
agreed rather than from these defaults.

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

## 2. Shaping the short

All times here are on the **tightened** timeline, after section 1.

**Script cues come first.** If the short was scripted and the script has a bracketed cue
(`[B-ROLL: dashboard close-up]`, `[CUT TO: …]`, a slide cue), find the words it sits beside in the
transcript and place a cutaway there, with the cue as its idea. Add your own cutaways only where the
script has none. A cue the person wrote on purpose outranks one you infer.

### The opening title

The short opens on its hook, set as a title over the speaker, from the very first frame. That frame
is what someone scrolling sees before they decide whether to stop.

- **The line** is the short's picked first-frame line (SKILL.md step 4 says where it comes from),
  used exactly as picked. This skill never rewords it. A line over about 40 characters will not fit
  in three lines: say so in the plan and ask for a shorter one rather than trimming it yourself.
- **The box.** The words sit in one solid box in the brand's accent colour, in the brand's
  typeface. Without `design.md`, a near-black box with white words, and the plan says so.
- **How long.** From 0 to the end of a word between 3 and 5 seconds. Prefer the end of the first
  spoken sentence when it falls in that window; otherwise the word end nearest 4 seconds.
- **Where.** Low in the middle of the frame, inside the part a 4:5 crop keeps and clear of the
  right-hand button rail (the numbers are in `hyperframes.md` section 6.1). Feeds and profile grids
  show a vertical short cropped to 4:5, which loses about 285 pixels off the top and the bottom. The
  title is the one thing that must survive every crop; the captions may sit lower.
- **Under the title,** the face at normal scale. No cutaway, card or zoom cut starts until it has
  gone. Captions run beneath it as usual.

### Sentence by sentence

As a general shape, **every sentence opens on the face and cuts away until it ends.**

- The face carries the opening of each sentence: at least its first two words and at least 1
  second, ending at the end of a word.
- From there to the sentence's last word, one or more cutaways run back to back: stock clips,
  graphic cards, or a mix. Each lasts 1.5 to 3 seconds (charts, diagrams and source cards a little
  longer, below) and changes on a word boundary. The last one
  ends with the sentence's last word, so the next sentence starts on the face again.
- If less than 1.5 seconds of the sentence is left after the opening, it all stays on the face.
- Back-to-back cutaways never show the same idea twice, and no more than two graphic cards run in a
  row.

**Whole sentences stay on the face** when they are:

- **the hook,** the first spoken sentence, which sits under the title;
- **a listicle headline** ("Number four: not tidying up"), which gets a zoom cut instead (below);
- **the punchline or turn** the short builds to ("It is not.");
- **the call to action:** "follow for more", "link in bio", the last sentence;
- **about the speaker:** "look at me", "honestly", a facial reaction the words depend on.

**What fills the cutaways.** Stock on the concrete: a noun someone can picture ("the dashboard", "a
shop floor"), a place, an example, a before-and-after. A graphic card on a figure, a named term, or
an abstract stretch ("the thing about strategy is…"), where stock would only be wallpaper. When
neither fits, the sentence stays on the face.

**Cover the jump cuts.** Every kept-part boundary from section 1 is a visible jump in the face. The
sentence shape hides most of them, because a cut from a cutaway back to the face never shows a jump.
When one lands inside a stretch of face, prefer a placement that covers it: a cutaway that starts at
least 0.3 seconds before it and ends at least 0.3 seconds after, or a zoom cut that changes scale at
exactly that point.

**Snap to words.** A cutaway starts at the start of a word and ends at the end of a word.

**Each beat records:** its start and end on the tightened timeline, the words spoken under it, the
idea in a few plain words, the source (`stock`, `graphic` or `generate`), and either the search
query (stock) or the card's kind and everything on it (graphic), with where each number or headline
came from.

### Graphic cards

A graphic card is a full-frame animated card that HyperFrames draws in the brand's own type and
colours (the templates are in `graphic-cards.md`). It costs nothing and needs no stock library.

**The rule for every card:** it shows what the speaker said, or what the source they cite says, and
nothing else. Its words are the speaker's own, spelled with the caption corrections in section 4.
Never put a figure on a card that was not said or sourced, never round one, and never add a word of
your own. A card is a caption made bigger, not new copy.

| Kind | Use it for | Length |
|---|---|---|
| **Figure** | One number the speaker says, with up to three words of label from the same sentence ("300" over "customers"). | 1.5 to 3 s |
| **Phrase** | Up to six words from the sentence, verbatim: a named term, or a point stock cannot show. | 1.5 to 3 s |
| **Reaction** | One emoji, with a word or two the speaker says if they fit ("Seriously?"): exasperation, surprise, irony. The moment a meme GIF would tempt. | 1.5 to 2 s |
| **Bar chart** | Two to four numbers the speaker compares, or that the cited source gives. | 2.5 to 4 s |
| **Step diagram** | Two to four steps or a cause and its effect, top to bottom, three words a box at most. | 2.5 to 4 s |
| **Source card** | A real article or study the speaker refers to: a mock newspaper page for news, a mock web page for an online article or a study. | 2.5 to 4 s |

The last three need reading time, so they run longer than the 1.5 to 3 seconds of other cutaways.
If the sentence leaves too little room, use a figure or phrase card instead, or stay on the face.

**Charts must be honest.** Bars start at zero and their heights are in true proportion. Every value
carries its unit. Numbers from a source carry a source line. A trend needs a real value for every
point on it: a speaker saying "it keeps growing" gets a phrase card, never a chart drawn through
numbers nobody gave.

**Reaction emoji come from Noto Color Emoji,** which is openly licensed. Apple's and Microsoft's
emoji designs belong to them, and a render can fall back to the machine's own set without saying so
(`graphic-cards.md` section 4 says how to spot it).

**Source cards point at a real source, and imitate nothing.**

- **The source must be identified.** Use the link in the script or the plan's notes, or ask for one.
  "A study found…" with no study named gets a phrase or figure card, never a source card.
- **Copy, never compose.** The headline or title is exactly as published, with the publication or
  the authors, and the date or year. Take them from the page itself if you can open it; otherwise
  ask the user to paste them. A highlighted line is only ever a verbatim quote from the piece, under
  25 words, and it should be the line the speaker is talking about.
- **A mock, not a replica.** The publication's name appears in plain type. Never use its logo,
  masthead, typeface, page design or photos, and never a screenshot of the page: those belong to the
  publisher, and a convincing copy would pass as the real page. Body text is shown as grey bars,
  never as invented sentences. A web page shows the source's real domain in its address bar.
- **When the speaker and the source disagree** (a rounded figure, a stronger claim than the study
  makes), keep the card to what the source says, and flag the mismatch in the plan for the user.
  Never quietly change either.
- **On a paid short,** a source card puts a third party's name in an ad. Mark it
  `⚠️ CLAIM CHECK:` in the plan, so `run-qa` looks at it.

### Zoom cuts

When the whole short is one camera angle (one take, one framing: the usual phone recording), punch
in on the face to mark a moment, then cut back out to carry on.

- **Where:**
  - **a listicle headline:** in on its first word ("Number four…"), back out on the first word of
    the explanation that follows;
  - **a keyword the speaker leans on:** the turn, a named term, a figure not already on a card. In
    on that word, out at the end of its phrase;
  - **a jump cut that lands on the face:** change scale at exactly that point, in or out, so the jump
    reads as a deliberate cut.
- **How:** 1.2 times, centred on the face, as a hard cut both ways, never an animated push. Look at a
  frame from inside the zoomed stretch to place the centre between the eyes; the default is 50%
  across and 30% down.
- **How often:** at most one zoom-in per sentence, none under the title, and at least 0.8 seconds
  at either scale.
- **Not on a soft take.** Skip zoom cuts when the take is narrower than 1080 pixels; enlarging it
  further shows.
- Zoom cuts scale the face only. Cutaways and cards are never scaled.

### Stock, graphic or generated

`stock` is the default for anything a camera could film. `graphic` is for figures, comparisons,
processes, cited sources, reactions, terms and abstract points. Choose `generate` only when neither
can show the idea and a generated clip honestly can (a stylised metaphor, an impossible camera move,
a scene matching the campaign's main picture). A generated cutaway goes through `generate-video` and
is paid for, so it is offered, never assumed.

**Never meme GIFs or borrowed clips.** No GIFs from GIPHY, Tenor or anywhere else, and no clips of
films, TV, sport, music videos or other people's posts, even when nothing else fits. Most memes are
frames of copyrighted footage that the GIF sites cannot license, and some show real people who never
agreed to appear in a brand's post (section 6 has the detail). A generated clip made to look like a
famous meme carries the same problem.

**When nothing fits a beat,** work down this list:

1. a second stock search with a different idea for the same words;
2. the speaker's own footage, if they have supplied some (SKILL.md step 5). Short reaction takes
   (an eye-roll, a shrug, a slow blink) give the meme effect with nothing to clear, so when a short
   is full of reaction moments, suggest in the plan's notes that they record a few next time;
3. a graphic card: a reaction for a reaction, a phrase for a point;
4. the face;
5. a generated original, offered with its cost.

If the user wants a GIF sticker from Instagram's or TikTok's own library, it has to be added in the
app when posting: stickers used there come under the app's own arrangements. The plan can note the
moment, but the engine cannot add one, and `publish-social` posts the file as rendered.

**None of them can show the brand's own product, screen or premises.** A stock dashboard is not their
dashboard, and a generated product is a stand-in that looks like the product without being it. When
a beat needs the real thing, keep the face and say in the plan that the user's own footage of it
would go there. (Their own footage library is planned, not built yet.)

## 3. Choosing the stock

For `stock` beats only. The query comes from the beat. How to search depends on the library (SKILL.md step 5 says which
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

**Group** the words one to three at a time, never across a sentence end, and keep each group to 14
characters or fewer, spaces included. Every caption is the same size (`hyperframes.md` section 5),
so a group too long for one line wraps onto a second line rather than shrinking, and the limit is
what keeps it on one. A single word longer than 14 characters gets a group of its own; up to about
16 still fits. The limit is measured for Montserrat. A wider brand typeface may fit fewer, which the
check after the render catches (SKILL.md step 9).

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

**Meme GIFs and borrowed clips** (why section 2 rules them out):

- **The footage is someone else's.** Most memes are frames from films, TV, sport or music videos,
  owned by the studio or broadcaster. Uploading one to a GIF site moves no rights, so the site has
  none to give a brand.
- **The GIF sites say so.** Tenor's terms: "You must not use Tenor for any commercial purpose or for
  the benefit of any third party" (<https://tenor.com/legal-terms>, last updated 3 March 2021,
  checked 4 November 2026). GIPHY's terms could not be read automatically on that date; either way,
  a GIF site hosts GIFs, it does not clear them.
- **The people in them have rights too.** A recognisable person in a brand's post can read as an
  endorsement, the same problem as a stock face on a paid short (section 3).
- **"Fair use" is a poor defence here.** Courts weigh it case by case, commercial brand use counts
  against it, and many countries' exceptions are narrower than the US's.
- **The practical cost is a takedown.** Instagram's and TikTok's rights-matching can mute or block a
  post, or put a strike on the account, after it has gone out.
