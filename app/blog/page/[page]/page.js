import Link from 'next/link';
import { notFound } from 'next/navigation';
import ArchiveCard from '@/components/ArchiveCard';
import Pagination from '@/components/Pagination';
import { getAllPosts, SITE, blogIndexUrl } from '@/lib/blog';

const POSTS_PER_PAGE = 15;

function pathFor(n) {
  return n === 1 ? '/blog' : `/blog/page/${n}`;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const all = getAllPosts();
  const totalPages = Math.max(1, Math.ceil(all.length / POSTS_PER_PAGE));
  // Generate /blog/page/2, /blog/page/3, ... (page 1 lives at /blog)
  return Array.from({ length: totalPages - 1 }, (_, i) => ({ page: String(i + 2) }));
}

export async function generateMetadata({ params }) {
  const n = parseInt(params.page, 10);
  const canonical = `${SITE.url}${pathFor(n)}`;
  return {
    title: `Page ${n} · ${SITE.name}`,
    description: `${SITE.description} (Page ${n})`,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: canonical,
      title: `Page ${n} · ${SITE.name}`,
      description: SITE.description,
      siteName: SITE.name,
    },
    robots: { index: true, follow: true },
  };
}

export default function BlogPage({ params }) {
  const n = parseInt(params.page, 10);
  if (!Number.isFinite(n) || n < 2) notFound();

  const all = getAllPosts();
  const totalPages = Math.max(1, Math.ceil(all.length / POSTS_PER_PAGE));
  if (n > totalPages) notFound();

  const start = (n - 1) * POSTS_PER_PAGE;
  const entries = all.slice(start, start + POSTS_PER_PAGE);

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Blog', item: blogIndexUrl() },
      { '@type': 'ListItem', position: 2, name: `Page ${n}`, item: `${SITE.url}${pathFor(n)}` },
    ],
  };
  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Kubesimplify Blog · Page ${n}`,
    url: `${SITE.url}${pathFor(n)}`,
    isPartOf: { '@type': 'Blog', '@id': SITE.url, name: SITE.name },
    inLanguage: 'en-US',
  };

  return (
    <main className="pt-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm">
            <Link href="/blog" className="text-[var(--accent)] hover:underline">
              &larr; All posts
            </Link>
          </nav>

          <div className="flex items-baseline justify-between mb-6 flex-wrap gap-2">
            <h1 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
              All posts
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {all.length} posts · page {n} of {totalPages}
            </p>
          </div>

          <div className="archive-grid">
            {entries.map((p) => (
              <ArchiveCard key={p.slug} post={p} />
            ))}
          </div>

          <Pagination current={n} total={totalPages} pathFor={pathFor} />
        </div>
      </section>
    </main>
  );
}
