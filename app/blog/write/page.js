import Link from 'next/link';
import { SITE, getAllAuthors } from '@/lib/blog';

export const metadata = {
  title: 'Write for Kubesimplify · Submit a blog post',
  description:
    'Contribute to the Kubesimplify blog by opening a pull request. Your post lives in Markdown, you keep the byline and SEO, we promote it.',
  alternates: { canonical: `${SITE.url}/write` },
  openGraph: {
    type: 'website',
    url: `${SITE.url}/write`,
    title: 'Write for Kubesimplify',
    description: 'Contribute to the Kubesimplify blog via pull request.',
    siteName: SITE.name,
  },
};

const FRONTMATTER_EXAMPLE = `---
title: "Your post title"
seoTitle: "SEO-optimized version of the title"
seoDescription: "1-2 sentence summary used as meta description (max 160 chars)."
datePublished: 2026-05-20T10:00:00.000Z
slug: your-post-slug-kebab-case
author: your-handle              # see content/authors.json
cover: /img/blog/your-slug/cover.png
tags: ["kubernetes", "devops"]
---

Your post content in Markdown. Code fences with language tags work great:

\`\`\`bash
kubectl get pods -A
\`\`\`

Embed images by dropping them in public/img/blog/<slug>/ and linking:

![Diagram alt text](/img/blog/your-slug/diagram.png)
`;

export default function WriteForUs() {
  const authorCount = getAllAuthors().length;
  const githubUrl = `https://github.com/${SITE.githubRepo}`;

  return (
    <main className="pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm">
          <Link href="/blog" className="text-[var(--accent)] hover:underline">
            &larr; All posts
          </Link>
        </nav>

        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)] mb-3">
            Contribute
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Write for Kubesimplify
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Join {authorCount}+ contributors publishing in-depth, practitioner-led technical writing on Kubernetes, AI infrastructure, and cloud-native.
          </p>
        </div>

        <section className="glass-card rounded-2xl p-6 md:p-8 mb-10">
          <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Why contribute here
          </h2>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <li>✓ You keep the byline, the canonical URL, and the SEO value.</li>
            <li>✓ Your post ships with rich schema.org metadata (author + topic + reading time).</li>
            <li>✓ We promote it across our YouTube, X, LinkedIn, and Substack channels.</li>
            <li>✓ Open source. Edit history is public. Easy to update later.</li>
            <li>✓ Free static hosting, instant load, no platform lock-in.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            How it works
          </h2>
          <ol className="space-y-6">
            {[
              {
                n: 1,
                title: 'Fork the repo',
                body: (
                  <>
                    Fork{' '}
                    <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline font-semibold">
                      {SITE.githubRepo}
                    </a>
                    {' '}on GitHub. All blog content lives in <code className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--accent)] text-xs">content/blog/</code>.
                  </>
                ),
              },
              {
                n: 2,
                title: 'Add yourself as an author',
                body: (
                  <>
                    Edit <code className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--accent)] text-xs">content/authors.json</code> and add an entry with your handle, name, bio, avatar, and social links. Drop your avatar in <code className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--accent)] text-xs">public/img/authors/{'<your-handle>'}.jpg</code>.
                  </>
                ),
              },
              {
                n: 3,
                title: 'Write your post',
                body: (
                  <>
                    Create <code className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--accent)] text-xs">content/blog/your-post-slug.md</code> with the frontmatter shown below. Markdown supports code fences, tables, embedded images, GitHub-flavored extensions.
                  </>
                ),
              },
              {
                n: 4,
                title: 'Drop your images locally',
                body: (
                  <>
                    Put any post images in <code className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--accent)] text-xs">public/img/blog/{'<your-slug>'}/</code> and reference them as <code className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--accent)] text-xs">/img/blog/{'<your-slug>'}/file.png</code>. Cover image goes in the same place.
                  </>
                ),
              },
              {
                n: 5,
                title: 'Preview locally (optional)',
                body: (
                  <>
                    Run <code className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--accent)] text-xs">npm install && npm run build && npx serve out</code> to see your post rendered exactly as it will ship.
                  </>
                ),
              },
              {
                n: 6,
                title: 'Open a pull request',
                body: (
                  <>
                    Push to your fork and open a PR. We review for fit and clarity, never to gatekeep voice or perspective. Once merged, it's live within minutes via auto-deploy.
                  </>
                ),
              },
            ].map((step) => (
              <li key={step.n} className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-white gradient-bg"
                >
                  {step.n}
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Post frontmatter template
          </h2>
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
            Copy this into the top of your <code className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--accent)] text-xs">.md</code> file. Required fields are the first six.
          </p>
          <pre className="text-xs overflow-x-auto rounded-xl p-5 border" style={{ background: '#0d1117', color: '#c9d1d9', borderColor: '#1f2937' }}>
            <code>{FRONTMATTER_EXAMPLE}</code>
          </pre>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            What we look for
          </h2>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <li><strong>Show, don&apos;t summarize.</strong> Real code, real commands, real outputs. Diagrams and screenshots where they help.</li>
            <li><strong>Practitioner voice.</strong> What did you try? What broke? What does the docs not tell you? That&apos;s the gold.</li>
            <li><strong>Stable URLs.</strong> Pick a slug you&apos;ll be happy with five years from now. We never break slugs after publish.</li>
            <li><strong>One topic per post.</strong> Better to ship two focused posts than one sprawling 8000-word essay.</li>
            <li><strong>Original work or a fresh angle.</strong> Cross-posts from your own blog welcome with canonical pointing to wherever you published first.</li>
          </ul>
        </section>

        <section className="glass-card rounded-2xl p-6 md:p-8 text-center">
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Ready to ship?
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Open a pull request and we&apos;ll get back to you within a few days.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href={`${githubUrl}/tree/main/content/blog`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white gradient-bg transition-transform hover:scale-105"
            >
              Browse existing posts
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <a
              href={`${githubUrl}/fork`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--accent)]/10"
              style={{ borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
            >
              Fork the repo
            </a>
            <a
              href={`${githubUrl}/issues/new`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--accent)]/10"
              style={{ borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
            >
              Pitch an idea first
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
