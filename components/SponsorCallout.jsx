/**
 * Sponsor / hardware-partner callout, driven by a post's `sponsor` frontmatter:
 *
 *   sponsor:
 *     name: Utho
 *     url: https://utho.com/...        # full link (UTM params included)
 *     blurb: "One-line thank-you shown in the end CTA."
 *
 * `variant="strip"` renders a slim disclosure line (placed near the top).
 * `variant="cta"` renders the end-of-post thank-you card.
 * Renders nothing unless name + url are present, so non-sponsored posts are unaffected.
 * Links use rel="sponsored" per Google's paid-link guidance.
 */
export default function SponsorCallout({ sponsor, variant = 'strip' }) {
  if (!sponsor || !sponsor.name || !sponsor.url) return null;
  const { name, url, blurb } = sponsor;

  if (variant === 'strip') {
    return (
      <div
        className="rounded-xl px-4 py-3 mb-8 flex items-center gap-x-3 gap-y-1 flex-wrap text-sm"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
      >
        <span
          className="text-[11px] font-bold uppercase tracking-[0.15em]"
          style={{ color: 'var(--text-muted)' }}
        >
          Hardware partner
        </span>
        <span style={{ color: 'var(--text-secondary)' }}>
          The GPU node in this post was provided by{' '}
          <a
            href={url}
            target="_blank"
            rel="noopener sponsored"
            className="font-semibold text-[var(--accent)] hover:underline"
          >
            {name}
          </a>
          .
        </span>
      </div>
    );
  }

  return (
    <section
      className="rounded-2xl p-8 my-12 text-center"
      style={{
        background: 'linear-gradient(135deg, var(--accent-secondary)15, var(--accent)15)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <p
        className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
        style={{ color: 'var(--accent)' }}
      >
        Thanks to our hardware partner
      </p>
      <h3 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
        {name}
      </h3>
      {blurb && (
        <p className="text-base mb-6 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          {blurb}
        </p>
      )}
      <a
        href={url}
        target="_blank"
        rel="noopener sponsored"
        className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white gradient-bg transition-transform hover:scale-105"
      >
        Explore {name}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </a>
    </section>
  );
}
