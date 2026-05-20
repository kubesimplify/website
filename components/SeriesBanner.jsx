import Link from 'next/link';
import { getPostBySlug } from '@/lib/blog';

/**
 * Renders at the top of any post that's part of a series.
 * Shows the series name, position, and prev/next links to other posts in the series.
 */
export default function SeriesBanner({ info }) {
  if (!info) return null;
  const { series, position, total, prev, next } = info;
  const prevPost = prev ? getPostBySlug(prev) : null;
  const nextPost = next ? getPostBySlug(next) : null;

  return (
    <aside
      className="rounded-2xl p-5 md:p-6 mb-10 border"
      style={{
        background: `linear-gradient(135deg, ${series.color}12, transparent)`,
        borderColor: `${series.color}30`,
        borderLeftWidth: '4px',
        borderLeftColor: series.color,
      }}
      aria-label={`This post is part ${position} of ${total} in the ${series.name} series`}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-1"
            style={{ color: series.color }}
          >
            Part {position} of {total}
          </p>
          <Link
            href={`/blog/series/${series.slug}`}
            className="text-lg md:text-xl font-bold hover:text-[var(--accent)] transition-colors"
            style={{ color: 'var(--text-primary)' }}
          >
            {series.name}
          </Link>
        </div>
        <Link
          href={`/blog/series/${series.slug}`}
          className="text-sm font-semibold whitespace-nowrap hover:underline"
          style={{ color: series.color }}
        >
          View series &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          {prevPost ? (
            <Link
              href={`/blog/${prevPost.slug}`}
              className="group block text-sm"
            >
              <p className="text-[11px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>
                &larr; Previous
              </p>
              <p
                className="font-medium leading-snug line-clamp-2 group-hover:text-[var(--accent)] transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                {prevPost.title}
              </p>
            </Link>
          ) : (
            <div className="text-sm opacity-50">
              <p className="text-[11px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>
                Start of series
              </p>
            </div>
          )}
        </div>
        <div className="sm:text-right">
          {nextPost ? (
            <Link
              href={`/blog/${nextPost.slug}`}
              className="group block text-sm"
            >
              <p className="text-[11px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>
                Next &rarr;
              </p>
              <p
                className="font-medium leading-snug line-clamp-2 group-hover:text-[var(--accent)] transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                {nextPost.title}
              </p>
            </Link>
          ) : (
            <div className="text-sm opacity-50 sm:text-right">
              <p className="text-[11px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>
                End of series
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
