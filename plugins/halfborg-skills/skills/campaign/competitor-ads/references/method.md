# Method — the winner heuristic and the caveats to honour

`competitor-ads` reads this before it ranks or writes. The SKILL.md owns the workflow; this file owns
two things it must get right: **how to infer a "winner" honestly**, and **what is and is not
obtainable** so the artifact never overclaims.

## What is knowable about a competitor's ad

For anyone who is not the advertiser, only the **public, observable** surface of an ad exists:

| Knowable (public) | Not knowable (advertiser-only) |
|---|---|
| The creative — image/video, layout, headline, CTA | Spend / budget |
| The ad copy and hook | Impressions, reach (except an EU-only reach number) |
| Which platforms it runs on | CTR, conversions, ROAS |
| When it started, whether it is still active | Audience targeting, bid strategy |
| How many variants are live for a page | Any true performance metric |

There is **no legitimate source of real spend or ROAS for a competitor's commercial ads.** Tools that
show competitor "spend" are showing a modelled estimate. The official Meta Ad Library API is worse
than useless here: it returns only political / social-issue ads plus a thin EU-only slice of
commercial ads, and no commercial performance data at all — a purely commercial advertiser returns
empty. The rich commercial data lives in the Ad Library **web UI**, which is why this skill runs on
what the user captures from it.

## The winner-inference heuristic

Since performance is invisible, a "winner" is **inferred** from the two public signals that correlate
with an ad being kept alive because it works:

1. **Longevity.** Advertisers cull ads that stop performing. An ad still live **weeks** after it
   started (a common rule of thumb is 30-45+ days) has, by inference, survived that cull — it is
   probably profitable. A brand-new ad tells you nothing yet; a long-running one is the strongest
   single public signal.
2. **Active-variant count.** Many live variants for one concept signals an advertiser **scaling** it —
   they are spending to test into a proven angle. A concept running in 10+ variants is a louder
   "this works" than a lone ad.

Secondary, weaker signals: the same concept reappearing across flights, or obvious production
investment (custom shoots, polished UGC) that implies a budget worth protecting.

**Rank by longevity first, variant count second.** Surface the few ads that score high on both, and
for each state the inference and its evidence in plain terms ("live ~60 days, 8 variants → likely a
scaled winner"). Always the word **inferred**, never "top-performing" as if measured. When the
supplied material lacks dates or variant counts, say the winner read is **weak / unavailable** rather
than inventing a ranking.

## ToS, copyright, and privacy — honour these

Brief, and not legal advice — flag them in the artifact's Caveats:

- **Studying vs reproducing.** Competitor creative may be **referenced and analysed** (cite the link
  or screenshot filename), but never **republished as the brand's own** — the creative carries the
  competitor's copyright. The output is priors and patterns, not their assets.
- **No personal data retained.** Ads can contain names, faces, and testimonials. Do not copy personal
  data into the artifact; describe patterns, not individuals.
- **Collection is the user's.** This skill does not scrape; it distils what the user gathered.
  Public, logged-out Ad Library viewing is what most capture tooling relies on, and is generally
  considered lower-risk than logged-in scraping — but any third-party capture tool the user chose
  carries its own terms, which are theirs to observe.

## If an automated backend is added later

The artifact contract (`research/competitor-ads.md`, the evidence table + inferred winners + distilled
priors in `compose-lockup`'s archetype vocabulary) is the stable interface. An automated fetch tier —
e.g. a ScrapeCreators-backed Ad Library MCP declared in `.mcp.json`, its key in the gitignored
`.claude/settings.local.json` and its presence tested by `Grep`ping the key name (the `fal-ai`
pattern) — would replace **step 2's manual ingest only**, still produce this same artifact, and still
label winners as inferred. Nothing downstream (`compose-lockup`) changes. Until then, manual is the
supported path, not a degraded one.
