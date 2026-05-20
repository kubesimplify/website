#!/usr/bin/env node
/**
 * Walk content/blog/*.md, find every cdn.hashnode.com URL (cover + inline),
 * download to public/img/blog/<slug>/<basename>.<ext>, rewrite md to point local.
 *
 * Idempotent: skips already-downloaded files. Run safely multiple times.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve, dirname, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CONTENT = join(ROOT, 'content', 'blog');
const PUBLIC_IMG = join(ROOT, 'public', 'img', 'blog');

const CDN_RE = /https:\/\/cdn\.hashnode\.com\/[^\s)"'<>]+/g;
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15';

const stats = { posts: 0, urls: 0, downloaded: 0, cached: 0, failed: 0 };
const failures = [];

function localPathFor(url, slug) {
  // strip query string, get the last meaningful segment
  const clean = url.split('?')[0].split('#')[0];
  const last = clean.split('/').pop() || 'img';
  let name = last;
  let ext = extname(name).toLowerCase();
  if (!ext) {
    // some hashnode urls lack extensions, use hash + .png fallback
    const h = createHash('sha1').update(url).digest('hex').slice(0, 10);
    name = `${h}.png`;
    ext = '.png';
  }
  // sanitize filename
  name = name.replace(/[^a-zA-Z0-9._-]/g, '_');
  return join(PUBLIC_IMG, slug, name);
}

function publicUrlFor(localPath) {
  const rel = localPath.slice(join(ROOT, 'public').length);
  return rel.replace(/\\/g, '/');
}

async function download(url, dest) {
  if (existsSync(dest) && statSync(dest).size > 0) {
    stats.cached++;
    return true;
  }
  mkdirSync(dirname(dest), { recursive: true });
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'image/*,*/*' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === 0) throw new Error('empty body');
    writeFileSync(dest, buf);
    stats.downloaded++;
    return true;
  } catch (e) {
    stats.failed++;
    failures.push({ url, dest, err: e.message });
    return false;
  }
}

async function processPost(file) {
  const filepath = join(CONTENT, file);
  const slug = file.replace(/\.md$/, '');
  let content = readFileSync(filepath, 'utf8');

  const urls = Array.from(new Set(content.match(CDN_RE) || []));
  if (urls.length === 0) return;

  stats.posts++;
  stats.urls += urls.length;

  // Map url -> local public path
  const map = new Map();
  // Track filename collisions per slug
  const used = new Set();
  for (const url of urls) {
    let dest = localPathFor(url, slug);
    let name = basename(dest);
    let i = 1;
    while (used.has(name)) {
      const ext = extname(name);
      const stem = name.slice(0, -ext.length);
      name = `${stem}-${i}${ext}`;
      dest = join(dirname(dest), name);
      i++;
    }
    used.add(name);
    map.set(url, dest);
  }

  // Download in parallel batches of 8
  const entries = Array.from(map.entries());
  const batch = 8;
  for (let i = 0; i < entries.length; i += batch) {
    await Promise.all(
      entries.slice(i, i + batch).map(([url, dest]) => download(url, dest))
    );
  }

  // Rewrite content (replace URLs with public paths)
  for (const [url, dest] of map) {
    if (existsSync(dest) && statSync(dest).size > 0) {
      const publicUrl = publicUrlFor(dest);
      content = content.split(url).join(publicUrl);
    }
  }
  writeFileSync(filepath, content, 'utf8');
}

const files = readdirSync(CONTENT).filter((f) => f.endsWith('.md'));
console.log(`Processing ${files.length} posts...`);

let done = 0;
for (const file of files) {
  await processPost(file);
  done++;
  if (done % 10 === 0) {
    process.stdout.write(`  ${done}/${files.length}  (downloaded: ${stats.downloaded}, cached: ${stats.cached}, failed: ${stats.failed})\n`);
  }
}

console.log('\n=== Summary ===');
console.log(JSON.stringify(stats, null, 2));
if (failures.length) {
  console.log(`\nFirst 10 failures:`);
  for (const f of failures.slice(0, 10)) console.log(`  ${f.url} -> ${f.err}`);
  writeFileSync(join(ROOT, 'scripts', 'image-failures.json'), JSON.stringify(failures, null, 2));
  console.log(`Full list written to scripts/image-failures.json`);
}
