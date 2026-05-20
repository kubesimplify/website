import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getAuthor, SITE, postUrl } from '@/lib/blog';
import { getAllSeries, getSeries } from '@/lib/series';

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllSeries().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }) {
  const series = getSeries(params.slug);
  if (!series) return {};
  const url = `${SITE.url}/series/${series.slug}`;
  return {
    title: `${series.name} · ${SITE.name}`,
    description: series.tagline,
    keywords: [series.name, 'series', ...(series.tagline.split(/\s+/).slice(0, 5))],
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title: `${series.name} · ${SITE.name}`,
      description: series.tagline,
      siteName: SITE.name,
    },
    twitter: { card: 'summary_large_image', title: series.name, description: series.tagline },
  };
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function SeriesPage({ params }) {
  const series = getSeries(params.slug);
  if (!series) notFound();

  const posts = series.posts.map((slug) => getPostBySlug(slug)).filter(Boolean);
  const author = series.author ? getAuthor(series.author) : null;
  const url = `${SITE.url}/series/${series.slug}`;
  const isUpcoming = posts.length === 0;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWorkSeries',
    name: series.name,
    description: series.description,
    url,
    inLanguage: 'en-US',
    numberOfItems: posts.length,
    isPartOf: { '@type': 'Blog', '@id': SITE.url, name: SITE.name },
    ...(author ? { author: { '@type': 'Person', name: author.name, url: author.url } } : {}),
    hasPart: posts.map((p, i) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: postUrl(p.slug),
      datePublished: p.datePublished,
      position: i + 1,
    })),
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Blog', item: SITE.url },
      { '@type': 'ListItem', position: 2, name: 'Series', item: `${SITE.url}/series` },
      { '@type': 'ListItem', position: 3, name: series.name, item: url },
    ],
  };

  return (
    <main className="pt-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm">
            <Link href="/blog" className="text-[var(--accent)] hover:underline">
              &larr; All posts
            </Link>
          </nav>

          {/* Hero */}
          <div
            className="rounded-3xl px-6 md:px-10 py-10 md:py-14 mb-10"
            style={{
              background: `linear-gradient(135deg, ${series.color}18, transparent)`,
              borderLeft: `4px solid ${series.color}`,
            }}
          >
            <p
              className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
              style={{ color: series.color }}
            >
              Series · {posts.length || 'coming soon'}{posts.length ? ' parts' : ''}
            </p>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4" style={{ color: 'var(--text-primary)' }}>
              {series.name}
            </h1>
            <p className="text-lg md:text-xl mb-5 max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
              {series.tagline}
            </p>
            {series.description && (
              <p className="text-base max-w-3xl" style={{ color: 'var(--text-muted)' }}>
                {series.description}
              </p>
            )}

            {author && (
              <div className="flex items-center gap-3 mt-6 pt-6 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Written by
                  </p>
                  <Link
                    href={`/blog/author/${author.handle}`}
                    className="font-semibold hover:text-[var(--accent)] transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {author.name}
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Posts */}
          {isUpcoming ? (
            <div className="text-center py-16 glass-card rounded-2xl">
              <p className="text-2xl mb-2" aria-hidden="true">🚧</p>
              <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Coming soon
              </h2>
              <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
                The first post in this series hasn&apos;t published yet. Subscribe to be notified when it ships.
              </p>
              {SITE.newsletterUrl && (
                <a
                  href={SITE.newsletterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 mt-6 text-sm font-semibold text-white gradient-bg hover:scale-105 transition-transform"
                >
                  Subscribe on Substack
                </a>
              )}
            </div>
          ) : (
            <ol className="space-y-3">
              {posts.map((p, i) => (
                <li key={p.slug}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="group flex items-start gap-4 md:gap-6 p-4 md:p-5 rounded-xl border transition-all hover:border-[var(--accent)] hover:-translate-y-0.5"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <div
                      className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-lg font-bold"
                      style={{ background: `${series.color}18`, color: series.color }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[10px] font-bold uppercase tracking-wider mb-1"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Part {i + 1} · {formatDate(p.datePublished)} · {p.readMinutes} min
                      </p>
                      <h3
                        className="text-base md:text-lg font-bold leading-snug mb-1 group-hover:text-[var(--accent)] transition-colors"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {p.title}
                      </h3>
                      {p.seoDescription && (
                        <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                          {p.seoDescription}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 self-center">
                      <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: series.color }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </main>
  );
}
