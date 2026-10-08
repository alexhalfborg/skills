---
description: Prepare the workspace. Reports what is wired, scaffolds the campaign workspace, writes the engine defaults and the project-instructions block, and says how to connect fal for image generation. Nothing here is required — the pipeline runs either way.
---

Turn the current working directory into a campaign workspace, and tell the user plainly where they
stand.

This command **asks, and never enforces**. Nothing in it blocks. There is no failure state: a
workspace without fal connected is a working workspace. Your job is to report honestly, scaffold what is
missing, offer to fix what is worth fixing, and hand off. Re-running is normal and expected — it is
how the user confirms fal is connected after signing in, and how the brand list in the project-instructions
block gets refreshed — so **every step must be safe to repeat**.

This is very often the first thing a user ever runs, and they are a marketer, not a developer.
Everything you say follows `${CLAUDE_PLUGIN_ROOT}/schema/plain-language.md`: engine words belong in
the files, not in the conversation. Name a tool only when its absence changes what they can do, and
then say what it changes rather than what it is.

## 1. Say hello, then explore

Before touching anything, say in one or two plain sentences what you are about to do — most people
running this have never seen it before:

> Let's get this folder set up for your campaigns. I'll check what's already here, tell you what's
> optional as I go, and get you ready to start.

Then look before you write. Read the current state of the working directory: is there an
`engine.yaml`? a `brands/` with anything in it? a `campaigns/`? a `CLAUDE.md` or an `AGENTS.md`, and
does either already carry a `## Campaign engine` block? a `.gitignore`? Is this a git repo at all?

Then say the thing that stops the rest of this reading as a list of problems: everything here is
optional, and the pipeline runs without any of it. Connecting fal changes **how** media is produced — rendered
here, or handed back as a prompt to run at fal.ai — not **whether** the campaign can run. Keep it to
a sentence.

## 2. Scaffold the workspace

Create what is absent; touch nothing that already exists.

- `brands/` and `campaigns/` — create if absent. Empty is fine; the phases fill them.
- `engine.yaml` — if absent, copy `${CLAUDE_PLUGIN_ROOT}/templates/engine.yaml` to the working
  directory root and mention in half a sentence that you did. If present, validate the parsed file
  against `${CLAUDE_PLUGIN_ROOT}/schema/engine.schema.json`. If it fails, fix it silently. **Never
  show the user a validation error.** If it is beyond repair, say the defaults are being used and
  move on — the skills all fall back on their own.

## 3. Write the project-instructions block

This is the one genuinely intrusive thing this command does, because it edits a file the user owns.
Draft it, show it, let them change it, then write.

The block is the engine's always-in-context signal: it loads on every turn, so a skill can tell from
its presence alone that the workspace is set up, and read the layout and the brand list without a
tool call. That is why it carries facts and not just routing.

**Compose it** from `${CLAUDE_PLUGIN_ROOT}/templates/claude-md-block.md`. Fill every bracketed part
from what you found in step 1 — in particular, generate the `### Brands` list from what is actually
under `brands/`, one line each, naming whether the brand has an `ads` block and which voice skills it
uses. Never leave a placeholder in the written output. Keep the whole block under about 30 lines.

**Pick the file to edit:**

- If `CLAUDE.md` exists, edit it.
- Else if `AGENTS.md` exists, edit it.
- If neither exists, **ask the user which to create — do not pick for them.**

Never create `AGENTS.md` when `CLAUDE.md` already exists, or the reverse. Always edit the one that is
already there.

**Write it:**

- If a `## Campaign engine` block already exists in the chosen file, update its contents **in place**
  rather than appending a duplicate.
- Never touch the surrounding sections. Everything outside the block must come out byte-identical.

## 4. Guard the .gitignore

If the working directory is a git repo, make sure `.gitignore` covers the two things that should
never be committed:

```
campaigns/*/site/
.claude/settings.local.json
```

**Append only.** If the file exists, add whichever lines are missing under a short comment; never
rewrite or reorder what is there. If it does not exist, create it with just these lines. If this is
not a git repo, skip the step silently — it is not worth a sentence.

## 5. Point at fal sign-in

Explain to the user that you can also render images and video here. That needs a fal.ai account, and
nothing else: the plugin connects to fal's own server, which the user signs in to once in the
browser. There is no API key to create or paste. **Never ask the user to type or paste a key, a
password or any credential into the chat.** All you ever touch is the `mcp__fal-ai__*` tools.

So there is no file to inspect and no state to detect here. If step 6 shows the tools are not live,
tell the user in plain language how to connect it:

> Type `/mcp`, choose **fal-ai** (listed under the Halfborg Campaign Engine plugin), and pick
> **Authenticate**. A browser window opens; sign in to fal.ai (or create an account) and approve.
> Come back here and it is connected.

If they already connected fal to claude.ai as a connector, say in one line that the engine uses its
own connection, so it needs this sign-in too; it is the same fal account and costs nothing extra.

If they would rather not, that is a finished setup, not an abandoned one. Say so and carry on.

## 6. Report where fal stands

The real answer is whether the `mcp__fal-ai__*` tools are live in **this** session. A sign-in
through `/mcp` takes effect straight away; if the tools still are not there, re-running this command
is the way to check again.

- **Tools live:** say image and video generation are ready, and that renders cost real money per
  image (video considerably more, and it always asks first).
- **Tools absent:** say what actually changes — `generate-image` and `generate-video` hand back the
  finished prompt and the model to run it with, at <https://fal.ai/models>, and everything else in
  the pipeline is identical. Frame it as a choice. It is the intended offline behaviour, not a defect.

## 7. Hand off

Close with one or two plain sentences: what is wired, and what to do next.

- If `brands/` holds no brand, point at `/halfborg-campaign:setup-brand`.
- If it holds brands, list them and point at `/halfborg-campaign:new-campaign <id>`.

Do not read file contents back to the user beyond the block you drafted in step 3, and never print
the contents of `.claude/settings.local.json`.
