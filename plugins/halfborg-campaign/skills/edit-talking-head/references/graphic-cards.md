# Graphic cards: the templates

The HTML for every kind of graphic card `edit-talking-head` builds. When to use each kind, and what
may go on it, is in `broll-rules.md` section 2. How a card is mounted in the edit file is in
`hyperframes.md` section 6.2. Every template here was rendered as shown at HyperFrames 0.9.6 and
looked at inside a 4:5 crop. The size adjustments given for longer content (more bars, more boxes,
longer headlines) were not, so check those cards in the render's frames (SKILL.md step 9). If a run
disagrees with this file, believe the run and say these notes need updating.

## 1. The shell

Every card is one file, `compositions/<id>-graphic<N>-vNN.html`, built from this shell. Fill in the
kind's styles, content and animation from the sections below.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;800&display=swap" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1080px; height: 1920px; overflow: hidden; background: transparent; }
      .card { position: relative; width: 1080px; height: 1920px; background: #0B1B33; overflow: hidden; font-family: "Montserrat", sans-serif; }
      .stage { position: absolute; left: 140px; right: 140px; top: 420px; height: 840px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
      /* the kind's styles */
    </style>
  </head>
  <body>
    <div class="card" data-composition-id="graphic3" data-start="0" data-duration="2.00" data-width="1080" data-height="1920">
      <div class="stage">
        <!-- the kind's content -->
      </div>
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      // the kind's animation
      window.__timelines["graphic3"] = tl;
    </script>
  </body>
</html>
```

- `data-composition-id` and the `window.__timelines` key are both `graphic<N>`, and match the mount.
- `data-duration` is the beat's length.
- **Brand.** `#0B1B33` becomes the brand's darkest colour from `design.md`, `#1F6FEB` its accent, and
  `Montserrat` its typeface (in the link and the CSS), under the same stand-in rule as the captions
  (`hyperframes.md` section 5). Without `design.md`, keep `#0B1B33`, use white for the accent, and say
  so in the plan.
- **Position.** Everything sits in `.stage`, the band from y 420 to 1260: inside the 4:5 crop and
  above the captions, which run over the card as usual. Do not move it.
- **Motion.** Entrances only, all done within about 1.2 seconds, so the card is readable for most of
  its time on screen. No exit animation; the card leaves on a cut.

## 2. Figure

A number the speaker says, with up to three words of label.

```css
.big { font-weight: 800; font-size: 300px; line-height: 1; color: #1F6FEB; }
.label { margin-top: 24px; font-weight: 800; font-size: 72px; line-height: 1.1; color: #ffffff; }
```

```html
<div class="big" id="g-big">300</div><div class="label" id="g-label">customers</div>
```

```js
tl.fromTo("#g-big", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(1.6)" }, 0);
tl.fromTo("#g-label", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }, 0.2);
```

A figure of five characters or more ("£1,200") drops `.big` to 220px.

## 3. Phrase

Up to six of the speaker's words. The figure card without `.big`, and the label at 96px:

```html
<div class="label" id="g-label" style="font-size: 96px">The thing most people miss</div>
```

```js
tl.fromTo("#g-label", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }, 0);
```

## 4. Reaction

One emoji, with an optional word or two the speaker says. The emoji comes from **Noto Color Emoji**
(Google, SIL Open Font License), loaded from Google Fonts, never the machine's own emoji set: Apple's
and Microsoft's emoji designs are their copyright, and a render can quietly fall back to whichever
set the machine has. Add `&family=Noto+Color+Emoji` to the shell's font link.

```css
.emo { font-family: "Noto Color Emoji", sans-serif; font-size: 360px; line-height: 1; }
.word { margin-top: 40px; font-weight: 800; font-size: 96px; color: #fff; }
```

```html
<div class="emo" id="emo">&#x1F644;</div><div class="word" id="w">Seriously?</div>
```

```js
tl.fromTo("#emo", { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(1.8)" }, 0);
tl.fromTo("#w", { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.25);
```

Write the emoji as an HTML code point (`&#x1F644;`), so the file's encoding cannot mangle it. Check
it in the render: Noto's faces are glossy and round. A flat, outlined face means the font did not load
and the machine's own set was used, which is a fail.

## 5. Bar chart

Two to four values, as vertical bars from a zero baseline. The tallest bar is 480px; each of the
others is `value ÷ largest value × 480`, rounded to the pixel. The highlighted bar (the one the
speaker's point is about) takes the accent; the rest are pale.

```css
.chart { display: flex; align-items: flex-end; justify-content: center; gap: 90px; height: 600px; width: 100%; border-bottom: 4px solid rgba(255,255,255,0.5); }
.col { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; width: 220px; }
.val { font-weight: 800; font-size: 72px; color: #fff; margin-bottom: 16px; }
.bar { width: 100%; background: rgba(255,255,255,0.35); border-radius: 12px 12px 0 0; transform-origin: 50% 100%; }
.bar.hi { background: #1F6FEB; }
.labs { display: flex; gap: 90px; }
.lab { width: 220px; font-weight: 800; font-size: 44px; color: #fff; margin-top: 20px; text-align: center; }
.src { font-weight: 500; font-size: 30px; color: rgba(255,255,255,0.7); margin-top: 36px; }
```

```html
<div class="chart">
  <div class="col"><div class="val" id="v1">12%</div><div class="bar" id="b1" style="height: 186px"></div></div>
  <div class="col"><div class="val" id="v2">31%</div><div class="bar hi" id="b2" style="height: 480px"></div></div>
</div>
<div class="labs"><div class="lab">Before</div><div class="lab">After</div></div>
<div class="src">Source: Example Study, 2025</div>
```

```js
tl.fromTo(["#b1", "#b2"], { scaleY: 0 }, { scaleY: 1, duration: 0.6, ease: "power2.out", stagger: 0.15 }, 0);
tl.fromTo(["#v1", "#v2"], { opacity: 0 }, { opacity: 1, duration: 0.25, stagger: 0.15 }, 0.45);
```

For three bars, narrow `.col` and `.lab` to 180px and the gaps to 50px; for four, 150px and 30px,
with `.val` at 56px. Labels stay to two words. `.src` appears only when the numbers come from a
source, and names it as the plan does.

## 6. Step diagram

Two to four boxes, top to bottom, joined by arrows: a sequence, or a cause and its effect. Labels are
three words at most.

```css
.node { width: 640px; padding: 34px 40px; border-radius: 16px; background: rgba(255,255,255,0.08); border: 4px solid #1F6FEB; color: #fff; font-weight: 800; font-size: 56px; text-align: center; }
.arrow { width: 6px; height: 70px; background: #1F6FEB; position: relative; margin: 6px 0 30px; transform-origin: 50% 0; }
.arrow::after { content: ""; position: absolute; left: -17px; bottom: -22px; border-left: 20px solid transparent; border-right: 20px solid transparent; border-top: 26px solid #1F6FEB; }
```

```html
<div class="node" id="n1">Messy shop</div><div class="arrow" id="r1"></div>
<div class="node" id="n2">Slow browsing</div><div class="arrow" id="r2"></div>
<div class="node" id="n3">Fewer sales</div>
```

```js
tl.fromTo("#n1", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3 }, 0);
tl.fromTo("#r1", { scaleY: 0 }, { scaleY: 1, duration: 0.25 }, 0.35);
tl.fromTo("#n2", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3 }, 0.6);
tl.fromTo("#r2", { scaleY: 0 }, { scaleY: 1, duration: 0.25 }, 0.95);
tl.fromTo("#n3", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3 }, 1.2);
```

Each further step enters 0.6 seconds after the last. With four boxes, take `.node` to 48px and
`.arrow` to 50px tall.

## 7. Source card: newspaper

For a cited news article. A generic paper page, slightly tilted: the publication's name in plain
type, the date, the headline as published, grey bars for body text, and optionally one verbatim line
highlighted in the accent. The serif is **Source Serif 4**, a neutral newsprint face, whatever the
brand; never the real publication's own typeface, masthead or logo. Add
`&family=Source+Serif+4:wght@400;700` to the shell's font link.

```css
.page { width: 800px; background: #F6F3EC; border-radius: 6px; padding: 48px 52px 56px; box-shadow: 0 30px 80px rgba(0,0,0,0.45); transform: rotate(-2deg); font-family: "Source Serif 4", serif; color: #1a1a1a; text-align: left; }
.pub { font-weight: 700; font-size: 40px; text-align: center; border-bottom: 3px solid #1a1a1a; padding-bottom: 14px; letter-spacing: 0.04em; }
.date { font-family: "Montserrat", sans-serif; font-weight: 500; font-size: 22px; color: #555; text-align: center; margin: 12px 0 28px; }
.hed { font-weight: 700; font-size: 58px; line-height: 1.12; margin-bottom: 30px; }
.line { height: 16px; background: #d8d3c8; border-radius: 4px; margin: 14px 0; }
.q { position: relative; z-index: 0; margin: 22px 0; font-size: 36px; line-height: 1.4; }
.mark { position: absolute; left: -6px; right: -6px; top: 2px; bottom: 2px; background: rgba(31, 111, 235, 0.33); transform-origin: 0 50%; z-index: -1; }
```

```html
<div class="page" id="page">
  <div class="pub">The Daily Ledger</div>
  <div class="date">12 March 2026</div>
  <div class="hed">Cluttered stores lose a third of browsers, survey finds</div>
  <div class="line" style="width: 100%"></div><div class="line" style="width: 92%"></div>
  <div class="q">"Shoppers left within two minutes when aisles were blocked."<span class="mark" id="mark"></span></div>
  <div class="line" style="width: 96%"></div><div class="line" style="width: 70%"></div>
</div>
```

```js
tl.fromTo("#page", { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }, 0);
tl.fromTo("#mark", { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.inOut" }, 0.7);
```

Without a quoted line, drop `.q` and its animation and add two more `.line` bars. A headline over
about 70 characters drops `.hed` to 48px.

## 8. Source card: web page

For an online article or a study. A plain browser window: the source's real domain in the address
bar, a kicker ("Research", "News"), the title as published, the authors or byline and year, and grey
bars for body text. No logo, site design or images from the real page.

```css
.win { width: 800px; background: #fff; border-radius: 18px; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,0.45); color: #1a1a1a; text-align: left; }
.bar { background: #e9e9ec; padding: 20px 24px; display: flex; align-items: center; gap: 12px; }
.dot { width: 18px; height: 18px; border-radius: 50%; background: #c7c7cc; }
.url { flex: 1; margin-left: 12px; background: #fff; border-radius: 10px; padding: 10px 18px; font-weight: 500; font-size: 26px; color: #444; }
.body { padding: 40px 48px 52px; }
.kicker { font-weight: 800; font-size: 24px; letter-spacing: 0.08em; color: #1F6FEB; text-transform: uppercase; margin-bottom: 16px; }
.hed { font-weight: 800; font-size: 54px; line-height: 1.12; margin-bottom: 18px; }
.meta { font-weight: 500; font-size: 24px; color: #666; margin-bottom: 30px; }
.line { height: 16px; background: #e4e4e8; border-radius: 4px; margin: 14px 0; }
```

```html
<div class="win" id="win">
  <div class="bar"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="url">example-journal.org</span></div>
  <div class="body">
    <div class="kicker">Research</div>
    <div class="hed">Store layout and dwell time in small retail</div>
    <div class="meta">Tan and Lee, 2025</div>
    <div class="line" style="width: 100%"></div><div class="line" style="width: 90%"></div><div class="line" style="width: 95%"></div><div class="line" style="width: 60%"></div>
  </div>
</div>
```

```js
tl.fromTo("#win", { y: 80, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }, 0);
```

The domain is the bare host (`nature.com`, not the full link). A highlighted quote works here as on
the newspaper card: add the `.q` and `.mark` rules and markup from section 7 after `.meta`.
