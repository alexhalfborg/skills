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
| `bottom: 140px;` (`.hl-group`) | `bottom: 620px;` | lifts captions clear of the app's caption, buttons and progress bar |
| `padding: 0 100px;` (`.hl-group`) | `padding: 0 140px;` | clears the right-hand button rail |
| `fitFontSize(groupText, 80, "800", "Montserrat", 1620)` | the same call with the brand family and `800` as the last argument | caption lines fit the vertical width |
| `family=Montserrat:wght@800` (Google Fonts link) and `"Montserrat"` in `.hl-word` | the brand's typeface from `design.md`, weight 700 or 800 | brand type |
| `#ff1745 0%, #df1238 100%` (`.hl-word-bg`) and the `rgba(229, 20, 58, 0.32)` shadow | the brand accent hex, both stops; the shadow in the same hue | the spoken word lights up in the brand colour |
| the `WORDS` array | the corrected, re-timed words of this edit (`broll-rules.md` section 4) | the actual speech |
| the `RAW_GROUPS` array | index pairs, 2–3 words a group, breaking at sentence ends | 2–3 words on screen at a time |

**Typeface.** If the brand's typeface is on Google Fonts, put its family name in the link and the
CSS. If it is not (a licensed or custom face), keep Montserrat and say so in the hand-back: the
captions are in a stand-in font, because the brand's own font is not one the render can fetch.

**Light accents.** The words are white on the accent. If the accent is light (a yellow, a pale
green), white will not read on it: set `.hl-word` `color` to the brand's darkest colour from
`design.md` instead, and drop its `text-shadow`.

The safe-area numbers are for TikTok, Reels and Shorts, which all reserve roughly the bottom fifth
and a right-hand strip. They are fixed on purpose: every brand gets the same safe placement, and only
the type and colour change.

## 6. The edit file

`<id>-edit/<id>-edit-vNN.html`. One root composition, one `<video>` per kept part of the take, one
wrapper per cutaway, and the captions mounted as a sub-composition:

```html
<!doctype html>
<html lang="en" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1080px; height: 1920px; overflow: hidden; background: #000; }
      #root { position: relative; width: 1080px; height: 1920px; }
      .aroll, .broll video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
      .aroll { z-index: 0; }
      .broll { position: absolute; inset: 0; z-index: 1; }
      .captions { position: absolute; inset: 0; z-index: 2; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="38.42" data-width="1080" data-height="1920">
      <!-- the take, one element per kept part; data-media-start is where in the take it begins -->
      <video id="a1" class="clip aroll" src="../short-03-aroll-v01.mp4" data-start="0" data-duration="2.46" data-media-start="0" data-track-index="0" data-has-audio="true" playsinline></video>
      <video id="a2" class="clip aroll" src="../short-03-aroll-v01.mp4" data-start="2.46" data-duration="0.67" data-media-start="5.19" data-track-index="0" data-has-audio="true" playsinline></video>
      <!-- one wrapper per cutaway, muted -->
      <div class="clip broll" data-start="3.77" data-duration="1.82" data-track-index="1">
        <video id="b1" class="clip" src="../short-03-broll1-v01.mp4" data-start="3.77" data-duration="1.82" data-media-start="0.5" muted playsinline></video>
      </div>
      <!-- captions -->
      <div class="captions" data-composition-id="captions" data-composition-src="compositions/short-03-captions-v01.html" data-start="0" data-duration="38.42" data-track-index="2"></div>
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
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
