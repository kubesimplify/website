import { getAllPosts, getAllTags, SITE } from '@/lib/blog';
import { getAllSeries } from '@/lib/series';

const POSTS_PER_PAGE = 15;

const MAIN = 'https://kubesimplify.com';

export default function sitemap() {
  const now = new Date().toISOString();

  const main = [
    { url: `${MAIN}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${MAIN}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${MAIN}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${MAIN}/workshops`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${MAIN}/resources`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${MAIN}/partnerships`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const posts = getAllPosts().map((p) => ({
    url: `${SITE.url}/${p.slug}`, // canonical: blog.kubesimplify.com/<slug>
    lastModified: new Date(p.datePublished).toISOString(),
    changeFrequency: 'yearly',
    priority: 0.7,
  }));

  const tags = getAllTags().map(({ tag }) => ({
    url: `${SITE.url}/tag/${encodeURIComponent(tag)}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.5,
  }));

  // Archive pagination pages
  const totalPages = Math.max(1, Math.ceil(getAllPosts().length / POSTS_PER_PAGE));
  const archivePages = Array.from({ length: totalPages - 1 }, (_, i) => ({
    url: `${SITE.url}/page/${i + 2}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.4,
  }));

  // Series pages (index + each series)
  const allSeries = getAllSeries();
  const series = [
    { url: `${SITE.url}/series`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    ...allSeries.map((s) => ({
      url: `${SITE.url}/series/${s.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    })),
  ];

  return [...main, ...posts, ...tags, ...archivePages, ...series];
}
