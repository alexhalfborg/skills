# Integrations — what is optional, and how the engine behaves without it

This engine is **offline-first**. It works fully with no external accounts, no API key, and no
network beyond what the agent already has. Everything below is a dial. None of it gates a phase, and
none of it is an error when absent — the degraded behaviour is the *intended* behaviour, not a
failure, and should be reported that way.

`/halfborg-campaign:setup-engine` does not check any local binary — there is nothing left to check.
`site/index.html` is authored by the `build-site` skill directly, no separate runtime
required. ffmpeg readiness is checked only by `generate-video` itself, when it is actually used.

## Local tooling

| Binary | Used by | Behaviour without it |
|---|---|---|
| **ffmpeg** (`ffprobe`, `ffmpeg`) | `generate-video` step 8, to verify a downloaded clip (duration, resolution, a sample frame) | You still get the clip. Report it **unverified** rather than silently assuming it is good or claiming a check you did not run. |

`generate-video` confirms with `ffprobe -version` rather than assuming. Do not print install
commands for a specific package manager unless the user asks — this engine runs on any OS.

## Image and video generation (the fal MCP)

The plugin declares one MCP server, `fal-ai`, in its own `.mcp.json`, pointed at fal's OAuth relay
(`https://mcp.fal.ai/mcp-relay`). The user signs in once: `/mcp`, choose the `fal-ai` server, sign in
to fal in the browser. Claude Code keeps the token, so **there is no key for any skill to read, ask
for or store**. The relay takes no `Authorization` header; adding one switches OAuth off.

To test whether rendering is available, check for live `mcp__fal-ai__*` tools in the session. Never
test by looking for a file, and never ask the user for a key or credentials in the conversation. If
fal is not connected, point them at `/mcp` or at `/halfborg-campaign:setup-engine`. A fal connector
the user added to claude.ai is a separate connection with its own tool names; the engine uses only
its own `fal-ai` server.

Once connected the server exposes generic tools — `search_models`, `get_model_schema`, `run_model`,
`get_pricing`, `upload_file`, and the async job tools for video (surfaced as `mcp__fal-ai__*`). `generate-image` and
`generate-video` drive them: verify the model schema, gate on explicit human approval with a cost
estimate, run the model, download into `campaigns/<slug>/media/<deliverable-id>/` under the versioned
filename grammar, append a line to the generation log, and report the real path, URL and cost.

**With fal not connected**, both skills hand back the prompt, the model id and the resolved settings to run by
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

Analytics integrations in particular are **not wired**. The `analyst` agent and `write-ad-creative`'s
iteration modes work from data the user supplies (a CSV/XLSX dropped into the campaign folder, or
metrics pasted into chat). If the data is missing, say what is missing and name the export that would
supply it. **Never fabricate metrics.**

## External skills

The `marketing:*` skills and `xlsx` resolve only where the environment provides them (generally
claude.ai with a subscription). Every reference to one sits in an **agent**, never in a bundled
skill, so the pipeline itself never depends on them. When one is absent the agent does that slice of
work directly: it structures the brief itself, researches with plain web search, or parses the
spreadsheet with `Bash`.

Containing those externals is one reason an agent exists here. It is not the only one. An agent is
also how a job gets a context and a tool set of its own: `qa` runs `run-qa` with no image generation
available to it, so the compliance pass cannot spend, and it reads the finished artifacts without
the conversation that produced them. That agent has no external dependency at all.
