#!/usr/bin/env node
/**
 * For each author in content/authors.json (that has at least one post),
 * fetch one of their posts from the Wayback Machine, extract the author's
 * profilePicture URL, download it to public/img/authors/<handle>.<ext>,
 * and update authors.json with avatar: '/img/authors/<handle>.<ext>'.
 *
 * Strategy per author:
 *   1. Pick one of their posts (first by date).
 *   2. Fetch web.archive.org/web/2024/https://blog.kubesimplify.com/<slug>
 *   3. Scan the page for tuples like:
 *        "name":"X","username":"Y","profilePicture":"Z"
 *      Pick the tuple where name matches our author's name.
 *   4. Strip Wayback wrapping from the URL → original cdn.hashnode.com URL.
 *   5. Try downloading from CDN. If that 403s, fall back to Wayback URL.
 *   6. Save to public/img/authors/<handle>.<ext> and update authors.json.
 *
 * Throttle: 1 req/sec to Wayback.
 * Idempotent: skips authors whose avatar is already local.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, resolve, dirname, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CONTENT = join(ROOT, 'content', 'blog');
const AUTHORS_FILE = join(ROOT, 'content', 'authors.json');
const AVATARS_DIR = join(ROOT, 'public', 'img', 'authors');
const FAIL_FILE = join(ROOT, 'scripts', 'avatar-scrape-failures.json');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15';

mkdirSync(AVATARS_DIR, { recursive: true });

function stripWayback(url) {
  return url.replace(/^https:\/\/web\.archive\.org\/web\/\d+(im_|cs_)?\//, '');
}

const authors = JSON.parse(readFileSync(AUTHORS_FILE, 'utf8'));

// Build a handle → [slugs] map from the .md frontmatter
const handleToSlugs = new Map();
for (const file of readdirSync(CONTENT).filter((f) => f.endsWith('.md'))) {
  const raw = readFileSync(join(CONTENT, file), 'utf8');
  const { data } = matter(raw);
  if (!data.author) continue;
  if (!handleToSlugs.has(data.author)) handleToSlugs.set(data.author, []);
  handleToSlugs.get(data.author).push(data.slug || file.replace(/\.md$/, ''));
}

const failures = [];
const stats = { total: 0, skipped: 0, downloaded: 0, failed: 0 };

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

function extractAvatarForAuthor(html, authorName) {
  // The author object has variable fields between "username" and "profilePicture"
  // (e.g. "deactivated", "isPro"), so use a lazy-quantified gap that doesn't
  // cross other author objects (i.e. no { or } in between).
  // Pattern: "name":"X" ...up to 1500 non-brace chars... "username":"Y" ... "profilePicture":"Z"
  const tuples = [
    ...html.matchAll(
      /"name":"([^"]+)"[^{}]{0,200}?"username":"([^"]+)"[^{}]{0,500}?"profilePicture":"([^"]+)"/g
    ),
  ];
  const target = authorName.toLowerCase().trim();

  // Exact name match
  for (const m of tuples) {
    if (m[1].toLowerCase().trim() === target) {
      return { name: m[1], username: m[2], pic: stripWayback(m[3]), waybackPic: m[3] };
    }
  }
  // First-name match (handles middle-initial differences)
  const firstName = target.split(' ')[0];
  for (const m of tuples) {
    if (m[1].toLowerCase().startsWith(firstName + ' ') || m[1].toLowerCase() === firstName) {
      return { name: m[1], username: m[2], pic: stripWayback(m[3]), waybackPic: m[3] };
    }
  }
  // Username-substring match (e.g. "saloninarang" derived from "Saloni Narang")
  const targetFlat = target.replace(/\s+/g, '');
  for (const m of tuples) {
    if (m[2].toLowerCase().includes(targetFlat) || targetFlat.includes(m[2].toLowerCase())) {
      return { name: m[1], username: m[2], pic: stripWayback(m[3]), waybackPic: m[3] };
    }
  }
  return null;
}

async function downloadImage(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'image/*,*/*' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 200) throw new Error(`tiny response (${buf.length} bytes)`);
  writeFileSync(dest, buf);
  return buf.length;
}

function localPath(handle, urlForExt) {
  const ext = extname(urlForExt.split('?')[0]).toLowerCase() || '.jpg';
  const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? ext : '.jpg';
  return join(AVATARS_DIR, `${handle}${safeExt}`);
}

const handles = Object.keys(authors).sort();
console.log(`Scraping avatars for ${handles.length} authors...`);

for (let i = 0; i < handles.length; i++) {
  const handle = handles[i];
  const author = authors[handle];
  stats.total++;

  // Skip if avatar is already a local /img/authors/ path AND file exists
  if (author.avatar && author.avatar.startsWith('/img/authors/')) {
    const existingPath = join(ROOT, 'public', author.avatar);
    if (existsSync(existingPath) && statSync(existingPath).size > 0) {
      stats.skipped++;
      continue;
    }
  }

  const slugs = handleToSlugs.get(handle);
  if (!slugs?.length) {
    failures.push({ handle, reason: 'no posts found in frontmatter' });
    stats.failed++;
    continue;
  }

  // Try up to 3 slugs per author. Some posts won't have archives.
  let lastErr = null;
  let found = null;
  let usedSlug = null;
  for (const trySlug of slugs.slice(0, 3)) {
    try {
      const html = await fetchWaybackHtml(trySlug);
      const result = extractAvatarForAuthor(html, author.name);
      if (result) {
        found = result;
        usedSlug = trySlug;
        break;
      }
      lastErr = new Error(`no profilePicture tuple matching "${author.name}"`);
    } catch (e) {
      lastErr = e;
    }
    await new Promise((r) => setTimeout(r, 3000));
  }

  if (!found) {
    stats.failed++;
    failures.push({ handle, name: author.name, triedSlugs: slugs.slice(0, 3), err: lastErr?.message });
    process.stdout.write(`  [${i + 1}/${handles.length}] @${handle.padEnd(30)} ✗ ${lastErr?.message}\n`);
    await new Promise((r) => setTimeout(r, 3000));
    continue;
  }

  try {
    const dest = localPath(handle, found.pic);
    let bytes = 0;
    try {
      bytes = await downloadImage(found.pic, dest);
    } catch (cdnErr) {
      try {
        bytes = await downloadImage(found.waybackPic, dest);
      } catch (wbErr) {
        throw new Error(`CDN: ${cdnErr.message}; Wayback: ${wbErr.message}`);
      }
    }
    author.avatar = `/img/authors/${basename(dest)}`;
    if (!author.socials?.hashnode) {
      author.socials = author.socials || {};
      author.socials.hashnode = `https://hashnode.com/@${found.username}`;
    }
    stats.downloaded++;
    process.stdout.write(`  [${i + 1}/${handles.length}] @${handle.padEnd(30)} ${(bytes / 1024).toFixed(0)}KB ✓ (via ${usedSlug.slice(0, 40)})\n`);
  } catch (e) {
    stats.failed++;
    failures.push({ handle, name: author.name, slug: usedSlug, picUrl: found.pic, err: e.message });
    process.stdout.write(`  [${i + 1}/${handles.length}] @${handle.padEnd(30)} ✗ download: ${e.message}\n`);
  }

  await new Promise((r) => setTimeout(r, 3000));
}

// Persist updated authors.json
writeFileSync(AUTHORS_FILE, JSON.stringify(authors, null, 2) + '\n');
if (failures.length) writeFileSync(FAIL_FILE, JSON.stringify(failures, null, 2) + '\n');

console.log('\n=== Summary ===');
console.log(JSON.stringify(stats, null, 2));
if (failures.length) console.log(`Failures saved to scripts/avatar-scrape-failures.json (${failures.length})`);
