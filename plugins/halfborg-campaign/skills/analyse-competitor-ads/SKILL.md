---
name: analyse-competitor-ads
description: >-
  Distil competitors' paid-social ads into a campaign research artifact that informs creative direction. Manual-only and fully offline: it reads competitor ad material the user supplies (Meta Ad Library screenshots or exports, pasted ad copy, links, run-dates) and synthesises it — it does not fetch, scrape, or call any service itself. Use whenever the user wants to learn from competitors' running ads before building creative: "what are competitors running", "analyse these competitor ads", "competitor ad research", "what ad angles win in our category", "look at these Facebook ads and pull the patterns", "build a swipe-file analysis". Reads the active brand from campaign.brand in campaigns/<slug>/system/manifest.yaml, brands/<id>/pack.yaml (positioning, competitors, audience), and the competitor material the user provides; writes campaigns/<slug>/research/analyse-competitor-ads.md with (1) a traceable evidence table of the supplied ads and (2) distilled category layout / archetype priors in compose-lockup's archetype vocabulary, so compose-lockup's Layer-2 art direction can read and be biased by them. Labels "winning" / "top" as INFERRED from ad longevity and active-variant count — never as measured spend, impressions, or ROAS, which are structurally not obtainable for a competitor's commercial ads. Do NOT use to invent competitor ads or fabricate performance data (it only distils supplied material); to write the campaign brief (that is write-brief) or final ad copy (that is write-ad-creative); or for positioning / SEO competitor analysis (that is the researcher's marketing:competitive-brief / marketing:seo-audit).
---

# Competitor ads — distil supplied competitor creative into priors

Turn a pile of competitors' paid-social ads that the user has gathered into a tight research artifact:
a traceable record of what those competitors are running, an **inferred** read of which ads are
probably working, and — the point of the exercise — a distilled set of **layout / archetype priors**
that `compose-lockup` reads to bias its art direction. It is the write-ad-creative counterpart to the
`researcher` agent's positioning work (`marketing:competitive-brief`): that studies what competitors
*say*; this studies what their ads *look like and how they are built*.

**Manual-only, fully offline.** This skill fetches nothing. It works entirely from material the user
supplies — Ad Library screenshots or exports, pasted ad copy, links, and run-dates. There is no Ad
Library MCP wired in this workspace, and the official Meta Ad Library API cannot see most commercial
ads anyway (see `references/method.md`). If an automated backend is added later it will drop in behind
this same artifact without changing what `compose-lockup` reads.

Where it sits:

- Upstream of creative. Run it during or after the brief, before `compose-lockup` / `write-ad-creative`
  produce statics, so the priors exist when Layer 2 looks for them. The `researcher` agent invokes it;
  it can also be run directly.
- Read-only on the brand. Competitors come from `pack.competitors` or the invocation — never
  hardcoded. Brand facts are read, not asked.

Campaign paths follow `${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md`.

## The one thing to be honest about

You can know what a competitor's ad **looks like and says** and **how long it has been running** and
**how many variants are live**. You cannot know its **spend, impressions, CTR, or ROAS** — none of
that is obtainable for anyone but the advertiser who owns the account. So:

- **"Winning" is always an inference,** drawn from ad **longevity** (an ad still live weeks later
  probably survived the performance cull) and **active-variant count** (many live variants signals
  confident, scaled testing). Label it that way every time. Never present a longevity/variant read as
  measured performance, and never quote a "spend estimate" as if it were real.
- **Never invent an ad, an advertiser, a run-date, or a variant count.** Every row in the artifact
  traces to something the user actually supplied. If the material is thin, the artifact is short and
  says so — a short honest read beats a padded fabricated one. This is the same rule as the engine's
  "never fabricate a generated-image link".

`references/method.md` holds the winner-inference heuristic in full and the ToS / copyright / privacy
caveats to honour.

## 1. Read first

Resolve the brand per `${CLAUDE_PLUGIN_ROOT}/schema/preflight.md` before anything else. This skill can
run outside a campaign, so the manifest is optional — but the pack is not, because the priors are
distilled *against* a positioning. If `brands/<id>/pack.yaml` is missing or fails the skeleton check,
stop and route to `/halfborg-campaign:setup-brand`; never infer a category or a competitor set. If no
campaign exists to write into, say so and offer to write the artifact once one does, rather than
inventing a slug.

1. **Which brand.** `campaign.brand` in `campaigns/<slug>/system/manifest.yaml`
   (`${CLAUDE_PLUGIN_ROOT}/schema/campaign-structure.md` section 1.1); outside a campaign the invocation names it.
2. **`brands/<id>/pack.yaml`** — `positioning`, `competitors` (who to look at, if the user did not
   name them), `audience`, and the `ads` block if present (the funnel vocabulary, the angle bank).
3. **`campaigns/<slug>/docs/brief.md`** if it exists — the objective and audience the priors should
   serve.

## 2. Take in the supplied material

The user hands you the competitor ads, in whatever form they have:

- **Screenshots / exports** — `Read` them (native vision, the same way `compose-lockup` reads a key
  visual). Extract the visible creative: layout, where the headline sits, the hook/claim wording, the
  CTA, the format/ratio, and any Ad Library metadata shown (advertiser, "Active", start date, number
  of ads/variants).
- **Links** — an Ad Library URL, a page, a post. Record it as the source; do not claim to have fetched
  a page you cannot see. If a link is all you were given and no creative was described, ask for a
  screenshot rather than guessing what the ad shows.
- **Pasted copy / notes** — take the advertiser, dates, variant counts, and copy the user pasted at
  face value, attributed to them.

If the user drops screenshots into the campaign, keep them under `campaigns/<slug>/research/` (an
`_competitor-*.png` name marks them as unlogged inputs the site builder ignores) and reference them by
filename. If **no** material has been supplied, do not proceed on imagination — ask for the ads
(screenshots or Ad Library links) and write nothing.

## 3. Infer the likely winners

Apply the heuristic in `references/method.md`: rank the supplied ads by longevity and active-variant
count, and surface the few that read as probable performers. State the inference and the evidence for
each ("running 60+ days with 8 live variants → likely a scaled winner"), and label anything you are
unsure of. This is a directional read for creative, not a performance report.

## 4. Distil the priors — in compose-lockup's vocabulary

This is the payload `compose-lockup` consumes. From the ads (weighted toward the inferred winners),
distil the **category's recurring creative conventions for statics**, expressed in the archetype
language of `compose-lockup`'s `references/art-direction.md` §B so its Layer 2 can map them directly:

- **Dominant static archetypes** — name them in that vocabulary: *type in clean space*,
  *lower-third scrim*, *corner overlay*, *legibility gradient*. Which does the category lean on?
- **Headline patterns** — length, benefit vs question vs social-proof hooks, tone.
- **Colour / contrast tendencies** — light-on-dark, bold flat colour, photographic.
- **Whitespace in the market** — conventions everyone repeats (so we can match or deliberately break),
  and gaps nobody is using (an opening).

Keep it a short, opinionated set of priors, not a transcript. `compose-lockup` treats them as a soft
bias; the campaign's locked composition and message still win.

## 5. Write the artifact and report

Write `campaigns/<slug>/research/analyse-competitor-ads.md` (a `research/` working file — permitted by
`campaign-structure.md` section 1, ignored by the site builder, so no log line and no schema change).
Shape:

```
# Competitor ad research — <brand> / <category>

- Sources: user-supplied (screenshots / links / exports), compiled <date>
- Scope: <competitors covered>, <n> ads seen
- Winner signal: INFERRED from ad longevity + active-variant count — no competitor spend/ROAS exists

## Evidence
| Advertiser | Seen / run dates | Live variants | Format | Angle / hook | Source |
|---|---|---|---|---|---|
| ... | ... | ... | ... | ... | <link or _competitor-*.png> |

## Inferred winners
- <ad> — <why it reads as a likely performer: longevity + variants>. (Inference, not measured.)

## Distilled priors (for compose-lockup Layer 2)
- Dominant archetypes: <in the art-direction.md vocabulary>
- Headline patterns: <...>
- Colour / contrast: <...>
- Market whitespace: <conventions to match/break; gaps to exploit>

## Caveats
- "Winning" is inferred from longevity + variants, not spend/ROAS.
- Creative is referenced for analysis, not reproduced as our own.
- No competitor personal data retained.
```

Then report per `${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md` section 5: how many ads you went
through, the two or three patterns worth acting on, and **one path** — the write-up, in full. Say in
a clause that "winning" here means an ad that has run a long time with many variants, not one you
have spend figures for.

**End on a next action** per section 6: the headline patterns feed straight into the campaign's
statics from here on, so offer to put one to work.

## House rules

- **Distil, never fabricate.** Every ad, date, and variant count traces to supplied material. No
  invented advertisers, ads, or numbers. Thin input → short honest artifact.
- **"Winning" is inferred, always labelled.** Longevity + variant count, never presented as measured
  spend, impressions, or ROAS.
- **Manual-only.** Fetch nothing; work from what the user provides. No material supplied → ask, do not
  imagine.
- **Reference, do not reproduce.** Competitors' creative is studied and cited (link / screenshot
  filename), never republished as the brand's own — it carries their copyright. Retain no personal
  data from the ads. (`references/method.md` has the fuller caveat.)
- **Priors in the shared vocabulary.** Name archetypes as `compose-lockup`'s `references/art-direction.md`
  §B names them, so the read-hook consumes them without translation.
- **Brand facts are read, not asked.** Competitors and audience come from the pack or the invocation.
- **Speak plainly.** Everything you say out loud follows `${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md`: engine words belong in the files, not in the conversation. "Headline priors" and "archetype vocabulary" are art-direction shorthand — say what the patterns are instead.
- British spelling, no em dashes in the artifact copy.
