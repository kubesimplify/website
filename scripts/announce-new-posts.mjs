#!/usr/bin/env node
/**
 * Announce newly added blog posts to newsletter subscribers.
 *
 * Used by .github/workflows/announce.yml on push to main: diffs the pushed
 * range for ADDED files under content/blog/, applies the same publish filter
 * as the site (skip drafts AND posts without datePublished), waits for the
 * Cloudflare Pages deploy to actually serve each post (the broadcast must
 * not race the build, or emailed links 404 and the dedup row blocks a
 * re-send), then POSTs each to the worker's /api/broadcast endpoint.
 *
 * Env: BROADCAST_SECRET (required), RANGE (e.g. "abc123..def456", required).
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const SECRET = process.env.BROADCAST_SECRET;
const RANGE = process.env.RANGE;
if (!SECRET || !RANGE) {
  console.error('BROADCAST_SECRET and RANGE are required');
  process.exit(1);
}

const added = execSync(`git diff --name-status --diff-filter=A ${RANGE} -- content/blog/`, { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean)
  .map((l) => l.split('\t')[1])
  .filter((f) => f && f.endsWith('.md'));

if (!added.length) {
  console.log('No new posts in this push.');
  process.exit(0);
}

// CRLF-tolerant frontmatter parse; a file this misses is treated as
// unpublishable rather than announceable.
function fm(raw) {
  const m = raw.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---/);
  const out = {};
  if (!m) return null;
  for (const line of m[1].split('\n')) {
    const mm = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (mm) out[mm[1]] = mm[2].trim().replace(/^"|"$/g, '');
  }
  return out;
}

/** Wait until the deployed site serves the post (max ~10 minutes). */
async function waitLive(url) {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      if (res.ok) return true;
    } catch {}
    console.log(`waiting for deploy: ${url} not live yet (${i + 1}/30)`);
    await new Promise((r) => setTimeout(r, 20000));
  }
  return false;
}

for (const file of added) {
  const data = fm(readFileSync(file, 'utf8'));
  if (!data) {
    console.log(`skip (unparseable frontmatter, not announcing): ${file}`);
    continue;
  }
  // Mirror lib/blog.js's publish filter: drafts and undated posts never
  // appear on the site, so they must never be announced either.
  if (data.draft === 'true' || data.draft === 'True' || !data.datePublished) {
    console.log(`skip (draft or unpublished): ${file}`);
    continue;
  }
  const slug = data.slug || file.split('/').pop().replace(/\.md$/, '');
  const url = `https://blog.kubesimplify.com/${slug}`;

  if (!(await waitLive(url))) {
    console.error(`NOT ANNOUNCED: ${url} never went live; re-run this workflow after the deploy succeeds.`);
    process.exitCode = 1;
    continue;
  }

  const res = await fetch('https://blog.kubesimplify.com/api/broadcast', {
    method: 'POST',
    headers: { Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, title: data.title || slug, description: data.seoDescription || '' }),
  });
  const body = await res.json().catch(() => ({}));
  console.log(`${slug}: HTTP ${res.status}`, JSON.stringify(body));
  if (!res.ok) process.exitCode = 1;
}
