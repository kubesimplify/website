#!/usr/bin/env node
/**
 * Refresh GitHub star counts for every product with a `repo` field.
 *
 * Writes content/stars.json, a generated map of "owner/name" -> star count
 * that lib/products.js layers over the hand-authored content/products.json.
 * Runs as part of `prebuild`, so every deploy ships current numbers.
 *
 * Failures never break the build: a repo that errors or rate-limits keeps
 * whatever value stars.json already holds, falling back to the count baked
 * into products.json. Set GITHUB_TOKEN to lift the 60 req/hour anon limit
 * (GitHub Actions provides one automatically).
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PRODUCTS = path.join(root, 'content', 'products.json');
const STARS = path.join(root, 'content', 'stars.json');

const readJson = async (file, fallback) => {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
};

const fetchStars = async (repo) => {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'kubesimplify-website',
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const res = await fetch(`https://api.github.com/repos/${repo}`, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

  const { stargazers_count: stars } = await res.json();
  if (typeof stars !== 'number') throw new Error('no stargazers_count in response');
  return stars;
};

const { products = [] } = await readJson(PRODUCTS, {});
const previous = await readJson(STARS, {});
const repos = [...new Set(products.map((p) => p.repo).filter(Boolean))];

const next = {};
let changed = 0;
let failed = 0;

await Promise.all(
  repos.map(async (repo) => {
    const seed = previous[repo] ?? products.find((p) => p.repo === repo)?.stars;
    try {
      const stars = await fetchStars(repo);
      next[repo] = stars;
      if (stars !== seed) {
        changed += 1;
        console.log(`  ${repo}: ${seed ?? '-'} -> ${stars}`);
      }
    } catch (err) {
      failed += 1;
      if (seed !== undefined) next[repo] = seed;
      console.warn(`  ${repo}: keeping ${seed ?? 'products.json value'} (${err.message})`);
    }
  })
);

// Stable key order so the generated file diffs cleanly.
const sorted = Object.fromEntries(Object.keys(next).sort().map((k) => [k, next[k]]));
await writeFile(STARS, `${JSON.stringify(sorted, null, 2)}\n`);

console.log(
  `stars: ${repos.length} repos, ${changed} updated, ${failed} failed -> content/stars.json`
);
