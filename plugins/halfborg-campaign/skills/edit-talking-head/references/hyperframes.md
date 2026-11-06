# HyperFrames: the parts `edit-talking-head` uses

HyperFrames (HeyGen, Apache-2.0) renders an HTML file to MP4 on the user's own machine, free, with no
account. This file holds every command, attribute and number the skill relies on. All of it was
checked against version **0.9.6** by running it, not by reading docs. If a run disagrees with this
file, believe the run, finish the job by the working route, and tell the user the notes need
updating.

## 1. The pin

Every call is `npx -y hyperframes@0.9.6 …`. Never `npx hyperframes` unpinned and never `@latest`:
the tool is pre-1.0, and an unpinned upgrade can change how an edit file renders without anything
looking different. Moving to a newer version is a change to this file, made on purpose.

What it needs on the machine: Node 22 or newer, ffmpeg, and Chrome (it uses the installed one, or
fetches its own). `npx -y hyperframes@0.9.6 doctor` reports all of them in one go, plus whether a
speech engine is present. Read its ticks and crosses rather than probing each tool yourself.

**Network.** A render loads GSAP from jsDelivr and the caption typeface from Google Fonts, so it
needs an internet connection. That is the render's own business; the campaign page stays offline.

**HeyGen's paid services stay off.** Several commands can call HeyGen's cloud and bill the user's
account: `transcribe --engine heygen`, `audio --quality best`, `cloud`, `publish`, `reverse`,
`tts` with a HeyGen voice. This skill never runs any of them. Everything below is local.

## 2. Scaffold the project folder (once per short)

From `media/<id>/`:

```bash
npx -y hyperframes@0.9.6 init <id>-edit --example blank --resolution portrait --skip-transcribe --skip-skills --non-interactive
```

- `--skip-skills` matters: without it, init installs HeyGen's own skills into the user's AI tools.
- `--resolution portrait` sets 1080×1920.

Init also writes `CLAUDE.md` and `AGENTS.md` into the new folder. **Delete both straight away.**
They are HeyGen's authoring instructions, and a `CLAUDE.md` inside the campaign folder would load
into the user's own sessions and send them to `/hyperframes` skills they never installed. Deleting
two files the tool scaffolded a second ago is not the media rule's concern; nothing the user made is
touched.

Init writes a placeholder `index.html`. Leave it; the skill never renders it, because every render
names its edit file with `-c`.

Then add the caption component, once:

```bash
npx -y hyperframes@0.9.6 add caption-highlight --dir <id>-edit --no-clipboard --json
```

It writes `<id>-edit/compositions/components/caption-highlight.html`. That file is the pristine
source each version's captions are copied from (section 5). Never edit it.

## 3. Transcribe

### The engine

Use **Parakeet**, local and free, which needs nothing built. whisper.cpp is the other local engine,
but on Windows it has to be compiled from source, which is not something to ask of a marketer.

- `doctor` shows no speech engine → Parakeet is not installed. It is a one-time download of several
  hundred megabytes (about a minute on a decent connection) into the user's own cache folder. **Ask
  before installing it.** Then:

  ```bash
  npx -y hyperframes@0.9.6 models install parakeet --json
  ```

- Parakeet covers English and about 25 European languages. For anything else, whisper is the only
  local route: use it if `doctor` shows whisper-cpp, otherwise say plainly that this language cannot
  be transcribed here.

### The command

From `media/<id>/`:

```bash
npx -y hyperframes@0.9.6 transcribe <id>-aroll-v01.mp4 --dir <id>-edit --engine parakeet --language en
```

- **The input path is relative to where you run it, not to `--dir`.**
- Always name the engine. `auto` is allowed to pick whatever is installed, and the run should not
  depend on what happens to be lying around.
- With whisper instead: `--engine whisper --model small.en` for English, or
  `--model small --language <code>` otherwise. A `.en` model silently *translates* other languages
  into English.

It writes `<id>-edit/transcript.json`. Rename it at once to `transcript-aroll-v01.json` (matching the
take's version), because the next transcription would overwrite it.

The shape is a flat array: `[{"id":"w0","text":"Most","start":0,"end":0.4}, …]`. Punctuation rides
on the word (`"ad."`), and filler words appear as words (`"Um,"`).

### The trap

**Parakeet stretches the last word before a pause across the whole pause.** In the test take,
"ad." ran from 2.24 to 4.08 seconds when it was spoken by about 2.4, followed by silence. So word gaps
do not reveal pauses. Find pauses with ffmpeg instead (section 4) and use the transcript for
*which words*, never for *where the silence is*.

## 4. Find the silences

From `media/<id>/`:

```bash
ffmpeg -hide_banner -nostats -i <id>-aroll-v01.mp4 -af silencedetect=noise=-35dB:d=0.35 -f null - 2>&1 | grep silence_
```

Each pause comes back as a `silence_start:` line and a `silence_end:` line (with
`silence_duration`). `-35dB` suits a phone recorded indoors. If a noisy take reports almost no
silence, retry at `-30dB`; if it reports silence in the middle of words, try `-40dB`. Say which
threshold you used in the plan.

How these pauses and the transcript turn into a cut list is in `broll-rules.md` section 1.

## 5. Captions for one version

For edit `vNN`, copy the pristine component to `<id>-edit/compositions/<id>-captions-vNN.html` and
make exactly these changes. Everything else in the file stays as installed.

| Find | Change to | Why |
|---|---|---|
| `width=1920, height=1080` (viewport meta) | `width=1080, height=1920` | vertical |
| every `width: 1920px;` / `height: 1080px;` | `width: 1080px;` / `height: 1920px;` | vertical (`html, body` and `#highlight`) |
| `data-width="1920"` / `data-height="1080"` | `data-width="1080"` / `data-height="1920"` | vertical |
| `data-duration="8"` | the edit's total length, e.g. `data-duration="38.42"` | match the edit |
| `bottom: 140px;` (`.hl-group`) | `bottom: 380px;` | low in the frame, below the opening title (section 6.1) |
| `padding: 0 100px;` (`.hl-group`) | `padding: 0 140px;` | clears the right-hand button rail |
| `font-size: 80px;` (`.hl-word`) | `font-size: 64px;` | one caption size for the whole short |
| `var computedSize = fitFontSize(groupText, 80, "800", "Montserrat", 1620);` | `var computedSize = 64;` | stops long groups shrinking (the installed call takes them down to 36px) |
| `family=Montserrat:wght@800` (Google Fonts link) and `"Montserrat"` in `.hl-word` | the brand's typeface from `design.md`, weight 700 or 800 | brand type |
| `#ff1745 0%, #df1238 100%` (`.hl-word-bg`) and the `rgba(229, 20, 58, 0.32)` shadow | the brand accent hex, both stops; the shadow in the same hue | the spoken word lights up in the brand colour |
| the `WORDS` array | the corrected, re-timed words of this edit (`broll-rules.md` section 4) | the actual speech |
| the `RAW_GROUPS` array | index pairs, 2–3 words a group, breaking at sentence ends | 2–3 words on screen at a time |

**Typeface.** If the brand's typeface is on Google Fonts, put its family name in the link and the
CSS. If it is not (a licensed or custom face), keep Montserrat and say so in the hand-back: the
captions are in a stand-in font, because the brand's own font is not one the render can fetch.

**Text colour on the accent.** The spoken word sits on the accent, so its colour comes from the
contrast rule below. If that rule picks anything but white, set `.hl-word` `color` to it and drop
its `text-shadow`.

### 5.1 The contrast rule

Every place the edit puts words on a brand colour takes its text colour from this rule, never by eye:
the caption highlight, the opening title (section 6.1), the graphic cards and the overlays
(`graphic-cards.md`). It is the WCAG contrast ratio, worked out by hand from the hex values in
`design.md`.

1. **Luminance of a colour.** For each of its red, green and blue pairs, take the value 0 to 255 and
   divide by 255, giving `c`. If `c ≤ 0.04045` use `c ÷ 12.92`, otherwise `((c + 0.055) ÷ 1.055)` to
   the power 2.4. Then `L = 0.2126 × red + 0.7152 × green + 0.0722 × blue`. White is 1, black 0.
2. **Contrast** between two colours is `(lighter L + 0.05) ÷ (darker L + 0.05)`.

**Text on the accent** (the title box, the caption highlight, a highlight overlay) needs **4.5 to
1**:

- white, if it reaches 4.5 (in practice: the accent's `L` is 0.183 or less);
- otherwise the brand's darkest colour, if that reaches 4.5;
- otherwise black, `#000000`, which always does when white does not. Say so in the plan's Notes.

**The accent used as type or a shape on the darkest colour** (a figure card's number, a chart's
highlighted bar, a kicker, a chapter label's rule) needs **3 to 1**, since it is very large type or a
graphic. Below that, the number and the kicker take white, and the plan says the accent was too close
to the dark to read.

Worked examples: `#1F6FEB` takes white (4.63) and reads on `#0B1B33` (3.72); a yellow `#FFC700`
fails white (1.56) and takes the brand's dark or black; an orange `#FF6B00` fails white (2.86).

**Placement.** At `bottom: 380px` a one-line caption sits at about y 1450 to 1540, under the opening
title and still inside the 4:5 crop (which keeps y 285 to 1635). That is lower than the apps'
caption-safe area, by choice: on TikTok, Reels and Shorts it can sit behind the post's own text when
that is expanded. The title, not the captions, is what is held inside the safe area. A caption that
wraps to two lines grows upward to about y 1370, which still clears the title's bottom edge at
y 1320. The numbers are fixed on purpose: every brand gets the same placement, and only the type and
colour change.

## 6. The edit file

`<id>-edit/<id>-edit-vNN.html`. One root composition, one `<video>` per kept part of the take, one
wrapper per stock or generated cutaway, one per still (stock, or from the script's sources, with its
credit), each graphic card, each overlay and the
captions mounted as sub-compositions, the opening title on top, and the zoom cuts and the stills'
slow zooms in the root timeline:

```html
<!doctype html>
<html lang="en" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@800&display=swap" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1080px; height: 1920px; overflow: hidden; background: #000; }
      #root { position: relative; width: 1080px; height: 1920px; overflow: hidden; }
      .aroll, .broll video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
      .aroll { z-index: 0; transform-origin: 50% 30%; }
      .broll, .graphic { position: absolute; inset: 0; z-index: 1; }
      .still { overflow: hidden; background: #000; }
      .still-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transform-origin: 50% 50%; }
      .framed .still-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: blur(40px) brightness(0.55); transform: scale(1.15); }
      .framed .still-img { inset: auto; left: 50%; top: 50%; object-fit: contain; }
      .still-credit { position: absolute; top: 305px; left: 60px; max-width: 880px; padding: 8px 14px 10px; border-radius: 8px; background: rgba(0, 0, 0, 0.6); color: #ffffff; font-family: "Montserrat", sans-serif; font-weight: 800; font-size: 28px; line-height: 1.25; }
      .overlay { position: absolute; inset: 0; z-index: 2; }
      .captions { position: absolute; inset: 0; z-index: 3; }
      .title { position: absolute; left: 140px; right: 140px; bottom: 600px; z-index: 4; display: flex; justify-content: center; }
      .title-box { background: #1F6FEB; color: #ffffff; font-family: "Montserrat", sans-serif; font-weight: 800; font-size: 72px; line-height: 1.12; text-align: center; padding: 28px 40px 32px; border-radius: 12px; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="38.42" data-width="1080" data-height="1920">
      <!-- the take, one element per kept part; data-media-start is where in the take it begins -->
      <video id="a1" class="clip aroll" src="../short-03-aroll-v01.mp4" data-start="0" data-duration="4.46" data-media-start="0" data-track-index="0" data-has-audio="true" playsinline></video>
      <video id="a2" class="clip aroll" src="../short-03-aroll-v01.mp4" data-start="4.46" data-duration="3.67" data-media-start="7.19" data-track-index="0" data-has-audio="true" playsinline></video>
      <!-- one wrapper per stock or generated cutaway, muted -->
      <div class="clip broll" data-start="5.77" data-duration="1.82" data-track-index="1">
        <video id="b1" class="clip" src="../short-03-broll1-v01.mp4" data-start="5.77" data-duration="1.82" data-media-start="0.5" muted playsinline></video>
      </div>
      <!-- one wrapper per stock still; it moves by the slow zoom in the timeline below (section 6.4) -->
      <div id="s4" class="clip broll still" data-start="14.20" data-duration="2.30" data-track-index="1">
        <img class="still-img" src="../short-03-broll4-v01.jpg" alt="" />
      </div>
      <div id="s6" class="clip broll still framed" data-start="19.05" data-duration="2.10" data-track-index="1">
        <img class="still-bg" src="../short-03-broll6-v01.jpg" alt="" />
        <img class="still-img" src="../short-03-broll6-v01.jpg" alt="" style="width: 1000px; height: 666px; margin: -333px 0 0 -500px;" />
      </div>
      <!-- an image from one of the script's sources: a still, plus its credit for the whole beat -->
      <div id="s8" class="clip broll still" data-start="24.30" data-duration="2.60" data-track-index="1">
        <img class="still-img" src="../short-03-broll8-v01.jpg" alt="" />
        <div class="still-credit">Fig. 2: Lee et al. 2024, PLOS ONE, CC BY 4.0, cropped</div>
      </div>
      <!-- one mount per graphic card -->
      <div id="graphic3" class="graphic" data-composition-id="graphic3" data-composition-src="compositions/short-03-graphic3-v01.html" data-start="9.10" data-duration="2.00" data-track-index="1"></div>
      <!-- one mount per overlay, laid over the face (section 6.5) -->
      <div id="overlay5" class="overlay" data-composition-id="overlay5" data-composition-src="compositions/short-03-overlay5-v01.html" data-start="12.15" data-duration="1.60" data-track-index="2"></div>
      <!-- captions -->
      <div class="captions" data-composition-id="captions" data-composition-src="compositions/short-03-captions-v01.html" data-start="0" data-duration="38.42" data-track-index="3"></div>
      <!-- the opening title, from frame one -->
      <div class="clip title" data-start="0" data-duration="4.12" data-track-index="4"><div class="title-box">Why your shop feels busy but sells less</div></div>
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      // zoom cuts: in, then out, on the face only
      tl.set(".aroll", { scale: 1.2, transformOrigin: "50% 30%" }, 12.40);
      tl.set(".aroll", { scale: 1 }, 13.85);
      // stills: one slow, even zoom across each beat (a push in, then a pull out)
      tl.fromTo("#s4 .still-img", { scale: 1, xPercent: 0 }, { scale: 1.08, xPercent: -2, duration: 2.30, ease: "none" }, 14.20);
      tl.fromTo("#s6 .still-img", { scale: 1.08 }, { scale: 1, duration: 2.10, ease: "none" }, 19.05);
      tl.fromTo("#s8 .still-img", { scale: 1, yPercent: 0 }, { scale: 1.08, yPercent: -2, duration: 2.60, ease: "none" }, 24.30);
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
```

Rules the render depends on:

- **Kept parts sit end to end.** Each A-roll element's `data-start` is the previous one's
  `data-start + data-duration`, to two decimals. The root's `data-duration` is the last one's end.
- **`data-media-start`** is the point in the source file where that element begins playing. It is
  what makes tightening non-destructive: the take itself is never re-encoded.
- **Sound.** The A-roll elements carry `data-has-audio="true"`. Every cutaway `<video>` carries
  `muted`. A video with neither fails lint.
- **Layering is CSS `z-index`.** `data-track-index` is only a label in HyperFrames' preview and does
  nothing in a render. Keep it anyway; it makes the preview readable.
- **Crop with CSS on the element, never by scripting the video.** `object-fit: cover` fills the
  vertical frame from a landscape or portrait source. Never call `play()` or set `currentTime`.
- **`../` reaches the footage.** Media paths are relative to the edit file, so the take and the
  cutaways stay in `media/<id>/` and are never copied into the project folder.
- **Lint disagrees, the render does not.** `hyperframes lint` reports the `../` paths
  (`invalid_parent_traversal_in_asset_path`, `missing_local_asset`) and the timed cutaway wrapper
  (`video_nested_in_timed_element`) as errors. At 0.9.6 the render loads the take and the cutaways
  correctly with exactly this layout (checked), because the wrapper and its video share one
  `data-start`. Do not "fix" either to quiet the linter.

### 6.1 The opening title

The `.title` element above, in the edit file itself rather than a separate file. Set per short:

- the box `background` to the brand accent from `design.md`, and the text `color` by the contrast
  rule (section 5.1);
- `font-family` to the brand typeface, with the same Google Fonts link in the edit file's head
  (Montserrat as the stand-in, under the same rule as section 5);
- `data-duration` to the end of the title's word (`broll-rules.md` section 2);
- the line itself, exactly as picked, as the box's text. Not uppercased.

Leave the position alone. `bottom: 600px` puts the box's bottom edge at y 1320, and a three-line
title at 72px reaches up to about y 1020: well inside the 4:5 crop (y 285 to 1635), clear of the
right-hand rail, and above the captions. A fourth line would push it towards the top of that band,
which is why `broll-rules.md` caps the line at about 40 characters. The title has no entrance
animation, so it is fully there in the first frame, and it leaves on a cut.

### 6.2 Graphic cards

One file per card: `compositions/<id>-graphic<N>-vNN.html`, where `<N>` is the beat number and `vNN`
matches the edit file. Mount it as in the example above, with an `id`,
`data-composition-id="graphic<N>"`, and its beat's start and length. The card registers its own
timeline under the same `graphic<N>`.

The card files themselves (the shared shell, then figure, phrase, reaction, bar chart, step
diagram and the two source cards) are in [graphic-cards.md](graphic-cards.md). A card is a plain
sub-composition: no registry component, nothing installed with `add`.

### 6.3 Zoom cuts

Zoom cuts are `tl.set` calls on `.aroll` in the root timeline, as in the example: one at the zoom-in
time with `scale: 1.2` and the face's `transformOrigin`, one at the zoom-out time with `scale: 1`.
Times are on the tightened timeline, to two decimals. Selecting the class rather than one element
means a zoom carries across a kept-part boundary unchanged (checked). It scales only the take; the
cutaways and cards are separate layers. `#root` needs `overflow: hidden` so the enlarged take does
not spill past the frame. `tl.set` is a hard cut by design; never use `tl.to` here, which would
animate a push-in. The one animated push in the edit is a still's slow zoom (section 6.4), and it
never touches `.aroll`.

### 6.4 Stills and the slow zoom

A stock still is a `.broll.still` wrapper holding an `<img>`, timed like a clip's wrapper with its
beat's `data-start` and `data-duration`, and set moving by one `tl.fromTo` in the root timeline,
beside the zoom cuts. The id is `s<N>`, where `<N>` is the beat number. The editorial rules (which
way, how far, `full` or `framed`) are in `broll-rules.md` section 2, "Stills and the slow zoom",
and the sizes in its section 3.1.

- **`full`:** one `<img class="still-img">`. `object-fit: cover` crops it to the frame, as with a
  clip.
- **`framed`:** two `<img>` of the same file. `still-bg` is the blurred, darkened copy that fills
  the frame; `scale(1.15)` pushes the blur's soft edge outside the frame. `still-img` is the sharp
  photo, given its drawn size from section 3.1 inline, with negative margins of half its height and
  half its width so it sits centred. A 1000×666 photo is `width: 1000px; height: 666px; margin:
  -333px 0 0 -500px;`. Drawn at the full 1080 width instead, it loses about 43 pixels off each side
  at the top of the zoom (checked), which is why `broll-rules.md` caps the width at 1000.
- **The zoom** goes on `#s<N> .still-img` only, never on the wrapper or the blurred copy: from
  `scale: 1` to `scale: 1.08` to push in, the reverse to pull out, `duration` equal to the beat's
  `data-duration`, `ease: "none"`, at the beat's `data-start`. An optional drift is `xPercent` or
  `yPercent` of up to 2, in the direction of the subject. To two decimals, like every time in the
  file.
- **No `muted` or `data-has-audio`:** those are for `<video>`; an `<img>` has no sound to declare.
- **A source image's credit** is a `<div class="still-credit">` inside the same wrapper, after the
  images, holding the line from `broll-rules.md` section 3.2 exactly. Being inside the wrapper, it
  comes and goes with the image; being a sibling of `still-img`, not a child, it stays still while
  the image zooms. Its place, top left at y 305, is inside the 4:5 band, clear of the right-hand
  rail and the top-of-screen controls, and away from the captions and overlays lower down. Set its
  `font-family` to the title's typeface; leave the size, the colours and the dark backing alone,
  since the backing is what keeps it legible over a white or yellow image. A stock still has no
  credit element.
- The root timeline is paused and seeked frame by frame, so the zoom lands on the same frame in
  every render, as the graphic cards' animations do.

**Checked at 0.9.6** with exactly this layout, one full and one framed still over a take: each
still's wrapper appears and disappears on its beat with the take showing either side, both zooms
run at an even speed from the first frame of the beat to the last, the blurred copy fills the frame
behind a sharp framed photo, and two renders of the same file match frame for frame. With a
`still-credit` in each: the credit appears and leaves with its image, holds still through the zoom,
sits whole inside the 4:5 box, and a 52-character line stays on one line and reads over white and
yellow.

Lint flags the still images the way it flags the clips (`invalid_parent_traversal_in_asset_path`,
`missing_local_asset`), and adds two warnings of its own: `nested_structure_needs_subcomposition`
for each still's wrapper, and `duplicate_media_discovery_risk` for a framed still's two images of
the same file. The render above was correct with all of them showing. Leave them, as in section 6.

### 6.5 Overlays

An overlay is a highlight or a chapter label laid over the face (`broll-rules.md` section 2, "On the
face: overlays"). One file per overlay: `compositions/<id>-overlay<N>-vNN.html`, where `<N>` counts
the overlays in order through the short and `vNN` matches the edit file. The files are in
`graphic-cards.md` part 2.

- **Mount** it like a graphic card, with class `overlay`, an `id` and `data-composition-id` of
  `overlay<N>`, and `data-track-index="2"`.
- **Timing.** `data-start` is the start of the word it lands on minus 0.25 seconds, so its entrance
  finishes as the word is said. `data-duration` runs to its end (`broll-rules.md` gives the rule),
  and the overlay's own fade-out sits in the last 0.2 seconds of it.
- **Layering.** The overlay's page is transparent, so the take shows through everywhere except the
  overlay itself. `z-index: 2` puts it above the take and any cutaway, and under the captions and the
  title. A zoom cut scales the take beneath it and leaves the overlay as it is, which is what keeps
  a chapter label steady through its zoom.

**Checked at 0.9.6** over a take with captions: a highlight and a chapter label (the label inside a
zoom cut), each appearing and leaving on its timing, the take visible all around them, both inside
the 4:5 band, clear of a face at the default zoom centre and above the captions.

## 7. Render

From `media/<id>/<id>-edit/`:

```bash
npx -y hyperframes@0.9.6 render . -c <id>-edit-vNN.html -o ../<id>-vNN.mp4 --quiet
```

- Leave `--quality` at its default (`looks`). Use `--quality draft` only for a quick look the user
  asked for, and never log a draft as the short.
- Expect roughly a minute of rendering for every five to ten seconds of finished video on a laptop.
  Tell the user before a long render starts, and run it in the background if your environment allows.
- On Windows it renders through frames written to disk, which is slower but correct.
