# Changelog

## 0.4.0

**The final check now has an agent of its own.** `qa` runs the same `run-qa` pass in a separate
context, with no image generation in its tool set, so a compliance check cannot spend money and
reads the finished work rather than the conversation that produced it. Nothing changes about how
the check behaves, and it still runs perfectly well inline.

**Upgrading.** Restart your session after updating — a new agent is not picked up by
`/reload-plugins`. One thing moves: asking *"review this against the brand"* or *"is this on-brand
and compliant"* used to reach the Strategist, and now reaches QA. The Strategist sets direction and
writes the brief; it no longer reviews finished work. It never could open a video to check it, and
its review path depended on an external skill that only resolves on claude.ai.

## 0.3.0

Renamed, for room to grow. The marketplace is about to carry more than one family of skills, and
`halfborg-skills` read as though it owned all of them.

**Upgrading.** Nothing to do — the catalogue carries a `renames` entry, so Claude Code migrates the
plugin on the next session and says so once. Two follow-ups worth knowing about, both below: re-run
`setup-engine` in each existing workspace, and expect old campaigns to show old skill names in their
logs.

### Names

- Plugin `halfborg-skills` → **`halfborg-campaign`**, directory `plugins/halfborg-campaign`, display
  name "Halfborg Campaign Engine". Install is now
  `/plugin install halfborg-campaign@halfborg`. The marketplace is still `halfborg` — that suffix is
  the catalogue's name, never the repo's.
- Skills moved from `skills/campaign/<name>/` up to `skills/<name>/` and dropped the redundant
  `campaign-` prefix, so every invocation changes. A skill that does something is now verb-led; the
  one skill that is pure reference takes a noun.

  | Was | Now | | Was | Now |
  |---|---|---|---|---|
  | `campaign-brief` | `write-brief` | | `customer-story` | `write-customer-story` |
  | `campaign-message` | `write-message` | | `email-newsletter` | `write-email` |
  | `campaign-qa` | `run-qa` | | `landing-page` | `build-landing-page` |
  | `campaign-engine` | `architecture` | | `personal-post` | `write-personal-post` |
  | `campaign-site-builder` | `build-site` | | `reference-kit` | `prepare-reference-kit` |
  | `ad-creative` | `write-ad-creative` | | `video-ad-script` | `write-video-ad-script` |
  | `ai-image-video-prompt-builder` | `write-generation-prompt` | | `visual-ideas` | `explore-visual-ideas` |
  | `competitor-ads` | `analyse-competitor-ads` | | | |

  `compose-lockup`, `generate-image` and `generate-video` were already verb-led and are unchanged.

- One plugin per workflow family, slug `halfborg-<family>`, all under the single `halfborg`
  marketplace as sibling folders under `plugins/`. Never split by client brand or output type.
  Written down in [CONTRIBUTING.md](CONTRIBUTING.md) so the next family does not re-decide it.

### Packaging

- The explicit `skills` array is **gone** from `plugin.json`. That array only ever added to the
  default `skills/` scan; one level shallower, the scan finds all 18 on its own. Adding a skill is
  now adding a folder.
- Catalogue gained a `renames` map. It is append-only — entries stay forever, so a chain of renames
  still resolves for someone upgrading from far back.

### Fixed

- The `architecture` skill (formerly `campaign-engine`) had an unquoted colon-space in its
  `description`, which broke the YAML frontmatter. Claude Code loads such a skill with *empty
  metadata* rather than erroring, so it had no name and no description and was effectively
  unroutable. Now a block scalar, and validated. Its description also claimed to be "the reference
  every other engine skill assumes", which was never true — nothing reads it at runtime — and now
  describes what it actually does.

### Known effects

- **Existing workspaces keep stale commands.** `setup-engine` writes a `## Campaign engine` block
  into your workspace's `CLAUDE.md`, and older ones list `/halfborg-skills:*`. The `renames` map
  migrates the plugin, not text already written into your files. Re-run
  `/halfborg-campaign:setup-engine` in each workspace; it edits the block in place.
- **Old campaign logs carry old skill names.** `generation-log.jsonl` records the producing skill
  verbatim, so a campaign that spans the upgrade holds both vocabularies. The log is append-only
  history and is not rewritten. Nothing keys off that field, so mixed logs render fine.

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
