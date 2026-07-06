import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

const CONTENT_DIR = join(process.cwd(), 'content', 'blog');
const AUTHORS_FILE = join(process.cwd(), 'content', 'authors.json');
const SITE_URL_FOR_AUTHORS = 'https://blog.kubesimplify.com';
const INCLUDE_DRAFTS = process.env.NODE_ENV !== 'production';

const DEFAULT_AUTHOR = {
  handle: 'kubesimplify',
  name: 'Kubesimplify',
  bio: 'Practitioner-led writing on Kubernetes, AI infrastructure, and the cloud-native stack.',
  avatar: '/img/color.svg',
  socials: {},
  url: 'https://kubesimplify.com',
  sameAs: ['https://www.youtube.com/@kubesimplify', 'https://x.com/kubesimplify', 'https://github.com/kubesimplify'],
};

// Load authors registry once at module init
let _authors = {};
if (existsSync(AUTHORS_FILE)) {
  try {
    _authors = JSON.parse(readFileSync(AUTHORS_FILE, 'utf8'));
  } catch (e) {
    console.warn('Failed to parse authors.json:', e.message);
  }
}

function resolveAuthor(handle) {
  if (!handle) return DEFAULT_AUTHOR;
  const a = _authors[handle];
  if (!a) return { ...DEFAULT_AUTHOR, handle, name: handle, url: `${SITE_URL_FOR_AUTHORS}/author/${handle}` };
  const socialUrls = Object.values(a.socials || {}).filter(Boolean);
  return {
    handle: a.handle || handle,
    name: a.name || handle,
    bio: (a.bio && a.bio.trim()) || '', // empty when no real bio, rendered conditionally
    avatar: a.avatar || '/img/color.svg',
    socials: a.socials || {},
    // Canonical URL for this person (their author page on our blog)
    url: `${SITE_URL_FOR_AUTHORS}/author/${handle}`,
    // sameAs: array of external profile URLs for schema.org
    sameAs: socialUrls,
  };
}

// Generate a description from the first ~155 chars of meaningful content.
// Strips code blocks, headings, markdown syntax, and image refs.
function extractDescriptionFromContent(md) {
  if (!md) return '';
  const cleaned = md
    .replace(/```[\s\S]*?```/g, ' ')         // code blocks
    .replace(/^#{1,6}\s+.+$/gm, ' ')         // headings
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')   // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links → text
    .replace(/[*_~`>|#]+/g, ' ')             // syntax chars
    .replace(/\s+/g, ' ')
    .trim();
  if (cleaned.length <= 155) return cleaned;
  const truncated = cleaned.slice(0, 155);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 100 ? truncated.slice(0, lastSpace) : truncated) + '…';
}

let _cache = null;

function loadAll() {
  if (_cache) return _cache;
  const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md'));
  const posts = files
    .map((file) => {
      const raw = readFileSync(join(CONTENT_DIR, file), 'utf8');
      const { data, content } = matter(raw);
      const slug = data.slug || file.replace(/\.md$/, '');
      const stats = readingTime(content);
      const fallbackDesc = data.seoDescription || extractDescriptionFromContent(content);
      return {
        slug,
        title: data.title || slug,
        seoTitle: data.seoTitle || data.title || slug,
        seoDescription: fallbackDesc,
        datePublished: data.datePublished || null,
        cover: data.cover || null,
        draft: data.draft === true,
        tags: Array.isArray(data.tags) ? data.tags : [],
        author: resolveAuthor(data.author),
        readMinutes: Math.max(1, Math.round(stats.minutes)),
        words: stats.words,
        content,
        sourceFile: file,
      };
    })
    .filter((p) => p.datePublished && (INCLUDE_DRAFTS || !p.draft))
    .sort((a, b) => new Date(b.datePublished) - new Date(a.datePublished));

  _cache = posts;
  return posts;
}

export function getAllPosts() {
  return loadAll();
}

export function getPostBySlug(slug) {
  return loadAll().find((p) => p.slug === slug) || null;
}

export function getAllSlugs() {
  return loadAll().map((p) => p.slug);
}

export function getAllTags() {
  const counts = new Map();
  for (const p of loadAll()) {
    for (const t of p.tags) counts.set(t, (counts.get(t) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export function getPostsByTag(tag) {
  return loadAll().filter((p) => p.tags.includes(tag));
}

export function getAllAuthors() {
  const counts = new Map();
  for (const p of loadAll()) {
    const h = p.author.handle;
    counts.set(h, (counts.get(h) || 0) + 1);
  }
  // Return author profiles with post counts, sorted by count
  return Array.from(counts.entries())
    .map(([handle, count]) => ({ ...resolveAuthor(handle), postCount: count }))
    .sort((a, b) => b.postCount - a.postCount);
}

export function getAuthor(handle) {
  return resolveAuthor(handle);
}

export function getPostsByAuthor(handle) {
  return loadAll().filter((p) => p.author.handle === handle);
}

export function getRelatedPosts(slug, count = 3) {
  const post = getPostBySlug(slug);
  if (!post) return [];
  const tagSet = new Set(post.tags);
  return loadAll()
    .filter((p) => p.slug !== slug)
    .map((p) => ({
      post: p,
      overlap: p.tags.filter((t) => tagSet.has(t)).length,
    }))
    .filter((x) => x.overlap > 0)
    .sort(
      (a, b) =>
        b.overlap - a.overlap ||
        new Date(b.post.datePublished) - new Date(a.post.datePublished)
    )
    .slice(0, count)
    .map((x) => x.post);
}

export function getFeaturedPosts(count = 3) {
  return loadAll().slice(0, count);
}

export const SITE = {
  url: 'https://blog.kubesimplify.com',
  name: 'Kubesimplify Blog',
  description:
    'Deep dives on Kubernetes, AI infrastructure, GitOps, and the cloud-native stack, written by practitioners.',
  twitter: '@kubesimplify',
  defaultOgImage: '/img/og.png',
  githubRepo: 'kubesimplify/website',
  newsletterName: 'Kubesimplify Diaries',
  newsletterUrl: 'https://saiyampathak.substack.com/s/kubesimplify-diaries',
};

// Canonical public URLs. Posts live at blog.kubesimplify.com/<slug>
// (the /blog/ prefix is an internal Next.js route; hosting layer rewrites it away).
export function postUrl(slug) {
  return `${SITE.url}/${slug}`;
}
export function tagUrl(tag) {
  return `${SITE.url}/tag/${encodeURIComponent(tag)}`;
}
export function authorUrl(handle) {
  return `${SITE.url}/author/${handle}`;
}
export function blogIndexUrl() {
  return SITE.url;
}
