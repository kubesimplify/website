import { SITE } from '@/lib/blog';

/**
 * Newsletter signup CTA. Links out to the Substack publication.
 * Set SITE.newsletterUrl in lib/blog.js to your actual URL.
 */
export default function NewsletterCTA({ variant = 'card' }) {
  if (!SITE.newsletterUrl) return null;

  if (variant === 'inline') {
    return (
      <div
        className="rounded-xl p-4 text-sm flex items-center justify-between gap-4 flex-wrap"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p style={{ color: 'var(--text-secondary)' }}>
            Get new posts in your inbox.
          </p>
        </div>
        <a
          href={SITE.newsletterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-[var(--accent)] hover:underline whitespace-nowrap"
        >
          Subscribe &rarr;
        </a>
      </div>
    );
  }

  return (
    <section
      className="rounded-2xl p-8 text-center my-12"
      style={{
        background: 'linear-gradient(135deg, var(--accent-secondary)15, var(--accent)15)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <p
        className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
        style={{ color: 'var(--accent)' }}
      >
        Newsletter
      </p>
      <h3 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
        {SITE.newsletterName || 'Never miss a deep dive'}
      </h3>
      <p className="text-base mb-6 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
        Subscribe to get our latest Kubernetes, AI infra, and cloud-native articles delivered to your inbox.
      </p>
      <a
        href={SITE.newsletterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white gradient-bg transition-transform hover:scale-105"
      >
        Subscribe on Substack
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </a>
      <p className="text-[11px] mt-4" style={{ color: 'var(--text-muted)' }}>
        Powered by Substack · Unsubscribe anytime
      </p>
    </section>
  );
}
