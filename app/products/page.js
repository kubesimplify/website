import Link from 'next/link';
import { products } from '@/lib/products';
import { safeJsonLd } from '@/lib/jsonld';

export const metadata = {
  title: 'Open Source Products',
  description:
    'Open source tools from Kubesimplify: KIAC (Kubernetes in Apple Containers), SRELens, kubectl upgrade, ing-switch, and memwarden. Real tools, really used.',
  alternates: { canonical: 'https://kubesimplify.com/products' },
  openGraph: {
    title: 'Open Source Products | Kubesimplify',
    description:
      'KIAC, SRELens, kubectl upgrade, ing-switch, memwarden, open source tools for Kubernetes and AI infrastructure.',
  },
};

const STATUS_LABEL = {
  stable: 'Stable',
  new: 'New',
  'early-access': 'Early access',
};

function productsJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Kubesimplify Open Source Products',
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'SoftwareApplication',
        name: p.name,
        description: p.description,
        url: `https://kubesimplify.com/products/${p.slug}`,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: p.os,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
    })),
  };
}

export default function ProductsPage() {
  return (
    <main className="pt-28 pb-24 px-4 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(productsJsonLd()) }}
      />
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 max-w-3xl">
          <p className="font-mono text-sm mb-3" style={{ color: 'var(--accent)' }}>
            $ kubectl get products -n kubesimplify
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Open source, really used
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Tools we built because we needed them, for local Kubernetes on Apple Silicon,
            cluster upgrades, ingress migrations, day-2 operations, and AI agent memory.
            Free, open source, and maintained.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {products.map((p) => (
            <Link
              key={p.slug}
              href={`/products/${p.slug}`}
              className="group rounded-2xl border p-6 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-1"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border-subtle)',
                boxShadow: 'var(--card-shadow)',
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-xs px-2 py-1 rounded-md" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                  {p.category}
                </span>
                <span className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {p.status !== 'stable' && (
                    <span
                      className="px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: 'var(--bg-elevated)', color: 'var(--accent)' }}
                    >
                      {STATUS_LABEL[p.status]}
                    </span>
                  )}
                  <span>★ {p.stars}</span>
                  <span>{p.language}</span>
                </span>
              </div>
              <h2 className="text-2xl font-bold group-hover:text-[var(--accent)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                {p.name}
              </h2>
              <p className="font-semibold text-sm" style={{ color: 'var(--accent-secondary)' }}>{p.tagline}</p>
              <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--text-secondary)' }}>{p.description}</p>
              <div
                className="font-mono text-xs rounded-lg px-3 py-2.5 overflow-x-auto whitespace-nowrap"
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
              >
                <span style={{ color: 'var(--accent-secondary)' }}>$ </span>
                {p.install.length > 64 ? `${p.install.slice(0, 61)}…` : p.install}
              </div>
            </Link>
          ))}

          <a
            href="https://killercoda.com/saiyampathak"
            target="_blank"
            rel="noreferrer"
            className="group rounded-2xl border border-dashed p-6 flex flex-col justify-center gap-3 transition-all duration-200 hover:-translate-y-1"
            style={{ borderColor: 'var(--border-medium)' }}
          >
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Hands-on labs →
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Free interactive Killercoda scenarios, practice Kubernetes, CNPE exam prep, and
              more, in a real terminal in your browser. No cluster required.
            </p>
          </a>
        </div>
      </div>
    </main>
  );
}
