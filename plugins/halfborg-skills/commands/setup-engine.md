---
description: Prepare the workspace. Reports what is wired, scaffolds the campaign workspace, writes the engine defaults and the project-instructions block, and points at the image-generation key. Nothing here is required — the pipeline runs either way.
---

Turn the current working directory into a campaign workspace, and tell the user plainly where they
stand.

This command **asks, and never enforces**. Nothing in it blocks. There is no failure state: a
workspace with no key is a working workspace. Your job is to report honestly, scaffold what is
missing, offer to fix what is worth fixing, and hand off. Re-running is normal and expected — it is
how the user confirms a key after a restart, and how the brand list in the project-instructions
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
optional, and the pipeline runs without any of it. A key changes **how** media is produced — rendered
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

## 5. Point at the image-generation key

Explain to user that you can also help to render images. This requires an account at fal.ai and an api key. **Never ask the user to type or paste a key into the
chat, and never ask to see its value.** You do not need it and must never hold it: it is a setting on
this plugin, stored in secure storage, and the harness substitutes it into the plugin's `.mcp.json`
`Authorization` header itself. All you ever touch is the `mcp__fal-ai__*` tools.

So there is no file to inspect and no state to detect here. If step 6 shows the tools are not live,
tell the user in plain language how to set it:

> Open `/plugin`, go to the **Installed** tab and select **halfborg-skills**. Claude Code asks for
> the fal.ai key there, the same as it does the first time the plugin is switched on. Paste one from
> <https://fal.ai/dashboard/keys>, then run `/reload-plugins`, or restart.

If they would rather not, that is a finished setup, not an abandoned one. Say so and carry on.

(Only if the user says they are running this engine unpackaged rather than as a plugin: the fallback
is a `FAL_KEY` env var in the gitignored `.claude/settings.local.json`. Mention it in one line if it
comes up, and never read that file.)

## 6. Report where fal stands

The real answer is whether the `mcp__fal-ai__*` tools are live in **this** session. A key set a moment
ago does not take effect until `/reload-plugins` or a restart, which is why this command is worth
re-running.

- **Tools live:** say image and video generation are ready, and that renders cost real money per
  image (video considerably more, and it always asks first).
- **Tools absent:** say what actually changes — `generate-image` and `generate-video` hand back the
  finished prompt and the model to run it with, at <https://fal.ai/models>, and everything else in
  the pipeline is identical. Frame it as a choice. It is the intended offline behaviour, not a defect.

## 7. Hand off

Close with one or two plain sentences: what is wired, and what to do next.

- If `brands/` holds no brand, point at `/halfborg-skills:setup-brand`.
- If it holds brands, list them and point at `/halfborg-skills:new-campaign <id>`.

Do not read file contents back to the user beyond the block you drafted in step 3, and never print
the contents of `.claude/settings.local.json`.
