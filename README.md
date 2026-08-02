# Marketing skills

Marketing plugins for Claude Code, distributed as a marketplace.

```
/plugin marketplace add alexhalfborg/marketing-skills
```

Adding the marketplace installs nothing — it just lets you browse. Install the plugins you want.

## Plugins

### [campaign-engine](plugins/campaign-engine/) — `/plugin install campaign-engine@marketing-skills`

A brand-agnostic marketing campaign engine. It turns a fuzzy goal into a full set of campaign
deliverables through a fixed, human-gated pipeline, reading everything brand-specific from a
per-brand pack. Swap the pack, get a different brand, same pipeline.

Point it at any folder — empty is fine, it scaffolds the workspace itself.

```
cd ~/my-marketing
claude
/campaign-engine:setup-engine            # scaffolds the workspace
/campaign-engine:setup-brand acme.com    # captures a brand by conversation
/campaign-engine:new-campaign acme spring-launch
```

Brief → Message → Expansion → QA, with human sign-off before the first two write anything, and a
cost-estimate gate before any image or video render. 18 skills, 5 agents, and a deterministic Node
builder that keeps the whole campaign browsable as one page.

Full detail: [plugins/campaign-engine/README.md](plugins/campaign-engine/README.md).

## Repo layout

```
.claude-plugin/marketplace.json   the catalogue
plugins/
  campaign-engine/                one plugin, self-contained
    .claude-plugin/plugin.json
    commands/ skills/ agents/ schema/ templates/ .mcp.json
```

Each plugin is self-contained under `plugins/`, so adding another is a folder plus one entry in
`marketplace.json`. Nothing at the repo root is loaded by Claude Code except the catalogue.

Everything an installed plugin references internally goes through `${CLAUDE_PLUGIN_ROOT}`, so a
plugin never depends on where it was installed, and never writes into itself. The files it creates —
`brands/`, `campaigns/`, `engine.yaml` — belong to your working directory, not to the plugin.

## Working on these plugins

Install from the local checkout rather than GitHub, so you test the code in front of you:

```
/plugin marketplace add ./                        # from this repo's root
/plugin install campaign-engine@marketing-skills
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
