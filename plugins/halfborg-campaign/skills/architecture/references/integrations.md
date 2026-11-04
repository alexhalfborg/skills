# Integrations — what is optional, and how the engine behaves without it

This engine is **offline-first**. It works fully with no external accounts, no API key, and no
network beyond what the agent already has. Everything below is a dial. None of it gates a phase, and
none of it is an error when absent — the degraded behaviour is the *intended* behaviour, not a
failure, and should be reported that way.

`/halfborg-campaign:setup-engine` does not check any local binary — there is nothing left to check.
`site/index.html` is authored by the `build-site` skill directly, no separate runtime
required. ffmpeg readiness is checked by each skill that uses it, at the moment it is actually used.

## Local tooling

| Binary | Used by | Behaviour without it |
|---|---|---|
| **ffmpeg** (`ffprobe`, `ffmpeg`) | `generate-video` step 8, to verify a downloaded clip (duration, resolution, a sample frame) | You still get the clip. Report it **unverified** rather than silently assuming it is good or claiming a check you did not run. |
| **ffmpeg** (`ffprobe`, `ffmpeg`) | `write-hook`, to sample frames from a video file it is asked to title | It asks for a script, transcript or one-line summary instead. It never sends audio anywhere to be transcribed. |
| **ffmpeg** (`ffprobe`, `ffmpeg`) | `edit-talking-head`, to find the pauses in a take, check downloads and check the finished short | It stops before planning and says why: without it there is no way to find the pauses. |
| **ffmpeg** (`ffprobe`, `ffmpeg`) | `write-instagram-post`, to make the JPEG copies Instagram accepts and check their size and shape; `publish-social`, to re-check them | The draft and its pictures are still made, but the post cannot go out until the JPEG copies exist. It says so rather than converting any other way. |
| **Node 22+ with HyperFrames** (`npx -y hyperframes@0.9.6`) | `edit-talking-head`, to transcribe the take (Parakeet, local) and render the short | It still plans and fetches the cutaways, then hands back the cut list as timestamps and the clips, to assemble in any editor. Nothing is rendered. |

Each of them confirms with `ffprobe -version` (or, for HyperFrames, its own `doctor`) rather than
assuming. Do not print install commands for a specific package manager unless the user asks — this
engine runs on any OS.

**HyperFrames, the dependency the repo does not have.** This repo still ships no executable code
and no Node dependency. HyperFrames is fetched by `npx` on the user's machine at run time, pinned to
one version, and `edit-talking-head` writes the HTML it renders. Two of its defaults are switched off
on purpose: `init` runs with `--skip-skills`, so it does not install HeyGen's skills into the user's
tools, and the `CLAUDE.md`/`AGENTS.md` it scaffolds are deleted so they never load into a campaign
session. HyperFrames can also call HeyGen's cloud and bill the user's HeyGen account (a cloud speech
engine, cloud rendering, publishing). The skill uses none of that: transcription and rendering are
local and free. Its speech model, Parakeet, is a one-time download the skill asks about before
installing. whisper.cpp also works where it is already installed, but on Windows it must be compiled
from source, so it is never the route the skill offers.

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

## Stock footage and photos (the Pixabay and Pexels MCPs)

The plugin's `.mcp.json` also declares two stdio servers that search free stock video and photos,
both unofficial, MIT, and from the same author:

| Server | Package | Setting → env var | Tools the engine uses |
|---|---|---|---|
| `pixabay` | `npx -y @hanoak/pixabay-mcp-server@1.0.1` | `pixabay_key` → `PIXABAY_API_KEY` | `pixabay_search_videos`, `pixabay_get_video`, `pixabay_search_images`, `pixabay_get_image` |
| `pexels` | `npx -y @hanoak/pexels-mcp-server@1.0.2` | `pexels_key` → `PEXELS_API_KEY` | `pexels_search_videos`, `pexels_get_video`, `pexels_search_photos`, `pexels_get_photo` |

The photo tools feed one fallback: a b-roll beat with too few usable clips gets a stock still,
animated with a slow zoom. A standard Pixabay key returns photos only up to 1280px on the long side
(`largeImageURL`; the full-size `imageURL` needs Pixabay's separate full-access approval), so a
Pixabay still is shown framed over a blurred copy of itself rather than enlarged to fill the frame.
Pexels' `src.original` is full size.

The harness substitutes each setting into its server's environment, so **no skill ever reads a
key**. fal is a sign-in; the stock libraries and Instagram and Threads posting (below) are plugin settings,
because none of them has a sign-in the engine can use. Test for the live search tools, never for a
key.

**Pixabay is the one to recommend.** Its key is free and immediate: log in at
<https://pixabay.com/api/docs/> and the key is shown on the page. Pexels stopped issuing new API keys
in late 2026 (around 30 September); existing keys still work, so the server stays for anyone who has
one. Never send a new user to sign up for Pexels.

With no key set, a server refuses to start, so its tools simply do not appear (and `/mcp` lists it
as failed). That is the intended offline state, not a fault, and nothing else is affected because
each is a separate server. `edit-talking-head` is the only skill that uses them. With one live it
uses that one; with both, it searches Pexels first and tops up thin beats from Pixabay. With neither,
it plans the cutaways anyway and gives each one a search link to pick by hand.

The servers return links, never files. `edit-talking-head` downloads the clip itself, logs it with
`"source":"pixabay"` or `"pexels"`, the library's page as `source_url` and the creator as `credit`,
and never uses a clip whose creator it cannot name. Both are free (Pixabay: 100 requests a minute;
Pexels: 200 an hour, 20,000 a month), so there is no cost gate. There is still an approval stop
before anything is fetched, because choosing footage is a creative call.

## Instagram and Threads posting (the meta MCP)

The plugin's `.mcp.json` declares a third stdio server, unofficial and MIT, for organic posting:

| Server | Package | Settings → env vars | Tools the engine uses |
|---|---|---|---|
| `meta` | `npx -y @mikusnuz/meta-mcp@2.2.2` | `instagram_access_token` → `INSTAGRAM_ACCESS_TOKEN`, `instagram_user_id` → `INSTAGRAM_USER_ID`, `threads_access_token` → `THREADS_ACCESS_TOKEN`, `threads_user_id` → `THREADS_USER_ID` | Instagram: `ig_get_profile`, `ig_publish_photo`, `ig_publish_carousel`, `ig_get_media`, `ig_get_media_list`. Threads: `threads_get_profile`, `threads_publish_text`, `threads_publish_image`, `threads_publish_carousel`, `threads_get_post`, `threads_get_posts` |

`publish-social` is the only skill that uses it, and only those eleven tools. The server exposes many
more (deleting posts and replies, comments, direct messages, insights, searches, and token tools that take the
token as an argument). None of them is called: they are outside the job, and the token tools would
put the brand's access token into the conversation. No agent lists any `meta` tool, so posting only
happens in the main conversation, where the person answers the per-post gate.

**It is a token, not a sign-in.** Meta's official MCP servers cover ads, app management and WhatsApp,
not organic posting, so the official "Meta ads" connector some users have in claude.ai cannot post
and is never used. The token comes from the user's own Meta developer app, lasts about 60 days, and
is entered under `/plugin` → **Installed** → **Halfborg Campaign Engine** with the account number.
Instagram and Threads have separate tokens and account numbers; either can be set up alone. The
Threads publishing tools can also cross-share a post to Instagram Stories; `publish-social` never
sets that, because it would be a second post nobody approved.
`skills/publish-social/references/meta-setup.md` is the plain walkthrough, including renewal. The
server never refreshes the token itself here; the person renews it and pastes the new one into the
settings.

**Test with a read, not for tools.** The server reads empty settings as empty strings and starts
anyway, so its tools appear even when nothing is set up. The test is one `ig_get_profile` (or, for
Threads, `threads_get_profile`) call: a
username back means connected; an access-token error means not set up or expired.

**It also needs fal.** Meta fetches every picture from a public HTTPS address and takes no local
file, so `publish-social` uploads each picture with fal's free `upload_file` (a prepared upload, a PUT
of the bytes, then `verify_upload`) and passes that address. Nothing on fal is spent. Without fal
connected there is no address to give, so a post with pictures falls back to the by-hand block too.
A Threads text-only post has no pictures and needs no fal.

**Without it** (or with an expired token), `publish-social` posts nothing and hands back the
account, the caption verbatim, the pictures in order with their alt text and the AI-label setting,
to post from the app; nothing is logged. `write-instagram-post` and `write-threads-post` are unaffected either way:
drafting needs no connection.

The pin moves only by a deliberate edit, after a real post from a test account in a scratch
workspace. The server is young and has one maintainer, so read what a new version changes in the eleven
tools above before moving it. Its Instagram carousel tool caps a post at 10 pictures although the API allows 20;
`schema/social-platforms.md` records 10 as the working limit for that reason.

## Connector plugins

If the environment already exposes connectors (Notion, Ahrefs, SimilarWeb, Klaviyo, Supermetrics,
HubSpot, Canva), they need authentication only — there is nothing for this engine to declare. **No
skill here requires one.** They are conveniences for research at the edges of the pipeline.
Publishing goes through the engine's own `meta` server above, never a connector.

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
