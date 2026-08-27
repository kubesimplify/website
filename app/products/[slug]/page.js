import Link from 'next/link';
import { notFound } from 'next/navigation';
import { products } from '@/lib/products';
import { getPostBySlug } from '@/lib/blog';
import { safeJsonLd } from '@/lib/jsonld';

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }) {
  const p = products.find((x) => x.slug === params.slug);
  if (!p) return {};
  return {
    title: `${p.name}: ${p.tagline}`,
    description: p.description,
    alternates: { canonical: `https://kubesimplify.com/products/${p.slug}` },
    openGraph: { title: `${p.name}: ${p.tagline}`, description: p.description },
  };
}

const STATUS_LABEL = { stable: 'Stable', new: 'New', 'early-access': 'Early access' };

function productJsonLd(p) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: p.name,
    alternateName: p.tagline,
    description: p.longDescription,
    url: `https://kubesimplify.com/products/${p.slug}`,
    sameAs: [`https://github.com/${p.repo}`, p.homepage],
    applicationCategory: 'DeveloperApplication',
    operatingSystem: p.os,
    programmingLanguage: p.language,
    license: p.license,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    keywords: p.keywords.join(', '),
    publisher: { '@type': 'Organization', name: 'Kubesimplify', url: 'https://kubesimplify.com' },
  };
}

export default function ProductPage({ params }) {
  const p = products.find((x) => x.slug === params.slug);
  if (!p) notFound();

  const related = (p.relatedPosts || [])
    .map((slug) => {
      try {
        return getPostBySlug(slug);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  return (
    <main className="pt-28 pb-24 px-4 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(productJsonLd(p)) }}
      />
      <div className="max-w-4xl mx-auto">
        <nav className="text-sm mb-8 font-mono" style={{ color: 'var(--text-muted)' }}>
          <Link href="/products" className="hover:text-[var(--accent)]">products</Link>
          <span> / </span>
          <span style={{ color: 'var(--text-secondary)' }}>{p.slug}</span>
        </nav>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h1 className="text-4xl md:text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>{p.name}</h1>
          {p.status !== 'stable' && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'var(--bg-elevated)', color: 'var(--accent)' }}>
              {STATUS_LABEL[p.status]}
            </span>
          )}
        </div>
        <p className="text-xl font-semibold mb-6" style={{ color: 'var(--accent-secondary)' }}>{p.tagline}</p>

        <div className="flex flex-wrap gap-4 text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
          <a href={`https://github.com/${p.repo}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-[var(--accent)] font-semibold">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
            {p.repo} · ★ {p.stars}
          </a>
          <span>{p.language}</span>
          <span>{p.license}</span>
          <span>{p.os}</span>
          {p.homepage && !p.homepage.includes('github.com') && (
            <a href={p.homepage} target="_blank" rel="noreferrer" className="hover:text-[var(--accent)] font-semibold">
              {p.homepage.replace(/^https?:\/\//, '').replace(/\/$/, '')} ↗
            </a>
          )}
        </div>

        <div
          className="font-mono text-sm rounded-xl p-5 mb-10 overflow-x-auto"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
        >
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Get started</p>
          <p className="whitespace-pre-wrap break-all" style={{ color: 'var(--text-primary)' }}>
            <span style={{ color: 'var(--accent-secondary)' }}>$ </span>{p.install}
          </p>
          <p className="mt-2 whitespace-pre-wrap break-all" style={{ color: 'var(--text-primary)' }}>
            <span style={{ color: 'var(--accent-secondary)' }}>$ </span>{p.quickstart}
          </p>
        </div>

        <p className="text-lg leading-relaxed mb-10" style={{ color: 'var(--text-secondary)' }}>{p.longDescription}</p>

        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Why it exists</h2>
        <ul className="space-y-3 mb-10">
          {p.features.map((f) => (
            <li key={f} className="flex gap-3 items-start">
              <span className="mt-1 shrink-0" style={{ color: 'var(--accent-secondary)' }}>✓</span>
              <span style={{ color: 'var(--text-secondary)' }}>{f}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Built for</h2>
        <div className="flex flex-wrap gap-2 mb-12">
          {p.useCases.map((u) => (
            <span key={u} className="px-3 py-1.5 rounded-lg text-sm" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
              {u}
            </span>
          ))}
        </div>

        {related.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Deep dives</h2>
            <div className="space-y-3 mb-12">
              {related.map((post) => (
                <a
                  key={post.slug}
                  href={`https://blog.kubesimplify.com/${post.slug}`}
                  className="block rounded-xl border p-4 hover:-translate-y-0.5 transition-transform"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
                >
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{post.title}</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{post.seoDescription}</p>
                </a>
              ))}
            </div>
          </>
        )}

        <div className="rounded-xl border p-6 text-center" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card)' }}>
          <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Found it useful? Star it, break it, file issues.
          </p>
          <a
            href={`https://github.com/${p.repo}`}
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-2 px-5 py-2.5 rounded-lg font-semibold"
            style={{ background: 'var(--accent)', color: '#03121a' }}
          >
            Star on GitHub →
          </a>
        </div>
      </div>
    </main>
  );
}
