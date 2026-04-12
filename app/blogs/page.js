import BlogFeed from '@/components/BlogFeed';

export const metadata = {
  title: 'Blog - Cloud Native & AI Articles',
  description: 'Technical deep-dives, tutorials, and insights on Kubernetes, cloud native, AI/ML infrastructure, and DevOps from the Kubesimplify community.',
  keywords: ['kubernetes blog', 'cloud native articles', 'AI ML tutorials', 'DevOps guides', 'CNCF blog', 'container tutorials'],
  alternates: { canonical: 'https://kubesimplify.com/blogs' },
  openGraph: {
    title: 'Kubesimplify Blog - Cloud Native & AI Articles',
    description: 'Technical deep-dives on Kubernetes, AI, and cloud native.',
    images: [{ url: 'https://kubesimplify.com/img/og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kubesimplify Blog - Cloud Native & AI Articles',
    description: 'Technical deep-dives on Kubernetes, AI, and cloud native.',
    images: ['https://kubesimplify.com/img/og.png'],
  },
};

export default function Blogs() {
  return (
    <main className="pt-24">
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent)] mb-8">
              Blog
            </div>
            <h1 className="text-display mb-6" style={{ color: 'var(--text-primary)' }}>Articles & Guides</h1>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Technical deep-dives on Kubernetes, AI/ML, cloud native, and DevOps &mdash; written by practitioners for practitioners.
            </p>
          </div>

          <BlogFeed count={20} showSearch />

          <div className="mt-16 text-center">
            <p className="text-gray-500 mb-3 text-sm">Want to contribute?</p>
            <a
              href="https://blog.kubesimplify.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[var(--accent)] font-semibold hover:underline"
            >
              Write for blog.kubesimplify.com
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
