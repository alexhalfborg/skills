# halfborg-skills — the campaign engine

A brand-agnostic marketing campaign engine for Claude Code. It turns a fuzzy goal into a full set
of campaign deliverables through a fixed, human-gated pipeline, reading everything brand-specific
from a per-brand pack. Swap the pack, get a different brand, same pipeline.

Part of the [halfborg](../../README.md) marketplace.

```
/plugin marketplace add alexhalfborg/skills
/plugin install halfborg-skills@halfborg
```

Works in the Claude Code CLI and in the Claude desktop app's code tab (use its plugin browser if
`/plugin` is unavailable in your environment).

Plugin components are namespaced, so the commands are `/halfborg-skills:setup-engine`,
`/halfborg-skills:setup-brand` and `/halfborg-skills:new-campaign`.

## Quickstart

```
cd ~/my-marketing            # any folder, empty is fine
claude
/halfborg-skills:setup-engine        # scaffolds the workspace, writes engine.yaml + the CLAUDE.md block
/halfborg-skills:setup-brand acme.com   # captures a brand by conversation (or reads its website)
/halfborg-skills:new-campaign acme spring-launch
```

From there the pipeline runs itself, one phase at a time:

| Phase | Skill | Writes | Gated |
|---|---|---|---|
| 1. Brief | `campaign-brief` | `docs/brief.md`, `system/manifest.yaml` | Human |
| 2. Message | `campaign-message` | `docs/message.md` + a locked, text-free key visual | Human |
| 3. Expansion | ads pipeline, `landing-page`, `compose-lockup`, the voice skills… | `content/`, `media/<id>/` | — |
| 4. QA | `campaign-qa` | `docs/qa-report.md` | — |

The first two phases stop for sign-off before they write. Every render — image or video — stops and
shows you the verbatim prompt, the model, the settings and a cost estimate before it spends. Neither
gate can be relaxed by a setting.

After every artifact, a deterministic Node script rebuilds `site/index.html`: the whole campaign as
one navigable page, at no token cost.

## What it creates in your workspace

Nothing exists up front; each command creates what it needs.

```
CLAUDE.md                 the `## Campaign engine` block (written by setup-engine)
engine.yaml               model ids and cost defaults. No secrets, ever.
brands/<id>/
  pack.yaml               all brand facts, schema-validated
  design.md               typeface + colour hexes          (optional)
  voice-profiles.md       the founder/team writing corpus   (optional)
campaigns/<brand>-<YYYY-MM-DD>-<slug>/
  docs/ content/ media/ system/ site/
```

`brands/` and `campaigns/` are yours. The engine is read-only and never writes into itself.

## Prerequisites

There is no build step, no `package.json`, nothing to install. Everything below is optional and
none of it blocks a phase.

| | For | Without it |
|---|---|---|
| **Node** v18+ | rebuilding the campaign page | Every artifact is still written; you just do not get `site/index.html`. |
| **ffmpeg** | verifying a rendered video | You still get the clip; it is reported *unverified*. |
| **fal.ai key** | rendering images and video | `generate-image` / `generate-video` hand back the prompt, model and settings to run by hand at fal.ai, and write nothing. |

### Setting the fal.ai key

Run `/plugin`, open **campaign-engine**, choose configure, and paste a key from
[fal.ai/dashboard/keys](https://fal.ai/dashboard/keys). Then `/reload-plugins`.

The key is stored in secure storage and substituted into the plugin's `.mcp.json` by the harness. No
skill ever reads it, and you should never paste it into a conversation.

**Running without a key is a supported way to use this engine, not a degraded one.** The offline
hand-back is the same block you get when you choose "I'll render it myself" online.

### External skills

The `marketing:*` skills and `xlsx` resolve only where your environment provides them (generally
claude.ai with a subscription). Every one is referenced from a subagent, never from a bundled skill,
so the pipeline never depends on them — when one is absent the agent does that slice of work
directly. Analytics MCPs are not wired: the `analyst` agent works from CSV/XLSX you supply and will
say what is missing rather than fabricate a metric.

## What's inside

**Commands** — `setup-engine`, `setup-brand`, `new-campaign`.

**Skills** — `campaign-engine` (the architecture reference), `campaign-brief`, `campaign-message`,
`campaign-qa`, `campaign-site-builder`, `ad-creative`, `video-ad-script`, `reference-kit`,
`compose-lockup`, `visual-ideas`, `competitor-ads`, `landing-page`, `personal-post`,
`customer-story`, `email-newsletter`, `generate-image`, `generate-video`,
`ai-image-video-prompt-builder`.

**Agents** — `strategist`, `researcher`, `content-writer`, `paid-creative`, `analyst`.

**Schemas** — the brand pack, the manifest, the engine config, the campaign structure contract, and
`preflight.md`, the shared readiness-and-routing contract every skill defers to.

## Design notes

**Engine vs brand pack.** The pipeline never names a brand. If a skill needs a brand fact, it reads
the pack. This is the boundary that makes the engine reusable.

**State lives in files, not the conversation.** Each phase writes a durable artifact the next reads,
so a campaign can be picked up cold in a fresh session.

**One home per deliverable, status in the log.** Every generated file lives in `media/<id>/` under a
versioned name and is never overwritten. Whether something is a candidate, an iteration, the locked
anchor or the shipped final is a status in the append-only generation log, not a folder.

**Out of sequence is a routing problem, not an error.** Run a phase-3 skill in an empty folder and it
names what is missing and points at the phase that produces it. It will not invent a brand fact, a
campaign, or a deliverable id to get unblocked.

Full architecture, contracts and invariants: run the `campaign-engine` skill, or read
[skills/campaign-engine/SKILL.md](skills/campaign-engine/SKILL.md).

## Licence

MIT.
