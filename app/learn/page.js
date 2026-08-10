import Link from 'next/link';
import pathsData from '@/content/learning-paths.json';
import { safeJsonLd } from '@/lib/jsonld';

const { paths } = pathsData;

export const metadata = {
  title: 'Free Learning Paths & Roadmaps',
  description:
    'Free, structured learning roadmaps for Kubernetes, Docker, DevOps, and AI infrastructure. Every step is a real article, video course, or hands-on lab, no paywall, ever.',
  alternates: { canonical: 'https://kubesimplify.com/learn' },
  openGraph: {
    title: 'Free Learning Paths & Roadmaps | Kubesimplify',
    description: 'Kubernetes, Docker, DevOps, and AI infrastructure roadmaps, free articles, videos, and hands-on labs in the right order.',
  },
};

function countSteps(path) {
  return path.stages.reduce((n, s) => n + s.steps.length, 0);
}

function learnJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Kubesimplify Learning Paths',
    itemListElement: paths.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Course',
        name: p.name,
        description: p.description,
        url: `https://kubesimplify.com/learn/${p.slug}`,
        provider: { '@type': 'Organization', name: 'Kubesimplify', url: 'https://kubesimplify.com' },
        isAccessibleForFree: true,
        educationalLevel: p.level,
      },
    })),
  };
}

export default function LearnPage() {
  return (
    <main className="pt-28 pb-24 px-4 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(learnJsonLd()) }} />
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 max-w-3xl">
          <p className="font-mono text-sm mb-3" style={{ color: 'var(--accent)' }}>
            $ kubesimplify learn --free --no-paywall
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Roadmaps that are actually free
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Structured paths through 192 articles, full video courses, and browser-based labs.
            In the right order, by practitioners. When a step doesn&apos;t exist yet, we say so -
            and then we go build it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {paths.map((p) => (
            <Link
              key={p.slug}
              href={`/learn/${p.slug}`}
              className="group rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--card-shadow)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl" aria-hidden>{p.emoji}</span>
                <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                  {p.stages.length} stages · {countSteps(p)} steps
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-1 group-hover:text-[var(--accent)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                {p.name}
              </h2>
              <p className="text-sm font-semibold mb-3" style={{ color: 'var(--accent-secondary)' }}>{p.level}</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{p.description}</p>
            </Link>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-dashed p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4" style={{ borderColor: 'var(--border-medium)' }}>
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Prefer a terminal over a video?</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Our Killercoda scenarios give you a real cluster in your browser, including a full CNPE exam prep course.
            </p>
          </div>
          <a
            href="https://killercoda.com/saiyampathak"
            target="_blank"
            rel="noreferrer"
            className="shrink-0 px-5 py-2.5 rounded-lg font-semibold"
            style={{ background: 'var(--accent)', color: '#03121a' }}
          >
            Open hands-on labs →
          </a>
        </div>
      </div>
    </main>
  );
}
