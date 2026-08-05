# Changelog

## 0.2.0

Everything below landed after 0.1.0 was published and reached nobody, because a pinned `version` in
`plugin.json` is the cache key Claude Code uses to decide whether an update exists. Bumping the field
is what ships a release; pushing commits is not.

### How it talks

- New `schema/plain-language.md`, referenced by all 18 skills, the 3 commands and the 5 agents the
  way `preflight.md` is. Every gate and report-back used to be specified as a list of field names, so
  the engine's vocabulary leaked into the conversation. The rule is two columns: file vocabulary
  stays exact because other skills parse it, and chat gets none of it. A short list of strings — the
  verbatim render prompt, the model id, the money, a path you can open — is never softened.
- `/halfborg-skills:setup-engine` opens with a plain welcome before any tool call, instead of a
  silent toolchain probe, and the onboarding text it ends on is a good deal shorter.

### No runtime dependencies

- `campaign-site-builder` reads a campaign's own files and writes `site/index.html` directly rather
  than shelling out to a build script, so Node is no longer needed to preview a campaign. The page is
  one continuous scroll instead of tabs. The ffmpeg check moved into `generate-video`, where it is
  made only when video is actually used.

### Reference images

- Reference pictures are addressed as `#Image1`, `#Image2` and so on, position in the pass order
  being the only thing that binds a file to its handle. Because `#` opens a handle, a colour in a
  prompt is written `deep plum (hex 7A1F3D)`. New optional `refs` array on the `generate` log event
  records what a render actually bound to, as paths rather than ephemeral URLs.
- New `products[].photo` in the brand pack: skills now ask for a real photograph of a live SKU rather
  than synthesising one.

### The brand logo

- `/halfborg-skills:setup-brand` lifts the brand's logo off its website when it reads the site,
  verifies the downloaded bytes really are an image, and saves it to `brands/<id>/assets/`. New
  `brand.logo` in the pack schema (`path`, optional `dark_path` / `kind` / `source_url`, and
  `confirmed`, which is `false` on anything site-lifted). It asks no question and writes nothing it
  could not verify: a favicon is never recorded, and a missing logo is said out loud, not guessed at.
  The lookup order was rehearsed against live sites — a site's own JSON-LD declaration is tried
  before any scan of the header, because a press strip or customer wall is full of other people's
  logos.
- `landing-page` is the sole consumer. It embeds the file, inline SVG or a data URI under ~50KB, so
  the page stays self-contained, and falls back to the brand name set as type. The logo never reaches
  a render: generated visuals stay text-free and logo-free.

## 0.1.0

First release as an installable plugin. Previously a project-scoped `.claude/` workspace that only
worked inside its own repo; now installable into any folder.

### Packaging

- Repo `alexhalfborg/skills` is a marketplace **container**: the catalogue is
  `.claude-plugin/marketplace.json` at the root and each plugin is self-contained under
  `plugins/<name>/`. Install: `/plugin install halfborg-skills@halfborg`.
- Marketplace `halfborg`, plugin `halfborg-skills` — the plugin name prefixes every command and
  skill, so it is the one identifier a user sees constantly. Commands are `/halfborg-skills:*`.
  The `campaign-engine` **skill** keeps its name and is invoked as `halfborg-skills:campaign-engine`.
- Components moved to plugin roots: `.claude/skills` → `skills/campaign/`, `.claude/agents` →
  `agents/`, `.claude/commands` → `commands/`, `.claude/schema` → `schema/`. Skills are grouped by
  domain so a new area is a new category folder; because that is a level deeper than the default
  scan, each is listed explicitly in `plugin.json`'s `skills` array.
- All engine-internal paths rewritten to `${CLAUDE_PLUGIN_ROOT}`, which resolves inline in skill and
  agent content. Workspace paths (`brands/`, `campaigns/`, `engine.yaml`) stay relative to the
  working directory, which is the point.
- The fal.ai key is now a plugin `userConfig` setting, prompted at enable time and substituted into
  the plugin's own `.mcp.json`. It replaces the hand-edited `FAL_KEY` in
  `.claude/settings.local.json`, which remains a documented fallback for unpackaged use.
- `setup/` dissolved. Its human-facing half is this repo's README; the runtime half is
  `skills/campaign-engine/references/integrations.md`. The five components that pointed at it now
  state the one fact each needed inline — a plugin cache path is not somewhere to send a user.

### Bootstrap

- `campaign-engine` skill: the former `CLAUDE.md`, now a plugin skill. A plugin's own `CLAUDE.md` is
  not loaded as project context, so the architecture had to become a skill.
- `/halfborg-skills:setup-engine` grew from a toolchain check into a real bootstrap. It now
  scaffolds `brands/` and `campaigns/`, copies `engine.yaml` from a template, guards `.gitignore`,
  and writes a `## Campaign engine` block into the workspace's `CLAUDE.md` (or `AGENTS.md`) —
  drafting it for review first, editing the existing block in place, never clobbering surrounding
  sections, and asking which file to create when neither exists.

### Out-of-sequence handling

- New `schema/preflight.md`: the shared readiness-and-routing contract, in two tiers. Tier 1 is a
  free context check — the `## Campaign engine` block loading on every turn *is* the proof that the
  workspace is set up. Tier 2 resolves the artifact chain from the filesystem.
- Closed the systematic blind spot: every skill and agent resolved the brand from `campaign.brand`
  in `system/manifest.yaml`, and none but `campaign-brief` said what to do when it was absent. All
  of them now route.
- `campaign-qa` gained gates on the manifest, brief and pack; `competitor-ads` gained a pack gate;
  `generate-image` and `generate-video` now warn before minting a `media/` folder for an
  unregistered deliverable id; `personal-post`, `customer-story` and `email-newsletter` now name
  `/halfborg-skills:setup-brand` as the route for a missing voice profile instead of just stopping.

### Carried over

All four pipeline phases and every expander are as they were. The newest expanders
(`email-newsletter`, `landing-page`, `campaign-qa`, the refactored `compose-lockup` loop,
`competitor-ads`, `reference-kit`) still want an end-to-end run against a live campaign.
