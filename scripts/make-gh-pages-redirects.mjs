#!/usr/bin/env node
/**
 * GitHub Pages doesn't support vercel.json or _redirects. So for the
 * kubesimplify.com deployment (GitHub Pages), we replace every blog URL
 * in `out/` with a meta-refresh redirect page that points to the
 * canonical blog.kubesimplify.com/<slug>.
 *
 * This step runs ONLY in the GitHub Actions deploy workflow, AFTER
 * `next build`, BEFORE publishing to gh-pages. The Cloudflare Pages
 * deploy uses the unmodified build (with full blog content).
 *
 * Result:
 *   - kubesimplify.com/blog/<slug>      → meta-refresh + canonical → blog subdomain
 *   - kubesimplify.com/<old-slug>       → meta-refresh + canonical → blog subdomain
 *   - kubesimplify.com/blog/tag/<tag>   → same pattern
 *   - kubesimplify.com/blogs            → meta-refresh to blog subdomain
 *   - One canonical URL per piece of content. No duplicates.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync, rmSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = join(ROOT, 'out');
const CONTENT = join(ROOT, 'content', 'blog');
const BLOG = 'https://blog.kubesimplify.com';

function parseFm(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const fm = {};
  for (const line of m[1].split('\n')) {
    const mm = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (!mm) continue;
    let [, k, v] = mm;
    v = v.trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    fm[k] = v;
  }
  return fm;
}

// Drafts are hidden on the blog subdomain, so a redirect stub for one
// would both 404 and leak the unpublished slug on kubesimplify.com.
const slugs = readdirSync(CONTENT)
  .filter((f) => f.endsWith('.md'))
  .map((f) => ({ f, fm: parseFm(readFileSync(join(CONTENT, f), 'utf8')) }))
  .filter(({ fm }) => fm.draft !== 'true')
  .map(({ f, fm }) => fm.slug || f.replace(/\.md$/, ''))
  .filter(Boolean);

function redirectHtml(targetUrl) {
  const esc = targetUrl.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Redirecting…</title>
<link rel="canonical" href="${esc}">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${esc}">
<script>window.location.replace(${JSON.stringify(targetUrl)});</script>
</head>
<body>
<p>Redirecting to <a href="${esc}">${esc}</a>…</p>
</body>
</html>
`;
}

function writeRedirect(outPath, targetUrl) {
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, redirectHtml(targetUrl));
}

let count = 0;

// 1. /blog (index) → blog subdomain root
writeRedirect(join(OUT, 'blog.html'), `${BLOG}/`);
count++;

// 2. /blogs (legacy) → blog subdomain root
writeRedirect(join(OUT, 'blogs.html'), `${BLOG}/`);
count++;

// 2b. /discord community shortlink
writeRedirect(join(OUT, 'discord.html'), 'https://discord.gg/26Z384WSPB');
count++;

// 3. /blog/<slug>.html + legacy /<slug>.html → blog subdomain
for (const slug of slugs) {
  writeRedirect(join(OUT, 'blog', `${slug}.html`), `${BLOG}/${slug}`);
  writeRedirect(join(OUT, `${slug}.html`), `${BLOG}/${slug}`);
  count += 2;
}

// 4. Recursively replace EVERY other .html under out/blog/ (tag, author, hub,
//    series, page pagination, authors index, write page, etc.) with a redirect
//    to the equivalent path on the blog subdomain.
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full);
      continue;
    }
    if (!entry.endsWith('.html')) continue;
    const rel = relative(join(OUT, 'blog'), full).replace(/\\/g, '/');
    const pathWithoutHtml = rel.replace(/\.html$/, '');
    // Slug pages already handled above; skip to avoid double-write
    const segments = pathWithoutHtml.split('/');
    if (segments.length === 1 && slugs.includes(segments[0])) continue;
    const targetUrl = `${BLOG}/${pathWithoutHtml}`;
    writeRedirect(full, targetUrl);
    count++;
  }
}
walk(join(OUT, 'blog'));

// 5. Drop the .txt React Server Component payloads (only blog-related ones;
//    they reference chunks that no longer match the redirect-only HTML and
//    cause client-side errors if a browser tries soft-nav into them).
function removeRscPayloads(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      removeRscPayloads(full);
      continue;
    }
    if (entry.endsWith('.txt')) {
      rmSync(full);
    }
  }
}
removeRscPayloads(join(OUT, 'blog'));

console.log(`Generated ${count} redirect HTML pages for GitHub Pages deploy.`);
console.log(`  /blog, /blogs, /blog/<slug> (×${slugs.length}), /<slug> (×${slugs.length}),`);
console.log(`  plus tag/author/hub/series/page/authors/write paths.`);
