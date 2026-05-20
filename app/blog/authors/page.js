import Link from 'next/link';
import AuthorSocials from '@/components/AuthorSocials';
import { getAllAuthors, authorUrl, SITE } from '@/lib/blog';

export const metadata = {
  title: 'Authors · Kubesimplify Blog',
  description: 'The 60+ practitioners and community contributors behind the Kubesimplify blog.',
  alternates: { canonical: `${SITE.url}/authors` },
  openGraph: {
    type: 'website',
    url: `${SITE.url}/authors`,
    title: 'Authors · Kubesimplify Blog',
    description: 'The 60+ practitioners and community contributors behind the Kubesimplify blog.',
    siteName: SITE.name,
  },
};

export default function AuthorsIndex() {
  const authors = getAllAuthors();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Authors · Kubesimplify Blog',
    description: `Profiles of the ${authors.length} contributors writing on the Kubesimplify blog.`,
    url: `${SITE.url}/authors`,
    inLanguage: 'en-US',
    isPartOf: { '@type': 'Blog', '@id': SITE.url, name: SITE.name },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: authors.length,
      itemListElement: authors.map((a, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Person',
          name: a.name,
          url: authorUrl(a.handle),
          image: a.avatar?.startsWith('http') ? a.avatar : `${SITE.url}${a.avatar}`,
          sameAs: a.sameAs?.length ? a.sameAs : undefined,
        },
      })),
    },
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Blog', item: SITE.url },
      { '@type': 'ListItem', position: 2, name: 'Authors', item: `${SITE.url}/authors` },
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
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)] mb-3">
              Community
            </p>
            <h1 className="text-display mb-4">Contributors</h1>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              {authors.length} practitioners writing about Kubernetes, AI infra, and the cloud-native stack on the Kubesimplify blog.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {authors.map((a) => (
              <div
                key={a.handle}
                className="group glass-card rounded-2xl p-5 transition-all hover:-translate-y-1 flex items-start gap-4"
              >
                <Link href={`/blog/author/${a.handle}`} className="flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.avatar}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/blog/author/${a.handle}`}
                    className="font-bold leading-snug group-hover:text-[var(--accent)] transition-colors truncate block"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {a.name}
                  </Link>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                    {a.postCount} post{a.postCount === 1 ? '' : 's'}
                  </p>
                  {a.socials && Object.values(a.socials).some(Boolean) && (
                    <AuthorSocials socials={a.socials} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
