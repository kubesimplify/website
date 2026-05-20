import Link from 'next/link';
import { getAllSeries } from '@/lib/series';
import { getAuthor, SITE } from '@/lib/blog';

export const metadata = {
  title: `Series · ${SITE.name}`,
  description: 'Multi-part series on Kubernetes, Docker, AI infrastructure, and cloud-native engineering.',
  alternates: { canonical: `${SITE.url}/series` },
  openGraph: {
    type: 'website',
    url: `${SITE.url}/series`,
    title: `Series · ${SITE.name}`,
    description: 'Multi-part series on Kubernetes, Docker, AI infrastructure, and cloud-native engineering.',
    siteName: SITE.name,
  },
};

export default function SeriesIndex() {
  const all = getAllSeries();

  return (
    <main className="pt-24">
      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm">
            <Link href="/blog" className="text-[var(--accent)] hover:underline">
              &larr; All posts
            </Link>
          </nav>

          <div className="text-center mb-12 max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)] mb-3">Series</p>
            <h1 className="text-display mb-4">Multi-part deep dives</h1>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Curated series for going from beginner to confident on a single topic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {all.map((s) => {
              const author = s.author ? getAuthor(s.author) : null;
              const isUpcoming = s.posts.length === 0;
              return (
                <Link
                  key={s.slug}
                  href={`/blog/series/${s.slug}`}
                  className="group rounded-2xl p-6 md:p-8 border transition-all hover:-translate-y-1"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    background: `linear-gradient(135deg, ${s.color}10, transparent)`,
                    borderLeftWidth: '4px',
                    borderLeftColor: s.color,
                  }}
                >
                  <p
                    className="text-[11px] font-bold uppercase tracking-[0.2em] mb-2"
                    style={{ color: s.color }}
                  >
                    {isUpcoming ? 'Coming soon' : `${s.posts.length} parts`}
                  </p>
                  <h2
                    className="text-xl md:text-2xl font-bold mb-2 group-hover:text-[var(--accent)] transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {s.name}
                  </h2>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                    {s.tagline}
                  </p>
                  {author && (
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={author.avatar} alt={author.name} className="w-5 h-5 rounded-full object-cover" />
                      <span>by {author.name}</span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
