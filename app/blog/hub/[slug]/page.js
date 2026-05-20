import Link from 'next/link';
import { notFound } from 'next/navigation';
import BlogCard from '@/components/BlogCard';
import { getAllPosts, getPostBySlug, postUrl, SITE } from '@/lib/blog';
import { getAllHubs, getHub } from '@/lib/hubs';

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllHubs().map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }) {
  const hub = getHub(params.slug);
  if (!hub) return {};
  return {
    title: `${hub.name} · ${SITE.name}`,
    description: hub.description,
    keywords: hub.tags,
    alternates: { canonical: `${SITE.url}/hub/${hub.slug}` },
    openGraph: {
      type: 'website',
      url: `${SITE.url}/hub/${hub.slug}`,
      title: `${hub.name} · ${SITE.name}`,
      description: hub.description,
      siteName: SITE.name,
    },
    twitter: { card: 'summary_large_image', title: hub.name, description: hub.tagline },
  };
}

export default function HubPage({ params }) {
  const hub = getHub(params.slug);
  if (!hub) notFound();

  const startHerePosts = hub.startHere.map((s) => getPostBySlug(s)).filter(Boolean);
  const startHereSlugs = new Set(hub.startHere);
  const tagSet = new Set(hub.tags);

  const allMatching = getAllPosts().filter(
    (p) => !startHereSlugs.has(p.slug) && p.tags.some((t) => tagSet.has(t))
  );
  const recent = allMatching.slice(0, 12);
  const archive = allMatching.slice(12);

  const hubUrl = `${SITE.url}/hub/${hub.slug}`;
  const featured = [...startHerePosts, ...recent].slice(0, 15);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${hub.name} · ${SITE.name}`,
    description: hub.description,
    url: hubUrl,
    inLanguage: 'en-US',
    keywords: hub.tags,
    about: hub.tags.map((t) => ({ '@type': 'Thing', name: t })),
    isPartOf: { '@type': 'Blog', '@id': SITE.url, name: SITE.name },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: startHerePosts.length + allMatching.length,
      itemListElement: featured.map((p, i) => ({
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
      { '@type': 'ListItem', position: 2, name: 'Topics', item: `${SITE.url}/hub/${hub.slug}` },
      { '@type': 'ListItem', position: 3, name: hub.name, item: hubUrl },
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

          {/* Hero */}
          <div
            className="rounded-3xl px-8 py-12 mb-12"
            style={{
              background: `linear-gradient(135deg, ${hub.color}18, transparent)`,
              borderLeft: `4px solid ${hub.color}`,
            }}
          >
            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl" aria-hidden="true">{hub.icon}</span>
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-[0.2em] mb-1"
                  style={{ color: hub.color }}
                >
                  Topic Hub
                </p>
                <h1 className="text-4xl md:text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {hub.name}
                </h1>
              </div>
            </div>
            <p className="text-xl max-w-2xl mb-4" style={{ color: 'var(--text-secondary)' }}>
              {hub.tagline}
            </p>
            <p className="text-base max-w-3xl" style={{ color: 'var(--text-muted)' }}>
              {hub.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {hub.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/tag/${encodeURIComponent(tag)}`}
                  className="px-3 py-1 rounded-full border text-xs font-medium transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  style={{ borderColor: 'var(--border-medium)', color: 'var(--text-secondary)' }}
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Start here */}
          {startHerePosts.length > 0 && (
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                Start here
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {startHerePosts.map((p) => (
                  <BlogCard key={p.slug} post={p} featured />
                ))}
              </div>
            </section>
          )}

          {/* Recent */}
          {recent.length > 0 && (
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                More on {hub.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recent.map((p) => (
                  <BlogCard key={p.slug} post={p} />
                ))}
              </div>
            </section>
          )}

          {archive.length > 0 && (
            <section>
              <details>
                <summary
                  className="cursor-pointer text-base font-semibold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Show {archive.length} more {hub.name} {archive.length === 1 ? 'article' : 'articles'}
                </summary>
                <ul className="mt-4 space-y-2">
                  {archive.map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={`/blog/${p.slug}`}
                        className="group flex items-baseline justify-between gap-4 py-2 border-b transition-colors hover:border-[var(--accent)]"
                        style={{ borderColor: 'var(--border-subtle)' }}
                      >
                        <span
                          className="font-medium group-hover:text-[var(--accent)] transition-colors"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {p.title}
                        </span>
                        <span className="text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                          {p.readMinutes} min
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
