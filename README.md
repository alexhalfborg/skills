# Halfborg skills

**A marketing campaign engine that runs inside Claude Code.** You describe the campaign; it
interviews you, agrees a plan, writes the copy, makes the images and video, checks everything against
your own brand rules, and leaves the whole lot in a folder on your machine as files you own.

Tell it about your brand once. Every campaign after that starts from what it already knows.

## Who this is for

Marketers and founders who run their own campaigns. There is no code to write and nothing to
configure. You answer questions and approve things; it does the work and writes the files.

## Getting started

**1. Get Claude Code.** It is Anthropic's coding tool, and it is what this runs inside. Grab it from
[claude.com/claude-code](https://claude.com/claude-code) — the desktop app is the easiest start, and
there is a terminal version if you prefer. You will need a Claude subscription.

**2. Add the catalogue, then install.** Type these into Claude Code, one at a time:

```
/plugin marketplace add alexhalfborg/skills
/plugin install halfborg-campaign@halfborg
```

The first line just tells Claude Code where to look — it installs nothing on its own. The second
installs the engine. (If `/plugin` is not available where you are, the desktop app has a plugin
browser that does the same thing.)

Type the second line exactly as written. The bit after the `@` is the **catalogue's** name,
`halfborg` — not the repo name, `skills`, which is what the first line uses. They are different on
purpose, and mixing them up is the usual reason install comes back with "plugin not found".

**3. Point it at a folder and start.** Any folder will do, empty is fine:

```
/halfborg-campaign:setup-engine            sets the folder up
/halfborg-campaign:setup-brand acme.com    tells it about your brand
/halfborg-campaign:new-campaign acme spring-launch
```

`setup-brand` is a conversation, not a form. Give it your website and it will read it and ask you
about the rest.

## What a campaign run looks like

Four stages, and you have a say at every one.

1. **The plan.** It interviews you about the campaign, then shows you the strategy and the full list
   of what it intends to make. Nothing is written until you say yes.
2. **The message.** The one thing the campaign says, the line it says it in, and two or three
   pictures it could hang on. You pick the line and the picture. Again, nothing is locked until you
   do.
3. **Making things.** Ads, landing pages, emails, blog posts in your own voice, customer stories,
   video scripts and the clips themselves. Everything builds on the picture you chose, so it all
   looks like one campaign.
4. **The check.** It goes back over the lot against your brand rules — the claims you are allowed to
   make, the things you never say, the small print that has to appear — and tells you what needs
   fixing. It reports; it does not quietly edit.

**It never spends your money without asking.** Before any image or video is generated, it stops,
tells you what it is about to make and what it will cost, and shows you exactly what is being sent.
You can always take the prompt and run it yourself instead. No setting turns that off.

**It works with no image-generation key at all.** Without one it hands you the finished prompt to run
wherever you like, and everything else is identical. That is a supported way to use it, not a
crippled one.

## What you end up with

A folder you own, with everything in it as ordinary files:

```
brands/acme/            what it knows about your brand
campaigns/acme-2026-08-01-spring-launch/
  docs/                 the plan, the message, the final check
  content/              the written pieces
  media/                every image and clip, every version kept
  site/index.html       the whole campaign as one page you can open
```

After every single thing it makes, it rebuilds `site/index.html` — the whole campaign on one page,
with what everything cost. Open it in any browser.

## Full detail

The manual, including what to do about video and how the brand file works:
[plugins/halfborg-campaign/README.md](plugins/halfborg-campaign/README.md).

Working on the engine itself: [CONTRIBUTING.md](CONTRIBUTING.md).

## Licence

MIT.
