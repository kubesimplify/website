#!/usr/bin/env node
/**
 * Scrape author bios from Wayback Machine archives.
 *
 * For each author whose bio is empty in content/authors.json:
 *   1. Find one of their posts (from .md frontmatter).
 *   2. Fetch the Wayback Machine snapshot.
 *   3. Extract `"name":"X" ... "bio":{"html":"<html>"}` tuple.
 *   4. Clean HTML → plain text.
 *   5. Update authors.json.
 *
 * Idempotent: skips authors whose bio is already non-empty.
 * Polite: 3-second throttle between requests.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CONTENT = join(ROOT, 'content', 'blog');
const AUTHORS_FILE = join(ROOT, 'content', 'authors.json');
const FAIL_FILE = join(ROOT, 'scripts', 'bio-scrape-failures.json');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15';

const authors = JSON.parse(readFileSync(AUTHORS_FILE, 'utf8'));

const handleToSlugs = new Map();
for (const file of readdirSync(CONTENT).filter((f) => f.endsWith('.md'))) {
  const raw = readFileSync(join(CONTENT, file), 'utf8');
  const { data } = matter(raw);
  if (!data.author) continue;
  if (!handleToSlugs.has(data.author)) handleToSlugs.set(data.author, []);
  handleToSlugs.get(data.author).push(data.slug || file.replace(/\.md$/, ''));
}

const failures = [];
const stats = { total: 0, skipped: 0, extracted: 0, empty: 0, failed: 0 };

async function fetchWaybackHtml(slug) {
  const url = `https://web.archive.org/web/2024/https://blog.kubesimplify.com/${slug}`;
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': UA, Accept: 'text/html' },
        redirect: 'follow',
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      lastErr = e;
      if (attempt < 3) await new Promise((r) => setTimeout(r, 4000 * attempt));
    }
  }
  throw lastErr;
}

// Decode JSON-escaped string back to characters (< → <, \n → newline, etc.)
function decodeJsonString(s) {
  try {
    return JSON.parse(`"${s}"`);
  } catch {
    return s;
  }
}

// Strip HTML tags, collapse whitespace, decode entities.
function htmlToPlainText(html) {
  if (!html) return '';
  return html
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\/?p[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function extractBioForAuthor(html, authorName) {
  // Tuple: "name":"X" ... non-brace chars ... "bio":{"html":"<escaped html>"}
  const tuples = [
    ...html.matchAll(
      /"name":"([^"]+)"[^{}]{0,1500}?"bio":\{"html":"((?:[^"\\]|\\.)*)"\}/g
    ),
  ];
  const target = authorName.toLowerCase().trim();
  // Exact name match
  for (const m of tuples) {
    if (m[1].toLowerCase().trim() === target) {
      return decodeJsonString(m[2]);
    }
  }
  // First-name match fallback
  const firstName = target.split(' ')[0];
  for (const m of tuples) {
    if (m[1].toLowerCase().startsWith(firstName + ' ') || m[1].toLowerCase() === firstName) {
      return decodeJsonString(m[2]);
    }
  }
  return null;
}

const handles = Object.keys(authors).sort();
console.log(`Scraping bios for ${handles.length} authors...`);

for (let i = 0; i < handles.length; i++) {
  const handle = handles[i];
  const author = authors[handle];
  stats.total++;

  if (author.bio && author.bio.trim().length > 0) {
    stats.skipped++;
    continue;
  }

  const slugs = handleToSlugs.get(handle);
  if (!slugs?.length) {
    failures.push({ handle, reason: 'no posts' });
    stats.failed++;
    continue;
  }

  let found = null;
  let lastErr = null;
  for (const trySlug of slugs.slice(0, 3)) {
    try {
      const html = await fetchWaybackHtml(trySlug);
      const bioHtml = extractBioForAuthor(html, author.name);
      if (bioHtml !== null) {
        found = bioHtml;
        break;
      }
      lastErr = new Error('no bio tuple matching author name');
    } catch (e) {
      lastErr = e;
    }
    await new Promise((r) => setTimeout(r, 3000));
  }

  if (found === null) {
    stats.failed++;
    failures.push({ handle, name: author.name, err: lastErr?.message });
    process.stdout.write(`  [${i + 1}/${handles.length}] @${handle.padEnd(30)} ✗ ${lastErr?.message}\n`);
  } else {
    const plain = htmlToPlainText(found);
    if (plain.length === 0) {
      stats.empty++;
      process.stdout.write(`  [${i + 1}/${handles.length}] @${handle.padEnd(30)} (no bio set on Hashnode)\n`);
    } else {
      author.bio = plain;
      stats.extracted++;
      const preview = plain.slice(0, 60) + (plain.length > 60 ? '…' : '');
      process.stdout.write(`  [${i + 1}/${handles.length}] @${handle.padEnd(30)} ✓ "${preview}"\n`);
    }
  }

  await new Promise((r) => setTimeout(r, 3000));
}

writeFileSync(AUTHORS_FILE, JSON.stringify(authors, null, 2) + '\n');
if (failures.length) writeFileSync(FAIL_FILE, JSON.stringify(failures, null, 2) + '\n');

console.log('\n=== Summary ===');
console.log(JSON.stringify(stats, null, 2));
