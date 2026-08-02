# Integrations — what is optional, and how the engine behaves without it

This engine is **offline-first**. It works fully with no external accounts, no API key, and no
network beyond what the agent already has. Everything below is a dial. None of it gates a phase, and
none of it is an error when absent — the degraded behaviour is the *intended* behaviour, not a
failure, and should be reported that way.

`/campaign-engine:setup-engine` reports on all three.

## Local tooling

| Binary | Used by | Behaviour without it |
|---|---|---|
| **Node** (v18+) | `campaign-site-builder`, which shells out to `build-site.mjs` after every artifact | Every phase still runs and every artifact is still written. You just do not get the browsable `site/index.html`. Say so once; do not retry, and do not hand-write the page. |
| **ffmpeg** (`ffprobe`, `ffmpeg`) | `generate-video` step 8, to verify a downloaded clip (duration, resolution, a sample frame) | You still get the clip. Report it **unverified** rather than silently assuming it is good or claiming a check you did not run. |

Confirm with `node --version` and `ffprobe -version` rather than assuming. Do not print install
commands for a specific package manager unless the user asks — this engine runs on any OS.

## Image and video generation (the fal MCP)

The plugin declares one MCP server, `fal-ai`, in its own `.mcp.json`, authenticated with the
plugin's `fal_key` user setting. The harness substitutes that value into the `Authorization` header,
so **no skill ever reads the key and no skill ever needs its value**.

To test whether rendering is available, check for live `mcp__fal-ai__*` tools in the session. Never
test by looking for a file, and never ask the user to paste a key into the conversation. If it is
not configured, point them at `/plugin` → **campaign-engine** → configure, or at
`/campaign-engine:setup-engine`.

Once connected the server exposes generic tools — `search_models`, `get_model_schema`, `run_model`,
`get_pricing`, and the async job tools for video (surfaced as `mcp__fal-ai__*`). `generate-image` and
`generate-video` drive them: verify the model schema, gate on explicit human approval with a cost
estimate, run the model, download into `campaigns/<slug>/media/<deliverable-id>/` under the versioned
filename grammar, append a line to the generation log, and report the real path, URL and cost.

**Without a key**, both skills hand back the prompt, the model id and the resolved settings to run by
hand at <https://fal.ai/models>, and write nothing — no file, no log line, no invented URL or cost.

> **Never invent a generated-media URL, path, or cost.** This is the same rule as the render gate,
> seen from the offline side.

**Cost.** `generate-image` spends real money per render. `generate-video` spends considerably more.
Both gate unconditionally on explicit approval with an estimate before spending; no setting relaxes
that.

## Connector plugins

If the environment already exposes connectors (Notion, Ahrefs, SimilarWeb, Klaviyo, Supermetrics,
HubSpot, Canva), they need authentication only — there is nothing for this engine to declare. **No
skill here requires one.** They are conveniences for research and publishing at the edges of the
pipeline.

Analytics integrations in particular are **not wired**. The `analyst` agent and `ad-creative`'s
iteration modes work from data the user supplies (a CSV/XLSX dropped into the campaign folder, or
metrics pasted into chat). If the data is missing, say what is missing and name the export that would
supply it. **Never fabricate metrics.**

## External skills

The `marketing:*` skills and `xlsx` resolve only where the environment provides them (generally
claude.ai with a subscription). Every one is referenced from a **subagent**, never from a bundled
skill, so the pipeline itself never depends on them. When one is absent the agent does that slice of
work directly: it structures the brief itself, reviews against the pack's voice and mandatories
directly, researches with plain web search, or parses the spreadsheet with `Bash`.
