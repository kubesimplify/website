import Link from 'next/link';
import { notFound } from 'next/navigation';
import BlogCard from '@/components/BlogCard';
import { getAllTags, getPostsByTag, tagUrl, postUrl, SITE } from '@/lib/blog';

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag: encodeURIComponent(tag) }));
}

export async function generateMetadata({ params }) {
  const tag = decodeURIComponent(params.tag);
  const posts = getPostsByTag(tag);
  if (!posts.length) return {};
  const title = `${tag} · Kubesimplify Blog`;
  const description = `${posts.length} article${posts.length === 1 ? '' : 's'} on ${tag} from the Kubesimplify community.`;
  return {
    title,
    description,
    alternates: { canonical: tagUrl(tag) },
    openGraph: { title, description, url: tagUrl(tag) },
  };
}

export default function TagPage({ params }) {
  const tag = decodeURIComponent(params.tag);
  const posts = getPostsByTag(tag);
  if (!posts.length) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${tag} articles · ${SITE.name}`,
    description: `${posts.length} articles tagged ${tag} on the Kubesimplify blog.`,
    url: tagUrl(tag),
    inLanguage: 'en-US',
    isPartOf: { '@type': 'Blog', '@id': SITE.url, name: SITE.name },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: posts.length,
      itemListElement: posts.slice(0, 30).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: postUrl(p.slug),
        name: p.title,
      })),
    },
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Blog', item: SITE.url },
      { '@type': 'ListItem', position: 2, name: tag, item: tagUrl(tag) },
    ],
  };

  return (
    <main className="pt-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm">
            <Link href="/blog" className="text-[var(--accent)] hover:underline">
              &larr; All posts
            </Link>
          </nav>
          <div className="mb-12">
            <p
              className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent)] mb-2"
            >
              Topic
            </p>
            <h1 className="text-display mb-4">{tag}</h1>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              {posts.length} article{posts.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p) => (
              <BlogCard key={p.slug} post={p} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
