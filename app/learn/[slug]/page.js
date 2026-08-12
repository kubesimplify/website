import Link from 'next/link';
import { notFound } from 'next/navigation';
import pathsData from '@/content/learning-paths.json';
import LearningPathJourney from '@/components/LearningPathJourney';
import { safeJsonLd } from '@/lib/jsonld';

const { paths } = pathsData;

export function generateStaticParams() {
  return paths.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }) {
  const p = paths.find((x) => x.slug === params.slug);
  if (!p) return {};
  return {
    title: `${p.name} (Free)`,
    description: p.description,
    alternates: { canonical: `https://kubesimplify.com/learn/${p.slug}` },
    openGraph: { title: `${p.name}, a free learning journey | Kubesimplify`, description: p.description },
  };
}

function pathJsonLd(p) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: p.name,
    description: p.description,
    url: `https://kubesimplify.com/learn/${p.slug}`,
    provider: { '@type': 'Organization', name: 'Kubesimplify', url: 'https://kubesimplify.com' },
    isAccessibleForFree: true,
    educationalLevel: p.level,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
    },
    teaches: p.stages.map((s) => s.outcome),
  };
}

export default function LearningPathPage({ params }) {
  const p = paths.find((x) => x.slug === params.slug);
  if (!p) notFound();

  const total = p.stages.reduce((n, s) => n + s.steps.length, 0);
  const planned = p.stages.reduce((n, s) => n + s.steps.filter((x) => x.planned).length, 0);

  return (
    <main className="pt-28 pb-24 px-4 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(pathJsonLd(p)) }} />
      <div className="max-w-3xl mx-auto">
        <nav className="text-sm mb-8 font-mono" style={{ color: 'var(--text-muted)' }}>
          <Link href="/learn" className="hover:text-[var(--accent)]">learn</Link>
          <span> / </span>
          <span style={{ color: 'var(--text-secondary)' }}>{p.slug}</span>
        </nav>

        <div className="flex items-center gap-4 mb-3">
          <span className="text-4xl" aria-hidden>{p.emoji}</span>
          <h1 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>{p.name}</h1>
        </div>
        <p className="font-semibold mb-4" style={{ color: 'var(--accent-secondary)' }}>{p.level}</p>
        <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>{p.description}</p>
        <p className="text-sm font-mono mb-10" style={{ color: 'var(--text-muted)' }}>
          {p.stages.length} stages · {total - planned} resources ready · {planned} in the works, all free ·
          every stage ends with a checkpoint you can verify on a real cluster
        </p>

        <LearningPathJourney path={p} />

        <div className="mt-14 rounded-xl border p-6 text-center" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card)' }}>
          <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Want to know when the 🚧 steps ship?
          </p>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            New articles, videos, and labs land in the newsletter first.
          </p>
          <Link
            href="/#newsletter"
            className="inline-block px-5 py-2.5 rounded-lg font-semibold"
            style={{ background: 'var(--accent)', color: '#03121a' }}
          >
            Get updates →
          </Link>
        </div>
      </div>
    </main>
  );
}
