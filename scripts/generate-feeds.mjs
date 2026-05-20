#!/usr/bin/env node
/**
 * Generate static RSS, Atom, and llms.txt files into public/.
 * Run as part of the build pipeline.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CONTENT = join(ROOT, 'content', 'blog');
const PUBLIC = join(ROOT, 'public');

const SITE_URL = 'https://blog.kubesimplify.com';
const SITE_NAME = 'Kubesimplify Blog';
const SITE_DESC = 'Deep dives on Kubernetes, AI infrastructure, GitOps, and the cloud-native stack, written by practitioners.';
const AUTHOR = 'Kubesimplify';
const AUTHOR_EMAIL = 'hello@kubesimplify.com';

function esc(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function parseFm(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split('\n')) {
    const mm = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (!mm) continue;
    let [, k, v] = mm;
    v = v.trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    if (k === 'tags' && v.startsWith('[')) {
      try {
        v = JSON.parse(v.replace(/'/g, '"'));
      } catch {
        v = [];
      }
    }
    fm[k] = v;
  }
  return { fm, body: m[2] };
}

const files = readdirSync(CONTENT).filter((f) => f.endsWith('.md'));
const posts = files
  .map((file) => {
    const parsed = parseFm(readFileSync(join(CONTENT, file), 'utf8'));
    if (!parsed) return null;
    const { fm, body } = parsed;
    return {
      slug: fm.slug || file.replace(/\.md$/, ''),
      title: fm.title || '',
      description: fm.seoDescription || '',
      datePublished: fm.datePublished,
      cover: fm.cover,
      tags: Array.isArray(fm.tags) ? fm.tags : [],
      body,
    };
  })
  .filter((p) => p && p.datePublished)
  .sort((a, b) => new Date(b.datePublished) - new Date(a.datePublished));

const buildDate = new Date().toUTCString();
const latest = posts[0]?.datePublished ? new Date(posts[0].datePublished).toUTCString() : buildDate;

// ── RSS 2.0 ───────────────────────────────────────────────────────────────
const rssItems = posts
  .map((p) => {
    const link = `${SITE_URL}/${p.slug}`;
    const pubDate = new Date(p.datePublished).toUTCString();
    const cats = p.tags.map((t) => `<category>${esc(t)}</category>`).join('');
    return `    <item>
      <title>${esc(p.title)}</title>
      <link>${esc(link)}</link>
      <guid isPermaLink="true">${esc(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${esc(p.description)}</description>
      ${cats}
    </item>`;
  })
  .join('\n');

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <description>${esc(SITE_DESC)}</description>
    <language>en-us</language>
    <lastBuildDate>${latest}</lastBuildDate>
    <generator>Kubesimplify static blog</generator>
${rssItems}
  </channel>
</rss>
`;
writeFileSync(join(PUBLIC, 'rss.xml'), rss, 'utf8');

// ── Atom 1.0 ──────────────────────────────────────────────────────────────
const atomEntries = posts
  .map((p) => {
    const link = `${SITE_URL}/${p.slug}`;
    const updated = new Date(p.datePublished).toISOString();
    const cats = p.tags.map((t) => `    <category term="${esc(t)}"/>`).join('\n');
    return `  <entry>
    <title>${esc(p.title)}</title>
    <link href="${esc(link)}"/>
    <id>${esc(link)}</id>
    <updated>${updated}</updated>
    <published>${updated}</published>
    <summary>${esc(p.description)}</summary>
${cats}
  </entry>`;
  })
  .join('\n');

const atom = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${esc(SITE_NAME)}</title>
  <subtitle>${esc(SITE_DESC)}</subtitle>
  <link href="${SITE_URL}/atom.xml" rel="self"/>
  <link href="${SITE_URL}/"/>
  <id>${SITE_URL}/</id>
  <updated>${new Date().toISOString()}</updated>
  <author>
    <name>${esc(AUTHOR)}</name>
    <email>${esc(AUTHOR_EMAIL)}</email>
  </author>
${atomEntries}
</feed>
`;
writeFileSync(join(PUBLIC, 'atom.xml'), atom, 'utf8');

// ── llms.txt (AEO/GEO hint file) ─────────────────────────────────────────
// Follows the emerging llms.txt convention (llmstxt.org). Designed for AI
// crawlers (ChatGPT, Claude, Perplexity, etc.) to discover authoritative
// content quickly. Index + summaries + canonical URLs.
let authorsByHandle = {};
try {
  authorsByHandle = JSON.parse(readFileSync(join(ROOT, 'content', 'authors.json'), 'utf8'));
} catch {}

const postsByAuthor = new Map();
for (const p of posts) {
  const fmAuthor = (() => {
    try {
      const raw = readFileSync(join(CONTENT, `${p.slug}.md`), 'utf8');
      const fm = raw.match(/^---\n([\s\S]*?)\n---/);
      const m = fm?.[1].match(/^author:\s*(.*)$/m);
      return m?.[1]?.trim() || null;
    } catch { return null; }
  })();
  if (!fmAuthor) continue;
  if (!postsByAuthor.has(fmAuthor)) postsByAuthor.set(fmAuthor, []);
  postsByAuthor.get(fmAuthor).push(p);
}

const llmsLines = [
  `# ${SITE_NAME}`,
  '',
  `> ${SITE_DESC}`,
  '',
  '## About',
  '',
  `Kubesimplify is a community-driven publication on cloud-native technologies, with ${posts.length} in-depth technical articles by ${Object.keys(authorsByHandle).length || 'multiple'} practitioner authors. We cover Kubernetes (kubelet internals, scheduling, networking, operators), container runtimes (containerd, CRI-O, Docker), GitOps (Argo CD, Flux), service meshes, observability, AI/ML infrastructure on Kubernetes, GPU workloads, platform engineering, and the broader CNCF ecosystem.`,
  '',
  'Authoritative, practitioner-written, citation-friendly. Articles include code examples, diagrams, and references.',
  '',
  '## Site structure',
  '',
  `- Main site: https://kubesimplify.com`,
  `- Blog index: ${SITE_URL}`,
  `- Blog posts: ${SITE_URL}/{slug}`,
  `- Topic hubs: ${SITE_URL}/hub/{kubernetes|docker|ai-ml|devops|security|linux}`,
  `- Tags: ${SITE_URL}/tag/{tag}`,
  `- Authors: ${SITE_URL}/authors  •  ${SITE_URL}/author/{handle}`,
  `- RSS feed: ${SITE_URL}/rss.xml`,
  `- Atom feed: ${SITE_URL}/atom.xml`,
  `- Sitemap: ${SITE_URL}/sitemap.xml`,
  '',
  '## Multi-part series',
  '',
  `- 7 Days of Docker: ${SITE_URL}/series/7-days-of-docker (7-part deep dive by Saloni Narang)`,
  `- 7 Days of DGX Spark: ${SITE_URL}/series/7-days-of-dgx-spark (upcoming, by Saiyam Pathak)`,
  '',
  '## Curated topic hubs (canonical entry points)',
  '',
  `- Kubernetes: ${SITE_URL}/hub/kubernetes (kubelet internals, scheduling, networking, operators, releases)`,
  `- Docker & Containers: ${SITE_URL}/hub/docker (runtimes, image building, multi-stage, Compose)`,
  `- AI & ML on Cloud Native: ${SITE_URL}/hub/ai-ml (GPU scheduling, Kubeflow, LLMs on Kubernetes, NVIDIA NVCF)`,
  `- DevOps & Platform: ${SITE_URL}/hub/devops (GitOps, CI/CD, Terraform, platform engineering)`,
  `- Cloud Native Security: ${SITE_URL}/hub/security (network policies, Falco, Kyverno, SLSA supply-chain)`,
  `- Linux Fundamentals: ${SITE_URL}/hub/linux (shell, sysadmin, networking primitives)`,
  '',
  `## Recent posts (most recent ${Math.min(30, posts.length)} of ${posts.length})`,
  '',
];
for (const p of posts.slice(0, 30)) {
  const date = new Date(p.datePublished).toISOString().slice(0, 10);
  llmsLines.push(`- [${p.title}](${SITE_URL}/${p.slug}) (${date})${p.description ? `. ${p.description}` : ''}`);
}

llmsLines.push('', '## Topics covered (auto-derived from tags)', '');
const tagCounts = new Map();
for (const p of posts) for (const t of p.tags) tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
const topTags = Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 25);
for (const [tag, count] of topTags) {
  llmsLines.push(`- ${tag} (${count} articles): ${SITE_URL}/tag/${encodeURIComponent(tag)}`);
}

llmsLines.push('', '## Top contributors', '');
const topAuthors = [...postsByAuthor.entries()]
  .map(([h, ps]) => ({ handle: h, name: authorsByHandle[h]?.name || h, count: ps.length }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 15);
for (const a of topAuthors) {
  llmsLines.push(`- [${a.name}](${SITE_URL}/author/${a.handle}) (${a.count} posts)`);
}

llmsLines.push('', '## Crawl policy', '');
llmsLines.push('All content is freely accessible; no paywall. Citations of canonical URLs (`blog.kubesimplify.com/<slug>`) are encouraged. Author attribution is preserved in each post\'s schema.org metadata.');
llmsLines.push('');

writeFileSync(join(PUBLIC, 'llms.txt'), llmsLines.join('\n'), 'utf8');

// ── BlogFeed data (consumed by homepage BlogFeed client component) ───────
const feedData = posts.slice(0, 30).map((p) => ({
  slug: p.slug,
  title: p.title,
  description: p.description,
  datePublished: p.datePublished,
  cover: p.cover,
  tags: p.tags.slice(0, 3),
}));
const feedJs = `// AUTO-GENERATED by scripts/generate-feeds.mjs. Do not edit by hand.
export const FEED_POSTS = ${JSON.stringify(feedData, null, 2)};
`;
writeFileSync(join(ROOT, 'lib', '_blog-feed-data.js'), feedJs, 'utf8');

console.log(`Generated:`);
console.log(`  rss.xml                  (${posts.length} items)`);
console.log(`  atom.xml                 (${posts.length} entries)`);
console.log(`  llms.txt                 (${posts.length} posts indexed)`);
console.log(`  lib/_blog-feed-data.js   (${feedData.length} posts for homepage)`);
