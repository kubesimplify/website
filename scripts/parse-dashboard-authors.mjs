#!/usr/bin/env node
/**
 * Parse scripts/hashnode-dashboard.txt (raw paste from Hashnode dashboard)
 * and assign authors to each post by matching titles to content/blog/*.md.
 *
 * Strategy:
 *   1. Parse the dashboard into a list of {title, author} records.
 *   2. For each .md file, read frontmatter title and find the best match
 *      in the dashboard list (exact → case-insensitive → normalized).
 *   3. Write authors.json (one entry per unique author).
 *   4. Update each .md file's frontmatter with `author: <handle>`.
 *   5. Log unmatched posts to scripts/author-match-failures.json.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CONTENT = join(ROOT, 'content', 'blog');
const DASHBOARD = join(ROOT, 'scripts', 'hashnode-dashboard.txt');
const AUTHORS_FILE = join(ROOT, 'content', 'authors.json');
const FAILURES_FILE = join(ROOT, 'scripts', 'author-match-failures.json');

// ── 1. Parse the dashboard text ─────────────────────────────────────────
const dashText = readFileSync(DASHBOARD, 'utf8');

// Pattern: blocks separated by blank line. Each block:
//   <Title>
//   <Author Name>
//   · Edited <date>
//   (optional blank)
//   Open actions
const records = [];
const blocks = dashText.split(/\n(?=\S)/); // split where a non-whitespace line starts
// More reliable: parse line-by-line. Look for "· Edited" markers.
const lines = dashText.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (/^· Edited/.test(line.trim())) {
    // Author is the line before, title is the line(s) before that.
    const author = (lines[i - 1] || '').trim();
    const title = (lines[i - 2] || '').trim();
    if (title && author && !title.startsWith('· Edited')) {
      records.push({ title, author });
    }
  }
}

console.log(`Parsed ${records.length} (title, author) records from dashboard.`);

// ── 2. Normalize/match helpers ──────────────────────────────────────────
function normalize(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
const SPECIAL_CHAR_MAP = {
  ı: 'i', İ: 'i', ş: 's', Ş: 's', ğ: 'g', Ğ: 'g',
  ç: 'c', Ç: 'c', ö: 'o', Ö: 'o', ü: 'u', Ü: 'u',
  ñ: 'n', Ñ: 'n', ß: 'ss',
};
function handleFromName(name) {
  let s = name;
  for (const [from, to] of Object.entries(SPECIAL_CHAR_MAP)) {
    s = s.split(from).join(to);
  }
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip combining diacritical marks
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

// Build a lookup from normalized title to author
const byNormalizedTitle = new Map();
const byPartialTitle = []; // for fuzzy fallback
for (const r of records) {
  const n = normalize(r.title);
  byNormalizedTitle.set(n, r.author);
  byPartialTitle.push({ norm: n, author: r.author, title: r.title });
}

// ── 3. Process each .md file ───────────────────────────────────────────
const files = readdirSync(CONTENT).filter((f) => f.endsWith('.md')).sort();
const matched = [];
const failures = [];

function readFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split('\n')) {
    const mm = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (!mm) continue;
    let [, k, v] = mm;
    v = v.trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    fm[k] = v;
  }
  return { fm, fmText: m[1], body: m[2] };
}

function setAuthorInFrontmatter(filepath, handle) {
  const raw = readFileSync(filepath, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return false;
  let fmText = m[1];
  const body = m[2];
  if (/^author:/m.test(fmText)) {
    fmText = fmText.replace(/^author:.*$/m, `author: ${handle}`);
  } else {
    // Insert after slug: or at end of frontmatter
    if (/^slug:/m.test(fmText)) {
      fmText = fmText.replace(/^(slug:.*)$/m, `$1\nauthor: ${handle}`);
    } else {
      fmText = fmText + `\nauthor: ${handle}`;
    }
  }
  writeFileSync(filepath, `---\n${fmText}\n---\n${body}`, 'utf8');
  return true;
}

function findAuthor(title) {
  const n = normalize(title);
  // Exact
  if (byNormalizedTitle.has(n)) return byNormalizedTitle.get(n);
  // Substring match (one direction)
  for (const candidate of byPartialTitle) {
    if (candidate.norm === n) return candidate.author;
  }
  // Loose substring: title contained in dashboard or vice versa
  let best = null;
  let bestScore = 0;
  for (const candidate of byPartialTitle) {
    if (candidate.norm.includes(n) || n.includes(candidate.norm)) {
      const score = Math.min(candidate.norm.length, n.length) / Math.max(candidate.norm.length, n.length);
      if (score > bestScore) {
        bestScore = score;
        best = candidate.author;
      }
    }
  }
  return bestScore > 0.6 ? best : null;
}

const authors = {};

for (const file of files) {
  const filepath = join(CONTENT, file);
  const slug = file.replace(/\.md$/, '');
  const parsed = readFrontmatter(readFileSync(filepath, 'utf8'));
  if (!parsed) {
    failures.push({ slug, reason: 'no-frontmatter' });
    continue;
  }
  const title = parsed.fm.title;
  if (!title) {
    failures.push({ slug, reason: 'no-title' });
    continue;
  }
  const authorName = findAuthor(title);
  if (!authorName) {
    failures.push({ slug, title, reason: 'no-match' });
    continue;
  }
  const handle = handleFromName(authorName);
  if (!authors[handle]) {
    authors[handle] = {
      handle,
      name: authorName,
      avatar: null,
      bio: '',
      socials: {},
      postCount: 0,
    };
  }
  authors[handle].postCount++;
  setAuthorInFrontmatter(filepath, handle);
  matched.push({ slug, author: handle, name: authorName });
}

writeFileSync(AUTHORS_FILE, JSON.stringify(authors, null, 2) + '\n');
if (failures.length) writeFileSync(FAILURES_FILE, JSON.stringify(failures, null, 2) + '\n');

console.log(`\nMatched:  ${matched.length}`);
console.log(`Failures: ${failures.length}`);
console.log(`Unique authors: ${Object.keys(authors).length}`);
console.log(`\nTop authors by post count:`);
const sorted = Object.values(authors).sort((a, b) => b.postCount - a.postCount);
for (const a of sorted.slice(0, 15)) {
  console.log(`  ${a.postCount.toString().padStart(3)} - ${a.name.padEnd(30)} (@${a.handle})`);
}
if (failures.length) {
  console.log(`\nUnmatched (first 10):`);
  for (const f of failures.slice(0, 10)) console.log(`  ${f.slug} :: ${f.title || f.reason}`);
}
