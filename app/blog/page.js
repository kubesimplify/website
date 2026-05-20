import Link from 'next/link';
import BlogCard from '@/components/BlogCard';
import BlogSearch from '@/components/BlogSearch';
import NewsletterCTA from '@/components/NewsletterCTA';
import ArchiveCard from '@/components/ArchiveCard';
import Pagination from '@/components/Pagination';
import { getAllPosts, getAllTags, getFeaturedPosts, getAuthor, SITE, postUrl, blogIndexUrl } from '@/lib/blog';
import { getAllHubs } from '@/lib/hubs';
import { getAllSeries } from '@/lib/series';

const POSTS_PER_PAGE = 15;
function pathFor(n) {
  return n === 1 ? '/blog' : `/blog/page/${n}`;
}

export const metadata = {
  title: 'Kubesimplify Blog · Kubernetes, AI infra & cloud-native',
  description: SITE.description,
  keywords: ['kubernetes blog', 'cloud native articles', 'AI ML infrastructure', 'devops guides', 'platform engineering', 'cncf'],
  alternates: { canonical: blogIndexUrl() },
  openGraph: {
    type: 'website',
    url: blogIndexUrl(),
    title: 'Kubesimplify Blog',
    description: SITE.description,
    siteName: SITE.name,
    images: [{ url: `${SITE.url}${SITE.defaultOgImage}`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: SITE.twitter,
    title: 'Kubesimplify Blog',
    description: SITE.description,
    images: [`${SITE.url}${SITE.defaultOgImage}`],
  },
};

export default function BlogIndex() {
  const all = getAllPosts();
  const featured = getFeaturedPosts(3);
  const archive = all; // page 1 of archive shows the full feed (yes, hero posts repeat for completeness)
  const totalPages = Math.max(1, Math.ceil(all.length / POSTS_PER_PAGE));
  const pageEntries = archive.slice(0, POSTS_PER_PAGE);
  const topTags = getAllTags().slice(0, 12);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: SITE.name,
    description: SITE.description,
    url: blogIndexUrl(),
    publisher: {
      '@type': 'Organization',
      name: 'Kubesimplify',
      url: 'https://kubesimplify.com',
      logo: { '@type': 'ImageObject', url: `${SITE.url}/img/color.svg` },
    },
    blogPost: featured.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: postUrl(p.slug),
      datePublished: p.datePublished,
      image: p.cover ? (p.cover.startsWith('http') ? p.cover : `${SITE.url}${p.cover}`) : undefined,
    })),
  };

  return (
    <main className="pt-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent)] mb-6">
              The Blog
            </div>
            <h1 className="text-display mb-6">Kubesimplify Blog</h1>
            <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
              {SITE.description}
            </p>
            <div className="mt-10 mb-8">
              <BlogSearch />
            </div>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/blog/rss.xml"
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors hover:bg-[var(--accent)]/10"
                style={{ borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4 11a9 9 0 019 9h3A12 12 0 004 8v3zm0-7v3a16 16 0 0116 16h3A19 19 0 004 4zm2 14a2 2 0 100 4 2 2 0 000-4z"/></svg>
                RSS
              </Link>
              <Link
                href="/blog/authors"
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors hover:bg-[var(--accent)]/10"
                style={{ borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
              >
                Authors
              </Link>
              <Link
                href="/blog/write"
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white gradient-bg transition-transform hover:scale-105"
              >
                Write for us &rarr;
              </Link>
            </div>
          </div>

          {featured.length > 0 && (
            <section className="mb-20">
              <div className="flex items-baseline justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Latest</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featured.map((p) => (
                  <BlogCard key={p.slug} post={p} featured />
                ))}
              </div>
            </section>
          )}

          {/* Series */}
          {getAllSeries().length > 0 && (
            <section className="mb-20">
              <div className="flex items-baseline justify-between mb-6 flex-wrap gap-2">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Series</h2>
                <Link href="/blog/series" className="text-sm font-semibold text-[var(--accent)] hover:underline">
                  All series &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getAllSeries().map((s) => {
                  const author = s.author ? getAuthor(s.author) : null;
                  const isUpcoming = s.posts.length === 0;
                  return (
                    <Link
                      key={s.slug}
                      href={`/blog/series/${s.slug}`}
                      className="group rounded-2xl p-5 border transition-all hover:-translate-y-1"
                      style={{
                        borderColor: 'var(--border-subtle)',
                        background: `linear-gradient(135deg, ${s.color}10, transparent)`,
                        borderLeftWidth: '4px',
                        borderLeftColor: s.color,
                      }}
                    >
                      <p
                        className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2"
                        style={{ color: s.color }}
                      >
                        {isUpcoming ? 'Coming soon' : `${s.posts.length} parts`}
                      </p>
                      <h3 className="text-lg font-bold mb-1 group-hover:text-[var(--accent)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                        {s.name}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {s.tagline}
                      </p>
                      {author && (
                        <div className="flex items-center gap-1.5 text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={author.avatar} alt={author.name} className="w-4 h-4 rounded-full object-cover" />
                          <span>by {author.name}</span>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Topic Hubs */}
          <section className="mb-20">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Topic hubs</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {getAllHubs().map((h) => (
                <Link
                  key={h.slug}
                  href={`/blog/hub/${h.slug}`}
                  className="group glass-card rounded-2xl p-5 transition-all hover:-translate-y-1"
                  style={{ borderLeft: `3px solid ${h.color}` }}
                >
                  <div className="text-3xl mb-3" aria-hidden="true">{h.icon}</div>
                  <h3 className="font-bold mb-1 group-hover:text-[var(--accent)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                    {h.name}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {h.tagline}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {topTags.length > 0 && (
            <section className="mb-20">
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Browse by tag</h2>
              <div className="flex flex-wrap gap-2">
                {topTags.map(({ tag, count }) => (
                  <Link
                    key={tag}
                    href={`/blog/tag/${encodeURIComponent(tag)}`}
                    className="px-3 py-1.5 rounded-full border text-sm font-medium transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    style={{ borderColor: 'var(--border-medium)', color: 'var(--text-secondary)' }}
                  >
                    {tag} <span style={{ color: 'var(--text-muted)' }}>·{count}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <NewsletterCTA />


          <section>
            <div className="flex items-baseline justify-between mb-6 flex-wrap gap-2">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>All posts</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {all.length} posts · page 1 of {totalPages}
              </p>
            </div>
            <div className="archive-grid">
              {pageEntries.map((p) => (
                <ArchiveCard key={p.slug} post={p} />
              ))}
            </div>
            <Pagination current={1} total={totalPages} pathFor={pathFor} />
          </section>
        </div>
      </section>
    </main>
  );
}
