#!/usr/bin/env node
// build-site.mjs — deterministic campaign site builder.
// Requires Node >= 18, zero dependencies (no npm install).
//
// Usage: node "${CLAUDE_PLUGIN_ROOT}/skills/campaign/campaign-site-builder/scripts/build-site.mjs" <campaign-path>
//
// Reads (per schema/campaign-structure.md in the halfborg-skills plugin):
//   system/generation-log.jsonl   append-only generation log (tolerant parse; warns on bad lines)
//   system/manifest.yaml          only the campaign block's `name:`/`brand:`, via regex (no YAML parser)
//   docs/*.md  content/*.md       rendered by the built-in markdown renderer
//   media/**                      scanned; files absent from the log are shown badged "unlogged"
//   ../references/page-template.html  the fixed page shell (resolved relative to this script)
//
// Emits: <campaign-path>/site/index.html — self-contained, media relatively linked (../media/...).
// Deterministic: "last updated" derives from the max log ts, never the wall clock.

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------- args & guards ----------

const campaignArg = process.argv[2];
if (!campaignArg) {
  console.error('usage: node build-site.mjs <campaign-path>');
  process.exit(1);
}
const root = resolve(campaignArg);
if (!existsSync(root)) {
  console.error(`error: campaign path not found: ${root}`);
  process.exit(1);
}
if (!existsSync(join(root, 'system'))) {
  console.error(
    `error: ${root} has no system/ folder — legacy layout. ` +
    `See the campaign structure spec (schema/campaign-structure.md in the halfborg-skills plugin), ` +
    `section 7, for the migration recipe.`
  );
  process.exit(1);
}
const slug = root.replace(/[\\/]+$/, '').split(/[\\/]/).pop();

// ---------- helpers ----------

const esc = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const readIf = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);

const IMG_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']);
const VID_EXT = new Set(['.mp4', '.webm', '.mov']);

// ---------- generation log ----------

const warnings = [];
const events = [];
const logPath = join(root, 'system', 'generation-log.jsonl');
if (existsSync(logPath)) {
  const lines = readFileSync(logPath, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (!line.trim()) return;
    try {
      const e = JSON.parse(line);
      if (!e.ts || !e.event || !e.deliverable) throw new Error('missing ts/event/deliverable');
      events.push(e);
    } catch (err) {
      warnings.push(`generation-log.jsonl line ${i + 1} unparseable, skipped (${err.message})`);
    }
  });
}
events.sort((a, b) => Date.parse(a.ts) - Date.parse(b.ts));

// Latest status per file: birth status from `generate`, overridden by later `status` events.
const fileStatus = new Map();
const fileGen = new Map(); // file -> its generate event
for (const e of events) {
  if (e.event === 'generate' && e.file) {
    fileGen.set(e.file, e);
    fileStatus.set(e.file, e.status || 'iteration');
  } else if (e.event === 'status' && e.file) {
    fileStatus.set(e.file, e.status);
  }
}

// Registered deliverables: manifest ids + key-visual + register events.
const manifestRaw = readIf(join(root, 'system', 'manifest.yaml')) || '';

// Scope `name:`/`brand:` to the top-level `campaign:` block: unscoped, they would match the first
// such scalar anywhere at any indentation — a deliverable's own `name:` included.
const campaignBlock = (manifestRaw.match(/^campaign:[ \t]*\r?\n((?:[ \t]+.*(?:\r?\n|$)|\r?\n)*)/m) || [])[1] || '';
const campaignScalar = (key) =>
  (campaignBlock.match(new RegExp(`^[ \\t]+${key}:[ \\t]*["']?(.+?)["']?[ \\t]*$`, 'm')) || [])[1] || '';

const campaignName = campaignScalar('name') || slug;
const brandId = campaignScalar('brand');

// The folder's <brand>- prefix is a human affordance; campaign.brand is authoritative. Warn rather
// than reconcile — the field wins, so the folder is what needs renaming.
// See schema/campaign-structure.md section 1.1 (halfborg-skills plugin).
if (brandId && !slug.startsWith(`${brandId}-`)) {
  warnings.push(
    `folder "${slug}" does not carry the "${brandId}-" prefix from campaign.brand in manifest.yaml. ` +
    `The field wins: rename the folder to match (campaign-structure.md section 1.1).`
  );
}
const manifestIds = [...manifestRaw.matchAll(/^\s*-\s*id:\s*["']?([A-Za-z0-9_-]+)["']?\s*$/gm)].map((m) => m[1]);
const registers = new Map(); // sub-id -> register event
for (const e of events) if (e.event === 'register') registers.set(e.deliverable, e);

// ---------- media scan ----------

const mediaFiles = []; // { rel (campaign-relative, fwd slashes), id (folder), name, mtime, kind }
const mediaDir = join(root, 'media');
if (existsSync(mediaDir)) {
  for (const id of readdirSync(mediaDir).sort()) {
    const dir = join(mediaDir, id);
    if (!statSync(dir).isDirectory()) continue;
    for (const name of readdirSync(dir).sort()) {
      const p = join(dir, name);
      if (!statSync(p).isFile()) continue;
      const ext = extname(name).toLowerCase();
      const kind = IMG_EXT.has(ext) ? 'image' : VID_EXT.has(ext) ? 'video' : 'other';
      mediaFiles.push({ rel: `media/${id}/${name}`, id, name, mtime: statSync(p).mtimeMs, kind });
    }
  }
}
const loggedFiles = new Set(fileGen.keys());

// ---------- markdown renderer (deterministic, minimal) ----------

function inline(md) {
  let s = esc(md);
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, src) => `<img src="${href(src)}" alt="${alt}" loading="lazy">`);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, txt, url) => `<a href="${href(url)}">${txt}</a>`);
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  return s;
}

// site/index.html lives one level below the campaign root: prefix ../ onto campaign-relative paths.
function href(url) {
  if (/^(https?:|mailto:|#|\/|\.\.\/)/.test(url)) return url;
  return '../' + url;
}

function renderMd(md) {
  const out = [];
  const lines = md.split(/\r?\n/);
  let i = 0;
  let list = null; // 'ul' | 'ol'
  const closeList = () => { if (list) { out.push(`</${list}>`); list = null; } };

  while (i < lines.length) {
    const line = lines[i];

    if (/^```/.test(line)) {
      closeList();
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      out.push(`<pre><code>${esc(buf.join('\n'))}</code></pre>`);
      continue;
    }
    if (/^\s*$/.test(line)) { closeList(); i++; continue; }
    if (/^(-{3,}|\*{3,})\s*$/.test(line)) { closeList(); out.push('<hr>'); i++; continue; }

    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      closeList();
      const lvl = h[1].length;
      const text = h[2];
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      out.push(`<h${lvl} id="${id}">${inline(text)}</h${lvl}>`);
      i++; continue;
    }

    if (/^\s*>/.test(line)) {
      closeList();
      const buf = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) buf.push(lines[i++].replace(/^\s*>\s?/, ''));
      out.push(`<blockquote class="preamble"><p>${buf.map(inline).join('<br>')}</p></blockquote>`);
      continue;
    }

    // Pipe table (needs a |---| separator on the next line).
    if (/^\s*\|/.test(line) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      closeList();
      const headCells = line.split('|').slice(1, -1).map((c) => `<th>${inline(c.trim())}</th>`).join('');
      i += 2;
      const rows = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        const cells = lines[i].split('|').slice(1, -1).map((c) => `<td>${inline(c.trim())}</td>`).join('');
        rows.push(`<tr>${cells}</tr>`);
        i++;
      }
      out.push(`<table><thead><tr>${headCells}</tr></thead><tbody>${rows.join('')}</tbody></table>`);
      continue;
    }

    const li = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
    if (li) {
      const type = /\d/.test(li[2]) ? 'ol' : 'ul';
      if (list && list !== type) closeList();
      if (!list) { out.push(`<${type}>`); list = type; }
      out.push(`<li>${inline(li[3])}</li>`);
      i++; continue;
    }

    closeList();
    if (/CLAIM CHECK/i.test(line)) out.push(`<div class="claim">${inline(line)}</div>`);
    else out.push(`<p>${inline(line)}</p>`);
    i++;
  }
  closeList();
  return out.join('\n');
}

function docCard(title, relPath, md, anchorId) {
  return `<article class="doc"${anchorId ? ` id="${anchorId}"` : ''}>
<div class="doc-head"><h1>${esc(title)}</h1><a class="source-link" href="../${esc(relPath)}">source</a></div>
${renderMd(md.replace(/^#\s+.*\n/, ''))}
</article>`;
}

// ---------- media cards ----------

function statusBadge(status) {
  if (!status) return '<span class="badge badge-unlogged">unlogged</span>';
  const cls = ['locked', 'final', 'superseded', 'rejected'].includes(status) ? ` badge-${status}` : '';
  return `<span class="badge${cls}">${esc(status)}</span>`;
}

function mediaEl(rel, kind) {
  if (kind === 'image') return `<img src="../${esc(rel)}" alt="${esc(rel)}" loading="lazy">`;
  if (kind === 'video') return `<video src="../${esc(rel)}" controls preload="metadata"></video>`;
  return `<p class="meta-line"><a href="../${esc(rel)}">${esc(rel)}</a></p>`;
}

function mediaCard(rel, kind, gen) {
  const status = fileStatus.get(rel);
  const name = rel.split('/').pop();
  const meta = [];
  if (gen?.ts) meta.push(`<p class="meta-line">${esc(gen.ts.replace('T', ' ').replace(/\+.*$/, ''))} · ${esc(gen.skill || '')}</p>`);
  if (gen?.model) meta.push(`<p class="meta-line">${esc(gen.model)}${gen.cost_usd != null ? ` · $${gen.cost_usd}` : ''}</p>`);
  if (gen?.notes) meta.push(`<p class="meta-line">${esc(gen.notes)}</p>`);
  let prompt = '';
  if (gen?.prompt) prompt = `<details class="prompt"><summary>prompt</summary><pre>${esc(gen.prompt)}</pre></details>`;
  else if (gen?.prompt_ref) prompt = `<p class="meta-line">prompt: <a href="../${esc(gen.prompt_ref.split('#')[0])}">${esc(gen.prompt_ref)}</a></p>`;
  return `<div class="media-card">${mediaEl(rel, kind)}<p class="file">${esc(name)}</p>${statusBadge(status)}${meta.join('')}${prompt}</div>`;
}

// ---------- tabs ----------

const tabs = []; // { id, label, html }

// deliverable roll-up used by Overview
function deliverableRows() {
  const rows = [];
  const ids = [];
  for (const id of manifestIds) ids.push({ id, kindNote: 'manifest' });
  if (mediaFiles.some((f) => f.id === 'key-visual') || events.some((e) => e.deliverable === 'key-visual'))
    ids.push({ id: 'key-visual', kindNote: 'engine' });
  for (const [id, reg] of registers) ids.push({ id, kindNote: `sub-id of ${reg.parent || '?'}`, reg });

  for (const { id, kindNote, reg } of ids) {
    const gens = events.filter((e) => e.event === 'generate' && e.deliverable === id);
    const files = gens.map((g) => g.file).filter(Boolean);
    const statuses = files.map((f) => fileStatus.get(f)).filter(Boolean);
    const latest = statuses.includes('final') ? 'final' : statuses.includes('locked') ? 'locked'
      : statuses.length ? statuses[statuses.length - 1] : '—';
    const cost = gens.reduce((s, g) => s + (g.cost_usd || 0), 0);
    const detail = reg ? [reg.title, reg.format, reg.funnel_stage].filter(Boolean).join(' · ') : '';
    rows.push(`<tr><td><code>${esc(id)}</code></td><td>${esc(kindNote)}</td><td>${esc(detail)}</td><td>${gens.length}</td><td>${esc(latest)}</td><td>${cost ? '$' + cost.toFixed(2) : ''}</td></tr>`);
  }
  return rows.join('\n');
}

// claim strip: every CLAIM CHECK line across docs/ and content/
function collectClaims() {
  const claims = [];
  for (const dir of ['docs', 'content']) {
    const d = join(root, dir);
    if (!existsSync(d)) continue;
    for (const name of readdirSync(d).sort()) {
      if (!name.endsWith('.md')) continue;
      for (const line of readFileSync(join(d, name), 'utf8').split(/\r?\n/)) {
        if (/CLAIM CHECK/i.test(line)) claims.push(`<li><strong>${esc(name)}:</strong> ${inline(line.replace(/^[\s>*-]+/, ''))}</li>`);
      }
    }
  }
  return claims;
}

// Overview
{
  const claims = collectClaims();
  const totalCost = events.reduce((s, e) => s + (e.cost_usd || 0), 0);
  const lastTs = events.length ? events[events.length - 1].ts : null;
  const strip = claims.length
    ? `<div class="claim-strip"><h2>Claim checks</h2><ul>${claims.join('\n')}</ul></div>` : '';
  tabs.push({
    id: 'overview', label: 'Overview',
    html: `${strip}
<article class="doc">
<div class="doc-head"><h1>Deliverables</h1></div>
<table><thead><tr><th>Deliverable</th><th>Kind</th><th>Detail</th><th>Artifacts</th><th>Status</th><th>Cost</th></tr></thead>
<tbody>${deliverableRows()}</tbody></table>
<p class="meta-line">${events.length} logged events${totalCost ? ` · total logged cost $${totalCost.toFixed(2)}` : ''}${lastTs ? ` · last activity ${esc(lastTs)}` : ''}</p>
</article>`,
  });
}

// Strategy (brief)
{
  const brief = readIf(join(root, 'docs', 'brief.md'));
  if (brief) tabs.push({ id: 'strategy', label: 'Strategy', html: docCard('Campaign brief', 'docs/brief.md', brief) });
}

// Concept (message + key-visual gallery)
{
  const conceptRel = 'docs/message.md';
  const message = readIf(join(root, conceptRel));
  const kv = mediaFiles.filter((f) => f.id === 'key-visual');
  let gallery = '';
  if (kv.length) {
    const cards = kv.map((f) => mediaCard(f.rel, f.kind, fileGen.get(f.rel))).join('\n');
    gallery = `<article class="doc"><div class="doc-head"><h1>Key visual</h1></div><div class="media-grid">${cards}</div></article>`;
  }
  if (message || gallery)
    tabs.push({ id: 'concept', label: 'Concept', html: (message ? docCard('Campaign message', conceptRel, message) : '') + gallery });
}

// Content (all content/*.md)
{
  const d = join(root, 'content');
  const names = existsSync(d) ? readdirSync(d).filter((n) => n.endsWith('.md')).sort() : [];
  if (names.length) {
    const toc = `<nav class="toc"><strong>Contents</strong>${names.map((n) => `<a href="#doc-${esc(n.replace(/\.md$/, ''))}">${esc(n)}</a>`).join('')}</nav>`;
    const cards = names.map((n) =>
      docCard(n.replace(/\.md$/, ''), `content/${n}`, readFileSync(join(d, n), 'utf8'), `doc-${n.replace(/\.md$/, '')}`)
    ).join('\n');
    tabs.push({ id: 'content', label: 'Content', html: toc + cards });
  }
}

// Media chronology: grouped by deliverable (first-event order), cards sorted by ts;
// unlogged files appended to their folder's group, ordered by mtime.
{
  const groups = new Map(); // id -> { reg, cards: [{ts, html}] }
  const groupFor = (id) => {
    if (!groups.has(id)) groups.set(id, { reg: registers.get(id), cards: [] });
    return groups.get(id);
  };
  for (const e of events) {
    if (e.event !== 'generate' || !e.file || !e.file.startsWith('media/')) continue;
    const kind = IMG_EXT.has(extname(e.file).toLowerCase()) ? 'image'
      : VID_EXT.has(extname(e.file).toLowerCase()) ? 'video' : 'other';
    groupFor(e.deliverable).cards.push({ ts: e.ts, html: mediaCard(e.file, kind, e) });
  }
  for (const f of mediaFiles) {
    if (loggedFiles.has(f.rel)) continue;
    groupFor(f.id).cards.push({ ts: new Date(f.mtime).toISOString(), html: mediaCard(f.rel, f.kind, null) });
  }
  if (groups.size) {
    const sections = [...groups.entries()].map(([id, g]) => {
      g.cards.sort((a, b) => Date.parse(a.ts) - Date.parse(b.ts));
      const meta = g.reg
        ? `<p class="group-meta">${esc([g.reg.title, g.reg.format, g.reg.channel, g.reg.funnel_stage, g.reg.parent ? `part of ${g.reg.parent}` : ''].filter(Boolean).join(' · '))}</p>`
        : '';
      return `<section class="deliverable-group"><h3>${esc(id)}</h3>${meta}<div class="media-grid">${g.cards.map((c) => c.html).join('\n')}</div></section>`;
    });
    tabs.push({ id: 'media', label: 'Media', html: `<article class="doc"><div class="doc-head"><h1>Media chronology</h1></div>${sections.join('\n')}</article>` });
  }
}

// QA
{
  const qa = readIf(join(root, 'docs', 'qa-report.md'));
  if (qa) tabs.push({ id: 'qa', label: 'QA', html: docCard('QA report', 'docs/qa-report.md', qa) });
}

// ---------- assemble ----------

const templatePath = join(dirname(fileURLToPath(import.meta.url)), '..', 'references', 'page-template.html');
let html = readFileSync(templatePath, 'utf8');

const lastTs = events.length ? events[events.length - 1].ts : '';
const meta = [
  `Slug: ${slug}`,
  brandId ? `Brand: ${brandId}` : '',
  lastTs ? `Last activity: ${lastTs}` : '',
].filter(Boolean).join(' · ');

const tabsHtml = tabs.map((t, i) =>
  `<button class="tab${i === 0 ? ' active' : ''}" data-tab="${t.id}">${esc(t.label)}</button>`).join('\n    ');
const panelsHtml = tabs.map((t, i) =>
  `<section class="panel${i === 0 ? ' active' : ''}" id="tab-${t.id}">\n${t.html}\n</section>`).join('\n');

// Strip the template's documentation comment first — it mentions the placeholder strings, which
// would otherwise soak up the replacement; function replacements keep `$` sequences in content
// from being interpreted as replacement patterns.
html = html.replace(/<!--[\s\S]*?-->\s*/, '');
html = html
  .replaceAll('{{TITLE}}', () => esc(campaignName))
  .replaceAll('{{META}}', () => esc(meta))
  .replaceAll('{{TABS}}', () => tabsHtml)
  .replaceAll('{{PANELS}}', () => panelsHtml);

mkdirSync(join(root, 'site'), { recursive: true });
writeFileSync(join(root, 'site', 'index.html'), html, 'utf8');

for (const w of warnings) console.warn(`warn: ${w}`);
console.log(`built ${join(root, 'site', 'index.html')} — ${tabs.length} tabs, ${events.length} log events${warnings.length ? `, ${warnings.length} warning(s)` : ''}`);
