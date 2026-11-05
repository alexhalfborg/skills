# Halfborg Campaign Engine

A marketing campaign engine for Claude Code. It turns a rough goal into a full set of campaign
deliverables through a fixed pipeline that stops for your sign-off at every point that matters. It
knows nothing about any particular brand: everything brand-specific is read from a file describing
yours. Swap that file, get a different brand, same pipeline.

## Before you start

You need three things, and the first is the only one that is not optional.

**Claude Code.** This is a plugin for it. Get it at
[claude.com/claude-code](https://claude.com/claude-code) — the desktop app is the easiest way in, and
there is a terminal version too. A Claude subscription comes into it.

**A folder for your marketing.** Anywhere on your machine, and empty is fine — the engine builds out
what it needs. Something like `Documents/marketing` is perfect. In the desktop app you open that
folder; in the terminal you `cd` into it and run `claude`.

**Half an hour, once.** Setting your brand up is a conversation, and it is the thing that makes
everything afterwards good rather than generic.

## Install

```
/plugin marketplace add alexhalfborg/skills
/plugin install halfborg-campaign@halfborg
```

The first line adds the catalogue so Claude Code knows where to look; it installs nothing by itself.
The second installs the engine. If `/plugin` is not available in your environment, the desktop app's
plugin browser does the same job.

Commands are prefixed with the plugin name, so they read as `/halfborg-campaign:setup-engine`,
`/halfborg-campaign:setup-brand` and `/halfborg-campaign:new-campaign`. Type `/halfborg` and let it
complete.

## Your first campaign

```
/halfborg-campaign:setup-engine            sets your folder up
/halfborg-campaign:setup-brand acme.com    tells it about your brand
/halfborg-campaign:new-campaign acme spring-launch
```

`setup-engine` reports what it found and what that means for you, then gets out of the way.
`setup-brand` interviews you in plain questions, and if you give it a website it will read the site
and fill in the detail itself, logo included, so your pages come out carrying it. You never write or
read a config file.

From there the pipeline runs itself, one stage at a time.

| Stage | You get | Your say |
|---|---|---|
| **1. The plan** | the written brief, plus the list of everything the campaign will produce | you sign it off before anything is written |
| **2. The message** | the one idea, the line, and the picture the whole campaign hangs on | you pick the line and the picture |
| **3. Making things** | ads, landing pages, emails, posts, customer stories, video scripts and clips, and your own talking-head videos edited into finished shorts | every render stops and shows you the cost |
| **4. The check** | a report on everything against your own brand rules | it proposes fixes; it never applies them |

The first two stages stop for sign-off before they write a thing. Every render — image or video —
stops and shows you what it is about to make, what it costs, and the exact text being sent, then lets
you choose between it making the thing and you making it yourself. **No setting relaxes either
gate.**

Once you've finished creating things in a session, `site/index.html` gets rebuilt: the whole
campaign as one scrolling page, with running costs.

## What it creates in your folder

Nothing exists up front. Each command creates what it needs.

```
CLAUDE.md                 a short note so Claude remembers this folder is a campaign workspace
engine.yaml               defaults you can ignore. No secrets, ever.
brands/<id>/
  pack.yaml               everything it knows about your brand
  design.md               your typeface and colours              (optional)
  voice/                  samples of how you actually write      (optional)
  assets/                 your logo and product photos           (optional)
campaigns/<brand>-<YYYY-MM-DD>-<name>/
  docs/                   the plan, the message, the final check
  content/                the written pieces
  media/                  every picture and clip, every version kept
  site/index.html         the whole campaign on one page
```

`brands/` and `campaigns/` are yours. The engine is read-only and never writes into itself. Nothing
is ever overwritten: a second attempt at a picture is saved beside the first, and the record of which
one you settled on lives with the campaign.

## What you need, and what happens without it

There is no build step and nothing to install. Everything below is optional and none of it stops you
finishing a campaign.

| | Gives you | Without it |
|---|---|---|
| **ffmpeg** | checking a video after it is made | You still get the clip. It just says it could not open the file to check it. |
| **a fal.ai account, signed in** | images and video made here | It hands you the finished prompt and settings to run yourself at fal.ai, and writes nothing. |
| **Node.js 22 or newer** | your talking-head shorts edited and rendered on your own computer | It still plans the cuts and finds the b-roll, then gives you the list to put together in CapCut or any editor. |
| **a Pixabay key** (free) | stock b-roll found and downloaded for your shorts | It plans where the b-roll goes and gives you search links to pick the clips yourself. |
| **an Instagram or Threads token** (free, renewed every 60 days) | finished Instagram and Threads posts put live for you, after you say yes to each one | It writes the post and makes the pictures, then gives you the text and pictures in order to post from the app. |

### Editing talking-head shorts

Film yourself talking to camera on your phone, held upright, and hand over the file. It cuts the
pauses, the ums and the false starts, and opens the video on your hook as a title in your brand's
colour, placed so it still shows when Instagram crops the video for the feed. Each sentence starts
on you, then cuts away to stock footage or a simple animated graphic (a number, a chart, a diagram,
or the article or study you mention) until the sentence ends. Where no stock clip fits, it uses a
stock photo instead and gives it a slow zoom, so it still moves. If you filmed it all from one angle,
it zooms in on your list headings and key words. While you are on screen, a few of your key words
can pop up beside you in your brand's colour, and each list heading gets a small label, timed to
land as you say it. If you stay on screen a long while with nothing changing, it points that out
and suggests what could go there. Captions light up word by word in your brand's font and colour,
all the same size, in a text colour picked so it stays readable on your brand colour. It renders a vertical video ready for TikTok, Reels or Shorts,
and shows you every cut, clip and graphic before it downloads or renders anything.

It never uses meme GIFs or clips from films and TV: most of those belong to someone else, and a
brand account posting them risks the video being muted or taken down.

The first time, it asks to download a speech-recognition model (a one-off, a few hundred megabytes)
that runs entirely on your computer. Nothing you say is sent anywhere to be transcribed, and none of
it costs anything. Only a cutaway you ask it to generate with AI costs money, and that stops and shows
you the price like any other render.

For stock b-roll, make a free account at [pixabay.com](https://pixabay.com), then open
[pixabay.com/api/docs](https://pixabay.com/api/docs/) while logged in: your key is shown on that
page. Then open `/plugin`, go to the **Installed** tab and select **Halfborg Campaign Engine**:
Claude Code asks for the Pixabay key there. Run `/reload-plugins`, or restart. The key goes into
secure storage, never into a conversation.

If you already have a Pexels key, you can enter it in the same place and it searches both. Pexels
is not giving out new keys at the moment, so you don't need one.

### Instagram posts

Ask for an Instagram post and it writes the caption in your voice, plans the slides for a carousel,
makes the pictures at the shape Instagram shows best (portrait, 4:5), writes the description every
picture needs for people who cannot see it, and keeps it all inside Instagram's limits. Any picture it
has to make stops and shows you the price first, like any other.

It can also post it for you. Before every single post it stops and shows you exactly what goes out:
the caption word for word, the pictures in order, and the account. Nothing goes live until you say
yes to that post, and saying yes to one never covers the next. It only ever posts to the account you
gave as your brand's handle, and it will not post something the final check flagged as needing a fix.

To turn posting on you need a professional Instagram account (Business or Creator, free to switch)
linked to a Facebook Page, and a token from Meta's developer site. Run
`/halfborg-campaign:setup-engine` and it walks you through getting one; it takes about twenty
minutes, once. The token goes under `/plugin` → **Installed** → **Halfborg Campaign Engine**, never
into a conversation, and it needs renewing every 60 days (the engine tells you when). Posting also
needs fal signed in (below), because Instagram collects each picture from a web address fal provides.
That part costs nothing.

Without a token, you get the finished post ready to put up from the Instagram app yourself.

### Threads posts

Threads works the same way. Ask for a Threads post and it writes it to Threads' own rules: shorter,
more like talking, with links that work and a single topic tag instead of a line of hashtags. It can
be text on its own, one picture, or a run of pictures, and it can reuse the pictures it made for
your Instagram post. Posting it live is a separate yes, even when you have just said yes to the
Instagram one.

Threads needs its own token, from the same Meta developer app; `/halfborg-campaign:setup-engine` walks
you through that too. A Threads post with no pictures does not need fal at all.

### Turning on image and video

Type `/mcp`, choose **fal-ai** (it sits under Halfborg Campaign Engine) and pick **Authenticate**. A
browser window opens: sign in to [fal.ai](https://fal.ai), or make an account, and approve. That is
it. There is no key to copy, and you should never paste a password or key into a conversation with
anyone, including this one.

If you have already added fal to claude.ai, the engine still wants its own sign-in. Same account,
nothing extra to pay.

**Running without fal connected is a supported way to use this engine, not a lesser one.** What you
get back is the same block you get when you choose "I'll make it myself" with fal connected.

### A note on extras

A few optional helpers only work in some environments, generally claude.ai with a subscription.
Nothing here depends on them: when one is missing, the engine does that piece of work itself. There
are no analytics integrations — if you want performance analysis, hand it a CSV or spreadsheet, and
it will tell you what is missing rather than invent a number.

## What's inside

**Commands** — `setup-engine`, `setup-brand`, `new-campaign`.

**Skills** — the four phases are `write-brief`, `write-message` and `run-qa`, with expansion handled
by `write-ad-creative`, `write-video-ad-script`, `prepare-reference-kit`, `compose-lockup`,
`explore-visual-ideas`, `analyse-competitor-ads`, `build-landing-page`, `write-personal-post`,
`write-customer-story`, `write-email`, `write-instagram-post`, `write-threads-post`, `write-generation-prompt`, `generate-image`,
`generate-video` and `edit-talking-head`. `write-hook` suggests the headline, subject line or video title that gets a piece
noticed, and works on anything you hand it. `publish-social` puts a finished post live, one yes at
a time. `build-site` keeps the campaign page current, and
`architecture` is the reference describing how the whole thing fits together.

**Agents** — `strategist`, `researcher`, `content-writer`, `paid-creative`, `analyst`, `qa`.

## How it stays consistent

**The engine never names a brand.** If it needs a brand fact, it reads your brand file. That
boundary is what lets the same pipeline work for anyone.

**It remembers in files, not in the conversation.** Each stage writes something the next one reads,
so you can close the session, come back next week, and carry on where you left off.

**Nothing is overwritten.** Every version of every picture is kept. Which one is the rough option,
which is the one you locked, and which shipped is recorded alongside them.

**Out of order is a signpost, not an error.** Ask for an ad in an empty folder and it tells you what
is missing and what to run first. It will not invent a brand fact, a campaign or a deliverable to get
itself unstuck.

**It never claims something it did not do.** No made-up link to an image, no made-up cost, no check
reported that was not run. If it could not do something, it says so first, not last.

Full architecture, contracts and invariants: run the `architecture` skill, or read
[skills/architecture/SKILL.md](skills/architecture/SKILL.md).

Part of the [halfborg](../../README.md) marketplace. Working on the engine itself:
[CONTRIBUTING.md](../../CONTRIBUTING.md).

## Licence

MIT.
