# halfborg-campaign — the campaign engine

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
| **3. Making things** | ads, landing pages, emails, posts, customer stories, video scripts and clips | every render stops and shows you the cost |
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
  voice-profiles.md       samples of how you actually write      (optional)
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
| **a fal.ai key** | images and video made here | It hands you the finished prompt and settings to run yourself at fal.ai, and writes nothing. |

### Turning on image and video

Open `/plugin`, go to the **Installed** tab and select **Halfborg Campaign Engine**. Claude Code will ask you
for a fal.ai key — get one at [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys). Then run
`/reload-plugins`, or restart.

The key goes into secure storage and is wired up for you. No part of the engine ever reads it, and
you should never paste a key into a conversation with anyone, including this one.

**Running without a key is a supported way to use this engine, not a lesser one.** What you get back
offline is the same block you get when you choose "I'll make it myself" with a key set.

### A note on extras

A few optional helpers only work in some environments, generally claude.ai with a subscription.
Nothing here depends on them: when one is missing, the engine does that piece of work itself. There
are no analytics integrations — if you want performance analysis, hand it a CSV or spreadsheet, and
it will tell you what is missing rather than invent a number.

## What's inside

**Commands** — `setup-engine`, `setup-brand`, `new-campaign`.

**Skills** — `architecture` (the architecture reference), `write-brief`, `write-message`,
`run-qa`, `build-site`, `write-ad-creative`, `write-video-ad-script`, `prepare-reference-kit`,
`compose-lockup`, `explore-visual-ideas`, `analyse-competitor-ads`, `build-landing-page`, `write-personal-post`,
`write-customer-story`, `write-email`, `generate-image`, `generate-video`,
`write-generation-prompt`.

**Agents** — `strategist`, `researcher`, `content-writer`, `paid-creative`, `analyst`.

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
