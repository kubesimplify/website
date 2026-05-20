#!/usr/bin/env node
/**
 * One-time import: read backup .md files from a source dir,
 * normalize frontmatter, rename by slug, write to content/blog/.
 *
 * Usage: node scripts/import-posts.mjs /tmp/hashnode-backup
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(process.argv[2] || '/tmp/hashnode-backup');
const DEST = resolve(__dirname, '..', 'content', 'blog');
mkdirSync(DEST, { recursive: true });

const files = readdirSync(SRC).filter((f) => f.endsWith('.md'));
let written = 0;
let skipped = 0;
const slugs = new Set();

for (const file of files) {
  const raw = readFileSync(join(SRC, file), 'utf8');
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    console.warn(`skip (no frontmatter): ${file}`);
    skipped++;
    continue;
  }
  const [, fmText, body] = match;

  const fm = {};
  for (const line of fmText.split('\n')) {
    const m = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (!m) continue;
    let [, k, v] = m;
    v = v.trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    fm[k] = v;
  }

  if (!fm.slug) {
    console.warn(`skip (no slug): ${file}`);
    skipped++;
    continue;
  }
  if (slugs.has(fm.slug)) {
    console.warn(`skip (dup slug ${fm.slug}): ${file}`);
    skipped++;
    continue;
  }
  slugs.add(fm.slug);

  // Normalize tags to array
  const tags = (fm.tags || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const newFm = [
    '---',
    `title: ${JSON.stringify(fm.title || '')}`,
    fm.seoTitle ? `seoTitle: ${JSON.stringify(fm.seoTitle)}` : null,
    fm.seoDescription ? `seoDescription: ${JSON.stringify(fm.seoDescription)}` : null,
    `datePublished: ${fm.datePublished || ''}`,
    `slug: ${fm.slug}`,
    fm.cover ? `cover: ${fm.cover}` : null,
    `tags: [${tags.map((t) => JSON.stringify(t)).join(', ')}]`,
    fm.cuid ? `cuid: ${fm.cuid}` : null,
    '---',
    '',
  ]
    .filter(Boolean)
    .join('\n');

  writeFileSync(join(DEST, `${fm.slug}.md`), newFm + body, 'utf8');
  written++;
}

console.log(`\nImported: ${written}`);
console.log(`Skipped:  ${skipped}`);
console.log(`Output:   ${DEST}`);
