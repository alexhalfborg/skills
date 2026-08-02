# Halfborg skills

Skills for Claude Code, distributed as a marketplace.

```
/plugin marketplace add alexhalfborg/skills
```

Adding the marketplace installs nothing — it just lets you browse. Install the plugins you want.

## Plugins

### [halfborg-skills](plugins/halfborg-skills/) — `/plugin install halfborg-skills@halfborg`

**The campaign engine.** A brand-agnostic marketing campaign engine. It turns a fuzzy goal into a full set of campaign
deliverables through a fixed, human-gated pipeline, reading everything brand-specific from a
per-brand pack. Swap the pack, get a different brand, same pipeline.

Point it at any folder — empty is fine, it scaffolds the workspace itself.

```
cd ~/my-marketing
claude
/halfborg-skills:setup-engine            # scaffolds the workspace
/halfborg-skills:setup-brand acme.com    # captures a brand by conversation
/halfborg-skills:new-campaign acme spring-launch
```

Brief → Message → Expansion → QA, with human sign-off before the first two write anything, and a
cost-estimate gate before any image or video render. 18 skills, 5 agents, and a deterministic Node
builder that keeps the whole campaign browsable as one page.

Full detail: [plugins/halfborg-skills/README.md](plugins/halfborg-skills/README.md).

## Repo layout

```
.claude-plugin/marketplace.json   the catalogue
plugins/
  halfborg-skills/                one plugin, self-contained
    .claude-plugin/plugin.json
    skills/campaign/<18 skills>/  grouped by domain
    commands/ agents/ schema/ templates/ .mcp.json
```

Skills are grouped by domain under `skills/`, so a new area of work is a new category folder
alongside `campaign/`. Because they sit a level deeper than the default scan, each one is listed
explicitly in `plugin.json`'s `skills` array — add a skill, add its path.

A second *plugin* is only worth it for something with a very different always-on context cost that
you would want installable on its own; that is a folder under `plugins/` plus one entry in
`marketplace.json`. Ordinary new work belongs inside `halfborg-skills`. Nothing at the repo root is
loaded by Claude Code except the catalogue.

Everything an installed plugin references internally goes through `${CLAUDE_PLUGIN_ROOT}`, so a
plugin never depends on where it was installed, and never writes into itself. The files it creates —
`brands/`, `campaigns/`, `engine.yaml` — belong to your working directory, not to the plugin.

## Working on these plugins

Install from the local checkout rather than GitHub, so you test the code in front of you:

```
/plugin marketplace add ./                        # from this repo's root
/plugin install halfborg-skills@halfborg
```

Validate before pushing:

```
claude plugin validate ./
```

`SKILL.md` edits take effect immediately. Changes to `agents/`, `.mcp.json`, or `plugin.json` need
`/reload-plugins` or a restart. Note that `${CLAUDE_PLUGIN_ROOT}` only resolves for an *installed*
plugin, so reading these files as plain repo files will show the raw placeholder — that is expected.

## Licence

MIT.
